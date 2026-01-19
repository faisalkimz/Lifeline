from django.core.management.base import BaseCommand
from django.utils import timezone
from analytics.models import ReportSchedule
from django.core.mail import EmailMessage
import io
import csv

class Command(BaseCommand):
    help = 'Processes scheduled reports and sends them via email'

    def handle(self, *args, **options):
        now = timezone.now()
        schedules = ReportSchedule.objects.filter(is_active=True)
        
        for schedule in schedules:
            should_run = False
            if not schedule.last_run:
                should_run = True
            else:
                if schedule.frequency == 'daily' and (now - schedule.last_run).days >= 1:
                    should_run = True
                elif schedule.frequency == 'weekly' and (now - schedule.last_run).days >= 7:
                    should_run = True
                elif schedule.frequency == 'monthly' and (now - schedule.last_run).days >= 30:
                    should_run = True
            
            if should_run:
                self.send_report(schedule)
                schedule.last_run = now
                schedule.save()
                self.stdout.write(self.style.SUCCESS(f"Sent report: {schedule.name}"))

    def send_report(self, schedule):
        # Generate generic data based on module
        # In a real app, this would query the actual module's data
        output = io.StringIO()
        writer = csv.writer(output)
        
        if schedule.module == 'employees':
            writer.writerow(['ID', 'Name', 'Email', 'Department', 'Status'])
            writer.writerow(['EMP001', 'John Doe', 'john@example.com', 'Engineering', 'Active'])
        elif schedule.module == 'payroll':
            writer.writerow(['Date', 'Net Pay', 'Status'])
            writer.writerow(['2023-10-25', '5,000,000', 'Paid'])
        else:
            writer.writerow(['Data Placeholder for ' + schedule.module])
            writer.writerow(['Sample Row'])

        csv_content = output.getvalue()
        
        email = EmailMessage(
            subject=f"Scheduled Report: {schedule.name}",
            body=f"Please find attached the {schedule.frequency} {schedule.module} report.",
            from_email="noreply@lifeline.com",
            to=[r.strip() for r in schedule.recipients.split(',')],
        )
        
        email.attach(f"{schedule.name}.csv", csv_content, 'text/csv')
        email.send()
