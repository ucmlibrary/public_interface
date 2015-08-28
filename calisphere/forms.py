class CustomContactForm(ContactForm):
    def __init__(self, request, *args, **kwargs):
        super(CustomContactForm, self).__init__(request=request, *args, **kwargs)
        fields_keyOrder = ['reason', 'name', 'email', 'body', 'captcha']
        if (self.fields.has_key('keyOrder')):
            self.fields.keyOrder = fields_keyOrder
        else:
            self.fields = OrderedDict((k, self.fields[k]) for k in fields_keyOrder)

    REASON = (
        ('support', 'Support'),
        ('feedback', 'Feedback'),
        ('delete', 'Account deletion')
    )
    reason = forms.ChoiceField(choices=REASON, label='Reason')
    captcha = CaptchaField()
    template_name = 'contact_form/contact_form.txt'
    subject_template_name = "contact_form/contact_form_subject.txt"

