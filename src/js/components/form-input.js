/* Inputs: field group (clear + counter + floating label), password (toggle + strength),
   number stepper, OTP/PIN, range (RTL-aware fill + bubble), rating, colour swatches.

   <div class="ac-input-group" data-ac="input" [data-clear] [data-counter]>
     [<span class="ac-input-group__affix">…</span>] <input class="ac-input" maxlength="40"> [affix]
   </div>
   Floating label: add .ac-float and put <label> right after the input (placeholder is set to " ").
   <div class="ac-input-group" data-ac="password" [data-strength] [data-checklist] [data-caps="false"]><input class="ac-input" type="password"></div>
   (blink on show/hide, caps-lock warning slides in, strength segments spring-fill, checklist ticks draw)
   <div class="ac-number" data-ac="number"><input class="ac-input" type="number" min max step></div>
   <div class="ac-otp" data-ac="otp" data-length="6" data-name="code" [data-mask]></div>   → ac:otp:complete {value}
     API .error({clear}) (shake + tint + vibrate → ac:otp:error) · .success() (green wave → check, → ac:otp:success) · .reset() · .fill(text)
   <input class="ac-range" type="range" data-ac="range" [data-bubble] [data-suffix="%"]>
   <div class="ac-rating" data-ac="rating" data-name="score" data-value="3" [data-max="5"] [data-readonly]></div> → ac:rating:change
   <div class="ac-swatches" data-ac="swatches" data-name="color" data-colors="#6d4aff,#2563eb" data-value="#2563eb" [data-custom]></div> → ac:swatches:change */
import { register, on, emit, uid, icon, instance, isRTL, options, h, clamp, reducedMotion, haptic } from '../core.js';
import { ft, latin, fire } from './form-core.js';

const field = (el) => el.querySelector('input:not([type=hidden]), textarea, select');

/* ---------------------------------------------------------------- input group */
register('input', (el) => {
  const input = field(el); if (!input) return;
  const o = options(el, { clear: false, counter: false });
  const offs = [];
  if (el.classList.contains('ac-float') && !input.getAttribute('placeholder')) input.setAttribute('placeholder', ' ');
  let clearBtn; let count;
  const sync = () => {
    const v = input.value;
    if (clearBtn) clearBtn.hidden = !v || input.disabled || input.readOnly;
    if (count) {
      const max = input.maxLength > 0 ? input.maxLength : 0;
      count.textContent = max ? `${v.length}/${max}` : String(v.length);
      count.toggleAttribute('data-full', max && v.length >= max);
    }
  };
  if (o.clear) {
    clearBtn = h('button', { type: 'button', class: 'ac-input-group__btn', 'aria-label': ft('clear'), html: icon('x') });
    const anchor = el.querySelector(':scope > .ac-input-group__affix:last-child');
    anchor && anchor !== el.firstElementChild ? el.insertBefore(clearBtn, anchor) : el.append(clearBtn);
    offs.push(on(clearBtn, 'click', () => { input.value = ''; fire(input); input.focus(); sync(); }));
  }
  if (o.counter) {
    count = h('span', { class: 'ac-input-group__count ac-num', 'aria-live': 'polite' });
    el.append(count);
    if (input.tagName === 'TEXTAREA') el.setAttribute('data-multiline', '');
  }
  offs.push(on(input, 'input', sync), on(input.form || document, 'reset', () => setTimeout(sync)));
  offs.push(on(document, 'ac:i18n:change', () => clearBtn?.setAttribute('aria-label', ft('clear'))));
  sync();
  return () => { offs.forEach((f) => f()); clearBtn?.remove(); count?.remove(); };
});

/* ---------------------------------------------------------------- password */
export function passwordScore(v) {
  if (!v) return -1;
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^\w\s]/.test(v)) s++;
  if (v.length < 6) s = Math.min(s, 1);
  return Math.min(4, s);
}

/* motion helpers for the password / OTP feedback: WAAPI (not affected by the reduced-motion transition policy), so
   "reduced" still gets the colour / opacity half of every animation — only travel and scale are dropped. */
const tok = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();
const play = (el, full, soft, opts) => {
  if (!el?.animate) return null;
  const kf = reducedMotion() ? soft : full;
  return kf ? el.animate(kf, opts) : null;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const PASSWORD_RULES = [
  ['len', (v) => v.length >= 8],
  ['case', (v) => /[a-z]/.test(v) && /[A-Z]/.test(v)],
  ['digit', (v) => /\d/.test(v)],
  ['symbol', (v) => /[^\w\s]/.test(v)],
];
const RULE_MARK = '<svg class="ac-pwrules__mark" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.25" pathLength="1"/><path d="M6.3 10.3l2.5 2.5 4.9-5.1" pathLength="1"/></svg>';

register('password', (el) => {
  const input = field(el); if (!input) return;
  const o = options(el, { strength: false, checklist: false, caps: true });
  const btn = h('button', { type: 'button', class: 'ac-input-group__btn ac-pw-toggle', 'aria-pressed': 'false' });
  el.append(btn);
  let meter; let label; let rules; let caps;
  const added = [];
  let anchor = el;
  const place = (node) => { anchor.after(node); anchor = node; added.push(node); return node; };
  const setIcon = () => {
    const shown = input.type === 'text';
    btn.innerHTML = icon(shown ? 'eye-off' : 'eye');
    btn.setAttribute('aria-label', ft(shown ? 'hide' : 'show'));
    btn.setAttribute('aria-pressed', String(shown));
  };
  const paint = () => {
    const v = input.value;
    if (meter) {
      const s = passwordScore(v);
      if (meter.dataset.score !== String(s)) {
        meter.dataset.score = String(s);
        label.textContent = s < 0 ? '' : ft(`s${s}`);
        if (s >= 0) play(label, [{ opacity: 0, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
      }
    }
    if (rules) for (const [k, test] of PASSWORD_RULES) rules.querySelector(`[data-rule="${k}"]`).toggleAttribute('data-met', !!v && test(v));
  };
  const words = () => {
    setIcon();
    if (rules) for (const [k] of PASSWORD_RULES) rules.querySelector(`[data-rule="${k}"] span`).textContent = ft(`r.${k}`);
    if (caps) caps.querySelector('span').textContent = ft('caps');
    if (label) label.textContent = meter.dataset.score === '-1' ? '' : ft(`s${meter.dataset.score}`);
  };
  if (o.caps) {
    caps = place(h('p', { class: 'ac-capslock', role: 'status', 'aria-live': 'polite' }));
    caps.innerHTML = `<span class="ac-capslock__inner">${icon('arrow-up')}<span></span></span>`;
  }
  if (o.strength) {
    const id = uid('pw');
    meter = place(h('div', { class: 'ac-strength', 'data-score': '-1' }, h('span'), h('span'), h('span'), h('span'), label = h('small', { id, 'aria-live': 'polite' })));
    input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
  }
  if (o.checklist) {
    rules = place(h('ul', { class: 'ac-pwrules' }));
    rules.innerHTML = PASSWORD_RULES.map(([k]) => `<li data-rule="${k}">${RULE_MARK}<span></span></li>`).join('');
  }
  const setCaps = (e) => { if (caps && e.getModifierState) caps.toggleAttribute('data-on', e.getModifierState('CapsLock')); };
  const offs = [
    on(btn, 'click', () => {
      const svg = () => btn.querySelector('svg');
      // eye "blink": lid closes (scaleY), the icon swaps while closed, lid opens; reduced = crossfade
      play(svg(), [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.08)' }], [{ opacity: 1 }, { opacity: 0 }], { duration: 110, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' });
      setTimeout(() => {
        input.type = input.type === 'password' ? 'text' : 'password';
        setIcon();
        play(svg(), [{ transform: 'scaleY(0.08)' }, { transform: 'scaleY(1)' }], [{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
      }, reducedMotion() ? 90 : 100);
      input.focus();
    }),
    on(input, 'input', paint),
    on(input, 'keydown', setCaps), on(input, 'keyup', setCaps),
    on(input, 'blur', () => caps?.removeAttribute('data-on')),
    on(document, 'ac:i18n:change', words),
  ];
  words(); paint();
  return () => { offs.forEach((f) => f()); btn.remove(); added.forEach((n) => n.remove()); };
});

/* ---------------------------------------------------------------- number stepper */
register('number', (el) => {
  const input = field(el); if (!input) return;
  input.classList.add('ac-num');
  const mk = (dir) => h('button', { type: 'button', class: 'ac-number__btn', tabindex: '-1', 'data-dir': dir, 'aria-label': ft(dir > 0 ? 'increase' : 'decrease'), html: icon(dir > 0 ? 'plus' : 'minus') });
  const dec = el.querySelector('[data-dir="-1"]') || el.insertBefore(mk(-1), el.firstChild);
  const inc = el.querySelector('[data-dir="1"]') || el.appendChild(mk(1));
  const num = (k) => (input[k] === '' || input[k] == null ? null : Number(input[k]));
  const step = () => Number(input.step) || 1;
  const decimals = () => (String(step()).split('.')[1] || '').length;
  function bump(dir) {
    if (input.disabled || input.readOnly) return;
    let v = Number(latin(input.value)) || 0;
    v = Number((v + dir * step()).toFixed(decimals()));
    const min = num('min'); const max = num('max');
    if (min != null) v = Math.max(min, v);
    if (max != null) v = Math.min(max, v);
    if (String(v) !== input.value) { input.value = v; fire(input); }
    state();
  }
  function state() {
    const v = Number(input.value); const min = num('min'); const max = num('max');
    dec.disabled = input.disabled || (min != null && v <= min);
    inc.disabled = input.disabled || (max != null && v >= max);
  }
  let timer = 0; let delay = 0;
  const stop = () => { clearTimeout(timer); timer = 0; };
  const start = (dir) => {
    bump(dir); delay = 380;
    const tick = () => { bump(dir); delay = Math.max(50, delay * 0.8); timer = setTimeout(tick, delay); };
    timer = setTimeout(tick, delay);
  };
  const offs = [
    on(el, 'pointerdown', '.ac-number__btn', (e, b) => { e.preventDefault(); input.focus({ preventScroll: true }); start(Number(b.dataset.dir)); }),
    on(window, 'pointerup', stop), on(window, 'pointercancel', stop), on(el, 'pointerleave', stop),
    on(el, 'click', '.ac-number__btn', (e) => { if (e.detail === 0) bump(Number(e.target.closest('[data-dir]').dataset.dir)); }),
    on(input, 'input', () => { const l = latin(input.value); if (l !== input.value) input.value = l; state(); }),
    on(input, 'keydown', (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); bump(e.key === 'ArrowUp' ? 1 : -1); } }),
  ];
  state();
  instance(el, 'number', { bump, get value() { return Number(input.value); } });
  return () => { stop(); offs.forEach((f) => f()); };
});

/* ---------------------------------------------------------------- OTP / PIN */
const OTP_DONE = '<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="ac-otp__done-fill" cx="26" cy="26" r="24"/><circle class="ac-otp__done-ring" cx="26" cy="26" r="24" pathLength="1"/><path class="ac-otp__done-check" d="M15.5 26.8l7 7 14-15.2" pathLength="1"/></svg>';
register('otp', (el) => {
  const o = options(el, { length: 6, name: 'otp', mask: false, numeric: true });
  const n = clamp(Number(o.length) || 6, 2, 12);
  el.setAttribute('dir', 'ltr');
  el.setAttribute('role', 'group');
  const hidden = h('input', { type: 'hidden', name: o.name });
  const boxes = Array.from({ length: n }, (_, i) => h('input', {
    class: 'ac-otp__box ac-num', type: o.mask ? 'password' : 'text', inputmode: o.numeric ? 'numeric' : 'text', maxlength: '1',
    autocomplete: i === 0 ? 'one-time-code' : 'off', 'aria-label': ft('digit', { n: i + 1 }), enterkeyhint: i === n - 1 ? 'done' : 'next',
  }));
  boxes.forEach((b, i) => b.style.setProperty('--i', i));
  el.replaceChildren(...boxes, hidden);
  const clean = (s) => { s = latin(s); return o.numeric ? s.replace(/\D/g, '') : s.replace(/\s/g, ''); };
  const value = () => boxes.map((b) => b.value).join('');
  let done = null;

  // typed digit: the box pops (reduced: an accent wash fades out)
  const pop = (b, delay = 0, lift = 0) => play(b,
    [{ transform: 'translateY(0) scale(1)' }, { transform: `translateY(${-lift}px) scale(1.12)`, offset: 0.35 }, { transform: 'translateY(0) scale(1)' }],
    [{ backgroundColor: tok('--ac-accent-soft') }, { backgroundColor: tok('--ac-surface-1') }],
    { duration: lift ? 420 : 300, delay, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });

  function settle() {
    if (!el.dataset.state) return;
    delete el.dataset.state;
    boxes.forEach((b) => { b.readOnly = false; b.getAnimations?.().forEach((a) => a.cancel()); });
    done?.remove(); done = null;
  }
  function commit() {
    const v = value();
    boxes.forEach((b) => b.toggleAttribute('data-filled', !!b.value));
    if (hidden.value !== v) { hidden.value = v; fire(hidden); }
    el.removeAttribute('aria-invalid');
    if (el.dataset.state === 'error') delete el.dataset.state;
    if (v.length === n) emit(el, 'otp:complete', { value: v });
  }
  function fill(from, text) {
    const chars = clean(text).split('');
    let i = from;
    for (const c of chars) { if (i >= n) break; boxes[i++].value = c; }
    // paste = a ripple wave across the boxes it filled
    if (chars.length > 1) for (let k = from; k < i; k++) pop(boxes[k], (k - from) * 55, 7);
    boxes[Math.min(i, n - 1)].focus();
    commit();
  }

  /** Wrong code: direction-aware shake + red tint + vibration. { clear: true } empties the boxes afterwards. */
  function error({ clear = false } = {}) {
    settle();
    el.dataset.state = 'error';
    el.setAttribute('aria-invalid', 'true');
    haptic([35, 45, 35]);
    const s = isRTL(document.documentElement) ? 1 : -1; // first move toward the inline-start edge
    play(el, [0, 12, -10, 7, -4, 2, 0].map((x, i) => ({ transform: `translateX(${s * x}px)`, offset: i / 6, easing: 'ease-in-out' })), null, { duration: 460 });
    const bad = tok('--ac-danger-soft'); const base = tok('--ac-surface-1');
    boxes.forEach((b, i) => b.animate?.([{ backgroundColor: base }, { backgroundColor: bad }, { backgroundColor: base }, { backgroundColor: bad }], { duration: 520, delay: i * 18, easing: 'ease-out' }));
    emit(el, 'otp:error', { value: value() });
    // clear without firing input/change: the field must not flash a "required" message while the user retypes
    if (clear) setTimeout(() => { boxes.forEach((b) => { b.value = ''; b.removeAttribute('data-filled'); }); hidden.value = ''; boxes[0].focus(); }, 700);
  }
  /** Right code: boxes turn green one by one, then fold into one check circle whose stroke draws. Resolves when done. */
  async function success() {
    settle();
    el.dataset.state = 'success';
    boxes.forEach((b) => { b.readOnly = true; b.blur(); });
    haptic(12);
    const ok = tok('--ac-success'); const okSoft = tok('--ac-success-soft'); const okInk = tok('--ac-success-ink');
    boxes.forEach((b, i) => {
      b.animate?.([{ backgroundColor: tok('--ac-surface-1'), borderColor: tok('--ac-text') }, { backgroundColor: okSoft, borderColor: ok, color: okInk }], { duration: 200, delay: i * 70, easing: 'ease-out', fill: 'forwards' });
      play(b, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: 0.4 }, { transform: 'scale(1)' }], null, { duration: 260, delay: i * 70, easing: 'ease-out' });
    });
    await wait(n * 70 + 260);
    if (el.dataset.state !== 'success') return false;
    const er = el.getBoundingClientRect(); const cx = er.left + er.width / 2;
    boxes.forEach((b) => {
      const r = b.getBoundingClientRect();
      play(b, [{ transform: 'none', opacity: 1 }, { transform: `translateX(${cx - (r.left + r.width / 2)}px) scale(0.5)`, opacity: 0 }],
        [{ opacity: 1 }, { opacity: 0 }], { duration: 340, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'forwards' });
    });
    done = h('span', { class: 'ac-otp__done', role: 'img', 'aria-label': ft('otpOk'), html: OTP_DONE });
    el.append(done);
    const svg = done.querySelector('svg');
    play(svg, [{ transform: 'scale(0.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], [{ opacity: 0 }, { opacity: 1 }], { duration: 520, delay: 160, easing: tok('--ac-spring-bounce') || 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'backwards' });
    done.querySelector('.ac-otp__done-ring').animate?.([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 420, delay: 180, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'backwards' });
    done.querySelector('.ac-otp__done-fill').animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 480, easing: 'ease-out', fill: 'backwards' });
    const last = done.querySelector('.ac-otp__done-check').animate?.([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 300, delay: 560, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'backwards' });
    emit(el, 'otp:success', { value: value() });
    await last?.finished.catch(() => {});
    return true;
  }

  const offs = [
    on(el, 'input', '.ac-otp__box', (e, b) => {
      const i = boxes.indexOf(b); const v = clean(b.value);
      if (v.length > 1) { b.value = ''; fill(i, v); return; }
      b.value = v;
      if (v) pop(b);
      if (v && i < n - 1) boxes[i + 1].focus();
      commit();
    }),
    on(el, 'keydown', '.ac-otp__box', (e, b) => {
      const i = boxes.indexOf(b);
      if (e.key === 'Backspace' && !b.value && i > 0) { e.preventDefault(); boxes[i - 1].value = ''; boxes[i - 1].focus(); commit(); }
      else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); boxes[i - 1].focus(); }
      else if (e.key === 'ArrowRight' && i < n - 1) { e.preventDefault(); boxes[i + 1].focus(); }
    }),
    on(el, 'paste', '.ac-otp__box', (e, b) => { e.preventDefault(); fill(boxes.indexOf(b), e.clipboardData.getData('text')); }),
    on(el, 'focusin', '.ac-otp__box', (e, b) => requestAnimationFrame(() => { if (document.activeElement === b) b.select(); })),
    on(document, 'ac:i18n:change', () => boxes.forEach((b, i) => b.setAttribute('aria-label', ft('digit', { n: i + 1 })))),
  ];
  instance(el, 'otp', {
    get value() { return value(); },
    clear() { settle(); boxes.forEach((b) => { b.value = ''; }); commit(); boxes[0].focus(); },
    focus() { (boxes.find((b) => !b.value) || boxes[n - 1]).focus(); },
    fill(text) { settle(); fill(0, text); },
    error, success, reset: settle,
  });
  return () => offs.forEach((f) => f());
});

/* ---------------------------------------------------------------- range */
register('range', (el) => {
  const o = options(el, { bubble: false, suffix: '', prefix: '' });
  let bubble;
  if (o.bubble) {
    const wrap = h('span', { class: 'ac-range-wrap' });
    el.before(wrap); wrap.append(el);
    bubble = h('output', { class: 'ac-range__bubble ac-num', 'aria-hidden': 'true' });
    wrap.append(bubble);
  }
  const paint = () => {
    const min = Number(el.min || 0); const max = Number(el.max || 100);
    const p = max > min ? ((Number(el.value) - min) / (max - min)) * 100 : 0;
    el.style.setProperty('--_p', `${p}%`);
    if (bubble) { bubble.textContent = `${o.prefix}${el.value}${o.suffix}`; bubble.style.setProperty('--_p', `${p}`); }
    const out = el.id && document.querySelector(`output[for~="${el.id}"]`);
    if (out) out.textContent = `${o.prefix}${el.value}${o.suffix}`;
  };
  const off = on(el, 'input', paint);
  paint();
  return () => { off(); };
});

/* ---------------------------------------------------------------- rating */
register('rating', (el) => {
  const o = options(el, { max: 5, value: 0, name: '', readonly: false });
  const max = clamp(Number(o.max) || 5, 1, 10);
  let value = clamp(Number(o.value) || 0, 0, max);
  el.setAttribute('role', o.readonly ? 'img' : 'radiogroup');
  const hidden = o.name ? h('input', { type: 'hidden', name: o.name, value: value || '' }) : null;
  const stars = Array.from({ length: max }, (_, i) => h(o.readonly ? 'span' : 'button', {
    type: o.readonly ? null : 'button', class: 'ac-rating__star', role: o.readonly ? null : 'radio', 'data-i': i + 1, html: icon('star'),
  }));
  el.replaceChildren(...stars, ...(hidden ? [hidden] : []));
  function paint() {
    stars.forEach((s, i) => {
      s.toggleAttribute('data-on', i < value);
      if (!o.readonly) {
        s.setAttribute('aria-checked', String(i + 1 === value));
        s.setAttribute('aria-label', ft('rating', { n: i + 1, max }));
        s.tabIndex = (value ? i + 1 === value : i === 0) ? 0 : -1;
      }
    });
    if (o.readonly) el.setAttribute('aria-label', ft('rating', { n: value, max }));
  }
  function set(v, focus) {
    v = clamp(v, 0, max);
    const changed = v !== value; value = v; paint();
    if (focus && v) stars[v - 1].focus();
    if (changed) {
      if (hidden) { hidden.value = v || ''; fire(hidden); }
      stars[v - 1]?.animate?.([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.34,1.4,.64,1)' });
      emit(el, 'rating:change', { value: v });
    }
  }
  const offs = o.readonly ? [] : [
    on(el, 'click', '.ac-rating__star', (e, s) => { const v = Number(s.dataset.i); set(v === value ? 0 : v); }),
    on(el, 'keydown', (e) => {
      const rtl = isRTL(el);
      const fwd = rtl ? 'ArrowLeft' : 'ArrowRight'; const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd || e.key === 'ArrowUp') set(Math.min(max, value + 1), true);
      else if (e.key === back || e.key === 'ArrowDown') set(Math.max(1, value - 1), true);
      else if (e.key === 'Home') set(1, true);
      else if (e.key === 'End') set(max, true);
      else return;
      e.preventDefault();
    }),
  ];
  offs.push(on(document, 'ac:i18n:change', paint));
  paint();
  instance(el, 'rating', { set, get value() { return value; } });
  return () => offs.forEach((f) => f());
});

/* ---------------------------------------------------------------- colour swatches */
register('swatches', (el) => {
  const o = options(el, { colors: '', name: '', value: '', custom: false });
  const colors = String(o.colors).split(',').map((c) => c.trim()).filter(Boolean);
  el.setAttribute('role', 'radiogroup');
  const hidden = o.name ? h('input', { type: 'hidden', name: o.name }) : null;
  const mk = (c) => {
    const b = h('button', { type: 'button', class: 'ac-swatch', role: 'radio', 'data-value': c, 'aria-label': c, html: icon('check') });
    b.style.setProperty('--_c', c);
    return b;
  };
  const items = colors.map(mk);
  let picker;
  if (o.custom) {
    picker = h('input', { type: 'color', class: 'ac-swatch__native', 'aria-label': 'Custom colour', tabindex: '-1' });
    const lab = h('label', { class: 'ac-swatch ac-swatch--custom', role: 'radio', tabindex: '-1', 'data-value': '', html: icon('plus') }, picker);
    items.push(lab);
  }
  el.replaceChildren(...items, ...(hidden ? [hidden] : []));
  let value = '';
  function select(v, focus) {
    value = v;
    let hit = false;
    items.forEach((it) => {
      const on_ = !!v && it.dataset.value.toLowerCase() === v.toLowerCase() && !hit;
      if (on_) hit = true;
      it.setAttribute('aria-checked', String(on_));
      it.tabIndex = on_ ? 0 : -1;
      if (on_ && focus) it.focus();
    });
    if (!hit && picker && v) {
      const c = items[items.length - 1]; c.dataset.value = v; c.style.setProperty('--_c', v);
      c.setAttribute('aria-checked', 'true'); c.tabIndex = 0; c.setAttribute('data-picked', '');
    }
    if (!items.some((it) => it.tabIndex === 0)) items[0].tabIndex = 0;
    if (hidden && hidden.value !== v) { hidden.value = v; fire(hidden); }
  }
  const pick = (v, focus) => { if (v.toLowerCase() === value.toLowerCase()) return; select(v, focus); emit(el, 'swatches:change', { value: v }); };
  const offs = [
    on(el, 'click', 'button.ac-swatch', (e, b) => pick(b.dataset.value)),
    on(el, 'keydown', (e) => {
      const i = items.indexOf(document.activeElement); if (i < 0) return;
      const rtl = isRTL(el); let j = null;
      if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') || e.key === 'ArrowDown') j = (i + 1) % items.length;
      if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') || e.key === 'ArrowUp') j = (i - 1 + items.length) % items.length;
      if (j == null) { if ((e.key === 'Enter' || e.key === ' ') && items[i] === items[items.length - 1] && picker) { e.preventDefault(); picker.click(); } return; }
      e.preventDefault();
      if (picker && j === items.length - 1) { items[j].focus(); return; }
      pick(items[j].dataset.value, true);
    }),
  ];
  if (picker) offs.push(on(picker, 'input', () => pick(picker.value)));
  select(String(o.value || ''));
  instance(el, 'swatches', { select: (v) => pick(v), get value() { return value; } });
  return () => offs.forEach((f) => f());
});
