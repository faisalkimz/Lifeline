# 🚀 Payroll System - Quick Start Guide

Get your payroll system up and running in minutes!

---

## 📋 Prerequisites

- Django backend running
- Frontend development server running
- Database migrations applied
- User with HR Manager or Admin role

---

## ⚡ Quick Setup (5 minutes)

### 1. Run Database Migrations

```bash
cd backend
python manage.py migrate
```

This creates all payroll tables:
- `payroll_salarystructure`
- `payroll_payrollrun`
- `payroll_payslip`
- `payroll_salaryadvance`
- `payroll_taxsettings`
- `payroll_payrollauditlog`

### 2. Configure Tax Settings

```bash
# Create a tax settings record for your company (done via admin or API)
python manage.py shell

from accounts.models import Company
from payroll.models import TaxSettings

company = Company.objects.first()  # Your company
settings = TaxSettings.objects.create(
    company=company,
    country='UG',
    currency='UGX',
    nssf_employee_rate=10.00,
    nssf_ceiling=100000.00,
    local_service_tax_enabled=True,
    local_service_tax_rate=5.00,
)
print(f"Tax settings created for {company.name}")
```

### 3. Access Payroll in Frontend

Navigate to: `http://localhost:5173/payroll`

---

## 👷 Step-by-Step Usage

### **Step 1: Create Salary Structures**

1. Go to **Payroll → Salaries**
2. Click **"New Salary Structure"**
3. Select an employee
4. Enter:
   - Basic Salary
   - Allowances (Housing, Transport, Medical, Lunch, Other)
5. Click **"Save Salary Structure"**

**Example:**
```
Employee: John Doe
Basic Salary: 3,000,000
Housing: 500,000
Transport: 300,000
Medical: 200,000
Gross: 4,000,000 (auto-calculated)
```

✅ **Result**: System now knows John's salary components

---

### **Step 2: Create Payroll Run**

1. Go to **Payroll → Dashboard**
2. Click **"New Payroll Run"**
3. Select Month & Year
4. Click **"Create"**

✅ **Result**: Payroll run created in "Draft" status

---

### **Step 3: Process Payroll**

1. Select the payroll run on dashboard
2. Click **"Process Payroll"**
3. System automatically:
   - Fetches all active employees
   - Gets their salary structures
   - Calculates taxes & deductions
   - Creates individual payslips

💡 **What happens internally**:
```
For each employee:
  Gross = Basic + Allowances
  PAYE = calculate_paye(Gross)
  NSSF = min(Gross * 0.10, 10,000)
  Total Deductions = PAYE + NSSF + Loans + Advances
  Net = Gross - Total Deductions
```

✅ **Result**: Payslips generated, status → "Processing"

---

### **Step 4: Review & Approve**

1. Click **"Review"** to see payslip details
2. Verify calculations
3. Click **"Approve Payroll"**
4. Add approval notes (optional)

✅ **Result**: Status → "Approved", locked for processing

---

### **Step 5: Process Payment**

1. Click **"Process Payment"**
2. Verify payment method (Bank/Cash/Mobile Money)
3. Click **"Mark as Paid"**
4. System can generate bank payment file (CSV/Excel)

✅ **Result**: Payslips marked as paid, employees can view

---

### **Step 6: Distribute Payslips**

1. Go to **Payroll → Payslips**
2. Click **"View"** to see individual payslip
3. Click **"Download PDF"** to save locally
4. Click **"Email Payslip"** to send to employee
5. Or **"Download All"** to batch process

✅ **Result**: Employees receive payslips

---

## 💳 Salary Advance Workflow

### Request (Employee)

1. Go to **Payroll → Loans**
2. Click **"Request Advance"**
3. Enter:
   - Amount
   - Reason
   - Repayment period (3-12 months)
4. Submit

### Approve (HR Manager)

1. Go to **Payroll → Loans**
2. Find pending request
3. Click **"Approve"** or **"Reject"**
4. System auto-calculates monthly deduction

✅ **Result**: Amount deducted from next payslip

---

## 📊 Dashboard Overview

When you log in to **Payroll**, you see:

```
┌─────────────────────────────────────────────────────┐
│ PAYROLL MANAGEMENT                                   │
│ Process, manage, and track employee salaries        │
└─────────────────────────────────────────────────────┘

┌─ KEY METRICS ──────────────────────────────────────┐
│ Employees: 45        Total Gross: UGX 125M         │
│ Deductions: UGX 26M  Total Net: UGX 98.5M          │
│ Avg Salary: UGX 2.2M                               │
└────────────────────────────────────────────────────┘

┌─ DECEMBER 2025 PAYROLL ────────────────────────────┐
│ Status: PAID ✓                                      │
│ Employees: 45                                       │
│ Gross: UGX 125,000,000  Net: UGX 98,500,000        │
│ Actions: [Download Payslips] [Bank File]           │
└────────────────────────────────────────────────────┘

┌─ RECENT PAYROLL RUNS ──────────────────────────────┐
│ Month      Status     Employees  Gross    Net      │
│ Dec 2025   PAID       45        125M     98.5M    │
│ Nov 2025   APPROVED   44        120M     95M      │
│ Oct 2025   PAID       42        118M     93.5M    │
└────────────────────────────────────────────────────┘
```

---

## 🧮 Tax Calculation Examples

### Example 1: Basic Employee

```
Basic Salary:           3,000,000
Housing Allowance:        500,000
Transport Allowance:      300,000
Medical Allowance:        200,000
─────────────────────────────────
GROSS SALARY:           4,000,000

PAYE Tax:                 591,000  (using 2024 UG rates)
NSSF (10% capped):         10,000
─────────────────────────────────
TOTAL DEDUCTIONS:         601,000

NET SALARY:             3,399,000
```

### Example 2: Senior Employee

```
Basic Salary:          15,000,000
Housing Allowance:      3,000,000
─────────────────────────────────
GROSS SALARY:          18,000,000

PAYE Tax:             3,102,000   (highest bracket: 40%)
NSSF (10% capped):       10,000
─────────────────────────────────
TOTAL DEDUCTIONS:    3,112,000

NET SALARY:          14,888,000
```

---

## 🔍 Where to Find Information

### Payroll Runs
- **Table**: Recent payroll runs sorted by month/year
- **Actions**: Process, Approve, Pay, View Details
- **Export**: Download payslip bundle or bank file

### Payslips
- **View**: Individual payslip with full breakdown
- **Download**: PDF format for printing/archiving
- **Email**: Send directly to employee
- **Search**: Filter by employee or month

### Salary Structures
- **List**: All employees with current salary
- **Edit**: Update allowances or basic salary
- **History**: View previous salary changes
- **Approve**: HR manager approves structural changes

### Loans/Advances
- **Request**: Employee submits advance request
- **Pending**: HR reviews and approves
- **Active**: Current advances being deducted
- **Repaid**: Completed advances

---

## ⚠️ Important Notes

### Tax Calculations
- All calculations use **2024 Uganda Revenue Authority rates**
- PAYE bands: 0% → 10% → 20% → 30% → 40%
- NSSF capped at UGX 100,000 monthly ceiling
- Rates are configurable per company

### Payroll Locking
- Once approved, payroll **cannot be edited**
- To modify, must "Cancel" and create new run
- Maintains audit trail for compliance

### Payment Methods
- **Bank**: Generate file for batch upload
- **Cash**: Manual payment tracking
- **Mobile Money**: MTN/Airtel payment integration (future)

### User Roles
- **Admin**: Full access to all payroll functions
- **HR Manager**: Create, process, approve payroll
- **Employee**: View own payslips and request advances
- **Finance**: View payment files (read-only)

---

## 🐛 Troubleshooting

### Problem: "No payroll run for this month"

**Solution**: Create new payroll run
```
1. Go to Dashboard
2. Click "Create Payroll Run"
3. Select month/year
4. Click "Create"
```

### Problem: Payslips not generating

**Solution**: Check salary structures exist
```
1. Go to Payroll → Salaries
2. Verify salary structures for all employees
3. Check "effective_date" is before payroll month
4. Click "Process Payroll" again
```

### Problem: PAYE calculation seems wrong

**Solution**: Verify using manual calculation
```
Gross: 4,000,000
- First 235,000: 0% = 0
- Next 100,000 (235k-335k): 10% = 10,000
- Next 75,000 (335k-410k): 20% = 15,000
- Remaining 3,590,000 (410k+): 30% = 1,077,000
TOTAL PAYE = 1,102,000
```

### Problem: NSSF showing more than 10,000

**Solution**: NSSF is capped at 10,000
- If salary < 100,000: Calculate 10%
- If salary >= 100,000: Always 10,000 (capped)
- Employer NSSF is separate (not deducted from employee)

---

## 📞 Support Checklist

When asking for help, provide:
- [ ] Employee name and employee number
- [ ] Salary components (basic, allowances)
- [ ] Expected gross salary
- [ ] Payroll month/year
- [ ] Error message (if any)
- [ ] Screenshot of issue

---

## ✅ Verification Checklist

After processing a payroll run:

- [ ] All active employees have payslips
- [ ] Gross salaries calculated correctly
- [ ] PAYE tax is reasonable (0-40% of gross)
- [ ] NSSF is capped at 10,000
- [ ] Net salary > 0 for all employees
- [ ] Total deductions < total gross
- [ ] No employees missing from run

---

## 🎯 Best Practices

1. **Process on time**: Run payroll before month-end
2. **Review carefully**: Check calculations before approving
3. **Maintain records**: Archive payslips for compliance
4. **Update salaries**: Create new structure for raises/changes
5. **Track advances**: Monitor outstanding loans
6. **Audit regularly**: Review payroll audit logs monthly
7. **Back up data**: Export payslips regularly
8. **Communicate**: Email payslips promptly to employees

---

## 📱 Mobile Friendly

- Dashboard works on mobile
- View payslips on phone
- Download PDFs for offline access
- Email integration for employee self-service

---

**That's it! You're now ready to process payroll! 🎉**

For detailed technical info, see: `PAYROLL_SYSTEM.md`
