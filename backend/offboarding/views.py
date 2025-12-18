from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Resignation, ExitInterview
from .serializers import ResignationSerializer, ExitInterviewSerializer

class ResignationViewSet(viewsets.ModelViewSet):
    serializer_class = ResignationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Resignation.objects.filter(company=user.company)
        
        # Employees/Managers only see their own resignations or subordinates
        if user.role == 'employee':
             queryset = queryset.filter(employee=user.employee) if hasattr(user, 'employee') else queryset.none()
        elif user.role == 'manager':
             # Managers see their own and their subordinates
             if hasattr(user, 'employee'):
                from django.db.models import Q
                queryset = queryset.filter(Q(employee=user.employee) | Q(employee__manager=user.employee))
             else:
                queryset = queryset.none()
                
        return queryset

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            from accounts.permissions import IsHRManagerOrAdmin
            return [IsAuthenticated(), IsHRManagerOrAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'employee'):
             serializer.save(company=self.request.user.company, employee=self.request.user.employee)

class ExitInterviewViewSet(viewsets.ModelViewSet):
    serializer_class = ExitInterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ExitInterview.objects.filter(resignation__company=user.company)
        if user.role == 'employee':
             queryset = queryset.filter(resignation__employee=user.employee) if hasattr(user, 'employee') else queryset.none()
        return queryset
