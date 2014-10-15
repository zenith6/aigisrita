(function () {
  'use strict';

  var duration = 10000;

  var images = [
    'assets/rita.png',
    'assets/mikoto.png'
  ];

  var $window = $(window);

  var $container = $(document.body);

  var $img = $('<img class="rita" data-dir="0" />')
    .appendTo($container);

  $img.css('-webkit-animation-duration', '' + duration + 'ms');

  function fadein() {
    var image = images[Math.random() > 0.97 ? 1 : 0];
    $img.attr('src', chrome.extension.getURL(image));

    var dir = 1 - $img.attr('data-dir');
    var top = ($window.height() - $img.height()) * Math.random();
    $img.css({top: top + 'px'})
      .attr('data-dir', dir).show();
  }

  fadein();
  setInterval(fadein, duration);
})();
