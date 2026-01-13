
import os
import django
from datetime import date

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Company
from employees.models import Employee, Department
from notifications.models import Announcement

User = get_user_model()

def setup_namuli():
    print("Setting up Namuli...")
    
    # 1. Get or Create Company
    company, created = Company.objects.get_or_create(
        name="Lifeline Tech",
        defaults={
            'email': 'contact@lifeline.com',
            'subscription_tier': 'enterprise',
            'country': 'UG',
            'currency': 'UGX'
        }
    )
    if created:
        print(f"Created company: {company.name}")
    else:
        print(f"Found company: {company.name}")
        
    # 2. Create Departments if missing
    default_depts = ["Management", "Human Resources", "Finance", "Engineering", "Sales", "Operations"]
    created_depts = {}
    for name in default_depts:
        dept, d_created = Department.objects.get_or_create(
            company=company,
            name=name,
            defaults={'code': name[:3].upper()}
        )
        created_depts[name] = dept
        if d_created:
            print(f"Created department: {name}")

    # 3. Create/Update User Namuli
    username = "Namuli"
    email = "namuli@lifeline.com"
    password = "qwertyuiop1234567890"
    
    user, u_created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': 'Namuli',
            'last_name': 'Sarah', # Assuming a last name
            'role': 'company_admin',
            'company': company
        }
    )
    
    # Always set password to ensure it matches user request
    user.set_password(password)
    user.company = company
    user.role = 'company_admin'
    user.is_active = True
    user.save()
    print(f"User {username} updated with requested password.")

    # 4. Create Employee Profile if missing
    if not hasattr(user, 'employee') or not user.employee:
         # Try finding by email first to avoid duplicates
        employee = Employee.objects.filter(email=email, company=company).first()
        
        if not employee:
            admin_dept = created_depts.get("Management")
            employee = Employee.objects.create(
                company=company,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                phone='0700000000',
                date_of_birth=date(1995, 5, 20),
                gender='female',
                national_id=f'NIN-{user.id}',
                join_date=date(2024, 1, 1),
                job_title='HR Manager',
                employment_status='active',
                department=admin_dept
            )
            print("Created Employee profile for Namuli")
        
        user.employee = employee
        user.save()
    else:
        print("Employee profile already exists.")

    # 5. Create the Announcement
    announcement_title = "Quarterly Performance Reviews"
    if not Announcement.objects.filter(company=company, title=announcement_title).exists():
        Announcement.objects.create(
            company=company,
            title=announcement_title,
            content="""The quarterly review period begins next week. Please ensure all employee evaluations are completed and submitted by Friday, January 26th.

Managers are required to schedule 1-on-1 sessions with their direct reports to discuss progress, goals, and feedback. If you have any questions regarding the new evaluation criteria, please refer to the HR Handbook updated on January 2nd.""",
            posted_by=user,
            is_active=True
        )
        print("Created Quarterly Review Announcement")

if __name__ == '__main__':
    try:
        setup_namuli()
        print("Setup complete!")
    except Exception as e:
        print(f"Error: {e}")
