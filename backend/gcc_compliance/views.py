from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import GCCPayrollSettings, GratuityRecord
from .serializers import GCCPayrollSettingsSerializer, GratuityRecordSerializer

class GCCSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = GCCPayrollSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GCCPayrollSettings.objects.filter(company=self.request.user.company)

    def list(self, request, *args, **kwargs):
        settings = self.get_queryset().first()
        if not settings:
            return Response({})
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        settings, created = GCCPayrollSettings.objects.update_or_create(
            company=request.user.company,
            defaults=request.data
        )
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

class GratuityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GratuityRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GratuityRecord.objects.filter(employee__company=self.request.user.company).order_by('-accrued_amount')
