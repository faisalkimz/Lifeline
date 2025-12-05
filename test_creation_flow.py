#!/usr/bin/env python3
"""
Test script to verify the department and employee creation flow works.
This simulates the API calls that the frontend would make.
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import Company, User
from employees.models import Department, Employee
from django.test import Client
from django.contrib.auth import authenticate
import json

def test_creation_flow():
    """Test the complete creation flow"""
    print("=" * 60)
    print("🧪 TESTING CREATION FLOW")
    print("=" * 60)

    # Get first company and user
    try:
        company = Company.objects.first()
        user = User.objects.filter(company=company).first()

        if not company or not user:
            print("❌ No company or user found. Run registration first.")
            return

        print(f"✅ Using Company: {company.name}")
        print(f"✅ Using User: {user.username}")

        # Test Department Creation (without manager)
        print("\n🏢 Testing Department Creation...")

        department_data = {
            'name': 'IT Department',
            'code': 'IT',
            'description': 'Information Technology Department',
            'is_active': True
        }

        # Simulate authenticated request
        client = Client()
        client.force_login(user)

        response = client.post('/api/departments/', data=department_data)
        print(f"Department creation status: {response.status_code}")

        if response.status_code == 201:
            dept_data = response.json()
            print(f"✅ Department created: {dept_data['name']} (ID: {dept_data['id']})")

            department_id = dept_data['id']
        else:
            print(f"❌ Department creation failed: {response.content}")
            return

        # Test Employee Creation (with department, without manager)
        print("\n👤 Testing Employee Creation...")

        employee_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': f'john.doe@{company.slug}.com',
            'phone': '+256700123456',
            'date_of_birth': '1990-01-01',
            'gender': 'male',
            'national_id': '123456789012',
            'department': department_id,
            'job_title': 'Software Engineer',
            'employment_type': 'full_time',
            'employment_status': 'active',
            'join_date': '2024-01-01'
        }

        response = client.post('/api/employees/', data=employee_data)
        print(f"Employee creation status: {response.status_code}")

        if response.status_code == 201:
            emp_data = response.json()
            print(f"✅ Employee created: {emp_data['full_name']} (ID: {emp_data['id']})")

            employee_id = emp_data['id']
        else:
            print(f"❌ Employee creation failed: {response.content}")
            return

        # Test Manager Assignment
        print("\n👔 Testing Manager Assignment...")

        # Create another employee to be manager
        manager_data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': f'jane.smith@{company.slug}.com',
            'phone': '+256700123457',
            'date_of_birth': '1985-05-15',
            'gender': 'female',
            'national_id': '987654321098',
            'department': department_id,
            'job_title': 'IT Manager',
            'employment_type': 'full_time',
            'employment_status': 'active',
            'join_date': '2023-01-01'
        }

        response = client.post('/api/employees/', data=manager_data)
        if response.status_code == 201:
            manager_data = response.json()
            manager_id = manager_data['id']
            print(f"✅ Manager created: {manager_data['full_name']} (ID: {manager_id})")

            # Assign manager to first employee
            update_data = {'manager': manager_id}
            response = client.patch(f'/api/employees/{employee_id}/', data=update_data, content_type='application/json')
            if response.status_code == 200:
                print("✅ Manager assigned successfully!")
            else:
                print(f"❌ Manager assignment failed: {response.content}")

            # Assign manager to department
            update_data = {'manager': manager_id}
            response = client.patch(f'/api/departments/{department_id}/', data=update_data, content_type='application/json')
            if response.status_code == 200:
                print("✅ Department manager assigned successfully!")
            else:
                print(f"❌ Department manager assignment failed: {response.content}")
        else:
            print(f"❌ Manager creation failed: {response.content}")

        # Verify final state
        print("\n📊 Final State Check...")
        dept = Department.objects.get(id=department_id)
        emp = Employee.objects.get(id=employee_id)

        print(f"Department: {dept.name} - Manager: {dept.manager.full_name if dept.manager else 'None'}")
        print(f"Employee: {emp.full_name} - Manager: {emp.manager.full_name if emp.manager else 'None'}")

        print("\n🎉 CREATION FLOW TEST COMPLETED SUCCESSFULLY! 🎉")

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_creation_flow()
