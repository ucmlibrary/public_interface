/*global _, QueryManager, GlobalSearchForm */

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

var qm, globalSearchForm, popstate = null;

var setupObjects = function() {
  globalSearchForm.setupComponents();

  $('.obj__heading').dotdotdot({
    ellipsis: '…',
    watch: 'window',
    height: 50,
    lastCharacter: { // remove these characters from the end of the truncated text:
      remove: [ ' ', ',', ';', '.', '!', '?', '[', ']' ]
    }
  });
  $('.thumbnail__caption').dotdotdot({
    ellipsis: '…',
    watch: 'window',
    height: 30,
    lastCharacter: {
      remove: [ ' ', ',', ';', '.', '!', '?', '[', ']' ]
    }
  });
  $('.carousel__thumbnail-caption').dotdotdot({
    ellipsis: '…',
    watch: 'window',
    height: 30,
    lastCharacter: {
      remove: [ ' ', ',', ';', '.', '!', '?', '[', ']' ]
    }
  });

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
        img: '//calisphere.org/static_root/images/orange-spinner.gif',
        msgText: '',
        selector: '#js-loading'
      }
    });
  }
};

$(document).ready(function() {
  sessionStorageWarning();

  // http://stackoverflow.com/questions/5489946/jquery-how-to-wait-for-the-end-of-resize-event-and-only-then-perform-an-ac
  var rtime;
  var timeout = false;
  var delta = 200;
  $(window).resize(function() {
      rtime = new Date();
      if (timeout === false) {
          timeout = true;
          setTimeout(resizeend, delta);
      }
  });

  function resizeend() {
      if (new Date() - rtime < delta) {
          setTimeout(resizeend, delta);
      } else {
          timeout = false;
          if (globalSearchForm !== undefined) {
            globalSearchForm.changeWidth($(window).width());
          }
      }
  }
  // ***********************************

  if (!$('.home').length) {
    $.pjax.defaults.timeout = 5000;
    $(document).pjax('a[data-pjax=js-pageContent]', '#js-pageContent');

    qm = new QueryManager();
    globalSearchForm = new GlobalSearchForm({model: qm});
    setupObjects();

    $(document).on('pjax:beforeSend', '#js-itemContainer', function(e, xhr, options) {
      if (options.container === '#js-itemContainer') {
        xhr.setRequestHeader('X-From-Item-Page', 'true');
      }
    });

    $(document).on('pjax:beforeReplace', '#js-pageContent', globalSearchForm.pjax_beforeReplace);

    $(document).on('pjax:success', function(e, data, x, xhr, z) {
      var start_marker = z.context.find('meta[property=og\\:type]');
      var variable_markup = start_marker.nextUntil($('meta[name=twitter\\:creator]'));
      var old_start = $('head').find('meta[property=og\\:type]');
      old_start.nextUntil($('meta[name=twitter\\:creator]')).remove();
      $.each($(variable_markup).get().reverse(), function(i, v) {
        $(v).insertAfter(old_start);
      });
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

    $(document).on('pjax:end', '#js-exhibit-item__container', function() {
      if(!($('#js-exhibit-item').is(':visible')) && $('#js-exhibit-item__container').children().length > 0) {
        $('#js-exhibit-item').modal();
      } else if ($('#js-exhibit-item__container').children().length <= 0) {
        $('#js-exhibit-item').modal('hide');
      }
    });

    $(document).on('pjax:beforeReplace', '#js-pageContent', function(e) {
      if (e.target !== $('#js-exhibit-item__container')[0] && $('#js-exhibit-item').is(':visible')) {
        $('.modal-backdrop').remove();
        $('body').removeClass('modal-open');
      }
    });

    $(document).on('pjax:beforeSend', '#js-exhibit-item__container', function(e, xhr, options) {
      if (options.container === '#js-exhibit-item__container') {
        xhr.setRequestHeader('X-Exhibit-Item', 'true');
      }
    });

    $(document).on('pjax:end', '#js-pageContent', function() {
      globalSearchForm.pjax_end();

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
