from django.contrib import admin
from .models import AttendancePolicy, Attendance, OvertimeRequest, AttendanceReport


@admin.register(AttendancePolicy)
class AttendancePolicyAdmin(admin.ModelAdmin):
    list_display = ['company', 'work_start_time', 'work_end_time', 'grace_period_minutes']
    list_filter = ['company']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'status', 'clock_in', 'clock_out', 'hours_worked', 'is_late']
    list_filter = ['status', 'date', 'is_late']
    search_fields = ['employee__first_name', 'employee__last_name']
    readonly_fields = ['hours_worked', 'overtime_hours', 'is_late', 'late_by_minutes']


@admin.register(OvertimeRequest)
class OvertimeRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'hours_requested', 'status', 'approved_by']
    list_filter = ['status', 'date']
    search_fields = ['employee__first_name', 'employee__last_name']


@admin.register(AttendanceReport)
class AttendanceReportAdmin(admin.ModelAdmin):
    list_display = ['employee', 'year', 'month', 'days_present', 'attendance_rate', 'total_hours_worked']
    list_filter = ['year', 'month']
    search_fields = ['employee__first_name', 'employee__last_name']
