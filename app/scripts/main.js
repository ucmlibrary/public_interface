'use strict'; // for jshint

// ##### Popover ##### //

$(document).ready(function(){
  $('.popit').popover({
    trigger: 'hover',
    placement: 'right auto',
    html: true
  });
});

// ##### Global Header ##### //

$(document).ready(function(){
	
	// Toggle mobile menu with search box:
	$('.js-global-header__bars-icon').click(function(){
    $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
    $('.js-global-header__mobile-links').toggleClass('.global-header__mobile-links global-header__mobile-links--selected');
  });

  // Toggle only search box:
  $('.js-global-header__search-icon').click(function(){
    $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
  });
});

// ##### Checkbox Groups ##### //

$(document).ready(function(){

	// Toggle pop-down checkbox group header (small and medium screens):
	$('.js-check__header').click(function(){
    $('.js-check__popdown').toggleClass('check__popdown check__popdown--selected');
  });

  // Select all or deselect all checkboxes (small and medium screens):
  $('.js-check__button-select-all').click(function(){
    $('.check__input').prop('checked', true);
    $('.js-check__button-deselect-all').prop('disabled', false);
  });
  $('.js-check__button-deselect-all').click(function(){
    $('.check__input').prop('checked', false);
  });

  // Select all or deselect all checkboxes (large screens):
  $('.js-check__link-select-all').click(function(){
    $('.check__input').prop('checked', true);
    $('.js-check__link-deselect-all').toggleClass('check__link-deselect-all--not-selected check__link-deselect-all--selected');
    $('.js-check__link-select-all').toggleClass('check__link-select-all--selected check__link-select-all--not-selected');
    $('.js-check__button-deselect-all').prop('disabled', false);
  });
  $('.js-check__link-deselect-all').click(function(){
    $('.check__input').prop('checked', false);
    $('.js-check__link-deselect-all').toggleClass('check__link-deselect-all--selected check__link-deselect-all--not-selected');
    $('.js-check__link-select-all').toggleClass('check__link-select-all--not-selected check__link-select-all--selected');
  });

  // If a checkbox is checked, enable 'deselect all' button:
  $('.check__input').click(function(){
    if ($('.check__input').is(':checked')) {
    	$('.js-check__button-deselect-all').prop('disabled', false);
  	}
  });
});

// ##### Carousel ##### //

$(document).ready(function(){
	
	// Get Bootstrap CSS breakpoints;
	var lg = $('.bs-lg-screen').css('width');
	var md = $('.bs-md-screen').css('width');
	var sm = $('.bs-sm-screen').css('width');

	lg = lg.replace('px', '');
	md = md.replace('px', '');
	sm = sm.replace('px', '');

	// Display Bootstrap breakpoint for testing:
	// document.getElementById('test').innerHTML = lg;

	// Slick settings:
	$('.carousel').slick({
	  infinite: false,
	  slidesToShow: 5,
	  slidesToScroll: 5,
	  responsive: [
	    {
	      breakpoint: lg,
	      settings: {
	        slidesToShow: 4,
	        slidesToScroll: 4,
	      }
	    },
	    {
	      breakpoint: md,
	      settings: {
	        slidesToShow: 3,
	        slidesToScroll: 3
	      }
	    },
	    {
	      breakpoint: sm,
	      settings: {
	        slidesToShow: 2,
	        slidesToScroll: 2
	      }
	    }
	  ]
	});
});
