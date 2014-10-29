'use strict'; // for jshint

// ##### Global Header ##### //

$(document).ready(function(){
	$('.js-global-header__bars-icon').click(function(){
    $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
    $('.js-global-header__mobile-links').toggleClass('.global-header__mobile-links global-header__mobile-links--selected');
  });
  $('.js-global-header__search-icon').click(function(){
    $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
  });
});

// ##### Global Header ##### //

$(document).ready(function(){
	$('.js-check__header').click(function(){
    $('.js-check__popdown').toggleClass('check__popdown check__popdown--selected');
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
