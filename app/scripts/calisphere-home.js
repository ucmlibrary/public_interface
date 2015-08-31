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

  $(document).on('click', '.js-global-header__bars-icon', function() {
    $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
    $('.js-global-header__mobile-links').toggleClass('.global-header__mobile-links global-header__mobile-links--selected');
  });

  // Toggle only search box:
  //  $('.js-global-header__search-icon').click(function(){
  $(document).on('click', '.js-global-header__search-icon', function() {
    $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
  });
});