from django import forms
from .models import Question

class QuestionForm(forms.ModelForm):
    options_text = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 4}), help_text='For single/multi choice: one key|label per line.')

    class Meta:
        model = Question
        fields = ['key', 'type', 'title', 'description', 'direction', 'required', 'audio']

    def clean(self):
        data = super().clean()
        options = []
        for line in data.get('options_text', '').splitlines():
            if not line.strip():
                continue
            pieces = line.split('|', 1)
            if len(pieces) != 2 or not pieces[0].replace('-', '').replace('_', '').isalnum() or len(pieces[0]) > 50 or (not 1 <= len(pieces[1]) <= 100):
                raise forms.ValidationError('Options must be key|label, with unique short keys.')
            options.append(pieces)
        if len(options) > 20 or len({o[0] for o in options}) != len(options):
            raise forms.ValidationError('Use up to 20 unique options.')
        if data.get('type') in ['single', 'multi'] and len(options) < 2:
            raise forms.ValidationError('Choice questions need at least two options.')
        if data.get('type') not in ['single', 'multi'] and options:
            raise forms.ValidationError('This question type does not use options.')
        if data.get('type') == 'rank' and (not data.get('audio')):
            raise forms.ValidationError('Ranking questions require audio.')
        data['parsed_options'] = options
        return data
