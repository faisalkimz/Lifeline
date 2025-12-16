import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from employees.models import Employee

u = User.objects.first()
print(f'User: {u.username}')
print(f'Has employee attr: {hasattr(u, "employee")}')
if hasattr(u, 'employee'):
    print(f'Employee: {u.employee}')
else:
    print('No employee record found')

# Check if there are any employees at all
employees = Employee.objects.all()
print(f'Total employees: {employees.count()}')
if employees.exists():
    print(f'First employee: {employees.first()}')
