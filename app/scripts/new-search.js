/*global Backbone */
/*global _ */
/*exported GlobalSearchForm */
/*exported FacetForm */

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