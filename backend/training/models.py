from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from accounts.models import Company
from employees.models import Employee


class TrainingProgram(models.Model):
    """
    Represents a reusable training program definition.
    Independent of scheduling - defines WHAT the training is.
    """
    PRIORITY_CHOICES = [
        ('low', 'Low Priority'),
        ('medium', 'Medium Priority'),
        ('high', 'High Priority'),
        ('critical', 'Critical'),
    ]

    CATEGORY_CHOICES = [
        ('technical', 'Technical Skills'),
        ('soft_skills', 'Soft Skills'),
        ('compliance', 'Compliance & Regulations'),
        ('leadership', 'Leadership & Management'),
        ('safety', 'Health & Safety'),
        ('onboarding', 'Onboarding'),
        ('product', 'Product Knowledge'),
        ('other', 'Other'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='training_programs')
    
    # Basic Information
    code = models.CharField(max_length=50, unique=True, help_text="Unique program identifier (e.g., TRN-001)")
    name = models.CharField(max_length=255)
    description = models.TextField()
    objectives = models.TextField(help_text="Learning objectives and outcomes")
    
    # Classification
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    provider = models.CharField(max_length=255, help_text="Training provider or department")
    
    # Requirements
    is_mandatory = models.BooleanField(default=False, help_text="Required for all employees")
    target_departments = models.JSONField(default=list, blank=True, help_text="List of department names")
    target_roles = models.JSONField(default=list, blank=True, help_text="List of role names")
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='required_for')
    
    # Duration and Effort
    duration_hours = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0.5)])
    estimated_effort_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, 
                                                   help_text="Expected self-study time")
    
    # Validity
    validity_period_months = models.IntegerField(null=True, blank=True, 
                                                   help_text="Recertification period in months")
    
    # Content
    materials_url = models.URLField(blank=True, help_text="Link to training materials")
    external_platform_url = models.URLField(blank=True)
    
    # Metadata
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='created_programs')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['is_mandatory']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class TrainingSession(models.Model):
    """
    Represents an actual scheduled occurrence of a training program.
    Defines WHEN and HOW the training happens.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('open_enrollment', 'Open for Enrollment'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('postponed', 'Postponed'),
    ]

    DELIVERY_MODE_CHOICES = [
        ('in_person', 'In-Person'),
        ('virtual', 'Virtual/Online'),
        ('hybrid', 'Hybrid'),
        ('self_paced', 'Self-Paced'),
    ]

    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='sessions')
    
    # Session Details
    session_code = models.CharField(max_length=50, unique=True, help_text="Unique session identifier")
    title_override = models.CharField(max_length=255, blank=True, help_text="Custom session title if different")
    
    # Scheduling
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField(null=True, blank=True)
    
    # Delivery
    delivery_mode = models.CharField(max_length=20, choices=DELIVERY_MODE_CHOICES, default='in_person')
    location = models.CharField(max_length=255, blank=True, help_text="Physical location or meeting link")
    facilitator = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, 
                                     related_name='facilitated_sessions')
    external_facilitator = models.CharField(max_length=255, blank=True)
    
    # Capacity Management
    min_participants = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    max_participants = models.IntegerField(default=20, validators=[MinValueValidator(1)])
    allow_waitlist = models.BooleanField(default=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    cancellation_reason = models.TextField(blank=True)
    
    # Resources
    session_materials_url = models.URLField(blank=True)
    meeting_link = models.URLField(blank=True)
    
    # Notifications
    reminder_sent = models.BooleanField(default=False)
    completion_processed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['program', 'status']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        title = self.title_override or self.program.name
        return f"{self.session_code} - {title} ({self.start_date.strftime('%Y-%m-%d')})"

    @property
    def available_slots(self):
        """Calculate remaining capacity"""
        enrolled_count = self.enrollments.filter(status__in=['registered', 'attended', 'completed']).count()
        return max(0, self.max_participants - enrolled_count)

    @property
    def is_full(self):
        return self.available_slots == 0

    @property
    def enrollment_open(self):
        """Check if enrollment is still open"""
        if self.status not in ['scheduled', 'open_enrollment']:
            return False
        if self.registration_deadline and timezone.now() > self.registration_deadline:
            return False
        return not self.is_full


class TrainingEnrollment(models.Model):
    """
    Tracks employee participation in a specific training session.
    Source of truth for progress and completion.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('registered', 'Registered'),
        ('waitlisted', 'Waitlisted'),
        ('confirmed', 'Confirmed'),
        ('attended', 'Attended'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('no_show', 'No Show'),
        ('cancelled', 'Cancelled'),
        ('withdrawn', 'Withdrawn'),
    ]

    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='enrollments')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='training_enrollments')
    
    # Enrollment Management
    enrolled_at = models.DateTimeField(auto_now_add=True)
    enrolled_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='enrollments_created')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered')
    
    # Approval Workflow (for manager approval if needed)
    requires_approval = models.BooleanField(default=False)
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, 
                                     related_name='approved_enrollments')
    approved_at = models.DateTimeField(null=True, blank=True)
    approval_notes = models.TextField(blank=True)
    
    # Attendance Tracking
    attendance_marked = models.BooleanField(default=False)
    attendance_date = models.DateTimeField(null=True, blank=True)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                                                 validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Progress and Completion
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0,
                                               validators=[MinValueValidator(0), MaxValueValidator(100)])
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Assessment Results
    assessment_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                                            validators=[MinValueValidator(0), MaxValueValidator(100)])
    passing_score_required = models.DecimalField(max_digits=5, decimal_places=2, default=70,
                                                   validators=[MinValueValidator(0), MaxValueValidator(100)])
    assessment_attempts = models.IntegerField(default=0)
    
    # Certification
    certificate_issued = models.BooleanField(default=False)
    certificate_number = models.CharField(max_length=100, blank=True, unique=True, null=True)
    certificate_issued_at = models.DateTimeField(null=True, blank=True)
    certificate_expires_at = models.DateField(null=True, blank=True)
    
    # Feedback
    feedback_text = models.TextField(blank=True, help_text="Employee feedback")
    feedback_rating = models.IntegerField(null=True, blank=True, 
                                           validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback_submitted_at = models.DateTimeField(null=True, blank=True)
    
    # Cancellation/Withdrawal
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['session', 'employee']]
        ordering = ['-enrolled_at']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['session', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['completed_at']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} → {self.session.program.name} [{self.status}]"

    @property
    def is_completed(self):
        return self.status == 'completed'

    @property
    def passed_assessment(self):
        if self.assessment_score is None:
            return None
        return self.assessment_score >= self.passing_score_required


class Assessment(models.Model):
    """
    Represents an assessment/quiz tied to a training program.
    Can be pre-test, post-test, or ongoing evaluation.
    """
    ASSESSMENT_TYPE_CHOICES = [
        ('pre_test', 'Pre-Assessment'),
        ('post_test', 'Post-Assessment'),
        ('quiz', 'Quiz'),
        ('practical', 'Practical Evaluation'),
        ('survey', 'Survey'),
    ]

    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='assessments')
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPE_CHOICES, default='post_test')
    
    # Configuration
    is_required = models.BooleanField(default=True)
    passing_score = models.DecimalField(max_digits=5, decimal_places=2, default=70,
                                         validators=[MinValueValidator(0), MaxValueValidator(100)])
    max_attempts = models.IntegerField(default=3, validators=[MinValueValidator(1)])
    time_limit_minutes = models.IntegerField(null=True, blank=True, help_text="Time limit in minutes")
    
    # Content
    total_questions = models.IntegerField(default=0)
    questions_data = models.JSONField(default=dict, blank=True, help_text="Assessment questions structure")
    
    # Availability
    is_active = models.BooleanField(default=True)
    available_from = models.DateTimeField(null=True, blank=True)
    available_until = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['program', 'assessment_type']

    def __str__(self):
        return f"{self.program.name} - {self.title}"


class AssessmentResult(models.Model):
    """
    Stores individual assessment attempt results.
    """
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='results')
    enrollment = models.ForeignKey(TrainingEnrollment, on_delete=models.CASCADE, related_name='assessment_results')
    
    attempt_number = models.IntegerField(default=1)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Results
    score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    passed = models.BooleanField(default=False)
    
    # Answer Data
    answers_data = models.JSONField(default=dict, help_text="Student answers")
    
    # Grading
    graded_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='graded_assessments')
    graded_at = models.DateTimeField(null=True, blank=True)
    grading_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['enrollment', 'assessment']),
        ]

    def __str__(self):
        return f"{self.enrollment.employee.full_name} - {self.assessment.title} (Attempt {self.attempt_number})"


class TrainingCertificate(models.Model):
    """
    Immutable certificate records issued upon successful training completion.
    """
    enrollment = models.OneToOneField(TrainingEnrollment, on_delete=models.CASCADE, related_name='certificate')
    
    certificate_number = models.CharField(max_length=100, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateField(null=True, blank=True)
    
    # Certificate Content
    employee_name = models.CharField(max_length=255)
    program_name = models.CharField(max_length=255)
    completion_date = models.DateField()
    
    # Storage
    certificate_file_url = models.URLField(blank=True, help_text="URL to generated PDF certificate")
    certificate_file_path = models.CharField(max_length=500, blank=True)
    
    # Verification
    verification_code = models.CharField(max_length=50, unique=True)
    is_revoked = models.BooleanField(default=False)
    revoked_at = models.DateTimeField(null=True, blank=True)
    revocation_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-issued_at']
        indexes = [
            models.Index(fields=['certificate_number']),
            models.Index(fields=['verification_code']),
        ]

    def __str__(self):
        return f"Certificate {self.certificate_number} - {self.employee_name}"


class TrainingComplianceRule(models.Model):
    """
    Defines mandatory training requirements by role/department.
    """
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='compliance_rules')
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='compliance_rules')
    
    # Target
    applies_to_departments = models.JSONField(default=list, blank=True)
    applies_to_roles = models.JSONField(default=list, blank=True)
    applies_to_all = models.BooleanField(default=False)
    
    # Requirements
    required_by_date = models.DateField(null=True, blank=True, help_text="Deadline for completion")
    recurrence_months = models.IntegerField(null=True, blank=True, help_text="Recurring training every X months")
    grace_period_days = models.IntegerField(default=0, help_text="Days after due date before non-compliance")
    
    # Status
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Compliance: {self.program.name}"


class TrainingNotification(models.Model):
    """
    Audit trail for training-related notifications sent to employees.
    """
    NOTIFICATION_TYPE_CHOICES = [
        ('enrollment_confirmation', 'Enrollment Confirmation'),
        ('session_reminder', 'Session Reminder'),
        ('completion_congratulations', 'Completion Congratulations'),
        ('certificate_issued', 'Certificate Issued'),
        ('assessment_due', 'Assessment Due'),
        ('compliance_warning', 'Compliance Warning'),
        ('session_cancelled', 'Session Cancelled'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='training_notifications')
    enrollment = models.ForeignKey(TrainingEnrollment, on_delete=models.CASCADE, null=True, blank=True, 
                                    related_name='notifications')
    
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    
    sent_at = models.DateTimeField(auto_now_add=True)
    sent_via = models.CharField(max_length=50, default='email')  # email, sms, in_app
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.notification_type} → {self.employee.full_name}"