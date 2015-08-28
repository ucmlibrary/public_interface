/*global _*/
'use strict';

sessionStorage.clear();

$(document).ready(function() {
  $('html').removeClass('no-jquery');
  _.each($('form'), function(el) {
    el.reset();
  });
    
  $(document).on('submit', '#js-searchForm, #js-homeForm, #js-footerSearch', function() {
    sessionStorage.setItem('q', $(this).find('input').val());
  });
});