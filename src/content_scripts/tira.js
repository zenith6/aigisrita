(function () {
  'use strict';

  if (window.Aigisrita) {
    return;
  }

  window.Aigisrita = {};

  var stage, timeline;

  function initialize() {
    stage = document.createElement('div');
    stage.setAttribute('class', 'rita-stage');
    stage.style.display = 'none';
    document.body.appendChild(stage);

    timeline = new TimelineMax({
      paused: true,
      onComplete: function () {
        dispose();
        chrome.runtime.sendMessage({action: 'onAnimationCompleted'});
      }
    });
  }

  function prepare(animation) {
    var sprites = Object.keys(animation.sprites).reduce(function (sprites, id) {
      var sprite = document.createElement('img');
      var image = animation.sprites[id];
      sprite.src = chrome.extension.getURL(image.path);
      sprite.style.position = 'absolute';
      sprite.style.zIndex = image.zIndex;

      stage.appendChild(sprite);

      sprites[id] = sprite;
      return sprites;
    }, {});

    [animation.timesheet].forEach(function (timesheet) {
      timesheet.forEach(function (scene) {
        var sprite = sprites[scene.shift()];
        var args = [sprite].concat(scene);
        timeline.to.apply(timeline, args);
      });
    });
  }

  function dispose() {
    timeline.clear();
    while (stage.firstChild) {
      stage.removeChild(stage.firstChild);
    }
  }

  function play() {
    if (timeline) {
      stage.style.display = 'block';
      timeline.play();
    }
  }

  function stop() {
    if (timeline) {
      stage.style.display = 'none';
      timeline.stop();
    }
  }

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
      case 'prepare':
        prepare(message.animation);
        sendResponse();
        break;

      case 'play':
        play();
        break;

      case 'stop':
        stop();
        break;
    }
  });

  initialize();
  chrome.runtime.sendMessage({action: 'onInitialized'});
})();
