# 🚀 Quick Setup Guide - Security Features

## Prerequisites
The security features require additional Python packages. These have been added to `requirements.txt`.

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

Or install individually:
```bash
pip install pyotp qrcode[pil] social-auth-app-django
```

### 2. Run Migrations
```bash
python manage.py migrate
```

This creates the `SecurityLog` table and adds security fields to the `User` model.

### 3. Restart the Server
```bash
python manage.py runserver
```

## Verification

### Test 2FA Setup
1. Navigate to `http://localhost:8000/api/security/setup_2fa/`
2. You should see a JSON response with `secret` and `qr_code`

### Test Security Logs
1. Navigate to `http://localhost:8000/api/security/logs/`
2. You should see an empty array `[]` (no logs yet)

### Run Security Tests
```bash
python manage.py test accounts.tests.test_security
```

Expected output:
```
Ran 7 tests in 3.3s
OK
```

## Frontend Setup

No additional dependencies needed. The frontend already has all required packages.

Just ensure the dev server is running:
```bash
cd frontend
npm run dev
```

## Using 2FA

### Enable 2FA
1. Login to the application
2. Go to **Settings** → **Security** tab
3. Scan the QR code with Google Authenticator or Authy
4. Enter the 6-digit code to verify
5. 2FA is now enabled!

### Login with 2FA
1. Enter username and password
2. You'll see an OTP input field
3. Open your authenticator app
4. Enter the 6-digit code
5. You're logged in!

## Troubleshooting

### "ModuleNotFoundError: No module named 'pyotp'"
**Solution**: Install dependencies
```bash
pip install pyotp qrcode[pil] social-auth-app-django
```

### "Table 'accounts_securitylog' doesn't exist"
**Solution**: Run migrations
```bash
python manage.py migrate
```

### QR Code not displaying
**Solution**: Check that `qrcode[pil]` is installed with PIL support
```bash
pip install qrcode[pil] pillow
```

### 2FA code always invalid
**Solution**: Check time sync on server and mobile device
- Server time must be accurate (use NTP)
- Mobile device time must be set to automatic

## Environment Variables (Optional)

For SSO support, add these to your `.env` file:

```bash
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_secret_here

# Microsoft OAuth
MICROSOFT_OAUTH_CLIENT_ID=your_client_id_here
MICROSOFT_OAUTH_CLIENT_SECRET=your_secret_here

# LinkedIn OAuth
LINKEDIN_OAUTH_CLIENT_ID=your_client_id_here
LINKEDIN_OAUTH_CLIENT_SECRET=your_secret_here
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Run migrations
3. ✅ Restart server
4. ✅ Test 2FA in Settings
5. ✅ Review security logs
6. ✅ Export GDPR data

---

**Need Help?** Check `SECURITY.md` for detailed documentation.
