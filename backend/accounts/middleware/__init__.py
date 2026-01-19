"""
Middleware package for accounts app.
"""
from .rate_limit import RateLimitMiddleware

__all__ = ['RateLimitMiddleware']
