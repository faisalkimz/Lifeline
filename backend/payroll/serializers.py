"""
Payroll serializers for API endpoints.
"""
from rest_framework import serializers
from .models import SalaryStructure, PayrollRun, Payslip, SalaryAdvance
from .utils import calculate_net_salary, get_tax_bracket_info


class SalaryStructureSerializer(serializers.ModelSerializer):
    """Serializer for SalaryStructure model"""

    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    department = serializers.CharField(source='employee.department.name', read_only=True)
    total_allowances = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SalaryStructure
        fields = [
            'id', 'employee', 'employee_name', 'employee_number', 'department',
            'effective_date', 'basic_salary', 'housing_allowance', 'transport_allowance',
            'medical_allowance', 'lunch_allowance', 'other_allowances',
            'gross_salary', 'total_allowances', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'gross_salary', 'total_allowances', 'company']

    def create(self, validated_data):
        request = self.context['request']
        user = request.user

        if not user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        # This is the KEY: Get company from the selected employee
        employee = validated_data.get('employee')
        if not employee:
            raise serializers.ValidationError("Employee is required.")

        # Critical security check
        if not hasattr(employee, 'company') or not employee.company:
            raise serializers.ValidationError(
                "Selected employee has no company assigned. Contact admin."
            )

        # This ensures no data leakage — company comes from employee, not user
        validated_data['company'] = employee.company

        # Optional: audit trail
        validated_data['created_by'] = user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        employee = validated_data.get('employee', instance.employee)
        if employee and employee.company:
            validated_data['company'] = employee.company

        return super().update(instance, validated_data)
class PayrollRunSerializer(serializers.ModelSerializer):
    """Serializer for PayrollRun model"""

    company_name = serializers.CharField(source='company.name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    payslip_count = serializers.SerializerMethodField()
    
    def create(self, validated_data):
        request = self.context['request']
        user = request.user

        if not user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        if hasattr(user, 'employee') and user.employee and user.employee.company:
            validated_data['company'] = user.employee.company
        else:
            raise serializers.ValidationError("Cannot determine company for payroll run.")

        validated_data['processed_by'] = user
        return super().create(validated_data)

    class Meta:
        model = PayrollRun
        fields = [
            'id', 'company', 'company_name', 'month', 'year', 'status',
            'total_gross', 'total_deductions', 'total_net',
            'payslip_count', 'processed_by', 'processed_by_name', 'processed_at',
            'approved_by', 'approved_by_name', 'approved_at'
        ]
        read_only_fields = ['id', 'payslip_count']

    def get_payslip_count(self, obj):
        """Get count of payslips in this payroll run"""
        return obj.payslips.count()


class PayslipSerializer(serializers.ModelSerializer):
    """Serializer for Payslip model"""

    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    department = serializers.CharField(source='employee.department.name', read_only=True)
    payroll_period = serializers.SerializerMethodField()

    class Meta:
        model = Payslip
        fields = [
            'id', 'payroll_run', 'payroll_period', 'employee', 'employee_name',
            'employee_number', 'department', 'basic_salary', 'allowances', 'bonuses',
            'gross_salary', 'paye_tax', 'nssf_employee', 'nssf_employer',
            'loan_deduction', 'advance_deduction', 'other_deductions',
            'total_deductions', 'net_salary', 'payment_method', 'payment_status',
            'payment_date', 'payment_reference', 'payslip_file'
        ]
        read_only_fields = ['id', 'total_deductions']

    def get_payroll_period(self, obj):
        """Format payroll period as MM/YYYY"""
        return "02d"

    def create(self, validated_data):
        """Auto-calculate deductions and net salary"""
        employee = validated_data['employee']
        gross_salary = validated_data['gross_salary']

        # Get current salary structure for calculations
        salary_structure = SalaryStructure.objects.filter(
            employee=employee
        ).order_by('-effective_date').first()

        if salary_structure:
            # Calculate tax and deductions
            calculations = calculate_net_salary(
                salary_structure.gross_salary,
                {
                    'loan_deduction': validated_data.get('loan_deduction', 0),
                    'advance_deduction': validated_data.get('advance_deduction', 0),
                    'other_deductions': validated_data.get('other_deductions', 0),
                }
            )

            # Update validated data with calculations
            validated_data.update({
                'basic_salary': salary_structure.basic_salary,
                'allowances': salary_structure.total_allowances,
                'paye_tax': calculations['paye_tax'],
                'nssf_employee': calculations['nssf_employee'],
                'nssf_employer': calculations['nssf_employer'],
                'total_deductions': calculations['total_deductions'],
                'net_salary': calculations['net_salary'],
            })

        return super().create(validated_data)


class PayslipDetailSerializer(PayslipSerializer):
    """Detailed payslip serializer with tax bracket info"""

    tax_bracket_info = serializers.SerializerMethodField()

    class Meta(PayslipSerializer.Meta):
        fields = PayslipSerializer.Meta.fields + ['tax_bracket_info']

    def get_tax_bracket_info(self, obj):
        """Get tax bracket information for the gross salary"""
        return get_tax_bracket_info(obj.gross_salary)


class SalaryAdvanceSerializer(serializers.ModelSerializer):
    """Serializer for SalaryAdvance model"""

    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = SalaryAdvance
        fields = [
            'id', 'employee', 'employee_name', 'employee_number', 'amount',
            'loan_type', 'loan_purpose', 'approved_by', 'approved_by_name',
            'approved_at', 'repayment_period_months', 'monthly_deduction',
            'amount_repaid', 'balance', 'status', 'is_overdue',
            'created_at', 'requested_at', 'completed_at'
        ]
        read_only_fields = ['id', 'balance', 'is_overdue', 'approved_at', 'completed_at']

    def create(self, validated_data):
        """Auto-calculate monthly deduction if not provided"""
        loan_amount = validated_data['amount']
        months = validated_data.get('repayment_period_months', 1)

        if 'monthly_deduction' not in validated_data or validated_data['monthly_deduction'] == 0:
            validated_data['monthly_deduction'] = loan_amount / months

        return super().create(validated_data)


class PayrollSummarySerializer(serializers.Serializer):
    """Serializer for payroll summary statistics"""

    total_employees = serializers.IntegerField()
    total_gross = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_deductions = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_net = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_paye_tax = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_nssf = serializers.DecimalField(max_digits=15, decimal_places=2)

