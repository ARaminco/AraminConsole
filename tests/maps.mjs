#!/usr/bin/env node
/* Maps module + demo page (dev server must run: PORT=5192 node scripts/serve.mjs).
   node tests/maps.mjs [--base=http://localhost:5192] [--shots] [--only=desktop,phone,offline]
   Interaction runs answer tile requests with a local 1×1 PNG (no tile-server load); --shots uses real
   tiles (≈ a few dozen requests per screenshot) for 1440×900 + 390×844, light/dark, fa/en → tests/screens/maps-*.png. */
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function findChromium() {
  const root = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(root)) return undefined;
  for (const d of readdirSync(root).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) for (const sub of ['chrome-win64', 'chrome-win']) { const exe = join(root, d, sub, 'chrome.exe'); if (existsSync(exe)) return exe; }
  return undefined;
}
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'screens'); mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const opt = (n, d) => (args.find((a) => a.startsWith(`--${n}=`)) || '').split('=')[1] || d;
const base = opt('base', 'http://localhost:5192');
const only = opt('only', 'desktop,phone,offline').split(',');
const TILE_RE = /(tile\.openstreetmap\.org|basemaps\.cartocdn\.com)/;
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

let fails = 0; let passes = 0;
const ok = (cond, msg, extra = '') => { if (cond) { passes++; console.log(`  ✓ ${msg}`); } else { fails++; console.log(`  ✗ ${msg} ${extra}`); } };
const browser = await chromium.launch({ executablePath: findChromium() });

async function open({ w, h, theme = 'light', lang = 'fa', tiles = 'stub', touch = false }) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: touch ? 2 : 1, hasTouch: touch, isMobile: touch, geolocation: { latitude: 35.7448, longitude: 51.3753 }, permissions: ['geolocation'] });
  await ctx.addInitScript(([t, l]) => { localStorage.setItem('ac:theme', t); localStorage.setItem('ac:lang', l); localStorage.setItem('mp:city', '"tehran"'); }, [theme, lang]);
  let tileReqs = 0;
  await ctx.route(TILE_RE, (route) => { tileReqs++; if (tiles === 'stub') return route.fulfill({ status: 200, contentType: 'image/png', body: PNG }); if (tiles === 'offline') return route.abort('internetdisconnected'); return route.continue(); });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error' && !(tiles === 'offline' && /Failed to load resource/.test(m.text()))) errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await p.goto(`${base}/demo/#/maps`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.mp .ac-map .ac-map-marker', { state: 'attached', timeout: 15000 });
  await p.waitForTimeout(900);
  return { ctx, p, errors, tiles: () => tileReqs };
}
const evt = (p, name, pick) => p.evaluate(([n, f]) => new Promise((r) => { const t = setTimeout(() => r('timeout'), 5000); document.querySelector('[data-mp-map]').addEventListener(`ac:map:${n}`, (e) => { clearTimeout(t); r(new Function('d', `return ${f}`)(e.detail)); }, { once: true }); }), [name, pick]);
const view = (p) => p.evaluate(() => { const m = AC.instance(document.querySelector('[data-mp-map]'), 'map'); return { lat: m.center.lat, lng: m.center.lng, zoom: m.zoom, moving: m._movers }; });
const settle = (p) => p.waitForFunction(() => { const m = AC.instance(document.querySelector('[data-mp-map]'), 'map'); return !m._movers && !m._moving; }, null, { timeout: 8000 }).then(() => p.waitForTimeout(120));
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/* ------------------------------------------------------------------ desktop */
if (only.includes('desktop')) {
  console.log('desktop 1440×900 (stub tiles)');
  const { ctx, p, errors, tiles } = await open({ w: 1440, h: 900 });
  let box = await p.locator('[data-mp-map] .ac-map__viewport').boundingBox();
  let cx = box.x + box.width / 2; let cy = box.y + box.height / 2;
  await settle(p);
  ok(await p.locator('.ac-map__attrib a').count() > 0, 'attribution control visible with links');
  ok(await p.locator('.ac-map__level img.is-loaded').count() > 4, 'tiles loaded (stubbed)');

  // pan with inertia
  let v0 = await view(p);
  await p.mouse.move(cx, cy); await p.mouse.down();
  for (let i = 1; i <= 10; i++) { await p.mouse.move(cx - 20 * i, cy - 10 * i); await p.waitForTimeout(12); }
  await p.mouse.up(); await settle(p);
  let v1 = await view(p);
  ok(v1.lng > v0.lng && v1.lat < v0.lat, 'drag pans the map (east/south)', JSON.stringify([v0, v1]));
  const dpx = await p.evaluate(([a]) => { const m = AC.instance(document.querySelector('[data-mp-map]'), 'map'); const q = m.latLngToPoint(a); return Math.hypot(q.x - m.w / 2, q.y - m.h / 2); }, [v0]);
  ok(dpx > 223, `inertia carried the pan beyond the pointer (${dpx.toFixed(0)}px > 224px)`);

  // wheel zoom around cursor
  v0 = await view(p);
  await p.mouse.move(cx + 120, cy + 60); for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(30); } await settle(p);
  v1 = await view(p);
  ok(v1.zoom > v0.zoom + 1, `wheel zooms in (${v0.zoom.toFixed(2)} → ${v1.zoom.toFixed(2)})`);
  // double-click zoom
  v0 = v1; await p.mouse.dblclick(cx - 100, cy); await settle(p); v1 = await view(p);
  ok(Math.abs(v1.zoom - (Math.round(v0.zoom) + 1)) < 0.01, `double-click zooms +1 (${v1.zoom.toFixed(2)})`);
  // zoom buttons
  v0 = v1; await p.click('[data-map-ctl="out"]'); await settle(p); await p.click('[data-map-ctl="out"]'); await settle(p); v1 = await view(p);
  ok(Math.round(v0.zoom - v1.zoom) === 2, `zoom-out button ×2 (${v1.zoom})`);
  // keyboard
  await p.focus('[data-mp-map] .ac-map__viewport'); v0 = await view(p); await p.keyboard.press('+'); await settle(p); v1 = await view(p);
  ok(v1.zoom === v0.zoom + 1, 'keyboard + zooms in');

  await p.click('[data-mp-layer="fleet"]');
  ok(await p.locator('[data-pane="vehicle"] .ac-map-marker:not([hidden])').count() === 0, 'quick toggle hides the fleet layer');
  // clusters: fit Tehran at z11 → clusters exist; click one → zoom grows and splits
  await p.evaluate(() => AC.instance(document.querySelector('[data-mp-map]'), 'map').setView([35.7219, 51.3947], 11)); await settle(p);
  const clusters = await p.locator('.ac-map-marker[data-kind="cluster"]').count();
  ok(clusters > 0, `grid clustering at z11 (${clusters} clusters)`);
  const singles0 = await p.locator('[data-pane="marker"] .ac-map-marker[data-kind="pin"]').count();
  v0 = await view(p);
  await p.locator('.ac-map-cluster').first().click(); await settle(p); await p.waitForTimeout(400);
  v1 = await view(p);
  const singles1 = await p.locator('[data-pane="marker"] .ac-map-marker[data-kind="pin"]').count();
  ok(v1.zoom > v0.zoom, `cluster click zooms in (${v0.zoom} → ${v1.zoom.toFixed(2)})`);
  ok(singles1 >= singles0, `cluster split shows individual pins (${singles0} → ${singles1})`);

  // list → fly-to + popup
  await p.click('[data-place="t2"]'); await settle(p); await p.waitForTimeout(300);
  v1 = await view(p);
  ok(Math.abs(v1.lat - 35.7576) < 0.01 && v1.zoom === 16, 'list click flies to the place');
  ok(await p.locator('.ac-map-popup[data-state="open"] .mp-pop').count() === 1, 'popup opens for the place');
  await p.keyboard.press('Escape');

  // filter
  await p.click('[data-mp-types] [data-type="warehouse"]');
  ok(await p.locator('[data-mp-list] [data-place]').count() === 2, 'type filter → 2 warehouses');
  await p.click('[data-mp-types] [data-type=""]');
  await p.fill('[data-mp-q]', 'ونک'); await p.waitForTimeout(300);
  ok(await p.locator('[data-mp-list] [data-place]').count() === 1, 'list search');
  await p.fill('[data-mp-q]', ''); await p.waitForTimeout(250);

  await p.click('[data-mp-layer="fleet"]');
  // fleet moves smoothly
  const pos = () => p.evaluate(() => [...document.querySelectorAll('[data-pane="vehicle"] .ac-map-marker')].map((e) => e.style.transform).join('|'));
  const a = await pos(); await p.waitForTimeout(500); const b = await pos();
  ok(a !== b && a.length > 0, 'vehicles move along their routes');

  // address search (local geocoder, live)
  await p.fill('.ac-map__search input', 'milad'); await p.waitForSelector('.ac-map__results li[data-i]');
  await p.keyboard.press('Enter'); await settle(p); v1 = await view(p);
  ok(Math.abs(v1.lat - 35.7448) < 0.01, 'geocoder search → Enter flies to result');

  // layer switcher → heatmap
  await p.click('[data-map-ctl="layers"]');
  await p.locator('.ac-map__panel input[value="heat"]').check();
  ok(await p.locator('.ac-map__heat:not([hidden])').count() === 1, 'layer switcher toggles the heatmap');
  ok(await p.locator('[data-mp-layer="heat"][aria-pressed="true"]').count() === 1, 'quick toggle syncs with the switcher');
  await p.mouse.click(box.x + 40, box.y + box.height - 60); // close panel (also reverse-geocode popup)
  await p.keyboard.press('Escape');

  // draw polygon
  await p.evaluate(() => scrollTo(0, 0));
  box = await p.locator('[data-mp-map] .ac-map__viewport').boundingBox(); cx = box.x + box.width / 2; cy = box.y + box.height / 2;
  await p.evaluate(() => AC.instance(document.querySelector('[data-mp-map]'), 'map').setView([35.72, 51.40], 13)); await settle(p);
  const created = evt(p, 'draw:create', 'd.feature.type');
  await p.click('[data-map-ctl="draw-polygon"]');
  const pts = [[cx - 120, cy - 80], [cx + 120, cy - 90], [cx + 140, cy + 90], [cx - 110, cy + 100]];
  for (const [x, y] of pts) { await p.mouse.click(x, y); await p.waitForTimeout(80); }
  await p.mouse.click(pts[0][0] + 2, pts[0][1] + 2);
  ok(await created === 'polygon', 'draw polygon → ac:map:draw:create');
  const zones = await p.evaluate(() => AC.instance(document.querySelector('[data-mp-map]'), 'map').draw.list.length);
  ok(zones === 4, `polygon added to zones (${zones})`);

  // edit: select + drag a vertex handle
  const fid = await p.evaluate(() => { const d = AC.instance(document.querySelector('[data-mp-map]'), 'map').draw; const f = d.list[d.list.length - 1]; d.select(f.id); return f.id; });
  const edited = evt(p, 'draw:edit', 'd.feature.area');
  const hb = await p.locator('.ac-map-handle-m:not(.is-mid)').first().boundingBox();
  await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await p.mouse.down();
  for (let i = 1; i <= 6; i++) await p.mouse.move(hb.x + hb.width / 2 - 10 * i, hb.y + hb.height / 2 - 8 * i);
  await p.mouse.up();
  ok((await edited) > 0, `geofence vertex drag → ac:map:draw:edit (${fid})`);
  await p.keyboard.press('Escape');

  // circle
  const circ = evt(p, 'draw:create', 'd.feature.radius');
  await p.click('[data-map-ctl="draw-circle"]'); await p.mouse.click(cx + 200, cy); await p.mouse.move(cx + 260, cy); await p.mouse.click(cx + 280, cy);
  const r = await circ; ok(r > 50, `draw circle (radius ${Math.round(r)} m)`);

  // measure distance
  const meas = evt(p, 'measure', '({ type: d.type, value: d.value, text: d.text })');
  await p.click('[data-map-ctl="draw-measure"]'); await p.mouse.click(cx - 200, cy + 150); await p.mouse.click(cx + 100, cy + 150); await p.mouse.dblclick(cx + 100, cy + 200);
  const md = await meas; ok(md.type === 'distance' && md.value > 100 && (await p.locator('.ac-map-label').count()) > 0, `measure distance (${md.text})`);

  // reverse geocode on click
  await p.keyboard.press('Escape');
  await p.mouse.click(cx - 300, cy - 200); await p.waitForTimeout(400);
  ok(await p.locator('.ac-map-popup[data-state="open"] .ac-map-addr__coords').count() === 1, 'reverse geocode popup with coordinates');
  await p.keyboard.press('Escape');

  // coords control → DMS
  await p.mouse.move(cx, cy); await p.waitForTimeout(80);
  const dec = await p.textContent('.ac-map__coords'); await p.click('.ac-map__coords'); const dms = await p.textContent('.ac-map__coords');
  ok(/^-?\d+\.\d{5}, /.test(dec) && /°.*′.*″N/.test(dms), `coordinate display (${dec} · ${dms})`);

  // city toggle
  await p.click('[data-mp-city] [data-value="dubai"]'); await settle(p); v1 = await view(p);
  ok(Math.abs(v1.lat - 25.165) < 0.05, 'Dubai toggle flies to Dubai');

  // location picker in the add modal
  await p.click('.mp-head [data-mp-add]'); await p.waitForSelector('#mp-add[data-state="open"]');
  await p.fill('#mp-name', 'Test branch');
  await p.click('[data-mp-picker] .ac-locpick__ui button');
  await p.waitForSelector('.ac-map-picker .ac-map__level img', { timeout: 8000 });
  await p.waitForTimeout(500);
  const pb = await p.locator('.ac-map-picker__map .ac-map__viewport').boundingBox();
  await p.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await p.mouse.down();
  const lifted = [];
  for (let i = 1; i <= 8; i++) { await p.mouse.move(pb.x + pb.width / 2 + 15 * i, pb.y + pb.height / 2 + 5 * i); if (i === 4) lifted.push(await p.locator('.ac-map-picker__pin[data-lift]').count()); }
  await p.mouse.up(); await p.waitForTimeout(500);
  ok(lifted[0] === 1, 'picker pin lifts while dragging');
  await p.click('.ac-map-picker-modal [data-ac-close="ok"]'); await p.waitForTimeout(450);
  const vals = await p.evaluate(() => ({ lat: document.querySelector('[name="location[lat]"]').value, addr: document.querySelector('[name="location[address]"]').value }));
  ok(vals.lat && Math.abs(+vals.lat - 25.2) < 0.3, `location picker returns lat/lng (${vals.lat}) + address (${vals.addr.slice(0, 30)})`);
  await p.click('[data-mp-save]'); await p.waitForTimeout(400);
  ok(await p.locator('[data-mp-list] [data-place^="x"]').count() === 1, 'saved location appears in the list');

  ok(await overflow(p) <= 0, 'no horizontal overflow');
  ok(errors.length === 0, 'no console errors', errors.join(' | '));
  console.log(`  (tile requests: ${tiles()})`);
  await ctx.close();
}

/* ------------------------------------------------------------------ phone */
if (only.includes('phone')) {
  console.log('phone 390×844 touch (stub tiles)');
  const { ctx, p, errors } = await open({ w: 390, h: 844, touch: true });
  await settle(p);
  const cdp = await ctx.newCDPSession(p);
  const touch = async (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y], id) => ({ x, y, id })) });
  const vb = await p.locator('[data-mp-map] .ac-map__viewport').boundingBox();
  const cx = vb.width / 2; const cy = 300;
  let v0 = await view(p);
  // pinch out
  await touch('touchStart', [[cx - 40, cy], [cx + 40, cy]]);
  for (let i = 1; i <= 10; i++) { await touch('touchMove', [[cx - 40 - 10 * i, cy], [cx + 40 + 10 * i, cy]]); await p.waitForTimeout(16); }
  await touch('touchEnd', []); await settle(p);
  let v1 = await view(p);
  ok(v1.zoom > v0.zoom + 1, `pinch zooms in (${v0.zoom.toFixed(2)} → ${v1.zoom.toFixed(2)})`);
  // one-finger pan
  v0 = v1;
  await touch('touchStart', [[cx, cy]]); for (let i = 1; i <= 8; i++) { await touch('touchMove', [[cx + 12 * i, cy + 6 * i]]); await p.waitForTimeout(16); } await touch('touchEnd', []); await settle(p);
  v1 = await view(p); ok(v1.lng < v0.lng, 'touch drag pans');
  ok(await p.locator('.ac-ptr[data-state="pulling"]').count() === 0, 'map drag does not trigger pull-to-refresh');
  // double tap
  v0 = v1; await p.touchscreen.tap(cx, cy); await p.waitForTimeout(90); await p.touchscreen.tap(cx, cy); await settle(p); v1 = await view(p);
  ok(v1.zoom > v0.zoom + 0.5, `double-tap zooms in (${v1.zoom.toFixed(2)})`);
  // bottom sheet drag up to the middle snap
  const sheetY = () => p.evaluate(() => document.querySelector('.mp-side').getBoundingClientRect().top);
  const y0 = await sheetY();
  const gb = await p.locator('.mp-side__grip').boundingBox();
  await touch('touchStart', [[gb.x + gb.width / 2, gb.y + 10]]);
  for (let i = 1; i <= 10; i++) { await touch('touchMove', [[gb.x + gb.width / 2, gb.y + 10 - 26 * i]]); await p.waitForTimeout(16); }
  await touch('touchEnd', []); await p.waitForTimeout(600);
  const y1 = await sheetY();
  ok(y1 < y0 - 150, `bottom sheet drags to a snap point (${Math.round(y0)} → ${Math.round(y1)})`);
  ok(await p.evaluate(() => document.querySelector('.mp-side').dataset.snap) !== '0', 'sheet snapped above the peek');
  await p.locator('[data-place="t3"]').tap(); await settle(p); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.querySelector('.mp-side').dataset.snap) === '0', 'tapping a place collapses the sheet and flies');
  ok(await overflow(p) <= 0, 'no horizontal overflow on phone');
  ok(errors.length === 0, 'no console errors', errors.join(' | '));
  await ctx.close();
}

/* ------------------------------------------------------------------ offline */
if (only.includes('offline')) {
  console.log('offline tiles → styled grid');
  const { ctx, p, errors } = await open({ w: 1200, h: 800, tiles: 'offline' });
  await p.waitForTimeout(800);
  ok(await p.locator('.ac-map__notice:not([hidden])').count() === 1, 'offline notice shown');
  ok(await p.evaluate(() => document.querySelector('[data-mp-map]').hasAttribute('data-offline')), 'map marked offline (grid visible)');
  const box = await p.locator('[data-mp-map] .ac-map__viewport').boundingBox();
  const v0 = await view(p);
  await p.mouse.move(box.x + 300, box.y + 300); await p.mouse.down(); await p.mouse.move(box.x + 200, box.y + 250, { steps: 6 }); await p.mouse.up(); await settle(p);
  ok((await view(p)).lng > v0.lng, 'map still pans offline');
  ok(await p.locator('.ac-map-marker').count() > 3, 'markers render without tiles');
  await p.screenshot({ path: join(OUT, 'maps-offline-1200x800.png') });
  ok(errors.length === 0, 'no console errors (besides blocked tiles)', errors.join(' | '));
  await ctx.close();
}

/* ------------------------------------------------------------------ screenshots (real tiles) */
if (args.includes('--shots')) {
  console.log('screenshots (network tiles)');
  for (const [w, h] of [[1440, 900], [390, 844]]) for (const theme of ['light', 'dark']) for (const lang of ['fa', 'en']) {
    const { ctx, p, errors, tiles } = await open({ w, h, theme, lang, tiles: 'net', touch: w < 800 });
    await p.waitForTimeout(2500);
    const file = join(OUT, `maps-${w}x${h}-${theme}-${lang}.png`);
    await p.screenshot({ path: file });
    const of = await overflow(p);
    console.log(`  ${errors.length || of > 0 ? '✗' : '✓'} ${w}x${h} ${theme} ${lang} overflow=${of} tiles=${tiles()} ${errors.join(' | ')}`);
    if (errors.length || of > 0) fails++;
    await ctx.close();
  }
}

await browser.close();
console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
