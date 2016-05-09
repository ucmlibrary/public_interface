from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse
from django.core.exceptions import ObjectDoesNotExist
from exhibits.models import *
from itertools import chain
import random

def calCultures(request):
    california_cultures = Theme.objects.filter(title__icontains='California Cultures').order_by('title')
    historical_essays = HistoricalEssay.objects.filter(historicalessaytheme__theme__in=california_cultures).distinct('title')
    lesson_plans = LessonPlan.objects.filter(lessonplantheme__theme__in=california_cultures).distinct('title')

    return render(request, 'exhibits/calCultures.html', {
        'california_cultures': california_cultures, 
        'historical_essays': historical_essays,
        'lesson_plans': lesson_plans
    })

def exhibitRandom(request):
    exhibits = Exhibit.objects.all()
    themes = Theme.objects.all()
    exhibit_theme_list = list(chain(exhibits, themes))
    random.shuffle(exhibit_theme_list)

    exhibit_theme_list_by_fives = []
    sublist = []
    count = 0
    
    print len(exhibit_theme_list)
    for item in exhibit_theme_list:
        if count < 4:
            sublist.append(item)
            if isinstance(item, Exhibit):
                count += 1
            if isinstance(item, Theme):
                count += 2
        elif count < 5:
            if isinstance(item, Exhibit):
                sublist.append(item)
                count += 1
            # if isinstance(item, Theme):
        else: 
            count = 0         
            exhibit_theme_list_by_fives.append(sublist)
            print sublist
            sublist = []
    
    print exhibit_theme_list_by_fives
        
    return render(request, 'exhibits/exhibitRandomExplore.html', {'sets': exhibit_theme_list})

def exhibitDirectory(request):
    if request.method == 'GET' and len(request.GET.getlist('title')) > 0:
        exhibits = Exhibit.objects.filter(title__icontains=request.GET['title'])
    else: 
        exhibits = Exhibit.objects.all().order_by('title')
    
    return render(request, 'exhibits/exhibitDirectory.html', {'exhibits': exhibits})

def themeDirectory(request):
    jarda = Theme.objects.get(slug='jarda')
    california_cultures = Theme.objects.filter(title__icontains='California Cultures').order_by('title')
    california_history = Theme.objects.exclude(title__icontains='California Cultures').exclude(slug='jarda')
    return render(request, 'exhibits/themeDirectory.html', {'jarda': jarda, 'california_cultures': california_cultures, 'california_history': california_history})

def lessonPlanDirectory(request):
    lessonPlans = LessonPlan.objects.all()
    historicalEssays = HistoricalEssay.objects.all()
    return render(request, 'exhibits/for-teachers.html', {'lessonPlans': lessonPlans, 'historicalEssays': historicalEssays})

def itemView(request, exhibit_id, item_id):
    fromExhibitPage = request.META.get("HTTP_X_EXHIBIT_ITEM")
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

def lessonPlanItemView(request, lesson_id, item_id):
    fromLessonPage = request.META.get("HTTP_X_EXHIBIT_ITEM")
    exhibitItem = get_object_or_404(ExhibitItem, item_id=item_id, lesson_plan=lesson_id)
    try:
        nextItem = ExhibitItem.objects.get(lesson_plan=lesson_id, lesson_plan_order=exhibitItem.lesson_plan_order+1)
    except ObjectDoesNotExist:
        nextItem = None
    try:
        prevItem = ExhibitItem.objects.get(lesson_plan=lesson_id, lesson_plan_order=exhibitItem.lesson_plan_order-1)
    except ObjectDoesNotExist:
        prevItem = None

    if fromLessonPage:
        return render(request, 'exhibits/lessonItemView.html', {'exhibitItem': exhibitItem, 'nextItem': nextItem, 'prevItem': prevItem})
    else:
        lesson = LessonPlan.objects.get(pk=lesson_id)
        exhibitItems = lesson.exhibititem_set.all().order_by('lesson_plan_order')
        return render(request, 'exhibits/lessonItemView.html',
        {'lessonPlan': lesson, 'q': '', 'exhibitItems': exhibitItems, 'exhibitItem': exhibitItem, 'nextItem': nextItem, 'prevItem': prevItem})

def exhibitView(request, exhibit_id, exhibit_slug):
    fromExhibitPage = request.META.get("HTTP_X_EXHIBIT_ITEM")
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

def essayView(request, essay_id, essay_slug):
    essay = get_object_or_404(HistoricalEssay, pk=essay_id)
    if essay_slug != essay.slug:
        return redirect(essay)

    return render(request, 'exhibits/essayView.html', {'essay': essay, 'q': ''})

def themeView(request, theme_id, theme_slug):
    theme = get_object_or_404(Theme, pk=theme_id)
    if theme_slug != theme.slug:
        return redirect(theme)

    exhibitListing = theme.exhibittheme_set.all().order_by('order')
    return render(request, 'exhibits/themeView.html', {'theme': theme, 'relatedExhibits': exhibitListing})

def lessonPlanView(request, lesson_id, lesson_slug):
    fromLessonPage = request.META.get("HTTP_X_EXHIBIT_ITEM")
    if fromLessonPage:
        return render(request, 'exhibits/pjaxTemplates/pjax-exhibit-item.html')

    lesson = get_object_or_404(LessonPlan, pk=lesson_id)
    if lesson_slug != lesson.slug:
        return redirect(lesson)

    exhibitItems = lesson.exhibititem_set.all().order_by('lesson_plan_order')
    return render(request, 'exhibits/lessonPlanView.html', {'lessonPlan': lesson, 'q': '', 'exhibitItems': exhibitItems})
