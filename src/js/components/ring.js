/* Progress ring.
   <div class="ac-ring" data-ac="ring" data-value="72" [data-max="100"] [data-tone="success"]>
     <span class="ac-ring__label">72%<small>goal</small></span></div>
   Animates from 0 when it scrolls into view; changing data-value animates to the new value. */
import { register, clamp } from '../core.js';

const NS = 'http://www.w3.org/2000/svg';

register('ring', (el) => {
  const stroke = Number(getComputedStyle(el).getPropertyValue('--ac-ring-stroke')) || 8;
  const r = 50 - stroke / 2;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  const mk = (cls) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', cls); c.setAttribute('cx', '50'); c.setAttribute('cy', '50'); c.setAttribute('r', String(r));
    c.setAttribute('stroke-width', String(stroke)); c.setAttribute('pathLength', '100');
    return c;
  };
  const track = mk('ac-ring__track'); const bar = mk('ac-ring__bar');
  bar.setAttribute('stroke-dasharray', '100 100');
  bar.setAttribute('stroke-dashoffset', '100');
  svg.append(track, bar);
  el.prepend(svg);
  if (!el.getAttribute('role')) el.setAttribute('role', 'img');

  let visible = false;
  const update = () => {
    const max = Number(el.dataset.max) || 100;
    const v = clamp(Number(el.dataset.value) || 0, 0, max);
    const pct = (v / max) * 100;
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', `${Math.round(pct)}%`);
    if (visible) bar.setAttribute('stroke-dashoffset', String(100 - pct));
  };
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { visible = true; io.disconnect(); requestAnimationFrame(update); }
  });
  io.observe(el);
  const mo = new MutationObserver(update);
  mo.observe(el, { attributes: true, attributeFilter: ['data-value', 'data-max'] });
  update();
  return () => { io.disconnect(); mo.disconnect(); svg.remove(); };
});
