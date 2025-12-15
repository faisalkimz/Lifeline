from django.db import models
from accounts.models import Company
from employees.models import Employee

class BenefitType(models.Model):
    """Catalog of available benefits (e.g. Health Insurance, Gym, Transport Allowance)"""
    CATEGORY_CHOICES = [
        ('insurance', 'Insurance'),
        ('allowance', 'Allowance'),
        ('loan', 'Loan / Advance'),
        ('retirement', 'Retirement / Pension'),
        ('perk', 'Perk / Subscription'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='benefit_types')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    
    default_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Monetary value or Premium cost")
    is_taxable = models.BooleanField(default=False)
    
    provider_name = models.CharField(max_length=255, blank=True, help_text="e.g. Jubilee Insurance")
    provider_contact = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.company.name})"

class EmployeeBenefit(models.Model):
    """Assignment of a benefit to an employee"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending Approval'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    benefit_type = models.ForeignKey(BenefitType, on_delete=models.CASCADE, related_name='enrollments')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='benefits')
    
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    coverage_amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Specific value for this employee")
    employee_contribution = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Deducted from salary")
    employer_contribution = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    dependents_covered = models.JSONField(default=list, blank=True, help_text="List of family members covered")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.benefit_type.name} - {self.employee.full_name}"
