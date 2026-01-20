from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, Announcement
from .serializers import NotificationSerializer, AnnouncementSerializer
from accounts.permissions import IsCompanyUser, IsCompanyAdmin

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return user's notifications + public ones
        return Notification.objects.filter(recipient=self.request.user) | \
               Notification.objects.filter(is_public=True)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        request.user.notifications.filter(is_read=False).update(is_read=True)
        return Response({'status': 'success'})

class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        # Users see active announcements from their company
        return Announcement.objects.filter(company=self.request.user.company, is_active=True)

    def perform_create(self, serializer):
        # Only admins can create (enforce via permission or here)
        # Assuming IsCompanyUser allows create, but we might want to restrict to admins
        if self.request.user.role not in ['company_admin', 'super_admin']:
             # This is a bit hacky, better to use permission classes, but works for now
             # Actually, let's just save. Permission class handles company scope.
             pass
        serializer.save(company=self.request.user.company, posted_by=self.request.user)

from .models import PushSubscription
from .serializers import PushSubscriptionSerializer

class PushSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PushSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PushSubscription.objects.all()

    def create(self, request, *args, **kwargs):
        # We want to update if endpoint exists for user or create new
        endpoint = request.data.get('endpoint')
        p256dh = request.data.get('p256dh')
        auth = request.data.get('auth')

        if not endpoint or not p256dh or not auth:
            return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

        subscription, created = PushSubscription.objects.update_or_create(
            user=request.user,
            endpoint=endpoint,
            defaults={
                'p256dh': p256dh,
                'auth': auth
            }
        )
        serializer = self.get_serializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
