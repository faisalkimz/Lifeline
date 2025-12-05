# LahHR - Complete HR Management System (HRMS)
## All-in-One HR Solution for Uganda & Beyond

---

## 🎯 Vision: Complete HR Automation

LahHR is not just an ATS - it's a **complete HR Management System** handling EVERY HR function from recruitment to retirement:

- ✅ **Recruitment & Onboarding** (ATS we already planned)
- ✅ **Employee Records Management** (digital personnel files)
- ✅ **Payroll Processing** (salary calculation, tax deductions, bank payments)
- ✅ **Leave & Attendance Management** (vacation, sick leave, time tracking)
- ✅ **Performance Management** (reviews, KPIs, 360° feedback)
- ✅ **Training & Development** (courses, certifications, career growth)
- ✅ **Document Management** (contracts, policies, certificates)
- ✅ **Benefits Administration** (insurance, pension, allowances)
- ✅ **Offboarding & Exit** (resignation, termination, handover)
- ✅ **Compliance & Reporting** (labor laws, tax reports, NSSF/URA for Uganda)

---

## 🏢 Multi-Tenant Architecture (Critical!)

### Complete Data Isolation
```python
# Every table has company_id - NO data leaks between companies
class Employee(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    # ... other fields
    
    class Meta:
        # Company A cannot see Company B's employees
        constraints = [
            models.UniqueConstraint(fields=['company', 'email'], name='unique_employee_per_company')
        ]

# Automatic filtering in views
class EmployeeViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        # Users only see their company's data
        return Employee.objects.filter(company=self.request.user.company)
```

### Company-Specific Settings
```python
class CompanySettings(models.Model):
    company = models.OneToOneField(Company)
    
    # Payroll Settings (Uganda vs Kenya vs Global)
    country = models.CharField(max_length=2, default='UG')  # ISO country code
    currency = models.CharField(max_length=3, default='UGX')
    tax_id = models.CharField(max_length=50)  # TIN for Uganda
    
    # Uganda-specific
    nssf_enabled = models.BooleanField(default=True)
    local_service_tax_rate = models.DecimalField(default=0.05)  # 5%
    
    # Leave Policies
    annual_leave_days = models.IntegerField(default=21)  # Uganda minimum
    sick_leave_days = models.IntegerField(default=14)
    maternity_leave_days = models.IntegerField(default=60)  # Uganda: 60 days
    
    # Work Week
    working_days_per_week = models.IntegerField(default=5)
    working_hours_per_day = models.DecimalField(default=8)
```

---

## 📊 Complete Module Breakdown

### **MODULE 1: Employee Records Management** 🆕
**The Foundation - Digital Personnel Files**

#### Features:
- **Employee Profile**: Name, photo, ID number, contacts, emergency contacts
- **Employment Details**: Job title, department, manager, start date, employment type
- **Personal Documents**: National ID, passport, certificates, bank details
- **Custom Fields**: Company-specific data (badge number, locker number, etc.)
- **Family Information**: Dependents, beneficiaries for insurance
- **Audit Trail**: Track all changes to employee records

#### Database Schema:
```sql
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    company_id INTEGER NOT NULL,
    employee_number VARCHAR(50) UNIQUE,  -- Auto-generated: EMP001, EMP002
    
    -- Personal Info
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10),
    national_id VARCHAR(50),
    passport_number VARCHAR(50),
    photo_url VARCHAR(500),
    
    -- Contact
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'UG',
    
    -- Employment
    department_id INTEGER,
    job_title VARCHAR(255),
    manager_id INTEGER,  -- Self-referencing FK
    employment_type VARCHAR(50),  -- Full-time, Contract, Intern
    employment_status VARCHAR(50) DEFAULT 'active',  -- active, on_leave, terminated
    join_date DATE,
    probation_end_date DATE,
    
    -- Financial
    bank_name VARCHAR(100),
    bank_account VARCHAR(100),
    bank_branch VARCHAR(100),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);

CREATE TABLE employee_documents (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    document_type VARCHAR(100),  -- CV, Certificate, Contract, ID Copy
    document_name VARCHAR(255),
    file_url VARCHAR(500),
    uploaded_at TIMESTAMP,
    expiry_date DATE,  -- For passports, visas, licenses
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

---

### **MODULE 2: Payroll Management** 🆕💰
**Critical for Uganda - Full Payroll Processing**

#### Features:
- **Salary Structure**: Basic + allowances (housing, transport, medical)
- **Deductions**: PAYE (Pay As You Earn tax), NSSF, loans, advances
- **Payslip Generation**: PDF payslips with itemized breakdown
- **Bank Integration**: Export bank payment files (CSV/Excel for batch upload)
- **Tax Compliance**: URA (Uganda Revenue Authority) tax calculations
- **Monthly Processing**: Bulk payroll runs with approval workflow
- **Loan Management**: Track salary advances and deductions

#### Uganda Tax Calculation (2024):
```python
def calculate_paye(gross_salary):
    """
    Uganda PAYE Tax Bands (2024)
    UGX 0 - 235,000: 0%
    UGX 235,001 - 335,000: 10%
    UGX 335,001 - 410,000: 20%
    UGX 410,001 - 10,000,000: 30%
    Above UGX 10,000,000: 40%
    """
    tax = 0
    if gross_salary <= 235000:
        tax = 0
    elif gross_salary <= 335000:
        tax = (gross_salary - 235000) * 0.10
    elif gross_salary <= 410000:
        tax = 10000 + (gross_salary - 335000) * 0.20
    elif gross_salary <= 10000000:
        tax = 25000 + (gross_salary - 410000) * 0.30
    else:
        tax = 2902000 + (gross_salary - 10000000) * 0.40
    return round(tax, 2)

def calculate_nssf(gross_salary):
    """
    NSSF Contribution: 10% employee + 10% employer
    Maximum ceiling: UGX 100,000 per month
    """
    contribution = min(gross_salary * 0.10, 100000)
    return contribution
```

#### Database Schema:
```sql
CREATE TABLE salary_structures (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    effective_date DATE,
    
    -- Earnings
    basic_salary DECIMAL(12,2),
    housing_allowance DECIMAL(12,2),
    transport_allowance DECIMAL(12,2),
    medical_allowance DECIMAL(12,2),
    lunch_allowance DECIMAL(12,2),
    other_allowances DECIMAL(12,2),
    
    -- Calculated
    gross_salary DECIMAL(12,2),  -- Sum of all earnings
    
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE payroll_runs (
    id INTEGER PRIMARY KEY,
    company_id INTEGER,
    month INTEGER,
    year INTEGER,
    status VARCHAR(50),  -- draft, processing, approved, paid
    total_gross DECIMAL(15,2),
    total_deductions DECIMAL(15,2),
    total_net DECIMAL(15,2),
    processed_by INTEGER,
    processed_at TIMESTAMP,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE payslips (
    id INTEGER PRIMARY KEY,
    payroll_run_id INTEGER,
    employee_id INTEGER,
    
    -- Earnings
    basic_salary DECIMAL(12,2),
    allowances DECIMAL(12,2),
    bonuses DECIMAL(12,2),
    gross_salary DECIMAL(12,2),
    
    -- Deductions
    paye_tax DECIMAL(12,2),
    nssf_employee DECIMAL(12,2),
    nssf_employer DECIMAL(12,2),
    loan_deduction DECIMAL(12,2),
    advance_deduction DECIMAL(12,2),
    other_deductions DECIMAL(12,2),
    total_deductions DECIMAL(12,2),
    
    -- Final
    net_salary DECIMAL(12,2),
    
    payment_method VARCHAR(50),  -- bank, cash, mobile_money
    payment_date DATE,
    payment_status VARCHAR(50),
    
    FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

---

### **MODULE 3: Leave & Attendance Management** 🆕📅

#### Features:
- **Leave Types**: Annual, sick, maternity, paternity, unpaid, compassionate
- **Leave Requests**: Employee applies → Manager approves → HR processes
- **Leave Balance**: Track accrued, used, remaining days
- **Public Holidays**: Uganda holiday calendar (customizable)
- **Attendance Tracking**: Clock in/out, late arrivals, early departures
- **Overtime Management**: Track extra hours, overtime pay calculation
- **Work From Home**: Remote work requests and tracking

#### Uganda Leave Entitlements:
```python
UGANDA_LEAVE_POLICIES = {
    'annual_leave': 21,  # 21 working days per year (Employment Act)
    'sick_leave': 14,  # 14 days with medical certificate
    'maternity_leave': 60,  # 60 days (4 working weeks before + 8 after)
    'paternity_leave': 4,  # 4 working days
    'compassionate_leave': 5,  # Death of close relative
}

UGANDA_PUBLIC_HOLIDAYS_2025 = [
    ('2025-01-01', 'New Year'),
    ('2025-01-26', 'NRM Liberation Day'),
    ('2025-03-08', 'Women\'s Day'),
    ('2025-03-31', 'Eid al-Fitr'),  # Approximate
    ('2025-04-18', 'Good Friday'),
    ('2025-04-21', 'Easter Monday'),
    ('2025-05-01', 'Labour Day'),
    ('2025-06-03', 'Martyrs\' Day'),
    ('2025-06-09', 'National Heroes Day'),
    ('2025-06-16', 'Eid al-Adha'),  # Approximate
    ('2025-10-09', 'Independence Day'),
    ('2025-12-25', 'Christmas'),
    ('2025-12-26', 'Boxing Day'),
]
```

#### Database Schema:
```sql
CREATE TABLE leave_types (
    id INTEGER PRIMARY KEY,
    company_id INTEGER,
    name VARCHAR(100),  -- Annual, Sick, Maternity
    days_per_year INTEGER,
    requires_approval BOOLEAN DEFAULT TRUE,
    requires_medical_cert BOOLEAN DEFAULT FALSE,
    paid BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE leave_requests (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    leave_type_id INTEGER,
    start_date DATE,
    end_date DATE,
    days_requested INTEGER,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, approved, rejected, cancelled
    requested_at TIMESTAMP,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

CREATE TABLE leave_balances (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    leave_type_id INTEGER,
    year INTEGER,
    total_days DECIMAL(5,2),
    used_days DECIMAL(5,2),
    remaining_days DECIMAL(5,2),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    UNIQUE(employee_id, leave_type_id, year)
);

CREATE TABLE attendance_records (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    date DATE,
    clock_in TIME,
    clock_out TIME,
    hours_worked DECIMAL(4,2),
    status VARCHAR(50),  -- present, late, absent, half_day, on_leave
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE(employee_id, date)
);
```

---

### **MODULE 4: Performance Management** 🆕📈

#### Features:
- **Performance Reviews**: Annual, probation, quarterly reviews
- **KPI Tracking**: Set goals, track progress, measure results
- **360° Feedback**: Self, manager, peers, subordinates
- **Competency Assessment**: Technical skills, soft skills, values
- **Performance Improvement Plans (PIP)**: For underperformers
- **Promotion Tracking**: Eligibility, recommendations, history
- **Rating Scales**: 1-5 stars, percentage, A-F grades (customizable)

#### Database Schema:
```sql
CREATE TABLE performance_cycles (
    id INTEGER PRIMARY KEY,
    company_id INTEGER,
    name VARCHAR(100),  -- "Annual Review 2025", "Q1 2025"
    start_date DATE,
    end_date DATE,
    review_template_id INTEGER,
    status VARCHAR(50),  -- draft, active, completed
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE performance_reviews (
    id INTEGER PRIMARY KEY,
    performance_cycle_id INTEGER,
    employee_id INTEGER,
    reviewer_id INTEGER,  -- Usually manager
    review_type VARCHAR(50),  -- annual, probation, quarterly
    
    -- Ratings (1-5 scale)
    quality_of_work INTEGER,
    productivity INTEGER,
    communication INTEGER,
    teamwork INTEGER,
    initiative INTEGER,
    overall_rating INTEGER,
    
    -- Text Feedback
    achievements TEXT,
    areas_for_improvement TEXT,
    goals_for_next_period TEXT,
    reviewer_comments TEXT,
    employee_comments TEXT,  -- Employee can respond
    
    status VARCHAR(50),  -- draft, submitted, acknowledged
    submitted_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    
    -- Outcome
    recommended_for_promotion BOOLEAN,
    recommended_salary_increase DECIMAL(5,2),  -- Percentage
    
    FOREIGN KEY (performance_cycle_id) REFERENCES performance_cycles(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (reviewer_id) REFERENCES employees(id)
);

CREATE TABLE goals (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    set_by INTEGER,  -- Manager who set the goal
    title VARCHAR(255),
    description TEXT,
    target_date DATE,
    weight DECIMAL(5,2),  -- % contribution to overall performance
    status VARCHAR(50),  -- not_started, in_progress, completed, abandoned
    progress_percentage INTEGER DEFAULT 0,
    completion_notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

---

### **MODULE 5: Training & Development** 🆕🎓

#### Features:
- **Training Courses**: Internal/external courses catalog
- **Enrollment Management**: Register employees for training
- **Certification Tracking**: Licenses, certificates, expiry dates
- **Training Calendar**: Schedule sessions, manage attendance
- **Skills Matrix**: Track employee competencies
- **Training Budget**: Allocate and track training spend
- **E-Learning Integration**: Link to online courses (Udemy, Coursera)

#### Database Schema:
```sql
CREATE TABLE training_courses (
    id INTEGER PRIMARY KEY,
    company_id INTEGER,
    title VARCHAR(255),
    description TEXT,
    course_type VARCHAR(50),  -- internal, external, online
    provider VARCHAR(255),
    duration_hours INTEGER,
    cost DECIMAL(10,2),
    capacity INTEGER,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE training_sessions (
    id INTEGER PRIMARY KEY,
    course_id INTEGER,
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    instructor VARCHAR(255),
    status VARCHAR(50),  -- scheduled, completed, cancelled
    FOREIGN KEY (course_id) REFERENCES training_courses(id)
);

CREATE TABLE training_enrollments (
    id INTEGER PRIMARY KEY,
    training_session_id INTEGER,
    employee_id INTEGER,
    enrolled_at TIMESTAMP,
    attendance_status VARCHAR(50),  -- registered, attended, absent, completed
    completion_certificate_url VARCHAR(500),
    feedback_rating INTEGER,
    feedback_comments TEXT,
    FOREIGN KEY (training_session_id) REFERENCES training_sessions(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE certifications (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    certification_name VARCHAR(255),
    issuing_organization VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certificate_file_url VARCHAR(500),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

---

### **MODULE 6: Benefits Administration** 🆕💼

#### Features:
- **Insurance Management**: Medical, life, disability insurance
- **Pension/Retirement**: NSSF tracking for Uganda
- **Allowances**: Housing, transport, medical, lunch, airtime
- **Loans & Advances**: Salary advances, emergency loans
- **Subscription Management**: Gym memberships, professional associations
- **Dependents**: Track family members for insurance coverage

#### Database Schema:
```sql
CREATE TABLE benefits (
    id INTEGER PRIMARY KEY,
    company_id INTEGER,
    benefit_name VARCHAR(255),
    benefit_type VARCHAR(100),  -- insurance, pension, allowance
    description TEXT,
    value DECIMAL(12,2),
    is_taxable BOOLEAN,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE employee_benefits (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    benefit_id INTEGER,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),  -- active, cancelled, expired
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (benefit_id) REFERENCES benefits(id)
);

CREATE TABLE loans (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    loan_amount DECIMAL(12,2),
    loan_purpose VARCHAR(255),
    approved_by INTEGER,
    disbursement_date DATE,
    repayment_period_months INTEGER,
    monthly_deduction DECIMAL(12,2),
    total_repaid DECIMAL(12,2),
    balance DECIMAL(12,2),
    status VARCHAR(50),  -- pending, active, completed, defaulted
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

---

### **MODULE 7: Document Management** 🆕📄

#### Features:
- **Contract Management**: Employment contracts, amendments
- **Company Policies**: HR policies, code of conduct
- **Forms & Templates**: Leave forms, appraisal forms
- **Employee Handbook**: Digital handbook with version control
- **E-Signatures**: Sign documents electronically
- **Document Expiry Alerts**: Remind when contracts/visas expire
- **Audit Trail**: Track who accessed/downloaded documents

---

### **MODULE 8: Offboarding & Exit** 🆕👋

#### Features:
- **Resignation Management**: Notice period tracking
- **Termination Process**: Checklist for HR
- **Exit Interviews**: Capture feedback from leaving employees
- **Asset Recovery**: Return laptops, access cards, keys
- **Final Settlement**: Calculate final pay, unused leave, deductions
- **Rehire Eligibility**: Mark if employee can be rehired
- **Alumni Network**: Optional - maintain contact with ex-employees

#### Database Schema:
```sql
CREATE TABLE employee_exits (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER,
    exit_type VARCHAR(50),  -- resignation, termination, retirement, contract_end
    exit_date DATE,
    notice_date DATE,
    notice_period_days INTEGER,
    reason_for_leaving TEXT,
    exit_interview_completed BOOLEAN DEFAULT FALSE,
    exit_interview_notes TEXT,
    final_settlement_amount DECIMAL(12,2),
    assets_returned BOOLEAN DEFAULT FALSE,
    rehire_eligible BOOLEAN,
    processed_by INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

---

## 🌍 Uganda-Specific Features

### **1. Uganda Revenue Authority (URA) Integration**
- PAYE tax calculations (updated 2024 rates)
- Monthly tax return generation (CSV/PDF)
- TIN validation
- Withholding tax for contractors

### **2. NSSF Integration**
- Employee + employer contributions (10% each)
- Monthly NSSF returns
- NSSF number validation

### **3. Local Service Tax (LST)**
- 5% tax for Kampala businesses
- Automatic calculation

### **4. Mobile Money Integration (M-Pesa/Airtel Money)**
- Pay salaries via mobile money
- MTN Mobile Money, Airtel Money APIs
- Reduces bank transfer fees

### **5. Uganda Public Holidays**
- Pre-configured calendar
- Auto-exclude from working days

---

## 🔐 Multi-Tenant Security Architecture

### Row-Level Security
```python
# Every query automatically filtered by company_id
class CompanyQuerySet(models.QuerySet):
    def for_company(self, company):
        return self.filter(company=company)

class Employee(models.Model):
    company = models.ForeignKey(Company)
    # ... fields
    
    objects = CompanyQuerySet.as_manager()

# In views
def get_queryset(self):
    return Employee.objects.for_company(self.request.user.company)
```

### Company Isolation Tests
```python
def test_company_data_isolation():
    """Ensure Company A cannot see Company B's data"""
    company_a = Company.objects.create(name="Company A")
    company_b = Company.objects.create(name="Company B")
    
    emp_a = Employee.objects.create(company=company_a, email="john@companya.com")
    emp_b = Employee.objects.create(company=company_b, email="jane@companyb.com")
    
    # Company A user
    user_a = User.objects.create(company=company_a)
    request_a = MockRequest(user=user_a)
    
    # Should only see Company A employees
    employees = Employee.objects.for_company(user_a.company)
    assert employees.count() == 1
    assert emp_b not in employees
```

---

## 📊 Reporting & Analytics (Critical for HR)

### Standard Reports:
1. **Headcount Report**: Total employees, by department, by employment type
2. **Turnover Report**: Resignations, terminations, turnover rate
3. **Payroll Summary**: Total salary cost, by department, trends
4. **Leave Report**: Leave taken, balances, absenteeism rate
5. **Performance Report**: Average ratings, top/bottom performers
6. **Training Report**: Training hours, cost, ROI
7. **Diversity Report**: Gender, age, department distribution
8. **Compliance Report**: Tax filings, NSSF remittances

---

## 💰 Pricing Strategy (Uganda Market)

### For Uganda (UGX):
- **Starter**: UGX 100,000/month (~$27) - Up to 20 employees
- **Professional**: UGX 300,000/month (~$80) - Up to 100 employees
- **Enterprise**: UGX 800,000/month (~$215) - Unlimited employees

### For International (USD):
- **Starter**: $29/month
- **Professional**: $99/month
- **Enterprise**: $299/month

**One-Time Setup Fee**: UGX 500,000 (~$135) includes training, data migration

---

## 🚀 Next Steps: Ready to Build!

Now that we have the COMPLETE HRMS plan, I'll create the full project structure with all modules. Just confirm and we start!

**Total Modules**: 8 core + Recruitment (9 total)
**Database Tables**: 40+ tables
**Timeline**: 6-9 months to full production
**Market**: Uganda SMEs (5,000+ potential clients)

Ready? 💪🚀
