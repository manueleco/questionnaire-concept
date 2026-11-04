import copy
import io
import json
import tempfile
from pathlib import Path
from uuid import uuid4
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from core.models import Organization, Protocol

class StudyImportTests(TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path = Path(self.folder.name) / 'study.json'
        self.manifest = {
            'schema_version': 1,
            'organization': {'id': str(uuid4()), 'name': 'Fixture organization'},
            'study': {'id': str(uuid4()), 'title': 'Fixture study', 'retention_days': 90},
            'protocol': {'id': str(uuid4()), 'version': 1, 'demo': True, 'consent_version': 'demo-consent-1'},
            'questions': [{'id': 'loudness', 'type': 'rank', 'title': 'Which is loudest?', 'required': True, 'audio': True}]
        }

    def run_import(self):
        self.path.write_text(json.dumps(self.manifest))
        call_command('import_study', str(self.path), stdout=io.StringIO())

    def test_repeated_import_is_idempotent_and_changed_protocol_is_rejected(self):
        self.run_import()
        self.run_import()
        self.assertEqual(Protocol.objects.count(), 1)
        self.assertTrue(Protocol.objects.get().published)
        self.manifest['questions'][0]['title'] = 'Changed after publication'
        with self.assertRaises(CommandError):
            self.run_import()
        self.assertEqual(Protocol.objects.get().questions.get().title, 'Which is loudest?')

    def test_invalid_question_and_research_mode_cannot_create_rows(self):
        original = copy.deepcopy(self.manifest)
        for change in ('duplicate', 'options', 'research', 'string_boolean'):
            self.manifest = copy.deepcopy(original)
            if change == 'duplicate':
                self.manifest['questions'] *= 2
            elif change == 'options':
                self.manifest['questions'][0]['options'] = [{'id': 'a', 'label': 'Invalid for a rank'}]
            elif change == 'research':
                self.manifest['protocol']['demo'] = False
            else:
                self.manifest['questions'][0]['audio'] = 'false'
            with self.assertRaises(CommandError):
                self.run_import()
            self.assertEqual(Organization.objects.count(), 0)

    def test_missing_owner_rolls_back_entire_import(self):
        self.path.write_text(json.dumps(self.manifest))
        with self.assertRaises(CommandError):
            call_command('import_study', str(self.path), owner='does-not-exist', stdout=io.StringIO())
        self.assertEqual(Organization.objects.count(), 0)

    def test_existing_organization_cannot_be_silently_renamed(self):
        self.run_import()
        self.manifest['organization']['name'] = 'Another organization'
        with self.assertRaises(CommandError):
            self.run_import()
        self.assertEqual(Organization.objects.get().name, 'Fixture organization')
