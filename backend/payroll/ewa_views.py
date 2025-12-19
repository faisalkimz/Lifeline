"""
Early Wage Access (EWA) API views and endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from decimal import Decimal

from .ewa_models import EarlyWageAccessConfig, WageAccessRequest
from .ewa_serializers import (
    EarlyWageAccessConfigSerializer,
    WageAccessRequestSerializer,
    EmployeeEWAEligibilitySerializer
)


class EarlyWageAccessConfigViewSet(viewsets.ModelViewSet):
    """ViewSet for managing EWA configuration"""
    
    serializer_class = EarlyWageAccessConfigSerializer
    permission_classes = [IsAuthenticated]  # Simplified - add HR check in get_queryset
    
    def get_queryset(self):
        user = self.request.user
        return EarlyWageAccessConfig.objects.filter(company=user.company)
    
    def perform_create(self, serializer):
        serializer.save(
            company=self.request.user.company,
            updated_by=self.request.user
        )
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class WageAccessRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for EWA requests"""
    
    serializer_class = WageAccessRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        qs = WageAccessRequest.objects.filter(company=user.company)
        
        # Employees see only their own requests
        if not (user.is_hr or user.is_manager or user.is_superuser):
            qs = qs.filter(employee__email=user.email)
        
        return qs.select_related('employee', 'salary_advance', 'company')
    
    def perform_create(self, serializer):
        """Create EWA request"""
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def check_eligibility(self, request):
        """Check if current user is eligible for EWA"""
        user = request.user
        
        try:
            # Get employee record
            from employees.models import Employee
            employee = Employee.objects.get(email=user.email, company=user.company)
            
            # Get EWA config
            config = user.company.ewa_config
            
            # Create temporary request to check eligibility
            temp_request = WageAccessRequest(
                company=user.company,
                employee=employee,
                request_type='ewa'
            )
            
            # Calculate earned amount
            earned_to_date = temp_request.calculate_earned_to_date()
            
            # Check eligibility
            is_eligible = temp_request.check_eligibility()
            
            # Calculate max allowed
            salary_structure = employee.salary_structure
            max_by_percentage = (salary_structure.gross_salary * config.max_percentage_of_salary) / 100 if salary_structure else 0
            
            if config.max_fixed_amount:
                max_allowed = min(max_by_percentage, config.max_fixed_amount)
            else:
                max_allowed = max_by_percentage
            
            max_allowed = min(max_allowed, earned_to_date)
            
            # Count requests this month
            requests_this_month = WageAccessRequest.objects.filter(
                employee=employee,
                request_type='ewa',
created_at__month=timezone.now().month,
                created_at__year=timezone.now().year
            ).count()
            
            serializer = EmployeeEWAEligibilitySerializer(data={
                'is_eligible': is_eligible,
                'eligibility_notes': temp_request.eligibility_notes,
                'earned_to_date': earned_to_date,
                'max_allowed_amount': max_allowed,
                'days_worked': temp_request.days_worked,
                'working_days_in_month': temp_request.working_days_in_month,
                'requests_this_month': requests_this_month,
                'max_requests_allowed': config.max_requests_per_month
            })
            serializer.is_valid()
            
            return Response(serializer.data)
            
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employee record not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve EWA request (HR only)"""
        if not (request.user.is_hr or request.user.is_superuser):
            return Response(
                {'error': 'Only HR can approve EWA requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        ewa_request = self.get_object()
        salary_advance = ewa_request.salary_advance
        
        if salary_advance.status != 'pending':
            return Response(
                {'error': 'Request already processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Approve
        salary_advance.status = 'approved'
        salary_advance.approved_by = request.user
        salary_advance.approved_at = timezone.now()
        salary_advance.save()
        
        ewa_request.save()
        
        return Response({
            'message': 'EWA request approved',
            'status': salary_advance.status
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject EWA request (HR only)"""
        if not (request.user.is_hr or request.user.is_superuser):
            return Response(
                {'error': 'Only HR can reject EWA requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        ewa_request = self.get_object()
        salary_advance = ewa_request.salary_advance
        
        if salary_advance.status != 'pending':
            return Response(
                {'error': 'Request already processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reject
        salary_advance.status = 'cancelled'
        salary_advance.save()
        
        return Response({
            'message': 'EWA request rejected',
            'status': salary_advance.status
        })
    
    @action(detail=True, methods=['post'])
    def disburse(self, request, pk=None):
        """Mark EWA as disbursed (HR only)"""
        if not (request.user.is_hr or request.user.is_superuser):
            return Response(
                {'error': 'Only HR can mark disbursement'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        ewa_request = self.get_object()
        
        if ewa_request.disbursed:
            return Response(
                {'error': 'Already disbursed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ewa_request.disbursed = True
        ewa_request.disbursed_at = timezone.now()
        ewa_request.salary_advance.status = 'active'
        ewa_request.salary_advance.save()
        ewa_request.save()
        
        return Response({
            'message': 'EWA marked as disbursed',
            'disbursed_at': ewa_request.disbursed_at
        })
