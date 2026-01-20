from rest_framework import serializers
from .models import FormTemplate, FormSubmission
from employees.serializers import EmployeeSerializer

class FormTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormTemplate
        fields = ['id', 'name', 'description', 'fields_config', 'is_active', 'created_at']
        read_only_fields = ['company']

class FormSubmissionSerializer(serializers.ModelSerializer):
    template_details = FormTemplateSerializer(source='template', read_only=True)
    employee_details = EmployeeSerializer(source='employee', read_only=True)
    
    class Meta:
        model = FormSubmission
        fields = [
            'id', 'template', 'template_details', 'employee', 'employee_details',
            'submission_data', 'status', 'reviewed_by', 'review_notes', 'created_at'
        ]
        read_only_fields = ['reviewed_by', 'employee']
