/* ==========================================================================
   AraminConsole — core runtime
   --------------------------------------------------------------------------
   AC namespace, declarative component registry (data-ac="name" auto-init via
   MutationObserver), events, DOM helpers, focus trap, scroll lock, storage,
   pointer gestures, icon sprite loader, theme, i18n + number formatting,
   animated counters.
   Export forms used here (and in every module) are limited to
   `export function`, `export const` and `export { … }` — the zero-dep
   bundler in scripts/build.mjs understands exactly those.
   ========================================================================== */

export const AC = {};
export const version = '0.1.0';

const root = document.documentElement;
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------------------------------------------------------------- utilities */
export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** on(target, 'click', handler) or delegated: on(target, 'click', '.sel', handler). Returns off(). */
export function on(target, type, selOrFn, fnOrOpts, maybeOpts) {
  let handler = selOrFn;
  let opts = fnOrOpts;
  if (typeof selOrFn === 'string') {
    const sel = selOrFn;
    const fn = fnOrOpts;
    opts = maybeOpts;
    handler = (e) => {
      const match = e.target instanceof Element ? e.target.closest(sel) : null;
      if (match && (target === document || target === window || target.contains(match))) fn.call(match, e, match);
    };
  }
  target.addEventListener(type, handler, opts);
  return () => target.removeEventListener(type, handler, opts);
}

/** Dispatch a bubbling, cancelable CustomEvent `ac:<name>`. Returns the event. */
export function emit(el, name, detail = {}) {
  const ev = new CustomEvent(`ac:${name}`, { bubbles: true, cancelable: true, detail });
  (el || document).dispatchEvent(ev);
  return ev;
}

/** h('button', { class: 'ac-btn', onclick: fn, 'aria-label': 'x' }, 'text', childEl) */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

let uidN = 0;
export const uid = (prefix = 'ac') => `${prefix}-${(++uidN).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
export const isRTL = (el = root) => getComputedStyle(el).direction === 'rtl';
/* Motion preference: 'system' (follow the OS) | 'full' | 'reduced' — persisted as ac:motion, resolved onto
   <html data-motion="full|reduced">. "Reduced" is NOT "none": fades, colour, blur crossfades, count-ups and chart
   reveals stay; travel (translate / scale / springs / parallax) and decorative loops go. 'full' gives the whole
   experience even when the OS asks for less (Windows "Animation effects" off makes every browser say reduce). */
export const motionPref = {
  get() { const v = store.get('ac:motion', document.documentElement.getAttribute('data-motion-default') || 'system'); return v === 'full' || v === 'reduced' ? v : 'system'; },
  resolved() { const p = motionPref.get(); return p === 'system' ? (reduceMQ.matches ? 'reduced' : 'full') : p; },
  set(v) {
    store.set('ac:motion', v === 'full' || v === 'reduced' ? v : 'system');
    motionPref.apply();
    emit(document, 'motion:change', { preference: motionPref.get(), resolved: motionPref.resolved() });
  },
  apply() { if (root.dataset.motion !== 'off') root.dataset.motion = motionPref.resolved(); },
};
reduceMQ.addEventListener?.('change', () => { if (motionPref.get() === 'system') { motionPref.apply(); emit(document, 'motion:change', { preference: 'system', resolved: motionPref.resolved() }); } });
/** true when spatial motion should be skipped (preference 'reduced', or 'system' + OS reduce). */
export const reducedMotion = () => root.dataset.motion === 'off' || (root.dataset.motion ? root.dataset.motion === 'reduced' : motionPref.resolved() === 'reduced');
export const isMobile = () => matchMedia('(max-width: 1023.98px)').matches;
export function debounce(fn, ms = 150) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
export function rafThrottle(fn) {
  let queued = false; let args;
  return (...a) => { args = a; if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; fn(...args); }); } };
}
export function haptic(ms = 6) { try { navigator.vibrate?.(ms); } catch { /* ignore */ } }

/** Read component options: data-ac-config='{json}' merged with data-* attributes (camelCased). */
export function options(el, defaults = {}) {
  const out = { ...defaults };
  for (const [k, v] of Object.entries(el.dataset)) {
    if (k === 'ac' || k === 'acConfig') continue;
    out[k] = v === '' ? true : v === 'true' ? true : v === 'false' ? false : (v !== '' && !isNaN(v) ? Number(v) : v);
  }
  if (el.dataset.acConfig) {
    try { Object.assign(out, JSON.parse(el.dataset.acConfig)); } catch (e) { console.warn('[AC] bad data-ac-config', el, e); }
  }
  return out;
}

/* ---------------------------------------------------------------- storage */
export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      try { return JSON.parse(raw); } catch { return raw; }
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); } catch { /* private mode */ }
  },
  remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

/* ---------------------------------------------------------------- registry */
const registry = new Map();          // name -> init(el, AC) => destroy?
const live = new WeakMap();          // el -> Map(name -> destroy|null)
let booted = false;

function initEl(el) {
  const names = (el.getAttribute('data-ac') || '').split(/\s+/).filter(Boolean);
  if (!names.length) return;
  let map = live.get(el);
  for (const name of names) {
    const init = registry.get(name);
    if (!init || map?.has(name)) continue;
    if (!map) { map = new Map(); live.set(el, map); }
    map.set(name, null);
    try {
      const destroy = init(el, AC);
      map.set(name, typeof destroy === 'function' ? destroy : null);
    } catch (err) {
      console.error(`[AC] ${name} init failed`, el, err);
    }
  }
}

function destroyEl(el) {
  const map = live.get(el);
  if (!map) return;
  for (const [name, destroy] of map) {
    try { destroy?.(); } catch (err) { console.error(`[AC] ${name} destroy failed`, err); }
  }
  live.delete(el);
}

/** Register a component. init(el, AC) may return a destroy function. */
export function register(name, init) {
  registry.set(name, init);
  if (booted) $$(`[data-ac~="${name}"]`).forEach(initEl);
}

/** Initialise every [data-ac] inside root (root included). Idempotent. */
export function scan(rootEl = document) {
  if (rootEl.nodeType !== 1 && rootEl !== document) return;
  if (rootEl.matches?.('[data-ac]')) initEl(rootEl);
  rootEl.querySelectorAll('[data-ac]').forEach(initEl);
}

/** Destroy every component inside root (root included). */
export function teardown(rootEl) {
  if (rootEl.nodeType !== 1) return;
  if (rootEl.matches('[data-ac]')) destroyEl(rootEl);
  rootEl.querySelectorAll('[data-ac]').forEach(destroyEl);
}

/** Get the component instance API an init stored with AC.instance(el, name, api). */
const apis = new WeakMap();
export function instance(el, name, api) {
  if (api !== undefined) {
    let m = apis.get(el); if (!m) { m = {}; apis.set(el, m); }
    m[name] = api; return api;
  }
  return apis.get(el)?.[name];
}

function observe() {
  const mo = new MutationObserver((records) => {
    const removed = new Set();
    const added = new Set();
    for (const r of records) {
      r.removedNodes.forEach((n) => { if (n.nodeType === 1) removed.add(n); });
      r.addedNodes.forEach((n) => { if (n.nodeType === 1) added.add(n); });
    }
    removed.forEach((n) => { if (!n.isConnected) teardown(n); });
    added.forEach((n) => {
      if (!n.isConnected) return;
      if (i18n.ready) i18n.translate(n);
      scan(n);
    });
  });
  mo.observe(root, { childList: true, subtree: true });
}

/* ---------------------------------------------------------------- focus trap */
const FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
export const focusables = (el) => $$(FOCUSABLE, el).filter((n) => n.offsetParent !== null || n === document.activeElement);
const trapStack = [];

/** trapFocus(container, { initial?: el|selector, returnFocus?: true }) → release() */
export function trapFocus(container, { initial, returnFocus = true } = {}) {
  const previous = document.activeElement;
  const onKey = (e) => {
    if (e.key !== 'Tab' || trapStack[trapStack.length - 1] !== container) return;
    const list = focusables(container);
    if (!list.length) { e.preventDefault(); container.focus(); return; }
    const first = list[0]; const last = list[list.length - 1];
    if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  };
  trapStack.push(container);
  document.addEventListener('keydown', onKey, true);
  const target = typeof initial === 'string' ? $(initial, container) : initial;
  requestAnimationFrame(() => {
    const el = target || focusables(container)[0] || container;
    if (el === container && !container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  });
  return function release() {
    document.removeEventListener('keydown', onKey, true);
    const i = trapStack.lastIndexOf(container);
    if (i > -1) trapStack.splice(i, 1);
    if (returnFocus && previous && previous.focus && document.contains(previous)) previous.focus({ preventScroll: true });
  };
}

/* ---------------------------------------------------------------- scroll lock */
let lockCount = 0;
export const scrollLock = {
  lock() {
    if (lockCount++ === 0) {
      const w = window.innerWidth - root.clientWidth;
      root.style.setProperty('--ac-scrollbar-w', `${w}px`);
      root.setAttribute('data-scroll-locked', '');
    }
  },
  unlock() {
    if (lockCount === 0) return;
    if (--lockCount === 0) root.removeAttribute('data-scroll-locked');
  },
  get locked() { return lockCount > 0; },
};

/* ---------------------------------------------------------------- gestures */
/**
 * gesture(el, { axis: 'x'|'y'|'both', threshold: 8, filter(e), onStart(s), onMove(s), onEnd(s) }) → destroy()
 * State s: { x, y, dx, dy, vx, vy (px/ms), axis, pointerType, target, event, elapsed }
 * Axis lock: once movement passes `threshold`, the dominant axis wins. If it is not
 * the requested axis the gesture is abandoned (the browser keeps scrolling).
 * After a real drag the following click is swallowed. Set CSS touch-action on `el`
 * (e.g. pan-y for horizontal swipes) so the browser lets you have the other axis.
 */
export function gesture(el, opts = {}) {
  const o = { axis: 'both', threshold: 8, ...opts };
  let s = null;
  let samples = [];
  let suppressClick = false;

  const down = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (o.filter && o.filter(e) === false) return;
    s = { startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, dx: 0, dy: 0, vx: 0, vy: 0, axis: null, pointerType: e.pointerType, target: e.target, event: e, t0: performance.now(), elapsed: 0, pointerId: e.pointerId };
    samples = [{ x: e.clientX, y: e.clientY, t: s.t0 }];
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
  };
  const move = (e) => {
    if (!s || e.pointerId !== s.pointerId) return;
    const now = performance.now();
    s.x = e.clientX; s.y = e.clientY;
    s.dx = e.clientX - s.startX; s.dy = e.clientY - s.startY;
    s.event = e; s.elapsed = now - s.t0;
    samples.push({ x: e.clientX, y: e.clientY, t: now });
    while (samples.length > 2 && now - samples[0].t > 100) samples.shift();
    if (!s.axis) {
      if (Math.hypot(s.dx, s.dy) < o.threshold) return;
      s.axis = Math.abs(s.dx) > Math.abs(s.dy) ? 'x' : 'y';
      if (o.axis !== 'both' && s.axis !== o.axis) { cleanup(); return; }
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      if (o.onStart && o.onStart(s) === false) { cleanup(); return; }
    }
    const first = samples[0]; const dt = Math.max(1, now - first.t);
    s.vx = (e.clientX - first.x) / dt; s.vy = (e.clientY - first.y) / dt;
    if (e.cancelable) e.preventDefault();
    o.onMove?.(s);
  };
  const finish = (cancelled) => {
    const st = s;
    cleanup();
    if (!st || !st.axis) return;
    st.cancelled = cancelled;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    o.onEnd?.(st);
  };
  const up = (e) => { if (s && e.pointerId === s.pointerId) finish(false); };
  const cancel = (e) => { if (s && e.pointerId === s.pointerId) finish(true); };
  const cleanup = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
    s = null;
  };
  const click = (e) => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; } };
  el.addEventListener('pointerdown', down);
  el.addEventListener('click', click, true);
  return () => { cleanup(); el.removeEventListener('pointerdown', down); el.removeEventListener('click', click, true); };
}

/* ---------------------------------------------------------------- icons */
const iconLoads = new Map();
export const icons = {
  /** Fetch an SVG sprite and inject it hidden at the top of <body>, so <use href="#i-name"> works. */
  load(url) {
    const key = String(url);
    if (iconLoads.has(key)) return iconLoads.get(key);
    const p = fetch(key)
      .then((r) => { if (!r.ok) throw new Error(`${r.status} ${key}`); return r.text(); })
      .then((svg) => {
        const holder = document.createElement('div');
        holder.setAttribute('aria-hidden', 'true');
        holder.setAttribute('data-ac-sprite', key);
        holder.className = 'ac-visually-hidden';
        holder.innerHTML = svg;
        document.body.prepend(holder);
        return holder;
      })
      .catch((err) => { console.warn('[AC] icon sprite failed to load', err); iconLoads.delete(key); });
    iconLoads.set(key, p);
    return p;
  },
};
/** SVG markup for a sprite icon. */
export const icon = (name, cls = '') => `<svg class="ac-icon${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

/* ---------------------------------------------------------------- theme */
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
const THEME_KEYS = { theme: 'ac:theme', accent: 'ac:accent', density: 'ac:density', radius: 'ac:radius' };
const THEME_DEFAULTS = { theme: 'light', accent: 'orange', density: 'comfortable', radius: 'default' };
export const theme = {
  accents: ['orange', 'violet', 'blue', 'emerald', 'rose', 'amber', 'slate'],
  /** { theme: 'auto'|'light'|'dark', resolved: 'light'|'dark', accent, density, radius } */
  get() {
    const out = {};
    for (const [k, key] of Object.entries(THEME_KEYS)) out[k] = store.get(key, THEME_DEFAULTS[k]) || THEME_DEFAULTS[k];
    out.resolved = out.theme === 'auto' ? (darkMQ.matches ? 'dark' : 'light') : out.theme;
    return out;
  },
  /** set({ theme?, accent?, density?, radius? }) — persists and applies. */
  set(patch = {}) {
    for (const [k, v] of Object.entries(patch)) if (THEME_KEYS[k] && v) store.set(THEME_KEYS[k], v);
    return theme.apply({ animate: 'theme' in patch });
  },
  toggle() {
    return theme.set({ theme: theme.get().resolved === 'dark' ? 'light' : 'dark' });
  },
  apply({ animate = false } = {}) {
    const t = theme.get();
    const commit = () => {
      root.dataset.theme = t.resolved;
      root.dataset.themePref = t.theme;
      root.dataset.accent = t.accent;
      root.dataset.density = t.density;
      root.dataset.radius = t.radius;
      updateThemeColor();
    };
    if (animate && document.startViewTransition && root.dataset.motion !== 'off' && booted) { // crossfade also in reduced mode
      root.classList.add('ac-theme-switching');
      const vt = document.startViewTransition(commit);
      vt.ready.then(() => AC.motion?.themeReveal?.()).catch(() => {});
      vt.finished.finally(() => root.classList.remove('ac-theme-switching'));
    } else commit();
    emit(document, 'theme:change', t);
    return t;
  },
};
function updateThemeColor() {
  const bg = getComputedStyle(root).getPropertyValue('--ac-bg').trim() || (root.dataset.theme === 'dark' ? '#0b0b0c' : '#f2f2f3');
  let meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!meta) { meta = h('meta', { name: 'theme-color' }); document.head.append(meta); }
  meta.setAttribute('content', bg);
}
darkMQ.addEventListener?.('change', () => { if (theme.get().theme === 'auto') theme.apply(); });

/* ---------------------------------------------------------------- i18n */
const RTL_LANGS = ['fa', 'ar', 'he', 'ur', 'ps', 'ckb'];
const LOCALES = { fa: 'fa-IR', en: 'en-US', ar: 'ar-AE' };
const originals = new WeakMap(); // el -> { text, attrs: {} }
const dictCache = new Map();

export const i18n = {
  lang: root.lang || 'fa',
  dict: {},
  ready: false,
  url: null,                         // e.g. 'i18n/{lang}.json'
  digits: store.get('ac:digits', 'latn'),
  configure({ url, digits } = {}) {
    if (url) i18n.url = url;
    if (digits) i18n.setDigits(digits);
    return i18n;
  },
  /** Languages offered by pickers (AC.i18n.languages) — data-driven: push/replace entries to add more.
      { code, name (native), english, dir, glyph (script badge), flag (.ac-flag code), locale? } */
  languages: [
    { code: 'fa', name: 'فارسی', english: 'Persian', dir: 'rtl', glyph: 'فا', flag: 'ir' },
    { code: 'en', name: 'English', english: 'English', dir: 'ltr', glyph: 'En', flag: 'gb' },
    { code: 'ar', name: 'العربية', english: 'Arabic', dir: 'rtl', glyph: 'ع', flag: 'ae' },
  ],
  language(code = i18n.lang) { return i18n.languages.find((l) => l.code === code) || { code, name: code, english: code, dir: RTL_LANGS.includes(String(code).split('-')[0]) ? 'rtl' : 'ltr', glyph: String(code).slice(0, 2) }; },
  get dir() { return RTL_LANGS.includes(i18n.lang.split('-')[0]) ? 'rtl' : 'ltr'; },
  get locale() { return LOCALES[i18n.lang] || i18n.lang; },
  /** Intl locale string honouring the digits setting ('latn' | 'native'). */
  get numberLocale() {
    if (i18n.digits === 'native') return i18n.locale;
    return `${i18n.locale}-u-nu-latn`;
  },
  setDigits(d) {
    i18n.digits = d; store.set('ac:digits', d); root.dataset.digits = d;
    emit(document, 'i18n:change', { lang: i18n.lang, digits: d });
  },
  /** Switch language: loads the JSON dictionary (if url configured), sets lang/dir, translates the page. */
  async set(lang, { persist = true, animate } = {}) {
    lang = lang || 'fa';
    const from = i18n.lang;
    let dict = dictCache.get(lang);
    if (!dict && i18n.url) {
      try {
        const res = await fetch(i18n.url.replace('{lang}', lang));
        dict = res.ok ? await res.json() : {};
      } catch (err) { console.warn('[AC] i18n load failed', err); dict = {}; }
      dictCache.set(lang, dict);
    }
    const apply = () => {
      i18n.dict = dict || {};
      i18n.lang = lang;
      i18n.ready = true;
      root.lang = lang;
      root.dir = i18n.dir;
      if (persist) store.set('ac:lang', lang);
      i18n.translate(document.body || document);
      emit(document, 'i18n:change', { lang, dir: i18n.dir, from });
    };
    // a live switch crossfades the whole document (blur bridge) instead of jumping — motion.js
    if ((animate ?? booted) && from !== lang && AC.motion?.transition) await AC.motion.transition(apply, { kind: 'lang' });
    else apply();
    return lang;
  },
  /** Add/override keys at runtime: AC.i18n.extend('en', { 'users.title': 'Users' }) */
  extend(lang, entries) {
    const d = dictCache.get(lang) || {};
    Object.assign(d, entries); dictCache.set(lang, d);
    if (lang === i18n.lang) { i18n.dict = d; i18n.translate(document.body); }
  },
  /** t('key', 'fallback', { name: 'Ali' }) — {name} placeholders. */
  t(key, fallback, vars) {
    if (fallback && typeof fallback === 'object') { vars = fallback; fallback = undefined; }
    let s = i18n.dict[key] ?? fallback ?? key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
    return s;
  },
  /** Translate [data-i18n] (textContent) and [data-i18n-attr="placeholder:key; aria-label:key"] under root. */
  translate(rootEl = document.body) {
    if (!rootEl || !rootEl.querySelectorAll) return;
    const els = [];
    if (rootEl.matches?.('[data-i18n],[data-i18n-attr]')) els.push(rootEl);
    els.push(...rootEl.querySelectorAll('[data-i18n],[data-i18n-attr]'));
    for (const el of els) {
      let orig = originals.get(el);
      if (!orig) { orig = { text: el.textContent, attrs: {} }; originals.set(el, orig); }
      const key = el.getAttribute('data-i18n');
      if (key) {
        const val = i18n.dict[key];
        const next = val ?? orig.text;
        if (el.textContent !== next) el.textContent = next;
      }
      const spec = el.getAttribute('data-i18n-attr');
      if (spec) {
        for (const part of spec.split(/[;,]/)) {
          const [attr, k] = part.split(':').map((x) => x && x.trim());
          if (!attr || !k) continue;
          if (!(attr in orig.attrs)) orig.attrs[attr] = el.getAttribute(attr);
          const val = i18n.dict[k] ?? orig.attrs[attr];
          if (val != null) el.setAttribute(attr, val);
        }
      }
    }
  },
};

/* ---------------------------------------------------------------- formatting */
export const format = {
  number(n, opts = {}) {
    const { decimals, compact, currency, percent, ...rest } = opts;
    const o = { ...rest };
    if (decimals != null) { o.minimumFractionDigits = decimals; o.maximumFractionDigits = decimals; }
    if (compact) { o.notation = 'compact'; o.maximumFractionDigits ??= 1; }
    if (currency) { o.style = 'currency'; o.currency = currency; o.currencyDisplay ??= 'narrowSymbol'; }
    if (percent) { o.style = 'percent'; }
    try { return new Intl.NumberFormat(i18n.numberLocale, o).format(n); } catch { return String(n); }
  },
  date(d, opts = { dateStyle: 'medium' }) {
    const cal = opts.calendar || (i18n.lang === 'fa' ? 'persian' : 'gregory');
    const { calendar, ...rest } = opts;
    const loc = `${i18n.locale}-u-ca-${cal}${i18n.digits === 'native' ? '' : '-nu-latn'}`;
    try { return new Intl.DateTimeFormat(loc, rest).format(new Date(d)); } catch { return String(d); }
  },
  relative(d) {
    const diff = (new Date(d).getTime() - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
    for (const [u, s] of units) if (Math.abs(diff) >= s || u === 'second') {
      try { return new Intl.RelativeTimeFormat(i18n.numberLocale, { numeric: 'auto' }).format(Math.round(diff / s), u); } catch { return ''; }
    }
    return '';
  },
};

/* ---------------------------------------------------------------- counter */
/* <span data-ac="counter" data-to="12450" [data-from="0"] [data-decimals="0"] [data-duration="1200"]
         [data-prefix="$"] [data-suffix="%"] [data-compact] [data-currency="USD"]>0</span> */
register('counter', (el) => {
  const o = options(el, { from: 0, to: 0, decimals: 0, duration: 1200 });
  let raf = 0; let shown = Number(o.from) || 0;
  const target = () => Number(el.dataset.to ?? o.to) || 0;
  const fmt = (v) => `${o.prefix ?? ''}${format.number(v, { decimals: o.decimals, compact: !!o.compact, currency: o.currency })}${o.suffix ?? ''}`;
  const render = (v) => { el.textContent = fmt(v); };
  const run = () => {
    cancelAnimationFrame(raf);
    const from = shown; const to = target();
    // count-ups are a fade of digits, not travel: they run in reduced mode too (a little shorter)
    const t0 = performance.now(); const dur = Number(o.duration) * (reducedMotion() ? 0.6 : 1);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      shown = from + (to - from) * e;
      render(shown);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  el.classList.add('ac-num');
  render(shown);
  const io = new IntersectionObserver((entries) => {
    if (entries.some((x) => x.isIntersecting)) { io.disconnect(); run(); }
  });
  io.observe(el);
  const mo = new MutationObserver(run);
  mo.observe(el, { attributes: true, attributeFilter: ['data-to'] });
  const offLang = on(document, 'ac:i18n:change', () => render(shown));
  return () => { cancelAnimationFrame(raf); io.disconnect(); mo.disconnect(); offLang(); };
});

/* ---------------------------------------------------------------- boot */
const readyFns = [];
export function ready(fn) { if (booted) fn(AC); else readyFns.push(fn); }

/**
 * boot({ icons?: url|false, i18n?: { url, lang } }) — called by index.js on DOMContentLoaded.
 * Safe to call more than once.
 */
export async function boot(cfg = {}) {
  if (booted) return AC;
  motionPref.apply();
  theme.apply();
  root.dataset.digits = i18n.digits;
  const spriteUrl = cfg.icons ?? root.dataset.acIcons;
  if (spriteUrl && spriteUrl !== 'none') icons.load(spriteUrl);
  if (cfg.i18n?.url) i18n.configure({ url: cfg.i18n.url });
  const lang = cfg.i18n?.lang || store.get('ac:lang', null) || root.lang || 'fa';
  if (i18n.url) await i18n.set(lang, { persist: false });
  else { i18n.lang = lang; root.lang = lang; root.dir = i18n.dir; }
  booted = true;
  observe();
  scan(document);
  readyFns.splice(0).forEach((fn) => { try { fn(AC); } catch (e) { console.error(e); } });
  emit(document, 'ready', { AC });
  return AC;
}

Object.assign(AC, {
  version, $, $$, on, emit, h, uid, escapeHtml, clamp, nextFrame, isRTL, reducedMotion, motionPref, isMobile, debounce, rafThrottle, haptic,
  options, store, register, scan, teardown, instance, trapFocus, focusables, scrollLock, gesture, icons, icon,
  theme, i18n, t: i18n.t, format, ready, boot,
  get booted() { return booted; },
});
