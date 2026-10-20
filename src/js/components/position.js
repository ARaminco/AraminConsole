/* Floating & layer primitives shared by every overlay.
   position(anchor, panel, { placement, offset, padding, flip, shift }) → { side, align, x, y }
     anchor: Element | DOMRect | { x, y } point. placement = "<side>-<align>":
     side top|bottom|start|end|left|right, align start|center|end (logical, RTL-aware).
     Writes --ac-x / --ac-y / --ac-origin / --ac-avail-h on the panel (panel CSS: position:fixed;
     left:var(--ac-x); top:var(--ac-y)) and data-side="top|bottom|left|right".
   autoPosition(anchor, panel, opts) → stop()   (re-positions on scroll/resize)
   portal(el) → restore()                        (moves el to <body>, restore puts it back)
   layers                                        (stack: Esc and outside-click route to the top-most layer)
   Generic trigger: [data-ac-open="#id"] opens / toggles any modal, sheet, drawer, dropdown or popover. */
import { AC, $, on, clamp, isRTL, rafThrottle, instance, scan } from '../core.js';

const rectOf = (a) => {
  if (a instanceof Element) return a.getBoundingClientRect();
  const w = a.width || 0; const hh = a.height || 0;
  return { left: a.x, top: a.y, right: a.x + w, bottom: a.y + hh, width: w, height: hh };
};
const OPP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export function position(anchor, panel, opts = {}) {
  const o = { placement: 'bottom-start', offset: 6, padding: 8, flip: true, shift: true, ...opts };
  const a = rectOf(anchor);
  const rtl = isRTL(panel.isConnected ? panel : document.documentElement);
  let [side, align = 'center'] = String(o.placement).split('-');
  if (side === 'start') side = rtl ? 'right' : 'left';
  else if (side === 'end') side = rtl ? 'left' : 'right';
  const vw = document.documentElement.clientWidth; const vh = window.innerHeight; const p = o.padding;
  const space = { top: a.top - p - o.offset, bottom: vh - a.bottom - p - o.offset, left: a.left - p - o.offset, right: vw - a.right - p - o.offset };
  const vertical0 = side === 'top' || side === 'bottom';
  panel.style.setProperty('--ac-avail-h', `${Math.max(120, vertical0 ? Math.max(space.top, space.bottom) : vh - 2 * p)}px`);
  const pw = panel.offsetWidth; const ph = panel.offsetHeight;
  const need = (s) => (s === 'top' || s === 'bottom' ? ph : pw);
  if (o.flip && space[side] < need(side)) {
    if (space[OPP[side]] >= need(side) || space[OPP[side]] > space[side]) side = OPP[side];
  }
  const vertical = side === 'top' || side === 'bottom';
  let x; let y;
  if (vertical) {
    if (vertical0) panel.style.setProperty('--ac-avail-h', `${Math.max(120, space[side])}px`);
    const h2 = Math.min(ph, Math.max(120, space[side]));
    y = side === 'bottom' ? a.bottom + o.offset : a.top - h2 - o.offset;
    if (align === 'center') x = a.left + a.width / 2 - pw / 2;
    else x = (align === 'start') !== rtl ? a.left : a.right - pw;
  } else {
    x = side === 'right' ? a.right + o.offset : a.left - pw - o.offset;
    if (align === 'center') y = a.top + a.height / 2 - ph / 2;
    else y = align === 'start' ? a.top : a.bottom - ph;
  }
  if (o.shift) {
    x = clamp(x, p, Math.max(p, vw - pw - p));
    y = clamp(y, p, Math.max(p, vh - Math.min(ph, vh - 2 * p) - p));
  }
  x = Math.round(x); y = Math.round(y);
  panel.style.setProperty('--ac-x', `${x}px`);
  panel.style.setProperty('--ac-y', `${y}px`);
  const ox = clamp(a.left + a.width / 2 - x, 0, pw); const oy = clamp(a.top + a.height / 2 - y, 0, ph);
  panel.style.setProperty('--ac-origin', vertical ? `${ox}px ${side === 'bottom' ? 0 : ph}px` : `${side === 'right' ? 0 : pw}px ${oy}px`);
  panel.dataset.side = side;
  return { side, align, x, y };
}

export function autoPosition(anchor, panel, opts) {
  const run = rafThrottle(() => { if (anchor instanceof Element && !anchor.isConnected) return; position(anchor, panel, opts); });
  const offs = [on(window, 'scroll', run, { capture: true, passive: true }), on(window, 'resize', run)];
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(run) : null;
  ro?.observe(panel);
  position(anchor, panel, opts);
  return () => { offs.forEach((f) => f()); ro?.disconnect(); };
}

export function portal(el) {
  if (el.parentNode === document.body) return () => {};
  const mark = document.createComment('ac-portal');
  el.before(mark);
  document.body.append(el);
  return () => { if (mark.isConnected) mark.replaceWith(el); else el.remove(); };
}

/* ---------------------------------------------------------------- layer stack */
const stack = [];
export const layers = {
  /** push({ el, close(reason), esc?:true, light?:false, anchor? }) → entry */
  push(entry) { stack.push(entry); return entry; },
  remove(entry) { const i = stack.indexOf(entry); if (i > -1) stack.splice(i, 1); },
  top() { return stack[stack.length - 1]; },
  get list() { return stack.slice(); },
  closeAll(reason = 'api') { [...stack].reverse().forEach((l) => l.close(reason)); },
};
on(document, 'keydown', (e) => {
  if (e.key !== 'Escape' || e.defaultPrevented) return;
  const top = stack[stack.length - 1];
  if (!top) return;
  e.preventDefault();
  if (top.esc === false) top.bump?.(); else top.close('esc');
});
on(document, 'pointerdown', (e) => {
  for (let i = stack.length - 1; i >= 0; i--) {
    const l = stack[i];
    if (!l.light) break;
    if (l.el.contains(e.target) || (l.anchor instanceof Element && l.anchor.contains(e.target))) break;
    l.close('outside');
  }
}, true);
on(window, 'hashchange', () => layers.closeAll('navigate'));

/* ---------------------------------------------------------------- [data-ac-open] */
const KINDS = ['modal', 'sheet', 'drawer', 'dropdown', 'popover'];
on(document, 'click', '[data-ac-open]', (e, trigger) => {
  const sel = trigger.getAttribute('data-ac-open');
  let target;
  try { target = $(sel); } catch { target = null; }
  if (!target) return;
  e.preventDefault();
  scan(target);
  for (const k of KINDS) {
    const api = instance(target, k);
    if (api) { (api.toggle || api.open)(trigger, e); return; }
  }
});

AC.position = position;
AC.autoPosition = autoPosition;
AC.portal = portal;
AC.layers = layers;
