from contact_form.views import ContactFormView
from contact_form.forms import ContactForm

class CustomContactForm(ContactForm):
    pass

class CalisphereContactFormView(ContactFormView):
    form_class = CustomContactForm



