from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.exhibitView, name='exhibitView'),
    # url(r'^(?P<exhibit_id>\d*)/', views.exhibitView, name='exhibitView'),
    
    # AJAX HELPERS
    # url(r'^exhibitItem/(?P<item_id>.*)/$', views.exhibitItemView, name='exhibitItemView'),
]