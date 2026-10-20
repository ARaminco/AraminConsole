# فهرست کامپوننت‌ها

هر کامپوننت با `data-ac="name"` فعال می‌شود (حتی در HTML که بعداً تزریق شود). گزینه‌ها: صفت‌های `data-*` یا `data-ac-config='{json}'`. رویدادها `ac:<component>:<event>` هستند و bubble می‌کنند. نمونه‌ها: صفحهٔ «کامپوننت‌ها» در دمو.

مرجع کامل API: `skills/aramin-console/reference/components.md`، `llms-full.txt`. ستون «مستند» به راهنمای همان خانواده می‌رود.

## پوسته و ناوبری

| کامپوننت | `data-ac` | کی استفاده کنیم | مستند |
|---|---|---|---|
| نوار بالا | `appbar` | ردیف پیل‌های بالا (برند، ناوبری، ابزار) | [DESIGN](../DESIGN.md) |
| ریل | `rail` | ناوبری گروه‌ها در دسکتاپ | [DESIGN](../DESIGN.md) |
| تب‌بار | `tabbar` | مقصدهای اصلی موبایل | [patterns](patterns.md) |
| عنوان بزرگ | `largetitle` | سرصفحهٔ صفحه | [patterns](patterns.md) |
| تب | `tabs` | بخش‌های هم‌سطح یک صفحه | [data](../data.md) |
| segmented | `segmented` | سوییچ ۲–۴ حالت (نما، بازه) | [forms](../forms.md) |
| پیل ناوبری | `navpill` | ناوبری بالا با شاخص لغزان | [motion](../motion.md) |
| پالت فرمان | `palette` | جستجو و پرش سریع (`⌘K`) | [overlays](../overlays.md) |
| کشیدن برای تازه‌سازی | `pull-refresh` | تازه‌سازی لیست روی موبایل | [patterns](patterns.md) |

## فرم و ورودی

| کامپوننت | `data-ac` | کی استفاده کنیم | مستند |
|---|---|---|---|
| فرم | `form` | اعتبارسنجی و ارسال `waitUntil` | [forms](../forms.md) |
| ورودی | `input` | متن با پاک‌کن/شمارنده | [forms](../forms.md) |
| گذرواژه | `password` | قدرت و چک‌لیست | [forms](../forms.md) |
| کد یک‌بارمصرف | `otp` | تأیید پیامکی | [forms](../forms.md) |
| عدد / بازه | `number` `range` | مقدار عددی | [forms](../forms.md) |
| امتیاز / رنگ | `rating` `swatches` | انتخاب سبک | [forms](../forms.md) |
| کومبوباکس | `combobox` | انتخاب از فهرست بلند، چندتایی | [forms](../forms.md) |
| برچسب‌ها | `tags` | چند مقدار آزاد | [forms](../forms.md) |
| تاریخ / ساعت | `datepicker` `timepicker` | شمسی و میلادی، بازه | [forms](../forms.md) |
| آپلود | `dropzone` | فایل با کشیدن و رها کردن | [forms](../forms.md) |
| ویزارد | `wizard` | فرم چندمرحله‌ای | [forms](../forms.md) |
| مبلغ | `money` `money-unit` | ریال/تومان با جداکننده و حروف | [finance](../finance.md) |
| کارت بانکی / شبا | `bank-card` `card-form` `sheba` | ثبت کارت و حساب | [finance](../finance.md) |
| مکان | `location-picker` | انتخاب موقعیت روی نقشه | [maps](../maps.md) |

## نمایش داده

| کامپوننت | `data-ac` | کی استفاده کنیم | مستند |
|---|---|---|---|
| جدول | `table` | فهرست‌های قابل مرتب‌سازی/فیلتر/صفحه‌بندی | [data](../data.md) |
| لیست | `list` | ردیف با ژست swipe، موبایل | [data](../data.md) |
| درخت | `tree` | سلسله‌مراتب | [data](../data.md) |
| آکاردئون | `accordion` | پرسش‌های متداول، جزئیات تاشو | [data](../data.md) |
| نمودار | `chart` | خط، ناحیه، میله، دونات، گیج، sparkline، heatmap | [data](../data.md) |
| شمارنده | `counter` | عدد KPI با شمارش | [motion](../motion.md) |
| حلقه | `ring` | درصد پیشرفت | [data](../data.md) |
| کد / JSON / لاگ | `code` `json` `logview` | نمایش فنی | [data](../data.md) |
| کانبان | `kanban` | تخته با کشیدن و رها کردن | [data](../data.md) |
| پنل‌های تقسیم | `split` | دو پنل با اندازهٔ قابل تغییر | [data](../data.md) |
| نقشه | `map` | نقشهٔ بدون وابستگی | [maps](../maps.md) |

## بازخورد و پوشش‌ها

| کامپوننت | `data-ac` / API | کی استفاده کنیم | مستند |
|---|---|---|---|
| مودال | `modal`، `AC.modal.open()` | تصمیم یا فرم کوتاه؛ روی گوشی شیت | [overlays](../overlays.md) |
| شیت | `sheet`، `AC.sheet.open()` | عمل‌های موبایل، انتخاب | [overlays](../overlays.md) |
| کشو | `drawer`، `AC.drawer.open()` | جزئیات/ویرایش کنار صفحه | [overlays](../overlays.md) |
| منو | `dropdown` | عمل‌های یک ردیف/دکمه | [overlays](../overlays.md) |
| پاپ‌اور | `popover` | محتوای کوچک شناور | [overlays](../overlays.md) |
| تأیید | `AC.confirm()` | عمل مخرب | [overlays](../overlays.md) |
| اعلان گذرا | `AC.toast`، `AC.notify` | نتیجهٔ عمل | [notifications](../notifications.md) |
| هشدار | `alert` | پیام ماندگار داخل صفحه | [overlays](../overlays.md) |
| اعلان‌ها | `notifications` | مرکز اعلان | [overlays](../overlays.md) |

## اتم‌های بدون JS (فقط کلاس)

دکمه `.ac-btn` (`--primary --secondary --accent --ghost --outline --danger --soft --pill --icon --sm --lg`)، نشان `.ac-badge`، چیپ `.ac-chip`، تگ `.ac-tag`، آواتار `.ac-avatar`، سوییچ `.ac-switch`، چک‌باکس `.ac-check`، کارت `.ac-card`، KPI `.ac-stat`/`.ac-kpi`، خالی `.ac-empty`، اسکلت `.ac-skeleton`، کلید `.ac-kbd`.

## ماژول‌های برنامه‌ای (اختیاری)

`chat`، `mail`، `files`، `tickets`، `invoice-ir`، `marketing`، `terminal`، `uptime`، `user-panel`، `support-chat`، `pwa`، `prose`. بارگذاری: `await AC.use('files')`. ← [modules](../modules.md)

## انتخاب بین مشابه‌ها

| مسئله | انتخاب |
|---|---|
| تأیید حذف | `AC.confirm`، نه مودال دستی |
| فرم کوتاه روی دسکتاپ، اما موبایل کامل | `modal` (خودکار شیت می‌شود) |
| جزئیات یک ردیف | `drawer` |
| پیام نتیجه | `toast`؛ اگر باید بماند `alert` |
| ۲–۴ حالت | `segmented`؛ بیشتر `tabs`؛ بسیار بیشتر `combobox` |
