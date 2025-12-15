from rest_framework import serializers
from .models import Job, Candidate, Application, Interview
from employees.serializers import EmployeeSerializer

class JobSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    hiring_manager_name = serializers.CharField(source='hiring_manager.full_name', read_only=True)
    application_count = serializers.IntegerField(source='applications.count', read_only=True)

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at', 'published_at']

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at']

class ApplicationSerializer(serializers.ModelSerializer):
    candidate = CandidateSerializer(read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    candidate_id_write = serializers.IntegerField(write_only=True, required=False) # For creating existing candidate app

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        candidate_id = validated_data.pop('candidate_id_write', None)
        if candidate_id:
            validated_data['candidate_id'] = candidate_id
        return super().create(validated_data)

class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='application.candidate.full_name', read_only=True)
    interviewer_name = serializers.CharField(source='interviewer.full_name', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)

    class Meta:
        model = Interview
        fields = '__all__'
        read_only_fields = ['created_at']
