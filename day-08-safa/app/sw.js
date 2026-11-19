// safa. service worker: the app shell and every text file you open stay on the device.
const V = 'safa-v3';
const SHELL = ['./', 'app.css', 'manifest.webmanifest', 'js/app.js', 'js/store.js', 'js/prayer.js', 'js/ui.js', 'js/i18n.js', 'js/player.js', 'js/a11y.js', 'js/sync.js',
  'js/views/onboarding.js', 'js/views/today.js', 'js/views/quran.js', 'js/views/duas.js', 'js/views/track.js', 'js/views/calendar.js', 'js/views/learn.js', 'js/views/plan.js', 'js/views/ask.js', 'vendor/adhan.js',
  'data/meta.json', 'data/duas.json', 'data/cities.json', 'data/quran/1.json', 'data/quran/18.json', 'data/quran/36.json', 'data/quran/67.json', 'data/fr/1.json', 'data/fr/18.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'fonts/inter-tight-latin-400-normal.woff2', 'fonts/inter-tight-latin-500-normal.woff2', 'fonts/inter-tight-latin-600-normal.woff2',
  'fonts/inter-tight-latin-ext-400-normal.woff2', 'fonts/inter-tight-latin-ext-500-normal.woff2',
  'fonts/jetbrains-mono-latin-300-normal.woff2', 'fonts/jetbrains-mono-latin-400-normal.woff2', 'fonts/jetbrains-mono-latin-500-normal.woff2',
  'fonts/amiri-arabic-400-normal.woff2', 'fonts/amiri-quran-arabic-400-normal.woff2'];

self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('safa-v') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    // Recitation audio: serve a saved copy when there is one, otherwise leave the request alone.
    if (/\.mp3$/.test(url.pathname)) e.respondWith(caches.open('safa-audio').then(c => c.match(req.url)).then(r => r || fetch(req)));
    return;
  }
  if (!url.pathname.startsWith(new URL('./', location.href).pathname)) return;
  const isData = url.pathname.includes('/data/') || url.pathname.includes('/fonts/');
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit && isData) return hit;                                  // data and fonts: cache-first
    const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; });
    if (hit) { net.catch(() => {}); return hit; }                   // shell: stale-while-revalidate
    return net.catch(() => req.mode === 'navigate' ? c.match('./') : Response.error());
  }));
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs[0] ? cs[0].focus() : self.clients.openWindow('./#/track'))); });
