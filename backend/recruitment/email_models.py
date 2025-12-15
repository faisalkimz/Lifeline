from django.db import models
from accounts.models import Company
from django.template import Template, Context


class EmailTemplate(models.Model):
    """Email templates for automated communication"""
    TEMPLATE_TYPES = [
        ('application_received', 'Application Received'),
        ('interview_invitation', 'Interview Invitation'),
        ('interview_reminder', 'Interview Reminder'),
        ('offer_letter', 'Offer Letter'),
        ('rejection', 'Rejection'),
        ('onboarding_welcome', 'Onboarding Welcome'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='email_templates')
    name = models.CharField(max_length=200)
    template_type = models.CharField(max_length=50, choices=TEMPLATE_TYPES)
    subject = models.CharField(max_length=200)
    body = models.TextField(help_text="Use {{variable_name}} for dynamic content")
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_templates'
        unique_together = ['company', 'template_type']
        ordering = ['template_type']
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"
    
    def render(self, context_data):
        """Render template with context data"""
        subject_template = Template(self.subject)
        body_template = Template(self.body)
        
        context = Context(context_data)
        
        return {
            'subject': subject_template.render(context),
            'body': body_template.render(context)
        }


class EmailLog(models.Model):
    """Log of sent emails"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='email_logs')
    template = models.ForeignKey(EmailTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    body = models.TextField()
    
    status = models.CharField(max_length=20, choices=[
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('pending', 'Pending')
    ], default='pending')
    error_message = models.TextField(blank=True)
    
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'email_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Email to {self.recipient_email} - {self.status}"
