"use strict";

/**
 *  @file       search.js
 *  
 *  @author     Amy Wieliczka <amywieliczka [at] berkeley.edu>
 **/

function FacetQuery(params) {
  this.q = params['q'] || sessionStorage['q'] || "";
  
  this.refineQuery = params.refineQuery || sessionStorage['refineQuery'] || '';
  this.queryRows = params.queryRows || sessionStorage['queryRows'] || '16';
  this.queryStart = params.queryStart || sessionStorage['queryStart'] || '0';
  this.viewFormat = params.viewFormat || sessionStorage['viewFormat'] || 'thumbnails';
  
  this.searchForm = "#facet";
  this.resultsContainer = "#js-pageContent";
  
  this.bindHandlers();
}

FacetQuery.prototype.bindHandlers = function() {
  
  $(document).on('submit', this.searchForm, function(container) {
    return function(event) {
      // remove form elements with default values
      var refineQueryFields = $('input[form="facet"][name="rq"]');
      for (var i=0; i<refineQueryFields.length; i++) {
        if ($(refineQueryFields[i]).val() == '') { $(refineQueryFields[i]).attr('name', ''); }
      }
      if ($('input[form="facet"][name="rows"]').val() == '16') { $('input[form="facet"][name="rows"]').attr('name', ''); }
      if ($('select[form="facet"][name="start"]').val() == '0') { $('select[form="facet"][name="start"]').attr('name', ''); }
      if ($('input[form="facet"][name="view_format"]').val() == 'thumbnails') { $('input[form="facet"][name="view_format"]').attr('name', ''); }
      if ($('input[form="facet"][name="rc_page"]').val() == '0') { $('input[form="facet"][name="rc_page"]').attr('name', ''); }
      
      // submit form via pjax
      $.pjax.submit(event, container);
    }
  }(this.resultsContainer));
  
  
  //***********ITEM VIEW**************//
  $(document).on('click', '.item-thumb', function() {
    $('#item_id').prop('value', $(this).data('item_id'));
    $('#item-view > input[name=start]').prop('value', $('.item-thumb').index(this));
    $('#item-view').submit(function(that) {
      return function(e) {
        $(this).prop('action', '/' + $(that).data('item_id') + "/");
        return;
      }
    }(this));
    $('#item-view').submit();
  });
  
  //*************FACETING*************//
  $(document).on('change', '.facet', function() {
    $('#facet').submit();
  });

  $(document).on('click', '.filter-pill', function() {
    $("#" + $(this).data('slug')).prop('checked', false);
    $('#facet').submit();
  });
  
  $(document).on('click', '.refine-filter-pill', function() {
    $('input[form="facet"][name="rq"][value="' + $(this).data('slug') + '"]').val("");
    $('#facet').submit();
  });
  
  $(document).on('click', '#deselect-facets', function() {
    $('.facet').prop('checked', false);
    $('#facet').submit();
  });
  
  $(document).on('click', '.select-facets', function() {
    // $('.facet-{{ facet_type }}').prop('checked', true); 
    $(this).parents('.facet-type').find('.facet').prop('checked', true);
    $('#facet').submit();
  });
  
  // var repository_autocomplete = new Autocomplete($('#repository_name'));
  // var collection_autocomplete = new Autocomplete($('#collection_name'));
  
  // ***********PAGINATION**********
  
  $(document).on('click', '#view16', function() {
    $('#rows').prop('value', '16'); 
    $('#facet').submit();
  });
  
  $(document).on('click', '#view50', function() {
    $('#rows').prop('value', '50'); 
    $('#facet').submit();
  });
  
  $(document).on('click', '#prev', function() {
    $('#start').val($(this).data('start')); 
    $('#facet').submit();
  });
  
  $(document).on('change', '#start', function() {
    $('#facet').submit();
  });
  
  $(document).on('click', '#next', function() {
    $('#start').val($(this).data('start')); 
    $('#facet').submit();
  });
  
  // ***********BUTTON PAGINATION **********
  
  $(document).on('click', 'a[data-start]', function() {
    $('#start').val($(this).data('start'));
    $('#facet').submit();
  });
  
  // ***************VIEW FORMAT*************
  
  $(document).on('click', '#thumbnails', function() {
    $('#view_format').prop('value', 'thumbnails'); $('#facet').submit();
  });
  
  $(document).on('click', '#list', function() {
    $('#view_format').prop('value', 'list'); $('#facet').submit();
  });
  
  // ******RELATED COLLECTION PAGINATION*******
  
  $(document).on('click', '.js-rc_page', function() {
    $('#rc_page').val($(this).data('rc_page'));
    $('#facet').submit();
  });
  
}

// takes two jquery selectors: search input, and pjax container for search results
function Query(params) {
  this.q = params['q'] || sessionStorage['q'] || "";
  this.searchForm = params.searchForm;
  this.resultsContainer = params.resultsContainer;
  
  if (this.q != "") {
    this.searchResults = new FacetQuery({});
  }
  
  this.bindHandlers();
}

Query.prototype.bindHandlers = function() {
  $(document).on('submit', this.searchForm, function(that) {
    return function(event) {
      // set query parameter in query obj, save query parameter in local session storage
      that.q = $('input[name="q"]').val();
      sessionStorage['q'] = that.q;
      that.searchResults = new FacetQuery({});
      
      $.pjax.submit(event, that.resultsContainer);
    }
  }(this));
  
  $(document).on('click', '.js-item-link', function(that) {
    return function(event) {
      $.pjax.click(event, {container: that.resultsContainer})
    }
  }(this));
}

$(document).ready(function() {
  var query = new Query({searchForm: '#js-searchForm', resultsContainer: '#js-pageContent'});
});