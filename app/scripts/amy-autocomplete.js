// Messy and half-baked, will want to revisit this 
// and modify either jquery ui's autocomplete or chosen.js
// both of which handle dirty input better

function AutocompleteOption(option_row) {
  this.facet = $(option_row).find('input').val();
  this.facet_slug = $(option_row).find('input').attr('id');
  this.count = $(option_row).data('count');
  if ($(option_row).find('input').attr('checked') == 'checked') {
    this.active = 'checked'
  } else {
    this.active = ''
  }
};

function Autocomplete(container) {
  this.container = container;
  this.facet_type = container.attr('id');
  
  this.autocomplete_field = container.find('.autocomplete');
  this.options_container = container.find('.options-container');
  this.options_table = container.find('.options-container').find('table');
  
  var autocomplete_options = [ ];
  var i, table_rows = this.options_table.find('tr');
  
  for (i=0; i<table_rows.length; i++) {
    var autocomplete_option = new AutocompleteOption($(table_rows[i]));
    autocomplete_options.push(autocomplete_option);
  }
  
  this.autocomplete_options = autocomplete_options;
  
  this.register_observers();
};

Autocomplete.prototype.register_observers = function() {
  var _this = this;
  this.autocomplete_field.keydown(function(e) {
    return _this.keydown_checker(e);
  });
  this.autocomplete_field.keyup(function(e) {
    return _this.keyup_checker(e);
  });
  this.options_table.bind('mousewheel DOMMouseScroll', function(e) {
    return _this.search_results_mousewheel(e);
  });
  
};

Autocomplete.prototype.keydown_checker = function(evt) {
  var stroke, _ref1;
  stroke = (_ref1 = evt.which) != null ? _ref1 : evt.keyCode;
  switch (stroke) {
    case 13:
      evt.preventDefault();
      break;
  }
};

Autocomplete.prototype.keyup_checker = function(evt) {
  var stroke, _ref;
  stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
  switch (stroke) {
    case 13:
      evt.preventDefault();
      break;
    case 9:
    case 37:
    case 38:
    case 39:
    case 40:
    case 16:
    case 91:
    case 17:
      break;
    default:
      return this.results_search();
  }
};

Autocomplete.prototype.get_search_text = function() {
  if (this.autocomplete_field.val() === 'Enter Institution Owner Name' || this.autocomplete_field.val() === 'Enter Collection Name') {
    return "";
  } else {
    return (this.autocomplete_field.val());
  }
};

Autocomplete.prototype.results_search = function() {
  var results, searchText, regex, i;
  results = [ ];
  searchText = this.get_search_text();
  regex = new RegExp(searchText);
  
  for (i=0; i<this.autocomplete_options.length; i++) {
    if (this.autocomplete_options[i].facet.match(regex)) {
      results.push(this.autocomplete_options[i]);
    }
  }
  this.makeRows(results);
};

Autocomplete.prototype.makeRows = function(results) {
  var i;
  $(this.options_table).find('tbody').empty();
  for (i=0; i<results.length; i++) {
    
    var option_row = _.template('<tr data-count="<%= count %>">\
      <td style="padding: 0px; width: 80%">\
        <div class="checkbox" style="font-size: 14px; margin: 5px 0">\
          <label><%= facet %> (<%= count %>)</label>\
        </div>\
      </td>\
      <td style="padding: 6px 0 0 20px;">\
        <input id="<%= facet_slug %>" class="facet facet-<%= facet_type %>" form="facet" type="checkbox" \
          name="<%= facet_type %>" value="<%= facet %>" <%= active %>/>\
      </td>\
    </tr>');
    
    var option_row_template = option_row({count: results[i].count, 
      facet: results[i].facet, 
      facet_slug: results[i].facet_slug, 
      facet_type: this.facet_type, 
      active: results[i].active
    });
    
    $(this.options_table).append(option_row_template);
    
    $('.facet').change(function() {
      $('#facet').submit();
    });
  }
};

Autocomplete.prototype.search_results_mousewheel = function(evt) {
  var delta;
  if (evt.originalEvent) {
    delta = -evt.originalEvent.wheelDelta || evt.originalEvent.detail;
  }
  if (delta != null) {
    evt.preventDefault();
    if (evt.type === 'DOMMouseScroll') {
      delta = delta * 40;
    }
      return this.options_container.scrollTop(delta + this.options_container.scrollTop());
  }
};
