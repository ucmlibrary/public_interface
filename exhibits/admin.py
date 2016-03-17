from django.contrib import admin

# Register your models here.

from models import *

class ExhibitItemInline(admin.TabularInline):
    model = ExhibitItem
    fields = ['order', 'item_id', 'render_as', 'essay']
    extra = 0

class NotesItemInline(admin.TabularInline):
    model = NotesItem
    fields = ['order', 'title', 'render_as', 'essay']
    verbose_name = 'Note'
    extra = 0

class HistoricalEssayExhibitInline(admin.TabularInline):
    model = HistoricalEssayExhibit
    fields = ['order', 'historicalEssay']
    extra = 0

class LessonPlanExhibitInline(admin.TabularInline):
    model = LessonPlanExhibit
    fields = ['order', 'lessonPlan']
    extra = 0

class ThemeExhibitInline(admin.TabularInline):
    model = ExhibitTheme
    fields = ['theme']
    verbose_name = 'Theme'
    extra = 0

class ExhibitAdmin(admin.ModelAdmin):
    fieldsets = [
        (None,                  {'fields': [('title', 'slug'), ('hero', 'blockquote')]}),
        ('Exhibit Overview',    {'fields': [('essay', 'render_as')], 'classes': ['collapse']}),
        ('About this Exhibit',  {'fields': ['about_exhibit'], 'classes': ['collapse']}),
        ('Publish',             {'fields': [('publish', 'color')]})
    ]
    inlines = [ExhibitItemInline, NotesItemInline, ThemeExhibitInline, HistoricalEssayExhibitInline, LessonPlanExhibitInline]
    list_display = ('title', 'publish')
    prepopulated_fields = {'slug': ['title']}

class ExhibitThemeInline(admin.TabularInline):
    model = ExhibitTheme
    fields = ['order', 'exhibit']
    extra = 0

class HistoricalEssayThemeInline(admin.TabularInline):
    model = HistoricalEssayTheme
    fields = ['order', 'historicalEssay']
    extra = 0

class LessonPlanThemeInline(admin.TabularInline):
    model = LessonPlanTheme
    fields = ['order', 'lessonPlan']
    extra = 0



class BrowseTermInline(admin.TabularInline):
    model = BrowseTerm
    fields = ['order', 'link_text', 'link_location']
    extra = 0

class BrowseTermGroupAdmin(admin.ModelAdmin):
    inlines = [BrowseTermInline]

class BrowseTermGroupInline(admin.TabularInline):
    model = BrowseTermGroup
    fields = ['order', 'group_title', 'group_note']
    extra = 0

class ThemeAdmin(admin.ModelAdmin):
    fieldsets = [
        (None,                  {'fields': [('title', 'slug'), ('hero', 'color')]}),
        ('Theme Overview',      {'fields': [('essay', 'render_as')], 'classes': ['collapse']}),
        ('About this Theme',    {'fields': ['about_theme'], 'classes': ['collapse']})
    ]
    inlines = [ExhibitThemeInline, HistoricalEssayThemeInline, LessonPlanThemeInline, BrowseTermGroupInline]
    prepopulated_fields = {'slug': ['title']}

admin.site.register(Exhibit, ExhibitAdmin)
admin.site.register(Theme, ThemeAdmin)
admin.site.register(HistoricalEssay)
admin.site.register(LessonPlan)
admin.site.register(BrowseTermGroup, BrowseTermGroupAdmin)