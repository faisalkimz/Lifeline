from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, TrainingSessionViewSet, EnrollmentViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='training-courses')
router.register(r'sessions', TrainingSessionViewSet, basename='training-sessions')
router.register(r'enrollments', EnrollmentViewSet, basename='training-enrollments')

urlpatterns = [
    path('', include(router.urls)),
]
