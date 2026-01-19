import requests
import logging

logger = logging.getLogger(__name__)

class MeetingService:
    @staticmethod
    def create_zoom_meeting(integration, topic, start_time, duration=30):
        if not integration.is_active:
            return None
            
        url = f"https://api.zoom.us/v2/users/me/meetings"
        headers = {"Authorization": f"Bearer {integration.access_token}"}
        
        payload = {
            "topic": topic,
            "type": 2, # Scheduled meeting
            "start_time": start_time.isoformat(),
            "duration": duration,
        }
        
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 201:
            data = response.json()
            return {
                'link': data.get('join_url'),
                'id': data.get('id'),
                'password': data.get('password')
            }
        return None

    @staticmethod
    def create_teams_meeting(integration, subject, start_time, end_time):
        if not integration.is_active:
            return None
            
        url = "https://graph.microsoft.com/v1.0/me/onlineMeetings"
        headers = {"Authorization": f"Bearer {integration.access_token}"}
        
        payload = {
            "startDateTime": start_time.isoformat(),
            "endDateTime": end_time.isoformat(),
            "subject": subject,
        }
        
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 201:
            data = response.json()
            return {
                'link': data.get('joinWebUrl'),
                'id': data.get('id')
            }
        return None
