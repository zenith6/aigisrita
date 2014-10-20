(function () {
  'use strict';

  var interval = 15000;
  var totalRarity = 0;
  var images = null;

  var $window = $(window);

  var $container = $('<div class="rita" data-dir="0" />')
    .appendTo($(document.body));

  var $img = $('<img />')
    .appendTo($container);

  function fadein() {
    var lot = Math.random() * totalRarity;
    var image = images.reduce(function (elected, image) {
      return elected || image.rarity < lot ? elected : image;
    }, null);

    $img.attr({
      src: chrome.extension.getURL(image.path),
      width: image.width,
      height: image.height
    });

    var dir = 1 - parseInt($container.attr('data-dir'));
    var cw = $container.width(), ch = $container.height();
    var ww = $window.width(), wh = $window.height();
    var sl = dir ? 0 - cw : ww;
    var st = (wh - ch) * Math.random();
    var el = dir ? 0 : ww - cw;
    var et = st;
    var transform = dir || !image.flip ? '' : 'scaleX(-1)';

    $container.attr({
      'data-dir': dir
    }).css({
      left: sl + 'px',
      top: st + 'px',
      transform: transform
    })
    .animate({left: el + 'px', top: et + 'px'}, {duration: 4000})
    .delay(3000)
    .animate({left: sl + 'px', top: st + 'px'}, {duration: 4000});
  }

  function start() {
    fadein();
    $container.show();

    setInterval(fadein, interval);
  }

  $.getJSON(chrome.extension.getURL('assets/images.json'), {}, function (json) {
    images = json.map(function (image) {
      totalRarity += image.rarity;
      image.rarity = totalRarity;
      return image;
    });

    start();
  });
})();
