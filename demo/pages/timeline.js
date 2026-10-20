/* Timeline page — activity grouped by day, filter chips, load older events. */
import { activityLog, team } from '../data.js';

const KIND = { 'git-merge': 'deploy', rocket: 'deploy', 'message-square': 'people', 'user-plus': 'people', 'file-text': 'people', 'circle-check': 'people', 'shield-check': 'alert', 'triangle-alert': 'alert', 'credit-card': 'people' };

export default function mount(root, AC) {
  const { escapeHtml: esc, icon, t, format } = AC;
  const listEl = root.querySelector('[data-tl-list]');
  let events = activityLog.map((e) => ({ ...e }));
  let filter = 'all'; let older = 0;
  const who = (id) => team.find((m) => m.id === id) || team[0];
  const dayKey = (iso) => new Date(iso).toDateString();
  const dayLabel = (iso) => {
    const d = Math.round((new Date(new Date().toDateString()) - new Date(dayKey(iso))) / 86400000);
    return d === 0 ? t('cal.today', 'امروز') : d === 1 ? t('tl.yesterday', 'دیروز') : format.date(iso, { weekday: 'long', day: 'numeric', month: 'long' });
  };

  function render(fromIndex = 0) {
    const rows = events.filter((e) => filter === 'all' || KIND[e.icon] === filter);
    let html = ''; let last = '';
    rows.forEach((e, i) => {
      if (dayKey(e.day) !== last) { if (last) html += '</ol>'; last = dayKey(e.day); html += `<h3 class="ac-activity__day"><span>${esc(dayLabel(e.day))}</span></h3><ol class="ac-activity__list">`; }
      const p = who(e.who);
      html += `<li class="ac-activity__item${i >= fromIndex && fromIndex ? ' is-new' : ''}" data-tone="${e.tone}">
        <span class="ac-activity__node">${icon(e.icon)}</span>
        <div class="ac-activity__body">
          <p class="ac-activity__title"><span class="ac-avatar ac-avatar--xs" data-color="${p.color}">${esc(p.initials)}</span><strong>${esc(p.name)}</strong> <span>${esc(e.title)}</span></p>
          ${e.text ? `<p class="ac-activity__text" dir="auto">${esc(e.text)}</p>` : ''}
          <div class="ac-activity__meta"><time><bdi>${esc(e.time)}</bdi></time>${e.tags.map((g) => `<span class="ac-badge ac-badge--neutral"><bdi>${esc(g)}</bdi></span>`).join('')}</div>
        </div></li>`;
    });
    listEl.innerHTML = rows.length ? `${html}</ol>` : `<p class="ac-cal-empty">${esc(t('files.emptyT', 'چیزی پیدا نشد'))}</p>`;
  }
  function people() {
    const counts = {}; events.forEach((e) => { counts[e.who] = (counts[e.who] || 0) + 1; });
    root.querySelector('[data-tl-people]').innerHTML = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => { const p = who(id); return `<li class="ac-list__item"><span class="ac-avatar ac-avatar--sm" data-color="${p.color}">${esc(p.initials)}</span><span class="ac-list__main"><span class="ac-list__title">${esc(p.name)}</span></span><span class="ac-list__end ac-num"><bdi>${n}</bdi></span></li>`; }).join('');
  }
  render(); people();

  const offs = [
    AC.on(root, 'ac:segmented:change', (e) => { if (e.target.matches('[data-tl-filter]')) { filter = e.detail.value; render(); } }),
    AC.on(root, 'click', '[data-tl-more]', async (e, b) => {
      b.setAttribute('aria-busy', 'true'); b.disabled = true;
      await new Promise((r) => setTimeout(r, 600));
      const start = events.length; older += 7;
      events = events.concat(activityLog.slice(0, 5).map((x, i) => ({ ...x, id: `o${older}${i}`, day: new Date(new Date(x.day).getTime() - older * 86400000).toISOString() })));
      render(start); people();
      b.removeAttribute('aria-busy'); b.disabled = older >= 21;
    }),
    AC.on(root, 'click', '[data-tl-export]', () => AC.toast?.({ title: t('tl.exported', 'خروجی آماده شد'), tone: 'success', duration: 1800 })),
    AC.on(document, 'ac:i18n:change', () => { render(); people(); }),
  ];
  return () => offs.forEach((f) => f());
}
