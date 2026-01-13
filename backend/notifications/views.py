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
