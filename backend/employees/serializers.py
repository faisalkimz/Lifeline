"""
Serializers for employees app (Department, Employee).
Converts Django models to/from JSON for REST API.
"""
from rest_framework import serializers
from .models import Department, Employee
from accounts.models import Company


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Department model.
    Includes computed fields like employee count.
    """
    company_name = serializers.CharField(source='company.name', read_only=True)
    manager_name = serializers.SerializerMethodField()
    employee_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'company', 'company_name', 'name', 'code', 'description',
            'manager', 'manager_name', 'employee_count', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'employee_count']
    
    def get_manager_name(self, obj):
        """Get manager's full name"""
        if obj.manager:
            return obj.manager.full_name
        return None
    
    def validate(self, attrs):
        """Ensure department name is unique within company"""
        company = attrs.get('company')
        name = attrs.get('name')
        
        # Get instance if updating
        instance = self.instance
        
        # Check for duplicate
        query = Department.objects.filter(company=company, name=name)
        if instance:
            query = query.exclude(pk=instance.pk)
        
        if query.exists():
            raise serializers.ValidationError({
                "name": "A department with this name already exists in this company."
            })
        
        return attrs


class DepartmentCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for creating departments.
    Company is automatically set from request user.
    """
    class Meta:
        model = Department
        fields = ['name', 'code', 'description', 'manager', 'is_active']
    
    def create(self, validated_data):
        """Create department with company from request context"""
        company = self.context['request'].user.company
        return Department.objects.create(company=company, **validated_data)


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for Employee model.
    Includes all fields and related data.
    """
    company_name = serializers.CharField(source='company.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    manager_name = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()
    years_of_service = serializers.ReadOnlyField()
    is_on_probation = serializers.ReadOnlyField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'company', 'company_name', 'employee_number',
            # Personal Information
            'first_name', 'middle_name', 'last_name', 'full_name',
            'date_of_birth', 'gender', 'photo',
            # National ID & Documents
            'national_id', 'passport_number', 'tin_number', 'nssf_number',
            # Contact Information
            'email', 'phone', 'personal_email', 'address', 'city', 'district',
            # Employment Details
            'department', 'department_name', 'job_title',
            'manager', 'manager_name', 'employment_type', 'employment_status',
            # Important Dates
            'join_date', 'probation_end_date', 'confirmation_date',
            'resignation_date', 'last_working_date',
            # Bank Details
            'bank_name', 'bank_account_number', 'bank_branch', 'mobile_money_number',
            # Emergency Contact
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            # Family Information
            'marital_status', 'number_of_dependents',
            # Additional
            'notes', 'years_of_service', 'is_on_probation',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'employee_number', 'full_name', 'years_of_service', 
            'is_on_probation', 'created_at', 'updated_at'
        ]
    
    def get_manager_name(self, obj):
        """Get manager's full name"""
        if obj.manager:
            return obj.manager.full_name
        return None
    
    def validate_email(self, value):
        """Ensure email is unique within company"""
        company = self.context['request'].user.company
        instance = self.instance
        
        query = Employee.objects.filter(company=company, email=value)
        if instance:
            query = query.exclude(pk=instance.pk)
        
        if query.exists():
            raise serializers.ValidationError(
                "An employee with this email already exists in this company."
            )
        
        return value
    
    def validate_national_id(self, value):
        """Ensure national ID is unique within company"""
        company = self.context['request'].user.company
        instance = self.instance
        
        query = Employee.objects.filter(company=company, national_id=value)
        if instance:
            query = query.exclude(pk=instance.pk)
        
        if query.exists():
            raise serializers.ValidationError(
                "An employee with this national ID already exists in this company."
            )
        
        return value


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new employees.
    Company is automatically set, employee number is auto-generated.
    """
    class Meta:
        model = Employee
        fields = [
            # Personal Information (Required)
            'first_name', 'middle_name', 'last_name', 'date_of_birth', 'gender', 'photo',
            # National ID & Documents
            'national_id', 'passport_number', 'tin_number', 'nssf_number',
            # Contact Information
            'email', 'phone', 'personal_email', 'address', 'city', 'district',
            # Employment Details
            'department', 'job_title', 'manager', 'employment_type', 'employment_status',
            # Important Dates
            'join_date', 'probation_end_date', 'confirmation_date',
            # Bank Details
            'bank_name', 'bank_account_number', 'bank_branch', 'mobile_money_number',
            # Emergency Contact
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            # Family Information
            'marital_status', 'number_of_dependents',
            # Notes
            'notes'
        ]
    
    def create(self, validated_data):
        """Create employee with company from request context"""
        company = self.context['request'].user.company
        return Employee.objects.create(company=company, **validated_data)


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for employee lists.
    Only includes essential fields for performance.
    """
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_number', 'full_name', 'email', 'phone',
            'department_name', 'job_title', 'employment_status',
            'join_date', 'photo'
        ]


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating employee details.
    Cannot change company or employee number.
    """
    class Meta:
        model = Employee
        fields = [
            # Personal Information
            'first_name', 'middle_name', 'last_name', 'date_of_birth', 'gender', 'photo',
            # National ID & Documents
            'national_id', 'passport_number', 'tin_number', 'nssf_number',
            # Contact Information
            'email', 'phone', 'personal_email', 'address', 'city', 'district',
            # Employment Details
            'department', 'job_title', 'manager', 'employment_type', 'employment_status',
            # Important Dates
            'join_date', 'probation_end_date', 'confirmation_date',
            'resignation_date', 'last_working_date',
            # Bank Details
            'bank_name', 'bank_account_number', 'bank_branch', 'mobile_money_number',
            # Emergency Contact
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            # Family Information
            'marital_status', 'number_of_dependents',
            # Notes
            'notes'
        ]
