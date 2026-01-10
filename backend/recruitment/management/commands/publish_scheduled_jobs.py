from django.core.management.base import BaseCommand
from django.utils import timezone
from recruitment.models import Job


class Command(BaseCommand):
    help = 'Publish jobs that are scheduled to be published'

    def handle(self, *args, **options):
        now = timezone.now()
        
        # Find jobs that are scheduled to be published and the time has come
        jobs_to_publish = Job.objects.filter(
            status='draft',
            scheduled_publish_date__isnull=False,
            scheduled_publish_date__lte=now
        )
        
        count = 0
        for job in jobs_to_publish:
            job.status = 'published'
            job.published_at = now
            job.save()
            count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Published job: {job.title} (ID: {job.id})')
            )
        
        if count == 0:
            self.stdout.write(self.style.WARNING('No jobs to publish'))
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully published {count} job(s)')
            )
