from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from calisphere.home import HomeView
from . import views

app_name = 'calisphere'

urlpatterns = [
    url(r'^$', HomeView.as_view(), name='home'),
    url(r'^search/$', views.search, name='search'),
    url(r'^item/(?P<item_id>.*)/$', views.itemView, name='itemView'),

    url(r'^collections/$', views.collectionsDirectory, name='collectionsDirectory'),
    url(r'^collections/(?P<collection_letter>[a-zA-Z]{1})/', views.collectionsAZ, name='collectionsAZ'),
    url(r'^collections/(?P<collection_letter>num)/', views.collectionsAZ, name='collectionsAZ'),
    url(r'^collections/(?P<collection_id>\d*)/', views.collectionView, name='collectionView'),

    # Redirects to new 'exhibitions'
    url(r'^collections/themed/$', RedirectView.as_view(url='/exhibitions/'), name='themedCollections'),
    url(r'^collections/cal-cultures/$', RedirectView.as_view(url='/cal-cultures/'), name='calCultures'),
    url(r'^collections/jarda/$', RedirectView.as_view(url='/exhibitions/t11/jarda/'), name='jarda'),

    url(r'^collections/titleSearch/$', views.collectionsSearch, name='collectionsTitleSearch'),
    url(r'^collections/titles.json$', views.collectionsTitles, name='collectionsTitleData'),

    url(r'^institution/(?P<repository_id>\d*)(?:/(?P<subnav>items|collections))?/', views.repositoryView, name='repositoryView'),
    url(r'^(?P<campus_slug>UC\w{1,2})(?:/(?P<subnav>items|collections|institutions))?/', views.campusView, name='campusView'),
    url(r'^institutions/$', views.campusDirectory, name='campusDirectory'),
    url(r'^institutions/statewide-partners/$', views.statewideDirectory, name='statewideDirectory'),

    url(r'about/$', TemplateView.as_view(template_name='calisphere/about.html'), name='about'),
    url(r'help/$', TemplateView.as_view(template_name='calisphere/help.html'), name='help'),
    url(r'terms/$', TemplateView.as_view(template_name='calisphere/termsOfUse.html'), name='termsOfUse'),
    url(r'privacy/$', TemplateView.as_view(template_name='calisphere/privacyStatement.html'), name='privacyStatement'),
    url(r'siteMap/$', TemplateView.as_view(template_name='calisphere/siteMap.html'), name='siteMap'),
    url(r'outreach/$', TemplateView.as_view(template_name='calisphere/outreach.html'), name='siteMap'),
    url(r'contribute/$', TemplateView.as_view(template_name='calisphere/contribute.html'), name='siteMap'),
    url(r'jobs/$', TemplateView.as_view(template_name='calisphere/jobs.html'), name='jobs'),

    # AJAX HELPERS
    url(r'^relatedCollections/', views.relatedCollections, name='relatedCollections'),
    url(r'^carousel/', views.itemViewCarousel, name='carousel'),
    url(r'^contactOwner/', views.contactOwner, name='contactOwner'),
]
