import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Q

class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Role(models.Model):
    code = models.CharField(primary_key=True, max_length=16)
    label = models.CharField(max_length=40)

    def __str__(self):
        return self.label

class Membership(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.PROTECT)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['organization', 'user'], name='one_role_per_org_member')]

class Invitation(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    token_hash = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    used_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    consumed_at = models.DateTimeField(null=True, blank=True)

class Study(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    retention_days = models.PositiveIntegerField(default=90)

    def __str__(self):
        return self.title

class Protocol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    study = models.ForeignKey(Study, on_delete=models.CASCADE, related_name='protocols')
    version = models.PositiveIntegerField()
    published = models.BooleanField(default=False)
    demo = models.BooleanField(default=True)
    consent_version = models.CharField(max_length=40, default='demo-consent-1')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['study', 'version'], name='unique_study_version')]

    def save(self, *args, **kwargs):
        if self.pk and Protocol.objects.filter(pk=self.pk, published=True).exists():
            raise ValidationError('Published protocols are immutable; clone a draft.')
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.study} · v{self.version}'

class Question(models.Model):
    TYPES = [(x, x) for x in ['rank', 'single', 'multi', 'text', 'scale']]
    protocol = models.ForeignKey(Protocol, on_delete=models.CASCADE, related_name='questions')
    key = models.SlugField(max_length=50)
    position = models.PositiveIntegerField()
    type = models.CharField(max_length=10, choices=TYPES)
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=600, blank=True)
    direction = models.CharField(max_length=100, blank=True)
    required = models.BooleanField(default=True)
    audio = models.BooleanField(default=False)

    class Meta:
        ordering = ['position']
        constraints = [models.UniqueConstraint(fields=['protocol', 'key'], name='unique_question_key'), models.UniqueConstraint(fields=['protocol', 'position'], name='unique_question_position')]

    def save(self, *args, **kwargs):
        if self.protocol.published:
            raise ValidationError('Published protocols are immutable; clone a draft.')
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.protocol.published:
            raise ValidationError('Published protocols are immutable.')
        return super().delete(*args, **kwargs)

    def __str__(self):
        return self.title

class QuestionOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    key = models.SlugField(max_length=50)
    label = models.CharField(max_length=100)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['question', 'key'], name='unique_option_key')]

    def save(self, *args, **kwargs):
        if self.question.protocol.published:
            raise ValidationError('Published options are immutable.')
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.question.protocol.published:
            raise ValidationError('Published options are immutable.')
        return super().delete(*args, **kwargs)

class ParticipantSession(models.Model):
    id = models.UUIDField(primary_key=True)
    protocol = models.ForeignKey(Protocol, on_delete=models.PROTECT, related_name='sessions')
    withdrawal_hash = models.CharField(max_length=64)
    payload_hash = models.CharField(max_length=64)
    stimulus = models.CharField(max_length=40)
    headphones = models.CharField(max_length=20)
    background = models.CharField(max_length=30)
    background_details = models.CharField(max_length=200, blank=True)
    consent_at = models.DateTimeField()
    client_started_at = models.DateTimeField()
    received_at = models.DateTimeField(auto_now_add=True)

class LabelAssignment(models.Model):
    session = models.ForeignKey(ParticipantSession, on_delete=models.CASCADE, related_name='assignments')
    label = models.CharField(max_length=1)
    source = models.CharField(max_length=16)
    listened_ms = models.PositiveIntegerField()
    source_sha256 = models.CharField(max_length=64, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['session', 'label'], name='unique_session_label'), models.UniqueConstraint(fields=['session', 'source'], name='unique_session_source'), models.CheckConstraint(condition=Q(label__in=['A', 'B', 'C']), name='valid_abc_label')]

class Response(models.Model):
    session = models.ForeignKey(ParticipantSession, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.PROTECT)
    kind = models.CharField(max_length=10)
    text = models.CharField(max_length=1000, blank=True)
    scale = models.PositiveSmallIntegerField(null=True, blank=True)
    first_seen_at = models.DateTimeField(null=True, blank=True)
    last_answered_at = models.DateTimeField(null=True, blank=True)
    active_ms = models.PositiveIntegerField(default=0)
    elapsed_ms = models.PositiveIntegerField(default=0)
    changes = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['session', 'question'], name='one_response_per_question'), models.CheckConstraint(condition=Q(scale__isnull=True) | Q(scale__gte=1, scale__lte=7), name='scale_one_to_seven')]

class RankItem(models.Model):
    response = models.ForeignKey(Response, on_delete=models.CASCADE, related_name='ranks')
    label = models.CharField(max_length=1)
    position = models.PositiveSmallIntegerField()

    class Meta:
        constraints = [models.UniqueConstraint(fields=['response', 'label'], name='rank_label_once'), models.UniqueConstraint(fields=['response', 'position'], name='rank_position_once'), models.CheckConstraint(condition=Q(position__gte=1, position__lte=3), name='rank_one_to_three'), models.CheckConstraint(condition=Q(label__in=['A', 'B', 'C']), name='rank_label_abc')]

class SelectedOption(models.Model):
    response = models.ForeignKey(Response, on_delete=models.CASCADE, related_name='selections')
    option = models.ForeignKey(QuestionOption, on_delete=models.PROTECT)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['response', 'option'], name='option_selected_once')]

class PlaybackEvent(models.Model):
    session = models.ForeignKey(ParticipantSession, on_delete=models.CASCADE, related_name='events')
    question = models.ForeignKey(Question, on_delete=models.PROTECT, null=True)
    type = models.CharField(max_length=12)
    at = models.DateTimeField()
    position = models.FloatField(default=0)
    source_index = models.PositiveSmallIntegerField(null=True)

class ExportAudit(models.Model):
    protocol = models.ForeignKey(Protocol, on_delete=models.CASCADE)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    row_count = models.PositiveIntegerField()
