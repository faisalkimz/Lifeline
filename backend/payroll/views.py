"""
Payroll API views.
"""
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from decimal import Decimal

from .models import SalaryStructure, PayrollRun, Payslip, SalaryAdvance
from .serializers import (
    SalaryStructureSerializer, PayrollRunSerializer, PayslipSerializer,
    PayslipDetailSerializer, SalaryAdvanceSerializer, PayrollSummarySerializer
)
from .utils import calculate_net_salary
from .permissions import IsCompanyAdminOrHR, IsEmployeeOrAdmin
from accounts.permissions import IsCompanyUser



# payroll/views.py
class SalaryAdvanceViewSet(viewsets.ModelViewSet):
    queryset = SalaryAdvance.objects.all().select_related('employee', 'company', 'approved_by', 'created_by')
    serializer_class = SalaryAdvanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Multi-tenant: only show advances for user's company"""
        user = self.request.user

        # Superusers see everything
        if user.is_superuser:
            return self.queryset

        # Try to get company from user's employee profile
        if hasattr(user, 'employee') and user.employee and hasattr(user.employee, 'company') and user.employee.company:
            return self.queryset.filter(company=user.employee.company)

        # Fallback: if no employee profile, return empty (safe default)
        return self.queryset.none()

    def perform_create(self, serializer):
        """Auto-set company from selected employee"""
        employee = serializer.validated_data['employee']
        if not employee.company:
            raise serializers.ValidationError("Selected employee has no company assigned.")
        serializer.save(
            company=employee.company,
            created_by=self.request.user
        )
        
class SalaryStructureViewSet(viewsets.ModelViewSet):
    """ViewSet for managing employee salary structures"""

    serializer_class = SalaryStructureSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'effective_date']
    queryset = SalaryStructure.objects.all()

    def get_queryset(self):
        """Filter by user's company"""
        return SalaryStructure.objects.filter(
            employee__company=self.request.user.company
        ).select_related('employee', 'employee__department')

    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)


class PayrollRunViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payroll runs"""

    serializer_class = PayrollRunSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'month', 'year']
    queryset = PayrollRun.objects.all()

    def get_queryset(self):
        """Filter by user's company"""
        return PayrollRun.objects.filter(
            company=self.request.user.company
        ).select_related('processed_by', 'approved_by', 'company')

    @action(detail=True, methods=['post'])
    def process_payroll(self, request, pk=None):
        """Process payroll run - generate payslips for all active employees"""
        payroll_run = self.get_object()

        if payroll_run.status != 'draft':
            return Response(
                {'error': 'Payroll run is not in draft status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all active employees
        employees = payroll_run.company.employees.filter(employment_status='active')

        payslips_created = 0
        total_gross = Decimal('0')
        total_deductions = Decimal('0')
        total_net = Decimal('0')

        for employee in employees:
            # Get current salary structure
            salary_structure = SalaryStructure.objects.filter(
                employee=employee
            ).order_by('-effective_date').first()

            if not salary_structure:
                continue  # Skip employees without salary structure

            # Calculate deductions
            calculations = calculate_net_salary(salary_structure.gross_salary)

            # Create payslip
            payslip_data = {
                'payroll_run': payroll_run,
                'employee': employee,
                'basic_salary': salary_structure.basic_salary,
                'allowances': salary_structure.total_allowances,
                'bonuses': Decimal('0'),  # TODO: Add bonus system
                'gross_salary': salary_structure.gross_salary,
                'paye_tax': calculations['paye_tax'],
                'nssf_employee': calculations['nssf_employee'],
                'nssf_employer': calculations['nssf_employer'],
                'loan_deduction': Decimal('0'),  # TODO: Calculate from active loans
                'advance_deduction': Decimal('0'),  # TODO: Calculate from advances
                'other_deductions': Decimal('0'),
                'total_deductions': calculations['total_deductions'],
                'net_salary': calculations['net_salary'],
            }

            Payslip.objects.create(**payslip_data)

            payslips_created += 1
            total_gross += salary_structure.gross_salary
            total_deductions += calculations['total_deductions']
            total_net += calculations['net_salary']

        # Update payroll run totals
        payroll_run.total_gross = total_gross
        payroll_run.total_deductions = total_deductions
        payroll_run.total_net = total_net
        payroll_run.employee_count = payslips_created
        payroll_run.status = 'processing'
        payroll_run.processed_by = request.user
        payroll_run.processed_at = timezone.now()
        payroll_run.save()

        return Response({
            'message': f'Processed {payslips_created} payslips',
            'total_gross': total_gross,
            'total_deductions': total_deductions,
            'total_net': total_net
        })

    @action(detail=True, methods=['post'])
    def approve_payroll(self, request, pk=None):
        """Approve payroll run"""
        payroll_run = self.get_object()

        if payroll_run.status != 'processing':
            return Response(
                {'error': 'Payroll run must be in processing status to approve'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payroll_run.status = 'approved'
        payroll_run.approved_by = request.user
        payroll_run.approved_at = timezone.now()
        payroll_run.save()

        return Response({'message': 'Payroll run approved'})

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark payroll as paid"""
        payroll_run = self.get_object()

        if payroll_run.status != 'approved':
            return Response(
                {'error': 'Payroll run must be approved before marking as paid'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payroll_run.status = 'paid'
        payroll_run.paid_at = timezone.now()
        payroll_run.save()

        # Update all payslips to paid status
        payroll_run.payslips.update(payment_status='paid', payment_date=timezone.now().date())

        return Response({'message': 'Payroll run marked as paid'})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get payroll summary for current month"""
        now = timezone.now()
        current_payroll = PayrollRun.objects.filter(
            company=request.user.company,
            month=now.month,
            year=now.year
        ).first()

        if not current_payroll:
            return Response({'message': 'No payroll run found for current month'})

        payslips = current_payroll.payslips.all()
        summary_data = payslips.aggregate(
            total_employees=Count('id'),
            total_gross=Sum('gross_salary'),
            total_deductions=Sum('total_deductions'),
            total_net=Sum('net_salary'),
            total_paye_tax=Sum('paye_tax'),
            total_nssf=Sum('nssf_employee') + Sum('nssf_employer')
        )

        serializer = PayrollSummarySerializer(summary_data)
        return Response(serializer.data)


class PayslipViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payslips"""

    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['payroll_run', 'employee', 'payment_status']
    queryset = Payslip.objects.all()

    def get_serializer_class(self):
        """Use detailed serializer for individual payslips"""
        if self.action == 'retrieve':
            return PayslipDetailSerializer
        return PayslipSerializer

    def get_queryset(self):
        """Filter by user's company"""
        return Payslip.objects.filter(
            employee__company=self.request.user.company
        ).select_related('payroll_run', 'employee', 'employee__department')


class LoanViewSet(viewsets.ModelViewSet):
    """ViewSet for managing employee loans"""

    serializer_class = SalaryAdvanceSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'status', 'advance_type']
    queryset = SalaryAdvance.objects.all()

    def get_queryset(self):
        """Filter by user's company"""
        return SalaryAdvance.objects.filter(
            employee__company=self.request.user.company
        ).select_related('employee', 'approved_by')

    @action(detail=True, methods=['post'])
    def approve_advance(self, request, pk=None):
        """Approve a salary advance application"""
        advance = self.get_object()

        if advance.status != 'pending':
            return Response(
                {'error': 'Salary advance is not in pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        advance.status = 'active'
        advance.approved_by = request.user
        advance.approved_at = timezone.now()
        advance.save()

        return Response({'message': 'Salary advance approved'})

    @action(detail=True, methods=['post'])
    def reject_advance(self, request, pk=None):
        """Reject a salary advance application"""
        advance = self.get_object()

        if advance.status != 'pending':
            return Response(
                {'error': 'Salary advance is not in pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        advance.status = 'cancelled'
        advance.save()

        return Response({'message': 'Salary advance rejected'})

    @action(detail=False, methods=['get'])
    def active_advances(self, request):
        """Get all active salary advances for the company"""
        active_advances = self.get_queryset().filter(status='active')
        serializer = self.get_serializer(active_advances, many=True)
        return Response(serializer.data)
