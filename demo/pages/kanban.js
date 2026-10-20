/* Kanban page — renders the board from demo/data.js; drag & drop lives in the framework (data-ac="kanban"). */
import { kanbanBoard, team } from '../data.js';

const state = { board: null, seq: 100 };
const DAY = 86400000;

export default function mount(root, AC) {
  const { escapeHtml: esc, icon, t, format } = AC;
  state.board ??= structuredClone(kanbanBoard);
  const board = root.querySelector('[data-kb-board]');
  const pager = root.querySelector('[data-kb-pager]');
  const person = (id) => team.find((m) => m.id === id);
  let filter = 'all'; let query = '';

  const avatar = (id, size = 'xs') => { const p = person(id); return p ? `<span class="ac-avatar ac-avatar--${size}" data-color="${p.color}" title="${esc(p.name)}">${esc(p.initials)}</span>` : ''; };
  const dueChip = (c, colId) => {
    if (!c.due) return '';
    const days = Math.round((new Date(c.due) - Date.now()) / DAY);
    const tone = colId === 'done' ? '' : days < 0 ? 'danger' : days <= 2 ? 'warning' : '';
    return `<span class="ac-kanban__due"${tone ? ` data-tone="${tone}"` : ''}>${icon('clock')}${esc(format.date(c.due, { day: 'numeric', month: 'short' }))}</span>`;
  };
  const cardHTML = (c, colId) => `<article class="ac-kanban__card" tabindex="0" data-id="${c.id}" aria-label="${esc(c.title)}" aria-roledescription="${esc(t('kanban.card', 'کارت'))}">
    ${c.labels.length ? `<div class="ac-kanban__labels">${c.labels.map((l) => `<span class="ac-badge ac-badge--${l.tone}">${esc(t(`kanban.l.${l.key}`, l.text))}</span>`).join('')}</div>` : ''}
    <h3 class="ac-kanban__title">${esc(c.title)}</h3>
    ${c.desc ? `<p class="ac-kanban__desc">${esc(c.desc)}</p>` : ''}
    ${c.progress ? `<div class="ac-kanban__progress"><progress class="ac-progress ac-progress--sm${c.progress === 100 ? ' ac-progress--success' : ''}" value="${c.progress}" max="100" aria-label="${esc(t('kanban.progress', 'پیشرفت'))}"></progress><span>${c.progress}%</span></div>` : ''}
    <footer class="ac-kanban__meta">${dueChip(c, colId)}${c.comments ? `<span>${icon('message-square')}${c.comments}</span>` : ''}${c.files ? `<span>${icon('paperclip')}${c.files}</span>` : ''}<span class="ac-avatar-group">${c.members.map((m) => avatar(m)).join('')}</span></footer>
  </article>`;
  const colTitle = (col) => (col.i18n ? t(col.i18n, col.title) : col.title);
  const colHTML = (col) => `<section class="ac-kanban__col" data-col="${col.id}" data-tone="${col.tone}" aria-label="${esc(colTitle(col))}">
    <header class="ac-kanban__head"><span class="ac-kanban__dot"></span><h2 class="ac-kanban__name">${esc(colTitle(col))}</h2><span class="ac-kanban__count"></span>
      <button class="ac-btn ac-btn--ghost ac-btn--icon ac-btn--sm" type="button" data-kb-colmenu aria-label="${esc(t('kanban.columnMenu', 'گزینه‌های ستون'))}">${icon('ellipsis')}</button></header>
    <div class="ac-kanban__list" role="list" data-empty-text="${esc(t('kanban.dropHere', 'کارت را اینجا رها کنید'))}">${col.cards.map((c) => cardHTML(c, col.id)).join('')}</div>
    <button class="ac-kanban__add" type="button" data-kb-add>${icon('plus')}<span>${esc(t('kanban.addCard', 'افزودن کارت'))}</span></button>
  </section>`;

  function render() {
    board.innerHTML = state.board.map(colHTML).join('') + `<button class="ac-kanban__newcol" type="button" data-kb-newcol><span class="ac-stack ac-gap-2 ac-text-center">${icon('circle-plus', 'ac-icon--lg')}<span>${esc(t('kanban.addColumn', 'ستون جدید'))}</span></span></button>`;
    board.querySelectorAll('.ac-kanban__card').forEach((n) => n.setAttribute('role', 'listitem'));
    pager.innerHTML = state.board.map((c, i) => `<button class="ac-chip" type="button" data-kb-page="${i}" aria-current="${i === 0}"><span>${esc(colTitle(c))}</span><span class="ac-text-muted" data-kb-pcount="${c.id}">${c.cards.length}</span></button>`).join('');
    root.querySelector('[data-kb-team]').innerHTML = team.slice(0, 5).map((m) => avatar(m.id, 'sm')).join('') + '<span class="ac-avatar ac-avatar--sm ac-avatar-group__more">+3</span>';
    AC.instance(board, 'kanban')?.refresh();
    applyFilter();
  }

  const find = (id) => { for (const col of state.board) { const i = col.cards.findIndex((c) => c.id === id); if (i > -1) return { col, i, card: col.cards[i] }; } return null; };

  function applyFilter() {
    const q = query.trim().toLowerCase();
    for (const el of board.querySelectorAll('.ac-kanban__card')) {
      const c = find(el.dataset.id)?.card; if (!c) continue;
      const ok = (filter === 'all' || (filter === 'mine' && c.members.includes('ar')) || (filter === 'urgent' && c.labels.some((l) => l.key === 'urgent' || l.key === 'bug')))
        && (!q || c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
      el.hidden = !ok;
    }
  }

  function syncFromDom() {
    const byId = new Map(state.board.flatMap((col) => col.cards.map((c) => [c.id, c])));
    for (const colEl of board.querySelectorAll('.ac-kanban__col')) {
      const col = state.board.find((c) => c.id === colEl.dataset.col);
      col.cards = [...colEl.querySelectorAll('.ac-kanban__card')].map((n) => byId.get(n.dataset.id)).filter(Boolean);
      const pc = pager.querySelector(`[data-kb-pcount="${col.id}"]`); if (pc) pc.textContent = col.cards.length;
    }
  }

  function openDetail(id) {
    const hit = find(id); if (!hit) return;
    const { card: c, col } = hit;
    const body = document.createElement('div');
    body.className = 'ac-kdetail';
    body.innerHTML = `
      ${c.labels.length ? `<div class="ac-kanban__labels">${c.labels.map((l) => `<span class="ac-badge ac-badge--${l.tone}">${esc(t(`kanban.l.${l.key}`, l.text))}</span>`).join('')}</div>` : ''}
      <p class="ac-text-soft">${esc(c.desc || t('kanban.noDesc', 'توضیحی ثبت نشده است.'))}</p>
      <div class="ac-kdetail__grid">
        <div class="ac-kdetail__field"><small>${esc(t('kanban.status', 'وضعیت'))}</small><strong>${esc(colTitle(col))}</strong></div>
        <div class="ac-kdetail__field"><small>${esc(t('kanban.due', 'سررسید'))}</small><strong class="ac-num">${c.due ? esc(format.date(c.due, { dateStyle: 'medium' })) : '—'}</strong></div>
        <div class="ac-kdetail__field"><small>${esc(t('kanban.members', 'اعضا'))}</small><span class="ac-avatar-group">${c.members.map((m) => avatar(m, 'sm')).join('')}</span></div>
      </div>
      <div class="ac-stack ac-gap-2"><div class="ac-spread ac-text-sm"><span class="ac-fw-semibold">${esc(t('kanban.progress', 'پیشرفت'))}</span><span class="ac-num ac-text-muted">${c.progress}%</span></div>
        <progress class="ac-progress" value="${c.progress}" max="100" aria-label="${esc(t('kanban.progress', 'پیشرفت'))}"></progress></div>
      ${c.checklist.length ? `<div class="ac-stack ac-gap-1"><span class="ac-fw-semibold ac-text-sm">${esc(t('kanban.checklist', 'چک‌لیست'))}</span>${c.checklist.map(([txt, done], i) => `<label class="ac-kdetail__check"><input class="ac-check" type="checkbox" data-ci="${i}"${done ? ' checked' : ''}><span>${esc(txt)}</span></label>`).join('')}</div>` : ''}
      <div class="ac-cluster ac-gap-3 ac-text-sm ac-text-muted"><span class="ac-row ac-gap-1">${icon('message-square')}${c.comments} ${esc(t('kanban.comments', 'نظر'))}</span><span class="ac-row ac-gap-1">${icon('paperclip')}${c.files} ${esc(t('kanban.files', 'پیوست'))}</span></div>`;
    body.addEventListener('change', (e) => {
      const i = e.target.dataset.ci; if (i == null) return;
      c.checklist[i][1] = e.target.checked;
      c.progress = Math.round((c.checklist.filter((x) => x[1]).length / c.checklist.length) * 100);
      body.querySelector('progress.ac-progress:not(.ac-progress--sm)').value = c.progress;
      body.querySelector('.ac-spread .ac-num').textContent = `${c.progress}%`;
      const el = board.querySelector(`[data-id="${c.id}"]`); if (el) el.outerHTML = cardHTML(c, col.id);
    });
    const foot = document.createElement('div');
    foot.className = 'ac-cluster ac-gap-2';
    foot.innerHTML = `<button class="ac-btn ac-btn--danger-soft" type="button" data-del>${icon('trash-2')}<span>${esc(t('common.delete', 'حذف'))}</span></button><button class="ac-btn ac-btn--primary" type="button" data-ac-close>${esc(t('overlay.close', 'بستن'))}</button>`;
    foot.querySelector('[data-del]').addEventListener('click', () => {
      col.cards = col.cards.filter((x) => x !== c);
      board.querySelector(`[data-id="${c.id}"]`)?.remove();
      AC.instance(board, 'kanban')?.refresh(); syncFromDom();
      AC.modal.close();
      AC.toast?.({ title: t('kanban.deleted', 'کارت حذف شد'), tone: 'danger' });
    });
    AC.modal.open({ title: c.title, sub: colTitle(col), content: body, footer: foot, size: 'md' });
  }

  function composer(colEl) {
    if (colEl.querySelector('.ac-kanban__composer')) { colEl.querySelector('.ac-kanban__composer textarea').focus(); return; }
    const add = colEl.querySelector('[data-kb-add]');
    const box = document.createElement('form');
    box.className = 'ac-kanban__composer';
    box.innerHTML = `<textarea rows="2" placeholder="${esc(t('kanban.cardTitle', 'عنوان کارت…'))}" aria-label="${esc(t('kanban.cardTitle', 'عنوان کارت…'))}"></textarea>
      <div class="ac-cluster ac-gap-2"><button class="ac-btn ac-btn--primary ac-btn--sm" type="submit">${esc(t('kanban.addCard', 'افزودن کارت'))}</button><button class="ac-btn ac-btn--ghost ac-btn--sm" type="button" data-cancel>${esc(t('overlay.cancel', 'انصراف'))}</button></div>`;
    add.hidden = true; add.before(box);
    const ta = box.querySelector('textarea'); ta.focus();
    const close = () => { box.remove(); add.hidden = false; };
    box.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = ta.value.trim(); if (!title) { ta.focus(); return; }
      const col = state.board.find((c) => c.id === colEl.dataset.col);
      const c = { id: `k${++state.seq}`, title, labels: [], members: ['ar'], due: null, progress: 0, comments: 0, files: 0, desc: '', checklist: [] };
      col.cards.push(c);
      const list = colEl.querySelector('.ac-kanban__list');
      list.insertAdjacentHTML('beforeend', cardHTML(c, col.id));
      const el = list.lastElementChild; el.setAttribute('role', 'listitem');
      if (!AC.reducedMotion()) el.animate([{ opacity: 0, transform: 'translateY(8px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
      AC.instance(board, 'kanban')?.refresh(); syncFromDom();
      ta.value = ''; ta.focus();
    });
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); box.requestSubmit(); } if (e.key === 'Escape') close(); });
    box.querySelector('[data-cancel]').addEventListener('click', close);
  }

  async function addColumn() {
    const name = await AC.prompt({ title: t('kanban.addColumn', 'ستون جدید'), label: t('kanban.columnName', 'نام ستون'), value: '', required: true });
    if (!name) return;
    const col = { id: `col${++state.seq}`, title: name, tone: 'neutral', cards: [] };
    state.board.push(col);
    board.querySelector('[data-kb-newcol]').insertAdjacentHTML('beforebegin', colHTML(col));
    const el = board.querySelector(`[data-col="${col.id}"]`); el.setAttribute('data-new', '');
    pager.insertAdjacentHTML('beforeend', `<button class="ac-chip" type="button" data-kb-page="${state.board.length - 1}" aria-current="false"><span>${esc(name)}</span><span class="ac-text-muted" data-kb-pcount="${col.id}">0</span></button>`);
    AC.instance(board, 'kanban')?.refresh();
    el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: AC.reducedMotion() ? 'auto' : 'smooth' });
  }

  // phone pager follows the snapped column
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) {
      const i = [...board.querySelectorAll('.ac-kanban__col')].indexOf(en.target);
      pager.querySelectorAll('[data-kb-page]').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.kbPage) === i)));
      pager.querySelector('[aria-current="true"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
  }, { root: board, threshold: 0.6 });
  const observe = () => { io.disconnect(); board.querySelectorAll('.ac-kanban__col').forEach((c) => io.observe(c)); };

  render(); observe();
  const mo = new MutationObserver(observe); mo.observe(board, { childList: true });

  const offs = [
    AC.on(board, 'ac:kanban:move', (e) => {
      syncFromDom();
      const col = state.board.find((c) => c.id === e.detail.to);
      const card = find(e.detail.id)?.card;
      if (card && e.detail.to === 'done') { card.progress = 100; e.detail.card.outerHTML = cardHTML(card, 'done'); board.querySelector(`[data-id="${card.id}"]`)?.setAttribute('role', 'listitem'); }
      if (e.detail.from !== e.detail.to) AC.toast?.({ title: t('kanban.movedTo', 'به «{col}» منتقل شد', { col: colTitle(col) }), tone: e.detail.to === 'done' ? 'success' : 'info', duration: 2200 });
    }),
    AC.on(board, 'click', '.ac-kanban__card', (e, el) => openDetail(el.dataset.id)),
    AC.on(board, 'keydown', '.ac-kanban__card', (e, el) => { if ((e.key === 'Enter' || e.key === ' ') && !e.ctrlKey && !e.altKey) { e.preventDefault(); openDetail(el.dataset.id); } }),
    AC.on(board, 'click', '[data-kb-add]', (e, b) => composer(b.closest('.ac-kanban__col'))),
    AC.on(root, 'click', '[data-kb-newcol]', addColumn),
    AC.on(root, 'click', '[data-kb-newcard]', () => { const col = board.querySelector('[data-col="todo"]') || board.querySelector('.ac-kanban__col'); col.scrollIntoView({ inline: 'center', block: 'nearest' }); composer(col); }),
    AC.on(board, 'click', '[data-kb-colmenu]', (e, b) => {
      const colEl = b.closest('.ac-kanban__col');
      AC.menu(b, [
        { label: t('kanban.addCard', 'افزودن کارت'), icon: 'plus', onSelect: () => composer(colEl) },
        { label: t('kanban.sortDue', 'مرتب‌سازی بر اساس سررسید'), icon: 'arrow-up-down', onSelect: () => { const col = state.board.find((c) => c.id === colEl.dataset.col); col.cards.sort((a, b2) => (a.due ? +new Date(a.due) : Infinity) - (b2.due ? +new Date(b2.due) : Infinity)); const list = colEl.querySelector('.ac-kanban__list'); AC.kanban.flip([...list.children], () => col.cards.forEach((c) => list.append(list.querySelector(`[data-id="${c.id}"]`)))); } },
        '-',
        { label: t('kanban.clearCol', 'پاک کردن ستون'), icon: 'trash-2', tone: 'danger', onSelect: () => { const col = state.board.find((c) => c.id === colEl.dataset.col); col.cards = []; colEl.querySelector('.ac-kanban__list').replaceChildren(); AC.instance(board, 'kanban')?.refresh(); syncFromDom(); } },
      ], { placement: 'bottom-end' });
    }),
    AC.on(pager, 'click', '[data-kb-page]', (e, b) => AC.instance(board, 'kanban')?.scrollTo(Number(b.dataset.kbPage))),
    AC.on(root, 'ac:segmented:change', (e) => { if (e.target.matches('[data-kb-filter]')) { filter = e.detail.value; applyFilter(); } }),
    AC.on(root, 'input', '[data-kb-search]', (e) => { query = e.target.value; applyFilter(); }),
    AC.on(root, 'click', '[data-kb-invite]', () => { AC.copyText?.(location.href); AC.toast?.({ title: t('kanban.linkCopied', 'پیوند تخته کپی شد'), tone: 'success' }); }),
    AC.on(document, 'ac:i18n:change', () => { render(); }),
  ];
  return () => { offs.forEach((f) => f()); io.disconnect(); mo.disconnect(); };
}
