/* Iranian invoices — «صورتحساب فروش کالا و خدمات» (official, سامانه مؤدیان layout) and پیش‌فاکتور (proforma).
   const inv = AC.invoiceIR.render(el, data, { type: 'official'|'proforma', unit: 'IRR'|'IRT', digits: 'fa'|'latn',
                                               paper: 'a4'|'a4l'|'a5'|'a5l', toolbar: true, labels: {} })
   inv.update(data) · inv.set({ unit, digits, paper, type }) · inv.print() · inv.totals · inv.destroy()
   AC.invoiceIR.totals(data) → { lines:[{gross, discount, net, vat, total}], gross, discount, net, vat, total }
   AC.invoiceIR.editor(el, { data, preview: controller, storageKey }) → live form (parties, items, VAT, bank) driving a preview
   Amounts in data are in data.currency ('IRR' default); the display unit is a view option. VAT rate: data.vatRate (default 10).
   Uses AC.money (words), AC.date (Jalali) and AC.bank (logos, card/Sheba format) when present; small fallbacks otherwise.
   Events: ac:invoice-ir:change {opts} (toolbar) · ac:invoice-ir:edit {data} (editor). install(AC) wires it into window.AC. */

const NAME = 'invoice-ir';
function cssOnce() {
  if (typeof document === 'undefined' || document.querySelector(`[data-ac-module="${NAME}"]`)) return;
  try { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL(`./${NAME}.css`, import.meta.url).href; l.dataset.acModule = NAME; document.head.append(l); } catch { /* bundled */ }
}

/* ------------------------------------------------------------------ labels (fa / en; ar falls back to fa) */
const L = {
  fa: {
    official: 'صورتحساب فروش کالا و خدمات', proforma: 'پیش‌فاکتور', serial: 'شماره سریال', no: 'شماره', date: 'تاریخ', taxId: 'شماره منحصربه‌فرد مالیاتی',
    seller: 'مشخصات فروشنده', buyer: 'مشخصات خریدار', name: 'نام شخص حقیقی / حقوقی', nid: 'شماره ملی / شناسه ملی', eco: 'کد اقتصادی', reg: 'شماره ثبت',
    postal: 'کد پستی ۱۰ رقمی', phone: 'تلفن / نمابر', address: 'نشانی کامل', goods: 'مشخصات کالا یا خدمات مورد معامله',
    row: 'ردیف', code: 'کد کالا', desc: 'شرح کالا یا خدمات', qty: 'تعداد / مقدار', unit: 'واحد اندازه‌گیری', price: 'مبلغ واحد', gross: 'مبلغ کل',
    disc: 'مبلغ تخفیف', net: 'مبلغ کل پس از تخفیف', vatCol: 'جمع مالیات و عوارض ارزش افزوده', total: 'جمع کل', totalFull: 'جمع کل مبلغ پس از تخفیف و مالیات و عوارض',
    sum: 'جمع کل', words: 'مبلغ به حروف', terms: 'شرایط و نحوه فروش', cash: 'نقدی', credit: 'غیرنقدی', notes: 'توضیحات',
    signSeller: 'مهر و امضای فروشنده', signBuyer: 'مهر و امضای خریدار', vatRate: 'نرخ مالیات و عوارض ارزش افزوده: {rate}٪',
    from: 'فروشنده', billTo: 'خریدار', validUntil: 'اعتبار تا', subtotal: 'جمع اقلام', discount: 'تخفیف', vat: 'مالیات و عوارض ({rate}٪)',
    payable: 'مبلغ قابل پرداخت', payment: 'اطلاعات پرداخت', card: 'شماره کارت', sheba: 'شماره شبا', account: 'شماره حساب', holder: 'به نام',
    scan: 'اسکن برای پرداخت', disclaimer: 'این سند پیش‌فاکتور است و صورتحساب رسمی مالیاتی محسوب نمی‌شود.', amount: 'مبلغ',
    IRR: 'ریال', IRT: 'تومان', a4: 'A4', a4l: 'A4 افقی', a5: 'A5', a5l: 'A5 افقی', print: 'چاپ / PDF', unitLabel: 'واحد پول', digitsLabel: 'ارقام', paperLabel: 'کاغذ',
    // editor
    edDoc: 'سند', edType: 'نوع سند', edItems: 'اقلام', edAdd: 'افزودن ردیف', edRemove: 'حذف ردیف', edReset: 'بازنشانی', edBank: 'حساب دریافت', edTotals: 'جمع‌ها',
    edVat: 'نرخ ارزش افزوده (٪)', edOfficial: 'رسمی', edPay: 'نحوه فروش', edSaved: 'پیش‌نویس ذخیره شد', edLine: 'مبلغ ردیف', city: 'شهر', mixed: 'نقدی و غیرنقدی',
  },
  en: {
    official: 'Sales invoice — goods and services', proforma: 'Proforma invoice', serial: 'Serial no.', no: 'No.', date: 'Date', taxId: 'Unique tax ID',
    seller: 'Seller', buyer: 'Buyer', name: 'Name / company', nid: 'National ID', eco: 'Economic code', reg: 'Registration no.',
    postal: 'Postal code', phone: 'Phone / fax', address: 'Full address', goods: 'Goods or services',
    row: '#', code: 'Code', desc: 'Description', qty: 'Qty', unit: 'Unit', price: 'Unit price', gross: 'Amount',
    disc: 'Discount', net: 'Net amount', vatCol: 'VAT and duties', total: 'Total', totalFull: 'Total after discount, VAT and duties',
    sum: 'Total', words: 'Amount in words', terms: 'Terms of sale', cash: 'Cash', credit: 'Credit', notes: 'Notes',
    signSeller: 'Seller stamp & signature', signBuyer: 'Buyer stamp & signature', vatRate: 'VAT and duties rate: {rate}%',
    from: 'From', billTo: 'Bill to', validUntil: 'Valid until', subtotal: 'Subtotal', discount: 'Discount', vat: 'VAT ({rate}%)',
    payable: 'Amount due', payment: 'Payment details', card: 'Card number', sheba: 'Sheba (IBAN)', account: 'Account no.', holder: 'Holder',
    scan: 'Scan to pay', disclaimer: 'This is a proforma invoice and is not an official tax invoice.', amount: 'Amount',
    IRR: 'Rial', IRT: 'Toman', a4: 'A4', a4l: 'A4 landscape', a5: 'A5', a5l: 'A5 landscape', print: 'Print / PDF', unitLabel: 'Currency', digitsLabel: 'Digits', paperLabel: 'Paper',
    edDoc: 'Document', edType: 'Type', edItems: 'Items', edAdd: 'Add line', edRemove: 'Remove line', edReset: 'Reset', edBank: 'Payment account', edTotals: 'Totals',
    edVat: 'VAT rate (%)', edOfficial: 'Official', edPay: 'Terms', edSaved: 'Draft saved', edLine: 'Line total', city: 'City', mixed: 'Cash and credit',
  },
};
export const UNITS = ['عدد', 'دستگاه', 'کیلوگرم', 'گرم', 'متر', 'متر مربع', 'لیتر', 'بسته', 'جفت', 'ساعت', 'نفر-ساعت', 'خدمت'];

const FA_D = '۰۱۲۳۴۵۶۷۸۹';
const latin = (s) => String(s ?? '').replace(/[۰-۹]/g, (d) => FA_D.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
export function parseNum(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(latin(v).replace(/[٬,\s_']/g, '').replace('٫', '.'));
  return Number.isFinite(n) ? n : 0;
}
const PAPER = { a4: [210, 297], a4l: [297, 210], a5: [148, 210], a5l: [210, 148] };
const MM = 96 / 25.4;

/* ------------------------------------------------------------------ maths */
export function totals(data = {}) {
  const rate = data.vatRate ?? 10;
  const lines = (data.items || []).map((it) => {
    const qty = parseNum(it.qty); const price = parseNum(it.price);
    const gross = qty * price;
    const discount = Math.min(gross, it.discountPercent != null ? Math.round((gross * parseNum(it.discountPercent)) / 100) : parseNum(it.discount));
    const net = gross - discount;
    const vat = it.vatExempt ? 0 : Math.round((net * (it.vatRate ?? rate)) / 100);
    return { qty, price, gross, discount, net, vat, total: net + vat };
  });
  const sum = (k) => lines.reduce((a, l) => a + l[k], 0);
  const extra = parseNum(data.shipping);
  return { lines, rate, gross: sum('gross'), discount: sum('discount'), net: sum('net'), vat: sum('vat'), shipping: extra, total: sum('total') + extra };
}

/* fallback words (fa / en) when AC.money is absent */
const W = {
  ones: ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'], teens: ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'],
  tens: ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'], hund: ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'],
  scales: ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'],
};
function faWords(n) {
  n = Math.trunc(Math.abs(n)); if (!n) return 'صفر';
  const parts = []; let i = 0;
  while (n > 0) {
    const t = n % 1000; const h = Math.floor(t / 100); const r = t % 100; const p = [];
    if (h) p.push(W.hund[h]);
    if (r >= 10 && r < 20) p.push(W.teens[r - 10]); else { if (r >= 20) p.push(W.tens[Math.floor(r / 10)]); if (r % 10) p.push(W.ones[r % 10]); }
    if (t) parts.unshift(p.join(' و ') + (W.scales[i] ? ` ${W.scales[i]}` : ''));
    n = Math.floor(n / 1000); i++;
  }
  return parts.join(' و ');
}

/* tiny deterministic QR-like placeholder (not a real QR code) */
function qrSvg(text = '') {
  let h = 2166136261; for (const c of String(text)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const n = 25; const cells = [];
  const fin = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" rx="1.5"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".7"/>`;
  const inF = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inF(x, y) && rnd() > 0.5) cells.push(`M${x} ${y}h1v1h-1z`);
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" aria-hidden="true" shape-rendering="crispEdges"><path d="${cells.join('')}"/>${fin(0, 0)}${fin(n - 7, 0)}${fin(0, n - 7)}</svg>`;
}

/* ------------------------------------------------------------------ renderer */
export function createInvoice(AC, el, data = {}, opts = {}) {
  const esc = AC.escapeHtml;
  const lang = () => (AC.i18n?.lang || 'fa').split('-')[0];
  const st = {
    type: opts.type || data.type || 'official',
    unit: (opts.unit || ((opts.type || data.type) === 'proforma' ? AC.money?.unit : 'IRR') || 'IRR').toUpperCase(),
    digits: opts.digits || (AC.i18n?.digits === 'native' ? 'fa' : 'latn'),
    paper: opts.paper || (data.type === 'proforma' || opts.type === 'proforma' ? 'a4' : 'a4l'),
    toolbar: opts.toolbar !== false,
  };
  if (st.unit !== 'IRT') st.unit = 'IRR';
  let doc = data;
  const t = (k, vars) => {
    const dict = L[lang()] || L.fa;
    let s = (opts.labels || {})[k] ?? AC.t(`invoiceIR.${k}`, dict[k] ?? L.fa[k] ?? k);
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, x) => (vars[x] ?? m));
    return st.digits === 'fa' ? s.replace(/\d/g, (d) => FA_D[d]) : s.replace(/[۰-۹]/g, (d) => FA_D.indexOf(d));
  };
  const dg = (s) => (st.digits === 'fa' ? String(s).replace(/\d/g, (d) => FA_D[d]) : latin(s));
  const num = (v, dec = 0) => {
    const s = new Intl.NumberFormat('en-US', { maximumFractionDigits: dec }).format(v);
    return st.digits === 'fa' ? s.replace(/\d/g, (d) => FA_D[d]).replace(/,/g, '٬').replace('.', '٫') : s;
  };
  const cur = () => (doc.currency || 'IRR').toUpperCase();
  const conv = (v) => (cur() === st.unit ? v : st.unit === 'IRT' ? v / 10 : v * 10);
  const money = (v, sign = '') => `<bdi class="aci-n">${sign}${num(conv(v), st.unit === 'IRT' ? 1 : 0)}</bdi>`;
  const words = (v) => {
    const amt = Math.round(conv(v));
    if (AC.money?.words) return AC.money.words(amt, { currency: st.unit, lang: lang() === 'en' ? 'en' : 'fa' });
    return `${faWords(amt)} ${L.fa[st.unit]}`;
  };
  const jdate = (v) => {
    if (!v) return '';
    if (AC.date?.format) return AC.date.format(v, { calendar: 'persian', style: 'numeric', digits: st.digits === 'fa' ? 'native' : 'latn', lang: 'fa' });
    return dg(new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(v)).replace(/(\d+)\/(\d+)\/(\d+).*/, '$3/$1/$2'));
  };
  const val = (v, cls = '') => (v ? `<bdi class="${cls}">${esc(dg(v))}</bdi>` : '<span class="aci-blank" aria-hidden="true"></span>');
  const uLabel = () => t(st.unit);

  /* ---------- official */
  function party(key, p = {}) {
    const f = (k, v, cls = '', extra = '') => `<div class="aci-f ${cls}"><span class="aci-f__l">${t(k)}</span><span class="aci-f__v">${extra || val(v)}</span></div>`;
    return `<section class="aci-party" aria-label="${t(key)}">
      <h3 class="aci-band">${t(key)}</h3>
      <div class="aci-party__grid">
        ${f('name', p.name, 'aci-f--wide', p.name ? `<strong>${esc(p.name)}</strong>` : '')}
        ${f('nid', p.nationalId, '', p.nationalId ? `<bdi class="aci-mono">${esc(dg(p.nationalId))}</bdi>` : '')}
        ${f('eco', p.economicCode, '', p.economicCode ? `<bdi class="aci-mono">${esc(dg(p.economicCode))}</bdi>` : '')}
        ${f('reg', p.regNo)}
        ${f('postal', p.postalCode, '', p.postalCode ? `<bdi class="aci-mono">${esc(dg(p.postalCode))}</bdi>` : '')}
        ${f('phone', p.phone, 'aci-f--wide', p.phone ? `<bdi class="aci-mono">${esc(dg(p.phone))}</bdi>` : '')}
        ${f('address', p.address, 'aci-f--full', p.address ? esc(dg(p.address)) : '')}
      </div>
    </section>`;
  }
  function official() {
    const T = totals(doc);
    const u = `<small>(${uLabel()})</small>`;
    const rows = (doc.items || []).map((it, i) => {
      const l = T.lines[i];
      return `<tr>
        <td class="aci-c">${dg(i + 1)}</td>
        <td class="aci-c"><bdi class="aci-mono">${esc(dg(it.code || ''))}</bdi></td>
        <td class="aci-desc">${esc(it.title || '')}${it.note ? `<small>${esc(it.note)}</small>` : ''}</td>
        <td class="aci-c"><bdi class="aci-n">${num(l.qty, 3)}</bdi></td>
        <td class="aci-c">${esc(it.unit || '')}</td>
        <td>${money(l.price)}</td><td>${money(l.gross)}</td><td>${money(l.discount)}</td><td>${money(l.net)}</td><td>${money(l.vat)}</td><td class="aci-strong">${money(l.total)}</td>
      </tr>`;
    }).join('');
    const pay = doc.payment || 'cash';
    const box = (on, label) => `<span class="aci-check" data-on="${on}"><i aria-hidden="true"></i>${label}</span>`;
    return `
      <header class="aci-head">
        <div class="aci-head__side">${doc.seller?.logo ? `<img class="aci-logo" src="${esc(doc.seller.logo)}" alt="">` : ''}</div>
        <h2 class="aci-title">${t('official')}</h2>
        <dl class="aci-meta">
          <div><dt>${t('serial')}</dt><dd><bdi class="aci-mono">${esc(dg(doc.serial || ''))}</bdi></dd></div>
          <div><dt>${t('date')}</dt><dd><bdi class="aci-n">${jdate(doc.date)}</bdi></dd></div>
          <div class="aci-meta__tax"><dt>${t('taxId')}</dt><dd>${doc.taxId ? `<bdi class="aci-mono aci-ltr">${esc(doc.taxId)}</bdi>` : '<span class="aci-blank"></span>'}</dd></div>
        </dl>
      </header>
      ${party('seller', doc.seller)}
      ${party('buyer', doc.buyer)}
      <h3 class="aci-band aci-band--table">${t('goods')}</h3>
      <table class="aci-table aci-table--official">
        <colgroup><col class="w-row"><col class="w-code"><col class="w-desc"><col class="w-qty"><col class="w-unit"><col span="6" class="w-amt"></colgroup>
        <thead><tr>
          <th>${t('row')}</th><th>${t('code')}</th><th>${t('desc')}</th><th>${t('qty')}</th><th>${t('unit')}</th>
          <th>${t('price')} ${u}</th><th>${t('gross')} ${u}</th><th>${t('disc')} ${u}</th><th>${t('net')} ${u}</th><th>${t('vatCol')} ${u}</th><th title="${t('totalFull')}">${t('total')} ${u}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr>
          <th colspan="6" class="aci-sumlabel">${t('sum')}</th>
          <td>${money(T.gross)}</td><td>${money(T.discount)}</td><td>${money(T.net)}</td><td>${money(T.vat)}</td><td class="aci-strong">${money(T.total)}</td>
        </tr></tfoot>
      </table>
      <div class="aci-words"><span class="aci-f__l">${t('words')}:</span> <strong>${esc(words(T.total))}</strong></div>
      <div class="aci-terms">
        <div class="aci-terms__pay"><span class="aci-f__l">${t('terms')}:</span> ${box(pay === 'cash' || pay === 'mixed', t('cash'))} ${box(pay === 'credit' || pay === 'mixed', t('credit'))}</div>
        <div class="aci-terms__rate">${t('vatRate', { rate: T.rate })}</div>
      </div>
      <div class="aci-notes"><span class="aci-f__l">${t('notes')}:</span> ${esc(doc.notes || '')}</div>
      <div class="aci-signs">
        <div class="aci-sign"><span>${t('signSeller')}</span></div>
        <div class="aci-sign"><span>${t('signBuyer')}</span></div>
      </div>`;
  }

  /* ---------- proforma */
  function bankRow(b) {
    const B = AC.bank;
    const info = (b.card && B?.detect?.(b.card)) || (b.sheba && B?.sheba?.bank?.(b.sheba)) || (b.bank && B?.get?.(b.bank)) || null;
    const slug = info?.slug || b.bank;
    const logo = slug && B?.logo ? B.logo(slug, { class: 'aci-banklogo' }) : '<span class="aci-banklogo aci-banklogo--x" aria-hidden="true"></span>';
    const bankName = b.bankName || (info ? info[lang() === 'en' ? 'en' : 'fa'] : '');
    const card = b.card ? (B?.formatCard ? B.formatCard(b.card, { sep: ' ' }) : latin(b.card).replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')) : '';
    const sheba = b.sheba ? (B?.sheba?.format ? B.sheba.format(b.sheba) : latin(b.sheba).toUpperCase().replace(/(.{4})(?=.)/g, '$1 ')) : '';
    return `<li class="aci-bank">
      ${logo}
      <div class="aci-bank__main">
        <div class="aci-bank__head"><strong>${esc(bankName)}</strong>${b.holder ? `<span>${t('holder')}: ${esc(b.holder)}</span>` : ''}</div>
        ${card ? `<div class="aci-bank__row"><span>${t('card')}</span><bdi class="aci-mono aci-ltr">${esc(dg(card))}</bdi></div>` : ''}
        ${sheba ? `<div class="aci-bank__row"><span>${t('sheba')}</span><bdi class="aci-mono aci-ltr">${esc(sheba)}</bdi></div>` : ''}
        ${b.account ? `<div class="aci-bank__row"><span>${t('account')}</span><bdi class="aci-mono aci-ltr">${esc(dg(b.account))}</bdi></div>` : ''}
      </div>
    </li>`;
  }
  function proforma() {
    const T = totals(doc); const s = doc.seller || {}; const b = doc.buyer || {};
    const initials = (s.brand || s.name || 'A').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('‌');
    const rows = (doc.items || []).map((it, i) => {
      const l = T.lines[i];
      return `<tr>
        <td class="aci-c aci-muted">${dg(String(i + 1).padStart(2, '0'))}</td>
        <td class="aci-desc"><strong>${esc(it.title || '')}</strong>${it.code || it.note ? `<small>${esc(dg([it.code, it.note].filter(Boolean).join(' · ')))}</small>` : ''}</td>
        <td class="aci-c"><bdi class="aci-n">${num(l.qty, 3)}</bdi> <small>${esc(it.unit || '')}</small></td>
        <td>${money(l.price)}</td><td>${l.discount ? money(l.discount) : '<span class="aci-muted">—</span>'}</td><td class="aci-strong">${money(l.net)}</td>
      </tr>`;
    }).join('');
    const pc = (title, p) => `<section class="aci-pcard"><h3>${title}</h3><strong class="aci-pcard__name">${esc(p.name || '')}</strong>
      ${p.economicCode ? `<p>${t('eco')}: <bdi class="aci-mono">${esc(dg(p.economicCode))}</bdi></p>` : ''}
      ${p.phone ? `<p><bdi class="aci-mono">${esc(dg(p.phone))}</bdi></p>` : ''}
      ${p.address ? `<p>${esc(dg(p.address))}</p>` : ''}</section>`;
    const u = uLabel();
    const banks = doc.bankAccounts || [];
    return `
      <header class="aci-phead">
        <div class="aci-brand">
          ${s.logo ? `<img class="aci-brand__logo" src="${esc(s.logo)}" alt="">` : `<span class="aci-brand__mark" aria-hidden="true">${esc(initials)}</span>`}
          <div><strong class="aci-brand__name">${esc(s.brand || s.name || '')}</strong>${s.tagline ? `<small>${esc(s.tagline)}</small>` : ''}</div>
        </div>
        <div class="aci-phead__meta">
          <h2 class="aci-ptitle">${esc(doc.title || t('proforma'))}</h2>
          <dl class="aci-pmeta">
            <div><dt>${t('no')}</dt><dd><bdi class="aci-mono">${esc(dg(doc.serial || ''))}</bdi></dd></div>
            <div><dt>${t('date')}</dt><dd><bdi class="aci-n">${jdate(doc.date)}</bdi></dd></div>
            ${doc.validUntil ? `<div><dt>${t('validUntil')}</dt><dd><bdi class="aci-n">${jdate(doc.validUntil)}</bdi></dd></div>` : ''}
          </dl>
        </div>
      </header>
      <div class="aci-pparties">${pc(t('from'), s)}${pc(t('billTo'), b)}</div>
      <table class="aci-table aci-table--proforma">
        <colgroup><col class="w-row"><col class="w-pdesc"><col class="w-pqty"><col span="3" class="w-amt"></colgroup>
        <thead><tr><th>${t('row')}</th><th>${t('desc')}</th><th>${t('qty')}</th><th>${t('price')} <small>(${u})</small></th><th>${t('disc')}</th><th>${t('amount')} <small>(${u})</small></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="aci-pbottom">
        <section class="aci-pay">
          ${banks.length ? `<h3>${t('payment')}</h3><ul class="aci-banks">${banks.map(bankRow).join('')}</ul>` : ''}
          <div class="aci-qr"><div class="aci-qr__code">${qrSvg(doc.qr || doc.serial || 'aramin')}</div><div><strong>${t('scan')}</strong>${doc.qr ? `<small class="aci-ltr">${esc(doc.qr)}</small>` : ''}</div></div>
        </section>
        <section class="aci-ptotals">
          <div class="aci-ptotals__row"><span>${t('subtotal')}</span>${money(T.gross)}</div>
          ${T.discount ? `<div class="aci-ptotals__row aci-ptotals__row--disc"><span>${t('discount')}</span>${money(T.discount, '−')}</div>` : ''}
          ${T.vat ? `<div class="aci-ptotals__row"><span>${t('vat', { rate: T.rate })}</span>${money(T.vat)}</div>` : ''}
          ${T.shipping ? `<div class="aci-ptotals__row"><span>${esc(doc.shippingLabel || 'ارسال')}</span>${money(T.shipping)}</div>` : ''}
          <div class="aci-ptotals__due"><span>${t('payable')}</span><strong>${money(T.total)} <small>${u}</small></strong></div>
          <p class="aci-ptotals__words">${esc(words(T.total))}</p>
        </section>
      </div>
      ${doc.notes ? `<div class="aci-pnotes"><h3>${t('notes')}</h3><p>${esc(doc.notes)}</p></div>` : ''}
      <div class="aci-signs aci-signs--p"><div class="aci-sign"><span>${t('signSeller')}</span></div><div class="aci-sign"><span>${t('signBuyer')}</span></div></div>
      <p class="aci-disclaimer">${t('disclaimer')}</p>`;
  }

  /* ---------- toolbar */
  const seg = (key, values) => `<div class="ac-segmented ac-segmented--sm" data-ac="segmented" data-aci-opt="${key}" role="radiogroup" aria-label="${esc(t(`${key}Label`))}">
      ${values.map(([v, label]) => `<button class="ac-segmented__item" type="button" role="radio" data-value="${v}" aria-checked="${st[key] === v}">${label}</button>`).join('')}</div>`;
  function toolbar() {
    return `<div class="aci-toolbar" data-aci-noprint>
      ${seg('unit', [['IRR', t('IRR')], ['IRT', t('IRT')]])}
      ${seg('digits', [['fa', '۱۲۳'], ['latn', '123']])}
      ${seg('paper', ['a4', 'a4l', 'a5', 'a5l'].map((p) => [p, t(p)]))}
      <button class="ac-btn ac-btn--primary ac-btn--sm aci-print" type="button" data-aci-print>${AC.icon ? AC.icon('printer') : ''}<span>${t('print')}</span></button>
    </div>`;
  }

  /* ---------- mount */
  el.classList.add('aci');
  el.innerHTML = `${st.toolbar ? `<div class="aci-toolbar-slot"></div>` : ''}<div class="aci-stage"><article class="aci-sheet" lang="${lang()}"></article></div>`;
  const stage = el.querySelector('.aci-stage'); const sheet = el.querySelector('.aci-sheet'); const tslot = el.querySelector('.aci-toolbar-slot');

  function fit() {
    const [w] = PAPER[st.paper]; const px = w * MM;
    const avail = stage.clientWidth;
    sheet.style.setProperty('--aci-zoom', avail ? String(Math.min(1, avail / px)) : '1');
  }
  function pageStyle() {
    let s = document.getElementById('aci-page-style');
    if (!s) { s = document.createElement('style'); s.id = 'aci-page-style'; document.head.append(s); }
    const [w, h] = PAPER[st.paper]; const m = st.paper.startsWith('a5') ? 7 : 9;
    s.textContent = `@media print { @page { size: ${w}mm ${h}mm; margin: ${m}mm; } }`;
  }
  function draw() {
    sheet.dataset.type = st.type; sheet.dataset.paper = st.paper; sheet.dataset.digits = st.digits;
    sheet.lang = lang(); sheet.dir = AC.i18n?.dir || 'rtl';
    sheet.innerHTML = st.type === 'proforma' ? proforma() : official();
    fit(); pageStyle();
  }
  function drawToolbar() { if (tslot) { tslot.innerHTML = toolbar(); AC.scan?.(tslot); } }
  drawToolbar(); draw();

  const ro = new ResizeObserver(() => fit()); ro.observe(stage);
  const offs = [
    AC.on(el, 'ac:segmented:change', (e) => {
      const k = e.target.closest('[data-aci-opt]')?.dataset.aciOpt; if (!k) return;
      api.set({ [k]: e.detail.value }, { toolbar: false });
      AC.emit(el, 'invoice-ir:change', { opts: { ...st } });
    }),
    AC.on(el, 'click', '[data-aci-print]', () => api.print()),
    AC.on(document, 'ac:i18n:change', () => { drawToolbar(); draw(); }),
  ];
  const api = {
    el,
    get data() { return doc; },
    get options() { return { ...st }; },
    get totals() { return totals(doc); },
    update(next) { doc = next || {}; draw(); return api; },
    set(o = {}, { toolbar: tb = true } = {}) {
      for (const k of ['type', 'unit', 'digits', 'paper']) if (o[k]) st[k] = o[k];
      if (tb) drawToolbar();
      draw(); return api;
    },
    print() { pageStyle(); window.print(); },
    destroy() { ro.disconnect(); offs.forEach((f) => f()); el.classList.remove('aci'); },
  };
  return api;
}

/* ------------------------------------------------------------------ editor */
export function createEditor(AC, el, { data, preview, storageKey = 'ac:invoice-ir:draft', labels } = {}) {
  const esc = AC.escapeHtml;
  const lang = () => (AC.i18n?.lang || 'fa').split('-')[0];
  const t = (k) => (labels || {})[k] ?? AC.t(`invoiceIR.${k}`, (L[lang()] || L.fa)[k] ?? L.fa[k] ?? k);
  const initial = JSON.parse(JSON.stringify(data || {}));
  let doc = (storageKey && AC.store?.get(storageKey)) || JSON.parse(JSON.stringify(initial));
  doc.items = doc.items || [];
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), doc);
  const setPath = (path, v) => { const ks = path.split('.'); let o = doc; ks.slice(0, -1).forEach((k) => { o = o[k] ??= {}; }); o[ks.at(-1)] = v; };
  const fmt = (v) => new Intl.NumberFormat(`${AC.i18n?.locale || 'fa-IR'}${AC.i18n?.digits === 'native' ? '' : '-u-nu-latn'}`, { maximumFractionDigits: 0 }).format(v);
  const curLabel = () => t((doc.currency || 'IRR').toUpperCase());
  const id = AC.uid ? AC.uid() : `aci${Math.random().toString(36).slice(2, 7)}`;

  const input = (path, label, o = {}) => `<div class="ac-field ${o.cls || ''}"><label class="ac-label" for="${id}-${path}">${label}</label>
    <input class="ac-input ${o.ltr ? 'ac-ltr' : ''}" id="${id}-${path}" data-k="${path}" value="${esc(get(path) ?? '')}" ${o.attrs || ''}></div>`;
  const party = (key) => `<details class="aci-ed__group" ${key === 'buyer' ? 'open' : ''}><summary>${t(key)}<svg class="ac-icon ac-icon--sm" aria-hidden="true"><use href="#i-chevron-down"/></svg></summary>
    <div class="ac-form-grid">
      ${input(`${key}.name`, t('name'), { cls: 'ac-span-full' })}
      ${input(`${key}.nationalId`, t('nid'), { ltr: true, attrs: 'inputmode="numeric"' })}
      ${input(`${key}.economicCode`, t('eco'), { ltr: true, attrs: 'inputmode="numeric"' })}
      ${input(`${key}.regNo`, t('reg'), { ltr: true })}
      ${input(`${key}.postalCode`, t('postal'), { ltr: true, attrs: 'inputmode="numeric" maxlength="10"' })}
      ${input(`${key}.phone`, t('phone'), { ltr: true, attrs: 'inputmode="tel"' })}
      ${input(`${key}.address`, t('address'), { cls: 'ac-span-full' })}
    </div></details>`;
  const unitOpts = (v) => [...new Set([...UNITS, v].filter(Boolean))].map((u) => `<option ${u === v ? 'selected' : ''}>${esc(u)}</option>`).join('');
  const itemRow = (it, i) => `<li class="aci-ed__item" data-i="${i}">
      <span class="aci-ed__idx" aria-hidden="true">${i + 1}</span>
      <input class="ac-input aci-ed__title" data-f="title" value="${esc(it.title || '')}" aria-label="${esc(t('desc'))}" placeholder="${esc(t('desc'))}">
      <input class="ac-input ac-ltr aci-ed__code" data-f="code" value="${esc(it.code || '')}" aria-label="${esc(t('code'))}" placeholder="${esc(t('code'))}">
      <input class="ac-input ac-ltr aci-ed__qty" data-f="qty" inputmode="decimal" value="${esc(it.qty ?? 1)}" aria-label="${esc(t('qty'))}">
      <select class="ac-select aci-ed__unit" data-f="unit" aria-label="${esc(t('unit'))}">${unitOpts(it.unit)}</select>
      <input class="ac-input ac-ltr aci-ed__price" data-f="price" inputmode="numeric" value="${esc(it.price ? fmt(it.price) : '')}" aria-label="${esc(t('price'))}" placeholder="${esc(t('price'))}">
      <input class="ac-input ac-ltr aci-ed__disc" data-f="discount" inputmode="numeric" value="${esc(it.discount ? fmt(it.discount) : '')}" aria-label="${esc(t('disc'))}" placeholder="${esc(t('disc'))}">
      <output class="aci-ed__line ac-num" data-line data-label="${esc(t('edLine'))}"></output>
      <button class="ac-btn ac-btn--ghost ac-btn--icon ac-btn--sm aci-ed__rm" type="button" data-rm aria-label="${esc(t('edRemove'))}"><svg class="ac-icon" aria-hidden="true"><use href="#i-trash-2"/></svg></button>
    </li>`;
  const b0 = () => (doc.bankAccounts ||= [{}])[0];

  function render() {
    el.classList.add('aci-ed');
    el.innerHTML = `
      <div class="aci-ed__group aci-ed__group--flat">
        <div class="aci-ed__row">
          <div class="ac-segmented ac-segmented--sm" data-ac="segmented" data-aci-ed="type" aria-label="${esc(t('edType'))}">
            <button class="ac-segmented__item" type="button" data-value="official" aria-checked="${doc.type !== 'proforma'}">${esc(t('edOfficial'))}</button>
            <button class="ac-segmented__item" type="button" data-value="proforma" aria-checked="${doc.type === 'proforma'}">${esc(t('proforma'))}</button>
          </div>
          <button class="ac-btn ac-btn--soft ac-btn--sm" type="button" data-reset><svg class="ac-icon" aria-hidden="true"><use href="#i-rotate-ccw"/></svg><span>${esc(t('edReset'))}</span></button>
        </div>
        <div class="ac-form-grid ac-form-grid--3">
          ${input('serial', t('serial'), { ltr: true })}
          ${AC.jalali || AC.date ? `<div class="ac-field"><label class="ac-label" for="${id}-date">${esc(t('date'))}</label><div class="ac-input-group ac-date" data-ac="datepicker" data-aci-date data-name="date" data-calendar="persian" data-value="${esc(String(doc.date || '').slice(0, 10))}"><input class="ac-input" id="${id}-date"></div></div>` : input('date', t('date'), { ltr: true, attrs: 'type="date"' })}
          ${input('vatRate', t('edVat'), { ltr: true, attrs: 'inputmode="decimal"' })}
          ${input('taxId', t('taxId'), { ltr: true, cls: 'ac-span-full', attrs: 'maxlength="22" spellcheck="false"' })}
        </div>
        <div class="aci-ed__row">
          <span class="ac-label">${esc(t('edPay'))}</span>
          <div class="ac-segmented ac-segmented--sm" data-ac="segmented" data-aci-ed="payment">
            ${['cash', 'credit', 'mixed'].map((p) => `<button class="ac-segmented__item" type="button" data-value="${p}" aria-checked="${(doc.payment || 'cash') === p}">${esc(t(p))}</button>`).join('')}
          </div>
        </div>
      </div>
      ${party('seller')}
      ${party('buyer')}
      <section class="aci-ed__group aci-ed__group--flat">
        <div class="aci-ed__row"><h3 class="aci-ed__h">${esc(t('edItems'))} <span class="ac-count">${doc.items.length}</span></h3>
          <button class="ac-btn ac-btn--primary ac-btn--sm" type="button" data-add><svg class="ac-icon" aria-hidden="true"><use href="#i-plus"/></svg><span>${esc(t('edAdd'))}</span></button></div>
        <div class="aci-ed__ihead" aria-hidden="true"><span>#</span><span>${esc(t('desc'))}</span><span>${esc(t('code'))}</span><span>${esc(t('qty'))}</span><span>${esc(t('unit'))}</span><span>${esc(t('price'))}</span><span>${esc(t('disc'))}</span><span>${esc(t('edLine'))}</span><span></span></div>
        <ol class="aci-ed__items">${doc.items.map(itemRow).join('')}</ol>
      </section>
      <details class="aci-ed__group"><summary>${esc(t('edBank'))}<svg class="ac-icon ac-icon--sm" aria-hidden="true"><use href="#i-chevron-down"/></svg></summary>
        <div class="ac-form-grid">
          <div class="ac-field"><label class="ac-label" for="${id}-card">${esc(t('card'))}</label><input class="ac-input ac-ltr" id="${id}-card" data-bank="card" inputmode="numeric" value="${esc(b0().card || '')}"></div>
          <div class="ac-field"><label class="ac-label" for="${id}-holder">${esc(t('holder'))}</label><input class="ac-input" id="${id}-holder" data-bank="holder" value="${esc(b0().holder || '')}"></div>
          <div class="ac-field ac-span-full"><label class="ac-label" for="${id}-sheba">${esc(t('sheba'))}</label><input class="ac-input ac-ltr" id="${id}-sheba" data-bank="sheba" spellcheck="false" value="${esc(b0().sheba || '')}"></div>
        </div>
        <div class="ac-field"><label class="ac-label" for="${id}-notes">${esc(t('notes'))}</label><textarea class="ac-input" id="${id}-notes" data-k="notes" rows="2">${esc(doc.notes || '')}</textarea></div>
      </details>
      <div class="aci-ed__totals" role="status" aria-live="polite" data-totals></div>`;
    AC.scan?.(el);
    refresh(false);
  }

  let raf = 0;
  function refresh(push = true) {
    const T = totals(doc);
    el.querySelectorAll('[data-line]').forEach((o, i) => { o.textContent = T.lines[i] ? fmt(T.lines[i].total) : ''; });
    const cnt = el.querySelector('.aci-ed__h .ac-count'); if (cnt) cnt.textContent = doc.items.length;
    const box = el.querySelector('[data-totals]');
    const w = AC.money?.words ? AC.money.words(T.total, { currency: (doc.currency || 'IRR').toUpperCase(), lang: lang() === 'en' ? 'en' : 'fa' }) : `${faWords(T.total)} ${curLabel()}`;
    box.innerHTML = `<div class="aci-ed__tgrid">
      <div><span>${esc(t('gross'))}</span><bdi class="ac-num">${fmt(T.gross)}</bdi></div>
      <div><span>${esc(t('disc'))}</span><bdi class="ac-num">${fmt(T.discount)}</bdi></div>
      <div><span>${esc(t('vat').replace('{rate}', fmt(T.rate)))}</span><bdi class="ac-num">${fmt(T.vat)}</bdi></div>
      <div class="aci-ed__due"><span>${esc(t('payable'))}</span><bdi class="ac-num">${fmt(T.total)} <small>${esc(curLabel())}</small></bdi></div>
    </div><p class="aci-ed__words">${esc(w)}</p>`;
    if (!push) { preview?.update(doc); return; }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { preview?.update(doc); if (storageKey) AC.store?.set(storageKey, doc); AC.emit(el, 'invoice-ir:edit', { data: doc }); });
  }

  const num = (v) => parseNum(v);
  const offs = [
    AC.on(el, 'input', '[data-k]', (e, inp) => { const k = inp.dataset.k; setPath(k, k === 'vatRate' ? num(inp.value) : inp.value); refresh(); }),
    AC.on(el, 'input', '[data-bank]', (e, inp) => { b0()[inp.dataset.bank] = inp.value; refresh(); }),
    AC.on(el, 'input', '[data-f]', (e, inp) => {
      const i = Number(inp.closest('[data-i]').dataset.i); const f = inp.dataset.f;
      doc.items[i][f] = ['qty', 'price', 'discount'].includes(f) ? num(inp.value) : inp.value; refresh();
    }),
    AC.on(el, 'change', 'select[data-f]', (e, s) => { doc.items[Number(s.closest('[data-i]').dataset.i)].unit = s.value; refresh(); }),
    AC.on(el, 'focusout', '[data-f="price"], [data-f="discount"]', (e, inp) => { const v = num(inp.value); inp.value = v ? fmt(v) : ''; }),
    AC.on(el, 'focusin', '[data-f="price"], [data-f="discount"]', (e, inp) => { const v = num(inp.value); inp.value = v || ''; }),
    AC.on(el, 'click', '[data-add]', () => {
      doc.items.push({ title: '', code: '', qty: 1, unit: 'عدد', price: 0, discount: 0 });
      const ol = el.querySelector('.aci-ed__items');
      ol.insertAdjacentHTML('beforeend', itemRow(doc.items.at(-1), doc.items.length - 1));
      ol.lastElementChild.querySelector('input').focus();
      refresh();
    }),
    AC.on(el, 'click', '[data-rm]', (e, b) => {
      const li = b.closest('[data-i]'); doc.items.splice(Number(li.dataset.i), 1);
      const after = () => { li.remove(); el.querySelectorAll('[data-i]').forEach((x, j) => { x.dataset.i = j; x.querySelector('.aci-ed__idx').textContent = j + 1; }); refresh(); };
      if (AC.reducedMotion?.() || !li.animate) after();
      else li.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { duration: 160, easing: 'cubic-bezier(.23,1,.32,1)' }).finished.then(after);
    }),
    AC.on(el, 'click', '[data-reset]', () => { doc = JSON.parse(JSON.stringify(initial)); if (storageKey) AC.store?.remove(storageKey); render(); preview?.update(doc); }),
    AC.on(el, 'ac:datepicker:change', (e) => { if (!e.target.closest('[data-aci-date]')) return; doc.date = e.detail.value || ''; refresh(); }),
    AC.on(el, 'ac:segmented:change', (e) => {
      const k = e.target.closest('[data-aci-ed]')?.dataset.aciEd; if (!k) return;
      doc[k] = e.detail.value;
      if (k === 'type') preview?.set({ type: doc.type, paper: doc.type === 'proforma' ? 'a4' : 'a4l' });
      refresh();
    }),
    AC.on(document, 'ac:i18n:change', () => render()),
  ];
  render();
  preview?.set({ type: doc.type || 'official' });
  return { el, get data() { return doc; }, set(next) { doc = next; render(); preview?.update(doc); }, destroy() { offs.forEach((f) => f()); cancelAnimationFrame(raf); } };
}

/* ------------------------------------------------------------------ install */
export function install(AC) {
  if (!AC || AC.invoiceIR) return AC?.invoiceIR;
  cssOnce();
  const resolve = (x) => (typeof x === 'string' ? document.querySelector(x) : x);
  AC.invoiceIR = {
    render(target, data, opts) {
      const el = resolve(target);
      AC.instance(el, 'invoice-ir')?.destroy?.();
      return AC.instance(el, 'invoice-ir', createInvoice(AC, el, data, opts));
    },
    editor(target, cfg) {
      const el = resolve(target);
      AC.instance(el, 'invoice-ir-editor')?.destroy?.();
      return AC.instance(el, 'invoice-ir-editor', createEditor(AC, el, cfg));
    },
    totals, parseNum, units: UNITS, labels: L, defaultVatRate: 10,
  };
  AC.register?.('invoice-ir', (el) => {
    const o = AC.options ? AC.options(el, {}) : {};
    const api = createInvoice(AC, el, o.data || {}, o); AC.instance(el, 'invoice-ir', api);
    return () => api.destroy();
  });
  return AC.invoiceIR;
}
export const register = install;

if (typeof window !== 'undefined' && window.AC) install(window.AC);
