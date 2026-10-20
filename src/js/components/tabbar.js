/* Bottom tab bar (floating pill) with a sliding ink circle behind the active icon.
   Markup:
   <nav class="ac-tabbar" data-ac="tabbar" aria-label="…">
     <a class="ac-tabbar__item" href="#/dashboard" aria-current="page">
       <span class="ac-tabbar__icon"><svg class="ac-icon"><use href="#i-house"/></svg></span>
       <span class="ac-tabbar__label">Home</span></a>
     <div class="ac-tabbar__fab-slot"><button class="ac-tabbar__fab" aria-label="New">…</button></div>
     …
   </nav>
   The router (or you) sets aria-current="page" on the active item; the pill follows.
   Optional data-hide-on-scroll: slides away while scrolling down.
   Events: ac:tabbar:select { item, href } (on tap) */
import { register, on, emit, rafThrottle, haptic } from '../core.js';
import { slide, spring, springs, inkLayer } from '../motion.js';

register('tabbar', (el) => {
  let ind = el.querySelector('.ac-tabbar__indicator');
  if (!ind) { ind = document.createElement('span'); ind.className = 'ac-tabbar__indicator'; ind.setAttribute('aria-hidden', 'true'); el.prepend(ind); }
  let first = true; let lastActive = null;
  const ink = inkLayer(el, '.ac-tabbar__item');

  // the ink circle springs to the active icon and stretches into a pill on the way (motion.js slide);
  // the newly active icon gets a small bouncy pop.
  const place = () => {
    const active = el.querySelector('.ac-tabbar__item[aria-current="page"] .ac-tabbar__icon');
    if (!active || !el.getClientRects().length) { ind.style.setProperty('--ac-ind-o', '0'); ink.el.style.setProperty('--ac-ind-o', '0'); first = true; lastActive = null; return; }
    const r = active.getBoundingClientRect(); const b = el.getBoundingClientRect();
    ink.sync();
    slide(ind, { x: r.left - b.left - el.clientLeft, w: r.width, y: r.top - b.top - el.clientTop, h: r.height }, { instant: first, also: [ink.el] });
    ind.style.setProperty('--ac-ind-o', '1'); ink.el.style.setProperty('--ac-ind-o', '1');
    if (!first && lastActive !== active) {
      const idx = Array.from(el.querySelectorAll('.ac-tabbar__item')).indexOf(active.closest('.ac-tabbar__item'));
      for (const icon of [active.querySelector('.ac-icon'), ink.el.children[idx]?.querySelector('.ac-icon')]) spring(icon, { scale: [0.72, 1] }, springs.bouncy);
    }
    first = false; lastActive = active;
  };
  const placeLater = rafThrottle(place);

  const mo = new MutationObserver(placeLater);
  mo.observe(el, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  const ro = new ResizeObserver(placeLater);
  ro.observe(el);

  const offs = [
    on(el, 'click', '.ac-tabbar__item', (e, item) => { haptic(); emit(el, 'tabbar:select', { item, href: item.getAttribute('href') }); }),
    on(document, 'ac:i18n:change', () => { first = true; placeLater(); }),
  ];

  if (el.hasAttribute('data-hide-on-scroll')) {
    let lastY = scrollY;
    offs.push(on(window, 'scroll', rafThrottle(() => {
      const y = scrollY; const dy = y - lastY; lastY = y;
      if (Math.abs(dy) < 4) return;
      el.dataset.hidden = String(dy > 0 && y > 80);
    }), { passive: true }));
  }

  placeLater();
  document.fonts?.ready.then(placeLater);
  return () => { mo.disconnect(); ro.disconnect(); ink.destroy(); offs.forEach((f) => f()); };
});
