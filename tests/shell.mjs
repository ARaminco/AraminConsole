#!/usr/bin/env node
/* Shell interaction smoke (dev server must be running).
   Opens the palette, the mobile drawer, switches pages/lang, collapses the rail; screenshots into tests/screens/shell-*.png */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'screens');
mkdirSync(OUT, { recursive: true });
const base = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const exe = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()
  .map((d) => join(base, d, 'chrome-win64', 'chrome.exe')).find(existsSync);
const BASE = process.env.BASE || 'http://localhost:5178';
const URL0 = `${BASE}/demo/#/dashboard`;
const browser = await chromium.launch({ executablePath: exe });
const errors = [];
const watch = (p) => { p.on('console', (m) => m.type() === 'error' && errors.push(m.text())); p.on('pageerror', (e) => errors.push(e.message)); };
const shot = (p, n) => p.screenshot({ path: join(OUT, `shell-${n}.png`) });

// desktop
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); watch(p);
  await p.goto(URL0, { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
  await p.keyboard.press('Control+k'); await p.waitForTimeout(350);
  await p.keyboard.type('کام'); await p.waitForTimeout(200);
  await shot(p, 'palette-desktop');
  await p.keyboard.press('Enter'); await p.waitForTimeout(900);
  console.log('after palette enter →', await p.evaluate(() => location.hash));
  await shot(p, 'components-desktop');
  await p.click('.ac-dock__btn[data-ac-rail-group="commerce"]'); await p.waitForTimeout(500);
  await shot(p, 'dock-flyout');
  console.log('flyout:', await p.evaluate(() => [document.querySelector('.ac-rail').dataset.state, document.querySelector('.ac-rail').dataset.group, document.querySelectorAll('.ac-rail__group:not([data-off])').length]));
  await p.mouse.click(700, 600); await p.waitForTimeout(300);
  console.log('flyout after outside click:', await p.evaluate(() => document.querySelector('.ac-rail').dataset.state));
  await p.click('.ac-topnav__link[href="#/manage"]'); await p.waitForTimeout(900);
  console.log('topnav current:', await p.evaluate(() => document.querySelector('.ac-topnav__link[aria-current="page"]')?.getAttribute('href')), 'dock active:', await p.evaluate(() => document.querySelector('.ac-dock__btn[data-active]')?.dataset.acRailGroup));
  await p.click('.ac-dock__btn[data-theme-set="dark"]'); await p.waitForTimeout(500);
  console.log('theme after dock moon:', await p.evaluate(() => document.documentElement.dataset.theme));
  await shot(p, 'manage-dark');
  await p.click('.ac-dock__btn[data-theme-set="light"]'); await p.goto(`${BASE}/demo/#/kanban`); await p.waitForTimeout(700);
  await shot(p, 'coming-soon');
  // tabs keyboard
  await p.goto(`${BASE}/demo/#/components`); await p.waitForTimeout(800);
  await p.focus('.ac-tabs__tab[aria-selected="true"]'); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400);
  console.log('tabs after ArrowLeft (rtl → next):', await p.evaluate(() => [...document.querySelectorAll('.ac-tabs__tab')].findIndex((t) => t.getAttribute('aria-selected') === 'true')));
  await ctx.close();
}
// phone
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); watch(p);
  await p.goto(URL0, { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
  await p.evaluate(() => scrollTo(0, 400)); await p.waitForTimeout(500);
  console.log('appbar collapsed after scroll:', await p.evaluate(() => document.querySelector('.ac-appbar').dataset.collapsed), await p.textContent('#ac-appbar-title'));
  await shot(p, 'phone-scrolled');
  await p.evaluate(() => scrollTo(0, 0));
  await p.tap('.ac-tabbar button[data-ac-rail-open]'); await p.waitForTimeout(500);
  await shot(p, 'phone-drawer');
  await p.tap('.ac-rail__link[href="#/components"]'); await p.waitForTimeout(900);
  console.log('drawer state after nav:', await p.evaluate(() => document.querySelector('.ac-rail').dataset.state), await p.evaluate(() => location.hash));
  await shot(p, 'phone-components');
  await p.tap('.ac-tabbar__fab'); await p.waitForTimeout(400);
  await shot(p, 'phone-palette');
  await ctx.close();
}
await browser.close();
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no console errors');
