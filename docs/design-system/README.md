# سیستم طراحی AraminConsole

این پوشه مرجع کامل طراحی رابط در AraminConsole است: اصول، توکن‌ها، الگوها و راهنمای نوشتار. همهٔ مقادیر از کد واقعی (`src/css/tokens.css`، `motion.css`، `base.css`، `layout.css`) گرفته شده‌اند؛ اگر چیزی با کد نخواند، کد درست است.

**نسخهٔ زنده:** صفحهٔ «سیستم طراحی» در دمو: <https://araminco.github.io/AraminConsole/demo/#/design-system> (رنگ‌ها با کلیک کپی می‌شوند، منحنی‌های حرکت قابل اجرا هستند).

## فهرست

| فایل | موضوع |
|---|---|
| [principles.md](principles.md) | اصول طراحی |
| [color.md](color.md) | رنگ: نقش‌ها، روشن/تیره، Air و پریست‌ها، کنتراست |
| [typography.md](typography.md) | قلم، مقیاس، وزن، اعداد فارسی |
| [spacing-layout.md](spacing-layout.md) | فاصله‌گذاری، شبکهٔ bento، نقاط شکست، ناحیهٔ امن |
| [shape-elevation.md](shape-elevation.md) | گوشه، سایه، لایه‌ها (z-index) |
| [motion.md](motion.md) | حرکت، منحنی‌ها، فنر، کاهش حرکت |
| [icons.md](icons.md) | آیکون‌ها (Lucide)، اسپرایت، وارونگی در RTL |
| [rtl-i18n.md](rtl-i18n.md) | راست‌به‌چپ و چندزبانه |
| [accessibility.md](accessibility.md) | دسترس‌پذیری |
| [patterns.md](patterns.md) | الگوها: صفحه، داشبورد، جدول، فرم، حالت‌ها، موبایل |
| [components.md](components.md) | فهرست کامپوننت‌ها: `data-ac` و زمان استفاده |
| [ux-writing.md](ux-writing.md) | نوشتار رابط فارسی: لحن، عدد، تاریخ، پول |
| [brand.md](brand.md) | برند Air و ساخت پریست برند |
| [tokens.md](tokens.md) | جدول توکن‌ها (تولیدشده با اسکریپت) |

## توکن‌ها برای ابزارها

```bash
npm run tokens      # می‌سازد: docs/design-system/tokens.md  و  dist/tokens.json
```

`dist/tokens.json` فرمت W3C Design Tokens دارد (`$value` و `$type`) و می‌توان آن را در Figma (Tokens Studio)، Style Dictionary یا هر ابزار دیگری خواند. این دستور بخشی از `npm run build` هم هست.

## دو قانون طلایی

1. **رنگ، فاصله، گوشه و حرکتِ خام ننویسید؛ فقط `var(--ac-*)`.** تم تیره، پریست‌ها، تراکم و شعاع همه با عوض‌شدن توکن‌ها کار می‌کنند.
2. **فقط ویژگی‌های منطقی CSS** (`margin-inline-start`، نه `margin-left`)؛ تا همه‌چیز در RTL و LTR درست بماند.

مرجع API کامل کامپوننت‌ها: `skills/aramin-console/` و `llms-full.txt`. مهارت (Skill) همین سیستم طراحی: `skills/aramin-design-system/SKILL.md`؛ راهنمای نصب: [skills-guide.fa.md](../skills-guide.fa.md).
