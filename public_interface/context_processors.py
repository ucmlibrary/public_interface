def settings(request):
    """
    Put selected settings variables into the default template context
    """
    from django.conf import settings
    return {
        'thumbnailUrl': settings.THUMBNAIL_URL,
        'devMode': settings.UCLDC_DEVEL,
        'ucldcImages': settings.UCLDC_IMAGES,
    }
