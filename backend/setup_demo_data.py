# Setup script to create demo company and admin user
import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import Company, User
from employees.models import Department, Employee

print("=== LahHR Demo Data Setup ===\n")

# Create demo company
print("Creating demo company...")
company = Company.objects.create(
    name="Tech Solutions Uganda",
    slug="tech-solutions-ug",
    email="info@techsolutions.ug",
    phone="+256 700 123456",
    address="Plot 123, Kampala Road",
    city="Kampala",
    country="UG",
    tax_id="1000123456",
    currency="UGX",
    subscription_tier="professional",
    subscription_start=date.today(),
    subscription_expires=date.today() + timedelta(days=365),
    max_employees=100,
    is_active=True
)
print(f"✅ Company created: {company.name}")

# Create company admin user
print("\nCreating admin user...")
admin_user = User.objects.create_superuser(
    username="admin",
    email="admin@techsolutions.ug",
    password="admin123",
    first_name="Admin",
    last_name="User",
    company=company,
    role="company_admin"
)
print(f"✅ Admin user created: {admin_user.username}")

# Create departments
print("\nCreating departments...")
it_dept = Department.objects.create(
    company=company,
    name="IT Department",
    code="IT",
    description="Information Technology"
)

hr_dept = Department.objects.create(
    company=company,
    name="HR Department",
    code="HR",
    description="Human Resources"
)

finance_dept = Department.objects.create(
    company=company,
    name="Finance Department",
    code="FIN",
    description="Finance & Accounting"
)

print(f"✅ Created {Department.objects.filter(company=company).count()} departments")

# Create sample employee
print("\nCreating sample employee...")
employee = Employee.objects.create(
    company=company,
    first_name="John",
    last_name="Doe",
    date_of_birth=date(1990, 5, 15),
    gender="male",
    national_id="CM12345678901234",
    nssf_number="NSSF123456",
    email="john.doe@techsolutions.ug",
    phone="+256 755 123456",
    department=it_dept,
    job_title="Software Engineer",
    employment_type="full_time",
    employment_status="active",
    join_date=date(2023, 1, 15),
    probation_end_date=date(2023, 4, 15),
    bank_name="Stanbic Bank",
    bank_account_number="9030012345678",
    mobile_money_number="+256 755 123456",
    emergency_contact_name="Jane Doe",
    emergency_contact_phone="+256 755 987654",
    emergency_contact_relationship="Spouse",
    marital_status="married",
    number_of_dependents=2
)
print(f"✅ Employee created: {employee.employee_number} - {employee.full_name}")

print("\n" + "="*50)
print("✨ DEMO DATA SETUP COMPLETE! ✨")
print("="*50)
print(f"\n📊 Summary:")
print(f"   Company: {company.name}")
print(f"   Departments: {Department.objects.filter(company=company).count()}")
print(f"   Employees: {Employee.objects.filter(company=company).count()}")
print(f"\n🔑 Admin Login:")
print(f"   URL: http://localhost:8000/admin")
print(f"   Username: admin")
print(f"   Password: admin123")
print(f"\n🎉 You can now login and see your multi-tenant HR system!")
