/* Popover: a non-modal floating panel anchored to its trigger (smart flip / shift, RTL-aware).
   <button data-ac-open="#p">…</button>
   <div class="ac-popover" id="p" data-ac="popover" [data-placement="bottom-start"] aria-label="…">…</div>
   Light dismiss (outside click, Esc, focus leaving), focus returns to the trigger.
   API: AC.popover.open('#p' | el, anchor) · AC.popover.close([target]) · AC.popover.toggle(target, anchor)
        AC.popover.show(anchor, { content, placement, className, label }) → instance (removed on close)
   Events: ac:popover:open, ac:popover:close {reason} */
import { AC, $, on, emit, h, options, instance, register, scan, reducedMotion } from '../core.js';
import { autoPosition, portal, layers } from './position.js';

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
export const popover = {
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
