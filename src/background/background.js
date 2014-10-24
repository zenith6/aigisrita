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
var imageListCache;

function getImageList() {
  if (!imageListCache) {
    var request = new XMLHttpRequest();
    request.open('GET', chrome.extension.getURL('assets/images.json'), false);
    request.send();
    var rarity = 0;
    imageListCache = JSON.parse(request.responseText).map(function (image) {
      rarity += image.rarity;
      image.rarity = rarity;
      return image;
    });
  }

  return imageListCache;
}

function attach(tabId) {
  chrome.browserAction.setIcon({
    path: '../assets/icon_19.png',
    tabId: tabId
  });

  chrome.tabs.executeScript(tabId, {file: 'vendor/jquery.js', runAt: 'document_start'});
  chrome.tabs.executeScript(tabId, {file: 'background/tira.js', runAt: 'document_end'});
  chrome.tabs.insertCSS(tabId, {file: 'background/tira.css', runAt: 'document_start'});
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

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.storage.local.get({active: true}, function (settings) {
    if (changeInfo.status != 'loading') {
      return;
    }

    if (settings.active && isApplicableTab(tab)) {
      attach(tabId);
    } else {
      detach(tabId);
    }
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
      case 'ready':
        sendResponse({
          imageList: getImageList(),
          state: 'play'
        });
    }
});
