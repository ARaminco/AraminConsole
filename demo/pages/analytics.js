/* Analytics page — range filter drives the traffic chart, KPI tiles and sparklines. */
import { trafficFor, activity, topPages, referrers } from '../data.js';

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const traffic = AC.chart($('[data-an-traffic]'), { type: 'area', title: 'an.traffic', series: [] });
  const heat = AC.chart($('[data-an-heatmap]'), { type: 'heatmap', title: 'an.heatmap', unit: 'an.events', data: activity });

  function apply(range) {
    const d = trafficFor(range);
    const fmt = d.unit === 'month' ? { month: 'short' } : d.unit === 'week' ? { month: 'short', day: 'numeric' } : range === '7d' ? { weekday: 'short' } : { month: 'short', day: 'numeric' };
    traffic.update({ labels: d.dates, labelFormat: fmt, series: [{ name: 'an.visitors', data: d.visitors }, { name: 'an.sessions', data: d.sessions }] });
    const half = Math.floor(d.visitors.length / 2) || 1;
    for (const k of ['visitors', 'sessions']) {
      const arr = d[k]; const sum = arr.reduce((a, b) => a + b, 0);
      const prev = arr.slice(0, half).reduce((a, b) => a + b, 0); const cur = arr.slice(-half).reduce((a, b) => a + b, 0);
      const pct = prev ? ((cur - prev) / prev) * 100 : 0;
      const kpi = root.querySelector(`[data-an-kpi="${k}"]`); if (kpi) kpi.dataset.to = sum;
      const delta = root.querySelector(`[data-an-delta="${k}"]`);
      if (delta) { delta.dataset.trend = pct >= 0 ? 'up' : 'down'; delta.textContent = `${AC.format.number(Math.abs(pct), { decimals: 1 })}%`; }
      const sp = root.querySelector(`[data-an-spark="${k}"]`);
      AC.instance(sp, 'chart')?.update({ series: [{ name: `an.${k}`, data: arr }], labels: d.dates, labelFormat: fmt });
    }
  }
  apply(AC.instance($('[data-an-range]'), 'segmented')?.value || '30d');

  const pages = AC.table($('[data-an-pages]'), {
    id: 'an-pages', caption: AC.t('an.topPages', 'Top pages'), rows: topPages.map((p, i) => ({ ...p, id: i })), pageSize: 5, pageSizes: null, exportName: 'top-pages', columnsMenu: false,
    sort: { key: 'views', dir: 'desc' },
    columns: [
      { key: 'title', i18n: 'col.page', label: 'صفحه', primary: true, render: (r) => `<div class="ac-table__cell-main"><div><strong class="ac-truncate">${AC.escapeHtml(r.title)}</strong><small class="ac-truncate ac-ltr">${AC.escapeHtml(r.path)}</small></div></div>`, text: (r) => `${r.title} ${r.path}` },
      { key: 'views', i18n: 'col.views', label: 'بازدید', type: 'number' },
      { key: 'unique', i18n: 'col.unique', label: 'یکتا', type: 'number' },
      { key: 'bounce', i18n: 'an.bounce', label: 'نرخ پرش', type: 'progress', text: (r) => `${r.bounce}%` },
      { key: 'time', i18n: 'col.time', label: 'زمان', type: 'number', text: (r) => `${Math.floor(r.time / 60)}m ${r.time % 60}s`, render: (r) => `<span class="ac-ltr">${Math.floor(r.time / 60)}m ${r.time % 60}s</span>` },
    ],
  });
  const refs = AC.table($('[data-an-referrers]'), {
    rows: referrers.map((r, i) => ({ ...r, id: i })), toolbar: false, pagination: false, info: false, columnsMenu: false,
    sort: { key: 'visits', dir: 'desc' },
    columns: [
      { key: 'source', i18n: 'col.source', label: 'منبع', primary: true, render: (r) => `<span class="ac-ltr">${AC.escapeHtml(r.source)}</span>` },
      { key: 'visits', i18n: 'col.visits', label: 'بازدید', type: 'number', compact: true },
      { key: 'change', i18n: 'col.change', label: 'تغییر', type: 'number', render: (r) => `<span class="ac-trend" data-trend="${r.change >= 0 ? 'up' : 'down'}">${AC.format.number(Math.abs(r.change), { decimals: 1 })}%</span>` },
    ],
  });

  const off = AC.on(root, 'ac:segmented:change', (e) => apply(e.detail.value));
  return () => { off(); traffic.destroy(); heat.destroy(); pages.destroy(); refs.destroy(); };
}
