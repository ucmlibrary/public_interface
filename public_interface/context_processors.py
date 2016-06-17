import urlparse

def settings(request):
    """
    Put selected settings variables into the default template context
    """
    from django.conf import settings
    # http://stackoverflow.com/a/2506425/1763984
    permalink = u'?'.join([
        urlparse.urljoin(settings.UCLDC_FRONT, request.path),
        request.META['QUERY_STRING']
    ])
    return {
        'thumbnailUrl': settings.THUMBNAIL_URL,
        'devMode': settings.UCLDC_DEVEL,
        'ucldcWalkMe': settings.UCLDC_WALKME,
        'ucldcImages': settings.UCLDC_IMAGES,
        'ucldcMedia': settings.UCLDC_MEDIA,
        'ucldcIiif': settings.UCLDC_IIIF,
        'ucldcNuxeoThumbs': settings.UCLDC_NUXEO_THUMBS,
        'gaSiteCode': settings.GA_SITE_CODE,
        'contactFlag': settings.CONTRUBUTOR_CONTACT_FLAG,
        'permalink': permalink,
        'q': '',
        'page': None,
        'meta_image': None,
        'campus_slug': None,
        'form_action': None,
        'numFound': None,
        'prev_page': None,
        'next_page': None,
        'featuredImage': None,
        'themedCollections': None,
        'collection_q': None,
        'alphabet': None,
        'referral': None,
        'exhibitMedia': settings.MEDIA_URL
    }

