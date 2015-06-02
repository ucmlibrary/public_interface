from django.core.cache import cache
from django.conf import settings

import solr
from retrying import retry
import pickle
import hashlib


SOLR = solr.SearchHandler(
    solr.Solr(
        settings.SOLR_URL,
        post_headers={
            'X-Authentication-Token': settings.SOLR_API_KEY,
        },
    ),
    "/query"
)


class SolrCache(object):
    pass


def kwargs_md5(**kwargs):
    m = hashlib.md5()
    m.update(pickle.dumps(kwargs))
    return m.hexdigest()


@retry(stop_max_delay=3000)  # milliseconds
def SOLR_select(**kwargs):
    # look in the cache
    key = kwargs_md5(**kwargs)
    sc = cache.get(key)
    if not sc:
        # do the solr look up
        sr = SOLR(**kwargs)
        # copy attributes that can be pickled to new object
        sc = SolrCache()
        sc.results = sr.results
        sc.header = sr.header
        sc.facet_counts = getattr(sr, 'facet_counts', None)
        sc.numFound = sr.numFound
        cache.set(key, sc, 60*15)  # seconds
    return sc
