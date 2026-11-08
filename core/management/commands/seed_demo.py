import json
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from core.models import *
from core.translations import store_translations, validate_translations

class Command(BaseCommand):
    help = 'Create the demo protocol idempotently. Optionally grant an existing user ownership.'

    def add_arguments(self, parser):
        parser.add_argument('--owner')

    @transaction.atomic
    def handle(self, *args, **options):
        for code, label in [('owner', 'Owner'), ('admin', 'Administrator'), ('researcher', 'Researcher'), ('analyst', 'Analyst'), ('viewer', 'Viewer')]:
            Role.objects.get_or_create(code=code, defaults={'label': label})
        org, _ = Organization.objects.get_or_create(id='f7d66339-9d49-4ff0-90e8-56d40ea07387', defaults={'name': 'Music Perception & Cognition'})
        study, _ = Study.objects.get_or_create(id='21af0846-17a7-4886-a604-697f930486eb', defaults={'organization': org, 'title': 'Saturation, clarity & perceived emotion'})
        p, created = Protocol.objects.get_or_create(id='aa94667c-18a1-49ee-bbce-3540c2cc489b', defaults={'study': study, 'version': 2})
        if created:
            data = json.loads((settings.BASE_DIR / 'public/questions.json').read_text())
            for i, q in enumerate(data['questions']):
                fields = {k: q.get(k, '') for k in ['type', 'title', 'description', 'direction']}
                fields.update({k: q[k] for k in ['required', 'audio']})
                obj = Question.objects.create(protocol=p, key=q['id'], position=i + 1, **fields)
                for o in q.get('options', []):
                    QuestionOption.objects.create(question=obj, key=o['id'], label=o['label'])
                store_translations(obj, validate_translations(q.get('translations', {}), q))
            p.published = True
            p.save()
        if options.get('owner'):
            user = get_user_model().objects.get(username=options['owner'])
            Membership.objects.get_or_create(organization=org, user=user, defaults={'role_id': 'owner'})
        self.stdout.write(f'Demo ready: {p.pk}')
