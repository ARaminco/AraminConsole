/* Press feedback.
   - Ripple: elements with [data-ripple] always; .ac-btn and .ac-tabbar__item on touch devices.
     AC.press.ripple = 'always' | 'touch' (default) | 'off'
   - Press scale is pure CSS (:active → var(--ac-press)); add .ac-pressable to any element. */
import { AC, on, reducedMotion } from '../core.js';

export const press = { ripple: 'touch' };

const SELECTOR = '[data-ripple], .ac-btn:not(.ac-btn--link), .ac-tabbar__item, .ac-card--interactive';

on(document, 'pointerdown', (e) => {
  if (press.ripple === 'off' || reducedMotion() || e.button > 0) return;
  const host = e.target instanceof Element ? e.target.closest(SELECTOR) : null;
  if (!host || host.disabled || host.getAttribute('aria-disabled') === 'true') return;
  const explicit = host.hasAttribute('data-ripple');
  if (!explicit && press.ripple === 'touch' && e.pointerType === 'mouse') return;
  const r = host.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2.2;
  const dot = document.createElement('span');
  dot.className = 'ac-ripple';
  dot.setAttribute('aria-hidden', 'true');
  dot.style.setProperty('--ac-ripple-size', `${size}px`);
  dot.style.setProperty('--ac-ripple-x', `${e.clientX - r.left}px`);
  dot.style.setProperty('--ac-ripple-y', `${e.clientY - r.top}px`);
  if (getComputedStyle(host).position === 'static') host.classList.add('ac-ripple-host');
  host.append(dot);
  setTimeout(() => dot.remove(), 600);
}, { passive: true });

AC.press = press;
