/*! AraminConsole v0.1.0 — module shell — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');

/* ======== module: shell ======== */
if (!__R["shell"]) __R["shell"] = (() => {
const F = {};
const __ac_m1 = __R["core"].f["js/core.js"];
const __ac_m2 = __R["core"].f["js/motion.js"];
/* ---- js/components/rail.js ---- */
const __ac_m3 = F["js/components/rail.js"] = (() => {
const { AC, register, on, emit, store, trapFocus, scrollLock, gesture, isMobile, isRTL, theme, $$ } = __ac_m1;
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

const rail = {
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
return Object.freeze({ rail });
})();

/* ---- js/components/palette.js ---- */
const __ac_m4 = F["js/components/palette.js"] = (() => {
const { AC, on, emit, h, icon, escapeHtml, uid, trapFocus, scrollLock, store, i18n } = __ac_m1;
/* Command palette — Ctrl/⌘+K, fuzzy search, recents, keyboard nav.
   AC.palette.add([{ id, title, i18n?, hint?, group?, icon?, keywords?, shortcut?, href?, run?() }])
   AC.palette.remove(id) · AC.palette.open(query?) · AC.palette.close() · AC.palette.toggle()
   Any element with [data-ac-palette-open] opens it.
   Events: ac:palette:open, ac:palette:close, ac:palette:run { command } (cancelable) */


const commands = new Map();
const RECENT_KEY = 'ac:palette:recent';
const MAX_RECENT = 5;
let el; let input; let listEl; let release = null; let results = []; let active = 0;

const norm = (s) => String(s || '').toLowerCase()
  .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[ۀة]/g, 'ه').replace(/[أإآ]/g, 'ا')
  .replace(/[ً-ٰٟ‌]/g, '');
const titleOf = (c) => (c.i18n ? i18n.t(c.i18n, c.title) : (typeof c.title === 'function' ? c.title() : c.title)) || c.id;
const hintOf = (c) => (c.hintI18n ? i18n.t(c.hintI18n, c.hint) : c.hint) || '';
const groupOf = (c) => (c.groupI18n ? i18n.t(c.groupI18n, c.group) : c.group) || i18n.t('palette.commands', 'Commands');

/** Fuzzy subsequence score. Returns { score, idx } or null. Contiguous + word-start matches score higher. */
function fuzzy(text, q) {
  const t = norm(text); if (!q) return { score: 0, idx: [] };
  const direct = t.indexOf(q);
  if (direct > -1) return { score: 100 - direct + (direct === 0 || t[direct - 1] === ' ' ? 30 : 0), idx: [...Array(q.length)].map((_, i) => direct + i) };
  let ti = 0; let score = 0; const idx = []; let last = -2;
  for (const ch of q) {
    if (ch === ' ') continue;
    const at = t.indexOf(ch, ti);
    if (at < 0) return null;
    score += at === last + 1 ? 6 : 1;
    if (at === 0 || t[at - 1] === ' ') score += 4;
    idx.push(at); last = at; ti = at + 1;
  }
  return { score, idx };
}

function highlight(text, idx) {
  if (!idx?.length) return escapeHtml(text);
  const set = new Set(idx); let out = '';
  [...text].forEach((ch, i) => { out += set.has(i) ? `<mark>${escapeHtml(ch)}</mark>` : escapeHtml(ch); });
  return out;
}

function build() {
  if (el) return;
  const listId = uid('palette-list');
  el = h('div', { class: 'ac-palette', role: 'dialog', 'aria-modal': 'true', 'aria-label': i18n.t('palette.label', 'Command palette'), 'data-state': 'closed' });
  el.innerHTML = `
    <div class="ac-palette__backdrop" data-palette-close></div>
    <div class="ac-palette__panel">
      <div class="ac-palette__search">
        ${icon('search')}
        <input class="ac-palette__input" type="search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="${listId}">
        <kbd class="ac-kbd">Esc</kbd>
      </div>
      <div class="ac-palette__list" role="listbox" id="${listId}"></div>
      <div class="ac-palette__foot">
        <span><kbd class="ac-kbd">↑</kbd><kbd class="ac-kbd">↓</kbd> <span data-palette-t="nav"></span></span>
        <span><kbd class="ac-kbd">↵</kbd> <span data-palette-t="open"></span></span>
      </div>
    </div>`;
  document.body.append(el);
  input = el.querySelector('.ac-palette__input');
  listEl = el.querySelector('.ac-palette__list');
  on(el, 'click', '[data-palette-close]', () => palette.close());
  on(input, 'input', () => render());
  on(input, 'keydown', onKey);
  on(listEl, 'click', '.ac-palette__item', (e, item) => runAt(Number(item.dataset.index)));
  on(listEl, 'pointermove', '.ac-palette__item', (e, item) => { const i = Number(item.dataset.index); if (i !== active) setActive(i, false); });
}

function labels() {
  input.placeholder = i18n.t('palette.placeholder', 'Search pages and actions…');
  input.setAttribute('aria-label', input.placeholder);
  el.querySelector('[data-palette-t="nav"]').textContent = i18n.t('palette.navigate', 'navigate');
  el.querySelector('[data-palette-t="open"]').textContent = i18n.t('palette.select', 'open');
}

function render() {
  const q = norm(input.value.trim());
  const all = [...commands.values()];
  let groups = [];
  if (!q) {
    const recentIds = store.get(RECENT_KEY, []).filter((id) => commands.has(id));
    const recent = recentIds.map((id) => ({ c: commands.get(id), idx: [] }));
    if (recent.length) groups.push([i18n.t('palette.recent', 'Recent'), recent]);
    const byGroup = new Map();
    for (const c of all) {
      if (recentIds.includes(c.id)) continue;
      const g = groupOf(c);
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push({ c, idx: [] });
    }
    groups.push(...byGroup);
  } else {
    const scored = [];
    for (const c of all) {
      const title = titleOf(c);
      const m = fuzzy(title, q);
      const k = m ? null : fuzzy(`${c.title || ''} ${(c.keywords || []).join(' ')} ${hintOf(c)}`, q);
      if (m) scored.push({ c, idx: m.idx, score: m.score + 10 });
      else if (k) scored.push({ c, idx: [], score: k.score });
    }
    scored.sort((a, b) => b.score - a.score);
    if (scored.length) groups.push([i18n.t('palette.results', 'Results'), scored.slice(0, 50)]);
  }
  results = [];
  let html = '';
  for (const [g, items] of groups) {
    html += `<div class="ac-palette__group" role="presentation">${escapeHtml(g)}</div>`;
    for (const { c, idx } of items) {
      const i = results.push(c) - 1;
      const title = titleOf(c);
      const hint = hintOf(c);
      html += `<div class="ac-palette__item" role="option" id="${el.id || 'acp'}-opt-${i}" data-index="${i}" aria-selected="false">
        <span class="ac-palette__icon">${icon(c.icon || 'arrow-right', c.icon ? '' : 'ac-flip-rtl')}</span>
        <span class="ac-palette__text"><span class="ac-palette__title">${highlight(title, idx)}</span>${hint ? `<span class="ac-palette__hint">${escapeHtml(hint)}</span>` : ''}</span>
        ${c.shortcut ? `<kbd class="ac-kbd">${escapeHtml(c.shortcut)}</kbd>` : `<span class="ac-palette__enter">${icon('corner-down-left', 'ac-icon--sm ac-flip-rtl')}</span>`}
      </div>`;
    }
  }
  if (!results.length) html = `<div class="ac-palette__empty">${escapeHtml(i18n.t('palette.empty', 'Nothing found'))}</div>`;
  listEl.innerHTML = html;
  setActive(0, true);
}

function setActive(i, scroll = true) {
  if (!results.length) { input.removeAttribute('aria-activedescendant'); return; }
  active = (i + results.length) % results.length;
  listEl.querySelectorAll('.ac-palette__item').forEach((n) => {
    const on = Number(n.dataset.index) === active;
    n.setAttribute('aria-selected', String(on));
    if (on) { input.setAttribute('aria-activedescendant', n.id); if (scroll) n.scrollIntoView({ block: 'nearest' }); }
  });
}

function onKey(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
  else if (e.key === 'Home' && !input.value) { e.preventDefault(); setActive(0); }
  else if (e.key === 'End' && !input.value) { e.preventDefault(); setActive(results.length - 1); }
  else if (e.key === 'Enter') { e.preventDefault(); runAt(active); }
  else if (e.key === 'Escape') { e.preventDefault(); palette.close(); }
}

function runAt(i) {
  const c = results[i]; if (!c) return;
  if (!emit(el, 'palette:run', { command: c }).defaultPrevented) {
    const recent = [c.id, ...store.get(RECENT_KEY, []).filter((x) => x !== c.id)].slice(0, MAX_RECENT);
    store.set(RECENT_KEY, recent);
    palette.close();
    if (c.href) location.href = c.href;
    if (c.run) setTimeout(() => c.run(c), 0);
  }
}

const palette = {
  get isOpen() { return el?.dataset.state === 'open'; },
  add(list) { for (const c of [].concat(list)) if (c && c.id) commands.set(c.id, c); if (palette.isOpen) render(); },
  remove(id) { commands.delete(id); },
  clear() { commands.clear(); },
  list() { return [...commands.values()]; },
  open(query = '') {
    build();
    if (palette.isOpen) { input.focus(); return; }
    labels();
    input.value = query;
    render();
    el.dataset.state = 'open';
    scrollLock.lock();
    release = trapFocus(el, { initial: input });
    emit(el, 'palette:open');
  },
  close() {
    if (!palette.isOpen) return;
    el.dataset.state = 'closed';
    scrollLock.unlock();
    release?.(); release = null;
    emit(el, 'palette:close');
  },
  toggle() { palette.isOpen ? palette.close() : palette.open(); },
};

on(document, 'keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) { e.preventDefault(); palette.toggle(); }
});
on(document, 'click', '[data-ac-palette-open]', (e) => { e.preventDefault(); palette.open(); });

AC.palette = palette;
return Object.freeze({ palette });
})();

/* ---- js/components/press.js ---- */
const __ac_m5 = F["js/components/press.js"] = (() => {
const { AC, on, reducedMotion } = __ac_m1;
/* Press feedback.
   - Ripple: elements with [data-ripple] always; .ac-btn and .ac-tabbar__item on touch devices.
     AC.press.ripple = 'always' | 'touch' (default) | 'off'
   - Press scale is pure CSS (:active → var(--ac-press)); add .ac-pressable to any element. */


const press = { ripple: 'touch' };

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
return Object.freeze({ press });
})();

/* ---- js/components/tabbar.js ---- */
const __ac_m10 = F["js/components/tabbar.js"] = (() => {
const { register, on, emit, rafThrottle, haptic } = __ac_m1;
const { slide, spring, springs, inkLayer } = __ac_m2;
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
return Object.freeze({  });
})();

/* ---- js/components/largetitle.js ---- */
const __ac_m11 = F["js/components/largetitle.js"] = (() => {
const { register, on, emit, rafThrottle } = __ac_m1;
/* App bar scroll state + iOS-style large title.
   <header class="ac-appbar" data-ac="appbar" data-collapsed="true"> … <div class="ac-appbar__title"></div> … </header>
     → sets data-scrolled="true" once the page scrolls (hairline border appears).
   <header class="ac-page-head" data-ac="largetitle"> <h1 class="ac-page-head__title">…</h1> </header>
     → copies the title into .ac-appbar__title and sets data-collapsed on the app bar while the
       large title is scrolled under it (phones show the small title only then).
   Events: ac:largetitle:change { collapsed } on the app bar. */


register('appbar', (el) => {
  const update = rafThrottle(() => { el.dataset.scrolled = String(scrollY > 2); });
  update();
  return on(window, 'scroll', update, { passive: true });
});

register('largetitle', (el) => {
  const bar = document.querySelector('.ac-appbar');
  const title = el.matches('.ac-page-head__title, h1, h2') ? el : el.querySelector('.ac-page-head__title, h1');
  if (!bar || !title) return;
  const small = bar.querySelector('.ac-appbar__title');
  const sync = () => { if (small) small.textContent = title.textContent.trim(); };
  sync();
  bar.dataset.collapsed = 'false';

  let io;
  const watch = () => {
    io?.disconnect();
    const h = bar.getBoundingClientRect().height || 56;
    io = new IntersectionObserver(([entry]) => {
      const collapsed = !entry.isIntersecting && entry.boundingClientRect.top < h;
      if (bar.dataset.collapsed !== String(collapsed)) {
        bar.dataset.collapsed = String(collapsed);
        emit(bar, 'largetitle:change', { collapsed });
      }
    }, { rootMargin: `-${Math.round(h)}px 0px 0px 0px`, threshold: 0 });
    io.observe(title);
  };
  watch();
  const offResize = on(window, 'resize', rafThrottle(watch));
  const offLang = on(document, 'ac:i18n:change', () => requestAnimationFrame(sync));
  const mo = new MutationObserver(sync);
  mo.observe(title, { childList: true, characterData: true, subtree: true });

  return () => {
    io?.disconnect(); offResize(); offLang(); mo.disconnect();
    // without a large title the small one must stay visible
    bar.dataset.collapsed = 'true';
  };
});
return Object.freeze({  });
})();

/* ---- js/components/tabs.js ---- */
const __ac_m12 = F["js/components/tabs.js"] = (() => {
const { register, on, emit, uid, isRTL, instance, rafThrottle } = __ac_m1;
const { slide, inkLayer } = __ac_m2;
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
return Object.freeze({  });
})();

/* ---- js/components/pull-refresh.js ---- */
const __ac_m13 = F["js/components/pull-refresh.js"] = (() => {
const { register, emit, icon, clamp, haptic } = __ac_m1;
/* Pull to refresh (touch only, window scroll at top).
   <main data-ac="pull-refresh">…</main>
   Listen: el.addEventListener('ac:pull-refresh:refresh', e => e.detail.waitUntil(fetchStuff()))
   Without waitUntil the spinner settles after 800 ms. */


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
return Object.freeze({  });
})();

/* ---- js/components/ring.js ---- */
const __ac_m14 = F["js/components/ring.js"] = (() => {
const { register, clamp } = __ac_m1;
/* Progress ring.
   <div class="ac-ring" data-ac="ring" data-value="72" [data-max="100"] [data-tone="success"]>
     <span class="ac-ring__label">72%<small>goal</small></span></div>
   Animates from 0 when it scrolls into view; changing data-value animates to the new value. */


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
return Object.freeze({  });
})();

return { f: F, ns: Object.freeze({ "rail": __ac_m3["rail"], "palette": __ac_m4["palette"], "press": __ac_m5["press"] }) };
})();
export const { rail, palette, press } = __R["shell"].ns;
export default __R["shell"].ns;
