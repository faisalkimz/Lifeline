from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import AssetCategory, Asset, AssetAssignment
from .serializers import AssetCategorySerializer, AssetSerializer, AssetAssignmentSerializer
from django.utils import timezone

class AssetCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = AssetCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        return AssetCategory.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'condition', 'category', 'assigned_to']
    search_fields = ['name', 'serial_number', 'asset_tag']
    ordering_fields = ['purchase_date', 'name', 'status']

    def get_queryset(self):
        return Asset.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        asset = self.get_object()
        employee_id = request.data.get('employee_id')
        notes = request.data.get('notes', '')
        assigned_date = request.data.get('assigned_date', timezone.now().date())
        condition = request.data.get('condition', asset.condition)

        if asset.status == 'assigned':
            return Response({'error': 'Asset is already assigned'}, status=status.HTTP_400_BAD_REQUEST)

        # Create assignment record
        from employees.models import Employee
        try:
            employee = Employee.objects.get(id=employee_id, company=request.user.company)
            
            assignment = AssetAssignment.objects.create(
                asset=asset,
                employee=employee,
                assigned_by=request.user,
                assigned_date=assigned_date,
                condition_on_checkout=condition,
                notes=notes,
                is_active=True
            )

            # Update asset status
            asset.status = 'assigned'
            asset.assigned_to = employee
            asset.save()

            return Response(AssetAssignmentSerializer(assignment).data)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def return_asset(self, request, pk=None):
        asset = self.get_object()
        return_date = request.data.get('return_date', timezone.now().date())
        condition = request.data.get('condition', 'good')
        notes = request.data.get('notes', '')

        if asset.status != 'assigned':
            return Response({'error': 'Asset is not currently assigned'}, status=status.HTTP_400_BAD_REQUEST)

        # Find active assignment
        assignment = AssetAssignment.objects.filter(asset=asset, is_active=True).first()
        if assignment:
            assignment.return_date = return_date
            assignment.condition_on_return = condition
            assignment.is_active = False
            assignment.notes += f"\nReturn Notes: {notes}"
            assignment.save()

        # Update asset
        asset.status = 'available'
        asset.assigned_to = None
        asset.condition = condition # Update condition to returned condition
        asset.save()

        return Response({'status': 'Asset returned successfully'})

class AssetAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    # View-only for history, creation handled via Asset actions actions for consistency
    serializer_class = AssetAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'asset', 'is_active']

    def get_queryset(self):
        return AssetAssignment.objects.filter(asset__company=self.request.user.company).order_by('-assigned_date')
