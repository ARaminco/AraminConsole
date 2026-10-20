/* AraminConsole demo — runtime for the standalone pages (demo/auth/*.html, demo/errors/*.html).
   Loads the demo dictionaries, wires the corner language/theme toggles and the per-page demo
   behaviour (selected by <body data-page>). Demo only: any valid input is accepted, nothing is sent
   (OTP: 123456 is right, any other code is wrong; login: password 000000 is rejected).
   Motion: WAAPI with a reduced-motion twin that keeps colour / opacity (the OS "animations off" setting
   must still show fades); travel, scale and parallax are dropped there. */
import { AC } from '../dist/aramin-console.js';

const { $, $$, on, i18n, theme, store } = AC;
const DASHBOARD = new URL('./#/dashboard', import.meta.url).href;
const page = document.body.dataset.page || '';
const reduced = () => AC.reducedMotion();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const go = (url) => { location.href = url; };
const tok = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
/** play(el, fullKeyframes, reducedKeyframes|null, options) → Animation|null */
const play = (el, full, soft, opts) => { const kf = reduced() ? soft : full; return el?.animate && kf ? el.animate(kf, opts) : null; };
const dirSign = () => (AC.isRTL() ? 1 : -1);

AC.ready(async () => {
  i18n.configure({ url: new URL('i18n/{lang}.json', import.meta.url).href.replace('%7Blang%7D', '{lang}') });
  await i18n.set(store.get('ac:lang', 'fa'));
  syncThemeColor();
  brandEntrance();
  parallax();
  (PAGES[page] || (() => {}))();
});

/* ------------------------------------------------------------------ corner tools (language: <div data-ac="langpicker">) */
function syncThemeColor() {
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--ac-bg').trim() || meta.content;
}
on(document, 'click', '[data-action="theme"]', () => theme.toggle());
on(document, 'ac:theme:change', () => requestAnimationFrame(syncThemeColor));
on(document, 'click', '[data-action="back"]', (e) => {
  if (history.length > 1 && document.referrer && new URL(document.referrer).origin === location.origin) { e.preventDefault(); history.back(); }
});
on(document, 'click', '[data-action="reload"]', () => location.reload());

/* ------------------------------------------------------------------ shared motion */
/** Brand mark: the "A" draws itself while the orange disc springs in (CSS does the disc; we give paths a unit length). */
function brandEntrance() {
  $$('.sa-top .ac-brand__mark path').forEach((p) => p.setAttribute('pathLength', '1'));
  document.documentElement.classList.add('sa-ready');
}

/** Showcase panel: the floating mini dashboard tilts toward the pointer (spring-smoothed, desktop + full motion only). */
function parallax() {
  const stage = $('.show-stage'); const mini = $('.mini', stage || document);
  if (!stage || !mini || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let tx = 0; let ty = 0; let x = 0; let y = 0; let raf = 0;
  const tick = () => {
    x += (tx - x) * 0.09; y += (ty - y) * 0.09;
    mini.style.setProperty('--px', x.toFixed(4)); mini.style.setProperty('--py', y.toFixed(4));
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const aside = stage.closest('.ac-auth__aside') || stage;
  on(aside, 'pointermove', (e) => {
    if (reduced()) return;
    const r = aside.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2; kick();
  });
  on(aside, 'pointerleave', () => { tx = 0; ty = 0; kick(); });
}

/** Direction-aware shake (first move toward the inline-start edge) + vibration; reduced = a red wash. */
function shake(el) {
  AC.haptic?.([30, 40, 30]);
  const s = dirSign();
  play(el, [0, 12, -9, 6, -3, 0].map((v, i) => ({ transform: `translateX(${s * v}px)`, offset: i / 5, easing: 'ease-in-out' })),
    [{ boxShadow: `0 0 0 0 ${tok('--ac-danger')}` }, { boxShadow: `0 0 0 3px ${tok('--ac-danger-soft')}` }, { boxShadow: '0 0 0 0 transparent' }],
    { duration: 440 });
}

/** Submit button morph: pill → circle with a spinner → green circle with a drawn check (or back to a pill). */
const MORPH = '<span class="auth-morph" aria-hidden="true"><svg class="auth-morph__spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" pathLength="1"/></svg><svg class="auth-morph__check" viewBox="0 0 24 24"><path d="M5.5 12.5l4.2 4.2 8.8-9.4" pathLength="1"/></svg></span>';
function morph(btn) {
  if (!btn) return { loading() {}, async done() {}, reset() {} };
  if (!$('.auth-morph', btn)) btn.insertAdjacentHTML('beforeend', MORPH);
  return {
    loading() {
      btn.style.setProperty('--_w', `${btn.offsetWidth}px`);
      btn.dataset.state = 'loading';
    },
    async done() {
      btn.dataset.state = 'done';
      AC.haptic?.(12);
      const path = $('.auth-morph__check path', btn);
      const a = path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 340, delay: 120, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'backwards' });
      play(btn, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)', offset: 0.5 }, { transform: 'scale(1)' }], null, { duration: 420, easing: 'ease-out' });
      await a.finished.catch(() => {});
      await wait(220);
    },
    reset() { delete btn.dataset.state; },
  };
}

/** Demo submit: morph the button, wait, then check() (false = rejected) and continue. */
function onSubmit(form, then, { check, delay = 850 } = {}) {
  on(form, 'ac:form:submit', (e) => {
    const btn = e.detail.submitter?.classList.contains('auth-submit') ? e.detail.submitter : $('.auth-submit', form);
    const m = morph(btn);
    m.loading();
    e.detail.waitUntil(wait(delay).then(async () => {
      const ok = check ? await check(e.detail.values, m) : true;
      if (!ok) { m.reset(); return; }
      await m.done();
      await then(e.detail.values, m);
    }));
  });
  on(form, 'ac:form:invalid', () => AC.haptic?.([20, 30, 20]));
}

/** Resend countdown with an animated ring: <p class="auth-timer"><span class="auth-timer__dial"><svg…><circle class="v"/></svg><bdi data-timer-left/></span>… */
function countdown(box, seconds = 60) {
  if (!box) return;
  const btn = $('[data-timer-resend]', box);
  const out = $('[data-timer-left]', box);
  const ring = $('.auth-timer__ring .v', box);
  let left = seconds; let t; let anim;
  const tick = () => {
    out.textContent = AC.format.number(left);
    btn.disabled = left > 0;
    box.dataset.state = left > 0 ? 'wait' : 'ready';
    $('[data-timer-wait]', box).hidden = left <= 0;
    if (left <= 0) play(btn, [{ transform: 'scale(0.9)', opacity: 0.4 }, { transform: 'scale(1)', opacity: 1 }], [{ opacity: 0.4 }, { opacity: 1 }], { duration: 360, easing: tok('--ac-spring-bounce') || 'ease-out' });
    if (left-- > 0) t = setTimeout(tick, 1000);
  };
  const start = () => {
    anim?.cancel();
    // one continuous linear sweep: smooth in every motion mode (it is a clock, not decoration)
    anim = ring?.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: 1 }], { duration: seconds * 1000, easing: 'linear', fill: 'forwards' });
    tick();
  };
  on(btn, 'click', () => {
    clearTimeout(t); left = seconds; start();
    AC.toast?.({ title: AC.t('auth.codeSent', 'کد دوباره فرستاده شد'), tone: 'success' });
  });
  on(document, 'ac:i18n:change', () => { out.textContent = AC.format.number(Math.max(left + 1, 0)); });
  start();
}

/* ------------------------------------------------------------------ pages */
const PAGES = {
  login() {
    const form = $('#login-form');
    // email / mobile tabs (segmented): only the visible panel is validated and submitted
    const setMode = (mode) => {
      for (const p of $$('[data-login-panel]', form)) {
        const on_ = p.dataset.loginPanel === mode;
        p.hidden = !on_;
        $$('input', p).forEach((i) => { i.disabled = !on_; });
        if (on_) play(p, [{ opacity: 0, transform: `translateX(${-dirSign() * 10}px)` }, { opacity: 1, transform: 'none' }], [{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
      }
    };
    on(form, 'ac:segmented:change', (e) => { setMode(e.detail.value); $(`[data-login-panel="${e.detail.value}"] input`, form)?.focus(); });
    setMode('email');
    onSubmit(form, () => go(DASHBOARD), {
      check: (v) => {
        if (v.password !== '000000') return true;
        AC.instance(form, 'form')?.setErrors?.({ password: AC.t('auth.wrongPassword', 'رمز عبور اشتباه است') });
        shake($('.auth-card'));
        return false;
      },
    });
  },
  register() {
    const form = $('#register-form');
    const steps = $('.auth-steps');
    const fields = $$('[data-ac-rules]', form);
    const fill = $('.auth-steps__fill', steps);
    const progress = () => {
      const okN = fields.filter((f) => (f.type === 'checkbox' ? f.checked : f.value.trim() && f.checkValidity() && !f.closest('[data-invalid]'))).length;
      const p = okN / fields.length;
      fill?.style.setProperty('--p', p.toFixed(3));
      steps?.style.setProperty('--p', p.toFixed(3));
      $('[data-steps-pct]', steps).textContent = `${Math.round(p * 100)}%`;
    };
    on(form, 'input', progress); on(form, 'change', progress); on(form, 'focusout', () => setTimeout(progress));
    progress();
    onSubmit(form, async (v) => {
      // step 2 lights up before we move on to the code page
      steps?.querySelector('[data-step="1"]')?.setAttribute('data-state', 'done');
      steps?.querySelector('[data-step="2"]')?.setAttribute('data-state', 'current');
      await wait(450);
      go(`otp.html?to=${encodeURIComponent(v.mobile || '')}`);
    });
  },
  forgot() {
    const form = $('#forgot-form');
    const env = $('.auth-envelope');
    onSubmit(form, async (v) => {
      // the letter slides in, the flap closes, the envelope flies off; then the success panel
      env?.classList.add('is-sending');
      await envelopeSend(env);
      $('[data-forgot-to]').textContent = v.email;
      form.hidden = true;
      const done = $('#forgot-done');
      done.hidden = false;
      const badge = $('.auth-success__badge', done);
      play(badge, [{ transform: 'scale(0.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], [{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: tok('--ac-spring-bounce') || 'ease-out' });
      const tick = $('path', badge.querySelector('.auth-success__tick') || badge);
      tick?.animate?.([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 380, delay: 220, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'backwards' });
      env?.classList.remove('is-sending');
      env?.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      env?.classList.add('is-sent');
      $('a, button', done)?.focus();
    }, { delay: 500 });
  },
  otp() {
    const to = new URLSearchParams(location.search).get('to');
    if (to && /^[\d+\s-]{8,16}$/.test(to)) $$('[data-otp-to]').forEach((el) => { el.textContent = to; });
    const form = $('#otp-form');
    const box = $('.ac-otp', form);
    const otp = () => AC.instance(box, 'otp');
    let busy = false;
    on(box, 'ac:otp:complete', () => { if (!busy) form.requestSubmit($('[type="submit"]', form)); });
    onSubmit(form, async () => { await wait(350); go(DASHBOARD); }, {
      delay: 600,
      check: async (v) => {
        busy = true;
        if (v.code === '123456') { await otp()?.success(); busy = false; return true; }
        otp()?.error({ clear: true });
        busy = false;
        return false;
      },
    });
    countdown($('.auth-timer'), 59);
  },
  lock() {
    const clock = $('[data-clock]');
    const paint = () => {
      const d = new Date();
      clock.textContent = new Intl.DateTimeFormat(i18n.numberLocale, { hour: '2-digit', minute: '2-digit' }).format(d);
      $('[data-date]').textContent = AC.format.date(d, { dateStyle: 'full' });
    };
    paint();
    setInterval(paint, 15000);
    on(document, 'ac:i18n:change', paint);
    onSubmit($('#lock-form'), async () => {
      // shackle opens, the ring glows green, the card dissolves
      const lock = $('.auth-lockbadge');
      lock?.classList.add('is-open');
      play($('.auth-lockbadge__shackle', lock), [{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-3.5px) rotate(0)', offset: 0.45 }, { transform: 'translateY(-3.5px) rotate(-28deg)' }], null, { duration: 520, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' });
      $('.auth-lock__avatar')?.classList.add('is-unlocked');
      await wait(560);
      const card = $('.auth-card');
      await play(card, [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(0.96)', filter: 'blur(4px)' }], [{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease-in', fill: 'forwards' })?.finished;
      go(DASHBOARD);
    });
  },
  offline() {
    // where to go back to: ?from=<same-origin url> (set by the service worker), else the dashboard
    let from = DASHBOARD;
    try {
      const f = new URL(new URLSearchParams(location.search).get('from') || '', location.href);
      if (f.origin === location.origin && !/\/errors\/offline\.html$/.test(f.pathname)) from = f.href;
    } catch { /* keep dashboard */ }
    const status = $('[data-net-status]');
    const paint = () => {
      const up = navigator.onLine;
      status.dataset.tone = up ? 'success' : '';
      status.textContent = up ? AC.t('errpage.online', 'دوباره آنلاین شدید') : AC.t('errpage.offlineBadge', 'بدون اتصال');
    };
    on(window, 'online', () => { paint(); setTimeout(() => go(from), 600); });
    on(window, 'offline', paint);
    on(document, 'ac:i18n:change', paint);
    on($('[data-action="retry"]'), 'click', async (e) => {
      const btn = e.currentTarget;
      btn.setAttribute('aria-busy', 'true');
      $('.err-box')?.classList.add('is-retrying');
      try { await fetch(from, { cache: 'no-store', method: 'HEAD' }); go(from); } catch {
        await wait(900);
        btn.removeAttribute('aria-busy');
        $('.err-box')?.classList.remove('is-retrying');
        AC.toast?.({ title: AC.t('errpage.stillOffline', 'هنوز به اینترنت وصل نیستید'), tone: 'warning' });
      }
    });
    paint();
  },
  maintenance() {
    // demo ETA: a fixed window that starts when the page is opened
    const end = Date.now() + 42 * 60 * 1000;
    const out = $('[data-eta]');
    const paint = () => {
      const m = Math.max(0, Math.round((end - Date.now()) / 60000));
      out.textContent = AC.format.number(m);
    };
    paint(); setInterval(paint, 30000); on(document, 'ac:i18n:change', paint);
  },
};

/** Forgot page: letter into the envelope → flap closes → envelope flies off toward the inline-end edge. */
async function envelopeSend(env) {
  if (!env?.animate) return wait(300);
  const letter = $('.auth-envelope__letter', env); const flap = $('.auth-envelope__flap', env); const body = $('.auth-envelope__body', env);
  const x = -dirSign() * 46;
  if (reduced()) {
    letter?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' });
    flap?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, delay: 120, fill: 'both' });
    await body.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 360, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
    return;
  }
  letter?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(9px)' }], { duration: 260, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'forwards' });
  flap?.animate([{ transform: 'scaleY(-1)', opacity: 0 }, { transform: 'scaleY(1)', opacity: 1 }], { duration: 240, delay: 200, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'both' });
  $$('.auth-envelope__trail i', env).forEach((t, i) => t.animate([{ opacity: 0, transform: 'scaleX(0.2)' }, { opacity: 1, transform: 'scaleX(1)', offset: 0.4 }, { opacity: 0, transform: 'scaleX(1)' }], { duration: 420, delay: 470 + i * 50, easing: 'ease-out' }));
  await body.animate([
    { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
    { transform: `translate(${-x * 0.12}px, 4px) rotate(${dirSign() * 6}deg)`, opacity: 1, offset: 0.25 },
    { transform: `translate(${x}px, -30px) rotate(${-dirSign() * 14}deg) scale(0.7)`, opacity: 0 },
  ], { duration: 560, delay: 430, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' }).finished.catch(() => {});
}
