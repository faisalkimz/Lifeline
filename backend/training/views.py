from rest_framework import viewsets, filters 
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, TrainingSession, Enrollment
from .serializers import CourseSerializer, TrainingSessionSerializer, EnrollmentSerializer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'provider']

    def get_queryset(self):
        return Course.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class TrainingSessionViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TrainingSession.objects.filter(course__company=self.request.user.company)

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Enrollment.objects.filter(session__course__company=user.company)
        
        if self.request.query_params.get('my_training'):
            if hasattr(user, 'employee'):
                queryset = queryset.filter(employee=user.employee)
                
        return queryset

    def perform_create(self, serializer):
        # Allow self-enrollment if employee
        if not serializer.validated_data.get('employee'):
             if hasattr(self.request.user, 'employee'):
                 serializer.save(employee=self.request.user.employee)
        else:
            serializer.save()
