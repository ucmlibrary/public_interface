""" logic for cache / retry for solr and JSON from registry
"""
from django.core.cache import cache
from django.conf import settings

import urllib2
import solr
from retrying import retry
import pickle
import hashlib
import json


# create a hash for a cache key
def kwargs_md5(**kwargs):
    m = hashlib.md5()
    m.update(pickle.dumps(kwargs))
    return m.hexdigest()


# wrapper function for json.loads(urllib2.urlopen)
@retry(stop_max_delay=3000)  # milliseconds
def json_loads_url(url_or_req):
    key = kwargs_md5(key='json_loads_url', url=url_or_req)
    data = cache.get(key)
    if not data:
        data = json.loads(urllib2.urlopen(url_or_req).read())
    return data


# dummy class for holding cached data
class SolrCache(object):
    pass


# wrapper function for solr queries
@retry(stop_max_delay=3000)  # milliseconds
def SOLR_select(**kwargs):
    # set up solr handler with auth token
    SOLR = solr.SearchHandler(
        solr.Solr(
            settings.SOLR_URL,
            post_headers={
                'X-Authentication-Token': settings.SOLR_API_KEY,
            },
        ),
        "/query"
    )
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
