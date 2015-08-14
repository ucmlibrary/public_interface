/*global Backbone, _, DESKTOP */
/*exported GlobalSearchForm, FacetForm, CarouselContext, ComplexCarousel */

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
    
    // ##### Global Header ##### //

    // Toggle mobile menu with search box:
    // $('.js-global-header__bars-icon').click(function(){
    $(document).on('click', '.js-global-header__bars-icon', function() {
      $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
      $('.js-global-header__mobile-links').toggleClass('.global-header__mobile-links global-header__mobile-links--selected');
    });

    // Toggle only search box:
    //  $('.js-global-header__search-icon').click(function(){
    $(document).on('click', '.js-global-header__search-icon', function() {
      $('.js-global-header__search').toggleClass('global-header__search global-header__search--selected');
    });

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
  el: $('#js-pageContent'),
  events: {
    'submit #js-facet'                        : 'setRefineQuery',
    'click .js-refine-filter-pill'            : 'removeRefineQuery',
    'change .js-facet'                        : 'setFacet',
    'click .js-filter-pill'                   : 'removeFacet',
    'click #thumbnails,#list'                 : 'toggleViewFormat',
    'change #pag-dropdown__sort'              : 'setSort',
    'change #pag-dropdown__view'              : 'setRows',
    'click .js-prev,.js-next,a[data-start]'   : 'setStart',
    'change .pag-dropdown__select--unstyled'  : 'setStart',
    'click .js-item-link'                     : 'goToItemPage',
    'click .js-a-check__link-deselect-all'    : 'deselectAll',
    'click .js-a-check__button-deselect-all'  : 'deselectAll',
    'click .js-a-check__link-select-all'      : 'selectAll',
    'click .js-a-check__button-select-all'    : 'selectAll',
    'click .js-clear-filters'                 : 'clearFilters',
    'click .js-a-check__header'               : 'toggleFacetDropdown',
    'click .js-a-check__update'               : 'updateFacets',
    'click .js-rc-page'                       : 'paginateRelatedCollections'
  },

  setRefineQuery: function(e) {
    this.model.set({start: 0, rq: $.map($('input[name=rq]'), function(el) { return $(el).val(); })});
    e.preventDefault();
  },
  removeRefineQuery: function(e) {
    var txtFilter = $(e.currentTarget).data('slug');
    $('input[form="js-facet"][name="rq"][value="' + txtFilter + '"]').val('');
    this.model.set({start: 0, rq: _.without(this.model.get('rq'), txtFilter)});
  },
  setFacet: function(e) {
    var filterType = $(e.currentTarget).attr('name');
    var attributes = {start: 0};
    attributes[filterType] = $.map($('input[name=' + filterType + ']:checked'), function(el) { return $(el).val(); });
    this.model.set(attributes);
  },
  removeFacet: function(e) {
    var filter_slug = $(e.currentTarget).data('slug');
    if (typeof filter_slug !== 'string') {
      filter_slug = String(filter_slug);
    }
    $('#' + filter_slug).prop('checked', false);
    var filterType = $('#' + filter_slug).attr('name');
    var filter = $('#' + filter_slug).attr('value');
    var attributes = {start: 0};
    attributes[filterType] = _.without(this.model.get(filterType), filter);

    this.model.set(attributes);
  },
  toggleViewFormat: function(e) {
    var viewFormat = $(e.currentTarget).attr('id');
    $('#view_format').prop('value', viewFormat);
    this.model.set({view_format: viewFormat});
  },
  setSort: function(e) {
    this.model.set({start: 0, sort: $(e.currentTarget).val() });
  },
  setRows: function(e) {
    this.model.set({start: 0, rows: $(e.currentTarget).val() });
  },
  setStart: function(e) {
    var start;
    if (e.type === 'click') {
      start = $(e.currentTarget).data('start');
    } else if (e.type === 'change') {
      start = $(e.currentTarget).children('option:selected').attr('value');
    }
    $('#start').val(start);
    this.model.set({ start: start });
  },

  goToItemPage: function(e) {
    if ($(e.currentTarget).data('item_number') !== undefined) {
      this.model.set({
        itemNumber: $(e.currentTarget).data('item_number'),
        itemId: $(e.currentTarget).data('item_id')
      }, {silent: true});

      // add implicit context for campus, institution, and collection pages
      if($('#js-institution').length > 0) {
        if($('#js-institution').data('campus')) {
          this.model.set({
            campus_slug: $('#js-institution').data('campus'),
            referral: 'campus',
            referralName: $('#js-institution').data('referralname')
          }, {silent: true});
        } else {
          this.model.set({
            repository_data: $('#js-institution').data('institution'),
            referral: 'institution',
            referralName: $('#js-institution').data('referralname')
          }, {silent: true});
        }
      } else if ($('#js-collection').length > 0) {
        this.model.set({
          collection_data: $('#js-collection').data('collection'),
          referral: 'collection',
          referralName: $('#js-collection').data('referralname')
        }, {silent: true});
      }

      e.preventDefault();
      $.pjax({
        url: $(e.currentTarget).attr('href'),
        container: '#js-pageContent'
      });
    }
  },

  deselectAll: function(e) { this.selectDeselectAll(e, false); },
  selectAll: function(e) { this.selectDeselectAll(e, true); },
  selectDeselectAll: function(e, checked) {
    var filterElements = $(e.currentTarget).parents('.check').find('.js-facet');
    filterElements.prop('checked', checked);
    filterElements.trigger('change');
    e.preventDefault();
  },
  toggleSelectDeselectAll: function() {
    var facetTypes = $('.check');
    for(var i=0; i<facetTypes.length; i++) {
      var allSelected = !($($(facetTypes[i]).find('.js-facet')).is(':not(:checked)'));
      if (allSelected === true) {
        // for large screens
        $(facetTypes[i]).find('.js-a-check__link-deselect-all').toggleClass('check__link-deselect-all--not-selected check__link-deselect-all--selected');
        $(facetTypes[i]).find('.js-a-check__link-select-all').toggleClass('check__link-select-all--selected check__link-select-all--not-selected');
        $(facetTypes[i]).find('.js-a-check__button-select-all').prop('disabled', true);
        $(facetTypes[i]).find('.js-a-check__update').prop('disabled', false);
      }
      var oneSelected = $(facetTypes[i]).find('.js-facet').is(':checked');
      if (oneSelected === true) {
        $(facetTypes[i]).find('.js-a-check__button-deselect-all').prop('disabled', false);
      }
    }
  },  
  clearFilters: function() {
    var filterElements = $('.js-facet');
    filterElements.prop('checked', false);
    filterElements.trigger('change');
  },

  toggleFacetDropdown: function(e) {
    //close all expanded checkbox groups
    var allSelected = $('.check__popdown--selected');
    for (var i=0; i<allSelected.length; i++) {
      if ($(allSelected[i]).parent().find('input').attr('name') !== $(e.currentTarget).parent().find('input').attr('name')) {
        $(allSelected[i]).toggleClass('check__popdown check__popdown--selected');
        $(allSelected[i]).prev('.js-a-check__header').children('.js-a-check__header-arrow-icon').toggleClass('fa-angle-down fa-angle-up');
      }
    }
    //open this checkbox group
    $(e.currentTarget).next('.js-a-check__popdown').toggleClass('check__popdown check__popdown--selected');
    $(e.currentTarget).children('.js-a-check__header-arrow-icon').toggleClass('fa-angle-down fa-angle-up');
  },
  updateFacets: function(e) {
    e.preventDefault();
    this.facetSearch();
  },
  facetSearch: function() {
    $.pjax({
      url: $('#js-facet').attr('action'),
      container: '#js-pageContent',
      data: this.model.toJSON(),
      traditional: true
    });
  },

  paginateRelatedCollections: function(e) {
    var data_params = this.model.toJSON();
    data_params.rc_page = $(e.currentTarget).data('rc_page');
    //TODO: function(data, status, jqXHR)
    $.ajax({data: data_params, traditional: true, url: '/relatedCollections/', success: function(data) {
        $('#js-relatedCollections').html(data);
      }
    });
  },

  render: function() {
    if(!_.isEmpty(this.model.changed) && !_.has(this.model.changed, 'q')) {
      if(DESKTOP) {
        this.facetSearch();
      }
      else if(_.has(this.model.changed, 'type_ss') ||
      _.has(this.model.changed, 'facet_decade') ||
      _.has(this.model.changed, 'repository_data') ||
      _.has(this.model.changed, 'collection_data')) {
        _.each(this.model.changed, function(value, key) {
          if (key === 'type_ss' || key === 'facet_decade' || key === 'repository_data' || key === 'collection_data') {
            $('.facet-' + key).parents('.check').find('.js-a-check__update').prop('disabled', false);
          }
        });
      }
    }
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  }
});

var CarouselContext = Backbone.View.extend({
  el: $('#js-pageContent'),
  carouselRows: 12,
  carouselConfig: {
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
  },

  events: {
    'click #js-linkBack'      : 'goToSearchResults',
    'beforeChange .carousel'  : 'loadSlides',
    'click .js-item-link'     : 'goToItemPage',
    'click .js-rc-page'       : 'paginateRelatedCollections'
  },
  goToSearchResults: function(e) {
    this.model.unset('itemId', {silent: true});
    this.model.unset('itemNumber', {silent: true});

    if (this.model.get('referral') !== undefined) {
      if (this.model.get('referral') === 'institution') {
        this.model.unset('repository_data', {silent: true});
      } else if (this.model.get('referral') === 'campus') {
        this.model.unset('campus_slug', {silent: true});
      } else if (this.model.get('referral') === 'collection') {
        this.model.unset('collection_data', {silent: true});
      }
      this.model.unset('referral', {silent: true});
      this.model.unset('referralName', {silent: true});
    }

    e.preventDefault();
    $.pjax({
      url: $(e.currentTarget).children('a').attr('href'),
      container: '#js-pageContent',
      data: this.model.toJSON(),
      traditional: true
    });
  },
  loadSlides: function(e, slick, currentSlide, nextSlide) {
    var numFound = $('.js-carousel_item').data('numfound');
    var numLoaded = $('.carousel').slick('getSlick').slideCount;
    // var slidesPerPage = $('.carousel').slick('getSlick').options.slidesToScroll;

    if (numLoaded < numFound && nextSlide > currentSlide) {

      this.carouselStart = parseInt(this.carouselStart) + parseInt(this.carouselRows);

      // function(data, status, jqXHR)
      $.ajax({data: this.toJSON(), traditional: true, url: '/carousel/', success: function(data) {
          $('.carousel').slick('slickAdd', data);
      }});
    }

    // if (nextSlide+slidesPerPage > numFound){ var slideRange = (nextSlide+slidesPerPage) - numFound}
    // else { var slideRange = nextSlide+slidesPerPage }
    //
    // $('.carousel__items-number').text('Displaying ' + (parseInt(nextSlide)+1) + ' - ' + slideRange + ' of ' + numFound);

  },
  goToItemPage: function(e) {
    if ($(e.currentTarget).data('item_number') !== undefined) {
      this.model.set({
        itemNumber: $(e.currentTarget).data('item_number'),
        itemId: $(e.currentTarget).data('item_id')
      }, {silent: true});

      // add implicit context for campus, institution, and collection pages
      if($('#js-institution').length > 0) {
        if($('#js-institution').data('campus')) {
          this.model.set({campus_slug: $('#js-institution').data('campus')}, {silent: true});
        } else {
          this.model.set({repository_data: $('#js-institution').data('institution')}, {silent: true});
        }
      } else if ($('#js-collection').length > 0) {
        this.model.set({collection_data: $('#js-collection').data('collection')}, {silent: true});
      }

      e.preventDefault();
      $.pjax({
        url: $(e.currentTarget).attr('href'),
        container: '#js-itemContainer'
      });
    }
  },
  paginateRelatedCollections: function(e) {
    var data_params = this.model.toJSON();
    delete data_params.itemId;
    delete data_params.itemNumber;
    delete data_params.referral;
    delete data_params.referralName;
    if (e !== undefined) {
      data_params.rc_page = $(e.currentTarget).data('rc_page');
    } else {
      data_params.rc_page = 0;
    }
    //TODO: function(data, status, jqXHR)
    $.ajax({data: data_params, traditional: true, url: '/relatedCollections/', success: function(data) {
        $('#js-relatedCollections').html(data);
      }
    });
  },

  toJSON: function() {
    var context = this.model.toJSON();
    context.start = this.carouselStart;
    context.rows = this.carouselRows;
    return context;
  },

  initCarousel: function() {
    var linkBack, textContent;
    if (this.model.get('referral') === 'institution') {
      linkBack = '/institution/' + this.model.get('repository_data') + '/items/';
      textContent = 'Items at ' + this.model.get('referralName');
    } else if (this.model.get('referral') === 'campus') {
      linkBack = '/' + this.model.get('campus_slug') + '/items/';
      textContent = 'Items at ' + this.model.get('referralName');
    } else if (this.model.get('referral') === 'collection') {
      linkBack = '/collections/' + this.model.get('collection_data') + '/';
      textContent = 'Items in ' + this.model.get('referralName');
    } else {
      linkBack = '/search/';
      textContent = 'Search results for "' + this.model.get('q') + '"';
    }
    $('#js-linkBack').html('<a href="' + linkBack + '" data-pjax="js-pageContent">' + textContent + '</a>');
    this.carouselStart = this.model.get('itemNumber');
    
    var data_params = this.toJSON();
    delete data_params.referral;
    delete data_params.referralName;
    delete data_params.itemNumber;

    //TODO: function(data, status, jqXHR)
    $.ajax({
      url: '/carousel/',
      data: data_params,
      traditional: true, 
      success: (function(that) {
        return function(data) {
          $('#js-carousel').html(data);
          $('.carousel').show();
          $('.carousel').slick(that.carouselConfig);
          $('.carousel__items-number').html($(data).data('numfound') + ' ' + $('.carousel__items-number').html());
        };
      }(this))
    });
  },

  initialize: function() {
    this.initCarousel();
    this.paginateRelatedCollections();
  }
});

var ComplexCarousel = Backbone.View.extend({
  el: $('#js-pageContent'),
  carouselConfig: {
    infinite: false,
    speed: 300,
    slidesToShow: 20,
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
  },

  events: {
    'click .js-component-link'  : 'getComponent',
  },
  getComponent: function(e) {
    var data_params = {order: $(e.currentTarget).data('item_id')};

    e.preventDefault();
    $.pjax({
      type: 'GET',
      url: $(e.currentTarget).attr('href'),
      container: '#js-itemContainer',
      data: data_params,
      traditional: true,
      scrollTo: 440
    });
  },

  initCarousel: function() {
    $('.carousel-complex').show();
    $('.carousel-complex__item-container').slick(this.carouselConfig);
  },

  initialize: function() {
    this.initCarousel();
  }
});