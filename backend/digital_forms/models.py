from django.db import models
from django.conf import settings
from employees.models import Employee

class FormTemplate(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='form_templates')
    
    # JSON structure defining fields (e.g., [{label: 'Reason', type: 'text', required: true}, ...])
    fields_config = models.JSONField(default=list, help_text="List of field definitions")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class FormSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]

    template = models.ForeignKey(FormTemplate, on_delete=models.CASCADE, related_name='submissions')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='form_submissions', null=True, blank=True)
    
    # JSON data containing responses (e.g., {Reason: 'Vacation', Years: 5})
    submission_data = models.JSONField(default=dict)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    review_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.template.name} - {self.employee or 'System'}"
