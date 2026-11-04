"""Import a versioned demo study supplied by a separate study repository."""
import json
import re
from pathlib import Path
from uuid import UUID
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction, IntegrityError
from core.forms import QuestionForm
from core.models import Organization, Study, Protocol, Question, QuestionOption, Role, Membership

FIELDS = ('key', 'type', 'title', 'description', 'direction', 'required', 'audio')


def read_manifest(path):
    raw = Path(path).read_bytes()
    if len(raw) > 256 * 1024:
        raise ValueError('Manifest exceeds 256 KiB.')
    data = json.loads(raw)
    if type(data['schema_version']) is not int or data['schema_version'] != 1 or data['protocol']['demo'] is not True:
        raise ValueError('Only schema 1 demo protocols are supported; research collection remains gated.')
    for name in ('organization', 'study', 'protocol'):
        data[name]['id'] = UUID(data[name]['id'])
    if type(data['study']['retention_days']) is not int or not 1 <= data['study']['retention_days'] <= 3650:
        raise ValueError('Use a retention period between 1 and 3650 days.')
    if type(data['protocol']['version']) is not int or data['protocol']['version'] < 1:
        raise ValueError('Protocol version must be a positive integer.')
    if not isinstance(data['questions'], list) or not 1 <= len(data['questions']) <= 100:
        raise ValueError('Use 1 to 100 questions.')
    questions = []
    for question in data['questions']:
        if any(type(question.get(k)) is not bool for k in ('required', 'audio')):
            raise ValueError('required and audio must be booleans.')
        options = question.get('options', [])
        if not isinstance(options, list) or any(not isinstance(o.get(k), str) or '\n' in o[k] or '\r' in o[k] for o in options for k in ('id', 'label')):
            raise ValueError('Option IDs and labels must be single-line strings.')
        if any(not re.fullmatch(r'[-a-zA-Z0-9_]+', o['id']) for o in options):
            raise ValueError('Option IDs must be slugs.')
        form = QuestionForm({**question, 'key': question['id'], 'options_text': '\n'.join(o['id'] + '|' + o['label'] for o in options)})
        if not form.is_valid():
            raise ValueError('Invalid question: ' + form.errors.as_text())
        item = {k: form.cleaned_data[k] for k in FIELDS}
        item['options'] = sorted([list(o) for o in form.cleaned_data['parsed_options']])
        questions.append(item)
    if len({q['key'] for q in questions}) != len(questions):
        raise ValueError('Question IDs must be unique.')
    return data, questions


class Command(BaseCommand):
    help = 'Import an immutable, published demo protocol from a versioned study manifest. Never enables real research collection.'

    def add_arguments(self, parser):
        parser.add_argument('manifest')
        parser.add_argument('--owner', help='Existing local username to grant ownership of this organization.')

    def handle(self, *args, **options):
        try:
            data, questions = read_manifest(options['manifest'])
            with transaction.atomic():
                self.import_manifest(data, questions, options.get('owner'))
        except (OSError, ValueError, TypeError, KeyError, AttributeError, ValidationError, IntegrityError, get_user_model().DoesNotExist) as error:
            raise CommandError('Study import rejected: ' + str(error)) from error

    def import_manifest(self, data, questions, owner):
        org, _ = Organization.objects.get_or_create(id=data['organization']['id'], defaults={'name': data['organization']['name']})
        org.full_clean()
        if org.name != data['organization']['name']:
            raise ValueError('Organization ID already has different metadata.')
        study_values = {'organization': org, 'title': data['study']['title'], 'retention_days': data['study']['retention_days']}
        study, _ = Study.objects.get_or_create(id=data['study']['id'], defaults=study_values)
        study.full_clean()
        if any(getattr(study, k) != v for k, v in study_values.items()):
            raise ValueError('Study ID already has different metadata.')
        protocol_values = {'study': study, 'version': data['protocol']['version'], 'demo': True, 'consent_version': data['protocol']['consent_version']}
        protocol, created = Protocol.objects.get_or_create(id=data['protocol']['id'], defaults=protocol_values)
        protocol.full_clean()
        if any(getattr(protocol, k) != v for k, v in protocol_values.items()):
            raise ValueError('Protocol ID already has different metadata.')
        if not created:
            stored = [{**{k: getattr(q, k) for k in FIELDS}, 'options': sorted([list(o) for o in q.options.values_list('key', 'label')])} for q in protocol.questions.all()]
            if stored != questions or not protocol.published:
                raise ValueError('Protocol already exists with different content. Create a new protocol ID and version.')
        else:
            for index, item in enumerate(questions, 1):
                question = Question(protocol=protocol, position=index, **{k: item[k] for k in FIELDS})
                question.full_clean()
                question.save()
                for key, label in item['options']:
                    option = QuestionOption(question=question, key=key, label=label)
                    option.full_clean()
                    option.save()
            protocol.published = True
            protocol.save()
        for code, label in [('owner', 'Owner'), ('admin', 'Administrator'), ('researcher', 'Researcher'), ('analyst', 'Analyst'), ('viewer', 'Viewer')]:
            Role.objects.get_or_create(code=code, defaults={'label': label})
        if owner:
            user = get_user_model().objects.get(username=owner)
            member, _ = Membership.objects.get_or_create(organization=org, user=user, defaults={'role_id': 'owner'})
            if member.role_id != 'owner':
                raise ValueError('Existing member has a different role; update permissions explicitly in the portal.')
        self.stdout.write(f'Demo study ready: /?protocol={protocol.pk}')
