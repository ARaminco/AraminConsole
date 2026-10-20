#!/usr/bin/env node
/* Overlays & feedback interaction tests (dev server must be running).
   node tests/overlays.mjs [--base=http://localhost:5178] [--no-shots]
   Checks: focus trap / Esc / return focus, static modal, dropdown roving focus + submenu, context menu,
   confirm + prompt promises, toast stacking + expand + swipe, popover, tooltip, notification center,
   customizer, phone: modal-as-sheet, sheet snap + drag-to-dismiss with real touch (CDP), action sheet.
   Screenshots → tests/screens/ov-*.png */
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

async function open(ctxOpts, { theme = 'light', lang = 'fa' } = {}) {
  const ctx = await browser.newContext(ctxOpts);
  await ctx.addInitScript(([t, l]) => { localStorage.setItem('ac:theme', t); localStorage.setItem('ac:lang', l); localStorage.removeItem('ac:accent'); }, [theme, lang]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(`${BASE}/demo/#/overlays`, { waitUntil: 'networkidle' });
  await p.waitForSelector('[data-page="overlays"]');
  await wait(p, 900);
  return { ctx, p, errors };
}
const shot = async (p, name) => { if (SHOTS) await p.screenshot({ path: join(OUT, `ov-${name}.png`) }); };
const state = (p, sel) => p.evaluate((s) => document.querySelector(s)?.dataset.state, sel);
const active = (p) => p.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}#${a.id}.${a.className}` : ''; });

/* ------------------------------------------------------------- desktop */
for (const [theme, lang] of [['light', 'fa'], ['dark', 'en']]) {
  console.log(`desktop 1440x900 ${theme} ${lang}`);
  const { ctx, p, errors } = await open({ viewport: { width: 1440, height: 900 } }, { theme, lang });
  const tag = `desktop-${theme}-${lang}`;

  // modal: focus trap, Esc, return focus
  const trig = p.locator('[data-ac-open="#ov-modal"]');
  await trig.click(); await wait(p);
  ok(await state(p, '#ov-modal') === 'open', 'modal opens');
  ok(await p.evaluate(() => document.querySelector('#ov-modal').parentElement === document.body), 'modal portaled to body');
  ok((await active(p)).includes('#ov-name'), 'initial focus on data-initial field', await active(p));
  ok(await p.evaluate(() => document.querySelector('#ov-modal .ac-dialog').getAttribute('aria-modal') === 'true' && !!document.querySelector('#ov-modal .ac-dialog').getAttribute('aria-labelledby')), 'aria-modal + aria-labelledby');
  for (let i = 0; i < 6; i++) await p.keyboard.press('Tab');
  ok(await p.evaluate(() => document.querySelector('#ov-modal').contains(document.activeElement)), 'Tab stays inside (focus trap)');
  await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Shift+Tab');
  ok(await p.evaluate(() => document.querySelector('#ov-modal').contains(document.activeElement)), 'Shift+Tab stays inside');
  if (theme === 'light') await shot(p, `modal-${tag}`);
  await p.keyboard.press('Escape'); await wait(p);
  ok(await state(p, '#ov-modal') === 'closed', 'Esc closes modal');
  ok(await p.evaluate(() => document.activeElement?.getAttribute('data-ac-open') === '#ov-modal'), 'focus returns to trigger');
  ok(await p.evaluate(() => !document.documentElement.hasAttribute('data-scroll-locked')), 'scroll unlocked');
  ok(await p.evaluate(() => !!document.querySelector('[data-page="overlays"] #ov-modal')), 'modal restored into page');

  // backdrop click + static
  await trig.click(); await wait(p);
  await p.mouse.click(30, 450); await wait(p);
  ok(await state(p, '#ov-modal') === 'closed', 'backdrop click closes');
  await p.click('[data-ac-open="#ov-modal-static"]'); await wait(p);
  await p.keyboard.press('Escape'); await wait(p, 150);
  ok(await state(p, '#ov-modal-static') === 'open', 'static modal ignores Esc');
  await p.click('#ov-modal-static [data-ac-close]'); await wait(p);

  // drawer
  await p.click('[data-ac-open="#ov-drawer"]'); await wait(p);
  ok(await state(p, '#ov-drawer') === 'open', 'drawer opens');
  await shot(p, `drawer-${tag}`);
  await p.keyboard.press('Escape'); await wait(p);

  // dropdown: keyboard
  await p.focus('[data-ac-open="#ov-menu"]'); await p.keyboard.press('Enter'); await wait(p, 250);
  ok(await state(p, '#ov-menu') === 'open', 'dropdown opens by keyboard');
  ok(await p.evaluate(() => document.activeElement?.classList.contains('ac-menu__item')), 'first item focused');
  ok(await p.evaluate(() => document.querySelector('[data-ac-open="#ov-menu"]').getAttribute('aria-expanded') === 'true'), 'trigger aria-expanded=true');
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown');
  const fwd = lang === 'fa' ? 'ArrowLeft' : 'ArrowRight';
  await p.keyboard.press(fwd); await wait(p, 250);
  ok(await p.evaluate(() => document.activeElement?.closest('.ac-menu')?.id !== 'ov-menu' && !!document.activeElement?.closest('.ac-menu')), 'submenu opens with arrow (RTL-aware)');
  await shot(p, `menu-${tag}`);
  await p.keyboard.press(lang === 'fa' ? 'ArrowRight' : 'ArrowLeft'); await wait(p, 120);
  ok(await p.evaluate(() => document.activeElement?.closest('.ac-menu')?.id === 'ov-menu'), 'back arrow returns to parent');
  await p.keyboard.press('End');
  ok(await p.evaluate(() => document.activeElement?.dataset.value === 'delete'), 'End → last enabled item');
  await p.keyboard.press('Escape'); await wait(p, 250);
  ok(await state(p, '#ov-menu') === 'closed', 'Esc closes dropdown');
  ok(await p.evaluate(() => document.activeElement?.getAttribute('data-ac-open') === '#ov-menu'), 'focus back on dropdown trigger');
  // checkbox item keeps menu open
  await p.click('[data-ac-open="#ov-menu"]'); await wait(p, 250);
  await p.click('#ov-menu [data-value="compact"]'); await wait(p, 100);
  ok(await p.evaluate(() => document.querySelector('#ov-menu [data-value="compact"]').getAttribute('aria-checked') === 'true') && await state(p, '#ov-menu') === 'open', 'checkbox item toggles, menu stays open');
  await p.mouse.click(700, 120); await wait(p, 250);
  ok(await state(p, '#ov-menu') === 'closed', 'outside click closes dropdown');

  // context menu
  const area = p.locator('[data-ac-contextmenu]');
  await area.click({ button: 'right', position: { x: 60, y: 40 } }); await wait(p, 250);
  ok(await state(p, '#ov-ctx-menu') === 'open', 'right click opens context menu');
  await shot(p, `context-${tag}`);
  await p.keyboard.press('Escape'); await wait(p, 250);
  ok(await state(p, '#ov-ctx-menu') === 'closed', 'Esc closes context menu');

  // confirm / prompt promises
  await p.click('[data-demo="confirm-danger"]'); await wait(p);
  ok(await p.evaluate(() => document.activeElement?.hasAttribute('data-cancel')), 'danger confirm focuses Cancel');
  await shot(p, `confirm-${tag}`);
  await p.click('.ac-confirm [data-cancel]'); await wait(p);
  ok((await p.textContent('[data-ov-out="confirm"]')).includes('false'), 'confirm resolves false on cancel');
  await p.click('[data-demo="confirm"]'); await wait(p);
  await p.click('.ac-confirm [data-confirm]'); await wait(p);
  ok((await p.textContent('[data-ov-out="confirm"]')).includes('true'), 'confirm resolves true');
  await p.click('[data-demo="prompt"]'); await wait(p);
  await p.fill('.ac-confirm__input', 'notes.txt'); await p.keyboard.press('Enter'); await wait(p, 200);
  ok(await p.evaluate(() => document.querySelector('.ac-confirm__input')?.getAttribute('aria-invalid') === 'true'), 'prompt validation blocks bad value');
  if (theme === 'light') await shot(p, `prompt-${tag}`);
  await p.fill('.ac-confirm__input', 'q3.pdf'); await p.keyboard.press('Enter'); await wait(p);
  ok((await p.textContent('[data-ov-out="confirm"]')).includes('"q3.pdf"'), 'prompt resolves value');
  ok(await p.evaluate(() => !document.querySelector('.ac-confirm')), 'ephemeral dialogs removed');

  // toasts
  await p.click('[data-demo="stack"]'); await wait(p, 1300);
  const n = await p.evaluate(() => document.querySelectorAll('#ac-toasts .ac-toast:not([data-state="exit"])').length);
  ok(n === 4, 'stack shows 4 toasts', String(n));
  ok(await p.evaluate(() => { const c = document.querySelector('#ac-toasts'); return parseFloat(getComputedStyle(c).height) < 140; }), 'collapsed stack is compact');
  await shot(p, `toasts-collapsed-${tag}`);
  await p.hover('#ac-toasts .ac-toast:last-child'); await wait(p, 450);
  ok(await p.evaluate(() => document.querySelector('#ac-toasts').hasAttribute('data-expanded')), 'hover expands stack');
  ok(await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#ac-toasts')).height) > 200), 'expanded stack is tall');
  await shot(p, `toasts-expanded-${tag}`);
  await p.click('#ac-toasts .ac-toast:last-child .ac-toast__close'); await wait(p, 400);
  ok(await p.evaluate(() => document.querySelectorAll('#ac-toasts .ac-toast').length) === 3, 'close button removes a toast');
  await p.evaluate(() => AC.toast.dismiss()); await p.mouse.move(700, 450); await wait(p, 400);
  await p.click('[data-demo="undo"]'); await wait(p, 300);
  await p.click('#ac-toasts .ac-toast__action'); await wait(p, 400);
  ok(await p.evaluate(() => [...document.querySelectorAll('#ac-toasts .ac-toast')].some((t) => t.dataset.tone === 'info')), 'undo action runs callback');
  await p.evaluate(() => AC.toast.dismiss()); await wait(p, 300);
  await p.evaluate(() => AC.toast({ title: 'x', duration: 300 })); await wait(p, 800);
  ok(await p.evaluate(() => !document.querySelector('#ac-toasts .ac-toast')), 'toast auto-dismisses after duration');

  // popover + tooltip
  await p.click('[data-ac-open="#ov-pop"]'); await wait(p);
  ok(await state(p, '#ov-pop') === 'open', 'popover opens');
  ok((await active(p)).includes('ov-email'), 'popover focuses autofocus field');
  await shot(p, `popover-${tag}`);
  await p.keyboard.press('Escape'); await wait(p);
  ok(await state(p, '#ov-pop') === 'closed' && await p.evaluate(() => document.activeElement?.getAttribute('data-ac-open') === '#ov-pop'), 'popover Esc + return focus');
  await p.hover('[data-ac-tooltip="Copy link"]'); await wait(p, 700);
  ok(await p.evaluate(() => document.querySelector('.ac-tooltip')?.dataset.state === 'open'), 'tooltip on hover');
  ok(await p.evaluate(() => { const t = document.querySelector('.ac-tooltip').getBoundingClientRect(); const b = document.querySelector('[data-ac-tooltip="Copy link"]').getBoundingClientRect(); return t.bottom <= b.top; }), 'tooltip placed above');
  await shot(p, `tooltip-${tag}`);
  await p.mouse.move(700, 120); await wait(p, 200);

  // notifications panel
  await p.click('.ac-card [data-ac-notifications-open]'); await wait(p, 500);
  ok(await p.evaluate(() => document.querySelector('.ac-notif-pop')?.dataset.state === 'open'), 'notification panel opens');
  const unreadBefore = await p.evaluate(() => AC.notifications.unread);
  ok(unreadBefore > 0, 'has unread notifications', String(unreadBefore));
  await shot(p, `notif-panel-${tag}`);
  await p.click('.ac-notif-pop [data-notif-readall]'); await wait(p, 200);
  ok(await p.evaluate(() => AC.notifications.unread === 0), 'mark all read');
  await p.keyboard.press('Escape'); await wait(p);

  // customizer
  await p.click('.ac-page-head [data-ac-customizer-open]'); await wait(p);
  ok(await p.evaluate(() => document.querySelector('.ac-cz')?.dataset.state === 'open'), 'customizer opens');
  await shot(p, `customizer-${tag}`);
  const target = theme === 'light' ? 'dark' : 'light';
  await p.click(`.ac-cz [data-cz="theme"] [data-value="${target}"]`); await wait(p, 500);
  ok(await p.evaluate((t) => document.documentElement.dataset.theme === t, target), `customizer sets theme ${target}`);
  await p.click('.ac-cz [data-swatch="emerald"]'); await wait(p, 300);
  ok(await p.evaluate(() => document.documentElement.dataset.accent === 'emerald'), 'customizer sets accent');
  await p.keyboard.press('Escape'); await wait(p);
  ok(await p.evaluate(() => AC.palette.list().some((c) => c.id === 'customizer:open')), 'palette command registered');

  ok(errors.length === 0, 'no console errors', errors.join(' | '));
  await ctx.close();
}

/* ------------------------------------------------------------- phone (touch) */
for (const [theme, lang] of [['light', 'fa'], ['dark', 'en']]) {
  console.log(`phone 390x844 ${theme} ${lang}`);
  const { ctx, p, errors } = await open({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }, { theme, lang });
  const tag = `phone-${theme}-${lang}`;
  const cdp = await ctx.newCDPSession(p);
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  async function drag(x, y0, y1, steps = 8, ms = 12) {
    await touch('touchStart', x, y0);
    for (let i = 1; i <= steps; i++) { await touch('touchMove', x, y0 + ((y1 - y0) * i) / steps); await p.waitForTimeout(ms); }
    await touch('touchEnd');
  }
  const panelTop = (sel) => p.evaluate((s) => document.querySelector(`${s} .ac-dialog`).getBoundingClientRect().top, sel);

  // modal → sheet
  await p.locator('[data-ac-open="#ov-modal"]').tap(); await wait(p, 450);
  const geo = await p.evaluate(() => { const r = document.querySelector('#ov-modal .ac-dialog').getBoundingClientRect(); return { w: r.width, bottom: r.bottom, handle: getComputedStyle(document.querySelector('#ov-modal .ac-dialog__handle')).display }; });
  ok(geo.w >= 389 && Math.abs(geo.bottom - 844) < 2 && geo.handle === 'block', 'modal presents as bottom sheet on phone', JSON.stringify(geo));
  await shot(p, `modal-sheet-${tag}`);
  const top0 = await panelTop('#ov-modal');
  await drag(195, top0 + 10, top0 + 400, 6, 10); await wait(p, 450);
  ok(await state(p, '#ov-modal') === 'closed', 'fast drag down dismisses modal sheet (touch)');

  // sheet with snap points
  await p.locator('[data-ac-open="#ov-sheet"]').tap(); await wait(p, 450);
  const t1 = await panelTop('#ov-sheet');
  ok(Math.abs(t1 - 844 * 0.5) < 30, 'sheet opens at 50% snap', String(t1));
  await shot(p, `sheet-half-${tag}`);
  await drag(195, t1 + 10, t1 - 300, 10, 16); await wait(p, 450);
  const t2 = await panelTop('#ov-sheet');
  ok(t2 < t1 - 200, 'drag up snaps to 92%', `${t1} → ${t2}`);
  await shot(p, `sheet-full-${tag}`);
  // backdrop follows drag below the lowest snap point; a held (zero-velocity) release snaps back
  await touch('touchStart', 195, t2 + 10);
  for (let i = 1; i <= 10; i++) { await touch('touchMove', 195, t2 + 10 + i * 50); await p.waitForTimeout(30); }
  await p.waitForTimeout(200);
  const mid = await p.evaluate(() => Number(getComputedStyle(document.querySelector('#ov-sheet')).getPropertyValue('--_p')));
  ok(mid < 0.95, 'backdrop fades with drag', String(mid));
  await shot(p, `sheet-dragging-${tag}`);
  await touch('touchEnd'); await wait(p, 450);
  ok(await state(p, '#ov-sheet') === 'open', 'slow partial drag snaps back (stays open)');
  const t3 = await panelTop('#ov-sheet');
  await drag(195, t3 + 10, 840, 5, 8); await wait(p, 450);
  ok(await state(p, '#ov-sheet') === 'closed', 'flick down dismisses sheet');

  // dropdown → action sheet
  await p.locator('[data-ac-open="#ov-menu"]').tap(); await wait(p, 450);
  ok(await p.evaluate(() => !!document.querySelector('.ac-actionsheet[data-state="open"] #ov-menu')), 'dropdown becomes action sheet');
  await shot(p, `actionsheet-${tag}`);
  await p.locator('.ac-actionsheet #ov-menu [data-value="duplicate"]').tap(); await wait(p, 500);
  ok(await p.evaluate(() => !document.querySelector('.ac-actionsheet') && !!document.querySelector('[data-page="overlays"] #ov-menu')), 'action sheet closes on select and menu is restored');

  // long-press context menu
  await p.evaluate(() => document.querySelector('[data-ac-contextmenu]').scrollIntoView({ block: 'center' })); await wait(p, 200);
  const box = await p.locator('[data-ac-contextmenu]').boundingBox();
  await touch('touchStart', box.x + 60, box.y + 40); await p.waitForTimeout(650); await touch('touchEnd'); await wait(p, 450);
  ok(await p.evaluate(() => !!document.querySelector('.ac-actionsheet[data-state="open"] #ov-ctx-menu')), 'long-press opens context menu (action sheet)');
  await p.keyboard.press('Escape'); await wait(p, 450);

  // toast swipe
  await p.evaluate(() => document.querySelector('[data-toast="success"]').scrollIntoView({ block: 'center' })); await wait(p, 200);
  await p.locator('[data-toast="success"]').tap(); await wait(p, 400);
  const tb = await p.locator('#ac-toasts .ac-toast').first().boundingBox();
  await shot(p, `toast-${tag}`);
  await touch('touchStart', tb.x + 60, tb.y + tb.height / 2);
  for (let i = 1; i <= 6; i++) { await touch('touchMove', tb.x + 60 + i * 40, tb.y + tb.height / 2); await p.waitForTimeout(10); }
  await touch('touchEnd'); await wait(p, 450);
  ok(await p.evaluate(() => !document.querySelector('#ac-toasts .ac-toast')), 'swipe dismisses toast');

  // notification center → full sheet; tooltip never on touch
  await p.locator('.ac-card [data-ac-notifications-open]').tap(); await wait(p, 500);
  ok(await p.evaluate(() => document.querySelector('.ac-notif-sheet')?.dataset.state === 'open'), 'notification center is a sheet on phone');
  await shot(p, `notif-sheet-${tag}`);
  await p.keyboard.press('Escape'); await wait(p, 450);
  await p.locator('[data-ac-tooltip="Share"]').tap(); await wait(p, 700);
  ok(await p.evaluate(() => document.querySelector('.ac-tooltip')?.dataset.state !== 'open'), 'no tooltip on touch');

  // confirm on phone
  await p.locator('[data-demo="confirm-danger"]').tap(); await wait(p, 450);
  await shot(p, `confirm-${tag}`);
  await p.locator('.ac-confirm [data-cancel]').tap(); await wait(p, 450);

  // customizer
  await p.locator('.ac-page-head [data-ac-customizer-open]').tap(); await wait(p, 450);
  await shot(p, `customizer-${tag}`);
  await p.keyboard.press('Escape'); await wait(p, 450);

  const ovf = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(ovf === 0, 'no horizontal overflow', String(ovf));
  ok(errors.length === 0, 'no console errors', errors.join(' | '));
  await ctx.close();
}

/* ------------------------------------------------------------- notifications page */
{
  console.log('notifications page');
  const { ctx, p, errors } = await open({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${BASE}/demo/#/notifications`); await wait(p, 1200);
  const rows = await p.evaluate(() => document.querySelectorAll('.ac-notif--page .ac-notif__row').length);
  ok(rows > 4, 'page lists notifications', String(rows));
  await p.click('.ac-notif--page .ac-segmented__item[data-value="unread"]'); await wait(p, 300);
  ok(await p.evaluate(() => [...document.querySelectorAll('.ac-notif--page .ac-notif__row')].every((r) => r.hasAttribute('data-unread'))), 'Unread tab filters');
  await shot(p, 'notif-page-desktop');
  ok(errors.length === 0, 'no console errors', errors.join(' | '));
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
