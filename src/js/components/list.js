/* Swipe actions (shared by lists and the data table's phone cards).
   <ul class="ac-list" data-ac="list" role="list">
     <li class="ac-list__item ac-swipe">
       <div class="ac-swipe__actions"><button class="ac-swipe__btn" data-action="archive" data-tone="info">…</button></div>
       <div class="ac-swipe__content">…row…</div></li></ul>
   Swipe toward the start edge reveals the actions (mirrors in RTL); a fast flick (|vx| > .5) snaps.
   Events: ac:swipe:open, ac:swipe:action { action, item } (bubbles from the item). */
import { AC, register, on, emit, gesture, isRTL, haptic } from '../core.js';

let openItem = null;
const close = (item) => { if (!item) return; item.removeAttribute('data-open'); item.querySelector('.ac-swipe__content')?.style.setProperty('--ac-drag', '0px'); if (openItem === item) openItem = null; };
on(document, 'pointerdown', (e) => { if (openItem && !openItem.contains(e.target)) close(openItem); }, { passive: true });

/** Make one `.ac-swipe` element swipeable. Returns destroy(). */
export function swipeable(item) {
  const content = item.querySelector('.ac-swipe__content');
  const acts = item.querySelector('.ac-swipe__actions');
  if (!content || !acts) return () => {};
  let base = 0;
  const sign = () => (isRTL(item) ? 1 : -1);
  const set = (x) => content.style.setProperty('--ac-drag', `${Math.round(x)}px`);
  const open = () => { if (openItem && openItem !== item) close(openItem); openItem = item; item.setAttribute('data-open', ''); set(sign() * acts.offsetWidth); haptic(); emit(item, 'swipe:open'); };
  const g = gesture(content, {
    axis: 'x',
    onStart() { if (openItem && openItem !== item) close(openItem); base = item.hasAttribute('data-open') ? sign() * acts.offsetWidth : 0; item.setAttribute('data-dragging', ''); },
    onMove(s) {
      const max = acts.offsetWidth; let t = (base + s.dx) * sign();
      if (t < 0) t /= 4; else if (t > max) t = max + (t - max) / 4;
      set(sign() * t);
    },
    onEnd(s) {
      item.removeAttribute('data-dragging');
      const t = (base + s.dx) * sign(); const v = s.vx * sign();
      if (v > 0.5 || (v > -0.5 && t > acts.offsetWidth / 2)) open(); else close(item);
    },
  });
  const offs = [
    g,
    on(acts, 'click', '[data-action]', (e, b) => { emit(item, 'swipe:action', { action: b.dataset.action, item }); close(item); }),
    on(acts, 'focusin', () => { if (!item.hasAttribute('data-open')) open(); }),
    on(item, 'keydown', (e) => { if (e.key === 'Escape' && item.hasAttribute('data-open')) { close(item); content.focus?.(); } }),
  ];
  return () => { offs.forEach((f) => f()); if (openItem === item) openItem = null; };
}
export const swipe = { close: () => close(openItem) };

register('list', (el) => {
  const map = new Map();
  const scan = () => el.querySelectorAll('.ac-swipe').forEach((it) => { if (!map.has(it)) map.set(it, swipeable(it)); });
  scan();
  const mo = new MutationObserver(() => { for (const [it, d] of map) if (!it.isConnected) { d(); map.delete(it); } scan(); });
  mo.observe(el, { childList: true, subtree: true });
  const off = on(el, 'ac:swipe:action', (e) => emit(el, 'list:action', e.detail));
  return () => { mo.disconnect(); off(); map.forEach((d) => d()); };
});
AC.swipeable = swipeable;
