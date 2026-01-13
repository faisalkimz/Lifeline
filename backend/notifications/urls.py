from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, AnnouncementViewSet

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcements')
router.register(r'', NotificationViewSet, basename='notifications')

urlpatterns = router.urls
