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
  
  // incase a pjax request failed and we already have search context 
  // but it isn't saved due to re-init of FacetQuery instance
  var url = window.location.href;
  if (url.indexOf('?') > -1) {
    this.getValuesFromSession();
  }
  
  // instead of getting values from dom, potentially scrap values from URL? 
  // if (typeof this.query == 'undefined') {
  //   if (url.indexOf('?q=') > -1 || url.indexOf('&q=') > -1) {
  //     this.query = $("[form='js-searchForm'][name='q']").val();
  //   }
  // }
  
  this.bindHandlers();
}

FacetQuery.prototype.cleanForm = function() {
  // remove form elements with default values
  var refineQueryFields = $('input[form="js-facet"][name="rq"]');
  for (var i=0; i<refineQueryFields.length; i++) {
    if ($(refineQueryFields[i]).val() == '') { $(refineQueryFields[i]).attr('name', ''); }
  }
  if ($('input[form="js-facet"][name="rows"]').val() == '16') { $('input[form="js-facet"][name="rows"]').attr('name', ''); }
  if ($('select[form="js-facet"][name="start"]').val() == '0') { $('select[form="js-facet"][name="start"]').attr('name', ''); }
  if ($('input[form="js-facet"][name="view_format"]').val() == 'thumbnails') { $('input[form="js-facet"][name="view_format"]').attr('name', ''); }
  if ($('input[form="js-facet"][name="rc_page"]').val() == '0') { $('input[form="js-facet"][name="rc_page"]').attr('name', ''); }
}

FacetQuery.prototype.bindHandlers = function() {
  $(document).on('submit', "#js-searchForm", function(that) {
    return function(event) {
      that.query = $('input[name="q"]').val();
      that.saveValuesToSession();
      $.pjax.submit(event, that.resultsContainer);
    }
  }(this));
  
  $(document).on('submit', "#js-facet", function(that) {
    return function(event) {
      that.cleanForm();
      // add to refineQuery
      if ($('input[form="js-facet"][type="search"][name="rq"]').val() !== undefined) {
        that.refineQuery.push($('input[form="js-facet"][type="search"][name="rq"]').val());
      }
      
      that.saveValuesToSession();
      $.pjax.submit(event, that.resultsContainer);
    }
  }(this));
  
  // TODO: hide the GET parameters in the URL by pushing a URL state that is the URL without GET params
  $(document).on('click', '.js-item-link', function(that) {
    return function(event) {
      var data_params = {};
      data_params['q'] = that.query;
      data_params['rq'] = that.refineQuery;
      if ($(this).data('item_number') !== undefined) {
        data_params['start'] = $(this).data('item_number');
        that.queryStart = data_params['start'];
      } else {
        data_params['start'] = that.queryStart;
      }
      
      for (var i in that.filters) {
        data_params[i] = that.filters[i];
      }
      
      that.saveValuesToSession();
      $.pjax.click(event, {container: that.resultsContainer, data: data_params, traditional: true});
    }
  }(this));
  
  //*************FACETING*************//
  $(document).on('change', '.js-facet', function(that) {
    return function(event) {
      var filterType = $(this).attr('name');
      var filter = $(this).val();
      if ($(this).prop('checked')) {
        // add to filters
        if (typeof that.filters[filterType] == 'undefined') {
          that.filters[filterType] = [filter];
        } else {
          that.filters[filterType].push(filter);
        }
      } else {
        // remove from filters
        if (typeof that.filters[filterType] != 'undefined' && that.filters[filterType].indexOf(filter) > -1) {
          that.filters[filterType].splice(that.filters[filterType].indexOf(filter), 1)
        }
      }
      
      $('#js-facet').submit();
    }
  }(this));

  $(document).on('click', '.js-filter-pill', function(that) {
    return function(event) {
      var filter = $(this).data('slug');
      var filterType = $("#" + filter).attr('name');
      // remove from filters
      if (typeof that.filters[filterType] != 'undefined' && that.filters[filterType].indexOf(filter) > -1) {
        that.filters[filterType].splice(that.filters[filterType].indexOf(filter), 1);
      }
      
      $("#" + filter).prop('checked', false);
      $('#js-facet').submit();
    }
  }(this));
  
  // TODO: NEEDS REWORKING WITH JOEL'S WORK
  $(document).on('click', '#deselect-facets', function() {
    $('.js-facet').prop('checked', false);
    $('#js-facet').submit();
  });
  // TODO: NEEDS REWORKING WITH JOEL'S WORK
  $(document).on('click', '.select-facets', function() {
    // $('.facet-{{ facet_type }}').prop('checked', true); 
    $(this).parents('.facet-type').find('.js-facet').prop('checked', true);
    $('#js-facet').submit();
  });
  
  //***********REFINE QUERY*************//
  $(document).on('click', '.js-refine-filter-pill', function(that) {
    return function(event) {
      var txtFilter = $(this).data('slug');
      // remove from refineQuery
      if (that.refineQuery.indexOf(txtFilter) > -1) {
        that.refineQuery.splice(that.refineQuery.indexOf(txtFilter), 1);
      }
      
      $('input[form="js-facet"][name="rq"][value="' + txtFilter + '"]').val("");
      
      $('#js-facet').submit();
      
    }
  }(this));
  
  // ***********PAGINATION**********
  
  $(document).on('click', '#view16', function() {
    $('#rows').prop('value', '16'); 
    $('#js-facet').submit();
  });
  
  $(document).on('click', '#view50', function() {
    $('#rows').prop('value', '50'); 
    $('#js-facet').submit();
  });
  
  $(document).on('click', '#prev', function(that) {
    return function(event) {
      var start = $(this).data('start');
      that.queryStart = start;
      $('#start').val(start);
      $('#js-facet').submit();
    }
  }(this));
  
  $(document).on('change', '#start', function(that) {
    return function(event) {
      that.queryStart = $(this).val();
      $('#js-facet').submit();
    }
  }(this));
  
  $(document).on('click', '#next', function(that) {
    return function(event) {
      var start = $(this).data('start');
      that.queryStart = start;
      $('#start').val(start); 
      $('#js-facet').submit();
    }
  }(this));
  
  // ***********BUTTON PAGINATION **********
  
  $(document).on('click', 'a[data-start]', function(that) {
    return function(event) {
      var start = $(this).data('start');
      that.queryStart = start;
      $('#start').val(start);
      $('#js-facet').submit();
    }
  }(this));
  
  // ***************VIEW FORMAT*************
  
  $(document).on('click', '#thumbnails', function() {
    $('#view_format').prop('value', 'thumbnails'); 
    $('#js-facet').submit();
  });
  
  $(document).on('click', '#list', function() {
    $('#view_format').prop('value', 'list'); 
    $('#js-facet').submit();
  });
  
  // ******RELATED COLLECTION PAGINATION*******
  
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
  
  $(document).on('click', '.js-carousel-page', function(that) {
    return function(event) {
      var data_params = {};
      data_params['q'] = that.query;
      data_params['rq'] = that.refineQuery;
      data_params['start'] = $(this).data('carousel_start');
      that.queryStart = data_params['start'];
      
      for (var i in that.filters) {
        data_params[i] = that.filters[i];
      }
      
      $.ajax({data: data_params, traditional: true, url: '/carousel/', success: function(carouselContainer) {
        return function(data, status, jqXHR) {
          $(carouselContainer).html(data);
        }
      }(that.carouselContainer) });
    }
  }(this));
  
  // var repository_autocomplete = new Autocomplete($('#repository_name'));
  // var collection_autocomplete = new Autocomplete($('#collection_name'));
  
}

FacetQuery.prototype.saveValuesToSession = function() {
  sessionStorage.clear();
  sessionStorage.setItem('query', this.query);
  if (this.queryStart !== undefined) {
    sessionStorage.setItem('queryStart', this.queryStart);
  }
  if (this.refineQuery.length !== 0) {
    sessionStorage.setItem('refineQuery', JSON.stringify(this.refineQuery));
  }
  if (!$.isEmptyObject(this.filters)) {
    sessionStorage.setItem('filters', JSON.stringify(this.filters));
  }
}

FacetQuery.prototype.getValuesFromSession = function() {
  if (sessionStorage.length > 0) {
    this.query = sessionStorage.getItem('query');
    if (sessionStorage.getItem('queryStart') !== null) {
      this.queryStart = sessionStorage.getItem('queryStart');
    }
    if (sessionStorage.getItem('refineQuery') !== null) {
      this.refineQuery = JSON.parse(sessionStorage.getItem('refineQuery'));
    }
    if (sessionStorage.getItem('filters') !== null) {
      this.filters = JSON.parse(sessionStorage.getItem('filters'));
    }
  }
}

FacetQuery.prototype.getValuesFromDom = function() {
  this.query = $("[form='js-facet'][name='q']").val();
  this.queryStart = $("[form='js-facet'][name='start']").val();
  
  var refineQueries = $("[form='js-facet'][name='rq']");
  for (var i=0; i<refineQueries.length; i++) {
    if ($(refineQueries[i]).val() !== '') {
      this.refineQuery.push($(refineQueries[i]).val());
    }
  }
  
  var filters = $("[form='js-facet'][name='type_ss']:checked");
  if (typeof(filters.val()) !== 'undefined') {
    this.filters['type_ss'] = []
    for (var i=0; i < filters.length; i++) {
      this.filters['type_ss'].push($(filters[i]).val());
    }
  }
  filters = $("[form='js-facet'][name='collection_data']:checked");
  if (typeof(filters.val()) !== 'undefined') {
    this.filters['collection_data'] = []
    for (var i=0; i < filters.length; i++) {
      this.filters['collection_data'].push($(filters[i]).val());
    }
  }
  filters = $("[form='js-facet'][name='repository_data']:checked");
  if (typeof(filters.val()) !== 'undefined') {
    this.filters['repository_data'] = []
    for (var i=0; i < filters.length; i++) {
      this.filters['repository_data'].push($(filters[i]).val());
    }
  }
}

$(document).ready(function() {
  var query = new FacetQuery();
});