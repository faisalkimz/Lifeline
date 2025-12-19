from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from decimal import Decimal
from accounts.models import Company
from employees.models import Employee

# Import EWA models
from .ewa_models import EarlyWageAccessConfig, WageAccessRequest


class TaxSettings(models.Model):
    """Tax settings for each company (Uganda-specific by default)"""

    COUNTRY_CHOICES = [
        ('UG', 'Uganda'),
        ('KE', 'Kenya'),
        ('TZ', 'Tanzania'),
    ]

    CURRENCY_CHOICES = [
        ('UGX', 'Uganda Shilling'),
        ('KES', 'Kenya Shilling'),
        ('TZS', 'Tanzania Shilling'),
    ]

    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='tax_settings')
    country = models.CharField(max_length=2, choices=COUNTRY_CHOICES, default='UG')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='UGX')

    # Uganda PAYE reliefs (2024)
    personal_relief = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('240000.00'))
    insurance_relief = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('50000.00'))
    pension_fund_relief = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('200000.00'))

    # NSSF settings
    nssf_employee_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))
    nssf_employer_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))
    nssf_ceiling = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('100000.00'))

    # Local Service Tax (5% for Uganda)
    local_service_tax_enabled = models.BooleanField(default=True)
    local_service_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('5.00'))

    # Tax year and effective date
    tax_year = models.PositiveIntegerField(default=2024)
    effective_date = models.DateField(auto_now_add=True)

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tax Settings'
        verbose_name_plural = 'Tax Settings'
        ordering = ['-tax_year']

    def __str__(self):
        return f"{self.company.name} - {self.country} Tax Settings ({self.tax_year})"


class SalaryStructure(models.Model):
    """Employee salary structure with allowances"""

    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='salary_structure')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='salary_structures')

    # Basic salary
    basic_salary = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    # Allowances
    housing_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    transport_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    medical_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    lunch_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    other_allowances = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))

    # Auto-calculated gross salary
    gross_salary = models.DecimalField(max_digits=15, decimal_places=2, editable=False)

    # Effective date for salary changes
    effective_date = models.DateField()

    # Status
    is_active = models.BooleanField(default=True)

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Salary Structure'
        verbose_name_plural = 'Salary Structures'
        ordering = ['-effective_date']

    def __str__(self):
        return f"{self.employee.full_name} - Salary Structure"

    def save(self, *args, **kwargs):
        # Auto-calculate gross salary
        self.gross_salary = (
            self.basic_salary +
            self.housing_allowance +
            self.transport_allowance +
            self.medical_allowance +
            self.lunch_allowance +
            self.other_allowances
        )
        super().save(*args, **kwargs)


class PayrollRun(models.Model):
    """Payroll run for a specific month/year"""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('processing', 'Processing'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='payroll_runs')
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # Totals
    total_gross = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_paye = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_nssf_employee = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_nssf_employer = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_net = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))

    # Run Details
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    payment_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)

    # Processing details
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_payrolls'
    )
    processed_at = models.DateTimeField(null=True, blank=True)

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_payrolls'
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Payroll Run'
        verbose_name_plural = 'Payroll Runs'
        unique_together = ['company', 'month', 'year']
        ordering = ['-year', '-month']
        indexes = [
            models.Index(fields=['company', 'status']),  # For filtering drafts/approved
            models.Index(fields=['company', 'year', 'month']),  # For date queries
            models.Index(fields=['company', '-year', '-month']),  # For recent payrolls (reverse order)
        ]

    def __str__(self):
        return f"{self.company.name} - {self.month:02d}/{self.year} Payroll"


class Payslip(models.Model):
    """Individual employee payslip"""

    PAYMENT_METHOD_CHOICES = [
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('mobile', 'Mobile Money'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]

    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='payslips')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslips')

    # Earnings
    basic_salary = models.DecimalField(max_digits=15, decimal_places=2)
    housing_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    transport_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    medical_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    lunch_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    other_allowances = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    bonus = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    gross_salary = models.DecimalField(max_digits=15, decimal_places=2)

    # Deductions
    paye_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    nssf_employee = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    nssf_employer = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    loan_deduction = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    advance_deduction = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    other_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))

    # Totals
    total_deductions = models.DecimalField(max_digits=15, decimal_places=2)
    net_salary = models.DecimalField(max_digits=15, decimal_places=2)

    # Payment details
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='bank')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_date = models.DateField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)

    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Payslip'
        verbose_name_plural = 'Payslips'
        unique_together = ['payroll_run', 'employee']
        ordering = ['-payroll_run__year', '-payroll_run__month', 'employee__first_name', 'employee__last_name']

    def __str__(self):
        return f"{self.employee.full_name} - {self.payroll_run.month:02d}/{self.payroll_run.year}"


class SalaryAdvance(models.Model):
    """Salary advances and loans"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('defaulted', 'Defaulted'),
    ]

    LOAN_TYPE_CHOICES = [
        ('salary_advance', 'Salary Advance'),
        ('personal_loan', 'Personal Loan'),
        ('emergency_loan', 'Emergency Loan'),
        ('other', 'Other'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_advances')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='salary_advances')

    # Loan details
    loan_type = models.CharField(max_length=20, choices=LOAN_TYPE_CHOICES, default='salary_advance')
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    loan_purpose = models.TextField(blank=True)

    # Repayment details
    repayment_period_months = models.PositiveIntegerField(default=1)
    monthly_deduction = models.DecimalField(max_digits=15, decimal_places=2, editable=False)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))

    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    amount_repaid = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    balance = models.DecimalField(max_digits=15, decimal_places=2, editable=False)

    # Dates
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Approval details
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_advances'
    )

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Salary Advance'
        verbose_name_plural = 'Salary Advances'
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.loan_type} ({self.amount})"

    def save(self, *args, **kwargs):
        # Auto-calculate monthly deduction and balance
        if self.repayment_period_months > 0:
            self.monthly_deduction = self.amount / self.repayment_period_months
        else:
            self.monthly_deduction = self.amount

        self.balance = self.amount - self.amount_repaid
        super().save(*args, **kwargs)
