from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse
from django.core.exceptions import ObjectDoesNotExist
from exhibits.models import *

def exhibitDirectory(request):
    themes = Theme.objects.all()
    exhibits = Exhibit.objects.all()
    return render(request, 'exhibits/exhibitDirectory.html', {'themes': themes, 'exhibits': exhibits})

def lessonPlanDirectory(request):
    lessonPlans = LessonPlan.objects.all()
    historicalEssays = HistoricalEssay.objects.all()
    return render(request, 'exhibits/exhibitDirectory.html', {'themes': lessonPlans, 'exhibits': historicalEssays})

def itemView(request, exhibit_id, item_id):
    fromExhibitPage = request.META.get("HTTP_X_FROM_EXHIBIT_PAGE")
    exhibitItem = get_object_or_404(ExhibitItem, item_id=item_id, exhibit=exhibit_id)
    try:
        nextItem = ExhibitItem.objects.get(exhibit=exhibit_id, order=exhibitItem.order+1)
    except ObjectDoesNotExist:
        nextItem = None
    try:
        prevItem = ExhibitItem.objects.get(exhibit=exhibit_id, order=exhibitItem.order-1)
    except ObjectDoesNotExist:
        prevItem = None

    if fromExhibitPage:
        return render(request, 'exhibits/itemView.html', {'exhibitItem': exhibitItem, 'nextItem': nextItem, 'prevItem': prevItem})
    else:
        exhibit = Exhibit.objects.get(pk=exhibit_id)
        exhibitItems = exhibit.exhibititem_set.all().order_by('order')
        exhibitListing = []
        for theme in exhibit.exhibittheme_set.all():
            exhibitListing.append((theme.theme, theme.theme.exhibittheme_set.exclude(exhibit=exhibit).order_by('order')))
        return render(request, 'exhibits/itemView.html',
        {'exhibit': exhibit, 'q': '', 'exhibitItems': exhibitItems, 'relatedExhibitsByTheme': exhibitListing, 'exhibitItem': exhibitItem, 'nextItem': nextItem, 'prevItem': prevItem})

def exhibitView(request, exhibit_id, exhibit_slug):
    fromExhibitPage = request.META.get("HTTP_X_FROM_EXHIBIT_PAGE")
    if fromExhibitPage:
        return render(request, 'exhibits/pjaxTemplates/pjax-exhibit-item.html')
    exhibit = get_object_or_404(Exhibit, pk=exhibit_id)
    if exhibit_slug != exhibit.slug:
        return redirect(exhibit)
    exhibitItems = exhibit.exhibititem_set.all().order_by('order')
    exhibitListing = []
    for theme in exhibit.exhibittheme_set.all():
        exhibitListing.append((theme.theme, theme.theme.exhibittheme_set.exclude(exhibit=exhibit).order_by('order')))
    return render(request, 'exhibits/exhibitView.html',
    {'exhibit': exhibit, 'q': '', 'exhibitItems': exhibitItems, 'relatedExhibitsByTheme': exhibitListing})

def essayView(request, essay_slug):
    essay = get_object_or_404(HistoricalEssay, slug=essay_slug)
    return render(request, 'exhibits/essayView.html', {'essay': essay, 'q': ''})

def themeView(request, theme_id, theme_slug):
    theme = get_object_or_404(Theme, pk=theme_id)
    exhibitListing = theme.exhibittheme_set.all().order_by('order')
    return render(request, 'exhibits/themeView.html', {'theme': theme, 'relatedExhibits': exhibitListing})

def lessonPlanView(request, lesson_slug):
    lesson = get_object_or_404(LessonPlan, slug=lesson_slug)
    exhibitItems = lesson.exhibititem_set.all().order_by('lesson_plan_order')
    return render(request, 'exhibits/lessonPlanView.html', {'lessonPlan': lesson, 'q': '', 'exhibitItems': exhibitItems})