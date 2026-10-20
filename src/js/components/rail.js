/* Navigation rail.
   ≥1024px: <aside class="ac-dock" data-ac="dock"> is the slim floating icon rail; its group buttons
            [data-ac-rail-group="<id>"] open <aside class="ac-rail" data-ac="rail"> as a flyout that shows
            only <div class="ac-rail__group" data-group="<id>">. Click outside / Esc / a link closes it.
   <1024px: .ac-rail is an off-canvas drawer with every group, swipe-to-close, focus trap, scroll lock.
   Markup: <aside class="ac-rail" data-ac="rail">…</aside><div class="ac-scrim" data-ac-rail-close></div>
   Triggers anywhere: [data-ac-rail-toggle] (flyout with all groups on desktop / drawer on mobile),
   [data-ac-rail-open], [data-ac-rail-close], [data-ac-rail-group="id"] (desktop flyout for one group).
   Theme buttons in the dock: [data-theme-set="light|dark"] (aria-pressed is kept in sync).
   API: AC.rail.open(group?) .close() .toggle(group?) .collapse(bool) .collapsed .isOpen .group
   Events: ac:rail:open {group}, ac:rail:close, ac:rail:collapse {collapsed} */
import { AC, register, on, emit, store, trapFocus, scrollLock, gesture, isMobile, isRTL, theme, $$ } from '../core.js';

const root = document.documentElement;
let railEl = null;
let release = null;
let locked = false;

function groupTitle(id) {
  const g = id && railEl?.querySelector(`.ac-rail__group[data-group="${CSS.escape(id)}"] .ac-rail__label`);
  return g ? g.textContent.trim() : '';
}
function syncTriggers() {
  const open = rail.isOpen; const g = railEl?.dataset.group || '';
  for (const b of $$('[data-ac-rail-group]')) b.setAttribute('aria-expanded', String(open && !isMobile() && b.dataset.acRailGroup === g));
  for (const b of $$('[data-ac-rail-open], [data-ac-rail-toggle]')) b.setAttribute('aria-expanded', String(open && (isMobile() || !g)));
}
function filterGroups(group) {
  if (!railEl) return;
  for (const g of $$('.ac-rail__group', railEl)) g.toggleAttribute('data-off', !!group && g.dataset.group !== group);
  const heading = railEl.querySelector('.ac-rail__heading-text');
  if (heading) heading.textContent = (!isMobile() && groupTitle(group)) || heading.dataset.default || heading.textContent;
}

export const rail = {
  /** kept for API compatibility — the dock is always slim now */
  get collapsed() { return root.dataset.rail === 'collapsed'; },
  get isOpen() { return railEl?.dataset.state === 'open'; },
  get group() { return railEl?.dataset.group || ''; },
  collapse(value = !rail.collapsed) {
    if (value) root.dataset.rail = 'collapsed'; else delete root.dataset.rail;
    store.set('ac:rail', value ? 'collapsed' : 'expanded');
    emit(railEl, 'rail:collapse', { collapsed: value });
  },
  open(group = '') {
    if (!railEl) return;
    const mobile = isMobile();
    if (mobile) group = '';
    if (rail.isOpen && rail.group === group) return;
    const already = rail.isOpen;
    if (group) railEl.dataset.group = group; else delete railEl.dataset.group;
    filterGroups(group);
    railEl.dataset.state = 'open';
    if (mobile && !locked) { scrollLock.lock(); locked = true; }
    release?.();
    release = trapFocus(railEl, { initial: railEl.querySelector('.ac-rail__group:not([data-off]) [aria-current="page"]') || railEl.querySelector('.ac-rail__group:not([data-off]) .ac-rail__link') || undefined, returnFocus: !already });
    syncTriggers();
    emit(railEl, 'rail:open', { group });
  },
  close() {
    if (!railEl || !rail.isOpen) return;
    railEl.dataset.state = 'closed';
    if (locked) { scrollLock.unlock(); locked = false; }
    release?.(); release = null;
    syncTriggers();
    emit(railEl, 'rail:close');
  },
  toggle(group = '') {
    if (rail.isOpen && (isMobile() || rail.group === group)) rail.close();
    else rail.open(group);
  },
};

register('rail', (el) => {
  railEl = el;
  if (!el.id) el.id = 'ac-rail';
  const heading = el.querySelector('.ac-rail__heading-text');
  if (heading && !heading.dataset.default) heading.dataset.default = heading.textContent.trim();

  const offs = [
    on(document, 'click', '[data-ac-rail-toggle]', (e) => { e.preventDefault(); rail.toggle(); }),
    on(document, 'click', '[data-ac-rail-open]', (e) => { e.preventDefault(); rail.open(); }),
    on(document, 'click', '[data-ac-rail-close]', () => rail.close()),
    on(document, 'click', '[data-ac-rail-group]', (e, b) => { e.preventDefault(); rail.toggle(b.dataset.acRailGroup); }),
    on(el, 'click', 'a[href]', () => rail.close()),
    on(document, 'keydown', (e) => { if (e.key === 'Escape' && rail.isOpen) rail.close(); }),
    // desktop flyout: click outside closes
    on(document, 'pointerdown', (e) => {
      if (!rail.isOpen || isMobile()) return;
      if (el.contains(e.target) || e.target.closest('[data-ac-rail-group], [data-ac-rail-open], [data-ac-rail-toggle]')) return;
      rail.close();
    }),
    on(window, 'resize', () => { if (rail.isOpen) rail.close(); }),
    on(document, 'ac:i18n:change', () => requestAnimationFrame(() => filterGroups(rail.group))),
  ];

  // swipe the drawer closed (towards its own edge)
  const offGesture = gesture(el, {
    axis: 'x',
    filter: () => isMobile() && rail.isOpen,
    onStart: () => { el.setAttribute('data-dragging', ''); },
    onMove: (s) => {
      const dir = isRTL() ? 1 : -1;               // closing direction in physical px
      const d = Math.max(0, s.dx * dir);
      el.style.setProperty('--ac-drag', `${d * dir}px`);
    },
    onEnd: (s) => {
      el.removeAttribute('data-dragging');
      el.style.removeProperty('--ac-drag');
      const dir = isRTL() ? 1 : -1;
      const d = s.dx * dir;
      if (d > el.offsetWidth * 0.35 || s.vx * dir > 0.5) rail.close();
    },
  });

  return () => { offs.forEach((f) => f()); offGesture(); if (railEl === el) railEl = null; };
});

/* Slim dock: theme pill state, tooltips, and the active group (the group holding the current page). */
register('dock', (el) => {
  const syncTheme = () => {
    const t = theme.get().resolved;
    for (const b of $$('[data-theme-set]', el)) b.setAttribute('aria-pressed', String(b.dataset.themeSet === t));
  };
  const railNode = () => railEl || document.querySelector('.ac-rail');
  const syncActive = () => {
    const current = railNode()?.querySelector('.ac-rail__link[aria-current="page"]');
    const group = current?.closest('.ac-rail__group')?.dataset.group;
    for (const b of $$('[data-ac-rail-group]', el)) b.toggleAttribute('data-active', !!group && b.dataset.acRailGroup === group && !$$('a.ac-dock__btn[aria-current="page"]', el).length);
  };
  const tips = () => { for (const b of $$('.ac-dock__btn', el)) { const l = b.getAttribute('aria-label'); if (l) { b.setAttribute('data-ac-tooltip', l); b.setAttribute('data-ac-tooltip-placement', 'end'); } } };
  syncTheme(); tips();
  const mo = new MutationObserver(syncActive);
  if (railNode()) mo.observe(railNode(), { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  mo.observe(el, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  syncActive();
  const offs = [
    on(el, 'click', '[data-theme-set]', (e, b) => theme.set({ theme: b.dataset.themeSet })),
    on(document, 'ac:theme:change', syncTheme),
    on(document, 'ac:i18n:change', () => requestAnimationFrame(tips)),
  ];
  return () => { mo.disconnect(); offs.forEach((f) => f()); };
});

AC.rail = rail;
