import requests
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class CalendarService:
    """Base category for External Calendars"""
    
    def __init__(self, integration):
        self.integration = integration

    def sync_events(self):
        raise NotImplementedError

    def create_event(self, title, start_time, end_time, description=""):
        raise NotImplementedError


class GoogleCalendarService(CalendarService):
    """Google Calendar Implementation"""
    
    def create_event(self, title, start_time, end_time, description=""):
        if not self.integration.is_active:
            return None
        
        url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
        headers = {"Authorization": f"Bearer {self.integration.access_token}"}
        
        payload = {
            "summary": title,
            "description": description,
            "start": {"dateTime": start_time.isoformat()},
            "end": {"dateTime": end_time.isoformat()},
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json() if response.status_code == 200 else None


class OutlookCalendarService(CalendarService):
    """Outlook/Microsoft 365 Calendar Implementation"""
    
    def create_event(self, title, start_time, end_time, description=""):
        if not self.integration.is_active:
            return None
            
        url = "https://graph.microsoft.com/v1.0/me/events"
        headers = {"Authorization": f"Bearer {self.integration.access_token}"}
        
        payload = {
            "subject": title,
            "body": {"contentType": "HTML", "content": description},
            "start": {"dateTime": start_time.isoformat(), "timeZone": "UTC"},
            "end": {"dateTime": end_time.isoformat(), "timeZone": "UTC"},
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json() if response.status_code == 201 else None
