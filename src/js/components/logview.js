/* Log viewer — level colours + filter chips with counts, search with highlight, pause / follow,
   timestamps toggle, capped DOM (only the newest `render` matching lines are in the page).
   <div data-ac="logview" data-ac-config='{"max":5000,"render":500}'></div>
   const log = AC.logview(el, { lines }); log.push({ ts, level: 'info'|'debug'|'warn'|'error', src, msg }) or log.push('text')
   API: push(line|lines) clear() pause(bool) follow(bool) filter({ levels, q }) · Events: ac:logview:pause { paused } */
import { AC, register, instance, on, emit, options, icon, escapeHtml as esc, debounce, format } from '../core.js';

const LEVELS = ['debug', 'info', 'warn', 'error'];
const pad = (n, w = 2) => String(n).padStart(w, '0');
const clock = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`; };
const norm = (l) => (typeof l === 'string' ? { ts: Date.now(), level: (/\b(debug|info|warn|error)\b/i.exec(l)?.[1] || 'info').toLowerCase(), msg: l } : { ts: Date.now(), level: 'info', ...l });

function create(el, cfg) {
  const c = { max: 5000, render: 500, levels: LEVELS, timestamps: true, follow: true, ...cfg };
  const buf = [];
  const count = Object.fromEntries(c.levels.map((l) => [l, 0]));
  const st = { on: new Set(c.show || c.levels), q: '', paused: false, follow: c.follow, ts: c.timestamps, pending: 0 };
  el.classList.add('ac-log');
  el.innerHTML = `<div class="ac-log__bar"><div class="ac-log__levels" role="group" aria-label="${esc(AC.t('log.levels', 'Levels'))}">${c.levels.map((l) => `<button type="button" class="ac-log__lvl" data-level="${l}" aria-pressed="${st.on.has(l)}"><i></i>${esc(AC.t(`log.${l}`, l))}<span class="ac-log__n">0</span></button>`).join('')}</div>
<label class="ac-log__search">${icon('search')}<input type="search" placeholder="${esc(AC.t('log.search', 'Filter logs…'))}" aria-label="${esc(AC.t('log.search', 'Filter logs…'))}"></label>
<div class="ac-log__tools"><button type="button" class="ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost" data-log="ts" aria-pressed="${st.ts}" aria-label="${esc(AC.t('log.timestamps', 'Timestamps'))}" title="${esc(AC.t('log.timestamps', 'Timestamps'))}">${icon('clock')}</button><button type="button" class="ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost" data-log="clear" aria-label="${esc(AC.t('log.clear', 'Clear'))}" title="${esc(AC.t('log.clear', 'Clear'))}">${icon('eraser')}</button><button type="button" class="ac-btn ac-btn--sm ac-log__pause" data-log="pause" aria-pressed="false"></button></div></div>
<div class="ac-log__view" role="log" aria-live="off" tabindex="0" aria-label="${esc(AC.t('log.title', 'Log stream'))}"></div>
<div class="ac-log__foot"><span class="ac-log__stat" aria-live="polite"></span><button type="button" class="ac-log__jump" data-log="jump" hidden>${icon('arrow-down')}<span></span></button></div>`;
  const view = el.querySelector('.ac-log__view'); const stat = el.querySelector('.ac-log__stat'); const jump = el.querySelector('.ac-log__jump');
  const pauseBtn = el.querySelector('[data-log="pause"]');
  el.toggleAttribute('data-no-ts', !st.ts);
  const match = (l) => st.on.has(l.level) && (!st.q || `${l.src || ''} ${l.msg}`.toLowerCase().includes(st.q));
  const hl = (s) => { s = esc(s); if (!st.q) return s; const q = esc(st.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return s.replace(new RegExp(q, 'gi'), (m) => `<mark>${m}</mark>`); };
  const line = (l) => `<div class="ac-log__line" data-level="${esc(l.level)}"><time datetime="${new Date(l.ts).toISOString()}">${clock(l.ts)}</time><span class="ac-log__lv">${esc(l.level.toUpperCase())}</span>${l.src ? `<span class="ac-log__src">${esc(l.src)}</span>` : ''}<span class="ac-log__msg">${hl(l.msg)}</span></div>`;
  const atBottom = () => view.scrollHeight - view.scrollTop - view.clientHeight < 24;
  const toEnd = () => { view.scrollTop = view.scrollHeight; };
  function status() {
    el.querySelectorAll('.ac-log__lvl').forEach((b) => { b.querySelector('.ac-log__n').textContent = format.number(count[b.dataset.level] || 0, { compact: true }); });
    stat.textContent = AC.t('log.stat', '{n} lines · showing {m}', { n: format.number(buf.length), m: format.number(view.childElementCount) });
    const showJump = st.pending > 0 || !st.follow;
    jump.hidden = !showJump;
    jump.querySelector('span').textContent = st.pending ? AC.t('log.new', '{n} new', { n: format.number(st.pending) }) : AC.t('log.latest', 'Latest');
    pauseBtn.innerHTML = `${icon(st.paused ? 'play' : 'pause')}<span>${esc(st.paused ? AC.t('log.resume', 'Resume') : AC.t('log.pause', 'Pause'))}</span>`;
    pauseBtn.setAttribute('aria-pressed', String(st.paused));
  }
  function full() {
    const out = []; for (let i = buf.length - 1; i >= 0 && out.length < c.render; i--) if (match(buf[i])) out.push(buf[i]);
    view.innerHTML = out.reverse().map(line).join('') || `<div class="ac-log__empty">${esc(AC.t('log.empty', 'No matching log lines'))}</div>`;
    st.pending = 0;
    if (st.follow) toEnd();
    status();
  }
  const queue = [];
  let raf = 0;
  function flush() {
    raf = 0;
    if (st.paused) { status(); return; }
    const add = queue.splice(0).filter(match);
    if (add.length) {
      view.querySelector('.ac-log__empty')?.remove();
      view.insertAdjacentHTML('beforeend', add.slice(-c.render).map(line).join(''));
      let extra = view.childElementCount - c.render;
      while (extra-- > 0) view.firstElementChild.remove();
      if (st.follow) toEnd();
    }
    status();
  }
  function push(lines) {
    const list = [].concat(lines).map(norm);
    for (const l of list) { buf.push(l); count[l.level] = (count[l.level] || 0) + 1; if (st.paused && match(l)) st.pending++; }
    if (buf.length > c.max) buf.splice(0, buf.length - c.max).forEach((l) => { count[l.level]--; });
    if (!st.paused) queue.push(...list);
    if (!raf) raf = requestAnimationFrame(flush);
    return api;
  }
  function pause(v = !st.paused) { st.paused = v; if (!v) { queue.length = 0; full(); } else status(); emit(el, 'logview:pause', { paused: v }); return api; }
  const offs = [
    on(el, 'click', '.ac-log__lvl', (e, b) => { const l = b.dataset.level; if (e.altKey || e.metaKey) { st.on = new Set([l]); } else if (st.on.has(l)) st.on.delete(l); else st.on.add(l); el.querySelectorAll('.ac-log__lvl').forEach((x) => x.setAttribute('aria-pressed', String(st.on.has(x.dataset.level)))); full(); }),
    on(el, 'input', '.ac-log__search input', debounce((e) => { st.q = e.target.value.trim().toLowerCase(); full(); }, 150)),
    on(el, 'click', '[data-log]', (e, b) => {
      const k = b.dataset.log;
      if (k === 'pause') pause();
      else if (k === 'clear') { buf.length = 0; Object.keys(count).forEach((x) => { count[x] = 0; }); full(); }
      else if (k === 'ts') { st.ts = !st.ts; b.setAttribute('aria-pressed', String(st.ts)); el.toggleAttribute('data-no-ts', !st.ts); }
      else if (k === 'jump') { st.follow = true; if (st.paused) pause(false); else { toEnd(); status(); } }
    }),
    on(view, 'scroll', () => { const b = atBottom(); if (b !== st.follow) { st.follow = b; status(); } }, { passive: true }),
  ];
  const api = {
    el, push, pause, clear() { buf.length = 0; full(); return api; },
    follow(v = true) { st.follow = v; if (v) toEnd(); status(); return api; },
    filter({ levels, q } = {}) { if (levels) st.on = new Set(levels); if (q != null) { st.q = q.toLowerCase(); el.querySelector('.ac-log__search input').value = q; } el.querySelectorAll('.ac-log__lvl').forEach((x) => x.setAttribute('aria-pressed', String(st.on.has(x.dataset.level)))); full(); return api; },
    get lines() { return buf.slice(); }, get paused() { return st.paused; },
    destroy() { offs.forEach((f) => f()); cancelAnimationFrame(raf); },
  };
  if (c.lines) { c.lines.map(norm).forEach((l) => { buf.push(l); count[l.level] = (count[l.level] || 0) + 1; }); }
  full();
  return api;
}

register('logview', (el) => {
  const api = create(el, options(el, {}));
  instance(el, 'logview', api);
  return () => api.destroy();
});
export function logview(target, cfg = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  instance(el, 'logview')?.destroy();
  return instance(el, 'logview', create(el, cfg));
}
AC.logview = logview;
