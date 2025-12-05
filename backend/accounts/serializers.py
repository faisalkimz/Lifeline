"""
Serializers for accounts app (Company, User).
Converts Django models to/from JSON for REST API.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Company, User


class CompanySerializer(serializers.ModelSerializer):
    """
    Serializer for Company model.
    Used for listing and viewing company details.
    """
    employee_count = serializers.ReadOnlyField()
    is_subscription_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'slug', 'email', 'phone', 'address', 'city', 'country',
            'tax_id', 'registration_number', 'currency', 'date_format',
            'subscription_tier', 'subscription_start', 'subscription_expires', 
            'max_employees', 'logo', 'is_active', 'employee_count', 
            'is_subscription_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'employee_count', 'is_subscription_active']


class CompanyCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new company.
    Used during company registration.
    """
    class Meta:
        model = Company
        fields = [
            'name', 'email', 'phone', 'address', 'city', 'country',
            'tax_id', 'registration_number', 'currency', 'subscription_tier'
        ]
    
    def validate_name(self, value):
        """Ensure company name is unique"""
        if Company.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A company with this name already exists.")
        return value


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    Used for listing and viewing user details.
    """
    company_name = serializers.CharField(source='company.name', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'company', 'company_name', 'role', 'phone', 'photo', 
            'is_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new user.
    Includes password validation.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2', 
            'first_name', 'last_name', 'company', 'role', 'phone'
        ]
    
    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def validate_email(self, value):
        """Ensure email is unique within the company"""
        company = self.initial_data.get('company')
        if User.objects.filter(email=value, company_id=company).exists():
            raise serializers.ValidationError("A user with this email already exists in this company.")
        return value
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user details.
    Password update is optional.
    """
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'role', 'phone', 
            'photo', 'is_active', 'password'
        ]
    
    def update(self, instance, validated_data):
        """Update user, hash password if provided"""
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for company registration.
    Creates both company and initial admin user.
    """
    # Company fields
    company_name = serializers.CharField(max_length=255)
    company_email = serializers.EmailField()
    company_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    company_address = serializers.CharField(required=False, allow_blank=True)
    company_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    company_country = serializers.CharField(max_length=2, default='UG')
    tax_id = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    # User fields
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirm Password")
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'company_name', 'company_email', 'company_phone', 'company_address',
            'company_city', 'company_country', 'tax_id',
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'phone'
        ]
    
    def validate(self, attrs):
        """Validate passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if company name exists
        if Company.objects.filter(name__iexact=attrs['company_name']).exists():
            raise serializers.ValidationError({"company_name": "A company with this name already exists."})
        
        # Check if username exists globally
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})
        
        return attrs
    
    def create(self, validated_data):
        """Create company and admin user"""
        # Extract company data
        company_data = {
            'name': validated_data.pop('company_name'),
            'email': validated_data.pop('company_email'),
            'phone': validated_data.pop('company_phone', ''),
            'address': validated_data.pop('company_address', ''),
            'city': validated_data.pop('company_city', ''),
            'country': validated_data.pop('company_country', 'UG'),
            'tax_id': validated_data.pop('tax_id', ''),
            'currency': 'UGX',
            'subscription_tier': 'free',  # Start with free tier
        }
        
        # Create company
        company = Company.objects.create(**company_data)
        
        # Extract user data
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        # Create admin user
        user = User.objects.create(
            company=company,
            role='company_admin',
            **validated_data
        )
        user.set_password(password)
        user.save()
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing user password.
    Requires old password for verification.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True, label="Confirm New Password")
    
    def validate(self, attrs):
        """Validate passwords match"""
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
    
    def validate_old_password(self, value):
        """Validate old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def save(self, **kwargs):
        """Update user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
