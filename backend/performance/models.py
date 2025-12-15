from django.db import models
from accounts.models import Company
from employees.models import Employee
from django.core.validators import MinValueValidator, MaxValueValidator

class PerformanceCycle(models.Model):
    """A period of time for performance reviews (e.g., '2025 Q1')"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('closed', 'Closed'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='performance_cycles')
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        unique_together = ['company', 'name']

    def __str__(self):
        return f"{self.name} ({self.company.name})"

class Goal(models.Model):
    """Specific objectives for an employee"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='goals') # Added for easy multi-tenant filtering
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='goals')
    cycle = models.ForeignKey(PerformanceCycle, on_delete=models.SET_NULL, null=True, blank=True, related_name='goals')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    due_date = models.DateField(null=True, blank=True)
    progress = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    manager_comment = models.TextField(blank=True, help_text="Optional feedback from manager")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.employee.full_name}"

class PerformanceReview(models.Model):
    """The actual review document"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('draft', 'Draft'), # Manager is writing it
        ('submitted', 'Submitted'), # Sent to employee
        ('acknowledged', 'Acknowledged'), # Employee signed off
    ]

    cycle = models.ForeignKey(PerformanceCycle, on_delete=models.CASCADE, related_name='reviews')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews_received')
    reviewer = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='performance_reviews_given')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    review_date = models.DateField(null=True, blank=True)
    
    # Ratings (1-5 scale)
    technical_skills = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    communication = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    teamwork = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    productivity = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    initiative = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    
    overall_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0) # Calculated average
    
    manager_feedback = models.TextField(blank=True)
    employee_self_review = models.TextField(blank=True)
    opportunities_for_improvement = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['cycle', 'employee']

    def calculate_overall(self):
        fields = [self.technical_skills, self.communication, self.teamwork, self.productivity, self.initiative]
        non_zero = [f for f in fields if f > 0]
        if non_zero:
            self.overall_rating = sum(non_zero) / len(non_zero)
        else:
            self.overall_rating = 0.0
        self.save()

    def __str__(self):
        return f"Review: {self.employee.full_name} - {self.cycle.name}"
