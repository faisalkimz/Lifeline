from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet, DocumentViewSet, EmployeeDocumentViewSet, DocumentSignatureViewSet

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folders')
router.register(r'company', DocumentViewSet, basename='company-documents')
router.register(r'employee', EmployeeDocumentViewSet, basename='employee-documents')
router.register(r'signatures', DocumentSignatureViewSet, basename='document-signatures')

urlpatterns = [
    path('', include(router.urls)),
]
