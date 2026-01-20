from rest_framework.routers import DefaultRouter
from .views import FormTemplateViewSet, FormSubmissionViewSet

router = DefaultRouter()
router.register(r'templates', FormTemplateViewSet, basename='form-template')
router.register(r'submissions', FormSubmissionViewSet, basename='form-submission')

urlpatterns = router.urls
