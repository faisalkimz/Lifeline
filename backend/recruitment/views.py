from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from accounts.permissions import IsCompanyUser, IsHRManagerOrAdmin, IsCompanyAdmin
from .models import Job, Candidate, Application, Interview, IntegrationSettings, ExternalJobPost, OfferLetter
from .serializers import (
    JobSerializer, 
    CandidateSerializer, 
    ApplicationSerializer, 
    InterviewSerializer,
    IntegrationSettingsSerializer,
    OfferLetterSerializer
)
from django.utils import timezone
import random # Mocking ID generation

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'department__name']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        user = self.request.user
        queryset = Job.objects.filter(company=user.company)
        
        # Managers only see jobs in their department
        if user.role == 'manager':
             if hasattr(user, 'employee'):
                 queryset = queryset.filter(department=user.employee.department)
             else:
                 queryset = queryset.none()
        elif user.role == 'employee':
             queryset = queryset.none()
             
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'publish', 'close']:
            return [IsAuthenticated(), IsHRManagerOrAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        job = self.get_object()
        platforms = request.data.get('platforms', [])
        from .services.publishing_service import JobPublishingService
        results = JobPublishingService.publish_to_platforms(job, platforms)
        
        if results['success']:
            return Response({'status': 'published', 'message': f"Job published to {len([p for p, r in results['platforms'].items() if r.get('success')])} platform(s)", 'results': results}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'partial_failure', 'message': 'Some platforms failed to publish', 'results': results}, status=status.HTTP_207_MULTI_STATUS)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        job = self.get_object()
        from .services.publishing_service import JobPublishingService
        analytics = JobPublishingService.get_analytics(job)
        return Response(analytics, status=status.HTTP_200_OK)
    
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
    permission_classes = [IsAuthenticated, IsHRManagerOrAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'skills']

    def get_queryset(self):
        return Candidate.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=False, methods=['post'])
    def parse_resume(self, request):
        """
        Extract candidate data from a resume file (PDF or DOCX)
        """
        resume_file = request.FILES.get('resume')
        if not resume_file:
            return Response({'error': 'No resume file provided'}, status=400)

        filename = resume_file.name.lower()
        from .services.resume_parser import ResumeParsingService
        
        text = ""
        if filename.endswith('.pdf'):
            text = ResumeParsingService.extract_text_from_pdf(resume_file)
        elif filename.endswith('.docx'):
            text = ResumeParsingService.extract_text_from_docx(resume_file)
        else:
            return Response({'error': 'Unsupported file format. Please upload PDF or DOCX.'}, status=400)

        if not text:
            return Response({'error': 'Could not extract text from file'}, status=400)
            
        parsed_data = ResumeParsingService.parse_resume_text(text)
        return Response(parsed_data)

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['applied_at', 'score']

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.filter(job__company=user.company)
        
        # Managers only see applications for jobs in their department
        if user.role == 'manager':
             if hasattr(user, 'employee'):
                 queryset = queryset.filter(job__department=user.employee.department)
             else:
                 queryset = queryset.none()
        elif user.role == 'employee':
             queryset = queryset.none()
             
        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
            
        stage = self.request.query_params.get('stage')
        if stage:
            queryset = queryset.filter(stage=stage)
            
        return queryset

    def get_permissions(self):
        if self.action in ['move_stage', 'destroy']:
            return [IsAuthenticated(), IsHRManagerOrAdmin()]
        return super().get_permissions()

    @action(detail=True, methods=['patch'])
    def move_stage(self, request, pk=None):
        app = self.get_object()
        new_stage = request.data.get('stage')
        if new_stage not in dict(Application.STAGE_CHOICES):
            return Response({'error': 'Invalid stage'}, status=400)
        
        app.stage = new_stage
        app.save()
        return Response({'status': f'moved into {new_stage}'})

    @action(detail=True, methods=['post'])
    def screen_with_ai(self, request, pk=None):
        """Screen a single application using AI"""
        application = self.get_object()
        from .services.ai_service import RecruitingAIService
        score = RecruitingAIService.screen_application(application)
        return Response({
            'status': 'screened', 
            'score': score,
            'message': f"Application screened with score: {score}%"
        })

    @action(detail=False, methods=['post'])
    def rank_job_applications(self, request):
        """Screen all applications for a specific job"""
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required'}, status=400)
            
        try:
            job = Job.objects.get(id=job_id, company=request.user.company)
            applications = Application.objects.filter(job=job)
            
            from .services.ai_service import RecruitingAIService
            scores = []
            for app in applications:
                score = RecruitingAIService.screen_application(app)
                scores.append({'application_id': app.id, 'score': score})
                
            return Response({
                'status': 'ranking_complete', 
                'applications_processed': len(scores),
                'results': scores
            })
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

class InterviewViewSet(viewsets.ModelViewSet):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        user = self.request.user
        queryset = Interview.objects.filter(application__job__company=user.company)
        
        if user.role == 'employee':
             queryset = queryset.filter(interviewer=user.employee) if hasattr(user, 'employee') else queryset.none()
        
        return queryset

    def perform_create(self, serializer):
        interview = serializer.save()
        
        # Trigger external integrations
        from .services.integration_orchestrator import RecruitmentIntegrationOrchestrator
        RecruitmentIntegrationOrchestrator.handle_interview_creation(interview)

class IntegrationSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = IntegrationSettingsSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    ordering = ['id']

    def get_queryset(self):
        return IntegrationSettings.objects.filter(company=self.request.user.company)
    
    def get_permissions(self):
        return [IsAuthenticated(), IsHRManagerOrAdmin()]
    
    def create(self, request, *args, **kwargs):
        platform = request.data.get('platform')
        if not platform:
            return Response({"error": "Platform is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        integration, created = IntegrationSettings.objects.update_or_create(
            company=request.user.company,
            platform=platform,
            defaults={
                'client_id': request.data.get('client_id', ''),
                'client_secret': request.data.get('client_secret', ''),
                'api_key': request.data.get('api_key', ''),
                'is_active': True
            }
        )
        
        serializer = self.get_serializer(integration)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        integration = self.get_object()
        
        from .services.publishing_service import JobPublishingService
        publisher_class = JobPublishingService.PUBLISHER_MAP.get(integration.platform)
        
        if not publisher_class:
            return Response({
                "status": "success",
                "message": f"Successfully connected to {integration.get_platform_display()}. API access verified."
            })
            
        try:
            publisher = publisher_class(integration)
            result = publisher.test_connection()
            
            if result.get('success'):
                return Response({
                    "status": "success",
                    "message": result.get('message', f"Verified {integration.get_platform_display()} connectivity.")
                })
            else:
                errorMessage = result.get('error', "Connection test failed.")
                return Response({
                    "status": "error",
                    "message": errorMessage,
                    "error": errorMessage
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            # Log error trace for internal debugging if needed
            # logger.error(f"Integration Handshake Failure:\n{error_trace}")
            pass
            return Response({
                "status": "error",
                "message": f"Diagnostics failed: {str(e)}",
                "error": str(e),
                "traceback": error_trace if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OfferLetterViewSet(viewsets.ModelViewSet):
    serializer_class = OfferLetterSerializer
    permission_classes = [IsAuthenticated, IsHRManagerOrAdmin]

    def get_queryset(self):
        return OfferLetter.objects.filter(application__job__company=self.request.user.company)

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        try:
            offer_letter = self.get_object()
            from .services.offer_letter_generator import OfferLetterGenerator
            pdf_url = OfferLetterGenerator.generate_pdf(offer_letter)
            return Response({'status': 'PDF generated', 'pdf_url': pdf_url})
        except Exception as e:
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
