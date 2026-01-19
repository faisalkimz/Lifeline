import boto3
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class S3StorageService:
    """Handles interactions with AWS S3"""
    
    @staticmethod
    def get_client(integration=None):
        """Returns an S3 client using integration credentials or global settings"""
        if integration and integration.is_active:
            return boto3.client(
                's3',
                aws_access_key_id=integration.client_id,
                aws_secret_access_key=integration.client_secret,
                region_name=integration.region or 'us-east-1'
            )
        
        # Fallback to system-wide AWS settings
        return boto3.client(
            's3',
            aws_access_key_id=getattr(settings, 'AWS_ACCESS_KEY_ID', None),
            aws_secret_access_key=getattr(settings, 'AWS_SECRET_ACCESS_KEY', None),
            region_name=getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1')
        )

    @staticmethod
    def upload_file(file_obj, bucket, object_name, integration=None):
        """Uploads a file to an S3 bucket"""
        client = S3StorageService.get_client(integration)
        try:
            client.upload_fileobj(file_obj, bucket, object_name)
            return f"https://{bucket}.s3.amazonaws.com/{object_name}"
        except Exception as e:
            logger.error(f"S3 Upload Error: {str(e)}")
            return None
