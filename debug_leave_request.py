
import os
import sys
import django

# Setup Django FIRST
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

# NOW import DRF and Models
from rest_framework.test import APIClient
from datetime import date, timedelta
from accounts.models import User, Company
from employees.models import Employee
from leave.models import LeaveType

def debug_leave_request():
    log_file = open('debug_log_final.txt', 'w', encoding='utf-8')
    def log(msg):
        print(msg)
        log_file.write(str(msg) + '\n')

    log("STARTING LEAVE REQUEST DEBUG...")
    
    # 1. Get/Create User & Employee
    company = Company.objects.first()
    if not company:
        log("No company found.")
        return

    user = User.objects.filter(username='debug_emp').first()
    if not user:
        user = User.objects.create_user(
            username='debug_emp',
            email='debug_emp@example.com', 
            password='password123', 
            company=company
        )
        log("Created debug user.")
    else:
        log("Found debug user.")

    if not user.employee:
        emp = Employee.objects.create(
            company=company, 
            first_name='Debug', 
            last_name='Employee',
            employment_status='active',
            date_of_birth='1990-01-01',
            gender='Male',
            national_id='123456789',
            nssf_number='NSSF123',
            tin_number='TIN123',
            # user=user (REMOVED: This field doesn't exist on Employee)
            email='debug_emp@example.com',
            phone='1234567890',
            join_date=str(date.today())
        )
        user.employee = emp
        user.save()
        log("Created debug employee and linked to user.")

    # 2. Get Leave Type
    leave_type = LeaveType.objects.filter(company=company).first()
    if not leave_type:
        leave_type = LeaveType.objects.create(
            company=company, 
            name='Debug Leave', 
            code='DBG', 
            days_per_year=10
        )
        log("created debug leave type")
    
    log(f"Using Leave Type: {leave_type.id} ({leave_type.name})")

    # 3. Test API
    client = APIClient()
    client.force_authenticate(user=user)
    
    payload = {
        'leave_type': leave_type.id,
        'start_date': str(date.today()),
        'end_date': str(date.today() + timedelta(days=2)),
        'reason': 'Debug reason'
    }
    
    log(f"Sending Payload: {payload}")
    
    response = client.post('/api/leave/requests/', payload, format='json', **{'HTTP_HOST': '127.0.0.1'})
    
    log(f"Response Code: {response.status_code}")
    if response.status_code != 201:
        log(f"Error Details: {response.content.decode()}")
    else:
        log("Success!")
    
    log_file.close()

if __name__ == "__main__":
    debug_leave_request()
