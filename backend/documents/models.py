from django.db import models
from accounts.models import Company, User
from employees.models import Employee

class Document(models.Model):
    """Company-wide or generic documents"""
    CATEGORY_CHOICES = [
        ('policy', 'Company Policy'),
        ('contract', 'Contract / Agreement'),
        ('form', 'Form / Template'),
        ('other', 'Other'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='policy')
    
    file = models.FileField(upload_to='company_docs/')
    description = models.TextField(blank=True)
    
    is_public = models.BooleanField(default=True, help_text="Visible to all employees")
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.category})"

class EmployeeDocument(models.Model):
    """Specific to an employee (e.g. ID Scan, Contract Signed)"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='personal_documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='employee_docs/')
    
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"
