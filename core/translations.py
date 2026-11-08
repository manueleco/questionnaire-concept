"""Versioned question translations; never translate respondent-supplied text."""
from django.core.exceptions import ValidationError
from .models import QuestionTranslation, OptionTranslation

LANGUAGES = ('en', 'es', 'ca')

def language(value):
    if not isinstance(value, str) or value not in LANGUAGES:
        raise ValidationError('Unsupported language.')
    return value

def validate_translations(raw, question):
    if not isinstance(raw, dict) or set(raw) - {'es', 'ca'}:
        raise ValueError('Translations support es and ca; English is the source language.')
    result = {}
    option_ids = {option['id'] for option in question.get('options', [])}
    for locale, item in raw.items():
        if not isinstance(item, dict) or set(item) - {'title', 'description', 'direction', 'options'}:
            raise ValueError('Invalid translated question fields.')
        out = {}
        for key, limit in [('title', 200), ('description', 600), ('direction', 100)]:
            value = item.get(key, '')
            if not isinstance(value, str) or len(value) > limit or ((key == 'title' or question.get(key)) and not value.strip()):
                raise ValueError('Translations must include all source text within field limits.')
            out[key] = value
        options = item.get('options', {})
        if not isinstance(options, dict) or set(options) != option_ids or any(not isinstance(label, str) or not label.strip() or len(label) > 100 for label in options.values()):
            raise ValueError('Translated options must match the source option IDs exactly.')
        out['options'] = options
        result[locale] = out
    return result

def store_translations(question, translations):
    options = {option.key: option for option in question.options.all()}
    for locale, item in translations.items():
        row = QuestionTranslation(question=question, language=locale, **{key: item[key] for key in ('title', 'description', 'direction')})
        row.full_clean(); row.save()
        for key, label in item['options'].items():
            row = OptionTranslation(option=options[key], language=locale, label=label)
            row.full_clean(); row.save()

def question_translations(question):
    return {row.language: {'title': row.title, 'description': row.description, 'direction': row.direction,
        'options': {option.key: translated.label for option in question.options.all() for translated in option.translations.all() if translated.language == row.language}}
        for row in question.translations.all()}
