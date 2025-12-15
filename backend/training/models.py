from django.db import models
from accounts.models import Company
from employees.models import Employee

class Course(models.Model):
    """Training Course Catalog"""
    TYPE_CHOICES = [
        ('internal', 'Internal Workshop'),
        ('external', 'External Seminar'),
        ('online', 'Online Course'),
        ('certification', 'Certification Program'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='courses')
    title = models.CharField(max_length=255)
    description = models.TextField()
    provider = models.CharField(max_length=255, help_text="e.g. Udemy, Internal HR, Google")
    course_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='internal')
    
    duration_hours = models.DecimalField(max_digits=6, decimal_places=2, help_text="Total hours")
    cost_per_person = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    website_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.provider})"

class TrainingSession(models.Model):
    """Scheduled Instance of a Course"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    instructor = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, help_text="Physical room or Meeting Link")
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    capacity = models.IntegerField(default=20)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    def __str__(self):
        return f"{self.course.title} - {self.start_date.strftime('%Y-%m-%d')}"

class Enrollment(models.Model):
    """Employee Participation in Training"""
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('attended', 'Attended'),
        ('no_show', 'No Show'),
        ('failed', 'Failed'),
        ('completed', 'Completed'),
    ]

    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='enrollments')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='training_enrollments')
    
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered')
    
    completion_date = models.DateField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True, help_text="Percentage or Grade")
    certificate_url = models.URLField(blank=True, help_text="Link to stored certificate")
    
    feedback = models.TextField(blank=True, help_text="Employee feedback on course")

    class Meta:
        unique_together = ['session', 'employee']
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.employee.full_name} -> {self.session.course.title}"
