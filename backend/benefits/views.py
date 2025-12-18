from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsCompanyUser
from .models import BenefitType, EmployeeBenefit
from .serializers import BenefitTypeSerializer, EmployeeBenefitSerializer

class BenefitTypeViewSet(viewsets.ModelViewSet):
    serializer_class = BenefitTypeSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    
    def get_queryset(self):
        return BenefitType.objects.filter(company=self.request.user.company)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            from accounts.permissions import IsHRManagerOrAdmin
            return [IsAuthenticated(), IsCompanyUser(), IsHRManagerOrAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class EmployeeBenefitViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeBenefitSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        user = self.request.user
        queryset = EmployeeBenefit.objects.filter(benefit_type__company=user.company)
        
        # Filter for 'my benefits' or if user is just an employee
        if self.request.query_params.get('my_benefits') or user.role == 'employee':
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(employee=user.employee)
            else:
                queryset = queryset.none()
        
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        employee_id = self.request.data.get('employee')
        
        # If employee role, ensure they only enroll themselves
        if user.role == 'employee':
            if not hasattr(user, 'employee') or str(user.employee.id) != str(employee_id):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only enroll for benefits for yourself.")
                
        serializer.save()

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """HR action to approve enrollment"""
        from accounts.permissions import IsHRManagerOrAdmin
        permission = IsHRManagerOrAdmin()
        if not permission.has_permission(request, self):
            return Response({"error": "Permission denied"}, status=403)
            
        benefit = self.get_object()
        benefit.status = 'active'
        benefit.save()
        return Response(EmployeeBenefitSerializer(benefit).data)
