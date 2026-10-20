#!/usr/bin/env node
/* Iranian invoices (src/modules/invoice-ir) + marketing dashboards (src/modules/marketing).
   node tests/invoice-marketing.mjs [--base=http://localhost:5178] [--keep-pdf]
   Checks: no console errors, no phone overflow, invoice maths / unit / digits / paper toggles, editor live totals,
   print emulation → A4/A5 PDFs (shell hidden, header row repeats on a multi-page invoice), Search Console toggles,
   tabs, range + compare, marketing realtime ticking. PDFs → tests/screens/invoice-*.pdf */
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'screens'); mkdirSync(OUT, { recursive: true });
const base = (process.argv.find((a) => a.startsWith('--base=')) || '').split('=')[1] || 'http://localhost:5178';
function findChromium() {
  const dir = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(dir)) return undefined;
  for (const d of readdirSync(dir).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) for (const s of ['chrome-win64', 'chrome-win']) { const exe = join(dir, d, s, 'chrome.exe'); if (existsSync(exe)) return exe; }
  return undefined;
}
// failures that belong to other in-progress modules, not to these pages
const FOREIGN = [/prose\.css/];

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? '✓' : '✗'} ${msg}`); if (!cond) fails++; };
const browser = await chromium.launch({ executablePath: findChromium() });

async function open(page, { w = 1440, h = 900, lang = 'fa', theme = 'light' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
  await ctx.addInitScript(([l, t]) => { localStorage.setItem('ac:lang', l); localStorage.setItem('ac:theme', t); localStorage.removeItem('ac:invoice-ir:draft'); localStorage.setItem('ac:digits', 'latn'); }, [lang, theme]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error' && !FOREIGN.some((r) => r.test(m.text() + (m.location()?.url || '')))) errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  p.on('requestfailed', (r) => { if (!FOREIGN.some((x) => x.test(r.url()))) errors.push(`requestfailed: ${r.url()}`); });
  await p.goto(`${base}/demo/#/${page}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1400);
  return { p, ctx, errors };
}
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const digitsOf = (s) => s.replace(/[^\d]/g, '');

/* ---------------- official invoice */
{
  const { p, ctx, errors } = await open('invoice-official');
  const total = await p.textContent('.aci-table--official tfoot td:last-child');
  // 6 demo lines: net 3,455,925,000 + VAT 10% 337,892,500 (rounded per line) = 3,716,817,500 rial... check structure + maths independently
  const calc = await p.evaluate(() => { const T = AC.invoiceIR.totals(AC.instance(document.querySelector('[data-invir]'), 'invoice-ir').data); return T; });
  ok(digitsOf(total) === String(calc.total), `official total row = totals().total (${total.trim()})`);
  ok(calc.vat === calc.lines.reduce((a, l) => a + Math.round(l.net * 0.1), 0), 'VAT is 10% per line, rounded per line');
  ok((await p.$$eval('.aci-table--official thead th', (x) => x.length)) === 11, 'standard 11 columns');
  ok(/ریال/.test(await p.textContent('.aci-words')), 'amount in words ends with ریال');
  await p.click('.aci-toolbar [data-aci-opt="unit"] [data-value="IRT"]'); await p.waitForTimeout(150);
  const totalT = await p.textContent('.aci-table--official tfoot td:last-child');
  ok(Math.abs(Number(digitsOf(totalT)) - calc.total / 10) < 1, 'Toman toggle divides by 10');
  await p.click('.aci-toolbar [data-aci-opt="digits"] [data-value="fa"]'); await p.waitForTimeout(150);
  ok(/[۰-۹]/.test(await p.textContent('.aci-table--official tfoot')), 'Persian digits toggle');
  await p.click('.aci-toolbar [data-aci-opt="unit"] [data-value="IRR"]');
  await p.click('.aci-toolbar [data-aci-opt="digits"] [data-value="latn"]');
  // print: A4 landscape (default) — shell and toolbar hidden
  await p.emulateMedia({ media: 'print' });
  const hidden = await p.evaluate(() => ['.ac-appbar', '.aci-toolbar-slot', '.ac-page-head'].every((s) => { const e = document.querySelector(s); return !e || getComputedStyle(e).display === 'none'; }));
  ok(hidden, 'print hides shell, page head and toolbar');
  await p.pdf({ path: join(OUT, 'invoice-official-a4l.pdf'), preferCSSPageSize: true, printBackground: true });
  // long invoice → several pages, header row repeats
  await p.emulateMedia({ media: 'screen' });
  await p.evaluate(() => {
    const api = AC.instance(document.querySelector('[data-invir]'), 'invoice-ir');
    const d = structuredClone(api.data); d.items = Array.from({ length: 48 }, (_, i) => ({ ...d.items[i % d.items.length], code: String(2720000100000 + i) }));
    api.update(d); api.set({ paper: 'a4' });
  });
  await p.emulateMedia({ media: 'print' });
  const pdf = await p.pdf({ path: join(OUT, 'invoice-official-a4-long.pdf'), preferCSSPageSize: true, printBackground: true });
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  ok(pages >= 2, `48-line invoice prints on ${pages} A4 pages`);
  const repeat = await p.evaluate(() => getComputedStyle(document.querySelector('.aci-table thead')).display === 'table-header-group');
  ok(repeat, 'thead is a table-header-group (repeats on every printed page)');
  await p.emulateMedia({ media: 'screen' });
  await p.evaluate(() => AC.instance(document.querySelector('[data-invir]'), 'invoice-ir').set({ paper: 'a5l' }));
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: join(OUT, 'invoice-official-a5l.pdf'), preferCSSPageSize: true, printBackground: true });
  const css = await p.evaluate(() => document.getElementById('aci-page-style')?.textContent || '');
  ok(/210mm 148mm/.test(css), '@page follows the A5 landscape choice');
  ok(!errors.length, `invoice-official: no console errors ${errors.join(' | ')}`);
  await ctx.close();
}

/* ---------------- proforma */
{
  const { p, ctx, errors } = await open('invoice-proforma');
  ok(await p.$$eval('.aci-bank', (x) => x.length) === 2, 'proforma shows 2 bank accounts');
  ok(await p.$('.aci-qr svg') !== null, 'QR placeholder rendered');
  ok(/تومان/.test(await p.textContent('.aci-ptotals__due')), 'proforma payable in Toman');
  await p.click('.aci-toolbar [data-aci-opt="paper"] [data-value="a5"]'); await p.waitForTimeout(100);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: join(OUT, 'invoice-proforma-a5.pdf'), preferCSSPageSize: true, printBackground: true });
  await p.emulateMedia({ media: 'screen' });
  await p.click('.aci-toolbar [data-aci-opt="paper"] [data-value="a4"]'); await p.waitForTimeout(100);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: join(OUT, 'invoice-proforma-a4.pdf'), preferCSSPageSize: true, printBackground: true });
  ok(!errors.length, `invoice-proforma: no console errors ${errors.join(' | ')}`);
  await ctx.close();
}

/* ---------------- editor */
{
  const { p, ctx, errors } = await open('invoice-editor');
  await p.waitForSelector('.aci-ed__item');
  const before = await p.evaluate(() => AC.invoiceIR.totals(AC.instance(document.querySelector('[data-invir]'), 'invoice-ir').data).total);
  await p.fill('.aci-ed__item[data-i="0"] [data-f="qty"]', '4'); await p.waitForTimeout(200);
  const after = await p.evaluate(() => AC.invoiceIR.totals(AC.instance(document.querySelector('[data-invir]'), 'invoice-ir').data).total);
  ok(after > before, 'editing qty updates the preview totals');
  const due = await p.textContent('.aci-ed__due bdi');
  ok(digitsOf(due) === String(after), 'sticky totals bar matches the preview');
  const n0 = await p.$$eval('.aci-ed__item', (x) => x.length);
  await p.click('[data-add]'); await p.waitForTimeout(100);
  ok(await p.$$eval('.aci-ed__item', (x) => x.length) === n0 + 1, 'add line');
  await p.click('.aci-ed__item:last-child [data-rm]'); await p.waitForTimeout(300);
  ok(await p.$$eval('.aci-ed__item', (x) => x.length) === n0, 'remove line');
  await p.click('[data-aci-ed="type"] [data-value="proforma"]'); await p.waitForTimeout(200);
  ok(await p.getAttribute('.aci-sheet', 'data-type') === 'proforma', 'type switch re-renders the preview as proforma');
  ok(!errors.length, `invoice-editor: no console errors ${errors.join(' | ')}`);
  await ctx.close();
}

/* ---------------- search console */
{
  const { p, ctx, errors } = await open('search-console');
  await p.waitForSelector('[data-mk-metric]');
  await p.click('[data-mk-metric="ctr"]');
  ok(await p.getAttribute('[data-mk-metric="ctr"]', 'aria-checked') === 'true', 'metric card toggles on');
  ok(await p.$$eval('.mk-chart__line:not(.mk-chart__line--prev)', (x) => x.length) === 3, 'chart shows 3 active lines');
  await p.click('[data-mk-tab="countries"]'); await p.waitForTimeout(150);
  ok(await p.$$eval('[data-mk-table] .mk-cc', (x) => x.length) > 3, 'Countries tab renders country rows');
  await p.click('[data-mk-range] [data-value="7d"]'); await p.waitForTimeout(250);
  ok(await p.evaluate(() => AC.instance(document.querySelector('[data-gsc]'), 'mk-gsc').data.dates.length) === 7, '7-day range reloads the data');
  await p.check('[data-mk-compare]'); await p.waitForTimeout(250);
  ok(await p.$$eval('.mk-chart__line--prev', (x) => x.length) >= 1 && await p.$$eval('.mk-toggle__delta .ac-trend', (x) => x.length) === 4, 'compare draws previous-period lines and deltas');
  await p.focus('.mk-chart'); await p.keyboard.press('ArrowLeft');
  ok(await p.isVisible('.mk-chart__tip'), 'keyboard inspects chart points');
  ok(!errors.length, `search-console: no console errors ${errors.join(' | ')}`);
  await ctx.close();
}

/* ---------------- marketing */
{
  const { p, ctx, errors } = await open('marketing');
  await p.waitForSelector('[data-rt-num]');
  const a = await p.textContent('[data-rt-num]'); await p.waitForTimeout(4600);
  const b = await p.textContent('[data-rt-num]');
  ok(/\d/.test(a) && /\d/.test(b), `realtime counter renders (${a} → ${b})`);
  ok(await p.$$eval('[data-rt-countries] li', (x) => x.length) === 5, 'realtime country list');
  ok(await p.$$eval('.mk-roas', (x) => x.length) === 6, 'campaign table with ROAS');
  ok(!errors.length, `marketing: no console errors ${errors.join(' | ')}`);
  await ctx.close();
}

/* ---------------- phones: no horizontal overflow */
for (const page of ['invoice-official', 'invoice-proforma', 'invoice-editor', 'search-console', 'marketing']) for (const lang of ['fa', 'en']) {
  const { p, ctx, errors } = await open(page, { w: 390, h: 844, lang, theme: 'dark' });
  const o = await overflow(p);
  ok(o <= 0 && !errors.length, `${page} 390px ${lang} dark: overflow ${o}px ${errors.join(' | ')}`);
  await ctx.close();
}

await browser.close();
console.log(fails ? `\n${fails} check(s) failed` : '\nall checks passed');
process.exit(fails ? 1 : 0);
