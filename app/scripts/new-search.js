/*global Backbone */
/*global _ */
/*exported GlobalSearchForm */

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

// var FacetForm = Backbone.View.extend({
//   initialize: function() {
//     this.bind()
//   },
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
// });