/*global _, QueryManager, GlobalSearchForm, FacetForm, CarouselContext, ComplexCarousel, ContactOwnerForm, OpenSeadragon, tileSources */

/* globals Modernizr: false */
'use strict';

function sessionStorageWarning() {
  if (! Modernizr.sessionstorage) {
    $('body').prepend(
      $('<div/>', {'class': 'container-fluid'})
      .append(
        $('<div/>', {
          'class': 'alert alert-warning alert-dismissible',
          'role': 'alert'
        }).text('Some features on the Calisphere beta site do not yet work in private browsing mode. For an optimal experience, please disable private browsing while on this site.')
        .append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
      )
    );
  }
}

if(typeof console === 'undefined') {
  console = { log: function() { } };
}

$(document).on('pjax:timeout', function() { return false; });

var qm, globalSearchForm, facetForm, carousel, complexCarousel, DESKTOP, contactOwnerForm, viewer, popstate = null;

var setupObjects = function() {
  if ($('#js-facet').length > 0) {
    if (facetForm === undefined) {
      facetForm = new FacetForm({model: qm});
      facetForm.listening = true;
    }
    else if (facetForm.listening === false) {
      facetForm.initialize();
      facetForm.delegateEvents();
      facetForm.listening = true;
    }
    facetForm.toggleSelectDeselectAll();

    // get rid of any visible tooltips
    var visibleTooltips = $('[data-toggle="tooltip"][aria-describedby]');
    for (var i=0; i<visibleTooltips.length; i++) {
      var tooltipId = $(visibleTooltips[i]).attr('aria-describedby');
      $('#' + tooltipId).remove();
    }
    // set tooltips
    $('[data-toggle="tooltip"]').tooltip({
      placement: 'top'
    });
  }
  else if (facetForm !== undefined) {
    facetForm.stopListening();
    facetForm.undelegateEvents();
    facetForm.listening = false;
  }

  if($('#js-carouselContainer').length > 0) {
    if (carousel === undefined) {
      carousel = new CarouselContext({model: qm});
      carousel.listening = true;
    }
    else if (carousel.listening === false) {
      carousel.initialize();
      carousel.delegateEvents();
      carousel.listening = true;
    }
  }
  else if (carousel !== undefined) {
    carousel.stopListening();
    carousel.undelegateEvents();
    carousel.listening = false;
  }

  if($('#js-contactOwner').length > 0) {
    if (contactOwnerForm === undefined) {
      contactOwnerForm = new ContactOwnerForm();
      contactOwnerForm.listening = true;
    }
    else if (contactOwnerForm.listening === false) {
      contactOwnerForm.initialize();
      contactOwnerForm.delegateEvents();
      contactOwnerForm.listening = true;
    }
  } else if (contactOwnerForm !== undefined) {
    contactOwnerForm.stopListening();
    contactOwnerForm.undelegateEvents();
    contactOwnerForm.listening = false;
  }

  if($('.carousel-complex').length > 0) {
    if (complexCarousel === undefined) {
      complexCarousel = new ComplexCarousel({model: qm});
      $('.js-obj__osd-infobanner').show();
      complexCarousel.listening = true;
    }
    else if (complexCarousel.listening === false) {
      complexCarousel.initialize();
      complexCarousel.delegateEvents();
      $('.js-obj__osd-infobanner').show();
      complexCarousel.listening = true;
    } else {
      $('.js-obj__osd-infobanner').hide();
      complexCarousel.initialize();
    }
    //TODO: this should only have to happen once!
    $('.js-obj__osd-infobanner-link').click(function(){
      $('.js-obj__osd-infobanner').slideUp('fast');
    });
  }
  else if (complexCarousel !== undefined) {
    complexCarousel.stopListening();
    complexCarousel.undelegateEvents();
    complexCarousel.listening = false;
  }

  if($('#obj__osd').length > 0) {
    if (viewer !== undefined) {
      viewer.destroy();
      viewer = undefined;
      $('#obj__osd').empty();
    }
    if ($('.openseadragon-container').length > 0) {
      $('.openseadragon-container').remove();
    }
    viewer = new OpenSeadragon({
      id: 'obj__osd',
      tileSources: [tileSources],
      zoomInButton: 'obj__osd-button-zoom-in',
      zoomOutButton: 'obj__osd-button-zoom-out',
      homeButton: 'obj__osd-button-home',
      fullPageButton: 'obj__osd-button-fullscreen'
    });
  }
  else if (viewer !== undefined) {
    viewer.destroy();
    viewer = undefined;
  }

  //if we've gotten to a page with a list of collection mosaics, init infinite scroll
  //TODO: change reference to localhost!
  if($('#js-mosaicContainer').length > 0) {
    $('#js-mosaicContainer').infinitescroll({
      navSelector: '#js-collectionPagination',
      nextSelector: '#js-collectionPagination a.js-next',
      itemSelector: '#js-mosaicContainer div.js-collectionMosaic',
      debug: false,
      loading: {
        finishedMsg: 'All collections showing.',
        img: 'http://calisphere.cdlib.org/static_root/images/orange-spinner.gif',
        msgText: '',
        selector: '#js-loading'
      }
    });
  }
};

$(document).ready(function() {
  sessionStorageWarning();
  if (!$('.home').length) {
    if ($(window).width() > 900) { DESKTOP = true; }
    else { DESKTOP = false; }

    $.pjax.defaults.timeout = 5000;
    $(document).pjax('a[data-pjax=js-pageContent]', '#js-pageContent');

    qm = new QueryManager();
    globalSearchForm = new GlobalSearchForm({model: qm});
    setupObjects();

    $('#js-global-header-logo').on('click', function() {
      if (!_.isEmpty(qm.attributes) || !_.isEmpty(sessionStorage)) {
        qm.clear({silent: true});
      }
    });

    $(document).on('pjax:beforeSend', '#js-itemContainer', function(e, xhr, options) {
      if (options.container === '#js-itemContainer') {
        xhr.setRequestHeader('X-From-Item-Page', 'true');
      }
    });

    $(document).on('pjax:beforeReplace', '#js-pageContent', function() {
      if($('#js-mosaicContainer').length > 0) {
        $('#js-mosaicContainer').infinitescroll('destroy');
      }
    });

    $(document).on('pjax:end', '#js-itemContainer', function() {
      var lastItem = $('.carousel__item--selected');
      if (lastItem.children('a').data('item_id') !== qm.get('itemId')) {
        lastItem.find('.carousel__image--selected').toggleClass('carousel__image');
        lastItem.find('.carousel__image--selected').toggleClass('carousel__image--selected');
        lastItem.toggleClass('carousel__item');
        lastItem.toggleClass('carousel__item--selected');

        var linkItem = $('.js-item-link[data-item_id="' + qm.get('itemId') + '"]');
        linkItem.find('.carousel__image').toggleClass('carousel__image--selected');
        linkItem.find('.carousel__image').toggleClass('carousel__image');
        linkItem.parent().toggleClass('carousel__item--selected');
        linkItem.parent().toggleClass('carousel__item');
      }
    });

    $(document).on('pjax:end', '#js-pageContent', function() {
      //if we've gotten to a page without search context, clear the query manager
      if($('#js-facet').length <= 0 && $('#js-objectViewport').length <= 0) {
        qm.clear({silent: true});
      }

      if (popstate === 'back' || popstate === 'forward') {
        _.each($('form'), function(form) {
          form.reset();
          if ($(form).attr('id') === 'js-facet' || $(form).attr('id') === 'js-carouselForm') {
            var formAfter = _.map($(form).serializeArray(), function(value) { return [value.name, value.value]; });
            for (var i=0; i<formAfter.length; i++) {
              for (var j=i+1; j<formAfter.length; j++) {
                if (formAfter[i][0] === formAfter[j][0]) {
                  formAfter[i][1] = [formAfter[i][1], formAfter[j][1]];
                  formAfter[i][1] = _.flatten(formAfter[i][1]);
                  formAfter.splice(j, 1);
                  j = j-1;
                }
              }
            }
            formAfter = _.object(formAfter);
            formAfter = _.defaults(formAfter, {type_ss: '', facet_decade: '', repository_data: '', collection_data: ''});

            qm.set(formAfter, {silent: true});
          }
        });
      }

      popstate = null;

      setupObjects();
    });

    $(document).on('pjax:popstate', '#js-pageContent', function(e) {
      popstate = e.direction;
    });

    /* globals NProgress: false */
    $(document).on('pjax:send', function() {
      NProgress.start();
    });

    $(document).on('pjax:complete', function() {
      NProgress.done();
    });
  }
});

$(document).on('pjax:end', function() {
  /* globals FB: false */
  // http://stackoverflow.com/a/11727384/1763984
  if (typeof FB !== 'undefined') {
    FB.XFBML.parse();
  }
  /* globals twttr: false */
  // http://stackoverflow.com/a/15075801/1763984
  if (typeof twttr !== 'undefined') {
    twttr.widgets.load();
  }
});

$(document).on('ready pjax:end', function() {
  // send google analytics on pjax pages
  /* globals ga: false */
  if (typeof ga !== 'undefined') {
    var inst_ga_code = $('[data-ga-code]').data('ga-code');
    var dim1 = $('[data-ga-dim1]').data('ga-dim1');
    var dim2 = $('[data-ga-dim2]').data('ga-dim2');
    var dim3 = Modernizr.sessionstorage.toString();

    ga('set', 'location', window.location.href);
    if (dim1) { ga('set', 'dimension1', dim1); }
    if (dim2) { ga('set', 'dimension2', dim2); }
    if (dim3) { ga('set', 'dimension3', dim3); }
    ga('send', 'pageview');
    if (inst_ga_code) {
      var inst_tracker_name = inst_ga_code.replace(/-/g,'x');
      ga('create', inst_ga_code, 'auto', {'name': inst_tracker_name});
      ga(inst_tracker_name + '.set', 'location', window.location.href);
      if (dim1) { ga(inst_tracker_name + '.set', 'dimension1', dim1); }
      if (dim2) { ga(inst_tracker_name + '.set', 'dimension2', dim2); }
      ga( inst_tracker_name + '.send', 'pageview');
    }
  }

  // collection title search

  /* globals Bloodhound: false */
  if ($('#titlesearch__field').length) {
    var collections = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: '/collections/titles.json'
    });
    // chain things to the titlesearch field
    $('#titlesearch__field').typeahead(null, {
      name: 'collections',
      display: 'title',
      limit: 10,
      source: collections
    }).on('keydown', function(event) {
      // disable enter
      // http://stackoverflow.com/a/21318996/1763984
      var x = event.which;
      if (x === 13) {
       event.preventDefault();
      }
    }).bind('typeahead:selected', function(obj, datum) {
      // redirect to the select page
      window.location = datum.uri;
    });
  } // end title search
});

if(!('backgroundBlendMode' in document.body.style)) {
    // No support for background-blend-mode
  var html = document.getElementsByTagName('html')[0];
  html.className = html.className + ' no-background-blend-mode';
}
