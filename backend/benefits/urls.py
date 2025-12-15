from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BenefitTypeViewSet, EmployeeBenefitViewSet

router = DefaultRouter()
router.register(r'types', BenefitTypeViewSet, basename='benefit-types')
router.register(r'enrollments', EmployeeBenefitViewSet, basename='benefit-enrollments')

urlpatterns = [
    path('', include(router.urls)),
]
