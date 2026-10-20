/* Pull to refresh (touch only, window scroll at top).
   <main data-ac="pull-refresh">…</main>
   Listen: el.addEventListener('ac:pull-refresh:refresh', e => e.detail.waitUntil(fetchStuff()))
   Without waitUntil the spinner settles after 800 ms. */
import { register, emit, icon, clamp, haptic } from '../core.js';

const THRESHOLD = 72;
const MAX = 120;

register('pull-refresh', (el) => {
  let ptr = document.querySelector('.ac-ptr');
  if (!ptr) {
    ptr = document.createElement('div');
    ptr.className = 'ac-ptr';
    ptr.setAttribute('aria-hidden', 'true');
    ptr.innerHTML = `<span class="ac-ptr__spinner">${icon('refresh-cw')}</span>`;
    document.body.append(ptr);
  }
  const rootStyle = document.documentElement.style;
  let startY = 0; let startX = 0; let pulling = false; let dist = 0; let busy = false; let armed = false;

  const set = (y) => {
    ptr.style.setProperty('--ac-ptr-y', `${y}px`);
    ptr.style.setProperty('--ac-ptr-p', String(clamp(y / THRESHOLD, 0, 1)));
  };
  const start = (e) => {
    if (busy || e.touches.length !== 1 || scrollY > 0 || document.documentElement.hasAttribute('data-scroll-locked')) return;
    startY = e.touches[0].clientY; startX = e.touches[0].clientX; pulling = true; dist = 0; armed = false;
    ptr.dataset.state = 'pulling';
  };
  const move = (e) => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    const dx = e.touches[0].clientX - startX;
    if (dy <= 0 || Math.abs(dx) > Math.abs(dy) || scrollY > 0) { if (dist === 0) { pulling = false; } else { dist = 0; set(0); } return; }
    if (e.cancelable) e.preventDefault();
    dist = Math.min(MAX, dy * 0.5);
    if (!armed && dist >= THRESHOLD) { armed = true; haptic(8); }
    if (armed && dist < THRESHOLD) armed = false;
    set(dist);
  };
  const end = () => {
    if (!pulling) return;
    pulling = false;
    if (dist >= THRESHOLD) {
      busy = true;
      ptr.dataset.state = 'refreshing';
      const waits = [];
      emit(el, 'pull-refresh:refresh', { waitUntil: (p) => waits.push(p) });
      const done = waits.length ? Promise.allSettled(waits) : new Promise((r) => setTimeout(r, 800));
      done.then(() => { ptr.dataset.state = 'settling'; set(0); busy = false; emit(el, 'pull-refresh:done'); });
    } else { ptr.dataset.state = 'settling'; set(0); }
    dist = 0;
  };

  rootStyle.setProperty('overscroll-behavior-y', 'contain');
  el.addEventListener('touchstart', start, { passive: true });
  el.addEventListener('touchmove', move, { passive: false });
  el.addEventListener('touchend', end);
  el.addEventListener('touchcancel', end);
  return () => {
    el.removeEventListener('touchstart', start);
    el.removeEventListener('touchmove', move);
    el.removeEventListener('touchend', end);
    el.removeEventListener('touchcancel', end);
    rootStyle.removeProperty('overscroll-behavior-y');
  };
});
