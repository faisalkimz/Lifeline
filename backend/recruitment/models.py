from django.db import models
from accounts.models import Company, User
from employees.models import Employee, Department
from django.utils import timezone

class Job(models.Model):
    """Job Requisition / Posting"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('internal', 'Internal Only'),
        ('closed', 'Closed'),
    ]
    
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('freelance', 'Freelance'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    hiring_manager = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='hiring_jobs')
    
    description = models.TextField()
    requirements = models.TextField()
    benefits = models.TextField(blank=True)
    
    location = models.CharField(max_length=100, default='Headquarters')
    is_remote = models.BooleanField(default=False)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='UGX')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.company.name}"


class IntegrationSettings(models.Model):
    """Store credentials for external job boards"""
    PLATFORM_CHOICES = [
        ('linkedin', 'LinkedIn'),
        ('indeed', 'Indeed'),
        ('glassdoor', 'Glassdoor'),
        ('fuzu', 'Fuzu'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='job_board_integrations')
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    
    client_id = models.CharField(max_length=255, blank=True)
    client_secret = models.CharField(max_length=255, blank=True)
    api_key = models.CharField(max_length=255, blank=True)
    
    # OAuth tokens
    access_token = models.TextField(blank=True)
    refresh_token = models.TextField(blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['company', 'platform']


class ExternalJobPost(models.Model):
    """Track a job posted to an external board"""
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='external_posts')
    integration = models.ForeignKey(IntegrationSettings, on_delete=models.CASCADE)
    
    external_id = models.CharField(max_length=255, help_text="ID returned by the external platform")
    url = models.URLField(blank=True)
    status = models.CharField(max_length=50, default='posted')
    
    posted_at = models.DateTimeField(auto_now_add=True)


class Candidate(models.Model):
    """Potential Employee"""
    SOURCE_CHOICES = [
        ('career_page', 'Career Page'),
        ('linkedin', 'LinkedIn'),
        ('indeed', 'Indeed'),
        ('referral', 'Referral'),
        ('agency', 'Agency'),
        ('other', 'Other'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='candidates')
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    cover_letter = models.TextField(blank=True)
    
    summary = models.TextField(blank=True)
    skills = models.TextField(blank=True, help_text="Comma separated skills")
    
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='career_page')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['company', 'email']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return self.full_name


class Application(models.Model):
    """Link between Candidate and Job"""
    STAGE_CHOICES = [
        ('applied', 'Applied'),
        ('screening', 'Screening'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='applications')
    
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='applied')
    score = models.IntegerField(default=0, help_text="AI or Manual Score (0-100)")
    
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['job', 'candidate']
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.candidate.full_name} for {self.job.title}"


class Interview(models.Model):
    """Scheduled Interview"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    TYPE_CHOICES = [
        ('phone', 'Phone Screen'),
        ('video', 'Video Call'),
        ('onsite', 'On-site'),
    ]

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    interviewer = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='interviews_conducting')
    
    date_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    interview_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='video')
    location = models.CharField(max_length=255, blank=True, help_text="Meeting link or physical address")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    feedback = models.TextField(blank=True)
    rating = models.IntegerField(default=0, help_text="Rating 1-5")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date_time']

    def __str__(self):
        return f"Interview: {self.application.candidate.full_name} with {self.interviewer}"


class OfferLetter(models.Model):
    """Offer Letter for a candidate"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]

    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='offer_letter')
    content = models.TextField(help_text="The body of the offer letter")
    
    salary_offered = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    pdf_file = models.FileField(upload_to='offer_letters/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Offer for {self.application.candidate.full_name}"
