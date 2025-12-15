from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Document, EmployeeDocument
from .serializers import DocumentSerializer, EmployeeDocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'category']

    def get_queryset(self):
        return Document.objects.filter(company=self.request.user.company, is_public=True)

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
        
        return queryset
