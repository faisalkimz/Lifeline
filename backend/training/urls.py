from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingProgramViewSet, TrainingSessionViewSet, TrainingEnrollmentViewSet, TrainingDashboardViewSet

router = DefaultRouter()
router.register(r'programs', TrainingProgramViewSet, basename='training-programs')
router.register(r'sessions', TrainingSessionViewSet, basename='training-sessions')
router.register(r'enrollments', TrainingEnrollmentViewSet, basename='training-enrollments')

# Manually register dashboard endpoints
dashboard_view = TrainingDashboardViewSet.as_view({
    'get': 'my_stats'
})

compliance_view = TrainingDashboardViewSet.as_view({
    'get': 'my_compliance'
})

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/my_stats/', dashboard_view, name='training-dashboard-my-stats'),
    path('dashboard/my_compliance/', compliance_view, name='training-dashboard-my-compliance'),
]
