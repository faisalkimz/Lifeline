
import os
import django
import random
import traceback
from datetime import datetime, timedelta, date, time
from decimal import Decimal

# Setup Django Environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import transaction

# Model Imports
from accounts.models import Company
from employees.models import Employee, Department
from attendance.models import Attendance, AttendancePolicy
from leave.models import LeaveRequest, LeaveBalance, LeaveType
from payroll.models import PayrollRun, Payslip, SalaryStructure, TaxSettings
from benefits.models import BenefitType, EmployeeBenefit
from recruitment.models import Job, Candidate, Interview, Application
from disciplinary.models import DisciplinaryAction
from notifications.models import Announcement
from performance.models import PerformanceCycle, Goal, PerformanceReview
from training.models import TrainingProgram, TrainingSession, TrainingEnrollment
from documents.models import Folder, Document
from expense.models import ExpenseCategory, ExpenseClaim
from offboarding.models import Resignation

User = get_user_model()

def create_full_system_population(company_name, admin_email, admin_username):
    print(f"🚀 LEVEL UP: Starting Comprehensive Population for '{company_name}'...")
    
    try:
        # 0. Clean Existing
        print("🧹 Clearing previous data...")
        if Company.objects.filter(name=company_name).exists():
            c = Company.objects.get(name=company_name)
            Announcement.objects.filter(company=c).delete()
            EmployeeBenefit.objects.filter(employee__company=c).delete()
            BenefitType.objects.filter(company=c).delete()
            LeaveRequest.objects.filter(employee__company=c).delete()
            LeaveBalance.objects.filter(employee__company=c).delete()
            LeaveType.objects.filter(company=c).delete()
            Attendance.objects.filter(employee__company=c).delete()
            AttendancePolicy.objects.filter(company=c).delete()
            Job.objects.filter(company=c).delete()
            Candidate.objects.filter(company=c).delete()
            DisciplinaryAction.objects.filter(company=c).delete()
            PayrollRun.objects.filter(company=c).delete()
            PerformanceReview.objects.filter(employee__company=c).delete()
            Goal.objects.filter(employee__company=c).delete()
            PerformanceCycle.objects.filter(company=c).delete()
            TrainingEnrollment.objects.filter(employee__company=c).delete()
            TrainingSession.objects.filter(program__company=c).delete()
            TrainingProgram.objects.filter(company=c).delete()
            Document.objects.filter(company=c).delete()
            Folder.objects.filter(company=c).delete()
            ExpenseClaim.objects.filter(company=c).delete()
            ExpenseCategory.objects.filter(company=c).delete()
            Resignation.objects.filter(company=c).delete()
            TaxSettings.objects.filter(company=c).delete()
            Employee.objects.filter(company=c).delete()
            Company.objects.filter(name=company_name).delete()
        
        User.objects.filter(username=admin_username).delete()

        with transaction.atomic():
            # 1. Company & Admin
            company = Company.objects.create(
                name=company_name, email=admin_email, subscription_tier='professional',
                phone='+256 772 123456', address='Plot 12, Kampala Road, Uganda'
            )
            AttendancePolicy.objects.create(company=company, work_start_time=time(8, 0), work_end_time=time(17, 0))
            TaxSettings.objects.create(company=company, country='UG', currency='UGX', tax_year=2024)

            # 2. Departments
            print("🏢 Creating Departments...")
            dept_data = [
                ('Executive Control', 'EXE', 'Strategic Leadership'),
                ('Engineering Hub', 'ENG', 'Product Development & Research'),
                ('People & Culture', 'HR', 'Human Resources & Talent Management'),
                ('Growth & Revenue', 'SAM', 'Sales, Marketing & Partnerships'),
                ('Finance & Treasury', 'FIN', 'Financial Planning & Accounting'),
                ('Operations Support', 'OPS', 'Day-to-day Operations')
            ]
            dept_objs = {}
            for name, code, desc in dept_data:
                dept_objs[code] = Department.objects.create(company=company, name=name, code=code, description=desc)

            # 3. Create Employees (The Hierarchy)
            print("👥 Creating Employee Hierarchy for Org Chart...")
            admin_user = User.objects.create_user(
                username=admin_username, email=admin_email, password='password123',
                role='company_admin', company=company, first_name='Arthur', last_name='Zim'
            )
            ceo = Employee.objects.create(
                company=company, first_name='Arthur', last_name='Zim', email=admin_email,
                department=dept_objs['EXE'], job_title='Group CEO',
                join_date=date(2021, 1, 1), date_of_birth=date(1980, 5, 20),
                gender='male', national_id='CEO-UG-001'
            )
            admin_user.employee = ceo
            admin_user.save()

            managers = {}
            manager_candidates = [
                ('Sarah', 'Nantongo', 'ENG', 'VP Operations'),
                ('Robert', 'Kwizera', 'HR', 'HR Director'),
                ('Brenda', 'Achieng', 'SAM', 'Brand Lead'),
                ('James', 'Mukasa', 'FIN', 'Finance Manager')
            ]
            for f, l, d, title in manager_candidates:
                m = Employee.objects.create(
                    company=company, first_name=f, last_name=l, email=f"{f.lower()}.{l.lower()}@humanity.com",
                    department=dept_objs[d], job_title=title, manager=ceo,
                    join_date=date(2022, 1, 1), date_of_birth=date(1988, 3, 15),
                    gender=random.choice(['male', 'female']), national_id=f"MGR-{d}-{random.randint(10, 99)}"
                )
                managers[d] = m
                dept_objs[d].manager = m
                dept_objs[d].save()

            staff_list = []
            fnames = ['John', 'Mary', 'Tom', 'Lucy', 'Grace', 'Peter', 'Ivan', 'Doreen', 'Moses', 'Peace', 'Abel', 'Esther']
            lnames = ['Okello', 'Namuli', 'Mugisha', 'Kizza', 'Opio', 'Atwine', 'Waiswa', 'Lutaaya', 'Nsubuga']
            for i in range(20):
                f, l = random.choice(fnames), random.choice(lnames)
                d_code = random.choice(list(managers.keys()))
                mgr = managers[d_code]
                emp = Employee.objects.create(
                    company=company, first_name=f, last_name=l, email=f"{f.lower()}.{l.lower()}{i}@humanity.com",
                    department=dept_objs[d_code], job_title="Senior Analyst", manager=mgr,
                    join_date=date.today() - timedelta(days=random.randint(100, 600)),
                    date_of_birth=date(1995, 1, 1), gender=random.choice(['male', 'female']),
                    national_id=f"UG-ID-{random.randint(1000, 9999)}"
                )
                staff_list.append(emp)
                emp.salary = random.randint(2500000, 8000000)

            # 4. Performance Module
            print("📈 Populating Performance (Cycles, Goals, Reviews)...")
            cycle = PerformanceCycle.objects.create(
                company=company, name="Annual Performance 2024", status='active',
                start_date=date(2024, 1, 1), end_date=date(2024, 12, 31)
            )
            # Add goals & reviews for CEO (Admin)
            Goal.objects.create(
                company=company, employee=ceo, cycle=cycle, title="Expand Revenue by 30%",
                description="Secure 5 new enterprise accounts by Q4.", status='in_progress', progress=40, priority='high'
            )
            PerformanceReview.objects.create(
                cycle=cycle, employee=ceo, reviewer=ceo, status='submitted',
                technical_skills=5, communication=5, teamwork=5, productivity=5, initiative=5,
                manager_feedback="Self-review: On track for expansion."
            )
            # Staff data
            for emp in staff_list[:5]:
                Goal.objects.create(
                    company=company, employee=emp, cycle=cycle, title="KPI Achievement",
                    description="Meet all delivery deadlines.", status='in_progress', progress=75, priority='medium'
                )
                PerformanceReview.objects.create(
                    cycle=cycle, employee=emp, reviewer=emp.manager, status='submitted',
                    technical_skills=4, communication=4, teamwork=4, productivity=4, initiative=4,
                    manager_feedback="Consistent performance."
                )

            # 5. Training Module
            print("🎓 Populating Training Programs & Sessions...")
            prog1 = TrainingProgram.objects.create(
                company=company, code="TRN-001", name="Leadership Mastery",
                description="Leading diversed teams with empathy.", category='leadership',
                provider="Exec Ed Services", duration_hours=12, is_mandatory=True
            )
            prog2 = TrainingProgram.objects.create(
                company=company, code="TRN-002", name="Cyber Security Essentials",
                description="Stay safe online.", category='compliance',
                provider="IT Dept", duration_hours=4, is_mandatory=True
            )
            sess1 = TrainingSession.objects.create(
                program=prog1, session_code="LM-JAN-24", start_date=timezone.now() + timedelta(days=10),
                end_date=timezone.now() + timedelta(days=10, hours=12), status='open_enrollment',
                delivery_mode='virtual', location='Teams Link'
            )
            for emp in staff_list[:5]:
                TrainingEnrollment.objects.create(session=sess1, employee=emp, status='enrolled')

            # 6. Expenses
            print("💸 Creating Expense Claims...")
            exp_cat = ExpenseCategory.objects.create(company=company, name="Travel", description="Business travel")
            for emp in staff_list[:3]:
                ExpenseClaim.objects.create(
                    company=company, employee=emp, category=exp_cat, title="Regional Workshop",
                    amount=Decimal("120000"), expense_date=date.today() - timedelta(days=5),
                    status='submitted', description="Transport to Mbarara."
                )

            # 7. Recruitment
            print("🎯 Adding Recruitment Pipeline...")
            job = Job.objects.create(
                company=company, title="Frontend Engineer", department=dept_objs['ENG'],
                location="Remote", employment_type="full_time", status="published",
                description="Join our engineering team.", requirements="React, Redux, Tailwind."
            )
            cand = Candidate.objects.create(
                company=company, first_name="Joan", last_name="Atwine", email="joan@example.com",
                phone="+256 700 111222", source="linkedin"
            )
            Application.objects.create(job=job, candidate=cand, stage="interview")

            # 8. Leave & Dashboards
            print("📅 Seeding Leave & Dashboard Data...")
            lt_annual = LeaveType.objects.create(company=company, name="Annual Leave", code="AL", days_per_year=21)
            for emp in staff_list:
                LeaveBalance.objects.create(employee=emp, leave_type=lt_annual, total_days=21, used_days=0, year=2024)
            # Add some pending requests for Dashboard "Needs Attention"
            for emp in staff_list[:3]:
                LeaveRequest.objects.create(
                    employee=emp, leave_type=lt_annual, start_date=date.today() + timedelta(days=20),
                    end_date=date.today() + timedelta(days=25), days_requested=5, status='pending',
                    reason="Family vacation"
                )

            # 9. Announcements & Disciplinary
            Announcement.objects.create(
                company=company, title="Strategic Offsite 2024", content="All hands on deck for next week's offsite!",
                posted_by=admin_user, is_active=True
            )
            DisciplinaryAction.objects.create(
                company=company, employee=staff_list[5], reason="Lateness",
                description="Consistently arriving 30 mins late.", status='active',
                severity='minor', incident_date=date.today() - timedelta(days=3)
            )

            # 10. Finalize Payroll
            for emp in staff_list:
                SalaryStructure.objects.create(employee=emp, company=company, basic_salary=emp.salary, effective_date=emp.join_date)

            print(f"\n✨ COMPREHENSIVE POPULATION SUCCESS for '{company_name}'")
            print(f"👉 Login: {admin_username} / password123")
            print(f"👉 Modules: Dash, Org Chart, Perf, Train, Exp, Leave, Recruitment ALL POPULATED.")

    except Exception as e:
        print(f"❌ ERROR: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    create_full_system_population("Humanity Enterprise Ltd", "admin@humanity.com", "HumanAdmin")
