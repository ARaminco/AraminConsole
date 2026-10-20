#!/usr/bin/env node
/* App pages B — kanban, calendar, chat, mail, pricing, faq, timeline (dev server must be running).
   node tests/pages-b.mjs [--base=http://localhost:5178]   (PAGES=kanban,chat limits the smoke list)
   Checks: every page loads without console errors and without phone horizontal overflow (fa + en);
   kanban drag & drop with a mouse and with real touch (CDP, press-and-hold); calendar view + Jalali/Gregorian switch;
   chat module: send + receipts + typing reply, reactions, reply/quote, edit, lightbox, info panel, new chat,
   phone push/pop (back button + browser Back); mail module: bulk select + archive, compose with chips/autocomplete,
   minimise, send, phone push + swipe-to-archive; pricing yearly toggle; faq search. */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const BASE = (args.find((a) => a.startsWith('--base=')) || '').slice(7) || 'http://localhost:5178';
const pw = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const exe = readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()
  .flatMap((d) => ['chrome-win64', 'chrome-win'].map((s) => join(pw, d, s, 'chrome.exe'))).find(existsSync);

let pass = 0; let fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { fail++; console.log(`  ✗ ${name} ${extra}`); } };
const wait = (p, ms = 380) => p.waitForTimeout(ms);
const browser = await chromium.launch({ executablePath: exe });
const DESK = { viewport: { width: 1440, height: 900 } };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true };

async function open(page, ctxOpts = DESK, { theme = 'light', lang = 'fa' } = {}) {
  const ctx = await browser.newContext(ctxOpts);
  await ctx.addInitScript(([t, l]) => { localStorage.setItem('ac:theme', t); localStorage.setItem('ac:lang', l); }, [theme, lang]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('requestfailed', (r) => errors.push(`requestfailed ${r.url()}`));
  await p.goto(`${BASE}/demo/#/${page}`, { waitUntil: 'networkidle' });
  await p.waitForSelector(`[data-page="${page}"]`);
  await wait(p, 900);
  return { ctx, p, errors };
}
const center = (p, sel) => p.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, bottom: r.bottom }; }, sel);
const colOf = (p, id) => p.evaluate((i) => document.querySelector(`.ac-kanban__card[data-id="${i}"]`)?.closest('.ac-kanban__col')?.dataset.col, id);

/* ---------------------------------------------------------------- smoke: every page, phone + desktop */
console.log('smoke');
for (const page of (process.env.PAGES || 'kanban,calendar,chat,mail,pricing,faq,timeline').split(',')) {
  for (const [label, opts, lang] of [['desktop', DESK, 'fa'], ['phone', PHONE, 'fa'], ['phone en', PHONE, 'en']]) {
    const { ctx, p, errors } = await open(page, opts, { lang });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(!errors.length && overflow <= 0, `${page} ${label} loads clean`, `errors=${errors.join(' | ')} overflow=${overflow}`);
    await ctx.close();
  }
}

/* ---------------------------------------------------------------- kanban: mouse */
console.log('kanban');
{
  const { ctx, p, errors } = await open('kanban');
  const a = await center(p, '.ac-kanban__card[data-id="k4"]');
  const b = await center(p, '[data-col="doing"] .ac-kanban__list');
  await p.mouse.move(a.x, a.y); await p.mouse.down();
  for (let i = 1; i <= 16; i++) await p.mouse.move(a.x + ((b.x - a.x) * i) / 16, a.y + ((b.top + 20 - a.y) * i) / 16);
  ok(await p.evaluate(() => !!document.querySelector('.ac-kanban__ghost') && !!document.querySelector('.ac-kanban__card[data-placeholder]')), 'mouse drag shows ghost + placeholder');
  await p.mouse.up(); await wait(p, 400);
  ok(await colOf(p, 'k4') === 'doing', 'mouse drop moves card to another column');
  ok(await p.evaluate(() => !document.querySelector('.ac-kanban__ghost, [data-placeholder]')), 'drop cleans up');
  ok(await p.evaluate(() => document.querySelector('[data-col="doing"] .ac-kanban__count').textContent.trim() === '3'), 'column count updates');
  ok(await p.evaluate(() => !document.querySelector('.ac-modal[data-state="open"]')), 'drag does not open the detail modal');
  await p.click('.ac-kanban__card[data-id="k7"]'); await wait(p, 450);
  ok(await p.evaluate(() => !!document.querySelector('.ac-modal[data-state="open"] .ac-kdetail')), 'click opens card detail');
  await p.keyboard.press('Escape'); await wait(p);
  await p.focus('.ac-kanban__card[data-id="k9"]'); await p.keyboard.press('Control+ArrowLeft'); await wait(p, 300);
  ok(await colOf(p, 'k9') === 'done', 'Ctrl+Arrow moves a card to the next column (RTL)');
  await p.click('[data-col="todo"] [data-kb-add]'); await p.keyboard.type('Test card'); await p.keyboard.press('Enter'); await wait(p, 300);
  ok(await p.evaluate(() => [...document.querySelectorAll('[data-col="todo"] .ac-kanban__title')].some((n) => n.textContent === 'Test card')), 'add card composer');
  ok(!errors.length, 'kanban desktop: no console errors', errors.join(' | '));
  await ctx.close();
}
/* ---------------------------------------------------------------- kanban: touch (press-and-hold) */
{
  const { ctx, p, errors } = await open('kanban', PHONE);
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await p.evaluate(() => document.querySelector('[data-col="backlog"]').scrollIntoView({ block: 'start' }));
  await wait(p, 300);
  // a quick swipe without holding must not pick the card up
  let a = await center(p, '.ac-kanban__card[data-id="k1"]');
  await touch('touchStart', a.x, a.y);
  for (let i = 1; i <= 6; i++) { await touch('touchMove', a.x, a.y - i * 12); await wait(p, 16); }
  ok(await p.evaluate(() => !document.querySelector('.ac-kanban__ghost')), 'touch: quick swipe scrolls instead of dragging');
  await touch('touchEnd'); await wait(p, 400);
  // press and hold, then drag below the next card
  a = await center(p, '.ac-kanban__card[data-id="k1"]');
  const b = await center(p, '.ac-kanban__card[data-id="k2"]');
  await touch('touchStart', a.x, a.y); await wait(p, 420);
  ok(await p.evaluate(() => !!document.querySelector('.ac-kanban__card[data-armed]')), 'touch: hold arms the card');
  for (let i = 1; i <= 14; i++) { await touch('touchMove', a.x, a.y + ((b.bottom - 8 - a.y) * i) / 14); await wait(p, 16); }
  ok(await p.evaluate(() => !!document.querySelector('.ac-kanban__ghost')), 'touch: drag shows ghost');
  await touch('touchEnd'); await wait(p, 450);
  const order = await p.evaluate(() => [...document.querySelectorAll('[data-col="backlog"] .ac-kanban__card')].map((n) => n.dataset.id).join(','));
  ok(order.startsWith('k2,k1'), 'touch: drop reorders cards', order);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 0, 'kanban phone: no horizontal overflow', String(overflow));
  ok(!errors.length, 'kanban phone: no console errors', errors.join(' | '));
  await ctx.close();
}

/* ---------------------------------------------------------------- calendar */
console.log('calendar');
{
  const { ctx, p, errors } = await open('calendar');
  ok(await p.evaluate(() => document.querySelectorAll('.ac-cal-day').length >= 28), 'month grid renders');
  const title1 = await p.textContent('[data-cal-title]');
  await p.click('[data-cal-system] [data-value="gregory"]'); await wait(p, 300);
  const title2 = await p.textContent('[data-cal-title]');
  ok(title1 !== title2 && /\d{4}/.test(title2), 'Jalali → Gregorian switch re-renders the month', `${title1} → ${title2}`);
  await p.click('[data-cal-view] [data-value="week"]'); await wait(p, 300);
  ok(await p.evaluate(() => document.querySelectorAll('.ac-cal-week__col').length === 7 && !!document.querySelector('.ac-cal-block')), 'week view with timed events');
  await p.click('[data-cal-view] [data-value="agenda"]'); await wait(p, 300);
  ok(await p.evaluate(() => document.querySelectorAll('.ac-cal-row').length > 2), 'agenda view');
  await p.click('[data-cal-step="1"]'); await wait(p, 200);
  await p.click('[data-cal-new]'); await wait(p, 450);
  await p.fill('#cal-title', 'Test event'); await p.click('#cal-new-modal button[type="submit"]'); await wait(p, 500);
  ok(await p.evaluate(() => [...document.querySelectorAll('.ac-cal-row strong, .ac-cal-ev span, .ac-cal-block strong')].some((n) => n.textContent === 'Test event')), 'create event modal adds the event');
  ok(!errors.length, 'calendar: no console errors', errors.join(' | '));
  await ctx.close();
  const ph = await open('calendar', PHONE);
  ok(await ph.p.evaluate(() => document.querySelector('[data-cal-body]').dataset.view === 'agenda'), 'phone opens agenda-first');
  await ph.ctx.close();
}

/* ---------------------------------------------------------------- chat module */
console.log('chat');
{
  const { ctx, p, errors } = await open('chat');
  const count = () => p.evaluate(() => document.querySelectorAll('.ac-chat__row[data-msg]').length);
  const n0 = await count();
  await p.fill('[data-x="input"]', 'Hello from test'); await p.keyboard.press('Enter'); await wait(p, 200);
  ok(await count() === n0 + 1, 'send appends a bubble');
  await wait(p, 1500);
  ok(await p.evaluate(() => !!document.querySelector('.ac-chat__row.is-typing') || document.querySelector('[data-x="status"]')?.hasAttribute('data-typing')), 'typing indicator shows');
  await wait(p, 1600);
  ok(await p.evaluate(() => [...document.querySelectorAll('.ac-chat__row.is-mine .ac-chat-tick')].at(-1)?.dataset.status === 'read'), 'read receipt turns to read');
  ok(await count() >= n0 + 2, 'auto reply arrives');
  // reactions through the hover bar
  const last = '.ac-chat__row[data-msg]:not(.is-mine):last-of-type';
  await p.hover('.ac-chat__row[data-msg] .ac-chat__bubble >> nth=-1'); await wait(p, 200);
  await p.click('.ac-chat__row[data-msg] >> nth=-1 >> [data-act="quick-react"]', { force: true }); await wait(p, 400);
  await p.click('.ac-chat__reactbar [data-quick="👍"]'); await wait(p, 300);
  ok(await p.evaluate(() => !!document.querySelector('.ac-chat__row[data-msg]:last-of-type .ac-chat__react[aria-pressed="true"], .ac-chat__react[aria-pressed="true"]')), 'reaction added');
  // reply
  await p.hover('.ac-chat__row[data-msg] .ac-chat__bubble >> nth=-1');
  await p.click('.ac-chat__row[data-msg] >> nth=-1 >> [data-act="reply"]', { force: true }); await wait(p, 200);
  ok(await p.isVisible('[data-x="bar"]'), 'reply bar shows');
  await p.fill('[data-x="input"]', 'quoted reply'); await p.keyboard.press('Enter'); await wait(p, 300);
  ok(await p.evaluate(() => !!document.querySelector('.ac-chat__row.is-mine:last-of-type .ac-chat__quote, .ac-chat__row.is-mine .ac-chat__quote')), 'reply carries a quote');
  // edit last own message with ArrowUp
  await p.focus('[data-x="input"]'); await p.keyboard.press('ArrowUp'); await wait(p, 150);
  await p.fill('[data-x="input"]', 'edited text'); await p.keyboard.press('Enter'); await wait(p, 300);
  ok(await p.evaluate(() => [...document.querySelectorAll('.ac-chat__text')].some((n) => n.textContent === 'edited text')), 'ArrowUp edits the last message');
  // lightbox
  await p.click('.ac-chat__img >> nth=0'); await wait(p, 400);
  ok(await p.isVisible('.ac-lightbox'), 'image opens the lightbox');
  await p.keyboard.press('Escape'); await wait(p, 300);
  ok(!(await p.$('.ac-lightbox')), 'Esc closes the lightbox');
  // info panel + tabs
  await p.click('[data-x="info-btn"]'); await wait(p, 400);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.ac-chat__info')).display !== 'none' && document.querySelectorAll('.ac-chat__gallery button').length > 0), 'info panel with media gallery');
  // channel read-only + filter
  await p.click('[data-filter="channels"]'); await wait(p, 200);
  ok(await p.evaluate(() => [...document.querySelectorAll('[data-conv]')].every((r) => r.dataset.conv.startsWith('ch-'))), 'channels filter');
  await p.click('[data-open="ch-tech"]'); await wait(p, 300);
  ok(await p.isVisible('[data-x="readonly"]') && !(await p.isVisible('[data-x="form"]')), 'read-only channel hides the composer');
  await p.click('[data-act="new"]'); await wait(p, 450);
  ok(await p.evaluate(() => !!document.querySelector('.ac-modal[data-state="open"] .ac-chat__newchat')), 'new chat modal');
  await p.click('.ac-modal[data-state="open"] .ac-chat__pickrow >> nth=4'); await wait(p, 400);
  ok(await p.evaluate(() => !document.querySelector('.ac-modal[data-state="open"]') && !!document.querySelector('.ac-chat__conv[aria-current="true"]')), 'picking a contact opens the conversation');
  ok(!errors.length, 'chat desktop: no console errors', errors.join(' | '));
  await ctx.close();
}
{
  const { ctx, p, errors } = await open('chat', PHONE);
  const depth = () => p.evaluate(() => document.querySelector('.ac-chat').dataset.depth);
  const thread = () => p.evaluate(() => { const r = document.querySelector('.ac-chat__thread').getBoundingClientRect(); return { l: Math.round(r.left), w: Math.round(r.width) }; });
  await p.tap('[data-open="c-sara"]'); await wait(p, 500);
  let r = await thread();
  ok(await depth() === '1' && r.l === 0 && r.w === 390, 'phone: tapping a chat pushes the thread full-screen', JSON.stringify(r));
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.ac-tabbar')).transform !== 'none'), 'phone: tab bar slides away in a thread');
  await p.tap('[data-x="back"]'); await wait(p, 500);
  r = await thread();
  ok(await depth() === '0' && (r.w === 0 || Math.abs(r.l) >= 380), 'phone: back button pops (slides out, then parks)', JSON.stringify(r));
  await p.tap('[data-open="g-dev"]'); await wait(p, 500);
  await p.tap('[data-x="who"]'); await wait(p, 500);
  ok(await depth() === '2', 'phone: header opens the info screen (depth 2)');
  await p.goBack(); await wait(p, 500);
  ok(await depth() === '1', 'phone: browser Back pops one screen');
  await p.goBack(); await wait(p, 500);
  ok(await depth() === '0' && p.url().endsWith('#/chat'), 'phone: browser Back returns to the list, same route');
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 0, 'chat phone: no horizontal overflow', String(overflow));
  ok(!errors.length, 'chat phone: no console errors', errors.join(' | '));
  await ctx.close();
}

/* ---------------------------------------------------------------- mail module */
console.log('mail');
{
  const { ctx, p, errors } = await open('mail');
  const rows = () => p.evaluate(() => document.querySelectorAll('.ac-mail__row').length);
  const n0 = await rows();
  ok(n0 > 5 && await p.isVisible('.ac-mail__msg'), 'inbox list + reader');
  await p.click('.ac-mail__row >> nth=1 >> .ac-mail__check');
  await p.click('.ac-mail__row >> nth=2 >> .ac-mail__check', { modifiers: ['Shift'] });
  ok(await p.evaluate(() => document.querySelectorAll('.ac-mail__row[data-selected]').length === 2 && !!document.querySelector('.ac-mail__bulk')), 'select + bulk bar');
  await p.click('[data-bulk="archive"]'); await wait(p, 600);
  ok(await rows() === n0 - 2, 'bulk archive removes rows');
  await p.click('[data-folder="archive"] >> nth=0'); await wait(p, 300);
  ok(await rows() >= 2, 'archived threads show in Archive');
  await p.click('.ac-mail__compose'); await wait(p, 450);
  ok(await p.isVisible('.ac-mail__cwin'), 'compose window opens');
  await p.type('[data-chip-input="to"]', 'سارا'); await wait(p, 200);
  ok(await p.isVisible('[data-suggest] [data-sug]'), 'recipient autocomplete');
  await p.keyboard.press('Enter'); await wait(p, 150);
  ok(await p.evaluate(() => document.querySelectorAll('[data-chips="to"] .ac-mail__chip').length === 1), 'Enter turns the suggestion into a chip');
  await p.fill('[data-c="subject"]', 'Test subject');
  await p.click('[data-c="editor"]'); await p.keyboard.type('Body text');
  await wait(p, 1500);
  ok(/·/.test(await p.textContent('[data-c="saved"]')), 'draft autosave indicator');
  await p.click('[data-c-act="min"]'); await wait(p, 400);
  ok(await p.evaluate(() => document.querySelector('.ac-mail__composer').hasAttribute('data-min')), 'compose minimises');
  await p.click('.ac-mail__chead'); await wait(p, 300);
  await p.click('[data-c-act="send"]'); await wait(p, 500);
  await p.click('[data-folder="sent"] >> nth=0'); await wait(p, 300);
  ok(await p.evaluate(() => [...document.querySelectorAll('.ac-mail__subj')].some((n) => n.textContent === 'Test subject')), 'sent message lands in Sent');
  await p.click('[data-folder="settings"] >> nth=0'); await wait(p, 300);
  ok(await p.isVisible('.ac-mail__settings [data-setting="conversation"]'), 'settings view');
  ok(!errors.length, 'mail desktop: no console errors', errors.join(' | '));
  await ctx.close();
}
{
  const { ctx, p, errors } = await open('mail', PHONE);
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const n0 = await p.evaluate(() => document.querySelectorAll('.ac-mail__row').length);
  await p.evaluate(() => document.querySelector('.ac-mail__row').scrollIntoView({ block: 'center' })); await wait(p, 200);
  const a = await center(p, '.ac-mail__row .ac-mail__open');
  await touch('touchStart', a.x - 60, a.y);
  for (let i = 1; i <= 10; i++) { await touch('touchMove', a.x - 60 + i * 18, a.y); await wait(p, 16); }   // RTL: swipe toward the inline start (right)
  await touch('touchEnd'); await wait(p, 400);
  ok(await p.evaluate(() => document.querySelector('.ac-mail__row').hasAttribute('data-open')), 'phone: swipe reveals archive/delete');
  await p.tap('.ac-mail__row[data-open] [data-action="archive"]'); await wait(p, 700);
  ok(await p.evaluate(() => document.querySelectorAll('.ac-mail__row').length) === n0 - 1, 'phone: swipe action archives');
  await p.tap('.ac-mail__row >> nth=0 >> .ac-mail__open'); await wait(p, 500);
  const r = await p.evaluate(() => { const b = document.querySelector('.ac-mail__reader').getBoundingClientRect(); return [Math.round(b.left), Math.round(b.width), document.querySelector('.ac-mail').dataset.depth]; });
  ok(r[0] === 0 && r[1] === 390 && r[2] === '1', 'phone: reader pushes full-screen', JSON.stringify(r));
  await p.tap('.ac-mail__back'); await wait(p, 500);
  ok(await p.evaluate(() => document.querySelector('.ac-mail').dataset.depth === '0'), 'phone: back pops the reader');
  await p.tap('[data-mail-compose]'); await wait(p, 500);
  const c = await p.evaluate(() => { const b = document.querySelector('.ac-mail__cwin').getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; });
  ok(c[0] === 390 && c[1] >= 800, 'phone: compose is a full-screen sheet', JSON.stringify(c));
  ok(!errors.length, 'mail phone: no console errors', errors.join(' | '));
  await ctx.close();
}

/* ---------------------------------------------------------------- pricing + faq */
console.log('pricing / faq');
{
  const { ctx, p, errors } = await open('pricing');
  await p.click('[data-pricing-period] [data-value="year"]'); await wait(p, 900);
  ok(await p.evaluate(() => document.querySelector('.ac-plan--featured [data-ac~="counter"]').textContent.includes('23')), 'yearly toggle animates the price to $23');
  await p.goto(`${BASE}/demo/#/faq`); await p.waitForSelector('[data-page="faq"]'); await wait(p, 600);
  await p.fill('[data-faq-search]', 'شمسی'); await wait(p, 300);
  ok(await p.evaluate(() => [...document.querySelectorAll('[data-faq-list] .ac-accordion__item')].filter((d) => !d.hidden).length === 1 && !!document.querySelector('[data-faq-list] mark')), 'faq search filters + highlights');
  await p.fill('[data-faq-search]', 'zzzz'); await wait(p, 300);
  ok(await p.isVisible('[data-faq-empty]'), 'faq empty state');
  ok(!errors.length, 'pricing/faq: no console errors', errors.join(' | '));
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
