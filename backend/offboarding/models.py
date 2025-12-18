from django.db import models
from accounts.models import Company
from employees.models import Employee

class Resignation(models.Model):
    """Employee Resignation Request"""
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='resignations')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='resignations')
    
    submission_date = models.DateField(auto_now_add=True)
    last_working_day = models.DateField()
    
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    manager_comment = models.TextField(blank=True)

    # Offboarding Checklist
    handover_completed = models.BooleanField(default=False)
    exit_interview_completed = models.BooleanField(default=False)
    assets_returned = models.BooleanField(default=False)
    laptop_returned = models.BooleanField(default=False)
    id_badge_returned = models.BooleanField(default=False)
    keys_returned = models.BooleanField(default=False)
    email_disabled = models.BooleanField(default=False)
    access_revoked = models.BooleanField(default=False)
    settlement_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Resignation: {self.employee.full_name}"

class ExitInterview(models.Model):
    """Exit Interview Record"""
    resignation = models.OneToOneField(Resignation, on_delete=models.CASCADE, related_name='exit_interview')
    
    interview_date = models.DateField()
    interviewer = models.CharField(max_length=255)
    
    reason_for_leaving = models.CharField(max_length=255)
    feedback_on_management = models.TextField(blank=True)
    feedback_on_company = models.TextField(blank=True)
    
    recommend_company = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Exit Interview: {self.resignation.employee.full_name}"
