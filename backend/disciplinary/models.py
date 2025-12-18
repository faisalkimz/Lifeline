from django.db import models
from django.utils.translation import gettext_lazy as _
from employees.models import Employee
from accounts.models import Company

class DisciplinaryAction(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('under_appeal', 'Under Appeal'),
        ('closed', 'Closed'),
        ('withdrawn', 'Withdrawn'),
    ]

    SEVERITY_CHOICES = [
        ('minor', 'Minor'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
        ('critical', 'Critical'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='disciplinary_actions')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='disciplinary_records')
    case_id = models.CharField(max_length=50, unique=True, editable=False)
    reason = models.CharField(max_length=255)
    description = models.TextField()
    incident_date = models.DateField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='minor')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    issued_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='disciplinary_issued')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Evidence and Decision
    employee_statement = models.TextField(blank=True, null=True)
    decision = models.TextField(blank=True, null=True)
    decision_date = models.DateField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.case_id:
            import uuid
            self.case_id = f"DSC-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.case_id} - {self.employee.full_name}"

    class Meta:
        ordering = ['-created_at']
