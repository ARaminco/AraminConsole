# AraminConsole

**A zero-dependency admin panel UI framework: right-to-left first, dark mode, and app-like on phones.**
One CSS file plus one ES module. It works in plain HTML, Laravel Blade, Next.js, or any other stack.

[Live demo](https://araminco.github.io/AraminConsole/demo/) · [Getting started](docs/getting-started.md) · [Theming](docs/theming.md) · [فارسی](README.fa.md)

| Desktop | Phone | Dark |
|---|---|---|
| ![Dashboard on desktop](docs/screens/dashboard-desktop.png) | ![Dashboard on a phone](docs/screens/dashboard-phone.png) | ![Dark mode](docs/screens/dashboard-dark.png) |
| ![Sign-in page](docs/screens/login-desktop.png) | ![Sign-in on a phone](docs/screens/login-phone.png) | ![Error page](docs/screens/404-dark.png) |

> Screenshots live in `docs/screens/*.png` (regenerate with `node tests/shots.mjs` and `node tests/standalone.mjs`).

## Features
- **No dependencies, no build step to use it.** Copy `dist/` and add one `<link>` and one `<script type="module">`.
- **Declarative.** Components start from `data-ac="…"` attributes, including on HTML injected later (a MutationObserver handles it). Each one also has an imperative API on `window.AC`.
- **RTL-first.** Persian, Arabic, and English use logical CSS properties only. Directional icons flip automatically.
- **App-like on phones.** Floating tab bar with a FAB, large titles that collapse on scroll, bottom sheets with drag-to-dismiss, swipe actions, pull-to-refresh, safe areas, and PWA-ready.
- **Design tokens.** Light and dark themes, 7 accent presets, density and radius switches, all through CSS custom properties (`--ac-*`).
- **Jalali and Gregorian** date pickers built on `Intl`, with no date library.
- **Accessible.** Focus traps, roving tabindex, ARIA states, visible focus, and reduced-motion support.
- **Small.** One CSS file and one JS module; icons are a sprite with only the icons you list.

## Quick start
```bash
git clone https://github.com/ARaminco/AraminConsole.git
cp -r AraminConsole/dist ./public/aramin   # dist/ is committed: no npm install needed
```
```html
<!doctype html>
<html lang="en" dir="ltr" data-ac-icons="/aramin/icons.svg">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <script src="/aramin/aramin-console-boot.js"></script>          <!-- applies saved theme/lang before paint -->
  <link rel="stylesheet" href="/aramin/aramin-console.min.css">
  <script type="module" src="/aramin/aramin-console.min.js"></script>
</head>
<body>
  <div class="ac-card"><div class="ac-card__body">
    <button class="ac-btn ac-btn--primary" type="button" onclick="AC.toast({ title: 'Saved', tone: 'success' })">Save</button>
  </div></div>
</body>
</html>
```
For Laravel Blade, Next.js, and the full app shell (top pills, dock, rail, tab bar), see [docs/getting-started.md](docs/getting-started.md).

## `data-ac` usage
```html
<div class="ac-segmented" data-ac="segmented">…</div>             <!-- ac:segmented:change -->
<form class="ac-form" data-ac="form">                              <!-- validation + ac:form:submit -->
  <input class="ac-input" name="mobile" data-ac-rules="required|iran-mobile">
</form>
<div class="ac-otp" data-ac="otp" data-length="6"></div>           <!-- ac:otp:complete -->
<div class="ac-chart-slot" data-ac="chart" data-ac-config='{"type":"bar","series":[{"data":[3,5,2]}]}'></div>
<span data-ac="counter" data-to="498601.92" data-decimals="2" data-prefix="$">0</span>
```
```js
import { AC } from './aramin-console.js';           // also available as window.AC
AC.modal.open('#edit');  await AC.confirm({ title: 'Delete?' });  AC.theme.set({ theme: 'dark', accent: 'blue' });
document.addEventListener('ac:form:submit', (e) => e.detail.waitUntil(fetch('/api', { method: 'POST', body: e.detail.formData })));
```
Events always follow the pattern `ac:<component>:<event>` and bubble. They are documented per component.

## Theming tokens
| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--ac-accent` / `--ac-accent-2` | `#f0532d` / `#ff7a4d` | `#f2603b` | accent and its gradient partner |
| `--ac-ink` / `--ac-ink-contrast` | `#111113` / `#fff` | `#fff` / `#0b0b0c` | primary buttons, active nav pill |
| `--ac-bg` | `#f2f2f3` | `#0b0b0c` | page canvas |
| `--ac-surface-1/2/3` | `#fff` / `#f6f6f7` / `#eeeef0` | `#161618` / `#1c1c1f` / `#242428` | cards, insets, tracks |
| `--ac-border` | `#ececee` | `#232326` | hairlines |
| `--ac-text` | `#111113` | (light text) | body text (`--ac-muted`, `--ac-faint` for less) |
| `--ac-r-xl` / `--ac-r-pill` | `22px` / `999px` | | card / pill radius |
| `--ac-control-h` | `2.5rem` | | buttons and inputs (density-aware) |
| `--ac-font` | Vazirmatn, system-ui | | one font for every script |

Switches on `<html>`: `data-theme="light|dark"` (auto when unset), `data-accent="orange|violet|blue|emerald|rose|amber|slate"`, `data-density="comfortable|compact"`, `data-radius="sharp|default|round"`. The full list is in [docs/theming.md](docs/theming.md).

## RTL and i18n
Set `<html lang="fa" dir="rtl">`, or call `AC.i18n.set('en')`, which switches `lang`, `dir`, and every `[data-i18n]` text from your JSON dictionaries (`AC.i18n.configure({ url: '/i18n/{lang}.json' })`). Numbers use Latin digits by default (`AC.i18n.setDigits('native')` switches to Persian digits). `AC.format.number/date/relative` respect the locale, and dates can use the Persian calendar.

## Components
- **Shell and navigation:** app bar pills, dock, rail flyout and drawer, tab bar and FAB, large title, tabs, segmented control, breadcrumbs, pagination, stepper, command palette (Ctrl/⌘ K). See [docs/CONVENTIONS.md](docs/CONVENTIONS.md#11-shell-v2--floating-pills-docsdesignmd).
- **Forms:** inputs, password strength, OTP, combobox, tags, switches, range, rating, swatches, Jalali/Gregorian date and time pickers, dropzone, validation, wizard. See [docs/forms.md](docs/forms.md).
- **Overlays and feedback:** modal, bottom sheet, drawer, menus, popover, tooltip, confirm/prompt, toast, alert, notification center, customizer. See [docs/overlays.md](docs/overlays.md).
- **Data display:** data table, charts (line, area, bar, donut, gauge, sparkline, heatmap), lists with swipe actions, accordion, tree, code and JSON viewers, log viewer. See [docs/data.md](docs/data.md).
- **Pages:** the demo app (`demo/`) has a dashboard, users, analytics, forms, auth pages (`demo/auth/`) and error pages (`demo/errors/`).

## Browser support
Current Chrome, Edge, Firefox, Safari (desktop and iOS 16.4+), and Samsung Internet. The framework uses CSS logical properties, `color-mix()`, `:has()`, `dvh` units, and the Popover API (with a fallback). View Transitions are used when the browser supports them.

## Contributing
Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Run `npm run dev`, then open http://localhost:5178/demo/.

## Credits
- Icons: [Lucide](https://lucide.dev), ISC License (`dist/LICENSE-lucide.txt`).
- Font: [Vazirmatn](https://github.com/rastikerdar/vazirmatn) by Saber Rastikerdar, SIL Open Font License 1.1 (`src/fonts/OFL.txt`).
- Visual direction inspired by the "Dashboard V14 — Modern & Minimal UI" concept by code.xr.
- Bank logos (`dist/banks.svg`): Iranian banks from [@iran-utils/iranian-banks-icons-core](https://github.com/houtan-rocky/iranian-banks-react-icons) (MIT), card networks and international banks from [simple-icons](https://simpleicons.org) (CC0); a few are generated monograms. **All bank and card-network logos are trademarks of their respective owners and are included for identification only.** Per-logo sources: `src/banks/SOURCES.md`, notice: `dist/LICENSE-bank-logos.txt`. Finance kit docs: `docs/finance.md`.

## License
[MIT](LICENSE) © 2026 Ali Asghar Ramin
