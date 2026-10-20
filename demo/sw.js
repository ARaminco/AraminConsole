/* AraminConsole demo service worker (pairs with src/modules/pwa — AC.pwa.register)
   Caches (one versioned cache; the build stamps BUILD, so every new build installs a new worker → "Update available" toast):
   - app shell: precached on install, served cache-first
   - framework / demo code (dist/**, *.js, *.css) and page fragments + i18n: stale-while-revalidate
   - fonts, icons, images: cache-first
   - data (*.json outside i18n, api/*): network-first, cache fallback
   - navigations: network-first → cached shell → offline: redirect to errors/offline.html?from=<url>
     (a redirect, not the cached body, so its relative URLs resolve from errors/ at any depth)
   Update flow: a new worker waits; the page shows the toast; "Reload" posts SKIP_WAITING → activate → old caches dropped → one reload.
   Outbox: a POST to api/* that fails offline is stored in IndexedDB and answered 202 (X-AC-Queued: 1); replayed on `sync`
   ("ac-outbox") or when the page posts FLUSH (AC.pwa.flush(), called on `online`).
   Push: `push` and the demo's SIMULATE_PUSH message share one handler; `notificationclick` focuses / opens the app.
   Every URL is relative to this file, so the demo works under a sub-path (GitHub Pages /AraminConsole/demo/). */
const VERSION = 'ac-demo-v0.2.0';
const BUILD = '2822d2606c'; // stamped by scripts/build.mjs
const CACHE = `${VERSION}-${BUILD}`;
const OFFLINE = './errors/offline.html';
const SHELL = [
  './', './index.html', './app.js', './support.js', './data.js', './demo.css', './pages-a.css', './manifest.webmanifest', './offline.html', OFFLINE,
  './standalone.css', './standalone.js', './icons/icon.svg', './icons/icon-192.png', './brand/air/logo-mark.svg', './brand/air/logo-mark-dark.svg',
  './i18n/fa.json', './i18n/en.json', './i18n/ar.json', './pages/dashboard.html',
  '../dist/demo/aramin-console.min.css', '../dist/demo/aramin-console.min.js', '../dist/aramin-console-boot.js', '../dist/icons.svg',
  '../dist/fonts/vazirmatn-variable.woff2',
  // standalone auth / error pages use the full bundle
  '../dist/aramin-console.css', '../dist/aramin-console.js',
];
const SCOPE = new URL('./', self.location).href;

self.addEventListener('install', (event) => {
  // no skipWaiting here: an update waits until the user accepts it (the page posts SKIP_WAITING)
  event.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' }))))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('ac-demo') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
    replay();
  })());
});

self.addEventListener('message', (event) => {
  const m = event.data || {};
  if (m.type === 'SKIP_WAITING') self.skipWaiting();
  else if (m.type === 'FLUSH') event.waitUntil(replay());
  else if (m.type === 'SIMULATE_PUSH') event.waitUntil(showPush(m.payload || {}));
  else if (m.type === 'VERSION') event.source?.postMessage({ type: 'VERSION', version: CACHE });
});

/* ------------------------------------------------------------------ strategies */
async function put(req, res) {
  if (res && res.ok && (res.type === 'basic' || res.type === 'default')) { const c = await caches.open(CACHE); await c.put(req, res.clone()); }
  return res;
}
async function networkFirst(req, fallbackUrl) {
  try { return await put(req, await fetch(req)); } catch {
    return (await caches.match(req, { ignoreSearch: true })) || (fallbackUrl && (await caches.match(fallbackUrl))) || Response.error();
  }
}
async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  return put(req, await fetch(req));
}
async function staleWhileRevalidate(event, req) {
  const hit = await caches.match(req);
  const net = fetch(req).then((res) => put(req, res)).catch(() => null);
  if (hit) { event.waitUntil(net); return hit; }
  return (await net) || (await caches.match(req, { ignoreSearch: true })) || Response.error();
}
async function offlinePage(req) {
  const page = new URL(OFFLINE, SCOPE);
  if (new URL(req.url).pathname === page.pathname) return (await caches.match(OFFLINE)) || (await caches.match('./offline.html')) || Response.error();
  page.searchParams.set('from', req.url);
  return Response.redirect(page.href, 302);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.method === 'POST' && url.href.startsWith(new URL('./api/', SCOPE).href)) { event.respondWith(outbox(req)); return; }
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    const isShell = url.href.split(/[?#]/)[0] === SCOPE || url.href.split(/[?#]/)[0] === `${SCOPE}index.html`;
    event.respondWith(networkFirst(req, isShell ? './index.html' : null).then((r) => (r.type === 'error' ? offlinePage(req) : r)));
    return;
  }
  const p = url.pathname;
  if (/\.(?:woff2?|ttf|otf|svg|png|jpe?g|webp|avif|gif|ico)$/.test(p) && !/\/dist\/icons\.svg$/.test(p)) { event.respondWith(cacheFirst(req).catch(() => caches.match(req))); return; }
  if (/\/api\//.test(p) || (/\.json$/.test(p) && !/\/i18n\//.test(p) && !/\/dist\//.test(p))) { event.respondWith(networkFirst(req)); return; }
  if (/\/(pages|i18n|dist)\//.test(p) || /\.(?:m?js|css|html|webmanifest)$/.test(p)) { event.respondWith(staleWhileRevalidate(event, req)); return; }
  event.respondWith(cacheFirst(req).catch(() => caches.match(req)));
});

/* ------------------------------------------------------------------ outbox (background sync) */
const DB = 'ac-outbox';
function db() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('q', { keyPath: 'id', autoIncrement: true });
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  });
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => { const t = d.transaction('q', mode); const out = fn(t.objectStore('q')); t.oncomplete = () => resolve(out?.result ?? out); t.onerror = () => reject(t.error); });
}
async function broadcast(msg) { for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage(msg); }

async function outbox(req) {
  const copy = req.clone();
  try { return await fetch(req); } catch {
    const body = await copy.text();
    await tx('readwrite', (s) => s.add({ url: copy.url, method: copy.method, headers: [...copy.headers], body, at: Date.now() }));
    const count = await tx('readonly', (s) => s.count());
    try { await self.registration.sync?.register('ac-outbox'); } catch { /* no Background Sync: the page flushes on "online" */ }
    broadcast({ type: 'QUEUED', count });
    return new Response(JSON.stringify({ queued: true, count }), { status: 202, headers: { 'Content-Type': 'application/json', 'X-AC-Queued': '1' } });
  }
}
let replaying = null;
function replay() {
  replaying ||= (async () => {
    let sent = 0;
    try {
      const items = await tx('readonly', (s) => s.getAll());
      for (const it of items || []) {
        try { await fetch(it.url, { method: it.method, headers: it.headers, body: it.body }); } catch { break; } // still offline
        await tx('readwrite', (s) => s.delete(it.id)); sent++;
      }
    } catch { /* no IndexedDB */ }
    if (sent) broadcast({ type: 'SYNCED', count: sent });
    return sent;
  })().finally(() => { replaying = null; });
  return replaying;
}
self.addEventListener('sync', (event) => { if (event.tag === 'ac-outbox') event.waitUntil(replay()); });

/* ------------------------------------------------------------------ push + notification clicks */
async function showPush(data) {
  const title = data.title || 'Aramin';
  broadcast({ type: 'PUSH', payload: data });
  if (self.Notification?.permission !== 'granted') return;
  await self.registration.showNotification(title, {
    body: data.body || '', icon: data.icon && /\//.test(data.icon) ? data.icon : new URL('./icons/icon-192.png', SCOPE).href,
    badge: new URL('./icons/icon-192.png', SCOPE).href, image: data.image, tag: data.tag || data.group, renotify: !!(data.tag || data.group),
    requireInteraction: data.priority === 'urgent', data: { url: data.url || SCOPE, id: data.id },
    actions: (data.actions || []).slice(0, 2).map((a, i) => ({ action: a.action || String(i), title: a.title || a.label })),
  });
}
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() }; }
  event.waitUntil(showPush(data));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || SCOPE;
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = all.find((c) => c.url.startsWith(SCOPE));
    if (client) { await client.focus(); client.postMessage({ type: 'NOTIFICATION_CLICK', action: event.action, data: event.notification.data }); if (url !== SCOPE && 'navigate' in client) client.navigate(url).catch(() => {}); }
    else await self.clients.openWindow(url);
  })());
});
