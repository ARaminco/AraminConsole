/* Bank card (ISO/IEC 7810 ID-1, 85.60 × 53.98 mm), live card form and Sheba input.
   <div class="ac-bcard" data-ac="bank-card" data-number="6037991234567890" data-holder="علی رامین" data-expiry="05/08"
        [data-cvv="123"] [data-bank="melli"] [data-expiry-format="jalali"] [data-masked] [data-size="sm|md|lg|fluid"] [data-flip="false"] [data-tilt="false"]></div>
   AC.bankCard(el, { number, holder, expiry, cvv, bank, masked, size }) → API { set(o), flip(on?), mask(on?), bank, network, el }
   <form data-ac="card-form"> … [data-ac="bank-card"] + inputs [data-card="number|holder|expiry|cvv"] … </form>
   <div class="ac-input-group ac-sheba" data-ac="sheba" data-name="iban"><input class="ac-input"></div>
   Events: ac:bank-card:flip {flipped} · ac:bank-card:bank {bank, network} · ac:sheba:change {value, valid, bank} */
import { AC, register, on, emit, options, h, i18n, instance, uid, reducedMotion, rafThrottle, escapeHtml, scan, icon } from '../core.js';
import { latin, fire } from './form-core.js';
import { bank as B } from './bank.js';

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
export function bankCard(target, opts = {}) {
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
