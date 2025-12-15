"""
Custom permissions for payroll app.
"""
from rest_framework import permissions


class IsCompanyAdminOrHR(permissions.BasePermission):
    """
    Custom permission to only allow company admins or HR managers
    to access payroll data.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow superusers
        if request.user.is_superuser:
            return True

        # Allow company admins and HR managers
        return request.user.role in ['admin', 'hr_manager']


class IsEmployeeOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow employees to view their own payroll data
    and admins to view all data.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow superusers
        if request.user.is_superuser:
            return True

        # Allow company admins and HR managers
        if request.user.role in ['admin', 'hr_manager']:
            return True

        # Allow employees to view their own data
        if hasattr(obj, 'employee'):
            return obj.employee.user == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user

        return False





