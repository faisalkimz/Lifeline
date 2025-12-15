"""
Email service for automated recruitment communication
"""
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .email_models import EmailTemplate, EmailLog


class RecruitmentEmailService:
    """Send automated emails for recruitment workflow"""
    
    @staticmethod
    def send_application_received(application, company):
        """Send confirmation email when application is received"""
        try:
            template = EmailTemplate.objects.filter(
                company=company,
                template_type='application_received',
                is_active=True
            ).first()
            
            if not template:
                # Create default template if not exists
                template = EmailTemplate.objects.create(
                    company=company,
                    name='Application Received',
                    template_type='application_received',
                    subject='Application Received - {{job_title}}',
                    body='''Dear {{candidate_name}},

Thank you for applying for the {{job_title}} position at {{company_name}}.

We have received your application and our recruitment team will review it shortly. We'll be in touch if your qualifications match our requirements.

Best regards,
{{company_name}} Recruitment Team''',
                    is_active=True
                )
            
            context = {
                'candidate_name': application.candidate.get_full_name(),
                'job_title': application.job.title,
                'company_name': company.name,
                'position': application.job.title,
            }
            
            rendered = template.render(context)
            
            # Create email log
            email_log = EmailLog.objects.create(
                company=company,
                template=template,
                recipient_email=application.candidate.email,
                recipient_name=application.candidate.get_full_name(),
                subject=rendered['subject'],
                body=rendered['body']
            )
            
            # Send email
            send_mail(
                subject=rendered['subject'],
                message=rendered['body'],
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.candidate.email],
                fail_silently=False,
            )
            
            email_log.status = 'sent'
            email_log.sent_at = timezone.now()
            email_log.save()
            
            return True
            
        except Exception as e:
            if 'email_log' in locals():
                email_log.status = 'failed'
                email_log.error_message = str(e)
                email_log.save()
            return False
    
    @staticmethod
    def send_interview_invitation(interview, company):
        """Send interview invitation email"""
        try:
            template = EmailTemplate.objects.filter(
                company=company,
                template_type='interview_invitation',
                is_active=True
            ).first()
            
            if not template:
                template = EmailTemplate.objects.create(
                    company=company,
                    name='Interview Invitation',
                    template_type='interview_invitation',
                    subject='Interview Invitation - {{job_title}}',
                    body='''Dear {{candidate_name}},

We are pleased to invite you for an interview for the {{job_title}} position.

Interview Details:
Date: {{interview_date}}
Time: {{interview_time}}
Location: {{interview_location}}
Type: {{interview_type}}

{{additional_notes}}

Please confirm your availability.

Best regards,
{{company_name}} Recruitment Team''',
                    is_active=True
                )
            
            context = {
                'candidate_name': interview.application.candidate.get_full_name(),
                'job_title': interview.application.job.title,
                'company_name': company.name,
                'interview_date': interview.scheduled_at.strftime('%B %d, %Y'),
                'interview_time': interview.scheduled_at.strftime('%I:%M %p'),
                'interview_location': interview.location or 'Video Call',
                'interview_type': interview.get_interview_type_display(),
                'additional_notes': interview.notes or '',
            }
            
            rendered = template.render(context)
            
            email_log = EmailLog.objects.create(
                company=company,
                template=template,
                recipient_email=interview.application.candidate.email,
                recipient_name=interview.application.candidate.get_full_name(),
                subject=rendered['subject'],
                body=rendered['body']
            )
            
            send_mail(
                subject=rendered['subject'],
                message=rendered['body'],
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[interview.application.candidate.email],
                fail_silently=False,
            )
            
            email_log.status = 'sent'
            email_log.sent_at = timezone.now()
            email_log.save()
            
            return True
            
        except Exception as e:
            if 'email_log' in locals():
                email_log.status = 'failed'
                email_log.error_message = str(e)
                email_log.save()
            return False
    
    @staticmethod
    def send_rejection(application, company, reason=''):
        """Send rejection email"""
        try:
            template = EmailTemplate.objects.filter(
                company=company,
                template_type='rejection',
                is_active=True
            ).first()
            
            if not template:
                template = EmailTemplate.objects.create(
                    company=company,
                    name='Application Rejection',
                    template_type='rejection',
                    subject='Application Status - {{job_title}}',
                    body='''Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}}.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate the time you invested in the application process and wish you the best in your job search.

Best regards,
{{company_name}} Recruitment Team''',
                    is_active=True
                )
            
            context = {
                'candidate_name': application.candidate.get_full_name(),
                'job_title': application.job.title,
                'company_name': company.name,
                'reason': reason,
            }
            
            rendered = template.render(context)
            
            email_log = EmailLog.objects.create(
                company=company,
                template=template,
                recipient_email=application.candidate.email,
                recipient_name=application.candidate.get_full_name(),
                subject=rendered['subject'],
                body=rendered['body']
            )
            
            send_mail(
                subject=rendered['subject'],
                message=rendered['body'],
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.candidate.email],
                fail_silently=False,
            )
            
            email_log.status = 'sent'
            email_log.sent_at = timezone.now()
            email_log.save()
            
            return True
            
        except Exception as e:
            if 'email_log' in locals():
                email_log.status = 'failed'
                email_log.error_message = str(e)
                email_log.save()
            return False
