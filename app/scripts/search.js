"use strict";

/**
 *  @file       search.js
 *  
 *  @author     Amy Wieliczka <amywieliczka [at] berkeley.edu>
 **/

function FacetQuery(params) {
  this.query = params['q'] || sessionStorage['q'] || "";
  
  this.resultsContainer = "#js-pageContent";
  this.relatedCollectionsContainer = "#js-relatedCollections"
  
  this.bindHandlers();
}

FacetQuery.prototype.bindHandlers = function() {
  $(document).on('submit', "#js-searchForm", function(that) {
    return function(event) {
      // set query parameter in query obj, save query parameter in local session storage
      that.q = $('input[name="q"]').val();
      sessionStorage['q'] = that.q;
      that.searchResults = new FacetQuery({});
      
      $.pjax.submit(event, that.resultsContainer);
    }
  }(this));
  
  $(document).on('submit', "#js-facet", function(container) {
    return function(event) {
      // remove form elements with default values
      var refineQueryFields = $('input[form="js-facet"][name="rq"]');
      for (var i=0; i<refineQueryFields.length; i++) {
        if ($(refineQueryFields[i]).val() == '') { $(refineQueryFields[i]).attr('name', ''); }
      }
      if ($('input[form="js-facet"][name="rows"]').val() == '16') { $('input[form="js-facet"][name="rows"]').attr('name', ''); }
      if ($('select[form="js-facet"][name="start"]').val() == '0') { $('select[form="js-facet"][name="start"]').attr('name', ''); }
      if ($('input[form="js-facet"][name="view_format"]').val() == 'thumbnails') { $('input[form="js-facet"][name="view_format"]').attr('name', ''); }
      if ($('input[form="js-facet"][name="rc_page"]').val() == '0') { $('input[form="js-facet"][name="rc_page"]').attr('name', ''); }
      
      // submit form via pjax
      $.pjax.submit(event, container);
    }
  }(this.resultsContainer));
  
  
  //***********ITEM VIEW**************//
  // $(document).on('click', '.item-thumb', function() {
  //   $('#item_id').prop('value', $(this).data('item_id'));
  //   $('#item-view > input[name=start]').prop('value', $('.item-thumb').index(this));
  //   $('#item-view').submit(function(that) {
  //     return function(e) {
  //       $(this).prop('action', '/' + $(that).data('item_id') + "/");
  //       return;
  //     }
  //   }(this));
  //   $('#item-view').submit();
  // });
  
  // TODO: add search context to pjax - look at how $.pjax.submit works. 
  // we basically want to do the same as $.pjax.submit but hide the GET parameters in the URL. 
  // potentially use the options $.pjax.submit parameter to override the URL so it doesn't display GET params?
  $(document).on('click', '.js-item-link', function(that) {
    return function(event) {
      $.pjax.click(event, {container: that.resultsContainer})
    }
  }(this));
  
  //*************FACETING*************//
  $(document).on('change', '.js-facet', function() {
    $('#js-facet').submit();
  });

  $(document).on('click', '.js-filter-pill', function() {
    $("#" + $(this).data('slug')).prop('checked', false);
    $('#js-facet').submit();
  });
  
  $(document).on('click', '.js-refine-filter-pill', function() {
    $('input[form="js-facet"][name="rq"][value="' + $(this).data('slug') + '"]').val("");
    $('#js-facet').submit();
  });
  
  $(document).on('click', '#deselect-facets', function() {
    $('.js-facet').prop('checked', false);
    $('#js-facet').submit();
  });
  
  $(document).on('click', '.select-facets', function() {
    // $('.facet-{{ facet_type }}').prop('checked', true); 
    $(this).parents('.facet-type').find('.js-facet').prop('checked', true);
    $('#js-facet').submit();
  });
  
  // var repository_autocomplete = new Autocomplete($('#repository_name'));
  // var collection_autocomplete = new Autocomplete($('#collection_name'));
  
  // ***********PAGINATION**********
  
  $(document).on('click', '#view16', function() {
    $('#rows').prop('value', '16'); 
    sessionStorage['queryRows'] = '16';
    $('#js-facet').submit();
  });
  
  $(document).on('click', '#view50', function() {
    $('#rows').prop('value', '50'); 
    sessionStorage['queryRows'] = '50';
    $('#js-facet').submit();
  });
  
  $(document).on('click', '#prev', function() {
    $('#start').val($(this).data('start')); 
    sessionStorage['queryStart'] = $(this).data('start');
    $('#js-facet').submit();
  });
  
  $(document).on('change', '#start', function() {
    sessionStorage['queryStart'] = $(this).val();
    $('#js-facet').submit();
  });
  
  $(document).on('click', '#next', function() {
    $('#start').val($(this).data('start')); 
    sessionStorage['queryStart'] = $(this).data('start');
    $('#js-facet').submit();
  });
  
  // ***********BUTTON PAGINATION **********
  
  $(document).on('click', 'a[data-start]', function() {
    $('#start').val($(this).data('start'));
    sessionStorage['queryStart'] = $(this).data('start');
    $('#js-facet').submit();
  });
  
  // ***************VIEW FORMAT*************
  
  $(document).on('click', '#thumbnails', function() {
    $('#view_format').prop('value', 'thumbnails'); 
    sessionStorage['viewFormat'] = 'thumbnails';
    $('#js-facet').submit();
  });
  
  $(document).on('click', '#list', function() {
    $('#view_format').prop('value', 'list'); 
    sessionStorage['viewFormat'] = 'list';
    $('#js-facet').submit();
  });
  
  // ******RELATED COLLECTION PAGINATION*******
  
  // TODO: add search context to AJAX call
  // write callback function to place the html in the correct place in the DOM (replacing initial related collections)
  $(document).on('click', '.js-rc-page', function(that) {
    return function(event) {
      that.getValuesFromDom();
      var data_params = {};
      data_params['q'] = that.query;
      data_params['rq'] = that.refine_query;
      data_params['rc_page'] = $(this).data('rc_page');
      // this.rc_page = $(".js-rc-page").data('rc_page');
      
      for (var i in that.filters) {
        if (that.filters.hasOwnProperty(i)) {
          data_params[i] = that.filters[i];
        }
      }
      $.ajax({data: data_params, url: '/relatedCollections/', success: function(rc_container) {
        return function(data, status, jqXHR) {
          $(rc_container).html(data);
        }
      }(that.relatedCollectionsContainer) });
    }
  }(this));
  
}

// TODO: .val() only returns the value of the FIRST in the set of matched elements, instead we need to create an array here
FacetQuery.prototype.getValuesFromDom = function() {
  this.query = $("[form='js-facet'][name='q']").val();
  this.refine_query = $("[form='js-facet'][name='rq']").val();
  this.query_start = $("[form='js-facet'][name='start']").val();
  this.query_rows = $("[form='js-facet'][name='rows']").val();
  this.view_format = $("[form='js-facet'][name='view_format']").val();
  
  this.filters = {}
  if (typeof($("[form='js-facet'][name='type_ss']:checked").val()) !== 'undefined') {
    this.filters['type_ss'] = $("[form='js-facet'][name='type_ss']:checked").val();
  }
  if (typeof($("[form='js-facet'][name='collection_name']:checked").val()) !== 'undefined') {
    this.filters['collection_name'] = $("[form='js-facet'][name='collection_name']:checked").val();
  }
  if (typeof($("[form='js-facet'][name='repository_name']:checked").val()) !== 'undefined') {
    this.filters['repository_name'] = $("[form='js-facet'][name='repository_name']:checked").val();
  }
}

$(document).ready(function() {
  var query = new FacetQuery({});
});