# راهنمای استفاده از مهارت‌ها (Skills)

AraminConsole دو مهارت آماده برای دستیارهای هوش مصنوعی دارد:

| مهارت | پوشه | برای چه |
|---|---|---|
| `aramin-console` | `skills/aramin-console/` | **ساختن**: نشانه‌گذاری، کلاس‌ها، کامپوننت‌های `data-ac`، API، دستورهای آماده |
| `aramin-design-system` | `skills/aramin-design-system/` | **طراحی و بازبینی**: توکن‌ها، الگوها، قواعد RTL، متن رابط، فهرست وارسی |

هر دو کنار هم بهترین نتیجه را می‌دهند: اولی می‌داند «چه بنویسد»، دومی می‌داند «چطور باشد».

## مهارت چیست؟

مهارت (Agent Skill) یک پوشه با فایل `SKILL.md` است. بالای فایل دو خط `name` و `description` (توضیح «چه وقت استفاده شود») قرار دارد. دستیار فقط توضیح را همیشه می‌بیند و وقتی کار شما به آن مربوط شد، متن کامل را بارگذاری می‌کند. پس هزینهٔ توکن کم است و دستیار قواعد پروژه را «از حفظ» رعایت می‌کند.

## نصب در Claude Code

### برای یک پروژه (پیشنهادی)

bash (لینوکس، مک، Git Bash):

```bash
mkdir -p .claude/skills
cp -r path/to/AraminConsole/skills/aramin-console .claude/skills/
cp -r path/to/AraminConsole/skills/aramin-design-system .claude/skills/
```

PowerShell (ویندوز):

```powershell
New-Item -ItemType Directory -Force .claude\skills | Out-Null
Copy-Item -Recurse path\to\AraminConsole\skills\aramin-console .claude\skills\
Copy-Item -Recurse path\to\AraminConsole\skills\aramin-design-system .claude\skills\
```

### برای همهٔ پروژه‌ها

bash:

```bash
mkdir -p ~/.claude/skills
cp -r AraminConsole/skills/aramin-console AraminConsole/skills/aramin-design-system ~/.claude/skills/
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force $HOME\.claude\skills | Out-Null
Copy-Item -Recurse AraminConsole\skills\aramin-console, AraminConsole\skills\aramin-design-system $HOME\.claude\skills\
```

بعد Claude Code را دوباره باز کنید (یا یک گفتگوی تازه شروع کنید). بررسی: بپرسید «چه مهارت‌هایی داری؟» یا دستور `/skills` را بزنید.

### بدون کپی: دانلود مستقیم

```bash
mkdir -p .claude/skills/aramin-design-system
curl -L https://raw.githubusercontent.com/ARaminco/AraminConsole/main/skills/aramin-design-system/SKILL.md -o .claude/skills/aramin-design-system/SKILL.md
```

(مهارت `aramin-console` پوشهٔ `reference/` هم دارد؛ برای آن بهتر است کل پوشه را کپی کنید.)

## نصب در Claude.ai و برنامهٔ دسکتاپ

1. پوشهٔ مهارت را zip کنید (خودِ پوشه داخل zip باشد، نه فقط فایل‌هایش):
   - bash: `cd skills && zip -r aramin-design-system.zip aramin-design-system`
   - PowerShell: `Compress-Archive skills\aramin-design-system aramin-design-system.zip`
2. در Claude: **Settings ← Capabilities ← Skills ← Upload skill** و فایل zip را انتخاب کنید (در برخی نسخه‌ها مسیر در Customize ← Skills است).
3. مهارت را روشن کنید. همین کار را برای `aramin-console` انجام دهید.

## Codex، Cursor، Copilot و دستیارهای دیگر

این ابزارها قالب «مهارت» ندارند، اما همان متن را به‌صورت دستورالعمل پروژه می‌خوانند:

| ابزار | کار |
|---|---|
| **Codex / ابزارهای AGENTS.md** | فایل `AGENTS.md` ریشهٔ مخزن را بخوانند؛ این مخزن یکی دارد. در پروژهٔ خودتان آن را کپی کنید و خط «طراحی: `skills/aramin-design-system/SKILL.md` را بخوان» اضافه کنید |
| **Cursor** | محتوای `SKILL.md` را در `.cursor/rules/aramin-design-system.mdc` بگذارید (بالای فایل `description:` و `alwaysApply: false` یا `globs: "**/*.html,**/*.css"`) |
| **GitHub Copilot** | محتوا را در `.github/copilot-instructions.md` اضافه کنید |
| **Windsurf / دیگران** | همان متن را در فایل قواعد پروژه |

برای Cursor: فایل `.cursor/rules/aramin-design-system.mdc` را بسازید، بالای آن این چهار خط را بگذارید: `---` / `description: AraminConsole design system rules` / `alwaysApply: false` / `---` بگذارید و زیرش بخش بعد از frontmatter فایل `SKILL.md` را کپی کنید.

## استفاده از llms.txt

`llms.txt` فهرست مستندات برای مدل‌هاست و `llms-full.txt` همهٔ مستندات در یک فایل. دو راه:

- آدرس را در گفتگو بدهید: «این را بخوان: `https://raw.githubusercontent.com/ARaminco/AraminConsole/main/llms.txt`». دستیار فقط فایل‌های لازم را می‌خواند.
- در ابزارهایی که «Docs/Context» دارند (مثل Cursor ← Docs) همان آدرس را اضافه کنید.

از `llms-full.txt` فقط در گفتگوهای کوتاه و مستقل استفاده کنید؛ حجم زیادی دارد.

## نمونه درخواست‌ها

با کامپوننت‌ها (مهارت `aramin-console`):

> با آرامین‌کنسول یک صفحهٔ مدیریت کاربران بساز: جدول با جستجو و فیلتر وضعیت، دکمهٔ «کاربر جدید» که مودال فرم باز کند، و تأیید قبل از حذف. موبایل و RTL را رعایت کن.

> یک داشبورد فروش بساز با چهار KPI، نمودار ناحیه‌ای ماهانه و جدول آخرین سفارش‌ها. مبلغ‌ها به تومان.

> فرم ثبت‌نام با اعتبارسنجی موبایل و کد ملی و انتخاب تاریخ تولد شمسی.

با طراحی (مهارت `aramin-design-system`):

> این صفحه را با سیستم طراحی آرامین‌کنسول بازبینی کن و مشکلات را با شمارهٔ خط بنویس: رنگ خام، left/right، کنتراست، حالت خالی.

> برای برند ما یک پریست رنگی بساز (رنگ اصلی `#0e9f6e`) و کنتراست روشن و تیره را بسنج.

> متن‌های رابط این صفحه را طبق راهنمای نوشتار فارسی اصلاح کن.

> به این صفحه حالت‌های بارگذاری، خالی و خطا اضافه کن.

نکته: صریح بگویید «از مهارت X استفاده کن» تا مطمئن شوید بارگذاری شد؛ ولی معمولاً کلمه‌هایی مثل «پنل مدیریت»، «داشبورد» یا «آرامین‌کنسول» خودکار آن را فعال می‌کنند.

## به‌روز نگه‌داشتن

مهارت‌ها یک نسخهٔ کپی از مخزن‌اند و خودکار به‌روز نمی‌شوند.

- اگر مخزن را clone کرده‌اید: `git pull` و دوباره کپی (دستورهای بالا روی نسخهٔ قبلی می‌نویسند).
- اگر به `dist/` وابسته‌اید: همزمان `dist/` را هم به‌روز کنید تا نام‌ها با مهارت بخواند.
- تغییرات را در `CHANGELOG.md` ببینید.
- مهارت طراحی با `npm run tokens` و `docs/design-system/tokens.md` هم‌گام است؛ اگر `tokens.css` را سفارشی کرده‌اید، قواعد مهارت را در پوشهٔ پروژهٔ خودتان با مقادیر خودتان ویرایش کنید (کپی شما مال شماست).
- یک یادآور بگذارید: ماهی یک بار یا هر بار که نسخهٔ AraminConsole را بالا می‌برید.

## عیب‌یابی

| مشکل | راه‌حل |
|---|---|
| مهارت دیده نمی‌شود | مسیر درست است؟ `.claude/skills/<name>/SKILL.md`؛ برنامه را دوباره باز کنید |
| فعال نمی‌شود | نام مهارت را صریح بگویید؛ `description` را بررسی کنید |
| دستیار از `left/right` یا رنگ خام استفاده می‌کند | بخواهید «طبق مهارت aramin-design-system بازبینی کن» |
| آیکون وجود ندارد | نام را به `src/icons/icons.txt` اضافه و `npm run build` |

مرجع انگلیسی کوتاه: [skills-guide.md](skills-guide.md). سیستم طراحی: [design-system/README.md](design-system/README.md).
