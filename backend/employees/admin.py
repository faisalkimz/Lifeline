"""
Django Admin configuration for employees app.
"""
from django.contrib import admin
from .models import Department, Employee


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin interface for Department model"""
    list_display = ['name', 'code', 'company', 'manager', 'employee_count', 'is_active']
    list_filter = ['company', 'is_active']
    search_fields = ['name', 'code']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'name', 'code', 'description')
        }),
        ('Management', {
            'fields': ('manager',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def employee_count(self, obj):
        return obj.employee_count
    employee_count.short_description = 'Employees'


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """Admin interface for Employee model"""
    list_display = [
        'employee_number', 'full_name', 'company', 'department', 
        'job_title', 'employment_status', 'join_date'
    ]
    list_filter = ['company', 'department', 'employment_status', 'employment_type', 'gender']
    search_fields = ['employee_number', 'first_name', 'last_name', 'email', 'national_id']
    
    fieldsets = (
        ('Company & Employee Number', {
            'fields': ('company', 'employee_number')
        }),
        ('Personal Information', {
            'fields': (
                'first_name', 'middle_name', 'last_name', 
                'date_of_birth', 'gender', 'photo'
            )
        }),
        ('National ID & Documents', {
            'fields': ('national_id', 'passport_number', 'tin_number', 'nssf_number')
        }),
        ('Contact Information', {
            'fields': (
                'email', 'personal_email', 'phone',
                'address', 'city', 'district'
            )
        }),
        ('Employment Details', {
            'fields': (
                'department', 'job_title', 'manager',
                'employment_type', 'employment_status'
            )
        }),
        ('Important Dates', {
            'fields': (
                'join_date', 'probation_end_date', 'confirmation_date',
                'resignation_date', 'last_working_date'
            )
        }),
        ('Bank Details', {
            'fields': (
                'bank_name', 'bank_account_number', 'bank_branch',
                'mobile_money_number'
            )
        }),
        ('Emergency Contact', {
            'fields': (
                'emergency_contact_name', 'emergency_contact_phone',
                'emergency_contact_relationship'
            )
        }),
        ('Family Information', {
            'fields': ('marital_status', 'number_of_dependents')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )
    
    readonly_fields = []
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'
