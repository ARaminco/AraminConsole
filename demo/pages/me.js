/* Customer panel ("my account") — user-panel module + tickets chips over demo/data.js */
import { me, tickets, myTicketIds, meNotifications } from '../data.js';

const STEPS = ['me.stepPlaced', 'me.stepPacking', 'me.stepShipped', 'me.stepDelivered'];
const STEPS_FA = ['ثبت', 'آماده‌سازی', 'ارسال', 'تحویل'];
const STATUS = { processing: ['me.stProcessing', 'در حال آماده‌سازی', 'warning'], shipped: ['me.stShipped', 'ارسال شد', 'info'], delivered: ['me.stDelivered', 'تحویل شد', 'success'] };

export default function mount(root, AC) {
  let alive = true; let off = () => {};
  AC.use('user-panel', 'tickets').then(() => { if (alive) off = start(root, AC); }, (err) => console.error('[demo] user-panel module failed', err));
  return () => { alive = false; off(); };
}

function start(root, AC) {
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  const notifs = meNotifications.map((n) => ({ ...n }));
  const $ = (s) => root.querySelector(s);

  const render = () => {
    $('[data-me-greeting]').textContent = AC.userPanel.greeting(t('me.first', me.first));
    $('[data-me-orders]').innerHTML = me.orders.map((o) => `<li><a class="ac-up-order" href="#/orders">
        <span class="ac-up-order__thumb">${AC.icon(o.icon)}</span>
        <span class="ac-up-order__main"><b>${esc(o.title)}</b><small><bdi class="ac-mono">${esc(o.id)}</bdi> · ${esc(AC.format.date(o.date, { dateStyle: 'medium' }))} · ${esc(t('me.items', '{n} کالا', { n: AC.format.number(o.items) }))}</small></span>
        <span class="ac-up-order__end">${AC.money ? AC.money.html(o.total, { currency: 'IRT' }) : esc(AC.format.number(o.total))}<span class="ac-badge ac-badge--${STATUS[o.status][2]} ac-badge--dot">${esc(t(STATUS[o.status][0], STATUS[o.status][1]))}</span></span>
        ${AC.userPanel.steps(o.step, STEPS.map((k, i) => t(k, STEPS_FA[i])))}
      </a></li>`).join('');
    const mine = myTicketIds.map((id) => tickets.find((x) => x.id === id)).filter(Boolean);
    $('[data-me-tickets]').innerHTML = mine.map((tk) => `<li><a class="ac-up-row" href="#/my-tickets?id=${encodeURIComponent(tk.id)}">
        <span class="ac-up-row__icon" data-tone="${AC.tickets.STATUS[tk.status]}">${AC.icon('life-buoy')}</span>
        <span class="ac-up-row__main"><b>${esc(tk.subject)}</b><small><bdi class="ac-mono">#${esc(tk.id)}</bdi> · ${esc(AC.format.relative(tk.updated))}</small></span>
        <span class="ac-up-row__end">${AC.tickets.statusChip(tk.status)}</span></a></li>`).join('');
    $('[data-me-notifs]').innerHTML = notifs.map((n) => `<li><button type="button" class="ac-up-row" data-me-notif="${n.id}" ${n.read ? '' : 'data-unread'}>
        <span class="ac-up-row__icon" data-tone="${n.tone}">${AC.icon(n.icon)}</span>
        <span class="ac-up-row__main"><b>${esc(n.title)}</b><small>${esc(n.text)}</small></span>
        <span class="ac-up-row__end">${esc(AC.format.relative(n.time))}</span></button></li>`).join('');
    $('[data-me-activity]').innerHTML = me.activity.map((a) => `<li><div class="ac-up-row">
        <span class="ac-up-row__icon" data-tone="${a.tone}">${AC.icon(a.icon)}</span>
        <span class="ac-up-row__main"><b>${esc(t(a.key, a.text))}</b><small>${esc(AC.format.date(a.time, { dateStyle: 'medium', timeStyle: 'short' }))}</small></span></div></li>`).join('');
  };
  render();

  const toast = (title, tone = 'success') => AC.toast?.({ title, tone });
  const enable2fa = () => {
    root.querySelectorAll('[data-me-2fa], [data-me-checks] li:last-child').forEach((li) => { li.setAttribute('data-done', ''); li.querySelector('use')?.setAttribute('href', '#i-circle-check'); li.querySelector('.ac-btn')?.remove(); });
    const s = $('[data-me-sec-score]'); s.dataset.tone = 'success'; s.querySelector('use').setAttribute('href', '#i-shield-check');
    s.querySelector('b').textContent = t('me.secFull', 'امنیت حساب کامل است'); s.querySelector('small').textContent = t('me.secFullHint', 'همهٔ موارد امنیتی فعال‌اند.');
    toast(t('me.2faOn', 'ورود دومرحله‌ای فعال شد'));
  };
  const offs = [
    AC.on(root, 'click', '[data-me-topup]', async () => {
      const v = AC.prompt ? await AC.prompt({ title: t('me.topup', 'افزایش موجودی'), label: t('me.amount', 'مبلغ (تومان)'), value: '500000', required: true, validate: (x) => Number(String(x).replace(/\D/g, '')) >= 10000 || t('me.min', 'حداقل ۱۰٬۰۰۰ تومان') }) : '500000';
      if (!v) return;
      const amt = $('.ac-up-wallet__amount [data-ac-money]');
      amt.setAttribute('data-ac-money', String(Number(amt.getAttribute('data-ac-money')) + Number(String(v).replace(/\D/g, ''))));
      AC.money?.render(amt, true);
      AC.motion?.bump?.(amt);
      toast(t('me.topped', 'کیف پول شارژ شد'));
    }),
    AC.on(root, 'click', '[data-me-toast]', (e, el) => { e.preventDefault(); toast(t(el.dataset.meToast, el.textContent.trim()), 'info'); }),
    AC.on(root, 'click', '[data-me-complete]', (e, b) => { const li = b.closest('li'); if (b.closest('li') === $('[data-me-checks] li:last-child')) { enable2fa(); return; } li.setAttribute('data-done', ''); li.querySelector('use').setAttribute('href', '#i-circle-check'); b.remove(); toast(t('me.saved', 'ذخیره شد')); }),
    AC.on(root, 'click', '[data-me-2fa-on]', enable2fa),
    AC.on(root, 'click', '[data-me-notif]', (e, b) => { const n = notifs.find((x) => x.id === b.dataset.meNotif); if (n) { n.read = true; b.removeAttribute('data-unread'); } }),
    AC.on(root, 'click', '[data-me-readall]', () => { notifs.forEach((n) => { n.read = true; }); root.querySelectorAll('[data-me-notif][data-unread]').forEach((b) => b.removeAttribute('data-unread')); }),
    AC.on(document, 'ac:i18n:change', render),
  ];
  return () => offs.forEach((f) => f());
}
