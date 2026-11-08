import io
import json
import tempfile
import uuid
from pathlib import Path
from django.test import TestCase
from django.core.management import call_command
from django.core.management.base import CommandError
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Protocol, ParticipantSession, QuestionTranslation, OptionTranslation
from .services import save_response, clone_protocol, protocol_dict

class LanguageTests(TestCase):
    def setUp(self):
        call_command('seed_demo', stdout=io.StringIO())
        self.p = Protocol.objects.get(version=2)

    def payload(self):
        now = timezone.now().isoformat()
        return {'id':str(uuid.uuid4()),'protocol':str(self.p.pk),'demo':True,'withdrawalKey':'a'*72,'createdAt':now,
            'language':'ca','consentLanguage':'es','stimulus':'synthetic-loop-v1','mapping':['high','low','medium'],
            'listened':dict.fromkeys('ABC',3.2),'profile':{'consent':True,'headphonesConfirmed':True,'consentAt':now,'headphones':'over-ear','background':'none'},
            'answers':{key:{'kind':'rank','order':['A','C','B'],'language':'es' if key=='loudness' else 'ca'} for key in ['loudness','clarity','harshness','emotion']},'timings':{},'events':[]}

    def test_language_is_persisted_independently_from_response_keys(self):
        session, _ = save_response(self.payload())
        self.assertEqual((session.language, session.consent_language), ('ca','es'))
        self.assertEqual(session.responses.get(question__key='loudness').language,'es')
        self.assertEqual(session.responses.get(question__key='emotion').language,'ca')
        self.assertEqual(session.assignments.get(label='A').source,'high')

    def test_unknown_language_rejected_atomically(self):
        for field in ['language','consentLanguage','answer']:
            data=self.payload()
            if field=='answer':data['answers']['loudness']['language']='xx'
            else:data[field]='xx'
            with self.assertRaises(ValidationError):save_response(data)
        self.assertEqual(ParticipantSession.objects.count(),0)

    def test_clone_copies_translations_and_keeps_published_source_immutable(self):
        source=protocol_dict(self.p)
        row=QuestionTranslation.objects.first()
        with self.assertRaises(ValidationError):row.save()
        with self.assertRaises(ValidationError):OptionTranslation.objects.first().delete()
        draft=clone_protocol(self.p)
        self.assertFalse(draft.published)
        self.assertEqual(protocol_dict(draft)['questions'],source['questions'])
        translated=draft.questions.get(key='loudness').translations.get(language='es')
        translated.title='Título revisado';translated.save()
        self.assertEqual(protocol_dict(self.p),source)

    def test_minimum_listening_is_enforced_by_server(self):
        draft=clone_protocol(self.p);draft.min_seconds_per_version=3;draft.published=True;draft.save()
        data=self.payload();data['protocol']=str(draft.pk);data['listened']['A']=2.9
        with self.assertRaises(ValidationError):save_response(data)
        data['listened']['A']=3
        self.assertTrue(save_response(data)[1])

    def test_import_translations_idempotent_and_changed_or_incomplete_rejected(self):
        data=json.loads((Path(__file__).resolve().parents[1]/'public/questions.json').read_text())
        manifest={'schema_version':1,'organization':{'id':str(uuid.uuid4()),'name':'Languages fixture'},'study':{'id':str(uuid.uuid4()),'title':'Languages fixture','retention_days':90},'protocol':{'id':str(uuid.uuid4()),'version':1,'demo':True,'consent_version':'demo-1','min_seconds_per_version':3},'questions':data['questions']}
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manifest.json'
            def run():
                path.write_text(json.dumps(manifest));call_command('import_study',str(path),stdout=io.StringIO())
            run();run()
            imported=Protocol.objects.get(pk=manifest['protocol']['id'])
            self.assertEqual(imported.min_seconds_per_version,3)
            self.assertEqual(imported.questions.get(key='reason').options.get(key='warm').translations.count(),2)
            manifest['questions'][0]['translations']['es']['title']='Changed'
            with self.assertRaises(CommandError):run()
            manifest['protocol']['id']=str(uuid.uuid4());manifest['protocol']['version']=2
            manifest['questions'][4]['translations']['es']['options'].pop('warm')
            with self.assertRaises(CommandError):run()
            self.assertEqual(imported.study.protocols.count(),1)
