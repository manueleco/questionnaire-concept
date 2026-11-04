# Platform superusers manage accounts. Tenant work uses the scoped portal.
# Deliberately do not expose raw study/response models in generic admin.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
admin.site.site_header = 'Scroll Questionnaire · platform administration'
