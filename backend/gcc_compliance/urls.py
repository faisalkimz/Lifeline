from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GCCSettingsViewSet, GratuityViewSet

router = DefaultRouter()
router.register(r'settings', GCCSettingsViewSet, basename='gcc-settings')
router.register(r'gratuity', GratuityViewSet, basename='gcc-gratuity')

urlpatterns = [
    path('', include(router.urls)),
]
