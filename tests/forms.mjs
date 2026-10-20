#!/usr/bin/env node
/* Interaction test for the forms family (dev server must be running).
   node tests/forms.mjs [--base=http://localhost:5178] [--shots]
   Covers: live validation + submit, OTP paste/auto-advance/backspace, Jalali date picker
   (keyboard + selection → ISO value), combobox keyboard (local + async), tags, wizard gating. */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function findChromium() {
  const dir = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(dir)) return undefined;
  for (const d of readdirSync(dir).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) {
    for (const sub of ['chrome-win64', 'chrome-win']) { const exe = join(dir, d, sub, 'chrome.exe'); if (existsSync(exe)) return exe; }
  }
  return undefined;
}

const args = process.argv.slice(2);
const base = (args.find((a) => a.startsWith('--base=')) || '').split('=')[1] || 'http://localhost:5178';
const shots = args.includes('--shots');
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'screens');

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? '✓' : '✗'} ${msg}`); if (!cond) fails++; };

const browser = await chromium.launch({ executablePath: findChromium() });

async function run(lang, size, theme = 'light') {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, hasTouch: size.width < 800, isMobile: size.width < 800 });
  await ctx.addInitScript(([l, t]) => { localStorage.setItem('ac:lang', l); localStorage.setItem('ac:theme', t); }, [lang, theme]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto(`${base}/demo/#/forms`, { waitUntil: 'networkidle' });
  await p.waitForSelector('#customer-form .ac-wizard__step');
  await p.waitForTimeout(500);
  return { p, ctx, errors };
}

/* ---------------- desktop, fa ---------------- */
{
  const { p, ctx, errors } = await run('fa', { width: 1440, height: 900 });
  console.log('— desktop fa');

  // validation: live messages + submit
  await p.click('#signup-form [type=submit]');
  ok(await p.locator('#signup-form .ac-field[data-invalid]').count() === 4, 'empty submit marks 4 fields invalid');
  ok(await p.evaluate(() => document.activeElement.id) === 'v-email', 'focus moves to the first invalid field');
  ok((await p.textContent('#signup-form .ac-field__error')).includes('الزامی'), 'Persian required message');
  await p.fill('#v-email', 'bad@');
  await p.waitForTimeout(50);
  ok((await p.locator('#v-email').getAttribute('aria-invalid')) === 'true', 'live: invalid email flagged while typing');
  await p.fill('#v-email', 'ali@aramin.dev');
  ok((await p.locator('#v-email').getAttribute('aria-invalid')) === null, 'live: error clears when fixed');
  await p.fill('#v-user', 'al');
  await p.locator('#v-user').blur();
  ok((await p.locator('#v-user').getAttribute('aria-invalid')) === 'true', 'min:3 fails for 2 chars');
  await p.fill('#v-user', 'aramin');
  await p.fill('#v-pass', 'Str0ng!Pass');
  ok(Number(await p.getAttribute('.ac-strength', 'data-score')) >= 3, 'password strength meter scores a strong password');
  await p.fill('#v-pass2', 'nope');
  await p.locator('#v-pass2').blur();
  ok((await p.locator('#v-pass2').getAttribute('aria-invalid')) === 'true', 'match:#v-pass fails on mismatch');
  await p.fill('#v-pass2', 'Str0ng!Pass');
  const submitted = p.evaluate(() => new Promise((r) => document.addEventListener('ac:form:submit', (e) => r(e.detail.values), { once: true })));
  await p.click('#signup-form [type=submit]');
  const vals = await submitted;
  await p.waitForSelector('[data-output]:not([hidden])');
  await p.waitForTimeout(400);
  ok(vals.email === 'ali@aramin.dev' && vals.username === 'aramin', 'ac:form:submit emits values when valid');
  await p.waitForSelector('[data-output]:not([hidden])');
  ok(await p.locator('#signup-form [type=submit][aria-busy]').count() === 0, 'waitUntil(promise) busy state cleared after submit');
  await p.waitForTimeout(600);

  // validators
  const v = await p.evaluate(() => ({
    nidOk: AC.validate.iranNationalId('0012345679'), nidBad: AC.validate.iranNationalId('0012345678'), nidFa: AC.validate.iranNationalId('۰۰۱۲۳۴۵۶۷۹'),
  }));
  ok(v.nidOk && !v.nidBad && v.nidFa, 'iran-national-id checksum (Latin + Persian digits)');

  // OTP: paste, auto-advance, backspace, complete event
  const boxes = p.locator('#otp-demo .ac-otp__box');
  await boxes.nth(0).focus();
  await p.keyboard.type('12');
  ok(await p.evaluate(() => document.activeElement === document.querySelectorAll('#otp-demo .ac-otp__box')[2]), 'OTP auto-advances');
  await p.keyboard.press('Backspace');
  ok(await p.evaluate(() => document.activeElement === document.querySelectorAll('#otp-demo .ac-otp__box')[1]), 'OTP backspace on empty box goes back');
  const done = p.evaluate(() => new Promise((r) => document.querySelector('#otp-demo').addEventListener('ac:otp:complete', (e) => r(e.detail.value), { once: true })));
  await boxes.nth(0).focus();
  await p.evaluate(() => {
    const dt = new DataTransfer(); dt.setData('text', '۱۲۳ ۴۵۶');
    document.querySelector('#otp-demo .ac-otp__box').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  ok(await done === '123456', 'OTP paste of Persian digits → Latin 123456 + complete event');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#otp-demo')).direction) === 'ltr', 'OTP order is LTR inside RTL page');

  // Jalali date picker: open, navigate by keyboard, select
  await p.click('[data-name="due"] .ac-input-group__btn');
  await p.waitForSelector('.ac-dp[data-state="open"]');
  await p.waitForTimeout(250);
  const title = await p.evaluate(() => { const t = document.querySelector('.ac-dp[data-state="open"] .ac-dp__title'); return t ? t.textContent : `none; html=${document.querySelector('.ac-dp[data-state="open"]').innerHTML.slice(0, 300)}`; });
  ok(/مهر/.test(title) && /1403/.test(title), `Jalali month title (${title})`);
  ok(await p.evaluate(() => document.activeElement.matches('.ac-dp__day[aria-selected="true"]')), 'focus lands on the selected day');
  await p.keyboard.press('ArrowLeft'); // RTL: left = next day
  await p.keyboard.press('ArrowDown'); // +7
  await p.keyboard.press('Enter');
  const due = await p.inputValue('[data-name="due"] input[type=hidden]');
  ok(due === '2024-10-27', `keyboard selection gives ISO 2024-10-27 (got ${due})`);
  ok(await p.inputValue('#d-due') === '1403/08/06', `visible Jalali text 1403/08/06 (got ${await p.inputValue('#d-due')})`);
  const j = await p.evaluate(() => [AC.jalali.toJalali(new Date(2025, 2, 21)), AC.jalali.monthLength(1403, 12), AC.jalali.monthLength(1402, 12)]);
  const sweep = await p.evaluate(() => { let bad = 0; for (let y = 1300; y <= 1500; y++) { let len = 0; for (let m = 1; m <= 12; m++) { const L = AC.jalali.monthLength(y, m); len += L; const d = AC.jalali.toDate(y, m, L); const back = AC.jalali.toJalali(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); if (back.y !== y || back.m !== m || back.d !== L) bad++; } if (len !== 365 && len !== 366) bad++; } return bad; });
  ok(sweep === 0, 'Jalali round-trip for every month 1300–1500 (' + sweep + ' mismatches)');
  ok(j[0].y === 1404 && j[0].m === 1 && j[0].d === 1 && j[1] === 30 && j[2] === 29, 'Nowruz 1404 = 2025-03-21; Esfand 1403 has 30 days (leap), 1402 has 29');

  // typed Jalali date
  await p.fill('#c-birth', '۱۳۷۰/۰۱/۰۱');
  await p.locator('#c-birth').dispatchEvent('change');
  ok(await p.inputValue('[data-name="birthDate"] input[type=hidden]') === '1991-03-21', 'typed Persian-digit Jalali date parses to 1991-03-21');

  // calendar switch
  await p.waitForTimeout(250);
  await p.click('[data-name="due"] .ac-input-group__btn');
  await p.waitForTimeout(300);
  await p.click('.ac-dp[data-state="open"] [data-cal="gregory"]');
  ok(await p.inputValue('#d-due') === '2024/10/27', 'switching to Gregorian re-renders the value');
  if (shots) await p.screenshot({ path: join(OUT, 'forms-datepicker-fa.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await p.keyboard.press('Escape');

  // range picker
  await p.click('#d-range');
  await p.waitForSelector('.ac-dp[data-double][data-state="open"]');
  ok(true, 'range picker shows two months on desktop');
  await p.keyboard.press('Escape');

  // combobox keyboard (local)
  await p.click('#s-country');
  await p.keyboard.type('ام');
  await p.waitForTimeout(50);
  const first = await p.textContent('#s-country ~ * .ac-combo__opt[data-active], .ac-combo__opt[data-active]');
  ok(first.includes('امارات'), `combobox filters as you type (${first.trim()})`);
  await p.keyboard.press('Enter');
  const cv = await p.evaluate(() => document.querySelector('select[name="country"]').value);
  ok(cv === 'ae', 'Enter selects → hidden select value ae (got ' + cv + ')');
  await p.keyboard.press('ArrowDown');
  await p.keyboard.press('ArrowDown');
  await p.keyboard.press('Enter');
  ok(await p.evaluate(() => document.querySelector('select[name="country"]').value) !== 'ae', 'ArrowDown + Enter changes selection');
  if (shots) { await p.click('#s-team'); await p.waitForTimeout(250); await p.screenshot({ path: join(OUT, 'forms-combobox-fa.png') }); await p.keyboard.press('Escape'); }

  // multi-select: backspace removes last chip
  await p.click('#s-team');
  await p.keyboard.press('Escape');
  await p.keyboard.press('Backspace');
  ok(await p.evaluate(() => [...document.querySelector('select[name="team"]').selectedOptions].length) === 1, 'multi-select: Backspace removes last chip');

  // tags
  await p.click('#s-tags');
  await p.keyboard.type('جدید');
  await p.keyboard.press('Enter');
  await p.keyboard.type('VIP,');
  ok(await p.inputValue('[data-name="tags"] input[type=hidden]') === 'فوری,VIP,جدید', 'tag input adds on Enter and rejects duplicates');

  // wizard gating + async combobox
  await p.click('#customer-form [data-wizard-next]');
  ok(await p.locator('#customer-form .ac-wizard__step:not([hidden])').getAttribute('aria-labelledby') === 'ws1', 'wizard blocks next when step 1 invalid');
  ok(await p.getAttribute('#customer-form .ac-step >> nth=0', 'data-state') === 'error', 'stepper shows error state');
  await p.fill('#c-first', 'علی');
  await p.fill('#c-last', 'رامین');
  await p.fill('#c-nid', '0012345679');
  await p.click('#customer-form [data-wizard-next]');
  ok(await p.locator('#customer-form .ac-wizard__step:not([hidden])').getAttribute('aria-labelledby') === 'ws2', 'wizard moves to step 2 when valid');
  await p.fill('#c-mobile', '۰۹۱۲۳۴۵۶۷۸۹');
  await p.click('#c-city');
  await p.keyboard.type('شیر');
  await p.waitForSelector('.ac-combo__opt >> text=شیراز', { timeout: 3000 });
  await p.keyboard.press('Enter');
  ok(await p.evaluate(() => document.querySelector('select[name="city"]').value) === 'shz', 'async loader result selectable with keyboard');
  await p.click('#customer-form [data-wizard-next]');
  ok(await p.locator('#customer-form .ac-wizard__step:not([hidden])').getAttribute('aria-labelledby') === 'ws3', 'Persian-digit mobile accepted; step 3');
  if (shots) await p.locator('#wizard').screenshot({ path: join(OUT, 'forms-wizard-fa.png') });

  // dropzone
  await p.setInputFiles('.ac-dropzone input[type=file]', [{ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360f8cfc0000003010100c9fe92ef0000000049454e44ae426082', 'hex') }, { name: 'contract.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(2048) }]);
  ok(await p.locator('.ac-files__item').count() === 2, 'dropzone lists picked files');
  await p.waitForSelector('.ac-files__item[data-state="done"] >> nth=1', { timeout: 6000 });
  ok(await p.evaluate(() => document.querySelector('.ac-dropzone input[type=file]').files.length) === 2, 'simulated progress completes; input.files stays in sync');
  if (shots) await p.locator('.ac-dropzone').screenshot({ path: join(OUT, 'forms-dropzone-fa.png') });

  ok(!errors.length, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await ctx.close();
}

/* ---------------- phone, en, dark: sheets ---------------- */
{
  const { p, ctx, errors } = await run('en', { width: 390, height: 844 }, 'dark');
  console.log('— phone en dark');
  await p.locator('#d-due').scrollIntoViewIfNeeded();
  await p.click('#d-due');
  await p.waitForSelector('.ac-dp[data-sheet][data-state="open"]');
  await p.waitForTimeout(400);
  const box = await p.locator('.ac-dp[data-state="open"]').boundingBox();
  ok(box && Math.abs(box.y + box.height - 844) < 2 && box.width >= 389, 'date picker becomes a bottom sheet on phone');
  ok(await p.evaluate(() => document.querySelector('#d-due').readOnly), 'no soft keyboard: input is read-only on touch');
  if (shots) await p.screenshot({ path: join(OUT, 'forms-datepicker-phone-en-dark.png') });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.locator('#d-time').scrollIntoViewIfNeeded();
  await p.click('#d-time');
  await p.waitForTimeout(400);
  if (shots) await p.screenshot({ path: join(OUT, 'forms-timepicker-phone-en-dark.png') });
  ok(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) === 0, 'no horizontal overflow on phone');
  ok(!errors.length, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await ctx.close();
}

await browser.close();
console.log(fails ? `\n${fails} failed` : '\nall passed');
process.exit(fails ? 1 : 0);
