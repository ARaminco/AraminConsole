/* Invoice — fills the printable invoice from an order (#/invoice?id=INV-2041), QR-like SVG, print. */
import { orders, products, rng } from '../data.js';

const RATE = 92500; // demo rate: toman per USD

function qrSvg(seed) {
  const n = 25; const r = rng(seed); const cells = [];
  const finder = (x, y) => [`<rect x="${x}" y="${y}" width="7" height="7" rx="1.6"/>`, `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1.1" class="inv__qr-bg"/>`, `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.8"/>`].join('');
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && r() > 0.52) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" aria-hidden="true" shape-rendering="crispEdges">${cells.join('')}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
}

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  const usd = (n) => AC.format.number(n, { currency: 'USD' });
  const id = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
  const o = orders.find((x) => x.id === id) || orders[0];
  const p = products.find((x) => x.name === o.product) || products[0];
  const extra = products.filter((x) => x !== p).slice(0, 2);
  const lines = [
    { name: o.product, sku: p.sku, qty: o.qty, unit: o.amount / o.qty },
    { name: extra[0].name, sku: extra[0].sku, qty: 1, unit: extra[0].price },
    { name: t('inv.shipping', 'ارسال اکسپرس'), sku: 'SHIP-EXP', qty: 1, unit: 18 },
  ];
  const sub = lines.reduce((a, l) => a + l.qty * l.unit, 0);
  const disc = Math.round(sub * 0.05 * 100) / 100;
  const tax = Math.round((sub - disc) * 0.09 * 100) / 100;
  const total = sub - disc + tax;
  const BADGE = { paid: ['success', 'status.paid', 'پرداخت‌شده'], pending: ['warning', 'status.pending', 'در انتظار'], shipped: ['info', 'status.shipped', 'ارسال‌شده'], refunded: ['danger', 'status.refunded', 'مرجوعی'] };

  function render() {
    for (const el of root.querySelectorAll('[data-inv-no], [data-inv-no2]')) el.textContent = o.id;
    const [tone, key, fa] = BADGE[o.status];
    const st = $('[data-inv-status]'); st.className = `ac-badge ac-badge--${tone} ac-badge--dot`; st.textContent = t(key, fa); st.removeAttribute('data-i18n');
    $('[data-inv-customer]').textContent = o.customer;
    $('[data-inv-email]').textContent = o.email;
    $('[data-inv-date]').textContent = AC.format.date(o.date, { dateStyle: 'medium' });
    $('[data-inv-due]').textContent = AC.format.date(new Date(new Date(o.date).getTime() + 14 * 864e5), { dateStyle: 'medium' });
    $('[data-inv-lines]').innerHTML = lines.map((l, i) => `<tr>
      <td class="ac-text-muted" data-label="#"><bdi>${i + 1}</bdi></td>
      <td data-label="${esc(t('ord.col.product', 'محصول'))}"><strong><bdi>${esc(l.name)}</bdi></strong><small class="inv__sku ac-mono">${esc(l.sku)}</small></td>
      <td class="ac-text-end ac-num" data-label="${esc(t('inv.qty', 'تعداد'))}"><bdi>${l.qty}</bdi></td>
      <td class="ac-text-end ac-num" data-label="${esc(t('inv.unit', 'فی'))}"><bdi><span class="inv__qtyx">${l.qty} × </span>${usd(l.unit)}</bdi></td>
      <td class="ac-text-end ac-num" data-label="${esc(t('col.amount', 'مبلغ'))}"><bdi>${usd(l.qty * l.unit)}</bdi></td></tr>`).join('');
    $('[data-inv-sub]').innerHTML = `<bdi>${usd(sub)}</bdi>`;
    $('[data-inv-disc]').innerHTML = `<bdi>−${usd(disc)}</bdi>`;
    $('[data-inv-tax]').innerHTML = `<bdi>${usd(tax)}</bdi>`;
    $('[data-inv-total]').innerHTML = `<bdi>${usd(total)}</bdi>`;
    // Persian amount: always Persian digits + Latin underneath, so both readers are served
    const toman = Math.round(total * RATE);
    $('[data-inv-toman]').innerHTML = `<span class="inv__fa" lang="fa">${new Intl.NumberFormat('fa-IR').format(toman)} تومان</span><small class="ac-ltr">${new Intl.NumberFormat('en-US').format(toman)} IRT</small>`;
    $('[data-inv-words]').textContent = t('inv.note', 'نرخ تبدیل نمایشی: هر دلار {rate} تومان. این فاکتور به‌صورت الکترونیکی صادر شده و بدون مهر نیز معتبر است.', { rate: new Intl.NumberFormat(AC.i18n.lang === 'fa' ? 'fa-IR' : 'en-US').format(RATE) });
  }
  $('[data-inv-qr]').innerHTML = qrSvg(o.id.split('').reduce((a, c) => a + c.charCodeAt(0), 3));
  render();

  const offs = [
    AC.on(root, 'click', '[data-inv-print]', () => window.print()),
    AC.on(root, 'click', '[data-inv-copy]', async () => {
      const ok = await (AC.copyText ? AC.copyText(location.href) : navigator.clipboard?.writeText(location.href).then(() => true, () => false));
      AC.toast?.({ title: ok ? t('inv.copied', 'پیوند فاکتور کپی شد') : t('inv.copyFail', 'کپی نشد'), tone: ok ? 'success' : 'warning' });
    }),
    AC.on(document, 'ac:i18n:change', render),
  ];
  return () => offs.forEach((f) => f());
}
