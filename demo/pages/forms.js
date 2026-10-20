/* forms page: mock async city loader, indeterminate checkbox, wizard review, submit output. */
const CITIES = [
  ['thr', 'تهران', 'Tehran'], ['mhd', 'مشهد', 'Mashhad'], ['isf', 'اصفهان', 'Isfahan'], ['krj', 'کرج', 'Karaj'], ['shz', 'شیراز', 'Shiraz'],
  ['tbz', 'تبریز', 'Tabriz'], ['qom', 'قم', 'Qom'], ['ahv', 'اهواز', 'Ahvaz'], ['ksh', 'کرمانشاه', 'Kermanshah'], ['urm', 'ارومیه', 'Urmia'],
  ['rsh', 'رشت', 'Rasht'], ['zah', 'زاهدان', 'Zahedan'], ['ker', 'کرمان', 'Kerman'], ['ham', 'همدان', 'Hamadan'], ['yzd', 'یزد', 'Yazd'],
  ['ard', 'اردبیل', 'Ardabil'], ['bnd', 'بندرعباس', 'Bandar Abbas'], ['arak', 'اراک', 'Arak'], ['znj', 'زنجان', 'Zanjan'], ['sna', 'سنندج', 'Sanandaj'],
  ['qzv', 'قزوین', 'Qazvin'], ['grg', 'گرگان', 'Gorgan'], ['sar', 'ساری', 'Sari'], ['kish', 'کیش', 'Kish'], ['bsh', 'بوشهر', 'Bushehr'],
  ['dxb', 'دبی', 'Dubai'], ['auh', 'ابوظبی', 'Abu Dhabi'], ['shj', 'شارجه', 'Sharjah'], ['ajm', 'عجمان', 'Ajman'],
];
const sleep = (ms, signal) => new Promise((res, rej) => { const t = setTimeout(res, ms); signal?.addEventListener('abort', () => { clearTimeout(t); rej(new DOMException('aborted', 'AbortError')); }); });

export default function mount(root, AC) {
  const offs = [];
  const on = (t, type, sel, fn) => offs.push(AC.on(t, type, sel, fn));
  const lang = () => AC.i18n.lang;

  AC.combobox.loader('cities', async (q, { signal }) => {
    await sleep(380, signal);
    const n = (s) => s.toLowerCase().replace(/ي/g, 'ی');
    return CITIES.filter(([, fa, en]) => !q || n(fa).includes(q) || n(en).includes(q))
      .map(([value, fa, en]) => ({ value, label: lang() === 'fa' ? fa : en, meta: lang() === 'fa' ? en : fa }));
  });

  // indeterminate "all" checkbox
  const all = root.querySelector('#ch-all');
  const kids = () => Array.from(root.querySelectorAll('[data-child]'));
  const syncAll = () => { const c = kids().filter((k) => k.checked).length; all.checked = c === kids().length; all.indeterminate = c > 0 && c < kids().length; };
  on(all, 'change', () => { kids().forEach((k) => { k.checked = all.checked; }); });
  kids().forEach((k) => on(k, 'change', syncAll));
  syncAll();

  // meeting: only the next 60 days (data-min / data-max are read live)
  const meet = root.querySelector('#d-meet-wrap');
  const iso = (d) => d.toISOString().slice(0, 10);
  meet.dataset.min = iso(new Date());
  meet.dataset.max = iso(new Date(Date.now() + 60 * 864e5));

  // OTP demo
  const otp = root.querySelector('#otp-demo');
  const otpHelp = root.querySelector('[data-otp-status]');
  on(otp, 'ac:otp:complete', (e) => {
    if (e.detail.value === '123456') { otpHelp.textContent = AC.t('forms.otpOk', 'Verified'); otpHelp.className = 'ac-help ac-text-success'; }
    else {
      otp.setAttribute('aria-invalid', 'true');
      otp.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 300 });
      otpHelp.textContent = AC.t('forms.otpBad', 'Wrong code, try again'); otpHelp.className = 'ac-help ac-text-danger';
      setTimeout(() => AC.instance(otp, 'otp')?.clear(), 500);
    }
  });

  // summary list renderer
  const LABELS = { firstName: 'forms.firstName', lastName: 'forms.lastName', nationalId: 'forms.nationalId', birthDate: 'forms.birth', kind: 'forms.type', mobile: 'forms.mobile', email: 'forms.email', city: 'forms.city', postal: 'forms.postal', address: 'forms.address', plan: 'forms.plan', startDate: 'forms.startDate', interests: 'forms.interests', newsletter: 'forms.newsletter', username: 'forms.username' };
  const form = root.querySelector('#customer-form');
  function summary(dl, values, skip = []) {
    dl.replaceChildren();
    for (const [k, v] of Object.entries(values)) {
      if (skip.includes(k) || v === '' || (Array.isArray(v) && !v.length)) continue;
      let shown = Array.isArray(v) ? v.join('، ') : String(v);
      if (k === 'city') shown = form.querySelector('select[name="city"]')?.selectedOptions[0]?.textContent || shown;
      if (/Date$/.test(k) && v) shown = AC.format.date(v, { dateStyle: 'long' });
      if (k === 'password' || k === 'password2') shown = '••••••••';
      dl.append(AC.h('dt', { text: AC.t(LABELS[k] || '', k) }), AC.h('dd', { text: shown }));
    }
    dl.hidden = !dl.children.length;
  }
  on(form, 'ac:wizard:change', (e) => {
    if (e.detail.index === e.detail.total - 1) summary(root.querySelector('[data-review]'), AC.instance(form, 'form').values(), ['terms']);
  });

  const out = root.querySelector('[data-output]');
  const outEmpty = root.querySelector('[data-output-empty]');
  on(root, 'ac:form:submit', (e) => {
    e.detail.waitUntil(sleep(900).then(() => {
      outEmpty.hidden = true;
      summary(out, e.detail.values, ['terms', 'password2']);
      AC.toast?.({ title: AC.t('forms.saved', 'Saved'), message: AC.t('forms.savedSub', 'Form is valid and was submitted.'), tone: 'success' });
      if (e.detail.form === form) { AC.instance(form, 'wizard')?.go(0, { force: true }); }
      out.scrollIntoView?.({ block: 'nearest', behavior: AC.reducedMotion() ? 'auto' : 'smooth' });
    }));
  });
  on(root, 'ac:form:invalid', () => AC.haptic?.(12));

  return () => offs.forEach((f) => f());
}
