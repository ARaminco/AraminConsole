#!/usr/bin/env node
/* Generates the token reference from src/css/tokens.css (single source of truth).
     docs/design-system/tokens.md   Persian token tables (light / dark / presets)
     dist/tokens.json               W3C-style design tokens ($value / $type)
   node scripts/tokens-doc.mjs      (also: npm run tokens — called from the build) */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(ROOT, 'src/css/tokens.css'), 'utf8').replace(/^﻿/, '');

/* ---- scan top-level blocks (comments skipped, @media bodies ignored) ---- */
function blocks(src) {
  const out = []; let i = 0, depth = 0, selStart = 0, bodyStart = 0, sel = '';
  while (i < src.length) {
    if (src.startsWith('/*', i)) { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; if (depth === 0) selStart = i; continue; }
    const c = src[i];
    if (c === '{') { if (depth === 0) { sel = src.slice(selStart, i).trim(); bodyStart = i + 1; } depth++; }
    else if (c === '}') { depth--; if (depth === 0) { out.push({ sel, body: src.slice(bodyStart, i) }); selStart = i + 1; } }
    i++;
  }
  return out;
}
function decls(body) {
  const m = new Map(); const notes = new Map();
  for (const x of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);[ \t]*(?:\/\*\s*(.*?)\s*\*\/)?/gs)) {
    m.set(x[1], x[2].replace(/\s+/g, ' ').trim()); if (x[3]) notes.set(x[1], x[3]);
  }
  return { m, notes };
}
const B = blocks(css).filter((b) => b.sel && !b.sel.startsWith('@'));
const find = (re) => B.find((b) => re.test(b.sel.replace(/\s+/g, ' ')));
const base = decls(find(/^:root$/).body);
const dark = decls(find(/^:root\[data-theme="dark"\]$/).body);
const airL = decls(find(/^:root:not\(\[data-accent\]\):not\(\[data-theme="dark"\]\)/).body);
const airD = decls(find(/^:root\[data-theme="dark"\]:not\(\[data-accent\]\)/).body);
const merge = (...ms) => new Map(ms.flatMap((m) => [...m]));
const light = merge(base.m, airL.m);                 // default theme = Air, light
const night = merge(base.m, dark.m, airD.m);         // Air, dark
const notes = merge(base.notes, dark.notes, airL.notes, airD.notes);
const presets = {};
for (const b of B) { const x = b.sel.match(/^:root(\[data-theme="dark"\])?\[data-accent="(\w+)"\]$/); if (x) { const [, d, n] = x; (presets[n] ||= { light: new Map(), dark: new Map() })[d ? 'dark' : 'light'] = decls(b.body).m; } }
const variant = (attr) => Object.fromEntries(B.map((b) => [b.sel.match(new RegExp(`^:root\\[data-${attr}="(\\w+)"\\]$`))?.[1], b]).filter(([k]) => k).map(([k, b]) => [k, decls(b.body).m]));
const density = variant('density'), radius = variant('radius');

/* ---- Persian roles ---- */
const ROLE = {
  accent: 'رنگ برند؛ فوکوس، سوییچ روشن، نمودار، دکمهٔ رنگی', 'accent-2': 'شریکِ گرادیان', 'accent-contrast': 'متن روی accent پر',
  highlight: 'تنها لکهٔ گرم (شمارندهٔ اعلان، نقطهٔ داک)', 'highlight-contrast': 'متن روی highlight',
  ink: 'جوهر: دکمهٔ اصلی و پیل فعال ناوبری', 'ink-hover': 'ink در hover', 'ink-contrast': 'متن روی ink',
  bg: 'بوم صفحه', 'bg-subtle': 'بومِ کمی تیره‌تر', 'surface-1': 'کارت‌ها و پیل‌ها', 'surface-2': 'پنل فرورفته، کاشی KPI', 'surface-3': 'ترک‌ها (track)',
  elevated: 'سطح بالاآمده (منو، پاپ‌اور)', hover: 'لایهٔ hover', active: 'لایهٔ فشرده', border: 'خط مویی', 'border-strong': 'مرز پررنگ‌تر',
  text: 'متن اصلی', 'text-soft': 'متن ثانویه', muted: 'متن کم‌رنگ (برچسب‌ها)', faint: 'تزئینی/غیرفعال؛ برای متنِ لازم کافی نیست', scrim: 'پس‌زمینهٔ تیرهٔ پنجره‌ها',
  'chrome-bg': 'پیل‌های شناور (نوار بالا، ریل، تب‌بار)', 'pill-bg': 'دکمهٔ پیلِ ثانویه و فیلد جستجو', 'pill-bg-hover': 'pill-bg در hover',
  success: 'موفقیت', 'success-soft': 'پس‌زمینهٔ نشان موفقیت', 'success-ink': 'متن موفقیت روی soft',
  warning: 'هشدار', 'warning-soft': 'پس‌زمینهٔ هشدار', 'warning-ink': 'متن هشدار روی soft',
  danger: 'خطا / حذف', 'danger-soft': 'پس‌زمینهٔ خطا', 'danger-ink': 'متن خطا روی soft',
  info: 'اطلاع', 'info-soft': 'پس‌زمینهٔ اطلاع', 'info-ink': 'متن اطلاع روی soft', 'neutral-soft': 'پس‌زمینهٔ خنثی', 'neutral-ink': 'متن خنثی',
  'chart-grid': 'خطوط شبکهٔ نمودار', 'glass-bg': 'شیشهٔ نیمه‌شفاف', 'glass-bg-strong': 'شیشهٔ کدرتر', 'glass-border': 'مرز شیشه', 'glass-blur': 'فیلتر محو شیشه',
  'shadow-xs': 'کمینه (کارت ساکن)', 'shadow-sm': 'کارت', 'shadow-md': 'hover کارت، منو', 'shadow-lg': 'پاپ‌اور', 'shadow-xl': 'مودال و شیت', 'shadow-glow': 'درخششِ رنگ برند', 'shadow-inset': 'برجستگی داخلی', 'shadow-chrome': 'پیل‌های شناور',
  'accent-hover': 'مشتق: accent در hover', 'accent-soft': 'مشتق: زمینهٔ ملایم accent', 'accent-soft-2': 'مشتق: زمینهٔ ملایم پررنگ‌تر', 'accent-ink': 'مشتق: accent خوانا برای متن', ring: 'مشتق: حلقهٔ فوکوس', focus: 'مشتق: box-shadow فوکوس', gradient: 'مشتق: گرادیان برند', aurora: 'مشتق: هالهٔ پس‌زمینه',
  font: 'قلم رابط', 'font-mono': 'قلم تک‌فاصله',
  'fs-2xs': 'ریزترین (نشان‌ها)', 'fs-xs': 'برچسب', 'fs-sm': 'کمکی', 'fs-md': 'متن بدنه', 'fs-lg': 'متن درشت', 'fs-xl': 'تیتر کارت', 'fs-2xl': 'تیتر بخش', 'fs-3xl': 'تیتر صفحه', 'fs-4xl': 'عدد بزرگ / قهرمان',
  'lh-tight': 'تیترها و اعداد', 'lh-snug': 'عنوان چندخطی', 'lh-normal': 'متن بدنه',
  'z-base': 'محتوا', 'z-sticky': 'سرستون چسبان', 'z-rail': 'ریل', 'z-appbar': 'نوار بالا', 'z-tabbar': 'تب‌بار', 'z-dropdown': 'منو', 'z-drawer': 'کشو', 'z-sheet': 'شیت پایین', 'z-modal': 'مودال', 'z-toast': 'اعلان گذرا', 'z-palette': 'پالت فرمان', 'z-tooltip': 'راهنمای شناور',
  'control-h': 'ارتفاع دکمه و ورودی', 'control-h-sm': 'کنترل کوچک', 'control-h-lg': 'کنترل بزرگ', 'control-px': 'پدینگ افقی کنترل', 'card-pad': 'پدینگ کارت', 'row-h': 'ارتفاع ردیف جدول/لیست', gap: 'فاصلهٔ شبکه', touch: 'کمینهٔ هدف لمسی',
  'appbar-h': 'ارتفاع ردیف بالا', 'tabbar-h': 'ارتفاع تب‌بار', 'rail-w': 'عرض ریل', 'rail-w-collapsed': 'عرض ریل جمع‌شده', 'flyout-w': 'عرض فلای‌اوت', 'pill-h': 'ارتفاع پیل‌های بالا', 'content-max': 'بیشینهٔ عرض محتوا', 'content-pad': 'پدینگ محتوا',
  'safe-top': 'ناحیهٔ امن بالا', 'safe-bottom': 'ناحیهٔ امن پایین', 'safe-start': 'ناحیهٔ امن ابتدا', 'safe-end': 'ناحیهٔ امن انتها',
  'r-xs': 'چیپ کوچک', 'r-sm': 'ورودی‌های ریز', 'r-md': 'دکمه و ورودی', 'r-lg': 'پنل‌های داخلی', 'r-xl': 'کارت', 'r-2xl': 'فلای‌اوت و شیت', 'r-pill': 'پیل کامل',
  ease: 'پیش‌فرض UI (ورود/خروج)', 'ease-out': 'آشکارشدن، بلند شدن', 'ease-in-out': 'حرکت روی صفحه', 'ease-move': 'اسلاید پنل', 'ease-drawer': 'شیت و کشو', 'ease-hover': 'تغییر رنگ', 'ease-in': 'فقط سازگاری؛ استفاده نکنید', 'ease-spring': 'فنر تقریبی با بازگشت کم',
  spring: 'فنر جمع‌وجور (پیل، شاخص)', 'spring-dur': 'مدت spring', 'spring-bounce': 'فنر بازیگوش (آیکون، نشان)، کم‌استفاده', 'spring-bounce-dur': 'مدت spring-bounce',
  'dur-0': 'بازخورد فشردن', 'dur-1': 'hover، تولتیپ', 'dur-2': 'دراپ‌داون، پاپ‌اور', 'dur-3': 'تب و پنل', 'dur-4': 'مودال و صفحه', 'dur-sheet': 'شیت و کشو', 'dur-exit': 'خروج (سریع‌تر از ورود)', stagger: 'تأخیر بین هم‌شیفت‌ها', press: 'مقیاس هنگام فشردن', 'press-sm': 'دکمه‌های گردِ کوچک', lift: 'بلند شدن کارت', dir: 'ضریب جهت: 1 چپ‌به‌راست، -1 راست‌به‌چپ',
};
const role = (n) => ROLE[n.replace(/^--ac-/, '')] || (notes.get(n) || '').replace(/\|/g, '/');
const cell = (v) => '`' + String(v).replace(/\|/g, '\\|') + '`';
const names = (re) => [...base.m.keys()].filter((k) => re.test(k.slice(5)));
const COLOR = /^(accent|highlight|ink|bg|surface|elevated|hover$|active$|border|text|muted|faint|scrim|chrome-bg|pill-bg|success|warning|danger|info|neutral|chart|glass|rail-bg)/;
function table(title, list, cols) {
  const head = `| توکن | ${cols.map((c) => c[0]).join(' | ')} | کاربرد |\n|---|${cols.map(() => '---').join('|')}|---|`;
  return `### ${title}\n\n${head}\n${list.map((n) => `| \`${n}\` | ${cols.map((c) => cell(c[1](n) ?? '—')).join(' | ')} | ${role(n)} |`).join('\n')}\n`;
}
const single = (title, list) => table(title, list, [['مقدار', (n) => base.m.get(n)]]);

const colorKeys = (m) => [...m.keys()].filter((k) => COLOR.test(k.slice(5)) && !k.startsWith('--ac-shadow'));
const allColor = [...new Set([...colorKeys(base.m), ...colorKeys(dark.m), ...colorKeys(airL.m), ...colorKeys(airD.m)])];
const derived = ['--ac-accent-hover', '--ac-accent-soft', '--ac-accent-soft-2', '--ac-accent-ink', '--ac-ring', '--ac-focus', '--ac-gradient', '--ac-aurora'];
const colorOnly = allColor.filter((n) => !derived.includes(n));
const groupsC = [
  ['برند و جوهر', /^(accent|highlight|ink)/], ['بوم و سطوح', /^(bg|surface|elevated|chrome-bg|pill-bg)/], ['تعامل و مرز', /^(hover|active|border|scrim)/],
  ['متن', /^(text|muted|faint)/], ['وضعیت', /^(success|warning|danger|info|neutral)/], ['نمودار', /^chart/], ['شیشه', /^glass/],
];
const used = new Set();
const colorTables = groupsC.map(([t, re]) => { const l = colorOnly.filter((n) => re.test(n.slice(5)) && !used.has(n)); l.forEach((n) => used.add(n)); return l.length ? table(t, l, [['روشن (Air)', (n) => light.get(n)], ['تیره (Air)', (n) => night.get(n)]]) : ''; }).join('\n');
const shadows = [...base.m.keys()].filter((k) => k.startsWith('--ac-shadow'));
const pr = Object.entries(presets);
const darkAccent = (n, p) => p.dark.get('--ac-accent') || (n === 'air' ? airD.m.get('--ac-accent') : p.light.get('--ac-accent'));
const presetTable = `| پریست | accent روشن | accent تیره | accent-2 |\n|---|---|---|---|\n` + pr.map(([n, p]) => `| \`${n}\`${n === 'air' ? ' (پیش‌فرض)' : ''} | ${cell(p.light.get('--ac-accent') || '—')} | ${cell(darkAccent(n, p) || '—')} | ${cell(p.light.get('--ac-accent-2') || '—')} |`).join('\n');
const variantTable = (title, v, keys) => `### ${title}\n\n| توکن | پیش‌فرض | ${Object.keys(v).map((k) => '`' + k + '`').join(' | ')} |\n|---|---|${Object.keys(v).map(() => '---').join('|')}|\n` + keys.map((k) => `| \`${k}\` | ${cell(base.m.get(k) ?? '—')} | ${Object.keys(v).map((x) => cell(v[x].get(k) ?? '—')).join(' | ')} |`).join('\n') + '\n';
const dKeys = [...new Set(Object.values(density).flatMap((m) => [...m.keys()]))], rKeys = [...new Set(Object.values(radius).flatMap((m) => [...m.keys()]))];

const md = `# مرجع توکن‌ها

> این فایل را اسکریپت \`scripts/tokens-doc.mjs\` از \`src/css/tokens.css\` می‌سازد (\`npm run tokens\`). دستی ویرایشش نکنید. خروجی ماشین‌خوان: \`dist/tokens.json\`.

همهٔ توکن‌ها پیشوند \`--ac-\` دارند. تم پیش‌فرض **Air** است؛ ستون‌های «روشن» و «تیره» مقدار نهایی بعد از اعمال تم Air هستند. جهت‌دهی با صفت‌های روی \`<html>\`: \`data-theme\` (light | dark)، \`data-accent\`، \`data-density\`، \`data-radius\`.

## رنگ

${colorTables}
### سایه‌ها

| توکن | روشن | تیره | کاربرد |
|---|---|---|---|
${shadows.map((n) => `| \`${n}\` | ${cell(light.get(n))} | ${cell(night.get(n))} | ${role(n)} |`).join('\n')}

### توکن‌های مشتق

این‌ها را override نکنید؛ از accent و تم پیروی می‌کنند.

| توکن | تعریف | کاربرد |
|---|---|---|
${derived.map((n) => `| \`${n}\` | ${cell(base.m.get(n))} | ${role(n)} |`).join('\n')}

### پریست‌های accent

${presetTable}

## تایپوگرافی

${single('خانواده و اندازه', names(/^(font|fs-)/))}
${single('ارتفاع خط و وزن', names(/^(lh-|fw-)/))}
## فاصله‌گذاری

${single('مقیاس فاصله (گام 0.25rem)', names(/^s-/))}
${single('اندازه‌های وابسته به تراکم', names(/^(control-|card-pad|row-h|gap$|touch)/))}
${variantTable('تراکم (data-density)', density, dKeys)}
## گوشه‌ها

${single('شعاع (پیش‌فرض)', names(/^r-/))}
${variantTable('نوع شعاع (data-radius)', radius, rKeys)}
## حرکت

${single('منحنی‌ها', names(/^(ease|spring)/))}
${single('مدت‌ها و ابزار حرکتی', names(/^(dur-|stagger|press|lift|dir)/))}
## لایه‌ها (z-index)

${single('ترتیب لایه‌ها', names(/^z-/))}
## چیدمان

${single('ابعاد چیدمان', names(/^(appbar-h|tabbar-h|rail-w|flyout-w|pill-h|content-|safe-)/))}
`;
mkdirSync(join(ROOT, 'docs/design-system'), { recursive: true });
writeFileSync(join(ROOT, 'docs/design-system/tokens.md'), md);

/* ---- tokens.json (W3C design tokens format) ---- */
const SIZE = /^(fs|s|r|control|card-pad|row-h|gap|touch|appbar|tabbar|rail|flyout|pill-h|content)/;
const type = (n, v) => {
  if (/^(#|rgba?\()/.test(v)) return 'color';
  if (/^cubic-bezier/.test(v)) return 'cubicBezier';
  if (/^-?[\d.]+(rem|px)$/.test(v) || (SIZE.test(n) && !/^(font)/.test(n) && /^(0|clamp|env)/.test(v))) return 'dimension';
  if (/^[\d.]+ms$/.test(v)) return 'duration';
  if (/^font/.test(n)) return 'fontFamily';
  if (/^fw-/.test(n)) return 'fontWeight';
  if (/^(lh-|z-)/.test(n) || /^[\d.]+$/.test(v)) return 'number';
  if (/^shadow/.test(n)) return 'shadow';
  return 'other';
};
const val = (t, v) => (t === 'cubicBezier' ? v.match(/-?[\d.]+/g).map(Number) : t === 'number' || t === 'fontWeight' ? Number(v) : v);
const tok = (n, v, desc) => { const t = type(n, v); return { $value: val(t, v), $type: t, ...(desc ? { $description: desc } : {}) }; };
const json = { $description: `AraminConsole design tokens v${JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version}, generated from src/css/tokens.css. Colour groups hold the Air theme (default); accentPreset lists accents only. CSS variable = --ac-<name>.` };
const put = (grp, filter) => { for (const [k, v] of base.m) { const n = k.slice(5); if (filter(n)) (json[grp] ||= {})[n] = tok(n, v, notes.get(k)); } };
put('font', (n) => /^font/.test(n)); put('fontSize', (n) => /^fs-/.test(n)); put('lineHeight', (n) => /^lh-/.test(n)); put('fontWeight', (n) => /^fw-/.test(n));
put('space', (n) => /^s-/.test(n)); put('radius', (n) => /^r-/.test(n));
put('size', (n) => /^(control|card-pad|row-h|gap$|touch|appbar|tabbar|rail|flyout|pill-h|content)/.test(n));
put('easing', (n) => /^ease/.test(n)); put('duration', (n) => /^(dur-|spring-dur|spring-bounce-dur|stagger)/.test(n)); put('zIndex', (n) => /^z-/.test(n));
json.color = { light: {}, dark: {} }; json.shadow = { light: {}, dark: {} };
for (const n of colorOnly) for (const [mode, m] of [['light', light], ['dark', night]]) { const v = m.get(n); if (v != null) json.color[mode][n.slice(5)] = tok(n.slice(5), v, notes.get(n)); }
for (const n of shadows) for (const [mode, m] of [['light', light], ['dark', night]]) json.shadow[mode][n.slice(5)] = { $value: m.get(n), $type: 'shadow' };
json.accentPreset = Object.fromEntries(pr.map(([n, p]) => [n, { light: { $value: p.light.get('--ac-accent') || light.get('--ac-accent'), $type: 'color' }, dark: { $value: darkAccent(n, p), $type: 'color' } }]));
mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(join(ROOT, 'dist/tokens.json'), JSON.stringify(json, null, 2) + '\n');
console.log(`tokens: ${base.m.size} base · ${colorOnly.length} colours · ${pr.length} presets → docs/design-system/tokens.md, dist/tokens.json`);
