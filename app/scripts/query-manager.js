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
    rows: '24',
    start: 0
  },
  
  initialize: function() {
    if (sessionStorage.length > 0) {
      // this.set({q: sessionStorage.getItem('q')});
      // for (var key in sessionStorage) {
      //   this.set(key, sessionStorage.getItem(key))
      //   console.log(key);
      //   console.log(sessionStorage.getItem(key));
      // }
      if (sessionStorage.getItem('q') !== null) { this.set({q: sessionStorage.getItem('q')}); }
      if (sessionStorage.getItem('rq') !== null) { this.set({rq: JSON.parse(sessionStorage.getItem('rq'))}); }
      if (sessionStorage.getItem('view_format') !== null) { this.set({view_format: sessionStorage.getItem('view_format')}); }
      if (sessionStorage.getItem('sort') !== null) { this.set({sort: sessionStorage.getItem('sort')}); }
      if (sessionStorage.getItem('rows') !== null) { this.set({rows: sessionStorage.getItem('rows')}); }
      if (sessionStorage.getItem('start') !== null) { this.set({start: sessionStorage.getItem('start')}); }
      
      if (sessionStorage.getItem('type_ss') !== null) { this.set({type_ss: JSON.parse(sessionStorage.getItem('type_ss'))}); }
      if (sessionStorage.getItem('facet_decade') !== null) { this.set({type_ss: JSON.parse(sessionStorage.getItem('facet_decade'))}); }      
      if (sessionStorage.getItem('repository_data') !== null) { this.set({repository_data: JSON.parse(sessionStorage.getItem('repository_data'))}); }
      if (sessionStorage.getItem('collection_data') !== null) { this.set({collection_data: JSON.parse(sessionStorage.getItem('collection_data'))}); }
      if (sessionStorage.getItem('campus_slug') !== null) { this.set({campus_slug: sessionStorage.getItem('campus_slug')}); }
      
      if (sessionStorage.getItem('itemNumber') !== null) { this.set({itemNumber: sessionStorage.getItem('itemNumber')}); }
      if (sessionStorage.getItem('itemId') !== null) { this.set({itemId: sessionStorage.getItem('itemId')}); }
      if (sessionStorage.getItem('referral') !== null) { this.set({referral: sessionStorage.getItem('referral')}); }
      if (sessionStorage.getItem('referralName') !== null) { this.set({referralName: sessionStorage.getItem('referralName')}); }

    }
  },
  
  setSessionStorage: function(value, key) {
    if (_.isArray(value)) {
      sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      sessionStorage.setItem(key, value);
    }
  },
  
  unsetSessionStorage: function(value, key) {
    if (key === undefined) {
      key = value;
    }
    sessionStorage.removeItem(key);
  },
    
  set: function(key, value, options) {
    if (key === null) { return this; }
    
    var attrs;
    if (typeof key === 'object') {
      attrs = key;
      options = value;
    } else {
      (attrs = {})[key] = value;
    }
    
    options = options || {};
        
    // if we're setting an attribute to default, remove it from the list
    _.each(attrs, (function(that) {
      return function(value, key, list) {
        if (value !== undefined) {
          if ((that.defaultValues[key] !== undefined && that.defaultValues[key] === value) || value.length === 0) {
            delete list[key];
            that.unsetSessionStorage(key);
            if (_.isEmpty(list)) {
              that.unset(key);
            } else {
              that.unset(key, {silent: true});
            }
          }          
        }
      };
    }(this)));
        
    Backbone.Model.prototype.set.apply(this, [attrs, options]);
    
    if (!options.unset) {
      _.each(attrs, this.setSessionStorage);
    } else {
      _.each(attrs, this.unsetSessionStorage);
    }
  },
    
  clear: function() {
    Backbone.Model.prototype.clear.apply(this, arguments);
    sessionStorage.clear();
  }, 
});
