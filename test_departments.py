
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Company
from employees.models import Department
from rest_framework.test import APIRequestFactory, force_authenticate
from employees.views import DepartmentViewSet

User = get_user_model()

def test_department_flow():
    print("Setting up test data...")
    # Create Company
    company, _ = Company.objects.get_or_create(name="Test Company", slug="test-company")
    
    # Create User
    user, _ = User.objects.get_or_create(
        username="testadmin",
        email="admin@test.com",
        company=company,
        role="company_admin"
    )
    
    print(f"User: {user} (Company: {user.company})")

    # Initialize ViewSet
    factory = APIRequestFactory()
    view = DepartmentViewSet.as_view({'get': 'list', 'post': 'create'})

    # Test 1: Create Department
    print("\nTest 1: Creating Department...")
    data = {
        "name": "Engineering",
        "code": "ENG",
        "description": "Tech team",
        "is_active": True
    }
    request = factory.post('/api/departments/', data, format='json')
    force_authenticate(request, user=user)
    response = view(request)
    
    if response.status_code == 201:
        print("✅ Department created successfully")
        dept_id = response.data['id']
    else:
        print(f"❌ Failed to create department: {response.status_code} - {response.data}")
        return

    # Test 2: List Departments
    print("\nTest 2: Listing Departments...")
    request = factory.get('/api/departments/')
    force_authenticate(request, user=user)
    response = view(request)
    
    if response.status_code == 200:
        depts = response.data
        print(f"Found {len(depts)} departments")
        found = False
        for d in depts:
            if d['id'] == dept_id:
                found = True
                print(f"✅ Found created department: {d['name']} ({d['company_name']})")
                break
        if not found:
            print("❌ Created department NOT found in list")
    else:
        print(f"❌ Failed to list departments: {response.status_code}")

    # Test 3: Create another department (HR)
    print("\nTest 3: Creating HR Department...")
    data_hr = {
        "name": "Human Resources",
        "code": "HR",
        "description": "People team",
        "is_active": True
    }
    request = factory.post('/api/departments/', data_hr, format='json')
    force_authenticate(request, user=user)
    response = view(request)
    if response.status_code == 201:
        print("✅ HR Department created")
    else:
        print(f"❌ Failed to create HR department: {response.data}")

    # Cleanup
    print("\nCleaning up...")
    Department.objects.filter(company=company).delete()
    # Don't delete user/company to avoid cascading if they existed before

if __name__ == "__main__":
    try:
        test_department_flow()
    except Exception as e:
        print(f"❌ Error: {e}")
