"""
Unit tests for Security features.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Company, SecurityLog
from accounts.services.security_service import SecurityService
import pyotp

User = get_user_model()

class SecurityTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Test Security Corp")
        self.user = User.objects.create_user(
            username="testuser",
            email="test@security.com",
            password="TestPass123!",
            company=self.company
        )

    def test_2fa_setup_generates_secret(self):
        """Test that 2FA setup generates a valid secret and QR code"""
        result = SecurityService.generate_2fa_setup(self.user)
        
        self.assertIn('secret', result)
        self.assertIn('qr_code', result)
        self.assertEqual(len(result['secret']), 32)
        self.assertTrue(result['qr_code'].startswith('data:image/png;base64,'))
        
        # Verify secret is saved to user
        self.user.refresh_from_db()
        self.assertEqual(self.user.two_factor_secret, result['secret'])

    def test_2fa_verification_success(self):
        """Test successful 2FA code verification"""
        # Setup 2FA
        SecurityService.generate_2fa_setup(self.user)
        self.user.refresh_from_db()
        
        # Generate valid code
        totp = pyotp.TOTP(self.user.two_factor_secret)
        valid_code = totp.now()
        
        # Verify
        is_valid = SecurityService.verify_2fa(self.user, valid_code)
        self.assertTrue(is_valid)

    def test_2fa_verification_failure(self):
        """Test failed 2FA code verification"""
        SecurityService.generate_2fa_setup(self.user)
        self.user.refresh_from_db()
        
        # Use invalid code
        is_valid = SecurityService.verify_2fa(self.user, "000000")
        self.assertFalse(is_valid)

    def test_security_log_creation(self):
        """Test security event logging"""
        SecurityService.log_security_event(
            user=self.user,
            company=self.company,
            action='test_action',
            status='success',
            description='Test event'
        )
        
        log = SecurityLog.objects.filter(user=self.user, action='test_action').first()
        self.assertIsNotNone(log)
        self.assertEqual(log.status, 'success')
        self.assertEqual(log.description, 'Test event')

    def test_gdpr_data_export(self):
        """Test GDPR data export includes user data"""
        # Create some security logs
        SecurityService.log_security_event(
            user=self.user,
            company=self.company,
            action='login',
            status='success'
        )
        
        export_data = SecurityService.get_user_data_export(self.user)
        
        self.assertIn('user_profile', export_data)
        self.assertIn('security_logs', export_data)
        self.assertEqual(export_data['user_profile']['email'], 'test@security.com')
        self.assertEqual(len(export_data['security_logs']), 1)

    def test_login_with_2fa_enabled(self):
        """Test login flow when 2FA is enabled"""
        self.user.two_factor_enabled = True
        self.user.two_factor_secret = pyotp.random_base32()
        self.user.save()
        
        # First login attempt without OTP
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'TestPass123!'
        })
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get('two_factor_required'))

    def test_security_log_indexes(self):
        """Test that security log model has index configuration"""
        from accounts.models import SecurityLog
        
        # Check that indexes are defined in model Meta
        indexes = SecurityLog._meta.indexes
        self.assertGreaterEqual(len(indexes), 2, "SecurityLog should have at least 2 indexes defined")
