# k>=5 suppresses small groups; this alone is not a guarantee of anonymization.
# Separate pre-created tab per protocol: avoids accidental overwriting of another study.
# Clear stale aggregates first so withdrawals are not retained in the mirror.
"""Optional aggregate-only Sheets mirror. Database remains the source of truth."""
import os
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Count
from core.models import Protocol, Response

class Command(BaseCommand):
    help = 'Preview aggregate export. --apply writes to a dedicated Google Sheet tab using ADC.'

    def add_arguments(self, parser):
        parser.add_argument('protocol_id')
        parser.add_argument('--apply', action='store_true')

    def handle(self, *args, **options):
        try:
            p = Protocol.objects.get(pk=options['protocol_id'])
        except Exception:
            raise CommandError('Protocol not found.')
        rows = [['protocol_id', 'question', 'answer_kind', 'responses']]
        for r in Response.objects.filter(session__protocol=p).values('question__key', 'kind').annotate(total=Count('id')).order_by('question__key', 'kind'):
            if r['total'] >= 5:
                rows.append([str(p.pk), r['question__key'], r['kind'], r['total']])
        if not options['apply']:
            self.stdout.write(f'Would export {len(rows) - 1} aggregate rows (groups smaller than 5 suppressed). No names, session IDs, text or timestamps.')
            return
        sheet = os.environ.get('GOOGLE_SHEETS_ID')
        if not sheet or not sheet.replace('-', '').replace('_', '').isalnum():
            raise CommandError('Set GOOGLE_SHEETS_ID to the approved dedicated spreadsheet.')
        try:
            import google.auth
            from google.auth.transport.requests import AuthorizedSession
        except ImportError:
            raise CommandError('Install integrations/requirements-google.txt to enable Sheets.')
        credentials, _ = google.auth.default(scopes=['https://www.googleapis.com/auth/spreadsheets'])
        client = AuthorizedSession(credentials)
        tab = 'summary_' + str(p.pk).replace('-', '')[:12]
        url = f'https://sheets.googleapis.com/v4/spreadsheets/{sheet}/values/{tab}!A:D'
        clear = client.post(url + ':clear', json={}, timeout=20)
        if not clear.ok:
            raise CommandError('Sheets clear failed. Check spreadsheet sharing and the dedicated tab; no credential details logged.')
        result = client.put(url, params={'valueInputOption': 'RAW'}, json={'values': rows}, timeout=20)
        if not result.ok:
            raise CommandError('Sheets update failed; tab was cleared. Retry from the database.')
        self.stdout.write(f'Updated {tab}: {len(rows) - 1} aggregate rows. No participant-level records exported.')
