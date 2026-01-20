from rest_framework import serializers
from .models import AssetCategory, Asset, AssetAssignment
from employees.serializers import EmployeeSerializer
from accounts.serializers import UserSerializer

class AssetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCategory
        fields = ['id', 'name', 'description', 'company']
        read_only_fields = ['company']

class AssetSerializer(serializers.ModelSerializer):
    category_details = AssetCategorySerializer(source='category', read_only=True)
    assigned_to_details = EmployeeSerializer(source='assigned_to', read_only=True)
    
    class Meta:
        model = Asset
        fields = [
            'id', 'category', 'category_details', 'name', 'serial_number', 'asset_tag',
            'purchase_date', 'purchase_cost', 'vendor', 'warranty_expiry',
            'status', 'condition', 'image', 'notes', 'assigned_to', 'assigned_to_details',
            'company'
        ]
        read_only_fields = ['company']

class AssetAssignmentSerializer(serializers.ModelSerializer):
    asset_details = AssetSerializer(source='asset', read_only=True)
    employee_details = EmployeeSerializer(source='employee', read_only=True)
    assigned_by_details = UserSerializer(source='assigned_by', read_only=True)
    
    class Meta:
        model = AssetAssignment
        fields = [
            'id', 'asset', 'asset_details', 'employee', 'employee_details',
            'assigned_by', 'assigned_by_details', 'assigned_date', 'return_date',
            'condition_on_checkout', 'condition_on_return', 'notes', 'is_active'
        ]
        read_only_fields = ['assigned_by']
