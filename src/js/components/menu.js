/* Dropdown menu, context menu and phone action sheet.
   <button data-ac-open="#m">…</button>
   <div class="ac-menu" id="m" data-ac="dropdown" [data-placement="bottom-end"] aria-label="…">
     <div class="ac-menu__label">Group</div>
     <button class="ac-menu__item" data-value="edit">icon <span class="ac-menu__text">Edit</span><kbd class="ac-menu__kbd">E</kbd></button>
     <button class="ac-menu__item" role="menuitemcheckbox" aria-checked="true">…</button>
     <div role="group"><button class="ac-menu__item" role="menuitemradio" aria-checked="true">…</button>…</div>
     <div class="ac-menu__sep"></div>
     <div class="ac-menu__sub"><button class="ac-menu__item">More</button><div class="ac-menu">…</div></div>
     <button class="ac-menu__item" data-tone="danger">Delete</button>
   </div>
   Context menu: <div data-ac-contextmenu="#m">…</div> — right click, or long-press on touch.
   Below 640px menus present as an action sheet (drag to dismiss, cancel button).
   API: AC.menu(anchor|{x,y}|event, items, { placement }) → { el, close }
        items: [{ label, icon, shortcut, tone, disabled, value, checked, radio:'group', keep, onSelect(item), items:[…] }, '-', { heading }]
        AC.menu.open('#m', anchor) · AC.menu.close() · AC.menu.context(el, items)
   Events: ac:menu:select { item, value, checked } (on the menu), ac:dropdown:open / ac:dropdown:close */
import { AC, $, $$, on, emit, h, icon, escapeHtml, options, instance, register, scan, isRTL, haptic, reducedMotion, i18n } from '../core.js';
import { autoPosition, portal, layers } from './position.js';
import { buildLayer, phoneMQ } from './sheet.js';

const ITEM = '.ac-menu__item';
const itemsOf = (menu) => $$(ITEM, menu).filter((n) => n.closest('.ac-menu') === menu && !n.matches('[aria-disabled="true"], :disabled'));

function prepare(menu) {
  menu.setAttribute('role', 'menu');
  if (!menu.hasAttribute('tabindex')) menu.tabIndex = -1;
  for (const it of $$(ITEM, menu)) {
    if (!it.hasAttribute('role')) it.setAttribute('role', 'menuitem');
    it.tabIndex = -1;
    if (it.tagName === 'BUTTON' && !it.hasAttribute('type')) it.type = 'button';
    if (/checkbox|radio/.test(it.getAttribute('role')) && !it.querySelector('.ac-menu__check')) it.insertAdjacentHTML('afterbegin', `<span class="ac-menu__check" aria-hidden="true">${icon('check')}</span>`);
    const sub = it.parentElement.matches('.ac-menu__sub') && it.nextElementSibling?.matches('.ac-menu') ? it.nextElementSibling : null;
    if (sub) {
      it.setAttribute('aria-haspopup', 'menu'); it.setAttribute('aria-expanded', 'false');
      if (!it.querySelector('.ac-menu__chev')) it.insertAdjacentHTML('beforeend', `<span class="ac-menu__chev">${icon('chevron-right', 'ac-flip-rtl')}</span>`);
      prepare(sub);
    }
  }
  for (const s of $$('.ac-menu__sep', menu)) s.setAttribute('role', 'separator');
  for (const l of $$('.ac-menu__label', menu)) l.setAttribute('role', 'presentation');
}

/* ------------------------------------------------------------------ controller */
function controller(menu, o = {}) {
  let st = null; // open state { anchor, trigger, stop, restore, entry, sheet, parent }
  const isOpen = () => !!st;
  let typed = ''; let typedT = 0; let hoverT = 0; let openSub = null;

  function focusItem(it) {
    if (!it) return;
    for (const n of itemsOf(menu)) n.tabIndex = n === it ? 0 : -1;
    it.focus({ preventScroll: false });
  }
  function move(dir) {
    const list = itemsOf(menu); if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    focusItem(list[(i + dir + list.length) % list.length] || list[0]);
  }
  function open(anchor, { trigger = null, keyboard = false, placement, parent = null } = {}) {
    if (st) close('reopen', false);
    prepare(menu);
    trigger = trigger || (anchor instanceof Element ? anchor : null);
    const asSheet = !parent && phoneMQ.matches;
    st = { anchor, trigger, parent };
    if (asSheet) {
      const mark = document.createComment('ac-menu');
      menu.before(mark);
      menu.dataset.state = 'open';
      const sh = buildLayer('sheet', { className: 'ac-actionsheet', closeButton: false, label: menu.getAttribute('aria-label') || i18n.t('overlay.actions', 'Actions'),
        content: menu, footer: `<button class="ac-btn ac-btn--lg ac-btn--block" type="button" data-ac-close>${escapeHtml(i18n.t('overlay.cancel', 'Cancel'))}</button>`, initial: '.ac-menu' });
      st.sheet = sh;
      st.restore = () => { if (mark.isConnected) mark.replaceWith(menu); else menu.remove(); };
      sh.el.addEventListener('ac:sheet:close', () => { if (st?.sheet === sh) close('sheet', true, true); }, { once: true });
      sh.open(trigger);
    } else {
      st.restore = portal(menu);
      menu.dataset.state = 'closing';
      void menu.offsetWidth;
      menu.dataset.state = 'open';
      st.stop = autoPosition(anchor, menu, { placement: placement || o.placement || (parent ? 'end-start' : 'bottom-start'), offset: parent ? -4 : anchor instanceof Element ? 6 : 2 });
      st.entry = layers.push({ el: menu, close: (r) => close(r), light: true, anchor: trigger, kind: 'dropdown' });
      requestAnimationFrame(() => { if (st) (keyboard ? focusItem(itemsOf(menu)[0]) : menu.focus({ preventScroll: true })); });
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    emit(menu, 'dropdown:open', { trigger });
    return api;
  }
  function close(reason = 'api', refocus = true, fromSheet = false) {
    if (!st) return api;
    const s = st; st = null;
    const ae = document.activeElement;
    const hadFocus = !!ae?.closest?.('.ac-menu') || ae === document.body;
    closeSub(false);
    if (s.parent) o.parentApi?.onSubClosed(api);
    clearTimeout(hoverT);
    if (s.trigger) s.trigger.setAttribute('aria-expanded', 'false');
    if (s.sheet) {
      if (!fromSheet) s.sheet.close(reason);
      s.sheet.el.addEventListener('ac:sheet:closed', () => { s.restore(); menu.dataset.state = 'closed'; }, { once: true });
    } else {
      menu.dataset.state = 'closing';
      s.stop?.(); layers.remove(s.entry);
      if (refocus && hadFocus && s.trigger?.isConnected) s.trigger.focus({ preventScroll: true });
      setTimeout(() => { if (!st) { menu.dataset.state = 'closed'; s.restore(); } }, reducedMotion() ? 0 : 160);
    }
    emit(menu, 'dropdown:close', { reason });
    return api;
  }

  function subOf(it) { return it?.getAttribute('aria-haspopup') === 'menu' ? it.nextElementSibling : null; }
  function showSub(it, keyboard) {
    const sub = subOf(it); if (!sub) return;
    if (openSub?.it === it) { if (keyboard) openSub.api.focusFirst(); return; }
    closeSub(false);
    if (st?.sheet) { const ex = it.getAttribute('aria-expanded') === 'true'; it.setAttribute('aria-expanded', String(!ex)); return; }
    const api2 = instance(sub, 'submenu') || instance(sub, 'submenu', controller(sub, { parentApi: api }));
    openSub = { it, api: api2 };
    it.setAttribute('aria-expanded', 'true');
    api2.open(it, { trigger: it, keyboard, parent: menu });
  }
  function closeSub(refocus) {
    if (!openSub) return;
    const s = openSub; openSub = null;
    s.it.setAttribute('aria-expanded', 'false');
    s.api.close('sub', refocus);
  }

  function select(it, e) {
    const sub = subOf(it);
    if (sub) { showSub(it, e.detail === 0); return; }
    const role = it.getAttribute('role');
    let checked;
    if (role === 'menuitemcheckbox') { checked = it.getAttribute('aria-checked') !== 'true'; it.setAttribute('aria-checked', String(checked)); }
    else if (role === 'menuitemradio') {
      const grp = it.closest('[role="group"]') || menu;
      for (const r of $$('[role="menuitemradio"]', grp)) r.setAttribute('aria-checked', String(r === it));
      checked = true;
    }
    haptic();
    const detail = { item: it, value: it.dataset.value ?? it.textContent.trim(), checked };
    const ev = emit(menu, 'menu:select', detail);
    const keep = checked !== undefined || it.hasAttribute('data-keep');
    if (!keep && !ev.defaultPrevented) {
      let top = api; while (top.parentApi) top = top.parentApi;
      top.close('select');
    }
  }

  const offs = [
    on(menu, 'click', ITEM, (e, it) => {
      if (it.closest('.ac-menu') !== menu || it.matches('[aria-disabled="true"], :disabled')) return;
      select(it, e);
    }),
    on(menu, 'pointermove', ITEM, (e, it) => {
      if (e.pointerType !== 'mouse' || it.closest('.ac-menu') !== menu || st?.sheet) return;
      if (document.activeElement !== it && !it.matches('[aria-disabled="true"], :disabled')) focusItem(it);
      clearTimeout(hoverT);
      hoverT = setTimeout(() => { if (subOf(it)) showSub(it, false); else if (openSub && openSub.it !== it) closeSub(false); }, 120);
    }),
    on(menu, 'keydown', (e) => {
      if (e.target.closest('.ac-menu') !== menu) return;
      const fwd = isRTL(menu) ? 'ArrowLeft' : 'ArrowRight'; const back = isRTL(menu) ? 'ArrowRight' : 'ArrowLeft';
      const cur = document.activeElement?.closest(ITEM);
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Home') { e.preventDefault(); focusItem(itemsOf(menu)[0]); }
      else if (e.key === 'End') { e.preventDefault(); focusItem(itemsOf(menu).at(-1)); }
      else if ((e.key === 'Enter' || e.key === ' ') && cur) { e.preventDefault(); cur.click(); }
      else if (e.key === fwd && subOf(cur)) { e.preventDefault(); showSub(cur, true); }
      else if (e.key === back && st?.parent) { e.preventDefault(); o.parentApi?.closeSubFromChild(); }
      else if (e.key === 'Tab') { let top = api; while (top.parentApi) top = top.parentApi; top.close('tab', false); }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        clearTimeout(typedT); typed += e.key.toLowerCase(); typedT = setTimeout(() => { typed = ''; }, 600);
        const list = itemsOf(menu); const start = list.indexOf(cur);
        const hit = [...list.slice(start + 1), ...list.slice(0, start + 1)].find((n) => n.textContent.trim().toLowerCase().startsWith(typed));
        if (hit) focusItem(hit);
      }
    }),
  ];
  const api = {
    el: menu, open, close,
    parentApi: o.parentApi,
    toggle(trigger, e) { return st ? close('toggle') : open(trigger, { trigger, keyboard: !!e && e.detail === 0 }); },
    onSubClosed(child) { if (openSub?.api === child) { openSub.it.setAttribute('aria-expanded', 'false'); openSub = null; } },
    focusFirst() { focusItem(itemsOf(menu)[0]); },
    closeSubFromChild() { const it = openSub?.it; closeSub(false); it?.focus(); },
    get isOpen() { return isOpen(); },
    destroy() { offs.forEach((f) => f()); close('destroy', false); },
  };
  return api;
}

register('dropdown', (el) => {
  const api = controller(el, options(el, { placement: 'bottom-start' }));
  instance(el, 'dropdown', api);
  if (!el.dataset.state) el.dataset.state = 'closed';
  for (const t of $$(`[data-ac-open="#${el.id}"]`)) { t.setAttribute('aria-haspopup', 'menu'); t.setAttribute('aria-expanded', 'false'); t.setAttribute('aria-controls', el.id); }
  return () => api.destroy();
});

/* ------------------------------------------------------------------ imperative */
function renderItems(list, handlers) {
  let html = '';
  for (const it of list) {
    if (it === '-' || it?.separator) { html += '<div class="ac-menu__sep"></div>'; continue; }
    if (it.heading) { html += `<div class="ac-menu__label">${escapeHtml(it.heading)}</div>`; continue; }
    const i = handlers.push(it) - 1;
    const role = it.radio ? 'menuitemradio' : 'checked' in it ? 'menuitemcheckbox' : 'menuitem';
    const btn = `<button class="ac-menu__item" type="button" role="${role}" data-i="${i}"${it.value != null ? ` data-value="${escapeHtml(it.value)}"` : ''}${it.tone ? ` data-tone="${escapeHtml(it.tone)}"` : ''}${it.disabled ? ' aria-disabled="true"' : ''}${role !== 'menuitem' ? ` aria-checked="${!!it.checked}"` : ''}${it.radio ? ` data-radio="${escapeHtml(it.radio)}"` : ''}${it.keep ? ' data-keep' : ''}>${it.icon ? icon(it.icon) : ''}<span class="ac-menu__text">${escapeHtml(it.label)}</span>${it.shortcut ? `<kbd class="ac-menu__kbd">${escapeHtml(it.shortcut)}</kbd>` : ''}</button>`;
    html += it.items ? `<div class="ac-menu__sub">${btn}<div class="ac-menu">${renderItems(it.items, handlers)}</div></div>` : btn;
  }
  return html;
}

export function menu(anchor, items = [], opts = {}) {
  const handlers = [];
  const el = h('div', { class: 'ac-menu', 'data-state': 'closed', 'aria-label': opts.label });
  el.innerHTML = renderItems(items, handlers);
  // radio items sharing a name → one group
  for (const m of [el, ...$$('.ac-menu', el)]) {
    const groups = new Map();
    for (const b of m.querySelectorAll(':scope > [data-radio]')) { if (!groups.has(b.dataset.radio)) groups.set(b.dataset.radio, []); groups.get(b.dataset.radio).push(b); }
    for (const btns of groups.values()) { const g = h('div', { role: 'group' }); btns[0].before(g); g.append(...btns); }
  }
  document.body.append(el);
  const api = controller(el, opts);
  on(el, 'ac:menu:select', (e) => { const it = handlers[Number(e.detail.item.dataset.i)]; it?.onSelect?.(it, e.detail); });
  on(el, 'ac:dropdown:close', (e) => { if (e.target === el) setTimeout(() => { if (!api.isOpen) { api.destroy(); el.remove(); } }, 400); });
  let point = anchor;
  if (anchor instanceof Event) point = { x: anchor.clientX, y: anchor.clientY };
  const trigger = anchor instanceof Element ? anchor : (document.activeElement !== document.body ? document.activeElement : null);
  api.open(point, { trigger, keyboard: !!opts.keyboard, placement: opts.placement });
  return api;
}
menu.open = (target, anchor) => {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return null;
  scan(el);
  const api = instance(el, 'dropdown');
  const pt = anchor instanceof Event ? { x: anchor.clientX, y: anchor.clientY } : anchor;
  return api?.open(pt || el, { trigger: anchor instanceof Element ? anchor : null });
};
menu.close = () => layers.list.reverse().filter((l) => l.kind === 'dropdown').forEach((l) => l.close('api'));
menu.context = (el, items, opts) => on(el, 'contextmenu', (e) => { e.preventDefault(); menu(e, typeof items === 'function' ? items(e) : items, opts); });

/* ------------------------------------------------------------------ context menus: right click + long press */
let lastCtx = 0;
function openContext(area, x, y) {
  const now = Date.now(); if (now - lastCtx < 700) return; lastCtx = now;
  const target = $(area.getAttribute('data-ac-contextmenu'));
  if (!target) return;
  scan(target);
  emit(area, 'contextmenu:open', { x, y, menu: target });
  instance(target, 'dropdown')?.open({ x, y }, { trigger: area.matches('[tabindex], a, button') ? area : null });
}
on(document, 'contextmenu', '[data-ac-contextmenu]', (e, area) => { e.preventDefault(); openContext(area, e.clientX, e.clientY); });
on(document, 'keydown', (e) => {
  const area = e.target.closest?.('[data-ac-contextmenu]');
  if (area && (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10'))) {
    e.preventDefault(); const r = area.getBoundingClientRect(); openContext(area, r.left + r.width / 2, r.top + r.height / 2);
  }
});
let lp = null;
on(document, 'pointerdown', '[data-ac-contextmenu]', (e, area) => {
  if (e.pointerType === 'mouse') return;
  const sx = e.clientX; const sy = e.clientY;
  clearTimeout(lp?.t);
  lp = { area, sx, sy, t: setTimeout(() => {
    haptic(12); area.setAttribute('data-pressed', ''); setTimeout(() => area.removeAttribute('data-pressed'), 200);
    // swallow the click the browser synthesises when the finger lifts (it would hit the new menu)
    const until = Date.now() + 800;
    const eat = (ev) => { if (Date.now() < until) { ev.preventDefault(); ev.stopPropagation(); } document.removeEventListener('click', eat, true); };
    document.addEventListener('click', eat, true);
    setTimeout(() => document.removeEventListener('click', eat, true), 800);
    openContext(area, sx, sy); lp = null;
  }, 480) };
});
on(document, 'pointermove', (e) => { if (lp && Math.hypot(e.clientX - lp.sx, e.clientY - lp.sy) > 8) { clearTimeout(lp.t); lp = null; } }, { passive: true });
['pointerup', 'pointercancel', 'scroll'].forEach((t) => on(document, t, () => { if (lp) { clearTimeout(lp.t); lp = null; } }, { passive: true, capture: true }));

AC.menu = menu;
