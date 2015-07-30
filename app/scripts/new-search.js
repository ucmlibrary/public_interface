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
        model.set({rq: $.map($('input[name=rq]'), function(el) { return $(el).val(); })});
        e.preventDefault();
      };
    }(this.model)));
    
    $(document).on('click', '.js-refine-filter-pill', (function(model) {
      return function() { 
        //update html
        var txtFilter = $(this).data('slug');
        $('input[form="js-facet"][name="rq"][value="' + txtFilter + '"]').val("");
        //update model
        if (_.without(model.get('rq'), txtFilter).length === 0) {
          model.unset('rq');
        } else {
          model.set({rq: _.without(model.get('rq'), txtFilter)});
        }
      };
    }(this.model)));
    
    this.listenTo(this.model, 'change:rq', this.render);
  },
  
  render: function() {
    if(this.model.has('q')) {
      $.pjax({
        url: $('#js-searchForm').attr('action'),
        container: '#js-pageContent',
        data: this.model.toJSON(),
        traditional: true
      });
    }
  }
//
//   bind: function() {
//     $('#thumbnails').on('click', (function(model) {
//       return function() { model.set({view_format: 'thumbnails'}); };
//     }(this.model)));
//
//     $('#list').on('click', (function(model) {
//       return function() { model.set({view_format: 'list'}); };
//     }(this.model)));
//
//   }
});