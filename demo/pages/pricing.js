/* Pricing page — monthly / yearly toggle animates every price (counter) and swaps the period label. */
export default function mount(root, AC) {
  let period = 'month';
  const apply = () => {
    for (const c of root.querySelectorAll('[data-month]')) c.dataset.to = c.dataset[period];
    for (const p of root.querySelectorAll('[data-pricing-per]')) p.textContent = period === 'year' ? AC.t('pricing.perMonthYearly', '/ ماه، پرداخت سالانه') : AC.t('pricing.perMonth', '/ ماه');
    for (const w of root.querySelectorAll('[data-pricing-was]')) w.hidden = period !== 'year';
    root.querySelector('[data-pricing]').dataset.period = period;
    root.querySelectorAll('.ac-plan__amount').forEach((a) => { if (AC.reducedMotion()) return; a.animate([{ transform: 'translateY(-6px)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.34,1.4,.64,1)' }); });
  };
  apply();
  const offs = [
    AC.on(root, 'ac:segmented:change', (e) => { if (e.target.matches('[data-pricing-period]')) { period = e.detail.value; apply(); } }),
    AC.on(document, 'ac:i18n:change', apply),
  ];
  return () => offs.forEach((f) => f());
}
