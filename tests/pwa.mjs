#!/usr/bin/env node
/* PWA suite. Runs its own static server so it can (a) host the repo under a sub-path like GitHub Pages (/AraminConsole/)
   and (b) publish a "new build" of the service worker on demand. --base= is accepted (tests/run.mjs) but not needed.
   Checks: manifest completeness · SW registers and controls · lazy module loading · offline shell + offline redirect ·
   background-sync outbox · update flow (toast → skipWaiting → one reload, old caches dropped) · install UI
   (simulated beforeinstallprompt → sheet → prompt → appinstalled), banner / card / iOS variants · no console errors.
   node tests/pwa.mjs [--shots] */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { createReadStream, existsSync, readdirSync, statSync, readFileSync, mkdirSync } from 'node:fs';
import { join, extname, normalize, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = process.argv.includes('--shots');
const OUT = join(ROOT, 'tests', 'screens'); mkdirSync(OUT, { recursive: true });
const PREFIX = '/AraminConsole';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.md': 'text/markdown; charset=utf-8' };

let rev = 1; const posts = [];
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.startsWith(PREFIX)) path = path.slice(PREFIX.length) || '/';
  if (req.method === 'POST') { let body = ''; req.on('data', (d) => { body += d; }); req.on('end', () => { posts.push({ path, body }); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); }); return; }
  let file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found'); }
  const headers = { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' };
  if (file.endsWith(`demo${sep}sw.js`)) { res.writeHead(200, headers); return res.end(`${readFileSync(file, 'utf8')}\n// test build ${rev}\n`.replace(/const BUILD = '([^']*)';/, `const BUILD = '$1-r${rev}';`)); }
  res.writeHead(200, headers);
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const ORIGIN = `http://localhost:${server.address().port}`;
const BASE = `${ORIGIN}${PREFIX}`; // sub-path hosting

const pw = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const exe = readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse().map((d) => join(pw, d, 'chrome-win64', 'chrome.exe')).find(existsSync);
const browser = await chromium.launch({ executablePath: exe });
let failed = 0;
const ok = (cond, msg, extra = '') => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}${extra ? ` — ${extra}` : ''}`); if (!cond) failed++; };
const errors = [];
const watch = (p) => {
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_INTERNET_DISCONNECTED|net::ERR/.test(m.text())) errors.push(`console: ${m.text()}`); });
};

try {
  // ---------------------------------------------------------------- manifest
  const m = JSON.parse(readFileSync(join(ROOT, 'demo', 'manifest.webmanifest'), 'utf8'));
  const assets = [...m.icons, ...m.screenshots, ...m.shortcuts.flatMap((s) => s.icons || [])].map((x) => x.src);
  ok(m.id && m.scope === './' && m.start_url && m.lang && m.dir && m.display_override?.includes('window-controls-overlay'), 'manifest: id, scope, start_url, lang, dir, display_override');
  ok(m.icons.some((i) => i.purpose === 'maskable') && m.shortcuts.length >= 4 && m.share_target?.action, 'manifest: maskable icon, 4 shortcuts, share_target');
  ok(m.screenshots.some((s) => s.form_factor === 'wide') && m.screenshots.some((s) => s.form_factor === 'narrow'), 'manifest: wide + narrow screenshots');
  ok(assets.every((a) => existsSync(join(ROOT, 'demo', a))), 'manifest: every icon / screenshot file exists', assets.filter((a) => !existsSync(join(ROOT, 'demo', a))).join(', '));

  // ---------------------------------------------------------------- SW under a sub-path
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { localStorage.setItem('ac:sw', '1'); });
  const p = await ctx.newPage(); watch(p);
  await p.goto(`${BASE}/demo/#/dashboard`, { waitUntil: 'networkidle' });
  const scope = await p.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  ok(scope.endsWith('/AraminConsole/demo/'), 'service worker registers with a sub-path scope', scope);
  await p.reload({ waitUntil: 'networkidle' });
  ok(await p.evaluate(() => !!navigator.serviceWorker.controller), 'page is controlled after reload');
  ok(await p.evaluate(() => AC.use.loaded('chart') && !AC.use.loaded('maps')), 'dashboard lazy-loaded chart, not maps');

  // lazy modules: maps only when visited (JS + CSS, .min twins)
  const lazyReqs = [];
  p.on('request', (r) => { if (/\/dist\/modules\//.test(r.url())) lazyReqs.push(r.url().replace(ORIGIN, '')); });
  await p.evaluate(() => { location.hash = '#/maps'; });
  await p.waitForFunction(() => AC.use.loaded('maps'), null, { timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => AC.use.loaded('maps') && !!document.querySelector('link[data-ac-module="maps"]')), 'visiting #/maps lazy-loads the maps module + its stylesheet', lazyReqs.filter((u) => /maps/.test(u)).join(' '));
  ok(lazyReqs.every((u) => u.startsWith(`${PREFIX}/dist/modules/`)), 'lazy modules resolve under the sub-path');
  const dup = await p.evaluate(() => performance.getEntriesByType('resource').filter((e) => /\/dist\/modules\/core(\.min)?\.js/.test(e.name)).length);
  ok(dup === 0, 'already-loaded core is never downloaded again by a lazy module', `${dup} request(s)`);
  await p.evaluate(() => { location.hash = '#/dashboard'; });
  await p.waitForTimeout(800);

  // ---------------------------------------------------------------- offline
  await ctx.setOffline(true);
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1500);
  ok((await p.locator('.ac-page-head__title').count()) > 0 && (await p.locator('.ac-stat, .ac-kpi, .ac-chart-slot').count()) > 0, 'offline: the shell and the dashboard still render');
  await p.goto(`${BASE}/demo/never-cached.html`).catch(() => {});
  await p.waitForTimeout(800);
  ok(/errors\/offline\.html\?from=/.test(p.url()), 'offline: an uncached navigation lands on errors/offline.html?from=…', p.url().replace(ORIGIN, ''));
  await p.goto(`${BASE}/demo/#/dashboard`, { waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(1200);

  // outbox: a POST while offline is queued (202) and replayed when online
  const q = await p.evaluate(async () => { const r = await AC.pwa.send('api/notes', { body: '{"n":1}', headers: { 'Content-Type': 'application/json' } }); return { queued: r.queued, status: r.response.status }; });
  ok(q.queued && q.status === 202, 'offline POST to api/* is queued by the service worker (202, X-AC-Queued)');
  await p.evaluate(() => { window.__synced = 0; document.addEventListener('ac:pwa:synced', (e) => { window.__synced += e.detail.count; }); });
  await ctx.setOffline(false); // AC.pwa flushes on "online"; flush again in case the first attempt raced the network
  for (let i = 0; i < 12 && !posts.some((x) => x.path === '/demo/api/notes'); i++) { await p.waitForTimeout(500); await p.evaluate(() => AC.pwa.flush()); }
  await p.waitForTimeout(300);
  ok(posts.some((x) => x.path === '/demo/api/notes' && x.body === '{"n":1}'), 'back online: the outbox replays the queued POST to the server', `${await p.evaluate(() => window.__synced)} sent`);

  // ---------------------------------------------------------------- update flow
  const before = await p.evaluate(() => caches.keys());
  rev++;
  await p.evaluate(() => AC.pwa.update());
  const toast = p.locator('.ac-toast[data-id="ac-pwa-update"]');
  await toast.waitFor({ timeout: 10000 }).catch(() => {});
  ok(await toast.isVisible().catch(() => false), 'new build → "update available" toast with a Reload action');
  if (SHOTS) await p.screenshot({ path: join(OUT, 'pwa-update-desktop.png') });
  const nav = p.waitForEvent('framenavigated', { timeout: 10000 }).catch(() => null);
  await toast.locator('.ac-toast__action').click().catch(() => {});
  ok(!!(await nav), 'accepting reloads the page once (skipWaiting → controllerchange)');
  await p.waitForLoadState('networkidle'); await p.waitForTimeout(800);
  const after = await p.evaluate(() => caches.keys());
  ok(after.filter((k) => k.startsWith('ac-demo')).length === 1 && after.some((k) => /-r2$/.test(k)) && !after.some((k) => before.includes(k) && /-r1$/.test(k)), 'the new worker activated and dropped the old cache', after.join(', '));
  ok((await p.locator('.ac-toast[data-id="ac-pwa-update"]').count()) === 0, 'no stale update toast after the reload');

  // ---------------------------------------------------------------- install UI
  await p.evaluate(() => {
    window.__prompted = 0;
    const e = new Event('beforeinstallprompt', { cancelable: true });
    e.prompt = async () => { window.__prompted++; };
    e.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
    dispatchEvent(e);
  });
  ok(await p.evaluate(() => AC.install.state.available), 'beforeinstallprompt is captured (AC.install.state.available)');
  await p.evaluate(() => AC.install.show('sheet'));
  const sheet = p.locator('.ac-install-sheet .ac-install');
  await sheet.waitFor({ timeout: 5000 }).catch(() => {});
  ok(await sheet.isVisible().catch(() => false), 'install sheet opens (icon, stats, screenshots, benefits, Install / Later)');
  ok((await p.locator('.ac-install-sheet .ac-install__shots img').count()) >= 1 && (await p.locator('.ac-install-sheet .ac-install__benefits li').count()) === 4, 'sheet shows manifest screenshots and 4 benefits');
  if (SHOTS) await p.screenshot({ path: join(OUT, 'pwa-install-sheet-desktop.png') });
  await p.locator('.ac-install-sheet [data-install-go]').click();
  await p.waitForTimeout(500);
  ok(await p.evaluate(() => window.__prompted === 1), 'Install calls the deferred prompt()');
  await p.evaluate(() => dispatchEvent(new Event('appinstalled')));
  await p.waitForTimeout(400);
  ok(await p.evaluate(() => AC.install.state.installed), 'appinstalled → installed state + thanks toast');
  for (const v of ['banner', 'card', 'ios']) {
    await p.evaluate((x) => AC.install.show(x), v);
    await p.waitForTimeout(450);
    const sel = { banner: '.ac-install-banner', card: '.ac-install-card[data-variant="card"]', ios: '.ac-install-ios .ac-ios__step' }[v];
    ok(await p.locator(sel).first().isVisible().catch(() => false), `install variant "${v}" renders`);
    if (SHOTS) await p.screenshot({ path: join(OUT, `pwa-install-${v}-desktop.png`) });
    await p.evaluate(() => AC.install.hide());
    await p.waitForTimeout(350);
  }
  // smart timing: never before the visit threshold, snooze respected
  ok(await p.evaluate(() => { AC.install.reset(); localStorage.setItem('ac:install', JSON.stringify({ visits: 1 })); return AC.install.auto({ minVisits: 2, minSeconds: 0 }) === false; }), 'auto(): waits for the visit threshold');
  ok(await p.evaluate(() => { localStorage.setItem('ac:install', JSON.stringify({ visits: 5, snooze: Date.now() + 864e5 })); return AC.install.auto({ minVisits: 2, minSeconds: 0 }) === false; }), 'auto(): respects the snooze');
  await ctx.close();

  // ---------------------------------------------------------------- phone: sheet + iOS
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' });
  const pp = await phone.newPage(); watch(pp);
  await pp.goto(`${BASE}/demo/#/notify-lab`, { waitUntil: 'networkidle' }); await pp.waitForTimeout(600);
  ok(await pp.evaluate(() => AC.install.state.platform === 'ios' && AC.install.state.canPromptIOS), 'iOS Safari detected (instructions instead of a prompt)');
  await pp.evaluate(() => AC.install.prompt());
  await pp.waitForTimeout(500);
  ok((await pp.locator('.ac-install-ios .ac-ios__step').count()) === 3, 'iOS: Install opens the 3-step Add-to-Home-Screen sheet');
  ok(await pp.evaluate(() => document.documentElement.scrollWidth <= 390), 'phone: no horizontal overflow on notify-lab');
  await phone.close();
} catch (err) {
  ok(false, `unexpected: ${err.message}`);
} finally {
  await browser.close();
  server.close();
}
ok(!errors.length, 'no console errors', errors.slice(0, 5).join(' | '));
console.log(failed ? `\n${failed} PWA check(s) failed` : '\nPWA checks passed');
process.exit(failed ? 1 : 0);
