#!/usr/bin/env node
/* Test runner (npm test = build + this). Starts the dev server on a free port, runs every suite in tests/ that accepts
   --base=<url> (or reads BASE from the environment), one after another, and exits non-zero when any suite fails.
   node tests/run.mjs [suite …] [--only=pwa,notify] [--skip=shots] [--timeout=300]   (names without .mjs) */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const args = process.argv.slice(2);
const opt = (k) => (args.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1];
const NOT_SUITES = new Set(['run', 'make-icons', 'make-pwa-assets', 'shots', 'data-fixture']); // tools / helpers, not pass-fail suites
const ORDER = ['shell', 'forms', 'overlays', 'data', 'standalone', 'rtl', 'pwa', 'notify']; // first, in this order; the rest alphabetically

const all = readdirSync(HERE).filter((f) => f.endsWith('.mjs')).map((f) => f.slice(0, -4))
  .filter((n) => !NOT_SUITES.has(n))
  .filter((n) => { const src = readFileSync(join(HERE, `${n}.mjs`), 'utf8'); return src.includes('--base') || /process\.env\.BASE\b/.test(src); })
  .sort((a, b) => (ORDER.includes(a) ? ORDER.indexOf(a) : 99) - (ORDER.includes(b) ? ORDER.indexOf(b) : 99) || a.localeCompare(b));
const picked = args.filter((a) => !a.startsWith('--'));
const only = (opt('only') || '').split(',').filter(Boolean);
const skip = (opt('skip') || '').split(',').filter(Boolean);
const suites = all.filter((n) => (!picked.length || picked.includes(n)) && (!only.length || only.includes(n)) && !skip.includes(n));
const timeout = (Number(opt('timeout')) || 300) * 1000;

const freePort = () => new Promise((resolve, reject) => { const s = createServer(); s.unref(); s.on('error', reject); s.listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); }); });

async function startServer() {
  const port = await freePort();
  const child = spawn(process.execPath, [join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('dev server did not start')), 10000);
    child.stdout.on('data', (d) => { if (String(d).includes('localhost')) { clearTimeout(t); resolve(); } });
    child.on('exit', (code) => { clearTimeout(t); reject(new Error(`dev server exited (${code})`)); });
  });
  return { base: `http://localhost:${port}`, stop: () => child.kill() };
}

function run(name, base) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(process.execPath, [join(HERE, `${name}.mjs`), `--base=${base}`], { env: { ...process.env, BASE: base }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    const tee = (d) => { out += d; process.stdout.write(String(d).replace(/^(?=.)/gm, `  [${name}] `)); };
    child.stdout.on('data', tee); child.stderr.on('data', tee);
    const timer = setTimeout(() => { out += '\nTIMEOUT'; child.kill(); }, timeout);
    child.on('exit', (code) => { clearTimeout(timer); resolve({ name, code: code ?? 1, ms: Date.now() - t0, timedOut: out.endsWith('TIMEOUT') }); });
  });
}

if (!suites.length) { console.log('no suites matched'); process.exit(1); }
const server = await startServer();
console.log(`dev server ${server.base} · suites: ${suites.join(', ')}\n`);
const results = [];
try {
  for (const s of suites) { console.log(`▶ ${s}`); results.push(await run(s, server.base)); }
} finally { server.stop(); }

console.log('\nsummary');
for (const r of results) console.log(`  ${r.code === 0 ? 'PASS' : 'FAIL'}  ${r.name.padEnd(14)} ${(r.ms / 1000).toFixed(1).padStart(6)} s${r.timedOut ? '  (timed out)' : r.code ? `  (exit ${r.code})` : ''}`);
const failed = results.filter((r) => r.code !== 0);
console.log(`\n${results.length - failed.length}/${results.length} suites passed`);
process.exit(failed.length ? 1 : 0);
