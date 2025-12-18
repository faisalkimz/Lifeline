"""
Indeed Jobs API integration
"""
from typing import Dict, Any
from .base_publisher import BaseJobPublisher


class IndeedPublisher(BaseJobPublisher):
    """
    Indeed Jobs API publisher
    Uses Indeed Publisher API
    """
    
    BASE_URL = "https://apis.indeed.com/ads/v1"
    
    def __init__(self, integration_settings):
        super().__init__(integration_settings)
        self.access_token = self.access_token or self.api_key
    
    def refresh_token(self) -> bool:
        """Refresh Indeed access token"""
        if not self.refresh_token_str or not self.client_id or not self.client_secret:
            return False
            
        try:
            response = self._make_request(
                'POST',
                'https://apis.indeed.com/oauth/v2/tokens',
                data={
                    'grant_type': 'refresh_token',
                    'refresh_token': self.refresh_token_str,
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                }
            )
            data = response.json()
            self.access_token = data['access_token']
            
            # Update DB
            from django.utils import timezone
            import datetime
            self.integration.access_token = self.access_token
            if 'expires_in' in data:
                self.integration.token_expires_at = timezone.now() + datetime.timedelta(seconds=data['expires_in'])
            self.integration.save()
            return True
        except Exception:
            return False

    def publish_job(self, job) -> Dict[str, Any]:
        """
        Post a job to Indeed
        """
        self.ensure_valid_token()
        if not self.access_token:
            return {
                'success': False,
                'error': 'Indeed integration not authorized. Please configure API credentials.'
            }
        
        job_data = self._format_indeed_job(job)
        
        headers = {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = self._make_request(
                'POST',
                f'{self.BASE_URL}/jobs',
                headers=headers,
                json=job_data
            )
            
            result = response.json()
            external_id = result.get('jobId', '')
            
            return {
                'success': True,
                'external_id': external_id,
                'url': result.get('jobUrl', f'https://www.indeed.com/viewjob?jk={external_id}'),
                'status': 'published',
                'platform': 'indeed'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'indeed'
            }
    
    def update_job(self, job, external_id: str) -> Dict[str, Any]:
        """Update Indeed  job posting"""
        self.ensure_valid_token()
        if not self.access_token:
            return {'success': False, 'error': 'Not authorized'}
        
        job_data = self._format_indeed_job(job)
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = self._make_request(
                'PUT',
                f'{self.BASE_URL}/jobs/{external_id}',
                headers=headers,
                json=job_data
            )
            
            return {
                'success': True,
                'status': 'updated',
                'platform': 'indeed'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'indeed'
            }
    
    def close_job(self, external_id: str) -> Dict[str, Any]:
        """Close Indeed job posting"""
        self.ensure_valid_token()
        if not self.access_token:
            return {'success': False, 'error': 'Not authorized'}
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = self._make_request(
                'DELETE',
                f'{self.BASE_URL}/jobs/{external_id}',
                headers=headers
            )
            
            return {
                'success': True,
                'status': 'closed',
                'platform': 'indeed'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'indeed'
            }
    
    def get_analytics(self, external_id: str) -> Dict[str, Any]:
        """Get Indeed job analytics"""
        self.ensure_valid_token()
        if not self.access_token:
            return {'success': False, 'error': 'Not authorized'}
        
        headers = {
            'Authorization': f'Bearer {self.access_token}'
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
                'views': data.get('views', 0),
                'clicks': data.get('clicks', 0),
                'applications': data.get('applies', 0),
                'platform': 'indeed'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'indeed'
            }
    
    def _format_indeed_job(self, job) -> Dict[str, Any]:
        """Format job data for Indeed API"""
        base_data = self.format_job_data(job)
        
        # Map employment types to Indeed format
        employment_type_map = {
            'full_time': 'FULLTIME',
            'part_time': 'PARTTIME',
            'contract': 'CONTRACT',
            'internship': 'INTERN',
            'freelance': 'TEMPORARY'
        }
        
        indeed_job = {
            'title': base_data['title'],
            'description': base_data['description'],
            'company': base_data['company_name'],
            'location': {
                'city': job.location or 'Kampala',
                'country': 'UG'  # Uganda
            },
            'jobType': employment_type_map.get(base_data['employment_type'], 'FULLTIME'),
            'remote': base_data['is_remote'],
        }
        
        # Add salary if provided
        if base_data['salary_min'] and base_data['salary_max']:
            indeed_job['compensation'] = {
                'baseSalary': {
                    'min': base_data['salary_min'],
                    'max': base_data['salary_max'],
                    'currency': base_data['currency']
                }
            }
        
        # Add requirements qualification
        if base_data['requirements']:
            indeed_job['qualifications'] = base_data['requirements']
        
        return indeed_job
