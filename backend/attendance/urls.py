from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AttendancePolicyViewSet, AttendanceViewSet,
    OvertimeRequestViewSet, AttendanceReportViewSet
)

router = DefaultRouter()
router.register(r'policies', AttendancePolicyViewSet, basename='attendance-policy')
router.register(r'records', AttendanceViewSet, basename='attendance')
router.register(r'overtime', OvertimeRequestViewSet, basename='overtime')
router.register(r'reports', AttendanceReportViewSet, basename='attendance-report')

urlpatterns = [
    path('', include(router.urls)),
]
