# مرجع توکن‌ها

> این فایل را اسکریپت `scripts/tokens-doc.mjs` از `src/css/tokens.css` می‌سازد (`npm run tokens`). دستی ویرایشش نکنید. خروجی ماشین‌خوان: `dist/tokens.json`.

همهٔ توکن‌ها پیشوند `--ac-` دارند. تم پیش‌فرض **Air** است؛ ستون‌های «روشن» و «تیره» مقدار نهایی بعد از اعمال تم Air هستند. جهت‌دهی با صفت‌های روی `<html>`: `data-theme` (light | dark)، `data-accent`، `data-density`، `data-radius`.

## رنگ

### برند و جوهر

| توکن | روشن (Air) | تیره (Air) | کاربرد |
|---|---|---|---|
| `--ac-accent` | `#0b7f8a` | `#13b5c2` | رنگ برند؛ فوکوس، سوییچ روشن، نمودار، دکمهٔ رنگی |
| `--ac-accent-2` | `#0c8893` | `#4fd0da` | شریکِ گرادیان |
| `--ac-accent-contrast` | `#ffffff` | `#0f1b28` | متن روی accent پر |
| `--ac-highlight` | `#f5a524` | `#ffb020` | تنها لکهٔ گرم (شمارندهٔ اعلان، نقطهٔ داک) |
| `--ac-highlight-contrast` | `#0f1b28` | `#0f1b28` | متن روی highlight |
| `--ac-ink` | `#1b2836` | `#eef3f6` | جوهر: دکمهٔ اصلی و پیل فعال ناوبری |
| `--ac-ink-hover` | `#2c3d50` | `#d5dee5` | ink در hover |
| `--ac-ink-contrast` | `#ffffff` | `#0f1b28` | متن روی ink |

### بوم و سطوح

| توکن | روشن (Air) | تیره (Air) | کاربرد |
|---|---|---|---|
| `--ac-bg` | `#f1f5f7` | `#0f1b28` | بوم صفحه |
| `--ac-bg-subtle` | `#e9eff2` | `#122130` | بومِ کمی تیره‌تر |
| `--ac-surface-1` | `#ffffff` | `#162534` | کارت‌ها و پیل‌ها |
| `--ac-surface-2` | `#f5f8fa` | `#1b2c3d` | پنل فرورفته، کاشی KPI |
| `--ac-surface-3` | `#e8eef1` | `#233649` | ترک‌ها (track) |
| `--ac-elevated` | `#ffffff` | `#1b2c3d` | سطح بالاآمده (منو، پاپ‌اور) |
| `--ac-chrome-bg` | `#ffffff` | `#162534` | پیل‌های شناور (نوار بالا، ریل، تب‌بار) |
| `--ac-pill-bg` | `#f1f5f7` | `#1d2e40` | دکمهٔ پیلِ ثانویه و فیلد جستجو |
| `--ac-pill-bg-hover` | `#e6edf1` | `#263a4f` | pill-bg در hover |

### تعامل و مرز

| توکن | روشن (Air) | تیره (Air) | کاربرد |
|---|---|---|---|
| `--ac-hover` | `rgba(27, 40, 54, 0.04)` | `rgba(255, 255, 255, 0.05)` | لایهٔ hover |
| `--ac-active` | `rgba(27, 40, 54, 0.075)` | `rgba(255, 255, 255, 0.09)` | لایهٔ فشرده |
| `--ac-border` | `#e3e9ed` | `#223446` | خط مویی |
| `--ac-border-strong` | `#d3dce2` | `#2e4459` | مرز پررنگ‌تر |
| `--ac-scrim` | `rgba(15, 27, 40, 0.34)` | `rgba(5, 10, 16, 0.62)` | پس‌زمینهٔ تیرهٔ پنجره‌ها |

### متن

| توکن | روشن (Air) | تیره (Air) | کاربرد |
|---|---|---|---|
| `--ac-text` | `#0f1b28` | `#eef3f6` | متن اصلی |
| `--ac-text-soft` | `#3f4e5d` | `#b4c2cf` | متن ثانویه |
| `--ac-muted` | `#5f6e7d` | `#8496a7` | متن کم‌رنگ (برچسب‌ها) |
| `--ac-faint` | `#a9b6c1` | `#546577` | تزئینی/غیرفعال؛ برای متنِ لازم کافی نیست |

### وضعیت

| توکن | روشن (Air) | تیره (Air) | کاربرد |
|---|---|---|---|
| `--ac-success` | `#16a34a` | `#2ecf7a` | موفقیت |
| `--ac-success-soft` | `#e8f6ec` | `rgba(46, 207, 122, 0.12)` | پس‌زمینهٔ نشان موفقیت |
| `--ac-success-ink` | `#13803c` | `#5fe09a` | متن موفقیت روی soft |
| `--ac-warning` | `#e08a00` | `#f5b03d` | هشدار |
| `--ac-warning-soft` | `#fff4e0` | `rgba(245, 176, 61, 0.13)` | پس‌زمینهٔ هشدار |
| `--ac-warning-ink` | `#995a00` | `#fbc76c` | متن هشدار روی soft |
| `--ac-danger` | `#e5484d` | `#f2555a` | خطا / حذف |
| `--ac-danger-soft` | `#fdeceb` | `rgba(242, 85, 90, 0.13)` | پس‌زمینهٔ خطا |
| `--ac-danger-ink` | `#c0282e` | `#ff8a8e` | متن خطا روی soft |
| `--ac-info` | `#2f7cf6` | `#4d94ff` | اطلاع |
| `--ac-info-soft` | `#e9f1ff` | `rgba(77, 148, 255, 0.13)` | پس‌زمینهٔ اطلاع |
| `--ac-info-ink` | `#1b5bc4` | `#8bb8ff` | متن اطلاع روی soft |
| `--ac-neutral-soft` | `rgba(27, 40, 54, 0.06)` | `rgba(255, 255, 255, 0.07)` | پس‌زمینهٔ خنثی |
| `--ac-neutral-ink` | `#3f4e5d` | `#c4d0db` | متن خنثی |

### نمودار

| توکن | روشن (Air) | تیره (Air) | کاربرد |
|---|---|---|---|
| `--ac-chart-1` | `var(--ac-ink)` | `var(--ac-ink)` | black series |
| `--ac-chart-2` | `var(--ac-accent)` | `var(--ac-accent)` | orange highlight |
| `--ac-chart-3` | `#f5a524` | `#ffb020` |  |
| `--ac-chart-4` | `#9fdde2` | `#1f6f78` |  |
| `--ac-chart-5` | `#22a06b` | `#22a06b` |  |
| `--ac-chart-6` | `#3b82f6` | `#3b82f6` |  |
| `--ac-chart-7` | `#f5a524` | `#f5a524` |  |
| `--ac-chart-8` | `#d3dce2` | `#2e4459` |  |
| `--ac-chart-grid` | `rgba(27, 40, 54, 0.07)` | `rgba(255, 255, 255, 0.07)` | خطوط شبکهٔ نمودار |

### شیشه

| توکن | روشن (Air) | تیره (Air) | کاربرد |
|---|---|---|---|
| `--ac-glass-bg` | `rgba(255, 255, 255, 0.78)` | `rgba(22, 37, 52, 0.72)` | شیشهٔ نیمه‌شفاف |
| `--ac-glass-bg-strong` | `rgba(255, 255, 255, 0.92)` | `rgba(22, 37, 52, 0.9)` | شیشهٔ کدرتر |
| `--ac-glass-border` | `rgba(27, 40, 54, 0.07)` | `rgba(255, 255, 255, 0.07)` | مرز شیشه |
| `--ac-glass-blur` | `saturate(180%) blur(20px)` | `saturate(180%) blur(20px)` | فیلتر محو شیشه |

### سایه‌ها

| توکن | روشن | تیره | کاربرد |
|---|---|---|---|
| `--ac-shadow-xs` | `0 1px 2px rgba(17, 17, 19, 0.03)` | `0 1px 2px rgba(0, 0, 0, 0.4)` | کمینه (کارت ساکن) |
| `--ac-shadow-sm` | `0 1px 2px rgba(17, 17, 19, 0.03), 0 2px 8px -4px rgba(17, 17, 19, 0.05)` | `0 1px 2px rgba(0, 0, 0, 0.35)` | کارت |
| `--ac-shadow-md` | `0 2px 4px rgba(17, 17, 19, 0.03), 0 10px 24px -10px rgba(17, 17, 19, 0.12)` | `0 2px 4px rgba(0, 0, 0, 0.35), 0 10px 24px -10px rgba(0, 0, 0, 0.6)` | hover کارت، منو |
| `--ac-shadow-lg` | `0 2px 6px rgba(17, 17, 19, 0.04), 0 18px 40px -14px rgba(17, 17, 19, 0.18)` | `0 2px 6px rgba(0, 0, 0, 0.4), 0 18px 40px -14px rgba(0, 0, 0, 0.7)` | پاپ‌اور |
| `--ac-shadow-xl` | `0 4px 10px rgba(17, 17, 19, 0.05), 0 30px 64px -18px rgba(17, 17, 19, 0.26)` | `0 4px 10px rgba(0, 0, 0, 0.45), 0 30px 64px -18px rgba(0, 0, 0, 0.8)` | مودال و شیت |
| `--ac-shadow-glow` | `0 10px 24px -8px color-mix(in oklab, var(--ac-accent) 60%, transparent)` | `0 10px 24px -8px color-mix(in oklab, var(--ac-accent) 60%, transparent)` | درخششِ رنگ برند |
| `--ac-shadow-inset` | `inset 0 1px 0 rgba(255, 255, 255, 0.6)` | `inset 0 1px 0 rgba(255, 255, 255, 0.04)` | برجستگی داخلی |
| `--ac-shadow-chrome` | `0 1px 2px rgba(17, 17, 19, 0.03), 0 6px 18px -10px rgba(17, 17, 19, 0.12)` | `0 1px 2px rgba(0, 0, 0, 0.4)` | پیل‌های شناور |

### توکن‌های مشتق

این‌ها را override نکنید؛ از accent و تم پیروی می‌کنند.

| توکن | تعریف | کاربرد |
|---|---|---|
| `--ac-accent-hover` | `color-mix(in oklab, var(--ac-accent) 88%, var(--ac-mix-toward))` | مشتق: accent در hover |
| `--ac-accent-soft` | `color-mix(in oklab, var(--ac-accent) 11%, transparent)` | مشتق: زمینهٔ ملایم accent |
| `--ac-accent-soft-2` | `color-mix(in oklab, var(--ac-accent) 18%, transparent)` | مشتق: زمینهٔ ملایم پررنگ‌تر |
| `--ac-accent-ink` | `color-mix(in oklab, var(--ac-accent) 85%, var(--ac-mix-toward))` | مشتق: accent خوانا برای متن |
| `--ac-ring` | `color-mix(in oklab, var(--ac-accent) 38%, transparent)` | مشتق: حلقهٔ فوکوس |
| `--ac-focus` | `0 0 0 3px var(--ac-ring)` | مشتق: box-shadow فوکوس |
| `--ac-gradient` | `linear-gradient(150deg, var(--ac-accent-2) 0%, var(--ac-accent) 70%)` | مشتق: گرادیان برند |
| `--ac-aurora` | `radial-gradient(60% 80% at 15% 0%, color-mix(in oklab, var(--ac-accent) 18%, transparent), transparent 70%), radial-gradient(50% 70% at 85% 10%, color-mix(in oklab, var(--ac-accent-2) 14%, transparent), transparent 70%)` | مشتق: هالهٔ پس‌زمینه |

### پریست‌های accent

| پریست | accent روشن | accent تیره | accent-2 |
|---|---|---|---|
| `air` (پیش‌فرض) | `#0b7f8a` | `#13b5c2` | `#0c8893` |
| `orange` | `#f0532d` | `#f2603b` | `#ff7a4d` |
| `violet` | `#6d4aff` | `#8467ff` | `#a855f7` |
| `blue` | `#2563eb` | `#3b82f6` | `#06b6d4` |
| `emerald` | `#059669` | `#10b981` | `#84cc16` |
| `rose` | `#e11d48` | `#f43f5e` | `#f97316` |
| `amber` | `#d97706` | `#f59e0b` | `#ef4444` |
| `slate` | `#334155` | `#94a3b8` | `#64748b` |

## تایپوگرافی

### خانواده و اندازه

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-font` | `"Vazirmatn", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif` | قلم رابط |
| `--ac-font-mono` | `ui-monospace, "Cascadia Code", "SFMono-Regular", Menlo, Consolas, monospace` | قلم تک‌فاصله |
| `--ac-fs-2xs` | `0.6875rem` | ریزترین (نشان‌ها) |
| `--ac-fs-xs` | `0.75rem` | برچسب |
| `--ac-fs-sm` | `0.8125rem` | کمکی |
| `--ac-fs-md` | `0.875rem` | متن بدنه |
| `--ac-fs-lg` | `1rem` | متن درشت |
| `--ac-fs-xl` | `1.125rem` | تیتر کارت |
| `--ac-fs-2xl` | `1.375rem` | تیتر بخش |
| `--ac-fs-3xl` | `1.75rem` | تیتر صفحه |
| `--ac-fs-4xl` | `2.25rem` | عدد بزرگ / قهرمان |

### ارتفاع خط و وزن

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-lh-tight` | `1.2` | تیترها و اعداد |
| `--ac-lh-snug` | `1.4` | عنوان چندخطی |
| `--ac-lh-normal` | `1.65` | متن بدنه |
| `--ac-fw-regular` | `400` |  |
| `--ac-fw-medium` | `500` |  |
| `--ac-fw-semibold` | `600` |  |
| `--ac-fw-bold` | `700` |  |
| `--ac-fw-black` | `800` |  |

## فاصله‌گذاری

### مقیاس فاصله (گام 0.25rem)

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-s-0` | `0` |  |
| `--ac-s-1` | `0.25rem` |  |
| `--ac-s-2` | `0.5rem` |  |
| `--ac-s-3` | `0.75rem` |  |
| `--ac-s-4` | `1rem` |  |
| `--ac-s-5` | `1.25rem` |  |
| `--ac-s-6` | `1.5rem` |  |
| `--ac-s-7` | `1.75rem` |  |
| `--ac-s-8` | `2rem` |  |
| `--ac-s-9` | `2.25rem` |  |
| `--ac-s-10` | `2.5rem` |  |
| `--ac-s-11` | `2.75rem` |  |
| `--ac-s-12` | `3rem` |  |

### اندازه‌های وابسته به تراکم

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-control-h` | `2.5rem` | ارتفاع دکمه و ورودی |
| `--ac-control-h-sm` | `2rem` | کنترل کوچک |
| `--ac-control-h-lg` | `3rem` | کنترل بزرگ |
| `--ac-control-px` | `1rem` | پدینگ افقی کنترل |
| `--ac-card-pad` | `1.25rem` | پدینگ کارت |
| `--ac-row-h` | `3.25rem` | ارتفاع ردیف جدول/لیست |
| `--ac-gap` | `1rem` | فاصلهٔ شبکه |
| `--ac-touch` | `44px` | کمینهٔ هدف لمسی |

### تراکم (data-density)

| توکن | پیش‌فرض | `compact` |
|---|---|---|
| `--ac-control-h` | `2.5rem` | `2.125rem` |
| `--ac-control-h-sm` | `2rem` | `1.75rem` |
| `--ac-control-h-lg` | `3rem` | `2.5rem` |
| `--ac-control-px` | `1rem` | `0.7rem` |
| `--ac-card-pad` | `1.25rem` | `0.95rem` |
| `--ac-row-h` | `3.25rem` | `2.625rem` |
| `--ac-gap` | `1rem` | `0.75rem` |
| `--ac-fs-md` | `0.875rem` | `0.8125rem` |
| `--ac-appbar-h` | `4.5rem` | `4rem` |
| `--ac-pill-h` | `2.875rem` | `2.5rem` |

## گوشه‌ها

### شعاع (پیش‌فرض)

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-r-xs` | `6px` | چیپ کوچک |
| `--ac-r-sm` | `10px` | ورودی‌های ریز |
| `--ac-r-md` | `12px` | دکمه و ورودی |
| `--ac-r-lg` | `16px` | پنل‌های داخلی |
| `--ac-r-xl` | `22px` | کارت |
| `--ac-r-2xl` | `28px` | فلای‌اوت و شیت |
| `--ac-r-pill` | `999px` | پیل کامل |

### نوع شعاع (data-radius)

| توکن | پیش‌فرض | `sharp` | `round` |
|---|---|---|---|
| `--ac-r-xs` | `6px` | `2px` | `8px` |
| `--ac-r-sm` | `10px` | `3px` | `11px` |
| `--ac-r-md` | `12px` | `4px` | `14px` |
| `--ac-r-lg` | `16px` | `6px` | `18px` |
| `--ac-r-xl` | `22px` | `8px` | `24px` |
| `--ac-r-2xl` | `28px` | `10px` | `32px` |

## حرکت

### منحنی‌ها

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-ease` | `cubic-bezier(0.23, 1, 0.32, 1)` | پیش‌فرض UI (ورود/خروج) |
| `--ac-ease-out` | `cubic-bezier(0.19, 1, 0.22, 1)` | آشکارشدن، بلند شدن |
| `--ac-ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | حرکت روی صفحه |
| `--ac-ease-move` | `cubic-bezier(0.25, 1, 0.5, 1)` | اسلاید پنل |
| `--ac-ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | شیت و کشو |
| `--ac-ease-hover` | `ease` | تغییر رنگ |
| `--ac-ease-in` | `cubic-bezier(0.4, 0, 0.6, 1)` | فقط سازگاری؛ استفاده نکنید |
| `--ac-ease-spring` | `cubic-bezier(0.34, 1.4, 0.64, 1)` | فنر تقریبی با بازگشت کم |
| `--ac-spring` | `linear(0, 0.004 0.9%, 0.022 2.4%, 0.067 4.4%, 0.137 6.8%, 0.235 9.5%, 0.35 12.5%, 0.474 15.8%, 0.599 19.2%, 0.715 23%, 0.813 26.9%, 0.893 31%, 0.952 35.4%, 0.992 39.9%, 1.015 44.6%, 1.026 49.4%, 1.029 54.4%, 1.026 59.6%, 1.02 65%, 1.014 70.4%, 1.009 76.1%, 1.005 81.8%, 1.002 87.8%, 1 93.8%, 1)` | فنر جمع‌وجور (پیل، شاخص) |
| `--ac-spring-dur` | `400ms` | مدت spring |
| `--ac-spring-bounce` | `linear(0, 0.008 0.9%, 0.05 2.4%, 0.148 4.4%, 0.298 6.8%, 0.496 9.5%, 0.702 12.5%, 0.889 15.8%, 1.035 19.2%, 1.122 23%, 1.152 26.9%, 1.135 31%, 1.093 35.4%, 1.045 39.9%, 1.006 44.6%, 0.984 49.4%, 0.977 54.4%, 0.981 59.6%, 0.99 65%, 0.998 70.4%, 1.002 76.1%, 1.004 81.8%, 1.003 87.8%, 1.001 93.8%, 1)` | فنر بازیگوش (آیکون، نشان)، کم‌استفاده |
| `--ac-spring-bounce-dur` | `700ms` | مدت spring-bounce |

### مدت‌ها و ابزار حرکتی

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-dur-0` | `100ms` | بازخورد فشردن |
| `--ac-dur-1` | `140ms` | hover، تولتیپ |
| `--ac-dur-2` | `180ms` | دراپ‌داون، پاپ‌اور |
| `--ac-dur-3` | `240ms` | تب و پنل |
| `--ac-dur-4` | `300ms` | مودال و صفحه |
| `--ac-dur-sheet` | `420ms` | شیت و کشو |
| `--ac-dur-exit` | `140ms` | خروج (سریع‌تر از ورود) |
| `--ac-stagger` | `45ms` | تأخیر بین هم‌شیفت‌ها |
| `--ac-press` | `scale(0.97)` | مقیاس هنگام فشردن |
| `--ac-press-sm` | `scale(0.92)` | دکمه‌های گردِ کوچک |
| `--ac-lift` | `translateY(-4px)` | بلند شدن کارت |
| `--ac-dir` | `1` | ضریب جهت: 1 چپ‌به‌راست، -1 راست‌به‌چپ |

## لایه‌ها (z-index)

### ترتیب لایه‌ها

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-z-base` | `1` | محتوا |
| `--ac-z-sticky` | `20` | سرستون چسبان |
| `--ac-z-rail` | `40` | ریل |
| `--ac-z-appbar` | `50` | نوار بالا |
| `--ac-z-tabbar` | `55` | تب‌بار |
| `--ac-z-dropdown` | `60` | منو |
| `--ac-z-drawer` | `70` | کشو |
| `--ac-z-sheet` | `80` | شیت پایین |
| `--ac-z-modal` | `90` | مودال |
| `--ac-z-toast` | `100` | اعلان گذرا |
| `--ac-z-palette` | `110` | پالت فرمان |
| `--ac-z-tooltip` | `120` | راهنمای شناور |

## چیدمان

### ابعاد چیدمان

| توکن | مقدار | کاربرد |
|---|---|---|
| `--ac-appbar-h` | `4.5rem` | ارتفاع ردیف بالا |
| `--ac-tabbar-h` | `4rem` | ارتفاع تب‌بار |
| `--ac-rail-w` | `3.25rem` | عرض ریل |
| `--ac-rail-w-collapsed` | `3.25rem` | عرض ریل جمع‌شده |
| `--ac-flyout-w` | `16.5rem` | عرض فلای‌اوت |
| `--ac-pill-h` | `2.875rem` | ارتفاع پیل‌های بالا |
| `--ac-content-max` | `96rem` | بیشینهٔ عرض محتوا |
| `--ac-content-pad` | `clamp(1rem, 2vw, 1.75rem)` | پدینگ محتوا |
| `--ac-safe-top` | `env(safe-area-inset-top, 0px)` | ناحیهٔ امن بالا |
| `--ac-safe-bottom` | `env(safe-area-inset-bottom, 0px)` | ناحیهٔ امن پایین |
| `--ac-safe-start` | `env(safe-area-inset-left, 0px)` | ناحیهٔ امن ابتدا |
| `--ac-safe-end` | `env(safe-area-inset-right, 0px)` | ناحیهٔ امن انتها |

