#!/usr/bin/env node
/* RTL / LTR correctness (docs/rtl.md)
   1. Static: scans src/**\/*.css for physical direction properties that should be logical
      (margin/padding/border-left|right, left:/right:, text-align:left|right, float, clear,
      border-*-left|right-radius, translateX(…) without --ac-dir). A line may opt out with a
      comment containing "rtl-ok: <reason>" (JS-measured geometry, glyphs that never mirror…).
   2. Rendered (dev server must run; skip with --static): opens pages in fa (rtl) and en (ltr) and
      asserts mirrored geometry — dock rail side, top-nav order, page title edge, dropdown anchor
      and submenu side, flyout side, language picker, toasts corner, phone tab bar order — plus the
      sliding hover highlight landing exactly on the hovered row in every list that uses it,
      and no horizontal page overflow on phones.
   node tests/rtl.mjs [--base=http://localhost:5178] [--static] */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const BASE = (args.find((a) => a.startsWith('--base=')) || '').slice(7) || 'http://localhost:5178';
let pass = 0; let fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { fail++; console.log(`  ✗ ${name} ${extra}`); } };

/* ------------------------------------------------------------------ 1. static scan */
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.css')) files.push(p); } })(join(ROOT, 'src', 'css'));
const RULES = [
  [/(?:^|[\s;{])(?:margin|padding)-(?:left|right)\s*:/, 'margin/padding-left|right → -inline-start|end'],
  [/(?:^|[\s;{])border-(?:left|right)(?:-(?:width|style|color))?\s*:/, 'border-left|right → border-inline-start|end'],
  [/(?:^|[\s;{])border-(?:top|bottom)-(?:left|right)-radius\s*:/, 'border-*-left|right-radius → border-start-start-radius…'],
  [/(?:^|[\s;{])(?:left|right)\s*:/, 'left:/right: → inset-inline-start|end'],
  [/text-align\s*:\s*(?:left|right)\b/, 'text-align:left|right → start|end'],
  [/(?:^|[\s;{])(?:float|clear)\s*:\s*(?:left|right)\b/, 'float/clear left|right → inline-start|end'],
];
const offenders = [];
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  let inComment = false;
  lines.forEach((raw, i) => {
    let line = raw;
    if (inComment) { const e = line.indexOf('*/'); if (e < 0) return; line = line.slice(e + 2); inComment = false; }
    if (/rtl-ok/.test(raw)) return;
    line = line.replace(/\/\*[\s\S]*?\*\//g, '');
    const s = line.indexOf('/*'); if (s >= 0) { line = line.slice(0, s); inComment = true; }
    line = line.replace(/url\([^)]*\)/g, '').replace(/"[^"]*"|'[^']*'/g, '');
    // translateX with a literal non-zero distance must be scaled by --ac-dir. Centring (±50%) and
    // var-only offsets (JS-measured, or vars that already carry --ac-dir) are fine.
    for (const m of line.matchAll(/translateX\(((?:[^()]|\((?:[^()]|\([^()]*\))*\))*)\)/g)) {
      const arg = m[1];
      if (/--ac-dir/.test(arg) || /^\s*-?50%\s*$/.test(arg)) continue;
      if (/(?<![\w.-])-?(?:[1-9]\d*(?:\.\d+)?|0?\.\d*[1-9]\d*)(?:px|%|rem|em|vw)/.test(arg)) {
        offenders.push(`${relative(ROOT, f).replace(/\\/g, '/')}:${i + 1}  translateX(±n) without --ac-dir\n      ${raw.trim().slice(0, 140)}`);
      }
    }
    for (const [re, why] of RULES) {
      if (!re.test(line)) continue;
      offenders.push(`${relative(ROOT, f).replace(/\\/g, '/')}:${i + 1}  ${why}\n      ${raw.trim().slice(0, 140)}`);
    }
  });
}
console.log(`static scan: ${files.length} css files`);
ok(offenders.length === 0, 'no physical direction properties outside rtl-ok allow-list', offenders.length ? `(${offenders.length})\n    ${offenders.join('\n    ')}` : '');

/* ------------------------------------------------------------------ 2. rendered geometry */
if (!args.includes('--static')) {
  const { chromium } = await import('playwright-core');
  const pw = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  const exe = existsSync(pw) ? readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()
    .flatMap((d) => ['chrome-win64', 'chrome-win'].map((s) => join(pw, d, s, 'chrome.exe'))).find(existsSync) : undefined;
  const browser = await chromium.launch({ executablePath: exe });
  const errors = [];
  async function open(lang, viewport = { width: 1440, height: 900 }, page = 'overlays', mobile = false) {
    const ctx = await browser.newContext({ viewport, ...(mobile ? { deviceScaleFactor: 2, hasTouch: true, isMobile: true } : {}) });
    await ctx.addInitScript((l) => { localStorage.setItem('ac:lang', l); localStorage.setItem('ac:theme', 'light'); }, lang);
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(`${lang}: ${e.message}`));
    await p.goto(`${BASE}/demo/#/${page}`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(900);
    return { ctx, p };
  }
  const rect = (p, sel) => p.evaluate((s) => { const r = document.querySelector(s)?.getBoundingClientRect(); return r && { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height, cx: r.left + r.width / 2 }; }, sel);
  const geo = {};
  for (const lang of ['fa', 'en']) {
    console.log(`\n${lang} (${lang === 'fa' ? 'rtl' : 'ltr'}) — desktop`);
    const { ctx, p } = await open(lang);
    const g = {};
    g.dir = await p.evaluate(() => document.documentElement.dir);
    g.dock = await rect(p, '.ac-dock');
    g.title = await rect(p, '.ac-page-head__title');
    g.nav = await p.evaluate(() => [...document.querySelectorAll('.ac-topnav__link')].map((a) => a.getBoundingClientRect().left));
    // dropdown + submenu
    await p.evaluate(() => document.querySelector('[data-ac-open="#ov-menu"]').scrollIntoView({ block: 'center' }));
    await p.click('[data-ac-open="#ov-menu"]'); await p.waitForTimeout(350);
    g.trigger = await rect(p, '[data-ac-open="#ov-menu"]');
    g.menu = await rect(p, '#ov-menu');
    const share = p.locator('#ov-menu > [aria-haspopup="menu"]').first();
    if (await share.count()) { await share.hover(); await p.waitForTimeout(450); g.sub = await p.evaluate(() => { const s = document.querySelector('#ov-menu [aria-haspopup="menu"] + .ac-menu, .ac-menu .ac-menu[data-state="open"]'); const r = s?.getBoundingClientRect(); return r && { l: r.left, r: r.right }; }); }
    // sliding highlight lands on the hovered row
    const items = p.locator('#ov-menu > .ac-menu__item:not([aria-haspopup])');
    const ir = await items.nth(1).boundingBox();
    await p.mouse.move(ir.x + ir.width / 2, ir.y + ir.height / 2); await p.waitForTimeout(450);
    const hl = await rect(p, '#ov-menu > .ac-hl');
    ok(hl && Math.abs(hl.l - ir.x) < 1.5 && Math.abs(hl.t - ir.y) < 1.5 && Math.abs(hl.w - ir.width) < 1.5, `${lang}: menu highlight sits exactly on the hovered row`, JSON.stringify({ hl, ir }));
    await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
    // flyout from the dock
    await p.click('.ac-dock__btn[data-ac-rail-group="pages"]'); await p.waitForTimeout(450);
    g.flyout = await rect(p, '.ac-rail');
    const link = p.locator('.ac-rail__group:not([data-off]) .ac-rail__link:not([aria-current])').nth(1);
    const lr = await link.boundingBox();
    await p.mouse.move(lr.x + lr.width / 2, lr.y + lr.height / 2); await p.waitForTimeout(450);
    const rhl = await rect(p, '.ac-rail__nav > .ac-hl');
    ok(rhl && Math.abs(rhl.l - lr.x) < 1.5 && Math.abs(rhl.t - lr.y) < 1.5, `${lang}: rail highlight sits exactly on the hovered link`, JSON.stringify({ rhl, lr }));
    await p.mouse.click(720, 880); await p.waitForTimeout(250);
    // language picker
    await p.click('[data-ac~="langpicker"]'); await p.waitForTimeout(400);
    g.lpTrigger = await rect(p, '[data-ac~="langpicker"]');
    g.lp = await rect(p, '.ac-lp--pop');
    g.lpRows = await p.evaluate(() => [...document.querySelectorAll('.ac-lp__item')].map((it) => { const b = it.querySelector('.ac-lp__badge').getBoundingClientRect(); const c = it.querySelector('.ac-lp__check').getBoundingClientRect(); return [b.left, c.left]; }));
    await p.keyboard.press('Escape');
    // command palette: ONE indicator, on the active row, for hover and arrow keys
    await p.keyboard.press('Control+k'); await p.waitForTimeout(450);
    const prow = await p.locator('.ac-palette__item').nth(3).boundingBox();
    await p.mouse.move(prow.x + prow.width / 2, prow.y + prow.height / 2); await p.waitForTimeout(400);
    for (const step of ['hover', 'keys']) {
      if (step === 'keys') { await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(300); }
      const r = await p.evaluate(() => {
        const hl = document.querySelector('.ac-palette__list > .ac-hl')?.getBoundingClientRect();
        const sel = document.querySelector('.ac-palette__item[aria-selected="true"]');
        const s = sel?.getBoundingClientRect();
        const painted = [...document.querySelectorAll('.ac-palette__item')].filter((n) => getComputedStyle(n).backgroundColor !== 'rgba(0, 0, 0, 0)').length;
        return { hl: hl && [hl.left, hl.top, hl.width, hl.height], s: s && [s.left, s.top, s.width, s.height], painted };
      });
      ok(r.hl && r.s && r.hl.every((v, i) => Math.abs(v - r.s[i]) < 1.5) && r.painted === 0, `${lang}: palette (${step}) shows one indicator, exactly on the active row`, JSON.stringify(r));
    }
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    // toasts
    await p.evaluate(() => AC.toast({ title: 'x', duration: 4000 })); await p.waitForTimeout(500);
    g.toast = await rect(p, '.ac-toast');
    geo[lang] = g;
    await ctx.close();
  }
  const W = 1440; const fa = geo.fa; const en = geo.en;
  console.log('\nmirroring');
  ok(fa.dir === 'rtl' && en.dir === 'ltr', 'document direction follows the language');
  ok(fa.dock.l > W / 2 && en.dock.r < W / 2, 'dock rail: right edge in fa, left edge in en', JSON.stringify([fa.dock, en.dock]));
  ok(Math.abs((W - fa.dock.r) - en.dock.l) < 2, 'dock rail: same inset from its edge in both directions');
  ok(fa.nav.every((x, i, a) => i === 0 || x < a[i - 1]) && en.nav.every((x, i, a) => i === 0 || x > a[i - 1]), 'top nav order runs right→left in fa, left→right in en');
  ok(fa.title.r > W - 200 && en.title.l < 200, 'page title on the start edge');
  ok(Math.abs(fa.menu.r - fa.trigger.r) < 2 && Math.abs(en.menu.l - en.trigger.l) < 2, 'dropdown aligns to the trigger start edge (bottom-start)', JSON.stringify([fa.menu, fa.trigger, en.menu, en.trigger]));
  if (fa.sub && en.sub) ok(fa.sub.r <= fa.menu.l + 8 && en.sub.l >= en.menu.r - 8, 'submenu opens toward the inline end', JSON.stringify([fa.sub, fa.menu, en.sub, en.menu]));
  ok(fa.flyout.r <= fa.dock.l + 2 && en.flyout.l >= en.dock.r - 2, 'dock flyout opens beside the dock toward the content');
  ok(Math.abs(fa.lp.l - fa.lpTrigger.l) < 2 && Math.abs(en.lp.r - en.lpTrigger.r) < 2, 'language picker anchors to the trigger end edge (bottom-end)', JSON.stringify([fa.lp, fa.lpTrigger, en.lp, en.lpTrigger]));
  ok(fa.lpRows.every(([b, c]) => b > c) && en.lpRows.every(([b, c]) => b < c), 'language rows: badge at start, check at end, consistent per UI direction');
  ok(fa.toast.l < W / 2 && en.toast.r > W / 2, 'toasts sit at the inline-end corner');

  // phone
  for (const lang of ['fa', 'en']) {
    console.log(`\n${lang} — phone`);
    const { ctx, p } = await open(lang, { width: 390, height: 844 }, 'dashboard', true);
    const items = await p.evaluate(() => [...document.querySelectorAll('.ac-tabbar > .ac-tabbar__item')].map((a) => a.getBoundingClientRect().left));
    ok(lang === 'fa' ? items.every((x, i, a) => i === 0 || x < a[i - 1]) : items.every((x, i, a) => i === 0 || x > a[i - 1]), `${lang}: tab bar order follows the direction`);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(ov <= 0, `${lang}: no horizontal overflow at 390px`, `${ov}px`);
    const tb = await rect(p, '.ac-tabbar');
    ok(tb && tb.b <= 844 && tb.l >= 0 && tb.r <= 390, `${lang}: tab bar fully on screen`, JSON.stringify(tb));
    await ctx.close();
  }
  // live switch: fa → en relayouts cleanly (dock jumps sides, nav pill re-centres, no overflow)
  {
    console.log('\nlive switch fa → en');
    const { ctx, p } = await open('fa', undefined, 'dashboard');
    await p.evaluate(() => AC.i18n.set('en'));
    await p.waitForTimeout(900);
    const d = await rect(p, '.ac-dock'); const ind = await rect(p, '.ac-topnav__ind'); const cur = await rect(p, '.ac-topnav__link[aria-current="page"]');
    ok(d.r < 720, 'dock moved to the left edge after switching to en');
    ok(ind && cur && Math.abs(ind.l - cur.l) < 2 && Math.abs(ind.w - cur.w) < 2, 'nav pill re-seated on the current link after the switch', JSON.stringify([ind, cur]));
    await ctx.close();
  }
  await browser.close();
  ok(!errors.length, 'no page errors', errors.join(' | '));
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
