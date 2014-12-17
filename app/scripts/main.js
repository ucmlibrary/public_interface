'use strict'; // for jshint

$(document).ready(function(){

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

  // ##### Checkbox Groups ##### //

  // Disable Update Results button upon document.ready
  $('.js-check__update').prop('disabled', true);

  // Expand checkbox group and switch arrow icon when clicking on header (small and medium screens):
  $('.js-check__header').click(function(){
    $('.js-check__popdown').toggleClass('check__popdown check__popdown--selected');
    $('.js-check__header-arrow-icon').toggleClass('fa-angle-down fa-angle-up');
  });

  // Select all or deselect all checkboxes (small and medium screens):
  $('.js-check__button-select-all').click(function(){
    $('.check__input').prop('checked', true);
    $('.js-check__button-deselect-all').prop('disabled', false);
    $('.js-check__update').prop('disabled', false);
  });
  $('.js-check__button-deselect-all').click(function(){
    $('.check__input').prop('checked', false);
    $('.js-check__update').prop('disabled', false);
  });

  // Select all or deselect all checkboxes (large screens):
  $('.js-check__link-select-all').click(function(){
    $('.check__input').prop('checked', true);
    $('.js-check__link-deselect-all').toggleClass('check__link-deselect-all--not-selected check__link-deselect-all--selected');
    $('.js-check__link-select-all').toggleClass('check__link-select-all--selected check__link-select-all--not-selected');
    $('.js-check__button-deselect-all').prop('disabled', false);
    $('.js-check__update').prop('disabled', false);
  });
  $('.js-check__link-deselect-all').click(function(){
    $('.check__input').prop('checked', false);
    $('.js-check__link-deselect-all').toggleClass('check__link-deselect-all--selected check__link-deselect-all--not-selected');
  	$('.js-check__link-select-all').toggleClass('check__link-select-all--not-selected check__link-select-all--selected');
  	$('.js-check__update').prop('disabled', false);
  });

  // If a checkbox is already checked, enable Deselect All button:
  if ($('.check__input').is(':checked')) {
  	$('.js-check__button-deselect-all').prop('disabled', false);
  }

  // If a new checkbox is checked, enable Deselect All button and enable Update Results button:
  $('.check__input').change(function(){
    if ($('.check__input').is(':checked')) {
  		$('.js-check__button-deselect-all').prop('disabled', false);
  	}
  $('.js-check__update').prop('disabled', false);
  });

  // Collapse checkbox group, disable Update Results button, and change header styles if any checkboxes are already checked:
  $('.js-check__update').click(function(){
    $('.js-check__update').prop('disabled', true);
  	$('.js-check__popdown').toggleClass('check__popdown check__popdown--selected');
    $('.js-check__header-arrow-icon').toggleClass('fa-angle-up fa-angle-down');
    if ($('.check__input').is(':checked')) {
  		$('.js-check__header').addClass('check__header--selected').removeClass('check__header');
  		$('.js-check__header-text').addClass('check__header-text--selected').removeClass('check__header-text');
    } else {
      $('.js-check__header').removeClass('check__header--selected').addClass('check__header');
      $('.js-check__header-text').removeClass('check__header-text--selected').addClass('check__header-text');
  	}
  });

}); // End of $(document).ready(function()

// ##### Popover ##### //

$('.popover__link').popover({
  trigger: 'hover',
  placement: 'auto',
  html: true
});

// Alternative JavaScript method (instead of CSS method) for disabling popover via breakpoint:
// if (Modernizr.mq('only screen and (max-width: 800px)')) {
//  $('.popover__link').popover('destroy');
// }

// ##### Carousel ##### //

// Get Bootstrap CSS breakpoints:
var lg = $('.bs-lg-screen').css('width');
var md = $('.bs-md-screen').css('width');
var sm = $('.bs-sm-screen').css('width');

lg = lg.replace('px', '');
md = md.replace('px', '');
sm = sm.replace('px', '');

// To display a Bootstrap breakpoint value for testing, uncomment next line, set the breakpoint variable, then add <div id="bp-test"></div> to HTML:
// document.getElementById('bp-test').innerHTML = lg;

// Slick settings (see http://kenwheeler.github.io/slick/):
$('.carousel').slick({
  infinite: false,
  slidesToShow: 6,
  slidesToScroll: 6,
  responsive: [
    {
      breakpoint: lg, // Bootstrap breakpoint pixel variable
      settings: {
        slidesToShow: 6,
        slidesToScroll: 6,
      }
    },
    {
      breakpoint: md, // Bootstrap breakpoint pixel variable
      settings: {
        slidesToShow: 5,
        slidesToScroll: 5
      }
    },
    {
      breakpoint: sm, // Bootstrap breakpoint pixel variable
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    }
  ]
});
