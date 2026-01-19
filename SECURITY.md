# 🔐 Security & Compliance Guide

## Overview
Lifeline HRMS implements enterprise-grade security features including Two-Factor Authentication (2FA), comprehensive audit logging, GDPR compliance, and SSO support.

---

## 🛡️ Two-Factor Authentication (2FA)

### Setup Process
1. **Navigate to Settings** → Security Tab
2. **Scan QR Code** with Google Authenticator or Authy
3. **Enter 6-digit code** to verify and enable
4. **Backup your secret** in a secure location

### Backend Implementation
- **Algorithm**: TOTP (Time-based One-Time Password)
- **Library**: `pyotp` for token generation and verification
- **QR Code**: Generated with `qrcode[pil]`
- **Storage**: Secret stored encrypted in `User.two_factor_secret`

### API Endpoints
```
GET  /api/security/setup_2fa/      - Get QR code and secret
POST /api/security/enable_2fa/     - Enable 2FA with verification
POST /api/security/disable_2fa/    - Disable 2FA (requires password)
```

### Login Flow with 2FA
1. User enters username/password
2. If 2FA enabled, backend returns `two_factor_required: true`
3. Frontend shows OTP input field
4. User enters 6-digit code from authenticator app
5. Backend verifies code and issues JWT tokens

---

## 📊 Security Audit Logs

### What's Logged
- **Login attempts** (success/failure)
- **2FA events** (enable, disable, failed verification)
- **Password changes**
- **GDPR data exports**
- **Account modifications**

### Log Structure
```python
{
    "user": User object,
    "company": Company object,
    "action": "login" | "2fa_enable" | "password_change" | etc,
    "status": "success" | "failure",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "description": "Additional context",
    "created_at": timestamp
}
```

### Viewing Logs
- **User View**: Settings → Security → Recent Security Activity
- **Admin View**: Full audit trail accessible via Django Admin
- **API**: `GET /api/security/logs/` (last 50 events)

### Database Indexes
Optimized queries on:
- `company` + `action`
- `user` + `action`
- `created_at` (descending)

---

## 🌍 GDPR Compliance

### Data Subject Rights
1. **Right to Access** - Users can export their data
2. **Right to Consent** - Explicit consent tracking
3. **Right to Erasure** - Account deactivation (admin-controlled deletion)
4. **Right to Portability** - JSON export of all personal data

### Data Export
**Endpoint**: `GET /api/security/export_data/`

**Includes**:
- User profile information
- Employee record (if linked)
- Security logs
- Leave requests
- Attendance records
- Performance reviews
- Training enrollments

**Format**: JSON (easily parseable)

### Consent Tracking
```python
User.data_consent = True/False
User.data_consent_at = timestamp
User.marketing_consent = True/False
```

### Account Deactivation
- Sets `User.is_active = False`
- Preserves data for compliance
- Can be reactivated by admin
- Full deletion requires admin action

---

## 🔑 Single Sign-On (SSO)

### Supported Providers
1. **Google OAuth 2.0**
2. **Microsoft Azure AD / Office 365**
3. **LinkedIn**

### Configuration
Set environment variables:
```bash
# Google
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_secret

# Microsoft
MICROSOFT_OAUTH_CLIENT_ID=your_client_id
MICROSOFT_OAUTH_CLIENT_SECRET=your_secret

# LinkedIn
LINKEDIN_OAUTH_CLIENT_ID=your_client_id
LINKEDIN_OAUTH_CLIENT_SECRET=your_secret
```

### OAuth Flow
1. User clicks "Sign in with Google/Microsoft/LinkedIn"
2. Redirected to provider's consent screen
3. User authorizes Lifeline HRMS
4. Provider redirects back with authorization code
5. Backend exchanges code for access token
6. User profile created/linked automatically
7. JWT tokens issued for session

### Security Features
- **State parameter** prevents CSRF attacks
- **HTTPS required** in production
- **Scope limitation** (only email + profile)
- **Token refresh** handled automatically

---

## 🔒 Password Security

### Policy
- **Minimum length**: 8 characters
- **Complexity**: Must include letters, numbers, and symbols
- **Expiry**: Recommended change every 90 days
- **History**: Previous 5 passwords cannot be reused (future enhancement)

### Storage
- **Algorithm**: Django's default (PBKDF2 with SHA256)
- **Salting**: Automatic per-password
- **Iterations**: 600,000+ (configurable)

### Password Change
**Endpoint**: `PUT /api/auth/change-password/`
```json
{
  "old_password": "current_password",
  "new_password": "new_secure_password",
  "new_password2": "new_secure_password"
}
```

---

## 🚨 Account Lockout

### Failed Login Protection
```python
User.failed_login_attempts = 0-5
User.locked_until = timestamp or None
```

### Lockout Rules
- **Threshold**: 5 failed attempts
- **Duration**: 15 minutes
- **Reset**: Successful login resets counter
- **Notification**: Email sent to user (if configured)

---

## 📱 Session Management

### JWT Tokens
- **Access Token**: 1 hour expiry
- **Refresh Token**: 7 days expiry
- **Blacklisting**: Logout invalidates refresh token

### Session Tracking
```python
User.last_login_ip = "192.168.1.1"
User.last_login_device = "Chrome on Windows"
User.password_changed_at = timestamp
```

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)

---

## 🧪 Testing Security Features

### Backend Tests
```bash
cd backend
python manage.py test accounts.tests.SecurityTests
```

### Manual Testing Checklist
- [ ] Enable 2FA and verify login requires OTP
- [ ] Disable 2FA and verify normal login works
- [ ] Check audit logs appear for all actions
- [ ] Export GDPR data and verify completeness
- [ ] Test SSO login with Google/Microsoft
- [ ] Verify account lockout after 5 failed attempts
- [ ] Test password change with old/new validation

---

## 🔧 Troubleshooting

### 2FA Not Working
1. Check time sync on server and mobile device
2. Verify `pyotp` is installed: `pip list | grep pyotp`
3. Check `User.two_factor_secret` is set
4. Ensure QR code displays correctly

### SSO Redirect Issues
1. Verify OAuth credentials in environment variables
2. Check redirect URI matches provider configuration
3. Ensure HTTPS in production (`SOCIAL_AUTH_REDIRECT_IS_HTTPS`)
4. Review Django logs for OAuth errors

### Audit Logs Missing
1. Check `SecurityLog` model exists in database
2. Verify `SecurityService.log_security_event()` is called
3. Check database indexes are created
4. Review Django admin for raw log entries

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Official Text](https://gdpr-info.eu/)
- [Django Security Best Practices](https://docs.djangoproject.com/en/stable/topics/security/)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)

---

**Last Updated**: January 19, 2026  
**Version**: 1.0.0  
**Maintained By**: Lifeline HRMS Security Team
