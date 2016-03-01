from django.shortcuts import render
from django.http import HttpResponse

def exhibitView(request):
    return HttpResponse("Hello, world. You're at the exhibit index.")

# Create your views here.
# def exhibitView(request, exhibit_id=0, item_id=''):
#     context = {
#         'title': "Native Americans in California: Pre-Columbian Period to 18th Century",
#         'blockquote': "More than 200 different native tribes - about 300,000 people - once made up the population of the land that is today the state of California.",
#         'hero_img': "",
#         'exhibition_items': [
#             {'id': "ark:/13030/tf0779p0bz"},
#             {'id': "ark:/13030/tf0b69n9ws"},
#             {'id': "ark:/13030/tf6p3008w7"},
#             {'id': "ark:/13030/tf3m3nb5ht"},
#             {'id': "ark:/13030/tf667nb6r7"},
#             {'id': "ark:/13030/tf3h4nb6hn"},
#             {'id': "ark:/13030/kt809nd0gr"},
#             {'id': "ark:/13030/tf6p30065d"},
#             {'id': "ark:/13030/kt9199q6g6"},
#             {'id': "ark:/13030/tf4q2nb7m9"},
#         ],
#         'essay': "<h2>Where They Lived</h2><p>More than 200 different native tribes - about 300,000 people - once made up the population of the land that is today the state of California. Diverse in culture and way of life, they lived in hundreds of small, politically autonomous communities up and down the state, connected by trade and kinship networks. Two maps show the general range of these tribes throughout the entire area. The map of Pomo linguistic stock shows many dialect variations and village sites, demonstrating the complexity of language variations in just one tribal group.</p><h2>How They Lived</h2><p>Most California native communities consisted of between 200 and 500 people. Boundaries were general. Nomadic groups tended to have greater social and gender equality, while more sedentary groups had hierarchical social classes with a wide gulf between rich and poor.</p><p>Although artwork by European artists depicts some aspects of California Indian life, we have no images from pre-Columbian California. The lithographs shown here, by Russian artist Ludwig Choris, were based on sketches he created during a visit to California in 1816 - long after their traditional way of life had been disrupted.</p><p>It is possible to get glimpses of their lives, but it is impossible to know how these tribes really looked and lived, as opposed to how they were viewed through European eyes. For example, because native groups usually altered the landscape in a way that mimicked nature, Europeans mistakenly assumed natives lived in an untouched &quot;wilderness.&quot; But whether they lived in mountains, valleys, deserts, forests, or beaches, native peoples continually managed their environment, tending and cultivating the land through controlled burnings, weeding, pruning, tilling, irrigation, and selective replanting.</p>",
#         'asides': [
#             {
#                 'title': "Note about picture captions",
#                 'content': "<p>The original captions on some of the historical photographs may include racial terms that were commonplace at the time, but considered to be derogatory today.</p><p>Few native artifacts from pre-Columbian California have persisted into the 21st century. No original images in this topic were created before the early 19th century.</p>"
#             }
#         ],
#         'related_essays': [
#             {'title': "Before 1768: Pre-Columbian California"}
#         ]
#     }
#
#     return render(request, 'exhibits/exhibitView.html', context)
#
# def exhibitItemView(request, item_id=''):
#     item_id_search_term = 'id:"{0}"'.format(item_id)
#     item_solr_search = SOLR_select(q=item_id_search_term)
#     if not item_solr_search.numFound:
#         # second level search
#         def _fixid(id):
#             return re.sub(r'^(\d*--http:/)(?!/)', r'\1/', id)
#         old_id_search = SOLR_select(q='harvest_id_s:{}'.format(_fixid(item_id)))
#         if old_id_search.numFound:
#             return redirect('calisphere:itemView', old_id_search.results[0]['id'])
#         else:
#             raise Http404("{0} does not exist".format(item_id))
#     for item in item_solr_search.results:
#         if 'structmap_url' in item and len(item['structmap_url']) >= 1:
#             item['harvest_type'] = 'hosted'
#             structmap_url = string.replace(item['structmap_url'], 's3://static', 'https://s3.amazonaws.com/static');
#             structmap_data = json_loads_url(structmap_url)
#
#             if 'structMap' in structmap_data:
#                 # complex object
#                 # if parent content file, get it
#                 if 'format' in structmap_data and structmap_data['format'] != 'file':
#                     item['contentFile'] = getHostedContentFile(structmap_data)
#                 # otherwise get first component file
#                 else:
#                     component = structmap_data['structMap'][0]
#                     item['contentFile'] = getHostedContentFile(component)
#             else:
#                 # simple object
#                 if 'format' in structmap_data:
#                     item['contentFile'] = getHostedContentFile(structmap_data)
#         else:
#             item['harvest_type'] = 'harvested'
#             if 'url_item' in item:
#                 if item['url_item'].startswith('http://ark.cdlib.org/ark:'):
#                     item['oac'] = True
#                     item['url_item'] = string.replace(item['url_item'], 'http://ark.cdlib.org/ark:', 'http://oac.cdlib.org/ark:')
#                     item['url_item'] = item['url_item'] + '/?brand=oac4'
#                 else:
#                     item['oac'] = False
#             #TODO: error handling 'else'
#
#         item['parsed_collection_data'] = []
#         item['parsed_repository_data'] = []
#         item['institution_contact'] = []
#         for collection_data in item['collection_data']:
#             item['parsed_collection_data'].append(getCollectionData(collection_data=collection_data))
#         if 'repository_data' in item:
#             for repository_data in item['repository_data']:
#                 item['parsed_repository_data'].append(getRepositoryData(repository_data=repository_data))
#
#                 institution_url = item['parsed_repository_data'][0]['url']
#                 institution_details = json_loads_url(institution_url + "?format=json")
#                 if 'ark' in institution_details and institution_details['ark'] != '':
#                     contact_information = json_loads_url("http://dsc.cdlib.org/institution-json/" + institution_details['ark'])
#                 else:
#                     contact_information = ''
#
#                 item['institution_contact'].append(contact_information)
#
#     meta_image = False
#     if item_solr_search.results[0].get('reference_image_md5', False):
#         meta_image = urlparse.urljoin(
#             settings.UCLDC_FRONT,
#             u'/crop/999x999/{0}'.format(item_solr_search.results[0]['reference_image_md5']),
#         )
#
#     return render (request, 'calisphere/itemViewer.html', {
#         'q': '',
#         'item': item_solr_search.results[0],
#         'item_solr_search': item_solr_search,
#         'meta_image': meta_image,
#     })
#
