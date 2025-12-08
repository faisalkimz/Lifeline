#!/usr/bin/env python
"""
Simple test script for payroll functionality.
Tests the Uganda PAYE and NSSF calculations.
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from payroll.utils import calculate_paye, calculate_nssf, calculate_net_salary, get_tax_bracket_info
from decimal import Decimal

def test_paye_calculations():
    """Test Uganda PAYE tax calculations"""
    print("🧪 Testing Uganda PAYE Tax Calculations")
    print("=" * 50)

    test_cases = [
        (Decimal('200000'), Decimal('0')),  # Below threshold
        (Decimal('250000'), Decimal('1500')),  # 10% bracket: (250k-235k)*0.1 = 1,500
        (Decimal('300000'), Decimal('6500')),  # 10% bracket: (300k-235k)*0.1 = 6,500
        (Decimal('350000'), Decimal('13000')),  # 20% bracket: 10k + (350k-335k)*0.2 = 13,000
        (Decimal('400000'), Decimal('23000')),  # 20% bracket: 10k + (400k-335k)*0.2 = 23,000
        (Decimal('450000'), Decimal('37000')),  # 30% bracket: 25k + (450k-410k)*0.3 = 37,000
        (Decimal('500000'), Decimal('52000')),  # 30% bracket: 25k + (500k-410k)*0.3 = 52,000
        (Decimal('1000000'), Decimal('202000')),  # 30% bracket: 25k + (1M-410k)*0.3 = 202,000
        (Decimal('2000000'), Decimal('502000')),  # 30% bracket: 25k + (2M-410k)*0.3 = 502,000
        (Decimal('5000000'), Decimal('1402000')),  # 30% bracket: 25k + (5M-410k)*0.3 = 1,402,000
        (Decimal('15000000'), Decimal('4902000')),  # 40% bracket: 2,902k + (15M-10M)*0.4 = 4,902,000
    ]

    for gross, expected_tax in test_cases:
        calculated_tax = calculate_paye(gross)
        status = "✅" if calculated_tax == expected_tax else "❌"
        print(f"{status} UGX {gross:>10,.0f} → Tax: UGX {calculated_tax:>10,.0f} (Expected: UGX {expected_tax:>10,.0f})")

    print()

def test_nssf_calculations():
    """Test NSSF contribution calculations"""
    print("🧪 Testing NSSF Contribution Calculations")
    print("=" * 50)

    test_cases = [
        (Decimal('50000'), Decimal('5000')),  # Below max
        (Decimal('100000'), Decimal('10000')),  # At max pensionable salary
        (Decimal('150000'), Decimal('10000')),  # Above max (capped at 10,000)
        (Decimal('200000'), Decimal('10000')),  # Well above max (capped at 10,000)
    ]

    for gross, expected_nssf in test_cases:
        calculated_nssf = calculate_nssf(gross)
        status = "✅" if calculated_nssf == expected_nssf else "❌"
        print(f"{status} UGX {gross:>10,.0f} → NSSF: UGX {calculated_nssf:>8,.0f} (Expected: UGX {expected_nssf:>8,.0f})")

    print()

def test_net_salary_calculations():
    """Test complete net salary calculations"""
    print("🧪 Testing Complete Net Salary Calculations")
    print("=" * 50)

    # Test case: UGX 500,000 gross salary
    gross_salary = Decimal('500000')
    deductions = {
        'loan_deduction': Decimal('25000'),
        'advance_deduction': Decimal('0'),
        'other_deductions': Decimal('5000'),
    }

    result = calculate_net_salary(gross_salary, deductions)

    print(f"Gross Salary: UGX {gross_salary:,.0f}")
    print(f"PAYE Tax: UGX {result['paye_tax']:,.0f}")
    print(f"NSSF Employee: UGX {result['nssf_employee']:,.0f}")
    print(f"NSSF Employer: UGX {result['nssf_employer']:,.0f}")
    print(f"Loan Deduction: UGX {deductions['loan_deduction']:,.0f}")
    print(f"Advance Deduction: UGX {deductions['advance_deduction']:,.0f}")
    print(f"Other Deductions: UGX {deductions['other_deductions']:,.0f}")
    print(f"Total Deductions: UGX {result['total_deductions']:,.0f}")
    print(f"Net Salary: UGX {result['net_salary']:,.0f}")

    print()

def test_tax_brackets():
    """Test tax bracket information"""
    print("🧪 Testing Tax Bracket Information")
    print("=" * 50)

    salaries = [Decimal('200000'), Decimal('350000'), Decimal('450000'), Decimal('2000000')]

    for salary in salaries:
        bracket_info = get_tax_bracket_info(salary)
        print(f"UGX {salary:,.0f}: {bracket_info['bracket']} bracket - Tax: UGX {bracket_info['tax_amount']:,.0f}")

    print()

if __name__ == '__main__':
    print("🚀 Payroll Calculation Tests")
    print("=" * 50)
    print()

    try:
        test_paye_calculations()
        test_nssf_calculations()
        test_net_salary_calculations()
        test_tax_brackets()

        print("🎉 All tests completed!")

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
