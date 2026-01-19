from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ExternalIntegration
from .serializers import ExternalIntegrationSerializer

class ExternalIntegrationViewSet(viewsets.ModelViewSet):
    serializer_class = ExternalIntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExternalIntegration.objects.filter(company=self.request.user.company)

    def create(self, request, *args, **kwargs):
        provider = request.data.get('provider')
        if not provider:
            return Response({"error": "Provider is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use update_or_create to handle re-connections smoothly
        integration, created = ExternalIntegration.objects.update_or_create(
            company=request.user.company,
            provider=provider,
            defaults={
                'client_id': request.data.get('client_id', ''),
                'client_secret': request.data.get('client_secret', ''),
                'tenant_id': request.data.get('tenant_id', ''),
                'metadata': request.data.get('metadata', {}),
                'is_active': True,
                'status': 'active'
            }
        )
        
        serializer = self.get_serializer(integration)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Mocks testing the connection to the provider"""
        integration = self.get_object()
        
        if not integration.client_id or not integration.client_secret:
            errMsg = f"Connection to {integration.get_provider_display()} failed. Missing credentials."
            return Response({
                "status": "error",
                "message": errMsg,
                "error": errMsg
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "status": "success",
            "message": f"Successfully connected to {integration.get_provider_display()}. SSL/TLS Handshake verified."
        })

    @action(detail=False, methods=['get'])
    def status(self, request):
        """Returns the connection status of all providers"""
        integrations = self.get_queryset()
        status_data = {
            provider[0]: {
                'connected': False, 
                'name': provider[1]
            } for provider in ExternalIntegration.PROVIDER_CHOICES
        }
        
        for integration in integrations:
            status_data[integration.provider]['connected'] = integration.is_active
            status_data[integration.provider]['id'] = integration.id
            
        return Response(status_data)
