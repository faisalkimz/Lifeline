from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.full_name', read_only=True)
    actor_avatar = serializers.CharField(source='actor.avatar.url', read_only=True, default=None)
    time_since = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'actor', 'actor_name', 'actor_avatar', 
            'verb', 'description', 'is_read', 'is_public', 
            'notification_type', 'created_at', 'time_since'
        ]

    def get_time_since(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at)
