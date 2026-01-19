"""
API Views for accounts app.
Handles authentication, company, and user management.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate

from .models import Company, User
from .serializers import (
    CompanySerializer, CompanyCreateSerializer,
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    RegisterSerializer, ChangePasswordSerializer
)
from .permissions import IsCompanyUser, IsCompanyAdmin, IsOwnerOrAdmin
from .services.security_service import SecurityService
from .models import SecurityLog


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for company registration.
    Creates a new company and admin user.
    
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Register company and return JWT tokens"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Company registered successfully!',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """
    API endpoint for user login.
    Returns JWT tokens on successful authentication.
    
    POST /api/auth/login/
    Body: {"username": "...", "password": "..."}
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Authenticate user and return tokens"""
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if not user:
            # Handle failed login tracking?
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'User account is disabled'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2FA Check
        if user.two_factor_enabled:
            otp_code = request.data.get('otp_code')
            if not otp_code:
                return Response({
                    'two_factor_required': True,
                    'message': 'Two-factor authentication code required'
                }, status=status.HTTP_200_OK) # Or 401/403, but 200 with flag is common for multi-step
            
            if not SecurityService.verify_2fa(user, otp_code):
                SecurityService.log_security_event(user, user.company, 'login_2fa', 'failure', request, "Invalid OTP")
                return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_401_UNAUTHORIZED)

        # Update login info
        user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.save()
        
        SecurityService.log_security_event(user, user.company, 'login', 'success', request)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class LogoutView(generics.GenericAPIView):
    """
    API endpoint for user logout.
    Blacklists the refresh token.
    
    POST /api/auth/logout/
    Body: {"refresh": "..."}
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout user by blacklisting refresh token"""
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    API endpoint to get/update current user's profile.
    
    GET /api/auth/me/
    PUT/PATCH /api/auth/me/
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Return current user"""
        return self.request.user
    
    def get_serializer_class(self):
        """Use update serializer for PUT/PATCH"""
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer


class ChangePasswordView(generics.UpdateAPIView):
    """
    API endpoint for changing password.
    
    PUT /api/auth/change-password/
    Body: {"old_password": "...", "new_password": "...", "new_password2": "..."}
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Return current user"""
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        """Change user password"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class CompanyViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Company management.
    
    GET    /api/companies/          - List companies (super admin only)
    POST   /api/companies/          - Create company (super admin only)
    GET    /api/companies/:id/      - Retrieve company details
    PUT    /api/companies/:id/      - Update company
    DELETE /api/companies/:id/      - Delete company (super admin only)
    GET    /api/companies/my/       - Get current user's company
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    
    def get_queryset(self):
        """Filter companies based on user role"""
        user = self.request.user
        
        # Super admins see all companies
        if user.role == 'super_admin':
            return Company.objects.all()
        
        # Regular users only see their own company
        return Company.objects.filter(id=user.company.id)
    
    def get_serializer_class(self):
        """Use create serializer for POST"""
        if self.action == 'create':
            return CompanyCreateSerializer
        return CompanySerializer
    
    @action(detail=False, methods=['get'])
    def my(self, request):
        """Get current user's company"""
        serializer = self.get_serializer(request.user.company)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get company statistics"""
        company = self.get_object()
        
        stats = {
            'employee_count': company.employee_count,
            'department_count': company.departments.count(),
            'user_count': company.users.count(),
            'active_employees': company.employees.filter(employment_status='active').count(),
            'is_subscription_active': company.is_subscription_active,
            'subscription_tier': company.subscription_tier,
        }
        
        return Response(stats)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoints for User management.
    
    GET    /api/users/          - List users (company-scoped)
    POST   /api/users/          - Create user (company admin only)
    GET    /api/users/:id/      - Retrieve user details
    PUT    /api/users/:id/      - Update user
    DELETE /api/users/:id/      - Delete user (company admin only)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    
    def get_queryset(self):
        """Filter users by company"""
        user = self.request.user
        
        # Super admins see all users
        if user.role == 'super_admin':
            return User.objects.all().select_related('company')
        
        # Regular users only see users from their company
        return User.objects.filter(company=user.company).select_related('company')
    
    def get_serializer_class(self):
        """Use appropriate serializer based on action"""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def create(self, request, *args, **kwargs):
        """Create user (set company from request user)"""
        # Company admins can create users for their company
        if request.user.role not in ['company_admin', 'super_admin']:
            return Response(
                {'error': 'Only company administrators can create users'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Set company to current user's company unless super admin
        data = request.data.copy()
        if request.user.role != 'super_admin':
            data['company'] = request.user.company.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(
            UserSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED
        )
    
    def destroy(self, request, *args, **kwargs):
        """Delete user (company admin only)"""
        if request.user.role not in ['company_admin', 'super_admin']:
            return Response(
                {'error': 'Only company administrators can delete users'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        
        # Prevent deleting yourself
        if instance == request.user:
            return Response(
                {'error': 'You cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class SecurityViewSet(viewsets.ViewSet):
    """
    API endpoints for Security, 2FA, and Compliance.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def setup_2fa(self, request):
        """Get 2FA setup data (QR code)"""
        data = SecurityService.generate_2fa_setup(request.user)
        return Response(data)

    @action(detail=False, methods=['post'])
    def enable_2fa(self, request):
        """Verify and enable 2FA"""
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if SecurityService.verify_2fa(request.user, code):
            request.user.two_factor_enabled = True
            request.user.save()
            SecurityService.log_security_event(request.user, request.user.company, '2fa_enable', 'success', request)
            return Response({'message': '2FA enabled successfully'})
        
        return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def disable_2fa(self, request):
        """Disable 2FA"""
        password = request.data.get('password')
        if not request.user.check_password(password):
            return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)
            
        request.user.two_factor_enabled = False
        request.user.save()
        SecurityService.log_security_event(request.user, request.user.company, '2fa_disable', 'success', request)
        return Response({'message': '2FA disabled successfully'})

    @action(detail=False, methods=['get'])
    def logs(self, request):
        """Get security logs for current user"""
        logs = SecurityLog.objects.filter(user=request.user)[:50]
        data = [{
            'action': log.action,
            'status': log.status,
            'ip': log.ip_address,
            'created_at': log.created_at,
            'description': log.description
        } for log in logs]
        return Response(data)

    @action(detail=False, methods=['get'])
    def export_data(self, request):
        """GDPR Data Export"""
        data = SecurityService.get_user_data_export(request.user)
        SecurityService.log_security_event(request.user, request.user.company, 'gdpr_export', 'success', request)
        return Response(data)
