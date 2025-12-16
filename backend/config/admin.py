from django.contrib import admin
from django.utils.html import format_html
from .models import (
    TrainingProgram, TrainingSession, TrainingEnrollment,
    Assessment, AssessmentResult, TrainingCertificate,
    TrainingComplianceRule, TrainingNotification
)


@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'name', 'category', 'provider', 'is_mandatory',
        'priority', 'duration_hours', 'is_active', 'created_at'
    ]
    list_filter = ['category', 'is_mandatory', 'priority', 'is_active', 'created_at']
    search_fields = ['code', 'name', 'provider', 'description']
    readonly_fields = ['code', 'created_at', 'updated_at']
    filter_horizontal = ['prerequisites']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'description', 'objectives', 'company', 'created_by')
        }),
        ('Classification', {
            'fields': ('category', 'provider', 'priority')
        }),
        ('Requirements', {
            'fields': (
                'is_mandatory', 'target_departments', 'target_roles',
                'prerequisites', 'validity_period_months'
            )
        }),
        ('Duration', {
            'fields': ('duration_hours', 'estimated_effort_hours')
        }),
        ('Resources', {
            'fields': ('materials_url', 'external_platform_url')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('company', 'created_by')


@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = [
        'session_code', 'program', 'start_date', 'status',
        'delivery_mode', 'enrolled_count', 'available_slots_display', 'created_at'
    ]
    list_filter = ['status', 'delivery_mode', 'start_date', 'created_at']
    search_fields = ['session_code', 'program__name', 'location']
    readonly_fields = ['session_code', 'available_slots', 'is_full', 'created_at', 'updated_at']
    autocomplete_fields = ['program', 'facilitator']
    
    fieldsets = (
        ('Session Information', {
            'fields': ('session_code', 'program', 'title_override', 'status')
        }),
        ('Schedule', {
            'fields': (
                'start_date', 'end_date', 'registration_deadline'
            )
        }),
        ('Delivery', {
            'fields': (
                'delivery_mode', 'location', 'facilitator',
                'external_facilitator', 'meeting_link'
            )
        }),
        ('Capacity', {
            'fields': (
                'min_participants', 'max_participants',
                'allow_waitlist', 'available_slots', 'is_full'
            )
        }),
        ('Resources', {
            'fields': ('session_materials_url',)
        }),
        ('Status', {
            'fields': (
                'cancellation_reason', 'reminder_sent',
                'completion_processed', 'created_at', 'updated_at'
            )
        }),
    )
    
    def enrolled_count(self, obj):
        return obj.enrollments.count()
    enrolled_count.short_description = 'Enrolled'
    
    def available_slots_display(self, obj):
        slots = obj.available_slots
        if slots == 0:
            return format_html('<span style="color: red;">Full</span>')
        elif slots <= 5:
            return format_html('<span style="color: orange;">{}</span>', slots)
        return str(slots)
    available_slots_display.short_description = 'Available Slots'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('program', 'facilitator')


@admin.register(TrainingEnrollment)
class TrainingEnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'session', 'status', 'progress_percentage',
        'attendance_percentage', 'assessment_score', 'certificate_issued',
        'enrolled_at'
    ]
    list_filter = [
        'status', 'requires_approval', 'attendance_marked',
        'certificate_issued', 'enrolled_at'
    ]
    search_fields = [
        'employee__full_name', 'session__session_code',
        'session__program__name', 'certificate_number'
    ]
    readonly_fields = [
        'enrolled_at', 'updated_at', 'is_completed',
        'passed_assessment', 'certificate_issued_at'
    ]
    autocomplete_fields = ['session', 'employee', 'enrolled_by', 'approved_by']
    
    fieldsets = (
        ('Enrollment Information', {
            'fields': (
                'session', 'employee', 'enrolled_by',
                'enrolled_at', 'status'
            )
        }),
        ('Approval', {
            'fields': (
                'requires_approval', 'approved_by', 'approved_at',
                'approval_notes'
            )
        }),
        ('Attendance', {
            'fields': (
                'attendance_marked', 'attendance_date',
                'attendance_percentage'
            )
        }),
        ('Progress', {
            'fields': (
                'progress_percentage', 'started_at', 'completed_at',
                'is_completed'
            )
        }),
        ('Assessment', {
            'fields': (
                'assessment_score', 'passing_score_required',
                'assessment_attempts', 'passed_assessment'
            )
        }),
        ('Certificate', {
            'fields': (
                'certificate_issued', 'certificate_number',
                'certificate_issued_at', 'certificate_expires_at'
            )
        }),
        ('Feedback', {
            'fields': (
                'feedback_text', 'feedback_rating',
                'feedback_submitted_at'
            )
        }),
        ('Cancellation', {
            'fields': ('cancelled_at', 'cancellation_reason')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'employee', 'session', 'session__program', 'enrolled_by'
        )


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'program', 'assessment_type', 'is_required',
        'passing_score', 'max_attempts', 'is_active'
    ]
    list_filter = ['assessment_type', 'is_required', 'is_active']
    search_fields = ['title', 'program__name']
    autocomplete_fields = ['program']
    
    fieldsets = (
        ('Assessment Information', {
            'fields': ('program', 'title', 'description', 'assessment_type')
        }),
        ('Configuration', {
            'fields': (
                'is_required', 'passing_score', 'max_attempts',
                'time_limit_minutes'
            )
        }),
        ('Content', {
            'fields': ('total_questions', 'questions_data')
        }),
        ('Availability', {
            'fields': ('is_active', 'available_from', 'available_until')
        }),
    )


@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = [
        'enrollment', 'assessment', 'attempt_number',
        'score', 'passed', 'started_at', 'completed_at'
    ]
    list_filter = ['passed', 'started_at']
    search_fields = [
        'enrollment__employee__full_name',
        'assessment__title'
    ]
    readonly_fields = ['started_at', 'completed_at']
    autocomplete_fields = ['assessment', 'enrollment', 'graded_by']
    
    fieldsets = (
        ('Result Information', {
            'fields': (
                'assessment', 'enrollment', 'attempt_number',
                'started_at', 'completed_at'
            )
        }),
        ('Score', {
            'fields': ('score', 'passed')
        }),
        ('Answers', {
            'fields': ('answers_data',)
        }),
        ('Grading', {
            'fields': ('graded_by', 'graded_at', 'grading_notes')
        }),
    )


@admin.register(TrainingCertificate)
class TrainingCertificateAdmin(admin.ModelAdmin):
    list_display = [
        'certificate_number', 'employee_name', 'program_name',
        'issued_at', 'expires_at', 'is_revoked'
    ]
    list_filter = ['issued_at', 'is_revoked']
    search_fields = [
        'certificate_number', 'employee_name', 'program_name',
        'verification_code'
    ]
    readonly_fields = [
        'certificate_number', 'issued_at', 'verification_code'
    ]
    
    fieldsets = (
        ('Certificate Information', {
            'fields': (
                'enrollment', 'certificate_number', 'verification_code',
                'issued_at', 'expires_at'
            )
        }),
        ('Details', {
            'fields': (
                'employee_name', 'program_name', 'completion_date'
            )
        }),
        ('Storage', {
            'fields': ('certificate_file_url', 'certificate_file_path')
        }),
        ('Revocation', {
            'fields': (
                'is_revoked', 'revoked_at', 'revocation_reason'
            )
        }),
    )


@admin.register(TrainingComplianceRule)
class TrainingComplianceRuleAdmin(admin.ModelAdmin):
    list_display = [
        'program', 'company', 'required_by_date',
        'recurrence_months', 'is_active'
    ]
    list_filter = ['is_active', 'applies_to_all', 'created_at']
    search_fields = ['program__name']
    autocomplete_fields = ['company', 'program']
    
    fieldsets = (
        ('Rule Information', {
            'fields': ('company', 'program')
        }),
        ('Target', {
            'fields': (
                'applies_to_all', 'applies_to_departments',
                'applies_to_roles'
            )
        }),
        ('Requirements', {
            'fields': (
                'required_by_date', 'recurrence_months',
                'grace_period_days'
            )
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(TrainingNotification)
class TrainingNotificationAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'notification_type', 'subject',
        'sent_at', 'is_read'
    ]
    list_filter = ['notification_type', 'sent_via', 'is_read', 'sent_at']
    search_fields = ['employee__full_name', 'subject']
    readonly_fields = ['sent_at', 'read_at']
    autocomplete_fields = ['employee', 'enrollment']
    
    fieldsets = (
        ('Notification', {
            'fields': (
                'employee', 'enrollment', 'notification_type',
                'subject', 'message'
            )
        }),
        ('Delivery', {
            'fields': ('sent_via', 'sent_at')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
    )