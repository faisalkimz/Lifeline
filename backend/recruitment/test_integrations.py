from django.test import TestCase
from recruitment.models import Job, Application, Interview, IntegrationSettings, Candidate
from accounts.models import Company
from employees.models import Employee, Department
from recruitment.services.integration_orchestrator import RecruitmentIntegrationOrchestrator
from django.utils import timezone
from unittest.mock import patch, MagicMock

class RecruitmentIntegrationTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Test Corp")
        self.department = Department.objects.create(company=self.company, name="HR")
        
        # Helper to create valid employee
        def create_test_employee(first, last, email):
            return Employee.objects.create(
                company=self.company,
                first_name=first,
                last_name=last,
                email=email,
                department=self.department,
                date_of_birth="1990-01-01",
                join_date="2023-01-01",
                national_id="ID123456",
                gender="male",
                phone="0700123456",
                job_title="HR Manager"
            )

        self.employee = create_test_employee("Hr", "Manager", "hr@test.com")
        self.job = Job.objects.create(
            company=self.company,
            title="Python Developer",
            description="Build cool stuff",
            status='published'
        )
        
        self.cand = Candidate.objects.create(
            company=self.company,
            first_name="John",
            last_name="Smith",
            email="john@smith.com"
        )
        self.application = Application.objects.create(
            job=self.job,
            candidate=self.cand,
            stage='applied'
        )

    @patch('recruitment.services.integration_orchestrator.RecruitmentIntegrationOrchestrator.handle_interview_creation')
    def test_interview_creation_triggers_orchestrator(self, mock_orchestrator):
        interview = Interview.objects.create(
            application=self.application,
            interviewer=self.employee,
            date_time=timezone.now(),
            duration_minutes=30,
            interview_type='video',
            location=''
        )
        RecruitmentIntegrationOrchestrator.handle_interview_creation(interview)
        mock_orchestrator.assert_called_once_with(interview)

    @patch('core_integrations.services.meeting_service.MeetingService.create_zoom_meeting')
    @patch('core_integrations.services.calendar_service.GoogleCalendarService.create_event')
    def test_orchestrator_creates_meetings_and_calendar_events(self, mock_calendar, mock_meeting):
        # Setup integrations
        from core_integrations.models import ExternalIntegration
        ExternalIntegration.objects.create(
            company=self.company,
            provider='zoom',
            client_id="zoom_id",
            client_secret="zoom_secret",
            is_active=True
        )
        ExternalIntegration.objects.create(
            company=self.company,
            provider='google_calendar',
            client_id="google_id",
            client_secret="google_secret",
            is_active=True
        )

        mock_meeting.return_value = {
            'link': 'https://zoom.us/j/123',
            'id': '123'
        }
        mock_calendar.return_value = {'id': 'event_999'}

        interview = Interview.objects.create(
            application=self.application,
            interviewer=self.employee,
            date_time=timezone.now(),
            duration_minutes=30,
            interview_type='video',
            location=''
        )

        RecruitmentIntegrationOrchestrator.handle_interview_creation(interview)
        
        interview.refresh_from_db()
        self.assertEqual(interview.meeting_link, 'https://zoom.us/j/123')
        self.assertEqual(interview.external_event_id, 'event_999')
        self.assertEqual(interview.sync_status, 'synced')
    @patch('recruitment.services.base_publisher.BaseJobPublisher._make_request')
    def test_indeed_publisher_connection(self, mock_request):
        # Setup integration settings
        integration = IntegrationSettings.objects.create(
            company=self.company,
            platform='indeed',
            client_id="indeed_id",
            client_secret="indeed_secret",
            access_token="valid_token",
            is_active=True
        )
        
        from recruitment.services.indeed_publisher import IndeedPublisher
        publisher = IndeedPublisher(integration)
        
        # Mock success response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'jobs': []}
        mock_request.return_value = mock_response
        
        result = publisher.test_connection()
        self.assertTrue(result['success'])
        self.assertIn("successful", result['message'])

        # Mock failure
        mock_request.side_effect = Exception("Invalid token")
        result = publisher.test_connection()
        self.assertFalse(result['success'])
        self.assertIn("rejected", result['error'])
