"""
Payroll Bank Export Service
Generates bank-compatible CSV files for salary disbursement
"""
import csv
import io
from decimal import Decimal
from typing import List, Dict, Any
from django.db.models import QuerySet


class UgandaBankExportService:
    """
    Uganda bank CSV export formats
    Supports major Ugandan banks: Stanbic, Centenary, DFCU, etc.
    """
    
    @staticmethod
    def generate_standard_csv(payslips: QuerySet) -> str:
        """
        Generate standard Uganda bank CSV format
        
        Format:
        Account Number, Employee Name, Amount, Reference
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(['Account Number', 'Employee Name', 'Amount', 'Reference', 'Currency'])
        
        # Data rows
        for payslip in payslips:
            employee = payslip.employee
            
            # Skip if no bank account
            if not hasattr(employee, 'bank_account_number') or not employee.bank_account_number:
                continue
            
            writer.writerow([
                employee.bank_account_number,
                f"{employee.first_name} {employee.last_name}",
                float(payslip.net_salary),
                f"Salary-{payslip.payroll_run.month}/{payslip.payroll_run.year}",
                'UGX'
            ])
        
        return output.getvalue()
    
    @staticmethod
    def generate_stanbic_format(payslips: QuerySet) -> str:
        """
        Stanbic Bank Uganda specific format
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Stanbic header
        writer.writerow([
            'Beneficiary Account',
            'Beneficiary Name',
            'Amount',
            'Payment Details',
            'Debit Account'
        ])
        
        for payslip in payslips:
            employee = payslip.employee
            
            if not hasattr(employee, 'bank_account_number') or not employee.bank_account_number:
                continue
            
            writer.writerow([
                employee.bank_account_number,
                f"{employee.first_name} {employee.last_name}".upper(),
                f"{float(payslip.net_salary):.2f}",
                f"SALARY {payslip.payroll_run.month}/{payslip.payroll_run.year}",
                ''  # Company debit account - will be filled by company
            ])
        
        return output.getvalue()
    
    @staticmethod
    def generate_centenary_format(payslips: QuerySet) -> str:
        """
        Centenary Bank Uganda specific format
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Centenary header
        writer.writerow([
            'Account Number',
            'Account Name',
            'Transaction Amount',
            'Narration'
        ])
        
        for payslip in payslips:
            employee = payslip.employee
            
            if not hasattr(employee, 'bank_account_number') or not employee.bank_account_number:
                continue
            
            writer.writerow([
                employee.bank_account_number,
                f"{employee.first_name} {employee.last_name}",
                float(payslip.net_salary),
                f"Salary Payment {payslip.payroll_run.month}/{payslip.payroll_run.year}"
            ])
        
        return output.getvalue()
    
    @staticmethod
    def generate_summary_report(payslips: QuerySet) -> Dict[str, Any]:
        """
        Generate summary report for the export
        """
        total_amount = sum(payslip.net_salary for payslip in payslips)
        total_employees = payslips.count()
        employees_with_accounts = sum(
            1 for payslip in payslips 
            if hasattr(payslip.employee, 'bank_account_number') and payslip.employee.bank_account_number
        )
        
        return {
            'total_employees': total_employees,
            'employees_with_bank_accounts': employees_with_accounts,
            'employees_without_accounts': total_employees - employees_with_accounts,
            'total_amount': float(total_amount),
            'currency': 'UGX'
        }


class MPesaExportService:
    """
    M-Pesa (Mobile Money) export format for salary disbursement
    """
    
    @staticmethod
    def generate_mpesa_csv(payslips: QuerySet) -> str:
        """
        Generate M-Pesa bulk payment CSV
        
        Format compatible with M-Pesa Business API
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # M-Pesa header
        writer.writerow([
            'Phone Number',
            'Employee Name',
            'Amount',
            'Reason',
            'Reference'
        ])
        
        for payslip in payslips:
            employee = payslip.employee
            
            # Skip if no mobile number
            if not hasattr(employee, 'phone_number') or not employee.phone_number:
                continue
            
            # Format phone number (remove + and spaces)
            phone = employee.phone_number.replace('+', '').replace(' ', '').replace('-', '')
            
            writer.writerow([
                phone,
                f"{employee.first_name} {employee.last_name}",
                float(payslip.net_salary),
                'Salary Payment',
                f"SAL{payslip.payroll_run.month}{payslip.payroll_run.year}"
            ])
        
        return output.getvalue()
    
    @staticmethod
    def generate_airtel_money_csv(payslips: QuerySet) -> str:
        """
        Generate Airtel Money bulk payment CSV
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Airtel Money header
        writer.writerow([
            'MSISDN',
            'Name',
            'Amount',
            'Narration'
        ])
        
        for payslip in payslips:
            employee = payslip.employee
            
            if not hasattr(employee, 'phone_number') or not employee.phone_number:
                continue
            
            phone = employee.phone_number.replace('+', '').replace(' ', '').replace('-', '')
            
            writer.writerow([
                phone,
                f"{employee.first_name} {employee.last_name}",
                float(payslip.net_salary),
                f"Salary {payslip.payroll_run.month}/{payslip.payroll_run.year}"
            ])
        
        return output.getvalue()


class PayrollExportCoordinator:
    """
    Coordinates all payroll export formats
    """
    
    BANK_FORMATS = {
        'standard': UgandaBankExportService.generate_standard_csv,
        'stanbic': UgandaBankExportService.generate_stanbic_format,
        'centenary': UgandaBankExportService.generate_centenary_format,
    }
    
    MOBILE_MONEY_FORMATS = {
        'mpesa': MPesaExportService.generate_mpesa_csv,
        'airtel': MPesaExportService.generate_airtel_money_csv,
    }
    
    @classmethod
    def export_payroll(cls, payslips: QuerySet, format_type: str) -> Dict[str, Any]:
        """
        Export payroll in specified format
        
        Args:
            payslips: QuerySet of Payslip objects
            format_type: 'standard', 'stanbic', 'centenary', 'mpesa', 'airtel'
            
        Returns:
            dict: CSV content and summary
        """
        # Get the appropriate generator
        generator = cls.BANK_FORMATS.get(format_type) or cls.MOBILE_MONEY_FORMATS.get(format_type)
        
        if not generator:
            raise ValueError(f"Unknown format type: {format_type}")
        
        # Generate CSV
        csv_content = generator(payslips)
        
        # Generate summary
        summary = UgandaBankExportService.generate_summary_report(payslips)
        
        return {
            'csv_content': csv_content,
            'summary': summary,
            'format': format_type,
            'filename': f"payroll_export_{format_type}.csv"
        }
