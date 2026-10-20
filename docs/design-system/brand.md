# برند

## تم Air (پیش‌فرض)

Air همان هویت بصری AIR است: **سرمه‌ای شب/جوهر** برای دکمهٔ اصلی و پیل فعال، **فیروزه‌ای** برای تأکید، و **یک** لکهٔ کهربایی (`--ac-highlight`) فقط برای شمارندهٔ اعلان و نقطهٔ داک. نمودارها: سرمه‌ای، فیروزه‌ای، کهربایی. حالت تیره از خانوادهٔ سرمه‌ای برای بوم و سطح‌ها استفاده می‌کند. مقادیر: [color.md](color.md) و [tokens.md](tokens.md).

بازگشت به ظاهر قدیمی: `data-accent="orange"` یا `AC.theme.set({ accent: 'orange' })`.

## مجوز و نشان تجاری

کد و توکن‌ها تحت MIT هستند. **لوگوی AIR نشان تجاری AIR است و تحت MIT نیست.** فایل‌های `demo/brand/air/` (لوگو، favicon، آیکون‌های اپ) و `docs/brand/` را در محصول خودتان استفاده نکنید؛ لوگوی خودتان را جایگزین کنید. جملهٔ «قدرت گرفته از ایر» (`.ac-powered`) را مگر با درخواست مالک پروژه نگه دارید.

## ساخت پریست برند

### روش ساده: بازنویسی توکن‌ها

```css
/* brand.css — بعد از aramin-console.css بارگذاری شود */
:root {
  --ac-accent: #0e9f6e;
  --ac-accent-2: #34d399;
  --ac-font: "Vazirmatn", system-ui, sans-serif;
  --ac-r-xl: 18px;
}
:root[data-theme="dark"] { --ac-accent: #31c48d; }
```

مشتق‌ها (`soft`، `ink`، `hover`، `ring`) خودکار از `--ac-accent` می‌آیند.

### روش کامل: پریست قابل انتخاب

```css
:root[data-accent="brand"] { --ac-accent: #0e9f6e; --ac-accent-2: #34d399; }
:root[data-theme="dark"][data-accent="brand"] { --ac-accent: #31c48d; }
```

```js
AC.theme.accents.push('brand');
AC.theme.set({ accent: 'brand' });
```

برای یک هویت کامل (مثل Air) دو بلوک بنویسید: یکی روشن با انتخاب‌گر `:root[data-accent="brand"]:not([data-theme="dark"])` و یکی تیره با `:root[data-theme="dark"][data-accent="brand"]`، و در آن‌ها `--ac-accent`، `--ac-accent-2`، `--ac-accent-contrast`، `--ac-ink*`، توکن‌های بوم/سطح/متن/مرز و در صورت نیاز `--ac-highlight` را تعیین کنید. برای رنگ نمونه در سفارشی‌ساز، `customizer.js` را به‌روز کنید. پیش‌فرض‌های `THEME_DEFAULTS` در `src/js/core.js` و `src/js/boot.js` را اگر پریست پیش‌فرض می‌شود تغییر دهید.

## فهرست وارسی پریست

- [ ] سفید (یا `accent-contrast`) روی accent ≥ 4.5:1.
- [ ] `ink` روی بوم ≥ 7:1 و `muted` روی سطح ≥ 4.5:1، در هر دو تم.
- [ ] `accent-ink` برای متن رنگی خوانا است.
- [ ] فقط یک رنگ گرم/برجسته.
- [ ] لوگو، favicon و آیکون‌های PWA جایگزین شده‌اند.
- [ ] صفحهٔ «سیستم طراحی» دمو را در هر دو تم نگاه کردید.
- [ ] `npm run tokens` را اجرا کردید تا `tokens.json` به‌روز شود.
