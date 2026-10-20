#!/usr/bin/env node
/* Smoke test for the demo pages console, monitoring, orders, invoice, products, roles, user-profile, settings, components.
   node tests/pages-a.mjs [--base=http://localhost:5178]   (dev server must be running)
   Each page: loads without console errors, no horizontal overflow on a phone, key interactions work. */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.argv.find((a) => a.startsWith('--base=')) || '').split('=')[1] || 'http://localhost:5178';
function findChromium() {
  const dir = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(dir)) return undefined;
  for (const d of readdirSync(dir).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse())
    for (const sub of ['chrome-win64', 'chrome-win']) { const exe = join(dir, d, sub, 'chrome.exe'); if (existsSync(exe)) return exe; }
  return undefined;
}

let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? '✓' : '✗'} ${msg}`); if (!cond) failed++; };
const browser = await chromium.launch({ executablePath: findChromium() });

async function open(page, { w = 1440, h = 900, lang = 'en', mobile = false, theme = 'light' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile });
  await ctx.addInitScript(([l, t]) => { localStorage.setItem('ac:lang', l); localStorage.setItem('ac:theme', t); localStorage.removeItem('ac:accent'); localStorage.removeItem('ac:density'); }, [lang, theme]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto(`${base}/demo/#/${page}`, { waitUntil: 'networkidle' });
  await p.waitForSelector(`[data-page="${page.split('?')[0]}"]`, { timeout: 8000 });
  await p.waitForTimeout(700);
  return { p, ctx, errors };
}
const confirmDialog = async (p) => { await p.waitForSelector('.ac-confirm [data-confirm]', { state: 'visible', timeout: 4000 }); await p.click('.ac-confirm [data-confirm]'); await p.waitForTimeout(400); };
const done = async ({ ctx, errors }, name) => { ok(errors.length === 0, `${name}: no console errors${errors.length ? ` (${errors.join(' | ')})` : ''}`); await ctx.close(); };

/* ---------------- phone sweep: every page, fa + en, no overflow, no errors */
for (const page of ['console', 'monitoring', 'orders', 'invoice', 'products', 'roles', 'user-profile', 'settings', 'components']) {
  for (const lang of ['fa', 'en']) {
    const s = await open(page, { w: 390, h: 844, mobile: true, lang });
    const overflow = await s.p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(overflow <= 0, `${page} ${lang} phone: no horizontal overflow (${overflow}px)`);
    ok(await s.p.evaluate(() => document.documentElement.dir) === (lang === 'fa' ? 'rtl' : 'ltr'), `${page} ${lang}: document direction`);
    await done(s, `${page} ${lang} phone`);
  }
}

/* ---------------- console */
const T = '[data-ops-term] .ac-term__input';
{
  const s = await open('console'); const { p } = s;
  ok(await p.$$eval('[data-ops-services] .ops-svc', (e) => e.length) === 12, 'console: 12 service tiles');
  ok(await p.$$eval('[data-ops-uptime] .ac-uptime__row', (e) => e.length) === 12, 'console: 12 uptime rows');
  ok(await p.$$eval('[data-ops-uptime] .ac-uptime__row:first-child .ac-uptime__bars i', (e) => e.length) === 90, 'console: 90 day cells per service');
  const lines0 = await p.$eval('[data-ops-log] .ac-log__view', (e) => e.childElementCount);
  await p.waitForTimeout(2000);
  const stat = await p.$eval('[data-ops-log] .ac-log__stat', (e) => e.textContent);
  ok(lines0 > 0 && /\d/.test(stat), `console: live log renders (${stat.trim()})`);
  await p.click('[data-ops-log] [data-log="pause"]');
  ok(await p.$eval('[data-ops-log] [data-log="pause"]', (e) => e.getAttribute('aria-pressed')) === 'true', 'console: log pause toggles');
  await p.click('[data-ops-group] [data-value="whatsapp"]');
  ok(await p.$$eval('[data-ops-services] .ops-svc', (e) => e.length) === 2, 'console: group filter → 2 WhatsApp gateways');
  await p.click('[data-ops-group] [data-value="all"]');
  await p.fill(T, 'help'); await p.press(T, 'Enter');
  ok(/restart/.test(await p.$eval('[data-ops-term] .ac-term__out', (e) => e.textContent)), 'console: terminal help lists commands');
  await p.fill(T, 'restart all'); await p.press(T, 'Enter');
  ok(/refused/.test(await p.$eval('[data-ops-term] .ac-term__out', (e) => e.textContent)), 'console: "restart all" is refused');
  await p.fill(T, 'restart wapi-2'); await p.press(T, 'Enter');
  await confirmDialog(p);
  await p.waitForFunction(() => document.querySelector('[data-ops-services] [data-id="wapi-2"]')?.dataset.status === 'online', null, { timeout: 6000 }).catch(() => {});
  ok(await p.$eval('[data-ops-services] [data-id="wapi-2"]', (e) => e.dataset.status) === 'online', 'console: restart (after confirm) brings wapi-2 online');
  await p.press(T, 'ArrowUp');
  ok(await p.$eval(T, (e) => e.value) === 'restart wapi-2', 'console: ↑ recalls command history');
  const openInc = await p.$$eval('[data-resolve]', (e) => e.length);
  await p.click('[data-resolve]');
  ok(await p.$$eval('[data-resolve]', (e) => e.length) === openInc - 1, 'console: resolving an incident');
  ok(await p.$$eval('[data-ops-jobs] tbody tr[data-id]', (e) => e.length) > 0, 'console: jobs table rows');
  await done(s, 'console');
}

/* ---------------- monitoring */
{
  const s = await open('monitoring'); const { p } = s;
  ok(await p.$$eval('[data-mon-gauge] svg', (e) => e.length) === 3, 'monitoring: 3 gauges');
  const lastLabel = () => p.$eval('[data-mon-usage]', (e) => [...e.querySelectorAll('text')].map((t) => t.textContent).join('|'));
  const before = await lastLabel(); await p.waitForTimeout(2600);
  ok(before !== await lastLabel(), 'monitoring: realtime chart advances (push every 2s)');
  await p.click('.mon-srv[data-id="db-01"]');
  ok(await p.$eval('[data-mon-server]', (e) => e.value) === 'db-01', 'monitoring: server card selects server');
  ok(await p.$eval('.mon-srv[data-id="db-01"]', (e) => e.getAttribute('aria-pressed')) === 'true', 'monitoring: selected card is pressed');
  await p.click('[data-mon-pause]');
  ok(await p.$eval('[data-mon-pause]', (e) => e.getAttribute('aria-pressed')) === 'true', 'monitoring: pause');
  const n = await p.$$eval('[data-mon-alerts] [data-ack]', (e) => e.length);
  await p.click('[data-mon-alerts] [data-ack]');
  ok(await p.$$eval('[data-mon-alerts] [data-ack]', (e) => e.length) === n - 1, 'monitoring: acknowledge alert');
  await done(s, 'monitoring');
}

/* ---------------- orders */
{
  const s = await open('orders'); const { p } = s;
  await p.waitForSelector('[data-ord-table] tbody tr[data-id]');
  await p.click('[data-ord-filters] [data-status="paid"]'); await p.waitForTimeout(300);
  const st = await p.$$eval('[data-ord-table] tbody tr[data-id]', (r) => r.map((x) => x.textContent));
  ok(st.length > 0 && st.every((t) => /Paid/.test(t)), `orders: status chip filters rows (${st.length} paid)`);
  await p.click('[data-ord-table] tbody tr[data-id] td:nth-child(3)');
  await p.waitForSelector('.ac-drawer[data-state="open"] .ord-detail', { timeout: 4000 }).catch(() => {});
  ok(!!await p.$('.ac-drawer[data-state="open"] .ord-detail'), 'orders: row click opens the details drawer');
  await p.keyboard.press('Escape'); await done(s, 'orders desktop');
  const m = await open('orders', { w: 390, h: 844, mobile: true });
  await m.p.waitForSelector('[data-ord-table] .ac-dt__card[data-id]');
  await m.p.click('[data-ord-table] .ac-dt__card[data-id] .ac-dt__card-body, [data-ord-table] .ac-dt__card[data-id]', { position: { x: 120, y: 30 } }).catch(() => {});
  await m.p.waitForSelector('.ac-sheet[data-state="open"] .ord-detail', { timeout: 4000 }).catch(() => {});
  ok(!!await m.p.$('.ac-sheet[data-state="open"] .ord-detail'), 'orders: on phone the details open as a sheet');
  await done(m, 'orders phone');
}

/* ---------------- invoice */
{
  const s = await open('invoice?id=INV-2035'); const { p } = s;
  ok(await p.$eval('[data-inv-no]', (e) => e.textContent) === 'INV-2035', 'invoice: ?id= selects the order');
  ok(await p.$$eval('[data-inv-lines] tr', (e) => e.length) === 3, 'invoice: 3 lines');
  ok(await p.$$eval('[data-inv-qr] rect', (e) => e.length) > 100, 'invoice: QR placeholder drawn');
  ok(/[۰-۹]/.test(await p.$eval('[data-inv-toman]', (e) => e.textContent)), 'invoice: toman amount in Persian digits');
  ok(/\$\d/.test(await p.$eval('[data-inv-total]', (e) => e.textContent)), 'invoice: total in Latin digits');
  await p.emulateMedia({ media: 'print' });
  ok(await p.$eval('.ac-appbar', (e) => getComputedStyle(e).display) === 'none' && await p.$eval('.inv', (e) => getComputedStyle(e).display) !== 'none', 'invoice: print hides the shell, keeps the invoice');
  await done(s, 'invoice');
}

/* ---------------- products */
{
  const s = await open('products'); const { p } = s;
  ok(await p.$$eval('[data-prod-list] .prod', (e) => e.length) === 10, 'products: 10 cards');
  await p.click('[data-prod-view] [data-value="list"]');
  ok(await p.$eval('[data-prod-list]', (e) => e.dataset.view) === 'list', 'products: list view toggle');
  await p.click('[data-cat="Electronics"]');
  ok(await p.$$eval('[data-prod-list] .prod', (e) => e.length) === 4, 'products: category filter');
  await p.fill('[data-prod-q]', 'pixel'); await p.waitForTimeout(300);
  ok(await p.$$eval('[data-prod-list] .prod', (e) => e.length) === 1, 'products: search');
  await p.click('[data-prod-list] .prod [data-edit]');
  await p.waitForSelector('#prod-editor[data-state="open"]');
  ok(await p.$eval('#prod-name', (e) => e.value) === 'Pixel Pro 9', 'products: editor opens with values');
  await p.fill('#prod-name', 'Pixel Pro 10'); await p.click('button[form="prod-form"]');
  await p.waitForFunction(() => /Pixel Pro 10/.test(document.querySelector('[data-prod-list]').textContent), null, { timeout: 4000 }).catch(() => {});
  ok(/Pixel Pro 10/.test(await p.$eval('[data-prod-list]', (e) => e.textContent)), 'products: save updates the card');
  await done(s, 'products');
}

/* ---------------- roles */
{
  const s = await open('roles'); const { p } = s;
  ok(await p.$$eval('[data-roles-body] tr', (e) => e.length) === 10, 'roles: 10 resources in the matrix');
  await p.click('[data-role="support"]');
  ok(await p.$eval('[data-roles-title]', (e) => e.textContent) === 'Support', 'roles: select role');
  await p.check('[data-res="servers"][data-act="edit"]');
  ok(await p.$eval('[data-res="servers"][data-act="view"]', (e) => e.checked), 'roles: granting edit also grants view');
  ok(await p.$eval('[data-roles-save]', (e) => !e.disabled), 'roles: save enabled when dirty');
  await p.click('[data-row="billing"]');
  ok(await p.$$eval('[data-res="billing"][data-act]', (e) => e.every((c) => c.checked)), 'roles: row switch grants all actions');
  await p.click('[data-roles-save]');
  ok(await p.$eval('[data-roles-save]', (e) => e.disabled), 'roles: saved');
  await p.click('[data-role="owner"]');
  ok(await p.$$eval('[data-roles-body] input', (e) => e.every((c) => c.disabled)), 'roles: owner is locked');
  await p.click('[data-ac-open="#role-new"]'); await p.waitForSelector('#role-new[data-state="open"]');
  await p.fill('#role-name', 'Accountant'); await p.click('button[form="role-form"]');
  await p.waitForTimeout(400);
  ok(await p.$eval('[data-roles-title]', (e) => e.textContent) === 'Accountant', 'roles: create role');
  await done(s, 'roles');
}

/* ---------------- user profile */
{
  const s = await open('user-profile'); const { p } = s;
  await p.click('[aria-controls="prof-security"]');
  ok(await p.$eval('#prof-security', (e) => !e.hidden), 'profile: security tab');
  const n = await p.$$eval('[data-prof-sessions] li', (e) => e.length);
  await p.click('[data-revoke]'); await confirmDialog(p); await p.waitForTimeout(400);
  ok(await p.$$eval('[data-prof-sessions] li', (e) => e.length) === n - 1, 'profile: revoke a session (after confirm)');
  await p.click('[aria-controls="prof-activity"]');
  ok(await p.$$eval('[data-prof-timeline] li', (e) => e.length) === 8, 'profile: activity timeline');
  await done(s, 'user-profile');
}

/* ---------------- settings */
{
  const s = await open('settings'); const { p } = s;
  const hash = await p.evaluate(() => location.hash);
  await p.click('.set-nav__link[href="#set-api"]'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => location.hash) === hash, 'settings: section nav scrolls without touching the route');
  await p.click('[data-set-theme] [data-value="dark"]');
  await p.waitForFunction(() => document.documentElement.dataset.theme === 'dark', null, { timeout: 3000 }).catch(() => {});
  ok(await p.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'settings: theme → dark');
  await p.click('.set-acc[data-acc="blue"]');
  ok(await p.evaluate(() => document.documentElement.dataset.accent) === 'blue', 'settings: accent → blue');
  const before = await p.$eval('.set-key[data-id="k1"] .set-key__secret', (e) => e.textContent);
  await p.click('.set-key[data-id="k1"] [data-key="regen"]'); await confirmDialog(p);
  const after = await p.$eval('.set-key[data-id="k1"] .set-key__secret', (e) => e.textContent);
  ok(before !== after && !after.includes('•'), 'settings: regenerate key (after confirm) shows the new key');
  await done(s, 'settings');
}

/* ---------------- components gaps */
{
  const s = await open('components'); const { p } = s;
  ok(await p.$$eval('.ac-accordion details', (e) => e.length) >= 3, 'components: accordion');
  ok(await p.$$eval('[data-ac="tree"] [role="treeitem"]', (e) => e.length) > 3, 'components: tree');
  ok(!!await p.$('[data-ac="code"] button'), 'components: code block with copy');
  ok(await p.$$eval('[data-ac="json"] *', (e) => e.length) > 5, 'components: JSON viewer');
  ok(await p.$$eval('.ac-swipe', (e) => e.length) === 3, 'components: swipe list');
  await done(s, 'components');
}

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
