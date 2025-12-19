from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Folder, Document, EmployeeDocument
from .serializers import FolderSerializer, DocumentSerializer, EmployeeDocumentSerializer

class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        return Folder.objects.filter(company=self.request.user.company).order_by('name')

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'category', 'description']

    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.filter(company=user.company, is_archived=False)
        
        # Filter by folder
        folder_id = self.request.query_params.get('folder')
        if folder_id:
            queryset = queryset.filter(folder_id=folder_id)
        elif 'root' in self.request.query_params:
            queryset = queryset.filter(folder__isnull=True)

        # Non-HR/Admin users only see public documents
        if not (user.is_staff or user.groups.filter(name='HR').exists()):
            queryset = queryset.filter(is_public=True)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, uploaded_by=self.request.user)

class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = EmployeeDocument.objects.filter(employee__company=user.company)
        
        if self.request.query_params.get('my_docs'):
            if hasattr(user, 'employee'):
                queryset = queryset.filter(employee=user.employee)
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
