(function () {
  'use strict';

  var interval = 15000;
  var images;
  var totalRarity;

  var $container = $('<div class="rita-container" />')
    .appendTo($(document.body));

  var $img = $('<img class="rita" data-dir="0" />')
    .appendTo($container);

  function animate() {
    var lot = Math.random();
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

  var timer;

  function play() {
    if (!timer) {
      timer = setInterval(animate, interval);
      animate();
      $container.show();
    }
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
      $img.stop(true);
      $container.hide();
    }
  }

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
      case 'play':
        play();
        break;

      case 'stop':
        stop();
        break;
    }
  });

  chrome.runtime.sendMessage({action: 'ready'}, function (response) {
      images = response.imageList;

      totalRarity = images.reduce(function (rarity, image) {
        return rarity + image.rarity;
      }, 0);

      if (response.state == 'play') {
        play();
      }
  });
})();
