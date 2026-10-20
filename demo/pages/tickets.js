/* Tickets (admin) — lazy-loads the tickets module (AC.use('tickets') → src/modules/tickets): inbox over demo/data.js. Desktop: quick view in a drawer; phones: push the detail screen. */
import { tickets, ticketAgents, cannedReplies, ticketMacros } from '../data.js';

export default function mount(root, AC) {
  let alive = true; let off = () => {};
  AC.use('tickets').then(() => { if (alive) off = start(root, AC); }, (err) => console.error('[demo] tickets module failed', err));
  return () => { alive = false; off(); };
}

function start(root, AC) {
  const T = AC.tickets;
  const host = root.querySelector('[data-tk-inbox]');
  const screen = root.querySelector('[data-tk-screen]');
  const split = root.querySelector('.ac-tk-split');
  let detail = null;
  let drawerOpen = null;

  const inbox = T.inbox(host, { tickets, agents: ticketAgents, pageSize: 8 });

  const kpis = () => {
    const open = tickets.filter((x) => !['resolved', 'closed'].includes(x.status));
    const set = (k, v) => { const el = root.querySelector(`[data-tk-kpi="${k}"]`); if (el) el.dataset.to = String(v); };
    set('open', open.length);
    set('overdue', open.filter((x) => x.due && new Date(x.due) < Date.now()).length);
    root.querySelector('[data-tk-team]').innerHTML = ticketAgents.map((a) => {
      const n = open.filter((x) => x.assignee === a.id).length;
      return `<li class="ac-list__item"><span class="ac-avatar ac-avatar--sm" data-color="${a.color}" aria-hidden="true">${AC.escapeHtml(a.initials)}</span>
        <span class="ac-list__main"><span class="ac-list__title">${AC.escapeHtml(a.name)}</span><span class="ac-list__meta"><span class="ac-status" data-status="${a.online ? 'online' : 'offline'}"></span> ${AC.escapeHtml(a.role)}</span></span>
        <span class="ac-list__end"><progress class="ac-progress ac-progress--sm ac-tk-load" value="${n}" max="5" aria-label="${n}"></progress><b class="ac-num">${AC.format.number(n)}</b></span></li>`;
    }).join('');
  };
  kpis();

  const opts = (tk, extra) => ({ ticket: tk, agents: ticketAgents, canned: cannedReplies, macros: ticketMacros, tickets, screen: true, ...extra });
  const openTicket = (tk) => {
    if (AC.instance(split, 'split')?.stacked) {
      detail?.destroy();
      detail = T.detail(screen, opts(tk, { back: true }));
      AC.instance(split, 'split').push(1);
      return;
    }
    const body = AC.h('div', { class: 'ac-tk-drawer__host' });
    const layer = AC.drawer.open({ content: body, size: 'lg', side: 'end', closeButton: false, className: 'ac-tk-drawer', label: tk.subject });
    const d = T.detail(body, opts(tk, { back: 'close', full: `#/ticket?id=${encodeURIComponent(tk.id)}` }));
    drawerOpen = { layer, d };
    body.closest('.ac-drawer')?.addEventListener('ac:drawer:closed', () => { d.destroy(); if (drawerOpen?.d === d) drawerOpen = null; inbox.refresh(); kpis(); }, { once: true });
  };

  const offs = [
    AC.on(host, 'ac:tickets:open', (e) => { e.preventDefault(); openTicket(e.detail.ticket); }),
    AC.on(root, 'ac:tickets:change', () => { kpis(); }),
    AC.on(split, 'ac:split:change', (e) => { if (e.detail.depth === 0) { inbox.refresh(); kpis(); } }),
    AC.on(root, 'click', '[data-tk-new]', async () => {
      const tk = await T.create({ agents: ticketAgents, nextId: () => `T-${1049 + tickets.length - 14}` });
      if (tk) { tickets.unshift(tk); inbox.refresh(); kpis(); }
    }),
  ];
  return () => { offs.forEach((f) => f()); detail?.destroy(); drawerOpen?.layer?.close?.(); inbox.destroy(); };
}
