from django.shortcuts import render
from django.http import HttpResponse
from django import forms
from django.conf import settings

import md5s3stash
import operator
import math
import solr
import re
import urllib2
import simplejson as json

FACET_TYPES = [('type_ss', 'Type of Object'), ('repository_name', 'Institution Owner'), ('collection_name', 'Collection')]
SOLR = solr.Solr(
    settings.SOLR_URL,
    post_headers={'x-api-key': settings.SOLR_API_KEY},
)


def md5_to_http_url(md5):
    return md5s3stash.md5_to_http_url(md5, 'ucldc')

def process_media(item):
    if 'reference_image_md5' in item:
        # md5_to_http_url(item['reference_image_md5'])
        item['reference_image_http'] = settings.THUMBNAIL_URL + 'clip/178x100/' + item['reference_image_md5']
    elif 'url_item' in item:
        item['reference_image_http'] = "http://www.calisphere.universityofcalifornia.edu/images/misc/no_image1.gif"
    
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

def itemView(request, item_id=''):
    item_id = 'id:' + "\"" + item_id + "\""
    
    if request.method == 'POST' and 'q' in request.POST:
        q = request.POST['q']
        rows = 6
        start = request.POST['start'] if 'start' in request.POST else '0'
        
        filters = dict((filter_type[0], request.GET.getlist(filter_type[0])) for filter_type in FACET_TYPES)
        fq = solrize_filters(filters)
        
        solr_search = SOLR.select(
            q=q,
            rows='6',
            start=start,
            fq=fq
        )
        
        for item in solr_search.results:
            process_media(item)
        
        carousel_items = solr_search.results
        numFound = solr_search.numFound
    else:
        # MORE LIKE THIS RESULTS
        q = ''
        carousel_items = {}
        numFound = 0
    
    solr_item = SOLR.select(q=item_id)
    for item in solr_item.results:
        process_media(item)
    
    context = {'q': q, 'docs': solr_item.results, 'carousel': carousel_items, 'numFound': numFound}
    
    return render(request, 'calisphere/item.html', context)

def collectionsExplore(request):
    collections_solr_query = SOLR.select(q='*:*', rows=0, start=0, facet='true', facet_field=['collection'], facet_limit='10')
    solr_collections = collections_solr_query.facet_counts['facet_fields']['collection']
    
    collections = []
    for collection_url in solr_collections:
        collection_api = urllib2.urlopen(collection_url + "?format=json")
        collection_json = collection_api.read()
        collection_details = json.loads(collection_json)
        rows = '4' if collection_details['description'] != '' else '5'
        display_items = SOLR.select(
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

def search(request, collection_id='', institution_id=''):
    if request.method == 'GET' and len(request.GET.getlist('q')) > 0:
        # concatenate query terms from refine query and query box, set defaults
        query_terms = reduce(concat_query, request.GET.getlist('q') + request.GET.getlist('rq'))
        rows = request.GET['rows'] if 'rows' in request.GET else '16'
        start = request.GET['start'] if 'start' in request.GET else '0'
        view_format = request.GET['view_format'] if 'view_format' in request.GET else 'thumbnails'
        related_collections_page_number = int(request.GET['rc_page']) if 'rc_page' in request.GET else 0
        
        # for each filter_type tuple ('solr_name', 'Display Name') in the list FACET_TYPES
        # create a dictionary with key solr_name of filter and value list of parameters for that filter
        # {'type': ['image', 'audio'], 'repository_name': [...]}
        filters = dict((filter_type[0], request.GET.getlist(filter_type[0])) for filter_type in FACET_TYPES)
        
        # if collection_id != '':
        #     filters['collection_name'] = [collection_id]
        # if institution_id != '':
        #     filters['institution_name'] = [institution_id]
        
        # define facet fields to retrieve
        facet_fields = list(facet_type[0] for facet_type in FACET_TYPES)
        facet_fields.append('collection')
        
        solr_search = SOLR.select(
            q=query_terms,
            rows=rows,
            start=start,
            fq=solrize_filters(filters),
            facet='true',
            facet_limit='-1',
            facet_field=facet_fields
        )
        
        # except solr.SolrException:
            # TODO: better error handling
            # print solr.SolrException.reason
            # print solr.SolrException.httpcode
            # print solr.SolrException.body
        
        # search performed, process the results
        
        # TODO: no results found page
        if len(solr_search.results) == 0:
            print 'no results found'
        
        for item in solr_search.results:
            process_media(item)
        
        # get facet counts
        facets = {}
        for facet_type in facet_fields:
            if facet_type in filters and len(filters[facet_type]) > 0:
                # other_filters is all the filters except the ones of the current filter type
                other_filters = {key: value for key, value in filters.items()
                    if key != facet_type}
                other_filters[facet_type] = []
                
                # perform the exact same search, but as though no filters of this type have been selected
                # to obtain the counts for facets for this facet type
                facet_solr_search = SOLR.select(
                    q=query_terms,
                    rows='0',
                    fq=solrize_filters(other_filters),
                    facet='true',
                    facet_limit='-1',
                    facet_field=[facet_type]
                )
                
                facets[facet_type] = process_facets(
                    facet_solr_search.facet_counts['facet_fields'][facet_type],
                    filters[facet_type]
                )
            else:
                facets[facet_type] = process_facets(
                    solr_search.facet_counts['facet_fields'][facet_type],
                    filters[facet_type] if facet_type in filters else []
                )
        
        # get first three related collections
        related_collections = list(facet for facet, count in facets['collection_name'])
        
        return render(request, 'calisphere/searchResults.html', {
            'q': request.GET['q'],
            'rq': request.GET.getlist('rq'),
            'filters': filters,
            'rows': rows,
            'start': start,
            'search_results': solr_search.results,
            'facets': facets,
            'FACET_TYPES': FACET_TYPES,
            'numFound': solr_search.numFound,
            'pages': int(math.ceil(float(solr_search.numFound)/int(rows))),
            'view_format': view_format,
            'related_collections': relatedCollections(query_terms, related_collections, filters, related_collections_page_number),
            'rc_page': related_collections_page_number
        })
        
        # return render (request, 'calisphere/home.html', {'q': q})
    
    return render (request, 'calisphere/home.html', {'q': ''})

def relatedCollections(query_terms, related_collections, filters=[], page=0):
    print filters
    filters = {key: value for key, value in filters.items()
        if key != 'collection_name'}
    
    three_related_collections = []
    for i in range(page*3, page*3+3):
        if len(related_collections) > i:
            facet = ["collection_name: \"" + related_collections[i] + "\""]
            collection_solr_search = SOLR.select(q=query_terms, rows='3', fq=facet, fields='collection, reference_image_md5, url_item, id, title')
            
            if len(collection_solr_search.results) > 0:
                if 'collection' in collection_solr_search.results[0] and len(collection_solr_search.results[0]['collection']) > 0:
                    collection = collection_solr_search.results[0]['collection'][0]
                    
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
                        
                    collection_url = collection_solr_search.results[0]['collection'][0] + "?format=json"
                    collection_json = urllib2.urlopen(collection_url).read()
                    collection_details = json.loads(collection_json)
                    
                    collection_data['name'] = collection_details['name']
                    collection_data['resource_uri'] = collection_details['resource_uri']
                    col_id = re.match(r'^/api/v1/collection/(?P<collection_id>\d+)/$', collection_details['resource_uri'])
                    collection_data['collection_id'] = col_id.group('collection_id')
                    
                    collection_data['institution'] = ''
                    for repository in collection_details['repository']:
                        for campus in repository['campus']:
                            collection_data['institution'] = collection_data['institution'] + campus['name'] + ', '
                            collection_data['institution'] = collection_data['institution'] + repository['name'] + ', '
                    
                    three_related_collections.append(collection_data)
    
    return three_related_collections

def collectionView(request, collection_id):
    if request.method == 'GET':
        q = reduce(concat_query, request.GET.getlist('q')) if 'q' in request.GET else '*:*'
        rows = request.GET['rows'] if 'rows' in request.GET else '16'
        start = request.GET['start'] if 'start' in request.GET else '0'
        view_format = request.GET['view_format'] if 'view_format' in request.GET else 'thumbnails'
        
        collection_url = 'https://registry.cdlib.org/api/v1/collection/' + collection_id + '/?format=json'
        collection_json = urllib2.urlopen(collection_url).read()
        collection_details = json.loads(collection_json)
        
        filters = dict((filter_type[0], request.GET.getlist(filter_type[0])) for filter_type in FACET_TYPES)
        filters['collection_name'] = [collection_details['name']]
        fq = solrize_filters(filters)
        
        # perform the search
        solr_response = SOLR.select(
            q=q,
            rows=rows,
            start=start,
            fq=fq,
            facet='true',
            facet_field=list(facet_type[0] for facet_type in FACET_TYPES)
        )
        
        for item in solr_response.results:
            if 'reference_image_md5' in item:
                item['reference_image_http'] = md5_to_http_url(item['reference_image_md5'])
            
        facets = {}
        for facet_type in FACET_TYPES:
            facets[facet_type[0]] = process_facets(
                solr_response.facet_counts['facet_fields'][facet_type[0]],
                filters[facet_type[0]]
            )
        
        return render(request, 'calisphere/collectionResults.html', {
            'q': q,
            'filters': filters,
            'rows': rows,
            'start': start,
            'search_results': solr_response.results,
            'facets': facets,
            'FACET_TYPES': FACET_TYPES,
            'numFound': solr_response.numFound,
            'pages': int(math.ceil(float(solr_response.numFound)/int(rows))),
            'view_format': view_format,
            'collection': collection_details
        })
    
    return render(request, 'calisphere/searchResults.html', {'yay': 'yamy'})


def pjaxTest(request):
    return render(request, 'calisphere/pjaxTest.html', {'context': 'test'})

def pjaxHello(request):
    return render(request, 'calisphere/pjaxHello.html', {'context': 'hello'})
