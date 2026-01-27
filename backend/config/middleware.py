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
                # Try to extract error message from HTML if possible
                error_detail = None
                if hasattr(response, 'content') and isinstance(response.content, bytes):
                    try:
                        content_str = response.content.decode('utf-8', errors='ignore')
                        # Try to extract text from <h1> or <p> tags
                        import re
                        h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content_str, re.IGNORECASE | re.DOTALL)
                        p_match = re.search(r'<p[^>]*>(.*?)</p>', content_str, re.IGNORECASE | re.DOTALL)
                        if h1_match:
                            error_detail = h1_match.group(1).strip()
                        elif p_match and p_match.group(1).strip():
                            error_detail = p_match.group(1).strip()
                    except Exception:
                        pass
                
                # Fallback to default messages
                if not error_detail:
                    error_messages = {
                        400: 'Bad Request - Please check your input data and try again',
                        401: 'Session Expired - Please log in again to continue',
                        403: 'Forbidden - CSRF verification failed or insufficient permissions',
                        404: 'Not Found - The requested resource does not exist',
                        500: 'Internal Server Error - An unexpected error occurred',
                    }
                    error_detail = error_messages.get(response.status_code, f'Error {response.status_code}')
                
                # If it's a 401, the message should be simpler
                if response.status_code == 401:
                    return JsonResponse(
                        {
                            'detail': 'Your session has expired. Please log in again.',
                            'error': 'unauthorized',
                            'status_code': 401
                        },
                        status=401
                    )

                return JsonResponse(
                    {
                        'detail': error_detail,
                        'error': 'api_error',
                        'status_code': response.status_code,
                        'message': 'The server encountered an error. Please try again or contact support.'
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
