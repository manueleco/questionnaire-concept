# Fixed allowlist, never serve arbitrary project files, secrets or uploaded data.
import csv, hmac, io, json, secrets
from datetime import timedelta
from pathlib import Path
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError, RequestDataTooBig, PermissionDenied
from django.db import transaction, IntegrityError
from django.db.models import Count
from django.http import JsonResponse, HttpResponse, FileResponse, Http404, HttpResponseBadRequest
from django.middleware.csrf import get_token
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_POST, require_GET
from .models import *
from .services import membership, protocol_dict, save_response, digest, clone_protocol
from .forms import QuestionForm
EDIT = ['owner', 'admin', 'researcher']
EXPORT = ['owner', 'admin', 'researcher', 'analyst']
MANAGE = ['owner', 'admin']

@require_GET
def bootstrap(request):
    return JsonResponse({'csrf': get_token(request), 'mode': 'demo-database'})

@require_GET
def protocol_api(request, pk=None):
    qs = Protocol.objects.filter(published=True, demo=True).select_related('study')
    p = get_object_or_404(qs, pk=pk) if pk else qs.order_by('created_at').first()
    if not p:
        raise Http404
    return JsonResponse(protocol_dict(p))

@require_http_methods(['POST', 'DELETE'])
def responses(request):
    try:
        if request.content_type != 'application/json':
            return JsonResponse({'error': 'Use JSON.'}, status=415)
        data = json.loads(request.body)
        if not isinstance(data, dict):
            raise ValidationError('Invalid request.')
        if request.method == 'DELETE':
            try:
                s = ParticipantSession.objects.get(pk=data.get('id'))
            except (ParticipantSession.DoesNotExist, ValidationError):
                return JsonResponse({'deleted': True})
            key = data.get('withdrawalKey', '')
            if not isinstance(key, str) or not hmac.compare_digest(s.withdrawal_hash, digest(key)):
                return JsonResponse({'error': 'Invalid withdrawal key.'}, status=403)
            s.delete()
            return JsonResponse({'deleted': True})
        s, created = save_response(data)
        return JsonResponse({'id': str(s.pk), 'saved': True, 'created': created}, status=201 if created else 200)
    except (ValueError, ValidationError, Protocol.DoesNotExist, TypeError, KeyError, OverflowError, IntegrityError, RequestDataTooBig):
        return JsonResponse({'error': 'Invalid or incomplete response. Check consent, protocol, answers and timings.'}, status=400)

@login_required
def portal(request):
    memberships = Membership.objects.filter(user=request.user).select_related('organization', 'role')
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if not 1 <= len(name) <= 120:
            return HttpResponseBadRequest('Enter an organization name of 1–120 characters.')
        with transaction.atomic():
            org = Organization.objects.create(name=name)
            Membership.objects.create(organization=org, user=request.user, role_id='owner')
        return redirect('organization', pk=org.pk)
    return render(request, 'portal/index.html', {'memberships': memberships})

@login_required
def organization(request, pk):
    org = get_object_or_404(Organization, pk=pk)
    m = membership(request.user, org)
    if request.method == 'POST':
        membership(request.user, org, EDIT)
        title = request.POST.get('title', '').strip()
        if not 1 <= len(title) <= 160:
            return HttpResponseBadRequest('Enter a study title of 1–160 characters.')
        with transaction.atomic():
            s = Study.objects.create(organization=org, title=title)
            p = Protocol.objects.create(study=s, version=1)
        return redirect('protocol_edit', pk=p.pk)
    return render(request, 'portal/organization.html', {'org': org, 'membership': m, 'can_edit': m.role_id in EDIT, 'can_manage': m.role_id in MANAGE, 'studies': Study.objects.filter(organization=org).prefetch_related('protocols'), 'members': org.memberships.select_related('user', 'role')})

@login_required
@require_POST
def invite(request, pk):
    org = get_object_or_404(Organization, pk=pk)
    m = membership(request.user, org, MANAGE)
    role = request.POST.get('role')
    if role not in ['researcher', 'analyst', 'viewer'] + (['admin'] if m.role_id == 'owner' else []):
        raise PermissionDenied
    raw = secrets.token_urlsafe(32)
    Invitation.objects.create(organization=org, role_id=role, token_hash=digest(raw), expires_at=timezone.now() + timedelta(days=3))
    return render(request, 'portal/invitation.html', {'org': org, 'link': request.build_absolute_uri('/invite/' + raw + '/')})

@require_http_methods(['GET', 'POST'])
def accept_invite(request, token):
    inv = get_object_or_404(Invitation, token_hash=digest(token), consumed_at__isnull=True, expires_at__gt=timezone.now())
    form = UserCreationForm(request.POST or None)
    if request.method == 'POST' and (request.user.is_authenticated or form.is_valid()):
        with transaction.atomic():
            inv = get_object_or_404(Invitation.objects.select_for_update(), pk=inv.pk, consumed_at__isnull=True, expires_at__gt=timezone.now())
            user = request.user if request.user.is_authenticated else form.save()
            Membership.objects.get_or_create(user=user, organization=inv.organization, defaults={'role': inv.role})
            inv.used_by = user
            inv.consumed_at = timezone.now()
            inv.save()
        if not request.user.is_authenticated:
            login(request, user)
        return redirect('organization', pk=inv.organization_id)
    return render(request, 'portal/accept.html', {'invite': inv, 'form': form})

@login_required
@require_POST
def remove_member(request, pk, member_id):
    org = get_object_or_404(Organization, pk=pk)
    m = membership(request.user, org, MANAGE)
    target = get_object_or_404(Membership, pk=member_id, organization=org)
    if target.role_id == 'owner' or (target.role_id == 'admin' and m.role_id != 'owner'):
        raise PermissionDenied
    target.delete()
    return redirect('organization', pk=pk)

@login_required
def protocol_edit(request, pk):
    p = get_object_or_404(Protocol.objects.select_related('study__organization'), pk=pk)
    m = membership(request.user, p.study.organization)
    form = QuestionForm(request.POST or None)
    if request.method == 'POST':
        membership(request.user, p.study.organization, EDIT)
        if p.published:
            return HttpResponseBadRequest('Clone the published protocol before editing.')
        if p.questions.count() >= 30:
            return HttpResponseBadRequest('Prototype limit: 30 questions per protocol.')
        if form.is_valid():
            with transaction.atomic():
                p = Protocol.objects.select_for_update().get(pk=p.pk)
                if p.published:
                    return HttpResponseBadRequest('Protocol is already published.')
                q = form.save(commit=False)
                q.protocol = p
                q.position = (p.questions.order_by('-position').values_list('position', flat=True).first() or 0) + 1
                if p.questions.filter(key=q.key).exists():
                    form.add_error('key', 'This key already exists.')
                else:
                    q.save()
                    QuestionOption.objects.bulk_create([QuestionOption(question=q, key=k, label=l) for k, l in form.cleaned_data['parsed_options']])
                    return redirect('protocol_edit', pk=p.pk)
    return render(request, 'portal/protocol.html', {'protocol': p, 'form': form, 'can_edit': m.role_id in EDIT, 'can_export': m.role_id in EXPORT, 'questions': p.questions.prefetch_related('options'), 'response_count': p.sessions.count()})

@login_required
@require_POST
def protocol_action(request, pk, action):
    with transaction.atomic():
        p = get_object_or_404(Protocol.objects.select_for_update().select_related('study__organization'), pk=pk)
        membership(request.user, p.study.organization, EDIT)
        if action == 'clone':
            return redirect('protocol_edit', pk=clone_protocol(p).pk)
        if action == 'publish':
            if p.published:
                return redirect('protocol_edit', pk=p.pk)
            if not p.questions.exists() or not p.demo:
                return HttpResponseBadRequest('Only non-empty demo protocols can be published in this release.')
            p.published = True
            p.save()
            return redirect('protocol_edit', pk=p.pk)
    raise Http404

@login_required
@require_POST
def delete_question(request, pk, question_id):
    with transaction.atomic():
        p = get_object_or_404(Protocol.objects.select_for_update().select_related('study__organization'), pk=pk)
        membership(request.user, p.study.organization, EDIT)
        if p.published:
            return HttpResponseBadRequest('Published questions cannot be changed.')
        get_object_or_404(Question, pk=question_id, protocol=p).delete()
    return redirect('protocol_edit', pk=pk)

def csv_safe(value):
    s = str(value if value is not None else '')
    return "'" + s if s.startswith(('=', '+', '-', '@', '\t', '\r', '\n')) else s

@login_required
@require_POST
def export_csv(request, pk):
    p = get_object_or_404(Protocol.objects.select_related('study__organization'), pk=pk)
    membership(request.user, p.study.organization, EXPORT)
    rows = Response.objects.filter(session__protocol=p).select_related('session', 'question').prefetch_related('ranks', 'selections__option')
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(['session_id', 'protocol_id', 'question', 'kind', 'answer', 'active_ms', 'elapsed_to_last_answer_ms', 'first_seen_at', 'last_answered_at', 'client_started_at', 'received_at', 'stimulus', 'A_source', 'B_source', 'C_source', 'headphones', 'musical_background'])
    count = 0
    assignments = {s.id: {a.label: a.source for a in s.assignments.all()} for s in p.sessions.prefetch_related('assignments')}
    for r in rows:
        value = ' > '.join((x.label for x in sorted(r.ranks.all(), key=lambda x: x.position))) if r.kind == 'rank' else '; '.join((x.option.key for x in r.selections.all())) if r.kind in ['single', 'multi'] else r.text or r.scale or r.kind
        s = r.session
        mapping = assignments[s.id]
        w.writerow([csv_safe(v) for v in [s.pk, p.pk, r.question.key, r.kind, value, r.active_ms, r.elapsed_ms, r.first_seen_at, r.last_answered_at, s.client_started_at, s.received_at, s.stimulus, mapping.get('A'), mapping.get('B'), mapping.get('C'), s.headphones, s.background]])
        count += 1
    ExportAudit.objects.create(protocol=p, actor=request.user, row_count=count)
    response = HttpResponse(out.getvalue(), content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="scroll-questionnaire-responses.csv"'
    return response

@require_GET
def frontend(request, path='index.html'):
    if path not in ['index.html', 'app.js', 'styles.css', 'app-shell.css', 'questions.json', 'portal.css']:
        raise Http404
    f = settings.BASE_DIR / 'dist' / path
    if not f.is_file():
        raise Http404
    types = {'html': 'text/html', 'js': 'text/javascript', 'css': 'text/css', 'json': 'application/json'}
    return FileResponse(f.open('rb'), content_type=types[path.split('.')[-1]])
DEMO_ASSETS = {'noise': 'TRBFMXE149E3E18222_add_noise.mp3', 'compression': 'TRBFMXE149E3E18222_apply_compression.mp3', 'eq': 'TRBFMXE149E3E18222_randomly_eq.mp3', 'reverb': 'TRBFMXE149E3E18222_reverb_1st-baptist-nashville-balcony.mp3'}

@require_GET
def demo_assets(request):
    if not settings.DEBUG:
        raise Http404
    return JsonResponse({'assets': [{'id': k, 'label': k, 'url': '/api/demo-assets/' + k + '/'} for k, v in DEMO_ASSETS.items() if (settings.DATA_DIR / 'stimuli' / v).is_file()]})

@require_GET
def demo_asset(request, key):
    if not settings.DEBUG or key not in DEMO_ASSETS:
        raise Http404
    f = settings.DATA_DIR / 'stimuli' / (key + '-excerpt.wav')
    if not f.is_file():
        raise Http404
    response = FileResponse(f.open('rb'), content_type='audio/wav')
    response['Cache-Control'] = 'no-store'
    return response


@require_GET
def font_asset(request, path):
    # Explicit list: never expose arbitrary files in the project.
    if path not in ('BarlowCondensed-ExtraBold.ttf', 'Manrope.ttf'):
        raise Http404
    asset = settings.BASE_DIR / 'dist' / 'fonts' / path
    if not asset.is_file():
        raise Http404
    response = FileResponse(asset.open('rb'), content_type='font/ttf')
    response['Cache-Control'] = 'public, max-age=86400'
    return response
