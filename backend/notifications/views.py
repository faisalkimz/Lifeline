from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            Q(recipient=user) | Q(is_public=True)
        ).select_related('actor', 'recipient')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        # Only recipient can mark as read (unless it's public? Public notifications read-state is tricky per user. 
        # For MVP, we stick to recipient read state. Public notifications might always appear or stay until dismissed? 
        # Actually user can't modify public notification record shared by all.
        # We focus on recipient notifications for mark_read).
        
        if notification.recipient == request.user:
            notification.is_read = True
            notification.save()
            return Response({'status': 'marked as read'})
        return Response({'status': 'ignored'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})
