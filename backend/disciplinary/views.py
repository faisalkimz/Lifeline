from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import DisciplinaryAction
from .serializers import DisciplinaryActionSerializer, DisciplinaryActionListSerializer
from accounts.permissions import IsCompanyUser

class DisciplinaryActionViewSet(viewsets.ModelViewSet):
    queryset = DisciplinaryAction.objects.all()
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'severity', 'employee']
    search_fields = ['case_id', 'reason', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['incident_date', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            from accounts.permissions import IsHRManagerOrAdmin
            return [IsAuthenticated(), IsCompanyUser(), IsHRManagerOrAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        queryset = DisciplinaryAction.objects.filter(company=user.company)
        
        if user.role == 'employee':
            if hasattr(user, 'employee') and user.employee:
                queryset = queryset.filter(employee=user.employee)
            else:
                queryset = queryset.none()
        elif user.role == 'manager':
             if hasattr(user, 'employee') and user.employee:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(employee=user.employee) | Q(employee__manager=user.employee)
                )
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return DisciplinaryActionListSerializer
        return DisciplinaryActionSerializer

    def perform_create(self, serializer):
        serializer.save(
            company=self.request.user.company,
            issued_by=self.request.user.employee if hasattr(self.request.user, 'employee') else None
        )

    @action(detail=True, methods=['post'])
    def submit_statement(self, request, pk=None):
        """Allow employee to submit their statement"""
        action = self.get_object()
        if action.employee.user != request.user:
            return Response(
                {"error": "You can only submit statements for your own cases."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        statement = request.data.get('statement')
        if not statement:
            return Response({"error": "Statement is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        action.employee_statement = statement
        action.status = 'active'
        action.save()
        return Response(DisciplinaryActionSerializer(action).data)
