from rest_framework import serializers
from .models import GCCPayrollSettings, GratuityRecord

class GCCPayrollSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GCCPayrollSettings
        fields = '__all__'
        read_only_fields = ['company']

class GratuityRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    
    class Meta:
        model = GratuityRecord
        fields = '__all__'
