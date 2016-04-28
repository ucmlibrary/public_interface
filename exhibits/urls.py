from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.exhibitDirectory, name='exhibitDirectory'),
    url(r'^special-topics/$', views.themeDirectory, name='themeDirectory'),
    url(r'^(?P<exhibit_id>\d+)/(?P<exhibit_slug>[-\w]+)/$', views.exhibitView, name='exhibitView'),
    url(r'^(?P<exhibit_id>\d+)/items/(?P<item_id>.+)/$', views.itemView, name='itemView'),
    url(r'^essay/(?P<essay_id>\d+)/(?P<essay_slug>[-\w]+)/$', views.essayView, name='essayView'),
    url(r'^t(?P<theme_id>\d+)/(?P<theme_slug>[-_\w]+)/$', views.themeView, name='themeView')
]