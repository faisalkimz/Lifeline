"""
Custom permissions for multi-tenant access control.
Ensures users can only access data from their own company.
"""
from rest_framework import permissions


class IsCompanyUser(permissions.BasePermission):
    """
    Permission to only allow users to access their own company's data.
    Critical for multi-tenant security!
    """
    message = "You do not have permission to access this company's data."
    
    def has_permission(self, request, view):
        """Check if user is authenticated"""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Check if object belongs to user's company"""
        # Super admins can access everything
        if request.user.role == 'super_admin':
            return True
        
        # Check if object has company attribute
        if hasattr(obj, 'company'):
            return obj.company == request.user.company
        
        # For User objects, check directly
        if obj.__class__.__name__ == 'User':
            return obj.company == request.user.company
        
        # For Company objects, check if it's the user's company
        if obj.__class__.__name__ == 'Company':
            return obj == request.user.company
        
        return False


class IsCompanyAdmin(permissions.BasePermission):
    """
    Permission for company admin or super admin only.
    """
    message = "Only company administrators can perform this action."
    
    def has_permission(self, request, view):
        """Check if user is company admin or super admin"""
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['company_admin', 'super_admin']
        )


class IsHRManagerOrAdmin(permissions.BasePermission):
    """
    Permission for HR managers, company admins, or super admins.
    """
    message = "Only HR managers or administrators can perform this action."
    
    def has_permission(self, request, view):
        """Check if user is HR manager or above"""
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['hr_manager', 'company_admin', 'super_admin']
        )


class IsManagerOrAdmin(permissions.BasePermission):
    """
    Permission for managers, HR managers, company admins, or super admins.
    """
    message = "Only managers or administrators can perform this action."
    
    def has_permission(self, request, view):
        """Check if user is manager or above"""
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['manager', 'hr_manager', 'company_admin', 'super_admin']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to only allow owners of an object or admins to edit it.
    """
    message = "You can only edit your own profile."
    
    def has_object_permission(self, request, view, obj):
        """Check if user is the object owner or admin"""
        # Super admins and company admins can edit anything
        if request.user.role in ['super_admin', 'company_admin']:
            return True
        
        # For User objects, check if it's the user's own profile
        if obj.__class__.__name__ == 'User':
            return obj == request.user
        
        # For Employee objects, check if it's the user's employee record
        if obj.__class__.__name__ == 'Employee' and hasattr(request.user, 'employee'):
            return obj == request.user.employee
        
        return False


class ReadOnly(permissions.BasePermission):
    """
    Permission to only allow read operations (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        """Allow only safe methods"""
        return request.method in permissions.SAFE_METHODS
