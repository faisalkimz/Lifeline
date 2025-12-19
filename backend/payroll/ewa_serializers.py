"""
Early Wage Access (EWA) serializers and API endpoints.
"""
from rest_framework import serializers
from decimal import Decimal
from .ewa_models import EarlyWageAccessConfig, WageAccessRequest
from .models import SalaryAdvance
from employees.models import Employee


class EarlyWageAccessConfigSerializer(serializers.ModelSerializer):
    """Serializer for EWA configuration"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = EarlyWageAccessConfig
        fields = [
            'id', 'company', 'company_name', 'enabled', 'min_tenure_months',
            'min_salary_threshold', 'max_percentage_of_salary', 'max_fixed_amount',
            'max_requests_per_month', 'min_days_between_requests',
            'auto_approve_enabled', 'auto_approve_threshold',
            'default_repayment_months', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']


class WageAccessRequestSerializer(serializers.ModelSerializer):
    """Serializer for creating and viewing EWA requests"""
    
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    advance_amount = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    advance_status = serializers.CharField(source='salary_advance.status', read_only=True)
    advance_id = serializers.IntegerField(source='salary_advance.id', read_only=True)
    amount = serializers.DecimalField(source='salary_advance.amount', max_digits=15, decimal_places=2, read_only=True)
    max_allowed_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = WageAccessRequest
        fields = [
            'id', 'employee', 'employee_name', 'employee_number',
            'request_type', 'advance_amount', 'amount', 'advance_id', 'advance_status',
            'earned_to_date', 'days_worked', 'working_days_in_month',
            'is_eligible', 'eligibility_notes', 'auto_approved',
            'disbursed', 'disbursed_at', 'disbursement_method',
            'max_allowed_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'company', 'earned_to_date', 'days_worked', 'working_days_in_month',
            'is_eligible', 'eligibility_notes', 'auto_approved', 'disbursed',
            'disbursed_at', 'created_at', 'updated_at', 'salary_advance'
        ]
    
    def get_max_allowed_amount(self, obj):
        """Calculate maximum allowed EWA amount for this employee"""
        try:
            config = obj.company.ewa_config
            salary_structure = obj.employee.salary_structure
            
            if not salary_structure:
                return Decimal('0.00')
            
            # Calculate based on percentage
            max_by_percentage = (salary_structure.gross_salary * config.max_percentage_of_salary) / 100
            
            # Apply fixed cap if set
            if config.max_fixed_amount:
                max_allowed = min(max_by_percentage, config.max_fixed_amount)
            else:
                max_allowed = max_by_percentage
            
            # Cannot exceed earned amount
            max_allowed = min(max_allowed, obj.earned_to_date)
            
            return max_allowed
        except:
            return Decimal('0.00')
    
    def create(self, validated_data):
        """Create EWA request with linked salary advance"""
        request = self.context['request']
        user = request.user
        
        # Get employee from validated data
        employee = validated_data.get('employee')
        advance_amount = validated_data.pop('advance_amount')
        
        # Set company from employee
        company = employee.company
        validated_data['company'] = company
        
        # Calculate earned amount
        ewa_request = WageAccessRequest(
            company=company,
            employee=employee,
            request_type=validated_data.get('request_type', 'ewa'),
            disbursement_method=validated_data.get('disbursement_method', 'mobile_money')
        )
        
        # Calculate earned to date
        ewa_request.calculate_earned_to_date()
        
        # Check eligibility
        is_eligible = ewa_request.check_eligibility()
        
        if not is_eligible:
            raise serializers.ValidationError({
                'eligibility': ewa_request.eligibility_notes
            })
        
        # Verify amount is allowed
        max_allowed = self.get_max_allowed_amount(ewa_request)
        if advance_amount > max_allowed: raise serializers.ValidationError({
                'advance_amount': f'Amount exceeds maximum allowed ({max_allowed}). You have earned {ewa_request.earned_to_date} so far this month.'
            })
        
        # Create salary advance (interest-free)
        config = company.ewa_config
        salary_advance = SalaryAdvance.objects.create(
            employee=employee,
            company=company,
            loan_type='salary_advance',
            amount=advance_amount,
            repayment_period_months=config.default_repayment_months,
            interest_rate=Decimal('0.00'),  # EWA is interest-free!
            status='pending',
            created_by=user
        )
        
        # Link salary advance to EWA request
        ewa_request.salary_advance = salary_advance
        
        # Check auto-approval
        if config.auto_approve_enabled and advance_amount <= config.auto_approve_threshold:
            salary_advance.status = 'approved'
            salary_advance.approved_by = user
            salary_advance.approved_at = timezone.now()
            salary_advance.save()
            
            ewa_request.auto_approved = True
        
        ewa_request.save()
        
        return ewa_request


class EmployeeEWAEligibilitySerializer(serializers.Serializer):
    """Serializer for checking employee EWA eligibility"""
    
    is_eligible = serializers.BooleanField()
    eligibility_notes = serializers.CharField()
    earned_to_date = serializers.DecimalField(max_digits=15, decimal_places=2)
    max_allowed_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    days_worked = serializers.IntegerField()
    working_days_in_month = serializers.IntegerField()
    requests_this_month = serializers.IntegerField()
    max_requests_allowed = serializers.IntegerField()
