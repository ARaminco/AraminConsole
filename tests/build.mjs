#!/usr/bin/env node
/* Build regression test (no browser; accepts --base= only so tests/run.mjs picks it up).
   1. minifyJS keeps strings, regex literals, template literals and ASI-sensitive newlines intact: a tricky fixture evaluates
      to the same result before and after minification.
   2. A custom build (--modules=forms,table,chart) succeeds and every emitted JS file (full, per-module, custom, demo, .min)
      parses as an ES module.
   3. The custom bundle runs: evaluated against a minimal DOM stub, it exposes AC with the chosen modules registered. */
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { minifyJS, minifyCSS } from '../scripts/minify.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failed++; };

// 1 — fixture equivalence
const src = readFileSync(join(ROOT, 'tests', 'fixtures', 'tricky.js'), 'utf8');
const min = minifyJS(src);
const run = (code) => JSON.stringify(new Function(code)());
let before; let after;
try { before = run(src); } catch (e) { before = `ERR ${e.message}`; }
try { after = run(min); } catch (e) { after = `ERR ${e.message}`; }
ok(before === after, `minifyJS keeps semantics of tests/fixtures/tricky.js (${src.length} → ${min.length} bytes)`);
if (before !== after) console.log(`  before: ${before}\n  after:  ${after}`);
ok(minifyCSS('/* it\'s */ .a { content: "/* x */ a ; b"; } /* don\'t */ .b{color:red}').includes('content:"/* x */ a ; b"'), 'minifyCSS keeps strings and ignores apostrophes in comments');

// 2 — custom build + every output parses
const out = mkdtempSync(join(tmpdir(), 'ac-build-'));
try {
  execFileSync(process.execPath, [join(ROOT, 'scripts', 'build.mjs'), '--modules=forms,table,chart', `--out=${out}`, '--quiet'], { stdio: 'pipe' });
  ok(existsSync(join(out, 'aramin-console.min.js')) && existsSync(join(out, 'aramin-console.min.css')), 'custom build writes js/css (+ .min) and copies assets for out-of-repo targets');
  ok(existsSync(join(out, 'icons.svg')) && existsSync(join(out, 'fonts')), 'out-of-repo custom build ships icons.svg and fonts/');
  const files = [
    ...['aramin-console.js', 'aramin-console.min.js'].map((f) => join(ROOT, 'dist', f)),
    ...readdirSync(join(ROOT, 'dist', 'modules')).filter((f) => f.endsWith('.js')).map((f) => join(ROOT, 'dist', 'modules', f)),
    ...(existsSync(join(ROOT, 'dist', 'demo')) ? readdirSync(join(ROOT, 'dist', 'demo')).filter((f) => f.endsWith('.js')).map((f) => join(ROOT, 'dist', 'demo', f)) : []),
    join(out, 'aramin-console.js'), join(out, 'aramin-console.min.js'),
  ].filter(existsSync);
  const bad = [];
  for (const f of files) {
    const tmp = join(out, '__check.mjs');
    writeFileSync(tmp, readFileSync(f, 'utf8'));
    try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); } catch (e) { bad.push(`${f}: ${String(e.stderr).split('\n').find((l) => /Error/.test(l))}`); }
  }
  ok(!bad.length, `${files.length} emitted bundles parse as ES modules`);
  bad.forEach((b) => console.log(`  ${b}`));

  // 3 — evaluate the custom min bundle against a tiny DOM stub
  const stub = `
    const noop = () => {}; const el = () => ({ setAttribute: noop, getAttribute: () => null, hasAttribute: () => false, removeAttribute: noop, append: noop, prepend: noop, after: noop, addEventListener: noop, removeEventListener: noop, querySelector: () => null, querySelectorAll: () => [], matches: () => false, closest: () => null, classList: { add: noop, remove: noop, toggle: noop, contains: () => false }, style: { setProperty: noop, removeProperty: noop }, dataset: {}, children: [], nodeType: 1 });
    const root = el(); root.dataset = { acManual: '' }; root.hasAttribute = (n) => n === 'data-ac-manual';
    globalThis.window = globalThis; globalThis.document = { documentElement: root, readyState: 'complete', head: el(), body: el(), createElement: el, querySelector: () => null, querySelectorAll: () => [], addEventListener: noop, removeEventListener: noop, dispatchEvent: noop, createTreeWalker: () => ({ nextNode: () => null }) };
    globalThis.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
    globalThis.localStorage = { getItem: () => null, setItem: noop, removeItem: noop }; globalThis.sessionStorage = globalThis.localStorage;
    globalThis.getComputedStyle = () => ({ direction: 'rtl', getPropertyValue: () => '' }); globalThis.requestAnimationFrame = (f) => setTimeout(f, 0); globalThis.cancelAnimationFrame = clearTimeout;
    globalThis.MutationObserver = class { observe() {} disconnect() {} }; globalThis.ResizeObserver = globalThis.MutationObserver; globalThis.IntersectionObserver = globalThis.MutationObserver;
    globalThis.CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o?.detail; } }; globalThis.Element = class {}; globalThis.Node = class {}; globalThis.HTMLElement = class {};
    globalThis.addEventListener = noop; globalThis.removeEventListener = noop; globalThis.location = { href: 'http://x/', hostname: 'x', protocol: 'http:', hash: '' };
  `;
  const harness = join(out, '__eval.mjs');
  writeFileSync(harness, `${stub}\nconst m = await import(${JSON.stringify(pathToFileURL(join(out, 'aramin-console.min.js')).href)});\nconst R = globalThis.__AC_MODS__;\nconsole.log(JSON.stringify({ ac: typeof m.default, use: typeof m.default.use, chart: typeof m.chart, table: typeof m.table, mods: Object.keys(R).filter((k) => !k.startsWith('__') && !k.startsWith('@')) }));`);
  let res = null;
  try { res = JSON.parse(execFileSync(process.execPath, [harness], { stdio: 'pipe' }).toString().trim().split('\n').pop()); } catch (e) { console.log(`  ${String(e.stderr || e.message).split('\n').slice(0, 6).join('\n  ')}`); }
  ok(res && res.ac === 'object' && res.use === 'function' && res.chart === 'function' && res.table !== 'undefined', `custom min bundle evaluates and exposes AC, AC.use, chart, table ${res ? `[${res.mods.join(', ')}]` : ''}`);
  ok(res && ['core', 'forms', 'table', 'data-display', 'chart'].every((n) => res.mods.includes(n)) && !res.mods.includes('overlays'), 'custom build contains exactly the chosen modules + dependencies (no overlays)');
} catch (e) {
  ok(false, `custom build: ${String(e.stderr || e.message).split('\n')[0]}`);
} finally { rmSync(out, { recursive: true, force: true }); }

console.log(failed ? `\n${failed} check(s) failed` : '\nbuild checks passed');
process.exit(failed ? 1 : 0);
