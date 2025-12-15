from rest_framework import serializers
from .models import Resignation, ExitInterview

class ResignationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = Resignation
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at', 'submission_date']

class ExitInterviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='resignation.employee.full_name', read_only=True)

    class Meta:
        model = ExitInterview
        fields = '__all__'
