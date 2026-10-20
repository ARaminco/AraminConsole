/* overlays page: fills demo rows, wires imperative demos (AC.modal/menu/confirm/prompt/toast/notifications). */
const ROWS = [
  ['سارا کریمی', 'Sara Karimi', 'shopping-bag', 1],
  ['محمد رضایی', 'Mohammad Rezaei', 'truck', 2],
  ['نگار احمدی', 'Negar Ahmadi', 'receipt', 3],
  ['امیر حسینی', 'Amir Hosseini', 'package', 4],
  ['لیلا موسوی', 'Leila Mousavi', 'credit-card', 5],
  ['رضا نوری', 'Reza Nouri', 'wallet', 6],
  ['مریم صادقی', 'Maryam Sadeghi', 'star', 7],
];
const LOREM = {
  fa: 'استفاده از این سرویس به معنای پذیرش این شرایط است. داده‌های شما رمزنگاری‌شده نگهداری می‌شود و بدون اجازه با هیچ شخص ثالثی به اشتراک گذاشته نمی‌شود. هر زمان بخواهید می‌توانید حساب خود را حذف کنید.',
  en: 'Using this service means you accept these terms. Your data is stored encrypted and is never shared with third parties without your permission. You can delete your account at any time.',
  ar: 'استخدامك لهذه الخدمة يعني قبولك لهذه الشروط. تُخزَّن بياناتك مشفّرة ولا تُشارَك مع أي طرف ثالث دون إذنك. يمكنك حذف حسابك في أي وقت.',
};

export default function mount(root, AC) {
  const { t, on, toast } = AC;
  const offs = [];
  const L = () => AC.i18n.lang;
  const tx = (fa, en) => (L() === 'fa' ? fa : en);
  let pos = '';

  const fill = () => {
    for (const ul of AC.$$('[data-ov-rows]', root)) {
      const n = Number(ul.dataset.ovRows);
      ul.innerHTML = Array.from({ length: n }, (_, i) => {
        const [fa, en, ic, c] = ROWS[i % ROWS.length];
        return `<li class="ac-list__item"><span class="ac-avatar ac-avatar--sm" data-color="${c}">${AC.escapeHtml((L() === 'fa' ? fa : en).split(' ').map((w) => w[0]).join(L() === 'fa' ? '‌' : ''))}</span>
          <div class="ac-list__main"><div class="ac-list__title">${AC.escapeHtml(L() === 'fa' ? fa : en)}</div><div class="ac-list__meta">#${1040 + i} · ${AC.format.number(120 + i * 37.5, { currency: 'USD' })}</div></div>
          <span class="ac-list__end">${AC.icon(ic)}</span></li>`;
      }).join('');
    }
    for (const b of AC.$$('[data-ov-lorem]', root)) b.innerHTML = Array.from({ length: Number(b.dataset.ovLorem) }, () => `<p>${LOREM[L()] || LOREM.en}</p>`).join('');
  };
  fill();
  offs.push(on(document, 'ac:i18n:change', fill));

  const out = (k, v) => { const o = root.querySelector(`[data-ov-out="${k}"]`); if (o) o.textContent = v; };
  offs.push(on(document, 'ac:menu:select', (e) => out('menu', `→ ${e.detail.value}${e.detail.checked !== undefined ? ` (${e.detail.checked})` : ''}`)));
  offs.push(on(root, 'ac:segmented:change', (e) => { if (e.target.matches('[data-ov-pos]')) pos = e.detail.value; }));

  const demos = {
    'modal-js': () => AC.modal.open({
      title: tx('ساخته‌شده با جاوااسکریپت', 'Built from JavaScript'), sub: 'AC.modal.open({ title, content, footer })', size: 'sm',
      content: `<p class="ac-text-soft">${AC.escapeHtml(tx('این پنجره بدون هیچ HTML از پیش آماده ساخته شد و پس از بسته‌شدن حذف می‌شود.', 'This dialog was created with no markup on the page and is removed once closed.'))}</p>`,
      footer: `<button class="ac-btn ac-btn--primary" type="button" data-ac-close>${AC.escapeHtml(tx('عالی', 'Nice'))}</button>`,
    }),
    'menu-js': (b, e) => AC.menu(b, [
      { heading: tx('مرتب‌سازی', 'Sort by') },
      { label: tx('نام', 'Name'), radio: 'sort', checked: true },
      { label: tx('تاریخ', 'Date'), radio: 'sort' },
      { label: tx('مبلغ', 'Amount'), radio: 'sort' },
      '-',
      { label: tx('فقط پرداخت‌شده', 'Paid only'), checked: false },
      { label: tx('خروجی', 'Export'), icon: 'download', items: [{ label: 'CSV', onSelect: () => toast.success('CSV') }, { label: 'PDF', onSelect: () => toast.success('PDF') }] },
      '-',
      { label: tx('حذف همه', 'Delete all'), icon: 'trash-2', tone: 'danger', onSelect: () => demos['confirm-danger']() },
    ], { placement: 'bottom-end', keyboard: e.detail === 0 }),
    'confirm-danger': async () => {
      const ok = await AC.confirm({ tone: 'danger', title: tx('پروژه حذف شود؟', 'Delete this project?'), text: tx('«گیسو» و ۲۴ فایل آن برای همیشه حذف می‌شوند. این کار برگشت‌پذیر نیست.', '“Gisoo” and its 24 files will be permanently deleted. This cannot be undone.'), confirmText: tx('حذف پروژه', 'Delete project') });
      out('confirm', `AC.confirm → ${ok}`);
      if (ok) toast.undo(tx('پروژه حذف شد', 'Project deleted'), () => toast.success(tx('بازگردانده شد', 'Restored')));
    },
    confirm: async () => {
      const ok = await AC.confirm({ tone: 'accent', icon: 'rocket', title: tx('نسخهٔ ۲٫۵ منتشر شود؟', 'Publish version 2.5?'), text: tx('همهٔ کاربران تا چند دقیقهٔ دیگر نسخهٔ تازه را می‌بینند.', 'Every user will see the new version within minutes.'), confirmText: tx('انتشار', 'Publish') });
      out('confirm', `AC.confirm → ${ok}`);
    },
    prompt: async () => {
      const v = await AC.prompt({ title: tx('تغییر نام فایل', 'Rename file'), label: tx('نام تازه', 'New name'), value: 'report-q3.pdf', required: true, confirmText: tx('ذخیره', 'Save'),
        validate: (x) => (/\.pdf$/i.test(x.trim()) ? true : tx('پسوند باید .pdf باشد', 'Must end with .pdf')) });
      out('confirm', `AC.prompt → ${v === null ? 'null' : JSON.stringify(v)}`);
    },
    undo: () => toast.undo(tx('۳ پیام بایگانی شد', '3 messages archived'), () => toast.info(tx('برگشت داده شد', 'Undone')), { position: pos || undefined }),
    promise: () => toast.promise(new Promise((r) => setTimeout(r, 1800)), { loading: tx('در حال انتشار…', 'Deploying…'), success: tx('روی سرور منتشر شد', 'Deployed to production'), error: 'Failed', options: { position: pos || undefined } }),
    stack: () => {
      const items = [['success', tx('پشتیبان گرفته شد', 'Backup completed')], ['info', tx('۲ کاربر تازه', '2 new users')], ['warning', tx('گواهی تا ۷ روز دیگر منقضی می‌شود', 'Certificate expires in 7 days')], ['danger', tx('ارسال ایمیل ناموفق بود', 'Email delivery failed')]];
      items.forEach(([tone, title], i) => setTimeout(() => toast({ tone, title, text: tx('همین حالا', 'Just now'), position: pos || undefined }), i * 220));
    },
    notify: () => AC.notifications.add({ kind: 'mention', avatar: 'ع‌ر', color: 1, title: { fa: 'علی رامین شما را نام برد', en: 'Ali Ramin mentioned you', ar: 'ذكرك علي رامين' }, text: { fa: '«این را تا فردا بررسی کن.»', en: '“Please review this by tomorrow.”', ar: '«راجع هذا قبل الغد.»' } }, { toast: true }),
    'alerts-reset': () => { AC.$$('[data-ac="alert"][data-state="closing"]', root).forEach((a) => a.remove()); location.reload(); },
  };
  offs.push(on(root, 'click', '[data-demo]', (e, b) => { const fn = demos[b.dataset.demo]; if (fn) { e.preventDefault(); fn(b, e); } }));
  offs.push(on(root, 'click', '[data-toast]', (e, b) => {
    const tone = b.dataset.toast;
    const m = {
      success: [tx('تغییرات ذخیره شد', 'Changes saved'), tx('همه‌چیز همگام است.', 'Everything is in sync.')],
      danger: [tx('اتصال برقرار نشد', 'Could not connect'), tx('دوباره تلاش کنید یا وضعیت سرور را ببینید.', 'Try again or check the server status.')],
      warning: [tx('سهمیه نزدیک به پایان است', 'Quota almost used'), tx('۹۲٪ از ظرفیت ماهانه مصرف شده.', '92% of this month’s quota used.')],
      info: [tx('نسخهٔ تازه در دسترس است', 'A new version is available'), null],
    }[tone];
    toast({ tone, title: m[0], text: m[1], position: pos || undefined, action: tone === 'info' ? { label: tx('بارگذاری', 'Reload'), onClick: () => {} } : undefined });
  }));

  if (!AC.notifications.list.length) AC.notifications.load(new URL('./notifications.json', import.meta.url).href);
  return () => offs.forEach((f) => f());
}
