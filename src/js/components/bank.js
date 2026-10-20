/* AC.bank — Iranian banks: card BIN → bank, Luhn, card networks, Sheba (IR IBAN) and international IBAN, logos.
   AC.bank.detect('6037991234567890') → { slug:'melli', fa, en, colors, bins, sheba, … } | null
   AC.bank.network('4111…') → 'visa' | 'mastercard' | 'amex' | 'unionpay' | 'mir' | 'jcb' | 'discover' | 'diners' | 'shetab' | null
   AC.bank.luhn(n) · AC.bank.formatCard(n, { sep: '-', mask: false }) → "6037-9912-3456-7890"
   AC.bank.sheba.valid('IR82 0540 …') · AC.bank.sheba.bank(iban) · AC.bank.iban.valid('DE89…') · AC.bank.iban.format(v)
   AC.bank.logo('melli', { mono, size, title }) → <svg class="ac-bank-logo"><use href="#bank-melli"/></svg> (loads dist/banks.svg once)
   Logos are trademarks of their owners, included for identification only — see src/banks/SOURCES.md. */
import { AC, icons, escapeHtml } from '../core.js';
import { latin } from './form-core.js';
import { validate } from './form-validate.js';
import { data as META } from '../../banks/banks.json';

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

export const bank = {
  list: () => META.banks.map((b) => ({ ...b })),
  foreign: () => (META.foreign || []).map((b) => ({ ...b })),
  networks: () => [...networks.values()].map((n) => ({ ...n })),
  get, detect, network, luhn, formatCard, iban, sheba, logo, load,
  network_: (slug) => networks.get(slug) || null,
  /** Iranian-style masked card: "6037-99••-••••-7890" */
  mask: (v, sep = '-') => formatCard(v, { mask: true, sep }),
};
AC.bank = bank;
