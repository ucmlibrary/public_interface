/*global Backbone */
/*global _ */
/*exported QueryManager */

'use strict';

var QueryManager = Backbone.Model.extend({
  
  initialize: function() {
    if (sessionStorage.length > 0) {
      this.set({q: sessionStorage.getItem('q')});
      if (sessionStorage.getItem('rq') !== null) { this.set({rq: JSON.parse(sessionStorage.getItem('rq'))}); }
    }
  },
  
  setSessionStorage: function(value, key) {
    if (key == 'rq') {
      sessionStorage.setItem('rq', JSON.stringify(value));
    } else {
      sessionStorage.setItem(key, value);
    }
  },
  
  unsetSessionStorage: function(key) {
    sessionStorage.removeItem(key);
  },
  
  set: function(attributes) {
    Backbone.Model.prototype.set.apply(this, arguments);
    _.each(attributes, this.setSessionStorage);
  },
  
  unset: function(attributes) {
    Backbone.Model.prototype.unset.apply(this, arguments);
    this.unsetSessionStorage(attributes);
  },
  
  clear: function(options) {
    Backbone.Model.prototype.clear.apply(this, arguments);
    sessionStorage.clear();
  }  
});