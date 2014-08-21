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
  
  $('.object-thumb').click(function() {
    $('#object_id').prop('value', $(this).data('object_id')); 
    $('#object-view > input[name=start]').prop('value', $('.object-thumb').index(this));
    $('#object-view').submit(function(that) {
      return function(e) {
        $(this).prop('action', '/objectView/' + $(that).data('object_id') + "/");
        return;
      }
    }(this));
    $('#object-view').submit();
  });
});