from rest_framework import serializers
from .models import Survey, SurveyResponse
from employees.serializers import EmployeeSerializer

class SurveySerializer(serializers.ModelSerializer):
    response_count = serializers.IntegerField(source='responses.count', read_only=True)

    class Meta:
        model = Survey
        fields = [
            'id', 'title', 'description', 'survey_type', 'questions_config',
            'is_active', 'is_anonymous', 'start_date', 'end_date', 'created_at',
            'response_count'
        ]
        read_only_fields = ['company']

class SurveyResponseSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = SurveyResponse
        fields = ['id', 'survey', 'employee', 'employee_details', 'answers_data', 'submitted_at']
        read_only_fields = ['employee']
