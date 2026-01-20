import random
from datetime import datetime
from django.db.models import Sum
from employees.models import Employee
from leave.models import LeaveRequest, LeaveBalance
from attendance.models import Attendance
from payroll.models import Payslip

class AIService:
    @staticmethod
    def process_query(user, query):
        query = query.lower()
        employee = getattr(user, 'employee', None)
        
        # 1. Leave Balance Queries
        if any(word in query for word in ['leave', 'vacation', 'off']):
            if not employee:
                return "I couldn't find an employee record associated with your account to check leave balances."
            
            balances = LeaveBalance.objects.filter(employee=employee, year=datetime.now().year)
            if balances.exists():
                bal_text = ", ".join([f"{b.leave_type.name}: {b.available_days} days" for b in balances])
                return f"Hi {user.first_name}, your current available leave balances for {datetime.now().year} are: {bal_text}."
            return f"Hi {user.first_name}, you have 15 days of annual leave remaining. (Note: I couldn't find a detailed balance record, showing default)."

        # 2. Payroll Queries
        if any(word in query for word in ['salary', 'pay', 'payslip', 'money']):
            if not employee:
                return "I need an employee record to look up payroll information."
            
            last_payslip = Payslip.objects.filter(employee=employee).order_by('-payroll_run__year', '-payroll_run__month').first()
            if last_payslip:
                return f"Your latest payslip for {last_payslip.payroll_run.month}/{last_payslip.payroll_run.year} is available. Your net salary was {last_payslip.net_salary}."
            return "I couldn't find any recent payslips for you. Please check the Payroll section for more details."

        # 3. Attendance Queries
        if any(word in query for word in ['attendance', 'clock', 'time']):
            if not employee:
                return "I don't see any attendance records for you."
            
            today = datetime.now().date()
            record = Attendance.objects.filter(employee=employee, date=today).first()
            if record and record.clock_in:
                return f"You clocked in today at {record.clock_in.strftime('%H:%M')}. Status: {record.status.title()}."
            return "You haven't clocked in yet today. Would you like me to open the attendance page for you?"

        # 4. Company Info
        if any(word in query for word in ['policy', 'handbook', 'rules']):
            return "You can find all company policies and the employee handbook in the 'Documents' section under the 'Company Policies' folder."

        # 5. Fallback
        responses = [
            "I'm your Lifeline AI Assistant. I can help you check leave balances (e.g., 'What is my leave balance?'), view pay info, or find company policies.",
            "I'm not quite sure about that yet, but I'm learning! You might find that information in the main dashboard or by asking HR.",
            "That's a great question. For specific HR requests like that, it's best to use the 'Digital Forms' section to submit a formal request."
        ]
        return random.choice(responses)
