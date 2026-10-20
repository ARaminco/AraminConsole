# رنگ

مقادیر کامل (روشن، تیره، کاربرد) در [tokens.md](tokens.md) هستند و خودکار از `tokens.css` ساخته می‌شوند. این صفحه نقش‌ها و قواعد را توضیح می‌دهد.

## تغییر تم

صفت‌های روی `<html>`:

| صفت | مقدارها |
|---|---|
| `data-theme` | `light` · `dark` (بدون مقدار = پیروی از سیستم) |
| `data-accent` | `air` (پیش‌فرض) · `orange` · `violet` · `blue` · `emerald` · `rose` · `amber` · `slate` |

```js
AC.theme.set({ theme: 'dark', accent: 'orange' });
AC.theme.toggle();
```

## نقش‌ها

| گروه | توکن‌ها | قاعده |
|---|---|---|
| بوم و سطح | `--ac-bg`، `--ac-bg-subtle`، `--ac-surface-1/2/3`، `--ac-elevated`، `--ac-chrome-bg`، `--ac-pill-bg` | صفحه روی `bg`؛ کارت روی `surface-1`؛ پنل فرورفته و KPI روی `surface-2`؛ ترک‌ها روی `surface-3` |
| متن | `--ac-text`، `--ac-text-soft`، `--ac-muted`، `--ac-faint` | `faint` تزئینی است و برای متنِ ضروری ممنوع |
| مرز | `--ac-border` (مویی)، `--ac-border-strong` | کارت‌ها همیشه با `border` |
| جوهر | `--ac-ink`، `--ac-ink-hover`، `--ac-ink-contrast` | دکمهٔ اصلی، پیل فعال |
| برند | `--ac-accent`، `--ac-accent-2`، `--ac-accent-contrast` | تأکید؛ متن روی accent پر = `accent-contrast`؛ متنِ هم‌رنگ accent = `--ac-accent-ink` |
| برجسته | `--ac-highlight`، `--ac-highlight-contrast` | تنها لکهٔ گرم؛ در Air کهربایی |
| وضعیت | `success` `warning` `danger` `info` `neutral`، هرکدام با `-soft` و `-ink` | نشان وضعیت = زمینهٔ `-soft` + متن `-ink` |
| نمودار | `--ac-chart-1…8`، `--ac-chart-grid` | ترتیب سری‌ها؛ هیچ‌گاه رنگ تنها حامل معنی نباشد |
| تعامل | `--ac-hover`، `--ac-active`، `--ac-ring`، `--ac-focus` | لایه‌های شفاف روی هر سطح |

مشتق‌ها (`--ac-accent-hover`، `-soft`، `-soft-2`، `-ink`، `--ac-ring`، `--ac-gradient`) با `color-mix()` از `--ac-accent` ساخته می‌شوند؛ دستی تعیین نکنید.

## تم Air (پیش‌فرض) و پریست orange

| | Air روشن | Air تیره | orange روشن | orange تیره |
|---|---|---|---|---|
| accent | `#0b7f8a` | `#13b5c2` | `#f0532d` | `#f2603b` |
| ink | `#1b2836` | `#eef3f6` | `#111113` | `#ffffff` |
| bg | `#f1f5f7` | `#0f1b28` | `#f2f2f3` | `#0b0b0c` |
| surface-1 | `#ffffff` | `#162534` | `#ffffff` | `#161618` |
| highlight | `#f5a524` | `#ffb020` | برابر accent | برابر accent |

در Air نمودار: جوهر، فیروزه‌ای، کهربایی. در حالت تیره از خانوادهٔ سرمه‌ای برای بوم و سطح‌ها استفاده می‌شود.

## قواعد کنتراست (WCAG 2.x)

اندازه‌گیری‌شده برای Air:

| ترکیب | نسبت |
|---|---|
| سفید روی accent روشن | 4.75:1 |
| دکمهٔ ink روی سفید | 14.96:1 |
| متن اصلی روی بوم | 15.85:1 |
| `muted` روی سفید | 5.23:1 |
| سرمه‌ای روی accent تیره | 6.97:1 |
| متن روی سطح (تیره) | 13.74:1 |
| `muted` روی سطح (تیره) | 5.05:1 |

قواعد:
- متن معمولی ≥ 4.5:1، متن درشت و آیکون معنادار ≥ 3:1.
- روی accent پر همیشه `--ac-accent-contrast`؛ روی ink همیشه `--ac-ink-contrast`.
- برای متنِ رنگی از `*-ink` استفاده کنید نه خودِ رنگ (`--ac-danger` روی سفید ممکن است کم‌کنتراست باشد؛ `--ac-danger-ink` درست است).
- وضعیت را فقط با رنگ نشان ندهید: آیکون یا برچسب هم بگذارید.
- پریست جدید را قبل از انتشار با ابزار کنتراست بسنجید (ترکیب‌های بالا).

## نکات پیاده‌سازی

```css
.my-badge { background: var(--ac-success-soft); color: var(--ac-success-ink); }  /* درست */
.my-badge { background: #e8f6ec; color: #13803c; }                               /* غلط: رنگ خام */
```

رنگ‌های سازمانی دیگر (بانک‌ها، شبکه‌های کارت) از دادهٔ ماژول `money` می‌آیند و جزو توکن‌ها نیستند.
