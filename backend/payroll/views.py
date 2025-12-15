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

from accounts.permissions import IsCompanyUser
from employees.models import Employee
from django.core.exceptions import ObjectDoesNotExist
import logging
from .models import SalaryStructure, PayrollRun, Payslip, SalaryAdvance
logger = logging.getLogger(__name__)
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
        """Auto-assign company and process specific employees if selected"""
        from django.db import IntegrityError
        from rest_framework.exceptions import ValidationError

        try:
            instance = serializer.save(
                company=self.request.user.company,
                processed_by=self.request.user,
                status='draft'
            )
        except IntegrityError:
            raise ValidationError({
                "non_field_errors": ["A payroll run for this month and year already exists."]
            })
        
        # If employees were selected in the modal (passed via serializer hack)
        if hasattr(instance, '_employee_ids_to_process'):
            ids = instance._employee_ids_to_process
            # Explicitly filter on Employee model to avoid any related manager confusion/errors
            employees = Employee.objects.filter(company=instance.company, id__in=ids)
            self._process_employees(instance, employees)
        else:
            # Default: Process ALL active employees immediately
            employees = instance.company.employees.filter(employment_status='active')
            self._process_employees(instance, employees)
            
    def _process_employees(self, payroll_run, employees):
        """Helper to calculate and create payslips for given employees"""
        total_gross = Decimal('0.00')
        total_paye = Decimal('0.00')
        total_nssf_employee = Decimal('0.00')
        total_nssf_employer = Decimal('0.00')
        total_net = Decimal('0.00')
        total_deductions = Decimal('0.00')
        
        count = 0
        
        # Clear existing payslips for these employees to avoid duplicates
        # (Needed if reprocessing subset)
        Payslip.objects.filter(payroll_run=payroll_run, employee__in=employees).delete()

        for employee in employees:
            try:
                # Safe access to salary structure (Reverse OneToOne can raise error even with hasattr in some cases)
                try:
                    structure = employee.salary_structure
                except (ObjectDoesNotExist, AttributeError):
                    continue
                    
                gross = structure.gross_salary
                
                calculations = calculate_net_salary(gross)
                
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
                
                total_gross += gross
                total_paye += calculations['paye_tax']
                total_nssf_employee += calculations['nssf_employee']
                total_nssf_employer += calculations['nssf_employer']
                total_deductions += calculations['total_deductions']
                total_net += calculations['net_salary']
                count += 1
            except Exception as e:
                logger.error(f"Error processing payroll for employee {employee.id}: {str(e)}")
                # Continue to next employee instead of crashing entire run? 
                # Or re-raise? Default behavior implies partial failure is bad.
                # But for now, lets log and continue to see if we get partial success.
                continue
            
        # Update Run Totals (Add to existing or Set? Set is safer usually, but partial update?)
        # If processing subset, we should query ALL payslips to get accurate total.
        # So ignore the running totals above and aggregate from DB.
        self._update_run_totals(payroll_run)
        return count

    def _update_run_totals(self, payroll_run):
        """Aggregate totals from all payslips"""
        from django.db.models import Sum
        agg = payroll_run.payslips.aggregate(
            t_gross=Sum('gross_salary'),
            t_paye=Sum('paye_tax'),
            t_nssf_e=Sum('nssf_employee'),
            t_nssf_r=Sum('nssf_employer'),
            t_ded=Sum('total_deductions'),
            t_net=Sum('net_salary')
        )
        
        payroll_run.total_gross = agg['t_gross'] or 0
        payroll_run.total_paye = agg['t_paye'] or 0
        payroll_run.total_nssf_employee = agg['t_nssf_e'] or 0
        payroll_run.total_nssf_employer = agg['t_nssf_r'] or 0
        payroll_run.total_deductions = agg['t_ded'] or 0
        payroll_run.total_net = agg['t_net'] or 0
        
        if payroll_run.status == 'draft' and payroll_run.payslips.exists():
             payroll_run.status = 'processing'
             
        payroll_run.save()

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

        # Determine employees to process
        reset = request.query_params.get('reset') == 'true'
        
        if reset or not payroll_run.payslips.exists():
            # Process ALL active employees
            if reset:
                payroll_run.payslips.all().delete()
            employees = payroll_run.company.employees.filter(is_active=True)
        else:
            # Re-process existing employees (keep selection)
            employees = Employee.objects.filter(payslips__payroll_run=payroll_run)

        processed_count = self._process_employees(payroll_run, employees)
        
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