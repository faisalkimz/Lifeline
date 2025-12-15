from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, PublicJobViewSet, CandidateViewSet, ApplicationViewSet, InterviewViewSet, IntegrationSettingsViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='recruitment-jobs')
router.register(r'candidates', CandidateViewSet, basename='recruitment-candidates')
router.register(r'applications', ApplicationViewSet, basename='recruitment-applications')
router.register(r'interviews', InterviewViewSet, basename='recruitment-interviews')
router.register(r'integrations', IntegrationSettingsViewSet, basename='recruitment-integrations')
# Public jobs are separate to avoid auth mixups
router.register(r'public/jobs', PublicJobViewSet, basename='public-jobs')

urlpatterns = [
    path('', include(router.urls)),
]
