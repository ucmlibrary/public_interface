from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'solrapi.views.home', name='home'),
    url(r'^search/', 'solrapi.views.search', name='search'),
    # url(r'^objectView/', 'solrapi.views.objectView', name='objectViewPost'),
    url(r'^objectView/(?P<object_id>.*)/', 'solrapi.views.objectView', name='objectView'),
    url(r'^collections/$', 'solrapi.views.collectionsExplore', name='collectionsExplore'),
    # url(r'^collectionsalpha/$', 'solrapi.views.collectionsAlpha', name='collectionsAlpha'),
    # url(r'^collections/search/', 'solrapi.views.collectionsSearch', name='collectionsSearch'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
