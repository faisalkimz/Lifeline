"""
Payroll models for LahHR.
Complete payroll processing for Uganda & beyond.
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from accounts.models import Company
from employees.models import Employee


class SalaryStructure(models.Model):
    """
    Employee salary structure with basic pay and allowances.
    Tracks salary history with effective dates.
    """
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='salary_structures'
    )

    # Effective date for this salary structure
    effective_date = models.DateField(help_text="When this salary structure becomes effective")

    # Earnings
    basic_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Basic monthly salary (UGX)"
    )

    # Allowances (Uganda-specific)
    housing_allowance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Housing allowance"
    )

    transport_allowance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Transport allowance"
    )

    medical_allowance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Medical allowance"
    )

    lunch_allowance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Lunch allowance"
    )

    other_allowances = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Other allowances (airtime, etc.)"
    )

    # Calculated gross salary
    gross_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        editable=False,
        help_text="Total gross salary (auto-calculated)"
    )

    # Metadata
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_salary_structures'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    notes = models.TextField(blank=True, help_text="Notes about this salary change")

    class Meta:
        verbose_name = "Salary Structure"
        verbose_name_plural = "Salary Structures"
        ordering = ['-effective_date']
        # Only one salary structure per employee per date
        constraints = [
            models.UniqueConstraint(
                fields=['employee', 'effective_date'],
                name='unique_salary_structure_per_employee_date'
            )
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.effective_date}"

    def save(self, *args, **kwargs):
        """Auto-calculate gross salary"""
        self.gross_salary = (
            self.basic_salary +
            self.housing_allowance +
            self.transport_allowance +
            self.medical_allowance +
            self.lunch_allowance +
            self.other_allowances
        )
        super().save(*args, **kwargs)

    @property
    def total_allowances(self):
        """Calculate total allowances"""
        return (
            self.housing_allowance +
            self.transport_allowance +
            self.medical_allowance +
            self.lunch_allowance +
            self.other_allowances
        )


class PayrollRun(models.Model):
    """
    Monthly payroll run for a company.
    Contains all payslips for a specific month/year.
    """

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('processing', 'Processing'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='payroll_runs'
    )

    # Payroll period
    month = models.IntegerField(help_text="Month (1-12)")
    year = models.IntegerField(help_text="Year (e.g., 2024)")

    # Status and workflow
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )

    # Financial totals
    total_gross = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total gross salary for all employees"
    )

    total_deductions = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total deductions for all employees"
    )

    total_net = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total net salary for all employees"
    )

    # Employee count
    employee_count = models.IntegerField(default=0, help_text="Number of employees in this payroll")

    # Processing metadata
    processed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='processed_payrolls'
    )
    processed_at = models.DateTimeField(null=True, blank=True)

    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='approved_payrolls'
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    paid_at = models.DateTimeField(null=True, blank=True)

    # Notes
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Payroll Run"
        verbose_name_plural = "Payroll Runs"
        ordering = ['-year', '-month']
        # One payroll run per company per month/year
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'month', 'year'],
                name='unique_payroll_run_per_company_month_year'
            )
        ]

    def __str__(self):
        return f"{self.company.name} - {self.month:02d}/{self.year}"


class Payslip(models.Model):
    """
    Individual payslip for an employee in a payroll run.
    Contains detailed breakdown of earnings and deductions.
    """

    PAYMENT_METHOD_CHOICES = [
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    payroll_run = models.ForeignKey(
        PayrollRun,
        on_delete=models.CASCADE,
        related_name='payslips'
    )

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='payslips'
    )

    # Earnings (from salary structure)
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    bonuses = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)

    # Deductions - Uganda Tax (PAYE)
    paye_tax = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Pay As You Earn tax (Uganda)"
    )

    # NSSF - Employee contribution (10%)
    nssf_employee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="NSSF employee contribution (10%)"
    )

    # NSSF - Employer contribution (10%) - stored for reference
    nssf_employer = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="NSSF employer contribution (10%)"
    )

    # Other deductions
    loan_deduction = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Loan/advance repayment"
    )

    advance_deduction = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Salary advance deduction"
    )

    other_deductions = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Other deductions (insurance, etc.)"
    )

    # Total deductions
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2)

    # Final amount
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)

    # Payment details
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='bank_transfer'
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )

    payment_date = models.DateField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)

    # Payslip file (PDF)
    payslip_file = models.FileField(
        upload_to='payslips/',
        null=True,
        blank=True,
        help_text="Generated PDF payslip"
    )

    class Meta:
        verbose_name = "Payslip"
        verbose_name_plural = "Payslips"
        ordering = ['payroll_run', 'employee__employee_number']
        # One payslip per employee per payroll run
        constraints = [
            models.UniqueConstraint(
                fields=['payroll_run', 'employee'],
                name='unique_payslip_per_payroll_employee'
            )
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.payroll_run}"


class Loan(models.Model):
    """
    Employee loans and advances.
    Tracks salary advances and other loans with repayment schedules.
    """

    LOAN_TYPE_CHOICES = [
        ('salary_advance', 'Salary Advance'),
        ('personal_loan', 'Personal Loan'),
        ('emergency_loan', 'Emergency Loan'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('defaulted', 'Defaulted'),
        ('cancelled', 'Cancelled'),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='loans'
    )

    # Loan details
    loan_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    loan_type = models.CharField(
        max_length=20,
        choices=LOAN_TYPE_CHOICES,
        default='salary_advance'
    )

    loan_purpose = models.TextField(blank=True, help_text="Purpose of the loan")

    # Approval and processing
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='approved_loans'
    )

    disbursement_date = models.DateField(null=True, blank=True)

    # Repayment terms
    repayment_period_months = models.IntegerField(
        default=1,
        help_text="Number of months to repay"
    )

    monthly_deduction = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Monthly deduction amount"
    )

    # Tracking
    total_repaid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )

    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Remaining balance"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Loan"
        verbose_name_plural = "Loans"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.loan_type} - UGX {self.loan_amount}"

    def save(self, *args, **kwargs):
        """Auto-calculate balance"""
        if not self.balance:
            self.balance = self.loan_amount
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Check if loan is overdue"""
        if self.status != 'active' or not self.disbursement_date:
            return False

        from django.utils import timezone
        from dateutil.relativedelta import relativedelta

        expected_completion = self.disbursement_date + relativedelta(months=self.repayment_period_months)
        return timezone.now().date() > expected_completion and self.balance > 0