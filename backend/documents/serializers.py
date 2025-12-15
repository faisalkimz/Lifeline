from rest_framework import serializers
from .models import Document, EmployeeDocument

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.email', read_only=True)

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['company', 'created_at']

class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = '__all__'
        read_only_fields = ['created_at']
