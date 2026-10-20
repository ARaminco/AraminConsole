// Regression: on desktop every hash change must render the new page without a reload.
import { chromium } from 'playwright-core';
import { join } from 'node:path';
const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:5178').slice(7);
const exe = process.env.CHROME || join(process.env.LOCALAPPDATA || '', 'ms-playwright/chromium-1228/chrome-win64/chrome.exe');
const b = await chromium.launch({ executablePath: exe });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const logs = []; p.on('console', (m) => { if (m.type() !== 'log') logs.push(m.text()); }); p.on('pageerror', (e) => logs.push('ERR ' + e.message));
await p.goto(`${base}/demo/#/dashboard`); await p.waitForTimeout(1500);
const links = await p.$$eval('a[href^="#/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href').slice(2)))].filter((x) => !x.includes('/')));
let fail = 0;
for (const pg of links) {
  const t0 = Date.now();
  await p.evaluate((x) => { location.hash = `#/${x}`; }, pg);
  const ok = await p.waitForFunction((x) => document.querySelector(`[data-page="${x}"]`) || document.querySelector('[data-page]')?.dataset.page === x || document.querySelector('.ac-content .ac-empty'), pg, { timeout: 6000 }).then(() => true, () => false);
  if (!ok) { fail++; console.log(`✗ ${pg} did not render (showing ${await p.evaluate(() => document.querySelector('[data-page]')?.dataset.page)})`); }
}
console.log(`${links.length - fail}/${links.length} pages rendered`); if (logs.length) console.log(logs.slice(0, 8).join('\n'));
await b.close(); process.exit(fail ? 1 : 0);
