/* Notification center. A store + two views: the app-bar panel (popover on desktop, full sheet on phones)
   and a page view (<div data-ac="notifications" data-mode="page"></div>).
   Bell: <a href="#/notifications" data-ac-notifications-open [data-ac-notifications-src="url.json"]>… <span class="ac-appbar__count"></span></a>
   Items: { id, title, text, time | ago (minutes), icon, tone, avatar, color, kind:'mention|system|…', read, href }
          title/text may be { fa, en, ar }.
   API: AC.notifications.set(list) · add(item) · markRead(id, read=true) · markAllRead() · remove(id) · load(url)
        open(anchor) · close() · toggle(anchor) · list · unread
   Events (document): ac:notifications:change { unread }, ac:notifications:select { item } */
import { AC, $, $$, on, emit, h, icon, escapeHtml, scan, instance, register, format, i18n, ready } from '../core.js';
import { buildLayer, phoneMQ } from './sheet.js';
import { popover } from './popover.js';
import { menu } from './menu.js';
import { toast } from './toast.js';

let items = [];
let loaded = null;
const views = new Set();
let panel = null; let sheetApi = null; let pageHref = '#/notifications';

const tx = (v) => (v && typeof v === 'object' ? v[i18n.lang] ?? v.en ?? v.fa ?? Object.values(v)[0] : v ?? '');
const norm = (it, i) => ({
  ...it,
  id: String(it.id ?? `n${i}`),
  time: it.time ? new Date(it.time) : new Date(Date.now() - (Number(it.ago) || 0) * 60000),
  read: !!it.read,
});
const unread = () => items.filter((n) => !n.read).length;

function changed() {
  const n = unread();
  for (const b of $$('[data-ac-notifications-open] .ac-appbar__count, [data-ac-notifications-count]')) {
    b.textContent = n > 99 ? '99+' : String(n);
    b.hidden = n === 0;
  }
  views.forEach((v) => (v.isConnected ? v._render() : views.delete(v)));
  emit(document, 'notifications:change', { unread: n });
}

function itemHTML(n, page) {
  const lead = n.avatar
    ? `<span class="ac-avatar ac-avatar--sm ac-notif__lead" data-color="${escapeHtml(n.color || 1)}" aria-hidden="true">${escapeHtml(tx(n.avatar))}</span>`
    : `<span class="ac-notif__lead ac-notif__icon" data-tone="${escapeHtml(n.tone || 'accent')}" aria-hidden="true">${icon(n.icon || 'bell')}</span>`;
  const tag = n.href ? 'a' : 'button';
  const attrs = n.href ? `href="${escapeHtml(n.href)}"` : 'type="button"';
  const state = n.read ? '' : `<span class="ac-visually-hidden">${escapeHtml(i18n.t('notif.unread', 'Unread'))}: </span>`;
  return `<div class="ac-notif__row" data-id="${escapeHtml(n.id)}"${n.read ? '' : ' data-unread'}>
    <${tag} class="ac-notif__item" ${attrs} data-notif-open>${lead}
      <span class="ac-notif__main">${state}<span class="ac-notif__title">${escapeHtml(tx(n.title))}</span>${n.text ? `<span class="ac-notif__text">${escapeHtml(tx(n.text))}</span>` : ''}
      <time class="ac-notif__time" datetime="${n.time.toISOString()}">${escapeHtml(format.relative(n.time))}</time></span>
    </${tag}>
    ${page ? `<button class="ac-btn ac-btn--ghost ac-btn--icon ac-btn--sm ac-notif__more" type="button" data-notif-more aria-label="${escapeHtml(i18n.t('notif.more', 'More actions'))}">${icon('ellipsis')}</button>` : ''}
    <span class="ac-notif__dot" aria-hidden="true"></span>
  </div>`;
}

function view(mode = 'panel') {
  const page = mode === 'page';
  const el = h('div', { class: `ac-notif${page ? ' ac-notif--page' : ''}` });
  let filter = 'all';
  const tabs = page ? ['all', 'unread', 'mention', 'system'] : ['all', 'unread'];
  el._render = () => {
    const n = unread();
    const list = items.filter((x) => (filter === 'all' ? true : filter === 'unread' ? !x.read : x.kind === filter)).sort((a, b) => b.time - a.time);
    const today = new Date().toDateString();
    const groups = [[i18n.t('notif.today', 'Today'), list.filter((x) => x.time.toDateString() === today)], [i18n.t('notif.earlier', 'Earlier'), list.filter((x) => x.time.toDateString() !== today)]];
    const body = list.length
      ? groups.filter(([, g]) => g.length).map(([g, arr]) => `<div class="ac-notif__group" role="presentation">${escapeHtml(g)}</div>${arr.map((x) => itemHTML(x, page)).join('')}`).join('')
      : `<div class="ac-empty ac-empty--sm ac-notif__empty"><div class="ac-empty__art">${icon(filter === 'unread' ? 'circle-check' : 'bell-off')}</div>
          <div class="ac-empty__title">${escapeHtml(i18n.t(filter === 'unread' ? 'notif.caughtUp' : 'notif.empty', filter === 'unread' ? 'You’re all caught up' : 'No notifications'))}</div>
          <p class="ac-empty__text">${escapeHtml(i18n.t('notif.emptyText', 'New activity will show up here.'))}</p></div>`;
    const head = el.querySelector('.ac-notif__head');
    if (!head) {
      el.innerHTML = `<div class="ac-notif__head">
          <h2 class="ac-notif__heading" data-notif-title></h2>
          <button class="ac-btn ac-btn--ghost ac-btn--sm" type="button" data-notif-readall>${icon('check-check')}<span data-notif-t="readAll"></span></button>
        </div>
        <div class="ac-segmented ac-segmented--sm ac-segmented--block ac-notif__tabs" data-ac="segmented" role="radiogroup">${tabs.map((t, i) => `<button class="ac-segmented__item" type="button" data-value="${t}" aria-checked="${i === 0}"><span data-notif-tab="${t}"></span></button>`).join('')}</div>
        <div class="ac-notif__list" role="list"></div>
        ${page ? '' : `<a class="ac-notif__foot" href="${escapeHtml(pageHref)}" data-notif-all><span data-notif-t="viewAll"></span>${icon('arrow-right', 'ac-icon--sm ac-flip-rtl')}</a>`}`;
      scan(el);
    }
    el.querySelector('[data-notif-title]').innerHTML = `${escapeHtml(i18n.t('notif.title', 'Notifications'))}${n ? ` <span class="ac-count">${n}</span>` : ''}`;
    el.querySelector('[data-notif-t="readAll"]').textContent = i18n.t('notif.markAll', 'Mark all as read');
    el.querySelector('[data-notif-readall]').disabled = n === 0;
    const va = el.querySelector('[data-notif-t="viewAll"]'); if (va) va.textContent = i18n.t('notif.viewAll', 'View all notifications');
    for (const s of $$('[data-notif-tab]', el)) {
      const k = s.dataset.notifTab;
      const c = k === 'unread' ? n : k === 'all' ? items.length : items.filter((x) => x.kind === k).length;
      s.textContent = `${i18n.t(`notif.tab.${k}`, k)}${c ? ` · ${c}` : ''}`;
    }
    const listEl = el.querySelector('.ac-notif__list');
    listEl.innerHTML = body;
    for (const r of $$('.ac-notif__row', listEl)) r.setAttribute('role', 'listitem');
  };
  on(el, 'ac:segmented:change', (e) => { filter = e.detail.value; el._render(); });
  on(el, 'click', '[data-notif-readall]', () => notifications.markAllRead());
  on(el, 'click', '[data-notif-all]', () => notifications.close());
  on(el, 'click', '[data-notif-open]', (e, a) => {
    const n = items.find((x) => x.id === a.closest('.ac-notif__row').dataset.id);
    if (!n) return;
    emit(el, 'notifications:select', { item: n });
    notifications.markRead(n.id);
    if (!page && n.href) notifications.close();
  });
  on(el, 'click', '[data-notif-more]', (e, b) => {
    const n = items.find((x) => x.id === b.closest('.ac-notif__row').dataset.id);
    if (!n) return;
    menu(b, [
      { label: i18n.t(n.read ? 'notif.markUnread' : 'notif.markRead', n.read ? 'Mark as unread' : 'Mark as read'), icon: n.read ? 'mail' : 'mail-open', onSelect: () => notifications.markRead(n.id, !n.read) },
      '-',
      { label: i18n.t('notif.remove', 'Remove'), icon: 'trash-2', tone: 'danger', onSelect: () => {
        const idx = items.indexOf(n); notifications.remove(n.id);
        toast.undo(i18n.t('notif.removed', 'Notification removed'), () => { items.splice(idx, 0, n); changed(); });
      } },
    ], { placement: 'bottom-end', keyboard: e.detail === 0 });
  });
  el._render();
  views.add(el);
  return el;
}

function ensureData() {
  if (items.length || loaded) return loaded;
  const src = $('[data-ac-notifications-src]')?.getAttribute('data-ac-notifications-src');
  return src ? notifications.load(src) : null;
}

export const notifications = {
  get list() { return items.slice(); },
  get unread() { return unread(); },
  set(list = []) { items = list.map(norm); changed(); return notifications; },
  add(item, { toast: show = false } = {}) {
    const n = norm(item, items.length + Date.now());
    items.unshift(n); changed();
    if (show) toast({ title: tx(n.title), text: tx(n.text), icon: n.icon || 'bell', tone: n.tone });
    return n;
  },
  markRead(id, read = true) { const n = items.find((x) => x.id === String(id)); if (n && n.read !== read) { n.read = read; changed(); } },
  markAllRead() { items.forEach((n) => { n.read = true; }); changed(); },
  remove(id) { items = items.filter((x) => x.id !== String(id)); changed(); },
  load(url) {
    loaded = fetch(url).then((r) => (r.ok ? r.json() : [])).then((list) => { if (!items.length) notifications.set(list); return items; })
      .catch((err) => { console.warn('[AC] notifications load failed', err); return items; });
    return loaded;
  },
  view,
  get isOpen() { return !!(sheetApi?.isOpen || (panel && instance(panel, 'popover')?.isOpen)); },
  async open(anchor) {
    await ensureData();
    views.forEach((v) => (v.isConnected ? v._render() : views.delete(v)));
    const bell = anchor instanceof Element ? anchor : $('[data-ac-notifications-open]');
    if (phoneMQ.matches) {
      sheetApi = buildLayer('sheet', { className: 'ac-notif-sheet', closeButton: true, content: view('panel'), label: i18n.t('notif.title', 'Notifications') });
      sheetApi.open(bell);
      return sheetApi;
    }
    if (!panel) {
      panel = h('div', { class: 'ac-popover ac-notif-pop', 'data-ac': 'popover', 'data-placement': 'bottom-end', id: 'ac-notif-panel' });
      panel.append(view('panel'));
      document.body.append(panel);
      scan(panel);
    }
    panel.setAttribute('aria-label', i18n.t('notif.title', 'Notifications'));
    return popover.open(panel, bell);
  },
  close() { sheetApi?.close(); if (panel) popover.close(panel); },
  toggle(anchor) { return notifications.isOpen ? notifications.close() : notifications.open(anchor); },
};

register('notifications', (el) => {
  const v = view(el.dataset.mode || 'page');
  el.replaceChildren(v);
  if (el.dataset.src && !items.length && !loaded) notifications.load(el.dataset.src); else ensureData();
  return () => views.delete(v);
});

on(document, 'click', '[data-ac-notifications-open]', (e, b) => {
  if (e.ctrlKey || e.metaKey || e.shiftKey) return;
  e.preventDefault();
  notifications.toggle(b);
});
on(document, 'ac:i18n:change', () => views.forEach((v) => (v.isConnected ? v._render() : views.delete(v))));
ready(() => { ensureData(); });

AC.notifications = notifications;
