from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseCategoryViewSet, ExpenseClaimViewSet, ExpenseReimbursementViewSet

router = DefaultRouter()
router.register(r'categories', ExpenseCategoryViewSet, basename='expense-category')
router.register(r'claims', ExpenseClaimViewSet, basename='expense-claim')
router.register(r'reimbursements', ExpenseReimbursementViewSet, basename='expense-reimbursement')

urlpatterns = [
    path('', include(router.urls)),
]
