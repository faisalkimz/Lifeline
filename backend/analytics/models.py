from django.db import models
from accounts.models import Company, User

class ReportSchedule(models.Model):
    """Configuration for recurring reports sent via email"""
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    MODULE_CHOICES = [
        ('employees', 'Employees'),
        ('payroll', 'Payroll'),
        ('leave', 'Leave'),
        ('attendance', 'Attendance'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='report_schedules')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    name = models.CharField(max_length=255)
    module = models.CharField(max_length=50, choices=MODULE_CHOICES)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    
    recipients = models.TextField(help_text="Comma-separated email addresses")
    
    last_run = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.frequency})"
