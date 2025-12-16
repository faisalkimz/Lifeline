from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import BenefitType, EmployeeBenefit
from .serializers import BenefitTypeSerializer, EmployeeBenefitSerializer

class BenefitTypeViewSet(viewsets.ModelViewSet):
    serializer_class = BenefitTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return BenefitType.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class EmployeeBenefitViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeBenefitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = EmployeeBenefit.objects.filter(benefit_type__company=user.company)
        
        if self.request.query_params.get('my_benefits'):
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(employee=user.employee)
        
        return queryset
