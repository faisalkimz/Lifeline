from django.db import models
from accounts.models import Company
from employees.models import Employee
from django.utils import timezone
from datetime import datetime, timedelta


class AttendancePolicy(models.Model):
    """Company attendance policy configuration"""
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='attendance_policy')
    
    # Work hours
    work_start_time = models.TimeField(default='09:00')
    work_end_time = models.TimeField(default='17:00')
    break_duration_minutes = models.IntegerField(default=60, help_text="Lunch break in minutes")
    
    # Late arrival
    grace_period_minutes = models.IntegerField(default=15, help_text="Grace period before marking late")
    late_arrival_threshold = models.IntegerField(default=3, help_text="Late arrivals per month before penalty")
    
    # Overtime
    overtime_rate_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.5)
    overtime_auto_approve = models.BooleanField(default=False)
    
    # Days
    working_days = models.CharField(
        max_length=100,
        default='Monday,Tuesday,Wednesday,Thursday,Friday',
        help_text="Comma-separated working days"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Attendance Policy'
        verbose_name_plural = 'Attendance Policies'
    
    def __str__(self):
        return f"{self.company.name} - Attendance Policy"


class Attendance(models.Model):
    """Daily attendance record"""
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('on_leave', 'On Leave'),
        ('holiday', 'Public Holiday'),
        ('weekend', 'Weekend'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='absent')
    
    # Clock times
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    
    # Calculated fields
    is_late = models.BooleanField(default=False)
    late_by_minutes = models.IntegerField(default=0)
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Notes
    notes = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_attendances'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendances'
        unique_together = ['employee', 'date']
        ordering = ['-date', 'employee']
        indexes = [
            models.Index(fields=['employee', 'date']),
            models.Index(fields=['date', 'status']),
        ]
    
    @property
    def company(self):
        return self.employee.company
    
    def calculate_hours(self):
        """Calculate hours worked and overtime"""
        if not self.clock_in or not self.clock_out:
            self.hours_worked = 0
            self.overtime_hours = 0
            return
        
        # Total time
        duration = self.clock_out - self.clock_in
        total_hours = duration.total_seconds() / 3600
        
        # Subtract break
        policy = self.employee.company.attendance_policy
        break_hours = policy.break_duration_minutes / 60
        total_hours -= break_hours
        
        # Calculate standard hours
        standard_hours = 8  # Default 8-hour workday
        
        if total_hours <= standard_hours:
            self.hours_worked = round(total_hours, 2)
            self.overtime_hours = 0
        else:
            self.hours_worked = standard_hours
            self.overtime_hours = round(total_hours - standard_hours, 2)
        
        self.save()
    
    def check_late_arrival(self):
        """Check if employee was late"""
        if not self.clock_in:
            return
        
        policy = self.employee.company.attendance_policy
        expected_time = datetime.combine(self.date, policy.work_start_time)
        expected_time = timezone.make_aware(expected_time)
        
        # Add grace period
        grace_time = expected_time + timedelta(minutes=policy.grace_period_minutes)
        
        if self.clock_in > grace_time:
            self.is_late = True
            late_delta = self.clock_in - expected_time
            self.late_by_minutes = int(late_delta.total_seconds() / 60)
        else:
            self.is_late = False
            self.late_by_minutes = 0
        
        self.save()
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.status})"


class OvertimeRequest(models.Model):
    """Employee overtime request"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='overtime_requests')
    date = models.DateField()
    hours_requested = models.DecimalField(max_digits=5, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_overtime'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Overtime Request'
        verbose_name_plural = 'Overtime Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['date']),
        ]
    
    @property
    def company(self):
        return self.employee.company
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.hours_requested}h)"


class AttendanceReport(models.Model):
    """Monthly attendance summary"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_reports')
    year = models.IntegerField()
    month = models.IntegerField()
    
    # Summary
    total_working_days = models.IntegerField(default=0)
    days_present = models.IntegerField(default=0)
    days_absent = models.IntegerField(default=0)
    days_on_leave = models.IntegerField(default=0)
    late_arrivals = models.IntegerField(default=0)
    
    # Hours
    total_hours_worked = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    total_overtime_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    
    # Attendance rate
    attendance_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Percentage of days present"
    )
    
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Attendance Report'
        verbose_name_plural = 'Attendance Reports'
        unique_together = ['employee', 'year', 'month']
        ordering = ['-year', '-month', 'employee']
    
    @property
    def company(self):
        return self.employee.company
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.year}/{self.month:02d}"
