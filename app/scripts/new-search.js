/*global Backbone */
/*global _ */
/*exported GlobalSearchForm */
/*exported FacetForm */
/*exported CarouselContext */

'use strict';

var GlobalSearchForm = Backbone.View.extend({
  initialize: function() {
    //on submit, change the model, don't submit the form
    $('#js-searchForm, #js-footerSearch').on('submit', (function(model) {
      return function(e) { 
        model.set({q: $(this).find('input[name=q]').val()}); 
        e.preventDefault();
      };
    }(this.model)));
    
    //when the model changes, 
    this.listenTo(this.model, 'change:q', this.render);
  }, 
  
  render: function() {
    if(this.model.has('q')) {
      //get rid of all other search parameters
      var q = this.model.get('q');
      this.model.clear({silent: true});
      this.model.set({q: q}, {silent: true});
      //perform the search!
      $.pjax({
        url: $('#js-searchForm').attr('action'),
        container: '#js-pageContent',
        data: this.model.toJSON()
      });
    }
    
    _.each($('#js-searchForm, #js-footerSearch'), (function(model) {
      return function(form) {
        $('input[name=q][form=' + $(form).attr('id') + ']').val(model.get('q'));
      };
    }(this.model)));
  }
});

var FacetForm = Backbone.View.extend({
  initialize: function() {
    this.carouselRows = 12;
    
    $(document).on('submit', '#js-facet', (function(model) {
      return function(e) {
        model.set({start: 0, rq: $.map($('input[name=rq]'), function(el) { return $(el).val(); })});
        e.preventDefault();
      };
    }(this.model)));
    
    $(document).on('click', '.js-refine-filter-pill', (function(model) {
      return function() { 
        //update html
        var txtFilter = $(this).data('slug');
        $('input[form="js-facet"][name="rq"][value="' + txtFilter + '"]').val('');
        //update model
        // if (_.without(model.get('rq'), txtFilter).length === 0) {
        //   model.set({start: 0, rq: ''});
        // } else {
        model.set({start: 0, rq: _.without(model.get('rq'), txtFilter)});
        // }
      };
    }(this.model)));
    
    $(document).on('change', '.js-facet', (function(model) {
      return function() {
        var filterType = $(this).attr('name');
        var attributes = {start: 0};
        attributes[filterType] = $.map($('input[name=' + filterType + ']:checked'), function(el) { return $(el).val(); });
        model.set(attributes);
      };
    }(this.model)));
    
    $(document).on('click', '.js-filter-pill', (function(model) {
      return function() {
        var filter_slug = $(this).data('slug');
        if (typeof filter_slug !== 'string') {
          filter_slug = String(filter_slug);
        }
        $('#' + filter_slug).prop('checked', false);
        var filterType = $('#' + filter_slug).attr('name');
        var filter = $('#' + filter_slug).attr('value');
        var attributes = {start: 0};
        attributes[filterType] = _.without(model.get(filterType), filter);

        model.set(attributes);
      };
    }(this.model)));
    
    $(document).on('click', '#thumbnails', (function(model) {
      return function() { 
        $('#view_format').prop('value', 'thumbnails');
        model.set({view_format: 'thumbnails'}); 
      };
    }(this.model)));
    
    $(document).on('click', '#list', (function(model) {
      return function() { 
        $('#view_format').prop('value', 'list');
        model.set({view_format: 'list'}); 
      };
    }(this.model)));
    
    $(document).on('change', '#pag-dropdown__sort', (function(model) {
      return function() {
        model.set({start: 0, sort: $(this).val() });
      };
    }(this.model)));
    
    $(document).on('change', '#pag-dropdown__view', (function(model) {
      return function() {
        model.set({start: 0, rows: $(this).val() });
      };
    }(this.model)));
    
    $(document).on('click', '.js-prev, .js-next', (function(model) {
      return function() {
        var start = $(this).data('start');
        $('#start').val(start);
        model.set({ start: start });
      };
    }(this.model)));
    
    $(document).on('change', '.pag-dropdown__select--unstyled', (function(model){
      return function() {
        var start = $(this).children('option:selected').attr('value');
        $('#start').val(start);
        model.set({ start: start });
      };
    }(this.model)));
    
    $(document).on('click', 'a[data-start]', (function(model){
      return function() {
        var start = $(this).data('start');
        $('#start').val(start);
        model.set({ start: start });
      };
    }(this.model)));
    
    $(document).on('click', '.js-item-link', (function(that){
      return function(e) {
        if ($(this).data('item_number') !== undefined) {
          that.model.set({
            carouselStart: $(this).data('item_number'), 
            carouselRows: that.carouselRows, 
            itemId: $(this).data('item_id')
          }, {silent: true});
          
          // add implicit context for campus, institution, and collection pages
          if($('#js-institution').length > 0) {
            if($('#js-institution').data('campus')) {
              that.model.set({campus: $('#js-institution').data('campus')}, {silent: true});
            } else {
              that.model.set({repository_data: $('#js-institution').data('institution')}, {silent: true});
            }
          } else if ($('#js-collection').length > 0) {
            that.model.set({collection_data: $('#js-collection').data('collection')}, {silent: true});
          }
          
          e.preventDefault();
          $.pjax({
            url: $(this).attr('href'),
            container: '#js-pageContent'
          });
        }
      };
    }(this)));
    
    this.listenTo(this.model, 'change', this.render);
  },
  
  render: function() {
    if(!_.isEmpty(this.model.changed) && !_.has(this.model.changed, 'q')) {
      $.pjax({
        url: $('#js-facet').attr('action'),
        container: '#js-pageContent',
        data: this.model.toJSON(),
        traditional: true
      });
    }
  }
});

var CarouselContext = Backbone.View.extend({
  initialize: function() {
    $('#js-linkBack').html('<a href="/search/">Search results for ' + this.model.get('q') + '</a>');
    $(document).on('click', '#js-linkBack a', (function(that){
      return function(e) {
        that.model.unset('carouselStart', {silent: true});
        that.model.unset('carouselRows', {silent: true});
        that.model.unset('itemId', {silent: true});
        e.preventDefault();
        $.pjax({
          url: $(this).attr('href'),
          container: '#js-pageContent',
          data: that.model.toJSON(),
          traditional: true
        });        
      };
    }(this)));
    
    var conf = {
      infinite: false,
      speed: 300,
      slidesToShow: 10,
      slidesToScroll: 6,
      variableWidth: true,
      lazyLoad: 'ondemand',
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            infinite: true,
            // slidesToShow: 8,
            slidesToScroll: 8,
            variableWidth: true
          }
        },
        {
          breakpoint: 900,
          settings: {
            infinite: true,
            // slidesToShow: 6,
            slidesToScroll: 6,
            variableWidth: true
          }
        },
        {
          breakpoint: 650,
          settings: {
            infinite: true,
            // slidesToShow: 4,
            slidesToScroll: 4,
            variableWidth: true
          }
        }
      ]
    };    
    
    $.ajax({
      url: '/carousel/',
      data: this.model.carouselContext(), 
      traditional: true, 
      success: function(data, status, jqXHR) {
        $('#js-carousel').html(data);
        $('.carousel').show();
        $('.carousel').slick(conf);
      }
    });
  }
});