<div dir="rtl">

# آرامین کنسول (AraminConsole)

**چارچوب رابط کاربری پنل مدیریت، بدون هیچ وابستگی؛ راست‌به‌چپ از پایه، با حالت تیره و رفتاری مثل اپلیکیشن روی گوشی.**
فقط یک فایل CSS و یک ماژول جاوااسکریپت. در HTML ساده، Laravel Blade، Next.js و هر محیط دیگری کار می‌کند.

[دموی زنده](https://araminco.github.io/AraminConsole/demo/) · [شروع کار](docs/getting-started.md) · [تم و رنگ‌ها](docs/theming.md) · [English](README.md)

| دسکتاپ | گوشی | حالت تیره |
|---|---|---|
| ![داشبورد در دسکتاپ](docs/screens/dashboard-desktop.png) | ![داشبورد در گوشی](docs/screens/dashboard-phone.png) | ![حالت تیره](docs/screens/dashboard-dark.png) |

## ویژگی‌ها
- **بدون وابستگی و بدون نیاز به ساخت.** پوشهٔ `dist/` را کپی کنید و یک `<link>` و یک `<script type="module">` اضافه کنید.
- **اعلانی.** هر کامپوننت با ویژگی `data-ac="…"` خودکار راه می‌افتد، حتی در HTMLی که بعداً به صفحه اضافه می‌شود. همهٔ کامپوننت‌ها از طریق `window.AC` هم با کد قابل کنترل‌اند.
- **راست‌به‌چپ از پایه.** فارسی، عربی و انگلیسی؛ فقط ویژگی‌های منطقی CSS به کار رفته و آیکون‌های جهت‌دار خودکار برمی‌گردند.
- **روی گوشی مثل اپ.** نوار زبانه‌های شناور با دکمهٔ اصلی، عنوان بزرگ که با اسکرول جمع می‌شود، برگهٔ پایین صفحه که با کشیدن بسته می‌شود، کشیدن ردیف‌ها، کشیدن برای تازه‌سازی، رعایت لبه‌های امن صفحه و قابلیت نصب (PWA).
- **توکن‌های طراحی.** حالت روشن و تیره، ۷ رنگ اصلی، تراکم و میزان گردی گوشه‌ها، همه با متغیرهای CSS (`--ac-*`).
- **تقویم شمسی و میلادی** بدون هیچ کتابخانه‌ای، فقط با `Intl`.
- **دسترس‌پذیر.** مدیریت فوکوس، حرکت با صفحه‌کلید، وضعیت‌های ARIA و احترام به تنظیم «حرکت کمتر».

## شروع سریع
```bash
git clone https://github.com/ARaminco/AraminConsole.git
cp -r AraminConsole/dist ./public/aramin
```
```html
<html lang="fa" dir="rtl" data-ac-icons="/aramin/icons.svg">
<head>
  <script src="/aramin/aramin-console-boot.js"></script>
  <link rel="stylesheet" href="/aramin/aramin-console.min.css">
  <script type="module" src="/aramin/aramin-console.min.js"></script>
</head>
```
نمونه‌های کامل برای HTML ساده، Laravel Blade و Next.js در [docs/getting-started.md](docs/getting-started.md) آمده است.

## استفاده با `data-ac`
```html
<form class="ac-form" data-ac="form">
  <input class="ac-input" name="mobile" data-ac-rules="required|iran-mobile">
</form>
<div class="ac-otp" data-ac="otp" data-length="6"></div>
```
رویدادها همیشه به شکل `ac:<component>:<event>` هستند؛ مثلاً `ac:form:submit` و `ac:otp:complete`.

## تم و رنگ‌ها
روی `<html>`: ‏`data-theme="light|dark"`، ‏`data-accent="orange|violet|blue|emerald|rose|amber|slate"`، ‏`data-density="comfortable|compact"`، ‏`data-radius="sharp|default|round"`. جدول کامل متغیرها در [docs/theming.md](docs/theming.md) است.

## زبان و جهت
با `AC.i18n.set('en')` زبان، جهت صفحه و همهٔ متن‌های دارای `data-i18n` عوض می‌شوند. عددها به‌طور پیش‌فرض با رقم لاتین نمایش داده می‌شوند و با `AC.i18n.setDigits('native')` فارسی می‌شوند.

## کامپوننت‌ها
- فرم‌ها: [docs/forms.md](docs/forms.md)
- پنجره‌ها و اعلان‌ها: [docs/overlays.md](docs/overlays.md)
- جدول، نمودار، فهرست و لاگ: [docs/data.md](docs/data.md)
- پوسته و ناوبری: [docs/CONVENTIONS.md](docs/CONVENTIONS.md)

## مرورگرهای پشتیبانی‌شده
نسخه‌های فعلی کروم، اج، فایرفاکس، سافاری (دسکتاپ و iOS 16.4 به بعد) و سامسونگ اینترنت.

## مشارکت
از گزارش مشکل و درخواست ادغام استقبال می‌کنیم؛ راهنما در [CONTRIBUTING.md](CONTRIBUTING.md) است.

## سپاس
- آیکون‌ها: [Lucide](https://lucide.dev) با مجوز ISC
- قلم: [وزیرمتن](https://github.com/rastikerdar/vazirmatn) اثر صابر راستی‌کردار با مجوز SIL OFL 1.1

## مجوز
[MIT](LICENSE) © 2026 علی‌اصغر رامین

</div>
