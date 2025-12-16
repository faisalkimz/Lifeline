from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone

from .models import (
    TrainingProgram, TrainingSession, TrainingEnrollment,
    Assessment, AssessmentResult, TrainingCertificate,
    TrainingComplianceRule, TrainingNotification
)
from .serializers import *
from .services import (
    EnrollmentService, ProgressService, AssessmentService,
    CompletionService, CertificateService, NotificationService,
    ComplianceService
)
from .permissions import IsHRAdminOrManager, IsHRAdmin
from .utils import get_training_stats_for_employee


class TrainingProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Training Programs.
    
    list: Get all programs
    retrieve: Get program details
    create: Create new program (HR/Manager only)
    update: Update program (HR/Manager only)
    delete: Soft-delete program (HR only)
    
    Custom actions:
    - statistics: Get program statistics
    - sessions: Get all sessions for program
    - compliance: Check compliance requirements
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'provider', 'description']
    filterset_fields = ['category', 'is_mandatory', 'priority', 'is_active']
    ordering_fields = ['name', 'created_at', 'duration_hours']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = TrainingProgram.objects.filter(company=user.company)
        
        # Filter by active if not admin/manager
        if user.role == 'employee':
            queryset = queryset.filter(is_active=True)
        
        return queryset.select_related('created_by').prefetch_related('prerequisites', 'sessions')

    def get_serializer_class(self):
        if self.action == 'list':
            return TrainingProgramListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TrainingProgramCreateSerializer
        return TrainingProgramDetailSerializer

    def perform_create(self, serializer):
        # Generate unique code
        import uuid
        code = f"TRN-{uuid.uuid4().hex[:6].upper()}"
        
        serializer.save(
            company=self.request.user.company,
            code=code,
            created_by=self.request.user.employee if hasattr(self.request.user, 'employee') else None
        )

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsHRAdminOrManager()]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get detailed statistics for a program."""
        program = self.get_object()
        from .utils import get_training_stats_for_program
        stats = get_training_stats_for_program(program)
        return Response(stats)

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        """Get all sessions for this program."""
        program = self.get_object()
        sessions = program.sessions.all()
        
        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            sessions = sessions.filter(status=status_filter)
        
        upcoming_only = request.query_params.get('upcoming', 'false').lower() == 'true'
        if upcoming_only:
            sessions = sessions.filter(start_date__gte=timezone.now())
        
        serializer = TrainingSessionListSerializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def compliance(self, request, pk=None):
        """Check compliance requirements for this program."""
        program = self.get_object()
        rules = TrainingComplianceRule.objects.filter(program=program, is_active=True)
        serializer = TrainingComplianceRuleSerializer(rules, many=True)
        return Response(serializer.data)


class TrainingSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Training Sessions.
    
    Custom actions:
    - enrollments: Get all enrollments for session
    - enroll_bulk: Bulk enroll employees
    - send_reminders: Send reminders to enrolled employees
    - mark_attendance: Mark attendance for multiple enrollments
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['session_code', 'program__name', 'location']
    filterset_fields = ['program', 'status', 'delivery_mode']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['start_date']

    def get_queryset(self):
        user = self.request.user
        queryset = TrainingSession.objects.filter(
            program__company=user.company
        ).select_related('program', 'facilitator')
        
        # Filter upcoming sessions if requested
        upcoming = self.request.query_params.get('upcoming', 'false').lower() == 'true'
        if upcoming:
            queryset = queryset.filter(start_date__gte=timezone.now())
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return TrainingSessionListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TrainingSessionCreateSerializer
        return TrainingSessionDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsHRAdminOrManager()]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def enrollments(self, request, pk=None):
        """Get all enrollments for this session."""
        session = self.get_object()
        enrollments = session.enrollments.all()
        
        # Apply status filter
        status_filter = request.query_params.get('status')
        if status_filter:
            enrollments = enrollments.filter(status=status_filter)
        
        serializer = TrainingEnrollmentListSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsHRAdminOrManager])
    def enroll_bulk(self, request, pk=None):
        """Bulk enroll employees in this session."""
        session = self.get_object()
        employee_ids = request.data.get('employee_ids', [])
        
        if not employee_ids:
            return Response(
                {'error': 'employee_ids list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from employees.models import Employee
        employees = Employee.objects.filter(
            id__in=employee_ids,
            company=request.user.company
        )
        
        results = {'success': [], 'failed': []}
        
        for employee in employees:
            try:
                enrollment = EnrollmentService.enroll_employee(
                    session=session,
                    employee=employee,
                    enrolled_by=request.user.employee if hasattr(request.user, 'employee') else None
                )
                results['success'].append({
                    'employee_id': employee.id,
                    'employee_name': employee.full_name,
                    'enrollment_id': enrollment.id
                })
            except Exception as e:
                results['failed'].append({
                    'employee_id': employee.id,
                    'employee_name': employee.full_name,
                    'error': str(e)
                })
        
        return Response(results)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsHRAdminOrManager])
    def send_reminders(self, request, pk=None):
        """Send reminders to all enrolled employees."""
        session = self.get_object()
        enrollments = session.enrollments.filter(status__in=['registered', 'confirmed'])
        
        for enrollment in enrollments:
            NotificationService.send_session_reminder(enrollment)
        
        return Response({
            'message': f'Reminders sent to {enrollments.count()} employees'
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsHRAdminOrManager])
    def mark_attendance(self, request, pk=None):
        """Mark attendance for multiple enrollments."""
        session = self.get_object()
        attendance_data = request.data.get('attendance', [])
        # Expected format: [{'enrollment_id': 1, 'percentage': 100}, ...]
        
        results = {'success': [], 'failed': []}
        
        for item in attendance_data:
            enrollment_id = item.get('enrollment_id')
            percentage = item.get('percentage', 100)
            
            try:
                enrollment = session.enrollments.get(id=enrollment_id)
                EnrollmentService.mark_attendance(
                    enrollment=enrollment,
                    attendance_percentage=percentage
                )
                results['success'].append(enrollment_id)
            except Exception as e:
                results['failed'].append({
                    'enrollment_id': enrollment_id,
                    'error': str(e)
                })
        
        return Response(results)


class TrainingEnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Training Enrollments.
    
    Custom actions:
    - enroll: Enroll in a session
    - approve: Approve pending enrollment
    - update_progress: Update progress
    - submit_assessment: Submit assessment answers
    - complete: Mark training as completed
    - withdraw: Withdraw from training
    - submit_feedback: Submit feedback
    - my_enrollments: Get current user's enrollments
    - team_enrollments: Get team enrollments (managers)
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__full_name', 'session__program__name']
    filterset_fields = ['status', 'session__program', 'certificate_issued']
    ordering_fields = ['enrolled_at', 'completed_at']
    ordering = ['-enrolled_at']

    def get_queryset(self):
        user = self.request.user
        queryset = TrainingEnrollment.objects.filter(
            session__program__company=user.company
        ).select_related(
            'employee', 'session', 'session__program', 'enrolled_by'
        )
        
        # Filter by employee role
        if user.role == 'employee':
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(employee=user.employee)
        elif user.role == 'manager':
            # Managers can see their team's enrollments
            if hasattr(user, 'employee') and user.employee:
                from employees.models import Employee
                team_employees = Employee.objects.filter(
                    manager=user.employee
                )
                queryset = queryset.filter(
                    Q(employee=user.employee) | Q(employee__in=team_employees)
                )

        # Handle my_training filter
        if self.request.query_params.get('my_training', 'false').lower() == 'true':
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(employee=user.employee)
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return TrainingEnrollmentListSerializer
        return TrainingEnrollmentDetailSerializer

    @action(detail=False, methods=['post'])
    def enroll(self, request):
        """Enroll in a training session."""
        serializer = EnrollmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session = serializer.validated_data['session_id']
        employee = serializer.validated_data.get('employee_id')
        force = serializer.validated_data.get('force', False)
        
        # If no employee specified, use current user
        if not employee:
            if not hasattr(request.user, 'employee') or not request.user.employee:
                return Response(
                    {'error': 'User has no associated employee record'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            employee = request.user.employee
        
        # Check permissions for enrolling others
        if employee != request.user.employee:
            if request.user.role not in ['admin', 'manager']:
                return Response(
                    {'error': 'You can only enroll yourself'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        try:
            enrollment = EnrollmentService.enroll_employee(
                session=session,
                employee=employee,
                enrolled_by=request.user.employee if hasattr(request.user, 'employee') else None,
                force=force and request.user.role == 'admin'
            )
            serializer = TrainingEnrollmentDetailSerializer(enrollment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsHRAdminOrManager])
    def approve(self, request, pk=None):
        """Approve a pending enrollment."""
        enrollment = self.get_object()
        notes = request.data.get('notes', '')
        
        try:
            enrollment = EnrollmentService.approve_enrollment(
                enrollment=enrollment,
                approved_by=request.user.employee if hasattr(request.user, 'employee') else None,
                notes=notes
            )
            serializer = self.get_serializer(enrollment)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update training progress."""
        enrollment = self.get_object()
        
        # Check permissions
        if enrollment.employee != request.user.employee:
            if request.user.role not in ['admin', 'manager']:
                return Response(
                    {'error': 'You can only update your own progress'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        progress = request.data.get('progress_percentage')
        if progress is None:
            return Response(
                {'error': 'progress_percentage is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            enrollment = ProgressService.update_progress(
                enrollment=enrollment,
                progress_percentage=progress
            )
            serializer = self.get_serializer(enrollment)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def submit_assessment(self, request, pk=None):
        """Submit assessment answers."""
        enrollment = self.get_object()
        
        # Check permissions
        if enrollment.employee != request.user.employee:
            return Response(
                {'error': 'You can only submit your own assessments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AssessmentSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        assessment = serializer.validated_data['assessment_id']
        answers_data = serializer.validated_data['answers_data']
        
        try:
            result = AssessmentService.submit_assessment(
                enrollment=enrollment,
                assessment=assessment,
                answers_data=answers_data
            )
            result_serializer = AssessmentResultSerializer(result)
            return Response(result_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsHRAdminOrManager])
    def complete(self, request, pk=None):
        """Mark training as completed."""
        enrollment = self.get_object()
        
        try:
            enrollment, certificate = CompletionService.complete_training(
                enrollment=enrollment,
                completed_by=request.user.employee if hasattr(request.user, 'employee') else None
            )
            serializer = self.get_serializer(enrollment)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        """Withdraw from training."""
        enrollment = self.get_object()
        
        # Check permissions
        if enrollment.employee != request.user.employee:
            if request.user.role not in ['admin', 'manager']:
                return Response(
                    {'error': 'You can only withdraw from your own enrollments'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        reason = request.data.get('reason', '')
        
        try:
            enrollment = EnrollmentService.withdraw_enrollment(
                enrollment=enrollment,
                reason=reason
            )
            serializer = self.get_serializer(enrollment)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def submit_feedback(self, request, pk=None):
        """Submit training feedback."""
        enrollment = self.get_object()
        
        # Check permissions
        if enrollment.employee != request.user.employee:
            return Response(
                {'error': 'You can only submit feedback for your own enrollments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if enrollment.status != 'completed':
            return Response(
                {'error': 'Can only submit feedback for completed training'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment.feedback_text = request.data.get('feedback_text', '')
        enrollment.feedback_rating = request.data.get('feedback_rating')
        enrollment.feedback_submitted_at = timezone.now()
        enrollment.save()
        
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_enrollments(self, request):
        """Get current user's enrollments."""
        if not hasattr(request.user, 'employee'):
            return Response(
                {'error': 'User has no associated employee record'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollments = self.get_queryset().filter(employee=request.user.employee)
        serializer = TrainingEnrollmentListSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsHRAdminOrManager])
    def team_enrollments(self, request):
        """Get team enrollments for managers."""
        if not hasattr(request.user, 'employee'):
            return Response(
                {'error': 'User has no associated employee record'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from employees.models import Employee
        team_employees = Employee.objects.filter(manager=request.user.employee)
        enrollments = self.get_queryset().filter(employee__in=team_employees)
        
        serializer = TrainingEnrollmentListSerializer(enrollments, many=True)
        return Response(serializer.data)


class AssessmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Assessments."""
    permission_classes = [IsAuthenticated]
    serializer_class = AssessmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['program', 'assessment_type', 'is_required', 'is_active']

    def get_queryset(self):
        return Assessment.objects.filter(
            program__company=self.request.user.company
        ).select_related('program')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsHRAdmin()]
        return super().get_permissions()


class TrainingCertificateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Training Certificates (read-only).
    
    Custom actions:
    - verify: Verify certificate authenticity
    - my_certificates: Get current user's certificates
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TrainingCertificateSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = TrainingCertificate.objects.filter(
            enrollment__session__program__company=user.company
        )
        
        # Employees can only see their own certificates
        if user.role == 'employee':
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(enrollment__employee=user.employee)
        
        return queryset

    @action(detail=False, methods=['post'])
    def verify(self, request):
        """Verify certificate authenticity."""
        cert_number = request.data.get('certificate_number')
        verification_code = request.data.get('verification_code')
        
        result = CertificateService.verify_certificate(
            certificate_number=cert_number,
            verification_code=verification_code
        )
        return Response(result)

    @action(detail=False, methods=['get'])
    def my_certificates(self, request):
        """Get current user's certificates."""
        if not hasattr(request.user, 'employee'):
            return Response(
                {'error': 'User has no associated employee record'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        certificates = self.get_queryset().filter(enrollment__employee=request.user.employee)
        serializer = self.get_serializer(certificates, many=True)
        return Response(serializer.data)


class TrainingDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for training dashboard and analytics.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        """Get current user's training statistics."""
        if not hasattr(request.user, 'employee'):
            return Response(
                {'error': 'User has no associated employee record'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stats = get_training_stats_for_employee(request.user.employee)
        serializer = TrainingStatisticsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_compliance(self, request):
        """Get current user's compliance status."""
        if not hasattr(request.user, 'employee') or request.user.employee is None:
            return Response(
                {'error': 'User has no associated employee record'},
                status=status.HTTP_400_BAD_REQUEST
            )

        compliance = ComplianceService.get_employee_compliance_status(request.user.employee)
        serializer = ComplianceStatusSerializer(compliance, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsHRAdminOrManager])
    def company_report(self, request):
        """Get company-wide training report."""
        report = ComplianceService.get_company_compliance_report(request.user.company)
        return Response(report)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming training sessions."""
        from .utils import get_upcoming_sessions_for_employee
        
        if not hasattr(request.user, 'employee'):
            return Response(
                {'error': 'User has no associated employee record'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        days = int(request.query_params.get('days', 30))
        enrollments = get_upcoming_sessions_for_employee(request.user.employee, days)
        serializer = TrainingEnrollmentListSerializer(enrollments, many=True)
        return Response(serializer.data)