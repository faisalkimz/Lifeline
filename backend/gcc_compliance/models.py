from django.db import models
from django.conf import settings
from decimal import Decimal
from accounts.models import Company
from employees.models import Employee

class GCCPayrollSettings(models.Model):
    COUNTRY_CHOICES = [
        ('UAE', 'United Arab Emirates'),
        ('KSA', 'Saudi Arabia'),
        ('QAT', 'Qatar'),
        ('OMN', 'Oman'),
        ('KWT', 'Kuwait'),
        ('BHR', 'Bahrain'),
    ]

    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='gcc_settings')
    country = models.CharField(max_length=3, choices=COUNTRY_CHOICES)
    
    # Social Insurance details (GOSI, GPSSA, etc.)
    social_insurance_enabled = models.BooleanField(default=True)
    citizen_contribution_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('5.00')) # Employee %
    employer_contribution_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('12.50')) # Employer %
    
    # Gratuity (End of Service) Settings
    gratuity_scheme = models.CharField(max_length=50, default='Standard Labor Law')
    base_salary_type = models.CharField(max_length=20, choices=[('basic', 'Basic Only'), ('gross', 'Gross Salary')], default='basic')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company.name} - GCC ({self.country}) Settings"

class GratuityRecord(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='gratuity_records')
    joining_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)
    total_years_service = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    accrued_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    last_salary_base = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=[('accruing', 'Accruing'), ('paid', 'Paid')], default='accruing')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.full_name} - Gratuity: {self.accrued_amount}"
