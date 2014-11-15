$(function () {
  'use strict';

  function toggleActiveForm(duration) {
    duration = duration !== undefined ? duration : 400;
    var active = !!parseInt($('[name=active]:checked').val());
    $('[data-show="active"]')[active ? 'show' : 'hide'](duration);
  }

  var bg = chrome.extension.getBackgroundPage();
  var settings = bg.settings;

  var $awayInterval = $('[name=awayInterval]');
  var intervals = [15, 30, 60, 180, 300, 600, 900, 1800, 3600];

  intervals.forEach(function (interval) {
    var hour = Math.floor(interval / 3600);
    var min = Math.floor(interval % 3600 / 60);
    var sec = interval % 60;
    var label = (hour ? hour + '時間' : '') +
      (min ? min + '分' : '') +
      (sec || (!min && !hour) ? sec + '秒' : '');
    $('<option />').val(interval).text(label).appendTo($awayInterval);
  });

  $('[name=active]').val([0 + settings.active]);
  $('[name=away]').prop('checked', settings.away);
  $('[name=averaging]').prop('checked', settings.averaging);

  $('[name=active]').change(function () {
    var active = !!parseInt(this.value);
    chrome.storage.local.set({active: active});
    toggleActiveForm();
  });

  $('[name=away]').change(function () {
    chrome.storage.local.set({away: this.checked});
  });

  $('[name=averaging]').change(function () {
    chrome.storage.local.set({averaging: this.checked});
  });

  $awayInterval.change(function () {
    chrome.storage.local.set({awayInterval: parseInt($(this).val())});
  });

  toggleActiveForm(0);
});
