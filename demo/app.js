/* AraminConsole demo — hash router, nav state, palette commands, theme/lang toggles, PWA.
   Pages are HTML fragments in demo/pages/<name>.html. A fragment whose root has
   data-script loads demo/pages/<name>.js too: `export default function mount(root, AC) { return () => {} }`. */
// the demo ships a custom build (demo/aramin.config.json: shell, overlays, customizer, langpicker, pwa, notify);
// every page lazy-loads the modules it uses through AC.use() — see pageModules() and docs/modules.md
import { AC } from '../dist/demo/aramin-console.min.js';

const { $, $$, on, i18n, theme, palette, store } = AC;
const content = $('#ac-content');
const cache = new Map();
const scrollPos = new Map();
const LANGS = ['fa', 'en', 'ar'];
let current = null;
let unmount = null;
let navToken = 0;

AC.ready(async () => {
  i18n.configure({ url: new URL('i18n/{lang}.json', import.meta.url).href.replace('%7Blang%7D', '{lang}') });
  await i18n.set(store.get('ac:lang', 'fa'));
  registerCommands();
  on(window, 'hashchange', route);
  on(document, 'ac:i18n:change', () => { updateNav(current); registerCommands(); setTitle(); });
  route();
});

/* ------------------------------------------------------------------ router */
function pageName() {
  const h = location.hash.replace(/^#\/?/, '').split(/[?#]/)[0];
  return h || 'dashboard';
}

async function load(name) {
  if (cache.has(name)) return cache.get(name);
  try {
    const res = await fetch(`pages/${encodeURIComponent(name)}.html`, { cache: 'no-cache' });
    if (!res.ok) return null;
    const html = await res.text();
    cache.set(name, html);
    return html;
  } catch { return null; }
}

function comingSoon(name) {
  const link = $(`.ac-rail__link[href="#/${name}"] .ac-rail__text`);
  const title = link?.textContent.trim() || name;
  return `<section class="ac-page">
    <header class="ac-page-head" data-ac="largetitle"><div class="ac-page-head__titles"><h1 class="ac-page-head__title">${AC.escapeHtml(title)}</h1></div></header>
    <div class="ac-card"><div class="ac-empty">
      <div class="ac-empty__art">${AC.icon('rocket')}</div>
      <h2 class="ac-empty__title" data-i18n="soon.title">به‌زودی</h2>
      <p class="ac-empty__text" data-i18n="soon.text">این صفحه در حال ساخت است و در نسخهٔ بعدی اضافه می‌شود.</p>
      <div class="ac-empty__actions"><a class="ac-btn ac-btn--primary" href="#/dashboard" data-i18n="soon.back">بازگشت به داشبورد</a>
      <a class="ac-btn" href="#/components" data-i18n="nav.components">کامپوننت‌ها</a></div>
    </div></div></section>`;
}

async function route() {
  const name = pageName();
  const token = ++navToken;
  if (current) scrollPos.set(current, scrollY);
  // answer the click at once: nav pills / tab bar start moving before the page is fetched
  for (const a of $$('.ac-topnav__link[href], .ac-tabbar__item[href]')) a.toggleAttribute('aria-current', a.getAttribute('href') === `#/${name}`) && a.setAttribute('aria-current', 'page');
  const early = AC.use(pageModules(name)).catch(() => {}); // modules known from the build's page map start with the fetch
  const html = (await load(name)) ?? comingSoon(name);
  await Promise.all([early, AC.use(pageModules(name, html)).catch((err) => console.warn('[demo] module load failed', err))]);
  if (token !== navToken) return;

  const swap = async () => {
    unmount?.(); unmount = null;
    content.innerHTML = html;
    i18n.translate(content);
    current = name;
    updateNav(name);
    setTitle();
    const restore = scrollPos.get(name);
    window.scrollTo({ top: restore ?? 0, behavior: 'instant' });
    const rootEl = content.firstElementChild;
    // Reel-style intro: cards show a shimmer for a beat, then their content fades up (first visit only).
    if (rootEl && !restore && document.documentElement.dataset.motion !== 'reduced') {
      rootEl.classList.add('is-loading');
      setTimeout(() => rootEl.classList.remove('is-loading'), 520);
    }
    if (rootEl?.hasAttribute('data-script')) {
      try {
        const mod = await import(`./pages/${name}.js`);
        const r = mod.default?.(rootEl, AC);
        if (typeof r === 'function') unmount = r;
      } catch (err) { console.error('[demo] page script failed', err); }
    }
  };

  // View Transitions only on desktop pointers: on phones (notably WebKit/iOS) tall page snapshots get stuck mid-slide.
  const vtOK = document.startViewTransition && matchMedia('(min-width: 1024px) and (pointer: fine)').matches && !/iP(hone|ad|od)|CriOS|FxiOS/.test(navigator.userAgent);
  if (vtOK && document.documentElement.dataset.motion !== 'off' && current !== null) { // reduced motion: same transition, fade only
    // only the page content transitions (direction follows the nav order); the chrome stays live
    await AC.motion.navigate(swap, { from: current, to: name });
  } else {
    await swap();
    content.classList.remove('ac-page-enter');
    void content.offsetWidth;
    content.classList.add('ac-page-enter');
    content.addEventListener('animationend', () => content.classList.remove('ac-page-enter'), { once: true });
  }
  if (document.activeElement && document.activeElement !== document.body && !content.contains(document.activeElement) && !document.activeElement.closest('.ac-rail, .ac-dock, .ac-tabbar, .ac-appbar')) content.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ lazy modules per page */
// build-time map (dist/demo bundle: __AC_MODS__.__pages) + what the fragment itself declares (data-ac, data-ac-*, data-modules)
function pageModules(name, html) {
  const need = new Set(globalThis.__AC_MODS__?.__pages?.[name] || []);
  if (html) {
    const components = [...html.matchAll(/data-ac="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
    const attrs = [...html.matchAll(/data-(ac-[a-z][\w-]*)/g)].map((m) => m[1]);
    const classes = [...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((x) => x.startsWith('ac-')).map((x) => x.replace(/(__|--).*$/, ''));
    AC.use.providers({ components, attrs, classes }).forEach((n) => need.add(n));
    (html.match(/data-modules="([^"]+)"/)?.[1] || '').split(/[\s,]+/).filter(Boolean).forEach((n) => need.add(n));
  }
  return [...need]; // AC.use() is idempotent and also waits for any stylesheet still in flight
}
// warm the next page's modules on hover / focus of a nav link
on(document, 'pointerover', 'a[href^="#/"]', (e, a) => { const n = pageModules(a.getAttribute('href').slice(2)); if (n.length) AC.use.preload(n); });

/* ------------------------------------------------------------------ nav state */
function updateNav(name) {
  if (!name) return;
  const href = `#/${name}`;
  for (const a of $$('.ac-rail__link[href], .ac-tabbar__item[href], .ac-topnav__link[href], .ac-dock__btn[href]')) {
    if (a.getAttribute('href') === href) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  const link = $(`.ac-rail__link[href="${href}"]`);
  const sub = link?.closest('details');
  if (sub) sub.open = true;

  // breadcrumbs: group › (sub) › page
  const crumbs = $('#ac-crumbs');
  if (crumbs) {
    const parts = [];
    const group = link?.closest('.ac-rail__group')?.querySelector('.ac-rail__label')?.textContent.trim();
    if (group) parts.push(`<li><span>${AC.escapeHtml(group)}</span></li>`);
    if (sub) parts.push(`<li><span>${AC.escapeHtml(sub.querySelector('summary .ac-rail__text').textContent.trim())}</span></li>`);
    parts.push(`<li><span aria-current="page">${AC.escapeHtml(pageTitle())}</span></li>`);
    crumbs.innerHTML = parts.join('');
  }
}

function pageTitle() {
  return $('.ac-page-head__title', content)?.textContent.trim()
    || $(`.ac-rail__link[href="#/${current}"] .ac-rail__text`)?.textContent.trim()
    || 'AraminConsole';
}
function setTitle() {
  const t = pageTitle();
  document.title = `${t} · AraminConsole`;
  const small = $('#ac-appbar-title');
  if (small && !$('[data-ac~="largetitle"]', content)) small.textContent = t;
}

/* ------------------------------------------------------------------ palette commands */
function registerCommands() {
  const cmds = [];
  for (const a of $$('.ac-rail__nav .ac-rail__link[href]')) {
    const text = a.querySelector('.ac-rail__text');
    const iconId = (a.querySelector('use')?.getAttribute('href') || a.closest('details')?.querySelector('summary use')?.getAttribute('href') || '#i-arrow-right').slice(3);
    const group = a.closest('.ac-rail__group')?.querySelector('.ac-rail__label')?.textContent.trim();
    cmds.push({
      id: `go:${a.getAttribute('href')}`,
      title: text.textContent.trim(),
      hint: group,
      group: i18n.t('palette.pages', 'صفحه‌ها'),
      icon: iconId,
      keywords: [a.getAttribute('href').replace(/^#\/|\.html$/g, '')],
      href: new URL(a.getAttribute('href'), location.href).href,
    });
  }
  const act = i18n.t('palette.actions', 'دستورها');
  cmds.push(
    { id: 'theme:toggle', title: i18n.t('cmd.theme', 'تغییر حالت روشن / تیره'), icon: 'moon', group: act, keywords: ['dark', 'light', 'theme'], shortcut: 'Shift D', run: () => theme.toggle() },
    { id: 'rail:toggle', title: i18n.t('cmd.rail', 'همهٔ صفحه‌ها'), icon: 'layout-grid', group: act, keywords: ['sidebar', 'rail', 'menu', 'pages'], run: () => AC.rail.open() },
    { id: 'density:toggle', title: i18n.t('cmd.density', 'تراکم: فشرده / راحت'), icon: 'sliders-horizontal', group: act, keywords: ['density', 'compact'], run: () => theme.set({ density: theme.get().density === 'compact' ? 'comfortable' : 'compact' }) },
    ...LANGS.map((l) => ({ id: `lang:${l}`, title: { fa: 'فارسی', en: 'English', ar: 'العربية' }[l], hint: i18n.t('cmd.language', 'زبان'), icon: 'languages', group: act, keywords: ['language', 'lang', l], run: () => i18n.set(l) })),
    ...theme.accents.map((c) => ({ id: `accent:${c}`, title: `${i18n.t('cmd.accent', 'رنگ اصلی')}: ${c}`, icon: 'palette', group: act, keywords: ['accent', 'color', c], run: () => theme.set({ accent: c }) })),
    ...['sharp', 'default', 'round'].map((r) => ({ id: `radius:${r}`, title: `${i18n.t('cmd.radius', 'گردی گوشه‌ها')}: ${r}`, icon: 'component', group: act, keywords: ['radius', r], run: () => theme.set({ radius: r }) })),
  );
  palette.clear();
  palette.add(cmds);
}

/* ------------------------------------------------------------------ shell actions */
on(document, 'click', '[data-action="theme"]', () => theme.toggle());
on(document, 'click', '[data-action="lang"]', () => {
  const next = LANGS[(LANGS.indexOf(i18n.lang) + 1) % LANGS.length];
  i18n.set(next);
});
on(document, 'keydown', (e) => {
  if (e.shiftKey && (e.key === 'D' || e.key === 'd') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input, textarea, select, [contenteditable="true"]')) theme.toggle();
});
// demo: segmented range on dashboard just re-animates counters
on(document, 'ac:segmented:change', (e) => {
  const page = e.target.closest('[data-page="dashboard"]');
  if (!page) return;
  const factor = { day: 0.12, week: 0.4, month: 1, year: 11.6 }[e.detail.value] ?? 1;
  for (const c of $$('[data-ac~="counter"][data-base]', page)) c.dataset.to = String(Math.round(Number(c.dataset.base) * factor));
});
on(document, 'ac:pull-refresh:refresh', (e) => {
  e.detail.waitUntil(new Promise((r) => setTimeout(r, 900)));
});

/* ------------------------------------------------------------------ PWA */
// Skipped on localhost (stale caches while developing) unless localStorage['ac:sw'] = '1'.
const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
// AC.pwa (src/modules/pwa): update toast + skipWaiting on accept, offline/online toasts, outbox, app badge = unread count.
if ('serviceWorker' in navigator && location.protocol !== 'file:' && (!isLocal || store.get('ac:sw') === 1 || store.get('ac:sw') === '1')) {
  addEventListener('load', () => AC.pwa.register('sw.js'));
} else if ('serviceWorker' in navigator && isLocal) {
  // developing: drop any worker / cache left from an earlier opt-in so old dist files can't be served
  navigator.serviceWorker.getRegistrations?.().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {});
  globalThis.caches?.keys().then((keys) => keys.filter((k) => k.startsWith('ac-demo')).forEach((k) => caches.delete(k))).catch(() => {});
}

// install invitation: after the second visit and ~25 s of use, once the browser offers it (or on iOS Safari); snoozed 7 days on "Not now"
AC.pwa.splash(); // standalone launches only: the app mark fades out once the shell is ready
AC.ready(() => {
  // Web Share Target (manifest share_target → GET ./?share_title&share_text&share_url)
  const q = new URLSearchParams(location.search);
  if (q.has('share_title') || q.has('share_text') || q.has('share_url')) {
    AC.notify({ variant: 'card', icon: 'share-2', tone: 'accent', title: q.get('share_title') || AC.t('share.received', 'Shared with Aramin'), text: [q.get('share_text'), q.get('share_url')].filter(Boolean).join(' · '), duration: 0 });
    history.replaceState(null, '', location.pathname + location.hash);
  }
  if (!isLocal || store.get('ac:install-auto')) AC.install.auto({ minVisits: 2, minSeconds: 25, snoozeDays: 7 });
});
