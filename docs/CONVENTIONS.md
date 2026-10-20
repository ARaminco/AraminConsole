# AraminConsole — Conventions (Phase 2 builders read this first)

`docs/SPEC.md` is the contract; this is how the foundation implements it. Follow it exactly.

## 1. Workflow
- `npm run build` (or `node scripts/build.mjs --watch`) → `dist/`. `npm run serve` → http://localhost:5178/demo/
- Check: `node tests/shots.mjs <page> [--full]` (390×844 + 1440×900, light/dark, fa/en → `tests/screens/`, prints console errors + horizontal overflow). `node tests/shell.mjs`, `node tests/pwa.mjs`.
- The demo SW is **off on localhost** (stale caches). Enable with `localStorage['ac:sw']='1'`.
- Budget: CSS < 120 KB min for the WHOLE framework; the foundation already uses ~80 KB. Keep each new component file lean (aim ≤ 6 KB min), no comment banners per rule, reuse tokens/utilities.

## 2. File ownership
| Owner | Files |
|---|---|
| Foundation (do not edit — ask) | `tokens.css`, `base.css`, `layout.css`, `components/{button,nav,card,misc,palette}.css`, `src/js/core.js`, `components/{rail,tabbar,largetitle,tabs,palette,press,pull-refresh,ring}.js`, `index.js`, `scripts/*`, `demo/index.html`, `demo/app.js` |
| Data-table engineer | `components/table.css` (base styles exist — extend), `table.js` |
| Others | one new CSS file per family: `form.css`, `overlay.css`, `feedback.css`, `data-display.css`, `chart.css`, `kanban.css`, `calendar.css`, `chat.css`; one JS module per component |
| Pages | `demo/pages/<name>.html` (+ optional `<name>.js`), `demo/auth/*.html`, `demo/errors/*.html` |

Shared files you may append to (add, never reorder/remove): `src/icons/icons.txt`, `demo/i18n/{fa,en,ar}.json`, `src/js/index.js` (one `import './components/x.js'` line + optional `export { x } from …`).
The build concatenates `components/*.css` alphabetically — never rely on another component file's order.

## 3. Registering a component
```js
// src/js/components/sheet.js
import { AC, register, on, emit, options, trapFocus, scrollLock, gesture, instance } from '../core.js';
register('sheet', (el) => {                  // runs for every [data-ac~="sheet"], now and when injected later
  const o = options(el, { snap: 0.5 });       // data-* attrs + data-ac-config='{json}'
  const off = on(el, 'click', '[data-close]', () => close());
  function close() { emit(el, 'sheet:close'); }   // → CustomEvent "ac:sheet:close", bubbles
  instance(el, 'sheet', { close });            // AC.instance(el,'sheet').close()
  return () => off();                          // destroy: called when el leaves the DOM
});
export const sheet = { open(sel) { /* imperative API */ } };
AC.sheet = sheet;
```
Bundler limits (scripts/build.mjs): only `import {a, b as c} from './x.js'`, `import './x.js'`, `export function|const|let|class`, `export {…}`, `export {…} from`, `export * from`. No default exports, no circular imports, no npm imports.
Multiple components on one element: `data-ac="tabs counter"`.

## 4. Core JS API (`window.AC`, also ES exports)
- DOM: `$`, `$$`, `on(target, type, [selector], fn)` → off(), `h(tag, attrs, ...children)`, `emit(el, 'name:event', detail)`, `uid()`, `escapeHtml`, `icon(name, cls)` → svg string, `options(el, defaults)`.
- Overlays: `trapFocus(container, {initial, returnFocus})` → release(); `scrollLock.lock()/unlock()` (ref-counted, sets `html[data-scroll-locked]`); `focusables(el)`.
- Gestures: `gesture(el, { axis:'x'|'y'|'both', threshold:8, filter(e), onStart(s), onMove(s), onEnd(s) })` → destroy. `s = {dx, dy, vx, vy (px/ms), axis, pointerType, target, cancelled}`. Axis-locked: a vertical move on an `axis:'x'` gesture is released to the browser. Set CSS `touch-action: pan-y` (horizontal swipe) / `pan-x` / `none` (kanban drag). The click after a real drag is swallowed. Drive visuals with CSS vars: `el.style.setProperty('--ac-drag', dx+'px')`.
- State: `store.get/set/remove` (JSON, localStorage). Keys: `ac:theme ac:accent ac:density ac:radius ac:lang ac:rail ac:digits`.
- `theme.get()` → `{theme:'auto|light|dark', resolved, accent, density, radius}`; `theme.set({...})`; `theme.toggle()`; event `ac:theme:change`.
- `i18n.set('en')` (async), `i18n.t(key, fallback, vars)` = `AC.t`, `i18n.extend(lang, dict)`, `i18n.lang/dir/locale`, event `ac:i18n:change` on document — re-render any JS-generated text on it.
- Formatting: `format.number(n, {decimals, compact, currency:'USD', percent})`, `format.date(d, {dateStyle, calendar:'persian'|'gregory'})`, `format.relative(d)`. Latin digits by default (`i18n.setDigits('native')` for Persian digits).
- Misc: `reducedMotion()`, `isRTL()`, `isMobile()` (<1024px), `haptic()`, `rafThrottle(fn)`, `debounce(fn)`, `ready(fn)`, `rail.open/close/toggle/collapse`, `palette.add([{id,title,i18n?,hint?,group?,icon?,keywords?,shortcut?,href?,run?}])/open/close`.
- Declarative helpers: `data-ac="counter"` (`data-to data-decimals data-prefix data-suffix data-compact data-currency`), `data-ac="ring"` (`data-value data-max data-tone`), `data-ac="tabs"`, `data-ac="segmented"`, `data-ac="largetitle"`, `data-ac="pull-refresh"`, `[data-ac-palette-open]`, `[data-ac-rail-open|-close|-toggle]`, `[data-ripple]`.
- Events are always `ac:<component>:<event>` (`ac:tabs:change`, `ac:segmented:change {value}`, `ac:pull-refresh:refresh {waitUntil(promise)}`).

## 5. Tokens cheat-sheet (`--ac-*`, never hard-code colours)
- Surfaces: `bg bg-subtle surface-1 surface-2 surface-3 elevated hover active scrim` · lines `border border-strong` · text `text text-soft muted faint`
- Ink (black primary; white in dark): `ink ink-hover ink-contrast` · chrome `chrome-bg pill-bg pill-bg-hover shadow-chrome` · `lift` (hover translate) · `pill-h flyout-w`
- Accent (orange `#f0532d` default, use sparingly): `accent accent-2 accent-hover accent-soft accent-soft-2 accent-ink`(readable accent text) `accent-contrast`(text on solid accent) `ring focus gradient aurora`
- Status: `success|warning|danger|info` + `-soft` + `-ink`; `neutral-soft neutral-ink`; charts `chart-1..8 chart-grid`
- Glass: `glass-bg glass-bg-strong glass-border glass-blur` · shadows `shadow-xs sm md lg xl glow inset`
- Radius `r-xs sm md lg xl 2xl pill` · space `s-0..12` (0.25rem steps) · type `fs-2xs xs sm md lg xl 2xl 3xl 4xl`, `lh-tight snug normal`, `fw-*`
- Metrics (density-aware): `control-h control-h-sm control-h-lg control-px card-pad row-h gap touch`
- Motion: `ease ease-out ease-in ease-spring dur-1..4 press` · z: `z-sticky rail appbar tabbar dropdown drawer sheet modal toast palette tooltip`
- Layout: `appbar-h tabbar-h rail-w rail-w-collapsed content-max content-pad safe-top/bottom/start/end`
- Tones: any component colouring itself from `--_tone` gets `data-tone="accent|success|warning|danger|info|neutral"` for free.
- Private per-component vars start with `--_` (e.g. `--_bg`). Dark mode = token swap only: if you need `:root[data-theme="dark"] .x`, you are probably missing a token.

## 6. Class naming
`.ac-block`, `.ac-block__element`, `.ac-block--modifier`; state via ARIA/data attributes (`[aria-selected="true"]`, `[aria-expanded]`, `[aria-current="page"]`, `[data-state="open|closed"]`, `[aria-busy="true"]`, `[disabled]`). Logical properties only (`inset-inline-start`, `margin-inline-end`, `padding-block`); physical `left` only for JS-measured indicators/charts. Directional icons get `.ac-flip-rtl`. No inline `style=""` in markup.
Existing atoms to reuse: `.ac-btn(--primary|secondary|outline|accent|soft|ghost|danger|danger-soft|link|gradient|sm|lg|icon|square|block)` (all pills; primary = ink), `.ac-searchpill`, `.ac-kpis > .ac-kpi(--accent)(__head|__label|__value|__foot)`, `.ac-inset(__head)`, `.ac-label`, `.ac-figure`, `.ac-flag[data-flag=us|eu|ae|ir|gb|tr]`, `.ac-legend--inline`, `.ac-btn-group`, `.ac-card(__head|__titles|__title|__sub|__actions|__body|__body--flush|__foot)(--flat|inset|glass|interactive|aurora|accent|pad)`, `.ac-stat(__head|__icon|__label|__value|__unit|__foot|__spark)`, `.ac-trend[data-trend=up|down|flat]`, `.ac-badge(--accent|success|warning|danger|info|neutral|solid|outline|dot|lg)`, `.ac-count`, `.ac-chip(+__remove, aria-pressed)`, `.ac-status[data-status]`, `.ac-avatar(--xs|sm|lg|xl|square|gradient)[data-color=1..8]`, `.ac-avatar-group`, `.ac-kbd`, `.ac-divider(--label|--vertical)`, `.ac-skeleton(--text|title|circle|block|w-25|w-50|w-75)`, `progress.ac-progress(--success|warning|danger|sm|lg)`, `.ac-ring`, `.ac-empty(__art|__title|__text|__actions)`, `.ac-list(__item|__thumb|__main|__title|__meta|__end)(--divided|--inset)`, `.ac-feed(__item|__icon|__body)`, `.ac-tabs(--pills)`, `.ac-segmented(--block|--sm)`, `.ac-breadcrumbs`, `.ac-pagination`, `.ac-stepper(--vertical)>.ac-step[data-state]`, `.ac-table(--stack)`, `.ac-chart-slot(--sm|--lg|--square)`, `.ac-legend`, `.ac-hero`, `.ac-tile`, `.ac-section(__head|__title|__sub)`.
Utilities: `.ac-stack .ac-cluster .ac-row .ac-spread .ac-grow .ac-grid .ac-grid-2/3/4 .ac-gap-0..8 .ac-truncate .ac-clamp-2 .ac-visually-hidden .ac-hide-mobile(<1024) .ac-hide-desktop .ac-hide-phone(<640) .ac-num .ac-mono .ac-ltr .ac-text-(xs|sm|lg|soft|muted|accent|success|warning|danger|start|center|end) .ac-stagger .ac-animate-in .ac-pressable .ac-only-light .ac-only-dark`.
Bento: `.ac-bento` (12 cols) + children `.ac-span-xs-6` (phone half), `.ac-span-md-{3,4,6,8,12}` (≥640), `.ac-span-{2..9,12}` / `.ac-row-2` (≥1024), `.ac-span-xl-{3,4,6,8}` (≥1280). Default = full width. Don't combine `ac-span-12` with another lg span.

## 7. Page fragment shape (`demo/pages/<name>.html`)
```html
<section class="ac-page" data-page="users" [data-script]>
  <header class="ac-page-head" data-ac="largetitle">
    <div class="ac-page-head__titles">
      <span class="ac-page-head__eyebrow">…</span>
      <h1 class="ac-page-head__title" data-i18n="nav.users">کاربران</h1>
      <p class="ac-page-head__sub">…</p>
    </div>
    <div class="ac-page-head__actions">…buttons…</div>
  </header>
  <div class="ac-bento ac-stagger"> … cards … </div>
</section>
```
No `<script>` tags inside fragments. With `data-script`, the router imports `demo/pages/<name>.js`: `export default function mount(root, AC) { …; return () => cleanup }`. Mock data → `demo/data.js`. Every rail link `#/<name>` maps to `pages/<name>.html`; missing pages show "coming soon" (and a 404 in the console — so ship every page). Auth/error pages are standalone HTML documents: copy the `<head>` of `demo/offline.html` (boot script + CSS) and use `.ac-auth` / `.ac-fullpage`.

## 8. Icons
Add the Lucide name to `src/icons/icons.txt` (check `node_modules/lucide-static/icons/<name>.svg` exists; the build warns otherwise), rebuild, use `<svg class="ac-icon" aria-hidden="true"><use href="#i-name"/></svg>` (sizes `.ac-icon--sm|md|lg|xl`). In JS: `AC.icon('name')`. Custom icon: drop `src/icons/<name>.svg` and list it.

## 9. i18n
Static text: Persian in markup + `data-i18n="area.key"`; attributes: `data-i18n-attr="placeholder:area.key; aria-label:area.key2"`. Add the key to **all three** `demo/i18n/*.json` (keep alphabetical). Prefix keys by area: `nav.* group.* app.* common.* status.* col.*` (shared) and `<page>.*` (page-local: `users.*`, `kanban.*`). JS text: `AC.t('key', 'fallback')` and re-render on `ac:i18n:change`. Injected HTML is translated automatically.

## 10. Mobile patterns (must use)
- Shell: <1024px rail → drawer, bottom tab bar, large titles. Content already pads for the tab bar + safe areas. Fixed elements near the bottom: `calc(var(--ac-tabbar-h) + var(--ac-safe-bottom) + …)` on mobile.
- Modal on phone = bottom sheet (`overlay.css`): same markup, `@media (max-width: 639.98px)` restyles it with a grab handle and drag-to-dismiss via `AC.gesture(el, {axis:'y'})`.
- Tables → cards: `.ac-table--stack` + `<td data-label="…" data-i18n-attr="data-label:col.x">`; the data table may render a real card list instead.
- Swipe actions on rows: `gesture(row, {axis:'x'})` + `touch-action: pan-y`, reveal actions underneath, snap by velocity (`|vx| > 0.5`).
- Touch targets ≥ 44px (`--ac-touch`); no hover-only affordances; `:active` press = `transform: var(--ac-press)`.
- Every animation ≤ 320 ms with `var(--ac-ease)`; reduced motion is globally handled — but guard JS animations with `AC.reducedMotion()`.

## 11. Shell v2 — floating pills (docs/DESIGN.md)
Light warm-gray canvas, white hairline cards (`--ac-r-xl` 22px, no shadow, hover lift inside `.ac-bento`; opt out `.ac-card--static`), black primary pills, orange accent only for: one filled KPI (`.ac-kpi--accent` / `.ac-card--accent`), switches, ranges, progress, chart highlight (`chart-1` = ink, `chart-2` = accent), brand mark, FAB.
- **Top bar** `header.ac-appbar[data-ac=appbar]` → `.ac-appbar__inner` = start (`a.ac-chrome.ac-brand` > `.ac-brand__mark` + `.ac-brand__name`) · center (`#ac-appbar-title.ac-appbar__title` phone-only collapsing title + `nav.ac-chrome.ac-topnav[data-ac=navpill]` > `.ac-topnav__link`, the router sets `aria-current`, a sliding ink pill follows) · end (`.ac-chrome.ac-utilbar` > `.ac-iconbtn` buttons, `.ac-appbar__count`; `a.ac-chrome.ac-userchip`). `.ac-chrome` = any white floating pill; `[data-hide-phone]`, `[data-mobile-only]` inside the bar.
- **Dock** `aside.ac-dock[data-ac=dock]` (≥1024px, fixed, start edge): `.ac-dock__pill` groups of `.ac-dock__btn` — theme pill `[data-theme-set=light|dark]` (aria-pressed synced), section buttons `[data-ac-rail-group="<id>"]` (open the flyout; the group holding the current page gets `[data-active]` = ink circle), links (`aria-current`), `.ac-dock__foot` (help / sign out), `.ac-dock__dot`. Tooltips come from `aria-label`.
- **Rail** `aside.ac-rail#ac-rail[data-ac=rail]`: groups `div.ac-rail__group[data-group="<id>"]` (+ `.ac-rail__label`, `.ac-rail__link`, `details.ac-rail__sub`). Desktop = flyout next to the dock showing one group; phone/tablet = floating drawer with all groups. `.ac-rail__head` (`.ac-rail__heading-text`, `.ac-rail__close`), `.ac-rail__search`, `.ac-rail__foot` (drawer only). API `AC.rail.open(group?) / close() / toggle(group?)`; triggers `[data-ac-rail-group] [data-ac-rail-open] [data-ac-rail-toggle] [data-ac-rail-close]`. `collapse()` is kept but no longer changes the layout.
- **Tab bar** `.ac-tabbar` (<1024px) is a floating pill, icons only (labels stay for screen readers), sliding ink circle, center `.ac-tabbar__fab` orange.
- **Page head**: greeting-style `.ac-page-head__title` (semibold), muted `__sub`, primary action = `.ac-btn--primary` (black pill).
- Defaults: `theme: light`, `accent: orange` (`theme.accents` starts with `orange`).
