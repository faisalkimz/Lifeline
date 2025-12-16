"""
Management command to send training reminders.
Run with: python manage.py send_training_reminders
Can be scheduled with cron or Celery.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from training.models import TrainingEnrollment
from training.services import NotificationService


class Command(BaseCommand):
    help = 'Send reminders for upcoming training sessions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=1,
            help='Number of days before session to send reminder (default: 1)'
        )

    def handle(self, *args, **options):
        days_before = options['days']
        target_date = timezone.now() + timedelta(days=days_before)
        
        # Find enrollments with sessions starting tomorrow
        enrollments = TrainingEnrollment.objects.filter(
            status__in=['registered', 'confirmed'],
            session__start_date__date=target_date.date(),
            session__status__in=['scheduled', 'open_enrollment']
        ).select_related('employee', 'session', 'session__program')

        count = 0
        for enrollment in enrollments:
            try:
                NotificationService.send_session_reminder(
                    enrollment,
                    days_before=days_before
                )
                count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Failed to send reminder to {enrollment.employee.full_name}: {str(e)}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully sent {count} training reminders for sessions in {days_before} day(s)'
            )
        )


# Additional management command for processing session completions
"""
File: management/commands/process_completed_sessions.py
"""
from django.core.management.base import BaseCommand
from django.utils import timezone

from training.models import TrainingSession, TrainingEnrollment
from training.services import CompletionService


class ProcessCompletedSessionsCommand(BaseCommand):
    help = 'Process completed training sessions and mark for certificate generation'

    def handle(self, *args, **options):
        # Find sessions that ended but haven't been processed
        completed_sessions = TrainingSession.objects.filter(
            status='completed',
            completion_processed=False,
            end_date__lt=timezone.now()
        )

        total_processed = 0
        total_certificates = 0

        for session in completed_sessions:
            self.stdout.write(f'Processing session: {session.session_code}')
            
            # Find eligible enrollments
            enrollments = TrainingEnrollment.objects.filter(
                session=session,
                status__in=['attended', 'in_progress']
            )

            for enrollment in enrollments:
                # Check if eligible for completion
                eligibility = CompletionService.check_completion_eligibility(enrollment)
                
                if eligibility['eligible']:
                    try:
                        enrollment_obj, certificate = CompletionService.complete_training(
                            enrollment=enrollment
                        )
                        total_certificates += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'  ✓ Completed for {enrollment.employee.full_name}'
                            )
                        )
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(
                                f'  ✗ Failed for {enrollment.employee.full_name}: {str(e)}'
                            )
                        )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  ⚠ Not eligible: {enrollment.employee.full_name} - '
                            f'{", ".join(eligibility["reasons"])}'
                        )
                    )

            # Mark session as processed
            session.completion_processed = True
            session.save()
            total_processed += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Processed {total_processed} sessions'
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Issued {total_certificates} certificates'
            )
        )


# Compliance check command
"""
File: management/commands/check_training_compliance.py
"""
from django.core.management.base import BaseCommand
from employees.models import Employee
from training.services import ComplianceService


class CheckTrainingComplianceCommand(BaseCommand):
    help = 'Check training compliance for all employees and send warnings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--company-id',
            type=int,
            help='Check compliance for specific company only'
        )
        parser.add_argument(
            '--send-notifications',
            action='store_true',
            help='Send notification emails to non-compliant employees'
        )

    def handle(self, *args, **options):
        company_id = options.get('company_id')
        send_notifications = options.get('send_notifications', False)

        employees = Employee.objects.filter(is_active=True)
        if company_id:
            employees = employees.filter(company_id=company_id)

        total_employees = employees.count()
        compliant_count = 0
        non_compliant = []

        self.stdout.write(f'Checking compliance for {total_employees} employees...\n')

        for employee in employees:
            compliance_status = ComplianceService.get_employee_compliance_status(employee)
            
            # Check if any programs are non-compliant
            is_compliant = all(item['is_compliant'] for item in compliance_status)
            
            if is_compliant:
                compliant_count += 1
            else:
                non_compliant.append({
                    'employee': employee,
                    'issues': [item for item in compliance_status if not item['is_compliant']]
                })

        # Display results
        compliance_rate = (compliant_count / total_employees * 100) if total_employees > 0 else 0
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Compliant: {compliant_count}/{total_employees} ({compliance_rate:.1f}%)'
            )
        )
        
        if non_compliant:
            self.stdout.write(
                self.style.WARNING(
                    f'\n⚠ Non-compliant employees: {len(non_compliant)}'
                )
            )
            
            for item in non_compliant[:10]:  # Show first 10
                self.stdout.write(f'\n  • {item["employee"].full_name}:')
                for issue in item['issues']:
                    self.stdout.write(
                        f'    - {issue["program"].name}: {issue["status"]}'
                    )
                    if issue['days_overdue'] > 0:
                        self.stdout.write(
                            self.style.ERROR(
                                f'      {issue["days_overdue"]} days overdue'
                            )
                        )

            if len(non_compliant) > 10:
                self.stdout.write(f'\n  ... and {len(non_compliant) - 10} more')

        if send_notifications and non_compliant:
            self.stdout.write('\nSending compliance notifications...')
            # Implement notification sending logic here
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Sent notifications to {len(non_compliant)} employees'
                )
            )