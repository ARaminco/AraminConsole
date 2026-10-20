# Iranian finance kit — money, calendars, banks, bank card

Files: `src/js/components/{money,date,bank,bank-card}.js` (+ calendar engine in `datepicker.js`), `src/css/components/finance.css`, `src/banks/` (metadata, logos, `SOURCES.md`). Module: `money` (+ `datepicker` for `AC.date`).
Build output: `dist/banks.svg` (logo sprite, lazy-loaded on first use, ≈410 KB / 66 KB gzip), `dist/banks.json`, `dist/LICENSE-bank-logos.txt`.
Demo: `#/finance` (and `#/manage`). Test: `node tests/finance.mjs [--base=http://localhost:5178]`.

> **Trademarks.** Bank and card-network logos are trademarks of their respective owners and are included for identification only. Sources and licences per logo: `src/banks/SOURCES.md`.

## Bidi rules (RTL pages)
Card numbers, Sheba/IBAN and amounts are always isolated LTR inside RTL text: live amounts render `<bdi dir="ltr">number</bdi> unit` inside an element whose `dir` follows the language, so a minus sign stays next to the digits («‎-4,275,000 تومان»). The bank card itself is laid out LTR (like a physical card); Iranian cards put the logo, holder and expiry on the right.

## Money — `AC.money`
Currencies: `IRR` (ریال), `IRT` (تومان = 10 ریال; not an ISO code), `USD EUR AED GBP TRY CNY`, and `GOLD` (گرم طلا ۱۸) / `COIN` (سکه).
```js
AC.money.format(12500000, { currency: 'IRT' })                         // "12,500,000 تومان" (fa) · "12,500,000 Toman" (en)
AC.money.format(125e6, { from: 'IRR', currency: 'IRT', compact: true }) // "12.5 میلیون تومان"
AC.money.format(3e9, { currency: 'IRR', compact: true })               // "3 میلیارد ریال"  · ≥ 10¹² Toman → "2.5 همت"
AC.money.format(1250, { currency: 'USD', lang: 'en' })                 // "$1,250"   · { digits: 'native' } → "۱۲٬۵۰۰٬۰۰۰ تومان"
AC.money.parts(-4275000, { currency: 'IRT' })                          // { num: '-4,275,000', unit: 'تومان', pre: false, dir: 'rtl', text }
AC.money.toWords(1200000)                                              // "یک میلیون و دویست هزار"  · { lang: 'en' } → "one million two hundred thousand"
AC.money.words(12.5, { currency: 'USD' })                              // "دوازده دلار و پنجاه سنت"
AC.money.convert(1000, 'IRT', 'IRR')                                   // 10000 — other pairs need AC.money.setRates({ USD: 1050000, … }) (rials per unit)
AC.money.parse('۱۲٬۵۰۰٫۵')                                            // 12500.5
AC.money.setUnit('IRR')                                                // page-wide display unit, persisted in ac:money-unit; event ac:money:unit
```
Options for `format`/`parts`: `currency`, `from` (stored currency, converted), `compact`, `display: auto|symbol|name|code|none`, `decimals`, `digits: latn|native`, `lang`, `sign`.
Persian/Arabic put the unit name after the number; English puts `$ € £ ¥ ₺` before and `IRR`/`AED` as a code prefix.

### Live amounts and the Rial/Toman switch
```html
<span data-ac-money="48250000000" data-currency="IRR" data-compact data-words></span>   <!-- follows the page unit -->
<span data-ac-money="1200000" data-currency="IRT" data-to="USD"></span>                 <!-- fixed target currency -->
<div data-ac="money-unit"></div>                                                        <!-- segmented «ریال / تومان» -->
```
Stored amounts in `IRR`/`IRT` follow `AC.money.unit`; switching re-renders every `[data-ac-money]` with a short number ticker (pop-in for compact values; off with reduced motion). `AC.money.html(amount, { currency, to, compact })` returns the same markup. Language and digit changes re-render too. `data-words` puts the amount in words in `title`.

### Money input — `data-ac="money"`
```html
<div class="ac-field">
  <label class="ac-label" for="amt">مبلغ</label>
  <div class="ac-input-group ac-money" data-ac="money" data-name="amount" data-currency="IRT" data-currencies="IRT,IRR,USD"><input class="ac-input" id="amt"></div>
</div>
```
Live thousand separators while typing (caret stays next to the same digit), Persian/Arabic digits accepted (shown in the active digit style), decimals only for currencies that have them, a unit picker when `data-currencies` lists more than one (switching Toman↔Rial converts the amount), and the amount in words under the field (`data-words="false"` to hide). Hidden inputs: `amount` (raw number) and `amount_currency`. Event `ac:money:change {value, currency, text, words}`; API `.value .currency .set(v, currency?) .clear()`.

### Tables and stat tiles
`AC.table` columns with `type: 'money'` and `currency: 'IRR'|'IRT'` (or `GOLD`/`COIN`) format through `AC.money` and follow the Rial/Toman switch; other ISO currencies keep `AC.format.number`. In KPI tiles put `<span data-ac-money=… data-compact>` in `.ac-kpi__value`.

## Dates — `AC.date` and the date picker
Calendars: `persian` (Jalali/Shamsi, default for fa), `gregory`, `islamic` (Hijri lunar, Umm al-Qura via `Intl`). Month and weekday names come from `Intl` in the active language; weeks start on Saturday for fa/ar.
```js
AC.date.format('2026-10-20', { calendar: 'persian', style: 'numeric', digits: 'native' }) // "۱۴۰۵/۰۷/۲۸"
AC.date.format('2026-10-20', { style: 'long' })     // "سه‌شنبه ۲۸ مهر ۱۴۰۵"  (styles: numeric short medium long month relative)
AC.date.format(d, { style: 'relative' })            // "۳ روز پیش"
AC.date.parts('2024-03-11', 'islamic')              // { y: 1445, m: 9, d: 1 }
AC.date.toDate(1405, 7, 28, 'persian')              // Date (UTC midnight) · AC.date.toISO(…) · AC.date.today()
AC.date.convert({ y: 1403, m: 1, d: 1 }, 'persian', 'gregory') // { y: 2024, m: 3, d: 20 }
AC.date.holidays(1405)                              // [{ iso, name, en, kind: 'solar'|'lunar' }]
AC.date.holiday('2026-03-21')                       // { name: 'جشن نوروز', … } · AC.date.isHoliday(d) (holiday or Friday)
AC.date.adjustHijri({ '1447-1': 1 })                // shift a Hijri month to Iran's announced date
```
ISO strings (`YYYY-MM-DD`) are taken literally; `Date` objects use their local Y/M/D.

**Holidays.** Solar holidays (Nowruz 1–4 Farvardin, 12 and 13 Farvardin, 14–15 Khordad, 22 Bahman, 29 Esfand) are fixed Jalali dates, checked against the official 1404–1406 calendars. Lunar holidays (Tasua, Ashura, Arbaeen, 28 Safar, last day of Safar, 8 and 17 Rabi al-Awwal, 3 Jumada al-Thani, 13 and 27 Rajab, 15 Sha'ban, 21 Ramadan, Eid al-Fitr ×2, 25 Shawwal, Eid al-Adha, Ghadir) are computed from their fixed Hijri dates with Umm al-Qura. **Approximation:** Iran fixes lunar months by local moon sighting, so a lunar holiday can be one day off (e.g. Ashura 1404: Umm al-Qura 2025-07-05, official 2025-07-06). Correct known months with `AC.date.adjustHijri`. Fridays are weekend.

**Date picker additions** (`data-ac="datepicker"`): the switch now offers شمسی / میلادی / قمری (`data-calendars="persian,gregory"` limits it); `data-secondary="gregory|persian|islamic|auto"` prints the equivalent day small under each day; Fridays and official holidays are red with the holiday name as tooltip/label (default on in fa; `data-holidays="true|false"`). Hidden values remain ISO Gregorian.

## Banks — `AC.bank`
```js
AC.bank.detect('6037991234567890')     // { slug: 'melli', fa, short, en, colors: [c1, c2], accent, bins, sheba, logo, country: 'IR' }
AC.bank.network('4111…')               // shetab | visa | mastercard | amex | unionpay | mir | jcb | discover | diners | null (Iranian BINs win)
AC.bank.luhn(n) · AC.bank.formatCard(n, { sep: '-', mask }) // "6037-9912-3456-7890" · AC.bank.mask(n) → "6037-99••-••••-7890"
AC.bank.sheba.valid('IR82 0540 1026 8002 0817 9090 02') · .bank(v) → parsian · .normalize(v) · .format(v)
AC.bank.iban.valid('DE89 3704 0044 0532 0130 00') · .format(v) · .country(v) · .checksum('IR', bban)
AC.bank.list() · .foreign() · .networks() · .get(slug)
AC.bank.logo('melli', { mono, network, class, title })  // <svg class="ac-bank-logo"><use href="#bank-melli"/></svg>
```
Validation rules added to forms: `data-ac-rules="sheba"`, `"iban"`, `"card"` (Luhn, any network).
Logos: `<svg class="ac-bank-logo [ac-bank-logo--sm|--lg]"><use href="#bank-melli"/></svg>`; `#bank-<slug>-mono` is single-colour (`currentColor`); networks are `#net-<slug>`. The sprite is fetched once (`AC.bank.load()`, next to the bundle, or `<html data-ac-banks="url">`).
Metadata (`src/banks/banks.json`): 37 Iranian banks and credit institutions (incl. the five merged into Sepah), 9 international banks, 10 networks — slug, fa/en names, card colours, BINs, Sheba code, logo kind.

## Bank card — `data-ac="bank-card"` / `AC.bankCard()`
```html
<div data-ac="bank-card" data-number="6037991044123459" data-holder="علی رامین" data-expiry="05/08" data-cvv="482"
     [data-bank="hsbc"] [data-expiry-format="jalali|gregorian"] [data-masked] [data-size="sm|md|lg|fluid"] [data-flip="false"] [data-tilt="false"]></div>
```
```js
const card = AC.bankCard('#card', { number, holder, expiry, cvv, bank, masked });
card.set({ number }); card.flip(); card.mask(true); card.bank; card.network; card.flipped
```
ISO/IEC 7810 ID-1 proportions (85.60 × 53.98 mm, ratio 1.586, corner radius 3.18 mm scaled with container units), EMV chip, contactless mark, bank logo and name (top right for Iranian cards), embossed number in groups (Amex 4-6-5), holder, expiry (`YY/MM` in Persian digits for Iranian cards in fa), network logo; theme gradient from the detected BIN with guilloche and grain; back with magnetic stripe, signature panel and CVV2. Motion: pointer tilt with glare (mouse only, off for touch and reduced motion), light sweep on hover/focus, spring 3D flip (click, Enter/Space), crossfade of theme and logo when the bank changes, digit tick while typing. `data-frozen` greys it out. Events `ac:bank-card:flip {flipped}`, `ac:bank-card:bank {bank, network}`.

### Live card form — `data-ac="card-form"`
Put a `[data-ac="bank-card"]` and inputs `[data-card="number|holder|expiry|cvv"]` inside: the number is grouped while typing, the bank is detected from six digits (badge with logo in the field, card theme morphs), Luhn marks complete numbers, expiry gets its slash, CVV2 focus flips the card. Combine with `data-ac="card-form form"` for validation (`data-ac-rules="card"`).

### Sheba input — `data-ac="sheba"`
`<div class="ac-input-group ac-sheba" data-ac="sheba" data-name="iban"><input class="ac-input"></div>` — `IR` prefix, 24 digits grouped by 4, bank logo from the bank code, live status line (valid / invalid / bank name), hidden value `IR…` only when valid. Event `ac:sheba:change {value, valid, bank}`; API `.value .set(v)`.
