from collections import OrderedDict
from django import forms
from contact_form.views import ContactFormView
from contact_form.forms import ContactForm


class CalisphereContactForm(ContactForm):
    def __init__(self, request, *args, **kwargs):
        super(CalisphereContactForm, self).__init__(request=request, *args, **kwargs)
        fields_keyOrder = ['reason', 'name', 'email', 'body']
        if (self.fields.has_key('keyOrder')):
            self.fields.keyOrder = fields_keyOrder
        else:
            self.fields = OrderedDict((k, self.fields[k]) for k in fields_keyOrder)

    REASON = (
        ('a', 'Leave a comment'),
        ('b', 'Request high-resolution copy of item'),
        ('c', 'Ask a copyright question'),
        ('d', 'Get more information'),
        ('e', 'Report an error'),
    )


    name = forms.CharField(max_length=100,
                           label=u'Name:',
                           widget=forms.TextInput(attrs={'placeholder': 'Your full name'}))
    email = forms.EmailField(max_length=200,
                             label=u'Email:')
    body = forms.CharField(widget=forms.Textarea,
                           label=u'Message')


    reason = forms.ChoiceField(choices=REASON, label='Reason')
    template_name = 'contact_form/contact_form.txt'
    subject_template_name = "contact_form/contact_form_subject.txt"

class CalisphereContactFormView(ContactFormView):
    form_class = CalisphereContactForm



