/* Ops console — service grid, 90-day uptime, live log stream, terminal, jobs queue, incidents. */
import { opsServices, uptimeDays, opsJobs, opsIncidents, logs, makeLog } from '../data.js';

const STATUS = {
  online: { tone: 'success', key: 'ops.st.online', fa: 'آنلاین' },
  degraded: { tone: 'warning', key: 'ops.st.degraded', fa: 'کند' },
  down: { tone: 'danger', key: 'ops.st.down', fa: 'قطع' },
};

export default function mount(root, AC) {
  // AC.terminal / AC.uptime come from src/modules/{terminal,uptime} (bundled into the full build)
  const $ = (s) => root.querySelector(s);
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  const services = opsServices.map((s) => ({ ...s }));
  let jobs = opsJobs.map((j) => ({ ...j }));
  const incidents = opsIncidents.map((i) => ({ ...i }));
  let group = 'all';
  const timers = [];
  const every = (ms, fn) => timers.push(setInterval(fn, ms));
  const later = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));

  /* ---------------- services */
  const grid = $('[data-ops-services]');
  function renderServices() {
    grid.innerHTML = services.filter((s) => group === 'all' || s.group === group).map((s) => {
      const st = STATUS[s.status];
      return `<div class="ops-svc" data-status="${s.status}" data-id="${s.id}">
        <div class="ops-svc__head"><span class="ops-svc__icon" data-tone="${st.tone}">${AC.icon(s.icon)}</span>
          <span class="ops-svc__titles"><strong class="ac-truncate">${esc(s.name)}</strong><small class="ac-ltr ac-truncate">${esc(s.host)}</small></span></div>
        <div class="ops-svc__foot"><span class="dash-status" data-tone="${st.tone}">${esc(t(st.key, st.fa))}</span>
          <span class="ops-svc__nums"><b class="ac-num">${AC.format.number(s.uptime, { decimals: s.uptime === 100 ? 0 : 2 })}%</b><small class="ac-num ac-ltr" data-lat>${s.status === 'down' ? '—' : `${s.latency} ms`}</small></span></div>
      </div>`;
    }).join('');
    counts();
  }
  function counts() {
    const n = (st) => services.filter((s) => s.status === st).length;
    const set = (k, v) => { const el = root.querySelector(`[data-ops-count="${k}"]`); if (el) el.dataset.to = v; };
    set('online', n('online')); set('jobs', jobs.filter((j) => j.status === 'running' || j.status === 'queued').length);
    set('incidents', incidents.filter((i) => i.open).length);
    for (const st of ['degraded', 'down']) {
      const b = root.querySelector(`[data-ops-count-label="${st}"]`);
      if (b) { b.textContent = `${n(st)} ${t(STATUS[st].key, STATUS[st].fa)}`; b.hidden = !n(st); }
    }
  }
  renderServices();

  /* ---------------- uptime bars (module) */
  const uptime = AC.uptime($('[data-ops-uptime]'), { labels: { up: 'up', partial: 'degraded', down: 'outage' } });
  const renderUptime = () => uptime.set(services.map((s) => ({ name: s.name, uptime: s.uptime, days: uptimeDays(s) })));
  renderUptime();

  /* ---------------- live log */
  const log = AC.logview($('[data-ops-log]'), { lines: logs.slice(-160), max: 3000, render: 400 });
  const tick = () => { if (!document.hidden) log.push(makeLog()); };
  timers.push(setInterval(tick, 900));
  const svcLog = (level, src, msg) => log.push({ ts: Date.now(), level, src, msg });

  /* ---------------- incidents */
  const incHost = $('[data-ops-incidents]');
  function renderIncidents() {
    incHost.innerHTML = incidents.map((i) => `<li class="ac-timeline__item" data-tone="${i.open ? i.tone : 'success'}">
      <time>${esc(AC.format.relative(new Date(Date.now() - i.min * 60000)))}</time>
      <div class="ac-timeline__body"><strong dir="auto">${esc(i.title)}</strong><p dir="auto">${esc(i.text)}</p>
        <span class="ac-cluster ac-gap-2 ops-inc__meta"><span class="ac-badge ac-mono">${esc(i.id)}</span>
        ${i.open ? `<span class="ac-badge ac-badge--${i.tone} ac-badge--dot">${esc(t('ops.open', 'باز'))}</span><button class="ac-btn ac-btn--sm ac-btn--soft" type="button" data-resolve="${i.id}">${esc(t('ops.resolve', 'رفع شد'))}</button>`
        : `<span class="ac-badge ac-badge--success ac-badge--dot">${esc(t('ops.resolved', 'رفع‌شده'))}</span>`}</span></div></li>`).join('');
  }
  renderIncidents();

  /* ---------------- jobs */
  const JOB_BADGES = {
    running: { tone: 'info', label: 'در حال اجرا', i18n: 'ops.job.running' }, queued: { tone: 'neutral', label: 'در صف', i18n: 'ops.job.queued' },
    failed: { tone: 'danger', label: 'ناموفق', i18n: 'status.failed' }, done: { tone: 'success', label: 'انجام‌شده', i18n: 'status.completed' },
  };
  const table = AC.table($('[data-ops-jobs]'), {
    id: 'ops-jobs', caption: t('ops.jobs', 'Jobs'), rows: jobs, pageSize: 8, pageSizes: null, exportName: 'jobs', sort: { key: 'started', dir: 'desc' },
    columns: [
      { key: 'name', i18n: 'ops.col.job', label: 'کار', primary: true, hideable: false, text: (r) => `${r.name} ${r.target} ${r.id}`,
        render: (r) => `<div class="ac-table__cell-main"><div><strong class="ac-mono ac-ltr">${esc(r.name)}</strong><small class="ac-ltr">${esc(r.target)} · ${esc(r.id)}</small></div></div>` },
      { key: 'queue', i18n: 'ops.col.queue', label: 'صف', filter: 'select', render: (r) => `<span class="ac-badge ac-mono">${esc(r.queue)}</span>` },
      { key: 'status', i18n: 'col.status', label: 'وضعیت', type: 'badge', filter: 'select', badges: JOB_BADGES },
      { key: 'progress', i18n: 'ops.col.progress', label: 'پیشرفت', type: 'progress', mobile: false },
      { key: 'attempts', i18n: 'ops.col.attempts', label: 'تلاش', type: 'number', align: 'end' },
      { key: 'started', i18n: 'ops.col.started', label: 'شروع', type: 'date', sortValue: (r) => +new Date(r.started), render: (r) => `<span class="ac-text-muted ac-text-sm">${esc(AC.format.relative(r.started))}</span>`, text: (r) => AC.format.relative(r.started) },
    ],
    actions: [
      { id: 'retry', icon: 'rotate-ccw', label: 'تلاش دوباره', i18n: 'ops.retry', tone: 'info', when: (r) => r.status === 'failed' },
      { id: 'cancel', icon: 'circle-x', label: 'لغو', i18n: 'ops.cancel', tone: 'danger', when: (r) => r.status === 'running' || r.status === 'queued' },
    ],
  });
  const setJobs = (next) => { jobs = next; table.setRows(jobs); counts(); };

  /* simulated progress */
  every(2400, () => {
    if (document.hidden) return;
    let changed = false;
    const next = jobs.map((j) => {
      if (j.status !== 'running') return j;
      changed = true;
      const p = Math.min(100, j.progress + Math.round(4 + Math.random() * 9));
      if (p >= 100) { svcLog('info', 'worker', `${j.name} (${j.target}) finished`); return { ...j, progress: 100, status: 'done' }; }
      return { ...j, progress: p };
    });
    if (!changed) return;
    // promote one queued job when a slot frees up
    const running = next.filter((j) => j.status === 'running').length;
    if (running < 3) { const q = next.findIndex((j) => j.status === 'queued'); if (q >= 0) next[q] = { ...next[q], status: 'running', progress: 2, started: new Date().toISOString() }; }
    setJobs(next);
  });
  /* latency jitter */
  every(3000, () => {
    if (document.hidden) return;
    for (const s of services) {
      if (s.status === 'down') continue;
      s.latency = Math.max(1, Math.round(s.latency * (0.85 + Math.random() * 0.3)));
      const el = grid.querySelector(`[data-id="${s.id}"] [data-lat]`);
      if (el) el.textContent = `${s.latency} ms`;
    }
  });

  /* ---------------- terminal (module) */
  const pad = (v, n) => esc(String(v).padEnd(n, ' ')).replace(/ /g, '&nbsp;');
  const findSvc = (q) => services.find((s) => s.id === q || s.name.toLowerCase() === q);
  const term = AC.terminal($('[data-ops-term]'), {
    title: 'ali@srv.cohub.co', placeholder: 'status · restart wapi-2 · help', chips: ['status', 'restart wapi-2', 'queue', 'help'],
    greeting: `AraminConsole ops shell · ${esc(new Date().toUTCString())}<br>type <b>help</b> to list commands`,
    unknown: ({ argv, print }) => print(`command not found: ${esc(argv[0])} — type help`, 'err'),
    commands: {
      help: ({ print }) => print([
        ['status', 'service health overview'], ['restart &lt;service&gt;', 'restart one service (asks first)'], ['queue', 'background jobs summary'],
        ['incidents', 'open incidents'], ['uptime', '90-day availability'], ['whoami · date · clear', ''],
      ].map(([c, d]) => `<span class="t-cmd">${c.padEnd(22, ' ').replace(/ /g, '&nbsp;')}</span><span class="t-muted">${d}</span>`).join('<br>')),
      status: ({ print }) => print(services.map((s) => `<span class="${s.status === 'online' ? 't-ok' : s.status === 'down' ? 't-err' : 't-warn'}">●</span> ${pad(s.id, 10)} <span class="t-muted">${pad(s.status, 9)} ${s.status === 'down' ? '—' : `${s.latency}ms`}</span>`).join('<br>')),
      queue: ({ print }) => { const by = (st) => jobs.filter((j) => j.status === st).length; print(`running <b>${by('running')}</b> · queued <b>${by('queued')}</b> · failed <b class="t-err">${by('failed')}</b> · done <b>${by('done')}</b>`); },
      incidents: ({ print }) => { const open = incidents.filter((i) => i.open); print(open.length ? open.map((i) => `<span class="t-warn">${esc(i.id)}</span> ${esc(i.service)}`).join('<br>') : 'no open incidents', open.length ? '' : 'ok'); },
      uptime: ({ print }) => print(services.map((s) => `${pad(s.id, 10)} ${s.uptime.toFixed(2)}%`).join('<br>')),
      whoami: ({ print }) => print('ali · role=owner · scope=srv.cohub.co'),
      date: ({ print }) => print(esc(new Date().toString())),
      restart: async ({ args, print }) => {
        if (!args) return print('usage: restart &lt;service&gt;', 'err');
        if (args === 'all' || args === '*') return print('refused: restarting everything on a shared server is blocked — name one service', 'err');
        const s = findSvc(args);
        if (!s) return print(`unknown service "${esc(args)}" — try: ${services.map((x) => x.id).join(', ')}`, 'err');
        const ok = await AC.confirm({ tone: 'warning', icon: 'rotate-cw', title: t('ops.restartTitle', 'راه‌اندازی مجدد {name}؟', { name: s.name }),
          text: t('ops.restartText', 'فقط همین سرویس دوباره راه‌اندازی می‌شود.'), confirmText: t('ops.restart', 'راه‌اندازی مجدد') });
        if (!ok) return print('cancelled', 'muted');
        for (const step of [`backup config → /var/backups/${s.id}-${Date.now().toString(36)}.tgz`, 'config test … ok', `systemctl restart ${s.id}`, `probe https://${s.host}/health`]) {
          print(`<span class="t-muted">›</span> ${esc(step)}`); await later(AC.reducedMotion() ? 0 : 420);
        }
        const prev = s.status; s.status = 'online'; s.latency = Math.round(20 + Math.random() * 120);
        print(`✓ ${esc(s.id)} healthy (200 OK, ${s.latency}ms)`, 'ok');
        svcLog('info', 'deploy', `${s.id} restarted by ali — ${prev} → online`);
        renderServices();
        AC.toast?.({ title: t('ops.restarted', '{name} دوباره راه‌اندازی شد', { name: s.name }), tone: 'success' });
      },
    },
  });

  const offs = [
    AC.on(root, 'click', '[data-ops-term-clear]', () => term.clear()),
    AC.on(root, 'click', '[data-ops-focus-term]', () => { $('[data-ops-term]').scrollIntoView({ block: 'center', behavior: AC.reducedMotion() ? 'auto' : 'smooth' }); term.focus(); }),
    AC.on(root, 'click', '[data-ops-refresh]', () => { renderServices(); renderUptime(); AC.toast?.({ title: t('ops.refreshed', 'وضعیت به‌روز شد'), tone: 'info' }); }),
    AC.on(root, 'ac:segmented:change', (e) => { if (e.target.closest('[data-ops-group]')) { group = e.detail.value; renderServices(); } }),
    AC.on(root, 'click', '[data-resolve]', (e, b) => {
      const inc = incidents.find((i) => i.id === b.dataset.resolve);
      if (!inc) return;
      inc.open = false; renderIncidents(); counts();
      svcLog('info', 'ops', `${inc.id} resolved by ali`);
      AC.toast?.({ title: t('ops.incResolved', '{id} بسته شد', { id: inc.id }), tone: 'success' });
    }),
    AC.on($('[data-ops-jobs]'), 'ac:table:action', async (e) => {
      const { action, row } = e.detail;
      if (!row) return;
      if (action === 'retry') {
        setJobs(jobs.map((j) => (j.id === row.id ? { ...j, status: 'queued', progress: 0, attempts: j.attempts + 1 } : j)));
        svcLog('info', 'worker', `${row.name} re-queued`);
        AC.toast?.({ title: t('ops.requeued', 'دوباره در صف قرار گرفت'), tone: 'info' });
      } else if (action === 'cancel' && await AC.confirm({ tone: 'danger', title: t('ops.cancelJob', 'لغو {name}؟', { name: row.name }), confirmText: t('ops.cancel', 'لغو') })) {
        setJobs(jobs.map((j) => (j.id === row.id ? { ...j, status: 'failed', progress: 0 } : j)));
        svcLog('warn', 'worker', `${row.name} cancelled by ali`);
      }
    }),
    AC.on(document, 'ac:i18n:change', () => { renderServices(); renderUptime(); renderIncidents(); }),
  ];

  return () => { timers.forEach((id) => { clearInterval(id); clearTimeout(id); }); offs.forEach((f) => f()); table.destroy(); log.destroy?.(); term.destroy(); uptime.destroy(); };
}
