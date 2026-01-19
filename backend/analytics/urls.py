from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportScheduleViewSet

router = DefaultRouter()
router.register(r'schedules', ReportScheduleViewSet, basename='report-schedule')

urlpatterns = [
    path('', include(router.urls)),
]
