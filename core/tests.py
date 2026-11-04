import copy, json, uuid
from datetime import timedelta
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import *
from .services import save_response, clone_protocol, digest

class PlatformTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        call_command('seed_demo', verbosity=0)
        cls.protocol = Protocol.objects.first()
        cls.org = cls.protocol.study.organization
        cls.owner = get_user_model().objects.create_user('owner', password='fixture-password-long')
        cls.outsider = get_user_model().objects.create_user('outsider', password='fixture-password-long')
        cls.viewer = get_user_model().objects.create_user('viewer', password='fixture-password-long')
        cls.analyst = get_user_model().objects.create_user('analyst', password='fixture-password-long')
        for user, role in [(cls.owner, 'owner'), (cls.viewer, 'viewer'), (cls.analyst, 'analyst')]:
            Membership.objects.create(user=user, organization=cls.org, role_id=role)

    def payload(self):
        now = timezone.now().isoformat()
        return {'id': str(uuid.uuid4()), 'protocol': str(self.protocol.pk), 'demo': True, 'withdrawalKey': 'a' * 72, 'createdAt': now, 'stimulus': 'synthetic-loop-v1', 'mapping': ['high', 'low', 'medium'], 'listened': dict.fromkeys('ABC', 2), 'profile': {'consent': True, 'headphonesConfirmed': True, 'consentAt': now, 'headphones': 'over-ear', 'background': 'none'}, 'answers': {key: {'kind': 'rank', 'order': ['A', 'C', 'B']} for key in ['loudness', 'clarity', 'harshness', 'emotion']}, 'timings': {key: {'firstSeenAt': now, 'lastAnsweredAt': now, 'activeMs': 1234, 'elapsedMs': 2345, 'changes': 3} for key in ['loudness', 'clarity', 'harshness', 'emotion']}, 'events': []}

    def test_normalized_persistence_idempotency_and_timer(self):
        d = self.payload()
        s, created = save_response(d)
        self.assertTrue(created)
        self.assertEqual(s.responses.count(), 4)
        self.assertEqual(RankItem.objects.count(), 12)
        self.assertEqual(s.responses.first().active_ms, 1234)
        self.assertEqual(s.assignments.get(label='A').source, 'high')
        self.assertFalse(save_response(d)[1])
        self.assertEqual(ParticipantSession.objects.count(), 1)

    def test_reject_missing_consent_duplicate_ranks_and_unknown_question(self):
        for mutate in [lambda d: d['profile'].update(consent=False), lambda d: d['answers']['emotion'].update(order=['A', 'A', 'B']), lambda d: d['answers'].update(injected={'kind': 'text', 'value': 'bad'}), lambda d: d['listened'].update(A=0), lambda d: d['timings']['emotion'].update(activeMs=-1)]:
            d = self.payload()
            mutate(d)
            with self.assertRaises(ValidationError):
                save_response(d)
        self.assertEqual(ParticipantSession.objects.count(), 0)

    def test_foreign_protocol_options_rejected(self):
        d = self.payload()
        d['answers']['reason'] = {'kind': 'multi', 'values': ['not-an-option']}
        with self.assertRaises(ValidationError):
            save_response(d)

    def test_tenant_isolation_all_portal_boundaries(self):
        self.client.force_login(self.outsider)
        urls = [f'/portal/organizations/{self.org.pk}/', f'/portal/protocols/{self.protocol.pk}/']
        for url in urls:
            self.assertEqual(self.client.get(url).status_code, 403)
        for url in [f'/portal/protocols/{self.protocol.pk}/clone/', f'/portal/protocols/{self.protocol.pk}/export/', f'/portal/organizations/{self.org.pk}/invite/']:
            self.assertEqual(self.client.post(url, {'role': 'researcher'}).status_code, 403)

    def test_viewer_cannot_mutate_or_export(self):
        self.client.force_login(self.viewer)
        self.assertEqual(self.client.get(f'/portal/protocols/{self.protocol.pk}/').status_code, 200)
        for action in ['clone', 'publish', 'export']:
            self.assertEqual(self.client.post(f'/portal/protocols/{self.protocol.pk}/{action}/').status_code, 403)

    def test_analyst_export_audited_and_formula_escaped(self):
        d = self.payload()
        d['answers']['genre'] = {'kind': 'text', 'value': '=IMPORTXML("bad")'}
        save_response(d)
        self.client.force_login(self.analyst)
        r = self.client.post(f'/portal/protocols/{self.protocol.pk}/export/')
        self.assertEqual(r.status_code, 200)
        self.assertIn("'=IMPORTXML", r.content.decode())
        self.assertEqual(ExportAudit.objects.count(), 1)
        self.assertNotIn('withdrawal', r.content.decode())

    def test_csrf_enforced_for_anonymous_submission(self):
        c = Client(enforce_csrf_checks=True)
        r = c.post('/api/responses/', data=json.dumps(self.payload()), content_type='application/json')
        self.assertEqual(r.status_code, 403)
        token = c.get('/api/bootstrap/').json()['csrf']
        r = c.post('/api/responses/', data=json.dumps(self.payload()), content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(r.status_code, 201)

    def test_withdrawal_requires_key_and_cascades(self):
        d = self.payload()
        save_response(d)
        r = self.client.delete('/api/responses/', data=json.dumps({'id': d['id'], 'withdrawalKey': 'wrong'}), content_type='application/json')
        self.assertEqual(r.status_code, 403)
        r = self.client.delete('/api/responses/', data=json.dumps({'id': d['id'], 'withdrawalKey': d['withdrawalKey']}), content_type='application/json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Response.objects.count(), 0)
        self.assertEqual(RankItem.objects.count(), 0)

    def test_invitation_single_use_no_existing_role_escalation(self):
        inv = Invitation.objects.create(organization=self.org, role_id='researcher', token_hash=digest('fixture-token'), expires_at=timezone.now() + timedelta(days=1))
        self.client.force_login(self.viewer)
        self.assertEqual(self.client.post('/invite/fixture-token/').status_code, 302)
        self.assertEqual(self.client.post('/invite/fixture-token/').status_code, 404)
        self.assertEqual(Membership.objects.get(user=self.viewer, organization=self.org).role_id, 'viewer')

    def test_owner_cannot_be_removed(self):
        self.client.force_login(self.owner)
        m = Membership.objects.get(user=self.owner, organization=self.org)
        self.assertEqual(self.client.post(f'/portal/organizations/{self.org.pk}/members/{m.pk}/remove/').status_code, 403)

    def test_published_question_is_immutable_and_clone_is_editable(self):
        q = self.protocol.questions.first()
        q.title = 'changed'
        with self.assertRaises(ValidationError):
            q.save()
        p = clone_protocol(self.protocol)
        self.assertFalse(p.published)
        self.assertEqual(p.questions.count(), self.protocol.questions.count())
        q = p.questions.first()
        q.title = 'New question'
        q.save()

    def test_question_builder_adds_valid_options_without_code(self):
        p = clone_protocol(self.protocol)
        self.client.force_login(self.owner)
        r = self.client.post(f'/portal/protocols/{p.pk}/', {'key': 'preference', 'type': 'single', 'title': 'Which do you prefer?', 'description': 'Choose one', 'required': 'on', 'options_text': 'a|Option A\nb|Option B'})
        self.assertEqual(r.status_code, 302)
        q = p.questions.get(key='preference')
        self.assertEqual(q.options.count(), 2)

    def test_retention_removes_only_expired(self):
        s, _ = save_response(self.payload())
        ParticipantSession.objects.filter(pk=s.pk).update(received_at=timezone.now() - timedelta(days=100))
        call_command('purge_expired')
        self.assertEqual(ParticipantSession.objects.count(), 1)
        call_command('purge_expired', apply=True)
        self.assertEqual(ParticipantSession.objects.count(), 0)

    def test_files_and_raw_data_not_public(self):
        for path in ['/settings.py', '/.env', '/data/scroll-questionnaire.sqlite3', '/api/export/']:
            self.assertEqual(self.client.get(path).status_code, 404)
        self.assertIn("frame-ancestors 'none'", self.client.get('/api/bootstrap/')['Content-Security-Policy'])
