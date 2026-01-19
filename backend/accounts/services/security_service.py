import pyotp
import qrcode
import io
import base64
from django.utils import timezone
from ..models import SecurityLog, User

class SecurityService:
    @staticmethod
    def generate_2fa_setup(user):
        """
        Generate TOTP secret and QR code for user setup.
        """
        if not user.two_factor_secret:
            user.two_factor_secret = pyotp.random_base32()
            user.save()
            
        totp = pyotp.TOTP(user.two_factor_secret)
        provisioning_url = totp.provisioning_uri(
            name=user.email,
            issuer_name="Lifeline HRMS"
        )
        
        # Generate QR Code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return {
            'secret': user.two_factor_secret,
            'qr_code': f"data:image/png;base64,{qr_code_base64}"
        }

    @staticmethod
    def verify_2fa(user, code):
        """
        Verify TOTP code.
        """
        if not user.two_factor_secret:
            return False
            
        totp = pyotp.TOTP(user.two_factor_secret)
        return totp.verify(code)

    @staticmethod
    def log_security_event(user, company, action, status='success', request=None, description=""):
        """
        Record a security event.
        """
        ip = None
        user_agent = ""
        
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')

        SecurityLog.objects.create(
            user=user,
            company=company,
            action=action,
            status=status,
            ip_address=ip,
            user_agent=user_agent,
            description=description
        )

    @staticmethod
    def get_user_data_export(user):
        """
        Collect all data related to a user for GDPR export.
        """
        # This is high-level, should include all related models
        data = {
            'user_profile': {
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'company': user.company.name,
                'date_joined': user.date_joined.isoformat(),
            },
            'security_logs': list(user.security_logs.values('action', 'status', 'created_at', 'ip_address')),
            # Add more related data here (e.g., employee record, attendance, leave)
        }
        
        if user.employee:
            data['employee_record'] = {
                'employee_number': user.employee.employee_number,
                'job_title': user.employee.job_title,
                'join_date': user.employee.join_date.isoformat(),
            }
            
        return data
