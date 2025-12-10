# ⚠️ **SETUP REQUIRED - Employee Record Missing**

## 🔴 **Problem:**
Getting 400 errors on:
- `/api/payroll-runs/` 
- `/api/leave/requests/`
- `/api/attendance/records/clock_in/`

## 🎯 **Root Cause:**
Your **user account** doesn't have an **Employee record**.

All HRMS features require an Employee record because:
- Leave requests are tied to employees
- Attendance tracking needs employee data
- Payroll runs need employees to process

---

## ✅ **SOLUTION 1: Create Employee via UI** (Easiest)

### Step-by-Step:
1. **Go to `/employees`** in your app
2. **Click "Add Employee"**
3. **Fill in the form:**
   - Employee Number: `EMP001`
   - First Name: (your name)
   - Last Name: (your last name)
   - Email: (your email)
   - Employment Status: `Active`
   - **IMPORTANT:** Select your user account in the "User" dropdown
4. **Save**

Now:
- ✅ Leave requests will work
- ✅ Attendance will work
- ✅ Payroll will work

---

## ✅ **SOLUTION 2: Django Admin** (Quick)

1. Go to `http://localhost:8000/admin/`
2. Login with your superuser
3. Go to **Employees**
4. Click **Add Employee**
5. Fill in:
   - User: (select your user)
   - Company: (select your company)
   - Employee Number: `EMP001`
   - First/Last Name
   - Email
   - Employment Status: `Active`
6. **Save**

---

## ✅ **SOLUTION 3: Django Shell** (Fastest)

```bash
cd backend
python manage.py shell
```

Then paste this:

```python
from employees.models import Employee
from accounts.models import User

# Get your user (assuming you're the first user)
user = User.objects.first()
print(f"Creating employee for: {user.email}")

# Check if employee already exists
if hasattr(user, 'employee'):
    print("Employee already exists!")
else:
    # Create employee
    employee = Employee.objects.create(
        user=user,
        company=user.company,
        employee_number='EMP001',
        first_name=user.first_name or 'Admin',
        last_name=user.last_name or 'User',
        email=user.email,
        employment_status='active',
        job_title='System Administrator'
    )
    print(f"✅ Employee created: {employee}")
```

---

## 🔍 **HOW TO CHECK:**

### Check if you have an employee record:

```bash
python manage.py shell
```

```python
from accounts.models import User
user = User.objects.first()
print(f"User: {user.email}")
print(f"Has Employee: {hasattr(user, 'employee')}")
if hasattr(user, 'employee'):
    print(f"Employee: {user.employee}")
```

---

## 📝 **AFTER CREATING EMPLOYEE:**

Then you can:

### 1. **Submit Leave Requests** 
- Go to `/leave`
- Click "New Request"
- Should work! ✅

### 2. **Clock In/Out**
- Go to `/attendance`
- Click "Clock In"
- Should work! ✅

### 3. **Create Payroll Runs**
- Go to `/payroll`
- Click "New Payroll Run"
- Should work! ✅

---

## 🎯 **WHY THIS HAPPENS:**

The Django User model (for authentication) is separate from the Employee model (for HR data).

```
User (accounts app)
  ↓ One-to-One
Employee (employees app)
```

You can have users without employee records (like external contractors), but HRMS features need the employee data.

---

## ✅ **RECOMMENDED APPROACH:**

**Use Solution 1** (UI method):
1. It's the most user-friendly
2. You'll see the form you built
3. It validates everything
4. Works exactly like production

**Time:** 2 minutes

---

**After you create the employee record, EVERYTHING will work!** 🚀
