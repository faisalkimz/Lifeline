from rest_framework import serializers
from .models import LeaveType, LeaveBalance, LeaveRequest, PublicHoliday
from employees.models import Employee
from datetime import datetime, timedelta

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = [
            'id', 'name', 'code', 'days_per_year', 'requires_document',
            'max_consecutive_days', 'is_paid', 'is_active', 'description', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)


class LeaveBalanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    available_days = serializers.DecimalField(max_digits=5, decimal_places=1, read_only=True)
    
    class Meta:
        model = LeaveBalance
        fields = [
            'id', 'employee', 'employee_name', 'leave_type', 'leave_type_name',
            'year', 'total_days', 'used_days', 'pending_days', 'available_days',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'used_days', 'pending_days', 'created_at', 'updated_at']


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    can_approve = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    
    # Explicitly read_only to ensure validation passes (calculated by backend)
    days_requested = serializers.DecimalField(max_digits=5, decimal_places=1, read_only=True)
    status = serializers.CharField(read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'employee_number',
            'leave_type', 'leave_type_name', 'start_date', 'end_date',
            'days_requested', 'reason', 'status', 'document',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'can_approve', 'can_cancel', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'approved_by', 'approved_at', 'created_at', 'updated_at',
            'employee'  # Read-only because it's populated from request.user
        ]
        
    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return f"{obj.approved_by.first_name} {obj.approved_by.last_name}"
        return None
    
    def get_can_approve(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False
        # Manager or HR can approve
        return obj.status == 'pending' and (
            request.user.role in ['admin', 'hr_manager'] or
            obj.employee.manager == request.user.employee
        )
    
    def get_can_cancel(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False
        # Employee can cancel their own pending requests
        return (obj.status == 'pending' and 
                obj.employee == request.user.employee)
    
    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date must be after start date")
        
        # Calculate working days (excluding weekends)
        if start_date and end_date:
            days = 0
            current_date = start_date
            while current_date <= end_date:
                if current_date.weekday() < 5:  # Monday=0, Friday=4
                    days += 1
                current_date += timedelta(days=1)
            data['days_requested'] = days
        
        return data
    
    def create(self, validated_data):
        request = self.context['request']
        validated_data['applied_by'] = request.user
        
        # If creating for self, use current user's employee
        if 'employee' not in validated_data:
            if hasattr(request.user, 'employee') and request.user.employee:
                validated_data['employee'] = request.user.employee
            else:
                 raise serializers.ValidationError({"employee": "Current user is not linked to an employee record."})
        
        return super().create(validated_data)


class PublicHolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicHoliday
        fields = ['id', 'name', 'date', 'is_recurring']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)
