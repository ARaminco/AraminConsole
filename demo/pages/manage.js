/* Manage page: the payment card is the framework bank card (data-ac="bank-card"); flip / freeze / reveal / copy, switch between cards. */
const luhnFill = (prefix, AC) => { let s = prefix; while (s.length < 15) s += String((s.length * 7 + 3) % 10); for (let d = 0; d < 10; d++) if (AC.bank.luhn(s + d)) return s + d; return `${s}0`; };

export default function mount(root, AC) {
  const cardEl = root.querySelector('#mng-card');
  const card = () => AC.instance(cardEl, 'bank-card');
  const state = root.querySelector('[data-mng-state]');
  const NUMBERS = { melli: luhnFill('6037991044', AC), mellat: luhnFill('6104337291', AC) };
  for (const chip of root.querySelectorAll('[data-pick]')) {
    const b = AC.bank.get(chip.dataset.pick);
    chip.querySelector('bdi').textContent = `•• ${NUMBERS[chip.dataset.pick].slice(-4)}`;
    const sw = chip.querySelector('.mng-chip__sw');
    if (b) { sw.style.setProperty('background', `linear-gradient(135deg, ${b.colors[0]}, ${b.colors[1]})`); chip.title = AC.i18n.lang === 'fa' ? b.fa : b.en; }
  }
  AC.bankCard(cardEl, { number: NUMBERS.melli }); // inits the component if the router has not scanned it yet

  const offs = [
    AC.on(root, 'click', '[data-pick]', (e, chip) => {
      for (const c of root.querySelectorAll('[data-pick]')) c.setAttribute('aria-pressed', String(c === chip));
      card()?.set({ number: NUMBERS[chip.dataset.pick] }); // the theme and logo crossfade to the new bank
    }),
    AC.on(root, 'click', '[data-act]', (e, btn) => {
      const act = btn.dataset.act;
      if (act === 'flip') card()?.flip();
      if (act === 'freeze') {
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', String(on));
        cardEl.toggleAttribute('data-frozen', on);
        state.className = `ac-badge ${on ? 'ac-badge--info' : 'ac-badge--success'}`;
        state.textContent = on ? AC.t('manage.frozen', 'مسدود') : AC.t('manage.active', 'فعال');
      }
      if (act === 'show') {
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', String(on));
        card()?.mask(!on);
      }
      if (act === 'copy') {
        navigator.clipboard?.writeText(card()?.number || '').catch(() => {});
        AC.toast?.({ title: AC.t('manage.copied', 'شمارهٔ کارت کپی شد'), tone: 'success' });
      }
    }),
  ];
  return () => offs.forEach((f) => f());
}
