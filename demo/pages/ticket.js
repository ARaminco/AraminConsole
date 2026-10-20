/* Ticket detail (full page) — #/ticket?id=T-1048 */
import { tickets, ticketAgents, cannedReplies, ticketMacros } from '../data.js';

export default function mount(root, AC) {
  let alive = true; let off = () => {};
  AC.use('tickets').then(() => { if (alive) off = start(root, AC); }, (err) => console.error('[demo] tickets module failed', err));
  return () => { alive = false; off(); };
}

function start(root, AC) {
  const T = AC.tickets;
  const id = new URLSearchParams(location.hash.split('?')[1] || '').get('id') || tickets[0].id;
  const tk = tickets.find((x) => x.id === id) || tickets[0];
  const host = root.querySelector('[data-tk-detail]');
  const d = T.detail(host, { ticket: tk, agents: ticketAgents, canned: cannedReplies, macros: ticketMacros, tickets, title: false });

  const head = () => {
    root.querySelector('[data-tk-title]').textContent = tk.subject;
    root.querySelector('[data-tk-sub]').innerHTML = `<bdi class="ac-mono">#${AC.escapeHtml(tk.id)}</bdi> · ${AC.escapeHtml(tk.customer.name)} · ${AC.escapeHtml(AC.format.relative(tk.created))}`;
    document.title = `${tk.subject} · AraminConsole`;
    const i = tickets.indexOf(tk);
    const link = (sel, other) => { const a = root.querySelector(sel); if (other) a.href = `#/ticket?id=${encodeURIComponent(other.id)}`; a.toggleAttribute('aria-disabled', !other); };
    link('[data-tk-prev]', tickets[i - 1]); link('[data-tk-next]', tickets[i + 1]);
    const solve = root.querySelector('[data-tk-solve]');
    solve.disabled = tk.status === 'resolved' || tk.status === 'closed';
  };
  head();

  const offs = [
    AC.on(root, 'click', '[data-tk-solve]', () => { d.update({ status: 'resolved' }); head(); AC.toast?.({ title: T.t('sys.resolved'), tone: 'success' }); }),
    AC.on(host, 'ac:tickets:change', head),
    AC.on(document, 'ac:i18n:change', head),
  ];
  return () => { offs.forEach((f) => f()); d.destroy(); };
}
