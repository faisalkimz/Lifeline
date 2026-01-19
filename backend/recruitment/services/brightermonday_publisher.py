"""
BrighterMonday (Ugandan job board) integration
"""
from typing import Dict, Any
from .base_publisher import BaseJobPublisher


class BrighterMondayPublisher(BaseJobPublisher):
    """
    BrighterMonday Jobs API publisher
    BrighterMonday is Uganda's #1 job site
    """
    
    BASE_URL = "https://api.brightermonday.co.ug/v1"
    
    def __init__(self, integration_settings):
        super().__init__(integration_settings)
        self.api_key = integration_settings.api_key

    def test_connection(self) -> Dict[str, Any]:
        """Verify BrighterMonday connection status"""
        if not self.is_authorized():
             return {'success': False, 'error': 'API Key is required.'}
        
        try:
            headers = {
                'X-API-Key': self.api_key,
                'Content-Type': 'application/json'
            }
            # Lightweight call to verify key
            self._make_request('GET', f'{self.BASE_URL}/me', headers=headers)
            return {'success': True, 'message': 'BrighterMonday API handshake successful.'}
        except Exception as e:
            return {'success': False, 'error': f'BrighterMonday API error: {str(e)}'}
    
    def publish_job(self, job) -> Dict[str, Any]:
        """Post a job to BrighterMonday"""
        if not self.is_authorized():
            return {
                'success': False,
                'error': 'BrighterMonday integration not authorized. Please configure API credentials.'
            }
        
        job_data = self._format_brightermonday_job(job)
        
        headers = {
            'X-API-Key': self.api_key,
            'Content-Type': 'application/json'
        }
        
        try:
            response = self._make_request(
                'POST',
                f'{self.BASE_URL}/jobs/create',
                headers=headers,
                json=job_data
            )
            
            result = response.json()
            external_id = result.get('job_id', '')
            
            return {
                'success': True,
                'external_id': str(external_id),
                'url': result.get('job_url', f'https://www.brightermonday.co.ug/job/{external_id}'),
                'status': 'published',
                'platform': 'brightermonday'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'brightermonday'
            }
    
    def update_job(self, job, external_id: str) -> Dict[str, Any]:
        """Update BrighterMonday job posting"""
        if not self.is_authorized():
            return {'success': False, 'error': 'Not authorized'}
        
        job_data = self._format_brightermonday_job(job)
        
        headers = {
            'X-API-Key': self.api_key,
            'Content-Type': 'application/json'
        }
        
        try:
            response = self._make_request(
                'PUT',
                f'{self.BASE_URL}/jobs/{external_id}/update',
                headers=headers,
                json=job_data
            )
            
            return {
                'success': True,
                'status': 'updated',
                'platform': 'brightermonday'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'brightermonday'
            }
    
    def close_job(self, external_id: str) -> Dict[str, Any]:
        """Close BrighterMonday job posting"""
        if not self.is_authorized():
            return {'success': False, 'error': 'Not authorized'}
        
        headers = {
            'X-API-Key': self.api_key,
            'Content-Type': 'application/json'
        }
        
        try:
            response = self._make_request(
                'POST',
                f'{self.BASE_URL}/jobs/{external_id}/close',
                headers=headers
            )
            
            return {
                'success': True,
                'status': 'closed',
                'platform': 'brightermonday'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'brightermonday'
            }
    
    def get_analytics(self, external_id: str) -> Dict[str, Any]:
        """Get BrighterMonday job analytics"""
        if not self.is_authorized():
            return {'success': False, 'error': 'Not authorized'}
        
        headers = {
            'X-API-Key': self.api_key
        }
        
        try:
            response = self._make_request(
                'GET',
                f'{self.BASE_URL}/jobs/{external_id}/analytics',
                headers=headers
            )
            
            data = response.json()
            
            return {
                'success': True,
                'views': data.get('total_views', 0),
                'clicks': data.get('total_clicks', 0),
                'applications': data.get('total_applications', 0),
                'platform': 'brightermonday'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'brightermonday'
            }
    
    def _format_brightermonday_job(self, job) -> Dict[str, Any]:
        """Format job data for BrighterMonday API"""
        base_data = self.format_job_data(job)
        
        # Map employment types
        employment_type_map = {
            'full_time': 'Full Time',
            'part_time': 'Part Time',
            'contract': 'Contract',
            'internship': 'Internship',
            'freelance': 'Freelance'
        }
        
        brightermonday_job = {
            'job_title': base_data['title'],
            'job_description': base_data['description'],
            'company_name': base_data['company_name'],
            'location': job.location or 'Kampala',
            'employment_type': employment_type_map.get(base_data['employment_type'], 'Full Time'),
            'remote_work': 'Yes' if base_data['is_remote'] else 'No',
            'requirements': base_data['requirements'],
        }
        
        # Add salary range if provided
        if base_data['salary_min'] and base_data['salary_max']:
            brightermonday_job['salary'] = {
                'minimum': base_data['salary_min'],
                'maximum': base_data['salary_max'],
                'currency': base_data['currency']
            }
        
        # Add department/industry
        if base_data['department']:
            brightermonday_job['department'] = base_data['department']
        
        # Add benefits
        if job.benefits:
            brightermonday_job['benefits'] = job.benefits
        
        return brightermonday_job
