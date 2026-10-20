#!/usr/bin/env node
/* Screenshot + smoke helper (dev server must be running: npm run serve).
   node tests/shots.mjs [page=dashboard] [--sizes=390x844,1440x900] [--themes=light,dark] [--langs=fa,en] [--full]
   Writes tests/screens/<page>-<w>x<h>-<theme>-<lang>.png and prints console errors + horizontal overflow. */
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'screens');
mkdirSync(OUT, { recursive: true });

export function findChromium() {
  const base = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(base)) return undefined;
  const dirs = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) for (const sub of ['chrome-win64', 'chrome-win']) {
    const exe = join(base, d, sub, 'chrome.exe');
    if (existsSync(exe)) return exe;
  }
  return undefined;
}

const args = process.argv.slice(2);
const opt = (name, def) => (args.find((a) => a.startsWith(`--${name}=`)) || '').split('=')[1] || def;
const page = args.find((a) => !a.startsWith('--')) || 'dashboard';
const sizes = opt('sizes', '390x844,1440x900').split(',').map((s) => s.split('x').map(Number));
const themes = opt('themes', 'light,dark').split(',');
const langs = opt('langs', 'fa,en').split(',');
const base = opt('base', 'http://localhost:5178');
const full = args.includes('--full');

const browser = await chromium.launch({ executablePath: findChromium() });
let problems = 0;
for (const [w, h] of sizes) for (const theme of themes) for (const lang of langs) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 800 ? 2 : 1, hasTouch: w < 800, isMobile: w < 800 });
  await ctx.addInitScript(([t, l]) => { localStorage.setItem('ac:theme', t); localStorage.setItem('ac:lang', l); }, [theme, lang]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  p.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));
  await p.goto(`${base}/demo/#/${page}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1600);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const file = join(OUT, `${page}-${w}x${h}-${theme}-${lang}.png`);
  if (full) { await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); }); await p.waitForTimeout(1000); } // reveal in-view animations
  await p.screenshot({ path: file, fullPage: full });
  const bad = errors.length || overflow > 0;
  problems += bad ? 1 : 0;
  console.log(`${bad ? '✗' : '✓'} ${page} ${w}x${h} ${theme} ${lang}  overflow=${overflow}px  ${errors.length ? '\n   ' + errors.join('\n   ') : ''}`);
  await ctx.close();
}
await browser.close();
process.exit(problems ? 1 : 0);
