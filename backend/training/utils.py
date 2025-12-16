import uuid
import hashlib
from datetime import datetime
from django.utils import timezone


def generate_certificate_number(enrollment):
    """
    Generate unique certificate number.
    Format: CERT-{COMPANY_CODE}-{PROGRAM_CODE}-{YEAR}-{UNIQUE}
    Example: CERT-ABC-TRN001-2024-A1B2
    """
    company_code = enrollment.employee.company.code[:3].upper() if hasattr(enrollment.employee.company, 'code') else 'COM'
    program_code = enrollment.session.program.code[:6].upper()
    year = enrollment.completed_at.year
    
    # Generate unique suffix
    unique_string = f"{enrollment.id}{enrollment.employee.id}{timezone.now().timestamp()}"
    unique_hash = hashlib.md5(unique_string.encode()).hexdigest()[:4].upper()
    
    return f"CERT-{company_code}-{program_code}-{year}-{unique_hash}"


def generate_verification_code():
    """
    Generate secure verification code for certificate.
    Format: UUID-based 12-character alphanumeric
    """
    return str(uuid.uuid4()).replace('-', '').upper()[:12]


def generate_session_code(program, start_date):
    """
    Generate session code.
    Format: {PROGRAM_CODE}-{YYYYMMDD}-{COUNTER}
    Example: TRN-001-20241215-01
    """
    date_str = start_date.strftime('%Y%m%d')
    
    # Count existing sessions for this program on this date
    from .models import TrainingSession
    count = TrainingSession.objects.filter(
        program=program,
        start_date__date=start_date.date()
    ).count() + 1
    
    return f"{program.code}-{date_str}-{count:02d}"


def calculate_training_hours(enrollments):
    """Calculate total training hours from enrollments."""
    total = 0
    for enrollment in enrollments:
        if enrollment.status == 'completed':
            total += float(enrollment.session.program.duration_hours)
    return total


def get_training_stats_for_employee(employee):
    """Get comprehensive training statistics for an employee."""
    from .models import TrainingEnrollment
    
    enrollments = TrainingEnrollment.objects.filter(employee=employee)
    
    stats = {
        'total_enrolled': enrollments.count(),
        'completed': enrollments.filter(status='completed').count(),
        'in_progress': enrollments.filter(status__in=['attended', 'in_progress']).count(),
        'pending': enrollments.filter(status__in=['pending', 'registered']).count(),
        'total_hours': calculate_training_hours(enrollments.filter(status='completed')),
        'certificates_earned': enrollments.filter(certificate_issued=True).count(),
        'average_score': 0,
        'compliance_rate': 0
    }
    
    # Calculate average assessment score
    completed_with_scores = enrollments.filter(
        status='completed',
        assessment_score__isnull=False
    )
    if completed_with_scores.exists():
        total_score = sum(e.assessment_score for e in completed_with_scores)
        stats['average_score'] = float(total_score / completed_with_scores.count())
    
    return stats


def get_training_stats_for_program(program):
    """Get statistics for a specific training program."""
    from .models import TrainingSession, TrainingEnrollment
    
    sessions = TrainingSession.objects.filter(program=program)
    enrollments = TrainingEnrollment.objects.filter(session__program=program)
    
    stats = {
        'total_sessions': sessions.count(),
        'upcoming_sessions': sessions.filter(
            status__in=['scheduled', 'open_enrollment'],
            start_date__gt=timezone.now()
        ).count(),
        'total_enrollments': enrollments.count(),
        'completion_rate': 0,
        'average_score': 0,
        'total_completions': enrollments.filter(status='completed').count()
    }
    
    # Completion rate
    if enrollments.count() > 0:
        stats['completion_rate'] = (stats['total_completions'] / enrollments.count()) * 100
    
    # Average score
    completed_with_scores = enrollments.filter(
        status='completed',
        assessment_score__isnull=False
    )
    if completed_with_scores.exists():
        total_score = sum(e.assessment_score for e in completed_with_scores)
        stats['average_score'] = float(total_score / completed_with_scores.count())
    
    return stats


def get_department_training_summary(company, department_name):
    """Get training summary for a specific department."""
    from employees.models import Employee
    from .models import TrainingEnrollment
    
    employees = Employee.objects.filter(company=company, department=department_name)
    enrollments = TrainingEnrollment.objects.filter(employee__in=employees)
    
    summary = {
        'department': department_name,
        'total_employees': employees.count(),
        'employees_trained': employees.filter(
            training_enrollments__status='completed'
        ).distinct().count(),
        'total_enrollments': enrollments.count(),
        'completed': enrollments.filter(status='completed').count(),
        'in_progress': enrollments.filter(status__in=['attended', 'in_progress']).count(),
        'total_training_hours': calculate_training_hours(enrollments.filter(status='completed')),
        'avg_hours_per_employee': 0
    }
    
    if summary['total_employees'] > 0:
        summary['avg_hours_per_employee'] = (
            summary['total_training_hours'] / summary['total_employees']
        )
    
    return summary


def validate_session_dates(start_date, end_date):
    """Validate training session dates."""
    errors = []
    
    if start_date >= end_date:
        errors.append("End date must be after start date")
    
    if start_date < timezone.now():
        errors.append("Start date cannot be in the past")
    
    return errors


def check_employee_availability(employee, start_date, end_date):
    """Check if employee has conflicting training sessions."""
    from .models import TrainingEnrollment
    
    conflicts = TrainingEnrollment.objects.filter(
        employee=employee,
        status__in=['registered', 'confirmed', 'attended', 'in_progress'],
        session__start_date__lt=end_date,
        session__end_date__gt=start_date
    )
    
    return not conflicts.exists(), list(conflicts)


def format_duration(hours):
    """Format duration in a readable way."""
    if hours < 1:
        return f"{int(hours * 60)} minutes"
    elif hours == 1:
        return "1 hour"
    elif hours < 8:
        return f"{hours:.1f} hours"
    else:
        days = hours / 8
        return f"{days:.1f} days ({hours:.1f} hours)"


def send_bulk_notifications(enrollments, notification_type):
    """Send notifications to multiple enrollments."""
    from .services import NotificationService
    
    for enrollment in enrollments:
        if notification_type == 'reminder':
            NotificationService.send_session_reminder(enrollment)
        elif notification_type == 'completion':
            NotificationService.send_completion_notification(enrollment)


def get_upcoming_sessions_for_employee(employee, days=30):
    """Get upcoming training sessions for an employee."""
    from .models import TrainingEnrollment
    from datetime import timedelta
    
    end_date = timezone.now() + timedelta(days=days)
    
    enrollments = TrainingEnrollment.objects.filter(
        employee=employee,
        status__in=['registered', 'confirmed'],
        session__start_date__range=[timezone.now(), end_date]
    ).select_related('session', 'session__program').order_by('session__start_date')
    
    return enrollments


def check_recertification_needed(enrollment):
    """Check if recertification is needed for a completed training."""
    if enrollment.status != 'completed':
        return False, None
    
    program = enrollment.session.program
    if not program.validity_period_months:
        return False, None
    
    from datetime import timedelta
    recert_date = enrollment.completed_at.date() + timedelta(
        days=program.validity_period_months * 30
    )
    
    if recert_date <= timezone.now().date():
        return True, recert_date
    
    return False, recert_date


def export_training_records(enrollments, format='csv'):
    """
    Export training records in various formats.
    Returns data suitable for CSV/Excel export.
    """
    records = []
    
    for enrollment in enrollments:
        record = {
            'Employee Name': enrollment.employee.full_name,
            'Employee ID': enrollment.employee.employee_id if hasattr(enrollment.employee, 'employee_id') else '',
            'Department': enrollment.employee.department,
            'Training Program': enrollment.session.program.name,
            'Session Date': enrollment.session.start_date.strftime('%Y-%m-%d'),
            'Status': enrollment.get_status_display(),
            'Enrolled Date': enrollment.enrolled_at.strftime('%Y-%m-%d'),
            'Completion Date': enrollment.completed_at.strftime('%Y-%m-%d') if enrollment.completed_at else '',
            'Score': enrollment.assessment_score or '',
            'Certificate Number': enrollment.certificate_number or '',
            'Duration Hours': float(enrollment.session.program.duration_hours)
        }
        records.append(record)
    
    return records


def calculate_roi_metrics(program, cost_per_session=None):
    """
    Calculate basic ROI metrics for a training program.
    """
    from .models import TrainingEnrollment
    
    enrollments = TrainingEnrollment.objects.filter(session__program=program)
    completed = enrollments.filter(status='completed')
    
    metrics = {
        'total_enrolled': enrollments.count(),
        'total_completed': completed.count(),
        'completion_rate': 0,
        'total_cost': 0,
        'cost_per_completion': 0,
        'total_hours_delivered': 0
    }
    
    if metrics['total_enrolled'] > 0:
        metrics['completion_rate'] = (metrics['total_completed'] / metrics['total_enrolled']) * 100
    
    if cost_per_session:
        sessions_count = program.sessions.count()
        metrics['total_cost'] = cost_per_session * sessions_count
        
        if metrics['total_completed'] > 0:
            metrics['cost_per_completion'] = metrics['total_cost'] / metrics['total_completed']
    
    metrics['total_hours_delivered'] = (
        metrics['total_completed'] * float(program.duration_hours)
    )
    
    return metrics