from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_welcome_email(employee, password, username=None):
    """
    Sends a welcome email to the new employee with their login credentials.
    """
    subject = f'Welcome to {employee.company.name} - Lifeline HRMS'
    
    # Use provided username or fallback to email
    login_username = username or employee.email
    
    context = {
        'employee_name': employee.full_name,
        'company_name': employee.company.name,
        'username': login_username,
        'password': password,
        'login_url': f'{settings.FRONTEND_URL}/login'
    }
    
    message = f"""
    Hello {employee.full_name},
    
    Welcome to {employee.company.name}!
    
    Your employee account has been created on the Lifeline HRMS platform.
    
    Below are your login credentials:
    Username/Email: {login_username}
    Password: {password}
    
    Please log in here: {settings.FRONTEND_URL}/login
    
    For security reasons, we recommend you change your password after your first login.
    
    Best regards,
    The {employee.company.name} HR Team
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [employee.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        pass
        return False
