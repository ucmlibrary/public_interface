from django.contrib import admin

# Register your models here.

from .models import Exhibit, ExhibitItem


admin.site.register(Exhibit)
admin.site.register(ExhibitItem)