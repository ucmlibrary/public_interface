/*global Backbone */
/*global _ */
/*exported QueryManager */

'use strict';

var QueryManager = Backbone.Model.extend({
  
  initialize: function() {
    if (sessionStorage.length > 0) {
      this.set({q: sessionStorage.getItem('q')});
    }
  },
  
  setSessionStorage: function(value, key) {
    sessionStorage.setItem(key, value);
  },
  
  set: function(attributes) {
    Backbone.Model.prototype.set.apply(this, arguments);
    _.each(attributes, this.setSessionStorage);
  },
    
  clear: function(options) {
    Backbone.Model.prototype.clear.apply(this, options);
    sessionStorage.clear();
  }
  
});