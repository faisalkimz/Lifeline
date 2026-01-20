from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, AnnouncementViewSet, PushSubscriptionViewSet

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcements')
router.register(r'subscriptions', PushSubscriptionViewSet, basename='push-subscriptions')
router.register(r'', NotificationViewSet, basename='notifications')

urlpatterns = router.urls
