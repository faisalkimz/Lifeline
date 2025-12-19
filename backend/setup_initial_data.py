"""
Quick setup script to create initial company and superuser
Run this once to initialize your Lifeline HRMS system
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import Company, User

# Create company
try:
    company = Company.objects.get(name='Lifeline HRMS Demo')
    print(f'✓ Company already exists: {company.name}')
except Company.DoesNotExist:
    company = Company.objects.create(
        name='Lifeline HRMS Demo',
        industry='Technology',
        size='50-100',
        website='https://lifeline-hrms.com'
    )
    print(f'✓ Created company: {company.name}')

# Create superuser
try:
    user = User.objects.get(email='admin@lifeline.com')
    print(f'✓ Superuser already exists: {user.email}')
except User.DoesNotExist:
    user = User.objects.create_superuser(
        email='admin@lifeline.com',
        password='admin123',
        company=company,
        first_name='Admin',
        last_name='User'
    )
    print(f'✓ Created superuser: {user.email}')

print('\n====== SETUP COMPLETE ======')
print(f'Company: {company.name}')
print(f'Admin Email: admin@lifeline.com')
print(f'Password: admin123')
print('\n✓ Login at: http://localhost:8000/admin/')
print('✓ Or use the React frontend: http://localhost:5173/')
print('\n⚠️  IMPORTANT: Change the password after first login!')
