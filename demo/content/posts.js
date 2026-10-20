/* Demo blog data (shared by #/blog and #/article). Text is Persian with English / Arabic variants for titles. */
export const authors = {
  ali: { name: { fa: 'علی‌اصغر رامین', en: 'Ali Asghar Ramin', ar: 'علي أصغر رامين' }, role: { fa: 'طراح و توسعه‌دهنده', en: 'Designer & developer', ar: 'مصمم ومطور' }, initials: 'ع‌ر', color: 1 },
  sara: { name: { fa: 'سارا محمدی', en: 'Sara Mohammadi', ar: 'سارا محمدي' }, role: { fa: 'مهندس رابط کاربری', en: 'UI engineer', ar: 'مهندسة واجهات' }, initials: 'س‌م', color: 3 },
  reza: { name: { fa: 'رضا کریمی', en: 'Reza Karimi', ar: 'رضا كريمي' }, role: { fa: 'مدیر محصول', en: 'Product manager', ar: 'مدير المنتج' }, initials: 'ر‌ک', color: 5 },
};

export const posts = [
  { id: 'rtl-admin', slug: 'article', cover: 1, icon: 'languages', tag: 'design', author: 'ali', date: '2026-10-12', minutes: 6, featured: true,
    title: { fa: 'طراحی پنل مدیریتی راست‌به‌چپ؛ از تایپوگرافی تا انیمیشن', en: 'Designing an RTL admin panel: from typography to motion', ar: 'تصميم لوحة إدارة من اليمين إلى اليسار' },
    excerpt: { fa: 'خوانایی نتیجهٔ ده‌ها تصمیم کوچک است: طول سطر، فاصلهٔ پاراگراف‌ها، جهت درست اعداد و حرکت‌هایی که فقط وقتی لازم‌اند دیده می‌شوند.', en: 'Readability is the sum of many small decisions: line length, paragraph rhythm, number direction and motion that appears only when it helps.', ar: 'سهولة القراءة نتيجة عشرات القرارات الصغيرة.' } },
  { id: 'otp-motion', cover: 2, icon: 'shield-check', tag: 'motion', author: 'sara', date: '2026-10-08', minutes: 4,
    title: { fa: 'انیمیشن‌هایی که فرم ورود را دوست‌داشتنی می‌کنند', en: 'Motion that makes sign-in forms delightful', ar: 'حركات تجعل نماذج الدخول ممتعة' },
    excerpt: { fa: 'لرزش هنگام خطا، تیک سبز هنگام موفقیت و شمارش معکوس حلقه‌ای؛ و این‌که چرا همه باید با تنظیم «کاهش حرکت» هم دیده شوند.', en: 'A shake on error, a green check on success and a ring countdown — and why all of them must survive reduced motion.', ar: 'اهتزاز عند الخطأ وعلامة خضراء عند النجاح.' } },
  { id: 'markdown-safe', cover: 3, icon: 'shield', tag: 'security', author: 'ali', date: '2026-10-02', minutes: 7,
    title: { fa: 'مبدل Markdown امن بدون هیچ وابستگی', en: 'A safe Markdown renderer with zero dependencies', ar: 'محوّل Markdown آمن بلا اعتماديات' },
    excerpt: { fa: 'چرا HTML خام را رد می‌کنیم، پیوندهای javascript: چطور شناسایی می‌شوند و چه آزمون‌هایی برای حمله‌های XSS نوشتیم.', en: 'Why raw HTML is refused, how javascript: links are caught and which XSS payloads we test against.', ar: 'لماذا نرفض HTML الخام وكيف نكشف روابط javascript:.' } },
  { id: 'jalali', cover: 4, icon: 'calendar', tag: 'i18n', author: 'reza', date: '2026-09-27', minutes: 5,
    title: { fa: 'تقویم شمسی در مرورگر، بدون کتابخانه', en: 'The Persian calendar in the browser without a library', ar: 'التقويم الهجري الشمسي في المتصفح' },
    excerpt: { fa: 'Intl.DateTimeFormat بیشتر کار را انجام می‌دهد؛ بقیه‌اش چند خط حساب است.', en: 'Intl.DateTimeFormat does most of the work; the rest is a few lines of arithmetic.', ar: 'Intl.DateTimeFormat يقوم بمعظم العمل.' } },
  { id: 'dark-mode', cover: 5, icon: 'moon', tag: 'design', author: 'sara', date: '2026-09-20', minutes: 3,
    title: { fa: 'حالت تیره فقط عوض کردن رنگ‌ها نیست', en: 'Dark mode is more than swapping colours', ar: 'الوضع الداكن أكثر من تبديل الألوان' },
    excerpt: { fa: 'سایه‌ها در تاریکی دیده نمی‌شوند؛ پس عمق را با روشنایی سطح‌ها می‌سازیم.', en: 'Shadows vanish in the dark, so depth comes from surface lightness.', ar: 'الظلال تختفي في الظلام.' } },
  { id: 'pwa', cover: 6, icon: 'smartphone', tag: 'mobile', author: 'reza', date: '2026-09-11', minutes: 6,
    title: { fa: 'پنلی که روی گوشی مثل اپ رفتار می‌کند', en: 'An admin panel that behaves like an app on phones', ar: 'لوحة تتصرف كتطبيق على الهاتف' },
    excerpt: { fa: 'نوار پایین شناور، برگه‌های کشویی، کشیدن برای تازه‌سازی و نصب روی صفحهٔ اصلی.', en: 'A floating tab bar, bottom sheets, pull to refresh and install to home screen.', ar: 'شريط سفلي عائم وأوراق منزلقة.' } },
];

export const tags = { design: { fa: 'طراحی', en: 'Design', ar: 'تصميم' }, motion: { fa: 'انیمیشن', en: 'Motion', ar: 'حركة' }, security: { fa: 'امنیت', en: 'Security', ar: 'أمان' }, i18n: { fa: 'چندزبانه', en: 'i18n', ar: 'تعدد اللغات' }, mobile: { fa: 'موبایل', en: 'Mobile', ar: 'جوال' } };

export const comments = [
  { id: 1, author: 'sara', at: '2026-10-13T09:20:00', likes: 12, text: { fa: 'بخش مربوط به unicode-bidi دقیقاً همان مشکلی بود که ماه‌ها با آن درگیر بودیم. ممنون!', en: 'The unicode-bidi part is exactly what we fought with for months. Thanks!', ar: 'جزء unicode-bidi هو بالضبط ما عانينا منه.' },
    replies: [{ id: 2, author: 'ali', at: '2026-10-13T10:05:00', likes: 4, text: { fa: 'خوشحالم که مفید بود. نسخهٔ عربی هم به‌زودی کامل می‌شود.', en: 'Glad it helped. The Arabic edition is coming soon.', ar: 'سعيد أنه كان مفيداً.' } }] },
  { id: 3, author: 'reza', at: '2026-10-14T18:42:00', likes: 7, text: { fa: 'آیا می‌شود شماره‌گذاری فهرست‌ها را با ارقام فارسی نشان داد؟', en: 'Can list numbering use Persian digits?', ar: 'هل يمكن ترقيم القوائم بالأرقام الفارسية؟' }, replies: [] },
];

export const pick = (obj, lang) => (obj && (obj[lang] || obj.fa || obj.en)) || '';
