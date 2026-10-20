#!/usr/bin/env node
/* Files module — behaviour tests on demo/#/files (dev server must be running).
   node tests/files.mjs [--base=http://localhost:5178]
   Covers: navigation (open, back/forward, breadcrumbs, path field), selection (click, Ctrl, Shift range, marquee, Ctrl+A),
   inline rename (F2), drag-move onto a folder (+ undo), trash + undo toast, Quick Look keys (Space, arrows, Esc),
   real content thumbnails (image, CSV page), preview pane, upload progress (pause / resume / conflict dialog),
   phone long-press selection mode + selection bar, no console errors, no horizontal overflow. */
import { chromium } from 'playwright-core';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const BASE = (args.find((a) => a.startsWith('--base=')) || '').slice(7) || 'http://localhost:5178';
const pw = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const exe = readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse().flatMap((d) => ['chrome-win64', 'chrome-win'].map((s) => join(pw, d, s, 'chrome.exe'))).find(existsSync);

let pass = 0; let fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { fail++; console.log(`  ✗ ${name} ${extra}`); } };
const wait = (p, ms = 350) => p.waitForTimeout(ms);
const browser = await chromium.launch({ executablePath: exe });

async function open(ctxOpts, lang = 'fa') {
  const ctx = await browser.newContext(ctxOpts);
  await ctx.addInitScript((l) => { localStorage.setItem('ac:theme', 'light'); localStorage.setItem('ac:lang', l); localStorage.removeItem('ac:files:demo'); }, lang);
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(`${BASE}/demo/#/files`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__files?.state?.loc, null, { timeout: 15000 });
  await wait(p, 500);
  return { ctx, p, errors };
}
const st = (p) => p.evaluate(() => { const s = window.__files.state; return { loc: s.loc, sel: [...s.sel], view: s.view, cursor: s.cursor, selecting: s.selecting }; });
const box = (p, sel) => p.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, r: r.right, b: r.bottom }; }, sel);

/* ================================================================ desktop */
console.log('desktop');
{
  const { ctx, p, errors } = await open({ viewport: { width: 1440, height: 900 } });
  const fm = (fn, arg) => p.evaluate(fn, arg);
  await fm(() => window.__files.setView('icons', { flip: false }));
  ok((await st(p)).loc === 'root', 'starts in All Files');
  ok(await p.locator('.ac-fm-tile').count() >= 8, 'icon grid renders the root folder');

  // navigation
  await p.dblclick('.ac-fm-tile[data-id="contracts"]'); await wait(p, 500);
  ok((await st(p)).loc === 'contracts', 'double-click opens a folder');
  ok(await p.locator('.ac-fm__crumb').count() === 2, 'breadcrumb shows the path');
  await p.click('.ac-fm__view'); await p.keyboard.press('Alt+ArrowLeft'); await wait(p, 450);
  ok((await st(p)).loc === 'root', 'Alt+← goes back');
  await p.click('[data-act="forward"]'); await wait(p, 450);
  ok((await st(p)).loc === 'contracts', 'forward button returns');
  await p.click('.ac-fm__crumb[data-crumb="root"]'); await wait(p, 450);
  ok((await st(p)).loc === 'root', 'clicking a breadcrumb segment navigates');
  await p.keyboard.press('Control+l'); await wait(p, 150);
  await p.fill('.ac-fm__pathinput', '/اسناد مالی ۱۴۰۵/فاکتورها'); await p.keyboard.press('Enter'); await wait(p, 600);
  ok((await st(p)).loc === 'invoices', 'editable path field resolves a typed path');
  await p.click('.ac-fm__nav[data-loc="root"]'); await wait(p, 500);

  // selection
  await p.click('.ac-fm-tile[data-id="contracts"] .ac-fm__art');
  await p.click('.ac-fm-tile[data-id="ids"] .ac-fm__art', { modifiers: ['Control'] });
  ok((await st(p)).sel.length === 2, 'Ctrl+click adds to the selection');
  const order = await fm(() => window.__files.state.order);
  await p.click(`.ac-fm-tile[data-id="${order[0]}"] .ac-fm__art`);
  await p.click(`.ac-fm-tile[data-id="${order[4]}"] .ac-fm__art`, { modifiers: ['Shift'] });
  ok((await st(p)).sel.length === 5, 'Shift+click selects a range', JSON.stringify((await st(p)).sel));
  await p.keyboard.press('Control+a');
  ok((await st(p)).sel.length === order.length, 'Ctrl+A selects all');
  await p.keyboard.press('Escape');
  ok((await st(p)).sel.length === 0, 'Esc clears the selection');
  // marquee from empty space
  const v = await box(p, '.ac-fm__view'); const t0 = await box(p, `.ac-fm-tile[data-id="${order[0]}"]`); const t2 = await box(p, `.ac-fm-tile[data-id="${order[2]}"]`);
  const sx = v.l + 8 < t0.l ? (Math.min(t0.l, t2.l) + Math.max(t0.r, t2.r)) / 2 : t0.x; void sx;
  await p.mouse.move(Math.max(t0.r, t2.r) + 6 > v.r ? v.r - 6 : Math.max(t0.r, t2.r) + 6, v.b - 30);
  await p.mouse.down();
  await p.mouse.move((Math.min(t0.l, t2.l) + Math.max(t0.l, t2.l)) / 2 + 20, t0.y, { steps: 12 });
  ok(await p.locator('.ac-fm-band').count() === 1, 'marquee rectangle appears when dragging on empty space');
  await p.mouse.up();
  ok((await st(p)).sel.length >= 2, 'marquee selects the items it touches', JSON.stringify((await st(p)).sel));

  // keyboard navigation + rename
  await p.click('.ac-fm-tile[data-id="notes"] .ac-fm__art');
  await p.keyboard.press('F2'); await wait(p, 150);
  ok(await p.locator('.ac-fm-rename').count() === 1, 'F2 starts inline rename');
  await p.keyboard.press('Control+a'); await p.keyboard.type('یادداشت‌های مهر.txt'); await p.keyboard.press('Enter'); await wait(p, 600);
  ok(await fm(() => document.querySelector('[data-id="notes"] .ac-fm__name')?.textContent.includes('یادداشت‌های مهر')), 'Enter commits the new name');
  await p.click('.ac-fm-tile[data-id="notes"] .ac-fm__art'); await p.keyboard.press('ArrowRight'); await wait(p, 100);
  ok((await st(p)).cursor && (await st(p)).cursor !== 'notes', 'arrow keys move the cursor');

  // drag & drop move onto a folder, then undo
  await fm(() => window.__files.go('finance')); await wait(p, 500);
  const a = await box(p, '.ac-fm-tile[data-id="pl"] .ac-fm__art'); const b = await box(p, '.ac-fm-tile[data-id="invoices"] .ac-fm__art');
  await p.mouse.move(a.x, a.y); await p.mouse.down();
  for (let i = 1; i <= 14; i++) await p.mouse.move(a.x + ((b.x - a.x) * i) / 14, a.y + ((b.y - a.y) * i) / 14);
  ok(await p.locator('.ac-fm-ghost').count() === 1, 'dragging shows a lifted ghost');
  ok(await p.locator('.ac-fm-tile[data-id="invoices"][data-over]').count() === 1, 'the folder under the pointer highlights');
  await p.mouse.up(); await wait(p, 700);
  ok(await p.locator('.ac-fm-tile[data-id="pl"]').count() === 0, 'drop moves the file into the folder');
  await p.click('.ac-toast button:has-text("Undo"), .ac-toast [class*=action]', { timeout: 3000 }).catch(() => {});
  await wait(p, 700);
  ok(await p.locator('.ac-fm-tile[data-id="pl"]').count() === 1, 'undo toast moves it back');

  // trash + undo
  await p.click('.ac-fm-tile[data-id="tax"] .ac-fm__art'); await p.keyboard.press('Delete'); await wait(p, 700);
  ok(await p.locator('.ac-fm-tile[data-id="tax"]').count() === 0, 'Delete moves the selection to the Trash');
  ok(await fm(() => window.__files.adapter.list('@trash').then((l) => l.some((e) => e.id === 'tax'))), 'the item is in the Trash');
  await p.locator('.ac-toast').last().locator('button').first().click().catch(() => {});
  await wait(p, 800);
  ok(await p.locator('.ac-fm-tile[data-id="tax"]').count() === 1, 'undo restores it');

  // thumbnails (real content) + preview pane
  await fm(() => window.__files.go('photos')); await wait(p, 1500);
  ok(await p.locator('.ac-fm-tile[data-id="p1"] .ac-fm-live[data-ready] img').count() === 1, 'image thumbnail is rendered from the real file');
  await fm(() => window.__files.go('finance')); await wait(p, 1200);
  ok(await p.locator('.ac-fm-tile[data-id="tx"] .ac-fm-page--csv td').count() > 4, 'CSV thumbnail shows the first rows as a mini page');
  await p.click('[data-act="preview"]'); await p.click('.ac-fm-tile[data-id="tx"] .ac-fm__art'); await wait(p, 900);
  ok(await p.locator('.ac-fm__info .ac-fm-csv tbody tr').count() >= 5, 'preview pane renders the CSV as a table');
  await p.click('[data-act="preview"]'); await wait(p, 200);

  // Quick Look keys
  await fm(() => window.__files.go('photos')); await wait(p, 700);
  await p.click('.ac-fm-tile[data-id="p1"] .ac-fm__art'); await p.keyboard.press('Space'); await wait(p, 700);
  ok(await p.locator('.ac-fm-ql').count() === 1, 'Space opens Quick Look');
  ok(await p.locator('.ac-fm-ql img.ac-fm-ql__img').count() === 1, 'Quick Look shows the full image');
  const before = (await st(p)).cursor;
  await p.keyboard.press('ArrowLeft'); await wait(p, 500); // RTL: ← is next
  ok((await st(p)).cursor !== before, 'arrow keys page through files in Quick Look');
  await p.mouse.wheel(0, -400); await wait(p, 100);
  ok(await p.evaluate(() => document.querySelector('.ac-fm-ql')?.dataset.zoomed === 'true'), 'wheel zooms the image');
  await p.keyboard.press('Escape'); await wait(p, 500);
  ok(await p.locator('.ac-fm-ql').count() === 0, 'Esc closes Quick Look');

  // view switching
  for (const vw of ['list', 'columns', 'gallery', 'icons']) { await fm((x) => window.__files.setView(x), vw); await wait(p, 450); ok((await st(p)).view === vw && await p.locator(`.ac-fm[data-view="${vw}"]`).count() === 1, `${vw} view renders`); }

  // uploads
  await fm(() => window.__files.go('finance')); await wait(p, 500);
  await fm(() => window.__files.upload([new File([new Uint8Array(12e6)], 'big-report.pdf', { type: 'application/pdf' })]));
  await wait(p, 400);
  ok(await p.locator('.ac-fm-up .ac-fm-job[data-state="uploading"]').count() === 1, 'upload panel shows a job in progress');
  const off1 = Number(await p.getAttribute('.ac-fm-job__bar', 'stroke-dashoffset'));
  await p.click('[data-job-act="pause"]'); await wait(p, 600);
  const offA = Number(await p.getAttribute('.ac-fm-job__bar', 'stroke-dashoffset')); await wait(p, 600);
  const offB = Number(await p.getAttribute('.ac-fm-job__bar', 'stroke-dashoffset'));
  ok(offA < off1 && Math.abs(offA - offB) < 0.01, 'progress ring advances, pause holds it');
  await p.click('[data-job-act="resume"]');
  await p.waitForSelector('.ac-fm-job[data-state="done"]', { timeout: 15000 });
  ok(await p.locator('.ac-fm-tile .ac-fm__name:has-text("big-report")').count() === 1, 'finished upload appears in the folder');
  await fm(() => { window.__files.upload([new File([new Uint8Array(1000)], 'big-report.pdf', { type: 'application/pdf' })]); });
  await p.waitForSelector('.ac-fm-conflict', { timeout: 4000 });
  ok(true, 'a name clash opens the conflict dialog');
  await p.click('[data-choice="keep"]');
  await p.waitForFunction(() => [...document.querySelectorAll('.ac-fm-tile .ac-fm__name')].some((n) => n.textContent.includes('big-report (2)')), null, { timeout: 15000 }).catch(() => {});
  ok(await p.locator('.ac-fm-tile .ac-fm__name:has-text("big-report (2)")').count() === 1, '“Keep both” uploads under a new name');

  // context menu
  await p.click('.ac-fm-tile[data-id="budget"] .ac-fm__art', { button: 'right' }); await wait(p, 300);
  ok(await p.locator('.ac-menu[data-state="open"] .ac-menu__item').count() >= 10, 'right-click opens the item context menu');
  await p.keyboard.press('Escape');

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 0, 'no horizontal overflow (desktop)', `overflow=${overflow}`);
  ok(!errors.length, 'no console errors (desktop)', errors.join(' | '));
  await ctx.close();
}

/* ================================================================ phone */
console.log('phone');
{
  const { ctx, p, errors } = await open({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  ok((await st(p)).loc === '@browse', 'phone starts on the Browse screen');
  await p.tap('.ac-fm-browse .ac-fm__nav[data-loc="contracts"]'); await wait(p, 600);
  ok((await st(p)).loc === 'contracts' && await p.locator('.ac-fm-prow').count() >= 5, 'tapping a location opens a list-first folder');
  const fs = await p.evaluate(() => getComputedStyle(document.querySelector('.ac-fm__pq')).fontSize);
  ok(parseFloat(fs) >= 16, 'phone search input is ≥16px (no iOS zoom)', fs);
  // long-press → selection mode
  const r = await box(p, '.ac-fm-prow[data-id="lease"] .ac-fm__name');
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] });
  await wait(p, 650);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await wait(p, 400);
  const s1 = await st(p);
  ok(s1.selecting && s1.sel.includes('lease'), 'long-press enters selection mode with the row selected', JSON.stringify(s1));
  ok(await p.locator('.ac-fm-selbar[data-state="open"]').count() === 1, 'selection bar replaces the tab bar');
  await p.tap('.ac-fm-prow[data-id="buildc"] .ac-fm__name'); await wait(p, 250);
  ok((await st(p)).sel.length === 2, 'tap toggles more rows while selecting');
  await p.tap('[data-act="selectmode"]'); await wait(p, 300);
  ok(!(await st(p)).selecting && await p.locator('.ac-fm-selbar[data-state="open"]').count() === 0, 'Done leaves selection mode');
  // tap a file → full-screen Quick Look, swipe to the next one
  await p.evaluate(() => window.__files.go('photos')); await wait(p, 600);
  await p.tap('.ac-fm-prow[data-id="p1"] .ac-fm__name'); await wait(p, 900);
  ok(await p.locator('.ac-fm-ql').count() === 1, 'tapping a photo opens Quick Look full-screen');
  await p.keyboard.press('Escape'); await wait(p, 400);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 0, 'no horizontal overflow (phone)', `overflow=${overflow}`);
  ok(!errors.length, 'no console errors (phone)', errors.join(' | '));
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
