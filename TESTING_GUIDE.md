# 🧪 **COMPREHENSIVE TESTING GUIDE - LIFELINE HRMS**

**Date:** December 15, 2025  
**Purpose:** Systematic testing of all modules  
**Status:** Ready for testing

---

## 📋 **TESTING CHECKLIST**

### **✅ PHASE 1: NEW FEATURES (JUST IMPLEMENTED)**

#### **1. EMPLOYEE SELF-SERVICE PORTAL** ⭐ NEW

**URL:** `http://localhost:5173/employee/dashboard`

**Test Steps:**
1. Navigate to `/employee/dashboard`
2. **Verify:** Dashboard displays welcome message
3. **Verify:** Quick action cards visible (Payslips, Leave, Clock In/Out, Documents)
4. **Verify:** Leave balance cards showing
5. **Verify:** Recent payslips section visible
6. **Verify:** Sidebar navigation works
7. Click "View Payslips" → Should navigate to `/employee/payslips`
8. Click "Request Leave" → Should navigate to `/employee/leave`
9. Click "My Profile" → Should navigate to `/employee/profile`
10. Test on mobile (resize browser to 375px width)

**Expected Result:**
```
✅ Clean, modern dashboard
✅ All cards clickable
✅ Data displays correctly
✅ Mobile responsive
✅ No console errors
```

---

#### **2. LEAVE MANAGEMENT UI** ⭐ CRITICAL

**URL:** `http://localhost:5173/leave`

**Test Steps:**

**A. View Leave Balances:**
1. Navigate to `/leave`
2. **Verify:** Leave balance cards display at top
3. **Verify:** Shows remaining days, used days, total days
4. **Verify:** Progress bars show correct percentage
5. **Verify:** Multiple leave types displayed (Annual, Sick, etc.)

**B. Request Leave:**
1. Click "Request Leave" button
2. **Verify:** Dialog opens with form
3. Fill in form:
   - Leave Type: "Annual Leave"
   - Start Date: Tomorrow's date
   - End Date: 3 days from now
   - Reason: "Family vacation"
4. Click "Submit Leave Request"
5. **Verify:** Success toast appears
6. **Verify:** New request appears in list
7. **Verify:** Leave balance updated (pending state)

**C. Manager Approval (if manager/admin):**
1. **Verify:** Two tabs visible: "My Requests" and "Team Approvals"
2. Click "Team Approvals" tab
3. **Verify:** Pending requests from team members shown
4. Click "Approve" on a request
5. **Verify:** Success toast
6. **Verify:** Request status changes to "Approved"
7. **Verify:** Employee's leave balance updated

**D. Upload Document:**
1. Click "Request Leave"
2. Upload a PDF or image as medical certificate
3. Submit request
4. **Verify:** Document icon/link visible on request card
5. Click document link
6. **Verify:** Document downloads/opens

**Expected Result:**
```
✅ Leave balances display correctly
✅ Form validation works
✅ Requests submit successfully
✅ Approval workflow functions
✅ Balances update automatically
✅ Documents upload and view
✅ Mobile responsive
```

---

#### **3. CANDIDATE MANAGEMENT** ⭐ NEW

**URL:** `http://localhost:5173/recruitment/candidates`

**Test Steps:**

**A. View Candidates:**
1. Navigate to `/recruitment/candidates`
2. **Verify:** Candidate cards displayed in grid
3. **Verify:** Each card shows: name, email, phone, skills
4. **Verify:** Source badge visible (LinkedIn, Indeed, etc.)
5. **Verify:** Application count shown

**B. Search \u0026 Filter:**
1. Type name in search box
2. **Verify:** Candidates filter in real-time
3. Select source filter (e.g., "LinkedIn")
4. **Verify:** Only LinkedIn candidates shown
5. Clear filters
6. **Verify:** All candidates return

**C. Add Candidate:**
1. Click "Add Candidate" button
2. Fill in form:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@example.com"
   - Phone: "+256700000000"
   - LinkedIn: "https://linkedin.com/in/johndoe"
   - Skills: "React, Python, Django"
   - Source: "LinkedIn"
3. Click "Add Candidate"
4. **Verify:** Success toast
5. **Verify:** New candidate appears in list
6. **Verify:** Skills displayed as pills

**Expected Result:**
```
✅ Candidates display in grid
✅ Search works instantly
✅ Filters function correctly
✅ Add candidate succeeds
✅ Skills display properly
✅ Contact info clickable
✅ Mobile responsive
```

---

### **✅ PHASE 2: EXISTING FEATURES (REGRESSION TESTING)**

#### **4. DASHBOARD**

**URL:** `http://localhost:5173/dashboard`

**Test Steps:**
1. Navigate to `/dashboard`
2. **Verify:** Stats cards show numbers (Total Employees, Pending Leaves, etc.)
3. **Verify:** Quick action cards clickable
4. Click "Run Payroll" → Should navigate to `/payroll`
5. Click "Add Employee" → Should navigate to `/employees/new`
6. **Verify:** Recent activity section visible
7. **Verify:** Reminders widget shows content

**Expected Result:**
```
✅ All stats display
✅ Quick actions work
✅ Navigation functional
✅ No errors in console
```

---

#### **5. EMPLOYEE MANAGEMENT**

**URL:** `http://localhost:5173/employees`

**Test Steps:**

**A. List Employees:**
1. Navigate to `/employees`
2. **Verify:** Employee list displays in table/cards
3. **Verify:** Search box visible
4. Search for an employee name
5. **Verify:** Results filter correctly

**B. Add Employee:**
1. Click "Add Employee" button
2. Fill in form:
   - First Name, Last Name, Email
   - Department, Job Title
   - Upload photo (optional)
3. Click "Save"
4. **Verify:** Success message
5. **Verify:** New employee in list

**C. Edit Employee:**
1. Click "Edit" on an employee
2. Change job title
3. Click "Save"
4. **Verify:** Changes saved
5. Navigate back to list
6. **Verify:** Updated data shows

**Expected Result:**
```
✅ List displays correctly
✅ Search works
✅ Add succeeds
✅ Edit saves changes
✅ Photo upload works
```

---

#### **6. PAYROLL SYSTEM**

**URL:** `http://localhost:5173/payroll`

**Test Steps:**

**A. Salary Structures:**
1. Navigate to `/payroll` → Salary Structures tab
2. Click "Add Salary Structure"
3. Fill in:
   - Employee: Select one
   - Basic Salary: 3,000,000 UGX
   - Housing Allowance: 500,000 UGX
   - Transport: 300,000 UGX
4. **Verify:** Gross salary auto-calculates (3,800,000)
5. Click "Save"
6. **Verify:** Structure saved

**B. Run Payroll:**
1. Navigate to Payroll Runs tab
2. Click "Run Payroll"
3. Select month and year
4. Click "Generate"
5. **Verify:** Payroll run created
6. **Verify:** Payslips generated for all employees

**C. View Payslip:**
1. Click "View" on a payslip
2. **Verify:** Shows:
   - Earnings (Basic, Allowances, Gross)
   - Deductions (PAYE, NSSF, Net)
3. **Verify Calculations:**
   - PAYE matches Uganda 2024 tax rates
   - NSSF = 10% (up to 100,000 ceiling)
   - Net = Gross - Deductions

**D. Salary Advances:**
1. Navigate to Loans tab
2. Click "Request Advance"
3. Fill in amount and purpose
4. Submit
5. **Verify:** Advance appears in list
6. Approve advance (if manager)
7. **Verify:** Status updates

**Expected Result:**
```
✅ Salary structures save
✅ Payroll runs successfully
✅ Payslips generate
✅ PAYE calculated correctly
✅ NSSF calculated correctly
✅ Net salary accurate
✅ Advances workflow works
```

---

#### **7. RECRUITMENT (Jobs \u0026 Pipeline)**

**URL:** `http://localhost:5173/recruitment`

**Test Steps:**

**A. Create Job:**
1. Navigate to `/recruitment`
2. Click "Post Job"
3. Fill in:
   - Title: "Senior React Developer"
   - Location: "Kampala, Uganda"
   - Type: "Full Time"
   - Description: "We are looking for..."
   - Requirements: "5+ years experience"
4. Click "Create Job Posting"
5. **Verify:** Job appears in list
6. **Verify:** Status shows "Draft"

**B. View Pipeline:**
1. Click "View Pipeline"
2. **Verify:** Kanban board displays
3. **Verify:** Columns: Applied, Screening, Interview, Offer, Hired
4. **Verify:** Applications shown in correct stages
5. Try dragging a card (if drag-drop enabled)
6. **Verify:** Card moves to new stage

**C. Candidate to Job:**
1. Go back to Candidates page
2. Click on a candidate
3. **Verify:** Can view applications
4. **Verify:** Can add to job

**Expected Result:**
```
✅ Jobs create successfully
✅ Pipeline displays correctly
✅ Drag-and-drop works
✅ Applications track properly
✅ Status updates correctly
```

---

#### **8. DEPARTMENTS \u0026 ORG CHART**

**URL:** `http://localhost:5173/departments`

**Test Steps:**
1. Navigate to `/departments`
2. **Verify:** Department list displays
3. Click "Add Department"
4. Create "Marketing" department
5. **Verify:** Department added
6. Navigate to `/org-chart`

7. **Verify:** Org chart displays hierarchy
8. **Verify:** Manager-employee relationships shown
9. **Verify:** Chart is interactive

**Expected Result:**
```
✅ Departments CRUD works
✅ Org chart renders
✅ Hierarchy displays correctly
✅ Interactive elements work
```

---

### **✅ PHASE 3: INTEGRATION TESTING**

#### **TEST SCENARIO 1: Complete Employee Lifecycle**

```
1. Add new employee "Jane Smith"
2. Create salary structure for Jane (UGX 4,000,000)
3. Run payroll for current month
4. Verify Jane's payslip generated
5. Jane requests leave (as employee role)
6. Manager approves leave
7. Verify Jane's leave balance updated
8. Verify payroll deducts leave days (if unpaid)
```

**Expected:** All steps complete without errors

---

#### **TEST SCENARIO 2: Recruitment to Hire**

```
1. Create job "Front-end Developer"
2. Add candidate "John Doe"
3. Create application (John → Front-end Developer)
4. Move John through pipeline: Applied → Interview → Offer → Hired
5. Convert John to employee
6. Create salary structure for John
```

**Expected:** Full recruitment workflow

---

#### **TEST SCENARIO 3: Leave \u0026 Payroll Integration**

```
1. Employee has leave balance: 21 days
2. Employee requests 5 days leave
3. Manager approves
4. Verify balance: 16 days remaining
5. Run payroll for month with leave
6. Verify leave days deducted from salary (if unpaid)
```

**Expected:** Leave and payroll sync correctly

---

## 🐛 **KNOWN ISSUES / BUGS TO WATCH FOR**

### **Potential Issues:**

1. **Leave Balance Calculation**
   - Check if pending days update correctly
   - Verify approval updates used_days
   - Ensure available_days accurate

2. **Payroll Tax Calculations**
   - PAYE should match Uganda 2024 bands exactly
   - NSSF capped at 100,000 UGX
   - Net salary = gross - all deductions

3. **File Uploads**
   - Employee photos
   - Leave documents
   - Resume uploads
   - Check file size limits
   - Verify file formats accepted

4. **Permissions**
   - Employees can't approve own leave
   - Only managers see "Team Approvals"
   - RBAC enforced on all actions

5. **Date Handling**
   - Timezone issues (UTC vs EAT)
   - Date range validation
   - Public holiday exclusion

---

## ✅ **TEST RESULTS TEMPLATE**

```
MODULE: _______________
TESTER: _______________
DATE: _________________

Test Case                    Status    Notes
────────────────────────────────────────────────
1. [Describe test]           ✅/❌     
2. [Describe test]           ✅/❌     
3. [Describe test]           ✅/❌     

BUGS FOUND:
- Bug 1: Description
- Bug 2: Description

OVERALL: PASS / FAIL
```

---

## 🚀 **QUICK TEST COMMANDS**

### **Start  Servers:**
```bash
# Terminal 1: Backend
cd backend
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm run dev
```

### **Access URLs:**
```
Frontend:  http://localhost:5173
Backend API: http://localhost:8000/api
Admin:     http://localhost:8000/admin
```

### **Test Accounts:**
```
Create via: http://localhost:8000/admin
- Superuser (admin)
- Manager (manager role)
- Employee (employee role)
```

---

## 📊 **SUCCESS CRITERIA**

### **For MVP Launch:**
- [ ] All CRUD operations work
- [ ] No critical bugs
- [ ] Mobile responsive
- [ ] Data persists correctly
- [ ] Permissions enforced
- [ ] Performance acceptable (<2s page load)

### **For Production Launch:**
- [ ] All modules 100% functional
- [ ] End-to-end workflows tested
- [ ] Security audit passed
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] User acceptance testing done

---

**Start testing and report any issues!** 🧪

**Priority Order:**
1. Leave Management (NEW - critical)
2. Employee Portal (NEW - critical)
3. Candidate Management (NEW - important)
4. Payroll (regression)
5. Recruitment Pipeline (regression)
6. Others (regression)
