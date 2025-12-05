"""
Django Admin configuration for accounts app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Company, User


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin interface for Company model"""
    list_display = ['name', 'country', 'currency', 'subscription_tier', 'employee_count', 'is_active', 'created_at']
    list_filter = ['country', 'subscription_tier', 'is_active']
    search_fields = ['name', 'email', 'tax_id']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'logo')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'address', 'city', 'country')
        }),
        ('Registration & Tax', {
            'fields': ('tax_id', 'registration_number', 'currency')
        }),
        ('Subscription', {
            'fields': ('subscription_tier', 'subscription_start', 'subscription_expires', 'max_employees')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = []
    
    def employee_count(self, obj):
        return obj.employee_count
    employee_count.short_description = 'Employees'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for custom User model"""
    list_display = ['username', 'email', 'first_name', 'last_name', 'company', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'is_staff', 'company']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'photo')
        }),
        ('Company & Role', {
            'fields': ('company', 'role', 'employee')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'company', 'role'),
        }),
    )
