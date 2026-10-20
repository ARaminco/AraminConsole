# AraminConsole — Build Contract (v0.1)

This is the single source of truth every builder follows. If something is not here, choose the option that keeps the framework zero-dependency, RTL-first, accessible and app-like on phones.

## 1. What it is
An open-source (MIT) **admin panel UI/UX framework**: a CSS design system + a small vanilla-JS runtime of components + a complete demo app that shows every screen an admin panel or ops console needs. No framework, no runtime dependencies, no build step required to *use* it (one CSS file + one ES module). Works inside plain HTML, Node servers, Laravel Blade, Next.js, anything.

Consumers: the owner's panels (Gisoo, AStack console, NetArz, CoHub, Laravel/Filament admin replacements) and the public.

## 2. Design direction
- **Feel:** premium, calm, modern SaaS (Linear / Vercel / Apple-level polish), not a Bootstrap template. Soft depth (layered shadows), glass chrome (backdrop-filter blur on app bar / tab bar / sheets), generous radii (12–20px), subtle aurora gradient accent in hero areas, crisp 1px borders, tabular numbers.
- **Motion:** every interaction has motion, all of it short (120–320ms) with spring-like easing `cubic-bezier(.2,.8,.2,1)`; respects `prefers-reduced-motion` (all motion off). Page transitions via View Transitions API with fallback fade/slide. Press feedback: `scale(.97)` on buttons/cards/tabs. Animated tab indicator, animated number counters on stat tiles, chart draw-in, skeleton shimmer, staggered list entrance.
- **Mobile = native app:** below 1024px the side rail disappears and a **bottom tab bar** (5 slots, glass, animated pill indicator, center FAB optional) appears; iOS-style **large title** collapses into the app bar on scroll; **bottom sheets** with drag handle and drag-to-dismiss; **swipe actions** on list rows; **pull-to-refresh**; safe-area insets (`env(safe-area-inset-*)`); 44px minimum touch targets; no hover-only affordances; tables turn into cards; modals become sheets. Installable PWA (manifest + service worker + offline page), `theme-color` follows theme.
- **Font:** Vazirmatn variable (`src/fonts/vazirmatn-variable.woff2`, OFL) for all scripts; Latin digits in data tables unless the locale switch selects Persian digits.
- **Icons:** Lucide (ISC), from `node_modules/lucide-static/icons/<name>.svg`. The build script assembles a sprite `dist/icons.svg` containing ONLY the icons listed in `src/icons/icons.txt` (one name per line). Usage: `<svg class="ac-icon"><use href="#i-<name>"/></svg>` — the runtime injects the sprite inline at boot (`AC.icons.load()`), so `href="#i-house"` works. Builders: add every icon you use to `icons.txt`.
- **Themes:** `data-theme="light|dark"` on `<html>` (auto from `prefers-color-scheme` when unset), accent presets via `data-accent="violet|blue|emerald|rose|amber|slate"` (default violet `#6d4aff`), density `data-density="comfortable|compact"`, radius `data-radius="sharp|default|round"`. Theme customizer drawer in the demo.
- **Direction & language:** `dir="rtl"` default (fa), `dir="ltr"` (en), Arabic (ar, rtl). Use CSS **logical properties only** (`margin-inline-start`, `inset-inline-end`, `padding-block`, `border-start-start-radius`…) — never `left/right` except for physical things like chart axes. Directional icons (chevrons, arrows) flip with `.ac-flip-rtl`.

## 3. Naming
- CSS: prefix `ac-`. BEM-ish: `.ac-card`, `.ac-card__head`, `.ac-card--flat`. State via attributes/ARIA (`[aria-selected=true]`, `[data-state=open]`, `[disabled]`), not `.is-*` classes where ARIA exists.
- Tokens: CSS custom properties `--ac-*` defined in `src/css/tokens.css`. Components use ONLY tokens for color, radius, shadow, spacing, motion. Dark mode must work purely by token swap.
- JS: global namespace `window.AC` and ES module exports from `dist/aramin-console.js`. Declarative first: components auto-initialise from `data-ac="<component>"` attributes (`data-ac="tabs"`, `data-ac="table"`, `data-ac="sheet-trigger"`…) via a MutationObserver, so injected HTML just works. Each component also has an imperative API (`AC.toast({...})`, `AC.modal.open('#id')`, `AC.sheet.open(...)`, `AC.confirm({...})` → Promise<boolean>, `AC.palette.open()`, `AC.theme.set({...})`, `AC.i18n.set('en')`).
- Events: `CustomEvent`s named `ac:<component>:<event>` bubbling from the element (`ac:tabs:change`, `ac:table:select`, `ac:sheet:close`).

## 4. Required token groups (`src/css/tokens.css`)
Color (bg, surface 1–3, elevated, border, border-strong, text, text-soft, muted, accent + accent-soft + accent-ink + ring, success/warning/danger/info each with soft + ink, chart-1..8), glass (chrome bg + blur), shadows (xs, sm, md, lg, xl, glow), radius (xs..2xl, pill), space scale (0.25rem steps `--ac-s-1..12`), type scale (`--ac-fs-xs..4xl` + line heights), z-index layers (rail, appbar, tabbar, dropdown, sheet, modal, toast, palette), motion (`--ac-ease`, `--ac-ease-out`, `--ac-dur-1..4`), layout (`--ac-appbar-h`, `--ac-tabbar-h`, `--ac-rail-w`, `--ac-rail-w-collapsed`, `--ac-content-max`).

## 5. File layout
```
src/css/tokens.css          tokens + themes + accents + density
src/css/base.css            reset, typography, font-face, focus ring, scrollbars, selection, utilities (stack, cluster, grid, text, visually-hidden)
src/css/layout.css          app shell: rail (collapsible, groups, badges), app bar, content, large title, bottom tab bar, FAB, page header, responsive grid, auth layout
src/css/components/*.css    one file per component family (button, form, card, table, overlay, nav, feedback, data-display, chart, kanban, calendar, chat, misc)
src/js/core.js              AC namespace, auto-init registry, events, dom helpers, focus trap, scroll lock, storage, gestures (drag/swipe)
src/js/components/*.js      one module per component; each exports `init(el)` and registers itself
src/js/index.js             entry: imports everything, boots, exposes window.AC
src/icons/icons.txt         icon names used
scripts/build.mjs           concat CSS → dist/aramin-console.css (+ .min), bundle JS modules → dist/aramin-console.js (simple concat of ES modules into one module is fine; or copy src/js to dist/js and make dist/aramin-console.js re-export), sprite → dist/icons.svg, copy fonts → dist/fonts
scripts/serve.mjs           zero-dep static server on http://localhost:5178 serving repo root, SPA fallback for /demo/
demo/index.html             the demo app shell (SPA)
demo/app.js                 demo router + mock data wiring
demo/data.js                realistic mock data (Persian + English names, Jalali dates, IRR/AED/USD amounts)
demo/pages/<page>.html      one HTML fragment per screen, loaded by the router into the shell
demo/manifest.webmanifest, demo/sw.js, demo/offline.html
docs/                       component docs (markdown) — one file per component family
tests/                      Playwright (playwright-core, system chromium at %LOCALAPPDATA%/ms-playwright) smoke + screenshot tests
```

## 6. Component inventory (all required for v0.1)
**Shell & navigation:** side rail (collapsible to icons, nested groups, badges, workspace switcher, user card), app bar (search trigger, notifications bell with count, theme toggle, language switch, user menu), breadcrumbs, bottom tab bar + FAB, large collapsing title, page header with actions, tabs (underline + pills), segmented control, pagination, stepper, command palette (Ctrl/⌘+K, fuzzy search over pages and actions, recent, keyboard nav), quick search.
**Inputs:** button (primary, secondary, ghost, soft, danger, link; sizes; icon-only; loading; group), input/textarea with prefix/suffix/clear/counter, floating label variant, select, combobox (searchable, async), multi-select with chips, tag input, checkbox, radio, switch, slider/range, rating, OTP/PIN input, number stepper, password (show/strength), color swatch picker, **date picker with Jalali (Persian) AND Gregorian calendars** (uses `Intl.DateTimeFormat('fa-IR-u-ca-persian')`, no deps), date range, time picker, file dropzone with previews & progress, form layout, inline validation (`data-ac-rules="required|email|min:3|iran-mobile|iran-national-id"`), wizard form.
**Overlays:** modal/dialog (sizes, fullscreen-on-mobile → sheet), drawer (side), bottom sheet (snap points, drag), dropdown menu, context menu (right click / long press), popover, tooltip, confirm dialog (Promise), toast (stack, actions, undo, progress, swipe-to-dismiss), alert/banner, notification center panel.
**Data display:** card variants (stat tile with trend + sparkline + animated counter, bento grid), **data table** (sort, global search, column filters, pagination, page size, row selection + bulk action bar, column visibility, sticky header, row expansion, inline row actions, CSV export, empty/loading states, responsive → card list on mobile with swipe actions), list (with avatars, meta, swipe actions), description list, badges/chips/status dots, avatars + group, progress (bar, ring), skeletons, empty states with illustration (inline SVG), timeline/activity feed, accordion, tree view, code block with copy, key/value JSON viewer, diff/log viewer.
**Charts (inline SVG, no deps):** line, area (gradient), bar (grouped/stacked), donut/pie, radial gauge, sparkline, heatmap (contributions-style), with tooltips, legend, responsive resize, RTL-aware axes, draw-in animation. API: `AC.chart(el, {type, series, labels, ...})` and `data-ac="chart" data-ac-config='{...}'`.
**Apps / screens in the demo (each a page fragment):**
1. `dashboard` — KPI bento, revenue area chart, orders bar chart, traffic donut, recent orders table, activity feed, top products, goals ring.
2. `analytics` — date-range filters, multi charts, heatmap, funnel.
3. `users` — full data table with filters, bulk actions, user drawer/sheet, create user modal form.
4. `user-profile` — cover, tabs (overview, activity, security, sessions).
5. `roles` — roles & permissions matrix with toggles.
6. `orders` + `invoice` — order list, printable invoice page (`@media print`).
7. `products` — grid/list toggle, filters, product editor form with images.
8. `kanban` — drag & drop board (pointer events, works with touch), add card.
9. `calendar` — month/week views, Jalali + Gregorian toggle, events.
10. `chat` — conversations list + thread, bubbles, attachments, typing indicator; mobile = two screens with push transition.
11. `mail` — inbox three-pane, mobile stacked.
12. `files` — file manager grid/list, upload dropzone, breadcrumbs, context menu.
13. `notifications` — notification center page.
14. `console` — **ops console**: live log stream viewer (filter by level, pause, follow), server/service status cards, uptime bars, terminal-style command box, jobs/queue table, incidents timeline.
15. `monitoring` — CPU/RAM/disk gauges, realtime-updating sparkline charts.
16. `settings` — sectioned settings (general, appearance with theme customizer, notifications, security, API keys with copy/regenerate, billing), mobile = iOS-style grouped list.
17. `forms` — showcase of every input + validation + wizard.
18. `components` — living style guide: every component with variants.
19. `pricing`, `faq` (accordion), `timeline`.
20. Auth (standalone pages, no shell): `login`, `register`, `forgot`, `otp`, `lock` — split layout desktop, full-screen app-like mobile.
21. Errors: `404`, `500`, `maintenance`, `offline`.

## 7. Demo app behaviour
- Hash router (`#/dashboard`), page fragments fetched from `demo/pages/`, injected into `<main>`, components auto-init, page transition animation, title + active nav updated, scroll restored. Auth/error pages are standalone `demo/auth/*.html`, `demo/errors/*.html`.
- Language switch fa/en/ar swaps `dir`, `lang`, and text via `data-i18n` keys from `demo/i18n/{fa,en,ar}.json` (shell + nav + common UI at minimum; page body content may stay Persian with English in en for main headings).
- Settings persist in `localStorage` (`ac:theme`, `ac:accent`, `ac:lang`, `ac:rail`).

## 8. Quality bar
- Lighthouse-grade a11y: semantic HTML, labelled controls, focus visible, focus trap in overlays, Esc closes, roving tabindex in menus/tabs, `aria-*` correct, contrast AA in both themes.
- No inline `style=""` in markup (CSP friendly); JS may set CSS variables via `el.style.setProperty`.
- No console errors on any page at 390×844 (phone), 820×1180 (tablet), 1440×900 (desktop), in fa/rtl and en/ltr, light and dark.
- No horizontal overflow on phone on any page.
- Performance: CSS < 120KB min, JS < 120KB min (unminified source size may be larger).
