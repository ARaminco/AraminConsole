/* Settings — section nav with scroll-spy, live theme/accent/density/language/digits, API keys (copy / reveal / regenerate / revoke). */
import { apiKeys, makeKey } from '../data.js';

const ACCENT_HEX = { orange: '#f0532d', violet: '#6d4aff', blue: '#2563eb', emerald: '#059669', rose: '#e11d48', amber: '#d97706', slate: '#334155' };

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  let seed = 11;
  let keys = apiKeys.map((k) => ({ ...k, secret: makeKey(k.prefix, seed++), shown: false }));
  const mask = (s) => `${s.slice(0, s.indexOf('_') + 1)}••••••••••••${s.slice(-4)}`;

  /* section nav: smooth scroll (never touch the hash — the router owns it) + scroll-spy */
  const links = [...root.querySelectorAll('.set-nav__link')];
  const spy = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) for (const a of links) a.toggleAttribute('aria-current', a.getAttribute('href') === `#${en.target.id}`);
  }, { rootMargin: '-30% 0px -60% 0px' });
  root.querySelectorAll('.set-group').forEach((g) => spy.observe(g));

  /* appearance + general reflect the current state */
  const setSeg = (sel, v) => {
    const el = $(sel); const i = [...el.querySelectorAll('.ac-segmented__item')].findIndex((b) => b.dataset.value === v);
    if (i >= 0) AC.instance(el, 'segmented')?.select(i, { silent: true });
  };
  function syncControls() {
    const th = AC.theme.get();
    setSeg('[data-set-theme]', th.theme);
    setSeg('[data-set-density]', th.density || 'comfortable');
    setSeg('[data-set-digits]', AC.i18n.digits === 'native' ? 'native' : 'latn');
    $('[data-set-lang]').value = AC.i18n.lang;
    $('[data-set-accents]').innerHTML = AC.theme.accents.map((a) => `<button type="button" class="set-acc" role="radio" data-acc="${a}" aria-checked="${a === th.accent}" aria-label="${esc(a)}" title="${esc(a)}"></button>`).join('');
    for (const b of root.querySelectorAll('.set-acc')) b.style.setProperty('--_c', ACCENT_HEX[b.dataset.acc] || 'var(--ac-accent)');
  }
  syncControls();

  function renderKeys() {
    $('[data-set-keys]').innerHTML = keys.map((k) => `<li class="set-key" data-id="${k.id}">
      <span class="set-row__icon"><svg class="ac-icon" aria-hidden="true"><use href="#i-key-round"/></svg></span>
      <div class="set-key__main">
        <div class="set-key__title"><strong>${esc(k.name)}</strong><span class="ac-badge">${esc(k.scope)}</span></div>
        <code class="set-key__secret" dir="ltr">${esc(k.shown ? k.secret : mask(k.secret))}</code>
        <small class="set-key__meta">${esc(t('set.keyCreated', 'ساخته‌شده {date}', { date: AC.format.date(k.created, { dateStyle: 'medium' }) }))} · ${esc(t('set.keyUsed', 'آخرین استفاده {ago}', { ago: AC.format.relative(new Date(Date.now() - k.used * 60000)) }))}</small>
      </div>
      <div class="set-key__actions">
        <button class="ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost" type="button" data-key="show" aria-pressed="${k.shown}" aria-label="${esc(t('set.reveal', 'نمایش'))}" title="${esc(t('set.reveal', 'نمایش'))}">${AC.icon(k.shown ? 'eye-off' : 'eye')}</button>
        <button class="ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost" type="button" data-key="copy" aria-label="${esc(t('common.copy', 'کپی'))}" title="${esc(t('common.copy', 'کپی'))}">${AC.icon('copy')}</button>
        <button class="ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost" type="button" data-key="regen" aria-label="${esc(t('set.regen', 'ساخت دوباره'))}" title="${esc(t('set.regen', 'ساخت دوباره'))}">${AC.icon('refresh-cw')}</button>
        <button class="ac-btn ac-btn--sm ac-btn--icon ac-btn--danger-soft" type="button" data-key="revoke" aria-label="${esc(t('set.revokeKey', 'باطل کردن'))}" title="${esc(t('set.revokeKey', 'باطل کردن'))}">${AC.icon('trash-2')}</button>
      </div></li>`).join('') || `<li class="ac-empty ac-empty--sm"><p class="ac-empty__text">${esc(t('set.noKeys', 'کلیدی وجود ندارد'))}</p></li>`;
  }
  renderKeys();
  const copy = async (text) => {
    const ok = await (AC.copyText ? AC.copyText(text) : navigator.clipboard?.writeText(text).then(() => true, () => false));
    AC.toast?.({ title: ok ? t('common.copied', 'کپی شد') : t('inv.copyFail', 'کپی نشد'), tone: ok ? 'success' : 'warning' });
  };

  const offs = [
    AC.on(root, 'click', '.set-nav__link', (e, a) => {
      e.preventDefault();
      root.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: AC.reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }),
    AC.on(root, 'ac:segmented:change', (e) => {
      const v = e.detail.value;
      if (e.target.closest('[data-set-theme]')) AC.theme.set({ theme: v });
      else if (e.target.closest('[data-set-density]')) AC.theme.set({ density: v });
      else if (e.target.closest('[data-set-digits]')) AC.i18n.setDigits(v);
    }),
    AC.on(root, 'click', '.set-acc', (e, b) => { AC.theme.set({ accent: b.dataset.acc }); }),
    AC.on($('[data-set-lang]'), 'change', (e) => AC.i18n.set(e.target.value)),
    AC.on(document, 'ac:theme:change', syncControls),
    AC.on(document, 'ac:i18n:change', () => { syncControls(); renderKeys(); }),
    AC.on(root, 'click', '[data-set-save]', () => AC.toast?.({ title: t('set.saved', 'تنظیمات ذخیره شد'), tone: 'success' })),
    AC.on(root, 'click', '[data-key-new]', async () => {
      const name = await AC.prompt({ title: t('set.newKey', 'کلید جدید'), label: t('set.keyName', 'نام کلید'), placeholder: 'Staging', required: true });
      if (!name) return;
      const k = { id: `k${Date.now()}`, name, prefix: 'ak_live', scope: 'read', created: new Date().toISOString(), used: 0, secret: makeKey('ak_live', seed++), shown: true };
      keys = [k, ...keys]; renderKeys();
      AC.toast?.({ title: t('set.keyCreatedToast', 'کلید ساخته شد — همین حالا کپی کنید'), tone: 'success', action: { label: t('common.copy', 'کپی'), onClick: () => copy(k.secret) } });
    }),
    AC.on(root, 'click', '[data-key]', async (e, b) => {
      const k = keys.find((x) => x.id === b.closest('[data-id]').dataset.id);
      if (!k) return;
      const act = b.dataset.key;
      if (act === 'show') { k.shown = !k.shown; renderKeys(); }
      else if (act === 'copy') copy(k.secret);
      else if (act === 'regen') {
        if (!await AC.confirm({ tone: 'warning', icon: 'refresh-cw', title: t('set.regenTitle', 'کلید «{name}» دوباره ساخته شود؟', { name: k.name }), text: t('set.regenText', 'کلید فعلی بلافاصله باطل می‌شود و هر سرویسی که از آن استفاده می‌کند باید به‌روز شود.'), confirmText: t('set.regen', 'ساخت دوباره') })) return;
        k.secret = makeKey(k.prefix, seed++ * 7); k.shown = true; k.created = new Date().toISOString(); k.used = 0; renderKeys();
        root.querySelector(`[data-id="${k.id}"]`)?.setAttribute('data-fresh', '');
        AC.toast?.({ title: t('set.regenDone', 'کلید تازه ساخته شد'), tone: 'success' });
      } else if (act === 'revoke') {
        if (!await AC.confirm({ tone: 'danger', title: t('set.revokeTitle', 'کلید «{name}» باطل شود؟', { name: k.name }), confirmText: t('set.revokeKey', 'باطل کردن') })) return;
        keys = keys.filter((x) => x !== k); renderKeys();
      }
    }),
  ];
  return () => { spy.disconnect(); offs.forEach((f) => f()); };
}
