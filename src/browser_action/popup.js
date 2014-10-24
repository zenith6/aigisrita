$(function () {
  'use strict';

  var bg = chrome.extension.getBackgroundPage();

  chrome.storage.local.get({
    active: true
  }, function (items) {
    $('[name=active]').val([0 + items.active]);
  });

  $('[name=active]').change(function () {
    var active = !!parseInt(this.value);
    chrome.storage.local.set({active: active});
  });
});
