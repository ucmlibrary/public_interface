from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^', include('calisphere.urls', namespace="calisphere")),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^contact/', include('contact_form.urls')),
)
