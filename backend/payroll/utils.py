"""
Payroll calculation utilities for LahHR.
Contains Uganda-specific tax and deduction calculations.
"""
from decimal import Decimal, ROUND_HALF_UP


def calculate_paye(gross_salary: Decimal) -> Decimal:
    """
    Calculate Uganda PAYE (Pay As You Earn) tax for 2024.

    Uganda PAYE Tax Bands (2024):
    - UGX 0 - 235,000: 0%
    - UGX 235,001 - 335,000: 10%
    - UGX 335,001 - 410,000: 20%
    - UGX 410,001 - 10,000,000: 30%
    - Above UGX 10,000,000: 40%

    Args:
        gross_salary: Monthly gross salary in UGX

    Returns:
        Monthly PAYE tax amount
    """
    if gross_salary <= Decimal('235000'):
        return Decimal('0')
    elif gross_salary <= Decimal('335000'):
        # 10% on amount above 235,000
        return ((gross_salary - Decimal('235000')) * Decimal('0.10')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    elif gross_salary <= Decimal('410000'):
        # 10,000 (from previous bracket) + 20% on amount above 335,000
        return (Decimal('10000') + (gross_salary - Decimal('335000')) * Decimal('0.20')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    elif gross_salary <= Decimal('10000000'):
        # 25,000 (from previous brackets) + 30% on amount above 410,000
        return (Decimal('25000') + (gross_salary - Decimal('410000')) * Decimal('0.30')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    else:
        # 2,902,000 (from previous brackets) + 40% on amount above 10,000,000
        return (Decimal('2902000') + (gross_salary - Decimal('10000000')) * Decimal('0.40')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def calculate_nssf(gross_salary: Decimal, rate: Decimal = Decimal('0.05'), ceiling: Decimal = Decimal('0')) -> Decimal:
    """
    Calculate NSSF contribution.
    Defaults to 5% with no ceiling (standard Uganda).

    Args:
        gross_salary: Monthly gross salary in UGX
        rate: Contribution rate (default 0.05)
        ceiling: Maximum contribution amount (default 0 - no limit)

    Returns:
        NSSF contribution amount
    """
    contribution = gross_salary * rate
    if ceiling > Decimal('0'):
        contribution = min(contribution, ceiling)
    return contribution.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def calculate_employer_nssf(gross_salary: Decimal, rate: Decimal = Decimal('0.10'), ceiling: Decimal = Decimal('0')) -> Decimal:
    """
    Calculate employer NSSF contribution.
    Defaults to 10% with no ceiling.
    """
    return calculate_nssf(gross_salary, rate, ceiling)


def calculate_net_salary(gross_salary: Decimal, deductions: dict = None, tax_config: dict = None) -> dict:
    """
    Calculate net salary after all deductions.

    Args:
        gross_salary: Monthly gross salary
        deductions: Dictionary of deductions (optional)
        tax_config: Key-value pairs for tax settings (rates, ceilings)

    Returns:
        Dictionary with breakdown of earnings, deductions, and net salary
    """
    if deductions is None:
        deductions = {}
    
    if tax_config is None:
        tax_config = {}

    # Extract config with defaults
    nssf_emp_rate = tax_config.get('nssf_employee_rate', Decimal('0.05'))
    nssf_emp_ceiling = tax_config.get('nssf_ceiling', Decimal('0'))
    nssf_employer_rate = tax_config.get('nssf_employer_rate', Decimal('0.10'))
    
    # Calculate tax and NSSF
    paye_tax = calculate_paye(gross_salary)
    nssf_employee = calculate_nssf(gross_salary, rate=nssf_emp_rate, ceiling=nssf_emp_ceiling)
    nssf_employer = calculate_employer_nssf(gross_salary, rate=nssf_employer_rate, ceiling=nssf_emp_ceiling)

    # Get other deductions
    loan_deduction = deductions.get('loan_deduction', Decimal('0'))
    advance_deduction = deductions.get('advance_deduction', Decimal('0'))
    other_deductions = deductions.get('other_deductions', Decimal('0'))

    # Total deductions
    total_deductions = (
        paye_tax +
        nssf_employee +
        loan_deduction +
        advance_deduction +
        other_deductions
    )

    # Net salary
    net_salary = gross_salary - total_deductions

    return {
        'gross_salary': gross_salary,
        'paye_tax': paye_tax,
        'nssf_employee': nssf_employee,
        'nssf_employer': nssf_employer,
        'loan_deduction': loan_deduction,
        'advance_deduction': advance_deduction,
        'other_deductions': other_deductions,
        'total_deductions': total_deductions,
        'net_salary': net_salary.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    }


def get_tax_bracket_info(gross_salary: Decimal) -> dict:
    """
    Get information about which tax bracket a salary falls into.

    Args:
        gross_salary: Monthly gross salary

    Returns:
        Dictionary with tax bracket information
    """
    if gross_salary <= Decimal('235000'):
        return {
            'bracket': '0%',
            'range': 'UGX 0 - 235,000',
            'tax_rate': Decimal('0'),
            'tax_amount': Decimal('0')
        }
    elif gross_salary <= Decimal('335000'):
        tax_amount = (gross_salary - Decimal('235000')) * Decimal('0.10')
        return {
            'bracket': '10%',
            'range': 'UGX 235,001 - 335,000',
            'tax_rate': Decimal('0.10'),
            'tax_amount': tax_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        }
    elif gross_salary <= Decimal('410000'):
        tax_amount = Decimal('10000') + (gross_salary - Decimal('335000')) * Decimal('0.20')
        return {
            'bracket': '20%',
            'range': 'UGX 335,001 - 410,000',
            'tax_rate': Decimal('0.20'),
            'tax_amount': tax_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        }
    elif gross_salary <= Decimal('10000000'):
        tax_amount = Decimal('25000') + (gross_salary - Decimal('410000')) * Decimal('0.30')
        return {
            'bracket': '30%',
            'range': 'UGX 410,001 - 10,000,000',
            'tax_rate': Decimal('0.30'),
            'tax_amount': tax_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        }
    else:
        tax_amount = Decimal('2902000') + (gross_salary - Decimal('10000000')) * Decimal('0.40')
        return {
            'bracket': '40%',
            'range': 'Above UGX 10,000,000',
            'tax_rate': Decimal('0.40'),
            'tax_amount': tax_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        }


# Uganda PAYE tax bands for reference
UGANDA_PAYE_BANDS = [
    {'min': Decimal('0'), 'max': Decimal('235000'), 'rate': Decimal('0')},
    {'min': Decimal('235001'), 'max': Decimal('335000'), 'rate': Decimal('0.10')},
    {'min': Decimal('335001'), 'max': Decimal('410000'), 'rate': Decimal('0.20')},
    {'min': Decimal('410001'), 'max': Decimal('10000000'), 'rate': Decimal('0.30')},
    {'min': Decimal('10000001'), 'max': None, 'rate': Decimal('0.40')},
]

# NSSF constants
NSSF_RATE = Decimal('0.10')  # 10%
NSSF_MAX_CONTRIBUTION = Decimal('100000')  # UGX 100,000 ceiling
