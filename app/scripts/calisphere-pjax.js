'use strict'; 

$(document).ready(function() {
  $('html').removeClass('no-jquery');
  $.pjax.defaults.timeout = 5000;
  $(document).pjax('a[data-pjax=js-pageContent]', '#js-pageContent');
  
  $(document).on('pjax:beforeReplace', '#js-pageContent', function() {
    if($('#js-mosaicContainer').length > 0) {
      $('#js-mosaicContainer').infinitescroll('destroy');
    }
  });
  
  $(document).on('pjax:end', '#js-pageContent', function() {
    if($('#js-mosaicContainer').length > 0) {
      $('#js-mosaicContainer').infinitescroll({
        navSelector: '#js-collectionPagination',
        nextSelector: '#js-collectionPagination a.js-next',
        itemSelector: '#js-mosaicContainer div.js-collectionMosaic',
        debug: false,
        loading: {
          finishedMsg: 'All collections showing.',
          img: 'http://localhost:9000/images/orange-spinner.gif',
          msgText: '',
          selector: '#js-loading'
        }
      });
    }
  });
  
});