from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import Study, ParticipantSession, Invitation

class Command(BaseCommand):
    help = 'Preview retention deletion; pass --apply to delete expired demo responses and invitations.'

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true')

    def handle(self, *args, **options):
        total = 0
        for study in Study.objects.all():
            qs = ParticipantSession.objects.filter(protocol__study=study, received_at__lt=timezone.now() - timedelta(days=study.retention_days))
            count = qs.count()
            total += count
            if options['apply']:
                qs.delete()
        expired = Invitation.objects.filter(expires_at__lt=timezone.now())
        invites = expired.count()
        if options['apply']:
            expired.delete()
        self.stdout.write(f"{('Deleted' if options['apply'] else 'Would delete')} {total} sessions and {invites} expired invitations. Backups and external exports require separate retention.")
