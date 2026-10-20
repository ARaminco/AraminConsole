/* Alert / banner (static feedback in the page).
   <div class="ac-alert" data-tone="info|success|warning|danger|accent|neutral" [data-ac="alert"] [data-persist="key"] role="status">
     <svg class="ac-icon ac-alert__icon">…</svg>
     <div class="ac-alert__body"><div class="ac-alert__title">…</div><div class="ac-alert__text">…</div><div class="ac-alert__actions">…</div></div>
     <button class="ac-alert__close" data-ac-close aria-label="Dismiss">…</button>
   </div>
   Variants: .ac-alert--solid, .ac-alert--outline, .ac-alert--banner (full-bleed strip).
   data-persist remembers the dismissal in localStorage. API: AC.instance(el,'alert').close(). Event: ac:alert:close */
import { AC, on, emit, instance, register, store, reducedMotion } from '../core.js';

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

export const alertReset = (key) => store.remove(`ac:alert:${key}`);
AC.alertReset = alertReset;
