// Generates the README screenshots in docs/screens/ from a running demo server.
// Usage: node tests/make-readme-shots.mjs [--base=http://localhost:5178]
import { chromium } from 'playwright-core';
import { join } from 'node:path';
const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:5178').slice(7);
const exe = join(process.env.LOCALAPPDATA || '', 'ms-playwright/chromium-1228/chrome-win64/chrome.exe');
const out = (n) => join('docs', 'screens', n);
const shots = [
  ['dashboard-desktop.png', '/demo/#/dashboard', 1440, 900, 'light'],
  ['dashboard-dark.png', '/demo/#/dashboard', 1440, 900, 'dark'],
  ['dashboard-phone.png', '/demo/#/dashboard', 390, 844, 'light'],
  ['login-desktop.png', '/demo/auth/login.html', 1440, 900, 'light'],
  ['login-phone.png', '/demo/auth/login.html', 390, 844, 'light'],
  ['404-dark.png', '/demo/errors/404.html', 1440, 900, 'dark'],
];
const b = await chromium.launch({ executablePath: process.env.CHROME || exe });
for (const [file, path, w, h, theme] of shots) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 600 ? 2 : 1, reducedMotion: 'reduce' });
  await ctx.addInitScript((t) => { localStorage.setItem('ac:theme', t); localStorage.setItem('ac:accent', 'orange'); localStorage.setItem('ac:lang', 'fa'); }, theme);
  const p = await ctx.newPage();
  await p.goto(base + path); await p.waitForTimeout(2500);
  await p.screenshot({ path: out(file) });
  await ctx.close(); console.log('✓', file);
}
await b.close();
