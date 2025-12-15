from rest_framework import serializers
from .models import Course, TrainingSession, Enrollment
from employees.serializers import EmployeeSerializer

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at']

class TrainingSessionSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    enrolled_count = serializers.IntegerField(source='enrollments.count', read_only=True)

    class Meta:
        model = TrainingSession
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    course_title = serializers.CharField(source='session.course.title', read_only=True)
    session_date = serializers.DateTimeField(source='session.start_date', read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['enrolled_at']
