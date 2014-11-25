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

  // Expand checkbox group when clicking on header (small and medium screens):
  $('.js-check__header').click(function(){
    $('.js-check__popdown').toggleClass('check__popdown check__popdown--selected');
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

  // If an existing checkbox is checked, enable 'deselect all' button:
  if ($('.check__input').is(':checked')) {
  	$('.js-check__button-deselect-all').prop('disabled', false);
  }

  // If a new checkbox is checked, enable 'deselect all' button and enable 'update results' button:
  $('.check__input').click(function(){
    if ($('.check__input').is(':checked')) {
  		$('.js-check__button-deselect-all').prop('disabled', false);
  	}
  $('.js-check__update').prop('disabled', false);
  });

  // If 'update results' button is enabled and clicked, collapse checkbox group and change header styles:
  $('.js-check__update').click(function(){
    if ($('.js-check__update').prop('disabled', false)) {
  		$('.js-check__popdown').toggleClass('check__popdown check__popdown--selected');
  		$('.js-check__header').toggleClass('check__header check__header--selected');
  		$('.js-check__header-text').toggleClass('check__header-text check__header-text--selected');
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
  slidesToShow: 5,
  slidesToScroll: 5,
  responsive: [
    {
      breakpoint: lg, // Bootstrap breakpoint variable set at top of this file
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4,
      }
    },
    {
      breakpoint: md, // Bootstrap breakpoint variable set at top of this file
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3
      }
    },
    {
      breakpoint: sm, // Bootstrap breakpoint variable set at top of this file
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    }
  ]
});
