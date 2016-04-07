from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.db import models
from positions.fields import PositionField
from calisphere.cache_retry import SOLR_select, SOLR_raw, json_loads_url
from django.core.urlresolvers import reverse
from calisphere.views import getCollectionData, getRepositoryData
from django.conf import settings

# only if you need to support python 2: 
from django.utils.encoding import python_2_unicode_compatible

RENDERING_OPTIONS = (
    ('H', 'HTML'),
    ('T', 'Plain Text'),
    ('M', 'Markdown')
)

# class ImageArk(models.Model):
#     hero = models.ImageField(blank=True, verbose_name='Hero Image', upload_to='uploads/')
#     lockup_derivative = models.ImageField(blank=True, verbose_name='Lockup Image', upload_to='uploads/')
#     alternate_lockup_derivative = models.ImageField(blank=True, verbose_name='Alternate Lockup Image', upload_to='uploads/')
#     item_id = models.CharField(blank=True, max_length=200)
#
#     def __str__(self):
#         return self.item_id

class Exhibit(models.Model):
    title = models.CharField(max_length=512)
    slug = models.SlugField(max_length=255, unique=True)
    short_title = models.CharField(max_length=255, blank=True)
    blockquote = models.CharField(max_length=512, blank=True)     #default for blockquote is first sentence of essay
    byline = models.TextField(blank=True)
    byline_render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H')
    overview = models.TextField(verbose_name='Exhibit Overview', blank=True)
    render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H')
    publish = models.BooleanField(verbose_name='Ready for publication?', default=False)
    color = models.CharField(max_length=20, blank=True)
    scraped_from = models.CharField(max_length=250, blank=True)

    hero = models.ImageField(blank=True, verbose_name='Hero Image', upload_to='uploads/', null=True)
    lockup_derivative = models.ImageField(blank=True, null=True, verbose_name='Lockup Image', upload_to='uploads/')
    alternate_lockup_derivative = models.ImageField(blank=True, null=True, verbose_name='Alternate Lockup Image', upload_to='uploads/')
    item_id = models.CharField(blank=True, max_length=200)

    meta_description = models.CharField(max_length=255, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('exhibits:exhibitView', kwargs={'exhibit_id': self.id, 'exhibit_slug': self.slug})

class HistoricalEssay(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=255, unique=True)

    hero = models.ImageField(blank=True, verbose_name='Hero Image', upload_to='uploads/', null=True)
    lockup_derivative = models.ImageField(blank=True, null=True, verbose_name='Lockup Image', upload_to='uploads/')
    alternate_lockup_derivative = models.ImageField(blank=True, null=True, verbose_name='Alternate Lockup Image', upload_to='uploads/')
    item_id = models.CharField(blank=True, max_length=200)

    blockquote = models.CharField(max_length=200, blank=True)
    essay = models.TextField(blank=True)
    render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H')
    
    byline = models.TextField(blank=True)
    byline_render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H', verbose_name='Render byline as')
    go_further = models.TextField(blank=True)
    go_further_render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H', verbose_name='Render as')
    
    publish = models.BooleanField(verbose_name='Ready for publication?', default=False)
    color = models.CharField(max_length=20, blank=True, help_text="Please provide color in <code>#xxx</code>, <code>#xxxxxx</code>, <code>rgb(xxx,xxx,xxx)</code>, or <code>rgba(xxx,xxx,xxx,x.x)</code> formats.")
    meta_description = models.CharField(max_length=255, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    
    def get_absolute_url(self):
        return reverse('exhibits:essayView', kwargs={'essay_slug': self.slug})

    def __str__(self):
        return self.title

class LessonPlan(models.Model):
    title = models.CharField(max_length=200)
    sub_title = models.CharField(max_length=512, blank=True)
    slug = models.SlugField(max_length=255, unique=True)
    overview = models.TextField(blank=True)
    render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H')
    lesson_plan = models.FileField(blank=True, verbose_name='Lesson Plan File', upload_to='uploads/')
    grade_level = models.CharField(max_length=200, blank=True)
    byline = models.TextField(blank=True)
    byline_render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H')
    
    publish = models.BooleanField(verbose_name='Ready for publication?', default=False)
    meta_description = models.CharField(max_length=255, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('exhibits:lessonPlanView', kwargs={'lesson_slug': self.slug})

class Theme(models.Model): 
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=255, unique=True)
    color = models.CharField(max_length=20, blank=True)
    byline = models.TextField(blank=True)
    byline_render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H')
    essay = models.TextField(blank=True, verbose_name='Theme overview')
    render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H')
    
    hero = models.ImageField(blank=True, verbose_name='Hero Image', upload_to='uploads/')
    lockup_derivative = models.ImageField(blank=True, null=True, verbose_name='Lockup Image', upload_to='uploads/')
    alternate_lockup_derivative = models.ImageField(blank=True, null=True, verbose_name='Alternate Lockup Image', upload_to='uploads/')
    item_id = models.CharField(blank=True, max_length=200)

    publish = models.BooleanField(verbose_name='Ready for publication?', default=False)
    meta_description = models.CharField(max_length=255, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)

    def get_absolute_url(self):
        return reverse('exhibits:themeView', kwargs={'theme_id': self.id, 'theme_slug': self.slug})

    def __str__(self):
        return self.title

class ExhibitItem(models.Model):
    item_id = models.CharField(max_length=200)
    exhibit = models.ForeignKey(Exhibit, on_delete=models.CASCADE, blank=True, null=True)
    lesson_plan = models.ForeignKey(LessonPlan, on_delete=models.CASCADE, blank=True, null=True)
    historical_essay = models.ForeignKey(HistoricalEssay, on_delete=models.CASCADE, blank=True, null=True)
    order = PositionField(collection='exhibit')
    lesson_plan_order = PositionField(collection='lesson_plan')
    historical_essay_order = PositionField(collection='historical_essay')
    essay = models.TextField(blank=True, verbose_name='Item-level exhibit information')
    render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='T')

    #lat/long models
    lat = models.FloatField(default=37.8086906)
    lon = models.FloatField(default=-122.2675416)
    place = models.CharField(max_length=512, blank=True)
    exact = models.BooleanField(default=False)
    def __str__(self):
        return self.item_id

    def solrData(self):
        item_id_search_term = 'id:"{0}"'.format(self.item_id)
        item_solr_search = SOLR_select(q=item_id_search_term)
        if len(item_solr_search.results) > 0:
            item = item_solr_search.results[0]

            item['parsed_collection_data'] = []
            item['parsed_repository_data'] = []
            for collection_data in item['collection_data']:
                item['parsed_collection_data'].append(getCollectionData(collection_data=collection_data))
            if 'repository_data' in item:
                for repository_data in item['repository_data']:
                    item['parsed_repository_data'].append(getRepositoryData(repository_data=repository_data))

            return item
        else:
            return None

    def imgUrl(self):
        item_id_search_term = 'id:"{0}"'.format(self.item_id)
        item_solr_search = SOLR_select(q=item_id_search_term)
        if len(item_solr_search.results) > 0:
            item = item_solr_search.results[0]
            return settings.THUMBNAIL_URL + "crop/210x210/" + item['reference_image_md5']
        else:
            return None

class NotesItem(models.Model):
    title = models.CharField(max_length=200)
    exhibit = models.ForeignKey(Exhibit, on_delete=models.CASCADE)
    order = PositionField(collection='exhibit')
    essay = models.TextField(blank=True, verbose_name='Note')
    render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='T')

    def __str__(self):
        return self.title

class BrowseTermGroup(models.Model):
    group_title = models.CharField(max_length=200, blank=True)
    group_note = models.TextField(blank=True)
    render_as = models.CharField(max_length=1, choices=RENDERING_OPTIONS, default='H')
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE)
    order = PositionField(collection='theme')

    def __str__(self):
        return self.group_title

    class Meta:
        ordering = ['order']

class BrowseTerm(models.Model):
    link_text = models.CharField(max_length=200)
    link_location = models.CharField(max_length=500)
    browse_term_group = models.ForeignKey(BrowseTermGroup, on_delete=models.CASCADE)
    order = PositionField(collection='browse_term_group')

    def __str__(self):
        return self.link_text

    class Meta:
        ordering = ['order']


class HistoricalEssayExhibit(models.Model):
    exhibit = models.ForeignKey(Exhibit, on_delete=models.CASCADE)
    historicalEssay = models.ForeignKey(HistoricalEssay, on_delete=models.CASCADE)
    order = PositionField(collection='exhibit')

    class Meta(object):
        unique_together = ('exhibit', 'historicalEssay')
        verbose_name = 'Historical Essay'
        ordering = ['order']

class LessonPlanExhibit(models.Model):
    exhibit = models.ForeignKey(Exhibit, on_delete=models.CASCADE)
    lessonPlan = models.ForeignKey(LessonPlan, on_delete=models.CASCADE)
    order = PositionField(collection='exhibit')

    class Meta(object):
        unique_together = ('exhibit', 'lessonPlan')
        verbose_name = 'Lesson Plan'
        ordering = ['order']

# Exhibits ordered within Themes
class ExhibitTheme(models.Model):
    exhibit = models.ForeignKey(Exhibit, on_delete=models.CASCADE)
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE)
    order = PositionField(collection='theme')

    class Meta(object):
        unique_together = ('exhibit', 'theme')
        verbose_name = 'Exhibit'

class LessonPlanTheme(models.Model):
    lessonPlan = models.ForeignKey(LessonPlan, on_delete=models.CASCADE)
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE)
    order = PositionField(collection='theme')
    
    class Meta(object):
        unique_together = ('lessonPlan', 'theme')
        verbose_name = 'Lesson Plan'
        ordering = ['order']

class HistoricalEssayTheme(models.Model):
    historicalEssay = models.ForeignKey(HistoricalEssay, on_delete=models.CASCADE)
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE)
    order = PositionField(collection='theme')
    
    class Meta(object):
        unique_together = ('historicalEssay', 'theme')
        verbose_name = 'Historical Essay'
        ordering = ['order']