from rest_framework import permissions


class IsHRAdmin(permissions.BasePermission):
    """
    Permission class for HR Admin only actions.
    """
    message = "Only HR administrators can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsHRAdminOrManager(permissions.BasePermission):
    """
    Permission class for HR Admin or Manager actions.
    """
    message = "Only HR administrators or managers can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'manager', 'super_admin']


class IsOwnerOrManager(permissions.BasePermission):
    """
    Permission class that allows owners or managers to access object.
    """
    message = "You can only access your own records or your team's records."

    def has_object_permission(self, request, view, obj):
        # Admins can access everything
        if request.user.role == 'admin':
            return True
        
        # Check if object has an employee attribute
        if hasattr(obj, 'employee'):
            # Employee can access their own
            if hasattr(request.user, 'employee') and obj.employee == request.user.employee:
                return True
            
            # Manager can access their team's
            if request.user.role == 'manager' and hasattr(request.user, 'employee'):
                if obj.employee.manager == request.user.employee:
                    return True
        
        return False


class CanManageTraining(permissions.BasePermission):
    """
    Permission for training management operations.
    """
    message = "You don't have permission to manage training programs."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions for admin and manager
        return request.user.role in ['admin', 'manager']