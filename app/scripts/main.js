// Slick carousel
'use strict'; // for jshint

$(document).ready(function(){
	var lg = $('.container').css('width');
	// var md = $('.bootstrap-md-screen').css('width');
	// var sm = $('.bootstrap-sm-screen').css('width');

	document.getElementById('test').innerHTML = lg;

	$('.carousel').slick({
	  dots: true,
	  infinite: false,
	  speed: 300,
	  slidesToShow: 5,
	  slidesToScroll: 5,
	  responsive: [
	    {
	      // breakpoint: 1200,
	      breakpoint: lg,
	      settings: {
	        slidesToShow: 4,
	        slidesToScroll: 4,
	        infinite: true,
	        dots: true
	      }
	    },
	    {
	      breakpoint: 992,
	      // breakpoint: md,
	      settings: {
	        slidesToShow: 3,
	        slidesToScroll: 3
	      }
	    },
	    {
	      breakpoint: 768,
	      // breakpoint: sm,
	      settings: {
	        slidesToShow: 2,
	        slidesToScroll: 2
	      }
	    }
	  ]
	});
});
