from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResignationViewSet, ExitInterviewViewSet

router = DefaultRouter()
router.register(r'resignations', ResignationViewSet, basename='resignations')
router.register(r'interviews', ExitInterviewViewSet, basename='exit-interviews')

urlpatterns = [
    path('', include(router.urls)),
]
