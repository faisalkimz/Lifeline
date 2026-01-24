from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import User

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in using either
    their username or their email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        try:
            # Try to fetch the user by username or email
            user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
            
            # Check password and if user is active
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except User.DoesNotExist:
            # Run the default password hasher to prevent timing attacks
            User().set_password(password)
        except User.MultipleObjectsReturned:
            # Handle cases where multiple users might have the same email (if not restricted properly)
            # Fetch by username first, then fallback to first found (or return None for safety)
            user = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username)).first()
            if user and user.check_password(password) and self.user_can_authenticate(user):
                return user
            
        return None
