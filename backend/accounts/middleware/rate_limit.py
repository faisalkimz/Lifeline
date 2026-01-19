"""
Django Rate Limiting Middleware for Security.
Prevents brute force attacks on login endpoints.
"""
from django.core.cache import cache
from django.http import JsonResponse
import time

class RateLimitMiddleware:
    """
    Rate limiting middleware to prevent brute force attacks.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Only rate limit auth endpoints
        if request.path in ['/api/auth/login/', '/api/auth/register/']:
            ip = self.get_client_ip(request)
            cache_key = f'rate_limit_{ip}_{request.path}'
            
            # Get current attempt count
            attempts = cache.get(cache_key, 0)
            
            # Check if rate limit exceeded (10 requests per minute)
            if attempts >= 10:
                return JsonResponse({
                    'error': 'Too many requests. Please try again in 1 minute.'
                }, status=429)
            
            # Increment counter
            cache.set(cache_key, attempts + 1, 60)  # 60 seconds TTL
        
        response = self.get_response(request)
        return response
    
    def get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
