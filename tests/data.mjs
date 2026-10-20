#!/usr/bin/env node
/* Data components smoke test (dev server must be running).
   node tests/data.mjs [--base=http://localhost:5178]
   Covers: data table sort / multi-sort / search / select + bulk bar / paginate / CSV export (UTF-8 BOM) /
   phone cards + swipe; charts render, keyboard + pointer tooltip, legend toggle, live update; log viewer. */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

async function open(page, { w = 1440, h = 900, lang = 'en', mobile = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile, acceptDownloads: true });
  await ctx.addInitScript((l) => { localStorage.setItem('ac:lang', l); localStorage.setItem('ac:theme', 'light'); localStorage.removeItem('ac:table:users'); }, lang);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto(`${base}/demo/#/${page}`, { waitUntil: 'networkidle' });
  await p.waitForSelector('.ac-dt__table, .ac-dt__cards', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(500);
  return { p, ctx, errors };
}

/* ---------------- desktop table */
{
  const { p, ctx, errors } = await open('users');
  const T = '[data-users-table]';
  const rowCount = () => p.$$eval(`${T} tbody tr[data-id]`, (r) => r.length);
  const info = () => p.$eval(`${T} .ac-dt__info`, (e) => e.textContent.trim());
  ok(await rowCount() === 10, 'table renders 10 rows on page 1');
  ok(/1–10 of 60/.test(await info()), `info shows range (${await info()})`);

  await p.click(`${T} [data-dt="sort"][data-key="name"]`);
  const names = await p.$$eval(`${T} tbody tr[data-id] strong`, (e) => e.map((x) => x.textContent));
  const sorted = [...names].sort(new Intl.Collator('en', { sensitivity: 'base', numeric: true }).compare);
  ok(JSON.stringify(names) === JSON.stringify(sorted), 'click sorts by name ascending');
  ok(await p.$eval(`${T} th[aria-sort="ascending"]`, (e) => !!e), 'aria-sort=ascending set');
  await p.click(`${T} [data-dt="sort"][data-key="team"]`, { modifiers: ['Shift'] });
  ok(await p.$$eval(`${T} th[aria-sort="ascending"]`, (e) => e.length) === 2, 'shift-click adds a second sort key');

  await p.fill(`${T} [data-dt="search"]`, 'gmail');
  await p.waitForTimeout(400);
  const emails = await p.$$eval(`${T} tbody tr[data-id] small`, (e) => e.map((x) => x.textContent));
  ok(emails.length > 0 && emails.every((x) => x.includes('gmail')), `search filters rows (${emails.length} gmail)`);
  await p.fill(`${T} [data-dt="search"]`, 'zzzz-no-match');
  await p.waitForTimeout(400);
  ok(await p.$(`${T} .ac-empty`) !== null, 'empty state shown for no matches');
  await p.click(`${T} [data-dt="reset-all"]`);
  ok(await rowCount() === 10, 'clear search restores rows');

  await p.click(`${T} [data-dt="filters"]`);
  await p.selectOption(`${T} select[data-key="status"]`, 'suspended');
  const statuses = await p.$$eval(`${T} tbody tr[data-id] .ac-badge`, (e) => e.map((x) => x.textContent));
  ok(statuses.length > 0 && statuses.every((s) => /Suspended/.test(s)), `select filter keeps only suspended (${statuses.length})`);
  await p.click(`${T} [data-dt="reset"]`);

  await p.click(`${T} [data-dt="page"][data-page="2"]`);
  ok(/11–20 of 60/.test(await info()), 'pagination moves to page 2');
  await p.selectOption(`${T} [data-dt="size"]`, '25');
  ok(await rowCount() === 25, 'page size 25');

  await p.check(`${T} tbody tr:nth-child(1) [data-dt="sel"]`); await p.check(`${T} tbody tr:nth-child(2) [data-dt="sel"]`);
  ok(await p.$eval(`${T} .ac-dt__bulk`, (e) => !e.hidden && /2 selected/.test(e.textContent)), 'bulk bar shows 2 selected');
  await p.check(`${T} thead [data-dt="all"]`);
  ok(await p.$eval(`${T} .ac-dt__count`, (e) => e.textContent).then((t) => /25 selected/.test(t)), 'select-all selects the page');

  const [dl] = await Promise.all([p.waitForEvent('download'), p.click(`${T} [data-dt="export"]`)]);
  const buf = readFileSync(await dl.path());
  ok(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, 'CSV starts with UTF-8 BOM');
  const lines = buf.toString('utf8').replace(/^﻿/, '').trim().split(/\r\n/);
  ok(lines.length === 26 && /User/.test(lines[0]), `CSV exports header + 25 selected rows (${lines.length})`);

  await p.click(`${T} [data-dt="clear"]`);
  await p.click(`${T} tbody [data-dt="expand"]`);
  ok(await p.$(`${T} .ac-dt__detail`) !== null, 'row expansion opens a detail row');
  await p.click(`${T} [data-dt="cols"]`);
  await p.uncheck(`${T} [data-dt="col"][value="team"]`);
  ok(!(await p.$(`${T} [data-dt="sort"][data-key="team"]`)), 'column visibility hides Team');
  const evt = p.evaluate(() => new Promise((r) => document.querySelector('[data-users-table]').addEventListener('ac:table:action', (e) => r(e.detail.action), { once: true })));
  await p.click(`${T} tbody [data-dt="action"][data-action="edit"]`);
  ok(await evt === 'edit', 'row action emits ac:table:action');
  ok(!errors.length, `no console errors (${errors.join(' | ')})`);
  await ctx.close();
}

/* ---------------- phone cards + swipe */
{
  const { p, ctx, errors } = await open('users', { w: 390, h: 844, lang: 'fa', mobile: true });
  const T = '[data-users-table]';
  ok(await p.$$eval(`${T} .ac-dt__card`, (e) => e.length) === 10, 'phone renders 10 cards');
  ok(await p.$(`${T} table`) === null, 'no table on phone');
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 0, `no horizontal overflow on phone (${overflow})`);
  const card = await p.$(`${T} .ac-dt__card .ac-swipe__content`);
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  const y = box.y + box.height / 2;
  // RTL: actions sit at the inline end (left) — swipe toward the right edge reveals them
  await p.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    const fire = (type, cx) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, pointerType: 'touch', clientX: cx, clientY: y, isPrimary: true, button: 0 }));
    fire('pointerdown', x);
    for (let i = 1; i <= 10; i++) window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 7, pointerType: 'touch', clientX: x + i * 18, clientY: y }));
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7, pointerType: 'touch', clientX: x + 180, clientY: y }));
  }, { x: box.x + 60, y });
  await p.waitForTimeout(400);
  ok(await p.$(`${T} .ac-dt__card[data-open]`) !== null, 'swipe opens row actions');
  ok(!errors.length, `no console errors (${errors.join(' | ')})`);
  await ctx.close();
}

/* ---------------- charts */
{
  const { p, ctx, errors } = await open('analytics');
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
  const types = await p.$$eval('.ac-chart', (e) => e.map((x) => x.dataset.type));
  for (const t of ['area', 'sparkline', 'donut', 'heatmap', 'funnel', 'bar', 'gauge']) ok(types.includes(t), `chart type ${t} rendered`);
  ok(await p.$$eval('.ac-chart', (e) => e.every((x) => x.getAttribute('aria-label') && x.querySelector('table'))), 'every chart has aria-label + hidden data table');
  const plot = await p.$('[data-an-traffic] .ac-chart__plot');
  await plot.scrollIntoViewIfNeeded();
  const b = await plot.boundingBox();
  await p.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5);
  await p.waitForTimeout(250);
  ok(await p.$eval('[data-an-traffic] .ac-chart__plot', (e) => e.hasAttribute('data-hover')), 'pointer shows tooltip + crosshair');
  ok(/Visitors/.test(await p.$eval('[data-an-traffic] .ac-chart__tip', (e) => e.textContent)), 'tooltip lists series values');
  await p.focus('[data-an-traffic] .ac-chart__plot');
  await p.keyboard.press('End');
  ok(await p.$eval('[data-an-traffic] .ac-chart__tip', (e) => e.textContent.length > 0), 'keyboard End inspects last point');
  await p.click('[data-an-traffic] .ac-chart__key[data-i="1"]');
  ok(await p.$eval('[data-an-traffic] .ac-chart__key[data-i="1"]', (e) => e.getAttribute('aria-pressed')) === 'false', 'legend toggles a series');
  ok(await p.$$eval('[data-an-traffic] .ac-chart__line', (e) => e.length) === 1, 'hidden series removed from plot');
  await p.click('[data-an-range] [data-value="12m"]');
  await p.waitForTimeout(200);
  ok(await p.$$eval('[data-an-traffic] table tbody tr', (e) => e.length) === 12, 'range switch updates chart (12 months)');
  const pushed = await p.evaluate(() => { const c = AC.instance(document.querySelector('[data-an-traffic]'), 'chart'); c.push([999, 1999], 'now'); return c.config.series[0].data.slice(-1)[0]; });
  ok(pushed === 999, 'chart.push() appends realtime values');
  await p.evaluate(() => AC.theme.set({ theme: 'dark' }));
  await p.waitForTimeout(400);
  ok(await p.$eval('[data-an-traffic] .ac-chart__svg', (e) => e.childElementCount > 0), 'chart redraws after theme change');
  ok(!errors.length, `no console errors (${errors.join(' | ')})`);
  await ctx.close();
}

/* ---------------- log viewer (mounted on a blank demo page) */
{
  const { p, ctx, errors } = await open('analytics');
  const res = await p.evaluate(async () => {
    const el = document.createElement('div'); document.querySelector('main, body').append(el);
    const log = AC.logview(el, { render: 50 });
    for (let i = 0; i < 120; i++) log.push({ level: ['info', 'warn', 'error', 'debug'][i % 4], src: 'api', msg: `line ${i}` });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const capped = el.querySelectorAll('.ac-log__line').length;
    log.filter({ levels: ['error'] });
    const errs = el.querySelectorAll('.ac-log__line[data-level="error"]').length === el.querySelectorAll('.ac-log__line').length;
    log.pause(true); log.push({ level: 'error', msg: 'while paused' });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const pausedHidden = !el.textContent.includes('while paused');
    log.pause(false);
    const shownAfter = el.textContent.includes('while paused');
    el.remove();
    return { capped, errs, pausedHidden, shownAfter };
  });
  ok(res.capped === 50, `log viewer caps DOM lines (${res.capped})`);
  ok(res.errs, 'log level filter');
  ok(res.pausedHidden && res.shownAfter, 'pause holds new lines, resume shows them');
  ok(!errors.length, `no console errors (${errors.join(' | ')})`);
  await ctx.close();
}

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nall data checks passed');
process.exit(failed ? 1 : 0);
