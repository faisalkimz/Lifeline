"""
Custom middleware to convert Django HTML error responses to JSON for API routes.
"""
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class JSONErrorMiddleware(MiddlewareMixin):
    """
    Middleware that converts HTML error responses to JSON for API routes.
    This ensures API consumers always receive JSON, even when Django returns HTML errors.
    """
    def process_response(self, request, response):
        # Only process API routes
        if not request.path.startswith('/api/'):
            return response
        
        # If response is HTML and has an error status, convert to JSON
        if response.status_code >= 400:
            content_type = response.get('Content-Type', '')
            is_html = False
            
            # Check if content type is HTML
            if 'text/html' in content_type:
                is_html = True
            # Check if content starts with HTML doctype
            elif hasattr(response, 'content') and isinstance(response.content, bytes):
                if response.content.strip().startswith(b'<!doctype html>') or \
                   response.content.strip().startswith(b'<html'):
                    is_html = True
            
            if is_html:
                # Map status codes to error messages
                error_messages = {
                    400: 'Bad Request - Invalid data provided',
                    403: 'Forbidden - CSRF verification failed or insufficient permissions',
                    404: 'Not Found - The requested resource does not exist',
                    500: 'Internal Server Error - An unexpected error occurred',
                }
                
                error_detail = error_messages.get(response.status_code, f'Error {response.status_code}')
                
                return JsonResponse(
                    {
                        'detail': error_detail,
                        'error': 'api_error',
                        'status_code': response.status_code
                    },
                    status=response.status_code
                )
        
        return response


class CSRFExemptAPIViewMiddleware(MiddlewareMixin):
    """
    Middleware to exempt API views from CSRF protection.
    DRF handles authentication via JWT, so CSRF is not needed for API routes.
    This must be placed BEFORE CsrfViewMiddleware in the middleware stack.
    """
    def process_request(self, request):
        # Exempt all API routes from CSRF
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None
