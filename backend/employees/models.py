"""
Employee and Department models.
Core HR functionality for managing company workforce.
"""
from django.db import models
from accounts.models import Company


class Department(models.Model):
    """
    Department within a company.
    Isolated per company (multi-tenant).
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='departments',
        help_text="Company this department belongs to"
    )
    
    name = models.CharField(max_length=255, help_text="Department name (e.g., IT, HR, Finance)")
    code = models.CharField(max_length=20, blank=True, help_text="Department code (e.g., IT, HR, FIN)")
    description = models.TextField(blank=True)
    
    # Department Head
    manager = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_departments',
        help_text="Department manager/head"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        ordering = ['name']
        # Ensure department name is unique within a company
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'name'],
                name='unique_department_per_company'
            )
        ]
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"
    
    @property
    def employee_count(self):
        """Count active employees in this department"""
        return self.employees.filter(employment_status='active').count()


class Employee(models.Model):
    """
    Employee record - complete HR profile.
    This is the heart of the HR system!
    """
    # Company Link (CRITICAL for multi-tenant)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='employees',
        help_text="Company this employee works for"
    )
    
    # Employee Number (auto-generated, unique per company)
    employee_number = models.CharField(
        max_length=50,
        help_text="Unique employee ID (e.g., EMP001, EMP002)"
    )
    
   # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField()
    gender = models.CharField(
        max_length=10,
        choices=[
            ('male', 'Male'),
            ('female', 'Female'),
            ('other', 'Other'),
        ]
    )
    
    # National ID & Documents
    national_id = models.CharField(max_length=50, help_text="National ID number")
    passport_number = models.CharField(max_length=50, blank=True)
    tin_number = models.CharField(max_length=50, blank=True, help_text="TIN for tax")
    nssf_number = models.CharField(max_length=50, blank=True, help_text="NSSF number (Uganda)")
    
    # Contact Information
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    personal_email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True, help_text="District (for Uganda)")
    
    # Photo
    photo = models.ImageField(upload_to='employee_photos/', blank=True, null=True)
    
    # Employment Details
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees'
    )
    job_title = models.CharField(max_length=255, help_text="Job title (e.g., Software Engineer)")
    
    # Reporting Structure
    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates',
        help_text="Direct supervisor/manager"
    )
    
    # Employment Type
    employment_type = models.CharField(
        max_length=50,
        choices=[
            ('full_time', 'Full Time'),
            ('part_time', 'Part Time'),
            ('contract', 'Contract'),
            ('intern', 'Intern'),
            ('casual', 'Casual'),
        ],
        default='full_time'
    )
    
    # Employment Status
    employment_status = models.CharField(
        max_length=50,
        choices=[
            ('active', 'Active'),
            ('on_leave', 'On Leave'),
            ('suspended', 'Suspended'),
            ('terminated', 'Terminated'),
            ('resigned', 'Resigned'),
        ],
        default='active'
    )
    
    # Important Dates
    join_date = models.DateField(help_text="Date employee joined the company")
    probation_end_date = models.DateField(null=True, blank=True)
    confirmation_date = models.DateField(null=True, blank=True)
    resignation_date = models.DateField(null=True, blank=True)
    last_working_date = models.DateField(null=True, blank=True)
    
    # Bank Details (for payroll)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account_number = models.CharField(max_length=100, blank=True)
    bank_branch = models.CharField(max_length=100, blank=True)
    mobile_money_number = models.CharField(max_length=20, blank=True, help_text="MTN/Airtel Money number")
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True)
    
    # Marital Status & Dependents
    marital_status = models.CharField(
        max_length=20,
        choices=[
            ('single', 'Single'),
            ('married', 'Married'),
            ('divorced', 'Divorced'),
            ('widowed', 'Widowed'),
        ],
        blank=True
    )
    number_of_dependents = models.IntegerField(default=0)
    
    # Notes
    notes = models.TextField(blank=True, help_text="Internal notes about employee")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        ordering = ['employee_number']
        # Ensure employee number is unique within company
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'employee_number'],
                name='unique_employee_number_per_company'
            ),
            models.UniqueConstraint(
                fields=['company', 'email'],
                name='unique_employee_email_per_company'
            ),
        ]
        indexes = [
            models.Index(fields=['company', 'employment_status']),
            models.Index(fields=['company', 'department']),
        ]
    
    def __str__(self):
        return f"{self.employee_number} - {self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        """Get full name"""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_on_probation(self):
        """Check if employee is still on probation"""
        if not self.probation_end_date:
            return False
        from django.utils import timezone
        return timezone.now().date() < self.probation_end_date
    
    @property
    def years_of_service(self):
        """Calculate years of service"""
        from django.utils import timezone
        from dateutil.relativedelta import relativedelta
        
        end_date = self.last_working_date if self.last_working_date else timezone.now().date()
        delta = relativedelta(end_date, self.join_date)
        return delta.years
    
    def save(self, *args, **kwargs):
        """Auto-generate employee number if not provided"""
        if not self.employee_number:
            # Get the last employee number for this company
            last_employee = Employee.objects.filter(company=self.company).order_by('-id').first()
            if last_employee and last_employee.employee_number.startswith('EMP'):
                try:
                    last_number = int(last_employee.employee_number[3:])
                    new_number = last_number + 1
                except ValueError:
                    new_number = 1
            else:
                new_number = 1
            
            self.employee_number = f"EMP{new_number:04d}"  # EMP0001, EMP0002, etc.
        
        super().save(*args, **kwargs)
