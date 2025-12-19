"""
Early Wage Access (EWA) configuration and enhanced models.
Enables employees to access their earned wages before payday.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from accounts.models import Company


class EarlyWageAccessConfig(models.Model):
    """EWA configuration per company"""
    
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='ewa_config')
    enabled = models.BooleanField(default=True, help_text="Enable/disable EWA for this company")
    
    # Eligibility criteria
    min_tenure_months = models.PositiveIntegerField(
        default=3,
        help_text="Minimum months of employment required"
    )
    min_salary_threshold = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Minimum monthly salary to be eligible"
    )
    
    # Advance limits
    max_percentage_of_salary = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('50.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Maximum % of monthly salary that can be advanced"
    )
    max_fixed_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Maximum fixed amount (optional cap)"
    )
    
    # Frequency limits
    max_requests_per_month = models.PositiveIntegerField(
        default=2,
        help_text="Maximum number of EWA requests per month"
    )
    min_days_between_requests = models.PositiveIntegerField(
        default=7,
        help_text="Minimum days between consecutive requests"
    )
    
    # Auto-approval settings
    auto_approve_enabled = models.BooleanField(
        default=False,
        help_text="Auto-approve requests below threshold"
    )
    auto_approve_threshold = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('100000.00'),
        help_text="Auto-approve requests below this amount"
    )
    
    # Repayment
    default_repayment_months = models.PositiveIntegerField(
        default=1,
        help_text="Default repayment period in months"
    )
    
    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = 'Early Wage Access Configuration'
        verbose_name_plural = 'Early Wage Access Configurations'
    
    def __str__(self):
        return f"EWA Config - {self.company.name}"


class WageAccessRequest(models.Model):
    """
    Extended model for tracking EWA-specific requests
    Uses SalaryAdvance model but adds EWA-specific tracking
    """
    
    REQUEST_TYPE_CHOICES = [
        ('ewa', 'Early Wage Access'),
        ('emergency', 'Emergency Advance'),
        ('standard', 'Standard Loan'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='ewa_requests')
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='ewa_requests')
    salary_advance = models.OneToOneField('payroll.SalaryAdvance', on_delete=models.CASCADE, related_name='ewa_details')
    
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES, default='ewa')
    
    # EWA specific fields
    earned_to_date = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Amount earned up to request date"
    )
    days_worked = models.PositiveIntegerField(help_text="Days worked in current month")
    working_days_in_month = models.PositiveIntegerField(help_text="Total working days in month")
    
    # Eligibility check results
    is_eligible = models.BooleanField(default=False)
    eligibility_notes = models.TextField(blank=True)
    
    # Auto-approval tracking
    auto_approved = models.BooleanField(default=False)
    
    # Disbursement tracking
    disbursed = models.BooleanField(default=False)
    disbursed_at = models.DateTimeField(null=True, blank=True)
    disbursement_method = models.CharField(
        max_length=20,
        choices=[
            ('bank', 'Bank Transfer'),
            ('mobile_money', 'Mobile Money'),
            ('cash', 'Cash'),
        ],
        default='mobile_money'
    )
    
    # Audit  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Wage Access Request'
        verbose_name_plural = 'Wage Access Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'employee', '-created_at']),
            models.Index(fields=['company', 'request_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.request_type} ({self.salary_advance.amount})"
    
    def check_eligibility(self):
        """Check if employee is eligible for EWA"""
        from datetime import date, timedelta
        
        config = self.company.ewa_config
        notes = []
        eligible = True
        
        # Check if EWA is enabled
        if not config.enabled:
            notes.append("EWA is not enabled for this company")
            eligible = False
        
        # Check tenure
        if self.employee.join_date:
            months_employed = (date.today().year - self.employee.join_date.year) * 12 + \
                            (date.today().month - self.employee.join_date.month)
            if months_employed < config.min_tenure_months:
                notes.append(f"Employee needs {config.min_tenure_months} months tenure (has {months_employed})")
                eligible = False
        
        # Check salary threshold
        salary_structure = self.employee.salary_structure
        if salary_structure and salary_structure.basic_salary < config.min_salary_threshold:
            notes.append(f"Salary below minimum threshold")
            eligible = False
        
        # Check monthly request limit
        current_month_requests = WageAccessRequest.objects.filter(
            employee=self.employee,
            request_type='ewa',
            created_at__month=timezone.now().month,
            created_at__year=timezone.now().year,
            salary_advance__status__in=['pending', 'approved', 'active']
        ).count()
        
        if current_month_requests >= config.max_requests_per_month:
            notes.append(f"Monthly request limit reached ({config.max_requests_per_month})")
            eligible = False
        
        # Check days between requests
        last_request = WageAccessRequest.objects.filter(
            employee=self.employee,
            request_type='ewa'
        ).exclude(id=self.id).order_by('-created_at').first()
        
        if last_request:
            days_since_last = (timezone.now().date() - last_request.created_at.date()).days
            if days_since_last < config.min_days_between_requests:
                notes.append(f"Must wait {config.min_days_between_requests} days between requests")
                eligible = False
        
        self.is_eligible = eligible
        self.eligibility_notes = "; ".join(notes) if notes else "Eligible"
        self.save()
        
        return eligible
    
    def calculate_earned_to_date(self):
        """Calculate how much the employee has earned so far this month"""
        from datetime import date
        import calendar
        
        salary_structure = self.employee.salary_structure
        if not salary_structure:
            return Decimal('0.00')
        
        # Get current month details
        today = date.today()
        _, last_day = calendar.monthrange(today.year, today.month)
        
        # Calculate working days (simple: weekdays)
        # For more accuracy, integrate with attendance system
        working_days = 0
        days_worked = 0
        
        for day in range(1, last_day + 1):
            current_date = date(today.year, today.month, day)
            if current_date.weekday() < 5:  # Monday-Friday
                working_days += 1
                if day <= today.day:
                    days_worked += 1
        
        # Calculate daily wage
        daily_wage = salary_structure.gross_salary / working_days if working_days > 0 else 0
        earned_to_date = daily_wage * days_worked
        
        self.earned_to_date = earned_to_date
        self.days_worked = days_worked
        self.working_days_in_month = working_days
        self.save()
        
        return earned_to_date
