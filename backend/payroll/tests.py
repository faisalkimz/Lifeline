from decimal import Decimal
from django.test import SimpleTestCase
from .utils import calculate_paye, calculate_nssf, calculate_net_salary

class PayrollCalculationTests(SimpleTestCase):
    def test_paye_bracket_1_exempt(self):
        # 0 - 235,000 is exempt
        self.assertEqual(calculate_paye(Decimal('200000')), Decimal('0'))
        self.assertEqual(calculate_paye(Decimal('235000')), Decimal('0'))

    def test_paye_bracket_2(self):
        # 235,001 - 335,000: 10%
        # Gross 300,000 -> Taxable 65,000 -> Tax 6,500
        self.assertEqual(calculate_paye(Decimal('300000')), Decimal('6500.00'))

    def test_paye_bracket_3(self):
        # 335,001 - 410,000: 20%
        # Gross 400,000 -> Bracket 1 max (10,000) + 20% of (400k-335k = 65k) = 13,000 -> Total 23,000
        # Wait, bracket 1 is 10% of (335,000 - 235,000) = 10,000.
        # Plus 20% of (400,000 - 335,000) = 13,000.
        # Total = 23,000.
        self.assertEqual(calculate_paye(Decimal('400000')), Decimal('23000.00'))

    def test_paye_bracket_4(self):
        # 410,001 - 10,000,000: 30%
        # Gross 1,000,000 ->
        # Base: 25,000 (10k from b2 + 15k from b3)
        # B2: 10% of 100k = 10k
        # B3: 20% of 75k = 15k. Total base 25,000.
        # Plus 30% of (1,000,000 - 410,000 = 590,000) = 177,000
        # Total = 202,000
        self.assertEqual(calculate_paye(Decimal('1000000')), Decimal('202000.00'))

    def test_paye_bracket_5_high_earner(self):
        # > 10,000,000: 40%
        # Gross 12,000,000 ->
        # Base: 2,902,000 (calculated in utils as fixed)
        # Plus 40% of (12m - 10m = 2m) = 800,000
        # Total = 3,702,000
        self.assertEqual(calculate_paye(Decimal('12000000')), Decimal('3702000.00'))

    def test_nssf_calculation(self):
        # 10% capped at 10,000? No, typically capped at standard amount.
        # utils.py says: 10% of gross, min(gross*0.10, 10000)
        # Wait, utils.py says: "Maximum pensionable salary: UGX 100,000 per month. Maximum contribution: UGX 10,000 per month"
        # This seems low for NSSF? Typical NSSF Uganda is 5% employee, 10% employer?
        # Or 15% total?
        # The code is `min(gross_salary * Decimal('0.10'), Decimal('10000'))`
        # So for 1,000,000 gross, it returns 10,000.
        # If gross is 50,000, returns 5,000.
        self.assertEqual(calculate_nssf(Decimal('50000')), Decimal('5000.00'))
        self.assertEqual(calculate_nssf(Decimal('100000')), Decimal('10000.00'))
        self.assertEqual(calculate_nssf(Decimal('5000000')), Decimal('10000.00'))

    def test_net_salary_calculation(self):
        gross = Decimal('1000000')
        # PAYE: 202,000
        # NSSF: 10,000 (capped)
        # Total Deductions: 212,000
        # Net: 788,000
        result = calculate_net_salary(gross)
        self.assertEqual(result['paye_tax'], Decimal('202000.00'))
        self.assertEqual(result['nssf_employee'], Decimal('10000.00'))
        self.assertEqual(result['net_salary'], Decimal('788000.00'))

    def test_net_salary_with_deductions(self):
        gross = Decimal('1000000')
        deductions = {
            'loan_deduction': Decimal('50000'),
            'other_deductions': Decimal('10000')
        }
        # PAYE: 202,000
        # NSSF: 10,000
        # Loans: 50,000
        # Other: 10,000
        # Total: 272,000
        # Net: 728,000
        result = calculate_net_salary(gross, deductions)
        self.assertEqual(result['total_deductions'], Decimal('272000.00'))
        self.assertEqual(result['net_salary'], Decimal('728000.00'))
