from collections import OrderedDict
from django import forms
from django.core.urlresolvers import reverse
from contact_form.views import ContactFormView
from contact_form.forms import ContactForm


class CalisphereContactForm(ContactForm):
    REASON = (
        ('comment', 'Leave a comment'),
        ('hi-res copy', 'Request high-resolution copy of item'),
        ('copyright', 'Ask a copyright question'),
        ('info', 'Get more information'),
        ('error', 'Report an error'),
    )
    name = forms.CharField(
        max_length=100,
        label=u'Name:',
        widget=forms.TextInput(attrs={'placeholder': 'Your full name'}),
    )
    email = forms.EmailField(
        max_length=200,
        label=u'Email:',
        widget=forms.TextInput(attrs={'placeholder': 'Your email'}),
    )
    email2 = forms.EmailField(
        max_length=200,
        label=u'Verify Email:',
        widget=forms.TextInput(attrs={'placeholder': 'Verify your email'}),
    )
    body = forms.CharField(
        widget=forms.Textarea,
        label=u'Message',
    )
    reason = forms.ChoiceField(
        choices=REASON,
        label='Nature of Request',
    )
    referer = forms.CharField(widget=forms.HiddenInput())

    template_name = 'contact_form/contact_form.txt'
    subject_template_name = "contact_form/contact_form_subject.txt"

    def __init__(self, request, *args, **kwargs):
        super(
            CalisphereContactForm,
            self
        ).__init__(request=request, *args, **kwargs)
        fields_keyOrder = [
            'name',
            'email',
            'email2',
            'reason',
            'body',
            'referer',
        ]
        if (self.fields.has_key('keyOrder')):
            self.fields.keyOrder = fields_keyOrder
        else:
            self.fields = OrderedDict(
                (k, self.fields[k]) for k in fields_keyOrder
            )


class CalisphereContactFormView(ContactFormView):
    '''view for main email contact form'''
    # use our custom form
    form_class = CalisphereContactForm
    def get_success_url(self):
        # pass the referer on to the "sent" email confirmation page
        return u'{0}?referer={1}'.format(
            reverse('contact_form_sent'),
            self.request.POST.get('referer')
        )
