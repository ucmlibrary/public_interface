from django.shortcuts import render
from django.http import HttpResponse
from django import forms

import operator
import math
import solr

FACET_TYPES = [('type', 'Type of Object'), ('repository_name', 'Institution Owner'), ('collection_name', 'Collection')]

def solrize_query(q, rq):
    if q == '':
        return rq
    elif rq == '':
        return q
    else:
        return q + ' AND ' + rq

def solrize_filters(filters, filter_type):
    # fq = []
    # for f in filters:
    #     fq.append(filter_type + ': "' + f + '"')
    # print fq
    
    # TRIAL FOR OR-ING FILTERS OF ONE TYPE, YET AND-ING FILTERS OF DIFF TYPES
    trial = filter_type + ': '
    for counter, f in enumerate(filters):
        trial = trial + '"' + f + '"'
        if counter < len(filters)-1:
            trial = trial + " OR "
    
    return [trial]

def process_facets(facets, filters):
    display_facets = {}
    display_facets = dict((facet, count) for facet, count in facets.iteritems() if count != 0)
    display_facets = sorted(display_facets.iteritems(), key=operator.itemgetter(1), reverse=True)
    for f in filters:
        if not any(f in facet for facet in display_facets):
            display_facets.append((f, 0))
    return display_facets

def search(request):
    if request.method == 'GET':
        # concatenate query and refine query form fields
        if len(request.GET.getlist('q')) > 1:
            q = reduce(solrize_query, request.GET.getlist('q'))
        else: 
            q = request.GET['q']
        
        rows = request.GET['rows'] if 'rows' in request.GET else '16'
        start = request.GET['start'] if 'start' in request.GET else '0'
        view_format = request.GET['view_format'] if 'view_format' in request.GET else 'thumbnails'
        
        filters = dict((filter_type[0], request.GET.getlist(filter_type[0])) for filter_type in FACET_TYPES)
        # make filter form fields solr search friendly
        fq = []
        for filter_type in FACET_TYPES:
            if len(filters[filter_type[0]]) > 0:
                fq.extend(solrize_filters(filters[filter_type[0]], filter_type[0]))
        
        print q
        
        # perform the search
        s = solr.Solr('http://107.21.228.130:8080/solr/dc-collection')
        solr_response = s.select(
            q=q,
            rows=rows,
            start=start,
            fq=fq,
            facet='true', 
            facet_field=list(facet_type[0] for facet_type in FACET_TYPES)
        )
        
        facets = {}
        for facet_type in FACET_TYPES:
            facets[facet_type[0]] = process_facets(
                solr_response.facet_counts['facet_fields'][facet_type[0]], 
                filters[facet_type[0]]
            )
        
        return render(request, 'public_interface/searchResults.html', {
            'q': q,
            'filters': filters,
            'rows': rows,
            'start': start,
            'search_results': solr_response.results,
            'facets': facets,
            'FACET_TYPES': FACET_TYPES,
            'numFound': solr_response.numFound,
            'pages': int(math.ceil(float(solr_response.numFound)/int(rows))),
            'view_format': view_format
        })
        
    return render (request, 'public_interface/base.html', {'q': ''})

def home(request):
    return render(request, 'public_interface/base.html', {'q': ''})

def objectView(request, object_id=''):
    s = solr.Solr('http://107.21.228.130:8080/solr/dc-collection')
    
    if request.method == 'POST':
        object_id = 'id:' + "\"" + request.POST['object_id'] + "\""
        
        q = request.POST['q'] if 'q' in request.POST else ''
        start = request.POST['start'] if 'start' in request.POST else '0'
        
        filters = dict((filter_type[0], request.POST.getlist(filter_type[0])) for filter_type in FACET_TYPES)
        # make filter form fields solr search friendly
        fq = []
        for filter_type in FACET_TYPES:
            if len(filters[filter_type[0]]) > 0:
                fq.extend(solrize_filters(filters[filter_type[0]], filter_type[0]))
        
        solr_response = s.select(
            q=q,
            rows='6',
            start=start,
            fq=fq
        )
    else:
        solr_response = {'results': ''}
        q = object_id
    
    solr_object = s.select(q=object_id)
    
    context = {'q': q, 'docs': solr_object.results, 'carousel': solr_response.results, 'numFound': solr_response.numFound}
    
    return render(request, 'public_interface/object.html', context)

