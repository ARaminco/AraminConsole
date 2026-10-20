/* Combobox (searchable select, optional async loader), multi-select with chips, tag input.

   <div class="ac-combo" data-ac="combobox" [data-multiple] [data-loader="cities"] [data-placeholder="…"] [data-min-chars="1"]>
     <select name="city" [multiple]><option value="thr" data-meta="۰۲۱">تهران</option>…</select>
   </div>
   The <select> stays the source of truth (hidden), so FormData / validation see the value.
   Async: AC.combobox.loader('cities', async (query, { signal }) => [{ value, label, meta }])
   Events: ac:combobox:change { value, values, option }   API: AC.instance(el,'combobox').{value, values, set(v), clear(), open(), close()}

   <div class="ac-tags" data-ac="tags" data-name="skills" [data-value="a,b"] [data-max="8"] [data-placeholder="…"]></div>
   Events: ac:tags:change { values }   API: AC.instance(el,'tags').{values, add(t), remove(t), clear()} */
import { AC, register, on, emit, uid, icon, instance, options, h, escapeHtml, debounce } from '../core.js';
import { ft, latin, fire, popup, listKey } from './form-core.js';

const loaders = new Map();
export const combobox = {
  /** Register an async option source: fn(query, { signal }) → Promise<[{ value, label, meta? }]> */
  loader(name, fn) { loaders.set(name, fn); },
};
AC.combobox = combobox;

const norm = (s) => latin(String(s ?? '')).toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').trim();
function highlight(label, q) {
  if (!q) return escapeHtml(label);
  const i = norm(label).indexOf(q);
  if (i < 0) return escapeHtml(label);
  return `${escapeHtml(label.slice(0, i))}<mark>${escapeHtml(label.slice(i, i + q.length))}</mark>${escapeHtml(label.slice(i + q.length))}`;
}
function chip(label, value) {
  return h('span', { class: 'ac-chip ac-chip--input', 'data-value': value },
    h('span', { class: 'ac-truncate', text: label }),
    h('button', { type: 'button', class: 'ac-chip__remove', tabindex: '-1', 'aria-label': `${ft('remove')} ${label}`, html: icon('x') }));
}

/* ---------------------------------------------------------------- combobox */
register('combobox', (el) => {
  const o = options(el, { multiple: false, loader: '', placeholder: '', minChars: 0 });
  let select = el.querySelector('select');
  if (!select) { select = h('select', { name: o.name || '' }); el.append(select); }
  const multi = o.multiple || select.multiple;
  select.multiple = multi;
  select.hidden = true; select.tabIndex = -1;
  const listId = uid('cb');
  const control = h('div', { class: 'ac-input-group ac-combo__control' });
  const input = h('input', {
    class: 'ac-input ac-combo__input', type: 'text', role: 'combobox', autocomplete: 'off', 'aria-autocomplete': 'list',
    'aria-expanded': 'false', 'aria-controls': listId, placeholder: o.placeholder || select.getAttribute('placeholder') || '',
  });
  if (select.id) { input.id = select.id; select.removeAttribute('id'); }
  for (const a of ['aria-label', 'aria-labelledby', 'aria-describedby', 'data-ac-rules']) if (select.hasAttribute(a) && a !== 'data-ac-rules') input.setAttribute(a, select.getAttribute(a));
  if (select.disabled) input.disabled = true;
  const caret = h('span', { class: 'ac-combo__caret', 'aria-hidden': 'true', html: icon('chevron-down') });
  control.append(input, caret);
  const list = h('ul', { class: 'ac-combo__list', role: 'listbox', id: listId });
  if (multi) list.setAttribute('aria-multiselectable', 'true');
  const status = h('div', { class: 'ac-combo__status', role: 'status' });
  const panel = h('div', { class: 'ac-combo__pop' }, h('div', { class: 'ac-pop__scroll' }, list), status);
  el.prepend(control);
  el.append(panel);

  let items = []; let active = -1; let ctrl = null; let query = '';
  const pop = popup(control, panel, { onClose: () => { input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); el.removeAttribute('data-open'); } });
  const opts = () => Array.from(select.options).filter((x) => x.value !== '' || x.textContent.trim());
  const selected = () => Array.from(select.selectedOptions).filter((x) => x.value !== '');
  const findOpt = (v) => Array.from(select.options).find((x) => x.value === String(v));

  function renderChips() {
    if (!multi) return;
    control.querySelectorAll('.ac-chip').forEach((c) => c.remove());
    for (const opt of selected()) control.insertBefore(chip(opt.textContent, opt.value), input);
    input.placeholder = selected().length ? '' : (o.placeholder || '');
  }
  function syncInput() { if (!multi) input.value = selected()[0]?.textContent ?? ''; }

  function render(data, q) {
    items = data;
    const sel = new Set(selected().map((x) => x.value));
    let lastGroup = null;
    list.replaceChildren();
    data.forEach((it, i) => {
      if (it.group && it.group !== lastGroup) { lastGroup = it.group; list.append(h('li', { class: 'ac-combo__group', role: 'presentation', text: it.group })); }
      const li = h('li', { class: 'ac-combo__opt', role: 'option', id: `${listId}-${i}`, 'data-i': i, 'aria-selected': String(sel.has(it.value)), 'aria-disabled': it.disabled ? 'true' : null });
      li.innerHTML = `<span class="ac-combo__check">${icon('check')}</span><span class="ac-combo__label">${highlight(it.label, q)}</span>${it.meta ? `<span class="ac-combo__meta">${escapeHtml(it.meta)}</span>` : ''}`;
      list.append(li);
    });
    status.textContent = data.length ? '' : ft('noResults');
    status.hidden = !!data.length;
    setActive(data.length ? Math.max(0, data.findIndex((x) => sel.has(x.value))) : -1, false);
    pop.place();
  }
  function setActive(i, scroll = true) {
    active = i;
    list.querySelectorAll('[data-active]').forEach((n) => n.removeAttribute('data-active'));
    const li = list.querySelector(`[data-i="${i}"]`);
    if (li) { li.setAttribute('data-active', ''); input.setAttribute('aria-activedescendant', li.id); if (scroll) li.scrollIntoView({ block: 'nearest' }); }
    else input.removeAttribute('aria-activedescendant');
  }
  const local = (q) => opts().map((x) => ({ value: x.value, label: x.textContent.trim(), meta: x.dataset.meta, group: x.parentElement.tagName === 'OPTGROUP' ? x.parentElement.label : '', disabled: x.disabled }))
    .filter((x) => !q || norm(x.label).includes(q) || norm(x.meta).includes(q) || norm(x.value).includes(q));

  const runLoader = debounce(async (q) => {
    const fn = loaders.get(o.loader);
    if (!fn) { render(local(q), q); return; }
    ctrl?.abort(); ctrl = new AbortController();
    el.setAttribute('aria-busy', 'true'); status.hidden = false; status.textContent = ft('loading');
    try {
      const res = await fn(q, { signal: ctrl.signal });
      if (q !== query) return;
      render((res || []).map((r) => (typeof r === 'string' ? { value: r, label: r } : { ...r, value: String(r.value), label: r.label ?? String(r.value) })), q);
    } catch (err) { if (err.name !== 'AbortError') { status.textContent = ft('noResults'); console.warn('[AC] combobox loader', err); } }
    finally { el.removeAttribute('aria-busy'); }
  }, 220);

  function refresh() {
    query = norm(input.value);
    if (multi || input.value !== (selected()[0]?.textContent ?? '')) { /* filtering */ } else query = '';
    if (o.loader) {
      if (query.length < Number(o.minChars)) { render(local(query), query); return; }
      runLoader(query);
    } else render(local(query), query);
  }
  function open() {
    if (input.disabled || pop.isOpen) return;
    el.setAttribute('data-open', ''); input.setAttribute('aria-expanded', 'true');
    pop.open(); refresh();
  }
  function choose(i) {
    const it = items[i]; if (!it || it.disabled) return;
    let opt = findOpt(it.value);
    if (!opt) { opt = h('option', { value: it.value, text: it.label }); if (it.meta) opt.dataset.meta = it.meta; select.append(opt); }
    if (multi) { opt.selected = !opt.selected; input.value = ''; renderChips(); refresh(); input.focus(); }
    else { opt.selected = true; syncInput(); pop.close(); }
    changed(opt);
  }
  function changed(opt) {
    fire(select);
    el.removeAttribute('aria-invalid');
    emit(el, 'combobox:change', { value: select.value, values: selected().map((x) => x.value), option: opt });
  }
  function removeValue(v) {
    const opt = findOpt(v); if (!opt) return;
    opt.selected = false; renderChips(); changed(opt);
    if (pop.isOpen) refresh();
  }

  const offs = [
    on(input, 'focus', () => { if (!multi) input.select(); }),
    on(input, 'click', open),
    on(caret, 'click', () => { pop.isOpen ? pop.close() : (input.focus(), open()); }),
    on(control, 'click', (e) => { if (e.target === control) input.focus(); }),
    on(input, 'input', () => { if (!pop.isOpen) open(); else refresh(); }),
    on(input, 'keydown', (e) => {
      if (e.key === 'ArrowDown' && !pop.isOpen) { e.preventDefault(); open(); return; }
      const j = listKey(e, items.length, active);
      if (j != null && pop.isOpen) { e.preventDefault(); setActive(j); return; }
      if (e.key === 'Enter' && pop.isOpen && active > -1) { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape' && pop.isOpen) { e.preventDefault(); e.stopPropagation(); pop.close(); syncInput(); }
      else if (e.key === 'Backspace' && multi && !input.value) { const last = selected().pop(); if (last) removeValue(last.value); }
      else if (e.key === 'Tab' && pop.isOpen) { pop.close(); syncInput(); }
    }),
    on(input, 'blur', () => setTimeout(() => {
      if (el.contains(document.activeElement)) return;
      pop.close();
      if (!multi && !input.value && selected().length) { select.value = ''; Array.from(select.options).forEach((x) => { x.selected = false; }); changed(null); }
      syncInput();
      fire(select, ['blur']);
      select.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    }, 120)),
    on(list, 'pointerdown', (e) => e.preventDefault()),
    on(list, 'click', '.ac-combo__opt', (e, li) => choose(Number(li.dataset.i))),
    on(list, 'pointermove', '.ac-combo__opt', (e, li) => { const i = Number(li.dataset.i); if (i !== active) setActive(i, false); }),
    on(control, 'click', '.ac-chip__remove', (e, b) => { e.stopPropagation(); removeValue(b.closest('.ac-chip').dataset.value); input.focus(); }),
    on(select.form || document, 'reset', () => setTimeout(() => { renderChips(); syncInput(); })),
  ];
  renderChips(); syncInput();
  instance(el, 'combobox', {
    get value() { return select.value; },
    get values() { return selected().map((x) => x.value); },
    set(v) { const vals = [].concat(v).map(String); Array.from(select.options).forEach((x) => { x.selected = vals.includes(x.value); }); renderChips(); syncInput(); changed(null); },
    clear() { Array.from(select.options).forEach((x) => { x.selected = false; }); renderChips(); syncInput(); changed(null); },
    open, close: () => pop.close(), input,
  });
  return () => { ctrl?.abort(); offs.forEach((f) => f()); pop.destroy(); };
});

/* ---------------------------------------------------------------- tags */
register('tags', (el) => {
  const o = options(el, { name: '', value: '', max: 0, placeholder: '' });
  const hidden = h('input', { type: 'hidden', name: o.name });
  const input = h('input', { class: 'ac-input ac-tags__input', type: 'text', enterkeyhint: 'enter', autocomplete: 'off', placeholder: o.placeholder || ft('tagHint') });
  if (el.dataset.inputId) input.id = el.dataset.inputId;
  if (el.hasAttribute('aria-label')) input.setAttribute('aria-label', el.getAttribute('aria-label'));
  el.classList.add('ac-input-group');
  el.replaceChildren(input, hidden);
  let values = [];
  const sync = (silent) => {
    el.querySelectorAll('.ac-chip').forEach((c) => c.remove());
    for (const v of values) el.insertBefore(chip(v, v), input);
    hidden.value = values.join(',');
    input.placeholder = values.length ? '' : (o.placeholder || ft('tagHint'));
    input.disabled = o.max > 0 && values.length >= o.max;
    if (!silent) { fire(hidden); emit(el, 'tags:change', { values: [...values] }); }
  };
  const shake = (node) => node?.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 240 });
  function add(text) {
    const parts = String(text).split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
    let ok = false;
    for (const p of parts) {
      if (o.max > 0 && values.length >= o.max) break;
      if (values.some((v) => norm(v) === norm(p))) { shake(el.querySelector(`.ac-chip[data-value="${CSS.escape(values.find((v) => norm(v) === norm(p)))}"]`)); continue; }
      values.push(p); ok = true;
    }
    if (ok) sync();
    return ok;
  }
  function remove(v) { values = values.filter((x) => x !== v); sync(); input.disabled = false; input.focus(); }
  const offs = [
    on(input, 'keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ',' || e.key === '،') && input.value.trim()) { e.preventDefault(); add(input.value); input.value = ''; }
      else if (e.key === 'Enter') e.preventDefault();
      else if (e.key === 'Backspace' && !input.value && values.length) { values.pop(); sync(); }
    }),
    on(input, 'blur', () => { if (input.value.trim()) { add(input.value); input.value = ''; } }),
    on(input, 'paste', (e) => { const t = e.clipboardData.getData('text'); if (/[,،\n]/.test(t)) { e.preventDefault(); add(t); } }),
    on(el, 'click', '.ac-chip__remove', (e, b) => remove(b.closest('.ac-chip').dataset.value)),
    on(el, 'click', (e) => { if (e.target === el) input.focus(); }),
    on(document, 'ac:i18n:change', () => sync(true)),
  ];
  add(o.value || ''); hidden.value = values.join(',');
  instance(el, 'tags', { get values() { return [...values]; }, add, remove, clear() { values = []; sync(); }, input });
  return () => offs.forEach((f) => f());
});
