/* Tabs (underline / pills), segmented control and nav pill (top section nav) — roving tabindex, arrow keys
   (RTL-aware), Home/End, animated indicator.

   Tabs:
   <div class="ac-tabs [ac-tabs--pills]" data-ac="tabs">
     <div class="ac-tabs__list" role="tablist" aria-label="…">
       <button class="ac-tabs__tab" role="tab" aria-selected="true" aria-controls="p1">…</button> …
     </div>
     <div class="ac-tabs__panel" role="tabpanel" id="p1">…</div> …
   </div>
   Events: ac:tabs:change { index, tab, panel, value }   API: AC.instance(el,'tabs').select(i)

   Segmented:
   <div class="ac-segmented" data-ac="segmented" role="radiogroup" aria-label="…">
     <button class="ac-segmented__item" role="radio" aria-checked="true" data-value="grid">…</button> …
   </div>
   Events: ac:segmented:change { index, value, item }   API: AC.instance(el,'segmented').select(i) */
import { register, on, emit, uid, isRTL, instance, rafThrottle } from '../core.js';
import { slide, inkLayer } from '../motion.js';

// spring-driven (motion.js slide): the leading edge runs ahead of the trailing one, so the pill
// stretches toward its target and settles — interruptible, velocity carries over on rapid clicks.
function placeIndicator(ind, container, target, instant, ink) {
  if (!target || !container.getClientRects().length) return;
  const r = target.getBoundingClientRect(); const b = container.getBoundingClientRect();
  if (!r.width) return;
  ink?.sync();
  slide(ind, { x: r.left - b.left + container.scrollLeft - container.clientLeft, w: r.width }, { instant, also: ink ? [ink.el] : [] });
}

function keyNav(e, items, current) {
  const rtl = isRTL(e.currentTarget);
  const next = rtl ? 'ArrowLeft' : 'ArrowRight';
  const prev = rtl ? 'ArrowRight' : 'ArrowLeft';
  let i = current;
  if (e.key === next || e.key === 'ArrowDown') i = (current + 1) % items.length;
  else if (e.key === prev || e.key === 'ArrowUp') i = (current - 1 + items.length) % items.length;
  else if (e.key === 'Home') i = 0;
  else if (e.key === 'End') i = items.length - 1;
  else return null;
  e.preventDefault();
  return i;
}

/** shared indicator controller */
function indicatorFor(container, className) {
  let ind = container.querySelector(`:scope > .${className}`);
  if (!ind) { ind = document.createElement('span'); ind.className = className; ind.setAttribute('aria-hidden', 'true'); container.append(ind); }
  return ind;
}

register('tabs', (el) => {
  const list = el.matches('[role="tablist"]') ? el : el.querySelector('[role="tablist"]');
  if (!list) return;
  const tabs = () => Array.from(list.querySelectorAll('[role="tab"]')).filter((t) => !t.closest('[data-ac="tabs"]') || t.closest('[data-ac="tabs"]') === el);
  const ind = indicatorFor(list, 'ac-tabs__indicator');
  const ink = el.classList.contains('ac-tabs--pills') ? inkLayer(list, '.ac-tabs__tab') : null;
  let first = true;

  for (const t of tabs()) {
    if (!t.id) t.id = uid('tab');
    const pid = t.getAttribute('aria-controls');
    const panel = pid && document.getElementById(pid);
    if (panel) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', t.id); if (!panel.hasAttribute('tabindex')) panel.tabIndex = 0; }
  }
  const currentIndex = () => Math.max(0, tabs().findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  const place = rafThrottle(() => { placeIndicator(ind, list, tabs()[currentIndex()], first, ink); first = false; });

  function select(i, { focus = false, silent = false } = {}) {
    const all = tabs(); const tab = all[i]; if (!tab || tab.disabled) return;
    const prevIndex = currentIndex();
    all.forEach((t, j) => {
      const on = j === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const p = document.getElementById(t.getAttribute('aria-controls') || '');
      if (p) {
        p.hidden = !on;
        if (on && j !== prevIndex && !silent) { p.setAttribute('data-entering', ''); setTimeout(() => p.removeAttribute('data-entering'), 400); }
      }
    });
    if (focus) tab.focus();
    // keep the tab visible inside a horizontally scrolling list without scrolling the page
    const lr = list.getBoundingClientRect(); const tr = tab.getBoundingClientRect();
    if (tr.left < lr.left || tr.right > lr.right) list.scrollBy({ left: tr.left < lr.left ? tr.left - lr.left - 16 : tr.right - lr.right + 16, behavior: silent ? 'auto' : 'smooth' });
    place();
    if (!silent && i !== prevIndex) {
      emit(el, 'tabs:change', { index: i, tab, panel: document.getElementById(tab.getAttribute('aria-controls') || ''), value: tab.dataset.value });
    }
  }

  select(currentIndex(), { silent: true });
  const ro = new ResizeObserver(place); ro.observe(list);
  const offs = [
    on(list, 'click', '[role="tab"]', (e, t) => select(tabs().indexOf(t))),
    on(list, 'keydown', (e) => {
      const all = tabs(); const cur = all.indexOf(document.activeElement);
      if (cur < 0) return;
      const i = keyNav(e, all, cur); if (i != null) select(i, { focus: true });
    }),
    on(document, 'ac:i18n:change', () => { first = true; place(); }),
  ];
  document.fonts?.ready.then(place);
  instance(el, 'tabs', { select, get index() { return currentIndex(); } });
  return () => { ro.disconnect(); ink?.destroy(); offs.forEach((f) => f()); };
});

register('segmented', (el) => {
  if (!el.getAttribute('role')) el.setAttribute('role', 'radiogroup');
  const items = () => Array.from(el.querySelectorAll('.ac-segmented__item'));
  const thumb = indicatorFor(el, 'ac-segmented__thumb');
  const ink = inkLayer(el, '.ac-segmented__item');
  let first = true;
  items().forEach((it) => { if (!it.getAttribute('role')) it.setAttribute('role', 'radio'); });
  const currentIndex = () => Math.max(0, items().findIndex((it) => it.getAttribute('aria-checked') === 'true'));
  const place = rafThrottle(() => { placeIndicator(thumb, el, items()[currentIndex()], first, ink); first = false; });

  function select(i, { focus = false, silent = false } = {}) {
    const all = items(); const item = all[i]; if (!item || item.disabled) return;
    const prev = currentIndex();
    all.forEach((it, j) => { it.setAttribute('aria-checked', String(j === i)); it.tabIndex = j === i ? 0 : -1; });
    if (focus) item.focus();
    place();
    if (!silent && i !== prev) emit(el, 'segmented:change', { index: i, value: item.dataset.value ?? item.textContent.trim(), item });
  }

  select(currentIndex(), { silent: true });
  const ro = new ResizeObserver(place); ro.observe(el);
  const offs = [
    on(el, 'click', '.ac-segmented__item', (e, it) => select(items().indexOf(it))),
    on(el, 'keydown', (e) => {
      const all = items(); const cur = all.indexOf(document.activeElement);
      if (cur < 0) return;
      const i = keyNav(e, all, cur); if (i != null) select(i, { focus: true });
    }),
    on(document, 'ac:i18n:change', () => { first = true; place(); }),
  ];
  document.fonts?.ready.then(place);
  instance(el, 'segmented', { select, get value() { const it = items()[currentIndex()]; return it?.dataset.value; } });
  return () => { ro.disconnect(); ink.destroy(); offs.forEach((f) => f()); };
});

/* Nav pill: segmented navigation of links with a sliding ink pill behind the current one.
   <nav class="ac-topnav ac-chrome" data-ac="navpill" aria-label="…">
     <a class="ac-topnav__link" href="#/dashboard" aria-current="page">…</a> …
   </nav>
   The router sets aria-current="page"; the pill follows (hidden when no link is current). */
register('navpill', (el) => {
  const ind = indicatorFor(el, 'ac-topnav__ind');
  const ink = inkLayer(el, '.ac-topnav__link');
  let first = true;
  const place = rafThrottle(() => {
    const cur = el.querySelector('.ac-topnav__link[aria-current="page"]');
    if (!cur || !el.getClientRects().length) { ind.style.setProperty('--ac-ind-o', '0'); ink.el.style.setProperty('--ac-ind-o', '0'); first = true; return; }
    placeIndicator(ind, el, cur, first, ink);
    ind.style.setProperty('--ac-ind-o', '1'); ink.el.style.setProperty('--ac-ind-o', '1');
    first = false;
    const lr = el.getBoundingClientRect(); const tr = cur.getBoundingClientRect();
    if (tr.left < lr.left || tr.right > lr.right) el.scrollBy({ left: tr.left < lr.left ? tr.left - lr.left - 12 : tr.right - lr.right + 12, behavior: 'smooth' });
  });
  const mo = new MutationObserver(place);
  mo.observe(el, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  const ro = new ResizeObserver(place); ro.observe(el);
  const offs = [on(document, 'ac:i18n:change', () => { first = true; requestAnimationFrame(place); })];
  document.fonts?.ready.then(place);
  place();
  return () => { mo.disconnect(); ro.disconnect(); ink.destroy(); offs.forEach((f) => f()); };
});
