from django.shortcuts import render
from django.http import HttpResponse
from django import forms
from django.conf import settings
from django.core.urlresolvers import reverse
from cache_utils.decorators import cached

import md5s3stash
import operator
import math
import solr
import re
import urllib2
import copy
import simplejson as json
from retrying import retry

FACET_TYPES = [('type_ss', 'Type of Object'), ('repository_data', 'Institution Owner'), ('collection_data', 'Collection')]
SOLR = solr.Solr(
    settings.SOLR_URL,
    post_headers={
      'x-api-key': settings.SOLR_API_KEY,
      'X-Authentication-Token': settings.SOLR_API_KEY,
    },
)

class SolrCache(object):
    pass

@cached(60 * 15)
@retry(stop_max_delay=10000)
def SOLR_select(**kwargs):
    # only return that which can be pickled
    sc = SolrCache()
    sr = SOLR.select(**kwargs)
    sc.results = sr.results
    sc.facet_counts = getattr(sr, 'facet_counts', None)
    sc.numFound = sr.numFound
    return sc

def md5_to_http_url(md5):
    return md5s3stash.md5_to_http_url(md5, 'ucldc')

def process_media(item):
    if 'reference_image_md5' in item:
        # md5_to_http_url(item['reference_image_md5'])
        item['reference_image_http'] = settings.THUMBNAIL_URL + 'clip/178x100/' + item['reference_image_md5']
    elif 'url_item' in item:
        item['reference_image_http'] = "http://www.calisphere.universityofcalifornia.edu/images/misc/no_image1.gif"
    else:
        item['reference_image_http'] = ""

    item['href'] = '/itemView/{0}/'.format( item['id'] )

# concat query with 'AND'
def concat_query(q, rq):
    if q == '':
        return rq
    elif rq == '':
        return q
    else:
        return q + ' AND ' + rq

# concat filters with 'OR'
def concat_filters(filters, filter_type):
    # OR-ING FILTERS OF ONE TYPE, YET AND-ING FILTERS OF DIFF TYPES
    fq_contents = filter_type + ': '

    for counter, f in enumerate(filters):
        fq_contents = fq_contents + '"' + f + '"'
        # if not at the last filter term, continue OR-ing together terms
        if counter < len(filters)-1:
            fq_contents = fq_contents + " OR " + filter_type + ': '

    return [fq_contents]

# collect filters into an array
def solrize_filters(filters):
    fq = []
    for filter_type in FACET_TYPES:
        if len(filters[filter_type[0]]) > 0:
            fq.extend(concat_filters(filters[filter_type[0]], filter_type[0]))

    return fq

def process_facets(facets, filters):
    display_facets = dict((facet, count) for facet, count in facets.iteritems() if count != 0)
    display_facets = sorted(display_facets.iteritems(), key=operator.itemgetter(1), reverse=True)

    for f in filters:
        if not any(f in facet for facet in display_facets):
            display_facets.append((f, 0))

    return display_facets

def getCollectionData(collection_data=None, collection_id=None):
    collection = {}
    if collection_data:
        collection['url'] = collection_data.split('::')[0] if len(collection_data.split('::')) >= 1 else ''
        collection_api_url = re.match(r'^https://registry\.cdlib\.org/api/v1/collection/(?P<url>\d*)', collection['url'])
        if collection_api_url is None:
            print 'no collection api url'
            collection['id'] = ''
        else:
            collection['id'] = collection_api_url.group('url')
        collection['name'] = collection_data.split('::')[1] if len(collection_data.split('::')) >= 2 else ''
    elif collection_id:
        collection['url'] = "https://registry.cdlib.org/api/v1/collection/" + collection_id
        collection_url = collection['url'] + "?format=json"
        collection_json = urllib2.urlopen(collection_url).read()
        collection_details = json.loads(collection_json)
        collection['id'] = collection_id
        collection['name'] = collection_details['name']
    return collection

def getRepositoryData(repository_data=None, repository_id=None):
    repository = {}
    if repository_data:
        repository['url'] = repository_data.split('::')[0] if len(repository_data.split('::')) >= 1 else ''
        repository['name'] = repository_data.split('::')[1] if len(repository_data.split('::')) >= 2 else ''
        repository['campus'] = repository_data.split('::')[2] if len(repository_data.split('::')) >= 3 else ''

        repository_api_url = re.match(r'^https://registry\.cdlib\.org/api/v1/repository/(?P<url>\d*)/', repository['url'])
        if repository_api_url is None:
            print 'no repository api url'
            repository['id'] = ''
        else:
            repository['id'] = repository_api_url.group('url')
    elif repository_id:
        repository['url'] = "https://registry.cdlib.org/api/v1/repository/" + repository_id + "/"
        repository['id'] = repository_id

        repository_url = repository['url'] + "?format=json"
        repository_json = urllib2.urlopen(repository_url).read()
        repository_details = json.loads(repository_json)
        repository['name'] = repository_details['name']
        # TODO - don't know how to properly reverse engineer repository_data if there is a campus
        repository['campus'] = ''
    return repository

def processQueryRequest(request):
    # concatenate query terms from refine query and query box, set defaults
    q = request.GET['q'] if 'q' in request.GET else ''
    rq = request.GET.getlist('rq')
    query_terms = reduce(concat_query, request.GET.getlist('q') + request.GET.getlist('rq')) if 'q' in request.GET else ''
    rows = request.GET['rows'] if 'rows' in request.GET else '16'
    start = request.GET['start'] if 'start' in request.GET else '0'
    view_format = request.GET['view_format'] if 'view_format' in request.GET else 'thumbnails'
    rc_page = int(request.GET['rc_page']) if 'rc_page' in request.GET else 0

    # for each filter_type tuple ('solr_name', 'Display Name') in the list FACET_TYPES
    # create a dictionary with key solr_name of filter and value list of parameters for that filter
    # {'type': ['image', 'audio'], 'repository_name': [...]}
    filters = dict((filter_type[0], request.GET.getlist(filter_type[0])) for filter_type in FACET_TYPES)

    # use collection_id and repository_id to retrieve collection_data and repository_data filter values
    for i, filter_item in enumerate(filters['collection_data']):
        collection = getCollectionData(collection_id=filter_item)
        filters['collection_data'][i] = collection['url'] + "::" + collection['name']
    for i, filter_item in enumerate(filters['repository_data']):
        repository = getRepositoryData(repository_id=filter_item)
        filters['repository_data'][i] = repository['url'] + "::" + repository['name']
        if repository['campus'] != '':
            repository = repository + "::" + repository['campus']

    return {
        'q': q,
        'rq': rq,
        'query_terms': query_terms,
        'rows': rows,
        'start': start,
        'view_format': view_format,
        'filters': filters,
        'rc_page': rc_page
    }

def itemView(request, item_id=''):
    item_id_search_term = 'id:' + "\"" + item_id + "\""
    item_solr_search = SOLR_select(q=item_id_search_term)
    for item in item_solr_search.results:
        process_media(item)

    # TODO: write related objects version (else)
    if request.method == 'GET' and len(request.GET.getlist('q')) > 0:
        queryParams = processQueryRequest(request)
        carousel_items = itemViewCarousel(request, queryParams)

        return render(request, 'calisphere/item.html', {
            'items': item_solr_search.results,
            'q': queryParams['q'],
            'rq': queryParams['rq'],
            'filters': queryParams['filters'],
            'rows': queryParams['rows'],
            'start': queryParams['start'],
            'search_results': carousel_items['results'],
            # 'facets': facets,
            'FACET_TYPES': FACET_TYPES,
            'numFound': carousel_items['numFound'],
            'pages': int(math.ceil(float(carousel_items['numFound'])/int(queryParams['rows']))),
            # 'view_format': queryParams['view_format'],
            # 'related_collections': relatedCollections(request, queryParams),
            # 'rc_page': queryParams['rc_page']
        })

        # return render (request, 'calisphere/home.html', {'q': q})

    return render(request, 'calisphere/item.html', {'q': '', 'items': item_solr_search.results})


def search(request):
    if request.method == 'GET' and len(request.GET.getlist('q')) > 0:
        queryParams = processQueryRequest(request)

        # define facet fields to retrieve
        facet_fields = list(facet_type[0] for facet_type in FACET_TYPES)

        solr_search = SOLR_select(
            q=queryParams['query_terms'],
            rows=queryParams['rows'],
            start=queryParams['start'],
            fq=solrize_filters(queryParams['filters']),
            facet='true',
            facet_limit='-1',
            facet_field=facet_fields,
        )

        # except solr.SolrException:
            # TODO: better error handling
            # print solr.SolrException.reason
            # print solr.SolrException.httpcode
            # print solr.SolrException.body

        # search performed, process the results

        # TODO: create a no results found page
        if len(solr_search.results) == 0:
            print 'no results found'

        for item in solr_search.results:
            process_media(item)

        # get facet counts
        facets = {}
        for facet_type in facet_fields:
            if facet_type in queryParams['filters'] and len(queryParams['filters'][facet_type]) > 0:
                # other_filters is all the filters except the ones of the current filter type
                other_filters = {key: value for key, value in queryParams['filters'].items()
                    if key != facet_type}
                other_filters[facet_type] = []

                # perform the exact same search, but as though no filters of this type have been selected
                # to obtain the counts for facets for this facet type
                facet_solr_search = SOLR_select(
                    q=queryParams['query_terms'],
                    rows='0',
                    fq=solrize_filters(other_filters),
                    facet='true',
                    facet_limit='-1',
                    facet_field=[facet_type]
                )

                facets[facet_type] = process_facets(
                    facet_solr_search.facet_counts['facet_fields'][facet_type],
                    queryParams['filters'][facet_type]
                )
            else:
                facets[facet_type] = process_facets(
                    solr_search.facet_counts['facet_fields'][facet_type],
                    queryParams['filters'][facet_type] if facet_type in queryParams['filters'] else []
                )

        for i, facet_item in enumerate(facets['collection_data']):
            collection = (getCollectionData(collection_data=facet_item[0]), facet_item[1])
            facets['collection_data'][i] = collection
        for i, facet_item in enumerate(facets['repository_data']):
            repository = (getRepositoryData(repository_data=facet_item[0]), facet_item[1])
            facets['repository_data'][i] = repository

        filter_display = {}
        for filter_type in queryParams['filters']:
            if filter_type == 'collection_data':
                filter_display['collection_data'] = []
                for filter_item in queryParams['filters'][filter_type]:
                    collection = getCollectionData(collection_data=filter_item)
                    filter_display['collection_data'].append(collection)
            elif filter_type == 'repository_data':
                filter_display['repository_data'] = []
                for filter_item in queryParams['filters'][filter_type]:
                    repository = getRepositoryData(repository_data=filter_item)
                    filter_display['repository_data'].append(repository)
            else:
                filter_display[filter_type] = copy.copy(queryParams['filters'][filter_type])

        return render(request, 'calisphere/searchResults.html', {
            'q': queryParams['q'],
            'rq': queryParams['rq'],
            'filters': filter_display,
            'rows': queryParams['rows'],
            'start': queryParams['start'],
            'search_results': solr_search.results,
            'facets': facets,
            'FACET_TYPES': FACET_TYPES,
            'numFound': solr_search.numFound,
            'pages': int(math.ceil(float(solr_search.numFound)/int(queryParams['rows']))),
            'view_format': queryParams['view_format'],
            'related_collections': relatedCollections(request, queryParams),
            'num_related_collections': len(queryParams['filters']['collection_data']) if len(queryParams['filters']['collection_data']) > 0 else len(facets['collection_data']),
            'rc_page': queryParams['rc_page'],
            'form_action': reverse('calisphere:search')
        })

    return render (request, 'calisphere/home.html', {'q': ''})

def itemViewCarousel(request, queryParams={}):
    if not queryParams:
        if request.method == 'GET' and len(request.GET.getlist('q')) > 0:
            queryParams = processQueryRequest(request)

        ajaxRequest = True
        queryParams['rows'] = 6
    else:
        ajaxRequest = False

    # TODO: getting back way more fields than I really need
    carousel_solr_search = SOLR_select(
        q=queryParams['query_terms'],
        rows=queryParams['rows'],
        start=queryParams['start'],
        fq=solrize_filters(queryParams['filters'])
    )

    # except solr.SolrException:
        # TODO: better error handling
        # print solr.SolrException.reason
        # print solr.SolrException.httpcode
        # print solr.SolrException.body

    # search performed, process the results

    # TODO: create a no results found page
    if len(carousel_solr_search.results) == 0:
        print 'no results found'

    for item in carousel_solr_search.results:
        process_media(item)

    if ajaxRequest:
        return render(request, 'calisphere/carousel.html', {
            'q': queryParams['q'],
            'start': queryParams['start'],
            'numFound': carousel_solr_search.numFound,
            'search_results': carousel_solr_search.results,
        })

    return {'results': carousel_solr_search.results, 'numFound': carousel_solr_search.numFound}

def relatedCollections(request, queryParams={}):
    if not queryParams:
        queryParams = processQueryRequest(request)
        ajaxRequest = True
    else:
        ajaxRequest = False

    # #####################
    # get list of related collections
    # uncomment to get list of related collections disregarding any selected collection filters
    # #####################
    # if 'collection_name' in queryParams['filters'] and len(queryParams['filters']['collection_name']) > 0:
    #     related_collections_filters = {key: value for key, value in queryParams['filters'].items()
    #         if key != 'collection_name'}
    #     related_collections_filters['collection_name'] = []
    # else:
    related_collections_filters = queryParams['filters']

    related_collections_solr_search = SOLR_select(
        q=queryParams['query_terms'],
        rows='0',
        fq=solrize_filters(related_collections_filters),
        facet='true',
        facet_limit='-1',
        facet_field=['collection_data']
    )

    # remove collections with a count of 0 and sort by count
    related_collections_counts = process_facets(
        related_collections_solr_search.facet_counts['facet_fields']['collection_data'],
        queryParams['filters']['collection_data'] if 'collection_data' in queryParams['filters'] else []
    )

    # remove 'count'
    related_collections = list(facet for facet, count in related_collections_counts)

    three_related_collections = []
    for i in range(queryParams['rc_page']*3, queryParams['rc_page']*3+3):
        if len(related_collections) > i:
            facet = ["collection_data: \"" + related_collections[i] + "\""]
            collection_solr_search = SOLR_select(q=queryParams['query_terms'], rows='3', fq=facet, fields='collection_data, reference_image_md5, url_item, id, title')

            if len(collection_solr_search.results) > 0:
                if 'collection_data' in collection_solr_search.results[0] and len(collection_solr_search.results[0]['collection_data']) > 0:
                    collection = collection_solr_search.results[0]['collection_data'][0]

                    collection_data = {'image_urls': []}
                    for item in collection_solr_search.results:
                        process_media(item)
                        if 'reference_image_md5' in item:
                            collection_data['image_urls'].append({
                                'title': item['title'],
                                'reference_image_http': item['reference_image_http'],
                                'reference_image_md5': item['reference_image_md5']
                            })
                        else:
                            collection_data['image_urls'].append({
                                'title': item['title'],
                                'reference_image_http': item['reference_image_http']
                            })
                    collection_url = ''.join([
                        collection.rsplit('::')[0],
                        '?format=json'
                    ])
                    collection_json = urllib2.urlopen(collection_url).read()
                    collection_details = json.loads(collection_json)

                    collection_data['name'] = collection_details['name']
                    collection_data['resource_uri'] = collection_details['resource_uri']
                    col_id = re.match(r'^/api/v1/collection/(?P<collection_id>\d+)/$', collection_details['resource_uri'])
                    collection_data['collection_id'] = col_id.group('collection_id')

                    # TODO: get this from repository_data in solr rather than from the registry API
                    collection_data['institution'] = ''
                    # print collection_details
                    for repository in collection_details['repository']:
                        for campus in repository['campus']:
                            collection_data['institution'] = collection_data['institution'] + campus['name'] + ', '
                            collection_data['institution'] = collection_data['institution'] + repository['name'] + ', '

                    three_related_collections.append(collection_data)

    if not ajaxRequest:
        return three_related_collections
    else:
        return render(request, 'calisphere/related-collections.html', {
            'num_related_collections': len(related_collections),
            'related_collections': three_related_collections,
            'rc_page': queryParams['rc_page']
        })

def collectionsExplore(request):
    collections_solr_query = SOLR_select(q='*:*', rows=0, start=0, facet='true', facet_field=['collection'], facet_limit='10')
    solr_collections = collections_solr_query.facet_counts['facet_fields']['collection']

    collections = []
    for collection_url in solr_collections:
        collection_api = urllib2.urlopen(collection_url + "?format=json")
        collection_json = collection_api.read()
        collection_details = json.loads(collection_json)
        rows = '4' if collection_details['description'] != '' else '5'
        display_items = SOLR_select(
            q='*:*',
            fields='reference_image_md5, title, id',
            rows=rows,
            start=0,
            fq=['collection: \"' + collection_url + '\"']
        )

        for item in display_items:
            if 'reference_image_md5' in item:
                item['reference_image_http'] = md5_to_http_url(item['reference_image_md5'])

        collection_url_pattern = re.compile('https://registry.cdlib.org/api/v1/collection/([0-9]+)[/]?')
        collection_id = collection_url_pattern.match(collection_url)

        collections.append({
            'name': collection_details['name'],
            'description': collection_details['description'],
            'slug': collection_details['slug'],
            'collection_id': collection_id.group(1),
            'display_items': display_items.results
        })

    return render(request, 'calisphere/collections-explore.html', {'collections': collections})

def collectionView(request, collection_id):
    collection_url = 'https://registry.cdlib.org/api/v1/collection/' + collection_id + '/?format=json'
    collection_json = urllib2.urlopen(collection_url).read()
    collection_details = json.loads(collection_json)

    # if request.method == 'GET' and len(request.GET.getlist('q')) > 0:
    queryParams = processQueryRequest(request)
    collection = getCollectionData(collection_id=collection_id)
    queryParams['filters']['collection_data'] = [collection['url'] + "::" + collection['name']]

    facet_fields = list(facet_type[0] for facet_type in FACET_TYPES if facet_type[0] != 'collection_data')

    # perform the search
    solr_search = SOLR_select(
        q=queryParams['query_terms'],
        rows=queryParams['rows'],
        start=queryParams['start'],
        fq=solrize_filters(queryParams['filters']),
        facet='true',
        facet_limit='-1',
        facet_field=facet_fields
    )

    for item in solr_search.results:
        process_media(item)

    facets = {}
    for facet_type in facet_fields:
        if facet_type in queryParams['filters'] and len(queryParams['filters'][facet_type]) > 0:
            # other_filters is all the filters except the ones of the current filter type
            other_filters = {key: value for key, value in queryParams['filters'].items()
                if key != facet_type}
            other_filters[facet_type] = []

            # perform the exact same search, but as though no filters of this type have been selected
            # to obtain the counts for facets for this facet type
            facet_solr_search = SOLR_select(
                q=queryParams['query_terms'],
                rows='0',
                fq=solrize_filters(other_filters),
                facet='true',
                facet_limit='-1',
                facet_field=[facet_type]
            )

            facets[facet_type] = process_facets(
                facet_solr_search.facet_counts['facet_fields'][facet_type],
                queryParams['filters'][facet_type]
            )
        else:
            facets[facet_type] = process_facets(
                solr_search.facet_counts['facet_fields'][facet_type],
                queryParams['filters'][facet_type] if facet_type in queryParams['filters'] else []
            )

    for i, facet_item in enumerate(facets['repository_data']):
        repository = (getRepositoryData(repository_data=facet_item[0]), facet_item[1])
        facets['repository_data'][i] = repository

    filter_display = {}
    for filter_type in queryParams['filters']:
        if filter_type == 'collection_data':
            filter_display['collection_data'] = []
        elif filter_type == 'repository_data':
            filter_display['repository_data'] = []
            for filter_item in queryParams['filters'][filter_type]:
                repository = getRepositoryData(repository_data=filter_item)
                filter_display['repository_data'].append(repository)
        else:
            filter_display[filter_type] = copy.copy(queryParams['filters'][filter_type])

    return render(request, 'calisphere/collectionView.html', {
        'q': queryParams['q'],
        'rq': queryParams['rq'],
        'filters': filter_display,
        'rows': queryParams['rows'],
        'start': queryParams['start'],
        'search_results': solr_search.results,
        'facets': facets,
        'FACET_TYPES': list((facet_type[0], facet_type[1]) for facet_type in FACET_TYPES if facet_type[0] != 'collection_data'),
        'numFound': solr_search.numFound,
        'pages': int(math.ceil(float(solr_search.numFound)/int(queryParams['rows']))),
        'view_format': queryParams['view_format'],
        'collection': collection_details,
        'form_action': reverse('calisphere:collectionView', kwargs={'collection_id': collection_id})
    })
