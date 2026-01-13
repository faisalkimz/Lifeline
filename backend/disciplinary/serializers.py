from rest_framework import serializers
from .models import DisciplinaryAction
from employees.serializers import EmployeeListSerializer

class DisciplinaryActionSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    issued_by_name = serializers.ReadOnlyField(source='issued_by.full_name')

    class Meta:
        model = DisciplinaryAction
        fields = '__all__'
        read_only_fields = ('case_id', 'company', 'created_at', 'updated_at')

class DisciplinaryActionListSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    
    class Meta:
        model = DisciplinaryAction
        fields = ('id', 'case_id', 'employee_name', 'reason', 'incident_date', 'severity', 'status', 'created_at')
