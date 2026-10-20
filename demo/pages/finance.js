/* Finance page: card gallery, live card form, Sheba checker, money playground, table money cells, three calendars, bank grid. */
const luhnFill = (prefix, len = 16) => { // complete a prefix to a Luhn-valid number (deterministic filler)
  let s = prefix; let i = 0;
  while (s.length < len - 1) s += String((prefix.charCodeAt(i++ % prefix.length) * 7 + s.length * 3) % 10);
  for (let d = 0; d < 10; d++) if (AC.bank.luhn(s + d)) return s + d;
  return `${s}0`;
};
const fa = () => AC.i18n.lang === 'fa';
const esc = (s) => AC.escapeHtml(String(s ?? ''));

const GALLERY = [
  { bin: '603799', holder: 'علی اصغر رامین', holderEn: 'ALI ASGHAR RAMIN', expiry: '05/08', cvv: '482' },
  { bin: '610433', holder: 'سارا محمدی', holderEn: 'SARA MOHAMMADI', expiry: '06/11', cvv: '913' },
  { bin: '502229', holder: 'رضا کریمی', holderEn: 'REZA KARIMI', expiry: '07/02', cvv: '305' },
  { bin: '621986', holder: 'مریم احمدی', holderEn: 'MARYAM AHMADI', expiry: '05/12', cvv: '771' },
  { bin: '627353', holder: 'حسین رضایی', holderEn: 'HOSSEIN REZAEI', expiry: '08/04', cvv: '128' },
  { bin: '622106', holder: 'نگار صادقی', holderEn: 'NEGAR SADEGHI', expiry: '06/03', cvv: '640' },
  { bin: '627412', holder: 'امیر حسینی', holderEn: 'AMIR HOSSEINI', expiry: '07/09', cvv: '552' },
  { bin: '636214', holder: 'زهرا موسوی', holderEn: 'ZAHRA MOUSAVI', expiry: '05/10', cvv: '219' },
  { bin: '4567', bank: 'hsbc', holderEn: 'ALI RAMIN', expiry: '09/29', cvv: '611' },
  { bin: '5355', bank: 'revolut', holderEn: 'SARA RAMIN', expiry: '04/28', cvv: '904' },
  { bin: '4921', bank: 'emirates-nbd', holderEn: 'ALI A. RAMIN', expiry: '11/27', cvv: '337' },
  { bin: '5401', bank: 'ziraat', holderEn: 'ALI RAMIN', expiry: '02/30', cvv: '450' },
  { bin: '3782', len: 15, holderEn: 'ALI RAMIN', expiry: '12/28', cvv: '7421' },
  { bin: '6250', holderEn: 'LI WEI', expiry: '03/29', cvv: '118' },
  { bin: '2200', holderEn: 'IVAN PETROV', expiry: '10/27', cvv: '603' },
];

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const offs = [];
  AC.money.setRates({ USD: 1050000, EUR: 1220000, AED: 286000, GBP: 1400000, TRY: 25000, CNY: 146000, GOLD: 96000000, COIN: 1050000000 }); // demo only

  /* digits toggle */
  const digits = $('#fin-digits');
  digits.querySelectorAll('[data-value]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.value === AC.i18n.digits)));
  offs.push(AC.on(digits, 'ac:segmented:change', (e) => AC.i18n.setDigits(e.detail.value)));

  /* ---------------- gallery */
  const gallery = $('#fin-gallery');
  const cards = GALLERY.map((c) => {
    const slot = AC.h('div', { class: 'fin-gallery__item' });
    const el = AC.h('div', { 'data-size': 'fluid' });
    slot.append(el); gallery.append(slot);
    return { c, api: AC.bankCard(el, { number: luhnFill(c.bin, c.len), bank: c.bank, expiry: c.expiry, cvv: c.cvv }) };
  });
  const paintHolders = () => cards.forEach(({ c, api }) => api.set({ holder: fa() && c.holder ? c.holder : c.holderEn }));
  paintHolders();
  offs.push(AC.on(root, 'click', '[data-fin="mask"]', (e, b) => {
    const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on));
    cards.forEach(({ api }) => api.mask(on));
  }));
  offs.push(AC.on(root, 'click', '[data-fin="flip"]', () => cards.forEach(({ api }, i) => setTimeout(() => api.flip(), AC.reducedMotion() ? 0 : i * 45))));

  /* ---------------- live form samples */
  const samples = $('.fin-samples');
  const SAMPLE = ['melli', 'mellat', 'pasargad', 'saman', 'sepah', 'keshavarzi', 'shahr', 'post'];
  const drawSamples = () => {
    samples.innerHTML = SAMPLE.map((s) => { const b = AC.bank.get(s); return `<button class="ac-chip fin-chip" type="button" data-sample="${s}">${AC.bank.logo(s, { class: 'ac-bank-logo--sm' })}<span>${esc(fa() ? b.short : b.en.replace(/^Bank /, ''))}</span></button>`; }).join('')
      + `<button class="ac-chip fin-chip" type="button" data-sample="visa">${AC.bank.logo('visa', { network: true, class: 'ac-bank-logo--sm' })}<span>Visa</span></button>`;
  };
  drawSamples();
  const num = $('#fc-number');
  offs.push(AC.on(samples, 'click', '[data-sample]', (e, b) => {
    const s = b.dataset.sample;
    const n = s === 'visa' ? luhnFill('4111') : luhnFill(AC.bank.get(s).bins[0]);
    num.focus(); num.value = '';
    [...n].forEach((d, i) => setTimeout(() => { num.value += d; num.setSelectionRange(num.value.length, num.value.length); num.dispatchEvent(new Event('input', { bubbles: true })); }, AC.reducedMotion() ? 0 : i * 28));
  }));
  offs.push(AC.on($('#fin-card-form'), 'ac:form:submit', (e) => { e.detail.waitUntil?.(new Promise((r) => setTimeout(r, 600))); AC.toast?.({ title: AC.t('finance.cardSaved', 'کارت ذخیره شد'), tone: 'success' }); }));

  /* ---------------- Sheba samples + international IBAN */
  const mk = (code, acct) => { const bban = `${code}0${acct}`; return `IR${AC.bank.iban.checksum('IR', bban)}${bban}`; };
  const SHEBA = [mk('017', '000000123456789012'), mk('012', '000000098765432101'), mk('057', '000000202011223344'), 'IR820540102680020817909002', 'IR990170000000123456789012'];
  const shebaBox = $('#fin-sheba-samples');
  const drawSheba = () => { shebaBox.innerHTML = SHEBA.map((s, i) => { const b = AC.bank.sheba.bank(s); const ok = AC.bank.sheba.valid(s); return `<button class="ac-chip fin-chip" type="button" data-iban="${s}">${b ? AC.bank.logo(b.slug, { class: 'ac-bank-logo--sm' }) : ''}<span>${esc(ok ? (fa() ? b?.short : b?.en) || 'IR' : AC.t('finance.invalidSample', fa() ? 'نمونهٔ نامعتبر' : 'Invalid sample'))}</span></button>`; }).join(''); };
  drawSheba();
  offs.push(AC.on(shebaBox, 'click', '[data-iban]', (e, b) => AC.instance($('#fin-sheba'), 'sheba').set(b.dataset.iban)));
  const parts = $('#fin-sheba-parts');
  const drawParts = (v = '') => {
    const s = AC.bank.sheba.normalize(v || 'IR'); const b = AC.bank.sheba.bank(s);
    const cell = (k, val, hint) => `<div><dt>${esc(k)}</dt><dd class="ac-num" dir="ltr">${esc(val || '—')}</dd>${hint ? `<small>${esc(hint)}</small>` : ''}</div>`;
    parts.innerHTML = cell(AC.t('finance.country', fa() ? 'کشور' : 'Country'), 'IR', fa() ? 'ایران' : 'Iran')
      + cell(AC.t('finance.check', fa() ? 'رقم کنترل' : 'Check'), s.slice(2, 4), 'mod-97')
      + cell(AC.t('finance.bankCode', fa() ? 'کد بانک' : 'Bank code'), s.slice(4, 7), b ? (fa() ? b.short : b.en) : '')
      + cell(AC.t('finance.account', fa() ? 'شمارهٔ حساب' : 'Account'), s.slice(7).replace(/(.{4})(?=.)/g, '$1 '), '');
  };
  drawParts();
  offs.push(AC.on($('#fin-sheba'), 'ac:sheba:change', (e) => drawParts(e.detail.value)));
  const intl = $('#fs-intl'); const intlOut = $('#fs-intl-out');
  const checkIntl = () => {
    const ok = AC.bank.iban.valid(intl.value); const cc = AC.bank.iban.country(intl.value);
    intlOut.textContent = intl.value.trim() ? `${ok ? '✓' : '✗'} ${AC.bank.iban.format(intl.value)} · ${cc}` : '';
    intlOut.dataset.state = ok ? 'valid' : 'invalid';
  };
  checkIntl(); offs.push(AC.on(intl, 'input', checkIntl));

  /* ---------------- money playground */
  const moneyEl = $('#fin-money'); const out = $('#fin-money-out');
  const row = (k, v) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`;
  const rowH = (k, html) => `<div><dt>${esc(k)}</dt><dd>${html}</dd></div>`;
  function drawMoney() {
    const api = AC.instance(moneyEl, 'money'); if (!api) return;
    const v = api.value ?? 0; const cur = api.currency; const M = AC.money;
    out.innerHTML = [
      rowH(AC.t('finance.inRial', 'به ریال'), M.html(v, { currency: cur, to: 'IRR' })),
      rowH(AC.t('finance.inToman', 'به تومان'), M.html(v, { currency: cur, to: 'IRT' })),
      rowH(AC.t('finance.compact', 'خلاصه'), M.html(v, { currency: cur, compact: true, to: /^IR[RT]$/.test(cur) ? undefined : 'IRT' })),
      rowH(AC.t('finance.inUsd', 'به دلار'), M.html(v, { currency: cur, to: 'USD' })),
      rowH(AC.t('finance.inEur', 'به یورو'), M.html(v, { currency: cur, to: 'EUR' })),
      rowH(AC.t('finance.inAed', 'به درهم'), M.html(v, { currency: cur, to: 'AED' })),
      row(AC.t('finance.wordsFa', 'به حروف فارسی'), M.words(v, { currency: cur, lang: 'fa' })),
      row(AC.t('finance.wordsEn', 'به حروف انگلیسی'), M.words(v, { currency: cur, lang: 'en' })),
    ].join('');
  }
  offs.push(AC.on(moneyEl, 'ac:money:change', drawMoney));
  requestAnimationFrame(drawMoney);

  /* ---------------- table with IRR money cells */
  const TX = [
    ['واریز حقوق', 'Salary deposit', 'melli', 1850000000, 0], ['خرید از فروشگاه', 'Store purchase', 'mellat', -42750000, 1], ['انتقال پایا', 'PAYA transfer', 'pasargad', -320000000, 2],
    ['قسط وام', 'Loan instalment', 'saman', -96500000, 4], ['سود سپرده', 'Deposit interest', 'tejarat', 27840000, 6], ['قبض برق', 'Electricity bill', 'sepah', -3125000, 9],
  ];
  const tableEl = $('#fin-table');
  const rows = () => TX.map(([t, te, b, amt, ago], i) => ({ id: i, title: fa() ? t : te, bank: b, amount: amt, date: new Date(Date.now() - ago * 864e5).toISOString().slice(0, 10) }));
  const table = AC.table(tableEl, {
    id: 'fin-tx', rows: rows(), pageSize: 6, search: false, toolbar: false, pagination: false, info: false, columnsMenu: false, exportable: false,
    columns: [
      { key: 'title', label: 'شرح', i18n: 'finance.colDesc', primary: true },
      { key: 'bank', label: 'بانک', i18n: 'finance.colBank', render: (r) => { const b = AC.bank.get(r.bank); return `<span class="fin-bankcell">${AC.bank.logo(r.bank, { class: 'ac-bank-logo--sm' })}<span>${esc(fa() ? b.short : b.en)}</span></span>`; } },
      { key: 'amount', label: 'مبلغ', i18n: 'finance.colAmount', type: 'money', currency: 'IRR', align: 'end' },
      { key: 'date', label: 'تاریخ', i18n: 'col.date', type: 'date', dateOptions: { dateStyle: 'medium' } },
    ],
  });
  offs.push(AC.on(document, 'ac:i18n:change', () => table.setRows(rows())));

  /* ---------------- three calendars */
  const calsEl = $('#fin-cals'); let anchor = Date.now();
  const CALS = [['persian', 'gregory'], ['gregory', 'persian'], ['islamic', 'persian']];
  const D = AC.date;
  function monthGrid(cal, sec) {
    const p = D.parts(new Date(anchor), cal);
    const first = D.toDate(p.y, p.m, 1, cal); const len = D.monthLength(p.y, p.m, cal);
    const ws = AC.i18n.lang === 'en' ? 0 : 6; const lead = (first.getUTCDay() - ws + 7) % 7;
    const today = D.today();
    const name = { persian: AC.t('form.jalali', 'شمسی'), gregory: AC.t('form.gregorian', 'میلادی'), islamic: AC.t('form.hijri', 'قمری') }[cal];
    const last = new Date(first.getTime() + (len - 1) * 864e5);
    let h = `<section class="fin-cal" data-cal="${cal}"><header class="fin-cal__head"><span class="ac-badge ac-badge--neutral">${esc(name)}</span><strong>${esc(D.format(first, { calendar: cal, style: 'month' }))}</strong><small>${esc(D.format(first, { calendar: sec, style: 'short' }))} – ${esc(D.format(last, { calendar: sec, style: 'medium' }))}</small></header><div class="fin-cal__grid" role="grid">`;
    for (let i = 0; i < 7; i++) h += `<span class="fin-cal__wd">${esc(D.weekdayName(`2024-01-${String(7 + ((ws + i) % 7)).padStart(2, '0')}`, { weekday: 'narrow' }))}</span>`;
    for (let i = 0; i < lead; i++) h += '<span></span>';
    for (let d = 1; d <= len; d++) {
      const dt = new Date(first.getTime() + (d - 1) * 864e5); const iso = dt.toISOString().slice(0, 10);
      const hol = D.holiday(iso); const fri = dt.getUTCDay() === 5;
      const sp = D.parts(iso, sec);
      h += `<span class="fin-cal__day"${hol ? ` data-holiday title="${esc(fa() ? hol.name : hol.en)}"` : ''}${fri && ws === 6 ? ' data-weekend' : ''}${iso === today ? ' aria-current="date"' : ''}><b>${esc(D.format(iso, { calendar: cal, style: 'numeric' }).split('/')[2].replace(/^0|^۰/, ''))}</b><small>${esc(D.format(iso, { calendar: sec, style: 'numeric' }).split('/')[2].replace(/^0|^۰/, ''))}</small></span>`;
      void sp;
    }
    return `${h}</div></section>`;
  }
  const drawCals = () => { calsEl.innerHTML = CALS.map(([c, s]) => monthGrid(c, s)).join(''); };
  drawCals();
  offs.push(AC.on(root, 'click', '[data-fin="prev"],[data-fin="next"],[data-fin="today"]', (e, b) => {
    anchor = b.dataset.fin === 'today' ? Date.now() : anchor + (b.dataset.fin === 'next' ? 30 : -30) * 864e5;
    drawCals();
    if (!AC.reducedMotion()) calsEl.querySelectorAll('.fin-cal__grid').forEach((g) => g.animate([{ opacity: 0, transform: `translateX(${(b.dataset.fin === 'next') === (AC.i18n.dir === 'rtl') ? '-' : ''}12px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' }));
  }));

  /* date outputs + holidays */
  const dp = $('#fin-dp'); const dateOut = $('#fin-date-out'); const holEl = $('#fin-holidays');
  function drawDate() {
    const iso = AC.instance(dp, 'datepicker')?.value || D.today();
    const hol = D.holiday(iso);
    dateOut.innerHTML = [
      row(AC.t('form.jalali', 'شمسی'), `${D.format(iso, { calendar: 'persian', style: 'numeric' })} · ${D.format(iso, { calendar: 'persian', style: 'long' })}`),
      row(AC.t('form.gregorian', 'میلادی'), `${D.format(iso, { calendar: 'gregory', style: 'numeric' })} · ${D.format(iso, { calendar: 'gregory', style: 'long' })}`),
      row(AC.t('form.hijri', 'قمری'), `${D.format(iso, { calendar: 'islamic', style: 'numeric' })} · ${D.format(iso, { calendar: 'islamic', style: 'medium' })}`),
      row(AC.t('finance.relative', 'نسبی'), D.format(iso, { style: 'relative' })),
      row(AC.t('finance.holiday', 'تعطیلی'), hol ? (fa() ? hol.name : hol.en) : '—'),
    ].join('');
    const jy = D.parts(new Date(), 'persian').y; const today = D.today();
    const next = [...D.holidays(jy), ...D.holidays(jy + 1)].filter((x) => x.iso >= today).slice(0, 6);
    holEl.innerHTML = next.map((x) => `<li><span class="fin-holidays__date"><b>${esc(D.format(x.iso, { calendar: 'persian', style: 'short' }))}</b><small>${esc(D.format(x.iso, { style: 'relative' }))}</small></span><span>${esc(fa() ? x.name : x.en)}</span><span class="ac-badge ac-badge--${x.kind === 'lunar' ? 'info' : 'accent'}">${esc(x.kind === 'lunar' ? AC.t('form.hijri', 'قمری') : AC.t('form.jalali', 'شمسی'))}</span></li>`).join('');
  }
  drawDate();
  offs.push(AC.on(dp, 'ac:datepicker:change', drawDate));

  /* ---------------- bank grid */
  const banksEl = $('#fin-banks'); const netsEl = $('#fin-nets'); const q = $('#fin-bank-q');
  function drawBanks() {
    const term = AC.money.parse(q.value) ? String(AC.money.parse(q.value)) : q.value.trim().toLowerCase();
    const list = [...AC.bank.list(), ...AC.bank.foreign()].filter((b) => !term || [b.fa, b.en, b.slug, b.sheba, ...(b.bins || [])].some((x) => String(x || '').toLowerCase().includes(term)));
    banksEl.innerHTML = list.map((b) => `<div class="fin-bank" style="--_c1:${b.colors[0]};--_c2:${b.colors[1]}">
      <span class="fin-bank__logo">${AC.bank.logo(b.slug, { class: 'ac-bank-logo--lg' })}</span>
      <span class="fin-bank__main"><strong>${esc((fa() ? b.fa : b.en).replace(/s*(.*)$/, ''))}</strong><small>${esc((fa() ? b.en : b.fa).replace(/s*(.*)$/, ''))}</small>
      <span class="fin-bank__meta ac-num" dir="ltr">${b.bins ? esc(b.bins.join(' · ')) : ''}${b.sheba ? ` <em>IR··${esc(b.sheba)}</em>` : ''}</span></span>
      ${b.logo === 'monogram' ? `<span class="ac-badge ac-badge--neutral">${esc(AC.t('finance.monogram', fa() ? 'نشان ساده' : 'Monogram'))}</span>` : b.merged ? `<span class="ac-badge ac-badge--warning">${esc(AC.t('finance.merged', fa() ? 'ادغام در سپه' : 'Merged'))}</span>` : ''}</div>`).join('')
      || `<p class="ac-text-muted ac-text-sm">${esc(AC.t('table.empty', fa() ? 'نتیجه‌ای نیست' : 'No results'))}</p>`;
    netsEl.innerHTML = AC.bank.networks().map((n) => `<div class="fin-bank fin-bank--net"><span class="fin-bank__logo">${AC.bank.logo(n.slug, { network: true, class: 'ac-bank-logo--lg' })}</span><span class="fin-bank__main"><strong>${esc(fa() ? n.fa : n.en)}</strong><small>${esc(n.logo === 'monogram' ? AC.t('finance.monogram', fa() ? 'نشان ساده' : 'Monogram') : 'simple-icons · CC0')}</small></span></div>`).join('');
  }
  drawBanks();
  offs.push(AC.on(q, 'input', AC.debounce ? AC.debounce(drawBanks, 120) : drawBanks));

  offs.push(AC.on(document, 'ac:i18n:change', () => { paintHolders(); drawSamples(); drawSheba(); drawMoney(); drawCals(); drawDate(); drawBanks(); checkIntl(); }));
  return () => offs.forEach((f) => f());
}
