#!/usr/bin/env node
/* Tickets, support-chat and user-panel module tests (dev server must be running).
   node tests/tickets.mjs [--base=http://localhost:5178] [--no-shots]
   Checks: inbox views + counts, SLA chips, filters, bulk assign menu, drawer quick view, reply / internal note / canned reply /
   macro / status change, create-ticket modal, full ticket page, phone list → detail push + sticky composer + back,
   customer portal (timeline, reply, wizard submit), support chat (open, send → typing → bot reply, quick reply, close,
   unread badge, phone full-screen sheet), user panel (privacy toggle, completeness ring), no console errors / overflow.
   Screenshots → tests/screens/tk-*.png */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'screens');
mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const BASE = (args.find((a) => a.startsWith('--base=')) || '').slice(7) || 'http://localhost:5178';
const SHOTS = !args.includes('--no-shots');
const pw = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const exe = readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()
  .flatMap((d) => ['chrome-win64', 'chrome-win'].map((s) => join(pw, d, s, 'chrome.exe'))).find(existsSync);

let pass = 0; let fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { fail++; console.log(`  ✗ ${name} ${extra}`); } };
const wait = (p, ms = 380) => p.waitForTimeout(ms);
const browser = await chromium.launch({ executablePath: exe });
const DESK = { viewport: { width: 1440, height: 900 } };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true };

async function open(ctxOpts, page, { theme = 'light', lang = 'fa', ready } = {}) {
  const ctx = await browser.newContext(ctxOpts);
  await ctx.addInitScript(([t, l]) => { localStorage.setItem('ac:theme', t); localStorage.setItem('ac:lang', l); localStorage.removeItem('ac:up-private'); }, [theme, lang]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(`${BASE}/demo/#/${page}`, { waitUntil: 'networkidle' });
  if (ready) await p.waitForSelector(ready, { timeout: 8000 });
  await wait(p, 900);
  return { ctx, p, errors };
}
const shot = async (p, name) => { if (SHOTS) await p.screenshot({ path: join(OUT, `tk-${name}.png`) }); };
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const text = (p, sel) => p.evaluate((s) => document.querySelector(s)?.textContent.trim() ?? null, sel);

/* ---------------------------------------------------------------- admin inbox (desktop) */
console.log('tickets inbox — desktop');
{
  const { ctx, p, errors } = await open(DESK, 'tickets', { ready: '.ac-tk-inbox [data-tk-open]' });
  const rows = await p.locator('.ac-tk-inbox tbody tr').count();
  ok(rows === 8, 'first page shows 8 tickets', `got ${rows}`);
  ok(await text(p, '[data-tk-count="all"]') === '14', 'view count: all = 14');
  ok(Number(await text(p, '[data-tk-count="overdue"]')) >= 2, 'view count: overdue ≥ 2');
  ok(await p.locator('.ac-tk-inbox .ac-tk-sla[data-overdue]').count() >= 2, 'overdue SLA chips are marked');
  ok(/مانده|گذشته/.test(await text(p, '.ac-tk-inbox .ac-tk-sla')), 'SLA chip shows a countdown');
  await p.click('.ac-tk-views [data-value="unassigned"]'); await wait(p);
  ok(await p.locator('.ac-tk-inbox tbody tr').count() === 3, 'unassigned view filters to 3');
  await p.click('.ac-tk-views [data-value="all"]'); await wait(p);
  // bulk assign
  await p.locator('.ac-tk-inbox tbody tr input[type="checkbox"]').nth(0).check();
  await p.locator('.ac-tk-inbox tbody tr input[type="checkbox"]').nth(2).check();
  await wait(p, 250);
  await p.click('[data-dt="bulk"][data-action="assign"]'); await wait(p);
  ok(await p.locator('.ac-menu[data-state="open"] .ac-menu__item').count() >= 5, 'bulk assign opens an agent menu');
  await shot(p, 'bulk-assign');
  await p.locator('.ac-menu[data-state="open"] .ac-menu__item', { hasText: 'سارا احمدی' }).click(); await wait(p, 500);
  ok((await text(p, '.ac-toast')).includes('سارا احمدی'), 'bulk assign confirms with a toast');
  // quick view drawer
  await p.click('.ac-tk-inbox [data-tk-open="T-1048"]'); await wait(p, 600);
  ok(await p.locator('.ac-drawer[data-state="open"] .ac-tk-detail').count() === 1, 'subject click opens the drawer quick view');
  ok(await p.locator('.ac-drawer .ac-tk-note').count() === 1, 'internal note is rendered');
  ok(await p.locator('.ac-drawer .ac-tk-file').count() >= 2, 'attachments are rendered');
  await p.fill('.ac-drawer .ac-tk-composer textarea', 'پرداخت شما تأیید شد.');
  await p.click('.ac-drawer [data-tk-send]'); await wait(p, 500);
  ok((await text(p, '.ac-drawer .ac-tk-thread > :last-child')).includes('پرداخت شما تأیید شد'), 'reply is appended to the thread');
  await p.click('.ac-drawer [data-tk-mode="note"]'); await wait(p, 200);
  ok(await p.evaluate(() => document.querySelector('.ac-drawer .ac-tk-composer').dataset.mode) === 'note', 'composer switches to internal note');
  await p.fill('.ac-drawer .ac-tk-composer textarea', 'یادداشت تست');
  await p.keyboard.press('Control+Enter'); await wait(p, 500);
  ok(await p.locator('.ac-drawer .ac-tk-thread > .ac-tk-note').count() === 2, 'Ctrl+Enter adds an internal note');
  await p.click('.ac-drawer [data-tk-mode="reply"]'); await wait(p, 200);
  await p.click('.ac-drawer [data-tk-canned]'); await wait(p, 400);
  ok(await p.locator('.ac-tk-canned__item').count() === 5, 'canned reply picker lists replies');
  await p.keyboard.type('بازگشت'); await wait(p, 200);
  ok(await p.locator('.ac-tk-canned__item').count() === 1, 'canned reply search filters');
  await shot(p, 'canned');
  await p.keyboard.press('Enter'); await wait(p, 400);
  ok((await p.inputValue('.ac-drawer .ac-tk-composer textarea')).includes('۷۲ ساعت'), 'canned reply is inserted');
  await p.click('.ac-drawer [data-tk-macros]'); await wait(p, 300);
  await p.locator('.ac-menu[data-state="open"] .ac-menu__item', { hasText: 'ارجاع به تیم فنی' }).click(); await wait(p, 500);
  ok((await text(p, '.ac-drawer .ac-tk-conv__chips')).includes('زیاد'), 'macro sets the priority');
  await shot(p, 'drawer');
  await p.keyboard.press('Escape'); await wait(p, 500);
  ok(await p.locator('.ac-drawer[data-state="open"]').count() === 0, 'Esc closes the drawer');
  // create
  await p.click('[data-tk-new]'); await wait(p, 500);
  ok(await p.locator('.ac-modal[data-state="open"] .ac-tk-create').count() === 1, 'create-ticket modal opens');
  await p.fill('.ac-tk-create [name="name"]', 'کاوه رحیمی');
  await p.fill('.ac-tk-create [name="email"]', 'kaveh@example.com');
  await p.fill('.ac-tk-create [name="subject"]', 'درخواست تست سیستم');
  await p.fill('.ac-tk-create [name="message"]', 'این یک درخواست آزمایشی برای تست است.');
  await shot(p, 'create');
  await p.click('.ac-modal[data-state="open"] [type="submit"]'); await wait(p, 700);
  ok(await text(p, '[data-tk-count="all"]') === '15', 'new ticket joins the queue');
  ok(!errors.length, 'no console errors (desktop inbox)', errors.join(' | '));
  ok(await overflow(p) <= 0, 'no horizontal overflow');
  await ctx.close();
}

/* ---------------------------------------------------------------- full ticket page */
console.log('ticket page');
{
  const { ctx, p, errors } = await open(DESK, 'ticket?id=T-1048', { ready: '.ac-tk-detail .ac-tk-side .ac-tk-panel' });
  ok((await text(p, '[data-tk-title]')).includes('پرداخت انجام شد'), 'page title is the ticket subject');
  ok(/\d{2}:\d{2}:\d{2}/.test(await text(p, '[data-tk-clock]')), 'SLA timer ticks HH:MM:SS');
  await p.selectOption('[data-tk-prop="priority"]', 'low'); await wait(p, 300);
  ok((await text(p, '.ac-tk-thread > :last-child')).includes('اولویت'), 'property change logs a system event');
  await p.fill('[data-tk-tag]', 'ویژه'); await p.press('[data-tk-tag]', 'Enter'); await wait(p, 300);
  ok(await p.locator('.ac-tk-tag', { hasText: 'ویژه' }).count() === 1, 'tag is added');
  await p.click('[data-tk-solve]'); await wait(p, 500);
  ok(await p.locator('.ac-tk-conv__chips [data-kind="status"][data-tone="success"]').count() === 1, 'mark solved sets status');
  await shot(p, 'ticket-page');
  ok(!errors.length, 'no console errors (ticket page)', errors.join(' | '));
  await ctx.close();
}

/* ---------------------------------------------------------------- phone: list → detail push */
console.log('tickets — phone');
{
  const { ctx, p, errors } = await open(PHONE, 'tickets', { ready: '.ac-tk-inbox [data-tk-open]' });
  await p.locator('[data-tk-open="T-1044"]').first().scrollIntoViewIfNeeded();
  await p.locator('[data-tk-open="T-1044"]').first().tap(); await wait(p, 700);
  ok(await p.evaluate(() => document.querySelector('.ac-tk-split').dataset.depth) === '1', 'tap pushes the detail screen');
  const box = await p.evaluate(() => { const c = document.querySelector('.ac-tk-screen .ac-tk-composer').getBoundingClientRect(); return { bottom: c.bottom, h: innerHeight }; });
  ok(box.h - box.bottom < 4, 'composer sits at the bottom of the screen', JSON.stringify(box));
  ok(await p.evaluate(() => document.documentElement.hasAttribute('data-ac-stacked')), 'tab bar hides under the pushed screen');
  await p.fill('.ac-tk-screen textarea', 'در حال بررسی هستیم');
  await p.tap('.ac-tk-screen [data-tk-send]'); await wait(p, 500);
  ok((await text(p, '.ac-tk-screen .ac-tk-thread > :last-child')).includes('در حال بررسی'), 'reply from the phone screen');
  await p.tap('.ac-tk-screen [data-tk-details]'); await wait(p, 600);
  ok(await p.locator('.ac-sheet[data-state="open"] .ac-tk-side .ac-tk-panel').count() >= 4, 'details open as a sheet');
  await shot(p, 'phone-details');
  await p.tap('.ac-sheet[data-state="open"] [data-ac-close]'); await wait(p, 600);
  ok(await p.locator('.ac-tk-detail__grid > .ac-tk-side').count() === 1, 'sidebar returns after the sheet closes');
  await shot(p, 'phone-detail');
  await p.tap('.ac-tk-screen [data-split-back]'); await wait(p, 700);
  ok(await p.evaluate(() => document.querySelector('.ac-tk-split').dataset.depth) === '0', 'back pops to the list');
  ok(!errors.length, 'no console errors (phone)', errors.join(' | '));
  ok(await overflow(p) <= 0, 'no horizontal overflow (phone)');
  await ctx.close();
}

/* ---------------------------------------------------------------- customer portal */
console.log('my tickets — customer');
for (const vp of [DESK, PHONE]) {
  const phone = vp === PHONE;
  const { ctx, p, errors } = await open(vp, 'my-tickets', { ready: '.ac-tk-myitem' });
  ok(await p.locator('.ac-tk-track__step').count() === 4, `status timeline has 4 steps (${phone ? 'phone' : 'desktop'})`);
  ok(await p.locator('[data-mt-detail] .ac-tk-note').count() === 0, 'internal notes are hidden from the customer');
  if (phone) { await p.locator('.ac-tk-myitem').first().tap(); await wait(p, 700); ok(await p.evaluate(() => document.querySelector('.ac-tk-portal').dataset.depth) === '1', 'phone: request opens as a pushed screen'); await shot(p, 'portal-phone'); }
  await p.fill('[data-mt-detail] textarea', 'ممنون، منتظرم');
  await p.click('[data-mt-detail] [data-tk-send]'); await wait(p, 500);
  ok(await p.locator('[data-mt-detail] .ac-tk-msg[data-mine]').last().textContent().then((s) => s.includes('منتظرم')), 'customer reply shows on the customer side');
  if (phone) { await p.tap('[data-mt-detail] [data-split-back]'); await wait(p, 700); }
  else {
    await p.click('[data-mt-new]'); await wait(p, 500);
    await p.locator('.ac-tk-cat').nth(4).click();
    await p.click('[data-wizard-next]'); await wait(p, 400);
    await p.fill('#mt-subject', 'سفارشم دیر رسیده'); await p.fill('#mt-message', 'سفارش ORD-20877 بعد از پنج روز هنوز ارسال نشده است.');
    await p.click('[data-wizard-next]'); await wait(p, 400);
    await p.click('[data-wizard-next]'); await wait(p, 400);
    ok((await text(p, '[data-mt-review]')).includes('سفارشم دیر رسیده'), 'wizard review shows the answers');
    await shot(p, 'wizard-review');
    await p.click('.ac-tk-wizard [type="submit"]'); await wait(p, 1300);
    ok(await p.locator('.ac-tk-myitem').count() === 4, 'submitted request appears in the list');
    ok(await p.locator('.ac-tk-myitem[aria-current="true"] .ac-tk-chip', { hasText: 'جدید' }).count() === 1, 'new request is selected with status «new»');
    await shot(p, 'portal');
  }
  ok(!errors.length, `no console errors (portal ${phone ? 'phone' : 'desktop'})`, errors.join(' | '));
  ok(await overflow(p) <= 0, 'no horizontal overflow (portal)');
  await ctx.close();
}

/* ---------------------------------------------------------------- support chat widget */
console.log('support chat');
for (const vp of [DESK, PHONE]) {
  const phone = vp === PHONE;
  const { ctx, p, errors } = await open(vp, 'dashboard', { ready: '.ac-sc__launcher' });
  const tap = (s) => (phone ? p.tap(s) : p.click(s));
  ok(await text(p, '[data-sc-badge]') === '1', 'launcher shows the unread badge');
  const lb = await p.evaluate(() => { const r = document.querySelector('.ac-sc__launcher').getBoundingClientRect(); return { left: r.left, right: innerWidth - r.right }; });
  ok(lb.left < lb.right, 'RTL: launcher sits at the inline-end (left) corner', JSON.stringify(lb));
  await tap('.ac-sc__launcher'); await wait(p, 600);
  ok(await p.evaluate(() => document.querySelector('.ac-sc').dataset.state) === 'open', `panel opens (${phone ? 'phone' : 'desktop'})`);
  if (phone) { const r = await p.evaluate(() => { const b = document.querySelector('.ac-sc__panel').getBoundingClientRect(); return [b.top, b.left, b.width, b.height, innerWidth, innerHeight]; }); ok(r[0] <= 1 && r[2] >= r[4] - 1 && r[3] >= r[5] - 1, 'phone: panel is a full-screen sheet', JSON.stringify(r)); }
  await shot(p, `chat-home-${phone ? 'phone' : 'desk'}`);
  await tap('.ac-sc__start'); await wait(p, 500);
  ok(await p.locator('.ac-sc__chat').count() === 1, 'conversation view opens');
  ok(await text(p, '[data-sc-badge]') === '0' || await p.locator('[data-sc-badge][hidden]').count() === 1, 'unread clears when the conversation is shown');
  await p.fill('[data-sc-input]', 'سفارشم کجاست؟');
  await tap('[data-sc-send]'); await wait(p, 900);
  ok(await p.locator('.ac-sc__typing').count() === 1, 'typing indicator shows while the bot replies');
  await wait(p, 1700);
  ok(await p.locator('.ac-sc__msg[data-mine="false"]').count() === 2, 'bot reply arrives');
  ok(await p.locator('.ac-sc__receipt[data-status="read"]').count() === 1, 'read receipt turns to «seen»');
  ok(await p.locator('.ac-sc__chip').count() >= 1, 'quick replies are offered');
  await shot(p, `chat-conv-${phone ? 'phone' : 'desk'}`);
  await tap('.ac-sc__chip'); await wait(p, 300);
  ok(await p.locator('.ac-sc__msg[data-mine="true"]').count() === 2, 'quick reply sends a message');
  await wait(p, 2400);
  await tap('[data-sc-emoji-btn]'); await wait(p, 250);
  await tap('[data-sc-e="👍"]'); await wait(p, 150);
  ok((await p.inputValue('[data-sc-input]')).includes('👍'), 'emoji picker inserts emoji');
  await tap('.ac-sc__chat [data-sc-min]'); await wait(p, 600);
  ok(await p.evaluate(() => document.querySelector('.ac-sc').dataset.state) === 'closed', 'minimize closes the panel');
  await p.evaluate(() => window.AC.supportChat.receive({ text: 'پیام جدید از سارا' })); await wait(p, 300);
  ok(await text(p, '[data-sc-badge]') === '1', 'a message while closed bumps the unread badge');
  ok(!errors.length, `no console errors (chat ${phone ? 'phone' : 'desktop'})`, errors.join(' | '));
  await ctx.close();
}

/* ---------------------------------------------------------------- user panel */
console.log('user panel');
for (const vp of [DESK, PHONE]) {
  const phone = vp === PHONE;
  const { ctx, p, errors } = await open(vp, 'me', { ready: '.ac-up-order' });
  ok(await p.locator('.ac-up-order').count() === 3, 'orders render with step trackers');
  ok(await p.evaluate(() => document.querySelector('.ac-up-complete .ac-ring').dataset.value) === '67', 'completeness ring = 67%');
  await (phone ? p.tap('[data-ac="privacy"]') : p.click('[data-ac="privacy"]')); await wait(p, 300);
  ok(await p.evaluate(() => document.querySelector('[data-up-private-scope]').hasAttribute('data-private')), 'privacy toggle hides amounts');
  await (phone ? p.tap('[data-ac="privacy"]') : p.click('[data-ac="privacy"]'));
  if (!phone) { await p.click('[data-me-2fa-on]'); await wait(p, 300); ok(await p.evaluate(() => document.querySelector('.ac-up-complete .ac-ring').dataset.value) === '83', 'enabling 2FA updates completeness'); }
  ok(!errors.length, `no console errors (me ${phone ? 'phone' : 'desktop'})`, errors.join(' | '));
  ok(await overflow(p) <= 0, 'no horizontal overflow (me)');
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
