/* Data table — sort (shift = multi), search, column filters, pagination, selection + bulk bar,
   column visibility, density, row expansion, row actions, CSV export, skeleton/empty states;
   phones (<640px) render cards with swipe actions. Progressive enhancement of an inner <table>.
   <div data-ac="table" data-ac-config='{"pageSize":5}'><table>…</table></div>   or   AC.table(el, { columns, rows, … })
   Events: ac:table:sort|search|filter|page|select|expand|action|bulk|export. Docs: docs/data.md */
import { AC, register, instance, on, emit, options, format, i18n, icon, escapeHtml, debounce, store, uid } from '../core.js';
import { swipeable } from './list.js';

const esc = escapeHtml;
const T = (k, f, v) => AC.t(`table.${k}`, f, v);
const phoneMQ = matchMedia('(max-width: 639.98px)');
const NUMERIC = { number: 1, money: 1, progress: 1, date: 1 };
const btn = (attrs, inner, cls = 'ac-btn ac-btn--sm') => `<button type="button" class="${cls}" ${attrs}>${inner}</button>`;

function fromMarkup(el) {
  const t = el.querySelector('table');
  if (!t) return {};
  const ths = Array.from(t.tHead?.rows[0]?.cells || []);
  const columns = ths.map((th, i) => ({
    key: `c${i}`, label: th.textContent.trim(), i18n: th.dataset.i18n, type: th.dataset.type || 'html',
    align: th.classList.contains('ac-num') || th.dataset.align === 'end' ? 'end' : undefined,
    sortable: th.dataset.sortable !== 'false', primary: th.hasAttribute('data-primary'), filter: th.dataset.filter,
  }));
  const rows = Array.from(t.tBodies[0]?.rows || []).map((tr, r) => {
    const o = { id: tr.dataset.id ?? String(r), _html: {} };
    Array.from(tr.cells).forEach((td, i) => { o._html[`c${i}`] = td.innerHTML; o[`c${i}`] = td.dataset.value ?? td.textContent.trim().replace(/\s+/g, ' '); });
    return o;
  });
  return { columns, rows };
}

const sortKey = (v) => {
  if (v == null || v === '') return null;
  if (typeof v === 'number' || v instanceof Date) return +v;
  const s = String(v);
  if (/^\d{4}-\d\d-\d\d/.test(s)) return Date.parse(s);
  if (/^[^\p{L}]*\d[^\p{L}]*$/u.test(s)) { const n = Number(s.replace(/[^\d.-]/g, '')); if (!isNaN(n)) return n; }
  return s;
};

function create(el, cfg) {
  const md = cfg.columns ? {} : fromMarkup(el);
  let c = { pageSize: 10, pageSizes: [10, 25, 50, 100], search: true, toolbar: true, density: true, exportable: true, columnsMenu: true, pagination: true, ...md, ...cfg };
  const id = el.id || uid('dt');
  const saved = c.id ? store.get(`ac:table:${c.id}`, {}) : {};
  const st = { q: '', sort: c.sort ? [].concat(c.sort) : [], filters: {}, page: 1, size: saved.size || c.pageSize, sel: new Set(), exp: new Set(), hide: new Set(saved.hide || []), compact: saved.compact ?? c.compact ?? false, loading: !!c.loading, filtersOpen: false };
  let cols = []; let rows = []; let view = []; let swipes = [];
  const collator = () => new Intl.Collator(i18n.locale, { numeric: true, sensitivity: 'base' });

  const setCols = (list) => { cols = list.map((x, i) => ({ sortable: true, ...x, key: x.key ?? `c${i}` })); cols.forEach((x) => { if (x.hidden && !saved.hide) st.hide.add(x.key); }); };
  setCols(c.columns || []);
  rows = (c.rows || []).slice();
  const rid = (r, i) => String(c.rowId ? r[c.rowId] : r.id ?? i);
  const label = (x) => (x.i18n ? AC.t(x.i18n, x.label ?? x.key) : x.label ?? x.key);
  const val = (x, r) => (x.value ? x.value(r) : r[x.key]);
  const badge = (x, v) => { const b = x.badges?.[v] || {}; return { tone: b.tone || 'neutral', text: b.i18n ? AC.t(b.i18n, b.label ?? v) : b.label ?? v }; };
  function text(x, r) {
    const v = val(x, r);
    if (x.text) return x.text(r, v);
    if (v == null || v === '') return '';
    switch (x.type) {
      case 'money': { const cur = x.currency || r.currency || 'USD'; return AC.money && (/^IR[RT]$/.test(cur) || !/^[A-Z]{3}$/.test(cur)) ? AC.money.format(v, { from: cur, currency: /^IR[RT]$/.test(cur) ? AC.money.unit : cur, compact: x.compact }) : format.number(v, { currency: cur, decimals: x.decimals }); } // IRR/IRT follow the page Rial/Toman unit
      case 'number': return format.number(v, { decimals: x.decimals, compact: x.compact });
      case 'date': return format.date(v, x.dateOptions || { dateStyle: x.dateStyle || 'medium' });
      case 'badge': return String(badge(x, v).text);
      case 'progress': return format.number(v / 100, { percent: true });
      case 'avatar': return `${v}${x.sub ? ` ${r[x.sub] ?? ''}` : ''}`;
      default: return String(v);
    }
  }
  function html(x, r) {
    const v = val(x, r);
    if (x.render) { const o = x.render(r, v); return o instanceof Node ? o.outerHTML : o ?? ''; }
    if (r._html && x.key in r._html) return r._html[x.key];
    if (v == null || v === '') return '<span class="ac-dt__nil">—</span>';
    switch (x.type) {
      case 'badge': { const b = badge(x, v); return `<span class="ac-badge ac-badge--${esc(b.tone)} ac-badge--dot">${esc(b.text)}</span>`; }
      case 'avatar': {
        const img = x.image && r[x.image] ? `<img src="${esc(r[x.image])}" alt="">` : esc(r[x.initials || 'initials'] ?? String(v).slice(0, 2));
        return `<div class="ac-table__cell-main"><span class="ac-avatar ac-avatar--sm" data-color="${esc(r[x.color || 'color'] ?? 1)}">${img}</span><div><strong class="ac-truncate">${esc(v)}</strong>${x.sub ? `<small class="ac-truncate">${esc(r[x.sub] ?? '')}</small>` : ''}</div></div>`;
      }
      case 'progress': return `<span class="ac-dt__prog"><progress class="ac-progress ac-progress--sm${v >= 100 ? ' ac-progress--success' : v < 40 ? ' ac-progress--warning' : ''}" value="${+v}" max="100"></progress><span>${esc(text(x, r))}</span></span>`;
      case 'money': { const cur = x.currency || r.currency || 'USD'; if (AC.money && /^IR[RT]$/.test(cur)) return `<bdi class="ac-num" data-ac-money="${+v}" data-currency="${esc(cur)}"${x.compact ? ' data-compact' : ''}>${esc(text(x, r))}</bdi>`; } // falls through
      case 'number': return `<span class="ac-ltr">${esc(text(x, r))}</span>`;
      default: return esc(text(x, r));
    }
  }

  function compute() {
    let out = rows.map((r, i) => ({ r, id: rid(r, i) }));
    for (const [k, fv] of Object.entries(st.filters)) {
      if (fv === '' || fv == null) continue;
      const x = cols.find((y) => y.key === k); if (!x) continue;
      const q = String(fv).toLowerCase();
      out = out.filter(({ r }) => (x.filter === 'select' ? String(val(x, r)) === String(fv) : text(x, r).toLowerCase().includes(q)));
    }
    if (st.q) {
      const qs = st.q.toLowerCase().split(/\s+/).filter(Boolean);
      const vis = cols.filter((x) => x.searchable !== false);
      out = out.filter(({ r }) => { const hay = vis.map((x) => `${text(x, r)} ${x.type === 'badge' ? val(x, r) : ''}`).join(' ').toLowerCase(); return qs.every((q) => hay.includes(q)); });
    }
    if (st.sort.length) {
      const col = collator();
      const keys = st.sort.map((s) => ({ ...s, x: cols.find((y) => y.key === s.key) })).filter((s) => s.x);
      out = out.map((o) => ({ ...o, k: keys.map((s) => sortKey(s.x.sortValue ? s.x.sortValue(o.r) : val(s.x, o.r))) }));
      out.sort((a, b) => {
        for (let i = 0; i < keys.length; i++) {
          const p = a.k[i]; const q = b.k[i]; const d = keys[i].dir === 'desc' ? -1 : 1;
          if (p === q) continue; if (p == null) return 1; if (q == null) return -1;
          const r = typeof p === 'number' && typeof q === 'number' ? p - q : col.compare(String(p), String(q));
          if (r) return r * d;
        }
        return 0;
      });
    }
    view = out;
  }
  const visCols = () => cols.filter((x) => !st.hide.has(x.key));
  const pages = () => (c.pagination === false ? 1 : Math.max(1, Math.ceil(view.length / st.size)));
  const pageRows = () => { if (c.pagination === false) return view; st.page = Math.min(st.page, pages()); return view.slice((st.page - 1) * st.size, st.page * st.size); };
  const persist = () => { if (c.id) store.set(`ac:table:${c.id}`, { hide: [...st.hide], size: st.size, compact: st.compact }); };

  /* ---------------- shell */
  el.classList.add('ac-dt');
  el.textContent = '';
  const filterCols = () => cols.filter((x) => x.filter);
  const head = document.createElement('div'); head.className = 'ac-dt__head';
  const bulk = document.createElement('div'); bulk.className = 'ac-dt__bulk'; bulk.hidden = true; bulk.setAttribute('role', 'region');
  const body = document.createElement('div'); body.className = 'ac-dt__body';
  const foot = document.createElement('div'); foot.className = 'ac-dt__foot';
  const live = document.createElement('div'); live.className = 'ac-visually-hidden'; live.setAttribute('aria-live', 'polite');
  el.append(head, bulk, body, foot, live);

  function renderHead() {
    if (c.toolbar === false) { head.hidden = true; return; }
    const fc = filterCols(); const nf = Object.values(st.filters).filter((v) => v !== '' && v != null).length;
    head.innerHTML = `<div class="ac-dt__bar">
${c.search !== false ? `<label class="ac-dt__search">${icon('search')}<input type="search" data-dt="search" value="${esc(st.q)}" placeholder="${esc(T('search', 'Search…'))}" aria-label="${esc(T('search', 'Search…'))}" aria-controls="${id}-body" autocomplete="off"></label>` : '<span class="ac-grow"></span>'}
<div class="ac-dt__tools">
${c.tools || ''}
${fc.length ? btn(`data-dt="filters" aria-expanded="${st.filtersOpen}" aria-controls="${id}-filters"`, `${icon('list-filter')}<span class="ac-hide-phone">${esc(T('filters', 'Filters'))}</span>${nf ? `<span class="ac-count">${nf}</span>` : ''}`) : ''}
${c.columnsMenu !== false ? `<div class="ac-dt__menu">${btn(`data-dt="cols" aria-expanded="false" aria-haspopup="true" aria-label="${esc(T('columns', 'Columns'))}"`, `${icon('columns-3')}<span class="ac-hide-phone">${esc(T('columns', 'Columns'))}</span>`)}<div class="ac-dt__pop" hidden role="group" aria-label="${esc(T('columns', 'Columns'))}">${cols.filter((x) => x.hideable !== false).map((x) => `<label class="ac-dt__opt"><input type="checkbox" data-dt="col" value="${esc(x.key)}"${st.hide.has(x.key) ? '' : ' checked'}>${esc(label(x))}</label>`).join('')}</div></div>` : ''}
${c.density !== false ? btn(`data-dt="density" aria-pressed="${st.compact}" aria-label="${esc(T('density', 'Compact rows'))}" title="${esc(T('density', 'Compact rows'))}"`, icon(st.compact ? 'rows-3' : 'rows-2'), 'ac-btn ac-btn--sm ac-btn--icon ac-hide-phone') : ''}
${c.exportable !== false ? btn(`data-dt="export" aria-label="${esc(T('export', 'Export CSV'))}"`, `${icon('download')}<span class="ac-hide-phone">${esc(T('csv', 'CSV'))}</span>`) : ''}
</div></div>
${fc.length ? `<div class="ac-dt__filters" id="${id}-filters"${st.filtersOpen ? '' : ' hidden'}>${fc.map((x) => {
    const v = st.filters[x.key] ?? '';
    if (x.filter === 'select') {
      const opts = x.options || [...new Set(rows.map((r) => val(x, r)))].filter((o) => o != null && o !== '').sort().map((o) => ({ value: o, label: x.type === 'badge' ? badge(x, o).text : o }));
      return `<label class="ac-dt__field"><span>${esc(label(x))}</span><select class="ac-dt__select" data-dt="filter" data-key="${esc(x.key)}"><option value="">${esc(T('all', 'All'))}</option>${opts.map((o) => { const ov = o.value ?? o; return `<option value="${esc(ov)}"${String(ov) === String(v) ? ' selected' : ''}>${esc(o.i18n ? AC.t(o.i18n, o.label) : o.label ?? ov)}</option>`; }).join('')}</select></label>`;
    }
    return `<label class="ac-dt__field"><span>${esc(label(x))}</span><input class="ac-dt__select" type="search" data-dt="filter" data-key="${esc(x.key)}" value="${esc(v)}"></label>`;
  }).join('')}${btn(`data-dt="reset"${nf ? '' : ' disabled'}`, `${icon('x')}${esc(T('reset', 'Reset'))}`, 'ac-btn ac-btn--sm ac-btn--ghost ac-dt__reset')}</div>` : ''}`;
  }

  function renderBulk() {
    const n = st.sel.size;
    bulk.hidden = !n;
    if (!n) { bulk.textContent = ''; return; }
    bulk.innerHTML = `${btn(`data-dt="clear" aria-label="${esc(T('clear', 'Clear selection'))}"`, icon('x'), 'ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost')}<strong class="ac-dt__count">${esc(T('selected', '{n} selected', { n: format.number(n) }))}</strong><span class="ac-grow"></span>${(c.bulkActions || []).map((a) => btn(`data-dt="bulk" data-action="${esc(a.id)}"${a.icon ? ` aria-label="${esc(a.i18n ? AC.t(a.i18n, a.label) : a.label)}"` : ''}`, `${a.icon ? icon(a.icon) : ''}<span class="${a.icon ? 'ac-hide-phone' : ''}">${esc(a.i18n ? AC.t(a.i18n, a.label) : a.label)}</span>`, `ac-btn ac-btn--sm ${a.tone === 'danger' ? 'ac-btn--danger-soft' : 'ac-btn--soft'}`)).join('')}`;
  }

  const actionBtns = (r, rowId, cls) => (c.actions || []).filter((a) => !a.when || a.when(r)).map((a) => {
    const l = a.i18n ? AC.t(a.i18n, a.label) : a.label;
    return `<button type="button" class="${cls}" data-dt="action" data-action="${esc(a.id)}" data-id="${esc(rowId)}" data-tone="${esc(a.tone || 'neutral')}" aria-label="${esc(l)}" title="${esc(l)}">${a.icon ? icon(a.icon) : ''}<span>${esc(l)}</span></button>`;
  }).join('');

  function renderBody() {
    swipes.forEach((d) => d()); swipes = [];
    const fk = document.activeElement && el.contains(document.activeElement) ? document.activeElement.dataset.fk : null;
    const vc = visCols(); const pr = pageRows(); const phone = phoneMQ.matches && c.cards !== false;
    const sel = !!c.selectable; const exp = typeof c.expand === 'function'; const acts = !!c.actions?.length;
    const allOn = pr.length && pr.every((o) => st.sel.has(o.id)); const someOn = pr.some((o) => st.sel.has(o.id));
    el.toggleAttribute('data-compact', !!st.compact);
    body.setAttribute('aria-busy', String(st.loading));
    const emptyHtml = `<div class="ac-empty ac-empty--sm"><div class="ac-empty__art">${icon(c.emptyIcon || 'search')}</div><div class="ac-empty__title">${esc(c.emptyTitle || T('empty', 'Nothing found'))}</div><p class="ac-empty__text">${esc(c.emptyText || T('emptyText', 'Try a different search or clear the filters.'))}</p>${st.q || Object.values(st.filters).some((v) => v) ? `<div class="ac-empty__actions">${btn('data-dt="reset-all"', esc(T('clearAll', 'Clear search & filters')))}</div>` : ''}</div>`;
    if (phone) {
      const primary = vc.find((x) => x.primary) || vc[0]; const bcol = vc.find((x) => x.type === 'badge' && x !== primary);
      const rest = vc.filter((x) => x !== primary && x !== bcol && x.mobile !== false);
      if (st.loading) { body.innerHTML = `<ul class="ac-dt__cards" role="list">${Array.from({ length: Math.min(st.size, 5) }, () => '<li class="ac-dt__card"><div class="ac-dt__card-in"><div class="ac-cluster"><span class="ac-skeleton ac-skeleton--circle"></span><span class="ac-skeleton ac-skeleton--text ac-skeleton--w-50"></span></div><span class="ac-skeleton ac-skeleton--text"></span><span class="ac-skeleton ac-skeleton--text ac-skeleton--w-75"></span></div></li>').join('')}</ul>`; return; }
      if (!pr.length) { body.innerHTML = emptyHtml; return; }
      body.innerHTML = `${sel ? `<label class="ac-dt__selall"><input type="checkbox" class="ac-dt__cb" data-dt="all" data-fk="all"${allOn ? ' checked' : ''}>${esc(T('selectAll', 'Select all'))}</label>` : ''}<ul class="ac-dt__cards" role="list" id="${id}-body">${pr.map(({ r, id: k }) => `<li class="ac-dt__card${acts ? ' ac-swipe' : ''}" data-id="${esc(k)}"${st.sel.has(k) ? ' data-selected' : ''}>${acts ? `<div class="ac-swipe__actions">${actionBtns(r, k, 'ac-swipe__btn')}</div>` : ''}<div class="ac-dt__card-in${acts ? ' ac-swipe__content' : ''}">
<div class="ac-dt__card-head">${sel ? `<input type="checkbox" class="ac-dt__cb" data-dt="sel" data-id="${esc(k)}" data-fk="s${esc(k)}" aria-label="${esc(T('selectRow', 'Select row'))}"${st.sel.has(k) ? ' checked' : ''}>` : ''}<div class="ac-dt__card-main">${html(primary, r)}</div>${bcol ? `<div class="ac-dt__card-end">${html(bcol, r)}</div>` : ''}</div>
${rest.length ? `<dl class="ac-dt__kv">${rest.map((x) => `<div><dt>${esc(label(x))}</dt><dd${x.align === 'end' || NUMERIC[x.type] ? ' class="ac-num"' : ''}>${html(x, r)}</dd></div>`).join('')}</dl>` : ''}
${exp ? `<button type="button" class="ac-dt__more" data-dt="expand" data-id="${esc(k)}" data-fk="e${esc(k)}" aria-expanded="${st.exp.has(k)}">${icon('chevron-down')}<span>${esc(T(st.exp.has(k) ? 'less' : 'more', st.exp.has(k) ? 'Less' : 'Details'))}</span></button>${st.exp.has(k) ? `<div class="ac-dt__detail-in">${c.expand(r)}</div>` : ''}` : ''}</div></li>`).join('')}</ul>`;
      if (acts) body.querySelectorAll('.ac-swipe').forEach((it) => swipes.push(swipeable(it)));
    } else {
      const span = vc.length + sel + exp + acts;
      const th = vc.map((x) => {
        const si = st.sort.findIndex((s) => s.key === x.key); const s = st.sort[si];
        const aria = s ? (s.dir === 'desc' ? 'descending' : 'ascending') : 'none';
        const inner = `<span>${esc(label(x))}</span>`;
        return `<th scope="col"${x.sortable ? ` aria-sort="${aria}"` : ''}${x.align === 'end' || NUMERIC[x.type] && x.type !== 'date' ? ' data-align="end"' : ''}${x.width ? ` data-w="${esc(x.width)}"` : ''}>${x.sortable ? `<button type="button" class="ac-dt__sort" data-dt="sort" data-key="${esc(x.key)}" data-fk="h${esc(x.key)}">${inner}${icon(s ? (s.dir === 'desc' ? 'arrow-down' : 'arrow-up') : 'arrow-up-down', 'ac-dt__arrow')}${s && st.sort.length > 1 ? `<sup>${si + 1}</sup>` : ''}</button>` : inner}</th>`;
      }).join('');
      let tb;
      if (st.loading) tb = Array.from({ length: Math.min(st.size, 8) }, () => `<tr>${'<td><span class="ac-skeleton ac-skeleton--text"></span></td>'.repeat(span)}</tr>`).join('');
      else if (!pr.length) tb = `<tr class="ac-dt__empty"><td colspan="${span}">${emptyHtml}</td></tr>`;
      else tb = pr.map(({ r, id: k }) => `<tr data-id="${esc(k)}"${st.sel.has(k) ? ' data-selected' : ''}${st.exp.has(k) ? ' data-expanded' : ''}>${sel ? `<td class="ac-dt__check"><input type="checkbox" class="ac-dt__cb" data-dt="sel" data-id="${esc(k)}" data-fk="s${esc(k)}" aria-label="${esc(T('selectRow', 'Select row'))}"${st.sel.has(k) ? ' checked' : ''}></td>` : ''}${exp ? `<td class="ac-dt__x"><button type="button" class="ac-dt__xbtn" data-dt="expand" data-id="${esc(k)}" data-fk="e${esc(k)}" aria-expanded="${st.exp.has(k)}" aria-label="${esc(T('expand', 'Show details'))}">${icon('chevron-right', 'ac-flip-rtl')}</button></td>` : ''}${vc.map((x) => `<td${x.align === 'end' || NUMERIC[x.type] && x.type !== 'date' ? ' data-align="end"' : ''}${x.type ? ` data-type="${esc(x.type)}"` : ''}>${html(x, r)}</td>`).join('')}${acts ? `<td class="ac-dt__act"><div class="ac-dt__actions">${actionBtns(r, k, 'ac-btn ac-btn--ghost ac-btn--icon ac-btn--sm')}</div></td>` : ''}</tr>${exp && st.exp.has(k) ? `<tr class="ac-dt__detail"><td colspan="${span}"><div class="ac-dt__detail-in">${c.expand(r)}</div></td></tr>` : ''}`).join('');
      body.innerHTML = `<div class="ac-table-wrap ac-dt__scroll"${c.maxHeight ? ' data-scroll' : ''}><table class="ac-table ac-dt__table" id="${id}-body">${c.caption ? `<caption class="ac-visually-hidden">${esc(c.caption)}</caption>` : ''}<thead><tr>${sel ? `<th class="ac-dt__check"><input type="checkbox" class="ac-dt__cb" data-dt="all" data-fk="all" aria-label="${esc(T('selectAll', 'Select all'))}"${allOn ? ' checked' : ''}></th>` : ''}${exp ? '<th class="ac-dt__x"></th>' : ''}${th}${acts ? `<th class="ac-dt__act"><span class="ac-visually-hidden">${esc(T('actions', 'Actions'))}</span></th>` : ''}</tr></thead><tbody>${tb}</tbody></table></div>`;
      if (c.maxHeight) body.firstElementChild.style.setProperty('--ac-dt-max', typeof c.maxHeight === 'number' ? `${c.maxHeight}px` : c.maxHeight);
    }
    const all = body.querySelector('[data-dt="all"]');
    if (all) all.indeterminate = !allOn && someOn;
    if (fk) body.querySelector(`[data-fk="${CSS.escape(fk)}"]`)?.focus({ preventScroll: true });
  }

  function renderFoot() {
    if (c.pagination === false && c.info === false) { foot.hidden = true; return; }
    const n = view.length; const p = pages(); const cur = st.page;
    const from = n ? (cur - 1) * st.size + 1 : 0; const to = c.pagination === false ? n : Math.min(n, cur * st.size);
    const info = `<span class="ac-dt__info">${esc(T('range', '{from}–{to} of {total}', { from: format.number(from), to: format.number(to), total: format.number(n) }))}</span>`;
    if (c.pagination === false) { foot.innerHTML = info; return; }
    const list = []; const win = phoneMQ.matches ? 0 : 1;
    for (let i = 1; i <= p; i++) if (i === 1 || i === p || Math.abs(i - cur) <= win) list.push(i); else if (list[list.length - 1] !== '…') list.push('…');
    const pb = (attrs, inner, dis) => `<li><button type="button" class="ac-pagination__btn" ${attrs}${dis ? ' disabled' : ''}>${inner}</button></li>`;
    foot.innerHTML = `${info}<div class="ac-dt__pager">${c.pageSizes ? `<label class="ac-dt__size"><span class="ac-hide-phone">${esc(T('rows', 'Rows'))}</span><select class="ac-dt__select" data-dt="size" aria-label="${esc(T('rows', 'Rows per page'))}">${c.pageSizes.map((s) => `<option value="${s}"${s === st.size ? ' selected' : ''}>${format.number(s)}</option>`).join('')}</select></label>` : ''}<nav aria-label="${esc(T('pages', 'Pagination'))}"><ul class="ac-pagination__list">${pb(`data-dt="page" data-page="${cur - 1}" data-fk="prev" aria-label="${esc(T('prev', 'Previous page'))}"`, icon('chevron-left', 'ac-flip-rtl'), cur <= 1)}${list.map((i) => (i === '…' ? '<li class="ac-dt__gap" aria-hidden="true">…</li>' : pb(`data-dt="page" data-page="${i}" data-fk="p${i}"${i === cur ? ' aria-current="page"' : ''}`, format.number(i)))).join('')}${pb(`data-dt="page" data-page="${cur + 1}" data-fk="next" aria-label="${esc(T('next', 'Next page'))}"`, icon('chevron-right', 'ac-flip-rtl'), cur >= p)}</ul></nav></div>`;
  }

  function render(all = true) {
    compute();
    if (all) renderHead();
    renderBulk(); renderBody(); renderFoot();
  }
  const announce = () => { live.textContent = T('range', '{from}–{to} of {total}', { from: view.length ? (st.page - 1) * st.size + 1 : 0, to: Math.min(view.length, st.page * st.size), total: view.length }); };

  function selectedRows() { return rows.filter((r, i) => st.sel.has(rid(r, i))); }
  function setSel(ids, on) { ids.forEach((k) => (on ? st.sel.add(k) : st.sel.delete(k))); emit(el, 'table:select', { ids: [...st.sel], rows: selectedRows() }); render(false); }
  function sortBy(key, multi) {
    const i = st.sort.findIndex((s) => s.key === key); const cur = st.sort[i];
    const next = !cur ? 'asc' : cur.dir === 'asc' ? 'desc' : null;
    if (multi) { if (i > -1) st.sort.splice(i, 1); if (next) st.sort.push({ key, dir: next }); }
    else st.sort = next ? [{ key, dir: next }] : [];
    emit(el, 'table:sort', { sort: st.sort.slice() });
    render(false);
  }
  function toCSV() {
    const vc = visCols().filter((x) => x.csv !== false);
    const list = st.sel.size ? view.filter((o) => st.sel.has(o.id)) : view;
    const q = (s) => { s = String(s ?? ''); return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    return [vc.map((x) => q(label(x))).join(','), ...list.map(({ r }) => vc.map((x) => q(typeof x.csv === 'function' ? x.csv(r) : text(x, r))).join(','))].join('\r\n');
  }
  function exportCSV(name = c.exportName || 'export') {
    const csv = toCSV();
    if (!emit(el, 'table:export', { csv, name }).defaultPrevented) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
      a.download = `${name}.csv`; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
    return csv;
  }
  const closePop = () => { const b = head.querySelector('[data-dt="cols"]'); if (b) { b.setAttribute('aria-expanded', 'false'); b.nextElementSibling.hidden = true; } };

  const onSearch = debounce((v) => { st.q = v.trim(); st.page = 1; emit(el, 'table:search', { query: st.q }); render(false); announce(); }, 160);
  const offs = [
    on(el, 'input', '[data-dt="search"]', (e, t) => onSearch(t.value)),
    on(el, 'input', 'input[data-dt="filter"]', debounce((e) => { st.filters[e.target.dataset.key] = e.target.value; st.page = 1; emit(el, 'table:filter', { filters: { ...st.filters } }); render(false); announce(); }, 200)),
    on(el, 'change', (e) => {
      const t = e.target; const k = t.dataset?.dt;
      if (k === 'filter' && t.tagName === 'SELECT') { st.filters[t.dataset.key] = t.value; st.page = 1; emit(el, 'table:filter', { filters: { ...st.filters } }); render(); head.querySelector(`[data-key="${CSS.escape(t.dataset.key)}"]`)?.focus(); announce(); }
      else if (k === 'size') { st.size = Number(t.value); st.page = 1; persist(); render(false); el.querySelector('[data-dt="size"]')?.focus(); }
      else if (k === 'col') { t.checked ? st.hide.delete(t.value) : st.hide.add(t.value); persist(); render(false); }
      else if (k === 'sel') setSel([t.dataset.id], t.checked);
      else if (k === 'all') setSel(pageRows().map((o) => o.id), t.checked);
    }),
    on(el, 'click', '[data-dt]', (e, b) => {
      const k = b.dataset.dt;
      if (k === 'sort') sortBy(b.dataset.key, e.shiftKey);
      else if (k === 'page') { st.page = Math.max(1, Math.min(pages(), Number(b.dataset.page))); emit(el, 'table:page', { page: st.page }); render(false); announce(); if (!el.contains(document.activeElement) || document.activeElement === document.body) foot.querySelector('[aria-current]')?.focus(); }
      else if (k === 'expand') { const id2 = b.dataset.id; const o = !st.exp.has(id2); o ? st.exp.add(id2) : st.exp.delete(id2); emit(el, 'table:expand', { id: id2, open: o }); render(false); }
      else if (k === 'action') { const r = view.find((x) => x.id === b.dataset.id)?.r; emit(el, 'table:action', { action: b.dataset.action, id: b.dataset.id, row: r }); }
      else if (k === 'bulk') emit(el, 'table:bulk', { action: b.dataset.action, ids: [...st.sel], rows: selectedRows() });
      else if (k === 'clear') setSel([...st.sel], false);
      else if (k === 'filters') { st.filtersOpen = !st.filtersOpen; renderHead(); head.querySelector('[data-dt="filters"]')?.focus(); }
      else if (k === 'reset' || k === 'reset-all') { st.filters = {}; if (k === 'reset-all') st.q = ''; st.page = 1; render(); }
      else if (k === 'density') { st.compact = !st.compact; persist(); renderHead(); renderBody(); head.querySelector('[data-dt="density"]')?.focus(); }
      else if (k === 'export') exportCSV();
      else if (k === 'cols') { const pop = b.nextElementSibling; const o = pop.hidden; pop.hidden = !o; b.setAttribute('aria-expanded', String(o)); if (o) pop.querySelector('input')?.focus(); }
    }),
    on(el, 'ac:swipe:action', (e) => { e.stopPropagation(); const k = e.detail.item.dataset.id; emit(el, 'table:action', { action: e.detail.action, id: k, row: view.find((x) => x.id === k)?.r }); }),
    on(document, 'click', (e) => { if (!e.target.closest?.('.ac-dt__menu') || !el.contains(e.target)) closePop(); }),
    on(el, 'keydown', (e) => { if (e.key === 'Escape' && e.target.closest('.ac-dt__menu')) { closePop(); head.querySelector('[data-dt="cols"]')?.focus(); } }),
    on(document, 'ac:i18n:change', () => render()),
    on(phoneMQ, 'change', () => render(false)),
  ];
  render();

  const api = {
    el,
    get rows() { return rows; }, get view() { return view.map((o) => o.r); }, get state() { return { ...st, sel: [...st.sel] }; },
    setRows(r) { rows = r.slice(); st.loading = false; const ids = new Set(rows.map(rid)); st.sel.forEach((k) => { if (!ids.has(k)) st.sel.delete(k); }); render(); return api; },
    setColumns(list) { setCols(list); render(); return api; },
    setLoading(v = true) { st.loading = !!v; render(false); return api; },
    search(q) { st.q = String(q ?? ''); st.page = 1; render(); return api; },
    filter(key, v) { st.filters[key] = v; st.page = 1; render(); return api; },
    sort(key, dir = 'asc') { st.sort = key ? [{ key, dir }] : []; render(false); return api; },
    page(n) { st.page = n; render(false); return api; },
    select(ids, v = true) { setSel([].concat(ids).map(String), v); return api; },
    selected: selectedRows, clearSelection() { setSel([...st.sel], false); return api; },
    toCSV, exportCSV, refresh: render,
    destroy() { offs.forEach((f) => f()); swipes.forEach((d) => d()); },
  };
  return api;
}

register('table', (el) => {
  const api = create(el, options(el, {}));
  instance(el, 'table', api);
  return () => api.destroy();
});

/** AC.table(el|selector, { columns, rows, … }) — create a data table (or replace its config). */
export function table(target, cfg = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  instance(el, 'table')?.destroy();
  return instance(el, 'table', create(el, cfg));
}
AC.table = table;
