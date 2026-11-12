/* Service worker: makes the site installable and lets the test open offline. */
const VERSION = 'iqtestlab-v3';
const SCOPE = self.registration.scope;
const CORE = ["./", "test.html", "iq-score-chart.html", "favicon.svg", "assets/css/style.css", "assets/js/config.js", "assets/js/sheet.js", "assets/js/questions.js", "assets/js/test.js", "assets/js/home.js"].map((p) => new URL(p, SCOPE).href);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => Promise.all(CORE.map((u) => cache.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) { return; }
  if (req.mode === 'navigate') {
    // pages: network first (always fresh), fall back to the cache when offline
    event.respondWith(fetch(req).then((res) => {
      if (res.ok && res.type === 'basic' && !res.redirected) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match(SCOPE))));
    return;
  }
  // assets: serve from cache immediately and refresh in the background
  event.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
