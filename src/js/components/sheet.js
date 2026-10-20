/* Bottom sheet + the dialog layer shared by modal, drawer, confirm and the action sheet.
   Markup: <div class="ac-sheet" id="s" data-ac="sheet" [data-snap="0.5,0.9"] [data-snap-start="0"] [data-static]>
             <div class="ac-dialog"><div class="ac-dialog__head">…</div><div class="ac-dialog__body">…</div></div></div>
   Triggers: [data-ac-open="#s"], [data-ac-close] inside. The panel gets a drag handle; drag down to
   dismiss (velocity aware), drag between snap points, backdrop fades with the drag.
   API: AC.sheet.open('#s' | el | { title, content, footer, snap, className }) → instance
        AC.sheet.close([target]) · AC.instance(el,'sheet').snapTo(i)
   Events: ac:sheet:open, ac:sheet:close {reason} (then ac:sheet:closed), ac:sheet:snap {index, value};
   same names with modal/drawer for those components. ac:<kind>:beforeclose is cancelable. */
import { AC, $, on, emit, h, icon, options, instance, register, scan, trapFocus, scrollLock, gesture, reducedMotion, haptic, clamp, i18n, uid, escapeHtml } from '../core.js';
import { portal, layers } from './position.js';

export const phoneMQ = matchMedia('(max-width: 639.98px)');
const DUR = 320;

/** Wire a .ac-modal / .ac-sheet / .ac-drawer root. cfg.drag(el, panel, o, close) → { reset(), destroy(), snapTo? } */
export function dialogLayer(el, kind, defaults = {}, cfg = {}) {
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
export function sheetDrag(el, panel, o, close, when = () => true) {
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
export function buildLayer(kind, cfg = {}) {
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
export const closeButton = () => `<button class="ac-dialog__close" type="button" data-ac-close aria-label="${escapeHtml(i18n.t('overlay.close', 'Close'))}">${icon('x')}</button>`;

/** Imperative API shared by modal / sheet / drawer. */
export function opener(kind) {
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

export const sheet = opener('sheet');
AC.sheet = sheet;
