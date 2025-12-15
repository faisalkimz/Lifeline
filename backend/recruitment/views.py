from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Job, Candidate, Application, Interview, IntegrationSettings, ExternalJobPost
from .serializers import (
    JobSerializer, 
    CandidateSerializer, 
    ApplicationSerializer, 
    InterviewSerializer,
    IntegrationSettingsSerializer
)
from django.utils import timezone
import random # Mocking ID generation

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'department__name']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        return Job.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        job = self.get_object()
        
        # 1. Update internal status
        job.status = 'published'
        job.published_at = timezone.now()
        job.save()

        # 2. Handle external posting if platforms requested
        platforms = request.data.get('platforms', [])
        results = []
        
        for platform_key in platforms:
            # Check if integration exists
            integration = IntegrationSettings.objects.filter(
                company=request.user.company, 
                platform=platform_key, 
                is_active=True
            ).first()

            if integration:
                # Mock External API Call
                # In real life: adapter.post_job(job, integration.api_key)
                mock_external_id = f"{platform_key.upper()}-{random.randint(1000, 9999)}"
                mock_url = f"https://{platform_key}.com/jobs/{mock_external_id}"
                
                ExternalJobPost.objects.create(
                    job=job,
                    integration=integration,
                    external_id=mock_external_id,
                    url=mock_url,
                    status='active'
                )
                results.append(f"Posted to {platform_key}")
            else:
                results.append(f"Skipped {platform_key}: No active integration")

        return Response({
            'status': 'job published',
            'details': results
        })
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        job = self.get_object()
        job.status = 'closed'
        job.expires_at = timezone.now()
        job.save()
        return Response({'status': 'job closed'})

class PublicJobViewSet(viewsets.ReadOnlyModelViewSet):
    """Public endpoints for Career Pages"""
    serializer_class = JobSerializer
    permission_classes = [AllowAny]
    queryset = Job.objects.filter(status='published')

    def get_queryset(self):
        company_id = self.request.query_params.get('company_id')
        if company_id:
            return self.queryset.filter(company_id=company_id)
        return self.queryset

class CandidateViewSet(viewsets.ModelViewSet):
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'skills']

    def get_queryset(self):
        return Candidate.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['applied_at', 'score']

    def get_queryset(self):
        queryset = Application.objects.filter(job__company=self.request.user.company)
        
        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
            
        stage = self.request.query_params.get('stage')
        if stage:
            queryset = queryset.filter(stage=stage)
            
        return queryset

    @action(detail=True, methods=['patch'])
    def move_stage(self, request, pk=None):
        app = self.get_object()
        new_stage = request.data.get('stage')
        if new_stage not in dict(Application.STAGE_CHOICES):
            return Response({'error': 'Invalid stage'}, status=400)
        
        app.stage = new_stage
        app.save()
        return Response({'status': f'moved into {new_stage}'})

class InterviewViewSet(viewsets.ModelViewSet):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Interview.objects.filter(application__job__company=user.company)
        
        if self.request.query_params.get('my_interviews'):
            # Interviews I am conducting
            if hasattr(user, 'employee'):
                queryset = queryset.filter(interviewer=user.employee)
        
        return queryset

class IntegrationSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = IntegrationSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return IntegrationSettings.objects.filter(company=self.request.user.company)
    
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
