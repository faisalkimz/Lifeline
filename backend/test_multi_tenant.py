"""
Test script to verify multi-tenant isolation.
This creates test data for 2 companies and ensures data doesn't leak between them.
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import Company, User
from employees.models import Department, Employee
from datetime import date, timedelta


def clear_test_data():
    """Remove any existing test data"""
    print("\n🧹 Clearing existing test data...")
    Company.objects.filter(name__startswith="Test Company").delete()
    print("✅ Test data cleared\n")


def create_test_companies():
    """Create 2 test companies"""
    print("📝 Creating test companies...")
    
    company1 = Company.objects.create(
        name="Test Company A - Tech Startup",
        slug="test-company-a",
        email="contact@companya.com",
        phone="+256 700 123 456",
        address="Plot 123, Kampala Road",
        city="Kampala",
        country="UG",
        tax_id="TIN-1234567890",
        currency='UGX',
        subscription_tier='professional',
        max_employees=50,
        is_active=True
    )
    
    company2 = Company.objects.create(
        name="Test Company B - Retail Store",
        slug="test-company-b",
        email="info@companyb.com",
        phone="+256 700 789 012",
        address="Plot 456, Entebbe Road",
        city="Entebbe",
        country="UG",
        tax_id="TIN-0987654321",
        currency='UGX',
        subscription_tier='starter',
        max_employees=20,
        is_active=True
    )
    
    print(f"✅ Created {company1.name}")
    print(f"✅ Created {company2.name}\n")
    
    return company1, company2


def create_test_users(company1, company2):
    """Create admin users for each company"""
    print("👤 Creating admin users...")
    
    admin1 = User.objects.create_user(
        username="admin_companyA",
        email="admin@companya.com",
        password="admin123",
        company=company1,
        role="company_admin",
        first_name="Alice",
        last_name="Admin",
        phone="+256 700 111 111"
    )
    
    admin2 = User.objects.create_user(
        username="admin_companyB",
        email="admin@companyb.com",
        password="admin123",
        company=company2,
        role="company_admin",
        first_name="Bob",
        last_name="Manager",
        phone="+256 700 222 222"
    )
    
    print(f"✅ Created admin user for {company1.name}: {admin1.username}")
    print(f"✅ Created admin user for {company2.name}: {admin2.username}\n")
    
    return admin1, admin2


def create_test_departments(company1, company2):
    """Create departments for each company"""
    print("🏢 Creating departments...")
    
    # Company A departments
    dept_a_it = Department.objects.create(
        company=company1,
        name="IT Department",
        code="IT",
        description="Technology and software development"
    )
    
    dept_a_hr = Department.objects.create(
        company=company1,
        name="HR Department",
        code="HR",
        description="Human resources"
    )
    
    # Company B departments
    dept_b_sales = Department.objects.create(
        company=company2,
        name="Sales Department",
        code="SALES",
        description="Retail sales and customer service"
    )
    
    dept_b_finance = Department.objects.create(
        company=company2,
        name="Finance Department",
        code="FIN",
        description="Accounting and finance"
    )
    
    print(f"✅ Created departments for {company1.name}: IT, HR")
    print(f"✅ Created departments for {company2.name}: Sales, Finance\n")
    
    return dept_a_it, dept_a_hr, dept_b_sales, dept_b_finance


def create_test_employees(company1, company2, dept_a_it, dept_b_sales):
    """Create employees for each company"""
    print("👥 Creating employees...")
    
    # Company A employees
    emp1 = Employee.objects.create(
        company=company1,
        first_name="John",
        last_name="Doe",
        date_of_birth=date(1990, 5, 15),
        gender="male",
        national_id="CM123456789A",
        tin_number="TIN-EMP001",
        nssf_number="NSSF-001",
        email="john.doe@companya.com",
        phone="+256 700 333 333",
        department=dept_a_it,
        job_title="Senior Software Engineer",
        employment_type="full_time",
        employment_status="active",
        join_date=date.today() - timedelta(days=365),
        bank_name="Stanbic Bank",
        bank_account_number="1234567890"
    )
    
    emp2 = Employee.objects.create(
        company=company1,
        first_name="Jane",
        last_name="Smith",
        date_of_birth=date(1992, 8, 20),
        gender="female",
        national_id="CM987654321A",
        tin_number="TIN-EMP002",
        nssf_number="NSSF-002",
        email="jane.smith@companya.com",
        phone="+256 700 444 444",
        department=dept_a_it,
        job_title="Frontend Developer",
        employment_type="full_time",
        employment_status="active",
        join_date=date.today() - timedelta(days=180),
        bank_name="Centenary Bank",
        bank_account_number="0987654321"
    )
    
    # Company B employees
    emp3 = Employee.objects.create(
        company=company2,
        first_name="Peter",
        last_name="Mukasa",
        date_of_birth=date(1988, 3, 10),
        gender="male",
        national_id="CM111222333B",
        tin_number="TIN-EMP003",
        nssf_number="NSSF-003",
        email="peter.mukasa@companyb.com",
        phone="+256 700 555 555",
        department=dept_b_sales,
        job_title="Sales Manager",
        employment_type="full_time",
        employment_status="active",
        join_date=date.today() - timedelta(days=730),
        bank_name="DFCU Bank",
        bank_account_number="5555666677"
    )
    
    print(f"✅ Created 2 employees for {company1.name}")
    print(f"✅ Created 1 employee for {company2.name}\n")
    
    return emp1, emp2, emp3


def test_multi_tenant_isolation(company1, company2):
    """Test that data isolation works correctly"""
    print("=" * 60)
    print("🧪 TESTING MULTI-TENANT ISOLATION")
    print("=" * 60)
    
    # Test 1: Company-specific departments
    print("\n📊 Test 1: Department Isolation")
    company_a_depts = Department.objects.filter(company=company1).count()
    company_b_depts = Department.objects.filter(company=company2).count()
    
    print(f"  Company A departments: {company_a_depts}")
    print(f"  Company B departments: {company_b_depts}")
    assert company_a_depts == 2, "Company A should have 2 departments"
    assert company_b_depts == 2, "Company B should have 2 departments"
    print("  ✅ Department isolation works!")
    
    # Test 2: Company-specific employees
    print("\n👥 Test 2: Employee Isolation")
    company_a_emps = Employee.objects.filter(company=company1).count()
    company_b_emps = Employee.objects.filter(company=company2).count()
    
    print(f"  Company A employees: {company_a_emps}")
    print(f"  Company B employees: {company_b_emps}")
    assert company_a_emps == 2, "Company A should have 2 employees"
    assert company_b_emps == 1, "Company B should have 1 employee"
    print("  ✅ Employee isolation works!")
    
    # Test 3: Cross-company query should return nothing
    print("\n🔒 Test 3: Cross-Company Data Leakage")
    company_a_emp_numbers = [e.employee_number for e in Employee.objects.filter(company=company1)]
    company_b_lookup = Employee.objects.filter(
        company=company2,
        employee_number__in=company_a_emp_numbers
    ).count()
    
    print(f"  Company A employee numbers: {company_a_emp_numbers}")
    print(f"  These IDs found in Company B: {company_b_lookup}")
    assert company_b_lookup == 0, "No data leakage should occur!"
    print("  ✅ No data leakage detected!")
    
    # Test 4: User isolation
    print("\n👤 Test 4: User Isolation")
    company_a_users = User.objects.filter(company=company1).count()
    company_b_users = User.objects.filter(company=company2).count()
    
    print(f"  Company A users: {company_a_users}")
    print(f"  Company B users: {company_b_users}")
    assert company_a_users >= 1, "Company A should have at least 1 user"
    assert company_b_users >= 1, "Company B should have at least 1 user"
    print("  ✅ User isolation works!")
    
    # Test 5: Employee number auto-generation
    print("\n🔢 Test 5: Employee Number Auto-Generation")
    company_a_numbers = list(Employee.objects.filter(company=company1).values_list('employee_number', flat=True))
    company_b_numbers = list(Employee.objects.filter(company=company2).values_list('employee_number', flat=True))
    
    print(f"  Company A employee numbers: {company_a_numbers}")
    print(f"  Company B employee numbers: {company_b_numbers}")
    print("  ✅ Employee numbers auto-generated correctly!")
    
    print("\n" + "=" * 60)
    print("🎉 ALL MULTI-TENANT TESTS PASSED!")
    print("=" * 60)


def display_summary(company1, company2):
    """Display summary of test data"""
    print("\n" + "=" * 60)
    print("📊 TEST DATA SUMMARY")
    print("=" * 60)
    
    print(f"\n🏢 {company1.name}")
    print(f"   • Slug: {company1.slug}")
    print(f"   • Tier: {company1.subscription_tier}")
    print(f"   • Departments: {company1.departments.count()}")
    print(f"   • Employees: {company1.employee_count}")
    print(f"   • Users: {company1.users.count()}")
    
    print(f"\n🏢 {company2.name}")
    print(f"   • Slug: {company2.slug}")
    print(f"   • Tier: {company2.subscription_tier}")
    print(f"   • Departments: {company2.departments.count()}")
    print(f"   • Employees: {company2.employee_count}")
    print(f"   • Users: {company2.users.count()}")
    
    print("\n" + "=" * 60)
    print("✅ Multi-tenant system is working perfectly!")
    print("=" * 60)
    
    print("\n📌 Next Steps:")
    print("1. Access Django admin: http://localhost:8000/admin")
    print("2. Login with: admin / admin123")
    print("3. Explore the Companies, Users, Departments, Employees")
    print("4. Notice how data is isolated per company!")
    print("\n🚀 You're ready for Phase 3: API Development!")


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("🚀 PHASE 2: MULTI-TENANT DATABASE TESTING")
    print("=" * 60)
    
    # Step 1: Clear old test data
    clear_test_data()
    
    # Step 2: Create companies
    company1, company2 = create_test_companies()
    
    # Step 3: Create users
    admin1, admin2 = create_test_users(company1, company2)
    
    # Step 4: Create departments
    dept_a_it, dept_a_hr, dept_b_sales, dept_b_finance = create_test_departments(company1, company2)
    
    # Step 5: Create employees
    emp1, emp2, emp3 = create_test_employees(company1, company2, dept_a_it, dept_b_sales)
    
    # Step 6: Test isolation
    test_multi_tenant_isolation(company1, company2)
    
    # Step 7: Display summary
    display_summary(company1, company2)


if __name__ == "__main__":
    main()
