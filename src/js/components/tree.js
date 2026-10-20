/* Tree view — WAI-ARIA tree with roving tabindex and full keyboard support.
   Markup: <ul class="ac-tree" data-ac="tree" aria-label="Files">
             <li data-icon="folder" data-open><span>src</span><ul><li data-meta="2 KB">index.js</li></ul></li></ul>
   or AC.tree(el, { items: [{ id, label, icon, meta, open, children: [...] }] }).
   Keys: ↑ ↓ Home End, → expand / first child, ← collapse / parent, Enter/Space select, letters jump.
   Events: ac:tree:select { id, item }, ac:tree:toggle { id, open }. */
import { AC, register, instance, on, emit, options, icon, escapeHtml as esc, isRTL } from '../core.js';

function parse(ul) {
  return Array.from(ul.children).filter((li) => li.tagName === 'LI').map((li, i) => {
    const sub = li.querySelector(':scope > ul');
    const lab = Array.from(li.childNodes).filter((n) => n !== sub).map((n) => n.textContent).join('').trim();
    return { id: li.dataset.id || `${lab}-${i}`, label: lab, icon: li.dataset.icon, meta: li.dataset.meta, open: li.hasAttribute('data-open'), children: sub ? parse(sub) : null };
  });
}

function create(el, cfg) {
  let items = cfg.items || parse(el);
  let sel = cfg.selected ?? null;
  const flat = new Map();
  const ico = (it) => it.icon || (it.children ? (it.open ? 'folder-open' : 'folder') : 'file');
  function li(it, lvl) {
    flat.set(String(it.id), it);
    const kids = it.children && it.children.length ? it.children : null;
    return `<li role="treeitem" class="ac-tree__item" data-id="${esc(it.id)}" aria-level="${lvl}"${kids ? ` aria-expanded="${!!it.open}"` : ''} aria-selected="${String(it.id) === String(sel)}" tabindex="-1"><div class="ac-tree__row">${kids ? icon('chevron-right', 'ac-tree__chev ac-flip-rtl') : '<span class="ac-tree__chev"></span>'}${icon(ico(it), 'ac-tree__icon')}<span class="ac-tree__label">${esc(it.label)}</span>${it.meta ? `<span class="ac-tree__meta">${esc(it.meta)}</span>` : ''}</div>${kids ? `<ul role="group">${kids.map((k) => li(k, lvl + 1)).join('')}</ul>` : ''}</li>`;
  }
  function render() {
    flat.clear();
    el.classList.add('ac-tree');
    el.setAttribute('role', 'tree');
    el.innerHTML = items.map((it) => li(it, 1)).join('');
    const first = el.querySelector('[aria-selected="true"]') || el.querySelector('[role="treeitem"]');
    if (first) first.tabIndex = 0;
  }
  const visible = () => Array.from(el.querySelectorAll('[role="treeitem"]')).filter((n) => !n.parentElement.closest('[aria-expanded="false"]'));
  const focus = (n) => { if (!n) return; el.querySelectorAll('[tabindex="0"]').forEach((x) => { x.tabIndex = -1; }); n.tabIndex = 0; n.focus(); };
  function toggle(n, open) {
    if (!n.hasAttribute('aria-expanded')) return;
    const it = flat.get(n.dataset.id); open = open ?? n.getAttribute('aria-expanded') !== 'true';
    it.open = open; n.setAttribute('aria-expanded', String(open));
    if (!it.icon) n.querySelector('.ac-tree__icon use')?.setAttribute('href', `#i-${ico(it)}`);
    emit(el, 'tree:toggle', { id: it.id, open });
  }
  function select(n) {
    el.querySelectorAll('[aria-selected="true"]').forEach((x) => x.setAttribute('aria-selected', 'false'));
    n.setAttribute('aria-selected', 'true'); sel = n.dataset.id;
    emit(el, 'tree:select', { id: sel, item: flat.get(sel) });
  }
  render();
  const offs = [
    on(el, 'click', '.ac-tree__row', (e, row) => { const n = row.parentElement; focus(n); select(n); toggle(n); }),
    on(el, 'keydown', (e) => {
      const n = e.target.closest('[role="treeitem"]'); if (!n) return;
      const v = visible(); const i = v.indexOf(n); const exp = n.getAttribute('aria-expanded');
      const right = isRTL(el) ? 'ArrowLeft' : 'ArrowRight'; const left = isRTL(el) ? 'ArrowRight' : 'ArrowLeft';
      let handled = true;
      if (e.key === 'ArrowDown') focus(v[i + 1]);
      else if (e.key === 'ArrowUp') focus(v[i - 1]);
      else if (e.key === 'Home') focus(v[0]);
      else if (e.key === 'End') focus(v[v.length - 1]);
      else if (e.key === right) { if (exp === 'false') toggle(n, true); else if (exp === 'true') focus(n.querySelector('[role="treeitem"]')); }
      else if (e.key === left) { if (exp === 'true') toggle(n, false); else focus(n.parentElement.closest('[role="treeitem"]')); }
      else if (e.key === 'Enter' || e.key === ' ') { select(n); if (e.key === 'Enter') toggle(n); }
      else if (e.key.length === 1 && /\S/.test(e.key)) { const k = e.key.toLowerCase(); focus(v.slice(i + 1).concat(v.slice(0, i)).find((x) => x.querySelector('.ac-tree__label').textContent.trim().toLowerCase().startsWith(k))); }
      else handled = false;
      if (handled) e.preventDefault();
    }),
  ];
  return {
    el, render, get selected() { return sel; },
    setItems(next) { items = next; render(); },
    expandAll(open = true) { el.querySelectorAll('[aria-expanded]').forEach((n) => toggle(n, open)); },
    destroy() { offs.forEach((f) => f()); },
  };
}

register('tree', (el) => {
  const api = create(el, options(el, {}));
  instance(el, 'tree', api);
  return () => api.destroy();
});
export function tree(target, cfg = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  instance(el, 'tree')?.destroy();
  return instance(el, 'tree', create(el, cfg));
}
AC.tree = tree;
