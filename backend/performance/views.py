from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import PerformanceCycle, Goal, PerformanceReview
from .serializers import (
    PerformanceCycleSerializer, 
    GoalSerializer, 
    PerformanceReviewSerializer,
    ReviewStatsSerializer
)
from django.db.models import Avg, Count
from django.utils import timezone

class PerformanceCycleViewSet(viewsets.ModelViewSet):
    serializer_class = PerformanceCycleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PerformanceCycle.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        queryset = Goal.objects.filter(company=user.company)

        # Filter by employee
        if self.request.query_params.get('my_goals'):
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(employee=user.employee)

        # Filter by cycle
        cycle_id = self.request.query_params.get('cycle')
        if cycle_id:
            queryset = queryset.filter(cycle_id=cycle_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        # If employee not specified, assume self if employee exists
        employee = serializer.validated_data.get('employee')
        if not employee and hasattr(user, 'employee') and user.employee:
            employee = user.employee
            
        serializer.save(company=user.company, employee=employee)

    @action(detail=False, methods=['get'])
    def team_goals(self, request):
        """Get goals for clear team view"""
        if not hasattr(request.user, 'employee') or not request.user.employee:
            return Response({"error": "No employee record"}, status=400)

        subordinates = request.user.employee.subordinates.all()
        goals = Goal.objects.filter(employee__in=subordinates).order_by('employee')
        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = PerformanceReview.objects.filter(cycle__company=user.company)

        # Filter logic
        if self.request.query_params.get('my_reviews'):
            # Reviews WHERE I am the subject
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(employee=user.employee)

        if self.request.query_params.get('to_review'):
             # Reviews WHERE I am the reviewer
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(reviewer=user.employee)

        cycle_id = self.request.query_params.get('cycle')
        if cycle_id:
            queryset = queryset.filter(cycle_id=cycle_id)

        return queryset

    def perform_create(self, serializer):
        # Auto-calculate rating on create
        instance = serializer.save()
        instance.calculate_overall()

    def perform_update(self, serializer):
        # Auto-calculate rating on update
        instance = serializer.save()
        instance.calculate_overall()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = self.request.user
        queryset = self.get_queryset()

        total = queryset.count()
        completed = queryset.filter(status__in=['submitted', 'acknowledged']).count()
        avg_rating = queryset.aggregate(Avg('overall_rating'))['overall_rating__avg'] or 0

        active_goals = 0
        if hasattr(user, 'employee') and user.employee:
            active_goals = Goal.objects.filter(employee=user.employee, status__in=['pending', 'in_progress']).count()

        return Response({
            "total_reviews": total,
            "completed_reviews": completed,
            "pending_reviews": total - completed,
            "average_rating": round(avg_rating, 2),
            "active_goals": active_goals
        })
