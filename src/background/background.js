/**
 * @param Tab tab
 * @return Boolean
 */
function isApplicableTab(tab) {
  return getWhiteList().some(function (pattern) {
    return pattern.test(tab.url);
  });
}

/**
 * @type Array
 */
var whiteListCache;

/**
 * @return Array
 */
function getWhiteList() {
  if (!whiteListCache) {
    whiteListCache = [
      'http://*/*',
      'https://*/*',
    ].map(function (pattern) {
      return new RegExp(pattern.replace(/[()[\]\\^$\-]/, '\\$0').replace(/\*/, '.*'));
    });
  }

  return whiteListCache;
}

/**
 * @type Array
 */
var animations;

function getAnimations() {
  if (!animations) {
    var request = new XMLHttpRequest();
    request.open('GET', chrome.extension.getURL('content_scripts/animations.json'), false);
    request.send();

    animations = JSON.parse(request.responseText);

    var total = animations.reduce(function (rarity, animation) {
      animation.rarity = (window.settings.averaging ? 1 : animation.rarity);
      return rarity + animation.rarity;
    }, 0);

    animations.reduce(function (weight, animation) {
      weight += animation.rarity / total;
      animation.weight = weight;
      return weight;
    }, 0);
  }

  return animations;
}

function getNextAnimation() {
  var animations = getAnimations();
  var threshold = Math.random();
  var lot;

  animations.some(function (animation) {
    if (animation.weight > threshold) {
      lot = animation;
    }
    return lot;
  });

  return lot;
}

function attach(tabId) {
  chrome.browserAction.setIcon({
    path: '../assets/icon_19.png',
    tabId: tabId
  });

  chrome.tabs.executeScript(tabId, {file: 'vendor/gsap/TweenMax.min.js', runAt: 'document_start'});
  chrome.tabs.executeScript(tabId, {file: 'content_scripts/tira.js', runAt: 'document_end'});
  chrome.tabs.insertCSS(tabId, {file: 'content_scripts/tira.css', runAt: 'document_start'});
}

function detach(tabId) {
  chrome.browserAction.setIcon({
    path: '../assets/icon_disabled_19.png',
    tabId: tabId
  });
}

function play() {
  chrome.tabs.query({windowType: 'normal'}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, {action: 'play'});
    });
  });
}

function stop() {
  chrome.tabs.query({windowType: 'normal'}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, {action: 'stop'});
    });
  });
}

(function () {
  'use strict';

  chrome.storage.local.get({
    active: true,
    away: false,
    awayInterval: 15,
    averaging: false
  }, function (settings) {
    window.settings = settings;
    initialize();
  });

  function initialize() {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
      if (changeInfo.status != 'loading') {
        return;
      }

      if (window.settings.active && isApplicableTab(tab)) {
        attach(tabId);
      } else {
        detach(tabId);
      }
    });

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
      switch (message.action) {
        case 'onInitialized':
        case 'onAnimationCompleted':
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'prepare',
            animation: getNextAnimation()
          }, function () {
            if (!window.settings.away) {
              chrome.tabs.sendMessage(sender.tab.id, {
                action: 'play'
              });
            }
          });
          break;
      }
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
      for (var key in changes) {
        var change = changes[key];
        window.settings[key] = change.newValue;

        switch (key) {
          case 'away':
            if (change.newValue) {
              stop();
            } else if (window.settings.active) {
              play();
            }
            break;

          case 'awayInterval':
            chrome.idle.setDetectionInterval(change.newValue);
            break;

          case 'active':
            if (change.newValue && !window.settings.away) {
              play();
            } else {
              stop();
            }
            break;

          case 'averaging':
            animations = undefined;
            break;
        }
      }
    });

    chrome.idle.onStateChanged.addListener(function (newState) {
      if (window.settings.active && window.settings.away) {
        switch (newState) {
          case 'active':
            stop();
            break;

          case 'idle':
            play();
            break;
        }
      }
    });

    chrome.idle.setDetectionInterval(window.settings.awayInterval);
  }
})();
