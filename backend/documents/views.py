from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Folder, Document, EmployeeDocument, DocumentSignature
from .serializers import FolderSerializer, DocumentSerializer, EmployeeDocumentSerializer, DocumentSignatureSerializer

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
        file = self.request.FILES.get('file')
        file_size = file.size if file else 0
        serializer.save(
            company=self.request.user.company, 
            uploaded_by=self.request.user,
            file_size=file_size
        )

    @action(detail=False, methods=['get'])
    def storage_stats(self, request):
        from django.db.models import Sum
        user = request.user
        
        company_docs_size = Document.objects.filter(company=user.company).aggregate(total=Sum('file_size'))['total'] or 0
        emp_docs_size = EmployeeDocument.objects.filter(employee__company=user.company).aggregate(total=Sum('file_size'))['total'] or 0
        
        total_used = company_docs_size + emp_docs_size
        limit = 5 * 1024 * 1024 * 1024 # 5GB Beta Limit
        
        return Response({
            'used_bytes': total_used,
            'limit_bytes': limit,
            'used_display': self._format_size(total_used),
            'limit_display': self._format_size(limit),
            'percentage': round((total_used / limit) * 100, 1) if limit > 0 else 0
        })

    def _format_size(self, bytes):
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes < 1024.0:
                return f"{bytes:.1f} {unit}"
            bytes /= 1024.0
        return f"{bytes:.1f} PB"

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
        file = self.request.FILES.get('file')
        file_size = file.size if file else 0
        serializer.save(uploaded_by=self.request.user, file_size=file_size)

class DocumentSignatureViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSignatureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DocumentSignature.objects.filter(signer=self.request.user).order_by('-signed_at')

    def perform_create(self, serializer):
        serializer.save(
            signer=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT')
        )
