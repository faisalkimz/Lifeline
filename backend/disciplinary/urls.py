from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DisciplinaryActionViewSet

router = DefaultRouter()
router.register(r'actions', DisciplinaryActionViewSet, basename='disciplinary-action')

urlpatterns = [
    path('', include(router.urls)),
]
