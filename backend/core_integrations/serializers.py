from rest_framework import serializers
from .models import ExternalIntegration

class ExternalIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalIntegration
        fields = [
            'id', 'provider', 'client_id', 'client_secret', 'tenant_id',
            'is_active', 'status', 'last_synced', 'region', 'bucket_name', 
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_synced']
        extra_kwargs = {
            'client_secret': {'write_only': True}
        }
