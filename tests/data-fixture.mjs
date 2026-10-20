#!/usr/bin/env node
/* Data-display fixture test (server must be running): node tests/data-fixture.mjs [--base=http://localhost:5178]
   Uses tests/fixtures/data.html (no shell). Complements tests/data.mjs: multi-sort, CSV of a selection,
   phone swipe → action, chart keyboard + push, log search/pause, tree keys, accordion, JSON, code. */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function findChromium() {
  const dir = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(dir)) return undefined;
  for (const d of readdirSync(dir).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) for (const sub of ['chrome-win64', 'chrome-win']) { const exe = join(dir, d, sub, 'chrome.exe'); if (existsSync(exe)) return exe; }
  return undefined;
}

const base = (process.argv.find((a) => a.startsWith('--base=')) || '').slice(7) || 'http://localhost:5178';
const browser = await chromium.launch({ executablePath: findChromium() });
let fails = 0; let passes = 0;
const ok = (cond, msg) => { if (cond) { passes++; console.log(`  ✓ ${msg}`); } else { fails++; console.log(`  ✗ ${msg}`); } };

async function open(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800, isMobile: w < 800, acceptDownloads: true });
  await ctx.addInitScript(() => localStorage.removeItem('ac:table:fx'));
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(`${base}/tests/fixtures/data.html`, { waitUntil: 'networkidle' });
  await p.waitForSelector('html[data-fx-ready]');
  return { p, ctx, errors };
}

console.log('desktop');
{
  const { p, ctx, errors } = await open(1440, 900);
  await p.click('#fx-table [data-dt="sort"][data-key="team"]');
  await p.click('#fx-table [data-dt="sort"][data-key="spend"]', { modifiers: ['Shift'] });
  ok((await p.$$('#fx-table .ac-dt__sort sup')).length === 2, 'shift-click → multi-sort (2 keys)');
  const teams = await p.$$eval('#fx-table tbody tr[data-id] td:nth-child(5)', (n) => n.map((x) => x.textContent));
  ok(teams.join() === [...teams].sort().join(), 'primary sort key respected');
  await p.check('#fx-table tbody tr[data-id]:nth-child(1) [data-dt="sel"]');
  await p.check('#fx-table tbody tr[data-id]:nth-child(2) [data-dt="sel"]');
  ok(await p.$eval('#fx-table [data-dt="all"]', (x) => x.indeterminate), 'header checkbox indeterminate');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#fx-table [data-dt="export"]')]);
  const chunks = []; for await (const c of await dl.createReadStream()) chunks.push(c);
  const buf = Buffer.concat(chunks);
  ok(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, 'CSV has UTF-8 BOM');
  ok(buf.toString('utf8').trim().split('\r\n').length === 3, 'CSV = header + 2 selected rows');
  await p.click('#fx-table [data-dt="clear"]');
  ok(!(await p.isVisible('#fx-table .ac-dt__bulk')), 'clear selection hides the bulk bar');

  await p.focus('#fx-chart .ac-chart__plot'); await p.keyboard.press('Home');
  ok((await p.textContent('#fx-chart .ac-chart__tip-head')) === 'A', 'chart: Home → first point');
  await p.evaluate(() => window.fxChart.push([12, 8], 'G'));
  ok((await p.textContent('#fx-chart table')).includes('G') && (await p.$$eval('#fx-chart table tbody tr', (n) => n.length)) === 6, 'chart.push keeps the window');

  await p.click('#fx-log [data-log="pause"]');
  await p.evaluate(() => window.fxLog.push({ level: 'error', msg: 'held-line' }));
  await p.waitForTimeout(80);
  ok(!(await p.textContent('#fx-log .ac-log__view')).includes('held-line') && await p.isVisible('#fx-log .ac-log__jump'), 'log pause holds lines + shows pending');
  await p.click('#fx-log [data-log="pause"]');
  await p.fill('#fx-log .ac-log__search input', 'held-line'); await p.waitForTimeout(250);
  ok(await p.$$eval('#fx-log .ac-log__line mark', (n) => n.length) === 1, 'log search highlights the match');

  await p.click('#fx-tree [data-id="js"] > .ac-tree__row');
  ok(await p.getAttribute('#fx-tree [data-id="js"]', 'aria-expanded') === 'true', 'tree: click expands');
  await p.keyboard.press('ArrowDown');
  ok(await p.evaluate(() => document.activeElement.dataset.id) === 'core', 'tree: ↓ moves into children');
  await p.keyboard.press(await p.evaluate(() => document.dir === 'rtl') ? 'ArrowRight' : 'ArrowLeft');
  ok(await p.evaluate(() => document.activeElement.dataset.id) === 'js', 'tree: ← goes to parent');
  await p.keyboard.press('Enter');
  ok(await p.getAttribute('#fx-tree [data-id="js"]', 'aria-selected') === 'true', 'tree: Enter selects');

  await p.click('#fx-acc details:nth-child(2) summary'); await p.waitForTimeout(400);
  ok((await p.$$eval('#fx-acc details[open]', (n) => n.map((d) => [...d.parentElement.children].indexOf(d)))).join() === '1', 'accordion: single-open');
  ok((await p.$$('#fx-json details')).length >= 3, 'JSON viewer renders nested nodes');
  ok(!!(await p.$('#fx-code .ac-code__copy')) && !!(await p.$('#fx-code .ac-code__k')) && !!(await p.$('#fx-code .ac-code__line')), 'code: copy + highlight + line numbers');
  ok(!errors.length, `no console errors ${errors.join(' | ')}`);
  await p.evaluate(() => clearInterval(window.fxLogTimer));
  await ctx.close();
}

console.log('phone');
{
  const { p, ctx, errors } = await open(390, 844);
  const card = p.locator('#fx-table .ac-dt__card').first();
  await card.scrollIntoViewIfNeeded();
  const b = await card.boundingBox();
  const rtl = await p.evaluate(() => document.dir === 'rtl');
  const y = b.y + b.height / 2; const x0 = rtl ? b.x + 40 : b.x + b.width - 40; const x1 = rtl ? x0 + 220 : x0 - 220;
  await p.dispatchEvent('#fx-table .ac-swipe__content >> nth=0', 'pointerdown', { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x0, clientY: y, button: 0 });
  for (let i = 1; i <= 8; i++) await p.evaluate(([x, yy]) => window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, pointerType: 'touch', clientX: x, clientY: yy, cancelable: true })), [x0 + ((x1 - x0) * i) / 8, y]);
  await p.evaluate(([x, yy]) => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', clientX: x, clientY: yy })), [x1, y]);
  await p.waitForTimeout(350);
  ok(await card.evaluate((x) => x.hasAttribute('data-open')), 'swipe opens the actions');
  const act = p.evaluate(() => new Promise((r) => document.querySelector('#fx-table').addEventListener('ac:table:action', (e) => r(e.detail.action), { once: true })));
  await p.click('#fx-table .ac-dt__card[data-open] [data-action="edit"]');
  ok(await act === 'edit', 'swipe action emits ac:table:action');
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(ov <= 0, `no horizontal overflow (${ov})`);
  ok(!errors.length, `no console errors ${errors.join(' | ')}`);
  await p.evaluate(() => clearInterval(window.fxLogTimer));
  await ctx.close();
}

await browser.close();
console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
