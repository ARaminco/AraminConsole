/*! AraminConsole v0.1.0 — module overlays — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');

/* ======== module: overlays ======== */
if (!__R["overlays"]) __R["overlays"] = (() => {
const F = {};
const __ac_m1 = __R["core"].f["js/core.js"];
/* ---- js/components/position.js ---- */
const __ac_mc = F["js/components/position.js"] = (() => {
const { AC, $, on, clamp, isRTL, rafThrottle, instance, scan } = __ac_m1;
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


const rectOf = (a) => {
  if (a instanceof Element) return a.getBoundingClientRect();
  const w = a.width || 0; const hh = a.height || 0;
  return { left: a.x, top: a.y, right: a.x + w, bottom: a.y + hh, width: w, height: hh };
};
const OPP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

function position(anchor, panel, opts = {}) {
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

function autoPosition(anchor, panel, opts) {
  const run = rafThrottle(() => { if (anchor instanceof Element && !anchor.isConnected) return; position(anchor, panel, opts); });
  const offs = [on(window, 'scroll', run, { capture: true, passive: true }), on(window, 'resize', run)];
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(run) : null;
  ro?.observe(panel);
  position(anchor, panel, opts);
  return () => { offs.forEach((f) => f()); ro?.disconnect(); };
}

function portal(el) {
  if (el.parentNode === document.body) return () => {};
  const mark = document.createComment('ac-portal');
  el.before(mark);
  document.body.append(el);
  return () => { if (mark.isConnected) mark.replaceWith(el); else el.remove(); };
}

/* ---------------------------------------------------------------- layer stack */
const stack = [];
const layers = {
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
return Object.freeze({ position, autoPosition, portal, layers });
})();

/* ---- js/components/sheet.js ---- */
const __ac_md = F["js/components/sheet.js"] = (() => {
const { AC, $, on, emit, h, icon, options, instance, register, scan, trapFocus, scrollLock, gesture, reducedMotion, haptic, clamp, i18n, uid, escapeHtml } = __ac_m1;
const { portal, layers } = __ac_mc;
/* Bottom sheet + the dialog layer shared by modal, drawer, confirm and the action sheet.
   Markup: <div class="ac-sheet" id="s" data-ac="sheet" [data-snap="0.5,0.9"] [data-snap-start="0"] [data-static]>
             <div class="ac-dialog"><div class="ac-dialog__head">…</div><div class="ac-dialog__body">…</div></div></div>
   Triggers: [data-ac-open="#s"], [data-ac-close] inside. The panel gets a drag handle; drag down to
   dismiss (velocity aware), drag between snap points, backdrop fades with the drag.
   API: AC.sheet.open('#s' | el | { title, content, footer, snap, className }) → instance
        AC.sheet.close([target]) · AC.instance(el,'sheet').snapTo(i)
   Events: ac:sheet:open, ac:sheet:close {reason} (then ac:sheet:closed), ac:sheet:snap {index, value};
   same names with modal/drawer for those components. ac:<kind>:beforeclose is cancelable. */



const phoneMQ = matchMedia('(max-width: 639.98px)');
const DUR = 320;

/** Wire a .ac-modal / .ac-sheet / .ac-drawer root. cfg.drag(el, panel, o, close) → { reset(), destroy(), snapTo? } */
function dialogLayer(el, kind, defaults = {}, cfg = {}) {
  const o = options(el, defaults);
  const panel = el.querySelector('.ac-dialog') || el.firstElementChild;
  if (!panel) return undefined;
  if (!panel.hasAttribute('role')) panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  const label = (sel, attr) => {
    const n = panel.querySelector(sel);
    if (n && !panel.hasAttribute(attr) && !(attr === 'aria-labelledby' && panel.hasAttribute('aria-label'))) { n.id ||= uid('dlg'); panel.setAttribute(attr, n.id); }
  };
  label('.ac-dialog__title', 'aria-labelledby');
  label('.ac-dialog__text', 'aria-describedby');
  if (!panel.querySelector(':scope > .ac-dialog__handle')) panel.prepend(h('div', { class: 'ac-dialog__handle', 'aria-hidden': 'true' }));
  if (!el.dataset.state) el.dataset.state = 'closed';
  let release = null; let restore = null; let entry = null; let timer = 0; let downOnBackdrop = false; let bumpT = 0;
  const isOpen = () => el.dataset.state === 'open';

  function bump() {
    clearTimeout(bumpT);
    el.removeAttribute('data-bump'); void el.offsetWidth; el.setAttribute('data-bump', '');
    haptic(10);
    bumpT = setTimeout(() => el.removeAttribute('data-bump'), 300);
  }
  function open(trigger) {
    if (isOpen()) return api;
    clearTimeout(timer);
    restore ??= portal(el);
    scrollLock.lock();
    entry = layers.push({ el, close, bump, esc: !o.static, kind });
    el.style.setProperty('--_p', '1');
    el.dataset.state = 'closing';
    drag?.reset();
    void el.offsetWidth;
    el.dataset.state = 'open';
    const initial = (o.initial && $(o.initial, panel)) || panel.querySelector('[autofocus]') || panel;
    release = trapFocus(panel, { initial });
    emit(el, `${kind}:open`, { trigger: trigger instanceof Element ? trigger : null });
    return api;
  }
  function close(reason = 'api') {
    if (!isOpen()) return api;
    if (emit(el, `${kind}:beforeclose`, { reason }).defaultPrevented) { bump(); return api; }
    el.dataset.state = 'closing';
    layers.remove(entry); entry = null;
    scrollLock.unlock();
    const r = release; release = null; r?.();
    emit(el, `${kind}:close`, { reason });
    timer = setTimeout(() => {
      if (isOpen()) return;
      el.dataset.state = 'closed';
      emit(el, `${kind}:closed`, { reason });
      restore?.(); restore = null;
    }, reducedMotion() ? 0 : DUR);
    return api;
  }
  const drag = cfg.drag ? cfg.drag(el, panel, o, close) : null;
  const offs = [
    on(el, 'pointerdown', (e) => { downOnBackdrop = e.target === el; }),
    on(el, 'click', (e) => { if (e.target === el && downOnBackdrop) { if (o.static) bump(); else close('backdrop'); } }),
    on(el, 'click', '[data-ac-close]', (e, b) => {
      if (b.closest('.ac-modal, .ac-sheet, .ac-drawer') !== el) return;
      e.preventDefault(); close(b.getAttribute('data-ac-close') || 'button');
    }),
  ];
  const api = {
    el, panel, open, close, bump,
    toggle: (t) => (isOpen() ? close() : open(t)),
    snapTo: (i) => drag?.snapTo?.(i),
    get isOpen() { return isOpen(); },
  };
  instance(el, kind, api);
  return () => {
    offs.forEach((f) => f()); drag?.destroy();
    if (entry) { layers.remove(entry); scrollLock.unlock(); release?.(); }
  };
}

/** Vertical sheet drag with snap points. when() gates it (the modal only drags on phones). */
function sheetDrag(el, panel, o, close, when = () => true) {
  const snaps = String(o.snap ?? '').split(',').map(Number).filter((n) => n > 0 && n <= 1).sort((a, b) => a - b);
  const max = snaps.length ? snaps[snaps.length - 1] : 0;
  let idx = 0; let y = 0; let base = 0; let lastMove = 0; let allowScroll = false; let decided = false; let tx = 0; let ty = 0;
  if (snaps.length) { el.setAttribute('data-snaps', ''); el.style.setProperty('--_max', String(max)); }
  const posOf = (i) => (snaps.length ? (max - snaps[i]) * window.innerHeight : 0);
  const setY = (v) => {
    y = v;
    el.style.setProperty('--_y', `${Math.round(v)}px`);
    const lo = posOf(0);
    el.style.setProperty('--_p', String(clamp(1 - (v - lo) / Math.max(1, panel.offsetHeight - lo), 0, 1).toFixed(3)));
  };
  function snapTo(i) {
    if (!snaps.length) { setY(0); return; }
    const prev = idx;
    idx = clamp(i, 0, snaps.length - 1);
    setY(posOf(idx));
    el.dataset.snap = String(idx);
    if (prev !== idx) { haptic(); emit(el, 'sheet:snap', { index: idx, value: snaps[idx] }); }
  }
  const scroller = (t) => {
    for (let n = t; n && n !== panel; n = n.parentElement) {
      if (n.scrollHeight > n.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(n).overflowY)) return n;
    }
    return null;
  };
  const offs = [
    on(panel, 'touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; decided = false; allowScroll = false; }, { passive: true }),
    on(panel, 'touchmove', (e) => {
      if (!when() || e.touches.length > 1) return;
      if (!decided) {
        const dx = e.touches[0].clientX - tx; const dy = e.touches[0].clientY - ty;
        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
        decided = true;
        if (e.target.closest('.ac-dialog__handle, .ac-dialog__head')) allowScroll = false;
        else if (Math.abs(dx) > Math.abs(dy)) allowScroll = true;
        else {
          const sc = scroller(e.target);
          allowScroll = dy > 0 ? !!sc && sc.scrollTop > 0 : !!sc && (!snaps.length || idx === snaps.length - 1);
        }
      }
      if (!allowScroll && e.cancelable) e.preventDefault();
    }, { passive: false }),
    on(window, 'resize', () => { if (el.dataset.state === 'open' && when()) snapTo(idx); }),
  ];
  const g = gesture(panel, {
    axis: 'y',
    filter: (e) => when() && !e.target.closest('input, textarea, select, [contenteditable="true"], [data-no-drag]')
      && (e.pointerType !== 'mouse' || !!e.target.closest('.ac-dialog__handle, .ac-dialog__head')),
    onStart: (s) => {
      if (s.pointerType !== 'mouse' && allowScroll) return false;
      base = y; el.setAttribute('data-dragging', '');
      return true;
    },
    onMove: (s) => {
      lastMove = performance.now();
      let v = base + s.dy;
      const top = snaps.length ? posOf(snaps.length - 1) : 0;
      if (v < top) v = top - Math.sqrt(top - v) * 2.5;
      setY(v);
    },
    onEnd: (s) => {
      el.removeAttribute('data-dragging');
      const H = panel.offsetHeight;
      const pos = snaps.length ? snaps.map((_, i) => posOf(i)) : [0];
      if (s.cancelled) { snapTo(idx); return; }
      if (performance.now() - lastMove > 90) s = { ...s, vy: 0 }; // finger rested before release
      const lowest = pos[0];
      let target;
      if (s.vy > 0.5) target = pos.filter((p) => p > y + 4).sort((a, b) => a - b)[0] ?? H;
      else if (s.vy < -0.5) target = pos.filter((p) => p < y - 4).sort((a, b) => b - a)[0] ?? pos[pos.length - 1];
      else if (y > lowest + (H - lowest) * 0.4) target = H;
      else target = pos.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
      if (target >= H) { haptic(); close('drag'); return; }
      snapTo(pos.indexOf(target));
    },
  });
  return {
    reset: () => { idx = clamp(Number(o.snapStart) || 0, 0, Math.max(0, snaps.length - 1)); if (when()) snapTo(idx); else setY(0); },
    snapTo,
    destroy: () => { offs.forEach((f) => f()); g(); },
  };
}

/* ---------------------------------------------------------------- imperative builder */
/** buildLayer('modal'|'sheet'|'drawer', { title, sub, content, footer, size, side, snap, className, role, closeButton, static, initial, label }) */
function buildLayer(kind, cfg = {}) {
  const el = h('div', {
    class: `ac-${kind}${cfg.className ? ` ${cfg.className}` : ''}`, 'data-ac': kind, 'data-ephemeral': '',
    'data-size': cfg.size, 'data-side': cfg.side, 'data-snap': cfg.snap ? [].concat(cfg.snap).join(',') : null,
    'data-snap-start': cfg.snapStart, 'data-static': cfg.static || null, 'data-initial': cfg.initial,
  });
  const panel = h('div', { class: 'ac-dialog', role: cfg.role || 'dialog', 'aria-label': cfg.label });
  if (cfg.title || cfg.closeButton !== false) {
    panel.insertAdjacentHTML('beforeend', `<div class="ac-dialog__head"><div class="ac-dialog__titles">${cfg.title ? `<h2 class="ac-dialog__title">${escapeHtml(cfg.title)}</h2>` : ''}${cfg.sub ? `<p class="ac-dialog__sub">${escapeHtml(cfg.sub)}</p>` : ''}</div>${cfg.closeButton === false ? '' : closeButton()}</div>`);
  }
  const put = (cls, c) => {
    if (c == null || c === '') return;
    const box = h('div', { class: cls });
    if (c instanceof Node) box.append(c); else box.innerHTML = c;
    panel.append(box);
  };
  put('ac-dialog__body', cfg.content);
  put('ac-dialog__foot', cfg.footer);
  el.append(panel);
  document.body.append(el);
  scan(el);
  el.addEventListener(`ac:${kind}:closed`, () => el.remove(), { once: true });
  return instance(el, kind);
}
const closeButton = () => `<button class="ac-dialog__close" type="button" data-ac-close aria-label="${escapeHtml(i18n.t('overlay.close', 'Close'))}">${icon('x')}</button>`;

/** Imperative API shared by modal / sheet / drawer. */
function opener(kind) {
  const resolve = (t) => (typeof t === 'string' ? $(t) : t);
  return {
    open(target, trigger) {
      if (target && typeof target === 'object' && !(target instanceof Element)) return buildLayer(kind, target)?.open(trigger);
      const el = resolve(target);
      if (!el) return null;
      scan(el);
      return instance(el, kind)?.open(trigger);
    },
    close(target) {
      if (target) { instance(resolve(target), kind)?.close('api'); return; }
      layers.list.reverse().find((l) => l.kind === kind)?.close('api');
    },
    get(target) { return instance(resolve(target), kind); },
  };
}

register('sheet', (el) => dialogLayer(el, 'sheet', {}, { drag: (e, p, o, c) => sheetDrag(e, p, o, c) }));

const sheet = opener('sheet');
AC.sheet = sheet;
return Object.freeze({ phoneMQ, dialogLayer, sheetDrag, buildLayer, closeButton, opener, sheet });
})();

/* ---- js/components/modal.js ---- */
const __ac_me = F["js/components/modal.js"] = (() => {
const { AC, register } = __ac_m1;
const { dialogLayer, sheetDrag, opener, phoneMQ } = __ac_md;
/* Modal / dialog. Sizes data-size="sm|md|lg|full"; below 640px it presents as a bottom sheet
   (grab handle, drag-to-dismiss) with the same markup.
   <div class="ac-modal" id="m" data-ac="modal" data-size="md" [data-static] [data-initial="#field"]>
     <div class="ac-dialog">
       <div class="ac-dialog__head"><div class="ac-dialog__titles"><h2 class="ac-dialog__title">…</h2><p class="ac-dialog__sub">…</p></div>
         <button class="ac-dialog__close" data-ac-close aria-label="Close">…</button></div>
       <div class="ac-dialog__body">…</div>
       <div class="ac-dialog__foot">…</div>
     </div>
   </div>
   API: AC.modal.open('#m' | el | { title, sub, content, footer, size, static }) · AC.modal.close([target])
   Events: ac:modal:open, ac:modal:beforeclose (cancelable), ac:modal:close {reason}, ac:modal:closed */



register('modal', (el) => dialogLayer(el, 'modal', { size: 'md' }, {
  drag: (e, p, o, c) => sheetDrag(e, p, { ...o, snap: '' }, c, () => phoneMQ.matches),
}));

const modal = opener('modal');
AC.modal = modal;
return Object.freeze({ modal });
})();

/* ---- js/components/drawer.js ---- */
const __ac_mf = F["js/components/drawer.js"] = (() => {
const { AC, register, gesture, isRTL, clamp, haptic } = __ac_m1;
const { dialogLayer, opener } = __ac_md;
/* Side drawer. data-side="start|end" (logical, RTL-aware), data-size="sm|md|lg".
   Same inner markup as the modal (.ac-dialog + __head/__body/__foot). Swipe toward its edge to dismiss.
   API: AC.drawer.open('#d' | el | { title, content, footer, side, size }) · AC.drawer.close([target])
   Events: ac:drawer:open, ac:drawer:close {reason}, ac:drawer:closed */



function drawerDrag(el, panel, o, close) {
  const dirSign = () => ((el.dataset.side === 'start') !== isRTL(el) ? -1 : 1); // physical direction that closes it
  const g = gesture(panel, {
    axis: 'x',
    filter: (e) => e.pointerType !== 'mouse' && !e.target.closest('input, textarea, select, [data-no-drag]'),
    onStart: () => { el.setAttribute('data-dragging', ''); },
    onMove: (s) => {
      const d = s.dx * dirSign();
      const v = d < 0 ? -Math.sqrt(-d) * 2 : d;
      el.style.setProperty('--_x', `${Math.round(v * dirSign())}px`);
      el.style.setProperty('--_p', String(clamp(1 - v / panel.offsetWidth, 0, 1).toFixed(3)));
    },
    onEnd: (s) => {
      el.removeAttribute('data-dragging');
      const d = s.dx * dirSign(); const v = s.vx * dirSign();
      el.style.setProperty('--_x', '0px');
      if (!s.cancelled && (v > 0.5 || d > panel.offsetWidth * 0.4)) { haptic(); close('drag'); } else el.style.setProperty('--_p', '1');
    },
  });
  return { reset: () => el.style.setProperty('--_x', '0px'), destroy: g };
}

register('drawer', (el) => {
  if (!el.dataset.side) el.dataset.side = 'end';
  return dialogLayer(el, 'drawer', { side: 'end' }, { drag: drawerDrag });
});

const drawer = opener('drawer');
AC.drawer = drawer;
return Object.freeze({ drawer });
})();

/* ---- js/components/menu.js ---- */
const __ac_mg = F["js/components/menu.js"] = (() => {
const { AC, $, $$, on, emit, h, icon, escapeHtml, options, instance, register, scan, isRTL, haptic, reducedMotion, i18n } = __ac_m1;
const { autoPosition, portal, layers } = __ac_mc;
const { buildLayer, phoneMQ } = __ac_md;
/* Dropdown menu, context menu and phone action sheet.
   <button data-ac-open="#m">…</button>
   <div class="ac-menu" id="m" data-ac="dropdown" [data-placement="bottom-end"] aria-label="…">
     <div class="ac-menu__label">Group</div>
     <button class="ac-menu__item" data-value="edit">icon <span class="ac-menu__text">Edit</span><kbd class="ac-menu__kbd">E</kbd></button>
     <button class="ac-menu__item" role="menuitemcheckbox" aria-checked="true">…</button>
     <div role="group"><button class="ac-menu__item" role="menuitemradio" aria-checked="true">…</button>…</div>
     <div class="ac-menu__sep"></div>
     <div class="ac-menu__sub"><button class="ac-menu__item">More</button><div class="ac-menu">…</div></div>
     <button class="ac-menu__item" data-tone="danger">Delete</button>
   </div>
   Context menu: <div data-ac-contextmenu="#m">…</div> — right click, or long-press on touch.
   Below 640px menus present as an action sheet (drag to dismiss, cancel button).
   API: AC.menu(anchor|{x,y}|event, items, { placement }) → { el, close }
        items: [{ label, icon, shortcut, tone, disabled, value, checked, radio:'group', keep, onSelect(item), items:[…] }, '-', { heading }]
        AC.menu.open('#m', anchor) · AC.menu.close() · AC.menu.context(el, items)
   Events: ac:menu:select { item, value, checked } (on the menu), ac:dropdown:open / ac:dropdown:close */




const ITEM = '.ac-menu__item';
const itemsOf = (menu) => $$(ITEM, menu).filter((n) => n.closest('.ac-menu') === menu && !n.matches('[aria-disabled="true"], :disabled'));

function prepare(menu) {
  menu.setAttribute('role', 'menu');
  if (!menu.hasAttribute('tabindex')) menu.tabIndex = -1;
  for (const it of $$(ITEM, menu)) {
    if (!it.hasAttribute('role')) it.setAttribute('role', 'menuitem');
    it.tabIndex = -1;
    if (it.tagName === 'BUTTON' && !it.hasAttribute('type')) it.type = 'button';
    if (/checkbox|radio/.test(it.getAttribute('role')) && !it.querySelector('.ac-menu__check')) it.insertAdjacentHTML('afterbegin', `<span class="ac-menu__check" aria-hidden="true">${icon('check')}</span>`);
    const sub = it.parentElement.matches('.ac-menu__sub') && it.nextElementSibling?.matches('.ac-menu') ? it.nextElementSibling : null;
    if (sub) {
      it.setAttribute('aria-haspopup', 'menu'); it.setAttribute('aria-expanded', 'false');
      if (!it.querySelector('.ac-menu__chev')) it.insertAdjacentHTML('beforeend', `<span class="ac-menu__chev">${icon('chevron-right', 'ac-flip-rtl')}</span>`);
      prepare(sub);
    }
  }
  for (const s of $$('.ac-menu__sep', menu)) s.setAttribute('role', 'separator');
  for (const l of $$('.ac-menu__label', menu)) l.setAttribute('role', 'presentation');
}

/* ------------------------------------------------------------------ controller */
function controller(menu, o = {}) {
  let st = null; // open state { anchor, trigger, stop, restore, entry, sheet, parent }
  const isOpen = () => !!st;
  let typed = ''; let typedT = 0; let hoverT = 0; let openSub = null;

  function focusItem(it) {
    if (!it) return;
    for (const n of itemsOf(menu)) n.tabIndex = n === it ? 0 : -1;
    it.focus({ preventScroll: false });
  }
  function move(dir) {
    const list = itemsOf(menu); if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    focusItem(list[(i + dir + list.length) % list.length] || list[0]);
  }
  function open(anchor, { trigger = null, keyboard = false, placement, parent = null } = {}) {
    if (st) close('reopen', false);
    prepare(menu);
    trigger = trigger || (anchor instanceof Element ? anchor : null);
    const asSheet = !parent && phoneMQ.matches;
    st = { anchor, trigger, parent };
    if (asSheet) {
      const mark = document.createComment('ac-menu');
      menu.before(mark);
      menu.dataset.state = 'open';
      const sh = buildLayer('sheet', { className: 'ac-actionsheet', closeButton: false, label: menu.getAttribute('aria-label') || i18n.t('overlay.actions', 'Actions'),
        content: menu, footer: `<button class="ac-btn ac-btn--lg ac-btn--block" type="button" data-ac-close>${escapeHtml(i18n.t('overlay.cancel', 'Cancel'))}</button>`, initial: '.ac-menu' });
      st.sheet = sh;
      st.restore = () => { if (mark.isConnected) mark.replaceWith(menu); else menu.remove(); };
      sh.el.addEventListener('ac:sheet:close', () => { if (st?.sheet === sh) close('sheet', true, true); }, { once: true });
      sh.open(trigger);
    } else {
      st.restore = portal(menu);
      menu.dataset.state = 'closing';
      void menu.offsetWidth;
      menu.dataset.state = 'open';
      st.stop = autoPosition(anchor, menu, { placement: placement || o.placement || (parent ? 'end-start' : 'bottom-start'), offset: parent ? -4 : anchor instanceof Element ? 6 : 2 });
      st.entry = layers.push({ el: menu, close: (r) => close(r), light: true, anchor: trigger, kind: 'dropdown' });
      requestAnimationFrame(() => { if (st) (keyboard ? focusItem(itemsOf(menu)[0]) : menu.focus({ preventScroll: true })); });
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    emit(menu, 'dropdown:open', { trigger });
    return api;
  }
  function close(reason = 'api', refocus = true, fromSheet = false) {
    if (!st) return api;
    const s = st; st = null;
    const ae = document.activeElement;
    const hadFocus = !!ae?.closest?.('.ac-menu') || ae === document.body;
    closeSub(false);
    if (s.parent) o.parentApi?.onSubClosed(api);
    clearTimeout(hoverT);
    if (s.trigger) s.trigger.setAttribute('aria-expanded', 'false');
    if (s.sheet) {
      if (!fromSheet) s.sheet.close(reason);
      s.sheet.el.addEventListener('ac:sheet:closed', () => { s.restore(); menu.dataset.state = 'closed'; }, { once: true });
    } else {
      menu.dataset.state = 'closing';
      s.stop?.(); layers.remove(s.entry);
      if (refocus && hadFocus && s.trigger?.isConnected) s.trigger.focus({ preventScroll: true });
      setTimeout(() => { if (!st) { menu.dataset.state = 'closed'; s.restore(); } }, reducedMotion() ? 0 : 160);
    }
    emit(menu, 'dropdown:close', { reason });
    return api;
  }

  function subOf(it) { return it?.getAttribute('aria-haspopup') === 'menu' ? it.nextElementSibling : null; }
  function showSub(it, keyboard) {
    const sub = subOf(it); if (!sub) return;
    if (openSub?.it === it) { if (keyboard) openSub.api.focusFirst(); return; }
    closeSub(false);
    if (st?.sheet) { const ex = it.getAttribute('aria-expanded') === 'true'; it.setAttribute('aria-expanded', String(!ex)); return; }
    const api2 = instance(sub, 'submenu') || instance(sub, 'submenu', controller(sub, { parentApi: api }));
    openSub = { it, api: api2 };
    it.setAttribute('aria-expanded', 'true');
    api2.open(it, { trigger: it, keyboard, parent: menu });
  }
  function closeSub(refocus) {
    if (!openSub) return;
    const s = openSub; openSub = null;
    s.it.setAttribute('aria-expanded', 'false');
    s.api.close('sub', refocus);
  }

  function select(it, e) {
    const sub = subOf(it);
    if (sub) { showSub(it, e.detail === 0); return; }
    const role = it.getAttribute('role');
    let checked;
    if (role === 'menuitemcheckbox') { checked = it.getAttribute('aria-checked') !== 'true'; it.setAttribute('aria-checked', String(checked)); }
    else if (role === 'menuitemradio') {
      const grp = it.closest('[role="group"]') || menu;
      for (const r of $$('[role="menuitemradio"]', grp)) r.setAttribute('aria-checked', String(r === it));
      checked = true;
    }
    haptic();
    const detail = { item: it, value: it.dataset.value ?? it.textContent.trim(), checked };
    const ev = emit(menu, 'menu:select', detail);
    const keep = checked !== undefined || it.hasAttribute('data-keep');
    if (!keep && !ev.defaultPrevented) {
      let top = api; while (top.parentApi) top = top.parentApi;
      top.close('select');
    }
  }

  const offs = [
    on(menu, 'click', ITEM, (e, it) => {
      if (it.closest('.ac-menu') !== menu || it.matches('[aria-disabled="true"], :disabled')) return;
      select(it, e);
    }),
    on(menu, 'pointermove', ITEM, (e, it) => {
      if (e.pointerType !== 'mouse' || it.closest('.ac-menu') !== menu || st?.sheet) return;
      if (document.activeElement !== it && !it.matches('[aria-disabled="true"], :disabled')) focusItem(it);
      clearTimeout(hoverT);
      hoverT = setTimeout(() => { if (subOf(it)) showSub(it, false); else if (openSub && openSub.it !== it) closeSub(false); }, 120);
    }),
    on(menu, 'keydown', (e) => {
      if (e.target.closest('.ac-menu') !== menu) return;
      const fwd = isRTL(menu) ? 'ArrowLeft' : 'ArrowRight'; const back = isRTL(menu) ? 'ArrowRight' : 'ArrowLeft';
      const cur = document.activeElement?.closest(ITEM);
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Home') { e.preventDefault(); focusItem(itemsOf(menu)[0]); }
      else if (e.key === 'End') { e.preventDefault(); focusItem(itemsOf(menu).at(-1)); }
      else if ((e.key === 'Enter' || e.key === ' ') && cur) { e.preventDefault(); cur.click(); }
      else if (e.key === fwd && subOf(cur)) { e.preventDefault(); showSub(cur, true); }
      else if (e.key === back && st?.parent) { e.preventDefault(); o.parentApi?.closeSubFromChild(); }
      else if (e.key === 'Tab') { let top = api; while (top.parentApi) top = top.parentApi; top.close('tab', false); }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        clearTimeout(typedT); typed += e.key.toLowerCase(); typedT = setTimeout(() => { typed = ''; }, 600);
        const list = itemsOf(menu); const start = list.indexOf(cur);
        const hit = [...list.slice(start + 1), ...list.slice(0, start + 1)].find((n) => n.textContent.trim().toLowerCase().startsWith(typed));
        if (hit) focusItem(hit);
      }
    }),
  ];
  const api = {
    el: menu, open, close,
    parentApi: o.parentApi,
    toggle(trigger, e) { return st ? close('toggle') : open(trigger, { trigger, keyboard: !!e && e.detail === 0 }); },
    onSubClosed(child) { if (openSub?.api === child) { openSub.it.setAttribute('aria-expanded', 'false'); openSub = null; } },
    focusFirst() { focusItem(itemsOf(menu)[0]); },
    closeSubFromChild() { const it = openSub?.it; closeSub(false); it?.focus(); },
    get isOpen() { return isOpen(); },
    destroy() { offs.forEach((f) => f()); close('destroy', false); },
  };
  return api;
}

register('dropdown', (el) => {
  const api = controller(el, options(el, { placement: 'bottom-start' }));
  instance(el, 'dropdown', api);
  if (!el.dataset.state) el.dataset.state = 'closed';
  for (const t of $$(`[data-ac-open="#${el.id}"]`)) { t.setAttribute('aria-haspopup', 'menu'); t.setAttribute('aria-expanded', 'false'); t.setAttribute('aria-controls', el.id); }
  return () => api.destroy();
});

/* ------------------------------------------------------------------ imperative */
function renderItems(list, handlers) {
  let html = '';
  for (const it of list) {
    if (it === '-' || it?.separator) { html += '<div class="ac-menu__sep"></div>'; continue; }
    if (it.heading) { html += `<div class="ac-menu__label">${escapeHtml(it.heading)}</div>`; continue; }
    const i = handlers.push(it) - 1;
    const role = it.radio ? 'menuitemradio' : 'checked' in it ? 'menuitemcheckbox' : 'menuitem';
    const btn = `<button class="ac-menu__item" type="button" role="${role}" data-i="${i}"${it.value != null ? ` data-value="${escapeHtml(it.value)}"` : ''}${it.tone ? ` data-tone="${escapeHtml(it.tone)}"` : ''}${it.disabled ? ' aria-disabled="true"' : ''}${role !== 'menuitem' ? ` aria-checked="${!!it.checked}"` : ''}${it.radio ? ` data-radio="${escapeHtml(it.radio)}"` : ''}${it.keep ? ' data-keep' : ''}>${it.icon ? icon(it.icon) : ''}<span class="ac-menu__text">${escapeHtml(it.label)}</span>${it.shortcut ? `<kbd class="ac-menu__kbd">${escapeHtml(it.shortcut)}</kbd>` : ''}</button>`;
    html += it.items ? `<div class="ac-menu__sub">${btn}<div class="ac-menu">${renderItems(it.items, handlers)}</div></div>` : btn;
  }
  return html;
}

function menu(anchor, items = [], opts = {}) {
  const handlers = [];
  const el = h('div', { class: 'ac-menu', 'data-state': 'closed', 'aria-label': opts.label });
  el.innerHTML = renderItems(items, handlers);
  // radio items sharing a name → one group
  for (const m of [el, ...$$('.ac-menu', el)]) {
    const groups = new Map();
    for (const b of m.querySelectorAll(':scope > [data-radio]')) { if (!groups.has(b.dataset.radio)) groups.set(b.dataset.radio, []); groups.get(b.dataset.radio).push(b); }
    for (const btns of groups.values()) { const g = h('div', { role: 'group' }); btns[0].before(g); g.append(...btns); }
  }
  document.body.append(el);
  const api = controller(el, opts);
  on(el, 'ac:menu:select', (e) => { const it = handlers[Number(e.detail.item.dataset.i)]; it?.onSelect?.(it, e.detail); });
  on(el, 'ac:dropdown:close', (e) => { if (e.target === el) setTimeout(() => { if (!api.isOpen) { api.destroy(); el.remove(); } }, 400); });
  let point = anchor;
  if (anchor instanceof Event) point = { x: anchor.clientX, y: anchor.clientY };
  const trigger = anchor instanceof Element ? anchor : (document.activeElement !== document.body ? document.activeElement : null);
  api.open(point, { trigger, keyboard: !!opts.keyboard, placement: opts.placement });
  return api;
}
menu.open = (target, anchor) => {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return null;
  scan(el);
  const api = instance(el, 'dropdown');
  const pt = anchor instanceof Event ? { x: anchor.clientX, y: anchor.clientY } : anchor;
  return api?.open(pt || el, { trigger: anchor instanceof Element ? anchor : null });
};
menu.close = () => layers.list.reverse().filter((l) => l.kind === 'dropdown').forEach((l) => l.close('api'));
menu.context = (el, items, opts) => on(el, 'contextmenu', (e) => { e.preventDefault(); menu(e, typeof items === 'function' ? items(e) : items, opts); });

/* ------------------------------------------------------------------ context menus: right click + long press */
let lastCtx = 0;
function openContext(area, x, y) {
  const now = Date.now(); if (now - lastCtx < 700) return; lastCtx = now;
  const target = $(area.getAttribute('data-ac-contextmenu'));
  if (!target) return;
  scan(target);
  emit(area, 'contextmenu:open', { x, y, menu: target });
  instance(target, 'dropdown')?.open({ x, y }, { trigger: area.matches('[tabindex], a, button') ? area : null });
}
on(document, 'contextmenu', '[data-ac-contextmenu]', (e, area) => { e.preventDefault(); openContext(area, e.clientX, e.clientY); });
on(document, 'keydown', (e) => {
  const area = e.target.closest?.('[data-ac-contextmenu]');
  if (area && (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10'))) {
    e.preventDefault(); const r = area.getBoundingClientRect(); openContext(area, r.left + r.width / 2, r.top + r.height / 2);
  }
});
let lp = null;
on(document, 'pointerdown', '[data-ac-contextmenu]', (e, area) => {
  if (e.pointerType === 'mouse') return;
  const sx = e.clientX; const sy = e.clientY;
  clearTimeout(lp?.t);
  lp = { area, sx, sy, t: setTimeout(() => {
    haptic(12); area.setAttribute('data-pressed', ''); setTimeout(() => area.removeAttribute('data-pressed'), 200);
    // swallow the click the browser synthesises when the finger lifts (it would hit the new menu)
    const until = Date.now() + 800;
    const eat = (ev) => { if (Date.now() < until) { ev.preventDefault(); ev.stopPropagation(); } document.removeEventListener('click', eat, true); };
    document.addEventListener('click', eat, true);
    setTimeout(() => document.removeEventListener('click', eat, true), 800);
    openContext(area, sx, sy); lp = null;
  }, 480) };
});
on(document, 'pointermove', (e) => { if (lp && Math.hypot(e.clientX - lp.sx, e.clientY - lp.sy) > 8) { clearTimeout(lp.t); lp = null; } }, { passive: true });
['pointerup', 'pointercancel', 'scroll'].forEach((t) => on(document, t, () => { if (lp) { clearTimeout(lp.t); lp = null; } }, { passive: true, capture: true }));

AC.menu = menu;
return Object.freeze({ menu });
})();

/* ---- js/components/popover.js ---- */
const __ac_mh = F["js/components/popover.js"] = (() => {
const { AC, $, on, emit, h, options, instance, register, scan, reducedMotion } = __ac_m1;
const { autoPosition, portal, layers } = __ac_mc;
/* Popover: a non-modal floating panel anchored to its trigger (smart flip / shift, RTL-aware).
   <button data-ac-open="#p">…</button>
   <div class="ac-popover" id="p" data-ac="popover" [data-placement="bottom-start"] aria-label="…">…</div>
   Light dismiss (outside click, Esc, focus leaving), focus returns to the trigger.
   API: AC.popover.open('#p' | el, anchor) · AC.popover.close([target]) · AC.popover.toggle(target, anchor)
        AC.popover.show(anchor, { content, placement, className, label }) → instance (removed on close)
   Events: ac:popover:open, ac:popover:close {reason} */



register('popover', (el) => {
  const o = options(el, { placement: 'bottom-start', offset: 8 });
  if (!el.hasAttribute('role')) el.setAttribute('role', 'dialog');
  if (!el.hasAttribute('tabindex')) el.tabIndex = -1;
  if (!el.dataset.state) el.dataset.state = 'closed';
  let st = null;
  function open(anchor, e) {
    if (st) return api;
    const trigger = anchor instanceof Element ? anchor : null;
    st = { trigger, restore: portal(el) };
    el.dataset.state = 'closing';
    void el.offsetWidth;
    el.dataset.state = 'open';
    st.stop = autoPosition(anchor || document.body, el, { placement: o.placement, offset: o.offset });
    st.entry = layers.push({ el, close, light: true, anchor: trigger, kind: 'popover' });
    trigger?.setAttribute('aria-expanded', 'true');
    const first = el.querySelector('[autofocus]') || el;
    requestAnimationFrame(() => st && first.focus({ preventScroll: true }));
    emit(el, 'popover:open', { trigger, keyboard: !!e && e.detail === 0 });
    return api;
  }
  function close(reason = 'api') {
    if (!st) return api;
    const s = st; st = null;
    el.dataset.state = 'closing';
    s.stop(); layers.remove(s.entry);
    s.trigger?.setAttribute('aria-expanded', 'false');
    if (reason !== 'outside' && reason !== 'focusout' && (el.contains(document.activeElement) || document.activeElement === document.body)) s.trigger?.focus({ preventScroll: true });
    emit(el, 'popover:close', { reason });
    setTimeout(() => { if (!st) { el.dataset.state = 'closed'; s.restore(); } }, reducedMotion() ? 0 : 200);
    return api;
  }
  const offs = [
    on(el, 'focusout', (e) => {
      const to = e.relatedTarget;
      if (st && to && !el.contains(to) && to !== st.trigger && !to.closest('.ac-menu, .ac-popover, .ac-modal, .ac-sheet')) close('focusout');
    }),
    on(el, 'click', '[data-ac-close]', (e) => { e.preventDefault(); close('button'); }),
  ];
  for (const t of document.querySelectorAll(`[data-ac-open="#${el.id}"]`)) { t.setAttribute('aria-haspopup', 'dialog'); t.setAttribute('aria-expanded', 'false'); t.setAttribute('aria-controls', el.id); }
  const api = { el, open, close, toggle: (a, e) => (st ? close('toggle') : open(a, e)), get isOpen() { return !!st; } };
  instance(el, 'popover', api);
  return () => { offs.forEach((f) => f()); close('destroy'); };
});

const resolve = (t) => (typeof t === 'string' ? $(t) : t);
const get = (t) => { const el = resolve(t); if (!el) return null; scan(el); return instance(el, 'popover'); };
const popover = {
  open: (target, anchor) => get(target)?.open(anchor),
  close: (target) => (target ? get(target)?.close() : layers.list.reverse().find((l) => l.kind === 'popover')?.close('api')),
  toggle: (target, anchor) => get(target)?.toggle(anchor),
  show(anchor, cfg = {}) {
    const el = h('div', { class: `ac-popover${cfg.className ? ` ${cfg.className}` : ''}`, 'data-ac': 'popover', 'data-placement': cfg.placement, 'aria-label': cfg.label });
    if (cfg.content instanceof Node) el.append(cfg.content); else el.innerHTML = cfg.content ?? '';
    document.body.append(el);
    scan(el);
    el.addEventListener('ac:popover:close', () => setTimeout(() => el.remove(), 260), { once: true });
    return instance(el, 'popover').open(anchor);
  },
};
AC.popover = popover;
return Object.freeze({ popover });
})();

/* ---- js/components/tooltip.js ---- */
const __ac_mi = F["js/components/tooltip.js"] = (() => {
const { AC, on, h, escapeHtml, uid } = __ac_m1;
const { position } = __ac_mc;
/* Tooltip: any element with data-ac-tooltip="text" [data-ac-tooltip-placement="top|bottom|start|end"] [data-ac-tooltip-kbd="Ctrl K"].
   Shows on mouse hover (after a short delay; instant while "warm") and on keyboard focus. Never on touch.
   One shared role="tooltip" element; the trigger gets aria-describedby while it is visible.
   API: AC.tooltip.show(el) · AC.tooltip.hide() */



const DELAY = 450;
let tip = null; let current = null; let timer = 0; let warmUntil = 0; let lastPointer = 'mouse';

function ensure() {
  if (tip) return tip;
  tip = h('div', { class: 'ac-tooltip', role: 'tooltip', id: uid('tooltip'), 'data-state': 'closed' });
  document.body.append(tip);
  return tip;
}
function show(el, warm = false) {
  clearTimeout(timer);
  const text = el?.getAttribute('data-ac-tooltip');
  if (!text || !el.isConnected) return;
  ensure();
  if (current && current !== el) current.removeAttribute('aria-describedby');
  current = el;
  const kbd = el.getAttribute('data-ac-tooltip-kbd');
  tip.innerHTML = `${escapeHtml(text)}${kbd ? ` <kbd class="ac-tooltip__kbd">${escapeHtml(kbd)}</kbd>` : ''}`;
  if (!el.hasAttribute('aria-describedby') && el.getAttribute('aria-label') !== text) el.setAttribute('aria-describedby', tip.id);
  // once one tooltip is showing, neighbours appear instantly — no delay, no animation (Emil)
  tip.toggleAttribute('data-instant', warm);
  tip.dataset.state = 'open';
  position(el, tip, { placement: el.getAttribute('data-ac-tooltip-placement') || 'top', offset: 8 });
}
function hide() {
  clearTimeout(timer);
  if (!current) return;
  if (current.getAttribute('aria-describedby') === tip?.id) current.removeAttribute('aria-describedby');
  current = null;
  if (tip) tip.dataset.state = 'closed';
  warmUntil = Date.now() + 500;
}

on(document, 'pointerover', '[data-ac-tooltip]', (e, el) => {
  if (e.pointerType !== 'mouse' || el === current) return;
  clearTimeout(timer);
  const warm = Date.now() < warmUntil || (current && tip?.dataset.state === 'open');
  timer = setTimeout(() => show(el, warm), warm ? 0 : DELAY);
});
on(document, 'pointerout', '[data-ac-tooltip]', (e, el) => {
  if (e.relatedTarget && el.contains(e.relatedTarget)) return;
  if (el === current) hide(); else clearTimeout(timer);
});
on(document, 'focusin', '[data-ac-tooltip]', (e, el) => {
  if (lastPointer === 'touch') return;
  try { if (!el.matches(':focus-visible')) return; } catch { /* old engines */ }
  show(el);
});
on(document, 'focusout', '[data-ac-tooltip]', (e, el) => { if (el === current) hide(); });
on(document, 'pointerdown', (e) => { lastPointer = e.pointerType; hide(); }, { capture: true });
on(document, 'keydown', (e) => { if (e.key === 'Escape' && current) { e.preventDefault(); e.stopPropagation(); hide(); } }, { capture: true });
on(window, 'scroll', () => { if (current) hide(); }, { capture: true, passive: true });

const tooltip = { show, hide };
AC.tooltip = tooltip;
return Object.freeze({ tooltip });
})();

/* ---- js/components/toast.js ---- */
const __ac_mj = F["js/components/toast.js"] = (() => {
const { AC, $, $$, on, emit, h, icon, escapeHtml, uid, gesture, reducedMotion, haptic, i18n } = __ac_m1;
/* Toasts: stacked (Sonner-style), expand on hover / focus / tap, progress bar, swipe to dismiss, undo, promise.
   AC.toast('Saved') · AC.toast({ title, text, tone:'success|danger|warning|info|accent|neutral', icon,
     action:{ label, onClick(t) }, duration:5000 (0 = sticky), position:'top-start|top-center|top-end|bottom-start|bottom-center|bottom-end',
     id, dismissible:true, onClose(reason) }) → { id, el, close(), update(patch) }
   AC.toast.success|error|warning|info(title, text?, opts?) · AC.toast.undo(title, onUndo, opts?)
   AC.toast.promise(promise, { loading, success, error }) · AC.toast.dismiss(id?)
   Default container: #ac-toasts / .ac-toasts (created when missing). Events: ac:toast:open, ac:toast:close {reason} on the toast. */


const ICONS = { success: 'circle-check', danger: 'circle-alert', error: 'circle-alert', warning: 'triangle-alert', info: 'info' };
const PEEK = 12; const GAP = 8; const MAX = 5; const VISIBLE = 3;
const all = new Map(); // id -> record
const containers = new Map();

function container(pos) {
  const key = pos || 'auto';
  let c = containers.get(key);
  if (c?.isConnected) return c;
  c = pos ? $(`.ac-toasts[data-position="${pos}"]`) : ($('#ac-toasts') || $('.ac-toasts:not([data-position])'));
  if (!c) {
    c = h('section', { class: 'ac-toasts', 'data-position': pos, 'aria-live': 'polite' });
    document.body.append(c);
  }
  if (!c.hasAttribute('aria-label')) c.setAttribute('aria-label', i18n.t('overlay.notifications', 'Notifications'));
  wire(c);
  containers.set(key, c);
  return c;
}

function wire(c) {
  if (c._acToasts) return;
  c._acToasts = true;
  const expand = (v) => { if (v) c.setAttribute('data-expanded', ''); else c.removeAttribute('data-expanded'); layout(c); pause(c, v); };
  on(c, 'pointerenter', (e) => { if (e.pointerType === 'mouse') expand(true); });
  on(c, 'pointerleave', (e) => { if (e.pointerType === 'mouse' && !c.contains(document.activeElement) && !c.querySelector('[data-dragging]')) expand(false); });
  on(c, 'focusin', () => expand(true));
  on(c, 'focusout', (e) => { if (!c.contains(e.relatedTarget) && !c.matches(':hover')) expand(false); });
  on(c, 'click', '.ac-toast', (e) => {
    if (e.target.closest('button, a') || matchMedia('(hover: hover)').matches) return;
    expand(!c.hasAttribute('data-expanded'));
  });
}

function edge(c) {
  const cs = getComputedStyle(c);
  return cs.bottom === 'auto' || (cs.top !== 'auto' && parseFloat(cs.top) < parseFloat(cs.bottom)) ? 'top' : 'bottom';
}

function layout(c) {
  const list = $$('.ac-toast:not([data-state="exit"])', c).reverse(); // newest first
  const expanded = c.hasAttribute('data-expanded');
  c.dataset.edge = edge(c);
  let off = 0; const frontH = list[0]?.offsetHeight || 0;
  list.forEach((t, i) => {
    const hgt = t._h || (t._h = t.scrollHeight);
    t.style.setProperty('--_i', String(i));
    t.style.setProperty('--_y', `${expanded ? off : i * PEEK}px`);
    t.style.setProperty('--_s', expanded ? '1' : String(Math.max(0.8, 1 - i * 0.05)));
    t.toggleAttribute('data-behind', i > 0);
    t.toggleAttribute('data-hidden', !expanded && i >= VISIBLE);
    t.setAttribute('aria-hidden', String(!expanded && i >= VISIBLE));
    off += hgt + GAP;
  });
  c.style.setProperty('--_fh', `${frontH}px`);
  c.style.setProperty('--_h', `${expanded ? Math.max(0, off - GAP) : frontH + Math.min(list.length - 1, VISIBLE - 1) * PEEK}px`);
}

function pause(c, paused) {
  for (const t of $$('.ac-toast', c)) { const r = all.get(t.dataset.id); if (r) (paused ? r.pause() : r.resume()); }
}

function render(r) {
  const o = r.o; const t = r.el;
  const tone = o.tone === 'error' ? 'danger' : o.tone;
  if (tone) t.dataset.tone = tone; else t.removeAttribute('data-tone');
  t.setAttribute('role', tone === 'danger' ? 'alert' : 'status');
  const ic = o.loading ? '<span class="ac-toast__spinner" aria-hidden="true"></span>' : (o.icon !== false && (o.icon || ICONS[tone])) ? icon(o.icon || ICONS[tone]) : '';
  t.innerHTML = `${ic ? `<span class="ac-toast__icon">${ic}</span>` : ''}
    <div class="ac-toast__body">${o.title ? `<div class="ac-toast__title">${escapeHtml(o.title)}</div>` : ''}${o.text ? `<div class="ac-toast__text">${escapeHtml(o.text)}</div>` : ''}</div>
    ${o.action ? `<button class="ac-btn ac-btn--sm ac-toast__action" type="button">${escapeHtml(o.action.label)}</button>` : ''}
    ${o.dismissible === false ? '' : `<button class="ac-toast__close" type="button" aria-label="${escapeHtml(i18n.t('overlay.close', 'Close'))}">${icon('x')}</button>`}
    ${r.duration ? `<span class="ac-toast__progress" aria-hidden="true"><span></span></span>` : ''}`;
  t.style.setProperty('--_dur', `${r.duration}ms`);
}

function toast(input = {}) {
  const o = typeof input === 'string' ? { title: input } : { ...input };
  if (o.id && all.has(String(o.id))) return all.get(String(o.id)).update(o);
  const id = String(o.id ?? uid('toast'));
  const c = container(o.position);
  const t = h('div', { class: 'ac-toast', 'data-id': id, 'data-state': 'enter' });
  let timer = 0; let started = 0; let closed = false;
  const r = {
    id, el: t, o, duration: 0, remaining: 0,
    close(reason = 'api') {
      if (closed) return;
      closed = true; clearTimeout(timer); all.delete(id);
      t.dataset.state = t.dataset.state === 'swiped' ? 'swiped' : 'exit';
      layout(c);
      emit(t, 'toast:close', { reason });
      r.o.onClose?.(reason);
      setTimeout(() => { t.remove(); layout(c); if (!c.querySelector('.ac-toast')) c.removeAttribute('data-expanded'); }, reducedMotion() ? 0 : 260);
    },
    pause() { if (!r.duration || !started) return; clearTimeout(timer); r.remaining -= performance.now() - started; started = 0; },
    resume() {
      if (!r.duration || started || closed) return;
      if (c.hasAttribute('data-expanded') || document.hidden) return;
      started = performance.now(); timer = setTimeout(() => r.close('timeout'), Math.max(0, r.remaining));
    },
    restart() { clearTimeout(timer); started = 0; r.duration = r.o.loading ? 0 : Number(r.o.duration ?? (r.o.action ? 7000 : 4500)) || 0; r.remaining = r.duration; r.resume(); },
    update(patch = {}) {
      Object.assign(r.o, patch);
      r.restart(); render(r); t._h = 0; layout(c);
      if (c.hasAttribute('data-expanded')) r.pause();
      return r;
    },
  };
  r.duration = o.loading ? 0 : Number(o.duration ?? (o.action ? 7000 : 4500)) || 0;
  r.remaining = r.duration;
  render(r);
  all.set(id, r);
  c.append(t);
  // trim the oldest beyond MAX
  const live = $$('.ac-toast:not([data-state="exit"]):not([data-state="swiped"])', c);
  live.slice(0, Math.max(0, live.length - MAX)).forEach((x) => all.get(x.dataset.id)?.close('overflow'));
  layout(c);
  requestAnimationFrame(() => requestAnimationFrame(() => { if (t.dataset.state === 'enter') t.removeAttribute('data-state'); }));
  on(t, 'click', '.ac-toast__close', () => r.close('button'));
  on(t, 'click', '.ac-toast__action', () => { r.o.action?.onClick?.(r); if (r.o.action?.keep !== true) r.close('action'); });
  gesture(t, {
    axis: 'x',
    filter: (e) => !e.target.closest('button, a') && r.o.dismissible !== false,
    onStart: () => { t.setAttribute('data-dragging', ''); r.pause(); },
    onMove: (s) => { t.style.setProperty('--_sx', `${s.dx}px`); t.style.setProperty('--_so', String(Math.max(0, 1 - Math.abs(s.dx) / t.offsetWidth))); },
    onEnd: (s) => {
      t.removeAttribute('data-dragging');
      if (!s.cancelled && (Math.abs(s.dx) > t.offsetWidth * 0.4 || Math.abs(s.vx) > 0.5)) {
        haptic();
        t.style.setProperty('--_sx', `${Math.sign(s.dx || s.vx) * (t.offsetWidth + 40)}px`);
        t.dataset.state = 'swiped';
        r.close('swipe');
      } else { t.style.setProperty('--_sx', '0px'); t.style.setProperty('--_so', '1'); r.resume(); }
    },
  });
  r.resume();
  emit(t, 'toast:open', { id });
  return r;
}

toast.success = (title, text, o) => toast({ ...o, title, text, tone: 'success' });
toast.error = (title, text, o) => toast({ ...o, title, text, tone: 'danger' });
toast.warning = (title, text, o) => toast({ ...o, title, text, tone: 'warning' });
toast.info = (title, text, o) => toast({ ...o, title, text, tone: 'info' });
toast.undo = (title, onUndo, o = {}) => toast({ icon: 'undo-2', duration: 6000, ...o, title, action: { label: i18n.t('overlay.undo', 'Undo'), onClick: onUndo } });
toast.promise = (promise, m = {}) => {
  const tt = toast({ title: m.loading || i18n.t('overlay.loading', 'Working…'), loading: true, dismissible: false, ...m.options });
  Promise.resolve(promise).then(
    (v) => tt.update({ loading: false, dismissible: true, tone: 'success', title: typeof m.success === 'function' ? m.success(v) : (m.success || i18n.t('overlay.done', 'Done')) }),
    (err) => tt.update({ loading: false, dismissible: true, tone: 'danger', title: typeof m.error === 'function' ? m.error(err) : (m.error || i18n.t('overlay.failed', 'Something went wrong')) }),
  );
  return tt;
};
toast.dismiss = (id) => { if (id != null) all.get(String(id))?.close('api'); else [...all.values()].forEach((r) => r.close('api')); };
toast.get = (id) => all.get(String(id));

on(document, 'visibilitychange', () => { for (const r of all.values()) (document.hidden ? r.pause() : r.resume()); });
on(window, 'resize', () => { for (const c of containers.values()) if (c.isConnected) { $$('.ac-toast', c).forEach((t) => { t._h = 0; }); layout(c); } });

AC.toast = toast;
return Object.freeze({ toast });
})();

/* ---- js/components/confirm.js ---- */
const __ac_mk = F["js/components/confirm.js"] = (() => {
const { AC, on, icon, escapeHtml, uid, i18n } = __ac_m1;
const { buildLayer } = __ac_md;
/* Confirm & prompt dialogs (Promise based). Desktop: compact centred alert; phone: bottom sheet.
   AC.confirm({ title, text, tone:'danger|warning|success|info|accent', icon, confirmText, cancelText }) → Promise<boolean>
   AC.prompt({ title, text, label, value, placeholder, type, required, confirmText, cancelText, validate(v) → string|true }) → Promise<string|null> */



const TONE_ICON = { danger: 'trash-2', warning: 'triangle-alert', success: 'circle-check', info: 'info', accent: 'circle-help' };

function dialog(o, field) {
  return new Promise((resolve) => {
    const tone = o.tone || 'accent';
    const fid = uid('prompt');
    const danger = tone === 'danger';
    const content = `<div class="ac-confirm__icon" data-tone="${escapeHtml(tone)}">${icon(o.icon || TONE_ICON[tone] || 'circle-help')}</div>
      <h2 class="ac-dialog__title">${escapeHtml(o.title || i18n.t('overlay.confirmTitle', 'Are you sure?'))}</h2>
      ${o.text ? `<p class="ac-dialog__text">${escapeHtml(o.text)}</p>` : ''}
      ${field ? `<form class="ac-confirm__form" novalidate><label class="ac-confirm__label" for="${fid}">${escapeHtml(o.label || '')}</label>
        <input class="ac-confirm__input" id="${fid}" name="value" type="${escapeHtml(o.type || 'text')}" value="${escapeHtml(o.value ?? '')}" placeholder="${escapeHtml(o.placeholder || '')}" autocomplete="off"${o.required ? ' required' : ''}>
        <p class="ac-confirm__error" id="${fid}-err" aria-live="polite"></p></form>` : ''}`;
    const footer = `<button class="ac-btn ac-btn--lg ac-btn--pill" type="button" data-ac-close="cancel" data-cancel>${escapeHtml(o.cancelText || i18n.t('overlay.cancel', 'Cancel'))}</button>
      <button class="ac-btn ac-btn--lg ac-btn--pill ${danger ? 'ac-btn--danger' : 'ac-btn--primary'}" type="button" data-confirm>${escapeHtml(o.confirmText || i18n.t(danger ? 'overlay.delete' : 'overlay.confirm', danger ? 'Delete' : 'Confirm'))}</button>`;
    const m = buildLayer('modal', { size: 'sm', role: 'alertdialog', className: 'ac-confirm', closeButton: false, content, footer, static: o.static,
      initial: field ? '.ac-confirm__input' : (danger ? '[data-cancel]' : '[data-confirm]') });
    let result = field ? null : false;
    const input = m.el.querySelector('.ac-confirm__input');
    const err = m.el.querySelector('.ac-confirm__error');
    const submit = () => {
      if (field) {
        const v = input.value;
        const check = o.required && !v.trim() ? i18n.t('overlay.required', 'This field is required') : (o.validate ? o.validate(v) : true);
        if (check !== true && check != null && check !== '') {
          err.textContent = String(check); input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', err.id);
          m.bump(); input.focus(); return;
        }
        result = v;
      } else result = true;
      m.close('confirm');
    };
    on(m.el, 'click', '[data-confirm]', submit);
    if (input) {
      on(m.el, 'submit', (e) => { e.preventDefault(); submit(); });
      on(input, 'input', () => { input.removeAttribute('aria-invalid'); err.textContent = ''; });
      requestAnimationFrame(() => input.select());
    }
    m.el.addEventListener('ac:modal:close', () => resolve(result), { once: true });
    m.open();
  });
}

const confirm = (o = {}) => dialog(typeof o === 'string' ? { title: o } : o, false);
const prompt = (o = {}) => dialog(typeof o === 'string' ? { title: o } : o, true);
AC.confirm = confirm;
AC.prompt = prompt;
return Object.freeze({ confirm, prompt });
})();

/* ---- js/components/notifications.js ---- */
const __ac_ml = F["js/components/notifications.js"] = (() => {
const { AC, $, $$, on, emit, h, icon, escapeHtml, scan, instance, register, format, i18n, ready } = __ac_m1;
const { buildLayer, phoneMQ } = __ac_md;
const { popover } = __ac_mh;
const { menu } = __ac_mg;
const { toast } = __ac_mj;
/* Notification center. A store + two views: the app-bar panel (popover on desktop, full sheet on phones)
   and a page view (<div data-ac="notifications" data-mode="page"></div>).
   Bell: <a href="#/notifications" data-ac-notifications-open [data-ac-notifications-src="url.json"]>… <span class="ac-appbar__count"></span></a>
   Items: { id, title, text, time | ago (minutes), icon, tone, avatar, color, kind:'mention|system|…', read, href }
          title/text may be { fa, en, ar }.
   API: AC.notifications.set(list) · add(item) · markRead(id, read=true) · markAllRead() · remove(id) · load(url)
        open(anchor) · close() · toggle(anchor) · list · unread
   Events (document): ac:notifications:change { unread }, ac:notifications:select { item } */






let items = [];
let loaded = null;
const views = new Set();
let panel = null; let sheetApi = null; let pageHref = '#/notifications';

const tx = (v) => (v && typeof v === 'object' ? v[i18n.lang] ?? v.en ?? v.fa ?? Object.values(v)[0] : v ?? '');
const norm = (it, i) => ({
  ...it,
  id: String(it.id ?? `n${i}`),
  time: it.time ? new Date(it.time) : new Date(Date.now() - (Number(it.ago) || 0) * 60000),
  read: !!it.read,
});
const unread = () => items.filter((n) => !n.read).length;

function changed() {
  const n = unread();
  for (const b of $$('[data-ac-notifications-open] .ac-appbar__count, [data-ac-notifications-count]')) {
    b.textContent = n > 99 ? '99+' : String(n);
    b.hidden = n === 0;
  }
  views.forEach((v) => (v.isConnected ? v._render() : views.delete(v)));
  emit(document, 'notifications:change', { unread: n });
}

function itemHTML(n, page) {
  const lead = n.avatar
    ? `<span class="ac-avatar ac-avatar--sm ac-notif__lead" data-color="${escapeHtml(n.color || 1)}" aria-hidden="true">${escapeHtml(tx(n.avatar))}</span>`
    : `<span class="ac-notif__lead ac-notif__icon" data-tone="${escapeHtml(n.tone || 'accent')}" aria-hidden="true">${icon(n.icon || 'bell')}</span>`;
  const tag = n.href ? 'a' : 'button';
  const attrs = n.href ? `href="${escapeHtml(n.href)}"` : 'type="button"';
  const state = n.read ? '' : `<span class="ac-visually-hidden">${escapeHtml(i18n.t('notif.unread', 'Unread'))}: </span>`;
  return `<div class="ac-notif__row" data-id="${escapeHtml(n.id)}"${n.read ? '' : ' data-unread'}>
    <${tag} class="ac-notif__item" ${attrs} data-notif-open>${lead}
      <span class="ac-notif__main">${state}<span class="ac-notif__title">${escapeHtml(tx(n.title))}</span>${n.text ? `<span class="ac-notif__text">${escapeHtml(tx(n.text))}</span>` : ''}
      <time class="ac-notif__time" datetime="${n.time.toISOString()}">${escapeHtml(format.relative(n.time))}</time></span>
    </${tag}>
    ${page ? `<button class="ac-btn ac-btn--ghost ac-btn--icon ac-btn--sm ac-notif__more" type="button" data-notif-more aria-label="${escapeHtml(i18n.t('notif.more', 'More actions'))}">${icon('ellipsis')}</button>` : ''}
    <span class="ac-notif__dot" aria-hidden="true"></span>
  </div>`;
}

function view(mode = 'panel') {
  const page = mode === 'page';
  const el = h('div', { class: `ac-notif${page ? ' ac-notif--page' : ''}` });
  let filter = 'all';
  const tabs = page ? ['all', 'unread', 'mention', 'system'] : ['all', 'unread'];
  el._render = () => {
    const n = unread();
    const list = items.filter((x) => (filter === 'all' ? true : filter === 'unread' ? !x.read : x.kind === filter)).sort((a, b) => b.time - a.time);
    const today = new Date().toDateString();
    const groups = [[i18n.t('notif.today', 'Today'), list.filter((x) => x.time.toDateString() === today)], [i18n.t('notif.earlier', 'Earlier'), list.filter((x) => x.time.toDateString() !== today)]];
    const body = list.length
      ? groups.filter(([, g]) => g.length).map(([g, arr]) => `<div class="ac-notif__group" role="presentation">${escapeHtml(g)}</div>${arr.map((x) => itemHTML(x, page)).join('')}`).join('')
      : `<div class="ac-empty ac-empty--sm ac-notif__empty"><div class="ac-empty__art">${icon(filter === 'unread' ? 'circle-check' : 'bell-off')}</div>
          <div class="ac-empty__title">${escapeHtml(i18n.t(filter === 'unread' ? 'notif.caughtUp' : 'notif.empty', filter === 'unread' ? 'You’re all caught up' : 'No notifications'))}</div>
          <p class="ac-empty__text">${escapeHtml(i18n.t('notif.emptyText', 'New activity will show up here.'))}</p></div>`;
    const head = el.querySelector('.ac-notif__head');
    if (!head) {
      el.innerHTML = `<div class="ac-notif__head">
          <h2 class="ac-notif__heading" data-notif-title></h2>
          <button class="ac-btn ac-btn--ghost ac-btn--sm" type="button" data-notif-readall>${icon('check-check')}<span data-notif-t="readAll"></span></button>
        </div>
        <div class="ac-segmented ac-segmented--sm ac-segmented--block ac-notif__tabs" data-ac="segmented" role="radiogroup">${tabs.map((t, i) => `<button class="ac-segmented__item" type="button" data-value="${t}" aria-checked="${i === 0}"><span data-notif-tab="${t}"></span></button>`).join('')}</div>
        <div class="ac-notif__list" role="list"></div>
        ${page ? '' : `<a class="ac-notif__foot" href="${escapeHtml(pageHref)}" data-notif-all><span data-notif-t="viewAll"></span>${icon('arrow-right', 'ac-icon--sm ac-flip-rtl')}</a>`}`;
      scan(el);
    }
    el.querySelector('[data-notif-title]').innerHTML = `${escapeHtml(i18n.t('notif.title', 'Notifications'))}${n ? ` <span class="ac-count">${n}</span>` : ''}`;
    el.querySelector('[data-notif-t="readAll"]').textContent = i18n.t('notif.markAll', 'Mark all as read');
    el.querySelector('[data-notif-readall]').disabled = n === 0;
    const va = el.querySelector('[data-notif-t="viewAll"]'); if (va) va.textContent = i18n.t('notif.viewAll', 'View all notifications');
    for (const s of $$('[data-notif-tab]', el)) {
      const k = s.dataset.notifTab;
      const c = k === 'unread' ? n : k === 'all' ? items.length : items.filter((x) => x.kind === k).length;
      s.textContent = `${i18n.t(`notif.tab.${k}`, k)}${c ? ` · ${c}` : ''}`;
    }
    const listEl = el.querySelector('.ac-notif__list');
    listEl.innerHTML = body;
    for (const r of $$('.ac-notif__row', listEl)) r.setAttribute('role', 'listitem');
  };
  on(el, 'ac:segmented:change', (e) => { filter = e.detail.value; el._render(); });
  on(el, 'click', '[data-notif-readall]', () => notifications.markAllRead());
  on(el, 'click', '[data-notif-all]', () => notifications.close());
  on(el, 'click', '[data-notif-open]', (e, a) => {
    const n = items.find((x) => x.id === a.closest('.ac-notif__row').dataset.id);
    if (!n) return;
    emit(el, 'notifications:select', { item: n });
    notifications.markRead(n.id);
    if (!page && n.href) notifications.close();
  });
  on(el, 'click', '[data-notif-more]', (e, b) => {
    const n = items.find((x) => x.id === b.closest('.ac-notif__row').dataset.id);
    if (!n) return;
    menu(b, [
      { label: i18n.t(n.read ? 'notif.markUnread' : 'notif.markRead', n.read ? 'Mark as unread' : 'Mark as read'), icon: n.read ? 'mail' : 'mail-open', onSelect: () => notifications.markRead(n.id, !n.read) },
      '-',
      { label: i18n.t('notif.remove', 'Remove'), icon: 'trash-2', tone: 'danger', onSelect: () => {
        const idx = items.indexOf(n); notifications.remove(n.id);
        toast.undo(i18n.t('notif.removed', 'Notification removed'), () => { items.splice(idx, 0, n); changed(); });
      } },
    ], { placement: 'bottom-end', keyboard: e.detail === 0 });
  });
  el._render();
  views.add(el);
  return el;
}

function ensureData() {
  if (items.length || loaded) return loaded;
  const src = $('[data-ac-notifications-src]')?.getAttribute('data-ac-notifications-src');
  return src ? notifications.load(src) : null;
}

const notifications = {
  get list() { return items.slice(); },
  get unread() { return unread(); },
  set(list = []) { items = list.map(norm); changed(); return notifications; },
  add(item, { toast: show = false } = {}) {
    const n = norm(item, items.length + Date.now());
    items.unshift(n); changed();
    if (show) toast({ title: tx(n.title), text: tx(n.text), icon: n.icon || 'bell', tone: n.tone });
    return n;
  },
  markRead(id, read = true) { const n = items.find((x) => x.id === String(id)); if (n && n.read !== read) { n.read = read; changed(); } },
  markAllRead() { items.forEach((n) => { n.read = true; }); changed(); },
  remove(id) { items = items.filter((x) => x.id !== String(id)); changed(); },
  load(url) {
    loaded = fetch(url).then((r) => (r.ok ? r.json() : [])).then((list) => { if (!items.length) notifications.set(list); return items; })
      .catch((err) => { console.warn('[AC] notifications load failed', err); return items; });
    return loaded;
  },
  view,
  get isOpen() { return !!(sheetApi?.isOpen || (panel && instance(panel, 'popover')?.isOpen)); },
  async open(anchor) {
    await ensureData();
    views.forEach((v) => (v.isConnected ? v._render() : views.delete(v)));
    const bell = anchor instanceof Element ? anchor : $('[data-ac-notifications-open]');
    if (phoneMQ.matches) {
      sheetApi = buildLayer('sheet', { className: 'ac-notif-sheet', closeButton: true, content: view('panel'), label: i18n.t('notif.title', 'Notifications') });
      sheetApi.open(bell);
      return sheetApi;
    }
    if (!panel) {
      panel = h('div', { class: 'ac-popover ac-notif-pop', 'data-ac': 'popover', 'data-placement': 'bottom-end', id: 'ac-notif-panel' });
      panel.append(view('panel'));
      document.body.append(panel);
      scan(panel);
    }
    panel.setAttribute('aria-label', i18n.t('notif.title', 'Notifications'));
    return popover.open(panel, bell);
  },
  close() { sheetApi?.close(); if (panel) popover.close(panel); },
  toggle(anchor) { return notifications.isOpen ? notifications.close() : notifications.open(anchor); },
};

register('notifications', (el) => {
  const v = view(el.dataset.mode || 'page');
  el.replaceChildren(v);
  if (el.dataset.src && !items.length && !loaded) notifications.load(el.dataset.src); else ensureData();
  return () => views.delete(v);
});

on(document, 'click', '[data-ac-notifications-open]', (e, b) => {
  if (e.ctrlKey || e.metaKey || e.shiftKey) return;
  e.preventDefault();
  notifications.toggle(b);
});
on(document, 'ac:i18n:change', () => views.forEach((v) => (v.isConnected ? v._render() : views.delete(v))));
ready(() => { ensureData(); });

AC.notifications = notifications;
return Object.freeze({ notifications });
})();

/* ---- js/components/alert.js ---- */
const __ac_m16 = F["js/components/alert.js"] = (() => {
const { AC, on, emit, instance, register, store, reducedMotion } = __ac_m1;
/* Alert / banner (static feedback in the page).
   <div class="ac-alert" data-tone="info|success|warning|danger|accent|neutral" [data-ac="alert"] [data-persist="key"] role="status">
     <svg class="ac-icon ac-alert__icon">…</svg>
     <div class="ac-alert__body"><div class="ac-alert__title">…</div><div class="ac-alert__text">…</div><div class="ac-alert__actions">…</div></div>
     <button class="ac-alert__close" data-ac-close aria-label="Dismiss">…</button>
   </div>
   Variants: .ac-alert--solid, .ac-alert--outline, .ac-alert--banner (full-bleed strip).
   data-persist remembers the dismissal in localStorage. API: AC.instance(el,'alert').close(). Event: ac:alert:close */


register('alert', (el) => {
  const key = el.dataset.persist ? `ac:alert:${el.dataset.persist}` : null;
  if (key && store.get(key)) { el.hidden = true; return undefined; }
  function close() {
    if (emit(el, 'alert:close').defaultPrevented) return;
    if (key) store.set(key, 1);
    if (reducedMotion() || !el.animate) { el.remove(); return; }
    const cs = getComputedStyle(el);
    el.animate([
      { blockSize: `${el.offsetHeight}px`, opacity: 1, marginBlockEnd: cs.marginBlockEnd, paddingBlock: cs.paddingBlock },
      { blockSize: '0px', opacity: 0, marginBlockEnd: '0px', paddingBlock: '0px' },
    ], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.then(() => el.remove(), () => el.remove());
    el.dataset.state = 'closing';
  }
  const off = on(el, 'click', '[data-ac-close]', (e) => { e.preventDefault(); close(); });
  instance(el, 'alert', { close });
  return off;
});

const alertReset = (key) => store.remove(`ac:alert:${key}`);
AC.alertReset = alertReset;
return Object.freeze({ alertReset });
})();

return { f: F, ns: Object.freeze({ "position": __ac_mc["position"], "autoPosition": __ac_mc["autoPosition"], "portal": __ac_mc["portal"], "layers": __ac_mc["layers"], "sheet": __ac_md["sheet"], "modal": __ac_me["modal"], "drawer": __ac_mf["drawer"], "menu": __ac_mg["menu"], "popover": __ac_mh["popover"], "tooltip": __ac_mi["tooltip"], "toast": __ac_mj["toast"], "confirm": __ac_mk["confirm"], "prompt": __ac_mk["prompt"], "notifications": __ac_ml["notifications"] }) };
})();
export const { position, autoPosition, portal, layers, sheet, modal, drawer, menu, popover, tooltip, toast, confirm, prompt, notifications } = __R["overlays"].ns;
export default __R["overlays"].ns;
