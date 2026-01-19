from core_integrations.models import ExternalIntegration
from core_integrations.services.calendar_service import GoogleCalendarService, OutlookCalendarService
from core_integrations.services.meeting_service import MeetingService
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class RecruitmentIntegrationOrchestrator:
    @staticmethod
    def handle_interview_creation(interview):
        """
        When an interview is created/scheduled:
        1. Find active calendar/meeting integrations for the company.
        2. Create a meeting link (Zoom/Teams).
        3. Create a calendar event (Google/Outlook).
        4. Update the interview object with links/event IDs.
        """
        company = interview.application.job.company
        candidate_name = interview.application.candidate.full_name
        integrations = ExternalIntegration.objects.filter(company=company, is_active=True)
        
        meeting_info = None
        calendar_info = None
        
        try:
            # 1. Handle Meetings
            zoom = integrations.filter(provider='zoom').first()
            teams = integrations.filter(provider='teams').first()
            
            if zoom:
                meeting_info = MeetingService.create_zoom_meeting(
                    zoom, 
                    f"Interview: {candidate_name}", 
                    interview.date_time,
                    interview.duration_minutes
                )
            elif teams:
                meeting_info = MeetingService.create_teams_meeting(
                    teams, 
                    f"Interview: {candidate_name}", 
                    interview.date_time,
                    interview.date_time + timezone.timedelta(minutes=interview.duration_minutes)
                )
                
            if meeting_info:
                interview.meeting_link = meeting_info.get('link')
                interview.meeting_id = meeting_info.get('id')
                interview.location = interview.meeting_link # Auto-set location to link
                
            # 2. Handle Calendar
            google = integrations.filter(provider='google_calendar').first()
            outlook = integrations.filter(provider='microsoft_outlook').first()
            
            description = f"Interview for {interview.application.job.title}.\n"
            if interview.meeting_link:
                description += f"Meeting Link: {interview.meeting_link}"
                
            if google:
                service = GoogleCalendarService(google)
                calendar_info = service.create_event(
                    f"HR Interview: {candidate_name}",
                    interview.date_time,
                    interview.date_time + timezone.timedelta(minutes=interview.duration_minutes),
                    description
                )
                if calendar_info:
                    interview.external_event_id = calendar_info.get('id')
            elif outlook:
                service = OutlookCalendarService(outlook)
                calendar_info = service.create_event(
                    f"HR Interview: {candidate_name}",
                    interview.date_time,
                    interview.date_time + timezone.timedelta(minutes=interview.duration_minutes),
                    description
                )
                if calendar_info:
                    interview.external_event_id = calendar_info.get('id')
            
            if meeting_info or calendar_info:
                interview.sync_status = 'synced'
            
        except Exception as e:
            logger.error(f"Failed to orchestrate interview integrations: {e}")
            interview.sync_status = 'failed'
            
        interview.save()
        return {
            'meeting': meeting_info,
            'calendar': calendar_info
        }
