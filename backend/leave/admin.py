from django.contrib import admin
from .models import LeaveType, LeaveBalance, LeaveRequest, PublicHoliday


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'company', 'days_per_year', 'is_paid', 'is_active']
    list_filter = ['company', 'is_paid', 'is_active']
    search_fields = ['name', 'code']


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'year', 'total_days', 'used_days', 'available_days']
    list_filter = ['year', 'leave_type']
    search_fields = ['employee__first_name', 'employee__last_name']


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'days_requested', 'status', 'created_at']
    list_filter = ['status', 'leave_type', 'start_date']
    search_fields = ['employee__first_name', 'employee__last_name', 'reason']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PublicHoliday)
class PublicHolidayAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'company', 'is_recurring']
    list_filter = ['company', 'is_recurring', 'date']
    search_fields = ['name']
