"""
Models for Company and User management.
This is the foundation of our multi-tenant system.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify


class Company(models.Model):
    """
    Company model - Core of multi-tenant system.
    Each company's data is completely isolated.
    """
    # Basic Information
    name = models.CharField(max_length=255, help_text="Company name")
    slug = models.SlugField(unique=True, max_length=255, help_text="URL-friendly name")
    
    # Contact Information
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=2, default='UG', help_text="ISO country code (UG for Uganda)")
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    
    # Tax & Registration
    tax_id = models.CharField(
        max_length=50, 
        blank=True, 
        help_text="TIN (Tax Identification Number) for Uganda"
    )
    registration_number = models.CharField(max_length=100, blank=True)
    
    # Settings
    currency = models.CharField(max_length=3, default='UGX', help_text="Currency code (UGX for Uganda Shillings)")
    date_format = models.CharField(max_length=20, default='DD/MM/YYYY')
    
    # Subscription (for SaaS billing)
    subscription_tier = models.CharField(
        max_length=50, 
        default='starter',
        choices=[
            ('free', 'Free'),
            ('starter', 'Starter'),
            ('professional', 'Professional'),
            ('enterprise', 'Enterprise'),
        ]
    )
    subscription_start = models.DateField(null=True, blank=True)
    subscription_expires = models.DateField(null=True, blank=True)
    max_employees = models.IntegerField(default=20, help_text="Maximum employees allowed")
    
    # Company Logo
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Automation & Workflow Alerts
    automated_onboarding_email = models.BooleanField(default=True)
    disciplinary_alerts = models.BooleanField(default=True)
    leave_request_notifications = models.BooleanField(default=True)
    attendance_exceptions_alerts = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from company name if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def employee_count(self):
        """Count active employees in this company"""
        return self.employees.filter(employment_status='active').count()
    
    @property
    def is_subscription_active(self):
        """Check if subscription is still valid"""
        if not self.subscription_expires:
            return True  # No expiry set
        from django.utils import timezone
        return timezone.now().date() <= self.subscription_expires


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Every user belongs to a company (multi-tenant).
    """
    # Link to company (CRITICAL for multi-tenant)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='users',
        help_text="Company this user belongs to"
    )
    
    # Role within company
    role = models.CharField(
        max_length=50,
        default='employee',
        choices=[
            ('super_admin', 'Super Admin'),      # Platform admin (us)
            ('company_admin', 'Company Admin'),  # Company owner
            ('hr_manager', 'HR Manager'),        # HR department
            ('manager', 'Manager'),              # Department manager
            ('employee', 'Employee'),            # Regular employee
        ],
        help_text="User's role in the company"
    )
    
    # Additional Info
    phone = models.CharField(max_length=20, blank=True)
    photo = models.ImageField(upload_to='user_photos/', blank=True, null=True)
    
    # Employee Link (if user is also an employee)
    employee = models.OneToOneField(
        'employees.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_account',
        help_text="Link to employee record if applicable"
    )

    # Security & 2FA
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_device = models.CharField(max_length=255, blank=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)
    
    # GDPR & Compliance
    data_consent = models.BooleanField(default=False, help_text="Consent to process person data")
    data_consent_at = models.DateTimeField(null=True, blank=True)
    marketing_consent = models.BooleanField(default=False)
    
    # Account Status
    is_verified = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        # Ensure email is unique within a company (not globally)
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'email'],
                name='unique_email_per_company'
            )
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.company.name})"
    
    def has_permission(self, permission_name):
        """Check if user has a specific permission"""
        # Super admins have all permissions
        if self.role == 'super_admin':
            return True
        
        # Company admins have all company-level permissions
        if self.role == 'company_admin':
            return True
        
        # HR managers have HR-related permissions
        if self.role == 'hr_manager' and permission_name in ['view_employees', 'manage_payroll', 'manage_leave']:
            return True
        
        # Managers have limited permissions
        if self.role == 'manager' and permission_name in ['view_team', 'approve_leave']:
            return True
        
        return False

class SecurityLog(models.Model):
    """
    Audit log for security-sensitive actions.
    """
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='security_logs')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='security_logs')
    action = models.CharField(max_length=100) # e.g., 'login', 'password_change', '2fa_enable'
    status = models.CharField(max_length=20, default='success') # 'success' or 'failure'
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'action']),
            models.Index(fields=['user', 'action']),
        ]

    def __str__(self):
        return f"{self.user.username if self.user else 'System'} - {self.action} - {self.created_at.date()}"
