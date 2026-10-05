// Mode hors ligne (navigateur) : l'application et sa base de contenu sont mises en cache.
const CACHE = 'pio-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([
    './', 'index.html', 'css/app.css', 'css/fonts.css',
    'js/main.js', 'js/screens.js', 'js/exercises.js', 'js/lessons.js', 'js/store.js', 'js/audio.js', 'js/data.js', 'js/ui.js',
    'data/letters.json', 'data/syllables.json', 'data/words.json', 'data/outils.json', 'data/sentences.json', 'data/texts.json', 'data/dictees.json', 'data/units.json',
    'audio/manifest.json', 'fonts/andika-400.woff2', 'fonts/andika-700.woff2', 'fonts/playwrite-400.woff2', 'icons/icon.svg',
  ])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const copy = r.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request)),
  );
});
