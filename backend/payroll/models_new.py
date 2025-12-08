from django.db import models
from employees.models import Employee, Department
from accounts.models import Company
from decimal import Decimal
from django.utils import timezone


class SalaryStructure(models.Model):
    """
    Defines salary components for each employee.
    Includes basic salary and various allowances.
    """
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='salary_structure')
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    effective_date = models.DateField(auto_now_add=True)
    
    # Earnings
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    housing_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    medical_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    lunch_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Calculated (auto-updated)
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Tax/Deduction Settings
    nssf_enabled = models.BooleanField(default=True)
    paye_enabled = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
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
    
    class Meta:
        ordering = ['-effective_date']
        unique_together = [['employee', 'effective_date']]
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.effective_date}"


class PayrollRun(models.Model):
    """
    Monthly payroll processing cycle.
    Groups all payslips for a specific month.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('processing', 'Processing'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='payroll_runs')
    month = models.IntegerField()  # 1-12
    year = models.IntegerField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Totals
    total_gross = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_paye = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_nssf = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_net = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Approval workflow
    processed_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='payroll_runs_processed')
    processed_at = models.DateTimeField(null=True, blank=True)
    
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='payroll_runs_approved')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-year', '-month']
        unique_together = [['company', 'month', 'year']]
    
    def __str__(self):
        return f"{self.company.name} - {self.month}/{self.year}"
    
    def calculate_totals(self):
        """Recalculate payroll totals from payslips"""
        payslips = self.payslips.all()
        self.total_gross = sum(p.gross_salary for p in payslips) or Decimal('0')
        self.total_paye = sum(p.paye_tax for p in payslips) or Decimal('0')
        self.total_nssf = sum(p.nssf_employee for p in payslips) or Decimal('0')
        self.total_deductions = sum(p.total_deductions for p in payslips) or Decimal('0')
        self.total_net = sum(p.net_salary for p in payslips) or Decimal('0')
        self.save()


class Payslip(models.Model):
    """
    Individual payslip for each employee in a payroll run.
    Contains all earnings, deductions, and net pay.
    """
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processed', 'Processed'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]
    
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='payslips')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslips')
    
    # Earnings
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    housing_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    medical_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    lunch_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Deductions
    paye_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    nssf_employee = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Employee contribution
    nssf_employer = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Employer contribution (not deducted)
    loan_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    advance_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Payment Details
    payment_method = models.CharField(max_length=50, default='bank')  # bank, cash, mobile_money
    payment_date = models.DateField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_reference = models.CharField(max_length=255, blank=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-payroll_run__year', '-payroll_run__month', 'employee__employee_number']
        unique_together = [['payroll_run', 'employee']]
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.payroll_run}"
    
    def calculate_totals(self):
        """Recalculate gross, deductions, and net"""
        self.gross_salary = (
            self.basic_salary +
            self.housing_allowance +
            self.transport_allowance +
            self.medical_allowance +
            self.lunch_allowance +
            self.other_allowances +
            self.bonus
        )
        
        self.total_deductions = (
            self.paye_tax +
            self.nssf_employee +
            self.loan_deduction +
            self.advance_deduction +
            self.other_deductions
        )
        
        self.net_salary = self.gross_salary - self.total_deductions
    
    def save(self, *args, **kwargs):
        """Auto-calculate totals before saving"""
        self.calculate_totals()
        super().save(*args, **kwargs)


class SalaryAdvance(models.Model):
    """
    Tracks salary advances/loans given to employees.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('repaid', 'Fully Repaid'),
        ('cancelled', 'Cancelled'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_advances')
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField()
    
    requested_at = models.DateTimeField(auto_now_add=True)
    requested_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='salary_advances_requested')
    
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='salary_advances_approved')
    
    # Repayment Schedule
    repayment_months = models.IntegerField(default=3)  # Number of months to repay
    monthly_deduction = models.DecimalField(max_digits=12, decimal_places=2)  # Amount deducted per month
    amount_repaid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.amount} UGX"
    
    def approve(self, approved_by):
        """Approve salary advance"""
        self.status = 'approved'
        self.approved_by = approved_by
        self.approved_at = timezone.now()
        self.monthly_deduction = self.amount / self.repayment_months
        self.save()


class TaxSettings(models.Model):
    """
    Company-specific tax configuration for payroll.
    Supports Uganda PAYE, NSSF, LST, and other jurisdictions.
    """
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='tax_settings')
    
    country = models.CharField(max_length=2, default='UG')  # ISO country code
    currency = models.CharField(max_length=3, default='UGX')
    
    # Uganda-specific
    nssf_employee_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))
    nssf_employer_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))
    nssf_ceiling = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('100000.00'))
    
    local_service_tax_enabled = models.BooleanField(default=True)
    local_service_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('5.00'))  # 5% for Kampala
    
    # Company details for tax
    tax_id = models.CharField(max_length=50, blank=True)  # TIN for Uganda
    company_bank_name = models.CharField(max_length=255, blank=True)
    company_bank_account = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Tax Settings - {self.company.name}"


class PayrollAuditLog(models.Model):
    """
    Audit trail for all payroll actions.
    Tracks who did what and when.
    """
    ACTION_CHOICES = [
        ('create_payslip', 'Created Payslip'),
        ('edit_payslip', 'Edited Payslip'),
        ('delete_payslip', 'Deleted Payslip'),
        ('approve_run', 'Approved Payroll Run'),
        ('process_payment', 'Processed Payment'),
        ('create_advance', 'Created Salary Advance'),
        ('approve_advance', 'Approved Salary Advance'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    related_object_id = models.IntegerField(null=True, blank=True)  # ID of affected payslip, advance, etc.
    related_object_type = models.CharField(max_length=50, blank=True)  # payslip, advance, payroll_run
    
    performed_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    old_values = models.JSONField(default=dict, blank=True)
    new_values = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.created_at}"
