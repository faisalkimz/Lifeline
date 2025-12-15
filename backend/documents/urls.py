from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, EmployeeDocumentViewSet

router = DefaultRouter()
router.register(r'company', DocumentViewSet, basename='company-documents')
router.register(r'employee', EmployeeDocumentViewSet, basename='employee-documents')

urlpatterns = [
    path('', include(router.urls)),
]
