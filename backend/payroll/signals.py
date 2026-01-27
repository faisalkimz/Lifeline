from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SalaryStructure, Payslip

@receiver(post_save, sender=SalaryStructure)
def update_draft_payslips(sender, instance, created, **kwargs):
    """
    When a SalaryStructure is updated, find any 'draft' or 'processing' 
    payroll runs and update the corresponding payslips.
    """
    # Find active/draft payslips for this employee
    payslips = Payslip.objects.filter(
        employee=instance.employee,
        payroll_run__status__in=['draft', 'processing']
    )
    
    for payslip in payslips:
        # Sync values from new SalaryStructure
        payslip.basic_salary = instance.basic_salary
        payslip.housing_allowance = instance.housing_allowance
        payslip.transport_allowance = instance.transport_allowance
        payslip.medical_allowance = instance.medical_allowance
        payslip.lunch_allowance = instance.lunch_allowance
        payslip.other_allowances = instance.other_allowances
        
        # Save will trigger recalculation if we rely on model logic (check model save)
        # Actually payslip model save doesn't recalculate net. 
        # The serializer does it. 
        # We should use a utility or trigger the serializer logic.
        
        from .utils import calculate_net_salary
        from decimal import Decimal
        
        # Re-calculate gross
        total_allowances = (
            payslip.housing_allowance + payslip.transport_allowance + 
            payslip.medical_allowance + payslip.lunch_allowance + 
            payslip.other_allowances
        )
        payslip.gross_salary = payslip.basic_salary + total_allowances + payslip.bonus
        
        # Tax Config
        tax_config = {}
        try:
            tax_settings = payslip.employee.company.tax_settings
            tax_config = {
                'nssf_employee_rate': tax_settings.nssf_employee_rate / Decimal('100.00'),
                'nssf_employer_rate': tax_settings.nssf_employer_rate / Decimal('100.00'),
                'nssf_ceiling': tax_settings.nssf_ceiling,
                'personal_relief': tax_settings.personal_relief,
                'insurance_relief': tax_settings.insurance_relief,
                'pension_fund_relief': tax_settings.pension_fund_relief,
                'local_service_tax_enabled': tax_settings.local_service_tax_enabled,
                'local_service_tax_rate': tax_settings.local_service_tax_rate / Decimal('100.00'),
            }
        except:
            pass
            
        calculations = calculate_net_salary(
            payslip.gross_salary,
            {
                'loan_deduction': payslip.loan_deduction,
                'advance_deduction': payslip.advance_deduction,
                'other_deductions': payslip.other_deductions,
            },
            tax_config=tax_config
        )
        
        payslip.paye_tax = calculations['paye_tax']
        payslip.nssf_employee = calculations['nssf_employee']
        payslip.nssf_employer = calculations['nssf_employer']
        payslip.local_service_tax = calculations['local_service_tax']
        payslip.total_deductions = calculations['total_deductions']
        payslip.net_salary = calculations['net_salary']
        
        payslip.save()
        
        # Update Run Totals
        # We should call a method on the run to update its totals
        # payroll_run = payslip.payroll_run
        # (Totals update usually happens after batch processing, let's trigger it)
        from .views import PayrollRunViewSet
        # This is a bit circular, let's just use a standalone func or model method
        # Let's add update_totals to PayrollRun model
    
    # Update totals for all affected runs
    affected_runs = set(p.payroll_run for p in payslips)
    for run in affected_runs:
        from django.db.models import Sum
        agg = run.payslips.aggregate(
            t_gross=Sum('gross_salary'),
            t_paye=Sum('paye_tax'),
            t_nssf_e=Sum('nssf_employee'),
            t_nssf_r=Sum('nssf_employer'),
            t_lst=Sum('local_service_tax'),
            t_ded=Sum('total_deductions'),
            t_net=Sum('net_salary')
        )
        run.total_gross = agg['t_gross'] or 0
        run.total_paye = agg['t_paye'] or 0
        run.total_nssf_employee = agg['t_nssf_e'] or 0
        run.total_nssf_employer = agg['t_nssf_r'] or 0
        run.total_lst = agg['t_lst'] or 0
        run.total_deductions = agg['t_ded'] or 0
        run.total_net = agg['t_net'] or 0
        run.save()
