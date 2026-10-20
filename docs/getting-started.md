# Getting started

AraminConsole ships as static files in `dist/`. Nothing needs to be installed:

| File | What it is |
|---|---|
| `aramin-console-boot.js` | Tiny classic script for `<head>`. It applies the saved theme, accent, density, and language **before first paint** (so the page never flashes the wrong theme). |
| `aramin-console.css` / `.min.css` | The whole design system. |
| `aramin-console.js` / `.min.js` | One ES module. It also sets `window.AC` and auto-starts components from `data-ac`. |
| `icons.svg` | Lucide icon sprite, loaded from `<html data-ac-icons="…">`. |
| `fonts/` | Vazirmatn variable font and its license. The CSS loads it with a relative URL, so keep `fonts/` next to the CSS. |

## 1. Plain HTML

```html
<!doctype html>
<html lang="fa" dir="rtl" data-ac-icons="aramin/icons.svg">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Panel</title>
  <script src="aramin/aramin-console-boot.js"></script>
  <link rel="stylesheet" href="aramin/aramin-console.min.css">
  <script type="module" src="aramin/aramin-console.min.js"></script>
</head>
<body>
  <main class="ac-content">
    <section class="ac-page">
      <header class="ac-page-head">
        <div class="ac-page-head__titles"><h1 class="ac-page-head__title">سلام</h1></div>
        <div class="ac-page-head__actions"><button class="ac-btn ac-btn--primary" type="button" id="hi">ذخیره</button></div>
      </header>
      <div class="ac-bento">
        <article class="ac-card ac-span-4"><div class="ac-card__body">
          <span class="ac-label">Revenue</span>
          <div class="ac-figure"><span data-ac="counter" data-to="12840" data-prefix="$">0</span></div>
        </div></article>
      </div>
    </section>
  </main>
  <script type="module">
    import { AC } from './aramin/aramin-console.min.js';
    AC.ready(() => document.getElementById('hi').addEventListener('click', () => AC.toast({ title: 'ذخیره شد', tone: 'success' })));
  </script>
</body>
</html>
```

For the full app shell (top pills, dock, rail flyout, phone tab bar), copy the `<body>` of [`demo/index.html`](../demo/index.html). The hash router in `demo/app.js` is only a demo. Use your own routing and set `aria-current="page"` on the active link.

Standalone screens (sign-in, errors) use `.ac-auth` and `.ac-fullpage`. See `demo/auth/*.html` and `demo/errors/*.html`.

## 2. Laravel (Blade)

Copy `dist/` to `public/vendor/aramin/`, then create a layout:

```blade
{{-- resources/views/layouts/panel.blade.php --}}
<!doctype html>
<html lang="{{ app()->getLocale() }}" dir="{{ in_array(app()->getLocale(), ['fa', 'ar']) ? 'rtl' : 'ltr' }}"
      data-ac-icons="{{ asset('vendor/aramin/icons.svg') }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>@yield('title', 'Panel')</title>
  <script src="{{ asset('vendor/aramin/aramin-console-boot.js') }}"></script>
  <link rel="stylesheet" href="{{ asset('vendor/aramin/aramin-console.min.css') }}">
  <script type="module" src="{{ asset('vendor/aramin/aramin-console.min.js') }}"></script>
</head>
<body>
  <main class="ac-content">@yield('content')</main>
  @stack('scripts')
</body>
</html>
```

A form with client-side validation and a normal POST (`data-native` keeps the browser submit after validation passes):

```blade
@extends('layouts.panel')
@section('content')
<form class="ac-form" data-ac="form" data-native method="POST" action="{{ route('users.store') }}">
  @csrf
  <div class="ac-field">
    <label class="ac-label" for="mobile">موبایل</label>
    <input class="ac-input ac-ltr" id="mobile" name="mobile" value="{{ old('mobile') }}" data-ac-rules="required|iran-mobile">
    @error('mobile')<p class="ac-field__error" role="alert">{{ $message }}</p>@enderror
  </div>
  <button class="ac-btn ac-btn--primary" type="submit">ذخیره</button>
</form>
@endsection
```

To submit with `fetch` instead, leave out `data-native` and listen for the event:
```js
document.addEventListener('ac:form:submit', (e) => {
  const token = document.querySelector('meta[name=csrf-token]').content;
  e.detail.waitUntil(fetch(e.detail.form.action, { method: 'POST', headers: { 'X-CSRF-TOKEN': token }, body: e.detail.formData }));
});
```

## 3. Next.js (App Router)

Copy `dist/` to `public/aramin/`. Load it once in the root layout:

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // the boot script sets data-theme / dir before hydration
    <html lang="fa" dir="rtl" data-ac-icons="/aramin/icons.svg" suppressHydrationWarning>
      <head>
        <script src="/aramin/aramin-console-boot.js" />
        <link rel="stylesheet" href="/aramin/aramin-console.min.css" />
        <script type="module" src="/aramin/aramin-console.min.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

Components start from `data-ac` attributes through a MutationObserver, so JSX works as written. Call the API from client components through `window.AC`:

```tsx
'use client';
import { useEffect, useRef } from 'react';
declare global { interface Window { AC: any } }

export function SaveButton() {
  return <button className="ac-btn ac-btn--primary" onClick={() => window.AC?.toast({ title: 'Saved', tone: 'success' })}>Save</button>;
}

export function Plan() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const on = (e: Event) => console.log((e as CustomEvent).detail.value);
    el.addEventListener('ac:segmented:change', on);
    return () => el.removeEventListener('ac:segmented:change', on);
  }, []);
  return (
    <div ref={ref} className="ac-segmented" data-ac="segmented">
      <button type="button" className="ac-segmented__item" data-value="month" aria-checked="true">Month</button>
      <button type="button" className="ac-segmented__item" data-value="year" aria-checked="false">Year</button>
    </div>
  );
}
```

## Next steps
- [Theming](theming.md): tokens, accents, dark mode, and density.
- [Forms](forms.md), [Overlays](overlays.md), [Data display](data.md): every component with its markup.
- [Conventions](CONVENTIONS.md): naming, events, and the shell structure.
