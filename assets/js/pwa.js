/* Registers the service worker so the site can be installed like an app. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') { return; }
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* optional feature */ }); });
})();
