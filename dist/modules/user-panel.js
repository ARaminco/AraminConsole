/*! AraminConsole v0.1.0 — module user-panel — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');
if (!__R["shell"]) await import('./shell.js');

/* ======== module: user-panel ======== */
if (!__R["user-panel"]) __R["user-panel"] = (() => {
const F = {};

/* ---- modules/user-panel/user-panel.js ---- */
const __ac_m1q = F["modules/user-panel/user-panel.js"] = (() => {
/* User panel module — building blocks for a customer-facing "my account" home: wallet card with privacy toggle,
   profile-completeness ring, quick-action app grid, order step tracker, security checklist and a time-aware greeting.
   <div class="ac-up-wallet" data-up-private-scope> … <span data-up-amount>…</span> … <button data-ac="privacy"></button></div>
   <div class="ac-up-complete" data-ac="completeness"><div class="ac-ring" data-ac="ring"></div><ul><li data-done>…</li><li>…</li></ul></div>
   AC.userPanel.greeting(name) → «صبح بخیر، مریم» · AC.userPanel.steps(step, labels) → mini tracker HTML
   AC.userPanel.score(list) → 0..100 (share of truthy entries)
   Events: ac:privacy:change {hidden} (document) · Dependency-free: install(AC) wires it into window.AC. */

let AC = null;
const STR = {
  fa: { morning: 'صبح بخیر', noon: 'ظهر بخیر', evening: 'عصر بخیر', night: 'شب بخیر', hide: 'پنهان کردن مبلغ', show: 'نمایش مبلغ', done: '{n}٪ تکمیل', left: '{n} مورد مانده' },
  en: { morning: 'Good morning', noon: 'Good afternoon', evening: 'Good evening', night: 'Good night', hide: 'Hide amounts', show: 'Show amounts', done: '{n}% complete', left: '{n} left' },
  ar: { morning: 'صباح الخير', noon: 'طاب يومك', evening: 'مساء الخير', night: 'تصبح على خير', hide: 'إخفاء المبلغ', show: 'إظهار المبلغ', done: 'مكتمل {n}٪', left: 'متبقٍ {n}' },
};
const lang = () => (AC.i18n.lang || 'fa').split('-')[0];
const t = (k, vars) => AC.t(`up.${k}`, (STR[lang()] || STR.en)[k] ?? k, vars);

function cssOnce() {
  if (typeof document === 'undefined' || document.querySelector('[data-ac-module="user-panel"]')) return;
  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = new URL('./user-panel.css', (globalThis.__AC_MODS__?.__base || import.meta.url)).href; link.dataset.acModule = 'user-panel';
    document.head.append(link);
  } catch { /* bundled builds ship the CSS themselves */ }
}

function greeting(name) {
  const h = new Date().getHours();
  const k = h < 5 ? 'night' : h < 12 ? 'morning' : h < 16 ? 'noon' : h < 21 ? 'evening' : 'night';
  return name ? `${t(k)}، ${name}`.replace('، ', lang() === 'en' ? ', ' : '، ') : t(k);
}
const score = (list) => Math.round((list.filter(Boolean).length / (list.length || 1)) * 100);
function steps(step, labels = []) {
  return `<ol class="ac-up-steps" aria-label="${AC.escapeHtml(labels[step] || '')}">${labels.map((l, i) => `<li data-state="${i < step ? 'done' : i === step ? 'current' : 'todo'}"><i aria-hidden="true"></i><span>${AC.escapeHtml(l)}</span></li>`).join('')}</ol>`;
}

function privacyInit(el) {
  const scope = el.closest('[data-up-private-scope]') || document.documentElement;
  const sync = () => {
    const hidden = AC.store.get('ac:up-private', false) === true;
    scope.toggleAttribute('data-private', hidden);
    el.setAttribute('aria-pressed', String(hidden));
    el.setAttribute('aria-label', hidden ? t('show') : t('hide'));
    el.innerHTML = AC.icon(hidden ? 'eye-off' : 'eye');
  };
  if (!el.classList.contains('ac-up-eye')) el.classList.add('ac-up-eye');
  el.type = 'button';
  sync();
  const offs = [
    AC.on(el, 'click', () => { AC.store.set('ac:up-private', !(AC.store.get('ac:up-private', false) === true)); AC.emit(document, 'privacy:change', { hidden: AC.store.get('ac:up-private') }); }),
    AC.on(document, 'ac:privacy:change', sync),
    AC.on(document, 'ac:i18n:change', sync),
  ];
  return () => offs.forEach((f) => f());
}

function completenessInit(el) {
  const update = () => {
    const items = [...el.querySelectorAll('li')];
    const done = items.filter((li) => li.hasAttribute('data-done')).length;
    const pct = score(items.map((li) => li.hasAttribute('data-done')));
    const ring = el.querySelector('.ac-ring');
    if (ring) { ring.dataset.value = String(pct); ring.setAttribute('aria-label', t('done', { n: AC.format.number(pct) })); }
    const label = el.querySelector('[data-up-pct]'); if (label) label.textContent = `${AC.format.number(pct)}%`;
    const left = el.querySelector('[data-up-left]'); if (left) left.textContent = t('left', { n: AC.format.number(items.length - done) });
    el.style.setProperty('--up-pct', String(pct / 100));
  };
  update();
  const mo = new MutationObserver(update);
  mo.observe(el, { subtree: true, attributes: true, attributeFilter: ['data-done'] });
  const off = AC.on(document, 'ac:i18n:change', update);
  return () => { mo.disconnect(); off(); };
}

const userPanel = { greeting, steps, score, t };

/** Wire the module into an AC instance: AC.userPanel + data-ac="privacy" / "completeness". */
function install(ac) {
  if (!ac || ac.userPanel) return ac?.userPanel;
  AC = ac;
  cssOnce();
  ac.register('privacy', privacyInit);
  ac.register('completeness', completenessInit);
  ac.userPanel = userPanel;
  return userPanel;
}

if (typeof window !== 'undefined' && window.AC) install(window.AC);
return Object.freeze({ greeting, score, steps, userPanel, install });
})();

return { f: F, ns: Object.freeze({ "greeting": __ac_m1q["greeting"], "score": __ac_m1q["score"], "steps": __ac_m1q["steps"], "userPanel": __ac_m1q["userPanel"], "install": __ac_m1q["install"] }) };
})();
export const { greeting, score, steps, userPanel, install } = __R["user-panel"].ns;
export default __R["user-panel"].ns;
