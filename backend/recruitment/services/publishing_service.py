"""
Job publishing coordination service
"""
from typing import List, Dict, Any
from django.db import transaction
from ..models import Job, IntegrationSettings, ExternalJobPost
from .linkedin_publisher import LinkedInPublisher
from .indeed_publisher import IndeedPublisher
from .fuzu_publisher import FuzuPublisher
from .brightermonday_publisher import BrighterMondayPublisher


class JobPublishingService:
    """
    Coordinates job publishing across multiple platforms
    """
    
    PUBLISHER_MAP = {
        'linkedin': LinkedInPublisher,
        'indeed': IndeedPublisher,
        'fuzu': FuzuPublisher,
        'brightermonday': BrighterMondayPublisher,
    }
    
    @classmethod
    def publish_to_platforms(cls, job: Job, platforms: List[str]) -> Dict[str, Any]:
        """
        Publish a job to multiple platforms
        
        Args:
            job: Job model instance
            platforms: List of platform names to publish to
            
        Returns:
            dict: Results for each platform
        """
        results = {
            'success': True,
            'platforms': {},
            'errors': []
        }
        
        company = job.company
        
        for platform in platforms:
            try:
                # Get integration settings
                integration = IntegrationSettings.objects.filter(
                    company=company,
                    platform=platform,
                    is_active=True
                ).first()
                
                if not integration:
                    results['platforms'][platform] = {
                        'success': False,
                        'error': f'{platform} integration not configured'
                    }
                    results['errors'].append(f'{platform}: Not configured')
                    continue
                
                # Get publisher class
                publisher_class = cls.PUBLISHER_MAP.get(platform)
                if not publisher_class:
                    results['platforms'][platform] = {
                        'success': False,
                        'error': f'Unknown platform: {platform}'
                    }
                    results['errors'].append(f'{platform}: Unknown platform')
                    continue
                
                # Initialize publisher and publish
                publisher = publisher_class(integration)
                publish_result = publisher.publish_job(job)
                
                # Save external job post if successful
                if publish_result.get('success'):
                    with transaction.atomic():
                        ExternalJobPost.objects.create(
                            job=job,
                            integration=integration,
                            external_id=publish_result.get('external_id'),
                            url=publish_result.get('url'),
                            status='posted'
                        )
                    
                    # Update job status to published if not already
                    if job.status == 'draft':
                        job.status = 'published'
                        job.save()
                
                results['platforms'][platform] = publish_result
                
                if not publish_result.get('success'):
                    results['errors'].append(f"{platform}: {publish_result.get('error', 'Unknown error')}")
                
            except Exception as e:
                results['platforms'][platform] = {
                    'success': False,
                    'error': str(e)
                }
                results['errors'].append(f'{platform}: {str(e)}')
        
        # Overall success if at least one platform succeeded
        results['success'] = any(
            result.get('success') for result in results['platforms'].values()
        )
        
        return results
    
    @classmethod
    def update_on_platforms(cls, job: Job) -> Dict[str, Any]:
        """
        Update job on all platforms where it's posted
        
        Args:
            job: Job model instance
            
        Returns:
            dict: Results for each platform
        """
        results = {
            'success': True,
            'platforms': {},
            'errors': []
        }
        
        # Get all external posts for this job
        external_posts = ExternalJobPost.objects.filter(job=job)
        
        for ext_post in external_posts:
            platform = ext_post.integration.platform
            
            try:
                publisher_class = cls.PUBLISHER_MAP.get(platform)
                if not publisher_class:
                    continue
                
                publisher = publisher_class(ext_post.integration)
                update_result = publisher.update_job(job, ext_post.external_id)
                
                results['platforms'][platform] = update_result
                
                if not update_result.get('success'):
                    results['errors'].append(f"{platform}: {update_result.get('error', 'Unknown error')}")
                
            except Exception as e:
                results['platforms'][platform] = {
                    'success': False,
                    'error': str(e)
                }
                results['errors'].append(f'{platform}: {str(e)}')
        
        results['success'] = any(
            result.get('success') for result in results['platforms'].values()
        )
        
        return results
    
    @classmethod
    def close_on_platforms(cls, job: Job) -> Dict[str, Any]:
        """
        Close job on all platforms where it's posted
        
        Args:
            job: Job model instance
            
        Returns:
            dict: Results for each platform
        """
        results = {
            'success': True,
            'platforms': {},
            'errors': []
        }
        
        # Get all external posts for this job
        external_posts = ExternalJobPost.objects.filter(job=job)
        
        for ext_post in external_posts:
            platform = ext_post.integration.platform
            
            try:
                publisher_class = cls.PUBLISHER_MAP.get(platform)
                if not publisher_class:
                    continue
                
                publisher = publisher_class(ext_post.integration)
                close_result = publisher.close_job(ext_post.external_id)
                
                if close_result.get('success'):
                    ext_post.status = 'closed'
                    ext_post.save()
                
                results['platforms'][platform] = close_result
                
                if not close_result.get('success'):
                    results['errors'].append(f"{platform}: {close_result.get('error', 'Unknown error')}")
                
            except Exception as e:
                results['platforms'][platform] = {
                    'success': False,
                    'error': str(e)
                }
                results['errors'].append(f'{platform}: {str(e)}')
        
        results['success'] = any(
            result.get('success') for result in results['platforms'].values()
        )
        
        return results
    
    @classmethod
    def get_analytics(cls, job: Job) -> Dict[str, Any]:
        """
        Get analytics from all platforms where job is posted
        
        Args:
            job: Job model instance
            
        Returns:
            dict: Analytics for each platform
        """
        analytics = {
            'platforms': {},
            'totals': {
                'views': 0,
                'clicks': 0,
                'applications': 0
            }
        }
        
        # Get all external posts for this job
        external_posts = ExternalJobPost.objects.filter(job=job)
        
        for ext_post in external_posts:
            platform = ext_post.integration.platform
            
            try:
                publisher_class = cls.PUBLISHER_MAP.get(platform)
                if not publisher_class:
                    continue
                
                publisher = publisher_class(ext_post.integration)
                platform_analytics = publisher.get_analytics(ext_post.external_id)
                
                if platform_analytics.get('success'):
                    analytics['platforms'][platform] = platform_analytics
                    
                    # Add to totals
                    analytics['totals']['views'] += platform_analytics.get('views', 0)
                    analytics['totals']['clicks'] += platform_analytics.get('clicks', 0)
                    analytics['totals']['applications'] += platform_analytics.get('applications', 0)
                
            except Exception as e:
                analytics['platforms'][platform] = {
                    'success': False,
                    'error': str(e)
                }
        
        return analytics
