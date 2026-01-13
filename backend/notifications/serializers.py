from rest_framework import serializers
from .models import Notification, Announcement
from accounts.serializers import UserSerializer

class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    actor_photo = serializers.ImageField(source='actor.photo', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['recipient', 'actor', 'created_at']

class AnnouncementSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'posted_by', 'posted_by_name', 'created_at', 'is_active']
        read_only_fields = ['company', 'posted_by', 'created_at']
