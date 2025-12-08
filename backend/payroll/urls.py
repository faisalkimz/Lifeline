"""
Payroll API URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'salary-structures', views.SalaryStructureViewSet)
router.register(r'payroll-runs', views.PayrollRunViewSet)
router.register(r'payslips', views.PayslipViewSet)
router.register(r'loans', views.LoanViewSet)

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]
