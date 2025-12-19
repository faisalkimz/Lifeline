from rest_framework import serializers
from .models import Folder, Document, EmployeeDocument

class FolderSerializer(serializers.ModelSerializer):
    subfolders = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent', 'company', 'subfolders', 'document_count', 'created_at']
        read_only_fields = ['company', 'created_at']

    def get_subfolders(self, obj):
        if obj.subfolders.exists():
            return FolderSerializer(obj.subfolders.all(), many=True).data
        return []

    def get_document_count(self, obj):
        return obj.documents.count()

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    folder_name = serializers.CharField(source='folder.name', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'company', 'folder', 'folder_name', 'title', 'category', 
            'file', 'description', 'version', 'expiry_date', 'is_public', 
            'is_archived', 'uploaded_by', 'uploaded_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['company', 'created_at', 'updated_at']

class EmployeeDocumentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = EmployeeDocument
        fields = [
            'id', 'employee', 'employee_name', 'title', 'file', 
            'version', 'expiry_date', 'uploaded_by', 'uploaded_by_name', 'created_at'
        ]
        read_only_fields = ['created_at']
