"""
URL configuration for accounts app API endpoints.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, LogoutView,
    CurrentUserView, ChangePasswordView,
    CompanyViewSet, UserViewSet, SecurityViewSet,
    RequestPasswordResetView, ResetPasswordView, VerifyResetTokenView
)

# Create router for viewsets
router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'users', UserViewSet, basename='user')
router.register(r'security', SecurityViewSet, basename='security')

urlpatterns = [
    # Authentication endpoints (Dual paths to prevent 301 redirects converting POST to GET)
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/register', RegisterView.as_view(), name='register_noslash'),
    
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/login', LoginView.as_view(), name='login_noslash'),
    
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/logout', LogoutView.as_view(), name='logout_noslash'),
    
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('auth/me', CurrentUserView.as_view(), name='current-user_noslash'),
    
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/request-password-reset/', RequestPasswordResetView.as_view(), name='request-password-reset'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/verify-reset-token/', VerifyResetTokenView.as_view(), name='verify-reset-token'),
    
    # Include router URLs
    path('', include(router.urls)),
]
