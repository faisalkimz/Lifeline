"""
Custom exception handler for Django REST Framework.
Ensures all API errors return JSON instead of HTML.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.http import Http404
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that ensures JSON responses.
    Handles Django exceptions that DRF doesn't catch by default.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If response is None, it means DRF couldn't handle it
    # This usually means it's a Django exception (like CSRF, ValidationError, etc.)
    if response is None:
        # Handle specific Django exceptions
        if isinstance(exc, Http404):
            return Response(
                {
                    'detail': 'Not found.',
                    'error': 'not_found',
                },
                status=status.HTTP_404_NOT_FOUND
            )
        elif isinstance(exc, ValidationError):
            return Response(
                {
                    'detail': exc.message if hasattr(exc, 'message') else str(exc),
                    'error': 'validation_error',
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        elif hasattr(exc, 'status_code'):
            # Handle other exceptions with status codes
            return Response(
                {
                    'detail': str(exc),
                    'error': 'api_error',
                },
                status=getattr(exc, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
            )
        else:
            # Log the exception for debugging
            logger.error(f"Unhandled exception: {exc}", exc_info=True)
            
            # Return a JSON error response
            return Response(
                {
                    'detail': str(exc) if exc else 'An error occurred',
                    'error': 'server_error',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Ensure the response is JSON
    if hasattr(response, 'data'):
        # Add error type if not present
        if 'error' not in response.data:
            response.data['error'] = 'validation_error' if response.status_code == 400 else 'api_error'
    
    return response
