/*! AraminConsole v0.1.0 — module chart — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');

/* ======== module: chart ======== */
if (!__R["chart"]) __R["chart"] = (() => {
const F = {};
const __ac_m1 = __R["core"].f["js/core.js"];
/* ---- js/components/chart.js ---- */
const __ac_m6 = F["js/components/chart.js"] = (() => {
const { AC, register, instance, on, emit, options, format, i18n, isRTL, reducedMotion, rafThrottle, escapeHtml, uid, clamp } = __ac_m1;
/* Charts — inline SVG, zero dependencies.
   <div class="ac-chart-slot" data-ac="chart" data-ac-config='{"type":"area","labels":"months:12","series":[{"name":"Income","data":[…]}]}'></div>
   AC.chart(el, cfg) → { update(series|cfg), push(values, label), set(cfg), redraw(), destroy() }
   Types: line area bar (stacked, horizontal) donut pie gauge sparkline heatmap funnel. Docs: docs/data.md */


const NS = 'http://www.w3.org/2000/svg';
const AUTO_H = { heatmap: 1, funnel: 1 };
const CART = { line: 1, area: 1, bar: 1, sparkline: 1 };
const R = (v) => Math.round(v * 10) / 10;
const tr = (s) => (typeof s === 'string' && /^[a-z][\w-]*\.[\w.-]+$/i.test(s) ? AC.t(s, s) : s);
const isDate = (x) => x instanceof Date || (typeof x === 'string' && /^\d{4}-\d\d-\d\d/.test(x));
const esc = escapeHtml;

function nice(lo, hi, n) {
  if (hi === lo) hi = lo + (lo ? Math.abs(lo) : 1);
  const raw = (hi - lo) / n; const mag = 10 ** Math.floor(Math.log10(raw)); const f = raw / mag;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  const a = Math.floor(lo / step) * step; const b = Math.ceil(hi / step) * step; const ticks = [];
  for (let v = a; v <= b + step / 2; v += step) ticks.push(+v.toFixed(10));
  return { lo: a, hi: b, ticks };
}

function curve(pts, smooth) {
  const n = pts.length;
  if (!n) return '';
  let d = `M${R(pts[0][0])},${R(pts[0][1])}`;
  if (!smooth || n < 3) { for (let i = 1; i < n; i++) d += `L${R(pts[i][0])},${R(pts[i][1])}`; return d; }
  const dx = []; const m = []; const t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / (dx[i] || 1); }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${R(pts[i][0] + h)},${R(pts[i][1] + h * t[i])} ${R(pts[i + 1][0] - h)},${R(pts[i + 1][1] - h * t[i + 1])} ${R(pts[i + 1][0])},${R(pts[i + 1][1])}`;
  }
  return d;
}

function rbar(x, y, w, h, r, horiz) {
  if (w <= 0.2 || h <= 0.2) return '';
  [x, y, w, h] = [R(x), R(y), R(w), R(h)];
  if (!horiz) { r = R(Math.min(r, w / 2, h)); return `M${x},${R(y + h)}V${R(y + r)}Q${x},${y} ${R(x + r)},${y}H${R(x + w - r)}Q${R(x + w)},${y} ${R(x + w)},${R(y + r)}V${R(y + h)}Z`; }
  r = R(Math.min(r, h / 2, w));
  return `M${x},${y}H${R(x + w - r)}Q${R(x + w)},${y} ${R(x + w)},${R(y + r)}V${R(y + h - r)}Q${R(x + w)},${R(y + h)} ${R(x + w - r)},${R(y + h)}H${x}Z`;
}

function arc(cx, cy, r, a0, a1) {
  const p = (a) => [R(cx + r * Math.cos((a * Math.PI) / 180)), R(cy + r * Math.sin((a * Math.PI) / 180))];
  const [x0, y0] = p(a0); const [x1, y1] = p(a1);
  return `M${x0},${y0}A${R(r)},${R(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
}

const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`; };

function genLabels(spec, n, fmt) {
  if (Array.isArray(spec)) return spec.map((x) => (isDate(x) ? format.date(x, fmt || { month: 'short', day: 'numeric' }) : tr(String(x))));
  const [kind, cnt] = String(spec || '').split(':');
  const k = Number(cnt) || n; const out = []; const now = new Date();
  if (!kind) return Array.from({ length: n }, (_, i) => String(i + 1));
  for (let i = k - 1; i >= 0; i--) {
    const d = new Date(now);
    if (kind === 'months') { d.setDate(15); d.setMonth(d.getMonth() - i); out.push(format.date(d, { month: 'short' })); }
    else { d.setDate(d.getDate() - i); out.push(format.date(d, kind === 'days' ? { weekday: 'short' } : { month: 'short', day: 'numeric' })); }
  }
  return out;
}

function create(el, cfg) {
  let c = { ...cfg };
  let hidden = new Set();
  let geo = null; let active = -1; let W = 0; let H = 0; let rtl = false; let animTimer = 0;
  let pending = document.documentElement.dataset.motion !== 'off' && c.animate !== false; // reduced: CSS turns growth into a fade
  let morphNext = false; const canMorph = typeof CSS !== 'undefined' && CSS.supports?.('d', 'path("M0 0")');
  el.classList.add('ac-chart');
  el.setAttribute('role', 'figure');
  el.textContent = '';
  const legendEl = document.createElement('div'); legendEl.className = 'ac-chart__legend';
  const plot = document.createElement('div'); plot.className = 'ac-chart__plot'; plot.tabIndex = 0;
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'ac-chart__svg'); svg.setAttribute('aria-hidden', 'true');
  const tip = document.createElement('div'); tip.className = 'ac-chart__tip'; tip.setAttribute('role', 'status'); tip.setAttribute('aria-live', 'polite');
  const table = document.createElement('table'); table.className = 'ac-visually-hidden';
  plot.append(svg, tip); el.append(legendEl, plot, table);

  const num = (v, compact) => `${c.prefix ?? ''}${format.number(v, { ...(c.format || {}), ...(compact ? { compact: true } : {}) })}${c.suffix ?? ''}`;

  function model() {
    const type = c.type || 'line';
    let s = c.series || [];
    const single = typeof s[0] === 'number' || s[0] == null || (type !== 'heatmap' && !Array.isArray(s[0]) && !s[0].data);
    if (single && (type === 'donut' || type === 'pie' || type === 'funnel')) {
      const vals = s.map(Number);
      return { type, slices: vals.map((v, i) => ({ v, name: tr(String(c.labels?.[i] ?? i + 1)), c: c.colors?.[i] || (type === 'funnel' ? c.color || 1 : (i % 8) + 1), hidden: hidden.has(i) })) };
    }
    if (typeof s[0] === 'number') s = [s];
    const series = s.map((x, i) => {
      const o = Array.isArray(x) ? { data: x } : x;
      return { ...o, name: tr(o.name ?? `#${i + 1}`), c: o.color || (i === 0 && (c.color || c.tone)) || (i % 8) + 1, hidden: hidden.has(i), i };
    });
    const n = Math.max(0, ...series.map((x) => x.data?.length || 0));
    return { type, series, labels: genLabels(c.labels, n, c.labelFormat) };
  }

  function renderLegend(m) {
    const items = m.slices || m.series;
    const show = c.legend ?? (m.series && m.series.length > 1 && m.type !== 'sparkline');
    legendEl.hidden = !show || !items || m.type === 'heatmap' || m.type === 'gauge';
    if (legendEl.hidden) { legendEl.textContent = ''; return; }
    legendEl.innerHTML = items.map((s, i) => `<button type="button" class="ac-chart__key" data-i="${i}" aria-pressed="${!s.hidden}"><i class="ac-chart__sw" data-c="${esc(s.c)}"></i>${esc(s.name)}</button>`).join('');
  }

  function render() {
    const m = model();
    el.dataset.type = m.type;
    el.classList.toggle('ac-chart--auto', !!AUTO_H[m.type]);
    if (!AUTO_H[m.type] && el.clientHeight < 24) { el.classList.add('ac-chart--h'); el.style.setProperty('--ac-chart-h', `${c.height || 240}px`); }
    renderLegend(m);
    rtl = isRTL(el);
    W = Math.max(40, plot.clientWidth); H = Math.max(24, plot.clientHeight);
    const fx = (x) => (rtl ? W - x : x);
    const ctx = { c, m, W, H, rtl, fx, num };
    geo = (CART[m.type] ? cartesian : m.type === 'gauge' ? gauge : m.type === 'heatmap' ? heatmap : m.type === 'funnel' ? funnel : donut)(ctx);
    if (geo.h) { H = geo.h; plot.style.setProperty('--_h', `${H}px`); }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    const before = morphNext && !pending && canMorph ? new Map(Array.from(svg.querySelectorAll('[data-mk]'), (p) => [p.dataset.mk, p.getAttribute('d')])) : null;
    morphNext = false;
    svg.innerHTML = geo.svg;
    if (before && before.size && !reducedMotion()) morph(before);
    if (pending) el.dataset.anim = 'wait';
    hide();
    const label = [tr(c.title || c.ariaLabel || ''), geo.label].filter(Boolean).join(' — ') || (m.series || m.slices || []).map((s) => s.name).join(', ');
    el.setAttribute('aria-label', label);
    plot.setAttribute('aria-label', `${label}${geo.n ? ` — ${AC.t('chart.keys', 'arrow keys to inspect values')}` : ''}`);
    table.innerHTML = geo.table ? `<caption>${esc(label)}</caption>${geo.table}` : '';
  }

  // data changed (update / push / legend toggle): shapes glide to their new geometry instead of jumping
  function morph(before) {
    const { easing, duration } = AC.motion?.springEasing?.(AC.motion.springs.gentle) || { easing: 'ease-out', duration: 500 };
    svg.querySelectorAll('[data-mk]').forEach((p) => {
      const was = before.get(p.dataset.mk); const now = p.getAttribute('d');
      if (was === now) return;
      if (was) { try { p.animate([{ d: `path("${was}")` }, { d: `path("${now}")` }], { duration, easing }); } catch { /* engine without CSS d */ } return; }
      if (p.classList.contains('ac-chart__bar')) p.animate([{ transform: p.hasAttribute('data-h') ? 'scaleX(0)' : 'scaleY(0)', transformBox: 'view-box', transformOrigin: p.hasAttribute('data-h') ? `${p.style.getPropertyValue('--_base')} 0` : `0 ${p.style.getPropertyValue('--_base')}` }, { transform: 'none', transformBox: 'view-box', transformOrigin: p.hasAttribute('data-h') ? `${p.style.getPropertyValue('--_base')} 0` : `0 ${p.style.getPropertyValue('--_base')}` }], { duration, easing });
      else if (p.classList.contains('ac-chart__line')) p.animate([{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 700, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
      else p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    });
  }
  function spot(i) {
    el.toggleAttribute('data-spot', i >= 0);
    svg.querySelectorAll('[data-si]').forEach((n) => n.toggleAttribute('data-spot-on', Number(n.dataset.si) === i));
  }
  function hide() { active = -1; delete plot.dataset.hover; geo?.focus?.(-1, svg); }
  function show(i) {
    if (!geo?.tip || i < 0 || i >= geo.n) return hide();
    active = i;
    const t = geo.tip(i);
    geo.focus?.(i, svg);
    tip.innerHTML = t.html;
    plot.dataset.hover = '';
    const tw = tip.offsetWidth; const th = tip.offsetHeight;
    const x = clamp(rtl && !t.abs ? W - t.x : t.x, tw / 2 + 2, W - tw / 2 - 2);
    const below = t.y - th - 14 < -8;
    tip.toggleAttribute('data-below', below);
    tip.style.setProperty('--x', `${R(x)}px`);
    tip.style.setProperty('--y', `${R(below ? t.y + 14 : t.y)}px`);
  }
  const point = (e) => {
    if (!geo?.hit) return;
    const r = plot.getBoundingClientRect();
    const px = e.clientX - r.left; const py = e.clientY - r.top;
    const i = geo.hit(rtl ? W - px : px, py);
    if (i !== active) (i < 0 ? hide() : show(i));
  };
  const offs = [
    on(plot, 'pointermove', point),
    on(plot, 'pointerdown', point),
    on(plot, 'pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); }),
    on(plot, 'blur', hide),
    on(plot, 'keydown', (e) => {
      if (!geo?.n) return;
      const fwd = rtl ? 'ArrowLeft' : 'ArrowRight'; const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      const map = { [fwd]: 1, ArrowDown: 1, [back]: -1, ArrowUp: -1 };
      let i = active;
      if (e.key in map) i = active < 0 ? 0 : clamp(active + map[e.key], 0, geo.n - 1);
      else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = geo.n - 1;
      else if (e.key === 'Escape') return hide(); else return;
      e.preventDefault(); show(i);
    }),
    on(legendEl, 'click', '.ac-chart__key', (e, b) => {
      const i = Number(b.dataset.i); const total = legendEl.children.length;
      if (!hidden.has(i) && hidden.size >= total - 1) return;
      hidden.has(i) ? hidden.delete(i) : hidden.add(i);
      emit(el, 'chart:toggle', { index: i, hidden: hidden.has(i) });
      morphNext = true; render(); spot(-1);
    }),
    on(legendEl, 'pointerover', '.ac-chart__key', (e, b) => { if (e.pointerType === 'mouse' && b.getAttribute('aria-pressed') !== 'false') spot(Number(b.dataset.i)); }),
    on(legendEl, 'pointerleave', () => spot(-1)),
    on(document, 'ac:theme:change', () => requestAnimationFrame(render)),
    on(document, 'ac:i18n:change', () => requestAnimationFrame(render)),
  ];
  const ro = new ResizeObserver(rafThrottle(() => { if (Math.abs(plot.clientWidth - W) > 1 || (!geo?.h && Math.abs(plot.clientHeight - H) > 1)) render(); }));
  ro.observe(plot);
  const io = new IntersectionObserver((en) => {
    if (!en.some((x) => x.isIntersecting)) return;
    io.disconnect();
    if (!pending) return;
    pending = false; el.dataset.anim = 'run';
    animTimer = setTimeout(() => delete el.dataset.anim, 1400);
  }, { threshold: 0.15 });
  io.observe(el);
  render();

  const api = {
    el,
    get config() { return c; },
    set(next) { c = { ...c, ...next }; hidden = new Set(); morphNext = true; render(); return api; },
    update(next) { if (Array.isArray(next)) c.series = next; else Object.assign(c, next); morphNext = true; render(); if (active >= 0) show(Math.min(active, geo.n - 1)); return api; },
    push(values, label) {
      const vals = Array.isArray(values) ? values : [values];
      const list = (c.series || []).map((s) => (Array.isArray(s) ? { data: s } : s));
      const max = c.window || Math.max(...list.map((s) => s.data.length));
      list.forEach((s, i) => { s.data = [...s.data, vals[i] ?? null].slice(-max); });
      if (Array.isArray(c.labels)) c.labels = [...c.labels, label ?? ''].slice(-max);
      return api.update({ series: list });
    },
    redraw: render,
    destroy() { offs.forEach((f) => f()); ro.disconnect(); io.disconnect(); clearTimeout(animTimer); },
  };
  return api;
}

/* ---------------------------------------------------------------- cartesian: line area bar sparkline */
function cartesian({ c, m, W, H, rtl, fx, num }) {
  const spark = m.type === 'sparkline';
  const bar = m.type === 'bar'; const horiz = bar && !!c.horizontal; const stacked = bar && !!c.stacked;
  const vis = m.series.filter((s) => !s.hidden);
  const labels = m.labels; const n = labels.length;
  let lo = Infinity; let hi = -Infinity;
  if (stacked) for (let i = 0; i < n; i++) { let p = 0; let q = 0; vis.forEach((s) => { const v = +s.data[i] || 0; if (v >= 0) p += v; else q += v; }); hi = Math.max(hi, p); lo = Math.min(lo, q); }
  else vis.forEach((s) => s.data.forEach((v) => { if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
  if (!isFinite(lo)) { lo = 0; hi = 1; }
  if (spark) { const pad = (hi - lo || 1) * 0.15; lo -= pad; hi += pad; }
  else if (c.yMin != null) lo = c.yMin;
  else if (lo >= 0 && (bar || m.type === 'area' || c.zero)) lo = 0;
  else lo -= (hi - lo) * 0.08;
  if (c.yMax != null) hi = c.yMax;
  const axis = !spark && c.axis !== false;
  const sc = spark ? { lo, hi, ticks: [] } : nice(lo, hi, horiz ? Math.max(2, Math.min(5, Math.floor(W / 110))) : Math.max(2, Math.min(5, Math.floor(H / 52))));
  const ticks = sc.ticks.map((v) => num(v, true));
  const CW = 6.3;
  const tw = (t) => [...String(t)].reduce((a, ch) => a + (/[؀-ۿ]/.test(ch) ? 5.6 : /s/.test(ch) ? 3 : 6.5), 0);
  const longest = (arr) => Math.max(0, ...arr.map(tw));
  let x0; let x1; let y0; let y1;
  if (spark) { x0 = 0; x1 = W; y0 = 3; y1 = H; }
  else if (horiz) { x0 = axis ? Math.min(W * 0.36, longest(labels) + 14) : 0; x1 = W - (c.values === false ? 8 : longest(vis.map((s) => num(Math.max(...s.data), true))) + 12); y0 = 2; y1 = H - 2; }
  else { x0 = axis ? longest(ticks) + 12 : 0; x1 = W - (axis ? Math.max(8, tw(labels[n - 1] || '') / 2) : 0); y0 = 8; y1 = H - (axis ? 24 : 0); }
  const vMin = sc.lo; const vMax = sc.hi; const span = vMax - vMin || 1;
  const vy = (v) => y1 - ((v - vMin) / span) * (y1 - y0);
  const vx = (v) => x0 + ((v - vMin) / span) * (x1 - x0);
  const band = ((horiz ? y1 - y0 : x1 - x0) / Math.max(1, n));
  const px = (i) => (bar ? x0 + band * (i + 0.5) : n < 2 ? (x0 + x1) / 2 : x0 + (i * (x1 - x0)) / (n - 1));
  const T = (x, y, a, txt, cls = 'ac-chart__tick') => `<text class="${cls}" x="${R(fx(x))}" y="${R(y)}" text-anchor="${a}">${esc(txt)}</text>`;
  let grid = ''; let text = ''; let shapes = ''; let defs = '';

  if (axis && !horiz) {
    sc.ticks.forEach((v, k) => {
      const y = vy(v);
      grid += `M${R(x0)},${R(y)}H${R(x1)}`;
      text += T(x0 - 8, y + 4, 'end', ticks[k]);
    });
    const step = Math.max(1, Math.ceil(n / Math.max(1, Math.floor((x1 - x0) / (longest(labels) + 14)))));
    for (let i = 0; i < n; i += step) text += T(px(i), H - 6, 'middle', labels[i]);
  }
  if (axis && horiz) {
    const max = Math.max(4, Math.floor((W * 0.36 - 12) / CW));
    labels.forEach((l, i) => { text += T(x0 - 10, y0 + band * (i + 0.5) + 4, 'end', tw(l) > x0 - 10 && l.length > max ? `${l.slice(0, max - 1)}…` : l); });
  }

  if (bar) {
    const inner = band * (1 - (c.gap ?? (n > 16 ? 0.25 : horiz ? 0.38 : 0.42)));
    const gap = vis.length > 1 && !stacked ? Math.min(4, inner * 0.08) : 0;
    const bw = stacked ? inner : Math.max(1.5, (inner - gap * (vis.length - 1)) / Math.max(1, vis.length));
    const rad = c.radius ?? Math.min(10, bw / 2);
    const zero = (horiz ? vx : vy)(Math.max(vMin, Math.min(0, vMax)));
    const acc = new Array(n).fill(0);
    const top = new Array(n).fill(-1);
    if (stacked) for (let i = 0; i < n; i++) vis.forEach((s, k) => { if ((+s.data[i] || 0) > 0) top[i] = k; });
    vis.forEach((s, k) => {
      for (let i = 0; i < n; i++) {
        let d = '';
        const v = +s.data[i] || 0;
        const off = (horiz ? y0 : x0) + band * (i + 0.5) - inner / 2 + (stacked ? 0 : k * (bw + gap));
        const a = stacked ? acc[i] : 0; const b = a + v;
        if (stacked) acc[i] = b;
        const r = !stacked || top[i] === k ? (v < 0 ? 0 : rad) : 0;
        if (horiz) { const p0 = vx(Math.min(a, b)); const p1 = vx(Math.max(a, b)); d += rbar(p0, off, p1 - p0, bw, r, true); }
        else { const p0 = vy(Math.max(a, b)); const p1 = vy(Math.min(a, b)); d += rbar(off, p0, bw, p1 - p0, r, false); }
        if (horiz && c.values !== false && !stacked) text += T(vx(Math.max(0, v)) + 6, off + bw / 2 + 4, 'start', num(v, true), 'ac-chart__val');
        // one path per bar: --i staggers the grow-in by column, --_base is the zero line it grows from
        shapes += `<path class="ac-chart__bar"${horiz ? ' data-h' : ''} data-c="${esc(s.c)}" data-col="${i}" data-si="${s.i}" data-mk="b${s.i}-${i}" style="--i:${i};--_base:${R(zero)}px" d="${d}"/>`;
      }
    });
    if (stacked && horiz && c.values !== false) for (let i = 0; i < n; i++) text += T(vx(acc[i]) + 6, y0 + band * (i + 0.5) + 4, 'start', num(acc[i], true), 'ac-chart__val');
    if (!horiz) grid += `M${R(x0)},${R(zero)}H${R(x1)}`;
  } else {
    vis.forEach((s) => {
      const pts = []; s.data.forEach((v, i) => { if (v != null) pts.push([px(i), vy(v)]); });
      if (!pts.length) return;
      const d = curve(pts, c.smooth !== false);
      let area = '';
      if (m.type === 'area' || (spark && c.area !== false)) {
        const gid = uid('acg');
        defs += `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="ac-chart__stop0" data-c="${esc(s.c)}"/><stop offset="1" class="ac-chart__stop1" data-c="${esc(s.c)}"/></linearGradient>`;
        area = `<path class="ac-chart__area" data-mk="a${s.i}" fill="url(#${gid})" d="${d}L${R(pts[pts.length - 1][0])},${R(y1)}L${R(pts[0][0])},${R(y1)}Z"/>`;
      }
      shapes += `<g class="ac-chart__s" data-c="${esc(s.c)}" data-si="${s.i}">${area}<path class="ac-chart__line${s.dashed ? ' ac-chart__line--dash' : ''}" data-mk="l${s.i}" pathLength="1" d="${d}"/></g>`;
    });
  }
  const hov = bar
    ? `<rect class="ac-chart__band" rx="6" ${horiz ? `x="0" width="${R(W)}" height="${R(band)}"` : `y="${R(y0 - 4)}" width="${R(band)}" height="${R(y1 - y0 + 4)}"`}/>`
    : `<path class="ac-chart__cross" d="M0,${R(y0)}V${R(y1)}"/>${vis.map((s) => `<circle class="ac-chart__dot" data-c="${esc(s.c)}" r="4.5"/>`).join('')}`;
  const mirror = rtl ? ` transform="matrix(-1 0 0 1 ${W} 0)"` : '';
  const svg = `<defs>${defs}</defs><g${mirror}>${grid ? `<path class="ac-chart__grid" d="${grid}"/>` : ''}<g class="ac-chart__hover">${hov}</g>${shapes}</g>${text}`;

  const dataTable = `<thead><tr><th></th>${vis.map((s) => `<th>${esc(s.name)}</th>`).join('')}</tr></thead><tbody>${labels.slice(-60).map((l, j) => { const i = Math.max(0, n - 60) + j; return `<tr><th>${esc(l)}</th>${vis.map((s) => `<td>${s.data[i] == null ? '' : esc(num(s.data[i]))}</td>`).join('')}</tr>`; }).join('')}</tbody>`;
  return {
    svg, n, table: dataTable,
    hit(x, y) {
      const p = horiz ? y : x;
      if (horiz ? p < y0 || p > y1 : p < x0 - 10 || p > x1 + 10) return -1;
      return bar ? clamp(Math.floor((p - (horiz ? y0 : x0)) / band), 0, n - 1) : clamp(Math.round(n < 2 ? 0 : ((p - x0) * (n - 1)) / (x1 - x0)), 0, n - 1);
    },
    focus(i, root) {
      if (bar) root.querySelectorAll('.ac-chart__bar').forEach((b) => b.toggleAttribute('data-on', Number(b.dataset.col) === i));
      const g = root.querySelector('.ac-chart__hover'); if (!g || i < 0) return;
      if (bar) { const r = g.firstElementChild; r.setAttribute(horiz ? 'y' : 'x', R((horiz ? y0 : x0) + band * i)); return; }
      g.firstElementChild.setAttribute('transform', `translate(${R(px(i))} 0)`);
      g.querySelectorAll('circle').forEach((dot, k) => {
        const v = vis[k].data[i];
        dot.setAttribute('cx', R(px(i))); dot.setAttribute('cy', R(v == null ? -99 : vy(v)));
      });
    },
    tip(i) {
      const vals = vis.map((s) => s.data[i]);
      const topV = stacked ? vals.reduce((a, v) => a + (+v || 0), 0) : Math.max(...vals.map((v) => +v || 0));
      const rows = vis.map((s) => `<span class="ac-chart__tip-row"><i class="ac-chart__sw" data-c="${esc(s.c)}"></i><span>${esc(s.name)}</span><b>${s.data[i] == null ? '—' : esc(num(s.data[i]))}</b></span>`).join('');
      return { x: horiz ? vx(topV) : px(i), y: horiz ? y0 + band * i + 4 : spark ? vy(topV) : Math.max(y0, vy(topV)), html: `<div class="ac-chart__tip-head">${esc(labels[i] ?? '')}</div>${rows}` };
    },
  };
}

/* ---------------------------------------------------------------- donut / pie */
function donut({ c, m, W, H, rtl, num }) {
  const sl = m.slices || []; const vis = sl.map((s, i) => ({ ...s, i })).filter((s) => !s.hidden && s.v > 0);
  const total = vis.reduce((a, s) => a + s.v, 0) || 1;
  const pie = m.type === 'pie';
  const cx = W / 2; const cy = H / 2; const r = Math.max(10, Math.min(W, H) / 2 - 6);
  const thick = pie ? r : Math.max(8, r * (c.thickness || 0.24)); const rr = r - thick / 2;
  const gap = vis.length > 1 ? Math.min(3, (180 / Math.PI) * (2.4 / rr)) : 0;
  let a = -90; const segs = [];
  vis.forEach((s) => { const sw = (s.v / total) * 360; segs.push({ ...s, a0: a, a1: a + sw }); a += sw; });
  const paths = segs.map((s, k) => `<path class="ac-chart__arc" data-k="${k}" data-si="${s.i}" data-c="${esc(s.c)}" pathLength="1" stroke-width="${R(thick)}" d="${arc(cx, cy, rr, s.a0 + gap / 2, Math.max(s.a0 + gap / 2 + 0.01, Math.min(s.a1 - gap / 2, s.a0 + 359.99)))}"/>`).join('');
  const cLabel = c.centerLabel ? tr(c.centerLabel) : AC.t('chart.total', 'Total');
  const center = !pie && rr > 34 ? `<text class="ac-chart__cv" x="${R(cx)}" y="${R(cy + 2)}" text-anchor="middle">${esc(num(c.total ?? total, true))}</text><text class="ac-chart__cl" x="${R(cx)}" y="${R(cy + 20)}" text-anchor="middle">${esc(cLabel)}</text>` : '';
  const mirror = rtl ? ` transform="matrix(-1 0 0 1 ${W} 0)"` : '';
  const pct = (v) => format.number(v / total, { percent: true, maximumFractionDigits: 1 });
  return {
    n: segs.length,
    svg: `<g class="ac-chart__ring"${mirror}><circle class="ac-chart__track" cx="${R(cx)}" cy="${R(cy)}" r="${R(rr)}" stroke-width="${R(thick)}"/>${paths}</g>${center}`,
    table: `<tbody>${segs.map((s) => `<tr><th>${esc(s.name)}</th><td>${esc(num(s.v))}</td><td>${pct(s.v)}</td></tr>`).join('')}</tbody>`,
    hit(x, y) {
      const dx = x - cx; const dy = y - cy; const d = Math.hypot(dx, dy);
      if (d < rr - thick / 2 - 4 || d > r + 6) return -1;
      let ang = (Math.atan2(dy, dx) * 180) / Math.PI; if (ang < -90) ang += 360;
      return segs.findIndex((s) => ang >= s.a0 && ang < s.a1);
    },
    focus(i, root) {
      root.querySelectorAll('.ac-chart__arc').forEach((p, k) => { p.toggleAttribute('data-on', k === i); p.toggleAttribute('data-off', i >= 0 && k !== i); });
      const cv = root.querySelector('.ac-chart__cv'); const cl = root.querySelector('.ac-chart__cl');
      if (cv) { cv.textContent = i < 0 ? num(c.total ?? total, true) : pct(segs[i].v); cl.textContent = i < 0 ? cLabel : segs[i].name; }
    },
    tip(i) {
      const s = segs[i]; const mid = (((s.a0 + s.a1) / 2) * Math.PI) / 180;
      return { x: cx + Math.cos(mid) * rr, y: cy + Math.sin(mid) * rr - thick / 2, html: `<span class="ac-chart__tip-row"><i class="ac-chart__sw" data-c="${esc(s.c)}"></i><span>${esc(s.name)}</span><b>${esc(num(s.v))}</b></span><div class="ac-chart__tip-sub">${pct(s.v)}</div>` };
    },
  };
}

/* ---------------------------------------------------------------- gauge */
function gauge({ c, W, H, rtl, num }) {
  const max = c.max ?? 100; const min = c.min ?? 0;
  const v = Number(c.value ?? (Array.isArray(c.series) ? c.series[0] : 0)) || 0;
  const f = clamp((v - min) / (max - min || 1), 0, 1);
  const th = c.thresholds; const col = c.color || (th ? (v >= th[1] ? 'danger' : v >= th[0] ? 'warning' : 'success') : 1);
  const r = Math.max(12, Math.min(W / 2, H / 1.72) - 10); const thick = Math.max(6, r * (c.thickness || 0.16));
  const cx = W / 2; const cy = Math.min(H / 2 + r * 0.14, r + thick / 2 + 4);
  const a0 = 135; const a1 = 405;
  const mirror = rtl ? ` transform="matrix(-1 0 0 1 ${W} 0)"` : '';
  const val = f > 0.002 ? `<path class="ac-chart__gv" data-c="${esc(col)}" pathLength="1" stroke-width="${R(thick)}" d="${arc(cx, cy, r, a0, a0 + (a1 - a0) * f)}"/>` : '';
  const label = tr(c.label || '');
  return {
    n: 0, label: `${label} ${num(v)}`.trim(),
    svg: `<g${mirror}><path class="ac-chart__gt" stroke-width="${R(thick)}" d="${arc(cx, cy, r, a0, a1)}"/>${val}</g><text class="ac-chart__gnum" x="${R(cx)}" y="${R(cy + r * 0.12)}" text-anchor="middle" font-size="${R(clamp(r * 0.42, 14, 40))}">${esc(num(v))}</text>${label ? `<text class="ac-chart__cl" x="${R(cx)}" y="${R(cy + r * 0.12 + 20)}" text-anchor="middle">${esc(label)}</text>` : ''}`,
    table: `<tbody><tr><th>${esc(label || 'value')}</th><td>${esc(num(v))}</td><td>${esc(num(max))}</td></tr></tbody>`,
  };
}

/* ---------------------------------------------------------------- heatmap (calendar) */
function heatmap({ c, m, W, rtl, fx, num }) {
  const raw = c.data || (Array.isArray(c.series) && c.series[0]?.date ? c.series : []);
  const map = new Map(raw.map((d) => [dayKey(d.date), +d.value || 0]));
  const end = new Date(c.end || raw[raw.length - 1]?.date || Date.now()); end.setHours(12, 0, 0, 0);
  const ws = c.weekStart ?? (/^(fa|ar)/.test(i18n.lang) ? 6 : 0);
  let labelW = 30; const top = 18; const gap = 3;
  let weeks = c.weeks || 53;
  let cell = (W - labelW) / weeks - gap;
  if (cell < 10) { weeks = Math.max(4, Math.floor((W - labelW) / 13)); cell = (W - labelW) / weeks - gap; }
  cell = Math.min(cell, c.cell || 18);
  const step = cell + gap;
  labelW += Math.max(0, (W - labelW - weeks * step) / 2 - 8);
  const endCol = (end.getDay() - ws + 7) % 7;
  const start = new Date(end); start.setDate(end.getDate() - endCol - (weeks - 1) * 7);
  const vals = [...map.values()].filter((v) => v > 0).sort((a, b) => a - b);
  const q = (p) => vals[Math.floor((vals.length - 1) * p)] ?? 1;
  const cuts = c.levels || [q(0.25), q(0.5), q(0.75)];
  const lvl = (v) => (!v ? 0 : v <= cuts[0] ? 1 : v <= cuts[1] ? 2 : v <= cuts[2] ? 3 : 4);
  let cells = ''; let text = ''; let total = 0; let lastMonth = -1; const days = [];
  const fmt = (d, o) => format.date(d, o);
  for (let w = 0; w < weeks; w++) {
    for (let r = 0; r < 7; r++) {
      const d = new Date(start); d.setDate(start.getDate() + w * 7 + r);
      if (d > end) break;
      const v = map.get(dayKey(d)) || 0; total += v;
      days.push({ d, v, w, r });
      cells += `<rect class="ac-chart__cell" data-l="${lvl(v)}" x="${R(labelW + w * step)}" y="${R(top + r * step)}" width="${R(cell)}" height="${R(cell)}" rx="${R(Math.min(4, cell / 3.5))}"/>`;
    }
    const first = new Date(start); first.setDate(start.getDate() + w * 7);
    const mm = fmt(first, { month: 'short' });
    if (mm !== lastMonth && w < weeks - 2) { if (lastMonth !== -1 || first.getDate() < 8) text += `<text class="ac-chart__tick" x="${R(fx(labelW + w * step))}" y="11" text-anchor="start">${esc(mm)}</text>`; lastMonth = mm; }
  }
  [1, 3, 5].forEach((r) => {
    const d = new Date(start); d.setDate(start.getDate() + r);
    text += `<text class="ac-chart__tick" x="${R(fx(labelW - 6))}" y="${R(top + r * step + cell * 0.75)}" text-anchor="end">${esc(fmt(d, { weekday: /^(fa|ar)/.test(i18n.lang) ? 'narrow' : 'short' }))}</text>`;
  });
  // the "More" label after the legend must fit inside the viewBox (it used to hang past the edge on phones)
  const moreW = [...String(AC.t('chart.more', 'More'))].length * 6.4 + 6;
  const ly = top + 7 * step + 8; let lx = Math.min(labelW + weeks * step - gap, W - moreW) - 5 * (cell + 2);
  let legend = '';
  for (let l = 0; l < 5; l++) legend += `<rect class="ac-chart__cell" data-l="${l}" x="${R(lx + l * (cell + 2))}" y="${R(ly)}" width="${R(cell)}" height="${R(cell)}" rx="${R(Math.min(4, cell / 3.5))}"/>`;
  text += `<text class="ac-chart__tick" x="${R(fx(lx - 6))}" y="${R(ly + cell * 0.8)}" text-anchor="end">${esc(AC.t('chart.less', 'Less'))}</text>`;
  text += `<text class="ac-chart__tick" x="${R(fx(lx + 5 * (cell + 2) + 4))}" y="${R(ly + cell * 0.8)}" text-anchor="start">${esc(AC.t('chart.more', 'More'))}</text>`;
  const mirror = rtl ? ` transform="matrix(-1 0 0 1 ${W} 0)"` : '';
  const unit = tr(c.unit || '');
  const h = ly + cell + 4;
  return {
    h, n: days.length, label: `${num(total)} ${unit}`.trim(),
    svg: `<g${mirror}>${cells}<rect class="ac-chart__ring-sel" width="${R(cell + 4)}" height="${R(cell + 4)}" rx="${R(Math.min(5, cell / 3))}"/>${legend}</g>${text}`,
    table: `<tbody><tr><th>${esc(AC.t('chart.total', 'Total'))}</th><td>${esc(num(total))} ${esc(unit)}</td></tr></tbody>`,
    hit(x, y) {
      const w = Math.floor((x - labelW) / step); const r = Math.floor((y - top) / step);
      if (w < 0 || r < 0 || r > 6) return -1;
      return days.findIndex((d) => d.w === w && d.r === r);
    },
    focus(i, root) {
      const s = root.querySelector('.ac-chart__ring-sel'); if (!s) return;
      if (i < 0) { s.removeAttribute('data-on'); return; }
      s.setAttribute('x', R(labelW + days[i].w * step - 2)); s.setAttribute('y', R(top + days[i].r * step - 2)); s.setAttribute('data-on', '');
    },
    tip(i) {
      const d = days[i];
      return { x: labelW + d.w * step + cell / 2, y: top + d.r * step, html: `<div class="ac-chart__tip-head">${esc(fmt(d.d, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))}</div><b>${esc(num(d.v))}</b> <span class="ac-chart__tip-sub">${esc(unit)}</span>` };
    },
  };
}

/* ---------------------------------------------------------------- funnel */
function funnel({ c, m, W, rtl, fx, num }) {
  const sl = m.slices || []; const first = sl[0]?.v || 1; const max = Math.max(...sl.map((s) => s.v), 1);
  const rowH = 54; const barH = 24; let out = '';
  const pct = (v) => format.number(v, { percent: true, maximumFractionDigits: 1 });
  sl.forEach((s, i) => {
    const y = i * rowH; const w = Math.max(6, (W * s.v) / max); const x = rtl ? W - w : 0;
    out += `<text class="ac-chart__fl" x="${R(fx(0))}" y="${y + 14}" text-anchor="start">${esc(s.name)}</text>`;
    out += `<text class="ac-chart__fv" x="${R(fx(W))}" y="${y + 14}" text-anchor="end">${esc(num(s.v, true))} · ${pct(s.v / first)}</text>`;
    out += `<rect class="ac-chart__ftrack" x="0" y="${y + 22}" width="${W}" height="${barH}" rx="8"/>`;
    out += `<rect class="ac-chart__fbar" data-c="${esc(s.c)}" fill-opacity="${R(1 - (i / Math.max(1, sl.length)) * 0.55)}" x="${R(x)}" y="${y + 22}" width="${R(w)}" height="${barH}" rx="8"/>`;
  });
  return {
    h: sl.length * rowH - (rowH - 22 - barH), n: sl.length, svg: out,
    table: `<tbody>${sl.map((s) => `<tr><th>${esc(s.name)}</th><td>${esc(num(s.v))}</td><td>${pct(s.v / first)}</td></tr>`).join('')}</tbody>`,
    hit: (x, y) => { const i = Math.floor(y / rowH); return i >= 0 && i < sl.length ? i : -1; },
    focus(i, root) { root.querySelectorAll('.ac-chart__fbar').forEach((b, k) => b.toggleAttribute('data-off', i >= 0 && k !== i)); },
    tip(i) {
      const s = sl[i]; const prev = sl[i - 1];
      return { x: Math.max(70, (W * s.v) / max / 2), y: i * rowH + 22, html: `<div class="ac-chart__tip-head">${esc(s.name)}</div><span class="ac-chart__tip-row"><span>${esc(AC.t('chart.ofTotal', 'of first step'))}</span><b>${pct(s.v / first)}</b></span>${prev ? `<span class="ac-chart__tip-row"><span>${esc(AC.t('chart.fromPrev', 'from previous'))}</span><b>${pct(s.v / (prev.v || 1))}</b></span>` : ''}` };
    },
  };
}

register('chart', (el) => {
  const api = create(el, options(el, {}));
  instance(el, 'chart', api);
  return () => api.destroy();
});

/** AC.chart(el|selector, cfg) — create (or reconfigure) a chart. */
function chart(target, cfg = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  const ex = instance(el, 'chart');
  if (ex) return ex.set(cfg);
  return instance(el, 'chart', create(el, cfg));
}
AC.chart = chart;
return Object.freeze({ chart });
})();

return { f: F, ns: Object.freeze({ "chart": __ac_m6["chart"] }) };
})();
export const { chart } = __R["chart"].ns;
export default __R["chart"].ns;
