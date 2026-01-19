from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExternalIntegrationViewSet

router = DefaultRouter()
router.register(r'', ExternalIntegrationViewSet, basename='external-integration')

urlpatterns = [
    path('', include(router.urls)),
]
