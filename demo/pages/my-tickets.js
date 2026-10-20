/* Customer support portal — my requests (status timeline + conversation) and the submit-request wizard. */
import { tickets, myTicketIds, me, helpArticles, ticketAgents } from '../data.js';

export default function mount(root, AC) {
  let alive = true; let off = () => {};
  AC.use('tickets').then(() => { if (alive) off = start(root, AC); }, (err) => console.error('[demo] tickets module failed', err));
  return () => { alive = false; off(); };
}

function start(root, AC) {
  const T = AC.tickets;
  const esc = AC.escapeHtml;
  const t = (k, f, v) => AC.t(k, f, v);
  const $ = (s) => root.querySelector(s);
  const mine = myTicketIds.map((id) => tickets.find((x) => x.id === id)).filter(Boolean);
  const split = $('.ac-tk-portal');
  let current = null; let detail = null; let track = null;

  const renderList = () => {
    $('[data-mt-list]').innerHTML = mine.map((tk) => {
      const unread = tk.messages[tk.messages.length - 1]?.from === 'agent';
      return `<li><button type="button" class="ac-tk-myitem" data-mt-open="${esc(tk.id)}" aria-current="${tk === current}">
        <span class="ac-tk-myitem__top"><bdi class="ac-mono">#${esc(tk.id)}</bdi>${T.statusChip(tk.status)}</span>
        <b class="ac-tk-myitem__title">${esc(tk.subject)}</b>
        <span class="ac-tk-myitem__meta">${AC.icon('clock', 'ac-icon--sm')}${esc(AC.format.relative(tk.updated))}${unread ? `<i class="ac-tk-myitem__new">${esc(t('mt.newReply', 'پاسخ جدید'))}</i>` : ''}</span>
      </button></li>`;
    }).join('');
  };
  const select = (tk, push) => {
    current = tk;
    renderList();
    track = T.track(AC.h('div', { class: 'ac-tk-portal__track' }), tk);
    detail?.destroy();
    detail = T.detail($('[data-mt-detail]'), { ticket: tk, agents: ticketAgents, view: 'customer', screen: true, back: true, intro: track });
    if (push) AC.instance(split, 'split')?.push(1);
  };
  renderList();
  const qid = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
  const stacked = () => AC.instance(split, 'split')?.stacked;
  select(mine.find((x) => x.id === qid) || mine[0], false);
  if (qid && stacked()) requestAnimationFrame(() => AC.instance(split, 'split')?.push(1));

  // help search chips
  const norm = (s) => s.toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک');
  const renderArticles = (q = '') => {
    const list = helpArticles.filter((a) => !q || norm(`${a.title} ${a.cat}`).includes(norm(q))).slice(0, 4);
    $('[data-mt-articles]').innerHTML = list.length ? list.map((a) => `<button type="button" class="ac-chip ac-tk-help__chip" data-mt-article="${a.id}">${AC.icon(a.icon, 'ac-icon--sm')}<span>${esc(a.title)}</span></button>`).join('') : `<span class="ac-text-muted ac-text-sm">${esc(t('mt.noHelp', 'مقاله‌ای پیدا نشد؛ درخواست ثبت کنید.'))}</span>`;
  };
  renderArticles();

  // wizard: categories + related orders + review
  const cats = $('[data-mt-cats]');
  const CAT_ICON = { billing: 'credit-card', technical: 'wrench', account: 'user-round', sales: 'shopping-bag', shipping: 'truck', other: 'circle-help' };
  const renderCats = () => {
    const sel = cats.querySelector('input:checked')?.value;
    cats.innerHTML = T.CATEGORIES.map((c) => `<label class="ac-tk-cat"><input type="radio" name="category" value="${c}"${c === sel ? ' checked' : ''}><span>${AC.icon(CAT_ICON[c])}<b>${esc(T.t(`cat.${c}`))}</b></span></label>`).join('');
    $('[data-mt-orders]').innerHTML = `<option value="">${esc(t('mt.noOrder', '— بدون سفارش —'))}</option>${me.orders.map((o) => `<option value="${o.id}">${esc(o.id)} · ${esc(o.title)}</option>`).join('')}`;
  };
  renderCats();
  const form = $('[data-mt-form]');
  const review = () => {
    const fd = new FormData(form);
    const files = form.querySelector('input[type="file"]')?.files?.length || 0;
    const row = (k, f, v) => `<div><dt>${esc(t(k, f))}</dt><dd>${esc(v || '—')}</dd></div>`;
    $('[data-mt-review]').innerHTML = row('mt.s1', 'موضوع', fd.get('category') ? T.t(`cat.${fd.get('category')}`) : '')
      + row('mt.subject', 'عنوان', fd.get('subject')) + row('mt.order', 'سفارش مرتبط', fd.get('order'))
      + row('mt.urgency', 'فوریت', t(`mt.u${{ low: 'Low', normal: 'Normal', urgent: 'Urgent' }[fd.get('priority')] || 'Normal'}`, fd.get('priority')))
      + row('mt.message', 'شرح درخواست', fd.get('message')) + row('mt.s3', 'پیوست', files ? T.t('files', { n: AC.format.number(files) }) : '');
  };
  const showPanel = (v) => {
    root.querySelectorAll('[data-mt-panel]').forEach((p) => { p.hidden = p.dataset.mtPanel !== v; });
    const seg = AC.instance($('[data-mt-tabs]'), 'segmented');
    if (seg) seg.select(v === 'new' ? 1 : 0, { silent: true });
  };

  const offs = [
    AC.on(root, 'click', '[data-mt-open]', (e, b) => { const tk = mine.find((x) => x.id === b.dataset.mtOpen); if (tk) select(tk, stacked()); }),
    AC.on($('[data-mt-tabs]'), 'ac:segmented:change', (e) => showPanel(e.detail.value)),
    AC.on(root, 'click', '[data-mt-new]', () => { showPanel('new'); $('[data-mt-tabs]').scrollIntoView({ block: 'start', behavior: AC.reducedMotion() ? 'instant' : 'smooth' }); }),
    AC.on(root, 'input', '[data-mt-help]', (e, i) => renderArticles(i.value.trim())),
    AC.on(root, 'click', '[data-mt-article]', () => AC.supportChat?.open?.('home') ?? AC.toast?.({ title: t('mt.helpOpen', 'راهنما باز شد'), tone: 'info' })),
    AC.on($('[data-mt-urgency]'), 'ac:segmented:change', (e) => { $('[data-mt-priority]').value = e.detail.value; }),
    AC.on(form, 'ac:wizard:change', (e) => { if (e.detail.index === e.detail.total - 1) review(); }),
    AC.on(form, 'ac:form:submit', (e) => {
      const v = e.detail.values;
      const now = new Date().toISOString();
      const id = `T-${1049 + tickets.length - 14}`;
      const files = [...(form.querySelector('input[type="file"]')?.files || [])].map((f) => ({ name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, type: f.type.startsWith('image/') ? 'image' : 'file' }));
      const total = { urgent: 60, normal: 480, low: 1440 }[v.priority] || 480;
      const tk = { id, subject: v.subject, customer: { name: me.name, email: me.email, initials: me.initials, color: me.color }, channel: 'web', category: v.category || 'other', priority: v.priority || 'normal', status: 'new', assignee: null, tags: v.order ? [v.order] : [], created: now, updated: now, due: new Date(Date.now() + total * 60000).toISOString(), slaTotal: total, csat: null,
        messages: [{ id: `${id}-m0`, from: 'customer', text: v.message, time: now, attachments: files }] };
      tickets.unshift(tk); mine.unshift(tk); myTicketIds.unshift(id);
      e.detail.waitUntil(new Promise((r) => setTimeout(r, 700)).then(() => {
        AC.toast?.({ title: t('mt.sent', 'درخواست شما ثبت شد'), text: t('mt.tracking', 'شمارهٔ پیگیری: {id}', { id: `#${id}` }), tone: 'success' });
        AC.instance(form, 'form')?.reset?.(); AC.instance(form, 'wizard')?.go?.(0);
        showPanel('list'); select(tk, stacked());
      }));
    }),
    AC.on(document, 'ac:i18n:change', () => { renderList(); renderCats(); renderArticles($('[data-mt-help]').value.trim()); if (current && track) T.track(track, current); }),
  ];
  return () => { offs.forEach((f) => f()); detail?.destroy(); };
}
