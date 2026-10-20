/* Notify & PWA lab — playground for AC.notify (src/modules/notify) and AC.pwa / AC.install (src/modules/pwa).
   The router lazy-loads both modules (data-modules on the page root); this script adds the lab styles once. */
const IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f0532d"/><stop offset="1" stop-color="#6d4aff"/></linearGradient></defs><rect width="480" height="200" fill="url(#g)"/><circle cx="390" cy="40" r="90" fill="#fff" opacity=".12"/><circle cx="60" cy="190" r="70" fill="#fff" opacity=".1"/><path d="M40 150 120 90l60 40 90-70 80 50 90-40" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/></svg>');
const L = (fa, en, ar) => ({ fa, en, ar: ar || en });

export default function mount(root, AC) {
  if (!document.querySelector('link[data-nlab-css]')) {
    const l = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: new URL('notify-lab.css', import.meta.url).href });
    l.dataset.nlabCss = ''; document.head.append(l);
  }
  const N = AC.notify;
  const $ = (s) => root.querySelector(s);
  const state = { variant: 'toast', tone: 'neutral', priority: 'normal', swipe: 'x', position: N.prefs().position === 'auto' ? 'bottom-end' : N.prefs().position, duration: 6, max: 3 };
  const offs = [];
  const on = (t, type, sel, fn) => { const off = AC.on(t, type, sel, fn); offs.push(off); return off; };

  // ---- position picker (the same control the preferences card uses)
  const posBox = $('[data-lab-pos]');
  const drawPos = () => { posBox.innerHTML = N.posPicker(state.position); };
  drawPos();
  on(posBox, 'click', '[data-pos]', (e, b) => { state.position = b.dataset.pos; drawPos(); code(); });

  on(root, 'click', '.nlab__chips [data-value]', (e, b) => {
    const g = b.closest('[data-lab-field]');
    for (const c of g.querySelectorAll('[data-value]')) c.setAttribute('aria-checked', String(c === b));
    state[g.dataset.labField] = b.dataset.value; code();
  });
  const val = (k) => root.querySelector(`[data-lab-field="${k}"]`);
  on(root, 'ac:segmented:change', (e) => { const k = e.target.closest('[data-lab-field]')?.dataset.labField; if (k) { state[k] = e.detail.value; code(); } });
  on(root, 'input', '[data-lab-field]', (e, el) => {
    const k = el.dataset.labField;
    if (el.type === 'range') { state[k] = Number(el.value); const o = root.querySelector(`[data-lab-out="${k}"]`); if (o) o.textContent = el.value; if (k === 'max') N.setPrefs({ max: state.max }); }
    code();
  });
  on(root, 'change', '[data-lab-field]', () => code());

  function opts() {
    const o = { variant: state.variant, title: val('title').value, text: val('text').value, tone: state.tone, priority: state.priority, position: state.position, swipe: state.swipe, duration: state.duration * 1000 };
    if (val('avatar').checked) { o.avatar = 'س‌ک'; o.color = 3; }
    if (val('image').checked) o.image = IMG;
    if (val('actions').checked) o.actions = [{ label: L('پاسخ', 'Reply', 'رد'), primary: true, onClick: () => AC.toast.success(AC.t('nlab.replied', 'پاسخ ارسال شد')) }, { label: L('بعداً', 'Later', 'لاحقاً') }];
    if (val('group').checked) o.group = 'lab';
    o.sound = val('sound').checked; o.haptic = val('haptic').checked;
    if (state.variant === 'inline') o.target = $('[data-lab-inline]');
    if (state.variant === 'snackbar') o.onUndo = () => AC.toast.info(AC.t('nlab.undone', 'بازگردانده شد'));
    if (state.variant === 'progress') o.progress = 0;
    return o;
  }
  function code() {
    const o = opts();
    const show = Object.fromEntries(Object.entries(o).filter(([k, v]) => !['target', 'onUndo'].includes(k) && v !== false && v !== undefined && !(k === 'swipe' && v === 'x') && !(k === 'priority' && v === 'normal') && !(k === 'tone' && v === 'neutral')));
    if (show.image) show.image = '…';
    if (show.actions) show.actions = show.actions.map((a) => ({ label: a.label.en, ...(a.primary ? { primary: true } : {}) }));
    let s = `AC.notify(${JSON.stringify(show, null, 2).replace(/"(\w+)":/g, '$1:')})`;
    if (o.target) s = s.replace(/\n\}\)$/, ",\n  target: '#inline-box'\n})");
    $('[data-lab-code]').textContent = s;
  }
  code();

  function fire(extra = {}) {
    const o = { ...opts(), ...extra };
    const h = N(o);
    if (o.variant === 'progress' && h?.update) simulateProgress(h);
    if (o.variant === 'island' && h?.update && o.priority !== 'urgent') setTimeout(() => h.update({ badge: 3 }), 1400);
    return h;
  }
  function simulateProgress(h, island) {
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(1, p + 0.07 + Math.random() * 0.12);
      h.update({ progress: p, text: island ? undefined : `${Math.round(p * 2.4 * 10) / 10} / 2.4 MB` });
      if (p >= 1) { clearInterval(t); island ? setTimeout(() => h.close('done'), 1200) : h.done?.(AC.t('nlab.uploaded', 'بارگذاری کامل شد'), { text: 'report-q3.pdf · 2.4 MB' }); }
    }, 380);
    offs.push(() => clearInterval(t));
  }

  on(root, 'click', '[data-lab]', async (e, b) => {
    const k = b.dataset.lab;
    if (k === 'fire') fire();
    else if (k === 'burst') {
      const names = ['سارا کریمی', 'Omid Rad', 'Lina Haddad', 'مهدی صالحی', 'Nora Ali'];
      names.forEach((n, i) => setTimeout(() => fire({ title: state.variant === 'toast' && val('group').checked ? val('title').value : `${n} · #${i + 1}`, avatar: n.split(' ').map((x) => x[0]).join('‌'), color: (i % 8) + 1, sound: false }), i * 260));
    } else if (k === 'clear') N.clear();
    else if (k === 'copy') { await AC.copyText?.($('[data-lab-code]').textContent) ?? navigator.clipboard?.writeText($('[data-lab-code]').textContent); AC.toast.success(AC.t('nlab.copied', 'کد کپی شد')); }
    else if (k === 'bip') {
      const ev = new Event('beforeinstallprompt', { cancelable: true });
      ev.prompt = async () => {}; ev.userChoice = new Promise((r) => setTimeout(() => r({ outcome: 'accepted', platform: 'web' }), 600));
      ev.userChoice.then(() => dispatchEvent(new Event('appinstalled')));
      dispatchEvent(ev);
      AC.toast.info(AC.t('nlab.bipDone', 'مرورگر پیشنهاد نصب داد'), AC.t('nlab.bipText', 'حالا دکمهٔ «نصب» واقعاً نصب می‌کند (شبیه‌سازی).'));
      renderState();
    } else if (k === 'update') AC.pwa.simulateUpdate();
    else if (k === 'share') AC.pwa.share({ title: 'AraminConsole', text: AC.t('nlab.shareText', 'پنل مدیریت متن‌باز آرامین'), url: location.href });
    else if (k === 'outbox') {
      const r = await AC.pwa.send(new URL('api/notes', location.href).href, { body: JSON.stringify({ at: Date.now() }), headers: { 'Content-Type': 'application/json' } }).catch((err) => ({ ok: false, err }));
      if (r.queued) return; // the service worker answered from the outbox and AC.pwa already toasted
      AC.toast(r.ok ? { title: AC.t('nlab.sent', 'ارسال شد'), tone: 'success' } : { title: AC.t('nlab.sendFail', 'ارسال نشد'), text: AC.t('nlab.sendFailText', 'سرویس‌ورکر فعال نیست؛ در حالت آفلاین درخواست در صف می‌ماند.'), tone: 'warning' });
    }
  });

  on(root, 'click', '[data-install]', (e, b) => AC.install.show(b.dataset.install));

  let badge = 0;
  on(root, 'click', '[data-badge]', (e, b) => {
    const d = Number(b.dataset.badge);
    badge = d === 0 ? 0 : Math.max(0, badge + d);
    AC.pwa.badge(badge);
    $('[data-lab-badge]').textContent = String(badge);
  });

  const demos = {
    toast: () => N({ variant: 'toast', title: L('تغییرات ذخیره شد', 'Changes saved', 'تم حفظ التغييرات'), text: L('همهٔ دستگاه‌ها همگام شدند', 'Synced to all devices', 'تمت المزامنة'), tone: 'success' }),
    card: () => N({ event: 'mention', variant: 'card', avatar: 'س‌ک', color: 3, title: L('سارا کریمی شما را منشن کرد', 'Sara Karimi mentioned you', 'سارة كريمي أشارت إليك'), text: L('«گزارش فروش این هفته را تا ساعت ۵ می‌فرستی؟»', '“Can you send this week’s sales report by 5?”', '«هل ترسل تقرير المبيعات قبل الخامسة؟»'), meta: L('همین حالا', 'now', 'الآن'), actions: [{ label: L('پاسخ', 'Reply', 'رد'), primary: true }, { label: L('باز کردن', 'Open', 'فتح') }] }),
    banner: () => N({ variant: 'banner', tone: 'danger', priority: 'urgent', icon: 'shield-check', title: L('ورود تازه از دستگاه ناشناس', 'New sign-in from an unknown device', 'تسجيل دخول من جهاز غير معروف'), text: L('تهران · Chrome روی ویندوز · ۲ دقیقه پیش', 'Tehran · Chrome on Windows · 2 min ago', 'طهران · Chrome · قبل دقيقتين'), actions: [{ label: L('این من بودم', 'It was me', 'كنت أنا') }, { label: L('ایمن‌سازی حساب', 'Secure account', 'تأمين الحساب'), primary: true }] }),
    snackbar: () => N.snackbar({ title: L('۳ گفتگو بایگانی شد', '3 conversations archived', 'أُرشفت 3 محادثات'), onUndo: () => AC.toast.info(AC.t('nlab.undone', 'بازگردانده شد')) }),
    progress: () => simulateProgress(N.progress({ title: L('در حال بارگذاری report-q3.pdf', 'Uploading report-q3.pdf', 'جارٍ رفع report-q3.pdf'), text: '0 / 2.4 MB' })),
    island: () => { const h = N.island({ icon: 'rocket', tone: 'accent', title: L('استقرار نسخهٔ 2.4', 'Deploying v2.4', 'نشر الإصدار 2.4'), text: L('ساخت، آزمون و انتشار روی ۳ سرور', 'Build, test and roll out to 3 servers', 'بناء واختبار ونشر على 3 خوادم'), progress: 0, duration: 0, expand: true }); simulateProgress(h, true); },
    inline: () => N.inline({ target: $('[data-lab-inline]'), tone: 'warning', title: L('فضای ذخیره‌سازی ۸۰٪ پر است', 'Storage is 80% full', 'التخزين ممتلئ بنسبة 80٪'), text: L('برای جلوگیری از توقف پشتیبان‌گیری، فضا را افزایش دهید.', 'Upgrade to keep backups running.', 'قم بالترقية لاستمرار النسخ الاحتياطي.'), actions: [{ label: L('افزایش فضا', 'Upgrade', 'ترقية'), primary: true }] }),
    system: () => N.system({ title: L('سفارش تازه ORD-20614', 'New order ORD-20614', 'طلب جديد ORD-20614'), text: L('۲ قلم · ۴٬۸۰۰٬۰۰۰ ریال', '2 items · 4,800,000 IRR', 'عنصران · 4,800,000 ريال'), tone: 'success', group: 'orders' }),
    push: async () => {
      const r = await N.push.simulate({ title: AC.t('nlab.pushTitle', 'پیام تازه از مریم'), body: AC.t('nlab.pushBody', 'فاکتور شمارهٔ ۱۲۰۴ تأیید شد ✓'), url: '#/notifications', tone: 'accent' });
      if (r === 'page') AC.toast.info(AC.t('nlab.pushPage', 'پوش داخل صفحه نمایش داده شد'), AC.t('nlab.pushPageText', 'برای اعلان سیستمی، سرویس‌ورکر و اجازهٔ اعلان لازم است.'));
    },
  };
  on(root, 'click', '[data-demo]', (e, b) => demos[b.dataset.demo]?.());

  // ---- PWA state readout
  const st = $('[data-lab-state]');
  async function renderState() {
    const s = AC.install.state;
    const reg = AC.pwa.registration;
    const perm = typeof Notification === 'undefined' ? '—' : Notification.permission;
    const rows = [
      [AC.t('nlab.sPlatform', 'سکو'), s.platform], [AC.t('nlab.sStandalone', 'اجرای مستقل'), s.standalone ? '✓' : '—'],
      [AC.t('nlab.sInstall', 'قابل نصب'), s.installed ? AC.t('nlab.installed', 'نصب شده') : s.available ? '✓' : '—'], [AC.t('nlab.sSW', 'سرویس‌ورکر'), reg ? (navigator.serviceWorker.controller ? 'active' : 'installing') : 'off'],
      [AC.t('nlab.sPerm', 'اجازهٔ اعلان'), perm], [AC.t('nlab.sPush', 'پوش'), await N.push.state()],
    ];
    st.innerHTML = rows.map(([k, v]) => `<div><dt>${AC.escapeHtml(k)}</dt><dd>${AC.escapeHtml(String(v))}</dd></div>`).join('');
  }
  renderState();
  ['ac:install:available', 'ac:install:installed', 'ac:notify:push-state', 'ac:i18n:change'].forEach((t) => on(document, t, renderState));
  on(document, 'ac:i18n:change', code);

  return () => { offs.forEach((f) => f?.()); N.clear(); };
}
