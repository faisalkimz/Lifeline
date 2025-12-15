from rest_framework import serializers
from .models import PerformanceCycle, Goal, PerformanceReview
from employees.serializers import EmployeeSerializer

class PerformanceCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceCycle
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at']

class GoalSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    cycle_name = serializers.CharField(source='cycle.name', read_only=True)

    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at']

class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)
    cycle_name = serializers.CharField(source='cycle.name', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)

    class Meta:
        model = PerformanceReview
        fields = '__all__'
        read_only_fields = ['overall_rating', 'created_at', 'updated_at']

class ReviewStatsSerializer(serializers.Serializer):
    total_reviews = serializers.IntegerField()
    average_rating = serializers.FloatField()
    completed_reviews = serializers.IntegerField()
    pending_reviews = serializers.IntegerField()
