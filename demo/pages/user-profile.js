/* User profile — activity timeline, sessions with revoke (confirm), 2FA toggle, password prompt. */
import { sessions as seed } from '../data.js';

const ACTIVITY = [
  ['success', 'rotate-cw', 'wapi-2 دوباره راه‌اندازی شد', 'از کنسول عملیات · سلامت ۲۰۰', 12],
  ['info', 'git-branch', 'نسخهٔ v2.4.7 روی negahefanavari.com منتشر شد', 'استقرار خودکار از شاخهٔ main', 95],
  ['accent', 'user-plus', 'سارا احمدی به تیم Support دعوت شد', 'نقش: پشتیبان', 240],
  ['warning', 'key-round', 'کلید API «CI / deploy» دوباره ساخته شد', 'کلید قبلی بلافاصله باطل شد', 1400],
  ['success', 'shield-check', 'ورود دومرحله‌ای برای ۳ عضو اجباری شد', 'سیاست امنیتی تیم', 2900],
  ['info', 'receipt', 'فاکتور INV-2041 صادر شد', 'مبلغ $9,130.00', 4300],
  ['danger', 'ban', 'دسترسی یک نشست ناشناس لغو شد', 'IP 185.12.4.9 · Frankfurt', 7200],
  ['accent', 'package', 'محصول «فرش دستباف کاشان» ویرایش شد', 'قیمت و موجودی', 10080],
];

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  let sessions = seed.map((s) => ({ ...s }));
  const ago = (min) => (min === 0 ? t('prof.now', 'هم‌اکنون') : AC.format.relative(new Date(Date.now() - min * 60000)));

  function renderTimeline() {
    $('[data-prof-timeline]').innerHTML = ACTIVITY.map(([tone, icon, title, text, min]) => `<li class="ac-timeline__item" data-tone="${tone}">
      <time>${esc(ago(min))}</time><div class="ac-timeline__body"><strong class="prof-tl">${AC.icon(icon, 'ac-icon--sm')}<span dir="auto">${esc(title)}</span></strong><p dir="auto">${esc(text)}</p></div></li>`).join('');
  }
  function renderSessions() {
    $('[data-prof-sessions]').innerHTML = sessions.map((s) => `<li class="ac-list__item prof-sess" data-id="${s.id}">
      <span class="ac-list__thumb roles-res__icon">${AC.icon(s.icon)}</span>
      <span class="ac-list__main"><span class="ac-list__title"><bdi>${esc(s.device)}</bdi>${s.current ? ` <span class="ac-badge ac-badge--success ac-badge--dot">${esc(t('prof.thisDevice', 'این دستگاه'))}</span>` : ''}</span>
        <span class="ac-list__meta"><bdi>${esc(s.place)}</bdi> · <bdi class="ac-mono">${esc(s.ip)}</bdi> · ${esc(ago(s.min))}</span></span>
      <span class="ac-list__end">${s.current ? '' : `<button class="ac-btn ac-btn--sm ac-btn--danger-soft" type="button" data-revoke="${s.id}">${esc(t('prof.revoke', 'خروج'))}</button>`}</span></li>`).join('');
    $('[data-prof-revoke-all]').hidden = sessions.length < 2;
  }
  renderTimeline(); renderSessions();

  const offs = [
    AC.on(root, 'click', '[data-revoke]', async (e, b) => {
      const s = sessions.find((x) => x.id === b.dataset.revoke);
      if (!s || !await AC.confirm({ tone: 'danger', icon: 'log-out', title: t('prof.revokeTitle', 'خروج از {device}؟', { device: s.device }), text: t('prof.revokeText', 'این دستگاه باید دوباره وارد شود.'), confirmText: t('prof.revoke', 'خروج') })) return;
      const li = b.closest('li');
      li.setAttribute('data-leaving', '');
      setTimeout(() => { sessions = sessions.filter((x) => x !== s); renderSessions(); }, AC.reducedMotion() ? 0 : 220);
      AC.toast?.({ title: t('prof.revoked', 'نشست بسته شد'), tone: 'success' });
    }),
    AC.on(root, 'click', '[data-prof-revoke-all]', async () => {
      if (!await AC.confirm({ tone: 'danger', icon: 'log-out', title: t('prof.revokeAllTitle', 'خروج از همهٔ دستگاه‌های دیگر؟'), confirmText: t('prof.revokeAll', 'خروج از همه') })) return;
      sessions = sessions.filter((s) => s.current); renderSessions();
    }),
    AC.on(root, 'change', '[data-prof-2fa]', async (e) => {
      const c = e.target;
      if (!c.checked && !await AC.confirm({ tone: 'warning', title: t('prof.2faOffTitle', 'ورود دومرحله‌ای خاموش شود؟'), text: t('prof.2faOffText', 'حساب مالک بدون آن آسیب‌پذیرتر است.'), confirmText: t('prof.turnOff', 'خاموش کن') })) { c.checked = true; return; }
      AC.toast?.({ title: c.checked ? t('prof.2faEnabled', 'ورود دومرحله‌ای روشن شد') : t('prof.2faDisabled', 'ورود دومرحله‌ای خاموش شد'), tone: c.checked ? 'success' : 'warning' });
    }),
    AC.on(root, 'click', '[data-prof-pass]', async () => {
      const v = await AC.prompt({ title: t('prof.changePass', 'تغییر رمز عبور'), label: t('prof.newPass', 'رمز تازه'), type: 'password', required: true, validate: (x) => x.length >= 10 || t('prof.passRule', 'دست‌کم ۱۰ نویسه') });
      if (v) AC.toast?.({ title: t('prof.passChanged', 'رمز عبور تغییر کرد'), tone: 'success' });
    }),
    AC.on(root, 'click', '[data-prof-msg]', () => AC.toast?.({ title: t('prof.msgSoon', 'گفتگو باز شد'), tone: 'info' })),
    AC.on(document, 'ac:i18n:change', () => { renderTimeline(); renderSessions(); }),
  ];
  return () => offs.forEach((f) => f());
}
