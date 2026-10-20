/* Files page — lazy-loads the files module (AC.use('files') → src/modules/files) on its in-memory adapter, seeded with a
   realistic records tree whose files point at REAL sample content in demo/content/files/ (tests/make-files-content.mjs). */

const C = new URL('../content/files/', import.meta.url).href;
const ago = (d, h = 10, m = 20) => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(h, m, 0, 0); return x.toISOString(); };
const ahead = (d) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
const KB = 1024; const MB = 1048576;
const me = 'u1';
const act = (...list) => list.map(([action, d, by = me]) => ({ action, at: ago(d, 9 + (d % 8)), by }));

export const filesSeed = () => ({
  me,
  root: {
    name: 'Home',
    children: [
      { id: 'contracts', name: 'قراردادها', glyph: 'docs', tags: ['blue'], modified: ago(1, 16, 5), created: ago(400), shared: [{ user: me, role: 'owner' }, { user: 'u2', role: 'editor' }], children: [
        { id: 'lease', name: 'قرارداد اجارهٔ واحد ۱۲ - برج آرامین.pdf', url: `${C}lease-contract.pdf`, thumb: `${C}lease-contract.thumb.jpg`, size: 246575, modified: ago(1, 16, 5), created: ago(160), tags: ['blue', 'orange'], starred: true,
          doc: { type: 'قرارداد اجاره', number: 'ق-۱۴۰۵/۲۳۸', date: '2026-05-08', parties: 'شرکت نمونهٔ آرامین؛ آقای نمونه', expiry: ahead(18), remind: true }, status: 'signed', ocr: 'done',
          shared: [{ user: me, role: 'owner' }, { user: 'u2', role: 'editor' }, { user: 'u4', role: 'viewer' }], comment: 'نسخهٔ امضاشده؛ اصل در گاوصندوق دفتر.',
          versions: [{ id: 'v2', date: ago(20), size: 238000, by: 'u2' }, { id: 'v1', date: ago(160), size: 201000, by: me }], activity: act(['sign', 1], ['review', 6, 'u2'], ['upload', 160]) },
        { id: 'salesagr', name: 'Sales Agreement - Dubai Marina 2304.pdf', url: `${C}sales-agreement-2304.pdf`, thumb: `${C}sales-agreement-2304.thumb.jpg`, size: 92754, modified: ago(4, 11), created: ago(30), tags: ['blue'],
          doc: { type: 'Sales agreement', number: 'SA-2304', date: '2026-09-02', parties: 'Seller Sample LLC; Buyer Sample', expiry: ahead(210) }, status: 'approved', ocr: 'done', shared: [{ user: me, role: 'owner' }, { user: 'u3', role: 'commenter' }], activity: act(['edit', 4, 'u3'], ['upload', 30]) },
        { id: 'buildc', name: 'قرارداد پیمانکاری ساختمان.docx', size: 384 * KB, modified: ago(2, 9), created: ago(12), doc: { type: 'قرارداد پیمانکاری', number: 'پ-۱۴۰۵/۰۹۱', parties: 'شرکت نمونه؛ پیمانکار نمونه' }, status: 'review', ocr: '', tags: ['yellow'], versions: [{ id: 'v1', date: ago(9), size: 350 * KB, by: 'u2' }], activity: act(['review', 2, 'u2'], ['create', 12]) },
        { id: 'settle', name: 'توافق‌نامهٔ تسویه (پیش‌نویس).docx', size: 96 * KB, modified: ago(0, 9, 40), created: ago(3), doc: { type: 'توافق‌نامه' }, status: 'draft', tags: ['red'] },
        { id: 'nda', name: 'NDA_Aramin_2025.pdf', url: `${C}sales-agreement-2304.pdf`, size: 61 * KB, modified: ago(390), created: ago(400), doc: { type: 'NDA', number: 'NDA-25-07', parties: 'Aramin; Partner Sample', expiry: ahead(-25) }, status: 'signed', ocr: 'done', tags: ['gray'] },
        { id: 'scans', name: 'اسکن‌ها', glyph: 'scan', modified: ago(6), created: ago(60), children: [
          { id: 'scan1', name: 'اسکن قرارداد - صفحه ۱.jpg', url: `${C}contract-scan-1.jpg`, size: 40317, dims: [900, 1200], modified: ago(6, 14), created: ago(6), ocr: 'pending', doc: { type: 'قرارداد اجاره' } },
          { id: 'scan2', name: 'اسکن قرارداد - صفحه ۳.jpg', url: `${C}contract-scan-2.jpg`, size: 36182, dims: [900, 1200], modified: ago(6, 14, 2), created: ago(6), ocr: '' },
          { id: 'minutes', name: 'صورت‌جلسهٔ تحویل واحد.pdf', url: `${C}invoice-1024.pdf`, size: 118 * KB, modified: ago(9), created: ago(9), ocr: 'pending', status: 'review', doc: { type: 'صورت‌جلسه', number: 'ص-۲۲' } },
        ] },
      ] },
      { id: 'finance', name: 'اسناد مالی ۱۴۰۵', glyph: 'money', tags: ['orange'], modified: ago(0, 8, 15), created: ago(200), children: [
        { id: 'invoices', name: 'فاکتورها', glyph: 'docs', modified: ago(3), created: ago(200), children: [
          { id: 'inv1024', name: 'فاکتور ۱۰۲۴.pdf', url: `${C}invoice-1024.pdf`, thumb: `${C}invoice-1024.thumb.jpg`, size: 120830, modified: ago(8), created: ago(8), status: 'approved', ocr: 'done', doc: { type: 'فاکتور', number: '۱۰۲۴', date: '2026-10-04' }, tags: ['orange', 'green'] },
          { id: 'inv1025', name: 'فاکتور ۱۰۲۵.pdf', url: `${C}invoice-1024.pdf`, thumb: `${C}invoice-1024.thumb.jpg`, size: 118 * KB, modified: ago(3), created: ago(3), status: 'review', ocr: 'done', doc: { type: 'فاکتور', number: '۱۰۲۵' }, tags: ['orange', 'yellow'] },
          { id: 'inv187', name: 'Invoice INV-2026-0187.pdf', url: `${C}invoice-1024.pdf`, size: 104 * KB, modified: ago(12), created: ago(12), status: 'signed', doc: { type: 'Invoice', number: 'INV-2026-0187' } },
        ] },
        { id: 'tx', name: 'تراکنش‌های مهر ۱۴۰۵.csv', url: `${C}transactions-1405.csv`, size: 812, modified: ago(0, 8, 15), created: ago(5), tags: ['orange'] },
        { id: 'budget', name: 'بودجهٔ سالانه ۱۴۰۵.xlsx', thumb: `${C}budget-1405.thumb.jpg`, size: 248 * KB, modified: ago(15), created: ago(120), tags: ['orange'], starred: true, shared: [{ user: me, role: 'owner' }, { user: 'u3', role: 'viewer' }], versions: [{ id: 'v3', date: ago(30), size: 240 * KB, by: 'u3' }, { id: 'v2', date: ago(60), size: 230 * KB, by: me }, { id: 'v1', date: ago(120), size: 190 * KB, by: me }] },
        { id: 'pl', name: 'گزارش سود و زیان فصل دوم.xlsx', size: 156 * KB, modified: ago(22), created: ago(40), status: 'approved' },
        { id: 'cheques', name: 'چک‌ها', glyph: 'lock', tags: ['red'], modified: ago(11), created: ago(90), children: [
          { id: 'chq', name: 'تصویر چک ۴۵۶۷۸۹.jpg', url: `${C}cheque.jpg`, size: 29215, dims: [1000, 440], modified: ago(11), created: ago(11), doc: { type: 'چک', number: '۴۵۶۷۸۹', date: '2026-11-21', expiry: ahead(32) }, ocr: 'done', tags: ['red'] },
        ] },
        { id: 'tax', name: 'Tax Return 2025.pdf', url: `${C}sales-agreement-2304.pdf`, size: 512 * KB, modified: ago(48), created: ago(48), status: 'signed', doc: { type: 'Tax return', number: 'TR-2025', expiry: ahead(40) } },
      ] },
      { id: 'ids', name: 'مدارک هویتی', glyph: 'id', tags: ['purple'], modified: ago(30), created: ago(700), children: [
        { id: 'idfront', name: 'کارت ملی - رو.jpg', url: `${C}id-card-front.jpg`, size: 27230, dims: [900, 570], modified: ago(30), created: ago(700), tags: ['purple'], doc: { type: 'مدرک هویتی', expiry: ahead(1800) }, ocr: 'done' },
        { id: 'passport', name: 'Passport scan.pdf', url: `${C}sales-agreement-2304.pdf`, size: 1.8 * MB, modified: ago(200), created: ago(400), tags: ['purple', 'red'], doc: { type: 'Passport', number: 'P0000000', expiry: ahead(41) }, ocr: 'done', status: 'approved' },
        { id: 'birth', name: 'شناسنامه.pdf', url: `${C}lease-contract.pdf`, size: 2.2 * MB, modified: ago(500), created: ago(700), tags: ['purple'] },
      ] },
      { id: 'projects', name: 'پروژه‌ها', modified: ago(1), created: ago(300), children: [
        { id: 'aramin', name: 'Aramin Console', glyph: 'code', modified: ago(1), created: ago(120), tags: ['green'], children: [
          { id: 'readme', name: 'README.md', url: `${C}README.md`, size: 304, modified: ago(1, 12), created: ago(120) },
          { id: 'adapterjs', name: 'files-adapter.js', url: `${C}files-adapter.js`, size: 940, modified: ago(1, 18), created: ago(10) },
          { id: 'logo', name: 'logo.svg', url: `${C}logo.svg`, size: 367, dims: [512, 512], modified: ago(40), created: ago(120) },
          { id: 'release', name: 'release-notes.txt', text: 'Aramin Console 0.1.0\n\n• Files module: Finder-class manager\n• Quick Look with zoom & swipe\n• Upload panel with pause / resume\n', size: 120, modified: ago(2), created: ago(2) },
        ] },
        { id: 'deck', name: 'ارائهٔ سرمایه‌گذاران.pptx', thumb: `${C}pitch-deck.thumb.jpg`, size: 8.4 * MB, modified: ago(5), created: ago(45), starred: true, tags: ['yellow'] },
        { id: 'deck3', name: 'Pitch deck v3.pptx', size: 6.1 * MB, modified: ago(70), created: ago(90) },
        { id: 'notesmd', name: 'صورت‌جلسهٔ هفتگی.md', url: `${C}meeting-notes.md`, size: 912, modified: ago(0, 11, 30), created: ago(0, 11), tags: ['green'], shared: [{ user: me, role: 'owner' }, { user: 'u2', role: 'editor' }, { user: 'u3', role: 'editor' }] },
      ] },
      { id: 'media', name: 'رسانه', glyph: 'media', modified: ago(2), created: ago(500), children: [
        { id: 'photos', name: 'عکس‌ها', glyph: 'images', modified: ago(2), created: ago(500), children: [
          { id: 'p1', name: 'Dubai skyline.jpg', url: `${C}dubai-skyline.jpg`, size: 59991, dims: [1280, 853], modified: ago(2, 19), created: ago(2), starred: true },
          { id: 'p2', name: 'غروب کیش.jpg', url: `${C}kish-sunset.jpg`, size: 32202, dims: [1280, 853], modified: ago(9, 18), created: ago(9), tags: ['purple'] },
          { id: 'p3', name: 'Team offsite.jpg', url: `${C}team-offsite.jpg`, size: 23571, dims: [1280, 853], modified: ago(25), created: ago(25), shared: [{ user: me, role: 'owner' }, { user: 'u4', role: 'viewer' }] },
          { id: 'p4', name: 'دفتر جدید.jpg', url: `${C}new-office.jpg`, size: 21606, dims: [1280, 853], modified: ago(33), created: ago(33) },
        ] },
        { id: 'v1', name: 'ویدیوی معرفی محصول.webm', url: `${C}product-intro.webm`, size: 294 * KB, duration: 5, dims: [640, 360], modified: ago(3), created: ago(3), tags: ['green'] },
        { id: 'v2', name: 'Site visit - Marina.webm', url: `${C}site-visit-marina.webm`, size: 176 * KB, duration: 3, dims: [640, 360], modified: ago(7), created: ago(7) },
        { id: 'a1', name: 'پیام صوتی جلسه.wav', url: `${C}meeting-voice-note.wav`, size: 187 * KB, duration: 6, modified: ago(1, 15), created: ago(1) },
      ] },
      { id: 'notes', name: 'یادداشت‌ها.txt', url: `${C}notes.txt`, size: 420, modified: ago(0, 7, 50), created: ago(14) },
      { id: 'zip1', name: 'پشتیبان ۱۴۰۴.zip', size: 412 * MB, modified: ago(80), created: ago(80), tags: ['gray'] },
      { id: 'zip2', name: 'Archive.zip', size: 18.6 * MB, modified: ago(19), created: ago(19) },
      { id: 'bin', name: 'device-export.bin', size: 3.3 * MB, modified: ago(140), created: ago(140) },
    ],
  },
  trash: [
    { id: 't1', name: 'پیش‌نویس قدیمی.docx', size: 44 * KB, modified: ago(40), created: ago(60) },
    { id: 't2', name: 'Old logo.png', url: `${C}logo.svg`, size: 12 * KB, modified: ago(90), created: ago(200) },
  ],
  tags: [
    { id: 'red', color: 'red', name: { fa: 'فوری', en: 'Urgent', ar: 'عاجل' } },
    { id: 'orange', color: 'orange', name: { fa: 'مالی', en: 'Finance', ar: 'مالي' } },
    { id: 'yellow', color: 'yellow', name: { fa: 'در انتظار', en: 'Pending', ar: 'قيد الانتظار' } },
    { id: 'green', color: 'green', name: { fa: 'تأییدشده', en: 'Approved', ar: 'معتمد' } },
    { id: 'blue', color: 'blue', name: { fa: 'حقوقی', en: 'Legal', ar: 'قانوني' } },
    { id: 'purple', color: 'purple', name: { fa: 'شخصی', en: 'Personal', ar: 'شخصي' } },
    { id: 'gray', color: 'gray', name: { fa: 'بایگانی', en: 'Archive', ar: 'أرشيف' } },
  ],
  users: [
    { id: 'u1', name: { fa: 'علی‌اصغر رامین', en: 'Ali Asghar Ramin', ar: 'علي أصغر رامين' }, email: 'ali@aramin.dev', color: 1 },
    { id: 'u2', name: { fa: 'سارا محمدی', en: 'Sara Mohammadi', ar: 'سارة محمدي' }, email: 'sara@aramin.dev', color: 3 },
    { id: 'u3', name: { fa: 'Emily Carter', en: 'Emily Carter', ar: 'إميلي كارتر' }, email: 'emily@partner.example', color: 5 },
    { id: 'u4', name: { fa: 'رضا کریمی', en: 'Reza Karimi', ar: 'رضا كريمي' }, email: 'reza@aramin.dev', color: 6 },
  ],
  locations: [
    { id: 'cloud', icon: 'cloud', primary: true, name: { fa: 'فضای ابری آرامین', en: 'Aramin Cloud', ar: 'سحابة آرامين' }, used: 68.4 * 1024 * MB, total: 100 * 1024 * MB },
    { id: 'docsrv', icon: 'server', name: { fa: 'سرور اسناد شرکت', en: 'Company documents server', ar: 'خادم مستندات الشركة' }, used: 1.21 * 1024 * 1024 * MB, total: 4 * 1024 * 1024 * MB },
    { id: 'device', icon: 'laptop', name: { fa: 'این دستگاه', en: 'This device', ar: 'هذا الجهاز' }, used: 212 * 1024 * MB, total: 512 * 1024 * MB },
  ],
});

let fsSingleton = null; // keeps edits while navigating between demo pages
export default function mount(root, AC) {
  let alive = true; let fm = null;
  const el = root.querySelector('#files-app');
  const fit = () => {
    if (matchMedia('(max-width: 639.98px)').matches) { el.style.removeProperty('--fm-h'); return; }
    const top = el.getBoundingClientRect().top + scrollY;
    const bottom = AC.isMobile() ? 96 : 24;
    el.style.setProperty('--fm-h', `${Math.max(520, innerHeight - top - bottom)}px`);
  };
  fit();
  const onResize = AC.rafThrottle(fit);
  addEventListener('resize', onResize);
  AC.use('files').then(() => {
    if (!alive) return;
    fsSingleton ??= AC.files.memoryAdapter(filesSeed(), { latency: 25, failUpload: (f) => /corrupt|خراب/i.test(f.name) && 'Network error' });
    fm = AC.files(el, {
      adapter: fsSingleton, id: 'demo', favorites: ['contracts', 'finance', 'ids', 'media'],
      docTypes: ['قرارداد اجاره', 'قرارداد فروش', 'قرارداد پیمانکاری', 'فاکتور', 'صورت‌جلسه', 'وکالت‌نامه', 'مدرک هویتی', 'چک', 'اظهارنامهٔ مالیاتی'],
    });
    window.__files = fm; // handy for tests and the console
  }, (err) => console.error('[demo] files module failed', err));
  return () => { alive = false; removeEventListener('resize', onResize); fm?.destroy(); delete window.__files; };
}
