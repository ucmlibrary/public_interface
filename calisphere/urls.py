from django.conf.urls import patterns, include, url

urlpatterns = patterns('calisphere',
    url(r'^$', 'views.search', name='search'),

    url(r'^easy-pjax-test/$', 'views.pjaxTest', name='pjaxTest'),
    url(r'^easy-pjax-hello/$', 'views.pjaxHello', name='pjaxHello'),

    url(r'^itemView/(?P<item_id>.*)/', 'views.itemView', name='itemView'),
    url(r'^collections/$', 'views.collectionsExplore', name='collectionsExplore'),
    url(r'^collections/(?P<collection_id>.*)/', 'views.collectionView', name='collectionView'),

)
