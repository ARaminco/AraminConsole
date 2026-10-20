#!/usr/bin/env node
/* Standalone pages smoke + screenshots (auth + errors).
   node tests/standalone.mjs [auth/login,errors/404,…] [--base=http://localhost:5178] [--sizes=1440x900,390x844]
                            [--themes=light,dark] [--langs=fa,en] [--no-shots]
   node tests/standalone.mjs --subpath   → serves the repo under /AraminConsole/ (like GitHub Pages) on a
                                           temporary port and checks the demo + standalone pages for 404s.
   Writes tests/screens/<group>-<page>-<w>x<h>-<theme>-<lang>.png; prints console errors and phone overflow. */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT = join(HERE, 'screens');
mkdirSync(OUT, { recursive: true });

function findChromium() { // same lookup as tests/shots.mjs (importing it would run it)
  const base = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(base)) return undefined;
  for (const d of readdirSync(base).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) for (const sub of ['chrome-win64', 'chrome-win']) {
    const exe = join(base, d, sub, 'chrome.exe');
    if (existsSync(exe)) return exe;
  }
  return undefined;
}

const ALL = ['auth/login', 'auth/register', 'auth/forgot', 'auth/otp', 'auth/lock', 'errors/404', 'errors/500', 'errors/maintenance', 'errors/offline', 'offline'];
const args = process.argv.slice(2);
const opt = (name, def) => (args.find((a) => a.startsWith(`--${name}=`)) || '').split('=')[1] || def;
const list = args.find((a) => !a.startsWith('--'));
const pages = list ? list.split(',') : ALL;
const browser = await chromium.launch({ executablePath: findChromium() });
let problems = 0;

if (args.includes('--subpath')) await subpath();
else await shots();
await browser.close();
process.exit(problems ? 1 : 0);

function watch(p, errors, base) {
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  p.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));
  p.on('response', (r) => { if (r.status() >= 400 && (!base || r.url().startsWith(base))) errors.push(`${r.status()}: ${r.url()}`); });
}

async function shots() {
  const base = opt('base', 'http://localhost:5178');
  const sizes = opt('sizes', '1440x900,390x844').split(',').map((s) => s.split('x').map(Number));
  const themes = opt('themes', 'light,dark').split(',');
  const langs = opt('langs', 'fa,en').split(',');
  for (const page of pages) for (const [w, h] of sizes) for (const theme of themes) for (const lang of langs) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 800 ? 2 : 1, hasTouch: w < 800, isMobile: w < 800 });
    await ctx.addInitScript(([t, l]) => { localStorage.setItem('ac:theme', t); localStorage.setItem('ac:lang', l); }, [theme, lang]);
    const p = await ctx.newPage();
    const errors = [];
    watch(p, errors);
    await p.goto(`${base}/demo/${page}.html`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (!args.includes('--no-shots')) await p.screenshot({ path: join(OUT, `${page.replace('/', '-')}-${w}x${h}-${theme}-${lang}.png`) });
    const bad = errors.length || overflow > 0;
    problems += bad ? 1 : 0;
    console.log(`${bad ? '✗' : '✓'} ${page} ${w}x${h} ${theme} ${lang}  overflow=${overflow}px${errors.length ? '\n   ' + errors.join('\n   ') : ''}`);
    await ctx.close();
  }
}

/* GitHub Pages serves the repository under /<repo>/ — every demo URL must be relative. */
async function subpath() {
  const PREFIX = '/AraminConsole';
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (!path.startsWith(`${PREFIX}/`)) { res.writeHead(404); return res.end('outside sub-path'); }
    let file = normalize(join(ROOT, path.slice(PREFIX.length)));
    if (!file.startsWith(ROOT + sep)) { res.writeHead(403); return res.end(); }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) { res.writeHead(404); return res.end('not found'); }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const targets = ['demo/#/dashboard', 'demo/#/forms', 'demo/#/manage', ...ALL.map((p) => `demo/${p}.html`)];
  for (const t of targets) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errors = [];
    watch(p, errors, base);
    await p.goto(`${base}${PREFIX}/${t}`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(900);
    const ok = await p.evaluate(() => !!document.querySelector('#i-check, symbol') && getComputedStyle(document.body).fontFamily.length > 0);
    const bad = errors.length || !ok;
    problems += bad ? 1 : 0;
    console.log(`${bad ? '✗' : '✓'} ${PREFIX}/${t}${ok ? '' : '  (icon sprite missing)'}${errors.length ? '\n   ' + errors.join('\n   ') : ''}`);
    await ctx.close();
  }
  server.close();
}
