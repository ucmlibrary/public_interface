'use strict'; // for jshint

$(document).ready(function(){

  // Remove 'no-jquery' class from <html> element if jquery loads properly:
  $('html').removeClass('no-jquery');

  // ##### Global Header ##### //
  	
  // Toggle mobile menu with search box:
  $('.js-global-header__bars-icon').click(function(){
    $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
    $('.js-global-header__mobile-links').toggleClass('.global-header__mobile-links global-header__mobile-links--selected');
  });

  // Toggle only search box:
  $('.js-global-header__search-icon').click(function(){
    $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
  });

  // ##### Search Filters ##### //

  // Show more filters
  $('.js-filter__more-link').click(function(){
    $('.js-filter__more').addClass('filter__more--show').removeClass('filter__more');
    $('.js-filter__more-link').addClass('filter__more-link--hide').removeClass('filter__more-link');
  });

  // Show less filters
  $('.js-filter__less-link').click(function(){
    $('.js-filter__more').addClass('filter__more').removeClass('filter__more--show');
    $('.js-filter__more-link').addClass('filter__more-link').removeClass('filter__more-link--hide');
  });

  // ##### Checkbox Groups ##### //

  // Disable Update Results button upon document.ready
  $('.js-a-check__update').prop('disabled', true);

  // Expand checkbox group and switch arrow icon when clicking on header (small and medium screens):
  $('.js-a-check__header').click(function(){
    $(this).next('.js-a-check__popdown').toggleClass('check__popdown check__popdown--selected');
    $(this).children('.js-a-check__header-arrow-icon').toggleClass('fa-angle-down fa-angle-up');
  });

  // Select all or deselect all checkboxes (small and medium screens):
  $('.js-a-check__button-select-all').click(function(){
    $('.check__input').prop('checked', true);
    $('.js-a-check__button-deselect-all').prop('disabled', false);
    $('.js-a-check__update').prop('disabled', false);
  });
  $('.js-a-check__button-deselect-all').click(function(){
    $('.check__input').prop('checked', false);
    $('.js-a-check__update').prop('disabled', false);
  });

  // Select all or deselect all checkboxes (large screens):
  $('.js-a-check__link-select-all').click(function(){
    $('.check__input').prop('checked', true);
    $('.js-a-check__link-deselect-all').toggleClass('check__link-deselect-all--not-selected check__link-deselect-all--selected');
    $('.js-a-check__link-select-all').toggleClass('check__link-select-all--selected check__link-select-all--not-selected');
    $('.js-a-check__button-deselect-all').prop('disabled', false);
    $('.js-a-check__update').prop('disabled', false);
  });
  $('.js-a-check__link-deselect-all').click(function(){
    $('.check__input').prop('checked', false);
    $('.js-a-check__link-deselect-all').toggleClass('check__link-deselect-all--selected check__link-deselect-all--not-selected');
  	$('.js-a-check__link-select-all').toggleClass('check__link-select-all--not-selected check__link-select-all--selected');
  	$('.js-a-check__update').prop('disabled', false);
  });

  // If a checkbox is already checked, enable Deselect All button:
  if ($('.check__input').is(':checked')) {
  	$('.js-a-check__button-deselect-all').prop('disabled', false);
  }

  // If a new checkbox is checked, enable Deselect All button and enable Update Results button:
  $('.check__input').change(function(){
    if ($('.check__input').is(':checked')) {
  		$('.js-a-check__button-deselect-all').prop('disabled', false);
  	}
  $('.js-a-check__update').prop('disabled', false);
  });

  // Collapse checkbox group, disable Update Results button, and change header styles if any checkboxes are already checked:
  $('.js-a-check__update').click(function(){
    $('.js-a-check__update').prop('disabled', true);
  	$('.js-a-check__popdown').toggleClass('check__popdown check__popdown--selected');
    $('.js-a-check__header-arrow-icon').toggleClass('fa-angle-up fa-angle-down');
    if ($('.check__input').is(':checked')) {
  		$('.js-a-check__header').addClass('check__header--selected').removeClass('check__header');
  		$('.js-a-check__header-text').addClass('check__header-text--selected').removeClass('check__header-text');
    } else {
      $('.js-a-check__header').removeClass('check__header--selected').addClass('check__header');
      $('.js-a-check__header-text').removeClass('check__header-text--selected').addClass('check__header-text');
  	}
  });

  // Toggle meta-complex__list

  $('.js-meta-complex__heading').click(function(){
    $('.js-meta-complex__list').toggle();
  }); 

}); // End of $(document).ready(function()

// ##### Tooltip ##### //


$('[data-toggle="tooltip"]').tooltip({
  placement: 'top'
});

// Alternative JavaScript method (instead of CSS method) for disabling popover via breakpoint:
// if (Modernizr.mq('only screen and (max-width: 800px)')) {
//  $('.popover__link').popover('destroy');
// }
