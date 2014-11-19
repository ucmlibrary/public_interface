'use strict';

$(document).ready(function() {
  $('#deselect-facets').click(function() {
    $('.facet').prop('checked', false);
    $('#facet').submit();
  });
  
  $('.select-facets').click(function() {
    // $('.facet-{{ facet_type }}').prop('checked', true); 
    $(this).parents('.facet-type').find('.facet').prop('checked', true);
    $('#facet').submit();
  });
  
  $('#view16').click(function() {
    $('#rows').prop('value', '16'); 
    $('#facet').submit();
  });
  
  $('#view50').click(function() {
    $('#rows').prop('value', '50'); 
    $('#facet').submit();
  });
  
  $('#prev').click(function() {
    $('#start').val($(this).data('start')); 
    $('#facet').submit();
  });
  
  $('#start').change(function() {
    $('#facet').submit();
  });
  
  $('#next').click(function() {
    $('#start').val($(this).data('start')); 
    $('#facet').submit();
  });
  
  $('#thumbnails').click(function() {
    $('#view_format').prop('value', 'thumbnails'); $('#facet').submit();
  });
  
  $('#list').click(function() {
    $('#view_format').prop('value', 'list'); $('#facet').submit();
  });
  
  $('.facet').change(function() {
    $('#facet').submit();
  });
  
  $('.filter-pill').click(function() {
    $('#' + $(this).data('slug')).prop('checked', false);
    $('#facet').submit();
  });
  
  $('.item-thumb').click(function() {
    $('#item_id').prop('value', $(this).data('item_id')); 
    $('#item-view > input[name=start]').prop('value', $('.item-thumb').index(this));
    $('#item-view').submit((function(that) {
      return function() {
        $(this).prop('action', '/' + $(that).data('item_id') + '/');
        return;
      };
    } (this)));
    $('#item-view').submit();
  });
  
  // var repository_autocomplete = new Autocomplete($('#repository_name'));
  // var collection_autocomplete = new Autocomplete($('#collection_name'));
  
  // var repo_chosen = new Chosen($('#repository_name'));
  
  // $('#repository_name').chosen({width: "100%", inherit_select_classes: true, placeholder_text_multiple: "Search institution facets"});
  // $('#repository_name').data('chosen').winnow_results();
  // $('#repository_name_chosen .highlighted').toggleClass('highlighted');
  // 
  // $('#collection_name').chosen({width: "100%", inherit_select_classes: true, placeholder_text_multiple: "Search collection facets"});
  // $('#collection_name').data('chosen').winnow_results();
  // $('#collection_name_chosen .highlighted').toggleClass('highlighted');
});