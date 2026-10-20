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
import { AC, register, on, emit, options, h, i18n, store, instance, ready, reducedMotion, escapeHtml, scan } from '../core.js';
import { latin, fire } from './form-core.js';

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

export const money = {
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
