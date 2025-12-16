from rest_framework import serializers
from .models import (
    TrainingProgram, TrainingSession, TrainingEnrollment,
    Assessment, AssessmentResult, TrainingCertificate,
    TrainingComplianceRule, TrainingNotification
)
from employees.serializers import EmployeeBasicSerializer


class TrainingProgramListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing programs."""
    sessions_count = serializers.IntegerField(source='sessions.count', read_only=True)
    active_sessions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingProgram
        fields = [
            'id', 'code', 'name', 'category', 'provider', 'duration_hours',
            'is_mandatory', 'priority', 'is_active', 'sessions_count', 
            'active_sessions_count', 'created_at'
        ]
        read_only_fields = ['code', 'created_at']
    
    def get_active_sessions_count(self, obj):
        return obj.sessions.filter(status__in=['scheduled', 'open_enrollment']).count()


class TrainingProgramDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for program details."""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    prerequisites_data = serializers.SerializerMethodField()
    upcoming_sessions = serializers.SerializerMethodField()
    statistics = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingProgram
        fields = '__all__'
        read_only_fields = ['company', 'code', 'created_by', 'created_at', 'updated_at']
    
    def get_prerequisites_data(self, obj):
        return TrainingProgramListSerializer(obj.prerequisites.all(), many=True).data
    
    def get_upcoming_sessions(self, obj):
        from django.utils import timezone
        sessions = obj.sessions.filter(
            status__in=['scheduled', 'open_enrollment'],
            start_date__gte=timezone.now()
        ).order_by('start_date')[:5]
        return TrainingSessionListSerializer(sessions, many=True).data
    
    def get_statistics(self, obj):
        from .utils import get_training_stats_for_program
        return get_training_stats_for_program(obj)


class TrainingProgramCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating programs."""
    
    class Meta:
        model = TrainingProgram
        fields = [
            'name', 'description', 'objectives', 'category', 'provider',
            'is_mandatory', 'target_departments', 'target_roles', 
            'prerequisites', 'duration_hours', 'estimated_effort_hours',
            'validity_period_months', 'materials_url', 'external_platform_url',
            'priority', 'is_active'
        ]
    
    def validate_duration_hours(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be positive")
        return value
    
    def validate(self, data):
        # Ensure end date is after start for estimated effort
        if data.get('estimated_effort_hours') and data.get('duration_hours'):
            if data['estimated_effort_hours'] < data['duration_hours']:
                raise serializers.ValidationError({
                    'estimated_effort_hours': 'Estimated effort cannot be less than duration'
                })
        return data


class TrainingSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing sessions."""
    program_name = serializers.CharField(source='program.name', read_only=True)
    program_code = serializers.CharField(source='program.code', read_only=True)
    facilitator_name = serializers.CharField(source='facilitator.full_name', read_only=True)
    enrolled_count = serializers.IntegerField(source='enrollments.count', read_only=True)
    available_slots = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    enrollment_open = serializers.ReadOnlyField()
    
    class Meta:
        model = TrainingSession
        fields = [
            'id', 'session_code', 'program', 'program_name', 'program_code',
            'title_override', 'start_date', 'end_date', 'delivery_mode',
            'location', 'facilitator', 'facilitator_name', 'status',
            'max_participants', 'enrolled_count', 'available_slots',
            'is_full', 'enrollment_open', 'registration_deadline'
        ]


class TrainingSessionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for session details."""
    program_data = TrainingProgramListSerializer(source='program', read_only=True)
    facilitator_data = EmployeeBasicSerializer(source='facilitator', read_only=True)
    enrolled_count = serializers.IntegerField(source='enrollments.count', read_only=True)
    available_slots = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    enrollment_open = serializers.ReadOnlyField()
    enrollments_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingSession
        fields = '__all__'
        read_only_fields = ['session_code', 'created_at', 'updated_at']
    
    def get_enrollments_summary(self, obj):
        from django.db.models import Count
        return obj.enrollments.values('status').annotate(count=Count('id'))


class TrainingSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating sessions."""
    
    class Meta:
        model = TrainingSession
        fields = [
            'program', 'title_override', 'start_date', 'end_date',
            'registration_deadline', 'delivery_mode', 'location',
            'facilitator', 'external_facilitator', 'min_participants',
            'max_participants', 'allow_waitlist', 'status',
            'session_materials_url', 'meeting_link'
        ]
    
    def validate(self, data):
        from .utils import validate_session_dates
        
        errors = validate_session_dates(data['start_date'], data['end_date'])
        if errors:
            raise serializers.ValidationError({'dates': errors})
        
        if data.get('registration_deadline'):
            if data['registration_deadline'] >= data['start_date']:
                raise serializers.ValidationError({
                    'registration_deadline': 'Must be before session start date'
                })
        
        if data['min_participants'] > data['max_participants']:
            raise serializers.ValidationError({
                'min_participants': 'Cannot exceed maximum participants'
            })
        
        return data
    
    def create(self, validated_data):
        from .utils import generate_session_code
        
        # Generate session code
        session_code = generate_session_code(
            validated_data['program'],
            validated_data['start_date']
        )
        validated_data['session_code'] = session_code
        
        return super().create(validated_data)


class TrainingEnrollmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing enrollments."""
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_department = serializers.CharField(source='employee.department', read_only=True)
    program_name = serializers.CharField(source='session.program.name', read_only=True)
    session_date = serializers.DateTimeField(source='session.start_date', read_only=True)
    session_code = serializers.CharField(source='session.session_code', read_only=True)
    is_completed = serializers.ReadOnlyField()
    passed_assessment = serializers.ReadOnlyField()
    
    class Meta:
        model = TrainingEnrollment
        fields = [
            'id', 'employee', 'employee_name', 'employee_department',
            'session', 'session_code', 'program_name', 'session_date',
            'enrolled_at', 'status', 'progress_percentage', 'attendance_percentage',
            'assessment_score', 'is_completed', 'passed_assessment',
            'certificate_issued', 'certificate_number'
        ]


class TrainingEnrollmentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for enrollment details."""
    employee_data = EmployeeBasicSerializer(source='employee', read_only=True)
    session_data = TrainingSessionListSerializer(source='session', read_only=True)
    program_data = TrainingProgramListSerializer(source='session.program', read_only=True)
    enrolled_by_name = serializers.CharField(source='enrolled_by.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    is_completed = serializers.ReadOnlyField()
    passed_assessment = serializers.ReadOnlyField()
    completion_eligibility = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingEnrollment
        fields = '__all__'
        read_only_fields = [
            'enrolled_at', 'enrolled_by', 'approved_by', 'approved_at',
            'certificate_issued', 'certificate_number', 'certificate_issued_at',
            'updated_at'
        ]
    
    def get_completion_eligibility(self, obj):
        from .services import CompletionService
        return CompletionService.check_completion_eligibility(obj)


class EnrollmentCreateSerializer(serializers.Serializer):
    """Serializer for enrollment creation (action-based)."""
    session_id = serializers.IntegerField()
    employee_id = serializers.IntegerField(required=False)
    force = serializers.BooleanField(default=False)
    
    def validate_session_id(self, value):
        try:
            session = TrainingSession.objects.get(id=value)
            return session
        except TrainingSession.DoesNotExist:
            raise serializers.ValidationError("Session not found")
    
    def validate_employee_id(self, value):
        if value:
            from employees.models import Employee
            try:
                employee = Employee.objects.get(id=value)
                return employee
            except Employee.DoesNotExist:
                raise serializers.ValidationError("Employee not found")
        return None


class AssessmentSerializer(serializers.ModelSerializer):
    """Serializer for assessments."""
    program_name = serializers.CharField(source='program.name', read_only=True)
    
    class Meta:
        model = Assessment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_passing_score(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Passing score must be between 0 and 100")
        return value


class AssessmentResultSerializer(serializers.ModelSerializer):
    """Serializer for assessment results."""
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    employee_name = serializers.CharField(source='enrollment.employee.full_name', read_only=True)
    graded_by_name = serializers.CharField(source='graded_by.full_name', read_only=True)
    
    class Meta:
        model = AssessmentResult
        fields = '__all__'
        read_only_fields = ['started_at', 'completed_at', 'graded_by', 'graded_at']


class AssessmentSubmissionSerializer(serializers.Serializer):
    """Serializer for submitting assessment answers."""
    assessment_id = serializers.IntegerField()
    answers_data = serializers.JSONField()
    
    def validate_assessment_id(self, value):
        try:
            assessment = Assessment.objects.get(id=value)
            return assessment
        except Assessment.DoesNotExist:
            raise serializers.ValidationError("Assessment not found")


class TrainingCertificateSerializer(serializers.ModelSerializer):
    """Serializer for certificates."""
    employee_name = serializers.CharField(read_only=True)
    program_name = serializers.CharField(read_only=True)
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingCertificate
        fields = [
            'id', 'certificate_number', 'issued_at', 'expires_at',
            'employee_name', 'program_name', 'completion_date',
            'certificate_file_url', 'verification_code', 'is_revoked',
            'is_expired'
        ]
        read_only_fields = ['certificate_number', 'issued_at', 'verification_code']
    
    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.expires_at and obj.expires_at < timezone.now().date()


class TrainingComplianceRuleSerializer(serializers.ModelSerializer):
    """Serializer for compliance rules."""
    program_name = serializers.CharField(source='program.name', read_only=True)
    
    class Meta:
        model = TrainingComplianceRule
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at']


class TrainingNotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    
    class Meta:
        model = TrainingNotification
        fields = '__all__'
        read_only_fields = ['sent_at']


class TrainingStatisticsSerializer(serializers.Serializer):
    """Serializer for training statistics."""
    total_enrolled = serializers.IntegerField()
    completed = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    pending = serializers.IntegerField()
    total_hours = serializers.FloatField()
    certificates_earned = serializers.IntegerField()
    average_score = serializers.FloatField()
    compliance_rate = serializers.FloatField()


class ComplianceStatusSerializer(serializers.Serializer):
    """Serializer for employee compliance status."""
    program = TrainingProgramListSerializer()
    status = serializers.CharField()
    last_completed = serializers.DateTimeField(allow_null=True)
    due_date = serializers.DateField(allow_null=True)
    days_overdue = serializers.IntegerField()
    is_compliant = serializers.BooleanField()