// Regression: fast navigation must never show a page before its module stylesheet applied.
import { chromium } from 'playwright-core';
import { join } from 'node:path';
const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:5178').slice(7);
const exe = process.env.CHROME || join(process.env.LOCALAPPDATA || '', 'ms-playwright/chromium-1228/chrome-win64/chrome.exe');
const b = await chromium.launch({ executablePath: exe });
let fail = 0;
for (let run = 0; run < 6; run++) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route('**/dist/modules/*.css', async (r) => { await new Promise((s) => setTimeout(s, 150 + run * 80)); r.continue(); });
  await p.goto(`${base}/demo/#/dashboard`); await p.waitForTimeout(600);
  for (const pg of ['finance', 'users', 'manage', 'files', 'manage']) { await p.hover(`a[href="#/${pg}"]`).catch(() => {}); await p.evaluate((x) => { location.hash = `#/${x}`; }, pg); await p.waitForTimeout(90); }
  await p.waitForSelector('[data-page="manage"] .ac-bank-card, [data-page="manage"] [data-ac="bank-card"]', { timeout: 8000 });
  await p.waitForTimeout(300);
  const h = await p.evaluate(() => document.querySelector('[data-page="manage"] [data-ac="bank-card"]')?.getBoundingClientRect().height || 0);
  const ok = h > 0 && h < 420; if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} run ${run}: bank card height ${Math.round(h)}px`);
  await p.close();
}
await b.close();
console.log(`\n${6 - fail} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
