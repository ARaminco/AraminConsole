#!/usr/bin/env node
/* Renders demo/icons/icon.svg to the PNG sizes the manifest needs (uses playwright-core + local Chromium). */
import { chromium } from 'playwright-core';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const exe = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse().map((d) => join(base, d, 'chrome-win64', 'chrome.exe')).find(existsSync);
const svg = readFileSync(join(ROOT, 'demo/icons/icon.svg'), 'utf8');
const b = await chromium.launch({ executablePath: exe });
const p = await b.newPage();
for (const [size, name, maskable] of [[192, 'icon-192.png'], [512, 'icon-512.png'], [512, 'icon-maskable-512.png', true], [180, 'apple-touch-icon.png', true]]) {
  await p.setViewportSize({ width: size, height: size });
  const inner = maskable
    ? `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,#7c5cff,#b14cf0);display:grid;place-items:center"><div style="width:${size * 0.8}px;height:${size * 0.8}px">${svg.replace(/<rect[^>]*rx="116"[^>]*\/>/g, '')}</div></div>`
    : `<div style="width:${size}px;height:${size}px">${svg}</div>`;
  await p.setContent(`<html><body style="margin:0;background:transparent">${inner}</body></html>`);
  await p.screenshot({ path: join(ROOT, 'demo/icons', name), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
await b.close();
console.log('icons written');
