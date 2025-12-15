from rest_framework import serializers
from .models import BenefitType, EmployeeBenefit

class BenefitTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BenefitType
        fields = '__all__'
        read_only_fields = ['company', 'created_at']

class EmployeeBenefitSerializer(serializers.ModelSerializer):
    benefit_name = serializers.CharField(source='benefit_type.name', read_only=True)
    benefit_category = serializers.CharField(source='benefit_type.category', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = EmployeeBenefit
        fields = '__all__'
        read_only_fields = ['created_at']
