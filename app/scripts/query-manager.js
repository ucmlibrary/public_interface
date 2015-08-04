/*global Backbone */
/*global _ */
/*exported QueryManager */

'use strict';

var QueryManager = Backbone.Model.extend({
  
  defaultValues: {
    q: '',
    rq: '',
    view_format: 'thumbnails',
    sort: 'relevance', 
    rows: '16', 
    start: 0
  },
  
  initialize: function() {
    if (sessionStorage.length > 0) {
      this.set({q: sessionStorage.getItem('q')});
      if (sessionStorage.getItem('rq') !== null) { this.set({rq: JSON.parse(sessionStorage.getItem('rq'))}); }
      if (sessionStorage.getItem('view_format') !== null) { this.set({view_format: sessionStorage.getItem('view_format')}); }
      if (sessionStorage.getItem('sort') !== null) { this.set({sort: sessionStorage.getItem('sort')}); }
      if (sessionStorage.getItem('rows') !== null) { this.set({rows: sessionStorage.getItem('rows')}); }
      if (sessionStorage.getItem('start') !== null) { this.set({start: sessionStorage.getItem('start')}); }
    }
  },
  
  setSessionStorage: function(value, key) {
    if (_.isArray(key)) {
      sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      sessionStorage.setItem(key, value);
    }
  },
  
  unsetSessionStorage: function(key) {
    sessionStorage.removeItem(key);
  },
    
  set: function(key, value, options) {
    if (key == null) return this;
    
    var attrs
    if (typeof key === 'object') {
      attrs = key;
      options = value;
    } else {
      (attrs = {})[key] = value;
    }
    options || (options = {});
        
    // if we're setting an attribute to default, remove it from the list
    _.each(attrs, (function(that) {
      return function(value, key, list) {
        if (that.defaultValues[key] !== undefined && that.defaultValues[key] === value) {
          delete list[key];
          that.unsetSessionStorage(key);
          if (_.isEmpty(list)) {
            that.unset(key);
          } else {
            that.unset(key, {silent: true});
          }
        }
      };
    }(this)));
        
    Backbone.Model.prototype.set.apply(this, [attrs, options]);
    
    if (!options.unset) {
      _.each(attrs, this.setSessionStorage);
    }
  },
    
  clear: function(options) {
    Backbone.Model.prototype.clear.apply(this, arguments);
    sessionStorage.clear();
  }  
});