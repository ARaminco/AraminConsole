/* Command palette — Ctrl/⌘+K, fuzzy search, recents, keyboard nav.
   AC.palette.add([{ id, title, i18n?, hint?, group?, icon?, keywords?, shortcut?, href?, run?() }])
   AC.palette.remove(id) · AC.palette.open(query?) · AC.palette.close() · AC.palette.toggle()
   Any element with [data-ac-palette-open] opens it.
   Events: ac:palette:open, ac:palette:close, ac:palette:run { command } (cancelable) */
import { AC, on, emit, h, icon, escapeHtml, uid, trapFocus, scrollLock, store, i18n } from '../core.js';

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

export const palette = {
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
