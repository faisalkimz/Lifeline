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
    
    def perform_create(self, serializer):
        """Auto-assign company from logged-in user"""
        serializer.save(
            company=self.request.user.company,
            processed_by=self.request.user
        )

    @action(detail=True, methods=['post'])
    def process_payroll(self, request, pk=None):
        """
        Process payroll for the given run:
        1. Calculate salary, tax, and NSSF for all employees
        2. Generate payslips
        3. Update payroll run totals
        """
        payroll_run = self.get_object()
        
        if payroll_run.status not in ['draft', 'processing']:
            return Response(
                {'error': 'Can only process payroll in Draft or Processing status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Clear existing payslips if reprocessing
        payroll_run.payslips.all().delete()
        
        employees = payroll_run.company.employees.filter(is_active=True)
        
        total_gross = Decimal('0.00')
        total_paye = Decimal('0.00')
        total_nssf_employee = Decimal('0.00')
        total_nssf_employer = Decimal('0.00')
        total_net = Decimal('0.00')
        total_deductions = Decimal('0.00')
        
        processed_count = 0
        
        for employee in employees:
            if not hasattr(employee, 'salary_structure'):
                continue
                
            structure = employee.salary_structure
            gross = structure.gross_salary
            
            # Calculate net salary and deductions
            # TODO: Integrate valid salary advances/loans here in future
            calculations = calculate_net_salary(gross)
            
            # Create Payslip
            Payslip.objects.create(
                payroll_run=payroll_run,
                employee=employee,
                basic_salary=structure.basic_salary,
                housing_allowance=structure.housing_allowance,
                transport_allowance=structure.transport_allowance,
                medical_allowance=structure.medical_allowance,
                lunch_allowance=structure.lunch_allowance,
                other_allowances=structure.other_allowances,
                gross_salary=gross,
                paye_tax=calculations['paye_tax'],
                nssf_employee=calculations['nssf_employee'],
                nssf_employer=calculations['nssf_employer'],
                total_deductions=calculations['total_deductions'],
                net_salary=calculations['net_salary'],
                payment_status='pending'
            )
            
            # Aggregate totals
            total_gross += gross
            total_paye += calculations['paye_tax']
            total_nssf_employee += calculations['nssf_employee']
            total_nssf_employer += calculations['nssf_employer']
            total_deductions += calculations['total_deductions']
            total_net += calculations['net_salary']
            
            processed_count += 1
            
        # Update Payroll Run
        payroll_run.total_gross = total_gross
        payroll_run.total_paye = total_paye
        payroll_run.total_nssf_employee = total_nssf_employee
        payroll_run.total_nssf_employer = total_nssf_employer
        payroll_run.total_deductions = total_deductions
        payroll_run.total_net = total_net
        payroll_run.status = 'processing'
        payroll_run.processed_at = timezone.now()
        payroll_run.processed_by = request.user
        payroll_run.save()
        
        serializer = self.get_serializer(payroll_run)
        return Response({
            'message': f'Payroll processed for {processed_count} employees',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'])
    def approve_payroll(self, request, pk=None):
        """Approve the payroll run"""
        payroll_run = self.get_object()
        
        if payroll_run.status != 'processing':
            return Response(
                {'error': 'Can only approve payroll that is currently Processing'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        payroll_run.status = 'approved'
        payroll_run.approved_by = request.user
        payroll_run.approved_at = timezone.now()
        payroll_run.save()
        
        return Response({'message': 'Payroll approved successfully'})

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark payroll run as Paid"""
        payroll_run = self.get_object()
        
        if payroll_run.status != 'approved':
            return Response(
                {'error': 'Can only mark Approved payroll as Paid'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        payroll_run.status = 'paid'
        payroll_run.save()
        
        # Mark all payslips as paid
        payroll_run.payslips.update(payment_status='paid', payment_date=timezone.now().date())
        
        return Response({'message': 'Payroll marked as Paid'})


# ────────────────────── PAYSLIPS ──────────────────────
class PayslipViewSet(viewsets.ModelViewSet):
    queryset = Payslip.objects.all().select_related('employee', 'payroll_run')
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_serializer_class(self):
        return PayslipDetailSerializer if self.action == 'retrieve' else PayslipSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['payroll_run', 'employee', 'payment_status']

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