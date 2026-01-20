"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),
    
    # API endpoints
    path('api/', include('accounts.urls')),  # Auth, companies, users
    path('api/', include('employees.urls')),  # Departments, employees
    path('api/payroll/', include('payroll.urls')),  # Payroll management
    path('api/leave/', include('leave.urls')),  # Leave Management
    path('api/attendance/', include('attendance.urls')),  # Attendance & Time Tracking
    path('api/performance/', include('performance.urls')),  # Performance Management
    path('api/recruitment/', include('recruitment.urls')),  # Recruitment & ATS
    path('api/training/', include('training.urls')),  # Training
    path('api/benefits/', include('benefits.urls')),  # Benefits
    path('api/documents/', include('documents.urls')),  # Documents
    path('api/offboarding/', include('offboarding.urls')),  # Offboarding
    path('api/disciplinary/', include('disciplinary.urls')),  # Disciplinary
    path('api/notifications/', include('notifications.urls')),  # Notifications
    path('api/expense/', include('expense.urls')),  # Expense claims
    path('api/analytics/', include('analytics.urls')),  # Analytics & Reporting
    path('api/integrations/', include('core_integrations.urls')), # External Integrations
    path('api/assets/', include('assets.urls')), # Assets Management
    path('api/forms/', include('digital_forms.urls')), # Digital Forms
    path('api/surveys/', include('surveys.urls')),   # Surveys & Pulse
    path('api/bot/', include('ai_assistant.urls')),  # AI Bot Assistant

    
    # JWT Token endpoints
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

