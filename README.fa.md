<div align="center" dir="rtl">

<img src="demo/icons/icon.svg" alt="لوگوی AraminConsole" width="96" height="96">

# AraminConsole

**فریم‌ورک رابط کاربری پنل مدیریتی: بدون وابستگی، راست‌به‌چپ از پایه، و روی گوشی شبیه یک اپ واقعی.**
یک فایل CSS و یک ماژول JS. در HTML ساده، لاراول بلید، Next.js و هر پشتهٔ دیگر کار می‌کند.

[![CI](https://github.com/ARaminco/AraminConsole/actions/workflows/ci.yml/badge.svg)](https://github.com/ARaminco/AraminConsole/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-orange.svg)](CHANGELOG.md)
![Dependencies: 0](https://img.shields.io/badge/dependencies-0-brightgreen.svg)
![RTL first](https://img.shields.io/badge/RTL-first-8a2be2.svg)
![PWA ready](https://img.shields.io/badge/PWA-ready-5a0fc8.svg)
![Core size](https://img.shields.io/badge/core-40%20KB%20gzip-informational.svg)
[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-success.svg)](https://araminco.github.io/AraminConsole/demo/)

[**دموی زنده**](https://araminco.github.io/AraminConsole/demo/) · [شروع سریع](docs/getting-started.md) · [ماژول‌ها](docs/modules.md) · [استارترها](docs/starters.md) · [راهنمای هوش مصنوعی](AGENTS.md) · [English](README.md)

</div>

| داشبورد | گوشی | حالت تیره |
|---|---|---|
| ![داشبورد دسکتاپ](docs/screens/dashboard-desktop.png) | ![داشبورد گوشی](docs/screens/dashboard-phone.png) | ![حالت تیره](docs/screens/dashboard-dark.png) |
| ![صفحهٔ ورود](docs/screens/login-desktop.png) | ![ورود روی گوشی](docs/screens/login-phone.png) | ![صفحهٔ خطا](docs/screens/404-dark.png) |

## چرا AraminConsole
- **بدون وابستگی و بدون نیاز به build.** پوشهٔ `dist/` را کپی کنید و یک `<link>` و یک `<script type="module">` اضافه کنید.
- **راست‌به‌چپ از ریشه.** فقط ویژگی‌های منطقی CSS؛ فارسی، عربی و انگلیسی زنده عوض می‌شوند.
- **مثل اپ روی گوشی.** تب‌بار شناور با دکمهٔ FAB، عنوان بزرگ جمع‌شونده، شیت پایین، سوایپ روی ردیف‌ها، کشیدن برای تازه‌سازی.
- **ساخته‌شده برای ایران.** ریال/تومان، تقویم شمسی و هجری، کارت و لوگوی بانک‌ها، شبا، اعتبارسنجی کد ملی و موبایل، صورت‌حساب رسمی.
- **اعلانی (declarative).** با ویژگی `data-ac="…"` اجزا راه می‌افتند، حتی در HTML که بعداً اضافه شود؛ هر جزء API روی `window.AC` هم دارد.
- **ماژولار.** 26 ماژول؛ همه، بعضی، یا بارگذاری تنبل با `AC.use('maps')`.
- **دوستدار هوش مصنوعی.** فایل‌های [`AGENTS.md`](AGENTS.md)، [`llms.txt`](llms.txt) و [Agent Skill](skills/aramin-console/SKILL.md) به هر دستیار کدنویسی کمک می‌کنند درست با آن بسازد. سیستم طراحی: [docs/design-system](docs/design-system/README.md)، مهارت [aramin-design-system](skills/aramin-design-system/SKILL.md) و [راهنمای مهارت‌ها](docs/skills-guide.fa.md).

## ویژگی‌ها و ماژول‌ها
حجم‌ها فشرده و gzip هستند (از `dist/modules/modules.json`).

| ماژول | کارکرد | مستند | JS (gzip) | CSS (gzip) |
|---|---|---|---:|---:|
| `core` | توکن‌ها، قالب برنامه، اجزای پایه، هستهٔ `AC`، i18n، تم و قالب‌بندی | [getting-started.md](docs/getting-started.md) | 16.5 KB | 24.0 KB |
| `shell` | ریل، داک، تب‌بار، عنوان بزرگ، تب‌ها، پالت فرمان | [CONVENTIONS.md](docs/CONVENTIONS.md) | 8.3 KB | 2.9 KB |
| `overlays` | مودال، شیت پایین، کشو، منو، پاپ‌اور، تولتیپ، تأیید، توست | [overlays.md](docs/overlays.md) | 15.7 KB | 5.2 KB |
| `customizer` | کشوی شخصی‌سازی زندهٔ تم | [theming.md](docs/theming.md) | 3.1 KB | — |
| `langpicker` | انتخاب زبان (فارسی/انگلیسی/عربی) | [rtl.md](docs/rtl.md) | 2.9 KB | 1.6 KB |
| `forms` | ورودی‌ها، OTP، کومبوباکس، برچسب، آپلود، اعتبارسنجی، ویزارد | [forms.md](docs/forms.md) | 17.9 KB | — |
| `datepicker` | انتخاب تاریخ و ساعت شمسی/میلادی | [forms.md](docs/forms.md) | 8.6 KB | 2.1 KB |
| `data-display` | لیست با سوایپ، درخت، آکاردئون، نمایشگر کد/JSON/لاگ | [data.md](docs/data.md) | 7.1 KB | 3.0 KB |
| `table` | جدول داده: مرتب‌سازی، فیلتر، صفحه‌بندی، انتخاب، حالت کارت | [data.md](docs/data.md) | 8.4 KB | — |
| `chart` | نمودارهای SVG: خطی، ناحیه‌ای، میله‌ای، دونات، گیج، اسپارک‌لاین، هیت‌مپ | [data.md](docs/data.md) | 9.9 KB | 2.4 KB |
| `apps` | کانبان، نمای دوبخشی، صفحه‌های برنامه‌ای | [data.md](docs/data.md) | 4.0 KB | 6.4 KB |
| `money` | ریال/تومان، کارت بانکی، شبا، لوگوی بانک‌ها، کیت مالی | [finance.md](docs/finance.md) | 15.8 KB | 3.2 KB |
| `chat` | رابط چت | [support-chat.md](docs/support-chat.md) | 16.4 KB | 6.5 KB |
| `files` | مدیریت فایل با آپلود و پیش‌نمایش | [files.md](docs/files.md) | 50.7 KB | 11.1 KB |
| `invoice-ir` | صورت‌حساب رسمی ایران (آمادهٔ چاپ) | [invoice-ir.md](docs/invoice-ir.md) | 11.1 KB | 4.2 KB |
| `mail` | رابط ایمیل | [data.md](docs/data.md) | 18.4 KB | 5.6 KB |
| `maps` | نقشه و انتخاب موقعیت (بدون کلید API) | [maps.md](docs/maps.md) | 26.7 KB | 5.2 KB |
| `marketing` | بلوک‌های لندینگ: هیرو، قیمت‌گذاری، نظرات | [marketing.md](docs/marketing.md) | 13.2 KB | 3.5 KB |
| `notify` | مرکز اعلان و تنظیمات آن | [notifications.md](docs/notifications.md) | 12.8 KB | 3.9 KB |
| `prose` | تایپوگرافی مقاله و ویرایشگر | [prose.md](docs/prose.md) | 11.3 KB | 6.8 KB |
| `pwa` | کارت نصب، آفلاین، به‌روزرسانی | [pwa.md](docs/pwa.md) | 10.2 KB | 3.0 KB |
| `support-chat` | ویجت گفتگوی پشتیبانی | [support-chat.md](docs/support-chat.md) | 8.3 KB | 4.1 KB |
| `terminal` | نمای ترمینال | [data.md](docs/data.md) | 2.0 KB | 1.1 KB |
| `tickets` | تیکتینگ با زمان‌سنج SLA | [tickets.md](docs/tickets.md) | 15.4 KB | 4.8 KB |
| `uptime` | نوار وضعیت و آپ‌تایم | [data.md](docs/data.md) | 1.1 KB | 0.7 KB |
| `user-panel` | تکمیل پروفایل و تنظیمات حریم خصوصی | [forms.md](docs/forms.md) | 2.1 KB | 2.8 KB |

## شروع سریع
```bash
git clone https://github.com/ARaminco/AraminConsole.git
cp -r AraminConsole/dist ./public/aramin     # dist/ در مخزن هست: نیازی به npm install نیست
```
```html
<!doctype html>
<html lang="fa" dir="rtl" data-ac-icons="/aramin/icons.svg">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <script src="/aramin/aramin-console-boot.js"></script>   <!-- تم و زبان ذخیره‌شده پیش از اولین نقاشی -->
  <link rel="stylesheet" href="/aramin/aramin-console.min.css">
  <script type="module" src="/aramin/aramin-console.min.js"></script>
</head>
<body>
  <div class="ac-card"><div class="ac-card__body">
    <button class="ac-btn ac-btn--primary" type="button"
            onclick="AC.toast({ title: 'ذخیره شد', tone: 'success' })">ذخیره</button>
  </div></div>
</body>
</html>
```
پروژه‌های آماده: [`starters/html`](starters/html)، [`starters/laravel-blade`](starters/laravel-blade)، [`starters/nextjs`](starters/nextjs) (راهنما: [docs/starters.md](docs/starters.md)). این مخزن قالب GitHub هم هست: دکمهٔ **Use this template**.

## استفاده از `data-ac`
```html
<form class="ac-form" data-ac="form">                              <!-- اعتبارسنجی + ac:form:submit -->
  <input class="ac-input" name="mobile" data-ac-rules="required|iran-mobile">
</form>
<div class="ac-otp" data-ac="otp" data-length="6"></div>           <!-- ac:otp:complete -->
<span data-ac="counter" data-to="498601.92" data-decimals="2" data-prefix="$">0</span>
```
```js
import { AC } from './aramin-console.js';           // به‌صورت window.AC هم در دسترس است
AC.modal.open('#edit');  await AC.confirm({ title: 'حذف شود؟' });  AC.theme.set({ theme: 'dark', accent: 'blue' });
```
رویدادها همیشه به شکل `ac:<component>:<event>` هستند و حباب می‌شوند.

## ساخت ماژولار و سفارشی
```bash
node scripts/build.mjs --modules=forms,table,chart --out=dist/custom
```
```js
await AC.use('maps');                  // بارگذاری تنبل یک ماژول
```
جزئیات: [docs/modules.md](docs/modules.md).

## توکن‌های تم
همه‌چیز متغیر CSS با پیشوند `--ac-*` است و حالت تیره فقط جابه‌جایی توکن‌هاست. کلیدها روی `<html>`: `data-theme`، `data-accent` (orange، violet، blue، emerald، rose، amber، slate)، `data-density` و `data-radius`. فهرست کامل: [docs/theming.md](docs/theming.md).

## راست‌به‌چپ و چندزبانگی
با `<html lang="fa" dir="rtl">` یا `AC.i18n.set('en')` زبان، جهت و همهٔ متن‌های `[data-i18n]` از فایل‌های JSON عوض می‌شود. رقم‌ها پیش‌فرض لاتین‌اند و با `AC.i18n.setDigits('native')` فارسی می‌شوند. [docs/rtl.md](docs/rtl.md)

## جعبه‌ابزار ایرانی
ریال و تومان، تقویم شمسی و هجری بدون کتابخانهٔ تاریخ، کارت بانکی با لوگوی بانک‌های ایرانی، فیلد شبا با تشخیص بانک، اعتبارسنجی `iran-mobile` و `iran-national-id`، و صورت‌حساب رسمی آمادهٔ چاپ. [docs/finance.md](docs/finance.md) · [docs/invoice-ir.md](docs/invoice-ir.md) · [docs/forms.md](docs/forms.md)

## پشتیبانی مرورگرها
نسخه‌های جاری Chrome، Edge، Firefox، Safari (دسکتاپ و iOS 16.4 به بالا) و Samsung Internet.

## دسترس‌پذیری
تله‌فوکوس، ناوبری با کیبورد، حالت‌های ARIA، حلقهٔ فوکوس دیدنی، هدف لمسی ۴۴ پیکسل و احترام به `prefers-reduced-motion`.

## اعتبار «قدرت گرفته از ایر»
قالب پایه یک پیوند کوچک `.ac-powered` به <https://air.co.ir/> نشان می‌دهد: پایین ریل در دسکتاپ، انتهای محتوا در گوشی و پایین صفحه‌های ورود و خطا. مجوز MIT اجازهٔ حذف یا تغییر را می‌دهد:
- عنصرهای `<a class="ac-powered" …>` را از صفحه‌ها حذف کنید، یا
- متن را با کلید `credit.powered` در JSON ترجمه و آدرس را با `href` عوض کنید.

خواهش می‌کنیم در قالب پایه و استارترهایی که منتشر می‌کنید نگهش دارید.

## نقشهٔ راه
- انتشار روی npm و CDN نسخه‌دار
- استارترهای بیشتر (Vue، SvelteKit، Django)
- آزمون بصری در CI
- خروجی توکن برای Figma

## مشارکت
Issue و Pull Request خوشامد است: [CONTRIBUTING.md](CONTRIBUTING.md)، [آیین‌نامه رفتار](CODE_OF_CONDUCT.md)، [سیاست امنیتی](SECURITY.md). با `npm run dev` سرور محلی را بالا بیاورید و http://localhost:5178/demo/ را باز کنید. دستیارهای هوش مصنوعی ابتدا [AGENTS.md](AGENTS.md) را بخوانند.

## منابع و سپاس
- تم پیش‌فرض: **Air** (رنگ‌های برند AIR). نام و لوگوی AIR علامت تجاری AIR است و **زیر مجوز MIT نیست**؛ برای برند خودتان جایگزینش کنید.
- آیکون‌ها: [Lucide](https://lucide.dev)، مجوز ISC.
- فونت: [وزیرمتن](https://github.com/rastikerdar/vazirmatn) از صابر راستی‌کردار، مجوز SIL OFL 1.1.
- لوگوی بانک‌ها: بانک‌های ایرانی از [iranian-banks-icons](https://github.com/houtan-rocky/iranian-banks-react-icons) (MIT)، شبکه‌های کارت و بانک‌های خارجی از [simple-icons](https://simpleicons.org) (CC0). **همهٔ لوگوها علامت تجاری صاحبانشان‌اند و فقط برای شناسایی آمده‌اند.** جزئیات: `src/banks/SOURCES.md`.

## مجوز
[MIT](LICENSE) © 2026 Ali Asghar Ramin

<div align="center">

**Powered by [AIR](https://air.co.ir/)** — https://air.co.ir/

</div>
