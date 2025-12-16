from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import ExpenseCategory, ExpenseClaim, ExpenseReimbursement
from .serializers import (
    ExpenseCategorySerializer,
    ExpenseClaimSerializer,
    ExpenseReimbursementSerializer
)


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        return ExpenseCategory.objects.filter(company=self.request.user.company)
    
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class ExpenseClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseClaimSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['created_at', 'amount', 'expense_date', 'status']
    
    def get_queryset(self):
        user = self.request.user
        queryset = ExpenseClaim.objects.filter(company=user.company)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # My claims (as employee)
        if self.request.query_params.get('my_claims'):
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(employee=user.employee)

        # Pending approvals (as manager)
        if self.request.query_params.get('pending_approvals'):
            if hasattr(user, 'employee') and user.employee:
                # Get claims from employees I manage
                queryset = queryset.filter(
                    employee__manager=user.employee,
                    status='submitted'
                )
        
        return queryset.select_related('employee', 'category', 'approved_by')
    
    def perform_create(self, serializer):
        # Auto-assign employee if user is an employee
        if hasattr(self.request.user, 'employee') and self.request.user.employee:
            serializer.save(
                company=self.request.user.company,
                employee=self.request.user.employee
            )
        else:
            serializer.save(company=self.request.user.company)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit expense claim for approval"""
        claim = self.get_object()
        
        if claim.status != 'draft':
            return Response(
                {'error': 'Only draft claims can be submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        claim.status = 'submitted'
        claim.save()
        
        return Response({
            'status': 'submitted',
            'message': 'Expense claim submitted for approval'
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve expense claim"""
        claim = self.get_object()
        
        if claim.status != 'submitted':
            return Response(
                {'error': 'Only submitted claims can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if hasattr(request.user, 'employee') and request.user.employee:
            claim.status = 'approved'
            claim.approved_by = request.user.employee
            claim.approved_at = timezone.now()
            claim.save()
            
            return Response({
                'status': 'approved',
                'message': 'Expense claim approved'
            })
        else:
            return Response(
                {'error': 'Only employees can approve claims'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject expense claim"""
        claim = self.get_object()
        
        if claim.status != 'submitted':
            return Response(
                {'error': 'Only submitted claims can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', '')
        
        if hasattr(request.user, 'employee') and request.user.employee:
            claim.status = 'rejected'
            claim.approved_by = request.user.employee
            claim.approved_at = timezone.now()
            claim.rejection_reason = reason
            claim.save()
            
            return Response({
                'status': 'rejected',
                'message': 'Expense claim rejected'
            })
        else:
            return Response(
                {'error': 'Only employees can reject claims'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=False, methods=['get'])
    def my_claims(self, request):
        """Get current user's expense claims"""
        if not hasattr(request.user, 'employee'):
            return Response(
                {'error': 'User is not an employee'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        claims = ExpenseClaim.objects.filter(
            company=request.user.company,
            employee=request.user.employee
        ).select_related('category', 'approved_by')
        
        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get expense claims pending approval for current manager"""
        if not hasattr(request.user, 'employee'):
            return Response(
                {'error': 'User is not an employee'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        claims = ExpenseClaim.objects.filter(
            company=request.user.company,
            employee__manager=request.user.employee,
            status='submitted'
        ).select_related('employee', 'category')
        
        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)


class ExpenseReimbursementViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseReimbursementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'payment_date', 'total_amount']
    
    def get_queryset(self):
        return ExpenseReimbursement.objects.filter(company=self.request.user.company)
    
    def perform_create(self, serializer):
        if hasattr(self.request.user, 'employee') and self.request.user.employee:
            serializer.save(
                company=self.request.user.company,
                created_by=self.request.user.employee
            )
        else:
            serializer.save(company=self.request.user.company)
