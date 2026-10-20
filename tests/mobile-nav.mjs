// Regression for phone navigation glitches: run on WebKit (iOS engine) and Chromium phone emulation.
import { webkit, chromium, devices } from 'playwright-core';
import { join } from 'node:path';
const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:5178').slice(7);
const L = process.env.LOCALAPPDATA || '';
const engines = [['webkit', webkit, join(L, 'ms-playwright/webkit-2359/Playwright.exe')], ['chromium', chromium, join(L, 'ms-playwright/chromium-1228/chrome-win64/chrome.exe')]];
const pages = ['dashboard', 'manage', 'finance', 'users', 'analytics', 'chat', 'settings', 'manage', 'dashboard'];
let fail = 0;
for (const [label, type, exe] of engines) {
  let b; try { b = await type.launch({ executablePath: exe }); } catch (e) { console.log(`- ${label}: not available (${e.message.split('\n')[0]})`); continue; }
  const ctx = await b.newContext({ ...devices['iPhone 13'], defaultBrowserType: undefined });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`${base}/demo/#/dashboard`); await p.waitForTimeout(1200);
  for (const pg of pages) {
    await p.evaluate((x) => { location.hash = `#/${x}`; }, pg); await p.waitForTimeout(900);
    const r = await p.evaluate(() => {
      const c = document.querySelector('.ac-content') || document.body; const cr = c.getBoundingClientRect();
      const tb = document.querySelector('.ac-tabbar'); const tr = tb ? tb.getBoundingClientRect() : null;
      return { left: Math.round(cr.left), right: Math.round(cr.right), vw: innerWidth, sw: document.scrollingElement.scrollWidth,
        tf: getComputedStyle(c).transform, tabOk: !tr || (tr.left >= -1 && tr.right <= innerWidth + 1), page: document.querySelector('[data-page]')?.dataset.page };
    });
    const ok = r.left >= -1 && r.right <= r.vw + 1 && r.sw <= r.vw + 1 && (r.tf === 'none') && r.tabOk && r.page === pg;
    if (!ok) fail++;
    console.log(`${ok ? '✓' : '✗'} ${label} ${pg}: content ${r.left}..${r.right}/${r.vw} scrollW ${r.sw} transform ${r.tf} tabbar ${r.tabOk} page ${r.page}`);
  }
  if (errs.length) { fail++; console.log(`✗ ${label} errors: ${errs.slice(0, 3).join(' | ')}`); }
  await b.close();
}
console.log(`\n${fail ? fail + ' failed' : 'all passed'}`); process.exit(fail ? 1 : 0);
