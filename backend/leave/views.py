from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from datetime import datetime
from .models import LeaveType, LeaveBalance, LeaveRequest, PublicHoliday
from .serializers import (
    LeaveTypeSerializer, LeaveBalanceSerializer,
    LeaveRequestSerializer, PublicHolidaySerializer
)


class LeaveTypeViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LeaveType.objects.filter(
            company=self.request.user.company,
            is_active=True
        )


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = LeaveBalance.objects.filter(
            employee__company=user.company
        ).select_related('employee', 'leave_type')
        
        # Filter by employee if specified
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        # Filter by year
        year = self.request.query_params.get('year', datetime.now().year)
        queryset = queryset.filter(year=year)
        
        return queryset.order_by('employee__first_name', 'leave_type__name')
    
    @action(detail=False, methods=['get'])
    def my_balances(self, request):
        """Get current user's leave balances"""
        if not hasattr(request.user, 'employee') or not request.user.employee:
            return Response([])
        
        balances = LeaveBalance.objects.filter(
            employee=request.user.employee,
            year=datetime.now().year
        ).select_related('leave_type')
        
        serializer = self.get_serializer(balances, many=True)
        return Response(serializer.data)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = LeaveRequest.objects.filter(
            employee__company=user.company
        ).select_related('employee', 'leave_type', 'approved_by')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by employee
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's leave requests"""
        if not hasattr(request.user, 'employee') or not request.user.employee:
            return Response([])

        requests = LeaveRequest.objects.filter(
            employee=request.user.employee
        ).select_related('leave_type', 'approved_by')
        
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get leave requests pending approval for current user"""
        user = request.user
        
        # Get requests where user is the manager or is HR
        if hasattr(user, 'employee') and user.employee:
            queryset = LeaveRequest.objects.filter(
                employee__company=user.company,
                status='pending'
            ).filter(
                Q(employee__manager=user.employee) |
                Q(employee__company=user.company, employee__department__isnull=False)
            ).select_related('employee', 'leave_type')
        else:
            queryset = LeaveRequest.objects.none()
        
        if user.role in ['admin', 'hr_manager']:
            queryset = LeaveRequest.objects.filter(
                employee__company=user.company,
                status='pending'
            ).select_related('employee', 'leave_type')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave_request = self.get_object()
        
        if leave_request.status != 'pending':
            return Response(
                {"error": "Only pending requests can be approved"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permission
        user = request.user
        if user.role not in ['admin', 'hr_manager']:
            if not hasattr(user, 'employee') or leave_request.employee.manager != user.employee:
                return Response(
                    {"error": "You don't have permission to approve this request"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Update leave balance
        try:
            balance = LeaveBalance.objects.get(
                employee=leave_request.employee,
                leave_type=leave_request.leave_type,
                year=leave_request.start_date.year
            )
            
            if balance.available_days < leave_request.days_requested:
                return Response(
                    {"error": f"Insufficient leave balance. Available: {balance.available_days} days"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update balance
            balance.used_days += leave_request.days_requested
            balance.pending_days -= leave_request.days_requested
            balance.save()
            
        except LeaveBalance.DoesNotExist:
            return Response(
                {"error": "Leave balance not found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Approve request
        leave_request.status = 'approved'
        leave_request.approved_by = user
        leave_request.approved_at = timezone.now()
        leave_request.save()
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave_request = self.get_object()
        
        if leave_request.status != 'pending':
            return Response(
                {"error": "Only pending requests can be rejected"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permission (same as approve)
        user = request.user
        if user.role not in ['admin', 'hr_manager']:
            if not hasattr(user, 'employee') or leave_request.employee.manager != user.employee:
                return Response(
                    {"error": "You don't have permission to reject this request"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Update balance (remove pending)
        try:
            balance = LeaveBalance.objects.get(
                employee=leave_request.employee,
                leave_type=leave_request.leave_type,
                year=leave_request.start_date.year
            )
            balance.pending_days -= leave_request.days_requested
            balance.save()
        except LeaveBalance.DoesNotExist:
            pass
        
        # Reject request
        leave_request.status = 'rejected'
        leave_request.rejection_reason = request.data.get('reason', '')
        leave_request.approved_by = user
        leave_request.approved_at = timezone.now()
        leave_request.save()
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel own leave request"""
        leave_request = self.get_object()
        
        # Only employee can cancel their own request
        if not hasattr(request.user, 'employee') or leave_request.employee != request.user.employee:
            return Response(
                {"error": "You can only cancel your own requests"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if leave_request.status != 'pending':
            return Response(
                {"error": "Only pending requests can be cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update balance
        try:
            balance = LeaveBalance.objects.get(
                employee=leave_request.employee,
                leave_type=leave_request.leave_type,
                year=leave_request.start_date.year
            )
            balance.pending_days -= leave_request.days_requested
            balance.save()
        except LeaveBalance.DoesNotExist:
            pass
        
        leave_request.status = 'cancelled'
        leave_request.save()
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Create leave request and update pending balance"""
        leave_request = serializer.save()
        
        # Update pending balance
        balance, created = LeaveBalance.objects.get_or_create(
            employee=leave_request.employee,
            leave_type=leave_request.leave_type,
            year=leave_request.start_date.year,
            defaults={
                'total_days': leave_request.leave_type.days_per_year,
                'used_days': 0,
                'pending_days': 0
            }
        )
        
        balance.pending_days += leave_request.days_requested
        balance.save()


class PublicHolidayViewSet(viewsets.ModelViewSet):
    serializer_class = PublicHolidaySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PublicHoliday.objects.filter(
            company=self.request.user.company
        ).order_by('date')
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming public holidays"""
        holidays = PublicHoliday.objects.filter(
            company=request.user.company,
            date__gte=timezone.now().date()
        ).order_by('date')[:10]
        
        serializer = self.get_serializer(holidays, many=True)
        return Response(serializer.data)
