# Iranian invoices — `invoice-ir` module

Files: `src/modules/invoice-ir/{invoice-ir.js,invoice-ir.css}`. Demo: `#/invoice-official`, `#/invoice-proforma`, `#/invoice-editor`. Test: `node tests/invoice-marketing.mjs --base=http://localhost:5178` (writes A4/A5 PDFs to `tests/screens/`).

Two documents from one data object:

- **Official** — «صورتحساب فروش کالا و خدمات», laid out like the tax organisation's standard form used with سامانهٔ مؤدیان: title, serial, Jalali date and «شماره منحصربه‌فرد مالیاتی»; «مشخصات فروشنده» / «مشخصات خریدار» (name, national ID / شناسه ملی, کد اقتصادی, شماره ثبت, کد پستی, phone, full address); the 11 standard columns (ردیف، کد کالا، شرح، تعداد/مقدار، واحد اندازه‌گیری، مبلغ واحد، مبلغ کل، مبلغ تخفیف، مبلغ کل پس از تخفیف، جمع مالیات و عوارض ارزش افزوده، جمع کل), totals row, amount in words, شرایط و نحوه فروش (نقدی / غیرنقدی), notes, seller and buyer stamp boxes.
- **Proforma (پیش‌فاکتور)** — brand header (logo or a generated mark), from / bill-to cards, a simpler table, totals with the amount due, bank accounts (bank logo, card number, Sheba, account no.), a QR **placeholder** (deterministic pattern, not a scannable code — render a real QR yourself and pass an image if you need one), notes, signatures and a "not an official tax invoice" line.

The module does **not** submit anything to سامانهٔ مؤدیان; it renders and prints. The unique tax ID is whatever your integration returns.

## API

```js
import { install } from 'aramin-console/src/modules/invoice-ir/invoice-ir.js'; // or the per-module bundle
install(AC);                                   // automatic when window.AC exists

const inv = AC.invoiceIR.render('#host', data, {
  type: 'official',            // 'official' | 'proforma' (default: data.type)
  unit: 'IRR',                 // display unit 'IRR' | 'IRT' (official defaults to Rial, proforma to AC.money.unit)
  digits: 'latn',              // 'latn' | 'fa'  (defaults to AC.i18n.digits)
  paper: 'a4l',                // 'a4' | 'a4l' | 'a5' | 'a5l' (official: a4l, proforma: a4)
  toolbar: true,               // Rial/Toman · ۱۲۳/123 · paper · Print/PDF
  labels: { official: '…' },   // override any label
});
inv.update(nextData); inv.set({ unit: 'IRT', paper: 'a5' }); inv.print(); inv.totals; inv.destroy();

AC.invoiceIR.totals(data)  // → { lines:[{qty, price, gross, discount, net, vat, total}], gross, discount, net, vat, shipping, total, rate }

const ed = AC.invoiceIR.editor('#form', { data, preview: inv, storageKey: 'ac:invoice-ir:draft' });
```
Declarative: `<div data-ac="invoice-ir" data-ac-config='{"type":"proforma","data":{…}}'></div>`.
Events: `ac:invoice-ir:change {opts}` (toolbar) · `ac:invoice-ir:edit {data}` (editor, after each change).

## Data shape

```js
{
  type: 'official',               // or 'proforma'
  currency: 'IRR',                // the unit amounts are stored in ('IRR' | 'IRT')
  serial: '1405-0287', date: '2026-10-20', validUntil: '2026-10-27',   // ISO; shown as Jalali
  taxId: 'A1F2C9D41B0000A3E7C2F1',
  vatRate: 10,                    // percent; per line: item.vatRate, item.vatExempt
  payment: 'cash',                // 'cash' | 'credit' | 'mixed'
  seller: { name, brand, tagline, logo, nationalId, economicCode, regNo, postalCode, phone, address },
  buyer:  { name, nationalId, economicCode, regNo, postalCode, phone, address },
  items: [{ code, title, note, qty, unit, price, discount /* amount */ , discountPercent, vatRate, vatExempt }],
  shipping: 0, shippingLabel: 'ارسال',
  bankAccounts: [{ holder, card, sheba, account, bank /* slug, optional */ }],   // proforma
  qr: 'https://pay.example/…', notes: '…', title: 'پیش‌فاکتور',
}
```
Maths: `gross = qty × price`, `net = gross − discount`, `vat = round(net × rate / 100)` **per line**, `total = Σ(net + vat) + shipping`. Toman display divides Rial by 10 (one decimal kept when needed). Inputs accept Persian/Arabic digits and separators (`AC.invoiceIR.parseNum`).

## VAT rate — keep it configurable

Iran's VAT («مالیات و عوارض ارزش افزوده») is set in law and has changed over the years: 9% (6% tax + 3% duties) for several years up to 1402, and 10% from 1403 under the budget law of that year. **I could not verify the rate for 1404/1405 at the time of writing** (no web access from the build machine), so the module defaults to `10` and every invoice can set `vatRate` (and each line `vatRate` / `vatExempt` for exempt goods and services). Check the rate with the tax organisation (intamedia.ir) or your accountant for the invoice's year before issuing.

## Print / PDF

- `inv.print()` (or the toolbar button) calls `window.print()`; "Save as PDF" in the dialog gives the PDF. Automated: Playwright `page.emulateMedia({ media: 'print' })` + `page.pdf({ preferCSSPageSize: true, printBackground: true })`.
- In print the shell, page head, toolbar, editor and floating widgets are hidden; the sheet prints 1:1 with no shadow.
- `@page { size; margin }` is written by the module for the chosen paper (A4/A5, portrait/landscape).
- `thead` repeats on every page, totals print once at the end, rows never split, and the words / terms / signatures block stays together.
- On screen the sheet is sized in mm and scaled to fit (`--aci-zoom`); it stays white paper in dark mode.

## Dependencies

Uses `AC.money.words` (amount in words), `AC.date.format` (Jalali), `AC.bank` (`detect`, `sheba.bank`, `logo`, `formatCard`, `sheba.format`) when present; falls back to a built-in Persian number-to-words, `Intl` Persian calendar and plain grouping otherwise. Labels are built in for fa / en (ar uses fa); any `invoiceIR.<key>` in the app dictionary overrides them.
