#!/usr/bin/env node
/* AraminConsole zero-dependency build.

   Modules: src/modules.json declares every module (core, built-in component families) by its CSS / JS files; folders in
   src/modules/<name>/ are discovered automatically. A module is one "group" in every bundle: a guarded block that registers
   itself in globalThis.__AC_MODS__, so the full bundle, custom builds and lazily loaded per-module bundles share ONE core and
   never evaluate a module twice.

   Outputs
     dist/aramin-console.{css,js} (+ .min)   full bundle: core + every module (built-in components, then src/modules/*)
     dist/modules/<name>.{css,js} (+ .min)   per-module ESM bundles; each imports its dependencies (./core.js …) — used by AC.use()
     dist/modules/modules.json                resolved graph + sizes
     dist/aramin-console-boot.js · dist/icons.svg · dist/banks.{svg,json} · dist/fonts
     demo/aramin.config.json                  → the demo's custom shell build (dist/demo/)

   CSS  order: tokens → base → layout → components/*.css (alphabetical) → src/modules/<name>/*.css → motion.css
   JS   bundler: `import {a, b as c} from './x.js'`, `import './x.js'`, `import * as ns from './x.js'`, `import { data } from './x.json'`,
        `export function|async function|const|let|class name`, `export { a, b as c }`, `export { a } from './x.js'`, `export * from './x.js'`

   Usage
     node scripts/build.mjs                              full build + per-module bundles + demo build + size table
     node scripts/build.mjs --watch
     node scripts/build.mjs --modules=forms,table,chart [--out=dist/custom] [--name=aramin-console]   custom build only
     node scripts/build.mjs --config=path/to/aramin.config.json   (default: ./aramin.config.json of the current directory)
     node scripts/build.mjs --sync-manifest              write discovered modules + measured sizes into src/modules.json
     node scripts/build.mjs --quiet                      no size table */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, watch, statSync, rmSync } from 'node:fs';
import { dirname, join, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { minifyJS, minifyCSS } from './minify.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');
const MODDIR = join(DIST, 'modules');
const VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
const banner = (what) => `/*! AraminConsole v${VERSION} — ${what} — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */\n`;
const read = (p) => readFileSync(p, 'utf8').replace(/^﻿/, '');
const J = JSON.stringify;
const posix = (p) => p.split(sep).join('/');
const relUrl = (fromDir, to) => { const r = posix(relative(fromDir, to)); return r.startsWith('.') ? r : `./${r}`; };
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const measure = (raw, min) => ({ raw: Buffer.byteLength(raw), min: Buffer.byteLength(min), gzip: gzipSync(min, { level: 9 }).length });

const argv = process.argv.slice(2);
const arg = (k) => { const a = argv.find((x) => x === `--${k}` || x.startsWith(`--${k}=`)); return a == null ? undefined : a.includes('=') ? a.slice(a.indexOf('=') + 1) : true; };

/* ================================================================== manifest */
function loadManifest() {
  const file = join(SRC, 'modules.json');
  const json = existsSync(file) ? JSON.parse(read(file)) : { modules: [] };
  const mods = new Map();
  // Entries whose files live under src/modules/ are feature modules even when an older sync dropped `kind`.
  const isFolderModule = (m) => [...(m.css || []), ...(m.js || [])].some((f) => f.startsWith('modules/'));
  for (const m of json.modules) mods.set(m.name, { kind: m.name === 'core' ? 'core' : isFolderModule(m) ? 'module' : 'component', ...m, css: m.css || [], js: m.js || [], dependencies: m.dependencies || [] });
  const dir = join(SRC, 'modules');
  if (existsSync(dir)) {
    for (const name of readdirSync(dir).sort()) {
      const folder = join(dir, name);
      if (!statSync(folder).isDirectory()) continue;
      const local = existsSync(join(folder, 'module.json')) ? JSON.parse(read(join(folder, 'module.json'))) : {};
      const files = readdirSync(folder);
      const jsFiles = files.filter((f) => f.endsWith('.js'));
      const entry = local.entry || (files.includes(`${name}.js`) ? `${name}.js` : files.includes('index.js') ? 'index.js' : jsFiles.length === 1 ? jsFiles[0] : null);
      const declared = mods.get(name);
      if (declared && declared.kind !== 'module') { console.warn(`  ! src/modules/${name} clashes with built-in module "${name}" — skipped`); continue; }
      mods.set(name, {
        name, kind: 'module',
        description: local.description || declared?.description || '',
        css: (local.css || files.filter((f) => f.endsWith('.css')).sort()).map((f) => `modules/${name}/${f}`),
        js: entry ? [`modules/${name}/${entry}`] : [],
        dependencies: local.dependencies || declared?.dependencies || ['core'],
        bundle: local.bundle ?? declared?.bundle ?? true,
      });
    }
  }
  for (const m of mods.values()) for (const d of m.dependencies) if (!mods.has(d)) throw new Error(`module "${m.name}" depends on unknown module "${d}"`);
  return { json, mods };
}

/** Global CSS order (full bundle); per-module / custom CSS keep this relative order. */
function cssOrder(mods) {
  const order = ['css/tokens.css', 'css/base.css', 'css/layout.css'];
  const comp = join(SRC, 'css', 'components');
  if (existsSync(comp)) order.push(...readdirSync(comp).filter((f) => f.endsWith('.css')).sort().map((f) => `css/components/${f}`));
  for (const m of [...mods.values()].filter((x) => x.kind === 'module').sort((a, b) => a.name.localeCompare(b.name))) order.push(...m.css);
  order.push('css/motion.css'); // motion system + micro-interactions last: refines every component
  return order.filter((f) => existsSync(join(SRC, f)));
}

/* ================================================================== CSS */
function cssOf(rel, outDir, rewrite) {
  let src = read(join(SRC, rel));
  if (rel === 'css/tokens.css') {
    const m = src.match(/\/\* dark:start \*\/([\s\S]*?)\/\* dark:end \*\//);
    if (m) {
      const body = m[1].replace(/:root\[data-theme="dark"\]\s*\{/, '').replace(/\}\s*$/, '');
      src = src.replace('/* auto-dark */', `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {${body}}\n}`);
    }
  }
  if (rewrite && outDir !== DIST) src = src.replace(/url\((["']?)fonts\//g, (_, q) => `url(${q}${relUrl(outDir, join(DIST, 'fonts'))}/`);
  return `\n/* ==== ${rel} ==== */\n${src}\n`;
}

function writeCSS(files, outDir, base, what, rewrite = true) {
  mkdirSync(outDir, { recursive: true });
  const css = banner(what) + files.map((f) => cssOf(f, outDir, rewrite)).join('');
  const min = minifyCSS(css);
  writeFileSync(join(outDir, `${base}.css`), css);
  writeFileSync(join(outDir, `${base}.min.css`), min);
  return measure(css, min);
}

/* ================================================================== JS: parse */
const IMPORT_RE = /^[ \t]*import\s+(?:([\w$]+)\s*,?\s*)?(?:\{([^}]*)\}|\*\s+as\s+([\w$]+))?\s*(?:from\s*)?(['"])(\.{1,2}\/[^'"]+)\4\s*;?[ \t]*$/gm;
const REEXPORT_RE = /^[ \t]*export\s+(?:\{([^}]*)\}|\*)\s*from\s*(['"])(\.{1,2}\/[^'"]+)\2\s*;?[ \t]*$/gm;
const EXPORT_DECL_RE = /^([ \t]*)export\s+(async\s+function\*?|function\*?|const|let|var|class)\s+([\w$]+)/gm;
const EXPORT_LIST_RE = /^[ \t]*export\s*\{([^}]*)\}\s*;?[ \t]*$/gm;

function parseSpecifiers(list) {
  return list.split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
    const [a, b] = s.split(/\s+as\s+/);
    return { local: a.trim(), exported: (b || a).trim() };
  });
}

/** One program = every file reachable from every module, each assigned to exactly one group (module). */
function program(mods) {
  const owner = new Map(); // abs file -> module name
  for (const m of mods.values()) {
    for (const f of m.js) owner.set(join(SRC, f), m.name);
    if (m.kind === 'module') {
      const folder = join(SRC, 'modules', m.name);
      const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (!owner.has(p)) owner.set(p, m.name); });
      walk(folder);
    }
  }
  const files = new Map();
  let n = 0;
  function load(file, importerGroup) {
    if (files.has(file)) return files.get(file);
    if (!existsSync(file)) throw new Error(`missing import ${posix(relative(ROOT, file))}`);
    const group = owner.get(file) || importerGroup;
    const mod = { id: `__ac_m${(n++).toString(36)}`, file, rel: posix(relative(SRC, file)), group, deps: [], own: new Map(), re: [], stars: [] };
    files.set(file, mod);
    let code = file.endsWith('.json') ? `export const data = ${read(file).trim()};\n` : read(file);
    const header = [];
    code = code.replace(REEXPORT_RE, (_, list, q, spec) => {
      const dep = load(resolve(dirname(file), spec), group);
      mod.deps.push(dep);
      if (list == null) mod.stars.push(dep);
      else for (const { local, exported } of parseSpecifiers(list)) mod.re.push({ exported, dep, local });
      return '';
    });
    code = code.replace(IMPORT_RE, (_, def, named, ns, q, spec) => {
      const dep = load(resolve(dirname(file), spec), group);
      mod.deps.push(dep);
      if (def) header.push(`const ${def} = ${dep.id}.default;`);
      if (ns) header.push(`const ${ns} = ${dep.id};`);
      if (named) {
        const parts = parseSpecifiers(named).map(({ local, exported }) => (local === exported ? local : `${local}: ${exported}`));
        if (parts.length) header.push(`const { ${parts.join(', ')} } = ${dep.id};`);
      }
      return '';
    });
    code = code.replace(EXPORT_DECL_RE, (_, ind, kind, name) => { mod.own.set(name, name); return `${ind}${kind} ${name}`; });
    code = code.replace(EXPORT_LIST_RE, (_, list) => { for (const { local, exported } of parseSpecifiers(list)) mod.own.set(exported, local); return ''; });
    if (/^\s*export\s/m.test(code)) throw new Error(`Unsupported export syntax in ${posix(relative(ROOT, file))}`);
    // src/modules resolve their own stylesheet from import.meta.url; once bundled that must point at dist/modules/
    if (mod.rel.startsWith('modules/')) code = code.replace(/\bimport\.meta\.url\b/g, '(globalThis.__AC_MODS__?.__base || import.meta.url)');
    mod.code = `${header.join('\n')}\n${code}`;
    return mod;
  }
  const entry = load(join(SRC, 'js', 'index.js'), '@index');
  const failed = [];
  for (const m of mods.values()) for (const f of m.js) {
    try { load(join(SRC, f), m.name); } catch (err) {
      if (m.kind !== 'module') throw err;
      failed.push(m.name); console.warn(`  ! module ${m.name} skipped: ${err.message}`);
    }
  }
  return { files, entry, failed };
}

/** name -> origin file for every export of mod (follows re-exports and stars). */
function origins(mod, acc = new Map(), seen = new Set()) {
  if (seen.has(mod)) return acc; seen.add(mod);
  for (const d of mod.stars) for (const [k, v] of origins(d, new Map(), seen)) if (k !== 'default' && !acc.has(k)) acc.set(k, v);
  for (const { exported, dep, local } of mod.re) acc.set(exported, origins(dep, new Map(), new Set()).get(local) || { mod: dep, name: local });
  for (const k of mod.own.keys()) acc.set(k, { mod, name: k });
  return acc;
}
function exportNames(mod) { return [...origins(mod).keys()]; }

/* ================================================================== JS: groups */
function graphOf(mods, prog) {
  const groups = new Map(); // name -> { name, files:[], deps:Set, ns: Map(exported -> {mod,name}) }
  const ensure = (name) => { if (!groups.has(name)) groups.set(name, { name, files: [], deps: new Set(), ns: new Map() }); return groups.get(name); };
  // file order: DFS from the entry, then every module file (deps first)
  const ordered = []; const seen = new Set();
  const visit = (m) => { if (seen.has(m)) return; seen.add(m); m.deps.forEach(visit); ordered.push(m); };
  visit(prog.entry);
  for (const m of prog.files.values()) visit(m);
  for (const f of ordered) {
    const g = ensure(f.group); g.files.push(f);
    for (const d of f.deps) if (d.group !== f.group) g.deps.add(d.group);
  }
  for (const m of mods.values()) {
    if (!groups.has(m.name) && !prog.failed.includes(m.name)) ensure(m.name); // css-only module
    if (groups.has(m.name)) for (const d of m.dependencies) if (d !== m.name) groups.get(m.name).deps.add(d);
  }
  // public names: what index.js exports, by origin; modules (src/modules) export their entry's names
  for (const [name, o] of origins(prog.entry)) if (groups.has(o.mod.group)) groups.get(o.mod.group).ns.set(name, o);
  for (const m of mods.values()) {
    const g = groups.get(m.name); if (!g) continue;
    if (m.kind === 'module' && m.js[0]) { const e = prog.files.get(join(SRC, m.js[0])); if (e) for (const [k, o] of origins(e)) g.ns.set(k, o); }
    if (!g.ns.size) for (const f of g.files) for (const [k, o] of origins(f)) if (!g.ns.has(k)) g.ns.set(k, o);
  }
  // declared vs. real dependencies
  for (const m of mods.values()) {
    const g = groups.get(m.name); if (!g) continue;
    const declared = closure(groups, m.dependencies.filter((d) => groups.has(d)));
    for (const d of g.deps) if (!declared.includes(d) && d !== m.name) console.warn(`  ! module ${m.name} imports from "${d}" — add it to its dependencies in src/modules.json`);
  }
  topo(groups, [...groups.keys()]); // throws on cycles
  return groups;
}

function closure(groups, names) { return topo(groups, names); }
function topo(groups, names) {
  const out = []; const state = new Map();
  const visit = (n, path) => {
    if (state.get(n) === 2) return;
    if (state.get(n) === 1) throw new Error(`module dependency cycle: ${[...path, n].join(' → ')}`);
    state.set(n, 1);
    for (const d of groups.get(n)?.deps || []) visit(d, [...path, n]);
    state.set(n, 2); out.push(n);
  };
  names.forEach((n) => visit(n, []));
  return out;
}

function emitGroup(g) {
  const ext = new Map();
  for (const f of g.files) for (const d of f.deps) if (d.group !== g.name) ext.set(d.id, `const ${d.id} = __R[${J(d.group)}].f[${J(d.rel)}];`);
  let body = [...ext.values()].join('\n');
  for (const m of g.files) {
    const own = [...m.own].map(([k, v]) => (k === v ? k : `${J(k)}: ${v}`));
    const re = m.re.map(({ exported, dep, local }) => `${J(exported)}: ${dep.id}[${J(local)}]`);
    const stars = m.stars.map((d) => `...${d.id}`);
    body += `\n/* ---- ${m.rel} ---- */\nconst ${m.id} = F[${J(m.rel)}] = (() => {\n${m.code.trim()}\nreturn Object.freeze({ ${[...stars, ...re, ...own].join(', ')} });\n})();\n`;
  }
  const ns = [...g.ns].map(([k, o]) => `${J(k)}: ${o.mod.id}[${J(o.name)}]`);
  return `\n/* ======== module: ${g.name} ======== */\nif (!__R[${J(g.name)}]) __R[${J(g.name)}] = (() => {\nconst F = {};\n${body}\nreturn { f: F, ns: Object.freeze({ ${ns.join(', ')} }) };\n})();\n`;
}

function graphJSON(mods, groups, provides) {
  const out = {};
  for (const m of mods.values()) {
    if (!groups.has(m.name) || m.name === 'core') continue;
    const p = provides.get(m.name) || {};
    out[m.name] = { deps: [...groups.get(m.name).deps].filter((d) => d !== 'core' && !d.startsWith('@')), css: m.css.length > 0, provides: p };
  }
  return out;
}

function prologue({ graph, base, css = [], markers = [] }) {
  let s = 'const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});\n';
  if (graph) s += `__R.__graph = Object.assign(__R.__graph || {}, ${J(graph)});\n`;
  if (base) s += `__R.__base || (__R.__base = new URL(${J(base)}, import.meta.url).href);\nif (__R.__min == null) __R.__min = /*@ac-min*/false;\n`;
  if (css.length) s += `(__R.__css || (__R.__css = new Set())); ${J(css)}.forEach((n) => __R.__css.add(n));\n`;
  // src/modules inject their own stylesheet unless one is marked present — this bundle's CSS twin already has it
  if (markers.length) s += `if (typeof document !== 'undefined') for (const n of ${J(markers)}) if (!document.querySelector(\`[data-ac-module="\${n}"]\`)) { const st = document.createElement('style'); st.dataset.acModule = n; document.head.append(st); }\n`;
  return s;
}

const bootTail = (icons) => `
if (!__R['@boot']) {
  __R['@boot'] = 1;
  const AC = __R.core.ns.AC;
  if (!AC.defaultIcons) AC.defaultIcons = new URL(${J(icons)}, import.meta.url).href;
  window.AC = AC;
  if (!document.documentElement.hasAttribute('data-ac-manual')) {
    const start = () => AC.boot({ icons: document.documentElement.dataset.acIcons || AC.defaultIcons });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
  }
}
`;

/* ================================================================== provides (for AC.use / page maps) */
function providesOf(mods, groups) {
  const res = new Map();
  // a module "owns" a block class when one of its selectors starts with it (not when it only mentions it inside :is()/:has())
  const cssText = (files) => files.map((f) => read(join(SRC, f))).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const noParens = (t) => { let p; do { p = t; t = t.replace(/\([^()]*\)/g, ''); } while (t !== p); return t; };
  const classesOf = (files) => new Set([...noParens(cssText(files)).matchAll(/(?:^|[{},])\s*\.(ac-[a-z0-9]+(?:-[a-z0-9]+)*)(?![\w-])/gm)].map((x) => x[1]));
  const coreClasses = new Set([...cssText(mods.get('core')?.css || []).matchAll(/\.(ac-[a-z0-9]+(?:-[a-z0-9]+)*)(?![\w-])/g)].map((x) => x[1]));
  const srcOf = (g) => g.files.map((f) => (f.file.endsWith('.js') ? read(f.file) : '')).join('\n');
  const assigned = (src) => [...src.matchAll(/\b(?:AC|ac)\.([A-Za-z_$][\w$]*)\s*=(?![=>])/g)].map((x) => x[1]);
  // names the core already puts on AC (never a reason to load a module): AC.x = …, Object.assign(AC, { … }), core exports
  const core = groups.get('core');
  const coreSrc = core ? srcOf(core) : '';
  const coreNames = new Set([...assigned(coreSrc), ...(core ? core.ns.keys() : []),
    ...[...coreSrc.matchAll(/Object\.assign\(AC,\s*\{([\s\S]*?)\}\);/g)].flatMap((x) => x[1].match(/[A-Za-z_$][\w$]*(?=\s*[,:}\n(])/g) || [])]);
  for (const m of mods.values()) {
    const g = groups.get(m.name); if (!g) continue;
    const src = srcOf(g);
    const set = (re) => [...new Set([...src.matchAll(re)].map((x) => x[1]))].sort();
    // built-in families: what they put on AC + their curated exports; src/modules: only what they put on AC (their exports are internals)
    const api = new Set([...assigned(src), ...(m.kind === 'module' ? [] : [...g.ns.keys()])].filter((k) => /^[a-z]/.test(k) && (m.name === 'core' || !coreNames.has(k))));
    // block classes styled only by this module's CSS: static markup using them needs the module's stylesheet
    const classes = [...classesOf(m.css)].filter((c) => !coreClasses.has(c)).sort();
    res.set(m.name, { components: set(/register\??\.?\(\s*['"]([\w-]+)['"]/g), api: [...api].sort(), attrs: set(/\[data-(ac-[a-z][\w-]*)/g).filter((a) => a !== 'ac-module'), classes });
  }
  return res;
}

/* ================================================================== bundles */
function jsOut(outDir, base, code, what) {
  mkdirSync(outDir, { recursive: true });
  const js = banner(what) + code;
  // the .min twin lazy-loads .min modules: AC.use reads __R.__min, dependency imports point at .min.js
  const min = minifyJS(js.replace('/*@ac-min*/false', 'true').replace(/import\('\.\/([\w-]+)\.js'\)/g, "import('./$1.min.js')"));
  writeFileSync(join(outDir, `${base}.js`), js);
  writeFileSync(join(outDir, `${base}.min.js`), min);
  return measure(js, min);
}

function exportsFrom(groups, names) {
  const seen = new Set(); let s = '';
  for (const n of names) {
    const keys = [...groups.get(n).ns.keys()].filter((k) => !seen.has(k) && k !== 'default' && /^[A-Za-z_$][\w$]*$/.test(k));
    keys.forEach((k) => seen.add(k));
    if (keys.length) s += `export const { ${keys.join(', ')} } = __R[${J(n)}].ns;\n`;
  }
  return s;
}

function buildFull(ctx) {
  const { mods, groups, graph } = ctx;
  const builtin = topo(groups, [...[...mods.values()].filter((m) => m.kind !== 'module' && groups.has(m.name)).map((m) => m.name), '@index']);
  const extra = topo(groups, [...mods.values()].filter((m) => m.kind === 'module' && m.bundle !== false && groups.has(m.name)).map((m) => m.name)).filter((n) => !builtin.includes(n));
  const names = [...builtin, ...extra];
  const markers = extra.filter((n) => mods.get(n)?.kind === 'module');
  let code = prologue({ graph, base: './modules/', css: names.filter((n) => mods.has(n)), markers });
  code += names.map((n) => emitGroup(groups.get(n))).join('');
  const idx = ctx.prog.entry;
  const exp = exportNames(idx).filter((k) => k !== 'default');
  code += `\nconst __ix = __R["@index"].f[${J(idx.rel)}];\nconst { ${exp.join(', ')} } = __ix;\nexport { ${exp.join(', ')} };\nexport default __ix.AC;\n`;
  const js = jsOut(DIST, 'aramin-console', code, 'JS');
  const css = writeCSS(ctx.order.filter((f) => !f.startsWith('modules/') || extra.some((n) => f.startsWith(`modules/${n}/`))), DIST, 'aramin-console', 'CSS');
  return { js, css };
}

/** custom build: core + the chosen modules + their dependencies → one tree-shaken JS + CSS pair. */
function buildCustom(ctx, wanted, outDir, base = 'aramin-console', extraCode = '') {
  const { mods, groups, graph } = ctx;
  for (const w of wanted) if (!groups.has(w)) throw new Error(`unknown module "${w}" (known: ${[...mods.keys()].join(', ')})`);
  const names = topo(groups, ['core', ...wanted]).filter((n) => !n.startsWith('@'));
  const builtin = names.filter((n) => mods.get(n).kind !== 'module');
  const extra = names.filter((n) => mods.get(n).kind === 'module');
  const inRepo = !relative(ROOT, outDir).startsWith('..') && !isAbsolute(relative(ROOT, outDir));
  if (!inRepo) { // consumer project: ship the assets next to the bundle
    mkdirSync(join(outDir, 'fonts'), { recursive: true });
    for (const f of readdirSync(join(DIST, 'fonts'))) copyFileSync(join(DIST, 'fonts', f), join(outDir, 'fonts', f));
    copyFileSync(join(DIST, 'icons.svg'), join(outDir, 'icons.svg'));
  }
  const icons = inRepo ? relUrl(outDir, join(DIST, 'icons.svg')) : './icons.svg';
  const modBase = inRepo ? `${relUrl(outDir, MODDIR)}/` : (ctx.modulesBase || './modules/');
  let code = prologue({ graph, base: modBase, css: names, markers: extra });
  code += builtin.map((n) => emitGroup(groups.get(n))).join('');
  code += bootTail(icons);
  code += extra.map((n) => emitGroup(groups.get(n))).join('');
  code += extraCode;
  code += exportsFrom(groups, builtin);
  code += 'export default __R.core.ns.AC;\n';
  const order = ctx.order.filter((f) => names.some((n) => mods.get(n).css.includes(f)));
  const css = writeCSS(order, outDir, base, `CSS (${names.join(', ')})`, inRepo);
  const js = jsOut(outDir, base, code, `JS (${names.join(', ')})`);
  return { js, css, names };
}

/** dist/modules/<name>.{js,css}: one module, importing its dependencies' bundles. */
function buildModule(ctx, name) {
  const { mods, groups, graph } = ctx;
  const m = mods.get(name); const g = groups.get(name);
  let code;
  if (name === 'core') {
    code = prologue({ graph, base: './' }) + emitGroup(g) + bootTail('../icons.svg') + exportsFrom(groups, ['core']) + 'export default __R.core.ns.AC;\n';
  } else {
    const deps = [...new Set(['core', ...g.deps])].filter((d) => !d.startsWith('@') && d !== name);
    // dependencies already in the registry (full bundle, custom build, earlier AC.use) are not even downloaded
    code = prologue({}) + deps.map((d) => `if (!__R[${J(d)}]) await import('./${d}.js');\n`).join('') + emitGroup(g);
    const keys = [...g.ns.keys()].filter((k) => k !== 'default' && /^[A-Za-z_$][\w$]*$/.test(k));
    code += keys.length ? `export const { ${keys.join(', ')} } = __R[${J(name)}].ns;\n` : '';
    code += `export default __R[${J(name)}].ns;\n`;
  }
  const js = jsOut(MODDIR, name, code, `module ${name}`);
  const css = m.css.length ? writeCSS(ctx.order.filter((f) => m.css.includes(f)), MODDIR, name, `module ${name} CSS`) : null;
  return { js, css };
}

/* ================================================================== demo page → module map */
function pageMap(pagesDir, provides, included) {
  const map = {};
  if (!existsSync(pagesDir)) return map;
  for (const f of readdirSync(pagesDir).filter((x) => x.endsWith('.html')).sort()) {
    const page = f.replace(/\.html$/, '');
    const html = read(join(pagesDir, f));
    const js = existsSync(join(pagesDir, `${page}.js`)) ? read(join(pagesDir, `${page}.js`)) : '';
    const need = needs(html, js, provides).filter((n) => !included.includes(n));
    const explicit = (html.match(/data-modules="([^"]+)"/) || [])[1];
    if (explicit) need.push(...explicit.split(/[\s,]+/).filter(Boolean));
    if (need.length) map[page] = [...new Set(need)].sort();
  }
  return map;
}
function needs(html, js, provides) {
  const comps = new Set(); const attrs = new Set(); const api = new Set();
  for (const m of html.matchAll(/data-ac="([^"]+)"/g)) m[1].split(/\s+/).forEach((x) => comps.add(x));
  for (const m of (html + js).matchAll(/data-(ac-[a-z][\w-]*)/g)) attrs.add(m[1]);
  for (const m of js.matchAll(/\bAC\.([A-Za-z_$][\w$]*)/g)) api.add(m[1]);
  for (const m of js.matchAll(/\{([^{}]*)\}\s*=\s*AC\b/g)) parseSpecifiers(m[1].replace(/:/g, ' as ')).forEach((s) => api.add(s.local));
  for (const m of js.matchAll(/data-ac="([^"]+)"/g)) m[1].split(/\s+/).forEach((x) => comps.add(x));
  const classes = new Set([...(html + js).matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c.startsWith('ac-')).map((c) => c.replace(/(__|--).*$/, '')));
  const out = [];
  for (const [name, p] of provides) {
    if (name === 'core') continue;
    if (p.components.some((c) => comps.has(c)) || p.attrs.some((a) => attrs.has(a)) || p.api.some((a) => api.has(a)) || p.classes.some((c) => classes.has(c))) out.push(name);
  }
  return out;
}

/* ================================================================== icons / banks / fonts / boot */
function buildIcons() {
  const list = join(SRC, 'icons', 'icons.txt');
  const lucide = join(ROOT, 'node_modules', 'lucide-static', 'icons');
  const names = existsSync(list) ? [...new Set(read(list).split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim()).filter(Boolean))].sort() : [];
  const missing = [];
  let symbols = '';
  for (const name of names) {
    const custom = join(SRC, 'icons', `${name}.svg`);
    const file = existsSync(custom) ? custom : join(lucide, `${name}.svg`);
    if (!existsSync(file)) { missing.push(name); continue; }
    const svg = read(file).replace(/<!--[\s\S]*?-->/g, '');
    const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 24 24';
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s*\n\s*/g, '').trim();
    symbols += `<symbol id="i-${name}" viewBox="${vb}">${inner}</symbol>`;
  }
  for (const [from, to] of [[join(ROOT, 'LICENSE'), 'LICENSE.txt'], [join(ROOT, 'node_modules', 'lucide-static', 'LICENSE'), 'LICENSE-lucide.txt']]) if (existsSync(from)) copyFileSync(from, join(DIST, to));
  writeFileSync(join(DIST, 'icons.svg'), `<!-- Icons: Lucide (https://lucide.dev), ISC License, see LICENSE-lucide.txt -->\n<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>\n`);
  if (missing.length) console.warn(`  ! icons not found in lucide-static: ${missing.join(', ')}`);
  return { icons: names.length - missing.length };
}

// src/banks/banks.json + src/banks/logos/<slug>(.mono|.si).svg → dist/banks.svg + dist/banks.json.
// Symbols: "bank-<slug>" (colour) and "bank-<slug>-mono" (currentColor); card networks use "net-<slug>".
// Logo kind "monogram" = a generated badge (short name on the brand colour), never a copied logo.
function buildBanks() {
  const dir = join(SRC, 'banks');
  if (!existsSync(join(dir, 'banks.json'))) return { banks: 0 };
  const meta = JSON.parse(read(join(dir, 'banks.json')));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const body = (file, id) => {
    const svg = read(file).replace(/<!--[\s\S]*?-->/g, '');
    const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 24 24';
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s*\n\s*/g, ' ').trim()
      .replace(/id="([^"]+)"/g, (_, x) => `id="${id}-${x}"`).replace(/url\(#([^)]+)\)/g, (_, x) => `url(#${id}-${x})`)
      .replace(/ d="([^"]+)"/g, (m, d) => { // round path numbers to 0.1 (invisible in a 48-unit box); arcs/exponents left alone
        if (/[aAeE]/.test(d)) return m;
        let o = '';
        for (const t of d.match(/-?(?:\d+\.?\d*|\.\d+)|[^\d.-]+/g) || []) {
          if (!/\d/.test(t)) { o += t; continue; }
          const r = /\.\d{2,}/.test(t) ? String(+(+t).toFixed(1)).replace(/^(-?)0\./, '$1.') : t;
          o += (/[\d.]$/.test(o) && r[0] !== '-' && !(r[0] === '.' && o.slice(o.search(/[\d.]+$/)).includes('.')) ? ' ' : '') + r;
        }
        return ` d="${o}"`;
      });
    return { vb, inner };
  };
  const badge = (b, id, color) => {
    const txt = b.short || b.en; const fs = txt.length > 4 ? 12 : txt.length > 2 ? 15 : 19;
    const bg = color ? `fill="${color}"` : 'fill="currentColor" fill-opacity=".14"';
    return `<symbol id="${id}" viewBox="0 0 48 48"><rect x="1" y="1" width="46" height="46" rx="14" ${bg}/><text x="24" y="25" text-anchor="middle" dominant-baseline="central" font-family="Vazirmatn,system-ui,sans-serif" font-weight="800" font-size="${fs}" fill="${color ? '#fff' : 'currentColor'}">${esc(txt)}</text></symbol>`;
  };
  let out = ''; let n = 0;
  const add = (b, pre) => {
    const id = `${pre}-${b.slug}`; const f = (x) => join(dir, 'logos', `${b.slug}${x}.svg`);
    const color = b.color || b.colors?.[0];
    if (b.logo === 'monogram') { out += badge(b, id, color) + badge(b, `${id}-mono`); n++; return; }
    if (existsSync(f('.si'))) {
      const s = body(f('.si'), id);
      out += `<symbol id="${id}" viewBox="${s.vb}"><g fill="${color}">${s.inner}</g></symbol><symbol id="${id}-mono" viewBox="${s.vb}"><g fill="currentColor">${s.inner}</g></symbol>`;
      n++; return;
    }
    if (!existsSync(f(''))) { console.warn(`  ! bank logo missing: ${b.slug}`); return; }
    const c = body(f(''), id);
    out += `<symbol id="${id}" viewBox="${c.vb}">${c.inner}</symbol>`;
    if (existsSync(f('.mono'))) {
      const m = body(f('.mono'), `${id}-mono`);
      out += `<symbol id="${id}-mono" viewBox="${m.vb}">${m.inner.replace(/fill="#(?:000|000000|fff|ffffff)"/gi, 'fill="currentColor"')}</symbol>`;
    }
    n++;
  };
  [...meta.banks, ...(meta.foreign || [])].forEach((b) => add(b, 'bank'));
  (meta.networks || []).forEach((b) => add(b, 'net'));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute">${out}</svg>\n`;
  writeFileSync(join(DIST, 'banks.svg'), svg);
  writeFileSync(join(DIST, 'banks.json'), JSON.stringify(meta));
  const lic = join(dir, 'LICENSES', 'iranian-banks-icons-core.MIT.txt'); // the MIT notice travels with the vendored logos
  if (existsSync(lic)) writeFileSync(join(DIST, 'LICENSE-bank-logos.txt'), `Iranian bank logos in banks.svg: @iran-utils/iranian-banks-icons-core 1.0.4 (MIT, below)\nCard network and international bank logos: simple-icons 16.35.0 (CC0-1.0)\nAll logos are trademarks of their respective owners, included for identification only. See src/banks/SOURCES.md.\n\n${read(lic)}`);
  return { banks: n, size: kb(Buffer.byteLength(svg)) };
}

function copyFonts() {
  const from = join(SRC, 'fonts'); const to = join(DIST, 'fonts');
  mkdirSync(to, { recursive: true });
  for (const f of readdirSync(from)) if (statSync(join(from, f)).isFile()) copyFileSync(join(from, f), join(to, f));
}

/* ================================================================== orchestration */
function context(extra = {}) {
  const { json, mods } = loadManifest();
  const prog = program(mods);
  const groups = graphOf(mods, prog);
  const provides = providesOf(mods, groups);
  const graph = graphJSON(mods, groups, provides);
  // files of src/css/components not declared by any module ride along in the full bundle only
  const declared = new Set([...mods.values()].flatMap((m) => m.css));
  const order = cssOrder(mods);
  for (const f of order) if (!declared.has(f)) console.warn(`  ! ${f} is not declared in src/modules.json (full bundle only)`);
  for (const f of prog.files.values()) if (f.group === '@index' && f.rel !== 'js/index.js') console.warn(`  ! ${f.rel} is not declared in src/modules.json (full bundle only)`);
  return { json, mods, prog, groups, provides, graph, order, ...extra };
}

const row = (name, s) => `${name.padEnd(16)} ${s ? `${kb(s.raw).padStart(9)} ${kb(s.min).padStart(9)} ${kb(s.gzip).padStart(9)}` : '        —'.padEnd(29)}`;
function table(title, rows) {
  console.log(`\n${title}\n${'module'.padEnd(16)} ${'js raw'.padStart(9)} ${'js min'.padStart(9)} ${'js gz'.padStart(9)}   ${'css raw'.padStart(9)} ${'css min'.padStart(9)} ${'css gz'.padStart(9)}`);
  for (const [name, r] of rows) console.log(`${row(name, r.js)}   ${row('', r.css).trim().padStart(29)}`);
}

function loadConfig(file) {
  const cfg = JSON.parse(read(file));
  const dir = dirname(file);
  return { ...cfg, out: resolve(dir, cfg.out || 'dist/aramin'), pages: cfg.pages ? resolve(dir, cfg.pages) : null, file };
}

function buildFromConfig(ctx, cfg, quiet) {
  let extraCode = '';
  if (cfg.pages) {
    const included = topo(ctx.groups, ['core', ...cfg.modules]);
    const map = pageMap(cfg.pages, ctx.provides, included);
    extraCode = `__R.__pages = ${J(map)};\n`;
    const shell = existsSync(join(dirname(cfg.pages), 'index.html')) ? needs(read(join(dirname(cfg.pages), 'index.html')), '', ctx.provides).filter((n) => !included.includes(n)) : [];
    if (shell.length) console.warn(`  ! ${posix(relative(ROOT, cfg.file))}: the shell markup also needs ${shell.join(', ')} — add to "modules"`);
  }
  const r = buildCustom({ ...ctx, modulesBase: cfg.modulesBase }, cfg.modules, cfg.out, cfg.name || 'aramin-console', extraCode);
  if (!quiet) console.log(`custom build → ${posix(relative(process.cwd(), cfg.out))}/${cfg.name || 'aramin-console'}.{js,css}  [${r.names.join(', ')}]  js ${kb(r.js.min)} min / ${kb(r.js.gzip)} gz · css ${kb(r.css.min)} min / ${kb(r.css.gzip)} gz`);
  return r;
}

/** Every file demo/ references (HTML src/href, JS imports, CSS url(), service-worker precache list) must exist after a build. */
function checkDemoRefs() {
  const demo = join(ROOT, 'demo');
  if (!existsSync(demo)) return [];
  const missing = [];
  const files = [];
  const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(html|m?js|css|webmanifest)$/.test(f)) files.push(p); });
  walk(demo);
  for (const file of files) {
    const src = read(file);
    // fragments (demo/pages/*.html) are injected into demo/index.html, so they resolve from demo/
    const from = file.endsWith('.html') && dirname(file) === join(demo, 'pages') ? demo : file.endsWith('sw.js') ? demo : dirname(file);
    const refs = new Set();
    const add = (u) => { if (u && !/^(?:[a-z]+:|\/\/|#|\{|data:)/i.test(u) && !/[${}*]/.test(u) && /\.[a-z0-9]+(?:[?#].*)?$/i.test(u)) refs.add(u.replace(/[?#].*$/, '')); };
    if (/\.html$/.test(file)) for (const m of src.matchAll(/\s(?:src|href)="([^"]+)"/g)) add(m[1]);
    if (/\.m?js$/.test(file)) {
      for (const m of src.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s+)['"](\.{1,2}\/[^'"]+)['"]/gm)) add(m[1]);
      if (file.endsWith('sw.js')) for (const m of src.matchAll(/'(\.{1,2}\/[^']+\.[a-z0-9]+)'/gi)) add(m[1]);
    }
    if (/\.css$/.test(file)) for (const m of src.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) add(m[1]);
    if (/\.webmanifest$/.test(file)) for (const m of src.matchAll(/"src"\s*:\s*"([^"]+)"/g)) add(m[1]);
    for (const u of refs) if (!existsSync(resolve(from, decodeURIComponent(u)))) missing.push(`${posix(relative(ROOT, file))} → ${u}`);
  }
  return missing;
}

/** demo/sw.js: stamp const BUILD = '<hash of everything the demo serves>' so each build installs a new worker (update flow). */
function stampSW() {
  const sw = join(ROOT, 'demo', 'sw.js');
  if (!existsSync(sw)) return null;
  const hash = createHash('sha1');
  const walk = (d) => { if (!existsSync(d)) return; for (const f of readdirSync(d).sort()) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p !== sw && !/\.(png|woff2)$/.test(f)) hash.update(readFileSync(p)); } };
  [join(DIST, 'demo'), MODDIR, join(ROOT, 'demo')].forEach(walk);
  for (const f of ['aramin-console.js', 'aramin-console.css', 'icons.svg', 'aramin-console-boot.js']) if (existsSync(join(DIST, f))) hash.update(readFileSync(join(DIST, f)));
  const id = hash.digest('hex').slice(0, 10);
  const src = read(sw);
  const next = src.replace(/const BUILD = '[^']*';/, `const BUILD = '${id}';`);
  if (next !== src) writeFileSync(sw, next);
  return id;
}

function syncManifest(ctx, sizes) {
  const file = join(SRC, 'modules.json');
  const json = existsSync(file) ? JSON.parse(read(file)) : { modules: [] };
  const byName = new Map(json.modules.map((m) => [m.name, m]));
  for (const m of ctx.mods.values()) {
    const rec = byName.get(m.name) || { name: m.name };
    if (m.kind === 'module') Object.assign(rec, { kind: 'module', description: rec.description || m.description, css: m.css, js: m.js, dependencies: rec.dependencies || m.dependencies });
    const s = sizes[m.name];
    if (s) rec.size = { js: s.js && { min: s.js.min, gzip: s.js.gzip }, css: s.css && { min: s.css.min, gzip: s.css.gzip } };
    if (!byName.has(m.name)) { json.modules.push(rec); byName.set(m.name, rec); }
  }
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`synced ${posix(relative(ROOT, file))} (${json.modules.length} modules)`);
}

function build() {
  const t0 = Date.now();
  const quiet = !!arg('quiet');
  mkdirSync(DIST, { recursive: true });
  try {
    const custom = arg('modules');
    const cfgPath = typeof arg('config') === 'string' ? resolve(arg('config')) : (process.cwd() !== ROOT && existsSync(resolve('aramin.config.json')) ? resolve('aramin.config.json') : null);
    if (custom || cfgPath) { // custom build only
      const ctx = context();
      const cfg = cfgPath ? loadConfig(cfgPath) : { modules: String(custom).split(',').map((s) => s.trim()).filter(Boolean), out: resolve(typeof arg('out') === 'string' ? arg('out') : 'dist/custom'), name: typeof arg('name') === 'string' ? arg('name') : undefined, pages: null };
      if (custom && cfgPath) cfg.modules = String(custom).split(',');
      buildFromConfig(ctx, cfg, quiet);
      return true;
    }
    const ctx = context();
    const i = buildIcons(); const b = buildBanks(); copyFonts();
    const boot = join(SRC, 'js', 'boot.js');
    if (existsSync(boot)) writeFileSync(join(DIST, 'aramin-console-boot.js'), banner('boot') + read(boot));
    const full = buildFull(ctx);
    const sizes = {};
    for (const name of ctx.mods.keys()) if (ctx.groups.has(name)) sizes[name] = buildModule(ctx, name);
    const graphFile = {};
    for (const [n, s] of Object.entries(sizes)) graphFile[n] = { ...(ctx.graph[n] || { deps: [] }), description: ctx.mods.get(n).description, kind: ctx.mods.get(n).kind, size: s };
    // drop bundles of modules that no longer exist (never wipe the folder: a parallel build / the dev server may be reading it)
    for (const f of readdirSync(MODDIR)) { const m = f.match(/^(.+?)(?:\.min)?\.(?:js|css)$/); if (m && !sizes[m[1]]) rmSync(join(MODDIR, f), { force: true }); }
    writeFileSync(join(MODDIR, 'modules.json'), `${JSON.stringify({ version: VERSION, modules: graphFile }, null, 1)}\n`);
    const demoCfg = join(ROOT, 'demo', 'aramin.config.json');
    const demo = existsSync(demoCfg) ? buildFromConfig(ctx, loadConfig(demoCfg), true) : null;
    if (demo) stampSW();
    // Guard: a module that has source CSS must never ship an (almost) empty stylesheet.
    const hollow = [...ctx.mods.values()].filter((m) => m.kind === 'module' && m.css.length && sizes[m.name] && existsSync(join(MODDIR, `${m.name}.css`)) && statSync(join(MODDIR, `${m.name}.css`)).size < 400).map((m) => m.name);
    if (hollow.length) throw new Error(`module stylesheet(s) came out empty: ${hollow.join(', ')} — check kind/files in src/modules.json`);
    const missing = checkDemoRefs();
    if (missing.length) throw new Error(`demo references ${missing.length} missing file(s):\n    ${missing.join('\n    ')}`);
    console.log(`AraminConsole built in ${Date.now() - t0}ms — css ${kb(full.css.raw)} (min ${kb(full.css.min)}, gz ${kb(full.css.gzip)}) · js ${kb(full.js.raw)} (min ${kb(full.js.min)}, gz ${kb(full.js.gzip)}) · ${Object.keys(sizes).length} modules · ${i.icons} icons · ${b.banks} bank logos ${b.size || ''}${demo ? ` · demo shell js ${kb(demo.js.gzip)} gz` : ''}`);
    if (!quiet && !arg('watch')) table('per-module bundles (dist/modules/)', Object.entries(sizes));
    if (arg('sync-manifest')) syncManifest(ctx, sizes);
    return true;
  } catch (err) {
    console.error('Build failed:', err.message);
    if (process.env.AC_DEBUG) console.error(err.stack);
    return false;
  }
}

const ok = build();
if (arg('watch')) {
  let t;
  console.log('watching src/ …');
  watch(SRC, { recursive: true }, () => { clearTimeout(t); t = setTimeout(build, 80); });
} else if (!ok) process.exit(1);
