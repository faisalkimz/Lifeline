# 💰 Payroll Management System

Complete payroll processing system for **Lifeline HRMS** with Uganda-specific tax calculations, salary management, and compliance features.

---

## 🎯 Features

### 1. **Payroll Dashboard**
- Monthly payroll summary and metrics
- Payroll run status tracking (draft, processing, approved, paid)
- Employee count and salary statistics
- Quick actions for payroll processing
- Month/year selector for historical data

### 2. **Salary Structures**
- Define salary components for each employee
- Support for multiple allowances:
  - Housing allowance
  - Transport allowance
  - Medical allowance
  - Lunch allowance
  - Other allowances
- Auto-calculated gross salary
- Effective date management for salary changes
- Salary history tracking

### 3. **Payslips**
- Individual payslip generation
- Detailed earnings breakdown
- Deduction itemization:
  - PAYE tax (Uganda 2024 rates)
  - NSSF contribution (10%)
  - Loan deductions
  - Salary advances
  - Other deductions
- Net salary calculation
- PDF download
- Email distribution
- Search and filter by employee/month

### 4. **Payroll Processing**
- Bulk payroll run creation
- Auto-generation of payslips from salary structures
- Approval workflow (draft → processing → approved → paid)
- Batch payment processing
- Payment method tracking (bank, cash, mobile money)

### 5. **Salary Advances & Loans**
- Request and approval workflow
- Repayment schedule management
- Automatic deduction from payslips
- Track outstanding advances
- Interest calculation support

### 6. **Tax Compliance (Uganda)**
- **PAYE Tax Calculation** (2024 rates):
  ```
  UGX 0 - 235,000:      0%
  235,001 - 335,000:    10%
  335,001 - 410,000:    20%
  410,001 - 10,000,000: 30%
  10,000,000+:          40%
  ```
- **NSSF Contribution**:
  - Employee: 10% (max UGX 10,000/month)
  - Employer: 10% (separate)
  - Ceiling: UGX 100,000 pensionable salary

- **Local Service Tax**: 5% (customizable by company/location)

### 7. **Audit & Compliance**
- Payroll audit logs
- Action tracking (create, edit, approve, process)
- User attribution for changes
- Change history with old/new values
- URA compliance reporting ready

---

## 📁 Project Structure

```
frontend/src/features/payroll/
├── PayrollIndex.jsx           # Main router with tabs
├── PayrollDashboard.jsx       # Dashboard with metrics
├── PayslipPage.jsx            # Payslip list and viewer
├── SalaryStructurePage.jsx    # Salary management
├── LoanManagementPage.jsx     # Advance/loan management
└── PayrollListPage.jsx        # Payroll run list (existing)

backend/payroll/
├── models.py                  # SalaryStructure, PayrollRun, Payslip, SalaryAdvance, TaxSettings
├── views.py                   # ViewSets and actions
├── serializers.py             # DRF serializers
├── utils.py                   # Tax calculations and utilities
├── permissions.py             # Custom permissions
└── migrations/                # Database migrations
```

---

## 🔧 Backend Configuration

### 1. Tax Settings (Per Company)

```python
# Automatically created when company is registered
# Settings include:
- Country (UG, KE, etc.)
- Currency (UGX, KES, etc.)
- NSSF rates (employee/employer)
- Local service tax enabled/rate
- Company tax ID
- Bank details for payroll
```

### 2. Models Overview

#### SalaryStructure
```python
- employee (OneToOne)
- effective_date
- basic_salary
- housing_allowance
- transport_allowance
- medical_allowance
- lunch_allowance
- other_allowances
- gross_salary (auto-calculated)
- created_by, created_at, updated_at
```

#### PayrollRun
```python
- company (ForeignKey)
- month, year
- status (draft, processing, approved, paid)
- total_gross, total_paye, total_nssf, total_deductions, total_net
- processed_by, processed_at
- approved_by, approved_at
```

#### Payslip
```python
- payroll_run (ForeignKey)
- employee (ForeignKey)
- earnings: basic_salary, allowances, bonus, gross_salary
- deductions: paye_tax, nssf_employee, nssf_employer, loan_deduction, other_deductions
- total_deductions, net_salary
- payment details: method, date, status, reference
```

#### SalaryAdvance
```python
- employee (ForeignKey)
- amount, reason
- requested_at, approved_at
- repayment_months, monthly_deduction
- amount_repaid, status
```

---

## 📱 Frontend Components

### PayrollIndex (Main Router)
Tab-based navigation between:
- Dashboard
- Payslips
- Salary Structures
- Loans

### PayrollDashboard
Displays:
- Key metrics (employees, total gross, deductions, net, average salary)
- Month/year selector
- Current payroll status with action buttons
- Recent payroll runs table

### PayslipPage
Shows:
- Payslip table with search/filter
- Individual payslip viewer (modal)
- Earnings/deductions breakdown
- Download and email actions

### SalaryStructurePage
Allows:
- Create/edit salary structures
- Multi-allowance support
- Auto-calculated gross salary
- Effective date management
- Salary history

### LoanManagementPage
Enables:
- Request salary advances
- Approval workflow
- Repayment schedule tracking
- Deduction automation

---

## 🚀 API Endpoints

### Salary Structures
```
GET    /api/payroll/salary-structures/
POST   /api/payroll/salary-structures/
GET    /api/payroll/salary-structures/{id}/
PUT    /api/payroll/salary-structures/{id}/
DELETE /api/payroll/salary-structures/{id}/
```

### Payroll Runs
```
GET    /api/payroll/payroll-runs/
POST   /api/payroll/payroll-runs/
GET    /api/payroll/payroll-runs/{id}/
POST   /api/payroll/payroll-runs/{id}/process_payroll/
POST   /api/payroll/payroll-runs/{id}/approve/
POST   /api/payroll/payroll-runs/{id}/process_payment/
```

### Payslips
```
GET    /api/payroll/payslips/
GET    /api/payroll/payslips/{id}/
POST   /api/payroll/payslips/{id}/download_pdf/
POST   /api/payroll/payslips/{id}/send_email/
```

### Salary Advances
```
GET    /api/payroll/salary-advances/
POST   /api/payroll/salary-advances/
GET    /api/payroll/salary-advances/{id}/
POST   /api/payroll/salary-advances/{id}/approve/
POST   /api/payroll/salary-advances/{id}/reject/
```

---

## 💡 Key Utilities

### Tax Calculations (utils.py)

```python
# Uganda PAYE
calculate_paye(gross_salary: Decimal) -> Decimal

# NSSF Contribution
calculate_nssf(gross_salary: Decimal) -> Decimal
calculate_employer_nssf(gross_salary: Decimal) -> Decimal

# Net Salary Calculation
calculate_net_salary(gross_salary: Decimal, deductions: dict) -> dict
```

---

## 🔐 Permissions

### PayrollOperator (HR Manager)
- View/create payroll runs
- Generate payslips
- Approve payroll
- Process payments

### Employee
- View own payslips
- Request salary advances
- View own salary structure

### Admin
- Full payroll access
- Tax settings management
- Audit log access
- Company-wide reports

---

## 📊 Data Flow

```
1. Create Salary Structures
   └─> Employee details + basic salary + allowances

2. Create Payroll Run
   └─> Select month/year
   └─> System fetches active employees + salary structures

3. Process Payroll
   └─> For each employee:
       └─> Calculate gross salary (basic + allowances)
       └─> Calculate PAYE tax (Uganda 2024 rates)
       └─> Calculate NSSF (10% with ceiling)
       └─> Calculate deductions (loan, advance, other)
       └─> Calculate net salary
   └─> Generate payslips
   └─> Calculate totals

4. Approve Payroll
   └─> HR manager reviews and approves
   └─> System locks payroll for processing

5. Process Payment
   └─> Generate bank payment file
   └─> Mark payslips as paid
   └─> Send payslips to employees (email)
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create salary structure for test employee
- [ ] Create payroll run for current month
- [ ] Process payroll (auto-generate payslips)
- [ ] Verify PAYE calculation (use sample salaries)
- [ ] Verify NSSF calculation (10% with ceiling)
- [ ] Approve payroll
- [ ] Download payslip PDF
- [ ] Request salary advance
- [ ] Approve salary advance
- [ ] Verify deduction in next payslip

### Sample Test Data
```python
Employee 1:
- Basic: UGX 3,000,000
- Housing: UGX 500,000
- Transport: UGX 300,000
- Medical: UGX 200,000
- Gross: UGX 4,000,000
Expected PAYE: UGX 591,000
Expected NSSF: UGX 10,000 (capped)
Expected Net: UGX 3,399,000

Employee 2:
- Basic: UGX 15,000,000
- Allowances: UGX 3,000,000
- Gross: UGX 18,000,000
Expected PAYE: UGX 3,102,000
Expected NSSF: UGX 10,000 (capped)
Expected Net: UGX 14,888,000
```

---

## 🌍 Multi-Tenant Support

Each company has:
- Isolated salary structures
- Company-specific tax settings
- Separate payroll runs
- Independent audit logs

No data leakage between companies!

---

## 🔔 Notifications (Future)

- Payslip ready email
- Salary advance approval/rejection
- Payroll processing alerts
- Tax compliance reminders
- Month-end deadline notifications

---

## 📈 Reports (Future)

- Payroll summary by department
- Tax compliance report (PAYE, NSSF, LST)
- Salary distribution analysis
- Employee cost trends
- Advance/loan portfolio analysis

---

## ⚙️ Configuration

### Uganda PAYE (2024)
Modify in `utils.py` if rates change:

```python
def calculate_paye(gross_salary: Decimal) -> Decimal:
    # Update bands here if tax rates change
```

### Company Tax Settings
Configured via Django admin or API:

```python
TaxSettings.objects.create(
    company=company,
    country='UG',
    currency='UGX',
    nssf_employee_rate=Decimal('10.00'),
    nssf_ceiling=Decimal('100000.00'),
    local_service_tax_enabled=True,
    local_service_tax_rate=Decimal('5.00'),
)
```

---

## 📝 Notes

- All amounts are in UGX (Uganda Shillings) by default
- Decimal precision: 2 places (cents equivalent)
- NSSF is capped at UGX 100,000 monthly ceiling
- PAYE uses 2024 Uganda revenue authority rates
- Supports multiple payment methods (bank, cash, mobile money)
- Audit trail preserved for compliance

---

## 🎯 Next Steps

1. Migrate database with payroll models
2. Configure company tax settings
3. Create salary structures for employees
4. Generate first payroll run
5. Review and approve payroll
6. Process payments
7. Email payslips to employees
8. Generate compliance reports

---

## 👥 Support

For issues or questions:
- Check `backend/payroll/` for model definitions
- Review `utils.py` for tax calculation logic
- Check `serializers.py` for API contract
- Run tests: `python manage.py test payroll`

---

**Built with ❤️ for African HR teams**
