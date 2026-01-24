from django.db.models.signals import post_save
from django.dispatch import receiver
from accounts.models import Company
from .models import AttendancePolicy

@receiver(post_save, sender=Company)
def create_attendance_policy(sender, instance, created, **kwargs):
    if created:
        AttendancePolicy.objects.create(company=instance)
