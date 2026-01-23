from django.db import models
from accounts.models import Company, User
from employees.models import Employee

class LeaveType(models.Model):
    """Leave type configuration (Annual, Sick, Maternity, etc.)"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='leave_types')
    name = models.CharField(max_length=100, help_text="e.g., Annual Leave, Sick Leave")
    code = models.CharField(max_length=20, help_text="Short code, e.g., AL, SL")
    days_per_year = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        help_text="Default days allocated per year"
    )
    requires_document = models.BooleanField(default=False, help_text="Requires medical certificate, etc.")
    max_consecutive_days = models.IntegerField(null=True, blank=True, help_text="Max days in a row")
    is_paid = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Leave Type'
        verbose_name_plural = 'Leave Types'
        unique_together = ['company', 'code']
        ordering = ['name']
    
    def __str__(self):
        return f"{self.company.name} - {self.name}"


class LeaveBalance(models.Model):
    """Employee leave balance tracking"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    year = models.IntegerField(help_text="Leave year")
    total_days = models.DecimalField(max_digits=5, decimal_places=1, help_text="Total allocated")
    used_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    pending_days = models.DecimalField(max_digits=5, decimal_places=1, default=0, help_text="Pending approval")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Leave Balance'
        verbose_name_plural = 'Leave Balances'
        unique_together = ['employee', 'leave_type', 'year']
        ordering = ['-year', 'leave_type']
    
    @property
    def available_days(self):
        return self.total_days - self.used_days - self.pending_days
    
    @property
    def company(self):
        return self.employee.company
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.name} ({self.year})"


class LeaveRequest(models.Model):
    """Employee leave request"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.DecimalField(max_digits=5, decimal_places=1)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reliever = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='leave_coverages')
    
    # Workflow
    applied_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='leave_requests_applied')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='leave_requests_approved')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Documents
    document = models.FileField(upload_to='leave_documents/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Leave Request'
        verbose_name_plural = 'Leave Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    @property
    def company(self):
        return self.employee.company
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.name} ({self.start_date} to {self.end_date})"


class PublicHoliday(models.Model):
    """Uganda public holidays"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='public_holidays')
    name = models.CharField(max_length=200, help_text="e.g., Independence Day")
    date = models.DateField()
    is_recurring = models.BooleanField(default=True, help_text="Repeats yearly")
    
    class Meta:
        verbose_name = 'Public Holiday'
        verbose_name_plural = 'Public Holidays'
        unique_together = ['company', 'date']
        ordering = ['date']
    
    def __str__(self):
        return f"{self.name} - {self.date}"
