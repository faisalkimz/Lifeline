"""
Base publisher class for job posting integrations
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import requests
from django.conf import settings


class BaseJobPublisher(ABC):
    """
    Abstract base class for job posting to external platforms
    """
    
    def __init__(self, integration_settings):
        """
        Initialize publisher with integration credentials
        
        Args:
            integration_settings: IntegrationSettings model instance
        """
        self.integration = integration_settings
        self.platform = integration_settings.platform
        self.api_key = integration_settings.api_key
        self.client_id = integration_settings.client_id
        self.client_secret = integration_settings.client_secret
        self.is_active = integration_settings.is_active
    
    @abstractmethod
    def publish_job(self, job) -> Dict[str, Any]:
        """
        Publish a job to the external platform
        
        Args:
            job: Job model instance
            
        Returns:
            dict: Response with external_id, url, status
        """
        pass
    
    @abstractmethod
    def update_job(self, job, external_id: str) -> Dict[str, Any]:
        """
        Update an existing job posting
        
        Args:
            job: Job model instance
            external_id: External platform's job ID
            
        Returns:
            dict: Response with status
        """
        pass
    
    @abstractmethod
    def close_job(self, external_id: str) -> Dict[str, Any]:
        """
        Close/deactivate a job posting
        
        Args:
            external_id: External platform's job ID
            
        Returns:
            dict: Response with status
        """
        pass
    
    @abstractmethod
    def get_analytics(self, external_id: str) -> Dict[str, Any]:
        """
        Get analytics for a job posting
        
        Args:
            external_id: External platform's job ID
            
        Returns:
            dict: Analytics data (views, applications, etc.)
        """
        pass
    
    def is_authorized(self) -> bool:
        """Check if the integration is properly authorized"""
        return self.is_active and bool(self.api_key or (self.client_id and self.client_secret))
    
    def format_job_data(self, job) -> Dict[str, Any]:
        """
        Format job data for external platform
        Override this in subclasses for platform-specific formatting
        
        Args:
            job: Job model instance
            
        Returns:
            dict: Formatted job data
        """
        return {
            'title': job.title,
            'description': job.description,
            'requirements': job.requirements,
            'location': job.location,
            'is_remote': job.is_remote,
            'employment_type': job.employment_type,
            'salary_min': float(job.salary_min) if job.salary_min else None,
            'salary_max': float(job.salary_max) if job.salary_max else None,
            'currency': job.currency,
            'company_name': job.company.name,
            'department': job.department.name if job.department else None,
        }
    
    def _make_request(self, method: str, url: str, **kwargs) -> requests.Response:
        """
        Make HTTP request to external API
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            url: API endpoint URL
            **kwargs: Additional request parameters
            
        Returns:
            requests.Response
        """
        try:
            response = requests.request(method, url, timeout=30, **kwargs)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
