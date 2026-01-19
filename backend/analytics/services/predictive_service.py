from datetime import timedelta
from django.utils import timezone
from employees.models import Employee
from recruitment.models import Job, Application

class PredictiveAnalyticsService:
    @staticmethod
    def calculate_turnover_risk(employee):
        """
        Calculate turnover risk for an employee (0-100).
        Logic:
        - Low tenure (< 6 months) -> High risk
        - On probation -> Medium risk
        - No performance review in 1 year -> High risk
        - Job title contains 'Junior' -> Higher risk
        """
        risk = 20 # Base risk
        
        days_tenure = (timezone.now().date() - employee.join_date).days if employee.join_date else 0
        if days_tenure < 180:
            risk += 30 # New hire risk
            
        if employee.employment_status == 'on_probation':
            risk += 15
            
        # Simplified: Check job title for high-turnover roles
        if 'Sales' in employee.job_title:
            risk += 10
            
        return min(risk, 100)

    @staticmethod
    def predict_hiring_timeline(job):
        """
        Predict how many days it will take to fill a job.
        """
        # Base: 30 days
        days = 30
        
        # Difficulty based on applicants
        app_count = job.applications.count()
        if app_count < 5:
            days += 15 # Hard to fill
        elif app_count > 20:
            days -= 5 # Easy to fill
            
        # Experience level impact
        if 'Senior' in job.title:
            days += 20
        elif 'Junior' in job.title:
            days -= 5
            
        return days

    @staticmethod
    def get_company_wide_predictions(company):
        """
        Get aggregated predictions for the dashboard.
        """
        employees = Employee.objects.filter(company=company, employment_status='active')
        high_risk_count = 0
        for emp in employees:
            if PredictiveAnalyticsService.calculate_turnover_risk(emp) > 60:
                high_risk_count += 1
                
        # Calculate avg hiring timeline
        jobs = Job.objects.filter(company=company, status='published')
        avg_hiring_days = 0
        if jobs.exists():
            avg_hiring_days = sum([PredictiveAnalyticsService.predict_hiring_timeline(j) for j in jobs]) / jobs.count()
        else:
            avg_hiring_days = 25 # Defaults
            
        return {
            'potential_turnover_rate': round((high_risk_count / employees.count() * 100) if employees.count() > 0 else 0, 1),
            'predicted_hiring_timeline': round(avg_hiring_days, 1),
            'risk_level': 'Moderate' if high_risk_count > 2 else 'Low',
            'retention_score': 100 - (high_risk_count * 5)
        }
