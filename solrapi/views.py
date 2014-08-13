from django.shortcuts import render
from django.http import HttpResponse
from django import forms

import operator
import math
import solr

FACET_TYPES = [('type', 'Type of Object'), ('repository_name', 'Institution Owner'), ('collection_name', 'Collection')]

def solrize_filters(filters, filter_type):
    fq = []
    for f in filters:
        fq.append(filter_type + ': "' + f + '"')
    return fq

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
            q = reduce(lambda x, y: x + " AND " + y, request.GET.getlist('q'))
        else: 
            q = request.GET['q']
        
        filters = dict((filter_type[0], request.GET.getlist(filter_type[0])) for filter_type in FACET_TYPES)
        
        # make filter form fields solr search friendly
        fq = []
        for filter_type in FACET_TYPES:
            if filters[filter_type[0]] > 0:
                fq.extend(solrize_filters(filters[filter_type[0]], filter_type[0]))
        
        # perform the search
        s = solr.Solr('http://107.21.228.130:8080/solr/dc-collection')
        solr_response = s.select(
            q=q, 
            fq=fq,
            facet='true', 
            facet_field=list(facet_type[0] for facet_type in FACET_TYPES),
            rows='16'
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
            'search_results': solr_response.results, 
            'facets': facets,
            'FACET_TYPES': FACET_TYPES,
            'numFound': solr_response.numFound,
            'pages': int(math.ceil(float(solr_response.numFound)/16))
        })
    
    return render (request, 'public_interface/base.html', {'q': ''})

def home(request):
    return render(request, 'public_interface/base.html', {'q': ''})

def objectView(request):
    queryVar = "\"1916-preparedness-day-parade-bombing-1916-1933-pho--http://ark.cdlib.org/ark:/13030/tf0c6007xf\""
    
    s = solr.Solr('http://54.234.57.180:8080/solr/dc-collection')
    rsp = s.select(q='id:' + queryVar, facet='true')
    context = {'params': {'q': queryVar}, 'docs': rsp.results}
    
    return render(request, 'public_interface/object.html', context)

