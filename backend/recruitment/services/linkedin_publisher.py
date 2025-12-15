"""
LinkedIn Jobs API integration
"""
from typing import Dict, Any
from .base_publisher import BaseJobPublisher


class LinkedInPublisher(BaseJobPublisher):
    """
    LinkedIn Jobs API publisher
    Uses LinkedIn Talent Solutions API
    """
    
    BASE_URL = "https://api.linkedin.com/v2"
    
    def __init__(self, integration_settings):
        super().__init__(integration_settings)
        self.access_token = self.api_key  # API key is the access token
    
    def publish_job(self, job) -> Dict[str, Any]:
        """
        Post a job to LinkedIn
        
        LinkedIn API Reference:
        https://docs.microsoft.com/en-us/linkedin/talent/job-postings
        """
        if not self.is_authorized():
            return {
                'success': False,
                'error': 'LinkedIn integration not authorized. Please configure API credentials.'
            }
        
        job_data = self._format_linkedin_job(job)
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        try:
            response = self._make_request(
                'POST',
                f'{self.BASE_URL}/jobPostings',
                headers=headers,
                json=job_data
            )
            
            result = response.json()
            external_id = result.get('id', '')
            
            return {
                'success': True,
                'external_id': external_id,
                'url': f'https://www.linkedin.com/jobs/view/{external_id}',
                'status': 'published',
                'platform': 'linkedin'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'linkedin'
            }
    
    def update_job(self, job, external_id: str) -> Dict[str, Any]:
        """Update LinkedIn job posting"""
        if not self.is_authorized():
            return {'success': False, 'error': 'Not authorized'}
        
        job_data = self._format_linkedin_job(job)
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        try:
            response = self._make_request(
                'PUT',
                f'{self.BASE_URL}/jobPostings/{external_id}',
                headers=headers,
                json=job_data
            )
            
            return {
                'success': True,
                'status': 'updated',
                'platform': 'linkedin'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'linkedin'
            }
    
    def close_job(self, external_id: str) -> Dict[str, Any]:
        """Close LinkedIn job posting"""
        if not self.is_authorized():
            return {'success': False, 'error': 'Not authorized'}
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        try:
            response = self._make_request(
                'POST',
                f'{self.BASE_URL}/jobPostings/{external_id}',
                headers=headers,
                json={'status': 'CLOSED'}
            )
            
            return {
                'success': True,
                'status': 'closed',
                'platform': 'linkedin'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'linkedin'
            }
    
    def get_analytics(self, external_id: str) -> Dict[str, Any]:
        """Get LinkedIn job analytics"""
        if not self.is_authorized():
            return {'success': False, 'error': 'Not authorized'}
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        try:
            response = self._make_request(
                'GET',
                f'{self.BASE_URL}/jobPostings/{external_id}/analytics',
                headers=headers
            )
            
            data = response.json()
            
            return {
                'success': True,
                'views': data.get('impressions', 0),
                'clicks': data.get('clicks', 0),
                'applications': data.get('applications', 0),
                'platform': 'linkedin'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'platform': 'linkedin'
            }
    
    def _format_linkedin_job(self, job) -> Dict[str, Any]:
        """Format job data for LinkedIn API"""
        base_data = self.format_job_data(job)
        
        # Map employment types to LinkedIn format
        employment_type_map = {
            'full_time': 'FULL_TIME',
            'part_time': 'PART_TIME',
            'contract': 'CONTRACT',
            'internship': 'INTERNSHIP',
            'freelance': 'TEMPORARY'
        }
        
        # Map location to LinkedIn format
        location = {
            'countryCode': 'UG',  # Uganda
            'city': job.location or 'Kampala',
        }
        
        linkedin_job = {
            'title': base_data['title'],
            'description': {
                'text': base_data['description']
            },
            'companyName': base_data['company_name'],
            'location': location,
            'employmentType': employment_type_map.get(base_data['employment_type'], 'FULL_TIME'),
            'listedAt': int(job.created_at.timestamp() * 1000),
            'expiresAt': int(job.expires_at.timestamp() * 1000) if job.expires_at else None,
        }
        
        # Add salary if provided
        if base_data['salary_min'] and base_data['salary_max']:
            linkedin_job['salary'] = {
                'min': base_data['salary_min'],
                'max': base_data['salary_max'],
                'currency': base_data['currency']
            }
        
        # Add remote work flag
        if  base_data['is_remote']:
            linkedin_job['workplaceType'] = 'REMOTE'
        
        return linkedin_job
