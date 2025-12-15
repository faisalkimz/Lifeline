from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerformanceCycleViewSet, GoalViewSet, PerformanceReviewViewSet

router = DefaultRouter()
router.register(r'cycles', PerformanceCycleViewSet, basename='performance-cycles')
router.register(r'goals', GoalViewSet, basename='goals')
router.register(r'reviews', PerformanceReviewViewSet, basename='performance-reviews')

urlpatterns = [
    path('', include(router.urls)),
]
