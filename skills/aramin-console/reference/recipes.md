# Recipes (copy, then adapt)

All fragments live inside `main.ac-content` of the shell (see `starters/html`).

## Dashboard
```html
<section class="ac-page" data-page="dashboard">
  <header class="ac-page-head" data-ac="largetitle">
    <div class="ac-page-head__titles"><h1 class="ac-page-head__title" data-i18n="nav.dashboard">داشبورد</h1></div>
    <div class="ac-page-head__actions"><button class="ac-btn ac-btn--primary" type="button">گزارش</button></div>
  </header>
  <div class="ac-bento ac-stagger">
    <div class="ac-card ac-span-xs-6 ac-span-md-4 ac-span-4"><div class="ac-card__body">
      <div class="ac-stat"><span class="ac-stat__label">فروش</span>
        <span class="ac-stat__value" data-ac="counter" data-to="48250000" data-compact>0</span></div>
    </div></div>
    <div class="ac-card ac-span-md-12 ac-span-4"><div class="ac-card__body">
      <div class="ac-chart-slot" data-ac="chart" data-ac-config='{"type":"area","labels":"months:12","series":[{"name":"درآمد","data":[5,8,6,9,12,10,14,13,16,15,18,21]}]}'></div>
    </div></div>
  </div>
</section>
```

## CRUD table page
```html
<div class="ac-card"><div class="ac-card__body ac-card__body--flush">
  <div data-ac="table" data-ac-config='{"pageSize":10}'>
    <table>
      <thead><tr><th>نام</th><th data-type="number">موجودی</th><th data-filter="select">وضعیت</th><th data-sortable="false"></th></tr></thead>
      <tbody>
        <tr><td>علی</td><td data-value="1200">1,200</td><td>فعال</td>
            <td><button class="ac-btn ac-btn--ghost ac-btn--sm" data-edit="1">ویرایش</button></td></tr>
      </tbody>
    </table>
  </div>
</div></div>
<div class="ac-modal" id="edit" data-ac="modal" data-size="md"><div class="ac-dialog">
  <div class="ac-dialog__head"><div class="ac-dialog__titles"><h2 class="ac-dialog__title">ویرایش</h2></div><button class="ac-dialog__close" data-ac-close aria-label="Close"></button></div>
  <form class="ac-dialog__body ac-form ac-stack" data-ac="form"><input class="ac-input" name="name" data-ac-rules="required"></form>
  <div class="ac-dialog__foot"><button class="ac-btn ac-btn--primary" type="submit" form="edit-form">ذخیره</button></div>
</div></div>
```
```js
document.addEventListener('click', (e) => { if (e.target.closest('[data-edit]')) AC.modal.open('#edit'); });
document.addEventListener('ac:table:action', async (e) => { if (await AC.confirm({ title: 'حذف شود؟', tone: 'danger' })) AC.toast.success('حذف شد'); });
document.addEventListener('ac:form:submit', (e) => e.detail.waitUntil(fetch('/api/items', { method: 'POST', body: e.detail.formData })));
```

## Form with Iranian validation
```html
<form class="ac-form ac-stack" data-ac="form" novalidate>
  <label class="ac-label" for="m">موبایل</label>
  <input class="ac-input ac-ltr" id="m" name="mobile" inputmode="tel" data-ac-rules="required|iran-mobile">
  <label class="ac-label" for="n">کد ملی</label>
  <input class="ac-input ac-ltr" id="n" name="national_id" inputmode="numeric" data-ac-rules="required|iran-national-id">
  <label class="ac-label">تاریخ تولد</label>
  <div data-ac="datepicker" data-calendar="persian" data-name="birth"></div>
  <label class="ac-label">شبا</label>
  <div data-ac="sheba" data-name="sheba"></div>
  <label class="ac-label">مبلغ</label>
  <div class="ac-input-group ac-money" data-ac="money" data-name="amount" data-currency="IRT" data-currencies="IRT,IRR"><input class="ac-input"></div>
  <button class="ac-btn ac-btn--primary" type="submit">ثبت</button>
</form>
```

## Official invoice (module `invoice-ir`)
```html
<div data-ac="invoice-ir" data-ac-config='{"type":"proforma","data":{"seller":{"name":"…"},"buyer":{"name":"…"},"items":[{"title":"…","qty":1,"price":1000000}]}}'></div>
```
Fields and types: `docs/invoice-ir.md`.

## Map and picker (module `maps`)
```html
<div data-ac="map" data-center="35.7,51.4" data-zoom="12" data-controls="zoom,locate,search"></div>
<div data-ac="location-picker" data-name="branch"></div>   <!-- posts branch[lat], branch[lng], branch[address] -->
```

## File manager (module `files`)
```html
<div class="my-files" data-ac="files"></div>  <!-- .my-files { block-size: 70vh } in your CSS; adapters: docs/files.md -->
```

## Login page (standalone document)
Copy `demo/auth/login.html` (head with boot script + CSS, body `main.ac-auth`), keep `data-ac="segmented"` email/mobile switch, `data-ac="otp"` for codes, and the `.ac-powered` footer.
