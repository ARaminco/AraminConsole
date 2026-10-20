#!/usr/bin/env node
/* Generates the web-manifest assets the demo ships (tool, not a test suite — needs the dev server):
   demo/icons/icon-maskable-192.png · demo/icons/shortcut-<name>.png (96×96) · demo/screenshots/{wide,narrow}-*.png
   node tests/make-pwa-assets.mjs [--base=http://localhost:5178] */
import { chromium } from 'playwright-core';
import { readFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.argv.find((a) => a.startsWith('--base=')) || '').slice(7) || 'http://localhost:5178';
const pw = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const exe = readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse().map((d) => join(pw, d, 'chrome-win64', 'chrome.exe')).find(existsSync);
const b = await chromium.launch({ executablePath: exe });

// icons
const svg = readFileSync(join(ROOT, 'demo/icons/icon.svg'), 'utf8');
const lucide = (n) => readFileSync(join(ROOT, 'node_modules/lucide-static/icons', `${n}.svg`), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/stroke-width="2"/, 'stroke-width="2.2"');
const p = await b.newPage();
const shot = async (size, html, file) => {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<html><body style="margin:0;background:transparent">${html}</body></html>`);
  await p.screenshot({ path: join(ROOT, 'demo/icons', file), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
};
await shot(192, `<div style="width:192px;height:192px;background:linear-gradient(135deg,#7c5cff,#b14cf0);display:grid;place-items:center"><div style="width:154px;height:154px">${svg.replace(/<rect[^>]*rx="116"[^>]*\/>/g, '')}</div></div>`, 'icon-maskable-192.png');
for (const [name, icon] of [['dashboard', 'layout-dashboard'], ['tickets', 'life-buoy'], ['chat', 'message-circle'], ['invoice', 'receipt']]) {
  await shot(96, `<div style="width:96px;height:96px;border-radius:24px;background:#111114;display:grid;place-items:center;color:#fff"><div style="width:52px;height:52px">${lucide(icon).replace('<svg', '<svg width="52" height="52"')}</div></div>`, `shortcut-${name}.png`);
}

// screenshots (light, Persian) — wide = desktop window, narrow = phone
mkdirSync(join(ROOT, 'demo/screenshots'), { recursive: true });
const sets = [
  ['wide', { width: 1280, height: 800, deviceScaleFactor: 1 }, ['dashboard', 'tickets']],
  ['narrow', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, ['dashboard', 'notify-lab', 'chat']],
];
for (const [ff, vp, pages] of sets) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { localStorage.setItem('ac:theme', '"light"'); localStorage.setItem('ac:lang', '"fa"'); });
  const pg = await ctx.newPage();
  for (const name of pages) {
    await pg.goto(`${BASE}/demo/#/${name}`, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(900);
    await pg.addStyleTag({ content: '.ac-sc-launcher, .ac-toasts, .ac-ntf-stack { display: none !important; }' }).catch(() => {});
    await pg.screenshot({ path: join(ROOT, 'demo/screenshots', `${ff}-${name}.png`) });
  }
  await ctx.close();
}
await b.close();
console.log('pwa assets written');
