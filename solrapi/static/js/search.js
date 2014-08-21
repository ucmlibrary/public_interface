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
    $("#" + $(this).data('slug')).prop('checked', false);
    $('#facet').submit();
  });
  
  $('.item-thumb').click(function() {
    $('#item_id').prop('value', $(this).data('item_id')); 
    $('#item-view > input[name=start]').prop('value', $('.item-thumb').index(this));
    $('#item-view').submit(function(that) {
      return function(e) {
        $(this).prop('action', '/itemView/' + $(that).data('item_id') + "/");
        return;
      }
    }(this));
    $('#item-view').submit();
  });
});