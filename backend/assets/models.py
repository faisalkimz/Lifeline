from django.db import models
from django.conf import settings
from employees.models import Employee

class AssetCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='asset_categories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Asset Categories"
        unique_together = ['company', 'name']

    def __str__(self):
        return self.name

class Asset(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('assigned', 'Assigned'),
        ('maintenance', 'In Maintenance'),
        ('retired', 'Retired/Disposed'),
        ('lost', 'Lost/Stolen'),
    ]

    CONDITION_CHOICES = [
        ('new', 'New'),
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('damaged', 'Damaged'),
    ]

    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='assets')
    category = models.ForeignKey(AssetCategory, on_delete=models.SET_NULL, null=True, related_name='assets')
    
    name = models.CharField(max_length=200, help_text="e.g., MacBook Pro 16-inch")
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    asset_tag = models.CharField(max_length=50, blank=True, null=True, help_text="Internal tracking ID")
    
    purchase_date = models.DateField(blank=True, null=True)
    purchase_cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    vendor = models.CharField(max_length=100, blank=True, null=True)
    warranty_expiry = models.DateField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='new')
    
    image = models.ImageField(upload_to='assets/', blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Current assignment (denormalized for easy access, but source of truth is AssetAssignment history)
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_assets')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.asset_tag or self.serial_number})"

class AssetAssignment(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='assignment_history')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='asset_history')
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    assigned_date = models.DateField()
    return_date = models.DateField(blank=True, null=True)
    
    condition_on_checkout = models.CharField(max_length=20, choices=Asset.CONDITION_CHOICES, default='good')
    condition_on_return = models.CharField(max_length=20, choices=Asset.CONDITION_CHOICES, blank=True, null=True)
    
    notes = models.TextField(blank=True, null=True)
    
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.asset} -> {self.employee} ({self.assigned_date})"
