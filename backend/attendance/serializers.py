from rest_framework import serializers
from .models import AttendancePolicy, Attendance, OvertimeRequest, AttendanceReport, WorkLocation
from employees.models import Employee
from django.utils import timezone
from datetime import datetime, date


class AttendancePolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendancePolicy
        fields = [
            'id', 'work_start_time', 'work_end_time', 'break_duration_minutes',
            'grace_period_minutes', 'late_arrival_threshold',
            'overtime_rate_multiplier', 'overtime_auto_approve',
            'working_days', 'enable_geofencing', 'enable_qr_clock_in',
            'require_photo_clock_in', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    can_clock_out = serializers.SerializerMethodField()
    is_clocked_in = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'employee_number',
            'date', 'status', 'clock_in', 'clock_out',
            'is_late', 'late_by_minutes', 'hours_worked', 'overtime_hours',
            'notes', 'approved_by', 'can_clock_out', 'is_clocked_in',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'is_late', 'late_by_minutes', 'hours_worked',
            'overtime_hours', 'created_at', 'updated_at'
        ]
    
    def get_can_clock_out(self, obj):
        return obj.clock_in is not None and obj.clock_out is None
    
    def get_is_clocked_in(self, obj):
        return obj.clock_in is not None and obj.clock_out is None

class WorkLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkLocation
        fields = ['id', 'company', 'name', 'latitude', 'longitude', 'radius_meters', 'qr_token', 'created_at', 'updated_at']
        read_only_fields = ['id', 'company', 'qr_token', 'created_at', 'updated_at']

class ClockInSerializer(serializers.Serializer):
    """Serializer for clock-in action"""
    notes = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    qr_token = serializers.UUIDField(required=False)
    
    def validate(self, data):
        request = self.context['request']
        today = date.today()
        
        # Check if already clocked in today
        existing = Attendance.objects.filter(
            employee=request.user.employee,
            date=today,
            clock_in__isnull=False
        ).first()
        
        if existing:
            raise serializers.ValidationError("You have already clocked in today")
        
        return data


class ClockOutSerializer(serializers.Serializer):
    """Serializer for clock-out action"""
    notes = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    
    def validate(self, data):
        request = self.context['request']
        today = date.today()
        
        # Check if clocked in
        attendance = Attendance.objects.filter(
            employee=request.user.employee,
            date=today,
            clock_in__isnull=False,
            clock_out__isnull=True
        ).first()
        
        if not attendance:
            raise serializers.ValidationError("You haven't clocked in today or already clocked out")
        
        return data


class OvertimeRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    can_approve = serializers.SerializerMethodField()
    
    class Meta:
        model = OvertimeRequest
        fields = [
            'id', 'employee', 'employee_name', 'date', 'hours_requested',
            'reason', 'status', 'approved_by', 'approved_by_name',
            'approved_at', 'rejection_reason', 'can_approve',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'approved_by', 'approved_at', 'created_at', 'updated_at'
        ]
    
    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.full_name
        return None
    
    def get_can_approve(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False
        return obj.status == 'pending' and (
            request.user.role in ['admin', 'hr_manager'] or
            obj.employee.manager == request.user.employee
        )
    
    def create(self, validated_data):
        request = self.context['request']
        if 'employee' not in validated_data:
            validated_data['employee'] = request.user.employee
        return super().create(validated_data)


class AttendanceReportSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    month_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceReport
        fields = [
            'id', 'employee', 'employee_name', 'employee_number',
            'year', 'month', 'month_name',
            'total_working_days', 'days_present', 'days_absent', 'days_on_leave',
            'late_arrivals', 'total_hours_worked', 'total_overtime_hours',
            'attendance_rate', 'generated_at'
        ]
        read_only_fields = ['id', 'generated_at']
    
    def get_month_name(self, obj):
        months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        return months[obj.month - 1] if 1 <= obj.month <= 12 else str(obj.month)
