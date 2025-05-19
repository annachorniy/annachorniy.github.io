/**
 * Resizer enclosure
 * @param  {library}  $ jQuery dependency
 * @return {object}     Enclosure interface
 */
var resizer = (function ($) {

  var MAX_HEIGHT = $('#album').data('max-height') || 400,
    IMAGE_PADDING = 6,
    CONTAINER_PADDING = 10,
    heights;

  function resetConstants() {
    var container = $('#album'),
      images = container.find('img');

    IMAGE_PADDING = images.first().outerWidth(true) - images.first().width();
    CONTAINER_PADDING = container.first().outerWidth(true) - container.first().width();
  }

  /**
   * Get row height for current array of images
   * @param   {array}   images  Array of images to squeeze into row
   * @param   {height}  width   Width of container
   * @return  {float}           Height of images if they were forced into 'width'
   */
  function getRowHeight(images, width) {
    var totalAspect = 0;
    width -= images.length * IMAGE_PADDING;

    for (var i = 0, el; i < images.length; ++i) {
      el = $(images[i])[0];
      totalAspect += (el.naturalWidth / el.naturalHeight);
    }
    return width / totalAspect;
  }

  /**
   * Returns max height for a set of images using local and global max-height attributes
   * @param  {Array}  images  Array of images
   * @return {Long}           Max height
   */
  function getMaxHeight(images) {
    var maxh = MAX_HEIGHT;
    for (var i=0, this_max; i<images.length; i++) {
      this_max = images[i].getAttribute('data-max-height');
      if (this_max && this_max < maxh) maxh = this_max
    }
    return maxh;
  }

  /**
   * Set size of an array of images: height supplied, width calculated from 
   *   aspect ratio
   * @param   {array}     images  Array of images to set
   * @param   {height}    height  CSS height
   * @return  {undefined}
   */
  function setImageSizes(images, height) {
    heights.push(height);
    for (var i = 0, asp, el; i < images.length; ++i) {
      el = $(images[i]);
      asp = el[0].naturalWidth / el[0].naturalHeight;
      el.css({
        width: height * asp,
        height: height
      });
    }
  }

  /**
   * Main function call
   * @return {undefined}
   */
  function resizeImages() {
    var container = $('#album'),
      images = container.find('img'),
      containerWidth;

    /* reset and set config vars */
    heights = [];
    resetConstants();
    containerWidth = container.width() - CONTAINER_PADDING

    /**
     * Recursively fit images into rows
     * @param  {Array}  images 
     * @return {Array}  slice   Remaining, unsized images
     */
    function fitIntoRow(images) {
      if (!images.length) return;
      var slice, maxh, rowHeight;

      for (var maxh, i = 1; i < images.length + 1; ++i) {
        slice = images.slice(0, i);
        maxh = getMaxHeight(slice);
        rowHeight = getRowHeight(slice, containerWidth);
        if (rowHeight < maxh) {
          setImageSizes(slice, Math.min(rowHeight, maxh));
          return fitIntoRow(images.slice(i));
        }
      }
      return slice;
    }

    /* Resize images and size terminal orphans (save the orphans) */
    var remaining_slice = fitIntoRow(images);
    if (typeof remaining_slice !== "undefined" && remaining_slice.length) setImageSizes(remaining_slice, getMaxHeight(remaining_slice));
  }
  
  /**
   * return interface
   */
  return {
    resize: resizeImages
  }
})(jQuery);

/**
 * ImageMuncher enclosure - applies the 'alt' and 'src' attribute of child to its parent on 'title' and 'href', respectively
 * @param  {library}  $ jQuery dependency
 * @return {object}     Enclosure interface
 */
var imageMuncher = (function ($) {

  var container;

  /**
   * Sets some attributes of the parent based on the child properties
   */
  function setParentAttributes() {
    container = $('#album');
    if (container.length < 1) return;

    container.find('img').each(function (i, el) {
      var $el = $(el);
      var $parent = $el.parent();

      $parent.attr('title', $el.attr('alt'));
      $parent.attr('href', $el.attr('src'));
    });
  }

  /**
   * return interface
   */
  return {
    run: setParentAttributes,
  }
})(jQuery);

/**
 * Event Handlers
 */
$(document).on('ready', function () {
  $('#album').removeClass('no-js'); // pseudo-modernizr in case she wants page to degrade properly
  resizer.resize();
  imageMuncher.run();
  magnificInit();
});
$('img').on('load', resizer.resize); // re-calc on every image load because I am lazy and can't figure out an easier way
$(window).resize(resizer.resize); 

/**
 * Init Magnific-popup plugin
 */
var magnificInit = function () {
  $('#album').magnificPopup({
    delegate: 'a.photolink',
    closeOnContentClick: true,
    showCloseBtn: false,
    type: 'image',
    gallery: {
      enabled: true,
      preload: [1, 3],
      navigateByImgClick: false,
      tCounter: ''
    },
    image: {
      titleSrc: function (obj) {
        return obj.el.children('img').attr('alt');
      },
      cursor: 'justregularplease'
    },
    mainClass: 'mfp-with-zoom',
    zoom: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
      opener: function (openerElement) {
        return openerElement.is('img') ? openerElement : openerElement.find('img');
      }
    }
  });
};

/**
 * Attach Stat Counter
 */
var sc_project = 10551255,
  sc_invisible = 1,
  sc_security = "7218531a",
  sc_jshost = (("https:" == document.location.protocol) ?
    "https://secure." : "http://www.");

var counter_script = document.createElement('script');
counter_script.src = sc_jshost + 'statcounter.com/counter/counter.js'
document.getElementsByTagName('body')[0].appendChild(counter_script);
