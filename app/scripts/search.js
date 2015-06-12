"use strict";

/**
 *  @file       search.js
 *  
 *  @author     Amy Wieliczka <amywieliczka [at] berkeley.edu>
 **/

function FacetQuery() {
  this.resultsContainer = "#js-pageContent";
  this.relatedCollectionsContainer = "#js-relatedCollections";
  this.carouselContainer = "#js-carouselContainer";
  this.filters = {}
  this.refineQuery = []
  
  // these two conditionals need to happen not only on document.ready, 
  // but also look for when these elements get added to the page via pjax
  if ($('#js-facet').length > 0) {
    $('#js-facet')[0].reset();
    this.getFormValuesFromDOM();
    this.saveValuesToSession();

    this.bindDomManipulators();
  }
  if ($('#js-relatedCollections').length > 0) {
    this.relatedCollections();
  }
  if ($(this.carouselContainer).length > 0) {
    this.getValuesFromSession();
    this.carousel();
  }

  this.bindSubmitHandlers();
}

// Remove form elements with default values so they don't clutter up the URL path
FacetQuery.prototype.clearDefaultFormValues = function() {
  var refineQueryFields = $('input[form="js-facet"][name="rq"]');
  for (var i=0; i<refineQueryFields.length; i++) {
    if ($(refineQueryFields[i]).val() == '') { $(refineQueryFields[i]).attr('name', ''); }
  }
  if ($('select[form="js-facet"][name="rows"]').val() == '16') { $('select[form="js-facet"][name="rows"]').attr('name', ''); }
  if ($('input[form="js-facet"][name="start"]').val() == '0') { $('input[form="js-facet"][name="start"]').attr('name', ''); }
  if ($('input[form="js-facet"][name="view_format"]').val() == 'thumbnails') { $('input[form="js-facet"][name="view_format"]').attr('name', ''); }
  if ($('select[form="js-facet"][name="sort"]').val() == 'relevance') { $('select[form="js-facet"][name="sort"]').attr('name', ''); }
  if ($('input[form="js-facet"][name="rc_page"]').val() == '0') { $('input[form="js-facet"][name="rc_page"]').attr('name', ''); }
}

// Helpers for retrieving and setting the current state
FacetQuery.prototype.getFormValuesFromDOM = function() {
  if (typeof $('input[form="js-facet"][name="q"]').val() !== 'undefined') { this.query = $('input[form="js-facet"][name="q"]').val(); } 
  if (typeof $('input[form="js-facet"][name="view_format"]').val() !== 'undefined') { this.view_format = $('input[form="js-facet"][name="view_format"]').val(); } 
  if (typeof $('select[form="js-facet"][name="sort"]').val() !== 'undefined') { this.sort = $('select[form="js-facet"][name="sort"]').val(); }
  if (typeof $('select[form="js-facet"][name="rows"]').val() !== 'undefined') { this.rows = $('select[form="js-facet"][name="rows"]').val(); }
  if (typeof $('input[form="js-facet"][name="start"]').val() !== 'undefined') { this.start = $('input[form="js-facet"][name="start"]').val(); }
  
  this.refineQuery = [];
  var queryRefinements = $('input[form="js-facet"][name="rq"]');
  
  for (var i=0; i<queryRefinements.length; i++) {
    var queryRefinement = $(queryRefinements[i]).val();
    if (queryRefinement !== "") {
      this.refineQuery.push(queryRefinement);
    }
  }
  
  this.filters = {};
  var appliedFilters = $('.js-facet:checked');
  for (var i=0; i<appliedFilters.length; i++) {
    var filterType = $(appliedFilters[i]).attr('name');
    var filter = $(appliedFilters[i]).val();
    if (typeof this.filters[filterType] == 'undefined') {
      this.filters[filterType] = [filter];
    } else {
      this.filters[filterType].push(filter);
    }
  }
}

FacetQuery.prototype.saveValuesToSession = function() {
  sessionStorage.clear();
  sessionStorage.setItem('query', this.query);
  if (this.view_format) { sessionStorage.setItem('view_format', this.view_format); }
  if (this.sort) { sessionStorage.setItem('sort', this.sort); }
  if (this.rows) { sessionStorage.setItem('rows', this.rows); }
  if (this.start) { sessionStorage.setItem('start', this.start); }
  if (this.refineQuery.length > 0) { sessionStorage.setItem('refineQuery', JSON.stringify(this.refineQuery)); }
  if (!$.isEmptyObject(this.filters)) { sessionStorage.setItem('filters', JSON.stringify(this.filters)); }
}

FacetQuery.prototype.getValuesFromSession = function() {
  if (sessionStorage.length > 0) {
    this.query = sessionStorage.getItem('query');
    if (sessionStorage.getItem('view_format') !== null) { this.view_format = sessionStorage.getItem('view_format'); }
    if (sessionStorage.getItem('sort') !== null) { this.sort = sessionStorage.getItem('sort'); }
    if (sessionStorage.getItem('rows') !== null) { this.rows = sessionStorage.getItem('rows'); }
    if (sessionStorage.getItem('start') !== null) { this.start = sessionStorage.getItem('start'); }
    if (sessionStorage.getItem('refineQuery') !== null) { this.refineQuery = JSON.parse(sessionStorage.getItem('refineQuery')); }
    if (sessionStorage.getItem('filters') !== null) { this.filters = JSON.parse(sessionStorage.getItem('filters')); }
  }
}

// Submit event handlers save state, clean form, etc. 
FacetQuery.prototype.bindSubmitHandlers = function() {
  $(document).on('submit', "#js-searchForm", function(that) {
    return function(event) {
      that.query = $('input[name="q"]').val();
      that.saveValuesToSession();
      $.pjax.submit(event, that.resultsContainer);
    }
  }(this));
  
  $(document).on('pjax:end', this.resultsContainer, function(that) {
    return function(event) {
      // that.selectDeselectAll();
      // that.initCarousel();
      $('#js-facet')[0].reset();
      that.getFormValuesFromDOM();
      that.saveValuesToSession();
    }
  }(this));
  
  $(document).on('submit', "#js-facet", function(that) {
    return function(event) {
      that.getFormValuesFromDOM();
      that.saveValuesToSession();
      that.clearDefaultFormValues();
      $.pjax.submit(event, that.resultsContainer);
    }
  }(this));
    
  // TODO: hide the GET parameters in the URL by pushing a URL state that is the URL without GET params
  $(document).on('click', '.js-item-link', function(that) {
    return function(event) {
      if ($(this).data('item_number') !== undefined) { that.start = $(this).data('item_number'); }
      var data_params = {
        'q': that.query,
        'rq': that.refineQuery,
        'sort': that.sort,
        'start': that.start,
      };
      for (var i in that.filters) { data_params[i] = that.filters[i]; }
      
      that.saveValuesToSession();
      event.preventDefault();
      $.pjax({
        type: 'GET',
        url: $(this).attr('href'),
        container: that.resultsContainer,
        data: data_params,
        traditional: true
      });
    }
  }(this));
  
}

// Event handlers modify form element values & call submit on js-facet
// DOM is always maintained at most 'current' form values
FacetQuery.prototype.bindDomManipulators = function() {
  // ***************VIEW FORMAT*************
  // change the value in the DOM - this is a hidden input changed programmatically
  $(document).on('click', '#thumbnails', function() {
    $('#view_format').prop('value', 'thumbnails'); 
    $('#js-facet').submit();
  });
  
  $(document).on('click', '#list', function() {
    $('#view_format').prop('value', 'list'); 
    $('#js-facet').submit();
  });
    
  // ****************SORT********************
  // don't need to change the DOM value - this is changed by the user via the select dropdown
  $(document).on('change', '#pag-dropdown__sort', function() {
    $('#js-facet').submit();
  });

  // ***************ROWS***********************
  // don't need to change the DOM value - this is changed by the user via the select dropdown
  $(document).on('change', '#pag-dropdown__view', function() {
    $('#js-facet').submit();
  });
  
  // ***********PAGINATION**********
  // change the value in the DOM - this is a hidden input changed programmatically
  $(document).on('click', '.js-prev', function() {
    var start = $(this).data('start');
    $('#start').val(start);
    $('#js-facet').submit();
  });
  
  $(document).on('click', '.js-next', function() {
    var start = $(this).data('start');
    $('#start').val(start); 
    $('#js-facet').submit();
  });
  
  $(document).on('change', '.pag-dropdown__select--unstyled', function() {
    var start = $(this).children('option:selected').attr('value');
    $('#start').val(start);
    $('#js-facet').submit();
  });
  
  // ***********BUTTON PAGINATION **********
  // change the value in the DOM - this is a hidden input changed programmatically
  $(document).on('click', 'a[data-start]', function() {
    var start = $(this).data('start');
    $('#start').val(start);
    $('#js-facet').submit();
  });

  //***********REFINE QUERY*************//
  // change the value in the DOM - this is a hidden input changed programmatically  
  $(document).on('click', '.js-refine-filter-pill', function() {
    var txtFilter = $(this).data('slug');
    $('input[form="js-facet"][name="rq"][value="' + txtFilter + '"]').val("");
    $('#js-facet').submit();
  });  

  //*************FACETING*************//
  // don't need to change in the DOM - this is changed by the user via checkboxes
  $(document).on('change', '.js-facet', function() {
    $('#js-facet').submit();
  });

  // change the value in the DOM - the filter buttons refer to the sidebar checkbox form elements
  $(document).on('click', '.js-filter-pill', function() {
    var filter = $(this).data('slug');
    $("#" + filter).prop('checked', false);
    $('#js-facet').submit();
  });
  
  // change the value in the DOM - the deselect all button refers to the sidebar checkbox form elements
  $(document).on('click', '.js-a-check__link-deselect-all', function() {
    var filterElements = $(this).parents('.check').find('.js-facet');
    filterElements.prop('checked', false);
    $('#js-facet').submit();
    return false;
  });
  
  // change the value in the DOM - the select all button refers to the sidebar checkbox form elements
  $(document).on('click', '.js-a-check__link-select-all', function() {
    var filterElements = $(this).parents('.check').find('.js-facet');
    filterElements.prop('checked', true);    
    $('#js-facet').submit();
    return false;
  });
  
  // change the value in the DOM - the clear filters button refers to the sidebar checkbox form elements
  $(document).on('click', '.js-clear-filters', function() {
    $('.js-facet').prop('checked', false);
    $('#js-facet').submit();
  });
  
  // set up select/deselect all buttons on facet form

  var facetTypes = $('.check');
  for(var i=0; i<facetTypes.length; i++) {
    var allSelected = !($($(facetTypes[i]).find('.js-facet')).is(':not(:checked)'));
    if (allSelected == true) {
      $(facetTypes[i]).find('.js-a-check__link-deselect-all').toggleClass('check__link-deselect-all--not-selected check__link-deselect-all--selected');
      $(facetTypes[i]).find('.js-a-check__link-select-all').toggleClass('check__link-select-all--selected check__link-select-all--not-selected');
      $(facetTypes[i]).find('.js-a-check__button-deselect-all').prop('disabled', false);
      $(facetTypes[i]).find('.js-a-check__update').prop('disabled', false);
    }
  }

  // var repository_autocomplete = new Autocomplete($('#repository_name'));
  // var collection_autocomplete = new Autocomplete($('#collection_name'));
}

FacetQuery.prototype.relatedCollections = function() {
  $(document).on('click', '.js-rc-page', function(that) {
    return function(event) {
      var data_params = {};
      data_params['q'] = that.query;
      data_params['rq'] = that.refineQuery;
      data_params['rc_page'] = $(this).data('rc_page');
      
      for (var i in that.filters) {
        data_params[i] = that.filters[i];
      }
      
      $.ajax({data: data_params, traditional: true, url: '/relatedCollections/', success: function(rc_container) {
        return function(data, status, jqXHR) {
          $(rc_container).html(data);
        }
      }(that.relatedCollectionsContainer) });
    }
  }(this));
}

FacetQuery.prototype.carousel = function() {
  // ##### Slick Carousel ##### //
  $('.carousel').slick({
    infinite: true,
    speed: 300,
    slidesToShow: 10,
    slidesToScroll: 6,
    variableWidth: true,
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          infinite: true,
          // slidesToShow: 8,
          slidesToScroll: 8,
          variableWidth: true
        }
      },
      {
        breakpoint: 900,
        settings: {
          infinite: true,
          // slidesToShow: 6,
          slidesToScroll: 6,
          variableWidth: true
        }
      },
      {
        breakpoint: 650,
        settings: {
          infinite: true,
          // slidesToShow: 4,
          slidesToScroll: 4,
          variableWidth: true
        }
      }
    ]
  });
  
  $('.carousel').on('beforeChange', function(that) {
    return function(event, slick, currentSlide, nextSlide){
      var numFound = $('#js-carousel').data('numfound');      
      var numLoaded = $('.carousel').slick('getSlick').slideCount;
      var slidesPerPage = $('.carousel').slick('getSlick').options.slidesToScroll;

      if (numLoaded < numFound && nextSlide + slidesPerPage >= numLoaded) {
        that.start = parseInt(that.start) + numLoaded;
        var data_params = {
          'q': that.query,
          'rq': that.refineQuery,
          'start': that.start,
          'sort': that.sort,
          'rows': '6'
        };
        for (var i in that.filters) { data_params[i] = that.filters[i]; }
      
        $.ajax({data: data_params, traditional: true, url: '/carousel/', success: function(data, status, jqXHR) {
            $('.carousel').slick('slickAdd', data);
        }});
      }
      
      if (nextSlide+slidesPerPage > numFound){ var slideRange = (nextSlide+slidesPerPage) - numFound} 
      else { var slideRange = nextSlide+slidesPerPage }
        
      $('.carousel__items-number').text('Displaying ' + (parseInt(nextSlide)+1) + ' - ' + slideRange + ' of ' + numFound);
      
    }
  }(this));
}

$(document).ready(function() {
  // $.pjax.disable();
  var query = new FacetQuery();
  // query.selectDeselectAll();
  // query.initCarousel();
});