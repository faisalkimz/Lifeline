# payroll/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router ONCE
router = DefaultRouter()

router.register(r'payroll-runs', views.PayrollRunViewSet, basename='payrollrun')
router.register(r'salary-structures', views.SalaryStructureViewSet, basename='salarystructure')
router.register(r'salary-advances', views.SalaryAdvanceViewSet, basename='salaryadvance')
router.register(r'payslips', views.PayslipViewSet, basename='payslip')


urlpatterns = [
    path('', include(router.urls)),
]


