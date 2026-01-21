from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_welcome_email(employee, password):
    """
    Sends a welcome email to the new employee with their auto-generated password.
    """
    subject = f'Welcome to {employee.company.name} - Lifeline HRMS'
    
    context = {
        'employee_name': employee.full_name,
        'company_name': employee.company.name,
        'username': employee.email,
        'password': password,
        'login_url': f'{settings.FRONTEND_URL}/login'
    }
    
    # In a real app, we would use a template
    # For now, let's use a simple string
    message = f"""
    Hello {employee.full_name},
    
    Welcome to {employee.company.name}!
    
    Your employee account has been created on the Lifeline HRMS platform.
    
    Below are your login credentials:
    Username: {employee.email}
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
