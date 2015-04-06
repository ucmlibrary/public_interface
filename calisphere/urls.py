from django.conf.urls import patterns, include, url

urlpatterns = patterns('calisphere',
    url(r'^$', 'views.search', name='search'),
    url(r'^itemView/(?P<item_id>.*)/', 'views.itemView', name='itemView'),
    
    url(r'^collections/$', 'views.collectionsExplore', name='collectionsExplore'),
    url(r'^collections/(?P<collection_id>.*)/', 'views.collectionView', name='collectionView'),
    
    # AJAX HELPERS
    url(r'^relatedCollections/', 'views.relatedCollections', name='relatedCollections'),
    url(r'^carousel/', 'views.itemViewCarousel', name='carousel'),
)
