/* Module loader — AC.use('maps', 'marketing') lazily loads per-module bundles (dist/modules/<name>.{js,css}) with their
   dependencies, once. CSS is awaited before the promise resolves (no flash of unstyled content) and is inserted right after
   the framework stylesheet, so later page / app stylesheets still win the cascade.
   Every bundle the build writes shares one registry: globalThis.__AC_MODS__ = { <module>: { f, ns }, __graph, __css:Set, __base }.
   A module already present (full bundle, custom build or an earlier AC.use) is never loaded twice.
   AC.use(name…) → Promise<ns | ns[]> · AC.use.loaded(name) · AC.use.preload(name…) · AC.use.base = 'https://cdn/…/dist/modules/'
   Event: ac:module:load { name } on document. */
import { AC, emit } from './core.js';

const R = (globalThis.__AC_MODS__ ||= {});
R.__css ||= new Set();
const pending = new Map();

const graph = () => R.__graph || {};
const base = () => use.base || document.documentElement.dataset.acModules || R.__base || new URL('../../dist/modules/', import.meta.url).href;
const url = (file) => new URL(file, base().replace(/\/?$/, '/')).href;

/** name + its dependencies, dependencies first. */
function closure(name, out = [], seen = new Set()) {
  if (seen.has(name)) return out;
  seen.add(name);
  for (const d of graph()[name]?.deps || []) closure(d, out, seen);
  out.push(name);
  return out;
}

function anchor() {
  const links = document.querySelectorAll('link[rel="stylesheet"][data-ac-css], link[rel="stylesheet"][data-ac-module]');
  if (links.length) return links[links.length - 1];
  return [...document.querySelectorAll('link[rel="stylesheet"]')].filter((l) => /aramin-console[^/]*\.css|\/modules\/[^/]+\.css/.test(l.href)).pop() || null;
}

function loadCSS(name) {
  if (R.__css.has(name) || graph()[name]?.css === false) return Promise.resolve();
  const found = document.querySelector(`link[data-ac-module="${name}"], style[data-ac-module="${name}"]`);
  R.__css.add(name);
  if (found) return Promise.resolve();
  return new Promise((resolve) => {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: url(`${name}${R.__min ? '.min' : ''}.css`) });
    link.dataset.acModule = name;
    link.onload = resolve;
    link.onerror = () => { console.warn(`[AC] module css failed: ${name}`); resolve(); };
    const a = anchor();
    if (a) a.after(link); else document.head.append(link);
  });
}

function loadOne(name) {
  if (R[name]?.ns) return Promise.resolve(R[name].ns);
  if (pending.has(name)) return pending.get(name);
  const p = Promise.all([import(url(`${name}${R.__min ? '.min' : ''}.js`)), loadCSS(name)]).then(([ns]) => {
    pending.delete(name);
    emit(document, 'module:load', { name });
    return R[name]?.ns || ns;
  }, (err) => { pending.delete(name); throw err; });
  pending.set(name, p);
  return p;
}

export function use(...names) {
  const list = names.flat().filter(Boolean);
  const all = [...new Set(list.flatMap((n) => closure(n)))];
  // dependencies' CSS and JS start in parallel; the JS of a module imports its dependencies' JS itself
  all.forEach((n) => { if (!R[n]) loadCSS(n); });
  return Promise.all(list.map(async (n) => {
    await Promise.all(closure(n).map((d) => (R[d] ? loadCSS(d) : loadOne(d))));
    return R[n]?.ns || loadOne(n);
  })).then((r) => (list.length === 1 ? r[0] : r));
}
use.loaded = (name) => !!R[name];
use.list = () => Object.keys(R).filter((k) => !k.startsWith('__') && !k.startsWith('@'));
use.graph = graph;
use.preload = (...names) => {
  for (const n of names.flat().flatMap((x) => closure(x))) {
    if (R[n] || document.querySelector(`link[rel="modulepreload"][data-ac-module="${n}"]`)) continue;
    const l = Object.assign(document.createElement('link'), { rel: 'modulepreload', href: url(`${n}${R.__min ? '.min' : ''}.js`) });
    l.dataset.acModule = n;
    document.head.append(l);
  }
};
/** Modules that provide a data-ac component, an AC.<api>, a [data-ac-*] attribute or a block class (from the build graph). */
use.providers = ({ components = [], api = [], attrs = [], classes = [] } = {}) => {
  const g = graph(); const out = new Set();
  for (const [name, m] of Object.entries(g)) {
    const p = m.provides || {};
    if (components.some((c) => p.components?.includes(c)) || api.some((a) => p.api?.includes(a)) || attrs.some((a) => p.attrs?.includes(a)) || classes.some((c) => p.classes?.includes(c))) out.add(name);
  }
  return [...out];
};

AC.use = use;
