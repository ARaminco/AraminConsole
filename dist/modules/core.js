/*! AraminConsole v0.1.0 — module core — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
__R.__graph = Object.assign(__R.__graph || {}, {"shell":{"deps":[],"css":true,"provides":{"components":["appbar","dock","largetitle","navpill","pull-refresh","rail","ring","segmented","tabbar","tabs"],"api":["palette","press","rail"],"attrs":["ac-palette-open","ac-rail-close","ac-rail-group","ac-rail-open","ac-rail-toggle"],"classes":["ac-breadcrumbs","ac-pagination","ac-tabs"]}},"overlays":{"deps":[],"css":true,"provides":{"components":["alert","drawer","dropdown","modal","notifications","popover","sheet"],"api":["alertReset","autoPosition","confirm","drawer","layers","menu","modal","notifications","popover","portal","position","prompt","sheet","toast","tooltip"],"attrs":["ac-close","ac-contextmenu","ac-notifications-count","ac-notifications-open","ac-notifications-src","ac-open","ac-tooltip","ac-tooltip-kbd","ac-tooltip-placement"],"classes":["ac-actionsheet","ac-alert","ac-confirm","ac-cz","ac-notif","ac-notif-pop","ac-notif-sheet","ac-toast"]}},"customizer":{"deps":["overlays","shell"],"css":false,"provides":{"components":[],"api":["customizer"],"attrs":["ac-customizer-open"],"classes":[]}},"langpicker":{"deps":["overlays"],"css":true,"provides":{"components":["langpicker"],"api":["langpicker"],"attrs":[],"classes":["ac-lp-sheet"]}},"forms":{"deps":[],"css":false,"provides":{"components":["combobox","dropzone","form","input","number","otp","password","range","rating","swatches","tags","wizard"],"api":["combobox","dropzone","validate"],"attrs":["ac-msg","ac-rules"],"classes":[]}},"datepicker":{"deps":["forms"],"css":true,"provides":{"components":["datepicker","timepicker"],"api":["date","jalali"],"attrs":[],"classes":["ac-dp","ac-pop","ac-tp"]}},"data-display":{"deps":[],"css":true,"provides":{"components":["accordion","code","json","list","logview","tree"],"api":["copyText","json","logview","swipeable","tree"],"attrs":[],"classes":["ac-accordion","ac-code","ac-dl","ac-json","ac-log","ac-swipe","ac-timeline","ac-tree"]}},"table":{"deps":["data-display"],"css":false,"provides":{"components":["table"],"api":["table"],"attrs":[],"classes":[]}},"chart":{"deps":[],"css":true,"provides":{"components":["chart"],"api":["chart"],"attrs":[],"classes":["ac-chart"]}},"apps":{"deps":[],"css":true,"provides":{"components":["kanban","split"],"api":["kanban","split"],"attrs":[],"classes":["ac-apptoolbar","ac-cal","ac-cal-agenda","ac-cal-block","ac-cal-cats","ac-cal-day","ac-cal-dayview","ac-cal-detail","ac-cal-empty","ac-cal-ev","ac-cal-mini","ac-cal-month","ac-cal-more","ac-cal-now","ac-cal-row","ac-cal-side","ac-cal-tones","ac-cal-week","ac-faq","ac-faq-cats","ac-faq-empty","ac-faq-hero","ac-faq-link","ac-faq-search","ac-faq-side","ac-file","ac-files-preview","ac-files-side","ac-files-usage","ac-kanban","ac-kanban-pager","ac-kdetail","ac-plan","ac-pricing","ac-pricing-more","ac-split"]}},"money":{"deps":["forms"],"css":true,"provides":{"components":["bank-card","card-form","money","money-unit","sheba"],"api":["bank","bankCard","money"],"attrs":["ac-money"],"classes":["ac-bank-logo","ac-bcard","ac-money","ac-money-tick","ac-sheba"]}},"chat":{"deps":["apps","overlays"],"css":true,"provides":{"components":["chat"],"api":["chat"],"attrs":[],"classes":["ac-chat","ac-chat-tick","ac-lightbox","ac-voice"]}},"files":{"deps":["overlays"],"css":true,"provides":{"components":["files"],"api":["files"],"attrs":[],"classes":["ac-fm","ac-fm-act","ac-fm-alert","ac-fm-band","ac-fm-browse","ac-fm-cell","ac-fm-check","ac-fm-check2","ac-fm-chip","ac-fm-col","ac-fm-cols","ac-fm-comment","ac-fm-conflict","ac-fm-conflict-layer","ac-fm-crow","ac-fm-csv","ac-fm-disc","ac-fm-dl","ac-fm-dots","ac-fm-empty","ac-fm-fchip","ac-fm-field","ac-fm-field2","ac-fm-film","ac-fm-full","ac-fm-fullslot","ac-fm-gal","ac-fm-ghost","ac-fm-grid","ac-fm-ins","ac-fm-job","ac-fm-layer","ac-fm-live","ac-fm-md","ac-fm-mini","ac-fm-ocr","ac-fm-page","ac-fm-pane","ac-fm-pcard","ac-fm-person","ac-fm-plist","ac-fm-prow","ac-fm-ql","ac-fm-rename","ac-fm-row","ac-fm-seal","ac-fm-selbar","ac-fm-share","ac-fm-spin","ac-fm-star","ac-fm-table","ac-fm-tagbtn","ac-fm-tags","ac-fm-tbody","ac-fm-th","ac-fm-thead","ac-fm-thumb","ac-fm-tile","ac-fm-up","ac-fm-vers","ac-fm-wave"]}},"invoice-ir":{"deps":[],"css":true,"provides":{"components":["invoice-ir"],"api":["invoiceIR"],"attrs":[],"classes":[]}},"mail":{"deps":["apps","overlays","forms","data-display"],"css":true,"provides":{"components":["mail"],"api":["mail"],"attrs":[],"classes":["ac-mail"]}},"maps":{"deps":[],"css":true,"provides":{"components":["location-picker","map"],"api":["map"],"attrs":[],"classes":["ac-locpick","ac-map","ac-map-addr","ac-map-cluster","ac-map-dot","ac-map-handle","ac-map-handle-m","ac-map-label","ac-map-marker","ac-map-me","ac-map-picker","ac-map-pin","ac-map-popup","ac-map-shape","ac-map-veh"]}},"marketing":{"deps":[],"css":true,"provides":{"components":[],"api":["marketing"],"attrs":[],"classes":[]}},"notify":{"deps":["overlays"],"css":true,"provides":{"components":["notify-prefs"],"api":["notify"],"attrs":[],"classes":["ac-island","ac-ntf","ac-ntf-banner","ac-ntf-inline","ac-ntf-prefs","ac-ntf-stack","ac-pospick","ac-snack"]}},"prose":{"deps":["data-display"],"css":true,"provides":{"components":["prose"],"api":["article","markdown","prose","readingTime"],"attrs":[],"classes":["ac-anchor","ac-article","ac-author","ac-blog-bar","ac-blog-search","ac-callout","ac-comment","ac-comment-list","ac-comments","ac-compose","ac-docs","ac-doctree","ac-fnref","ac-footnotes","ac-lightbox","ac-mde","ac-pager","ac-post-card","ac-posts","ac-prose","ac-readbar","ac-share","ac-tag","ac-task","ac-toc"]}},"pwa":{"deps":["overlays"],"css":true,"provides":{"components":["install-card"],"api":["install","pwa"],"attrs":[],"classes":["ac-install","ac-install-banner","ac-install-card","ac-install-sheet","ac-ios","ac-splash"]}},"support-chat":{"deps":[],"css":true,"provides":{"components":[],"api":["supportChat"],"attrs":[],"classes":["ac-sc"]}},"terminal":{"deps":[],"css":true,"provides":{"components":["terminal"],"api":["terminal"],"attrs":[],"classes":["ac-term"]}},"tickets":{"deps":["table","overlays","forms","apps"],"css":true,"provides":{"components":["sla"],"api":["tickets"],"attrs":[],"classes":["ac-split","ac-tk-back","ac-tk-bubble","ac-tk-canned","ac-tk-canned-pop","ac-tk-cat","ac-tk-chip","ac-tk-composer","ac-tk-conv","ac-tk-create","ac-tk-crumb","ac-tk-csat","ac-tk-cust","ac-tk-detail","ac-tk-details-btn","ac-tk-drawer","ac-tk-file","ac-tk-files","ac-tk-help","ac-tk-load","ac-tk-log","ac-tk-msg","ac-tk-muted","ac-tk-myitem","ac-tk-mylist","ac-tk-noone","ac-tk-note","ac-tk-panel","ac-tk-person","ac-tk-portal","ac-tk-prio","ac-tk-prop","ac-tk-props","ac-tk-screen","ac-tk-send-more","ac-tk-side","ac-tk-side-sheet","ac-tk-sla","ac-tk-slacard","ac-tk-split","ac-tk-subj","ac-tk-sys","ac-tk-tag","ac-tk-tags","ac-tk-thread","ac-tk-track","ac-tk-views"]}},"uptime":{"deps":[],"css":true,"provides":{"components":["uptime"],"api":["uptime"],"attrs":[],"classes":["ac-uptime"]}},"user-panel":{"deps":["shell"],"css":true,"provides":{"components":["completeness","privacy"],"api":["userPanel"],"attrs":[],"classes":["ac-up-app","ac-up-apps","ac-up-checks","ac-up-complete","ac-up-eye","ac-up-id","ac-up-order","ac-up-orders","ac-up-points","ac-up-quick","ac-up-row","ac-up-rows","ac-up-sec","ac-up-steps","ac-up-tier","ac-up-wallet"]}}});
__R.__base || (__R.__base = new URL("./", import.meta.url).href);
if (__R.__min == null) __R.__min = /*@ac-min*/false;

/* ======== module: core ======== */
if (!__R["core"]) __R["core"] = (() => {
const F = {};

/* ---- js/core.js ---- */
const __ac_m1 = F["js/core.js"] = (() => {
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

const AC = {};
const version = '0.1.0';

const root = document.documentElement;
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------------------------------------------------------------- utilities */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** on(target, 'click', handler) or delegated: on(target, 'click', '.sel', handler). Returns off(). */
function on(target, type, selOrFn, fnOrOpts, maybeOpts) {
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
function emit(el, name, detail = {}) {
  const ev = new CustomEvent(`ac:${name}`, { bubbles: true, cancelable: true, detail });
  (el || document).dispatchEvent(ev);
  return ev;
}

/** h('button', { class: 'ac-btn', onclick: fn, 'aria-label': 'x' }, 'text', childEl) */
function h(tag, attrs = {}, ...children) {
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
const uid = (prefix = 'ac') => `${prefix}-${(++uidN).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const isRTL = (el = root) => getComputedStyle(el).direction === 'rtl';
/* Motion preference: 'system' (follow the OS) | 'full' | 'reduced' — persisted as ac:motion, resolved onto
   <html data-motion="full|reduced">. "Reduced" is NOT "none": fades, colour, blur crossfades, count-ups and chart
   reveals stay; travel (translate / scale / springs / parallax) and decorative loops go. 'full' gives the whole
   experience even when the OS asks for less (Windows "Animation effects" off makes every browser say reduce). */
const motionPref = {
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
const reducedMotion = () => root.dataset.motion === 'off' || (root.dataset.motion ? root.dataset.motion === 'reduced' : motionPref.resolved() === 'reduced');
const isMobile = () => matchMedia('(max-width: 1023.98px)').matches;
function debounce(fn, ms = 150) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
function rafThrottle(fn) {
  let queued = false; let args;
  return (...a) => { args = a; if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; fn(...args); }); } };
}
function haptic(ms = 6) { try { navigator.vibrate?.(ms); } catch { /* ignore */ } }

/** Read component options: data-ac-config='{json}' merged with data-* attributes (camelCased). */
function options(el, defaults = {}) {
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
const store = {
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
function register(name, init) {
  registry.set(name, init);
  if (booted) $$(`[data-ac~="${name}"]`).forEach(initEl);
}

/** Initialise every [data-ac] inside root (root included). Idempotent. */
function scan(rootEl = document) {
  if (rootEl.nodeType !== 1 && rootEl !== document) return;
  if (rootEl.matches?.('[data-ac]')) initEl(rootEl);
  rootEl.querySelectorAll('[data-ac]').forEach(initEl);
}

/** Destroy every component inside root (root included). */
function teardown(rootEl) {
  if (rootEl.nodeType !== 1) return;
  if (rootEl.matches('[data-ac]')) destroyEl(rootEl);
  rootEl.querySelectorAll('[data-ac]').forEach(destroyEl);
}

/** Get the component instance API an init stored with AC.instance(el, name, api). */
const apis = new WeakMap();
function instance(el, name, api) {
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
const focusables = (el) => $$(FOCUSABLE, el).filter((n) => n.offsetParent !== null || n === document.activeElement);
const trapStack = [];

/** trapFocus(container, { initial?: el|selector, returnFocus?: true }) → release() */
function trapFocus(container, { initial, returnFocus = true } = {}) {
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
const scrollLock = {
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
function gesture(el, opts = {}) {
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
const icons = {
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
const icon = (name, cls = '') => `<svg class="ac-icon${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

/* ---------------------------------------------------------------- theme */
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
const THEME_KEYS = { theme: 'ac:theme', accent: 'ac:accent', density: 'ac:density', radius: 'ac:radius' };
const THEME_DEFAULTS = { theme: 'light', accent: 'air', density: 'comfortable', radius: 'default' };
const theme = {
  accents: ['air', 'orange', 'violet', 'blue', 'emerald', 'rose', 'amber', 'slate'],
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

const i18n = {
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
const format = {
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
function ready(fn) { if (booted) fn(AC); else readyFns.push(fn); }

/**
 * boot({ icons?: url|false, i18n?: { url, lang } }) — called by index.js on DOMContentLoaded.
 * Safe to call more than once.
 */
async function boot(cfg = {}) {
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
return Object.freeze({ AC, version, $, $$, on, emit, h, uid, escapeHtml, clamp, nextFrame, isRTL, motionPref, reducedMotion, isMobile, debounce, rafThrottle, haptic, options, store, register, scan, teardown, instance, focusables, trapFocus, scrollLock, gesture, icons, icon, theme, i18n, format, ready, boot });
})();

/* ---- js/motion.js ---- */
const __ac_m2 = F["js/motion.js"] = (() => {
const { AC, on, register, reducedMotion, ready, scan, rafThrottle, motionPref } = __ac_m1;
/* ==========================================================================
   AraminConsole — motion system (docs/motion.md)
   --------------------------------------------------------------------------
   AC.motion.spring(el, { x, y, scale, rotate, opacity }, { stiffness, damping, mass, velocity })
       Physically simulated spring, played on the compositor through WAAPI (keyframes sampled
       from the simulation). Interruptible: a new call starts from the current position AND
       velocity of the running one. Resolves when settled. Values: number (to) or [from, to].
   AC.motion.springValue(from, to, { onUpdate, stiffness, damping, velocity }) → { stop, value, velocity, finished }
       rAF spring for anything that is not a transform (indicator geometry, numbers…).
   AC.motion.slide(el, { x, w, y, h }, { instant })
       Spring-driven indicator geometry with a leading/trailing-edge stretch (writes --ac-ind-x/-y/-w/-h
       on el itself — never on a parent, so no style recalc of descendants).
   AC.motion.flip(targets, mutate, opts)  FLIP layout transition (First, Last, Invert, Play).
   AC.motion.stagger(els, keyframes, { step, duration, easing, from })   WAAPI stagger.
   AC.motion.enter(els, opts)            staggered fade-up (the reel's card entrance).
   AC.motion.countUp(el, to, { from, duration, format })
   AC.motion.bump(el)                    badge / count bump.
   AC.motion.reveal(el)                  skeleton → content crossfade (blur bridges the swap).
   AC.motion.transition(update, { kind: 'page'|'lang'|'theme', direction })  View Transition helper.
   AC.motion.navigate(update, { from, to }) page transition whose slide direction follows nav order.
   AC.motion.highlight(container, { items })  hover highlight that slides between items.
   Only transform / opacity / filter / clip-path are animated. prefers-reduced-motion (and
   <html data-motion="off">) collapse motion to instant state changes or short fades.
   ========================================================================== */


const root = document.documentElement;
const state = new WeakMap(); // el -> { values, vel, anim, traj, keys, dur }

/* ---------------------------------------------------------------- curves */
const ease = {
  out: 'cubic-bezier(0.23, 1, 0.32, 1)',
  outExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  inOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  move: 'cubic-bezier(0.25, 1, 0.5, 1)',
  drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
};
const springs = {
  snappy: { stiffness: 520, damping: 34, mass: 1 },   // indicators, pills
  gentle: { stiffness: 300, damping: 30, mass: 1 },   // large surfaces
  bouncy: { stiffness: 380, damping: 20, mass: 1 },   // icons, badges
  stiff: { stiffness: 760, damping: 44, mass: 1 },    // leading edges, follow-the-pointer
};

/* ---------------------------------------------------------------- physics */
function sim({ from, to, velocity = 0, stiffness = 520, damping = 34, mass = 1, restDelta }, fps = 60) {
  const span = Math.abs(to - from);
  const rd = restDelta ?? Math.max(0.0004, span * 0.0015);
  const rs = rd * 12;
  const pos = [from]; const vel = [velocity];
  let x = from; let v = velocity; const sub = 8; const dt = 1 / fps / sub;
  for (let f = 0; f < fps * 4; f++) {
    for (let s = 0; s < sub; s++) { const a = (-stiffness * (x - to) - damping * v) / mass; v += a * dt; x += v * dt; }
    pos.push(x); vel.push(v);
    if (Math.abs(x - to) < rd && Math.abs(v) < rs) break;
  }
  pos[pos.length - 1] = to; vel[vel.length - 1] = 0;
  return { pos, vel, frames: pos.length, ms: ((pos.length - 1) / fps) * 1000 };
}

/** Sample a spring 0→1 into a CSS linear() easing + its duration (ms). */
function springEasing(opts = springs.snappy, points = 24) {
  const s = sim({ ...opts, from: 0, to: 1 });
  const pts = [];
  for (let i = 1; i < points; i++) { const p = Math.pow(i / points, 1.5); pts.push(`${+s.pos[Math.round(p * (s.frames - 1))].toFixed(3)} ${+(p * 100).toFixed(1)}%`); }
  return { easing: `linear(0, ${pts.join(', ')}, 1)`, duration: Math.round(s.ms) };
}

/* ---------------------------------------------------------------- rAF spring value */
function springValue(from, to, opts = {}) {
  const o = { ...springs.snappy, velocity: 0, ...opts };
  let x = from; let v = o.velocity; let raf = 0; let last = 0; let done = false; let resolve;
  const finished = new Promise((r) => { resolve = r; });
  const rd = o.restDelta ?? Math.max(0.01, Math.abs(to - from) * 0.001);
  const ctl = {
    get value() { return x; }, get velocity() { return v; }, get target() { return to; }, finished,
    stop() { if (done) return; done = true; cancelAnimationFrame(raf); resolve(x); },
    retarget(t) { to = t; if (done) { done = false; last = 0; raf = requestAnimationFrame(step); } },
  };
  function step(now) {
    if (done) return;
    const scale = motion.timeScale || 1;
    let dt = last ? Math.min(0.25, (now - last) / 1000) * scale : 1 / 60 * scale; // wall-clock: stays on time under jank
    last = now;
    const sub = Math.max(1, Math.ceil(dt / (1 / 240))); dt /= sub;
    for (let i = 0; i < sub; i++) { const a = (-o.stiffness * (x - to) - o.damping * v) / (o.mass || 1); v += a * dt; x += v * dt; }
    if (Math.abs(x - to) < rd && Math.abs(v) < rd * 12) { x = to; v = 0; o.onUpdate?.(x, v); done = true; resolve(x); return; }
    o.onUpdate?.(x, v);
    raf = requestAnimationFrame(step);
  }
  if (reducedMotion() || from === to) { x = to; v = 0; o.onUpdate?.(x, 0); done = true; resolve(x); }
  else raf = requestAnimationFrame(step);
  return ctl;
}

/* ---------------------------------------------------------------- WAAPI spring on transforms */
const DEFAULTS = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotate: 0, opacity: 1 };
const compose = (v) => {
  let t = '';
  if (v.x || v.y) t += `translate(${(v.x || 0).toFixed(2)}px, ${(v.y || 0).toFixed(2)}px) `;
  if (v.scale !== 1 || v.scaleX !== 1 || v.scaleY !== 1) t += `scale(${((v.scaleX ?? 1) * (v.scale ?? 1)).toFixed(4)}, ${((v.scaleY ?? 1) * (v.scale ?? 1)).toFixed(4)}) `;
  if (v.rotate) t += `rotate(${v.rotate.toFixed(2)}deg)`;
  return t.trim() || 'none';
};

function current(el) {
  const st = state.get(el);
  if (!st) return { values: {}, vel: {} };
  if (st.anim && st.anim.playState === 'running' && st.traj) {
    const f = Math.min(st.frames - 1, Math.max(0, Math.round(((st.anim.currentTime || 0) / st.dur) * (st.frames - 1))));
    const values = { ...st.values }; const vel = {};
    for (const k of Object.keys(st.traj)) { values[k] = st.traj[k].pos[f]; vel[k] = st.traj[k].vel[f]; }
    return { values, vel };
  }
  return { values: { ...st.values }, vel: {} };
}

function spring(el, props, opts = {}) {
  if (!el) return Promise.resolve();
  const o = { ...springs.snappy, ...opts };
  const cur = current(el);
  const prev = state.get(el); if (prev?.anim) prev.anim.cancel();
  const from = {}; const to = {};
  for (const [k, v] of Object.entries(props)) {
    if (!(k in DEFAULTS)) continue;
    if (Array.isArray(v)) { from[k] = v[0]; to[k] = v[1]; } else {
      to[k] = v;
      from[k] = cur.values[k] ?? (k === 'opacity' ? Number(getComputedStyle(el).opacity) : DEFAULTS[k]);
    }
  }
  const values = { ...DEFAULTS, ...cur.values, ...to };
  const finish = () => {
    const tv = { ...DEFAULTS, ...cur.values, ...to };
    if (Object.keys(to).some((k) => k !== 'opacity')) el.style.transform = compose(tv);
    if ('opacity' in to) el.style.opacity = to.opacity >= 1 ? '' : String(to.opacity);
  };
  if (reducedMotion() || opts.instant) {
    state.set(el, { values });
    finish();
    return Promise.resolve();
  }
  const traj = {}; let frames = 2;
  for (const k of Object.keys(to)) {
    const restDelta = k === 'x' || k === 'y' ? 0.05 : k === 'rotate' ? 0.05 : 0.0005;
    traj[k] = sim({ ...o, from: from[k], to: to[k], velocity: o.velocity?.[k] ?? cur.vel[k] ?? 0, restDelta });
    frames = Math.max(frames, traj[k].frames);
  }
  for (const k of Object.keys(traj)) while (traj[k].pos.length < frames) { traj[k].pos.push(to[k]); traj[k].vel.push(0); }
  const base = { ...DEFAULTS, ...cur.values, ...from };
  const hasT = Object.keys(to).some((k) => k !== 'opacity');
  const kf = [];
  for (let f = 0; f < frames; f++) {
    const v = { ...base }; for (const k of Object.keys(traj)) v[k] = traj[k].pos[f];
    const frame = {};
    if (hasT) frame.transform = compose(v);
    if ('opacity' in traj) frame.opacity = Math.min(1, Math.max(0, v.opacity));
    kf.push(frame);
  }
  const dur = ((frames - 1) / 60) * 1000;
  const anim = el.animate(kf, { duration: dur, easing: 'linear', fill: 'forwards', delay: opts.delay || 0 });
  state.set(el, { values, anim, traj, frames, dur });
  return anim.finished.then(() => { finish(); anim.cancel(); const st = state.get(el); if (st?.anim === anim) st.anim = null; }, () => {});
}

/* ---------------------------------------------------------------- indicator geometry (edges) */
const slides = new WeakMap();
/** slide(el, { x, w, y?, h? }, { instant }) — leading edge is stiffer than the trailing one → stretch. */
function slide(el, g, { instant = false, also = [] } = {}) {
  let s = slides.get(el);
  const targets = [el, ...also.filter(Boolean)];
  const write = () => {
    if (slides.get(el) !== s) return; // a newer slide() (e.g. an instant keyboard move) owns the geometry now
    for (const t of targets) {
      t.style.setProperty('--ac-ind-x', `${s.l.v.toFixed(2)}px`);
      t.style.setProperty('--ac-ind-w', `${Math.max(0, s.r.v - s.l.v).toFixed(2)}px`);
      if (s.t) { t.style.setProperty('--ac-ind-y', `${s.t.v.toFixed(2)}px`); t.style.setProperty('--ac-ind-h', `${Math.max(0, s.b.v - s.t.v).toFixed(2)}px`); }
    }
  };
  const target = { l: g.x, r: g.x + g.w, t: g.y, b: g.y != null ? g.y + g.h : undefined };
  if (!s || instant || reducedMotion()) {
    if (s) for (const k of ['l', 'r', 't', 'b']) s[k]?.ctl?.stop();
    s = { l: { v: target.l }, r: { v: target.r } };
    if (g.y != null) { s.t = { v: target.t }; s.b = { v: target.b }; }
    slides.set(el, s);
    el.setAttribute('data-spring', '');
    write();
    return;
  }
  el.setAttribute('data-spring', '');
  if (g.y != null && !s.t) { s.t = { v: target.t }; s.b = { v: target.b }; }
  const moveX = target.l - s.l.v; const moveY = g.y != null ? target.t - s.t.v : 0;
  let queued = false;
  const tick = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; write(); }); } };
  const run = (edge, to, lead) => {
    const e = s[edge]; if (!e) return;
    const vel = e.ctl ? e.ctl.velocity : 0; e.ctl?.stop();
    let ctl = null; // superseded springs stop writing (onUpdate may run synchronously, before ctl is assigned)
    ctl = springValue(e.v, to, { ...(lead ? springs.stiff : springs.snappy), velocity: vel, restDelta: 0.1, onUpdate: (x) => { if (!ctl || e.ctl === ctl) { e.v = x; tick(); } } });
    e.ctl = ctl;
  };
  run('l', target.l, moveX < 0); run('r', target.r, moveX >= 0);
  if (g.y != null) { run('t', target.t, moveY < 0); run('b', target.b, moveY >= 0); }
}

/* ---------------------------------------------------------------- ink layer (perfect label colour) */
/**
 * inkLayer(container, itemSelector) → { sync(), el }
 * Emil's duplicate-and-clip technique: a layer filled with the active colour holds white copies of
 * every label at the same positions, clipped to the indicator geometry (--ac-ind-x/-w). As the pill
 * slides and stretches, label colour changes exactly where the pill is — never early, never late.
 * Pass the returned el to slide(ind, g, { also: [layer.el] }).
 */
function inkLayer(container, itemSelector) {
  const layer = document.createElement('div');
  layer.className = 'ac-ink'; layer.setAttribute('aria-hidden', 'true'); layer.inert = true;
  container.append(layer);
  container.setAttribute('data-ink', '');
  let sig = '';
  function sync() {
    const items = Array.from(container.querySelectorAll(itemSelector)).filter((n) => !layer.contains(n));
    const b = container.getBoundingClientRect();
    const geo = items.map((it) => { const r = it.getBoundingClientRect(); return [r.left - b.left + container.scrollLeft - container.clientLeft, r.top - b.top - container.clientTop, r.width, r.height]; });
    const next = items.map((it, i) => it.innerHTML + geo[i].map(Math.round).join()).join('|') + container.clientWidth;
    if (next === sig) return; sig = next;
    layer.textContent = '';
    items.forEach((it, i) => {
      const c = it.cloneNode(true);
      c.removeAttribute('id'); c.removeAttribute('href'); c.removeAttribute('aria-current'); c.setAttribute('tabindex', '-1');
      c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      c.classList.add('ac-ink__item');
      c.style.cssText = `inline-size:${geo[i][2]}px;block-size:${geo[i][3]}px;transform:translate(${geo[i][0]}px,${geo[i][1]}px)`;
      layer.append(c);
    });
  }
  return { el: layer, sync, destroy() { layer.remove(); container.removeAttribute('data-ink'); } };
}

/* ---------------------------------------------------------------- FLIP */
function flip(targets, mutate, opts = {}) {
  const els = typeof targets === 'string' ? Array.from(document.querySelectorAll(targets)) : Array.from(targets?.length != null ? targets : [targets]);
  const first = new Map(els.map((el) => [el, el.getBoundingClientRect()]));
  const r = mutate?.();
  const after = typeof targets === 'string' ? Array.from(document.querySelectorAll(targets)) : els;
  if (reducedMotion()) return Promise.resolve(r);
  const { easing, duration } = opts.easing ? opts : springEasing(opts.spring || springs.snappy);
  const anims = [];
  for (const el of after) {
    if (!el.isConnected) continue;
    const a = first.get(el); const b = el.getBoundingClientRect();
    if (!a) { anims.push(el.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: ease.out })); continue; }
    const dx = a.left - b.left; const dy = a.top - b.top;
    const sx = opts.scale === false || !b.width ? 1 : a.width / b.width; const sy = opts.scale === false || !b.height ? 1 : a.height / b.height;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.005 && Math.abs(sy - 1) < 0.005) continue;
    anims.push(el.animate([{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: '0 0', transform: 'none' }], { duration: opts.duration || duration, easing }));
  }
  return Promise.all(anims.map((x) => x.finished.catch(() => {}))).then(() => r);
}

/* ---------------------------------------------------------------- stagger / enter */
function stagger(els, keyframes, opts = {}) {
  const list = Array.from(typeof els === 'string' ? document.querySelectorAll(els) : els).filter(Boolean);
  if (root.dataset.motion === 'off') return [];
  if (reducedMotion()) keyframes = keyframes.map(({ transform, ...k }) => k); // keep the fade, drop the travel
  const step = opts.step ?? 45; const max = opts.maxDelay ?? 360;
  const n = list.length;
  return list.map((el, i) => {
    const k = opts.from === 'end' ? n - 1 - i : opts.from === 'center' ? Math.abs(i - (n - 1) / 2) : i;
    return el.animate(keyframes, { duration: opts.duration ?? 420, easing: opts.easing ?? ease.outExpo, delay: (opts.delay || 0) + Math.min(max, k * step), fill: 'backwards' });
  });
}
function enter(els, opts = {}) {
  const y = opts.y ?? 14;
  return stagger(els, [{ opacity: 0, transform: `translateY(${y}px) scale(${opts.scale ?? 0.985})` }, { opacity: 1, transform: 'none' }], { duration: 520, ...opts });
}

/* ---------------------------------------------------------------- numbers */
function countUp(el, to, opts = {}) {
  const from = opts.from ?? (Number(el.dataset.acValue) || 0);
  const fmt = opts.format || ((v) => AC.format.number(v, { decimals: opts.decimals ?? 0 }));
  el.dataset.acValue = String(to);
  if (reducedMotion()) { el.textContent = fmt(to); return Promise.resolve(); }
  const dur = (opts.duration ?? 900) / (motion.timeScale || 1);
  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur); const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
}

/** Restart the bump animation on a badge / count (also fired automatically by [data-ac~="bump"]). */
function bump(el) {
  if (!el || reducedMotion()) return;
  el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.32)', offset: 0.32 }, { transform: 'scale(0.94)', offset: 0.62 }, { transform: 'scale(1)' }], { duration: 460, easing: ease.out });
}

/** Content just replaced a skeleton (or any placeholder): fade it in with a short blur bridge. */
function reveal(el, opts = {}) {
  if (!el || root.dataset.motion === 'off') return;
  el.animate([{ opacity: 0, filter: 'blur(4px)', transform: reducedMotion() ? 'none' : 'translateY(4px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: opts.duration ?? 320, easing: ease.out });
}

/* ---------------------------------------------------------------- view transitions */
let vtActive = null;
/**
 * transition(update, { kind, direction }) → Promise (resolves after the DOM update ran).
 * kind 'page'  : only [view-transition-name] elements animate; the chrome stays live (its own
 *                transitions — nav pill, tab bar — keep running). direction 1 = forward, -1 = back.
 * kind 'lang'  : whole-document crossfade with a blur bridge (direction flips, nothing slides).
 * kind 'theme' : whole-document crossfade.
 */
function transition(update, { kind = 'page', direction = 0 } = {}) {
  const run = async () => { await update(); };
  // reduced motion still crossfades (CSS drops the travel via --ac-travel); only data-motion="off" cuts
  if (!document.startViewTransition || root.dataset.motion === 'off' || document.visibilityState === 'hidden') return run();
  root.dataset.vt = kind;
  root.dataset.vtDir = direction > 0 ? 'forward' : direction < 0 ? 'back' : 'none';
  try { vtActive?.skipTransition?.(); } catch { /* ignore */ }
  const vt = document.startViewTransition(run);
  vtActive = vt;
  vt.ready.catch(() => {});
  vt.finished.catch(() => {}).finally(() => { if (vtActive === vt) { vtActive = null; delete root.dataset.vt; delete root.dataset.vtDir; } });
  return vt.updateCallbackDone.catch(() => run());
}

const order = () => Array.from(document.querySelectorAll('.ac-topnav__link[href^="#/"], .ac-rail__nav a[href^="#/"], .ac-tabbar__item[href^="#/"]')).map((a) => a.getAttribute('href').slice(2));
/** Page navigation transition; slide direction comes from the position of the two pages in the navigation. */
function navigate(update, { from, to, direction } = {}) {
  let dir = direction;
  if (dir == null) {
    const list = [...new Set(order())]; const a = list.indexOf(from); const b = list.indexOf(to);
    dir = a < 0 || b < 0 || a === b ? 0 : b > a ? 1 : -1;
  }
  if (from == null) return Promise.resolve(update());
  return transition(update, { kind: 'page', direction: dir });
}

/* theme switch: the new theme grows as a circle from the control that was pressed */
let lastPoint = null;
on(document, 'pointerdown', (e) => { lastPoint = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { capture: true, passive: true });
function themeReveal() {
  if (reducedMotion()) return; // plain crossfade
  const fresh = lastPoint && performance.now() - lastPoint.t < 3000;
  const x = fresh ? lastPoint.x : innerWidth / 2; const y = fresh ? lastPoint.y : 0;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 560, easing: ease.inOut, pseudoElement: '::view-transition-new(root)' });
}

/* ---------------------------------------------------------------- sliding hover highlight */
const HL_SCOPES = '.ac-menu, .ac-rail__nav, .ac-lp__list';
const HL_ITEMS = '.ac-menu__item, .ac-rail__link, .ac-lp__item';
let lastInput = 'mouse';
on(document, 'keydown', () => { lastInput = 'key'; }, true);
on(document, 'pointerdown', () => { lastInput = 'mouse'; }, true);
on(document, 'pointermove', () => { lastInput = 'mouse'; }, { capture: true, passive: true });

function hlFor(scope) {
  let hl = scope.querySelector(':scope > .ac-hl');
  if (!hl) {
    // the scope must be the indicator's containing block (it is measured against the scope incl. its scroll)
    if (getComputedStyle(scope).position === 'static') scope.style.position = 'relative';
    hl = document.createElement('span'); hl.className = 'ac-hl'; hl.setAttribute('aria-hidden', 'true'); scope.prepend(hl); scope.setAttribute('data-hl', '');
  }
  return hl;
}
function hlMove(scope, item, instant) {
  const hl = hlFor(scope);
  if (!item || item.matches('[aria-current="page"], [aria-disabled="true"], :disabled')) { hl.removeAttribute('data-on'); return; }
  const r = item.getBoundingClientRect(); const c = scope.getBoundingClientRect();
  if (!r.width) return;
  const g = { x: r.left - c.left - scope.clientLeft + scope.scrollLeft, y: r.top - c.top - scope.clientTop + scope.scrollTop, w: r.width, h: r.height };
  const wasOn = hl.hasAttribute('data-on');
  hl.dataset.tone = item.dataset.tone || '';
  slide(hl, g, { instant: instant || !wasOn || lastInput === 'key' });
  hl.setAttribute('data-on', '');
}
/** Opt-in for custom lists: highlight(container, { items: '.row' }). Built-in for menus, rail, palette, language picker. */
function highlight(container, { items } = {}) {
  container.setAttribute('data-hl-items', items || '');
  container.classList.add('ac-hl-scope');
  return () => { container.querySelector(':scope > .ac-hl')?.remove(); container.removeAttribute('data-hl'); container.classList.remove('ac-hl-scope'); };
}
const scopeOf = (t) => t?.closest?.(`${HL_SCOPES}, .ac-hl-scope`);
const itemOf = (t, scope) => {
  const sel = scope.getAttribute('data-hl-items') || HL_ITEMS;
  const it = t.closest(sel);
  return it && scope.contains(it) && scopeOf(it) === scope ? it : null;
};
on(document, 'pointerover', (e) => {
  if (e.pointerType !== 'mouse') return;
  const scope = scopeOf(e.target); if (!scope || scope.closest('.ac-actionsheet')) return;
  const it = itemOf(e.target, scope);
  if (it) hlMove(scope, it, false);
});
on(document, 'pointerout', (e) => {
  if (e.pointerType !== 'mouse') return;
  const scope = scopeOf(e.target); if (!scope) return;
  if (e.relatedTarget && scope.contains(e.relatedTarget)) return;
  const focused = scope.contains(document.activeElement) ? itemOf(document.activeElement, scope) : null;
  if (focused) hlMove(scope, focused, false); else scope.querySelector(':scope > .ac-hl')?.removeAttribute('data-on');
});
on(document, 'focusin', (e) => {
  const scope = scopeOf(e.target); if (!scope || scope.closest('.ac-actionsheet')) return;
  const it = itemOf(e.target, scope);
  if (it) hlMove(scope, it, lastInput === 'key');
});
on(document, 'scroll', (e) => {
  const scope = e.target instanceof Element ? e.target.closest?.(`${HL_SCOPES}, .ac-hl-scope`) : null;
  if (scope === e.target) scope.querySelector(':scope > .ac-hl')?.removeAttribute('data-on');
}, { capture: true, passive: true });

/* ---------------------------------------------------------------- tracked indicator */
/**
 * track(container, { active, items }) → destroy()
 * An ink pill that springs to whichever child matches `active` (default [data-active], [aria-current="page"]),
 * with an ink layer so icon/label colour flips exactly under it. Used by the dock; works for any
 * vertical or horizontal list of buttons.
 */
function track(container, { active = '[data-active], [aria-current="page"]', items = ':scope > *' } = {}) {
  const ind = document.createElement('span'); ind.className = 'ac-track'; ind.setAttribute('aria-hidden', 'true');
  container.prepend(ind); container.setAttribute('data-track', '');
  const ink = inkLayer(container, items.replace(':scope > *', ':scope > :not(.ac-track, .ac-ink)'));
  let first = true;
  const place = rafThrottle(() => {
    const cur = Array.from(container.querySelectorAll(items)).find((n) => n !== ind && n !== ink.el && n.matches(active));
    if (!cur || !container.getClientRects().length) { ind.removeAttribute('data-on'); ink.el.style.setProperty('--ac-ind-o', '0'); first = true; return; }
    const r = cur.getBoundingClientRect(); const c = container.getBoundingClientRect();
    ink.sync();
    slide(ind, { x: r.left - c.left - container.clientLeft + container.scrollLeft, w: r.width, y: r.top - c.top - container.clientTop + container.scrollTop, h: r.height }, { instant: first, also: [ink.el] });
    ind.setAttribute('data-on', ''); ink.el.style.setProperty('--ac-ind-o', '1');
    first = false;
  });
  const mo = new MutationObserver(place);
  mo.observe(container, { subtree: true, attributes: true, attributeFilter: ['data-active', 'aria-current'] });
  const ro = new ResizeObserver(place); ro.observe(container);
  const off = on(document, 'ac:i18n:change', () => { first = true; place(); });
  place();
  return () => { mo.disconnect(); ro.disconnect(); off(); ind.remove(); ink.destroy(); container.removeAttribute('data-track'); };
}

/* Lists with a virtual "active" row (aria-selected + aria-activedescendant, e.g. the command palette):
   ONE indicator follows the active row — hover and arrow keys move the same highlight (arrow keys
   move it instantly: keyboard actions are never animated). */
function followSelection(list, selected = '[aria-selected="true"]') {
  const place = rafThrottle(() => { const it = list.querySelector(selected); if (it) hlMove(list, it, lastInput === 'key'); else list.querySelector(':scope > .ac-hl')?.removeAttribute('data-on'); });
  const mo = new MutationObserver(place);
  mo.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-selected'] });
  place();
  return () => mo.disconnect();
}
ready(() => {
  const hook = () => { const l = document.querySelector('.ac-palette__list'); if (l && !l.hasAttribute('data-follow')) { l.setAttribute('data-follow', ''); followSelection(l); return true; } return false; };
  if (!hook()) { const mo = new MutationObserver(() => { if (hook()) mo.disconnect(); }); mo.observe(document.body, { childList: true, subtree: true }); }
});

/* ---------------------------------------------------------------- declarative helpers */
// [data-ac~="bump"]: bumps whenever its text changes (badges, counts)
register('bump', (el) => {
  let last = el.textContent;
  const mo = new MutationObserver(() => { if (el.textContent !== last) { last = el.textContent; bump(el); } });
  mo.observe(el, { childList: true, characterData: true, subtree: true });
  return () => mo.disconnect();
});

// shell wiring: dock indicator + bumping counters (framework-level, no markup changes needed)
ready(() => {
  document.querySelectorAll('.ac-dock__nav').forEach((n) => { if (!n.hasAttribute('data-track')) track(n, { items: ':scope > .ac-dock__btn' }); });
  document.querySelectorAll('.ac-appbar__count, .ac-tabbar__badge, .ac-rail__badge').forEach((n) => {
    const list = (n.getAttribute('data-ac') || '').split(/\s+/);
    if (!list.includes('bump')) { n.setAttribute('data-ac', [...list, 'bump'].filter(Boolean).join(' ')); scan(n); }
  });
});

/* Motion preference controls anywhere: <button data-motion-set="system|full|reduced">…</button>
   (aria-pressed is kept in sync) — e.g. a settings page row. */
on(document, 'click', '[data-motion-set]', (e, b) => motionPref.set(b.getAttribute('data-motion-set')));
const syncMotionButtons = () => document.querySelectorAll('[data-motion-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-motion-set') === motionPref.get())));
on(document, 'ac:motion:change', syncMotionButtons);
ready(syncMotionButtons);

/* <div data-ac="motion-pref"></div> renders the System / Full / Reduced segmented control (settings pages). */
register('motion-pref', (el) => {
  const t = (k, f) => AC.t(k, f);
  const render = () => {
    const cur = motionPref.get();
    el.className = `${el.className.replace(/ac-segmented|ac-segmented--block/g, '').trim()} ac-segmented`.trim();
    el.setAttribute('role', 'radiogroup'); el.setAttribute('aria-label', t('custom.motion', 'Motion & animation'));
    el.innerHTML = [['system', 'custom.motionSystem', 'System', 'monitor'], ['full', 'custom.motionFull', 'Full', 'sparkles'], ['reduced', 'custom.motionReduced', 'Reduced', 'pause']]
      .map(([v, k, f, ic]) => `<button class="ac-segmented__item" type="button" role="radio" data-value="${v}" aria-checked="${v === cur}">${AC.icon(ic)}<span data-i18n="${k}">${AC.escapeHtml(t(k, f))}</span></button>`).join('');
    if (!(el.getAttribute('data-ac') || '').includes('segmented')) el.setAttribute('data-ac', `${el.getAttribute('data-ac')} segmented`);
    scan(el);
  };
  render();
  const offs = [
    on(el, 'ac:segmented:change', (e) => { if (e.target === el) motionPref.set(e.detail.value); }),
    on(document, 'ac:motion:change', () => { const i = ['system', 'full', 'reduced'].indexOf(motionPref.get()); AC.instance(el, 'segmented')?.select(i, { silent: true }); }),
  ];
  return () => offs.forEach((f) => f());
});

const motion = {
  /** 'system' | 'full' | 'reduced' — persisted (ac:motion), resolved to <html data-motion>. */
  get preference() { return motionPref.get(); },
  set preference(v) { motionPref.set(v); },
  get resolved() { return motionPref.resolved(); },
  timeScale: window.__acTimeScale || 1,
  ease, springs, springEasing, springValue, spring, slide, inkLayer, flip, stagger, enter, countUp, bump, reveal, themeReveal, transition, navigate, highlight, track,
  get reduced() { return reducedMotion(); },
};
AC.motion = motion;
return Object.freeze({ ease, springs, springEasing, springValue, spring, slide, inkLayer, flip, stagger, enter, countUp, bump, reveal, transition, navigate, themeReveal, highlight, track, followSelection, motion });
})();

/* ---- js/loader.js ---- */
const __ac_mz = F["js/loader.js"] = (() => {
const { AC, emit } = __ac_m1;
/* Module loader — AC.use('maps', 'marketing') lazily loads per-module bundles (dist/modules/<name>.{js,css}) with their
   dependencies, once. CSS is awaited before the promise resolves (no flash of unstyled content) and is inserted right after
   the framework stylesheet, so later page / app stylesheets still win the cascade.
   Every bundle the build writes shares one registry: globalThis.__AC_MODS__ = { <module>: { f, ns }, __graph, __css:Set, __base }.
   A module already present (full bundle, custom build or an earlier AC.use) is never loaded twice.
   AC.use(name…) → Promise<ns | ns[]> · AC.use.loaded(name) · AC.use.preload(name…) · AC.use.base = 'https://cdn/…/dist/modules/'
   Event: ac:module:load { name } on document. */


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

function use(...names) {
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
return Object.freeze({ use });
})();

return { f: F, ns: Object.freeze({ "AC": __ac_m1["AC"], "version": __ac_m1["version"], "$": __ac_m1["$"], "$$": __ac_m1["$$"], "on": __ac_m1["on"], "emit": __ac_m1["emit"], "h": __ac_m1["h"], "uid": __ac_m1["uid"], "escapeHtml": __ac_m1["escapeHtml"], "clamp": __ac_m1["clamp"], "nextFrame": __ac_m1["nextFrame"], "isRTL": __ac_m1["isRTL"], "motionPref": __ac_m1["motionPref"], "reducedMotion": __ac_m1["reducedMotion"], "isMobile": __ac_m1["isMobile"], "debounce": __ac_m1["debounce"], "rafThrottle": __ac_m1["rafThrottle"], "haptic": __ac_m1["haptic"], "options": __ac_m1["options"], "store": __ac_m1["store"], "register": __ac_m1["register"], "scan": __ac_m1["scan"], "teardown": __ac_m1["teardown"], "instance": __ac_m1["instance"], "focusables": __ac_m1["focusables"], "trapFocus": __ac_m1["trapFocus"], "scrollLock": __ac_m1["scrollLock"], "gesture": __ac_m1["gesture"], "icons": __ac_m1["icons"], "icon": __ac_m1["icon"], "theme": __ac_m1["theme"], "i18n": __ac_m1["i18n"], "format": __ac_m1["format"], "ready": __ac_m1["ready"], "boot": __ac_m1["boot"], "motion": __ac_m2["motion"], "use": __ac_mz["use"] }) };
})();

if (!__R['@boot']) {
  __R['@boot'] = 1;
  const AC = __R.core.ns.AC;
  if (!AC.defaultIcons) AC.defaultIcons = new URL("../icons.svg", import.meta.url).href;
  window.AC = AC;
  if (!document.documentElement.hasAttribute('data-ac-manual')) {
    const start = () => AC.boot({ icons: document.documentElement.dataset.acIcons || AC.defaultIcons });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
  }
}
export const { AC, version, $, $$, on, emit, h, uid, escapeHtml, clamp, nextFrame, isRTL, motionPref, reducedMotion, isMobile, debounce, rafThrottle, haptic, options, store, register, scan, teardown, instance, focusables, trapFocus, scrollLock, gesture, icons, icon, theme, i18n, format, ready, boot, motion, use } = __R["core"].ns;
export default __R.core.ns.AC;
