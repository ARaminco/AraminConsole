/* Declarative validation, form submit API and multi-step wizard.

   <form class="ac-form" data-ac="form" [data-native]>
     <div class="ac-field">
       <label class="ac-label" for="m">Mobile</label>
       <input class="ac-input" id="m" name="mobile" data-ac-rules="required|iran-mobile" [data-ac-msg="custom text"]>
       <p class="ac-help">…</p>                       ← error text is added as .ac-field__error
     </div>
   </form>
   Rules: required email url numeric integer min:n max:n length:n (string length; numeric value for type=number
   and [data-ac=number]; item count for multi-values) between:a,b match:#id iran-mobile iran-national-id
   iran-postal iran-card date. Persian/Arabic digits are accepted everywhere.
   Live: a field validates on blur, then on every change once it has been touched or shown an error.
   Submit: invalid → focus + ac:form:invalid { errors }; valid → ac:form:submit { values, formData, form, submitter, waitUntil(p) }
   API: AC.instance(form,'form').{validate(scope?) → bool, values(), errors(), reset(), setErrors({name: msg})}
        AC.validate.add('name', (value, arg, el) => bool, 'message or i18n key'); AC.validate.check(el) → message|''

   Wizard (put on the same form: data-ac="form wizard"):
     <ol class="ac-stepper">…<li class="ac-step">…</li></ol>
     <section class="ac-wizard__step">…</section> × n
     <div class="ac-wizard__nav"><button data-wizard-prev>…</button><button data-wizard-next>…</button><button type="submit">…</button></div>
   Events: ac:wizard:change { index, total }   API: AC.instance(form,'wizard').{go(i), next(), prev(), index} */
import { AC, register, on, emit, uid, instance, options, h, i18n, reducedMotion } from '../core.js';
import { ft, latin } from './form-core.js';

const sum = (a) => a.reduce((x, y) => x + y, 0);
export function iranNationalId(v) {
  v = latin(v).replace(/\D/g, '');
  if (!/^\d{10}$/.test(v) || /^(\d)\1{9}$/.test(v)) return false;
  const check = +v[9];
  const s = sum(v.slice(0, 9).split('').map((d, i) => +d * (10 - i))) % 11;
  return s < 2 ? check === s : check === 11 - s;
}
const luhn = (v) => { v = latin(v).replace(/\D/g, ''); if (v.length !== 16) return false; let s = 0; for (let i = 0; i < 16; i++) { let d = +v[i]; if (i % 2 === 0) { d *= 2; if (d > 9) d -= 9; } s += d; } return s % 10 === 0; };
const numeric = (el) => el.type === 'number' || el.type === 'range' || !!el.closest('[data-ac~="number"]');

const RULES = {
  required: { fn: (v, a, el) => (Array.isArray(v) ? v.length > 0 : el.type === 'checkbox' ? el.checked : String(v).trim() !== ''), msg: (a, el) => (el.type === 'checkbox' ? 'err.checked' : 'err.required') },
  email: { fn: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), msg: 'err.email' },
  url: { fn: (v) => { try { const u = new URL(v); return /^https?:$/.test(u.protocol); } catch { return false; } }, msg: 'err.url' },
  numeric: { fn: (v) => /^-?\d+([.,]\d+)?$/.test(v), msg: 'err.numeric' },
  integer: { fn: (v) => /^-?\d+$/.test(v), msg: 'err.numeric' },
  min: { fn: (v, a, el) => (Array.isArray(v) ? v.length >= a : numeric(el) ? Number(v) >= a : String(v).length >= a), msg: (a, el, v) => (Array.isArray(v) ? 'err.minItems' : numeric(el) ? 'err.minValue' : 'err.min') },
  max: { fn: (v, a, el) => (Array.isArray(v) ? v.length <= a : numeric(el) ? Number(v) <= a : String(v).length <= a), msg: (a, el) => (numeric(el) ? 'err.maxValue' : 'err.max') },
  length: { fn: (v, a) => String(v).length === Number(a), msg: 'err.length' },
  between: { fn: (v, a) => { const [lo, hi] = String(a).split(',').map(Number); return Number(v) >= lo && Number(v) <= hi; }, msg: 'err.maxValue' },
  match: { fn: (v, a, el) => { const o = el.form?.querySelector(a) || document.querySelector(a); return !o || o.value === (el.value ?? v); }, msg: 'err.match', always: true },
  'iran-mobile': { fn: (v) => /^(?:\+98|0098|98|0)?9\d{9}$/.test(v.replace(/[\s-]/g, '')), msg: 'err.iranMobile' },
  'iran-national-id': { fn: iranNationalId, msg: 'err.iranNationalId' },
  'iran-postal': { fn: (v) => /^\d{10}$/.test(v.replace(/[\s-]/g, '')), msg: 'err.iranPostal' },
  'iran-card': { fn: luhn, msg: 'err.iranCard' },
  date: { fn: (v, a, el) => { const dp = el.closest('[data-ac~="datepicker"]'); return !dp || AC.instance(dp, 'datepicker')?.valid !== false; }, msg: 'err.date' },
};

function valueOf(el) {
  if (el.matches('input[type=checkbox]')) return el.checked ? (el.value || 'on') : '';
  if (el.matches('input[type=radio]')) { const f = el.form || document; const c = f.querySelector(`input[type=radio][name="${CSS.escape(el.name)}"]:checked`); return c ? c.value : ''; }
  if (el.matches('select[multiple]')) return Array.from(el.selectedOptions).map((o) => o.value).filter(Boolean);
  if (el.matches('input, select, textarea')) return latin(el.value);
  const inner = Array.from(el.querySelectorAll('input[name], select[name], textarea[name]'));
  if (inner.length === 1) return valueOf(inner[0]);
  const v = inner.map(valueOf).flat().filter((x) => x !== '');
  return el.matches('[data-ac~="tags"]') && v.length ? String(v[0]).split(',').filter(Boolean) : v.length > 1 ? v : (v[0] ?? '');
}

/** Message for the first failing rule of el, or '' when valid. */
function check(el) {
  const spec = el.getAttribute('data-ac-rules') || '';
  if (!spec || el.disabled || el.closest('fieldset[disabled], [hidden]:not(.ac-wizard__step)')) return '';
  const v = valueOf(el);
  const empty = Array.isArray(v) ? !v.length : String(v).trim() === '';
  for (const part of spec.split('|').map((s) => s.trim()).filter(Boolean)) {
    const i = part.indexOf(':');
    const name = i < 0 ? part : part.slice(0, i);
    const raw = i < 0 ? '' : part.slice(i + 1);
    const rule = RULES[name];
    if (!rule) { console.warn(`[AC] unknown rule "${name}"`); continue; }
    if (empty && name !== 'required' && !rule.always) continue;
    const arg = raw !== '' && !isNaN(raw) ? Number(raw) : raw;
    if (!rule.fn(v, arg, el)) {
      if (el.dataset.acMsg) return el.dataset.acMsg;
      const key = typeof rule.msg === 'function' ? rule.msg(arg, el, v) : rule.msg;
      return key.startsWith('err.') ? ft(key, { n: arg }) : i18n.t(key, key, { n: arg });
    }
  }
  return '';
}

export const validate = {
  rules: RULES,
  /** add('postcode', (value, arg, el) => bool, 'i18n.key or message') */
  add(name, fn, msg = 'err.required') { RULES[name] = { fn, msg }; },
  check,
  iranNationalId,
};
AC.validate = validate;

const focusTarget = (el) => (el.matches('input:not([type=hidden]), select:not([hidden]), textarea') ? el : null)
  || (el.closest('.ac-field') || el).querySelector('input:not([type=hidden]):not([tabindex="-1"]), textarea, [role=combobox], button:not([tabindex="-1"])') || el;

function show(el, msg) {
  const field = el.closest('.ac-field, .ac-choice-group, fieldset') || el.parentElement;
  const target = focusTarget(el);
  let err = field.querySelector(':scope > .ac-field__error');
  if (msg) {
    if (!err) {
      err = h('p', { class: 'ac-field__error', id: uid('err'), role: 'alert' });
      field.append(err);
    }
    if (err.textContent !== msg) err.textContent = msg;
    field.setAttribute('data-invalid', '');
    field.removeAttribute('data-valid');
    target.setAttribute('aria-invalid', 'true');
    const ids = (target.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (!ids.includes(err.id)) target.setAttribute('aria-describedby', [...ids, err.id].join(' '));
  } else {
    if (field.hasAttribute('data-invalid')) field.setAttribute('data-valid', '');
    field.removeAttribute('data-invalid');
    target.removeAttribute('aria-invalid');
    if (err) {
      const ids = (target.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && x !== err.id);
      ids.length ? target.setAttribute('aria-describedby', ids.join(' ')) : target.removeAttribute('aria-describedby');
      err.remove();
    }
  }
}

function formValues(form) {
  const fd = new FormData(form); const out = {};
  for (const [k, v] of fd) {
    if (!k) continue;
    if (k in out) out[k] = [].concat(out[k], v);
    else out[k] = typeof v === 'string' ? latin(v) : v;
  }
  form.querySelectorAll('select[multiple][name]').forEach((s) => { out[s.name] = Array.from(s.selectedOptions).map((o) => o.value); });
  return out;
}

/* ---------------------------------------------------------------- form */
register('form', (form) => {
  const o = options(form, { native: false });
  if (form.tagName === 'FORM') form.noValidate = true;
  const touched = new WeakSet();
  const ruled = (scope = form) => Array.from(scope.querySelectorAll('[data-ac-rules]'));
  const owner = (t) => t.closest('[data-ac-rules]') || ruled().find((r) => r.contains(t) || (r.name && t.name === r.name && t.type === 'radio'));

  function validate(scope = form, { focus = true } = {}) {
    let first = null; const errors = {};
    for (const el of ruled(scope)) {
      touched.add(el);
      const msg = check(el); show(el, msg);
      if (msg) { errors[el.name || el.id || el.dataset.name || ruled().indexOf(el)] = msg; first ??= el; }
    }
    if (first && focus) {
      const t = focusTarget(first);
      t.focus({ preventScroll: true });
      t.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
      const box = first.closest('.ac-field') || first;
      box.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: reducedMotion() ? 0 : 320, easing: 'ease-out' });
    }
    return { ok: !first, errors };
  }
  const live = (e) => {
    const el = owner(e.target); if (!el) return;
    if (e.type === 'focusout') { if (form.contains(e.relatedTarget) && el.contains(e.relatedTarget)) return; touched.add(el); }
    if (!touched.has(el) && !(el.closest('.ac-field') || el).hasAttribute('data-invalid')) return;
    show(el, check(el));
    if (e.type !== 'focusout') ruled().filter((r) => /match:/.test(r.dataset.acRules) && r !== el && touched.has(r)).forEach((r) => show(r, check(r)));
  };
  const offs = [
    on(form, 'input', live), on(form, 'change', live), on(form, 'focusout', live),
    on(form, 'submit', (e) => {
      const res = validate();
      if (!res.ok) { e.preventDefault(); emit(form, 'form:invalid', { errors: res.errors }); return; }
      if (o.native) return;
      e.preventDefault();
      const submitter = e.submitter;
      const pending = [];
      emit(form, 'form:submit', { values: formValues(form), formData: new FormData(form), form, submitter, waitUntil: (p) => pending.push(p) });
      if (pending.length && submitter) {
        submitter.setAttribute('aria-busy', 'true'); submitter.disabled = true;
        Promise.allSettled(pending).then(() => { submitter.removeAttribute('aria-busy'); submitter.disabled = false; });
      }
    }),
    on(form, 'reset', () => setTimeout(() => ruled().forEach((el) => { show(el, ''); (el.closest('.ac-field') || el).removeAttribute('data-valid'); }))),
    on(document, 'ac:i18n:change', () => ruled().forEach((el) => { if ((el.closest('.ac-field') || el).hasAttribute('data-invalid')) show(el, check(el)); })),
  ];
  instance(form, 'form', {
    validate: (scope, opts) => validate(scope || form, opts).ok,
    values: () => formValues(form),
    errors: () => validate(form, { focus: false }).errors,
    reset() { form.reset(); },
    setErrors(map) { for (const [k, msg] of Object.entries(map)) { const el = form.querySelector(`[name="${CSS.escape(k)}"]`); if (el) show(el.closest('[data-ac-rules]') || el, msg); } },
  });
  return () => offs.forEach((f) => f());
});

/* ---------------------------------------------------------------- wizard */
register('wizard', (form) => {
  const steps = () => Array.from(form.querySelectorAll('.ac-wizard__step'));
  const dots = () => Array.from(form.querySelectorAll('.ac-stepper .ac-step'));
  let index = Math.max(0, steps().findIndex((s) => !s.hidden));
  const count = form.querySelector('[data-wizard-count]');

  function paint(dir = 0) {
    const all = steps(); const total = all.length;
    all.forEach((s, i) => {
      const on_ = i === index; s.hidden = !on_;
      s.setAttribute('aria-hidden', String(!on_));
      if (on_ && dir && !reducedMotion()) { s.setAttribute('data-enter', dir > 0 ? 'next' : 'prev'); setTimeout(() => s.removeAttribute('data-enter'), 340); }
    });
    dots().forEach((d, i) => {
      if (d.getAttribute('data-state') === 'error' && i === index) d.removeAttribute('data-state');
      d.setAttribute('data-state', i < index ? 'done' : i === index ? 'current' : 'upcoming');
      i === index ? d.setAttribute('aria-current', 'step') : d.removeAttribute('aria-current');
    });
    form.querySelectorAll('[data-wizard-prev]').forEach((b) => { b.hidden = index === 0; });
    form.querySelectorAll('[data-wizard-next]').forEach((b) => { b.hidden = index === total - 1; });
    form.querySelectorAll('.ac-wizard__nav [type="submit"]').forEach((b) => { b.hidden = index !== total - 1; });
    if (count) count.textContent = i18n.t('form.stepOf', '{n} / {total}', { n: new Intl.NumberFormat(i18n.numberLocale).format(index + 1), total: new Intl.NumberFormat(i18n.numberLocale).format(total) });
    form.style.setProperty('--_progress', `${((index + 1) / total) * 100}%`);
  }
  function validStep() {
    const api = instance(form, 'form');
    const ok = api ? api.validate(steps()[index]) : true;
    if (!ok) dots()[index]?.setAttribute('data-state', 'error');
    return ok;
  }
  function go(i, { force = false } = {}) {
    const total = steps().length;
    i = Math.max(0, Math.min(total - 1, i));
    if (i === index) return;
    if (i > index && !force) { for (let k = index; k < i; k++) { if (!validStep()) return; if (k < i - 1) { index = k + 1; paint(); } } }
    const dir = i > index ? 1 : -1;
    index = i; paint(dir);
    const head = steps()[index].querySelector('h2, h3, legend');
    (head || steps()[index]).setAttribute('tabindex', '-1');
    (head || steps()[index]).focus({ preventScroll: true });
    form.scrollIntoView?.({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    emit(form, 'wizard:change', { index, total });
  }
  const offs = [
    on(form, 'click', '[data-wizard-next]', (e) => { e.preventDefault(); go(index + 1); }),
    on(form, 'click', '[data-wizard-prev]', (e) => { e.preventDefault(); go(index - 1); }),
    on(form, 'click', '.ac-stepper .ac-step', (e, d) => { const i = dots().indexOf(d); if (i < index) go(i); }),
    on(form, 'reset', () => setTimeout(() => { index = 0; paint(-1); })),
    on(document, 'ac:i18n:change', () => paint()),
  ];
  // Enter / submit on an intermediate step = next. Capture on the form fires before the form component's listener.
  const onSubmit = (e) => { if (index < steps().length - 1) { e.preventDefault(); e.stopImmediatePropagation(); go(index + 1); } };
  form.addEventListener('submit', onSubmit, true);
  paint();
  instance(form, 'wizard', { go: (i) => go(i), next: () => go(index + 1), prev: () => go(index - 1), get index() { return index; } });
  return () => { offs.forEach((f) => f()); form.removeEventListener('submit', onSubmit, true); };
});
