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
from django.db.models import Q

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
from .services.payroll_email_service import PayrollEmailService
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
        """Only show loans for the user's company and limit visibility by role"""
        user = self.request.user
        qs = self.queryset.filter(company=user.company)
        
        # Employees only see their own loans
        if user.role == 'employee':
            if hasattr(user, 'employee') and user.employee:
                qs = qs.filter(employee=user.employee)
            else:
                qs = qs.none()
        
        return qs

    def perform_create(self, serializer):
        """Auto-assign company from logged-in user"""
        user = self.request.user
        employee = serializer.validated_data['employee']
        
        if employee.company != user.company:
            raise serializer.ValidationError("Cannot create loan for employee from another company.")
        
        # Employees can only create loans for themselves
        if user.role == 'employee':
            if not hasattr(user, 'employee') or employee != user.employee:
                 raise serializer.ValidationError("You can only request loans for yourself.")

        serializer.save(
            company=user.company,
            created_by=user
        )

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        # Restriction: Only HR/Admin/Manager can approve
        if request.user.role not in ['hr_manager', 'company_admin', 'super_admin', 'manager']:
            return Response({'error': 'Permission denied'}, status=403)

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
        # Restriction: Only HR/Admin/Manager can reject
        if request.user.role not in ['hr_manager', 'company_admin', 'super_admin', 'manager']:
            return Response({'error': 'Permission denied'}, status=403)

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
        # Employees/Managers should generally NOT see payroll runs, only HR/Admins
        user = self.request.user
        if user.role not in ['hr_manager', 'company_admin', 'super_admin']:
             return self.queryset.none()
        return self.queryset.filter(company=user.company)
    
    def perform_create(self, serializer):
        """Auto-assign company and process specific employees if selected"""
        # Strictly restrict creation to HR/Admins
        if self.request.user.role not in ['hr_manager', 'company_admin', 'super_admin']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only HR Managers or Admins can create payroll runs.")

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
        Payslip.objects.filter(payroll_run=payroll_run, employee__in=employees).delete()

        for employee in employees:
            try:
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
                continue
            
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
        if request.user.role not in ['hr_manager', 'company_admin', 'super_admin']:
             return Response({'error': 'Permission denied'}, status=403)

        payroll_run = self.get_object()
        
        if payroll_run.status not in ['draft', 'processing']:
            return Response(
                {'error': 'Can only process payroll in Draft or Processing status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        reset = request.query_params.get('reset') == 'true'
        
        if reset or not payroll_run.payslips.exists():
            if reset:
                payroll_run.payslips.all().delete()
            employees = payroll_run.company.employees.filter(is_active=True)
        else:
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
        if request.user.role not in ['hr_manager', 'company_admin', 'super_admin']:
             return Response({'error': 'Permission denied'}, status=403)

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
        if request.user.role not in ['hr_manager', 'company_admin', 'super_admin']:
             return Response({'error': 'Permission denied'}, status=403)

        payroll_run = self.get_object()
        
        if payroll_run.status != 'approved':
            return Response(
                {'error': 'Can only mark Approved payroll as Paid'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        payroll_run.status = 'paid'
        payroll_run.save()
        payroll_run.payslips.update(payment_status='paid', payment_date=timezone.now().date())
        
        return Response({'message': 'Payroll marked as Paid'})

    @action(detail=True, methods=['get'])
    def download_tax_sheet(self, request, pk=None):
        """Export Uganda Tax Sheet (PAYE, NSSF) as CSV"""
        import csv
        from django.http import HttpResponse
        
        payroll_run = self.get_object()
        payslips = payroll_run.payslips.all().select_related('employee')
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="uganda_tax_sheet_{payroll_run.month}_{payroll_run.year}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Employee ID', 'Name', 'Gross Salary', 'PAYE Tax (UGX)', 'NSSF Employee (5%)', 'NSSF Employer (10%)', 'Total NSSF', 'Net Salary'])
        
        for p in payslips:
            writer.writerow([
                p.employee.employee_id,
                p.employee.full_name,
                p.gross_salary,
                p.paye_tax,
                p.nssf_employee,
                p.nssf_employer,
                p.nssf_employee + p.nssf_employer,
                p.net_salary
            ])
            
        return response


# ────────────────────── PAYSLIPS ──────────────────────
class PayslipViewSet(viewsets.ModelViewSet):
    queryset = Payslip.objects.all().select_related('employee', 'payroll_run')
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_serializer_class(self):
        return PayslipDetailSerializer if self.action == 'retrieve' else PayslipSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['payroll_run', 'employee', 'payment_status']

    def get_queryset(self):
        # Employees see only their own payslips
        user = self.request.user
        qs = self.queryset.filter(employee__company=user.company)
        
        if user.role == 'employee':
             if hasattr(user, 'employee') and user.employee:
                 qs = qs.filter(employee=user.employee)
             else:
                 qs = qs.none()
        
        return qs

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        payslip = self.get_object()
        from .services.payslip_generator import PayslipGenerator
        pdf_url = PayslipGenerator.generate_pdf(payslip)
        return Response({'status': 'PDF generated', 'pdf_url': pdf_url})

    @action(detail=True, methods=['post'])
    def email_payslip(self, request, pk=None):
        payslip = self.get_object()
        success, message = PayrollEmailService.send_payslip_email(payslip)
        if success:
            return Response({'message': message})
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)


# ────────────────────── SALARY STRUCTURES ──────────────────────
class SalaryStructureViewSet(viewsets.ModelViewSet):
    queryset = SalaryStructure.objects.all().select_related('employee')
    serializer_class = SalaryStructureSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        # Employees see only their own salary structure (Read Only intent, reinforced by permissions)
        user = self.request.user
        qs = self.queryset.filter(employee__company=user.company)
        
        if user.role == 'employee':
             if hasattr(user, 'employee') and user.employee:
                 qs = qs.filter(employee=user.employee)
             else:
                 qs = qs.none()
        elif user.role == 'manager':
             # Managers might need to see subordinates' salaries?
             # For now, let's allow it for subordinates
             if hasattr(user, 'employee') and user.employee:
                 qs = qs.filter(Q(employee=user.employee) | Q(employee__manager=user.employee))
        
        return qs
    
    def perform_create(self, serializer):
        """Create salary structure - RESTRICTED"""
        user = self.request.user
        
        # Security: Employees cannot set their own salary
        if user.role not in ['hr_manager', 'company_admin', 'super_admin']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to set salary structures.")

        from rest_framework.exceptions import ValidationError
        employee = serializer.validated_data['employee']
        
        if employee.company != user.company:
            raise ValidationError({
                'employee': 'Cannot create salary structure for employee from another company.'
            })
        
        serializer.save(
            company=user.company,
            created_by=user
        )
    
    def perform_update(self, serializer):
        """Update salary structure - RESTRICTED"""
        user = self.request.user
        
        # Security: Employees cannot update their own salary
        if user.role not in ['hr_manager', 'company_admin', 'super_admin']:
             from rest_framework.exceptions import PermissionDenied
             raise PermissionDenied("You do not have permission to update salary structures.")

        from rest_framework.exceptions import ValidationError
        employee = serializer.validated_data.get('employee')
        
        if employee and employee.company != user.company:
            raise ValidationError({
                'employee': 'Cannot update salary structure with employee from another company.'
            })
        
        serializer.save()