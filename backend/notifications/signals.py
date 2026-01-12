from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from leave.models import LeaveRequest
from accounts.models import User
from .models import Notification

@receiver(post_save, sender=LeaveRequest)
def notify_on_leave_request_change(sender, instance, created, **kwargs):
    if created:
        # Notify Admins and HR Managers about new request
        title = f"New Leave Request: {instance.employee.full_name}"
        message = f"{instance.employee.full_name} has requested {instance.leave_type.name} from {instance.start_date} to {instance.end_date}."
        
        admins = User.objects.filter(
            company=instance.employee.company,
            role__in=['company_admin', 'hr_manager', 'super_admin']
        )
        
        for admin in admins:
            # Avoid notifying sender (if they are admin) - optional, but good UX
            if hasattr(instance.employee, 'user') and admin.id == instance.employee.user.id:
                continue

            Notification.objects.create(
                recipient=admin,
                actor=instance.employee.user if hasattr(instance.employee, 'user') else None,
                verb='requested leave',
                description=message,
                content_type=ContentType.objects.get_for_model(instance),
                object_id=instance.id,
                notification_type='info'
            )

    else:
        # Notify Employee about status change
        if instance.status in ['approved', 'rejected']:
            if hasattr(instance.employee, 'user') and instance.employee.user:
                verb = f"leave request {instance.status}"
                message = f"Your leave request has been {instance.status}."
                notif_type = 'success' if instance.status == 'approved' else 'error'
                
                Notification.objects.create(
                    recipient=instance.employee.user,
                    # We don't have the "actor" (admin) easily here without request context, 
                    # so we leave actor null or set to a system bot if available.
                    actor=None, 
                    verb=verb,
                    description=message,
                    content_type=ContentType.objects.get_for_model(instance),
                    object_id=instance.id,
                    notification_type=notif_type
                )
