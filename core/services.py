"""Tenant and protocol checks live at the application boundary, never in the UI alone."""
import hashlib, json, math, uuid
from datetime import datetime
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from .models import *
from .translations import language, question_translations, store_translations

def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()

def membership(user, organization, roles=None):
    if not user.is_authenticated:
        raise PermissionDenied
    m = Membership.objects.filter(user=user, organization=organization).select_related('role').first()
    if not m or (roles and m.role_id not in roles):
        raise PermissionDenied
    return m

def protocol_dict(p):
    return {'id': str(p.pk), 'title': p.study.title, 'demo': p.demo, 'minSecondsPerVersion': p.min_seconds_per_version, 'questions': [{'id': q.key, 'translations': question_translations(q), 'type': q.type, 'title': q.title, 'description': q.description, 'direction': q.direction, 'required': q.required, 'audio': q.audio, 'options': [{'id': o.key, 'label': o.label} for o in q.options.all()]} for q in p.questions.prefetch_related('options__translations', 'translations')]}

def bounded_text(value, n):
    if not isinstance(value, str) or len(value) > n:
        raise ValidationError('Invalid text length or type.')
    return value

def number(value, maximum):
    if type(value) not in (int, float) or not math.isfinite(value) or (not 0 <= value <= maximum):
        raise ValidationError('Invalid timing value.')
    return round(value)

def date(value, required=True):
    if value is None and (not required):
        return None
    if not isinstance(value, str) or len(value) > 40:
        raise ValidationError('Invalid timestamp.')
    try:
        d = parse_datetime(value)
    except ValueError:
        d = None
    if not d or timezone.is_naive(d):
        raise ValidationError('Timestamp requires timezone.')
    return d

@transaction.atomic
def save_response(data):
    if not isinstance(data, dict):
        raise ValidationError('Invalid request.')
    try:
        session_id = uuid.UUID(str(data.get('id')))
        protocol_id = uuid.UUID(str(data.get('protocol')))
    except ValueError:
        raise ValidationError('Invalid identifier.')
    key = bounded_text(data.get('withdrawalKey'), 100)
    if len(key) < 64:
        raise ValidationError('Invalid withdrawal key.')
    old = ParticipantSession.objects.filter(pk=session_id).first()
    if old:
        import hmac
        if not hmac.compare_digest(old.withdrawal_hash, digest(key)):
            raise ValidationError('Session cannot be saved.')
        return (old, False)
    p = Protocol.objects.select_for_update().select_related('study').get(pk=protocol_id, published=True)
    if not p.demo or data.get('demo') is not True:
        raise ValidationError('Research collection is not enabled.')
    profile = data.get('profile', {})
    if not isinstance(profile, dict) or profile.get('consent') is not True or profile.get('headphonesConfirmed') is not True:
        raise ValidationError('Consent and headphones confirmation are required.')
    if profile.get('headphones') not in ['in-ear', 'on-ear', 'over-ear']:
        raise ValidationError('Invalid headphones.')
    if profile.get('background') not in ['none', 'listener', 'performer', 'producer', 'student', 'other']:
        raise ValidationError('Invalid background.')
    stimulus = data.get('stimulus')
    if stimulus not in ['synthetic-loop-v1', 'local-import', 'supplied-augments']:
        raise ValidationError('Unknown stimulus.')
    sources = ['low', 'medium', 'high'] if stimulus == 'synthetic-loop-v1' else ['source-1', 'source-2', 'source-3']
    mapping = data.get('mapping')
    if not isinstance(mapping, list) or sorted(mapping) != sorted(sources):
        raise ValidationError('Invalid A/B/C assignment.')
    hashes = data.get('sourceHashes', [])
    if stimulus != 'synthetic-loop-v1' and (not isinstance(hashes, list) or len(hashes) != 3 or any((not isinstance(h, str) or len(h) != 64 or any((c not in '0123456789abcdef' for c in h)) for h in hashes))):
        raise ValidationError('Source fingerprints required.')
    answers = data.get('answers', {})
    timings = data.get('timings', {})
    listened = data.get('listened', {})
    if not all((isinstance(x, dict) for x in [answers, timings, listened])):
        raise ValidationError('Invalid answer data.')
    questions = list(p.questions.prefetch_related('options__translations', 'translations'))
    keys = {q.key for q in questions}
    if set(answers) - keys or set(timings) - keys:
        raise ValidationError('Question does not belong to this protocol.')
    listening = {l: number(listened.get(l, 0) * 1000, 3600000) for l in 'ABC' if type(listened.get(l, 0)) in (int, float)}
    if len(listening) != 3 or (any((q.audio for q in questions)) and any((v < p.min_seconds_per_version * 1000 for v in listening.values()))):
        raise ValidationError('Listen to every version first.')
    parsed = []
    for q in questions:
        a = answers.get(q.key)
        if a is None:
            if q.required:
                raise ValidationError('Required question is missing.')
            continue
        if not isinstance(a, dict):
            raise ValidationError('Invalid answer.')
        answer_language = language(a.get('language', 'en'))
        if answer_language != 'en' and not any(row.language == answer_language for row in q.translations.all()):
            raise ValidationError('Answer language has no versioned question translation.')
        kind = a.get('kind')
        order = []
        options = []
        text = ''
        scale = None
        if q.type == 'rank':
            if kind not in ['rank', 'tie', 'unsure']:
                raise ValidationError('Invalid ranking.')
            if kind == 'rank':
                order = a.get('order')
                if not isinstance(order, list) or sorted(order) != ['A', 'B', 'C']:
                    raise ValidationError('Rank A, B and C exactly once.')
        elif kind != q.type:
            raise ValidationError('Answer type does not match question.')
        elif kind in ['single', 'multi']:
            ids = [a.get('value')] if kind == 'single' else a.get('values')
            if not isinstance(ids, list) or any((not isinstance(v, str) for v in ids)) or len(ids) != len(set(ids)):
                raise ValidationError('Invalid options.')
            lookup = {o.key: o for o in q.options.all()}
            if any((v not in lookup for v in ids)) or (q.required and (not ids)):
                raise ValidationError('Option does not belong to question.')
            options = [lookup[v] for v in ids]
        elif kind == 'text':
            text = bounded_text(a.get('value', ''), 1000)
            if q.required and (not text.strip()):
                raise ValidationError('Text is required.')
        elif kind == 'scale':
            if a.get('value') not in [str(i) for i in range(1, 8)]:
                raise ValidationError('Rating must be from 1 to 7.')
            scale = int(a['value'])
        t = timings.get(q.key, {})
        if not isinstance(t, dict):
            raise ValidationError('Invalid timing.')
        first = date(t.get('firstSeenAt'), False)
        last = date(t.get('lastAnsweredAt'), False)
        if first and last and (last < first):
            raise ValidationError('Answer timestamp precedes question.')
        parsed.append((q, answer_language, kind, text, scale, order, options, first, last, number(t.get('activeMs', 0), 86400000), number(t.get('elapsedMs', 0), 2592000000), number(t.get('changes', 0), 100000)))
    events = data.get('events', [])
    if not isinstance(events, list) or len(events) > 500:
        raise ValidationError('Too many events.')
    parsed_events = []
    question_map = {q.key: q for q in questions}
    for e in events:
        if not isinstance(e, dict) or e.get('type') not in ['play', 'pause', 'switch'] or e.get('question') not in keys | {None}:
            raise ValidationError('Invalid playback event.')
        idx = e.get('index')
        if idx is not None and (type(idx) != int or idx not in [0, 1, 2]):
            raise ValidationError('Invalid audio index.')
        parsed_events.append((question_map.get(e.get('question')), e['type'], date(e.get('at')), number(e.get('position', 0) * 1000, 60000) / 1000, idx))
    s = ParticipantSession.objects.create(id=session_id, protocol=p, language=language(data.get('language', 'en')), consent_language=language(data.get('consentLanguage', 'en')), withdrawal_hash=digest(key), payload_hash=digest(json.dumps(data, sort_keys=True)), stimulus=stimulus, headphones=profile['headphones'], background=profile['background'], background_details=bounded_text(profile.get('details', ''), 200), consent_at=date(profile.get('consentAt')), client_started_at=date(data.get('createdAt')))
    LabelAssignment.objects.bulk_create([LabelAssignment(session=s, label=l, source=mapping[i], listened_ms=listening[l], source_sha256=hashes[sources.index(mapping[i])] if hashes else '') for i, l in enumerate('ABC')])
    for q, answer_language, kind, text, scale, order, options, first, last, active, elapsed, changes in parsed:
        r = Response.objects.create(session=s, question=q, language=answer_language, kind=kind, text=text, scale=scale, first_seen_at=first, last_answered_at=last, active_ms=active, elapsed_ms=elapsed, changes=changes)
        RankItem.objects.bulk_create([RankItem(response=r, label=l, position=i + 1) for i, l in enumerate(order)])
        SelectedOption.objects.bulk_create([SelectedOption(response=r, option=o) for o in options])
    PlaybackEvent.objects.bulk_create([PlaybackEvent(session=s, question=q, type=t, at=at, position=pos, source_index=idx) for q, t, at, pos, idx in parsed_events])
    return (s, True)

@transaction.atomic
def clone_protocol(p):
    Study.objects.select_for_update().get(pk=p.study_id)
    version = (p.study.protocols.order_by('-version').values_list('version', flat=True).first() or 0) + 1
    copy = Protocol.objects.create(study=p.study, version=version, demo=p.demo, consent_version=p.consent_version, min_seconds_per_version=p.min_seconds_per_version)
    for q in p.questions.prefetch_related('options__translations', 'translations'):
        options = list(q.options.all())
        translations = question_translations(q)
        q.pk = None
        q.protocol = copy
        q.save()
        for o in options:
            o.pk = None
            o.question = q
            o.save()
        q._prefetched_objects_cache = {}
        store_translations(q, translations)
    return copy
