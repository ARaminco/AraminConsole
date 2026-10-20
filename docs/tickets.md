# Tickets module (help desk)

Optional module: `src/modules/tickets/{tickets.js,tickets.css,module.json}` (dependencies: `table`, `overlays`, `forms`, `apps`).
Load it with `await AC.use('tickets')` (lazy bundle `dist/modules/tickets.js`) or ship it in the full / custom build.
Demo: `#/tickets` (agent inbox), `#/ticket?id=T-1048` (full page), `#/my-tickets` (customer portal), `#/me` (status chips).
Tests: `node tests/tickets.mjs --base=http://localhost:5178`.

## Data shape
```js
{ id: 'T-1048', subject, customer: { name, email, initials, color }, channel: 'email|chat|phone|web',
  category: 'billing|technical|account|sales|shipping|other', priority: 'urgent|high|normal|low',
  status: 'new|open|pending|resolved|closed', assignee: agentId | null, tags: [],
  created, updated, due /* SLA deadline, ISO or null */, slaTotal /* SLA window, minutes */, csat: 1..5 | null,
  messages: [{ id, from: 'customer|agent|note|system', author, text, time, attachments: [{ name, size, type: 'image|pdf|file' }] }] }
// agents: [{ id, name, initials, color, role, online, me }]   canned: [{ id, title, text /* {name} = customer first name */ }]
// macros: [{ id, title, icon, set: { status|priority|assignee }, tag, note, reply /* canned id */ }]
```

## Inbox — `AC.tickets.inbox(el, cfg)`
```js
const inbox = AC.tickets.inbox(el, { tickets, agents, me: 'ar', view: 'all', pageSize: 10 });
inbox.view('overdue'); inbox.add(ticket); inbox.update(ticket); inbox.set(list); inbox.refresh(); inbox.table; inbox.destroy();
el.addEventListener('ac:tickets:open', (e) => { e.preventDefault(); openDrawerOrPush(e.detail.ticket); });
```
Queue views (segmented, live counts, overdue count in red): all · mine · unassigned · overdue. Built on `AC.table`: search,
priority / status / assignee filters, sort (default: nearest SLA first), CSV, row actions (assign to me, close),
bulk actions (assign → agent menu, priority, close). Subject cells link to `#/ticket?id=…`; Ctrl/⌘-click opens the page.
Events: `ac:tickets:open {id, ticket}` (cancelable), `ac:tickets:change {ticket, change}`, `ac:tickets:bulk {action, ids}`.

## Detail — `AC.tickets.detail(el, cfg)`
```js
const d = AC.tickets.detail(el, { ticket, agents, canned, macros, tickets /* for merge */,
  view: 'agent' | 'customer', screen: false, back: false | true | 'close', full: '#/ticket?id=…', title: true, intro: Element });
d.update({ status: 'resolved' }); d.receive(message); d.set(otherTicket); d.destroy();
```
- Thread: customer bubbles (start), agent bubbles (ink, end), **internal notes in yellow** with a lock, centred system events, attachments.
- Composer: «پاسخ به مشتری» / «یادداشت داخلی» tabs, auto-growing textarea, attachments, canned-reply picker (button or `/` on an
  empty composer; popover on desktop, sheet on phones; ↑ ↓ Enter), macros menu, Ctrl+Enter sends, split button «send and set status».
- Sidebar: live SLA timer (HH:MM:SS + progress, at-risk / breached tones), status / priority / assignee, category, channel, tags
  (Enter adds), customer card, CSAT (face + rating) or «request rating», activity log. Every change appends a system event.
- Container-query layout: ≥ 56rem → two columns with a sticky sidebar; narrower (drawer, phone) → the sidebar opens as a sheet («جزئیات»).
- `screen: true` fills its parent (phone pushed screen, drawer, portal) with the composer pinned at the bottom (safe area aware).
  Without `screen`, below 1024px the composer is sticky above the tab bar.
- `view: 'customer'`: notes hidden, perspective flipped, no internal tools, no composer on closed tickets.
- Merge (agent): menu of the customer's other tickets → confirm → messages move, this ticket closes. Event `ac:tickets:merge`.

## Phone push (list → detail)
```html
<div class="ac-split ac-tk-split" data-ac="split">
  <div class="ac-split__pane">…inbox…</div>
  <div class="ac-split__pane ac-tk-screen" data-tk-screen></div>   <!-- hidden on wide screens -->
</div>
```
On `ac:tickets:open`, phones: `AC.tickets.detail(screen, { screen: true, back: true })` + `AC.instance(split,'split').push(1)`;
desktop: `AC.drawer.open({ content, size: 'lg', closeButton: false, className: 'ac-tk-drawer' })` + `detail(…, { back: 'close' })`.

## Other helpers
- `AC.tickets.create({ agents, customer, nextId })` → Promise<ticket | null>: modal (sheet on phones) with category cards, validation.
- `AC.tickets.track(el, ticket)`: customer timeline new → in review → answered → resolved (horizontal ≥ 34rem, vertical below).
- `AC.tickets.sla(due, total)` → `{ text, tone, overdue, ratio }`; `statusChip(s)`, `priorityChip(p)`, `slaChip(ticket)` HTML;
  `<span data-ac="sla" data-due="ISO" data-total="240"></span>` live countdown chip (shared 20 s ticker, ringing alarm when overdue).

## i18n
Built-in fa / en / ar strings; override any with app keys `tickets.<key>` (e.g. `tickets.status.pending`). Numbers use `AC.format`.
