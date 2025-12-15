from django.db import models
from accounts.models import Company
from employees.models import Employee


class ExpenseCategory(models.Model):
    """Categories for expense claims"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='expense_categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'expense_categories'
        unique_together = ['company', 'name']
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"


class ExpenseClaim(models.Model):
    """Employee expense claims"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='expense_claims')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='expense_claims')
    category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT, related_name='claims')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    
    expense_date = models.DateField()
    receipt = models.FileField(upload_to='expenses/receipts/', null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    approved_by = models.ForeignKey(
        Employee, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_expenses'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    payment_date = models.DateField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expense_claims'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.employee.get_full_name()} - {self.amount} {self.currency}"
    
    @property
    def employee_name(self):
        return self.employee.get_full_name()
    
    @property
    def category_name(self):
        return self.category.name if self.category else ''
    
    @property
    def approver_name(self):
        return self.approved_by.get_full_name() if self.approved_by else ''


class ExpenseReimbursement(models.Model):
    """Batch reimbursements for multiple claims"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='expense_reimbursements')
    
    reference = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=50)  # Bank Transfer, Mobile Money, Cash
    notes = models.TextField(blank=True)
    
    created_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='created_reimbursements')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'expense_reimbursements'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reimbursement {self.reference} - {self.total_amount} {self.currency}"
