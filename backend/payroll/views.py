"""
Payroll API views — PRODUCTION READY MULTI-TENANT
Uses user.company (same as EmployeeViewSet) → 100% consistent
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from decimal import Decimal
from django.utils import timezone

from accounts.permissions import IsCompanyUser  # ← You already have this
from .models import SalaryStructure, PayrollRun, Payslip, SalaryAdvance
from .serializers import (
    SalaryStructureSerializer, PayrollRunSerializer,
    PayslipSerializer, PayslipDetailSerializer,
    SalaryAdvanceSerializer
)
from .utils import calculate_net_salary


# ────────────────────── SALARY ADVANCES (LOANS) ──────────────────────
class SalaryAdvanceViewSet(viewsets.ModelViewSet):
    queryset = SalaryAdvance.objects.all().select_related(
        'employee', 'employee__department', 'company', 'approved_by'
    )
    serializer_class = SalaryAdvanceSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'loan_type', 'employee']

    def get_queryset(self):
        """Only show loans for the user's company"""
        return self.queryset.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        """Auto-assign company from logged-in user"""
        employee = serializer.validated_data['employee']
        if employee.company != self.request.user.company:
            raise serializer.ValidationError("Cannot create loan for employee from another company.")
        
        serializer.save(
            company=self.request.user.company,
            created_by=self.request.user
        )

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        advance = self.get_object()
        if advance.status != 'pending':
            return Response({'error': 'Only pending loans can be approved'}, status=400)
        advance.status = 'active'
        advance.approved_by = request.user
        advance.approved_at = timezone.now()
        advance.save()
        return Response({'message': 'Loan approved'})

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        advance = self.get_object()
        if advance.status != 'pending':
            return Response({'error': 'Only pending loans can be rejected'}, status=400)
        advance.status = 'cancelled'
        advance.save()
        return Response({'message': 'Loan rejected'})


# ────────────────────── PAYROLL RUNS ──────────────────────
class PayrollRunViewSet(viewsets.ModelViewSet):
    queryset = PayrollRun.objects.all().select_related('company', 'processed_by')
    serializer_class = PayrollRunSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'month', 'year']

    def get_queryset(self):
        return self.queryset.filter(company=self.request.user.company)


# ────────────────────── PAYSLIPS ──────────────────────
class PayslipViewSet(viewsets.ModelViewSet):
    queryset = Payslip.objects.all().select_related('employee', 'payroll_run')
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_serializer_class(self):
        return PayslipDetailSerializer if self.action == 'retrieve' else PayslipSerializer

    def get_queryset(self):
        return self.queryset.filter(employee__company=self.request.user.company)


# ────────────────────── SALARY STRUCTURES ──────────────────────
class SalaryStructureViewSet(viewsets.ModelViewSet):
    queryset = SalaryStructure.objects.all().select_related('employee')
    serializer_class = SalaryStructureSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        return self.queryset.filter(employee__company=self.request.user.company)
    
    def perform_create(self, serializer):
        """Create salary structure with multi-tenant security validation"""
        from rest_framework.exceptions import ValidationError
        user = self.request.user
        employee = serializer.validated_data['employee']
        
        # Security check: Validate employee belongs to user's company
        if employee.company != user.company:
            raise ValidationError({
                'employee': 'Cannot create salary structure for employee from another company.'
            })
        
        # Auto-assign company and creator
        serializer.save(
            company=user.company,
            created_by=user
        )
    
    def perform_update(self, serializer):
        """Update salary structure with multi-tenant security validation"""
        from rest_framework.exceptions import ValidationError
        user = self.request.user
        employee = serializer.validated_data.get('employee')
        
        # Security check if employee is being changed
        if employee and employee.company != user.company:
            raise ValidationError({
                'employee': 'Cannot update salary structure with employee from another company.'
            })
        
        serializer.save()