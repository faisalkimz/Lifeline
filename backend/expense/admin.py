from django.contrib import admin
from .models import ExpenseCategory, ExpenseClaim, ExpenseReimbursement


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'is_active', 'created_at']
    list_filter = ['is_active', 'company']
    search_fields = ['name', 'description']


@admin.register(ExpenseClaim)
class ExpenseClaimAdmin(admin.ModelAdmin):
    list_display = ['title', 'employee', 'category', 'amount', 'status', 'expense_date', 'created_at']
    list_filter = ['status', 'category', 'company']
    search_fields = ['title', 'description', 'employee__first_name', 'employee__last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ExpenseReimbursement)
class ExpenseReimbursementAdmin(admin.ModelAdmin):
    list_display = ['reference', 'total_amount', 'payment_date', 'payment_method', 'created_at']
    list_filter = ['payment_method', 'company']
    search_fields = ['reference', 'notes']
    readonly_fields = ['created_at']
