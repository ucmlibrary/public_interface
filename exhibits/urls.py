from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.exhibitDirectory, name='exhibitDirectory'),
    url(r'^(?P<exhibit_id>\d+)/((?P<exhibit_slug>[-_\w]*)/)*$', views.exhibitView, name='exhibitView'),
    
    # AJAX HELPERS
    # url(r'^exhibitItem/(?P<item_id>.*)/$', views.exhibitItemView, name='exhibitItemView'),
]