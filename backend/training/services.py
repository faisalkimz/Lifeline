from django.utils import timezone
from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import TrainingSession, TrainingEnrollment


class EnrollmentService:
    """
    Handles all enrollment-related business logic.
    """

    @staticmethod
    @transaction.atomic
    def enroll_employee(*, session: TrainingSession, employee):
        if session.status != 'scheduled':
            raise ValidationError("You can only enroll in scheduled sessions.")

        current_count = session.enrollments.count()
        if current_count >= session.capacity:
            raise ValidationError("This training session is already full.")

        enrollment, created = TrainingEnrollment.objects.get_or_create(
            session=session,
            employee=employee,
            defaults={'status': 'registered'}
        )

        if not created:
            raise ValidationError("You are already enrolled in this session.")

        return enrollment


class ProgressService:
    """
    Handles training progress tracking and updates.
    """

    @staticmethod
    @transaction.atomic
    def update_progress(*, enrollment: TrainingEnrollment, progress_percentage: float):
        if enrollment.status not in ['registered', 'in_progress', 'attended']:
            raise ValidationError("Cannot update progress for this enrollment status.")

        enrollment.progress_percentage = progress_percentage
        if enrollment.progress_percentage > 0 and enrollment.status == 'registered':
            enrollment.status = 'in_progress'

        enrollment.save()
        return enrollment


class AssessmentService:
    """
    Handles assessment logic and scoring.
    """

    @staticmethod
    @transaction.atomic
    def submit_assessment(*, enrollment: TrainingEnrollment, assessment_data: dict):
        # Basic implementation - can be expanded
        score = assessment_data.get('score', 0)
        enrollment.assessment_score = score
        enrollment.save()
        return enrollment


class CertificateService:
    """
    Handles certificate generation and management.
    """

    @staticmethod
    @transaction.atomic
    def generate_certificate(*, enrollment: TrainingEnrollment):
        if enrollment.status != 'completed':
            raise ValidationError("Cannot generate certificate for incomplete training.")

        # Basic implementation - would integrate with PDF generation
        certificate_url = f"/certificates/{enrollment.id}/"
        enrollment.certificate_url = certificate_url
        enrollment.save()
        return enrollment


class NotificationService:
    """
    Handles training-related notifications.
    """

    @staticmethod
    def send_enrollment_confirmation(*, enrollment: TrainingEnrollment):
        # Implementation for sending confirmation emails/SMS
        pass

    @staticmethod
    def send_completion_notification(*, enrollment: TrainingEnrollment):
        # Implementation for sending completion notifications
        pass


class ComplianceService:
    """
    Handles compliance checking and reporting.
    """

    @staticmethod
    def check_employee_compliance(*, employee):
        # Implementation for checking mandatory training compliance
        return True

    @staticmethod
    def get_employee_compliance_status(employee):
        """
        Get compliance status for all mandatory training programs for an employee.
        """
        from .models import TrainingProgram, TrainingEnrollment
        from django.utils import timezone
        from datetime import timedelta

        compliance_status = []
        today = timezone.now().date()

        # Get all mandatory training programs
        mandatory_programs = TrainingProgram.objects.filter(
            company=employee.company,
            is_mandatory=True
        )

        for program in mandatory_programs:
            # Check if employee has completed this training
            enrollment = TrainingEnrollment.objects.filter(
                employee=employee,
                session__program=program,
                status='completed'
            ).order_by('-completion_date').first()

            if enrollment:
                # Employee has completed the training
                last_completed = enrollment.completion_date
                # Calculate next due date (typically 1 year after completion)
                due_date = last_completed + timedelta(days=365)
                days_overdue = max(0, (today - due_date).days) if today > due_date else 0
                is_compliant = days_overdue == 0
                status = 'compliant' if is_compliant else 'overdue'
            else:
                # Employee has never completed this training
                due_date = None
                last_completed = None
                days_overdue = 0  # Not applicable
                is_compliant = False
                status = 'not_started'

            compliance_status.append({
                'program': program,
                'status': status,
                'last_completed': last_completed,
                'due_date': due_date,
                'days_overdue': days_overdue,
                'is_compliant': is_compliant
            })

        return compliance_status

    @staticmethod
    def get_company_compliance_report(company):
        """
        Get company-wide compliance report.
        """
        from employees.models import Employee
        from django.db.models import Count, Q

        employees = Employee.objects.filter(company=company)
        total_employees = employees.count()

        if total_employees == 0:
            return {
                'total_employees': 0,
                'compliant_employees': 0,
                'compliance_rate': 0,
                'overdue_count': 0
            }

        compliant_count = 0
        overdue_count = 0

        for employee in employees:
            if employee is None:
                continue
            compliance_status = ComplianceService.get_employee_compliance_status(employee)
            if all(item['is_compliant'] for item in compliance_status):
                compliant_count += 1
            if any(item['days_overdue'] > 0 for item in compliance_status):
                overdue_count += 1

        return {
            'total_employees': total_employees,
            'compliant_employees': compliant_count,
            'compliance_rate': round((compliant_count / total_employees) * 100, 2),
            'overdue_count': overdue_count
        }


class CompletionService:
    """
    Handles training completion, scoring, and certification.
    """

    @staticmethod
    @transaction.atomic
    def complete_training(*, enrollment: TrainingEnrollment, score=None, certificate_url=None):
        if enrollment.status not in ['registered', 'attended']:
            raise ValidationError("This enrollment cannot be completed.")

        enrollment.status = 'completed'
        enrollment.completion_date = timezone.now().date()

        if score is not None:
            enrollment.score = score

        if certificate_url:
            enrollment.certificate_url = certificate_url

        enrollment.save()
        return enrollment
