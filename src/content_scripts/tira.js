(function () {
  'use strict';

  var interval = 15000;
  var totalRarity = 0;
  var images = null;

  var $container = $('<div class="rita-container" />')
    .appendTo($(document.body));

  var $img = $('<img class="rita" data-dir="0" />')
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

    var dir = 1 - parseInt($img.attr('data-dir'));
    var cw = $container.width(), ch = $container.height();
    var iw = $img.width(), ih = $img.height();
    var sl = dir ? 0 - iw : cw;
    var st = (ch - ih) * Math.random();
    var el = dir ? 0 : cw - iw;
    var et = st;
    var transform = dir || !image.flip ? '' : 'scaleX(-1)';

    $img.attr({
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
