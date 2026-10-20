#!/usr/bin/env node
/* AC.notify suite (dev server must be running): every variant, positions (RTL-aware), stacking / max visible, grouping,
   swipe-to-dismiss, snackbar undo, progress, dynamic island, inline, inbox, system notification (permission granted),
   simulated push, preferences routing + do-not-disturb, the settings card, and the existing toast / notification APIs.
   node tests/notify.mjs [--base=http://localhost:5178] [--shots] */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.argv.find((a) => a.startsWith('--base=')) || '').slice(7) || 'http://localhost:5178';
const SHOTS = process.argv.includes('--shots');
const OUT = join(ROOT, 'tests', 'screens'); mkdirSync(OUT, { recursive: true });
const pw = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const exe = readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse().map((d) => join(pw, d, 'chrome-win64', 'chrome.exe')).find(existsSync);
const browser = await chromium.launch({ executablePath: exe });
let failed = 0;
const ok = (cond, msg, extra = '') => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}${extra ? ` — ${extra}` : ''}`); if (!cond) failed++; };
const errors = [];

async function open(viewport, lang = 'fa', extra = {}) {
  const ctx = await browser.newContext({ viewport, ...extra });
  await ctx.grantPermissions(['notifications'], { origin: new URL(BASE).origin });
  await ctx.addInitScript((l) => { localStorage.setItem('ac:lang', JSON.stringify(l)); localStorage.removeItem('ac:notify'); }, lang);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  await p.goto(`${BASE}/demo/#/notify-lab`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.AC?.notify && document.querySelector('[data-page="notify-lab"]'), null, { timeout: 10000 });
  await p.waitForTimeout(400);
  return { ctx, p };
}

try {
  const { ctx, p } = await open({ width: 1440, height: 900 });
  const ev = (fn, arg) => p.evaluate(fn, arg);

  // toast (existing AC.toast API underneath) + grouping
  await ev(() => AC.notify({ title: 'Saved', tone: 'success' }));
  ok((await p.locator('.ac-toast').count()) >= 1, 'toast variant → AC.toast');
  await ev(() => { AC.notify({ title: 'Message', group: 'g1' }); AC.notify({ title: 'Message', group: 'g1' }); AC.notify({ title: 'Message', group: 'g1' }); });
  await p.waitForTimeout(200);
  ok(await ev(() => [...document.querySelectorAll('.ac-toast__title')].some((t) => t.textContent.includes('(3)'))), 'grouping collapses repeats into one toast with a count');
  await ev(() => AC.notify.clear());

  // rich cards: avatar, image, actions, stacking + max visible
  await ev(() => AC.notify.setPrefs({ max: 3 }));
  await ev(() => { window.__act = 0; for (let i = 0; i < 5; i++) AC.notify({ variant: 'card', title: `Card ${i}`, text: 'body', avatar: 'AB', image: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', position: 'bottom-end', duration: 0, actions: [{ label: 'Open', primary: true, onClick: () => { window.__act++; } }] }); });
  await p.waitForTimeout(400);
  ok((await p.locator('.ac-ntf-stack[data-position="bottom-end"] .ac-ntf:not([data-overflow])').count()) === 3, 'card stack shows max 3 at once');
  ok(await p.locator('.ac-ntf-stack__more').isVisible(), '"+2 more" control for the overflow', await p.locator('.ac-ntf-stack__more').textContent());
  await p.locator('.ac-ntf-stack__more').click(); await p.waitForTimeout(200);
  ok((await p.locator('.ac-ntf-stack .ac-ntf:not([data-overflow])').count()) === 5, 'expanding the stack reveals all cards');
  ok((await p.locator('.ac-ntf .ac-ntf__avatar').count()) === 5 && (await p.locator('.ac-ntf .ac-ntf__image').count()) === 5, 'cards render avatar + image');
  if (SHOTS) await p.screenshot({ path: join(OUT, 'notify-cards-desktop.png') });
  await p.locator('.ac-ntf [data-ntf-action="0"]').first().click(); await p.waitForTimeout(350);
  ok(await ev(() => window.__act === 1) && (await p.locator('.ac-ntf:not([data-state="exit"])').count()) === 4, 'an action runs its handler and closes the card');

  // swipe to dismiss (mouse drag)
  const card = p.locator('.ac-ntf').first();
  const box = await card.boundingBox();
  await p.mouse.move(box.x + 40, box.y + box.height / 2); await p.mouse.down();
  for (let i = 1; i <= 8; i++) await p.mouse.move(box.x + 40 + i * 40, box.y + box.height / 2);
  await p.mouse.up(); await p.waitForTimeout(400);
  ok((await p.locator('.ac-ntf:not([data-state="exit"]):not([data-state="swiped"])').count()) === 3, 'swiping a card away dismisses it');
  await ev(() => AC.notify.clear()); await p.waitForTimeout(350);

  // positions — RTL aware: in fa, "start" is the right edge
  const pos = await ev(async () => {
    const out = {};
    for (const x of AC.notify.positions) { AC.notify({ variant: 'card', title: x, position: x, duration: 0, haptic: false }); }
    await new Promise((r) => setTimeout(r, 400));
    for (const s of document.querySelectorAll('.ac-ntf-stack')) { const r = s.getBoundingClientRect(); out[s.dataset.position] = { cx: (r.left + r.right) / 2 / innerWidth, top: r.top < innerHeight / 2 }; }
    return out;
  });
  ok(Object.keys(pos).length === 6, 'six positions', Object.keys(pos).join(' '));
  ok(pos['top-start']?.cx > 0.6 && pos['top-end']?.cx < 0.4 && Math.abs(pos['bottom-center']?.cx - 0.5) < 0.1 && pos['top-start'].top && !pos['bottom-end'].top, 'positions are RTL-aware (start = right in Persian)');
  if (SHOTS) await p.screenshot({ path: join(OUT, 'notify-positions-desktop.png') });
  await ev(() => AC.notify.clear()); await p.waitForTimeout(350);

  // banner (queued, one at a time)
  await ev(() => { AC.notify({ variant: 'banner', title: 'First', tone: 'danger', actions: [{ label: 'Fix', primary: true }] }); AC.notify({ variant: 'banner', title: 'Second' }); });
  await p.waitForTimeout(400);
  ok((await p.locator('.ac-ntf-banner').count()) === 1 && (await p.locator('.ac-ntf-banner').textContent()).includes('First'), 'banner shows one at a time');
  if (SHOTS) await p.screenshot({ path: join(OUT, 'notify-banner-desktop.png') });
  await p.locator('.ac-ntf-banner [data-ntf-close]').click(); await p.waitForTimeout(500);
  ok((await p.locator('.ac-ntf-banner').textContent()).includes('Second'), 'closing a banner shows the next queued one');
  await ev(() => AC.notify.clear('banner')); await p.waitForTimeout(400);

  // snackbar with undo
  await ev(() => { window.__undo = 0; window.__commit = 0; AC.notify.snackbar({ title: '3 archived', onUndo: () => { window.__undo++; }, onCommit: () => { window.__commit++; } }); });
  await p.waitForTimeout(300);
  ok(await p.locator('.ac-snack .ac-snack__ring').isVisible(), 'snackbar with countdown ring');
  await p.locator('[data-snack-undo]').click(); await p.waitForTimeout(300);
  ok(await ev(() => window.__undo === 1 && window.__commit === 0), 'Undo calls onUndo (and not onCommit)');

  // progress
  const prog = await ev(async () => {
    const h = AC.notify.progress({ title: 'Uploading' });
    h.update({ progress: 0.42 });
    const now = document.querySelector(`.ac-ntf[data-id="${h.id}"] [role="progressbar"]`).getAttribute('aria-valuenow');
    h.done('Uploaded');
    return { now, tone: h.el.dataset.tone };
  });
  ok(prog.now === '42' && prog.tone === 'success', 'progress notification updates and completes', JSON.stringify(prog));

  // dynamic island
  await ev(() => AC.notify.island({ title: 'Deploying', text: 'v2.4 to 3 servers', progress: 0.3, expand: true, duration: 0, actions: [{ label: 'Details' }] }));
  await p.waitForTimeout(700);
  ok(await p.locator('.ac-island[data-expanded]').isVisible(), 'island appears and expands');
  if (SHOTS) await p.screenshot({ path: join(OUT, 'notify-island-desktop.png') });
  await p.keyboard.press('Escape').catch(() => {});
  await ev(() => AC.notify.clear('island'));

  // inline
  await ev(() => AC.notify.inline({ target: '[data-lab-inline]', tone: 'warning', title: 'Storage 80%', actions: [{ label: 'Upgrade' }] }));
  ok((await p.locator('[data-lab-inline] .ac-alert.ac-ntf-inline').count()) === 1, 'inline alert rendered inside its target');

  // inbox (notification center) + routing by preferences
  const unread0 = await ev(() => AC.notifications.unread);
  await ev(() => AC.notify({ event: 'marketing', title: 'New feature' })); // defaults: in-app off, inbox on
  ok((await ev(() => AC.notifications.unread)) === unread0 + 1 && (await p.locator('.ac-toast, .ac-ntf').filter({ hasText: 'New feature' }).count()) === 0, 'event routing: "marketing" goes to the inbox only');
  await ev(() => AC.notify.setPrefs({ quiet: true }));
  await ev(() => { AC.notify({ event: 'order', title: 'Quiet order' }); AC.notify({ event: 'order', title: 'Urgent order', priority: 'urgent' }); });
  await p.waitForTimeout(300);
  ok((await p.locator('.ac-toast').filter({ hasText: 'Quiet order' }).count()) === 0 && (await p.locator('.ac-toast').filter({ hasText: 'Urgent order' }).count()) === 1, 'do-not-disturb silences routed notifications but not urgent ones');
  await ev(() => AC.notify.setPrefs({ quiet: false }));

  // system notification (permission granted) + simulated push
  const sys = await ev(async () => { const h = await AC.notify.system({ title: 'System hello', text: 'from the OS' }); return h?.variant; });
  ok(sys === 'system', 'system notification via the Notification API (permission granted)');
  const push = await ev(() => AC.notify.push.simulate({ title: 'Push!', body: 'hello' }));
  ok(push === 'page' || push === 'sw', 'push.simulate delivers (page fallback without a service worker)', push);

  // settings card
  ok((await p.locator('[data-ac~="notify-prefs"] tbody tr').count()) >= 6, 'preferences card lists every event type');
  await p.locator('[data-ac~="notify-prefs"] tr[data-ev="order"] input[data-pref="system"]').check();
  ok(await ev(() => AC.notify.prefs().events.order.system === true), 'toggling a channel persists the preference');
  await p.locator('[data-ac~="notify-prefs"] [data-pos="top-start"]').click(); await p.waitForTimeout(200);
  ok(await ev(() => AC.notify.prefs().position === 'top-start'), 'position picker writes the preference');
  if (SHOTS) { await p.locator('[data-ac~="notify-prefs"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: join(OUT, 'notify-prefs-desktop.png') }); }

  // existing APIs still intact
  ok(await ev(() => typeof AC.toast.undo === 'function' && typeof AC.toast.promise === 'function' && typeof AC.notifications.add === 'function'), 'AC.toast / AC.notifications APIs unchanged');
  await ctx.close();

  // phone + English: island and cards fit, no overflow
  const ph = await open({ width: 390, height: 844 }, 'en', { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ph.p.evaluate(() => { AC.notify({ variant: 'card', title: 'Phone card', text: 'Fits the screen', avatar: 'AB', actions: [{ label: 'Reply', primary: true }] }); AC.notify.island({ title: 'Recording', duration: 0 }); });
  await ph.p.waitForTimeout(500);
  const fit = await ph.p.evaluate(() => [...document.querySelectorAll('.ac-ntf, .ac-island')].every((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }) && document.documentElement.scrollWidth <= innerWidth);
  ok(fit, 'phone: cards and island stay inside the screen, no horizontal overflow');
  if (SHOTS) await ph.p.screenshot({ path: join(OUT, 'notify-phone-en.png') });
  await ph.ctx.close();
} catch (err) {
  ok(false, `unexpected: ${err.message}`);
} finally {
  await browser.close();
}
ok(!errors.length, 'no console errors', errors.slice(0, 5).join(' | '));
console.log(failed ? `\n${failed} notify check(s) failed` : '\nnotify checks passed');
process.exit(failed ? 1 : 0);
