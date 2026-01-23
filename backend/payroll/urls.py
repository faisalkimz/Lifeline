# payroll/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .ewa_views import EarlyWageAccessConfigViewSet, WageAccessRequestViewSet

# Create router ONCE
router = DefaultRouter()

router.register(r'payroll-runs', views.PayrollRunViewSet, basename='payrollrun')
router.register(r'salary-structures', views.SalaryStructureViewSet, basename='salarystructure')
router.register(r'salary-advances', views.SalaryAdvanceViewSet, basename='salaryadvance')
router.register(r'payslips', views.PayslipViewSet, basename='payslip')
router.register(r'tax-settings', views.TaxSettingsViewSet, basename='tax-settings')
# EWA endpoints
router.register(r'ewa-config', EarlyWageAccessConfigViewSet, basename='ewa-config')
router.register(r'ewa-requests', WageAccessRequestViewSet, basename='ewa-request')


urlpatterns = [
    path('', include(router.urls)),
]








