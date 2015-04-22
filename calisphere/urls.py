from django.conf.urls import patterns, include, url

urlpatterns = patterns('calisphere',
    url(r'^$', 'views.search', name='search'),
    url(r'^itemView/(?P<item_id>.*)/', 'views.itemView', name='itemView'),
    
    url(r'^collections/$', 'views.collectionsDirectory', name='collectionsDirectory'),
    url(r'^collections/(?P<collection_letter>[a-z]{1})/', 'views.collectionsAZ', name='collectionsAZ'),
    url(r'^collections/(?P<collection_id>\d*)/', 'views.collectionView', name='collectionView'),
    
    url(r'^repository/(?P<repository_id>.*)/', 'views.repositoryView', name='repositoryView'),
    
    # AJAX HELPERS
    url(r'^relatedCollections/', 'views.relatedCollections', name='relatedCollections'),
    url(r'^carousel/', 'views.itemViewCarousel', name='carousel'),
)
