// Generated by CoffeeScript 1.6.3
jQuery(function() {
  $.each($("[data-time]"), function(index, ele) {
    return $(ele).html(prettyDate(new Date($(this).data("time"))));
  });


  var $body = $("html, body");
  $('#main-content').smoothState({
      onEnd: {
          render: function(url, $container, $content) {
              $body.css('cursor', 'auto');
              $body.find('a').css('cursor', 'auto');
              $container.html($content);
              setTimeout(function() {
                  $body.animate({scrollTop: 0}, 500);
              }, 0);
          }
      }
  });
});
