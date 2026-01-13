from django.db import models
from accounts.models import Company, User
from employees.models import Employee

class Folder(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='folders')
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subfolders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "folders"
        unique_together = ('company', 'name', 'parent')

    def __str__(self):
        return self.name

class Document(models.Model):
    """Company-wide or generic documents"""
    CATEGORY_CHOICES = [
        ('policy', 'Company Policy'),
        ('contract', 'Contract / Agreement'),
        ('form', 'Form / Template'),
        ('other', 'Other'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='documents')
    folder = models.ForeignKey(Folder, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='policy')
    
    file = models.FileField(upload_to='company_docs/')
    file_size = models.BigIntegerField(default=0, help_text="Size in bytes")
    description = models.TextField(blank=True)
    
    version = models.CharField(max_length=20, default='1.0')
    expiry_date = models.DateField(null=True, blank=True)
    is_public = models.BooleanField(default=True, help_text="Visible to all employees")
    is_archived = models.BooleanField(default=False)
    
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
    file_size = models.BigIntegerField(default=0, help_text="Size in bytes")
    
    version = models.CharField(max_length=20, default='1.0')
    expiry_date = models.DateField(null=True, blank=True)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"
