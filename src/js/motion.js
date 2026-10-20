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
import { AC, on, register, reducedMotion, ready, scan, rafThrottle, motionPref } from './core.js';

const root = document.documentElement;
const state = new WeakMap(); // el -> { values, vel, anim, traj, keys, dur }

/* ---------------------------------------------------------------- curves */
export const ease = {
  out: 'cubic-bezier(0.23, 1, 0.32, 1)',
  outExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  inOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  move: 'cubic-bezier(0.25, 1, 0.5, 1)',
  drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
};
export const springs = {
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
export function springEasing(opts = springs.snappy, points = 24) {
  const s = sim({ ...opts, from: 0, to: 1 });
  const pts = [];
  for (let i = 1; i < points; i++) { const p = Math.pow(i / points, 1.5); pts.push(`${+s.pos[Math.round(p * (s.frames - 1))].toFixed(3)} ${+(p * 100).toFixed(1)}%`); }
  return { easing: `linear(0, ${pts.join(', ')}, 1)`, duration: Math.round(s.ms) };
}

/* ---------------------------------------------------------------- rAF spring value */
export function springValue(from, to, opts = {}) {
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

export function spring(el, props, opts = {}) {
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
export function slide(el, g, { instant = false, also = [] } = {}) {
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
export function inkLayer(container, itemSelector) {
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
export function flip(targets, mutate, opts = {}) {
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
export function stagger(els, keyframes, opts = {}) {
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
export function enter(els, opts = {}) {
  const y = opts.y ?? 14;
  return stagger(els, [{ opacity: 0, transform: `translateY(${y}px) scale(${opts.scale ?? 0.985})` }, { opacity: 1, transform: 'none' }], { duration: 520, ...opts });
}

/* ---------------------------------------------------------------- numbers */
export function countUp(el, to, opts = {}) {
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
export function bump(el) {
  if (!el || reducedMotion()) return;
  el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.32)', offset: 0.32 }, { transform: 'scale(0.94)', offset: 0.62 }, { transform: 'scale(1)' }], { duration: 460, easing: ease.out });
}

/** Content just replaced a skeleton (or any placeholder): fade it in with a short blur bridge. */
export function reveal(el, opts = {}) {
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
export function transition(update, { kind = 'page', direction = 0 } = {}) {
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
export function navigate(update, { from, to, direction } = {}) {
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
export function themeReveal() {
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
export function highlight(container, { items } = {}) {
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
export function track(container, { active = '[data-active], [aria-current="page"]', items = ':scope > *' } = {}) {
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
export function followSelection(list, selected = '[aria-selected="true"]') {
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

export const motion = {
  /** 'system' | 'full' | 'reduced' — persisted (ac:motion), resolved to <html data-motion>. */
  get preference() { return motionPref.get(); },
  set preference(v) { motionPref.set(v); },
  get resolved() { return motionPref.resolved(); },
  timeScale: window.__acTimeScale || 1,
  ease, springs, springEasing, springValue, spring, slide, inkLayer, flip, stagger, enter, countUp, bump, reveal, themeReveal, transition, navigate, highlight, track,
  get reduced() { return reducedMotion(); },
};
AC.motion = motion;
