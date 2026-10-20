#!/usr/bin/env node
/* Finance kit test (dev server must be running): AC.money, AC.date, AC.bank, bank card, card form, Sheba input.
   node tests/finance.mjs [--base=http://localhost:5178] */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function findChromium() {
  const dir = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(dir)) return undefined;
  for (const d of readdirSync(dir).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) {
    for (const sub of ['chrome-win64', 'chrome-win']) { const exe = join(dir, d, sub, 'chrome.exe'); if (existsSync(exe)) return exe; }
  }
  return undefined;
}
const base = (process.argv.find((a) => a.startsWith('--base=')) || '').split('=')[1] || 'http://localhost:5178';
let fails = 0;
const ok = (cond, msg, got) => { console.log(`${cond ? '✓' : '✗'} ${msg}${cond || got === undefined ? '' : `  → got ${JSON.stringify(got)}`}`); if (!cond) fails++; };
const eq = (got, want, msg) => ok(got === want, msg, got);

const browser = await chromium.launch({ executablePath: findChromium() });
async function open(page, { lang = 'fa', width = 1440, height = 900 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: width < 800, isMobile: width < 800 });
  await ctx.addInitScript((l) => { localStorage.setItem('ac:lang', l); localStorage.setItem('ac:theme', 'light'); localStorage.setItem('ac:digits', 'latn'); localStorage.setItem('ac:money-unit', 'IRT'); }, lang);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto(`${base}/demo/#/${page}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  return { p, ctx, errors };
}

/* ---------------- pure APIs */
{
  const { p, ctx, errors } = await open('finance');
  console.log('— AC.bank');
  const b = await p.evaluate(() => {
    const B = AC.bank;
    const fill = (pre) => { let s = pre.padEnd(15, '0'); for (let d = 0; d < 10; d++) if (B.luhn(s + d)) return s + d; return ''; };
    return {
      luhn: [B.luhn('4111111111111111'), B.luhn('4111111111111112'), B.luhn('6037 9900 0000 0006'), B.luhn('۶۰۳۷۹۹' + fill('603799').slice(6))],
      bins: ['603799', '589210', '610433', '627353', '585983', '603769', '502229', '621986', '622106', '627412', '603770', '628023', '502938', '505785', '627381'].map((x) => B.detect(fill(x))?.slug),
      nets: ['6037990000000006', '4111111111111111', '5500000000000004', '2221000000000009', '378282246310005', '6250941006528599', '2200240000000000', '3530111333300000', '6011111111111117'].map(B.network),
      fmt: [B.formatCard('6037991234567890'), B.mask('6037991234567890'), B.formatCard('378282246310005', { sep: ' ' })],
      sheba: [B.sheba.valid('IR820540102680020817909002'), B.sheba.bank('IR820540102680020817909002')?.slug, B.sheba.valid('IR82 0540 1026 8002 0817 9090 03'), B.sheba.valid('۸۲۰۵۴۰۱۰۲۶۸۰۰۲۰۸۱۷۹۰۹۰۰۲'),
        B.sheba.valid(`IR${B.iban.checksum('IR', '0170000000123456789012')}0170000000123456789012`), B.sheba.bank('IR' + B.iban.checksum('IR', '0170000000123456789012') + '0170000000123456789012')?.slug],
      iban: [B.iban.valid('DE89 3704 0044 0532 0130 00'), B.iban.valid('GB82 WEST 1234 5698 7654 32'), B.iban.valid('AE070331234567890123456'), B.iban.valid('DE89 3704 0044 0532 0130 01'), B.iban.format('de89370400440532013000')],
      logo: B.logo('melli'),
      sprite: !!document.querySelector('[data-ac-sprite$="banks.svg"] #bank-melli') && !!document.querySelector('#net-visa'),
    };
  });
  ok(b.luhn[0] && !b.luhn[1] && b.luhn[2] && b.luhn[3], 'Luhn: valid/invalid, Persian digits accepted', b.luhn);
  eq(b.bins.join(), 'melli,sepah,mellat,tejarat,tejarat,saderat,pasargad,saman,parsian,eghtesad-novin,keshavarzi,maskan,dey,iran-zamin,ansar', 'BIN → bank for 15 sample BINs');
  eq(b.nets.join(), 'shetab,visa,mastercard,mastercard,amex,unionpay,mir,jcb,discover', 'card networks (Iranian BIN wins over 62/63 ranges)');
  eq(b.fmt.join(' | '), '6037-9912-3456-7890 | 6037-99••-••••-7890 | 3782 822463 10005', 'card formatting, Iranian mask, Amex 4-6-5');
  ok(b.sheba[0] && b.sheba[1] === 'parsian' && !b.sheba[2] && b.sheba[3] && b.sheba[4] && b.sheba[5] === 'melli', 'Sheba mod-97 valid/invalid, bank code → bank, Persian digits', b.sheba);
  ok(b.iban[0] && b.iban[1] && b.iban[2] && !b.iban[3] && b.iban[4] === 'DE89 3704 0044 0532 0130 00', 'international IBAN (DE, GB, AE) + format', b.iban);
  ok(b.logo.includes('href="#bank-melli"') && b.logo.includes('ac-bank-logo'), 'AC.bank.logo() markup');
  ok(b.sprite, 'dist/banks.svg loaded with bank-melli and net-visa');

  console.log('— AC.money');
  const m = await p.evaluate(() => {
    const M = AC.money;
    return {
      f: [M.format(12500000, { currency: 'IRT', lang: 'fa' }), M.format(125000000, { from: 'IRR', currency: 'IRT', compact: true, lang: 'fa' }), M.format(3e9, { currency: 'IRR', compact: true, lang: 'fa' }),
        M.format(2.5e13, { from: 'IRR', currency: 'IRT', compact: true, lang: 'fa' }), M.format(12500000, { currency: 'IRT', lang: 'fa', digits: 'native' }), M.format(1250, { currency: 'USD', lang: 'en' }),
        M.format(1250, { currency: 'IRR', lang: 'en' }), M.format(-4275000, { currency: 'IRT', lang: 'fa' }), M.format(12.5, { currency: 'USD', lang: 'fa' })],
      w: [M.toWords(1200000), M.words(1200000, { currency: 'IRT' }), M.toWords(1200000, { lang: 'en' }), M.toWords(1015), M.toWords(0), M.words(12.5, { currency: 'USD', lang: 'fa' }), M.words(12.5, { currency: 'USD', lang: 'en' }), M.toWords(3000000000)],
      c: [M.convert(1000, 'IRT', 'IRR'), M.convert(1000, 'IRR', 'IRT'), M.parse('۱۲٬۵۰۰٫۵')],
      parts: M.parts(-4275000, { currency: 'IRT', lang: 'fa' }),
    };
  });
  eq(m.f[0], '12,500,000 تومان', 'Toman formatting (fa)');
  eq(m.f[1], '12.5 میلیون تومان', 'compact: IRR → «12.5 میلیون تومان»');
  eq(m.f[2], '3 میلیارد ریال', 'compact: «3 میلیارد ریال»');
  eq(m.f[3], '2.5 همت', 'compact: هزار میلیارد تومان → «همت»');
  eq(m.f[4], '۱۲٬۵۰۰٬۰۰۰ تومان', 'Persian digits and separators');
  eq(m.f.slice(5).join(' | '), '$1,250 | IRR 1,250 | -4,275,000 تومان | 12.50 دلار', 'symbol placement en/fa, minus sign kept with digits');
  ok(m.parts.num === '-4,275,000' && m.parts.unit === 'تومان' && m.parts.dir === 'rtl', 'parts(): number isolated from unit for RTL', m.parts);
  eq(m.w[0], 'یک میلیون و دویست هزار', 'words: 1200000 → «یک میلیون و دویست هزار»');
  eq(m.w[1], 'یک میلیون و دویست هزار تومان', 'amount in words with unit');
  eq(m.w[2], 'one million two hundred thousand', 'English words');
  eq(m.w.slice(3).join(' | '), 'یک هزار و پانزده | صفر | دوازده دلار و پنجاه سنت | twelve US dollar and fifty cents | سه میلیارد', 'words: teens, zero, cents, billions');
  eq(m.c.join(), '10000,100,12500.5', 'Rial↔Toman conversion and parse of Persian input');

  console.log('— AC.date');
  const d = await p.evaluate(() => {
    const D = AC.date;
    const o = { lang: 'fa', digits: 'native' };
    return {
      fmt: [D.format('2026-10-20', { ...o, calendar: 'persian', style: 'numeric' }), D.format('2026-10-20', { ...o, calendar: 'persian', style: 'long' }), D.format('2026-10-20', { ...o, calendar: 'persian', style: 'medium' }),
        D.format('2026-10-20', { lang: 'en', calendar: 'gregory', style: 'long' }), D.format('2024-03-11', { calendar: 'islamic', style: 'numeric', lang: 'fa' })],
      rel: D.format(new Date(Date.now() - 3 * 864e5), { style: 'relative', lang: 'fa', digits: 'native' }),
      conv: [D.convert({ y: 1403, m: 1, d: 1 }, 'persian', 'gregory'), D.convert({ y: 2026, m: 10, d: 20 }, 'gregory', 'persian'), D.toISO(D.toDate(1446, 1, 1, 'islamic')), D.parts('2024-03-11', 'islamic'), D.toISO(D.toDate(1405, 7, 28, 'persian'))],
      hol: [D.holiday('2026-03-21')?.en, D.holiday(D.toDate(1405, 11, 22, 'persian'))?.en, D.holiday(D.toDate(1405, 7, 27, 'persian')), D.isHoliday('2026-10-23'), D.holidays(1405).length, D.holidays(1405).filter((x) => x.kind === 'lunar').length],
      ashura: (() => { const a = D.holidays(1404).find((x) => x.en === 'Ashura')?.iso; D.adjustHijri({ '1447-1': 1 }); const b = D.holidays(1404).find((x) => x.en === 'Ashura')?.iso; D.adjustHijri({ '1447-1': 0 }); return `${a}|${b}`; })(),
    };
  });
  eq(d.fmt[0], '۱۴۰۵/۰۷/۲۸', 'Jalali numeric «۱۴۰۵/۰۷/۲۸»');
  eq(d.fmt[1], 'سه‌شنبه ۲۸ مهر ۱۴۰۵', 'Jalali long «سه‌شنبه ۲۸ مهر ۱۴۰۵» (2026-10-20 is a Tuesday)');
  eq(d.fmt[2], '۲۸ مهر ۱۴۰۵', 'Jalali medium');
  eq(d.fmt[3], 'Tuesday, October 20, 2026', 'Gregorian long (en)');
  eq(d.fmt[4], '1445/09/01', 'Hijri: 2024-03-11 = 1 Ramadan 1445 (Umm al-Qura)');
  eq(d.rel, '۳ روز پیش', 'relative «۳ روز پیش»');
  eq(JSON.stringify(d.conv), JSON.stringify([{ y: 2024, m: 3, d: 20 }, { y: 1405, m: 7, d: 28 }, '2024-07-07', { y: 1445, m: 9, d: 1 }, '2026-10-20']), 'calendar conversions (Jalali, Gregorian, Hijri)');
  ok(d.hol[0] === 'Nowruz' && d.hol[1] === 'Revolution Day' && d.hol[2] === null && d.hol[3] === true, 'holidays: Nowruz, 22 Bahman, ordinary day, Friday', d.hol);
  ok(d.hol[4] >= 25 && d.hol[4] <= 29 && d.hol[5] >= 15, 'holidays 1405: solar + lunar count plausible', d.hol.slice(4));
  eq(d.ashura, '2025-07-05|2025-07-06', 'Ashura 1404: Umm al-Qura 07-05 (±1 day, documented); adjustHijri({"1447-1": 1}) gives the official 1404/04/15 = 2025-07-06');
  ok(!errors.length, `no console errors (${errors.join(' | ') || 'none'})`);
  await ctx.close();
}

/* ---------------- components on the finance page */
{
  const { p, ctx, errors } = await open('finance');
  console.log('— components');
  // money input: Persian digits, live separators, caret kept, words
  await p.click('#fm-amount', { clickCount: 3 });
  await p.keyboard.type('۱۲۳۴۵۶۷');
  const mi = await p.evaluate(() => ({ v: document.querySelector('#fm-amount').value, h: document.querySelector('#fin-money input[type=hidden][name=amount]').value, w: document.querySelector('.ac-money__words').textContent }));
  ok(mi.v === '1,234,567' && mi.h === '1234567' && mi.w.startsWith('یک میلیون و دویست و سی و چهار هزار'), 'money input: Persian digits → "1,234,567", hidden raw value, words', mi);
  await p.keyboard.press('Home'); await p.keyboard.press('ArrowRight'); await p.keyboard.type('9');
  const caret = await p.evaluate(() => { const i = document.querySelector('#fm-amount'); return [i.value, i.selectionStart]; });
  eq(caret.join('|'), '19,234,567|2', 'money input: caret stays after the typed digit when separators move');
  await p.selectOption('#fin-money .ac-money__unit', 'IRR');
  eq(await p.evaluate(() => document.querySelector('#fm-amount').value), '192,345,670', 'unit picker Toman → Rial converts the amount (×10)');

  // Rial/Toman toggle re-renders every [data-ac-money] with a ticker
  const before = await p.evaluate(() => document.querySelector('.ac-kpi:nth-child(2) [data-ac-money]').textContent);
  await p.click('[data-ac~="money-unit"] [data-value="IRR"]');
  await p.waitForTimeout(600);
  const after = await p.evaluate(() => ({ kpi: document.querySelector('.ac-kpi:nth-child(2) [data-ac-money]').textContent, cell: document.querySelector('#fin-table [data-ac-money]').textContent, unit: AC.money.unit }));
  ok(before.includes('128,450,000') && after.kpi.includes('1,284,500,000') && after.kpi.includes('ریال') && after.cell.includes('ریال') && after.unit === 'IRR', 'ریال / تومان toggle updates KPIs and table money cells', { before, after });
  await p.click('[data-ac~="money-unit"] [data-value="IRT"]');

  // datepicker: three calendars, secondary date, holidays
  await p.click('#fin-dp .ac-input-group__btn');
  await p.waitForTimeout(250);
  const dp = await p.evaluate(() => { const pnl = document.querySelector('.ac-dp[data-state="open"]'); return { cals: [...pnl.querySelectorAll('[data-cal]')].map((b) => b.dataset.cal).join(), sub: pnl.querySelectorAll('.ac-dp__sub').length, wk: pnl.querySelectorAll('[data-weekend]').length }; });
  ok(dp.cals === 'persian,gregory,islamic' && dp.sub > 27 && dp.wk >= 4, 'datepicker: Jalali/Gregorian/Hijri switch, secondary dates, Fridays marked', dp);
  await p.click('.ac-dp[data-state="open"] [data-cal="islamic"]');
  eq(await p.evaluate(() => /[؀-ۿ]/.test(document.querySelector('.ac-dp[data-state="open"] .ac-dp__title').textContent) && document.querySelector('.ac-dp[data-state="open"] [data-cal="islamic"]').getAttribute('aria-pressed')), 'true', 'datepicker: switch to Hijri');
  await p.keyboard.press('Escape');

  // card flip
  const card = p.locator('#fin-gallery .ac-bcard').first();
  await card.click();
  eq(await card.getAttribute('aria-pressed'), 'true', 'bank card: click flips (aria-pressed)');
  ok(await card.evaluate((el) => el.hasAttribute('data-flipped')), 'bank card: data-flipped set');
  await card.press('Enter');
  ok(!(await card.evaluate((el) => el.hasAttribute('data-flipped'))), 'bank card: Enter flips back');
  const geo = await card.evaluate((el) => { const r = el.getBoundingClientRect(); return +(r.width / r.height).toFixed(3); });
  ok(Math.abs(geo - 1.586) < 0.01, 'ISO ID-1 aspect ratio 1.586', geo);

  // live card form morph
  const num = p.locator('#fc-number');
  await num.click(); await num.pressSequentially('603799');
  await p.waitForTimeout(500);
  const m1 = await p.evaluate(() => { const c = document.querySelector('#fin-live-card'); return { name: c.querySelector('.ac-bcard__name').textContent, region: c.dataset.region, net: c.dataset.network, badge: !!document.querySelector('.ac-cardnum__bank use[href="#bank-melli"]'), layers: c.querySelectorAll('.ac-bcard__front .ac-bcard__layer').length }; });
  ok(m1.name === 'بانک ملی ایران' && m1.region === 'ir' && m1.net === 'shetab' && m1.badge && m1.layers === 1, 'live form: BIN 603799 → Melli theme, logo badge, Shetab', m1);
  await num.fill(''); await num.pressSequentially('610433');
  await p.waitForTimeout(60);
  const mid = await p.evaluate(() => document.querySelectorAll('#fin-live-card .ac-bcard__front .ac-bcard__layer').length);
  await p.waitForTimeout(600);
  const m2 = await p.evaluate(() => { const c = document.querySelector('#fin-live-card'); return { name: c.querySelector('.ac-bcard__name').textContent, layers: c.querySelectorAll('.ac-bcard__front .ac-bcard__layer').length, color: c.querySelector('.ac-bcard__front .ac-bcard__layer').style.getPropertyValue('--_c1') }; });
  ok(m2.name === 'بانک ملت' && m2.layers === 1 && m2.color === '#c0122c' && mid >= 2, 'live form: retyped BIN morphs to Mellat (crossfade: old layers fade out → 1)', { ...m2, mid });
  await num.pressSequentially('1234567890');
  eq(await num.inputValue(), '6104 3312 3456 7890', 'live form: number grouped 4-4-4-4 (LTR)');
  await p.fill('#fc-holder', 'سارا محمدی');
  eq(await p.textContent('#fin-live-card .ac-bcard__holder b'), 'سارا محمدی', 'live form: holder mirrored on the card');
  await p.click('#fc-exp'); await p.keyboard.type('0611');
  eq(await p.inputValue('#fc-exp'), '06/11', 'live form: expiry auto slash');
  await p.click('#fc-cvv');
  ok(await p.evaluate(() => document.querySelector('#fin-live-card').hasAttribute('data-flipped')), 'live form: CVV2 focus flips the card to the back');
  await p.keyboard.type('123');
  eq(await p.textContent('#fin-live-card .ac-bcard__cvv b'), '123', 'live form: CVV2 shown on the signature panel');
  await p.click('#fc-holder');
  ok(!(await p.evaluate(() => document.querySelector('#fin-live-card').hasAttribute('data-flipped'))), 'live form: leaving CVV2 flips back');

  // Sheba input
  await p.click('#fs-iban'); await p.keyboard.type('820540102680020817909002');
  const sh = await p.evaluate(() => ({ v: document.querySelector('#fs-iban').value, st: document.querySelector('.ac-sheba__status').dataset.state, logo: !!document.querySelector('.ac-sheba__bank use[href="#bank-parsian"]'), hid: document.querySelector('#fin-sheba input[type=hidden]').value }));
  ok(sh.v === '8205 4010 2680 0208 1790 9002' && sh.st === 'valid' && sh.logo && sh.hid === 'IR820540102680020817909002', 'Sheba input: grouping, valid, Parsian logo, hidden IR value', sh);
  await p.keyboard.press('Backspace'); await p.keyboard.type('3');
  eq(await p.evaluate(() => document.querySelector('.ac-sheba__status').dataset.state), 'invalid', 'Sheba input: wrong check → invalid');

  // en + RTL isolation
  await p.evaluate(() => AC.i18n.set('en'));
  await p.waitForTimeout(400);
  const en = await p.evaluate(() => ({ kpi: document.querySelector('.ac-kpi:nth-child(2) [data-ac-money]').textContent, dir: document.querySelector('.ac-kpi:nth-child(2) [data-ac-money]').getAttribute('dir'), name: document.querySelector('#fin-gallery .ac-bcard .ac-bcard__name').textContent }));
  ok(en.kpi === '128,450,000 Toman' && en.dir === 'ltr' && en.name === 'Bank Melli Iran', 'English: amounts and bank names re-render', en);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  eq(overflow, 0, 'no horizontal overflow (desktop)');
  ok(!errors.length, `no console errors (${errors.join(' | ') || 'none'})`);
  await ctx.close();
}

/* ---------------- phone + manage page */
for (const page of ['finance', 'manage']) {
  const { p, ctx, errors } = await open(page, { width: 390, height: 844 });
  console.log(`— ${page} @390`);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
  eq(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, `${page}: no horizontal overflow on phone`);
  if (page === 'manage') {
    const a = await p.evaluate(() => document.querySelector('#mng-card .ac-bcard__name').textContent);
    await p.click('[data-pick="mellat"]'); await p.waitForTimeout(500);
    const b = await p.evaluate(() => ({ name: document.querySelector('#mng-card .ac-bcard__name').textContent, masked: document.querySelector('#mng-card .ac-bcard__number').textContent.includes('•') }));
    ok(a === 'بانک ملی ایران' && b.name === 'بانک ملت' && b.masked, 'manage: bank card component, chip switches bank, number masked', { a, b });
    await p.click('[data-act="show"]');
    ok(!(await p.evaluate(() => document.querySelector('#mng-card .ac-bcard__number').textContent.includes('•'))), 'manage: "show number" unmasks');
    await p.click('[data-act="flip"]');
    ok(await p.evaluate(() => document.querySelector('#mng-card').hasAttribute('data-flipped')), 'manage: flip action');
  }
  ok(!errors.length, `${page}: no console errors (${errors.join(' | ') || 'none'})`);
  await ctx.close();
}

await browser.close();
console.log(fails ? `\n${fails} failed` : '\nall passed');
process.exit(fails ? 1 : 0);
