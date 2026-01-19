from django.db import models
from accounts.models import Company

class ExternalIntegration(models.Model):
    """Stores configuration for external integrations per company"""
    PROVIDER_CHOICES = [
        ('google_calendar', 'Google Calendar'),
        ('microsoft_outlook', 'Microsoft Outlook'),
        ('zoom', 'Zoom Meetings'),
        ('teams', 'Microsoft Teams'),
        ('aws_s3', 'AWS S3 Storage'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='integrations')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    
    # Configuration
    client_id = models.CharField(max_length=255, blank=True)
    client_secret = models.CharField(max_length=512, blank=True)
    tenant_id = models.CharField(max_length=255, blank=True, help_text="Required for Microsoft/Azure integrations")
    
    access_token = models.TextField(blank=True)
    refresh_token = models.TextField(blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    
    # S3 Specific
    bucket_name = models.CharField(max_length=255, blank=True)
    region = models.CharField(max_length=50, blank=True)
    
    # Generic Metadata for provider-specific attributes
    metadata = models.JSONField(default=dict, blank=True)
    
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, default='active', choices=[
        ('active', 'Active'),
        ('unauthorized', 'Unauthorized'),
        ('error', 'Error'),
    ])
    
    last_synced = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['company', 'provider']
        verbose_name = "External Integration"
        verbose_name_plural = "External Integrations"

    def __str__(self):
        return f"{self.company.name} - {self.get_provider_display()}"
