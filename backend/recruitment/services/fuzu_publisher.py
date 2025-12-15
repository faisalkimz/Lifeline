"""
Fuzu (African job board) integration
"""
from typing import Dict, Any
from .base_publisher import BaseJobPublisher


class FuzuPublisher(BaseJobPublisher):
    """
    Fuzu Jobs API publisher
    Fuzu is a leading job board in East Africa
    """
    
    BASE_URL = "https://api.fuzu.com/v1"
    
    def __init__(self, integration_settings):
        super().__init__(integration_settings)
        self.api_key = integration_settings.api_key
    
    def publish_job(self, job) -> Dict[str, Any]:
        """Post a job to Fuzu"""
        if not self.is_authorized():
            return {
                'success': False,
                'error': 'Fuzu integration not authorized. Please configure API credentials.'
            }
        
        job_data = self._format_fuzu_job(job)
        
        headers = {
            'Authorization': f'Token {self.api_key}',
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
            external_id = result.get('id', '')
            
            return {
                'success': True,
                'external_id': str(external_id),
                'url': result.get('url', f'https://www.fuzu.com/job/{external_id}'),
                'status': 'published',
                'platform': 'fuzu'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'fuzu'
            }
    
    def update_job(self, job, external_id: str) -> Dict[str, Any]:
        """Update Fuzu job posting"""
        if not self.is_authorized():
            return {'success': False, 'error': 'Not authorized'}
        
        job_data = self._format_fuzu_job(job)
        
        headers = {
            'Authorization': f'Token {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = self._make_request(
                'PATCH',
                f'{self.BASE_URL}/jobs/{external_id}',
                headers=headers,
                json=job_data
            )
            
            return {
                'success': True,
                'status': 'updated',
                'platform': 'fuzu'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'fuzu'
            }
    
    def close_job(self, external_id: str) -> Dict[str, Any]:
        """Close Fuzu job posting"""
        if not self.is_authorized():
            return {'success': False, 'error': 'Not authorized'}
        
        headers = {
            'Authorization': f'Token {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = self._make_request(
                'PATCH',
                f'{self.BASE_URL}/jobs/{external_id}',
                headers=headers,
                json={'status': 'closed'}
            )
            
            return {
                'success': True,
                'status': 'closed',
                'platform': 'fuzu'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'fuzu'
            }
    
    def get_analytics(self, external_id: str) -> Dict[str, Any]:
        """Get Fuzu job analytics"""
        if not self.is_authorized():
            return {'success': False, 'error': 'Not authorized'}
        
        headers = {
            'Authorization': f'Token {self.api_key}'
        }
        
        try:
            response = self._make_request(
                'GET',
                f'{self.BASE_URL}/jobs/{external_id}/stats',
                headers=headers
            )
            
            data = response.json()
            
            return {
                'success': True,
                'views': data.get('views', 0),
                'clicks': data.get('clicks', 0),
                'applications': data.get('applications', 0),
                'platform': 'fuzu'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'fuzu'
            }
    
    def _format_fuzu_job(self, job) -> Dict[str, Any]:
        """Format job data for Fuzu API"""
        base_data = self.format_job_data(job)
        
        # Map employment types
        employment_type_map = {
            'full_time': 'full-time',
            'part_time': 'part-time',
            'contract': 'contract',
            'internship': 'internship',
            'freelance': 'freelance'
        }
        
        fuzu_job = {
            'title': base_data['title'],
            'description': base_data['description'],
            'company_name': base_data['company_name'],
            'location': job.location or 'Kampala, Uganda',
            'country': 'Uganda',
            'job_type': employment_type_map.get(base_data['employment_type'], 'full-time'),
            'is_remote': base_data['is_remote'],
            'requirements': base_data['requirements'],
        }
        
        # Add salary range if provided
        if base_data['salary_min'] and base_data['salary_max']:
            fuzu_job['salary_range'] = {
                'min': base_data['salary_min'],
                'max': base_data['salary_max'],
                'currency': base_data['currency']
            }
        
        # Add benefits if provided
        if job.benefits:
            fuzu_job['benefits'] = job.benefits
        
        return fuzu_job
