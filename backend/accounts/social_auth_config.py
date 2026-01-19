"""
Social Authentication Configuration for SSO.
Supports Google, Microsoft, and LinkedIn OAuth.
"""
from django.conf import settings

# Social Auth Configuration
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = settings.env('GOOGLE_OAUTH_CLIENT_ID', default='')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = settings.env('GOOGLE_OAUTH_CLIENT_SECRET', default='')
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
]

SOCIAL_AUTH_MICROSOFT_GRAPH_KEY = settings.env('MICROSOFT_OAUTH_CLIENT_ID', default='')
SOCIAL_AUTH_MICROSOFT_GRAPH_SECRET = settings.env('MICROSOFT_OAUTH_CLIENT_SECRET', default='')
SOCIAL_AUTH_MICROSOFT_GRAPH_SCOPE = ['User.Read']

SOCIAL_AUTH_LINKEDIN_OAUTH2_KEY = settings.env('LINKEDIN_OAUTH_CLIENT_ID', default='')
SOCIAL_AUTH_LINKEDIN_OAUTH2_SECRET = settings.env('LINKEDIN_OAUTH_CLIENT_SECRET', default='')
SOCIAL_AUTH_LINKEDIN_OAUTH2_SCOPE = ['r_emailaddress', 'r_liteprofile']

# Pipeline for user creation
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)

SOCIAL_AUTH_REDIRECT_IS_HTTPS = not settings.DEBUG
