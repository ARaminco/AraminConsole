/*! AraminConsole v0.1.0 — module datepicker — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');
if (!__R["forms"]) await import('./forms.js');

/* ======== module: datepicker ======== */
if (!__R["datepicker"]) __R["datepicker"] = (() => {
const F = {};
const __ac_m1 = __R["core"].f["js/core.js"];
const __ac_m8 = __R["forms"].f["js/components/form-core.js"];
/* ---- js/components/datepicker.js ---- */
const __ac_m9 = F["js/components/datepicker.js"] = (() => {
const { AC, register, on, emit, uid, icon, instance, options, h, i18n, isRTL } = __ac_m1;
const { ft, latin, fire, popup, isPhone } = __ac_m8;
/* Date picker (Jalali/Persian + Gregorian, single or range) and time picker. No dependencies:
   calendar maths goes through Intl.DateTimeFormat('…-u-ca-persian'), so the month lengths and
   leap years are the browser's own.

   <div class="ac-input-group ac-date" data-ac="datepicker" data-name="birth"
        [data-calendar="persian|gregory"] [data-value="2024-10-19"] [data-min="2024-01-01"] [data-max="…"]
        [data-range data-name-from="from" data-name-to="to" data-value="2024-10-01,2024-10-07"]>
     <input class="ac-input" id="birth" placeholder="1403/07/28">
   </div>
   Hidden inputs carry ISO dates (YYYY-MM-DD, Gregorian) whatever calendar is shown.
   Events: ac:datepicker:change { value, from, to, calendar, text }
   API: AC.instance(el,'datepicker').{value, set('2024-10-19'|['a','b']), clear(), open(), close(), calendar(c)}
   Helpers: AC.jalali.toJalali(date) → {y,m,d}, AC.jalali.toDate(y,m,d) → Date (UTC midnight)

   <div class="ac-input-group ac-time" data-ac="timepicker" [data-step="5"]><input class="ac-input" name="at" placeholder="09:30"></div>
   Events: ac:timepicker:change { value } */



const DAY = 864e5;
const fmtCache = new Map();
function dtf(locale, opts) {
  const key = locale + JSON.stringify(opts);
  let f = fmtCache.get(key);
  if (!f) { f = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...opts }); fmtCache.set(key, f); }
  return f;
}
const persianParts = (dn) => {
  const p = {};
  for (const x of dtf('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date(dn * DAY))) p[x.type] = x.value;
  return { y: parseInt(p.year, 10), m: parseInt(p.month, 10), d: parseInt(p.day, 10) };
};
/** calendar → { parts(dayNumber) → {y,m,d}, from(y,m,d) → dayNumber } (dayNumber = days since 1970-01-01 UTC) */
const CAL = {
  gregory: {
    parts(dn) { const d = new Date(dn * DAY); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; },
    from(y, m, d) { return Math.round(Date.UTC(y, m - 1, d) / DAY); },
  },
  persian: {
    parts: persianParts,
    from(y, m, d) {
      const doy = (mm, dd) => (mm <= 7 ? (mm - 1) * 31 : 186 + (mm - 7) * 30) + dd;
      let dn = Math.round(Date.UTC(y + 621, 2, 20) / DAY) + doy(m, d) - 1;
      for (let i = 0; i < 8; i++) {
        const p = persianParts(dn);
        if (p.y === y && p.m === m && p.d === d) break;
        dn += ((y - p.y) * 365 + doy(m, d) - doy(p.m, p.d)) || Math.sign(y - p.y);
      }
      return dn;
    },
  },
  /* Hijri lunar (Umm al-Qura via Intl). Iran's official lunar dates follow local moon sighting and may differ by a day. */
  islamic: {
    parts(dn) {
      const p = {};
      for (const x of dtf('en-US-u-ca-islamic-umalqura-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date(dn * DAY))) p[x.type] = x.value;
      return { y: parseInt(p.year, 10), m: parseInt(p.month, 10), d: parseInt(p.day, 10) };
    },
    from(y, m, d) {
      let dn = Math.round(Date.UTC(622, 6, 19) / DAY + (y - 1) * 354.36707 + (m - 1) * 29.530589 + d - 1);
      for (let i = 0; i < 12; i++) {
        const p = CAL.islamic.parts(dn);
        const diff = (y - p.y) * 354 + (m - p.m) * 29 + (d - p.d);
        if (!diff) { if (p.y === y && p.m === m && p.d === d) break; dn += Math.sign((y - p.y) * 400 + (m - p.m) * 32 + (d - p.d)) || 1; continue; }
        dn += diff;
      }
      return dn;
    },
  },
};
const monthLen = (cal, y, m) => CAL[cal].from(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, 1) - CAL[cal].from(y, m, 1);
const weekday = (dn) => (((dn + 4) % 7) + 7) % 7; // 0 = Sunday
const todayDn = () => { const t = new Date(); return Math.round(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / DAY); };
const isoToDn = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim()); return m ? CAL.gregory.from(+m[1], +m[2], +m[3]) : null; };
const dnToIso = (dn) => (dn == null ? '' : new Date(dn * DAY).toISOString().slice(0, 10));
const pad = (n) => String(n).padStart(2, '0');

const jalali = {
  toJalali(date) { const d = new Date(date); return persianParts(Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY)); },
  toDate(y, m, d) { return new Date(CAL.persian.from(y, m, d) * DAY); },
  monthLength: (y, m) => monthLen('persian', y, m),
};
AC.jalali = jalali;

const caId = (cal) => (cal === 'islamic' ? 'islamic-umalqura' : cal);
const locFor = (cal) => `${i18n.locale}-u-ca-${caId(cal)}${i18n.digits === 'native' ? '' : '-nu-latn'}`;
const num = (n) => new Intl.NumberFormat(i18n.numberLocale, { useGrouping: false }).format(n);
const monthName = (cal, y, m, style = 'long') => dtf(locFor(cal), { month: style }).format(new Date(CAL[cal].from(y, m, 15) * DAY));
const weekdayName = (dn) => dtf(i18n.locale, { weekday: 'narrow' }).format(new Date(dn * DAY));
const longDate = (cal, dn) => dtf(locFor(cal), { dateStyle: 'full' }).format(new Date(dn * DAY));

/* Shared calendar engine for AC.date (date.js). `decorate(dn, cal)` → { holiday?, weekend? } is plugged in by date.js. */
const calKit = { DAY, CAL, dtf, caId, locFor, monthLen, weekday, todayDn, isoToDn, dnToIso, pad, monthName: (cal, y, m, style) => monthName(cal, y, m, style), decorate: null };

function textOf(cal, dn) { if (dn == null) return ''; const p = CAL[cal].parts(dn); return `${p.y}/${pad(p.m)}/${pad(p.d)}`; }
function parseText(cal, s) {
  const m = /^\s*(\d{2,4})\s*[/.\-]\s*(\d{1,2})\s*[/.\-]\s*(\d{1,2})\s*$/.exec(latin(s));
  if (!m) return null;
  let y = +m[1]; const mo = +m[2]; const d = +m[3];
  if (y < 100) y += cal === 'gregory' ? 2000 : 1400;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dn = CAL[cal].from(y, mo, d);
  const back = CAL[cal].parts(dn);
  return back.y === y && back.m === mo && back.d === d ? dn : null;
}

/* ---------------------------------------------------------------- datepicker */
register('datepicker', (el) => {
  const o = options(el, { calendar: '', range: false, name: '', nameFrom: '', nameTo: '', value: '', min: '', max: '', weekStart: '', calendars: 'persian,gregory,islamic', secondary: '', holidays: '' });
  const calList = String(o.calendars).split(',').map((s) => s.trim()).filter((c) => CAL[c]);
  const input = el.querySelector('input:not([type=hidden])'); if (!input) return;
  const range = !!o.range;
  let cal = o.calendar || (i18n.lang === 'fa' ? 'persian' : 'gregory');
  const name = o.name || input.name || '';
  input.removeAttribute('name');
  input.autocomplete = 'off'; input.classList.add('ac-num');
  input.setAttribute('aria-haspopup', 'dialog');
  if (range || matchMedia('(pointer: coarse)').matches) input.readOnly = true;
  const hidden = range
    ? [h('input', { type: 'hidden', name: o.nameFrom || (name && `${name}_from`) }), h('input', { type: 'hidden', name: o.nameTo || (name && `${name}_to`) })]
    : [h('input', { type: 'hidden', name })];
  const btn = h('button', { type: 'button', class: 'ac-input-group__btn', 'aria-label': ft('chooseDate'), html: icon(range ? 'calendar-range' : 'calendar') });
  el.append(btn, ...hidden);
  const lim = (k) => isoToDn(el.dataset[k]); // live: data-min / data-max may change after init
  const outOf = (dn) => { const a = lim('min'); const b = lim('max'); return (a != null && dn < a) || (b != null && dn > b); };

  const pid = uid('dp');
  const panel = h('div', { class: 'ac-dp', id: pid, role: 'dialog', 'aria-modal': 'false', 'aria-label': ft('chooseDate') });
  el.append(panel);
  input.setAttribute('aria-controls', pid);

  let from = null; let to = null; let hover = null; let self = false;
  let view = 'days'; let focusDn = null; let viewY = 0; let viewM = 0; let yearPage = 0;
  const vals = String(o.value || '').split(',').map(isoToDn);
  from = vals[0] ?? null; to = range ? vals[1] ?? null : null;

  const pop = popup(el, panel, {
    sheet: true, match: false,
    onClose: (refocus) => { el.removeAttribute('data-open'); input.setAttribute('aria-expanded', 'false'); hover = null; if (refocus) input.focus({ preventScroll: true }); },
  });
  input.setAttribute('aria-expanded', 'false');

  function setView(dn) { const p = CAL[cal].parts(dn); viewY = p.y; viewM = p.m; }
  const months = () => (range && !isPhone() ? 2 : 1);
  const addMonth = (y, m, k) => { const t = y * 12 + (m - 1) + k; return [Math.floor(t / 12), (t % 12) + 1]; };

  function syncText() {
    input.value = range ? (from != null ? `${textOf(cal, from)}${to != null ? ` – ${textOf(cal, to)}` : ''}` : '') : textOf(cal, from);
    hidden[0].value = dnToIso(from);
    if (range) hidden[1].value = dnToIso(to);
  }
  function changed() {
    syncText();
    hidden.forEach((x) => fire(x));
    self = true; fire(input); self = false;
    el.removeAttribute('aria-invalid');
    emit(el, 'datepicker:change', { value: range ? [dnToIso(from), dnToIso(to)] : dnToIso(from), from: dnToIso(from), to: dnToIso(to), calendar: cal, text: input.value });
  }

  function dayGrid(y, m, single) {
    const start = CAL[cal].from(y, m, 1); const len = monthLen(cal, y, m);
    const ws = o.weekStart !== '' ? Number(o.weekStart) : (i18n.lang === 'en' ? 0 : 6);
    const lead = (weekday(start) - ws + 7) % 7;
    const today = todayDn();
    const grid = h('div', { class: 'ac-dp__grid', role: 'grid', 'aria-label': `${monthName(cal, y, m)} ${num(y)}` });
    const headRow = h('div', { role: 'row', class: 'ac-dp__row' });
    for (let i = 0; i < 7; i++) headRow.append(h('span', { role: 'columnheader', class: 'ac-dp__wd', text: weekdayName(3 + ((ws + i) % 7)) }));
    grid.append(headRow);
    const cells = Math.ceil((lead + len) / 7) * 7;
    let row;
    const lo = range && from != null ? Math.min(from, to ?? hover ?? from) : null;
    const hi = range && from != null ? Math.max(from, to ?? hover ?? from) : null;
    for (let i = 0; i < cells; i++) {
      if (i % 7 === 0) { row = h('div', { role: 'row', class: 'ac-dp__row' }); grid.append(row); }
      const dn = start - lead + i; const inMonth = dn >= start && dn < start + len;
      if (!inMonth && !single) { row.append(h('span', { role: 'gridcell', class: 'ac-dp__pad' })); continue; }
      const p = inMonth ? { d: dn - start + 1 } : CAL[cal].parts(dn);
      const b = h('button', {
        type: 'button', class: 'ac-dp__day ac-num', 'data-dn': dn, tabindex: dn === focusDn ? '0' : '-1',
        'aria-label': longDate(cal, dn), 'aria-selected': String(dn === from || dn === to), 'aria-current': dn === today ? 'date' : null,
        disabled: outOf(dn) ? true : null, 'data-out': inMonth ? null : '',
      }, num(p.d));
      const sec = o.secondary === 'auto' ? (cal === 'persian' ? 'gregory' : 'persian') : o.secondary;
      if (sec && sec !== cal && CAL[sec]) { b.append(h('small', { class: 'ac-dp__sub', 'aria-hidden': 'true' }, num(CAL[sec].parts(dn).d))); grid.setAttribute('data-secondary', ''); }
      if (o.holidays !== false && (o.holidays === true || i18n.lang === 'fa')) {
        const deco = calKit.decorate?.(dn, cal);
        if (deco?.weekend && ws === 6) b.setAttribute('data-weekend', '');
        if (deco?.holiday) { b.setAttribute('data-holiday', ''); b.title = deco.holiday; b.setAttribute('aria-label', `${b.getAttribute('aria-label')} — ${deco.holiday}`); }
      }
      if (lo != null && dn >= lo && dn <= hi) { b.setAttribute('data-in', ''); if (dn === lo) b.setAttribute('data-start', ''); if (dn === hi) b.setAttribute('data-end', ''); }
      row.append(h('span', { role: 'gridcell', class: 'ac-dp__cell' }, b));
    }
    return grid;
  }

  function render(focus = false) {
    const head = h('div', { class: 'ac-dp__head' });
    const nav = (k, dir) => h('button', { type: 'button', class: 'ac-dp__nav', 'data-nav': k, 'aria-label': ft(k < 0 ? 'prev' : 'next'), html: icon(dir, 'ac-flip-rtl') });
    let title;
    if (view === 'days') {
      const n = months();
      title = Array.from({ length: n }, (_, i) => { const [yy, mm] = addMonth(viewY, viewM, i); return `${monthName(cal, yy, mm)} ${num(yy)}`; }).join('  ·  ');
    } else if (view === 'months') title = num(viewY);
    else title = `${num(yearPage)} – ${num(yearPage + 11)}`;
    head.append(nav(-1, 'chevron-left'), h('button', { type: 'button', class: 'ac-dp__title', 'data-view': view, 'aria-live': 'polite', text: title }), nav(1, 'chevron-right'));
    const body = h('div', { class: 'ac-dp__body', 'data-view': view });
    if (view === 'days') {
      const n = months();
      for (let i = 0; i < n; i++) { const [yy, mm] = addMonth(viewY, viewM, i); body.append(dayGrid(yy, mm, n === 1)); }
      if (focusDn == null || !body.querySelector(`[data-dn="${focusDn}"]:not([data-out])`)) {
        const first = body.querySelector('.ac-dp__day:not([data-out]):not(:disabled)');
        if (first) { first.tabIndex = 0; focusDn = Number(first.dataset.dn); }
      }
    } else if (view === 'months') {
      const cur = from != null ? CAL[cal].parts(from) : null;
      for (let m = 1; m <= 12; m++) body.append(h('button', { type: 'button', class: 'ac-dp__pick', 'data-month': m, 'aria-pressed': String(!!cur && cur.y === viewY && cur.m === m), tabindex: m === viewM ? '0' : '-1', text: monthName(cal, viewY, m) }));
    } else {
      for (let y = yearPage; y < yearPage + 12; y++) body.append(h('button', { type: 'button', class: 'ac-dp__pick ac-num', 'data-year': y, 'aria-pressed': String(y === viewY), tabindex: y === viewY ? '0' : '-1', text: num(y) }));
    }
    const foot = h('div', { class: 'ac-dp__foot' },
      h('button', { type: 'button', class: 'ac-btn ac-btn--ghost ac-btn--sm', 'data-act': 'today', text: ft('today') }),
      h('div', { class: 'ac-dp__cal', role: 'group' },
        ...calList.map((c) => h('button', { type: 'button', 'data-cal': c, 'aria-pressed': String(cal === c), text: ft({ persian: 'jalali', gregory: 'gregorian', islamic: 'hijri' }[c]) }))),
      h('button', { type: 'button', class: 'ac-btn ac-btn--ghost ac-btn--sm', 'data-act': 'clear', text: ft('clear') }));
    panel.replaceChildren(h('div', { class: 'ac-pop__grab', 'aria-hidden': 'true' }), head, body, foot);
    panel.toggleAttribute('data-double', months() === 2 && view === 'days');
    pop.place();
    if (focus) (body.querySelector('[tabindex="0"]') || body.querySelector('button'))?.focus({ preventScroll: true });
  }

  function open(focusGrid = false) {
    if (input.disabled) return;
    const anchor = from ?? todayDn();
    setView(range && to != null && months() === 1 ? to : anchor);
    focusDn = anchor; view = 'days';
    el.setAttribute('data-open', ''); input.setAttribute('aria-expanded', 'true');
    pop.open();
    render(focusGrid || isPhone());
  }
  function moveFocus(dn) {
    const a = lim('min'); const b = lim('max');
    if (a != null) dn = Math.max(a, dn);
    if (b != null) dn = Math.min(b, dn);
    focusDn = dn;
    const p = CAL[cal].parts(dn);
    const lastShown = addMonth(viewY, viewM, months() - 1);
    const idx = (y, m) => y * 12 + m;
    if (idx(p.y, p.m) < idx(viewY, viewM) || idx(p.y, p.m) > idx(lastShown[0], lastShown[1])) { viewY = p.y; viewM = p.m; }
    render(true);
  }
  function pick(dn) {
    if (outOf(dn)) return;
    focusDn = dn;
    if (!range) { from = dn; changed(); pop.close(true); return; }
    if (from == null || to != null) { from = dn; to = null; hover = null; syncText(); render(true); return; }
    if (dn < from) { to = from; from = dn; } else to = dn;
    changed(); pop.close(true);
  }
  function shift(k) {
    if (view === 'days') [viewY, viewM] = addMonth(viewY, viewM, k);
    else if (view === 'months') viewY += k;
    else yearPage += 12 * k;
    render();
  }

  const offs = [
    on(input, 'click', () => { if (!pop.isOpen) open(false); }),
    on(btn, 'click', () => (pop.isOpen ? pop.close(true) : open(true))),
    on(input, 'keydown', (e) => {
      if (e.key === 'ArrowDown' || (e.key === 'Enter' && input.readOnly)) { e.preventDefault(); pop.isOpen ? render(true) : open(true); }
      else if (e.key === 'Escape' && pop.isOpen) { e.preventDefault(); e.stopPropagation(); pop.close(); }
    }),
    on(input, 'change', (e) => {
      if (range || self) return;
      const dn = input.value.trim() ? parseText(cal, input.value) : null;
      if (dn != null && !outOf(dn)) { from = dn; changed(); if (pop.isOpen) { setView(dn); focusDn = dn; render(); } }
      else if (!input.value.trim()) { from = null; changed(); }
      else { hidden[0].value = ''; fire(hidden[0]); }
    }),
    on(panel, 'click', 'button', (e, b) => {
      if (b.dataset.dn) pick(Number(b.dataset.dn));
      else if (b.dataset.nav) shift(Number(b.dataset.nav));
      else if (b.classList.contains('ac-dp__title')) {
        if (view === 'days') view = 'months';
        else if (view === 'months') { view = 'years'; yearPage = viewY - (((viewY % 12) + 12) % 12); }
        else view = 'days';
        render(true);
      } else if (b.dataset.month) { viewM = Number(b.dataset.month); view = 'days'; focusDn = CAL[cal].from(viewY, viewM, 1); render(true); }
      else if (b.dataset.year) { viewY = Number(b.dataset.year); view = 'months'; render(true); }
      else if (b.dataset.cal) { if (b.dataset.cal !== cal) { cal = b.dataset.cal; setView(focusDn ?? todayDn()); syncText(); render(); emit(el, 'datepicker:calendar', { calendar: cal }); } }
      else if (b.dataset.act === 'today') { const t = todayDn(); if (range) { setView(t); focusDn = t; render(true); } else pick(t); }
      else if (b.dataset.act === 'clear') { from = null; to = null; changed(); pop.close(true); }
    }),
    on(panel, 'pointerover', '.ac-dp__day', (e, b) => {
      if (!range || from == null || to != null) return;
      const dn = Number(b.dataset.dn); if (dn === hover) return;
      hover = dn;
      panel.querySelectorAll('.ac-dp__day').forEach((x) => {
        const v = Number(x.dataset.dn); const lo = Math.min(from, hover); const hi = Math.max(from, hover);
        x.toggleAttribute('data-in', v >= lo && v <= hi && !x.hasAttribute('data-out'));
        x.toggleAttribute('data-start', v === lo); x.toggleAttribute('data-end', v === hi);
      });
    }),
    on(panel, 'keydown', (e) => {
      const b = e.target.closest('.ac-dp__day');
      if (b) {
        const dn = Number(b.dataset.dn); const rtl = isRTL(panel);
        const ws = o.weekStart !== '' ? Number(o.weekStart) : (i18n.lang === 'en' ? 0 : 6);
        const col = (weekday(dn) - ws + 7) % 7;
        const p = CAL[cal].parts(dn);
        const jumpMonths = (k) => { const [yy, mm] = addMonth(p.y, p.m, k); return CAL[cal].from(yy, mm, Math.min(p.d, monthLen(cal, yy, mm))); };
        const map = {
          ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -7, ArrowDown: 7, Home: -col, End: 6 - col,
        };
        if (e.key in map) { e.preventDefault(); moveFocus(dn + map[e.key]); }
        else if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); moveFocus(jumpMonths((e.key === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1))); }
        return;
      }
      const pickBtn = e.target.closest('.ac-dp__pick');
      if (pickBtn && /^Arrow/.test(e.key)) {
        e.preventDefault();
        const all = Array.from(panel.querySelectorAll('.ac-dp__pick')); const i = all.indexOf(pickBtn); const rtl = isRTL(panel);
        const d = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -3, ArrowDown: 3 }[e.key];
        const t = all[Math.max(0, Math.min(all.length - 1, i + d))];
        all.forEach((x) => { x.tabIndex = x === t ? 0 : -1; }); t.focus();
      }
    }),
    on(panel, 'focusout', (e) => { if (pop.isOpen && e.relatedTarget && !panel.contains(e.relatedTarget) && !el.contains(e.relatedTarget)) pop.close(); }),
    on(document, 'ac:i18n:change', () => { btn.setAttribute('aria-label', ft('chooseDate')); if (pop.isOpen) render(); }),
    on(input.form || document, 'reset', () => setTimeout(() => { from = null; to = null; syncText(); })),
  ];
  syncText();
  instance(el, 'datepicker', {
    get value() { return range ? [dnToIso(from), dnToIso(to)] : dnToIso(from); },
    get valid() { return !input.value.trim() || from != null; },
    set(v) { const a = [].concat(v).map(isoToDn); from = a[0] ?? null; to = range ? a[1] ?? null : null; changed(); },
    clear() { from = null; to = null; changed(); },
    calendar(c) { if (c && CAL[c]) { cal = c; syncText(); if (pop.isOpen) render(); } return cal; },
    open: () => open(true), close: () => pop.close(),
  });
  return () => { offs.forEach((f) => f()); pop.destroy(); };
});

/* ---------------------------------------------------------------- timepicker */
register('timepicker', (el) => {
  const o = options(el, { step: 5 });
  const input = el.querySelector('input'); if (!input) return;
  input.autocomplete = 'off'; input.classList.add('ac-num'); input.inputMode = 'numeric';
  if (matchMedia('(pointer: coarse)').matches) input.readOnly = true;
  const btn = h('button', { type: 'button', class: 'ac-input-group__btn', 'aria-label': ft('chooseTime'), html: icon('clock') });
  const col = (label, n, step) => {
    const lb = h('div', { class: 'ac-tp__col ac-pop__scroll', role: 'listbox', 'aria-label': label, dir: 'ltr' });
    for (let v = 0; v < n; v += step) lb.append(h('button', { type: 'button', role: 'option', class: 'ac-tp__opt ac-num', 'data-v': v, tabindex: '-1', text: pad(v) }));
    return lb;
  };
  const hours = col(ft('hour'), 24, 1); const mins = col(ft('minute'), 60, Math.max(1, Number(o.step) || 5));
  const panel = h('div', { class: 'ac-tp', role: 'dialog', 'aria-label': ft('chooseTime') },
    h('div', { class: 'ac-pop__grab', 'aria-hidden': 'true' }),
    h('div', { class: 'ac-tp__cols', dir: 'ltr' }, hours, h('span', { class: 'ac-tp__sep', text: ':' }), mins),
    h('div', { class: 'ac-dp__foot' }, h('button', { type: 'button', class: 'ac-btn ac-btn--primary ac-btn--sm ac-btn--block', 'data-act': 'done', text: ft('done') })));
  el.append(btn, panel);
  const pop = popup(el, panel, { sheet: true, match: false, onClose: (r) => { if (r) input.focus({ preventScroll: true }); } });
  let hh = null; let mm = null; let self = false;
  const parse = () => { const m = /^(\d{1,2})\s*[:٫.]?\s*(\d{2})?$/.exec(latin(input.value).trim()); if (!m) return false; const a = +m[1]; const b = +(m[2] || 0); if (a > 23 || b > 59) return false; hh = a; mm = b; return true; };
  function mark(scroll) {
    for (const [c, v] of [[hours, hh], [mins, mm]]) {
      let best = null;
      c.querySelectorAll('.ac-tp__opt').forEach((b) => {
        const on_ = v != null && Number(b.dataset.v) === v - (c === mins ? v % (Number(o.step) || 5) : 0);
        b.setAttribute('aria-selected', String(on_)); b.tabIndex = on_ ? 0 : -1; if (on_) best = b;
      });
      if (!best) c.firstElementChild.tabIndex = 0;
      if (scroll && best) c.scrollTop = best.offsetTop - c.clientHeight / 2 + best.offsetHeight / 2;
    }
  }
  function commit() {
    if (hh == null) return;
    const v = `${pad(hh)}:${pad(mm ?? 0)}`;
    if (input.value !== v) { input.value = v; self = true; fire(input); self = false; emit(el, 'timepicker:change', { value: v }); }
  }
  const openP = (focus) => { parse(); pop.open(); mark(true); if (focus) (hours.querySelector('[tabindex="0"]'))?.focus({ preventScroll: true }); };
  const offs = [
    on(input, 'click', () => { if (!pop.isOpen) openP(false); }),
    on(btn, 'click', () => (pop.isOpen ? pop.close(true) : openP(true))),
    on(input, 'keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); openP(true); } }),
    on(input, 'change', () => { if (!self && parse()) { commit(); mark(true); } }),
    on(panel, 'click', '.ac-tp__opt', (e, b) => {
      if (b.parentElement === hours) { hh = Number(b.dataset.v); if (mm == null) mm = 0; } else { mm = Number(b.dataset.v); if (hh == null) hh = 0; }
      mark(false); commit(); b.focus({ preventScroll: true });
    }),
    on(panel, 'click', '[data-act="done"]', () => { commit(); pop.close(true); }),
    on(panel, 'keydown', '.ac-tp__opt', (e, b) => {
      const sib = e.key === 'ArrowDown' ? b.nextElementSibling : e.key === 'ArrowUp' ? b.previousElementSibling : null;
      if (sib) { e.preventDefault(); sib.click(); sib.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const other = b.parentElement === hours ? mins : hours; (other.querySelector('[tabindex="0"]') || other.firstElementChild).focus(); }
      else if (e.key === 'Enter') { e.preventDefault(); commit(); pop.close(true); }
    }),
  ];
  instance(el, 'timepicker', { get value() { return input.value; }, open: () => openP(true), close: () => pop.close() });
  return () => { offs.forEach((f) => f()); pop.destroy(); };
});
return Object.freeze({ jalali, calKit });
})();

/* ---- js/components/date.js ---- */
const __ac_mv = F["js/components/date.js"] = (() => {
const { AC, i18n } = __ac_m1;
const { calKit } = __ac_m9;
/* AC.date — Jalali (Shamsi), Gregorian and Hijri lunar (Umm al-Qura) dates on top of the datepicker's calendar engine.
   AC.date.format(new Date(), { calendar: 'persian', style: 'numeric' })  → "1405/07/28" (digits: 'native' → "۱۴۰۵/۰۷/۲۸")
   style: numeric | short («۲۸ مهر») | medium («۲۸ مهر ۱۴۰۵») | long («سه‌شنبه ۲۸ مهر ۱۴۰۵») | month («مهر ۱۴۰۵») | relative («۳ روز پیش»)
   AC.date.parts(date, 'islamic') → {y,m,d} · AC.date.toDate(1405, 7, 28, 'persian') → Date (UTC midnight)
   AC.date.convert({y:1405,m:7,d:28}, 'persian', 'gregory') → {y:2026,m:10,d:20}
   AC.date.holidays(1405) → [{ iso, name, en, kind: 'solar'|'lunar' }] · AC.date.holiday(date) → {name,…}|null
   Lunar holidays are computed with Umm al-Qura; Iran's official lunar dates follow local moon sighting and can differ by ±1 day. */



const { CAL, DAY, dtf, caId, monthLen, weekday, todayDn, isoToDn, dnToIso, pad } = calKit;

const LOC = { fa: 'fa-IR', en: 'en-US', ar: 'ar-AE' };
const lng = (o) => (o.lang || i18n.lang || 'fa').split('-')[0];
const native = (o) => (o.digits || i18n.digits) === 'native';
const DIG = { fa: '۰۱۲۳۴۵۶۷۸۹', ar: '٠١٢٣٤٥٦٧٨٩' };
const digits = (s, o) => (native(o) && DIG[lng(o)] ? String(s).replace(/\d/g, (d) => DIG[lng(o)][d]) : String(s));
const loc = (o, cal) => `${LOC[lng(o)] || lng(o)}-u-ca-${caId(cal || 'gregory')}-nu-latn`;
const calOf = (o) => o.calendar || (lng(o) === 'fa' ? 'persian' : 'gregory');

/** Any date input → day number (days since 1970-01-01). ISO "YYYY-MM-DD" strings are taken literally; Dates use local Y/M/D. */
function dnOf(v) {
  if (typeof v === 'number' && v < 1e6) return v;
  if (typeof v === 'string') { const dn = isoToDn(v.slice(0, 10)); if (dn != null) return dn; }
  const d = new Date(v); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
}
const parts = (v, cal = 'persian') => CAL[cal].parts(dnOf(v));
const toDate = (y, m, d, cal = 'persian') => new Date(CAL[cal].from(y, m, d) * DAY);
const convert = ({ y, m, d }, from, to) => CAL[to].parts(CAL[from].from(y, m, d));
const monthName = (m, o = {}, y = 1405) => { const cal = calOf(o); return dtf(loc(o, cal), { month: 'long' }).format(new Date(CAL[cal].from(y, m, 15) * DAY)); };
const weekdayName = (v, o = {}) => dtf(loc(o), { weekday: o.weekday || 'long' }).format(new Date(dnOf(v) * DAY));

function relative(v, o = {}) {
  const diff = dnOf(v) - todayDn();
  const rtf = new Intl.RelativeTimeFormat(`${LOC[lng(o)] || lng(o)}${native(o) ? '' : '-u-nu-latn'}`, { numeric: 'auto' });
  const a = Math.abs(diff);
  if (a < 7) return rtf.format(diff, 'day');
  if (a < 30) return rtf.format(Math.round(diff / 7), 'week');
  if (a < 365) return rtf.format(Math.round(diff / 30.44), 'month');
  return rtf.format(Math.round(diff / 365.25), 'year');
}

function format(v, o = {}) {
  if (v == null || v === '') return '';
  const cal = calOf(o); const style = o.style || 'medium';
  if (style === 'relative') return relative(v, o);
  const dn = dnOf(v); const p = CAL[cal].parts(dn); const en = lng(o) === 'en';
  if (style === 'numeric') return digits(`${p.y}/${pad(p.m)}/${pad(p.d)}`, o);
  const mn = monthName(p.m, { ...o, calendar: cal }, p.y);
  const d = digits(p.d, o); const y = digits(p.y, o);
  if (style === 'month') return `${mn} ${y}`;
  if (style === 'short') return en ? `${mn} ${d}` : `${d} ${mn}`;
  const med = en ? `${mn} ${d}, ${y}` : `${d} ${mn} ${y}`;
  if (style === 'medium') return med;
  return `${weekdayName(dn, o)}${en ? ',' : ''} ${med}`; // long / full
}

/* ------------------------------------------------------------------ Iranian official holidays */
/* Solar (Jalali) holidays fall on the same Jalali date every year; checked against the official 1404–1406 calendars. */
const SOLAR = [
  [1, 1, 'جشن نوروز', 'Nowruz'], [1, 2, 'عید نوروز', 'Nowruz'], [1, 3, 'عید نوروز', 'Nowruz'], [1, 4, 'عید نوروز', 'Nowruz'],
  [1, 12, 'روز جمهوری اسلامی', 'Islamic Republic Day'], [1, 13, 'روز طبیعت', 'Nature Day (Sizdah Bedar)'],
  [3, 14, 'رحلت امام خمینی', 'Demise of Imam Khomeini'], [3, 15, 'قیام ۱۵ خرداد', '15 Khordad uprising'],
  [11, 22, 'پیروزی انقلاب اسلامی', 'Revolution Day'], [12, 29, 'ملی شدن صنعت نفت', 'Oil Nationalization Day'],
];
/* Lunar (Hijri) holidays on fixed Hijri dates; day 0 = last day of the month. */
const LUNAR = [
  [1, 9, 'تاسوعای حسینی', 'Tasua'], [1, 10, 'عاشورای حسینی', 'Ashura'], [2, 20, 'اربعین حسینی', 'Arbaeen'],
  [2, 28, 'رحلت رسول اکرم و شهادت امام حسن مجتبی', 'Demise of the Prophet & martyrdom of Imam Hasan'], [2, 0, 'شهادت امام رضا', 'Martyrdom of Imam Reza'],
  [3, 8, 'شهادت امام حسن عسکری', 'Martyrdom of Imam Hasan Askari'], [3, 17, 'میلاد رسول اکرم و امام جعفر صادق', 'Birth of the Prophet & Imam Sadiq'],
  [6, 3, 'شهادت حضرت فاطمه زهرا', 'Martyrdom of Fatimah'], [7, 13, 'ولادت امام علی', 'Birth of Imam Ali'], [7, 27, 'مبعث رسول اکرم', 'Mab\'ath'],
  [8, 15, 'ولادت حضرت قائم', 'Birth of Imam Mahdi'], [9, 21, 'شهادت حضرت علی', 'Martyrdom of Imam Ali'],
  [10, 1, 'عید سعید فطر', 'Eid al-Fitr'], [10, 2, 'تعطیل به مناسبت عید فطر', 'Eid al-Fitr holiday'], [10, 25, 'شهادت امام جعفر صادق', 'Martyrdom of Imam Sadiq'],
  [12, 10, 'عید سعید قربان', 'Eid al-Adha'], [12, 18, 'عید سعید غدیر خم', 'Eid al-Ghadir'],
];
const yearCache = new Map();
const hijriAdjust = {}; // 'hijriYear-month' → days (Iran's moon-sighting correction vs Umm al-Qura)
/** Holidays of a Jalali year, sorted: [{ iso, dn, name, en, kind }]. */
function holidays(jy) {
  if (yearCache.has(jy)) return yearCache.get(jy);
  const start = CAL.persian.from(jy, 1, 1); const end = CAL.persian.from(jy + 1, 1, 1);
  const out = [];
  for (const [m, d, name, en] of SOLAR) if (d <= monthLen('persian', jy, m)) out.push({ dn: CAL.persian.from(jy, m, d), name, en, kind: 'solar' });
  const h0 = CAL.islamic.parts(start).y; const h1 = CAL.islamic.parts(end).y;
  for (let hy = h0; hy <= h1; hy++) for (const [m, d, name, en] of LUNAR) {
    const dn = CAL.islamic.from(hy, m, d || monthLen('islamic', hy, m)) + (hijriAdjust[`${hy}-${m}`] || 0);
    if (dn >= start && dn < end) out.push({ dn, name, en, kind: 'lunar' });
  }
  out.sort((a, b) => a.dn - b.dn);
  out.forEach((x) => { x.iso = dnToIso(x.dn); });
  yearCache.set(jy, out);
  return out;
}
function holiday(v) {
  const dn = dnOf(v); const jy = CAL.persian.parts(dn).y;
  return holidays(jy).find((x) => x.dn === dn) || null;
}

calKit.decorate = (dn) => {
  const hd = holiday(dn);
  return { weekend: weekday(dn) === 5, holiday: hd ? (lng({}) === 'en' ? hd.en : hd.name) : null };
};

const date = {
  calendars: ['persian', 'gregory', 'islamic'],
  format, relative, parts, toDate, convert, holidays, holiday, monthName, weekdayName,
  /** Correct lunar holidays to Iran's announced dates: adjustHijri({ '1447-1': 1 }) shifts Muharram 1447 by +1 day. */
  adjustHijri(map) { Object.assign(hijriAdjust, map); yearCache.clear(); },
  isHoliday: (v) => !!holiday(v) || weekday(dnOf(v)) === 5,
  monthLength: (y, m, cal = 'persian') => monthLen(cal, y, m),
  today: () => dnToIso(todayDn()),
  toISO: (v) => dnToIso(dnOf(v)),
};
AC.date = date;
return Object.freeze({ date });
})();

return { f: F, ns: Object.freeze({ "jalali": __ac_m9["jalali"], "date": __ac_mv["date"] }) };
})();
export const { jalali, date } = __R["datepicker"].ns;
export default __R["datepicker"].ns;
