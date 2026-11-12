/* Registers the service worker and offers an "Install the app" button when the browser allows it. */
(function () {
  'use strict';
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* optional feature */ }); });
  }
  var deferred = null;
  function show(on) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-install]'), function (b) { b.hidden = !on; });
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; show(true); });
  window.addEventListener('appinstalled', function () { deferred = null; show(false); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-install]');
    if (!b || !deferred) { return; }
    deferred.prompt();
    deferred.userChoice.then(function () { deferred = null; show(false); });
  });
  // the result page is rendered after load, so re-apply when the install prompt is already available
  new MutationObserver(function () { if (deferred) { show(true); } }).observe(document.documentElement, { childList: true, subtree: true });
})();
