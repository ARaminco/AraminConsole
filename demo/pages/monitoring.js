/* Monitoring — gauges, realtime area charts (push every 2s), network, per-server cards, alerts. */
import { servers, opsAlerts, rng } from '../data.js';

const N = 60;
const STATUS = { online: ['success', 'ops.st.online', 'آنلاین'], degraded: ['warning', 'ops.st.degraded', 'کند'], offline: ['danger', 'ops.st.down', 'قطع'] };

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  const r = rng(5);
  const list = servers.map((s) => ({ ...s, hist: Array.from({ length: 24 }, () => Math.max(0, Math.min(100, s.cpu + (r() - 0.5) * 24))) }));
  let cur = list.find((s) => s.id === 'api-01') || list[0];
  let paused = false;
  const alerts = opsAlerts.map((a) => ({ ...a }));
  const walk = (v, amp, lo = 2, hi = 98) => Math.round(Math.max(lo, Math.min(hi, v + (Math.random() - 0.5) * amp)) * 10) / 10;
  const clock = (d = new Date()) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

  /* seed history for the selected server */
  function seed(s) {
    const now = Date.now();
    const labels = Array.from({ length: N }, (_, i) => clock(new Date(now - (N - 1 - i) * 2000)));
    let c = s.cpu || 4; let m = s.ram || 6; let ni = 180; let no = 90;
    const cpu = []; const ram = []; const nin = []; const nout = [];
    for (let i = 0; i < N; i++) { c = walk(c, 10); m = walk(m, 3); ni = Math.max(5, ni + (Math.random() - 0.5) * 60); no = Math.max(3, no + (Math.random() - 0.5) * 34); cpu.push(c); ram.push(m); nin.push(Math.round(ni)); nout.push(Math.round(no)); }
    return { labels, cpu, ram, nin, nout };
  }
  let h = seed(cur);

  const usage = AC.chart($('[data-mon-usage]'), { type: 'area', title: 'mon.realtime', animate: false, window: N, yMin: 0, yMax: 100, suffix: '%', labels: h.labels,
    series: [{ name: 'mon.cpu', data: h.cpu, color: 2 }, { name: 'mon.ram', data: h.ram, color: 1 }] });
  const traffic = AC.chart($('[data-mon-traffic]'), { type: 'line', title: 'mon.traffic', animate: false, window: N, zero: true, labels: h.labels,
    series: [{ name: 'mon.in', data: h.nin, color: 1 }, { name: 'mon.out', data: h.nout, color: 2, dashed: true }] });
  const spark = AC.chart($('[data-mon-netspark]'), { type: 'sparkline', animate: false, window: 30, color: 'contrast', series: [h.nin.slice(-30)] });
  const gauges = Object.fromEntries(['cpu', 'ram', 'disk'].map((k) => [k, AC.chart($(`[data-mon-gauge="${k}"]`), { type: 'gauge', label: `mon.${k}`, value: 0, suffix: '%', thresholds: [70, 85] })]));

  function readouts() {
    const last = (a) => a[a.length - 1];
    gauges.cpu.update({ value: cur.status === 'offline' ? 0 : last(h.cpu) });
    gauges.ram.update({ value: cur.status === 'offline' ? 0 : last(h.ram) });
    gauges.disk.update({ value: cur.disk });
    $('[data-mon-in]').textContent = `${AC.format.number(last(h.nin))} Mb/s`;
    $('[data-mon-out]').textContent = `${AC.format.number(last(h.nout))} Mb/s`;
    $('[data-mon-load]').textContent = `load ${(last(h.cpu) / 100 * 8 * 0.42).toFixed(2)}`;
    $('[data-mon-ramtext]').textContent = `${(last(h.ram) / 100 * 32).toFixed(1)} / 32 GB`;
    $('[data-mon-disktext]').textContent = `${Math.round(cur.disk / 100 * 480)} / 480 GB`;
  }
  readouts();

  /* server select + cards */
  const sel = $('[data-mon-server]');
  sel.innerHTML = list.map((s) => `<option value="${s.id}">${esc(s.id)} · ${esc(s.region)}</option>`).join('');
  sel.value = cur.id;
  const cardsHost = $('[data-mon-servers]');
  const bar = (k, v) => `<div class="mon-srv__meter"><span>${k}</span><progress class="ac-progress ac-progress--sm${v >= 85 ? ' ac-progress--danger' : v >= 70 ? ' ac-progress--warning' : ''}" value="${v}" max="100"></progress><b class="ac-num">${Math.round(v)}%</b></div>`;
  function renderCards() {
    cardsHost.innerHTML = list.map((s) => {
      const [tone, key, fa] = STATUS[s.status];
      return `<button type="button" class="ac-card mon-srv" data-id="${s.id}" aria-pressed="${s.id === cur.id}">
        <span class="mon-srv__head"><span class="ops-svc__icon" data-tone="${tone}">${AC.icon(s.status === 'offline' ? 'server-crash' : 'server')}</span>
          <span class="mon-srv__titles"><strong class="ac-mono">${esc(s.id)}</strong><small>${esc(s.region)} · ${esc(s.role)}</small></span>
          <span class="dash-status" data-tone="${tone}">${esc(t(key, fa))}</span></span>
        <span class="mon-srv__spark" data-spark="${s.id}"></span>
        ${bar('CPU', s.cpu)}${bar('RAM', s.ram)}${bar(t('mon.disk', 'Disk'), s.disk)}
        <span class="mon-srv__foot"><span>${esc(t('mon.uptime', 'دسترس‌پذیری'))}</span><b class="ac-num">${AC.format.number(s.uptime, { decimals: 2 })}%</b></span>
      </button>`;
    }).join('');
    for (const s of list) AC.chart(cardsHost.querySelector(`[data-spark="${s.id}"]`), { type: 'sparkline', animate: false, color: s.status === 'offline' ? 'danger' : s.id === cur.id ? 2 : 1, series: [s.status === 'offline' ? s.hist.map(() => 0) : s.hist] });
  }
  renderCards();

  /* top processes */
  const PROCS = [['php-fpm', 0.34], ['mysqld', 0.22], ['node', 0.18], ['nginx', 0.09], ['redis-server', 0.05], ['wapi-gateway', 0.04]];
  const procsHost = $('[data-mon-procs]');
  function renderProcs() {
    const total = cur.status === 'offline' ? 0 : cur.cpu;
    procsHost.innerHTML = PROCS.map(([name, share], i) => {
      const v = Math.max(0, Math.round(total * share * (0.85 + ((i * 37) % 10) / 33) * 10) / 10);
      return `<li class="mon-proc"><span class="ac-mono">${esc(name)}</span><progress class="ac-progress ac-progress--sm" value="${v}" max="40"></progress><b class="ac-num">${v.toFixed(1)}%</b></li>`;
    }).join('');
  }
  renderProcs();

  /* alerts */
  const alertsHost = $('[data-mon-alerts]');
  function renderAlerts() {
    alertsHost.innerHTML = alerts.length ? alerts.map((a) => `<li class="ac-list__item mon-alert" data-id="${a.id}">
      <span class="ac-list__thumb ops-svc__icon" data-tone="${a.tone}">${AC.icon(a.icon)}</span>
      <span class="ac-list__main"><span class="ac-list__title" dir="auto">${esc(a.title)}</span><span class="ac-list__meta"><span class="ac-mono">${esc(a.server)}</span> · ${esc(AC.format.relative(new Date(Date.now() - a.min * 60000)))}</span></span>
      <span class="ac-list__end"><button class="ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost" type="button" data-ack="${a.id}" aria-label="${esc(t('mon.ack', 'تأیید'))}" title="${esc(t('mon.ack', 'تأیید'))}">${AC.icon('check')}</button></span></li>`).join('')
      : `<li class="ac-empty ac-empty--sm"><div class="ac-empty__art">${AC.icon('circle-check-big')}</div><p class="ac-empty__text">${esc(t('mon.noAlerts', 'هشداری باقی نمانده است'))}</p></li>`;
    $('[data-mon-alert-count]').textContent = String(alerts.length);
    $('[data-mon-alert-count]').hidden = !alerts.length;
  }
  renderAlerts();

  function select(id) {
    cur = list.find((s) => s.id === id) || cur;
    sel.value = cur.id;
    h = seed(cur);
    if (cur.status === 'offline') { h.cpu = h.cpu.map(() => 0); h.ram = h.ram.map(() => 0); h.nin = h.nin.map(() => 0); h.nout = h.nout.map(() => 0); }
    usage.update({ labels: h.labels, series: [{ name: 'mon.cpu', data: h.cpu, color: 2 }, { name: 'mon.ram', data: h.ram, color: 1 }] });
    traffic.update({ labels: h.labels, series: [{ name: 'mon.in', data: h.nin, color: 1 }, { name: 'mon.out', data: h.nout, color: 2, dashed: true }] });
    spark.update({ series: [h.nin.slice(-30)] });
    readouts(); renderCards(); renderProcs();
  }

  const tick = () => {
    if (paused || document.hidden) return;
    const off = cur.status === 'offline';
    const last = (a) => a[a.length - 1];
    const c = off ? 0 : walk(last(h.cpu), 12); const m = off ? 0 : walk(last(h.ram), 2.4);
    const ni = off ? 0 : Math.max(5, Math.round(last(h.nin) + (Math.random() - 0.5) * 70)); const no = off ? 0 : Math.max(3, Math.round(last(h.nout) + (Math.random() - 0.5) * 40));
    const label = clock();
    for (const [arr, v] of [[h.cpu, c], [h.ram, m], [h.nin, ni], [h.nout, no]]) { arr.push(v); if (arr.length > N) arr.shift(); }
    h.labels.push(label); if (h.labels.length > N) h.labels.shift();
    usage.push([c, m], label); traffic.push([ni, no], label); spark.push([ni]);
    if (!off) { cur.cpu = c; cur.ram = m; }
    readouts(); renderProcs();
    // other servers drift a little; refresh card meters without rebuilding charts
    for (const s of list) {
      if (s.status === 'offline') continue;
      if (s !== cur) { s.cpu = walk(s.cpu, 6); s.ram = walk(s.ram, 1.5); }
      s.hist.push(s.cpu); s.hist.shift();
      const card = cardsHost.querySelector(`[data-id="${s.id}"]`);
      if (!card) continue;
      const [pc, pr] = card.querySelectorAll('progress'); const [bc, br] = card.querySelectorAll('.mon-srv__meter b');
      pc.value = s.cpu; br.textContent = `${Math.round(s.ram)}%`; pr.value = s.ram; bc.textContent = `${Math.round(s.cpu)}%`;
      AC.instance(card.querySelector('[data-spark]'), 'chart')?.update({ series: [s.hist] });
    }
  };
  const timer = setInterval(tick, 2000);

  const pauseBtn = $('[data-mon-pause]'); const state = $('[data-mon-state]');
  const offs = [
    AC.on(sel, 'change', () => select(sel.value)),
    AC.on(cardsHost, 'click', '.mon-srv', (e, b) => { select(b.dataset.id); if (AC.isMobile()) $('.mon-gauge').scrollIntoView({ behavior: AC.reducedMotion() ? 'auto' : 'smooth', block: 'start' }); }),
    AC.on(pauseBtn, 'click', () => {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.innerHTML = `${AC.icon(paused ? 'play' : 'pause')}<span>${esc(paused ? t('log.resume', 'ادامه') : t('log.pause', 'توقف'))}</span>`;
      state.className = `ac-badge ac-badge--dot ${paused ? 'ac-badge--neutral' : 'ac-badge--success'}`;
      state.textContent = paused ? t('mon.paused', 'متوقف') : t('ops.live', 'زنده');
    }),
    AC.on(alertsHost, 'click', '[data-ack]', (e, b) => {
      const i = alerts.findIndex((a) => a.id === b.dataset.ack); if (i < 0) return;
      const [gone] = alerts.splice(i, 1); renderAlerts();
      AC.toast?.undo ? AC.toast.undo(t('mon.acked', 'هشدار تأیید شد'), () => { alerts.splice(i, 0, gone); renderAlerts(); }) : AC.toast?.({ title: t('mon.acked', 'هشدار تأیید شد') });
    }),
    AC.on(document, 'ac:i18n:change', () => { renderCards(); renderAlerts(); }),
  ];
  return () => { clearInterval(timer); offs.forEach((f) => f()); [usage, traffic, spark, ...Object.values(gauges)].forEach((c) => c.destroy()); };
}
