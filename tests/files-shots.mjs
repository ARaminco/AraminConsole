#!/usr/bin/env node
/* Screenshots of the files module in every view and overlay (dev server must be running).
   node tests/files-shots.mjs [--base=http://localhost:5178] [--only=icons,list] [--sizes=1440x900,820x1180,390x844] [--themes=light,dark] [--langs=fa,en]
   Writes tests/screens/files-<state>-<w>x<h>-<theme>-<lang>.png; prints console errors and horizontal overflow. */
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const findChromium = () => { const b = join(process.env.LOCALAPPDATA || '', 'ms-playwright'); return readdirSync(b).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse().flatMap((d) => ['chrome-win64', 'chrome-win'].map((x) => join(b, d, x, 'chrome.exe'))).find(existsSync); };
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'screens'); mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const opt = (n, d) => (args.find((a) => a.startsWith(`--${n}=`)) || '').split('=')[1] || d;
const BASE = opt('base', 'http://localhost:5178');
const sizes = opt('sizes', '1440x900,820x1180,390x844').split(',').map((s) => s.split('x').map(Number));
const themes = opt('themes', 'light,dark').split(',');
const langs = opt('langs', 'fa,en').split(',');
const only = opt('only', '');
const STATES = {
  icons: async (p) => { await view(p, 'icons'); await p.evaluate(() => window.__files.go('root')); await p.waitForTimeout(900); },
  list: async (p) => { await view(p, 'list'); await p.evaluate(() => window.__files.go('contracts')); await p.waitForTimeout(700); await p.evaluate(() => window.__files.select(['lease'])); await p.waitForTimeout(500); },
  columns: async (p) => { await view(p, 'columns'); await p.evaluate(() => window.__files.go('contracts')); await p.waitForTimeout(600); await p.click('.ac-fm-crow[data-id="lease"]'); await p.waitForTimeout(1200); },
  gallery: async (p) => { await view(p, 'gallery'); await p.evaluate(() => window.__files.go('photos')); await p.waitForTimeout(1400); },
  quicklook: async (p) => { await view(p, 'icons'); await p.evaluate(() => window.__files.go('photos')); await p.waitForTimeout(800); await p.evaluate(() => window.__files.quickLook('p1')); await p.waitForTimeout(1100); },
  info: async (p) => { await view(p, 'list'); await p.evaluate(() => window.__files.go('contracts')); await p.waitForTimeout(600); await p.evaluate(() => { window.__files.select(['lease']); window.__files.info(true); }); await p.waitForTimeout(1200); },
  preview: async (p) => { await view(p, 'icons'); await p.evaluate(() => window.__files.go('finance')); await p.waitForTimeout(600); await p.evaluate(() => { window.__files.state.preview = false; }); const b = await p.$('[data-act="preview"]'); if (await b?.isVisible()) await b.click(); await p.evaluate(() => window.__files.select(['tx'])); await p.waitForTimeout(1200); },
  context: async (p) => { await view(p, p.viewportSize().width < 640 ? 'list' : 'icons'); await p.evaluate(() => window.__files.go('contracts')); await p.waitForTimeout(700); const r = await p.evaluate(() => { const n = document.querySelector('[data-id="lease"]').getBoundingClientRect(); return { x: n.left + n.width / 2, y: n.top + 30 }; }); if (p.viewportSize().width < 640) { await p.evaluate(() => window.__files.select(['lease'])); await p.click('[data-id="lease"] [data-act="rowmore"]'); } else await p.mouse.click(r.x, r.y, { button: 'right' }); await p.waitForTimeout(600); },
  upload: async (p) => {
    await view(p, 'icons'); await p.evaluate(() => window.__files.go('finance')); await p.waitForTimeout(500);
    await p.evaluate(() => { const mk = (n, s, type = 'application/pdf') => new File([new Uint8Array(s)], n, { type }); window.__files.upload([mk('گزارش حسابرسی ۱۴۰۵.pdf', 9e6), mk('Scan 0042.jpg', 6e6, 'image/jpeg'), mk('backup-corrupt.zip', 4e6, 'application/zip'), mk('صورت‌حساب آبان.xlsx', 12e6, 'application/vnd.ms-excel')]); });
    await p.waitForTimeout(1500); await p.click('.ac-fm-job[data-state="uploading"] [data-job-act="pause"]').catch(() => {}); await p.waitForTimeout(900);
  },
  browse: async (p) => { await p.evaluate(() => window.__files.go('@browse')); await p.waitForTimeout(700); },
  select: async (p) => { await view(p, 'list'); await p.evaluate(() => window.__files.go('photos')); await p.waitForTimeout(600); await p.evaluate(() => { window.__files.state.selecting = true; window.__files.select(['p1', 'p3']); }); await p.waitForTimeout(700); },
};
async function view(p, v) { await p.evaluate((x) => window.__files.setView(x, { flip: false }), v); await p.waitForTimeout(200); }

const browser = await chromium.launch({ executablePath: findChromium() });
let problems = 0;
for (const [w, h] of sizes) for (const theme of themes) for (const lang of langs) {
  const phone = w < 640;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: phone ? 2 : 1, hasTouch: w < 1024, isMobile: phone });
  await ctx.addInitScript(([t, l]) => { localStorage.setItem('ac:theme', t); localStorage.setItem('ac:lang', l); localStorage.removeItem('ac:files:demo'); }, [theme, lang]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await p.goto(`${BASE}/demo/#/files`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__files?.state?.loc, null, { timeout: 15000 });
  await p.waitForTimeout(600);
  for (const [name, fn] of Object.entries(STATES)) {
    if (only && !only.split(',').includes(name)) continue;
    if (name === 'browse' && !phone) continue;
    if (name === 'select' && !phone) continue;
    if (name === 'columns' && phone) continue;
    if (name === 'preview' && w < 1200) continue;
    try { await fn(p); } catch (e) { errors.push(`${name}: ${e.message.split('\n')[0]}`); }
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await p.screenshot({ path: join(OUT, `files-${name}-${w}x${h}-${theme}-${lang}.png`) });
    if (overflow > 0) errors.push(`${name}: overflow ${overflow}px`);
    await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
    await p.evaluate(() => { document.querySelector('.ac-fm-ql [data-ql="close"]')?.click(); window.__files.info?.(false); AC.menu?.close?.(); document.querySelectorAll('.ac-fm-up [data-job-act="cancel"]').forEach((b) => b.click()); const c = document.querySelector('.ac-fm-up [data-up="close"]'); if (c && !c.hidden) c.click(); window.__files.state.selecting = false; window.__files.state.preview = false; });
    await p.waitForTimeout(450);
  }
  const bad = errors.length; problems += bad ? 1 : 0;
  console.log(`${bad ? '✗' : '✓'} ${w}x${h} ${theme} ${lang}${bad ? `\n   ${errors.join('\n   ')}` : ''}`);
  await ctx.close();
}
await browser.close();
process.exit(problems ? 1 : 0);
