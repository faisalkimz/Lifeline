from rest_framework import serializers
from .models import ExpenseCategory, ExpenseClaim, ExpenseReimbursement


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ExpenseClaimSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField()
    category_name = serializers.ReadOnlyField()
    approver_name = serializers.ReadOnlyField()
    
    class Meta:
        model = ExpenseClaim
        fields = [
            'id', 'employee', 'employee_name', 'category', 'category_name',
            'title', 'description', 'amount', 'currency', 'expense_date',
            'receipt', 'status', 'approved_by', 'approver_name', 'approved_at',
            'rejection_reason', 'payment_date', 'payment_reference',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'employee_name', 'category_name', 'approver_name', 
                           'approved_by', 'approved_at', 'created_at', 'updated_at']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value


class ExpenseReimbursementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseReimbursement
        fields = [
            'id', 'reference', 'total_amount', 'currency', 'payment_date',
            'payment_method', 'notes', 'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
