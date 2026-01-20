from django.db import models
from django.conf import settings
from employees.models import Employee

class Survey(models.Model):
    SURVEY_TYPE_CHOICES = [
        ('pulse', 'Pulse Survey'),
        ('enps', 'eNPS'),
        ('satisfaction', 'Satisfaction Survey'),
        ('custom', 'Custom Survey'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='surveys')
    survey_type = models.CharField(max_length=20, choices=SURVEY_TYPE_CHOICES, default='pulse')
    
    # JSON structure for questions: [{id: 1, text: '...', type: 'rating', options: []}, ...]
    questions_config = models.JSONField(default=list)
    
    is_active = models.BooleanField(default=True)
    is_anonymous = models.BooleanField(default=False)
    
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class SurveyResponse(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='survey_responses', null=True, blank=True)
    
    # JSON data for answers: {question_id: answer, ...}
    answers_data = models.JSONField(default=dict)
    
    # For anonymized analytics without identity
    anonymous_id = models.UUIDField(null=True, blank=True, help_text="Used for tracking unique responses in anonymous surveys")
    
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent multiple responses from same employee on same survey (if not anonymous)
        unique_together = ('survey', 'employee')
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Response for {self.survey.title}"
