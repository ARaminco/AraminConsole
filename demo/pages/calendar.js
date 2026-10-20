/* Calendar page — month / week / agenda over demo/data.js events; Jalali ⇄ Gregorian (AC.jalali + Intl). */
import { calEvents } from '../data.js';

const state = { events: null, seq: 100 };
const HOURS = [7, 22];          // week grid range
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const noon = (y, m, d) => new Date(y, m, d, 12);
const addDays = (d, n) => noon(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fromUTC = (u) => noon(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate());

export default function mount(root, AC) {
  const { escapeHtml: esc, icon, t, format } = AC;
  state.events ??= calEvents.map((e) => ({ ...e }));
  const body = root.querySelector('[data-cal-body]');
  const title = root.querySelector('[data-cal-title]');
  const phone = matchMedia('(max-width: 639.98px)');
  const today = noon(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  let cal = AC.i18n.lang === 'fa' ? 'persian' : 'gregory';
  let view = phone.matches ? 'agenda' : 'month';
  let anchor = today; let selected = keyOf(today); let dir = 0;

  const weekStart = () => (AC.i18n.lang === 'en' && cal === 'gregory' ? 0 : 6);
  const parts = (d) => (cal === 'persian' ? AC.jalali.toJalali(d) : { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() });
  const monthStart = (y, m) => (cal === 'persian' ? fromUTC(AC.jalali.toDate(y, m, 1)) : noon(y, m - 1, 1));
  const monthLen = (y, m) => (cal === 'persian' ? AC.jalali.monthLength(y, m) : new Date(y, m, 0).getDate());
  const num = (n) => format.number(n, { useGrouping: false });
  const fd = (d, o) => format.date(d, { ...o, calendar: cal });
  const time = (iso) => format.date(iso, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const eventsOn = (key) => state.events.filter((e) => keyOf(new Date(e.start)) === key).sort((a, b) => new Date(a.start) - new Date(b.start));
  const startOfWeek = (d) => addDays(d, -((d.getDay() - weekStart() + 7) % 7));
  const dows = () => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(today), i));

  const chip = (e) => `<button class="ac-cal-ev" type="button" data-tone="${e.tone}" data-ev="${e.id}"><bdi class="ac-cal-ev__t">${esc(time(e.start))}</bdi><span class="ac-truncate">${esc(e.title)}</span></button>`;

  function month() {
    const { y, m } = parts(anchor);
    const first = monthStart(y, m); const len = monthLen(y, m);
    const start = startOfWeek(first);
    const weeks = Math.ceil(((first.getDay() - weekStart() + 7) % 7 + len) / 7);
    const cells = [];
    for (let i = 0; i < weeks * 7; i++) {
      const d = addDays(start, i); const k = keyOf(d); const p = parts(d); const evs = eventsOn(k);
      const out = p.m !== m;
      cells.push(`<div class="ac-cal-day" role="gridcell" data-date="${k}"${out ? ' data-out' : ''}${k === keyOf(today) ? ' data-today' : ''}${k === selected ? ' aria-selected="true"' : ''}>
        <button class="ac-cal-day__num" type="button" aria-label="${esc(fd(d, { dateStyle: 'full' }))}">${num(p.d)}</button>
        <div class="ac-cal-day__evs">${evs.slice(0, 2).map(chip).join('')}${evs.length > 2 ? `<button class="ac-cal-more" type="button" data-more="${k}"><bdi>+${num(evs.length - 2)}</bdi></button>` : ''}</div>
        <span class="ac-cal-day__dots" aria-hidden="true">${evs.slice(0, 3).map((e) => `<i data-tone="${e.tone}"></i>`).join('')}</span>
      </div>`);
    }
    title.textContent = fd(first, { month: 'long', year: 'numeric' });
    const sel = new Date(`${selected}T12:00`);
    return `<div class="ac-cal-month" role="grid" aria-label="${esc(title.textContent)}">
      <div class="ac-cal-month__dow" role="row">${dows().map((d) => `<span role="columnheader">${esc(fd(d, { weekday: phone.matches ? 'narrow' : 'short' }))}</span>`).join('')}</div>
      <div class="ac-cal-month__grid" role="rowgroup">${cells.join('')}</div></div>
      <div class="ac-cal-dayview ac-hide-desktop">${dayList(sel)}</div>`;
  }
  function dayList(d) {
    const evs = eventsOn(keyOf(d));
    return `<div class="ac-cal-agenda__head"><strong>${esc(fd(d, { weekday: 'long', day: 'numeric', month: 'long' }))}</strong>${keyOf(d) === keyOf(today) ? `<span class="ac-badge ac-badge--accent">${esc(t('cal.today', 'امروز'))}</span>` : ''}</div>
      ${evs.length ? `<ul class="ac-cal-agenda__list" role="list">${evs.map(row).join('')}</ul>` : `<p class="ac-cal-empty">${esc(t('cal.free', 'رویدادی ندارید — روز آزاد!'))}</p>`}`;
  }
  const row = (e) => `<li><button class="ac-cal-row" type="button" data-tone="${e.tone}" data-ev="${e.id}">
      <span class="ac-cal-row__time"><bdi>${esc(time(e.start))}</bdi><small><bdi>${esc(time(e.end))}</bdi></small></span>
      <span class="ac-cal-row__main"><strong>${esc(e.title)}</strong>${e.place ? `<small>${icon('map-pin')}${esc(e.place)}</small>` : ''}</span>
      <svg class="ac-icon ac-flip-rtl ac-cal-row__chev" aria-hidden="true"><use href="#i-chevron-right"/></svg></button></li>`;

  function week() {
    const start = startOfWeek(anchor); const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const end = days[6];
    title.textContent = `${fd(start, { day: 'numeric', month: 'short' })} – ${fd(end, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    const hours = []; for (let h = HOURS[0]; h < HOURS[1]; h++) hours.push(h);
    const now = new Date();
    return `<div class="ac-cal-week" data-hours="${HOURS[1] - HOURS[0]}">
      <div class="ac-cal-week__head"><span></span>${days.map((d) => `<button class="ac-cal-week__day" type="button" data-date="${keyOf(d)}"${keyOf(d) === keyOf(today) ? ' data-today' : ''}><small>${esc(fd(d, { weekday: 'short' }))}</small><b>${num(parts(d).d)}</b></button>`).join('')}</div>
      <div class="ac-cal-week__body">
        <div class="ac-cal-week__hours">${hours.map((h) => `<span><bdi>${pad(h)}:00</bdi></span>`).join('')}</div>
        ${days.map((d) => `<div class="ac-cal-week__col" data-date="${keyOf(d)}"${keyOf(d) === keyOf(today) ? ' data-today' : ''}>${eventsOn(keyOf(d)).map((e) => {
          const s = new Date(e.start); const en = new Date(e.end);
          return `<button class="ac-cal-block" type="button" data-tone="${e.tone}" data-ev="${e.id}" data-top="${(s.getHours() + s.getMinutes() / 60 - HOURS[0]).toFixed(2)}" data-len="${((en - s) / 3600000).toFixed(2)}"><strong class="ac-truncate">${esc(e.title)}</strong><small><bdi>${esc(time(e.start))} – ${esc(time(e.end))}</bdi></small></button>`;
        }).join('')}${keyOf(d) === keyOf(today) ? `<span class="ac-cal-now" data-top="${(now.getHours() + now.getMinutes() / 60 - HOURS[0]).toFixed(2)}"></span>` : ''}</div>`).join('')}
      </div></div>`;
  }

  function agenda() {
    const start = view === 'agenda' ? anchor : today;
    const days = Array.from({ length: 21 }, (_, i) => addDays(start, i)).filter((d) => eventsOn(keyOf(d)).length);
    title.textContent = `${fd(start, { day: 'numeric', month: 'long' })} – ${fd(addDays(start, 20), { day: 'numeric', month: 'long' })}`;
    if (!days.length) return `<p class="ac-cal-empty">${esc(t('cal.free', 'رویدادی ندارید'))}</p>`;
    return `<div class="ac-cal-agenda">${days.map((d) => `<section class="ac-cal-agenda__day${keyOf(d) === keyOf(today) ? ' is-today' : ''}">
      <div class="ac-cal-agenda__date"><b>${num(parts(d).d)}</b><small>${esc(fd(d, { weekday: 'short' }))}</small></div>
      <div class="ac-cal-agenda__evs"><div class="ac-cal-agenda__label">${esc(fd(d, { month: 'long', year: 'numeric' }))}${keyOf(d) === keyOf(today) ? ` · <span class="ac-text-accent">${esc(t('cal.today', 'امروز'))}</span>` : ''}</div><ul class="ac-cal-agenda__list" role="list">${eventsOn(keyOf(d)).map(row).join('')}</ul></div>
    </section>`).join('')}</div>`;
  }

  function render() {
    body.dataset.view = view;
    body.innerHTML = `<div class="ac-cal__pane" data-dir="${dir}">${view === 'month' ? month() : view === 'week' ? week() : agenda()}</div>`;
    for (const n of body.querySelectorAll('[data-top]')) n.style.setProperty('--_top', n.dataset.top);
    for (const n of body.querySelectorAll('[data-len]')) n.style.setProperty('--_len', n.dataset.len);
    if (view === 'week') { const sc = body.querySelector('.ac-cal-week__body'); const nowEl = sc.querySelector('.ac-cal-now'); sc.scrollTop = Math.max(0, ((nowEl ? Number(nowEl.dataset.top) : 2) - 1.5) * 48); }
    dir = 0;
    side();
  }
  function side() {
    const todays = eventsOn(keyOf(today));
    const list = root.querySelector('[data-cal-todaylist]');
    list.innerHTML = todays.length ? todays.map((e) => `<li data-tone="${e.tone}"><button type="button" data-ev="${e.id}"><i></i><span class="ac-truncate">${esc(e.title)}</span><bdi>${esc(time(e.start))}</bdi></button></li>`).join('') : `<li class="ac-cal-empty">${esc(t('cal.free', 'رویدادی ندارید'))}</li>`;
    root.querySelector('[data-cal-count]').textContent = num(todays.length);
    const next = state.events.filter((e) => new Date(e.start) > new Date()).sort((a, b) => new Date(a.start) - new Date(b.start))[0];
    root.querySelector('[data-cal-next]').innerHTML = next ? `<span class="ac-cal-next__label">${icon('alarm-clock')}${esc(t('cal.upNext', 'رویداد بعدی'))}</span>
      <strong class="ac-cal-next__title">${esc(next.title)}</strong>
      <span class="ac-cal-next__when"><bdi>${esc(fd(next.start, { weekday: 'long', day: 'numeric', month: 'long' }))}</bdi> · <bdi>${esc(time(next.start))}</bdi></span>
      <span class="ac-cal-next__left">${esc(format.relative(next.start))}</span>` : '';
  }

  function step(n) {
    dir = n;
    if (view === 'month') { let { y, m } = parts(anchor); m += n; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } anchor = monthStart(y, m); }
    else anchor = addDays(anchor, n * (view === 'week' ? 7 : 21));
    render();
  }

  function detail(id) {
    const e = state.events.find((x) => x.id === id); if (!e) return;
    const box = document.createElement('div');
    box.className = 'ac-stack ac-gap-3';
    box.innerHTML = `<div class="ac-cal-detail" data-tone="${e.tone}"><i></i><div class="ac-stack ac-gap-1"><strong>${esc(fd(e.start, { dateStyle: 'full' }))}</strong><span class="ac-text-muted"><bdi>${esc(time(e.start))} – ${esc(time(e.end))}</bdi></span>${e.place ? `<span class="ac-row ac-gap-1 ac-text-muted">${icon('map-pin')}${esc(e.place)}</span>` : ''}</div></div>`;
    const foot = document.createElement('div');
    foot.className = 'ac-cluster ac-gap-2';
    foot.innerHTML = `<button class="ac-btn ac-btn--danger-soft" type="button" data-del>${icon('trash-2')}<span>${esc(t('common.delete', 'حذف'))}</span></button><button class="ac-btn ac-btn--primary" type="button" data-ac-close>${esc(t('overlay.close', 'بستن'))}</button>`;
    foot.querySelector('[data-del]').addEventListener('click', () => { state.events = state.events.filter((x) => x !== e); AC.modal.close(); render(); AC.toast?.({ title: t('cal.deleted', 'رویداد حذف شد'), tone: 'danger' }); });
    AC.modal.open({ title: e.title, content: box, footer: foot, size: 'sm' });
  }

  function create(dateKey = selected) {
    const modal = root.querySelector('#cal-new-modal') || document.querySelector('#cal-new-modal');
    const dp = modal.querySelector('[data-cal-date]');
    AC.modal.open(modal);
    requestAnimationFrame(() => { const api = AC.instance(dp, 'datepicker'); api?.calendar(cal); api?.set(dateKey); });
  }

  const sysSeg = root.querySelector('[data-cal-system]');
  const viewSeg = root.querySelector('[data-cal-view]');
  AC.instance(sysSeg, 'segmented')?.select(cal === 'persian' ? 0 : 1, { silent: true });
  AC.instance(viewSeg, 'segmented')?.select(['month', 'week', 'agenda'].indexOf(view), { silent: true });
  render();

  const form = root.querySelector('[data-cal-form]');
  const offs = [
    AC.on(root, 'ac:segmented:change', (e) => {
      if (e.target === sysSeg) { cal = e.detail.value; render(); }
      if (e.target === viewSeg) { view = e.detail.value; if (view === 'agenda') anchor = today; render(); }
    }),
    AC.on(root, 'click', '[data-cal-step]', (e, b) => step(Number(b.dataset.calStep))),
    AC.on(root, 'click', '[data-cal-today]', () => { anchor = today; selected = keyOf(today); render(); }),
    AC.on(root, 'click', '[data-cal-new]', () => create()),
    AC.on(root, 'click', '[data-ev]', (e, b) => { e.stopPropagation(); detail(b.dataset.ev); }),
    AC.on(body, 'click', '[data-more]', (e, b) => { e.stopPropagation(); anchor = new Date(`${b.dataset.more}T12:00`); view = 'agenda'; AC.instance(viewSeg, 'segmented')?.select(2, { silent: true }); render(); }),
    AC.on(body, 'click', '.ac-cal-day', (e, cell) => {
      const k = cell.dataset.date;
      if (phone.matches || e.target.closest('.ac-cal-day__num')) {
        if (selected === k && !phone.matches) { create(k); return; }
        selected = k; body.querySelectorAll('.ac-cal-day[aria-selected]').forEach((n) => n.removeAttribute('aria-selected')); cell.setAttribute('aria-selected', 'true');
        const dv = body.querySelector('.ac-cal-dayview'); if (dv) dv.innerHTML = dayList(new Date(`${k}T12:00`));
        if (!phone.matches) create(k);
      } else create(k);
    }),
    AC.on(body, 'click', '.ac-cal-week__day', (e, b) => { selected = b.dataset.date; create(selected); }),
    AC.on(form, 'ac:form:submit', (e) => {
      const v = e.detail.values;
      const [sh, sm] = String(v.start || '10:00').split(':').map(Number); const [eh, em] = String(v.end || '11:00').split(':').map(Number);
      const day = v.date || selected; const [y, mo, d] = day.split('-').map(Number);
      const s = new Date(y, mo - 1, d, sh, sm || 0); let en = new Date(y, mo - 1, d, eh, em || 0); if (en <= s) en = new Date(s.getTime() + 3600000);
      state.events.push({ id: `e${++state.seq}`, title: v.title, place: v.place || '', tone: v.tone || 'accent', start: s.toISOString(), end: en.toISOString() });
      selected = day; anchor = new Date(y, mo - 1, d, 12);
      AC.modal.close(root.querySelector('#cal-new-modal') || document.querySelector('#cal-new-modal'));
      AC.instance(form, 'form')?.reset();
      render();
      AC.toast?.({ title: t('cal.saved', 'رویداد ذخیره شد'), text: v.title, tone: 'success' });
    }),
    AC.on(document, 'ac:i18n:change', () => render()),
  ];
  const onMQ = () => render();
  phone.addEventListener('change', onMQ);
  return () => { offs.forEach((f) => f()); phone.removeEventListener('change', onMQ); };
}
