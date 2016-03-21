from django.template import Library
import markdown

register = Library()

@register.filter
def markdownify(text):
    return markdown.markdown(text, safe_mode='escape')