# Quick script to set admin password
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

admin = User.objects.get(username='admin')
admin.set_password('admin123')  # Change in production!
admin.save()

print("Admin password set to: admin123")
print("Login at: http://localhost:8000/admin")
print("Username: admin")
print("Password: admin123")
