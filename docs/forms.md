# Forms & inputs

Files: `src/css/components/form.css`, `src/css/components/datepicker.css`, `src/js/components/form-{core,input,select,file,validate}.js`, `src/js/components/datepicker.js`. Demo: `#/forms`. Test: `node tests/forms.mjs [--base=http://localhost:5178] [--shots]`.

Every component initialises from `data-ac`, keeps a real form control (often hidden) as the source of truth so `FormData` works, accepts Persian/Arabic digits (normalised to Latin), and translates its own UI text (`form.*` keys; a built-in fa/en/ar table is used when the app dictionary has none).

## Layout
```html
<form class="ac-form" data-ac="form">
  <div class="ac-form-grid">                  <!-- 1 col on phones, 2 from 640px; --3 for three; .ac-span-full -->
    <div class="ac-field">
      <label class="ac-label" for="x">Name <span class="ac-label__req">*</span></label>
      <input class="ac-input" id="x" name="name" data-ac-rules="required|min:2">
      <p class="ac-help">Help text (hidden while an error shows)</p>
    </div>
  </div>
  <div class="ac-form-actions">…buttons…</div>
</form>
```
Sections: `.ac-form-section > .ac-form-section__title/__sub` (2-column on desktop). Review list: `<dl class="ac-form-summary">`.

## Text inputs
| Need | Markup |
|---|---|
| Plain | `<input class="ac-input">`, `<textarea class="ac-input">` (auto-grows), `<select class="ac-select">` |
| Prefix / suffix | `<div class="ac-input-group" data-ac="input"><span class="ac-input-group__affix">…</span><input class="ac-input">…</div>`; boxed affix: `ac-input-group__affix--box` |
| Clear button | `data-clear` on the group |
| Counter | `data-counter` + `maxlength` on the input |
| Floating label | group + `.ac-float`, `<label>` right after the input |
| Password | `<div class="ac-input-group" data-ac="password" [data-strength]>`; score helper `passwordScore(v)` (0–4) |
| Number stepper | `<div class="ac-number" data-ac="number"><input class="ac-input" type="number" min max step></div>` (press-and-hold repeats) |

## Choices
`<label class="ac-choice"><input class="ac-check|ac-radio|ac-switch" type="checkbox|radio"><span>Text<small>Hint</small></span></label>`; card style `.ac-choice--card`; groups `<fieldset class="ac-choice-group [--row]">`. Switches use `role="switch"`. `indeterminate` is styled. Checked check/radio = ink (black, white in dark); switch ON = accent.

Settings-style toggle rows (icon · title + muted description · switch, hairline separators):
```html
<div class="ac-toggle-list">
  <label class="ac-toggle-row">
    <span class="ac-toggle-row__icon"><svg class="ac-icon"><use href="#i-globe"/></svg></span>
    <span class="ac-toggle-row__text"><span class="ac-toggle-row__title">Online payments</span><span class="ac-toggle-row__desc">Shops and subscriptions</span></span>
    <input class="ac-switch" type="checkbox" role="switch" checked>
  </label>
</div>
```
Limit block (value + accent slider + min/max scale): `<div class="ac-limit"><div class="ac-limit__head"><label class="ac-limit__label" for="x">…</label><output class="ac-limit__value" for="x"></output></div><input class="ac-range" id="x" type="range" data-ac="range"><div class="ac-range-scale"><span>min</span><span>max</span></div></div>`.

## Range, rating, swatches, OTP
- `<input class="ac-range" type="range" data-ac="range" [data-bubble] [data-prefix] [data-suffix]>`. The fill follows direction (RTL-aware). `<output for="id">` is updated automatically.
- `<div class="ac-rating" data-ac="rating" data-name="score" data-value="3" [data-max="5"] [data-readonly]>`: arrow keys (RTL-aware), Home/End. Event `ac:rating:change {value}`.
- `<div class="ac-swatches" data-ac="swatches" data-name="color" data-colors="#6d4aff,#2563eb" data-value="#2563eb" [data-custom]>`. Event `ac:swatches:change {value}`.
- `<div class="ac-otp" data-ac="otp" data-length="6" data-name="otp" [data-mask]>`: auto-advance, paste fills every box, Backspace goes back, always LTR. Event `ac:otp:complete {value}`; API `.clear() .focus() .value`.

## Combobox, multi-select, tags
```html
<div class="ac-combo" data-ac="combobox" [data-multiple] [data-loader="cities"] [data-placeholder="…"] [data-min-chars="1"]>
  <select id="city" name="city" data-ac-rules="required"><optgroup label="…"><option value="thr" data-meta="021">Tehran</option></optgroup></select>
</div>
```
Type to filter (matches are highlighted; ی/ي and ک/ك are treated as equal). Keys: ↓/↑, PageUp/PageDown, Enter, Esc, and Backspace removes the last chip. Async source:
```js
AC.combobox.loader('cities', async (query, { signal }) => (await fetch(`/api/cities?q=${query}`, { signal })).json()); // [{ value, label, meta? }]
```
Event `ac:combobox:change {value, values, option}`; API `.set(v|[v]) .clear() .open() .close() .values`.
Tags: `<div class="ac-tags" data-ac="tags" data-name="skills" data-value="a,b" [data-max] [data-input-id]>`. Enter or comma adds, paste splits on commas and line breaks, duplicates are rejected. Hidden value is comma-joined. Event `ac:tags:change {values}`.

## Date & time (Jalali + Gregorian)
```html
<div class="ac-input-group ac-date" data-ac="datepicker" data-name="due" [data-calendar="persian|gregory"]
     [data-value="2024-10-19"] [data-min="…"] [data-max="…"] [data-week-start="6"]>
  <input class="ac-input" id="due">
</div>
<!-- range: data-range data-name-from="from" data-name-to="to" data-value="2024-10-01,2024-10-07" -->
```
- Hidden inputs always carry ISO Gregorian `YYYY-MM-DD`; the text box shows `1403/07/28` in the active calendar (users can type it, with any digits).
- Month and year views (click the title), Today, Clear, and a Jalali/Gregorian switch inside the panel. `data-min`/`data-max` are read live.
- Keyboard: arrows (RTL-aware), Home/End = start/end of week, PageUp/PageDown = month, Shift+PageUp/PageDown = year, Enter, Esc.
- On phones (<640px) the panel is a bottom sheet (drag to dismiss), and on touch devices the input is read-only so the keyboard does not cover it. A range shows two months on desktop.
- Calendar maths uses `Intl.DateTimeFormat('…-u-ca-persian')`. Helpers: `AC.jalali.toJalali(date)`, `AC.jalali.toDate(y,m,d)`, `AC.jalali.monthLength(y,m)`.
- Event `ac:datepicker:change {value, from, to, calendar, text}`; API `.set() .clear() .calendar('gregory') .open() .value .valid`.
- Time: `<div class="ac-input-group ac-time" data-ac="timepicker" [data-step="5"]><input class="ac-input" name="at"></div>`: hour and minute wheels, value `HH:MM`, event `ac:timepicker:change`.

## File dropzone
`<div class="ac-dropzone" data-ac="dropzone" [data-max-files="5"] [data-max-size="5MB"] [data-uploader="name"]><input type="file" name="docs" multiple accept="image/*,.pdf"></div>`. You get previews, per-file progress (simulated unless `AC.dropzone.uploader('name', (file, { progress, signal }) => Promise)` is set), size errors and remove buttons; `input.files` stays in sync. Events `ac:dropzone:add|remove|done`.

## Validation
`data-ac-rules="required|email|min:3|max:10|iran-mobile|iran-national-id|match:#id"` on any control, or on a component container or fieldset (radio groups).
Rules: `required email url numeric integer min:n max:n length:n between:a,b match:#sel iran-mobile iran-national-id iran-postal iran-card date`. `min`/`max` count characters, but use the value for `type=number`/`[data-ac=number]` and the number of items for multi-values.
- A field validates on blur, then live on every change once touched. Errors: `.ac-field__error` (`role=alert`), `aria-invalid`, `aria-describedby`, `.ac-field[data-invalid|data-valid]`.
- Custom message: `data-ac-msg="…"`. Custom rule: `AC.validate.add('even', (v) => v % 2 === 0, 'my.i18n.key')`.
- Submit: invalid → focus and shake the first error, then `ac:form:invalid {errors}`. Valid → `ac:form:submit {values, formData, form, submitter, waitUntil(promise)}` (the submit button shows busy until the promise settles). Native submit instead: `data-native`.
- API: `AC.instance(form,'form').validate(scope?) .values() .errors() .setErrors({name: msg}) .reset()`.

## Wizard
```html
<form class="ac-wizard" data-ac="form wizard">
  <ol class="ac-stepper"><li class="ac-step"><span class="ac-step__dot"></span><span class="ac-step__text"><strong>…</strong></span></li>…</ol>
  <section class="ac-wizard__step">…</section>  <section class="ac-wizard__step" hidden>…</section>
  <div class="ac-wizard__nav"><span class="ac-wizard__count" data-wizard-count></span>
    <button class="ac-btn" type="button" data-wizard-prev>Back</button>
    <button class="ac-btn ac-btn--primary" type="button" data-wizard-next>Next</button>
    <button class="ac-btn ac-btn--primary" type="submit">Finish</button></div>
</form>
```
Each step is validated before moving on (a step that fails is marked `data-state="error"`). Enter on an intermediate step goes to the next step. Completed steps are clickable. Direction-aware slide animation. On phones the nav bar is sticky above the tab bar. Event `ac:wizard:change {index, total}`; API `.go(i) .next() .prev() .index`.

## Pop panels
Combobox, date and time panels use the Popover API (top layer, never clipped by cards), positioned under or above their field and following scroll and resize. Without popover support they fall back to `hidden`.
