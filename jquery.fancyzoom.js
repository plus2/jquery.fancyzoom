(function($){

  $.fn.fancyZoom = function(settings) {
    var options   = $.extend({}, $.fn.fancyZoom.defaults, settings || {});
    var directory = options.directory;

    initialize(directory);

    var fz = new FancyZoom(options);

    this.each(function(i) {
      $(this).click(fz.show);
    });

    return this;
  };

  $.fn.fancyZoom.defaults = {
    directory: 'images'
  };

  function initialize(directory) {
    if ($('#zoom').length == 0) {
      var ext = $.browser.msie ? 'gif' : 'png';
      var html = '<div id="zoom" style="display:none;"> \
                    <table id="zoom_table" style="border-collapse:collapse; width:100%; height:100%;"> \
                      <tbody> \
                        <tr> \
                          <td class="tl" style="background:url(' + directory + '/tl.' + ext + ') 0 0 no-repeat; width:20px; height:20px; overflow:hidden;" /> \
                          <td class="tm" style="background:url(' + directory + '/tm.' + ext + ') 0 0 repeat-x; height:20px; overflow:hidden;" /> \
                          <td class="tr" style="background:url(' + directory + '/tr.' + ext + ') 100% 0 no-repeat; width:20px; height:20px; overflow:hidden;" /> \
                        </tr> \
                        <tr> \
                          <td class="ml" style="background:url(' + directory + '/ml.' + ext + ') 0 0 repeat-y; width:20px; overflow:hidden;" /> \
                          <td class="mm" style="background:#fff; vertical-align:top; padding:10px;"> \
                            <div id="zoom_content"> \
                            </div> \
                          </td> \
                          <td class="mr" style="background:url(' + directory + '/mr.' + ext + ') 100% 0 repeat-y;  width:20px; overflow:hidden;" /> \
                        </tr> \
                        <tr> \
                          <td class="bl" style="background:url(' + directory + '/bl.' + ext + ') 0 100% no-repeat; width:20px; height:20px; overflow:hidden;" /> \
                          <td class="bm" style="background:url(' + directory + '/bm.' + ext + ') 0 100% repeat-x; height:20px; overflow:hidden;" /> \
                          <td class="br" style="background:url(' + directory + '/br.' + ext + ') 100% 100% no-repeat; width:20px; height:20px; overflow:hidden;" /> \
                        </tr> \
                      </tbody> \
                    </table> \
                    <a href="#" title="Close" id="zoom_close" style="position:absolute; top:0; left:0;"> \
                      <img src="' + directory + '/closebox.' + ext + '" alt="Close" style="border:none; margin:0; padding:0;" /> \
                    </a> \
                  </div>';
      $('body').append(html);
    }
  }

  function windowGeometry() {
    var width       = window.innerWidth  || (window.document.documentElement.clientWidth || window.document.body.clientWidth);
    var height      = window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight);
    var x           = window.pageXOffset || (window.document.documentElement.scrollLeft || window.document.body.scrollLeft);
    var y           = window.pageYOffset || (window.document.documentElement.scrollTop || window.document.body.scrollTop);
    return {'width': width, 'height': height, 'x': x, 'y': y};
  }

  function FancyZoom(options) {
    var options = options;

    var zoom          = $('#zoom');
    var zoom_table    = $('#zoom_table');
    var zoom_close    = $('#zoom_close');
    var zoom_content  = $('#zoom_content');
    var middle_row    = $('td.ml,td.mm,td.mr');

    var zooming   = false;

    this.show = function(e) {
      if (zooming) {
        return false;
      } else {
        zooming = true;
      }

      var content_div = $($(this).attr('href'));
      var width       = (options.width  || content_div.width()) + 60;
      var height      = (options.height || content_div.height()) + 60;

      var wGeometry = windowGeometry();
      var newTop    = options.top  || Math.max((wGeometry.height/2) - (height/2) + wGeometry.y, 0);
      var newLeft   = options.left || (wGeometry.width/2) - (width/2);

      fixBackgroundsForIE();
      scaleImages();

      setStartState(e.pageY, e.pageX);

      // Animate to end state. #TODO move into function
      $('#zoom').animate({
        top     : newTop + 'px',
        left    : newLeft + 'px',
        opacity : "show",
        width   : width,
        height  : height
      }, 500, null, function() {
        if (options.scaleImg != true) {
          if (options.dialogMode) {
            content_div.appendTo(zoom_content);
            content_div.show();
            $("#zoom form:first input:visible:first").focus();
          } else {
            zoom_content.html(content_div.html());            
          }
        }
        unfixBackgroundsForIE();
        zoom_close.show();
        zooming = false;
        // onOpen callback
        if ($.isFunction(options.onOpen)) {
          options.onOpen.call();
        }
      });

      // Hookup hide events
      if (options.closeOnClick) {
        $('#zoom').click(hide);
      }
      $('html').click(closeOnClick);
      $(document).keyup(closeOnEscape);
      $('#zoom_close').click(hide);


      return false;
    };

    function setStartState(top, left) {
      zoom_close.attr('curTop', top);
      zoom_close.attr('curLeft', left);

      $('#zoom').hide().css({
        position  : 'absolute',
        top       : top + 'px',
        left      : left + 'px',
        width     : '1px',
        height    : '1px',
        "z-index" : 100000
      });
    }

    function scaleImages() {
      zoom_close.attr('scaleImg', options.scaleImg ? 'true' : 'false');
      if (options.scaleImg) {
        zoom_content.html(content_div.html());
        $('#zoom_content img').css('width', '100%');
      } else {
        zoom_content.html('');
      }
    }

    function closeOnClick(e) {
      if ($(e.target).parents('#zoom:visible').length == 0) {
        hide();
      }
    }

    function closeOnEscape(event){
      if (event.keyCode == 27 && $('#zoom:visible').length > 0) {
        hide();
      }
    }

    function hide() {
      if (zooming) return false;
      zooming         = true;
      fixBackgroundsForIE();
      if (zoom_close.attr('scaleImg') != 'true') {
        if (options.dialogMode) {
          zoom_content.children().hide().appendTo($("body"));
        } else {
          zoom_content.html('');
        }
      }
      zoom_close.hide();
      $('#zoom').animate({
        top     : zoom_close.attr('curTop') + 'px',
        left    : zoom_close.attr('curLeft') + 'px',
        opacity : "hide",
        width   : '1px',
        height  : '1px'
      }, 500, null, function() {
        if (zoom_close.attr('scaleImg') == 'true') {
          zoom_content.html('');
        }
        unfixBackgroundsForIE();
        zooming = false;
      });

      if ($.isFunction(options.onHide)) {
        options.onHide.call();
      }

      $('#zoom').unbind('click');
      $('html').unbind('click', closeOnClick);
      $(document).unbind('keyup', closeOnEscape);
      $('#zoom_close').unbind('click', hide);

      return false;
    }

    function switchBackgroundImagesTo(to) {
      $('#zoom_table td').each(function(i) {
        var bg = $(this).css('background-image').replace(/\.(png|gif|none)\"\)$/, '.' + to + '")');
        $(this).css('background-image', bg);
      });
      var close_img = zoom_close.children('img');
      var new_img = close_img.attr('src').replace(/\.(png|gif|none)$/, '.' + to);
      close_img.attr('src', new_img);
    }

    function fixBackgroundsForIE() {
      if ($.browser.msie && parseFloat($.browser.version) >= 7) {
        switchBackgroundImagesTo('gif');
      }
    }

    function unfixBackgroundsForIE() {
      if ($.browser.msie && $.browser.version >= 7) {
        switchBackgroundImagesTo('png');
      }
    }
  }
})(jQuery);