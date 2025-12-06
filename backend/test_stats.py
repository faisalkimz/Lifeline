#!/usr/bin/env python
"""
Test script for the employee stats endpoint
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from employees.models import Employee, Department
from employees.serializers import EmployeeListSerializer
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from accounts.models import Company

def test_stats():
    """Test the stats functionality"""
    print("Testing employee stats functionality...")

    # Create a mock request
    factory = RequestFactory()
    request = factory.get('/api/employees/stats/')
    request.user = AnonymousUser()  # This will fail auth, but let's see what happens

    # Try to get some employees
    try:
        employees = Employee.objects.all()[:5]
        print(f"Found {len(employees)} employees")

        for emp in employees:
            print(f"- {emp.full_name} (DOB: {emp.date_of_birth}, Join: {emp.join_date})")

        # Test EmployeeListSerializer
        if employees:
            serializer = EmployeeListSerializer(employees, many=True, context={'request': request})
            data = serializer.data
            print(f"EmployeeListSerializer worked for {len(data)} employees")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_stats()


