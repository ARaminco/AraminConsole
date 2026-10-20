# حرکت

مرجع کامل: [docs/motion.md](../motion.md). این صفحه خلاصهٔ تصمیم‌گیری است. در دمو، صفحهٔ «سیستم طراحی» هر منحنی را قابل اجرا نشان می‌دهد.

## قواعد خانه

1. فقط `transform`، `opacity`، `filter`، `clip-path` را انیمیت کنید. تغییر رنگ با `--ac-ease-hover`.
2. ورود و خروج = منحنی ease-out. حرکت روی صفحه = ease-in-out یا فنر. **هرگز ease-in برای UI.**
3. UI زیر ۳۰۰ms. شیت‌ها حدود ۴۲۰ms با منحنی کشو.
4. خروج سریع‌تر از ورود (`--ac-dur-exit` = 140ms).
5. بازخورد فشردن فوری (`:active`، ۱۰۰ms). حرکتِ hover فقط با `(hover: hover) and (pointer: fine)`.
6. تغییرهای کیبوردی فوری‌اند (پالت فرمان، هایلایت لیست).
7. پاپ‌اور از مبدأ دکمه بزرگ می‌شود؛ مودال از مرکز.

## منحنی‌ها

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-ease` | `cubic-bezier(.23,1,.32,1)` | پیش‌فرض UI |
| `--ac-ease-out` | `cubic-bezier(.19,1,.22,1)` | آشکارشدن، بلندشدن، ورود پله‌ای |
| `--ac-ease-in-out` | `cubic-bezier(.77,0,.175,1)` | حرکت روی صفحه |
| `--ac-ease-move` | `cubic-bezier(.25,1,.5,1)` | اسلاید پنل |
| `--ac-ease-drawer` | `cubic-bezier(.32,.72,0,1)` | شیت و کشو |
| `--ac-ease-hover` | `ease` | تغییر رنگ |
| `--ac-spring` | `linear(...)`، ۴۰۰ms | پیل، شاخص، سوییچ |
| `--ac-spring-bounce` | `linear(...)`، ۷۰۰ms | آیکون، نشان؛ کم‌استفاده |

مدت‌ها: `--ac-dur-0…4` = 100 / 140 / 180 / 240 / 300ms، `--ac-dur-sheet` = 420ms. فاصلهٔ ورود پله‌ای `--ac-stagger` = 45ms. فشردن `--ac-press` (0.97)، بلند شدن کارت `--ac-lift` (‏-4px).

## انتخاب سریع

| چه می‌خواهید | استفاده |
|---|---|
| دکمه/لینک hover | رنگ با `--ac-ease-hover` + `--ac-dur-1` |
| منو، پاپ‌اور | `--ac-ease` + `--ac-dur-2` |
| مودال | `--ac-ease` + `--ac-dur-4` |
| شیت/کشو | `--ac-ease-drawer` + `--ac-dur-sheet` |
| شاخص تب/پیل | `--ac-spring` |
| کارت‌ها در ورود صفحه | `.ac-stagger` (حداکثر ۷ پله) |

## کاهش حرکت: ترجیح است، نه کلید خاموش

`<html data-motion="full|reduced">` پیش از رسم صفحه توسط `boot.js` از ترجیح ذخیره‌شده (`ac:motion`) تعیین می‌شود؛ مقدار `system` از `prefers-reduced-motion` پیروی می‌کند. کاربری که در ویندوز «Animation effects» را خاموش کرده، همه‌ی مرورگرها را در حالت *reduce* می‌بینند؛ پس کاربر می‌تواند در سفارشی‌ساز یا صفحهٔ تنظیمات (`data-ac="motion-pref"`) «کامل» را انتخاب کند.

حالت `reduced`:
- **می‌ماند:** محو شدن، رنگ، همه‌ی cross-fadeها، شمارنده، رسم نمودار.
- **حذف می‌شود:** جابه‌جایی (هر keyframe فاصله‌اش را در `--ac-travel` ضرب می‌کند که 0 می‌شود)، فنرها، transitionهای transform، حلقه‌های تزئینی (shimmer، pulse).
- `data-motion="off"` همه‌چیز را خاموش می‌کند.

در JS: `AC.reducedMotion()` یعنی «حرکت مکانی را رد کن»، نه «بازخورد را رد کن».

```js
AC.motion.spring(el, { x: 120, scale: [0.9, 1] });    // WAAPI فنری و قابل قطع
AC.motion.countUp(el, 1234);
AC.motion.preference = 'reduced';                     // system | full | reduced
```

## چیزهایی که نباید بسازید

- انیمیشن ورود برای چیزی که کاربر صدبار در روز می‌بیند.
- انیمیشن `width/height/top/left` (به‌جای آن `transform`).
- مدت بالای ۳۰۰ms برای UI روزمره.
- حرکت جهت‌دار با `translateX(24px)` خام. به‌جای آن: `translateX(calc(24px * var(--ac-dir)))` تا در RTL آینه شود.
