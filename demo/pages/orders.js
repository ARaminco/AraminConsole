/* Orders — status chips filter the data table; a row opens the details drawer (sheet on phones). */
import { orders, products } from '../data.js';

const BADGES = {
  paid: { tone: 'success', label: 'پرداخت‌شده', i18n: 'status.paid' }, pending: { tone: 'warning', label: 'در انتظار', i18n: 'status.pending' },
  shipped: { tone: 'info', label: 'ارسال‌شده', i18n: 'status.shipped' }, refunded: { tone: 'danger', label: 'مرجوعی', i18n: 'status.refunded' },
};

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  const money = (n) => AC.format.number(n, { currency: 'USD' });
  let rows = orders.map((o) => ({ ...o }));
  let status = 'all';

  const kpis = () => {
    const set = (k, v) => { const el = root.querySelector(`[data-ord-kpi="${k}"]`); if (el) el.dataset.to = v; };
    const live = rows.filter((o) => o.status !== 'refunded');
    const sum = live.reduce((a, o) => a + o.amount, 0);
    set('revenue', Math.round(sum)); set('count', rows.length); set('aov', Math.round(sum / (live.length || 1)));
    set('pending', rows.filter((o) => o.status === 'paid' || o.status === 'pending').length);
    for (const b of root.querySelectorAll('[data-n]')) b.textContent = String(b.dataset.n === 'all' ? rows.length : rows.filter((o) => o.status === b.dataset.n).length);
  };
  kpis();

  const host = $('[data-ord-table]');
  const view = () => (status === 'all' ? rows : rows.filter((o) => o.status === status));
  const table = AC.table(host, {
    id: 'orders', caption: t('nav.orders', 'Orders'), exportName: 'orders', rows: view(), pageSize: 10, selectable: true, sort: { key: 'date', dir: 'desc' },
    columns: [
      { key: 'id', i18n: 'col.order', label: 'سفارش', render: (r) => `<span class="ac-mono ac-text-sm">${esc(r.id)}</span>` },
      { key: 'customer', i18n: 'col.customer', label: 'مشتری', type: 'avatar', sub: 'email', primary: true, hideable: false, text: (r) => `${r.customer} ${r.email}` },
      { key: 'product', i18n: 'ord.col.product', label: 'محصول', mobile: false, render: (r) => `<span class="ac-truncate ord-prod" dir="auto">${esc(r.product)}</span> <small class="ac-text-muted"><bdi>×${r.qty}</bdi></small>`, text: (r) => r.product },
      { key: 'channel', i18n: 'ord.col.channel', label: 'کانال', filter: 'select', hidden: true, text: (r) => (r.channel === 'online' ? t('ord.online', 'آنلاین') : t('ord.store', 'حضوری')) },
      { key: 'status', i18n: 'col.status', label: 'وضعیت', type: 'badge', badges: BADGES },
      { key: 'amount', i18n: 'col.amount', label: 'مبلغ', type: 'money', currency: 'USD' },
      { key: 'date', i18n: 'col.date', label: 'تاریخ', type: 'date', dateOptions: { year: 'numeric', month: '2-digit', day: '2-digit' } },
    ],
    actions: [
      { id: 'view', icon: 'eye', label: 'جزئیات', i18n: 'ord.details', tone: 'info' },
      { id: 'invoice', icon: 'receipt', label: 'فاکتور', i18n: 'nav.invoice' },
    ],
    bulkActions: [
      { id: 'ship', icon: 'truck', label: 'ارسال شد', i18n: 'ord.markShipped' },
      { id: 'export', icon: 'download', label: 'خروجی', i18n: 'common.export' },
    ],
  });

  function details(o) {
    const p = products.find((x) => x.name === o.product);
    const unit = o.amount / o.qty; const tax = Math.round(o.amount * 0.09 * 100) / 100;
    const steps = [['ord.s.placed', 'ثبت سفارش', true], ['ord.s.paid', 'پرداخت', o.status !== 'pending'], ['ord.s.shipped', 'ارسال', o.status === 'shipped'], ['ord.s.delivered', 'تحویل', false]];
    const b = BADGES[o.status];
    const content = `<div class="ord-detail">
      <div class="ord-detail__who"><span class="ac-avatar" data-color="${o.color}">${esc(o.initials)}</span><span class="ac-list__main"><strong>${esc(o.customer)}</strong><small class="ac-ltr">${esc(o.email)}</small></span><span class="ac-badge ac-badge--${b.tone} ac-badge--dot">${esc(t(b.i18n, b.label))}</span></div>
      <ol class="ac-stepper ord-steps">${steps.map(([k, f, done], i) => `<li class="ac-step" data-state="${done ? 'complete' : steps[i - 1]?.[2] ? 'current' : 'upcoming'}"><span class="ac-step__dot"></span><span class="ac-step__text"><strong>${esc(t(k, f))}</strong></span></li>`).join('')}</ol>
      <div class="ac-inset ord-item"><span class="ac-list__thumb">${AC.icon(p?.icon || 'package')}</span><span class="ac-list__main"><strong dir="auto">${esc(o.product)}</strong><small><span class="ac-mono">${esc(p?.sku || '')}</span> · <bdi>${o.qty} × ${money(unit)}</bdi></small></span><b class="ac-num">${money(o.amount)}</b></div>
      <dl class="ac-dl ord-sum">
        <div><dt>${esc(t('inv.subtotal', 'جمع جزء'))}</dt><dd class="ac-num">${money(o.amount)}</dd></div>
        <div><dt>${esc(t('inv.tax', 'مالیات ۹٪'))}</dt><dd class="ac-num">${money(tax)}</dd></div>
        <div><dt>${esc(t('inv.total', 'مبلغ کل'))}</dt><dd class="ac-num ord-sum__total">${money(o.amount + tax)}</dd></div>
      </dl>
      <dl class="ac-dl ac-dl--cols-2">
        <div><dt>${esc(t('col.order', 'سفارش'))}</dt><dd class="ac-mono">${esc(o.id)}</dd></div>
        <div><dt>${esc(t('col.date', 'تاریخ'))}</dt><dd>${esc(AC.format.date(o.date, { dateStyle: 'medium' }))}</dd></div>
        <div><dt>${esc(t('ord.col.channel', 'کانال'))}</dt><dd>${esc(o.channel === 'online' ? t('ord.online', 'آنلاین') : t('ord.store', 'حضوری'))}</dd></div>
        <div><dt>${esc(t('ord.address', 'نشانی'))}</dt><dd>تهران، خیابان ولیعصر، پلاک ۱۲</dd></div>
      </dl></div>`;
    const footer = `<a class="ac-btn" href="#/invoice?id=${encodeURIComponent(o.id)}">${AC.icon('receipt')}<span>${esc(t('nav.invoice', 'فاکتور'))}</span></a>
      ${o.status === 'paid' ? `<button class="ac-btn ac-btn--primary" type="button" data-ac-close="ship">${AC.icon('truck')}<span>${esc(t('ord.markShipped', 'ارسال شد'))}</span></button>` : `<button class="ac-btn ac-btn--primary" type="button" data-ac-close>${esc(t('app.close', 'بستن'))}</button>`}`;
    const opts = { title: `${t('col.order', 'سفارش')} ${o.id}`, sub: AC.format.relative(o.date), content, footer };
    const layer = window.matchMedia('(max-width: 639.98px)').matches ? AC.sheet.open({ ...opts, snap: '0.92' }) : AC.drawer.open({ ...opts, side: 'end' });
    const el = layer?.el || layer;
    if (el?.addEventListener) el.addEventListener('ac:drawer:close', onClose, { once: true });
    if (el?.addEventListener) el.addEventListener('ac:sheet:close', onClose, { once: true });
    function onClose(e) { if (e.detail?.reason === 'ship') ship([o.id]); }
  }

  function ship(ids) {
    const set = new Set(ids);
    rows = rows.map((o) => (set.has(o.id) && (o.status === 'paid' || o.status === 'pending') ? { ...o, status: 'shipped' } : o));
    table.setRows(view()); kpis();
    AC.toast?.({ title: t('ord.shipped', '{n} سفارش ارسال شد', { n: ids.length }), tone: 'success' });
  }

  const offs = [
    AC.on(root, 'click', '[data-ord-filters] [data-status]', (e, b) => {
      status = b.dataset.status;
      for (const c of root.querySelectorAll('[data-ord-filters] [data-status]')) c.setAttribute('aria-pressed', String(c === b));
      table.setRows(view());
    }),
    AC.on(host, 'click', (e) => {
      if (e.target.closest('button, a, input, label, select, [data-dt]')) return;
      const row = e.target.closest('tr[data-id], .ac-dt__card[data-id]');
      const o = row && rows.find((x) => x.id === row.dataset.id);
      if (o) details(o);
    }),
    AC.on(host, 'ac:table:action', (e) => {
      const o = e.detail.row; if (!o) return;
      if (e.detail.action === 'view') details(o);
      else if (e.detail.action === 'invoice') location.hash = `#/invoice?id=${encodeURIComponent(o.id)}`;
    }),
    AC.on(host, 'ac:table:bulk', (e) => {
      if (e.detail.action === 'ship') { ship(e.detail.ids); table.clearSelection(); }
      else if (e.detail.action === 'export') table.exportCSV('orders');
    }),
    AC.on(root, 'click', '[data-ord-export]', () => table.exportCSV('orders')),
  ];
  return () => { offs.forEach((f) => f()); table.destroy(); };
}
