/*! AraminConsole v0.1.0 — module money — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');
if (!__R["forms"]) await import('./forms.js');

/* ======== module: money ======== */
if (!__R["money"]) __R["money"] = (() => {
const F = {};
const __ac_m1 = __R["core"].f["js/core.js"];
const __ac_m8 = __R["forms"].f["js/components/form-core.js"];
const __ac_mb = __R["forms"].f["js/components/form-validate.js"];
/* ---- js/components/money.js ---- */
const __ac_mu = F["js/components/money.js"] = (() => {
const { AC, register, on, emit, options, h, i18n, store, instance, ready, reducedMotion, escapeHtml, scan } = __ac_m1;
const { latin, fire } = __ac_m8;
/* Money — Iranian-first currency formatting, words, Rial↔Toman, money input and live amounts.
   AC.money.format(12500000, { currency: 'IRT' })            → "12,500,000 تومان"  (fa) · "12,500,000 Toman" (en)
   AC.money.format(125e6, { from: 'IRR', currency: 'IRT', compact: true }) → "12.5 میلیون تومان"
   AC.money.words(1200000, { currency: 'IRT' })             → "یک میلیون و دویست هزار تومان"
   AC.money.convert(1000, 'IRT', 'IRR') → 10000 · AC.money.setUnit('IRR'|'IRT') re-renders every [data-ac-money]
   <span data-ac-money="125000000" [data-currency="IRR"] [data-to="USD"] [data-compact] [data-words] [data-display="symbol|name|code|none"]></span>
   <div data-ac="money-unit"></div>  → segmented «ریال / تومان» bound to the page unit
   <div class="ac-input-group ac-money" data-ac="money" data-name="amount" data-currency="IRT" [data-currencies="IRT,IRR,USD"] [data-words="true"]>
     <input class="ac-input" id="amount"></div>
   Events: ac:money:unit {unit} (document) · ac:money:change {value, currency, text, words} */



/* code → { fa, en, ar, sym (symbol), dec (fraction digits), sub: [fa, en] (minor unit), irr: rial factor for IRT } */
const CUR = {
  IRR: { fa: 'ریال', en: 'Rial', ar: 'ريال', sym: '﷼', dec: 0, iso: 'IRR' },
  IRT: { fa: 'تومان', en: 'Toman', ar: 'تومان', sym: 'تومان', dec: 0, factor: 10 },
  USD: { fa: 'دلار', en: 'US dollar', ar: 'دولار', sym: '$', dec: 2, iso: 'USD', sub: ['سنت', 'cents'] },
  EUR: { fa: 'یورو', en: 'Euro', ar: 'يورو', sym: '€', dec: 2, iso: 'EUR', sub: ['سنت', 'cents'] },
  AED: { fa: 'درهم', en: 'UAE dirham', ar: 'درهم', sym: 'AED', dec: 2, iso: 'AED', sub: ['فلس', 'fils'] },
  GBP: { fa: 'پوند', en: 'Pound sterling', ar: 'جنيه', sym: '£', dec: 2, iso: 'GBP', sub: ['پنی', 'pence'] },
  TRY: { fa: 'لیر', en: 'Turkish lira', ar: 'ليرة', sym: '₺', dec: 2, iso: 'TRY', sub: ['کوروش', 'kuruş'] },
  CNY: { fa: 'یوان', en: 'Yuan', ar: 'يوان', sym: '¥', dec: 2, iso: 'CNY', sub: ['فن', 'fen'] },
  GOLD: { fa: 'گرم طلا', en: 'g gold (18k)', ar: 'غرام ذهب', sym: 'g', dec: 3 },
  COIN: { fa: 'سکه', en: 'gold coin', ar: 'عملة ذهبية', sym: 'coin', dec: 0 },
};
/* Mock / app-supplied rates: rials per unit. Set real ones with AC.money.setRates({ USD: 1050000 }). */
const rates = { IRR: 1, IRT: 10 };
const lang = (o) => (o.lang || i18n.lang || 'fa').split('-')[0];
const digitsOf = (o) => o.digits || i18n.digits || 'latn';

/* ------------------------------------------------------------------ numbers */
const nf = new Map();
function num(n, o = {}) {
  const l = lang(o); const native = digitsOf(o) === 'native';
  const loc = `${{ fa: 'fa-IR', ar: 'ar-AE', en: 'en-US' }[l] || l}${native ? '' : '-u-nu-latn'}`;
  const key = `${loc}|${o.min ?? ''}|${o.max ?? ''}|${o.compact ? 1 : 0}`;
  let f = nf.get(key);
  if (!f) {
    f = new Intl.NumberFormat(loc, { minimumFractionDigits: o.min ?? 0, maximumFractionDigits: o.max ?? 2, notation: o.compact ? 'compact' : 'standard', useGrouping: o.grouping ?? true });
    nf.set(key, f);
  }
  return f.format(n);
}

/** Convert between currencies (IRR/IRT fixed ×10; others need AC.money.setRates). */
function convert(amount, from = 'IRR', to = 'IRR') {
  if (from === to || amount == null || amount === '') return Number(amount);
  const a = rates[from]; const b = rates[to];
  if (!a || !b) return NaN;
  return (Number(amount) * a) / b;
}

/* Persian compact: هزار · میلیون · میلیارد · همت (= هزار میلیارد تومان) */
const FA_SCALES = [[1e12, 'هزار میلیارد'], [1e9, 'میلیارد'], [1e6, 'میلیون'], [1e3, 'هزار']];
function compactFa(v, o) {
  const a = Math.abs(v);
  for (const [s, w] of FA_SCALES) if (a >= s) return { n: num(v / s, { ...o, max: a / s >= 100 ? 0 : 1 }), scale: w, s };
  return null;
}

/**
 * parts(amount, opts) → { num, unit, pre, dir, text } — the number and its unit kept apart, so RTL text can
 * isolate the number as LTR (`<bdi dir="ltr">`) and keep a minus sign on the right side of the digits.
 * opts: { currency='IRT'|'IRR'|ISO|'GOLD'|'COIN', from (stored currency → converted), compact,
 *         display: 'auto'|'symbol'|'name'|'code'|'none', decimals, digits: 'latn'|'native', lang, sign }
 */
function parts(amount, opts = {}) {
  const o = { ...opts };
  const code = (o.currency || money.unit || 'IRT').toUpperCase();
  const c = CUR[code] || { fa: code, en: code, sym: code, dec: 2 };
  const l = lang(o); const dir = l === 'en' ? 'ltr' : 'rtl';
  let v = o.from ? convert(amount, o.from.toUpperCase(), code) : Number(amount);
  if (!Number.isFinite(v)) return { num: '—', unit: '', pre: false, dir, text: '—' };
  const dec = o.decimals ?? c.dec;
  v = Math.round(v * 10 ** dec) / 10 ** dec;
  let n; let unit = c[l] || c.en; let pre = false;
  if (o.compact && l !== 'en') {
    const r = compactFa(v, o);
    if (r && r.s === 1e12 && code === 'IRT') { n = r.n; unit = 'همت'; } // هزار میلیارد تومان
    else if (r) { n = r.n; unit = `${r.scale} ${unit}`; }
    else n = num(v, { ...o, max: dec });
  } else if (o.compact) n = num(v, { ...o, compact: true, max: 1 });
  else n = num(v, { ...o, min: Number.isInteger(v) && dec > 0 && o.decimals == null ? 0 : dec, max: dec });
  n = n.replace(/^[‎‏؜]+/, '').replace(/^[−]/, '-');
  if (o.sign && v > 0) n = `+${n}`;
  const disp = o.display || 'auto';
  if (disp === 'none') unit = '';
  else if (disp === 'code') { unit = code; pre = l === 'en'; }
  else if (disp !== 'name' && /^[$€£¥₺]$/.test(c.sym) && (disp === 'symbol' || l === 'en')) { unit = c.sym; pre = true; }
  else if (l === 'en' && (code === 'IRR' || code === 'AED')) { unit = code; pre = true; }
  const text = !unit ? n : pre ? `${unit}${unit.length > 1 ? ' ' : ''}${n}` : `${n} ${unit}`;
  return { num: n, unit, pre, dir, text };
}
const format = (amount, opts) => parts(amount, opts).text;
/** HTML with the number isolated LTR inside a direction-correct phrase. */
function partsHtml(p) {
  const n = `<bdi dir="ltr" class="ac-money__num">${escapeHtml(p.num)}</bdi>`;
  if (!p.unit) return n;
  return p.pre ? `<span class="ac-money__unit-t">${escapeHtml(p.unit)}</span>${p.unit.length > 1 ? ' ' : ''}${n}` : `${n} <span class="ac-money__unit-t">${escapeHtml(p.unit)}</span>`;
}

/* ------------------------------------------------------------------ words */
const FA = {
  ones: ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'],
  teens: ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'],
  tens: ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'],
  hundreds: ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'],
  scales: ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون', 'تریلیارد'],
};
const EN = {
  ones: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
  teens: ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
  tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
  scales: ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'],
};
function faTriplet(n) {
  const out = []; const hnd = Math.floor(n / 100); const rest = n % 100;
  if (hnd) out.push(FA.hundreds[hnd]);
  if (rest >= 10 && rest < 20) out.push(FA.teens[rest - 10]);
  else { if (rest >= 20) out.push(FA.tens[Math.floor(rest / 10)]); if (rest % 10) out.push(FA.ones[rest % 10]); }
  return out.join(' و ');
}
function enTriplet(n) {
  const out = []; const hnd = Math.floor(n / 100); const rest = n % 100;
  if (hnd) out.push(`${EN.ones[hnd]} hundred`);
  if (rest >= 10 && rest < 20) out.push(EN.teens[rest - 10]);
  else if (rest) out.push(rest >= 20 ? `${EN.tens[Math.floor(rest / 10)]}${rest % 10 ? `-${EN.ones[rest % 10]}` : ''}` : EN.ones[rest]);
  return out.join(' ');
}
/** Integer to words: toWords(1200000) → "یک میلیون و دویست هزار"; { lang: 'en' } → "one million two hundred thousand". */
function toWords(value, o = {}) {
  const l = lang(o) === 'en' ? 'en' : 'fa';
  let n = Math.trunc(Math.abs(Number(latin(value)) || 0));
  if (!n) return l === 'en' ? 'zero' : 'صفر';
  const parts = []; let i = 0;
  while (n > 0 && i < FA.scales.length) {
    const t = n % 1000;
    if (t) parts.unshift(l === 'en' ? `${enTriplet(t)}${EN.scales[i] ? ` ${EN.scales[i]}` : ''}` : `${faTriplet(t)}${FA.scales[i] ? ` ${FA.scales[i]}` : ''}`);
    n = Math.floor(n / 1000); i++;
  }
  const s = parts.join(l === 'en' ? ' ' : ' و ');
  return Number(value) < 0 ? `${l === 'en' ? 'minus' : 'منفی'} ${s}` : s;
}
/** Amount in words with the unit: words(12.5, { currency: 'USD' }) → "دوازده دلار و پنجاه سنت". */
function words(amount, o = {}) {
  const code = (o.currency || money.unit || 'IRT').toUpperCase(); const c = CUR[code] || { fa: code, en: code };
  const l = lang(o) === 'en' ? 'en' : 'fa';
  const v = o.from ? convert(amount, o.from.toUpperCase(), code) : Number(latin(amount));
  if (!Number.isFinite(v)) return '';
  const whole = Math.trunc(v); const cents = Math.round(Math.abs(v - whole) * 100);
  let s = `${toWords(whole, { lang: l })} ${l === 'en' ? (c.en || code) : c.fa}`;
  if (cents && c.sub) s += l === 'en' ? ` and ${toWords(cents, { lang: 'en' })} ${c.sub[1]}` : ` و ${toWords(cents)} ${c.sub[0]}`;
  return s;
}
/** Parse user text ("۱۲٬۵۰۰", "12,500.5") → number or NaN. */
function parse(text) {
  const s = latin(text).replace(/[٬,\s_']/g, '').replace(/[٫/]/g, '.');
  return s === '' || s === '.' || s === '-' ? NaN : Number(s);
}

/* ------------------------------------------------------------------ page unit + live amounts */
const SEL = '[data-ac-money]';
function renderEl(el, animate) {
  const raw = Number(el.getAttribute('data-ac-money'));
  const from = (el.dataset.currency || 'IRR').toUpperCase();
  const to = (el.dataset.to || (from === 'IRR' || from === 'IRT' ? money.unit : from)).toUpperCase();
  const o = { from, currency: to, compact: el.hasAttribute('data-compact'), display: el.dataset.display, sign: el.hasAttribute('data-sign') };
  const p = parts(raw, o);
  el.setAttribute('dir', p.dir);
  el.classList.add('ac-num');
  if (el.hasAttribute('data-words')) el.title = words(raw, { from, currency: to });
  const prevTo = el.dataset.acShown;
  el.dataset.acShown = to;
  if (animate && prevTo && prevTo !== to && !reducedMotion() && !o.compact) return tick(el, convert(raw, from, prevTo), convert(raw, from, to), o);
  el.innerHTML = partsHtml(p);
  if (animate && prevTo !== to && !reducedMotion()) { el.classList.remove('ac-money-tick'); void el.offsetWidth; el.classList.add('ac-money-tick'); }
}
/* number ticker: count from the old unit value to the new one */
function tick(el, a, b, o) {
  const t0 = performance.now(); const dur = 420;
  cancelAnimationFrame(el._acTick);
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur); const e = 1 - (1 - p) ** 3;
    el.innerHTML = partsHtml(parts(a + (b - a) * e, { ...o, from: null }));
    if (p < 1) el._acTick = requestAnimationFrame(step);
  };
  el._acTick = requestAnimationFrame(step);
  el.classList.remove('ac-money-tick'); void el.offsetWidth; el.classList.add('ac-money-tick');
}
function render(root = document, animate = false) {
  if (root.nodeType === 1 && root.matches(SEL)) renderEl(root, animate);
  root.querySelectorAll?.(SEL).forEach((el) => renderEl(el, animate));
}

const money = {
  currencies: CUR,
  rates,
  unit: store.get('ac:money-unit', 'IRT'),
  format, parts, words, toWords, convert, parse, render,
  setRates(r) { Object.assign(rates, r); render(document); },
  setUnit(u) {
    u = String(u).toUpperCase(); if (u !== 'IRR' && u !== 'IRT') return;
    money.unit = u; store.set('ac:money-unit', u);
    render(document, true);
    emit(document, 'money:unit', { unit: u });
  },
  /** HTML for a live amount: money.html(125e6, { currency: 'IRR', compact: true }) */
  html(amount, o = {}) {
    const attrs = [`data-ac-money="${Number(amount)}"`, `data-currency="${escapeHtml(o.currency || 'IRR')}"`];
    if (o.compact) attrs.push('data-compact'); if (o.to) attrs.push(`data-to="${escapeHtml(o.to)}"`); if (o.words) attrs.push('data-words');
    const p = parts(amount, { from: o.currency || 'IRR', currency: o.to || (/^IR[RT]$/.test(o.currency || 'IRR') ? money.unit : o.currency), compact: o.compact });
    return `<bdi class="ac-num ${o.class || ''}" dir="${p.dir}" ${attrs.join(' ')}>${partsHtml(p)}</bdi>`;
  },
};
AC.money = money;

ready(() => {
  render(document);
  new MutationObserver((recs) => { for (const r of recs) r.addedNodes.forEach((n) => { if (n.nodeType === 1) render(n); }); })
    .observe(document.documentElement, { childList: true, subtree: true });
  on(document, 'ac:i18n:change', () => render(document));
});

/* ------------------------------------------------------------------ unit toggle «ریال / تومان» */
register('money-unit', (el) => {
  el.classList.add('ac-segmented', 'ac-segmented--sm', 'ac-money-unit');
  el.innerHTML = ['IRR', 'IRT'].map((c) => `<button class="ac-segmented__item" type="button" role="radio" data-value="${c}" aria-checked="${money.unit === c}"><span></span></button>`).join('');
  const label = () => {
    el.querySelectorAll('[data-value]').forEach((b) => { b.firstChild.textContent = CUR[b.dataset.value][lang({})] || CUR[b.dataset.value].en; });
    el.setAttribute('aria-label', AC.t('finance.unit', lang({}) === 'en' ? 'Display unit' : 'واحد نمایش'));
  };
  label();
  if (!el.dataset.ac.split(/\s+/).includes('segmented')) { el.dataset.ac = `${el.dataset.ac} segmented`; scan(el); } // sliding ink pill
  const offs = [
    on(el, 'ac:segmented:change', (e) => money.setUnit(e.detail.value)),
    on(document, 'ac:money:unit', () => {
      const i = money.unit === 'IRR' ? 0 : 1; const seg = instance(el, 'segmented');
      if (seg) seg.select(i, { silent: true }); else el.querySelectorAll('[data-value]').forEach((b, j) => b.setAttribute('aria-checked', String(j === i)));
    }),
    on(document, 'ac:i18n:change', label),
  ];
  return () => offs.forEach((f) => f());
});

/* ------------------------------------------------------------------ money input */
/** Format a typed string keeping the caret next to the same digit. Returns { text, caret }. */
function groupTyped(text, caret, o) {
  const native = digitsOf(o) === 'native';
  const raw = latin(text);
  const digitsBefore = raw.slice(0, caret).replace(/[^\d.]/g, '').length;
  let clean = raw.replace(/[٫/]/g, '.').replace(/[^\d.]/g, '');
  const dot = clean.indexOf('.');
  if (dot > -1) clean = clean.slice(0, dot + 1) + clean.slice(dot + 1).replace(/\./g, '').slice(0, o.dec);
  if (!o.dec) clean = clean.replace(/\./g, '');
  let [int, frac] = clean.split('.');
  int = int.replace(/^0+(?=\d)/, '');
  const sep = native ? '٬' : ','; const dsep = native ? '٫' : '.';
  let out = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep) + (frac != null ? dsep + frac : '');
  if (native) out = out.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
  let pos = 0; let seen = 0;
  while (pos < out.length && seen < digitsBefore) { if (/[\d۰-۹٫.]/.test(out[pos])) seen++; pos++; }
  return { text: out, caret: pos, value: clean === '' ? NaN : Number(clean) };
}

register('money', (el) => {
  const o = options(el, { name: '', currency: '', currencies: '', words: true, min: '', max: '' });
  const input = el.querySelector('input:not([type=hidden])'); if (!input) return;
  const list = String(o.currencies || '').split(',').map((s) => s.trim().toUpperCase()).filter((c) => CUR[c]);
  let cur = (o.currency || list[0] || money.unit || 'IRT').toUpperCase();
  const name = o.name || input.name || '';
  input.removeAttribute('name');
  Object.assign(input, { inputMode: 'decimal', autocomplete: 'off' });
  input.setAttribute('dir', 'ltr'); input.classList.add('ac-num', 'ac-money__input');
  const hidden = h('input', { type: 'hidden', name });
  const hiddenCur = h('input', { type: 'hidden', name: name ? `${name}_currency` : '', value: cur });
  let picker;
  if (list.length > 1) {
    picker = h('select', { class: 'ac-money__unit', 'aria-label': AC.t('finance.currency', lang({}) === 'en' ? 'Currency' : 'واحد پول') });
    const fill = () => { picker.innerHTML = list.map((c) => `<option value="${c}"${c === cur ? ' selected' : ''}>${escapeHtml(CUR[c][lang({})] || CUR[c].en)}</option>`).join(''); };
    fill(); picker._fill = fill;
    el.append(h('span', { class: 'ac-input-group__affix ac-money__affix' }, picker));
  } else el.append(h('span', { class: 'ac-input-group__affix ac-money__affix', 'data-unit': '' }, CUR[cur]?.[lang({})] || cur));
  el.append(hidden, hiddenCur);
  const wordsEl = o.words ? h('p', { class: 'ac-money__words', 'aria-live': 'polite' }) : null;
  if (wordsEl) el.after(wordsEl);
  let value = parse(input.value);

  function sync(silent) {
    hidden.value = Number.isFinite(value) ? String(value) : '';
    hiddenCur.value = cur;
    if (wordsEl) wordsEl.textContent = Number.isFinite(value) && value ? words(value, { currency: cur }) : '';
    if (!silent) { fire(hidden); emit(el, 'money:change', { value: Number.isFinite(value) ? value : null, currency: cur, text: input.value, words: wordsEl?.textContent || '' }); }
  }
  function reformat(keepCaret) {
    const caret = keepCaret ? input.selectionStart ?? input.value.length : input.value.length;
    const r = groupTyped(input.value, caret, { dec: CUR[cur]?.dec ?? 2 });
    input.value = r.text; value = r.value;
    if (keepCaret && document.activeElement === input) input.setSelectionRange(r.caret, r.caret);
  }
  function setValue(v, silent) {
    value = Number(v);
    input.value = Number.isFinite(value) ? String(value) : '';
    reformat(false); sync(silent);
  }
  const offs = [
    on(input, 'input', (e) => { if (e.isTrusted || !e.detail) { reformat(true); sync(); } }),
    on(input, 'blur', () => { reformat(false); }),
    on(document, 'ac:i18n:change', () => { picker?._fill(); const u = el.querySelector('[data-unit]'); if (u) u.textContent = CUR[cur]?.[lang({})] || cur; reformat(false); sync(true); }),
  ];
  if (picker) offs.push(on(picker, 'change', () => {
    const next = picker.value;
    if (/^IR[RT]$/.test(cur) && /^IR[RT]$/.test(next) && Number.isFinite(value)) value = convert(value, cur, next); // same money, new unit
    cur = next; setValue(value);
  }));
  if (Number.isFinite(value)) setValue(value, true); else sync(true);
  instance(el, 'money', {
    get value() { return Number.isFinite(value) ? value : null; },
    get currency() { return cur; },
    set(v, c) { if (c && CUR[c.toUpperCase()]) { cur = c.toUpperCase(); if (picker) picker.value = cur; } setValue(v); },
    clear() { input.value = ''; value = NaN; sync(); },
  });
  return () => { offs.forEach((f) => f()); wordsEl?.remove(); };
});
return Object.freeze({ money });
})();

/* ---- banks/banks.json ---- */
const __ac_mx = F["banks/banks.json"] = (() => {
const data = {
  "version": 1,
  "notes": "BIN = first 6 digits of a Shetab card; sheba = the 3-digit bank code in an IR IBAN (IRkk BBB…). Sources: src/banks/SOURCES.md. Logo kinds: vendored | monogram.",
  "banks": [
    { "slug": "melli", "fa": "بانک ملی ایران", "short": "ملی", "en": "Bank Melli Iran", "colors": ["#1b2a4e", "#0b1428"], "accent": "#f1af0e", "bins": ["603799"], "sheba": "017", "logo": "vendored" },
    { "slug": "sepah", "fa": "بانک سپه", "short": "سپه", "en": "Bank Sepah", "colors": ["#3c3c40", "#141416"], "accent": "#e95b00", "bins": ["589210", "604932"], "sheba": "015", "logo": "vendored" },
    { "slug": "mellat", "fa": "بانک ملت", "short": "ملت", "en": "Bank Mellat", "colors": ["#c0122c", "#5c0612"], "accent": "#ffc730", "bins": ["610433", "991975"], "sheba": "012", "logo": "vendored" },
    { "slug": "tejarat", "fa": "بانک تجارت", "short": "تجارت", "en": "Tejarat Bank", "colors": ["#2f4a98", "#101d4a"], "accent": "#8fb3ff", "bins": ["627353", "585983"], "sheba": "018", "logo": "vendored" },
    { "slug": "saderat", "fa": "بانک صادرات ایران", "short": "صادرات", "en": "Bank Saderat Iran", "colors": ["#2d2a68", "#110f33"], "accent": "#a59cff", "bins": ["603769"], "sheba": "019", "logo": "vendored" },
    { "slug": "pasargad", "fa": "بانک پاسارگاد", "short": "پاسارگاد", "en": "Bank Pasargad", "colors": ["#2b2b2b", "#0c0c0c"], "accent": "#fecc09", "bins": ["502229", "639347"], "sheba": "057", "logo": "vendored" },
    { "slug": "saman", "fa": "بانک سامان", "short": "سامان", "en": "Saman Bank", "colors": ["#0077c8", "#06315e"], "accent": "#7dcdf1", "bins": ["621986"], "sheba": "056", "logo": "vendored" },
    { "slug": "parsian", "fa": "بانک پارسیان", "short": "پارسیان", "en": "Parsian Bank", "colors": ["#7a2131", "#2e0a12"], "accent": "#d8a774", "bins": ["622106", "639194", "627884"], "sheba": "054", "logo": "vendored" },
    { "slug": "eghtesad-novin", "fa": "بانک اقتصاد نوین", "short": "اقتصاد نوین", "en": "EN Bank (Eghtesad Novin)", "colors": ["#8d3499", "#3a0f42"], "accent": "#e7a4f0", "bins": ["627412"], "sheba": "055", "logo": "vendored" },
    { "slug": "keshavarzi", "fa": "بانک کشاورزی", "short": "کشاورزی", "en": "Bank Keshavarzi", "colors": ["#2f6b2a", "#102a10"], "accent": "#c9e36b", "bins": ["603770", "639217"], "sheba": "016", "logo": "vendored" },
    { "slug": "maskan", "fa": "بانک مسکن", "short": "مسکن", "en": "Bank Maskan", "colors": ["#ec520d", "#7a2300"], "accent": "#ffd2b8", "bins": ["628023"], "sheba": "014", "logo": "vendored" },
    { "slug": "refah", "fa": "بانک رفاه کارگران", "short": "رفاه", "en": "Refah Kargaran Bank", "colors": ["#173576", "#081536"], "accent": "#8fb0ff", "bins": ["589463"], "sheba": "013", "logo": "vendored" },
    { "slug": "sina", "fa": "بانک سینا", "short": "سینا", "en": "Sina Bank", "colors": ["#243873", "#0d1533"], "accent": "#dbaf2e", "bins": ["639346"], "sheba": "059", "logo": "vendored" },
    { "slug": "shahr", "fa": "بانک شهر", "short": "شهر", "en": "City Bank (Shahr)", "colors": ["#d8262c", "#6b0b0f"], "accent": "#ffc2c4", "bins": ["502806", "504706"], "sheba": "061", "logo": "vendored" },
    { "slug": "dey", "fa": "بانک دی", "short": "دی", "en": "Day Bank", "colors": ["#008b9a", "#003a42"], "accent": "#9eeaf2", "bins": ["502938"], "sheba": "066", "logo": "vendored" },
    { "slug": "ayandeh", "fa": "بانک آینده", "short": "آینده", "en": "Ayandeh Bank", "colors": ["#752d1e", "#2e0f08"], "accent": "#d99d2a", "bins": ["636214"], "sheba": "062", "logo": "vendored" },
    { "slug": "resalat", "fa": "بانک قرض‌الحسنه رسالت", "short": "رسالت", "en": "Resalat Bank", "colors": ["#0b8fb0", "#073a4a"], "accent": "#9eeaff", "bins": ["504172"], "sheba": "070", "logo": "vendored" },
    { "slug": "mehr-iran", "fa": "بانک قرض‌الحسنه مهر ایران", "short": "مهر ایران", "en": "Mehr Iran Bank", "colors": ["#3f8a2c", "#163a10"], "accent": "#bfe88f", "bins": ["606373"], "sheba": "060", "logo": "vendored" },
    { "slug": "post", "fa": "پست بانک ایران", "short": "پست بانک", "en": "Post Bank of Iran", "colors": ["#14763e", "#06331a"], "accent": "#ffd54a", "bins": ["627760"], "sheba": "021", "logo": "vendored" },
    { "slug": "tosee-saderat", "fa": "بانک توسعه صادرات", "short": "توسعه صادرات", "en": "Export Development Bank (EDBI)", "colors": ["#0b6d14", "#032b07"], "accent": "#b5f0a0", "bins": ["627648", "207177"], "sheba": "020", "logo": "vendored" },
    { "slug": "tosee-taavon", "fa": "بانک توسعه تعاون", "short": "توسعه تعاون", "en": "Tose'e Ta'avon Bank", "colors": ["#2c88a8", "#0b3546"], "accent": "#cdeefa", "bins": ["502908"], "sheba": "022", "logo": "vendored" },
    { "slug": "sanat-madan", "fa": "بانک صنعت و معدن", "short": "صنعت و معدن", "en": "Bank of Industry and Mine", "colors": ["#8a7244", "#33280f"], "accent": "#f1dcae", "bins": ["627961"], "sheba": "011", "logo": "vendored" },
    { "slug": "karafarin", "fa": "بانک کارآفرین", "short": "کارآفرین", "en": "Karafarin Bank", "colors": ["#1f7a45", "#0a2e19"], "accent": "#a6e3b9", "bins": ["627488", "502910"], "sheba": "053", "logo": "vendored" },
    { "slug": "gardeshgari", "fa": "بانک گردشگری", "short": "گردشگری", "en": "Tourism Bank (Gardeshgari)", "colors": ["#0090ad", "#003744"], "accent": "#ff8a8e", "bins": ["505416"], "sheba": "064", "logo": "vendored" },
    { "slug": "iran-zamin", "fa": "بانک ایران زمین", "short": "ایران زمین", "en": "Iran Zamin Bank", "colors": ["#4c2a93", "#1c0c3d"], "accent": "#f10b7c", "bins": ["505785"], "sheba": "069", "logo": "vendored" },
    { "slug": "khavarmianeh", "fa": "بانک خاورمیانه", "short": "خاورمیانه", "en": "Middle East Bank (Khavarmianeh)", "colors": ["#3a3a3c", "#121213"], "accent": "#f29200", "bins": ["585947", "585949", "505809"], "sheba": "078", "logo": "vendored" },
    { "slug": "sarmayeh", "fa": "بانک سرمایه", "short": "سرمایه", "en": "Sarmayeh Bank", "colors": ["#1f1f48", "#0a0a1e"], "accent": "#afb2ae", "bins": ["639607"], "sheba": "058", "logo": "vendored" },
    { "slug": "iran-venezuela", "fa": "بانک ایران و ونزوئلا", "short": "ایران و ونزوئلا", "en": "Iran-Venezuela Bi-National Bank", "colors": ["#2e3390", "#10123a"], "accent": "#edc53a", "bins": ["581874"], "sheba": "095", "logo": "vendored" },
    { "slug": "markazi", "fa": "بانک مرکزی جمهوری اسلامی ایران", "short": "بانک مرکزی", "en": "Central Bank of Iran", "colors": ["#00194a", "#000a1f"], "accent": "#7fa4e8", "bins": ["636795"], "sheba": "010", "logo": "vendored" },
    { "slug": "tosee", "fa": "مؤسسه اعتباری توسعه", "short": "توسعه", "en": "Tose'e Credit Institution", "colors": ["#8f2426", "#3a0c0d"], "accent": "#ffb3a8", "bins": ["628157"], "sheba": "051", "logo": "vendored" },
    { "slug": "melal", "fa": "مؤسسه اعتباری ملل", "short": "ملل", "en": "Melal Credit Institution", "colors": ["#37389a", "#14143d"], "accent": "#ff7f31", "bins": ["606256"], "sheba": "075", "logo": "vendored" },
    { "slug": "noor", "fa": "مؤسسه اعتباری نور", "short": "نور", "en": "Noor Credit Institution", "colors": ["#002263", "#000c26"], "accent": "#0bbbb9", "bins": ["507677"], "sheba": "080", "logo": "vendored" },
    { "slug": "ansar", "fa": "بانک انصار (ادغام‌شده در سپه)", "short": "انصار", "en": "Ansar Bank (merged into Sepah)", "colors": ["#aa1a1f", "#4a0709"], "accent": "#eeb900", "bins": ["627381"], "sheba": "063", "logo": "vendored", "merged": "sepah" },
    { "slug": "ghavamin", "fa": "بانک قوامین (ادغام‌شده در سپه)", "short": "قوامین", "en": "Ghavamin Bank (merged into Sepah)", "colors": ["#007d3d", "#002e16"], "accent": "#fff400", "bins": ["639599"], "sheba": "052", "logo": "vendored", "merged": "sepah" },
    { "slug": "hekmat", "fa": "بانک حکمت ایرانیان (ادغام‌شده در سپه)", "short": "حکمت", "en": "Hekmat Iranian Bank (merged into Sepah)", "colors": ["#324c88", "#101c3a"], "accent": "#b6c8f2", "bins": ["636949"], "sheba": "065", "logo": "vendored", "merged": "sepah" },
    { "slug": "kosar", "fa": "مؤسسه اعتباری کوثر (ادغام‌شده در سپه)", "short": "کوثر", "en": "Kosar Credit Institution (merged into Sepah)", "colors": ["#832d6a", "#320b27"], "accent": "#f2b3e0", "bins": ["505801"], "sheba": "073", "logo": "vendored", "merged": "sepah" },
    { "slug": "mehr-eghtesad", "fa": "بانک مهر اقتصاد (ادغام‌شده در سپه)", "short": "مهر اقتصاد", "en": "Mehr Eghtesad Bank (merged into Sepah)", "colors": ["#029a4c", "#013a1c"], "accent": "#eb8c30", "bins": ["639370"], "sheba": "079", "logo": "vendored", "merged": "sepah" }
  ],
  "foreign": [
    { "slug": "hsbc", "fa": "اچ‌اس‌بی‌سی", "en": "HSBC", "colors": ["#db0011", "#5e0007"], "accent": "#ffffff", "logo": "vendored" },
    { "slug": "revolut", "fa": "رولوت", "en": "Revolut", "colors": ["#2b2e33", "#0b0c0e"], "accent": "#ffffff", "logo": "vendored" },
    { "slug": "barclays", "fa": "بارکلیز", "en": "Barclays", "colors": ["#00aeef", "#00395d"], "accent": "#ffffff", "logo": "vendored" },
    { "slug": "deutsche-bank", "fa": "دویچه بانک", "en": "Deutsche Bank", "colors": ["#0018a8", "#000a45"], "accent": "#ffffff", "logo": "vendored" },
    { "slug": "chase", "fa": "چیس", "en": "Chase", "colors": ["#117aca", "#06325a"], "accent": "#ffffff", "logo": "vendored" },
    { "slug": "wise", "fa": "وایز", "en": "Wise", "colors": ["#163300", "#0b1a00"], "accent": "#9fe870", "logo": "vendored" },
    { "slug": "n26", "fa": "ان۲۶", "en": "N26", "colors": ["#36a18b", "#0f3d33"], "accent": "#ffffff", "logo": "vendored" },
    { "slug": "emirates-nbd", "fa": "امارات ان‌بی‌دی", "en": "Emirates NBD", "short": "ENBD", "colors": ["#0c2d6b", "#04122e"], "accent": "#f5a623", "logo": "monogram" },
    { "slug": "ziraat", "fa": "زراعت بانک", "en": "Ziraat Bankası", "short": "ZB", "colors": ["#e30a17", "#5c0309"], "accent": "#ffffff", "logo": "monogram" }
  ],
  "networks": [
    { "slug": "shetab", "fa": "شتاب", "en": "Shetab", "short": "شتاب", "color": "#1d93d1", "logo": "monogram" },
    { "slug": "visa", "fa": "ویزا", "en": "Visa", "color": "#1a1f71", "logo": "vendored" },
    { "slug": "mastercard", "fa": "مسترکارت", "en": "Mastercard", "color": "#eb001b", "logo": "vendored" },
    { "slug": "amex", "fa": "امریکن اکسپرس", "en": "American Express", "color": "#2e77bc", "logo": "vendored" },
    { "slug": "unionpay", "fa": "یونیون‌پی", "en": "UnionPay", "short": "UP", "color": "#d10429", "logo": "monogram" },
    { "slug": "mir", "fa": "میر", "en": "Mir", "short": "МИР", "color": "#0f754e", "logo": "monogram" },
    { "slug": "jcb", "fa": "جی‌سی‌بی", "en": "JCB", "color": "#0b4ea2", "logo": "vendored" },
    { "slug": "discover", "fa": "دیسکاور", "en": "Discover", "color": "#ff6000", "logo": "vendored" },
    { "slug": "diners", "fa": "داینرز کلاب", "en": "Diners Club", "color": "#004c97", "logo": "vendored" },
    { "slug": "paypal", "fa": "پی‌پل", "en": "PayPal", "color": "#002991", "logo": "vendored" }
  ]
};
return Object.freeze({ data });
})();

/* ---- js/components/bank.js ---- */
const __ac_mw = F["js/components/bank.js"] = (() => {
const { AC, icons, escapeHtml } = __ac_m1;
const { latin } = __ac_m8;
const { validate } = __ac_mb;
const { data: META } = __ac_mx;
/* AC.bank — Iranian banks: card BIN → bank, Luhn, card networks, Sheba (IR IBAN) and international IBAN, logos.
   AC.bank.detect('6037991234567890') → { slug:'melli', fa, en, colors, bins, sheba, … } | null
   AC.bank.network('4111…') → 'visa' | 'mastercard' | 'amex' | 'unionpay' | 'mir' | 'jcb' | 'discover' | 'diners' | 'shetab' | null
   AC.bank.luhn(n) · AC.bank.formatCard(n, { sep: '-', mask: false }) → "6037-9912-3456-7890"
   AC.bank.sheba.valid('IR82 0540 …') · AC.bank.sheba.bank(iban) · AC.bank.iban.valid('DE89…') · AC.bank.iban.format(v)
   AC.bank.logo('melli', { mono, size, title }) → <svg class="ac-bank-logo"><use href="#bank-melli"/></svg> (loads dist/banks.svg once)
   Logos are trademarks of their owners, included for identification only — see src/banks/SOURCES.md. */





const digits = (v) => latin(v).replace(/\D/g, '');
const all = [...META.banks.map((b) => ({ ...b, country: 'IR' })), ...(META.foreign || [])];
const bySlug = new Map(all.map((b) => [b.slug, b]));
const byBin = new Map(); META.banks.forEach((b) => b.bins?.forEach((x) => byBin.set(x, b.slug)));
const bySheba = new Map(META.banks.map((b) => [b.sheba, b.slug]));
const networks = new Map((META.networks || []).map((n) => [n.slug, n]));

function luhn(v) {
  const s = digits(v); if (s.length < 12 || s.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < s.length; i++) { let d = +s[s.length - 1 - i]; if (i % 2) { d *= 2; if (d > 9) d -= 9; } sum += d; }
  return sum % 10 === 0;
}
const get = (slug) => (slug ? { ...bySlug.get(slug) } : null);
/** Bank from a card number (needs the first 6 digits). */
function detect(v) { const s = digits(v); return s.length >= 6 && byBin.has(s.slice(0, 6)) ? get(byBin.get(s.slice(0, 6))) : null; }
/** Card network; Iranian BINs win (62xxxx/63xxxx are Shetab cards, not UnionPay/Discover). */
function network(v) {
  const s = digits(v); if (!s) return null;
  if (s.length >= 6 && byBin.has(s.slice(0, 6))) return 'shetab';
  if (/^4/.test(s)) return 'visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(s)) return 'mastercard';
  if (/^3[47]/.test(s)) return 'amex';
  if (/^220[0-4]/.test(s)) return 'mir';
  if (/^3(0[0-5]|[68])/.test(s)) return 'diners';
  if (/^35(2[89]|[3-8])/.test(s)) return 'jcb';
  if (/^6(011|5|4[4-9])/.test(s)) return 'discover';
  if (/^62/.test(s)) return 'unionpay';
  return null;
}
const groups = (s) => (/^3[47]/.test(s) ? [4, 6, 5] : [4, 4, 4, 4, 3]);
/** "6037991234567890" → "6037-9912-3456-7890"; mask → "6037-99••-••••-7890" (first 6 + last 4 visible, Iranian style). */
function formatCard(v, o = {}) {
  let s = digits(v).slice(0, 19);
  if (o.mask && s.length > 10) s = s.slice(0, 6) + '•'.repeat(s.length - 10) + s.slice(-4);
  const out = []; let i = 0;
  for (const g of groups(s)) { if (i >= s.length) break; out.push(s.slice(i, i + g)); i += g; }
  return out.join(o.sep ?? '-');
}

/* ------------------------------------------------------------------ IBAN / Sheba */
const IBAN_LEN = { IR: 26, AE: 23, TR: 26, DE: 22, GB: 22, FR: 27, NL: 18, IT: 27, ES: 24, BE: 16, AT: 20, CH: 21, SE: 24, NO: 15, DK: 18, FI: 18, IE: 22, PT: 25, PL: 28, SA: 24, QA: 29, KW: 30, BH: 22, OM: 23, IQ: 23, GE: 22, AZ: 28, RU: 33, LU: 20, GR: 27, CZ: 24 };
const clean = (v) => latin(v).replace(/[\s\-_]/g, '').toUpperCase();
function mod97(iban) {
  const r = iban.slice(4) + iban.slice(0, 4);
  let rem = 0;
  for (const ch of r) { const n = /\d/.test(ch) ? ch : String(ch.charCodeAt(0) - 55); for (const d of n) rem = (rem * 10 + +d) % 97; }
  return rem;
}
const iban = {
  clean,
  valid(v) { const s = clean(v); const len = IBAN_LEN[s.slice(0, 2)]; return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(s) && (!len || s.length === len) && s.length >= 15 && mod97(s) === 1; },
  format: (v) => clean(v).replace(/(.{4})(?=.)/g, '$1 '),
  country: (v) => clean(v).slice(0, 2),
  /** Check digits for country + BBAN, e.g. checksum('IR', '0540…') → '82'. */
  checksum(cc, bban) { const r = mod97(`${cc}00${bban}`); return String(98 - r).padStart(2, '0'); },
};
const sheba = {
  /** "IR820540102680020817909002", "820540…" (24 digits) or Persian digits → "IR…" */
  normalize(v) { let s = clean(v); if (/^\d{24}$/.test(s)) s = `IR${s}`; return s; },
  valid(v) { const s = sheba.normalize(v); return /^IR\d{24}$/.test(s) && mod97(s) === 1; },
  bank(v) { const s = sheba.normalize(v); return /^IR\d{5}/.test(s) ? get(bySheba.get(s.slice(4, 7))) : null; },
  format: (v) => iban.format(sheba.normalize(v)),
};

/* ------------------------------------------------------------------ logos */
function spriteUrl() {
  return document.documentElement.dataset.acBanks || (AC.defaultIcons || '').replace(/icons\.svg(\?.*)?$/, 'banks.svg');
}
let loading;
function load() { if (!loading) { const u = spriteUrl(); loading = u ? icons.load(u) : Promise.resolve(); } return loading; }
/** SVG markup for a bank (or network with { network: true }) logo. */
function logo(slug, o = {}) {
  load();
  const id = `${o.network || networks.has(slug) && !bySlug.has(slug) ? 'net' : 'bank'}-${slug}${o.mono ? '-mono' : ''}`;
  const b = bySlug.get(slug) || networks.get(slug);
  const label = o.title ?? (b ? b[(AC.i18n.lang || 'fa').startsWith('fa') ? 'fa' : 'en'] : slug);
  return `<svg class="ac-bank-logo${o.class ? ` ${o.class}` : ''}" viewBox="0 0 48 48" role="img" aria-label="${escapeHtml(label)}"><use href="#${id}"/></svg>`;
}

/* validation rules for forms: data-ac-rules="sheba" / "iban" / "card" (any network, Luhn) */
const msg = (k, fa, en) => () => AC.t(k, (AC.i18n.lang || 'fa').startsWith('en') ? en : fa);
validate?.add?.('sheba', (v) => !v || sheba.valid(v), msg('finance.errSheba', 'شمارهٔ شبا معتبر نیست', 'Invalid Sheba (IR IBAN)'));
validate?.add?.('iban', (v) => !v || iban.valid(v), msg('finance.errIban', 'شمارهٔ IBAN معتبر نیست', 'Invalid IBAN'));
validate?.add?.('card', (v) => !v || luhn(v), 'err.iranCard');

const bank = {
  list: () => META.banks.map((b) => ({ ...b })),
  foreign: () => (META.foreign || []).map((b) => ({ ...b })),
  networks: () => [...networks.values()].map((n) => ({ ...n })),
  get, detect, network, luhn, formatCard, iban, sheba, logo, load,
  network_: (slug) => networks.get(slug) || null,
  /** Iranian-style masked card: "6037-99••-••••-7890" */
  mask: (v, sep = '-') => formatCard(v, { mask: true, sep }),
};
AC.bank = bank;
return Object.freeze({ bank });
})();

/* ---- js/components/bank-card.js ---- */
const __ac_my = F["js/components/bank-card.js"] = (() => {
const { AC, register, on, emit, options, h, i18n, instance, uid, reducedMotion, rafThrottle, escapeHtml, scan, icon } = __ac_m1;
const { latin, fire } = __ac_m8;
const { bank: B } = __ac_mw;
/* Bank card (ISO/IEC 7810 ID-1, 85.60 × 53.98 mm), live card form and Sheba input.
   <div class="ac-bcard" data-ac="bank-card" data-number="6037991234567890" data-holder="علی رامین" data-expiry="05/08"
        [data-cvv="123"] [data-bank="melli"] [data-expiry-format="jalali"] [data-masked] [data-size="sm|md|lg|fluid"] [data-flip="false"] [data-tilt="false"]></div>
   AC.bankCard(el, { number, holder, expiry, cvv, bank, masked, size }) → API { set(o), flip(on?), mask(on?), bank, network, el }
   <form data-ac="card-form"> … [data-ac="bank-card"] + inputs [data-card="number|holder|expiry|cvv"] … </form>
   <div class="ac-input-group ac-sheba" data-ac="sheba" data-name="iban"><input class="ac-input"></div>
   Events: ac:bank-card:flip {flipped} · ac:bank-card:bank {bank, network} · ac:sheba:change {value, valid, bank} */




const fa = () => (i18n.lang || 'fa').startsWith('fa');
const T = (k, faText, enText) => AC.t(`finance.${k}`, fa() ? faText : enText);
const FA_D = '۰۱۲۳۴۵۶۷۸۹';
const toFa = (s) => String(s).replace(/\d/g, (d) => FA_D[d]);
const INK = { colors: ['#2a2a2e', '#0c0c0e'], accent: '#d9d9de' };
const NET_THEME = { visa: ['#1a1f71', '#0a0d33'], mastercard: ['#2b2b2f', '#0d0d0f'], amex: ['#2e77bc', '#0d2f52'], unionpay: ['#0e5a7a', '#06222f'], mir: ['#0f754e', '#05301f'] };
const canHover = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/* guilloche rosette, generated once (white hairlines; tinted by the card colour underneath) */
let guilloche;
function rosette() {
  if (guilloche) return guilloche;
  let d = '';
  for (let k = 0; k < 18; k++) {
    const R = 120 + k * 3; const r = 37; const off = 54; const ph = (k * Math.PI) / 18;
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += Math.PI / 90) {
      const x = 170 + (R - r) * Math.cos(t + ph) + off * Math.cos(((R - r) / r) * t);
      const y = 107 + ((R - r) * Math.sin(t + ph) - off * Math.sin(((R - r) / r) * t)) * 0.62;
      d += `${t ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  guilloche = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 340 214'><path d='${d}' fill='none' stroke='white' stroke-width='.35' opacity='.55'/></svg>`)}")`;
  return guilloche;
}
const chip = (id) => `<svg class="ac-bcard__chip" viewBox="0 0 50 38" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbeab2"/><stop offset=".42" stop-color="#d9b25e"/><stop offset=".7" stop-color="#f0d68f"/><stop offset="1" stop-color="#a7813a"/></linearGradient></defs><rect x=".5" y=".5" width="49" height="37" rx="7" fill="url(#${id})" stroke="#7d5f25" stroke-opacity=".45"/><g fill="none" stroke="#6f5320" stroke-opacity=".55" stroke-width=".9"><path d="M0 13h16M0 25h16M34 13h16M34 25h16M25 0v8M25 30v8"/><rect x="16" y="8" width="18" height="22" rx="4"/></g></svg>`;
const contactless = '<svg class="ac-bcard__nfc" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8.5 7.5a7 7 0 0 1 0 9"/><path d="M12 5a11 11 0 0 1 0 14"/><path d="M15.5 2.5a15 15 0 0 1 0 19"/><path d="M5 10a3 3 0 0 1 0 4"/></svg>';

function themeOf(bank, net) {
  if (bank) return bank;
  if (NET_THEME[net]) return { colors: NET_THEME[net], accent: '#ffffff' };
  return INK;
}

function mount(el, init = {}) {
  const o = { ...options(el, { number: '', holder: '', expiry: '', cvv: '', bank: '', expiryFormat: '', masked: false, size: 'md', flip: true, tilt: true }), ...init };
  const st = { number: latin(o.number).replace(/\D/g, ''), holder: o.holder || '', expiry: String(o.expiry || ''), cvv: String(o.cvv || ''), bank: o.bank || '', masked: !!o.masked, flipped: false, expFmt: o.expiryFormat };
  const id = uid('chip');
  el.classList.add('ac-bcard');
  el.dataset.size = o.size || 'md';
  if (o.flip !== false) { el.tabIndex = 0; el.setAttribute('role', 'button'); }
  el.innerHTML = `<div class="ac-bcard__tilt"><div class="ac-bcard__flip">
    <div class="ac-bcard__face ac-bcard__front">
      <div class="ac-bcard__layers" aria-hidden="true"></div><i class="ac-bcard__pattern" aria-hidden="true"></i><i class="ac-bcard__shine" aria-hidden="true"></i>
      <div class="ac-bcard__top"><span class="ac-bcard__brand"><span class="ac-bcard__logo"></span><span class="ac-bcard__name"></span></span>${contactless}</div>
      ${chip(id)}
      <div class="ac-bcard__number" dir="ltr"></div>
      <div class="ac-bcard__bottom">
        <span class="ac-bcard__field ac-bcard__holder"><small data-l="holder"></small><b dir="auto"></b></span>
        <span class="ac-bcard__field ac-bcard__exp"><small data-l="exp"></small><b dir="ltr"></b></span>
        <span class="ac-bcard__net"></span>
      </div>
    </div>
    <div class="ac-bcard__face ac-bcard__back" aria-hidden="true">
      <div class="ac-bcard__layers"></div><i class="ac-bcard__pattern"></i>
      <span class="ac-bcard__stripe"></span>
      <div class="ac-bcard__sign"><span class="ac-bcard__sigpanel"></span><span class="ac-bcard__cvv"><small>CVV2</small><b dir="ltr"></b></span></div>
      <p class="ac-bcard__fine" data-l="fine"></p>
      <div class="ac-bcard__backfoot"><span class="ac-bcard__logo"></span><span class="ac-bcard__net"></span></div>
    </div></div></div>`;
  const $ = (s) => el.querySelector(s);
  const $$ = (s) => el.querySelectorAll(s);
  el.querySelectorAll('.ac-bcard__pattern').forEach((p) => p.style.setProperty('--_guilloche', rosette()));
  let shownBank = null; let shownNet = null; let first = true;

  function layer(theme) {
    const n = h('i', { class: 'ac-bcard__layer' });
    n.style.setProperty('--_c1', theme.colors[0]); n.style.setProperty('--_c2', theme.colors[1]);
    return n;
  }
  /* crossfade: the new theme/logo fades + scales in over the old one, then the old one is dropped */
  function swap(container, node) {
    const old = [...container.children];
    container.append(node);
    if (first || reducedMotion()) { old.forEach((x) => x.remove()); return; }
    node.animate([{ opacity: 0, transform: 'scale(1.04)', filter: 'blur(2px)' }, { opacity: 1, transform: 'none', filter: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    old.forEach((x) => x.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-out' }).finished.then(() => x.remove(), () => x.remove()));
  }
  function paintNumber() {
    const num = st.number;
    const text = num ? B.formatCard(num.padEnd(num.length < 16 && !/^3[47]/.test(num) ? 16 : num.length, '•'), { mask: st.masked && num.length >= 16, sep: ' ' }) : '•••• •••• •••• ••••';
    const box = $('.ac-bcard__number');
    const prev = box.textContent.replace(/\s/g, '');
    box.innerHTML = text.split(' ').map((g) => `<span>${[...g].map((c) => `<i${c === '•' ? ' data-dot' : ''}>${c}</i>`).join('')}</span>`).join('');
    if (!first && !reducedMotion()) { // tick the digits that changed
      const cells = box.querySelectorAll('i'); const now = text.replace(/\s/g, '');
      cells.forEach((c, i) => { if (prev[i] !== now[i]) c.animate([{ transform: 'translateY(40%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
    }
    box.setAttribute('aria-label', `${T('number', 'شمارهٔ کارت', 'Card number')} ${st.masked ? B.mask(num, ' ') : B.formatCard(num, { sep: ' ' })}`);
  }
  function paint() {
    const detected = st.bank ? B.get(st.bank) : B.detect(st.number);
    const bank = detected && detected.slug ? detected : null;
    const net = B.network(st.number) || (bank?.country === 'IR' ? 'shetab' : null);
    el.dataset.region = bank?.country === 'IR' || net === 'shetab' ? 'ir' : 'intl';
    el.dataset.network = net || '';
    if ((bank?.slug || '') !== (shownBank || '') || first) {
      const theme = themeOf(bank, net);
      $$('.ac-bcard__layers').forEach((c) => swap(c, layer(theme)));
      el.style.setProperty('--_accent', theme.accent || '#fff');
      $$('.ac-bcard__logo').forEach((c) => swap(c, h('span', { class: 'ac-bcard__logoin', html: bank ? B.logo(bank.slug, { mono: true }) : '' })));
      const name = $('.ac-bcard__name');
      name.textContent = bank ? (fa() || bank.country !== 'IR' ? (bank.country === 'IR' ? bank.fa.replace(/\s*\(.*\)$/, '') : bank.en) : bank.en) : '';
      if (!first && !reducedMotion()) name.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
      if (!first) emit(el, 'bank-card:bank', { bank, network: net });
      shownBank = bank?.slug || '';
    }
    if (net !== shownNet || first) {
      $$('.ac-bcard__net').forEach((c) => swap(c, h('span', { class: 'ac-bcard__logoin', html: net ? B.logo(net, { mono: true, network: true }) : '' })));
      shownNet = net;
    }
    paintNumber();
    const jalali = st.expFmt === 'jalali' || (st.expFmt !== 'gregorian' && el.dataset.region === 'ir' && fa());
    $('.ac-bcard__holder b').textContent = st.holder || T('cardHolderPh', 'نام دارنده کارت', 'CARDHOLDER NAME');
    const exp = st.expiry || (jalali ? 'YY/MM' : 'MM/YY');
    $('.ac-bcard__exp b').textContent = jalali && fa() ? toFa(exp) : exp;
    $('.ac-bcard__cvv b').textContent = st.cvv ? (st.masked ? '•••' : st.cvv) : '•••';
    $('[data-l="holder"]').textContent = T('holder', 'دارنده کارت', 'CARD HOLDER');
    $('[data-l="exp"]').textContent = jalali ? T('expJalali', 'انقضا', 'EXPIRES YY/MM') : T('exp', 'تاریخ انقضا', 'VALID THRU');
    $('[data-l="fine"]').textContent = bank ? T('fine', `این کارت متعلق به ${bank.fa.replace(/\s*\(.*\)$/, '')} است؛ در صورت پیدا کردن، آن را به نزدیک‌ترین شعبه تحویل دهید.`, `This card is the property of ${bank.en}. If found, please return it to any branch.`) : T('fineGeneric', 'این کارت شخصی است و قابل واگذاری نیست.', 'This card is personal and non-transferable.');
    el.setAttribute('aria-label', `${bank ? (fa() ? bank.fa : bank.en) : T('card', 'کارت بانکی', 'Bank card')} — ${T('flipHint', 'برای چرخاندن بزنید', 'press to flip')}`);
    el.setAttribute('aria-pressed', String(st.flipped));
    first = false;
  }
  function flip(force) {
    const next = force == null ? !st.flipped : !!force;
    if (next === st.flipped) return;
    st.flipped = next; el.toggleAttribute('data-flipped', next); el.setAttribute('aria-pressed', String(next));
    emit(el, 'bank-card:flip', { flipped: next });
  }
  /* tilt + glare follow the pointer (mouse only, never with reduced motion) */
  const tilt = rafThrottle((e) => {
    const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--_rx', `${((0.5 - y) * 9).toFixed(2)}deg`); el.style.setProperty('--_ry', `${((x - 0.5) * 12).toFixed(2)}deg`);
    el.style.setProperty('--_mx', `${(x * 100).toFixed(1)}%`); el.style.setProperty('--_my', `${(y * 100).toFixed(1)}%`);
  });
  const offs = [
    on(el, 'pointermove', (e) => { if (o.tilt !== false && e.pointerType === 'mouse' && canHover() && !reducedMotion()) { el.setAttribute('data-tilting', ''); tilt(e); } }),
    on(el, 'pointerleave', () => { el.removeAttribute('data-tilting'); ['--_rx', '--_ry'].forEach((p) => el.style.setProperty(p, '0deg')); }),
    on(document, 'ac:i18n:change', () => { first = true; shownBank = null; paint(); }),
  ];
  if (o.flip !== false) {
    offs.push(on(el, 'click', (e) => { if (!e.target.closest('a,button,input')) flip(); }));
    offs.push(on(el, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } }));
  }
  paint();
  const api = instance(el, 'bank-card', {
    el,
    set(x = {}) {
      if ('number' in x) st.number = latin(x.number).replace(/\D/g, '').slice(0, 19);
      ['holder', 'cvv', 'bank'].forEach((k) => { if (k in x) st[k] = x[k] || ''; });
      if ('expiry' in x) st.expiry = latin(x.expiry || '');
      if ('expiryFormat' in x) st.expFmt = x.expiryFormat;
      if ('masked' in x) st.masked = !!x.masked;
      paint(); return api;
    },
    flip, mask(on_) { st.masked = on_ == null ? !st.masked : !!on_; el.toggleAttribute('data-masked', st.masked); paint(); return st.masked; },
    get bank() { return st.bank ? B.get(st.bank) : B.detect(st.number); },
    get network() { return B.network(st.number); },
    get number() { return st.number; },
    get flipped() { return st.flipped; },
  });
  return () => offs.forEach((f) => f());
}
register('bank-card', (el) => mount(el, el._acBankCard || {}));

/** Imperative: AC.bankCard('#card', { number, holder, expiry, bank }) */
function bankCard(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  const api = instance(el, 'bank-card');
  if (api) return api.set(opts);
  el._acBankCard = opts;
  if (!/\bbank-card\b/.test(el.dataset.ac || '')) el.dataset.ac = `${el.dataset.ac || ''} bank-card`.trim();
  scan(el);
  return instance(el, 'bank-card');
}
AC.bankCard = bankCard;

/* ------------------------------------------------------------------ caret-safe digit grouping */
function groupInput(input, { max, groups, sep = ' ', prefix = '' }) {
  const caret = input.selectionStart ?? input.value.length;
  const before = latin(input.value.slice(0, caret)).replace(/\D/g, '').length;
  const d = latin(input.value).replace(/\D/g, '').slice(0, max);
  const parts = []; let i = 0; const gs = typeof groups === 'function' ? groups(d) : groups;
  for (let g = 0; i < d.length; g++) { const n = gs[Math.min(g, gs.length - 1)]; parts.push(d.slice(i, i + n)); i += n; }
  const text = prefix + parts.join(sep);
  let pos = prefix.length; let seen = 0;
  while (pos < text.length && seen < before) { if (/\d/.test(text[pos])) seen++; pos++; }
  if (input.value !== text) input.value = text;
  if (document.activeElement === input) input.setSelectionRange(pos, pos);
  return d;
}

/* ------------------------------------------------------------------ live card form */
register('card-form', (el) => {
  const cardEl = el.querySelector('[data-ac~="bank-card"]');
  const card = () => instance(cardEl, 'bank-card');
  const f = (k) => el.querySelector(`[data-card="${k}"]`);
  const num = f('number'); const holder = f('holder'); const exp = f('expiry'); const cvv = f('cvv');
  [num, exp, cvv].forEach((x) => { if (x) { x.setAttribute('dir', 'ltr'); x.inputMode = 'numeric'; x.autocomplete = x === num ? 'cc-number' : x === exp ? 'cc-exp' : 'cc-csc'; x.classList.add('ac-num'); } });
  const badge = num ? h('span', { class: 'ac-input-group__affix ac-cardnum__bank', 'aria-live': 'polite' }) : null;
  if (badge) num.closest('.ac-input-group')?.append(badge);
  let lastBank = '';
  const offs = [];
  if (num) offs.push(on(num, 'input', () => {
    const d = groupInput(num, { max: 19, groups: (s) => (/^3[47]/.test(s) ? [4, 6, 5] : [4]), sep: ' ' });
    card()?.set({ number: d });
    const b = B.detect(d); const net = B.network(d);
    const key = b?.slug || net || '';
    if (key !== lastBank) {
      lastBank = key;
      badge.innerHTML = b ? `${B.logo(b.slug)}<span>${escapeHtml(fa() ? b.short || b.fa : b.en)}</span>` : net ? B.logo(net, { network: true }) : '';
      if (key && !reducedMotion()) badge.animate([{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }
    const done = d.length >= (/^3[47]/.test(d) ? 15 : 16);
    num.toggleAttribute('aria-invalid', done && !B.luhn(d));
    if (done && !B.luhn(d)) num.setAttribute('aria-invalid', 'true');
    el.toggleAttribute('data-card-valid', done && B.luhn(d));
  }));
  if (holder) offs.push(on(holder, 'input', () => card()?.set({ holder: holder.value.trim() })));
  if (exp) offs.push(on(exp, 'input', (e) => {
    const back = e.inputType === 'deleteContentBackward';
    let d = latin(exp.value).replace(/\D/g, '').slice(0, 4);
    exp.value = d.length > 2 || (d.length === 2 && !back) ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
    card()?.set({ expiry: exp.value });
  }));
  if (cvv) offs.push(
    on(cvv, 'input', () => { cvv.value = latin(cvv.value).replace(/\D/g, '').slice(0, 4); card()?.set({ cvv: cvv.value }); }),
    on(cvv, 'focus', () => card()?.flip(true)), on(cvv, 'blur', () => card()?.flip(false)),
  );
  offs.push(on(document, 'ac:i18n:change', () => { lastBank = '-'; num && fire(num, ['input']); }));
  return () => offs.forEach((x) => x());
});

/* ------------------------------------------------------------------ Sheba input */
register('sheba', (el) => {
  const o = options(el, { name: '' });
  const input = el.querySelector('input:not([type=hidden])'); if (!input) return;
  const name = o.name || input.name || ''; input.removeAttribute('name');
  el.setAttribute('dir', 'ltr'); // IR prefix sits next to the digits in RTL pages too
  input.setAttribute('dir', 'ltr'); input.inputMode = 'numeric'; input.autocomplete = 'off'; input.classList.add('ac-num'); input.spellcheck = false;
  if (!el.querySelector('.ac-sheba__ir')) el.prepend(h('span', { class: 'ac-input-group__affix ac-sheba__ir', dir: 'ltr' }, 'IR'));
  const logoBox = h('span', { class: 'ac-input-group__affix ac-sheba__bank' });
  const hidden = h('input', { type: 'hidden', name });
  el.append(logoBox, hidden);
  const status = h('p', { class: 'ac-sheba__status', 'aria-live': 'polite' });
  el.after(status);
  let shown = '';
  function update(silent) {
    const raw = latin(input.value).toUpperCase().replace(/^IR/, '');
    if (raw !== input.value) input.value = raw;
    const d = groupInput(input, { max: 24, groups: [4], sep: ' ' });
    const full = `IR${d}`;
    const b = d.length >= 5 ? B.sheba.bank(full) : null;
    const valid = d.length === 24 && B.sheba.valid(full);
    if ((b?.slug || '') !== shown) {
      shown = b?.slug || '';
      logoBox.innerHTML = b ? B.logo(b.slug) : '';
      if (b && !reducedMotion()) logoBox.animate([{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }
    el.toggleAttribute('data-valid', valid);
    const bad = d.length === 24 && !valid;
    input.toggleAttribute('aria-invalid', bad);
    status.dataset.state = valid ? 'valid' : bad ? 'invalid' : '';
    const bn = b ? (fa() ? b.fa : b.en) : '';
    status.innerHTML = valid ? `${icon('circle-check')}<span>${escapeHtml(bn || T('shebaOk', 'شبا معتبر است', 'Valid Sheba'))}</span>`
      : bad ? `${icon('circle-alert')}<span>${escapeHtml(T('errSheba', 'شمارهٔ شبا معتبر نیست', 'Invalid Sheba (IR IBAN)'))}</span>`
      : bn ? `<span>${escapeHtml(bn)}</span>` : `<span>${escapeHtml(T('shebaHint', '۲۴ رقم بعد از IR', '24 digits after IR'))}</span>`;
    hidden.value = valid ? full : '';
    if (!silent) { fire(hidden); emit(el, 'sheba:change', { value: full, valid, bank: b }); }
  }
  const offs = [on(input, 'input', () => update()), on(document, 'ac:i18n:change', () => update(true))];
  update(true);
  instance(el, 'sheba', { get value() { return hidden.value; }, set(v) { input.value = B.sheba.normalize(v).replace(/^IR/, ''); update(); } });
  return () => { offs.forEach((f) => f()); status.remove(); };
});
return Object.freeze({ bankCard });
})();

return { f: F, ns: Object.freeze({ "money": __ac_mu["money"], "bank": __ac_mw["bank"], "bankCard": __ac_my["bankCard"] }) };
})();
export const { money, bank, bankCard } = __R["money"].ns;
export default __R["money"].ns;
