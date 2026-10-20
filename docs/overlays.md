# Overlays & feedback

Modal, bottom sheet, drawer, dropdown / context menu / action sheet, popover, tooltip, confirm & prompt,
toast, alert / banner, notification center and the theme customizer.
Files: `src/js/components/{position,sheet,modal,drawer,menu,popover,tooltip,toast,confirm,alert,notifications,customizer}.js`,
`src/css/components/{overlay,feedback}.css`. Live demo: `demo/#/overlays`, `demo/#/notifications`. Tests: `node tests/overlays.mjs --base=http://localhost:5178`.

Visual language (docs/DESIGN.md): white `--ac-elevated` surfaces, `--ac-r-2xl` radius, hairline `--ac-border`, one soft large shadow,
black pill primary (`.ac-btn--primary`) and gray pill secondary in footers. Tokens only — dark mode is a token swap.

## Shared behaviour
- Every layer is portaled to `<body>` while open and put back afterwards, so it escapes transformed / clipped parents.
  Closed layers are `display: none` (`data-state="closed"`); during the exit animation `data-state="closing"`.
- One layer stack (`AC.layers`): **Esc** and **outside click** go to the top-most layer only. Navigation (`hashchange`) closes all.
- Dialog layers (modal / sheet / drawer / confirm): `role="dialog"` + `aria-modal="true"`, labelled by `.ac-dialog__title`
  and described by `.ac-dialog__text`; focus trap (`AC.trapFocus`); focus returns to the trigger; `AC.scrollLock` (ref-counted).
- Generic triggers: `[data-ac-open="#id"]` opens/toggles any modal, sheet, drawer, dropdown or popover; `[data-ac-close]` inside closes
  (its value becomes the close `reason`).
- Reduced motion: CSS durations are globally zeroed; JS timers skip animation when `AC.reducedMotion()`.

## Dialog markup (modal / sheet / drawer share it)
```html
<button class="ac-btn" data-ac-open="#new-ws">New workspace</button>
<div class="ac-modal" id="new-ws" data-ac="modal" data-size="md" data-initial="#ws-name">
  <div class="ac-dialog">
    <div class="ac-dialog__head">
      <div class="ac-dialog__titles"><h2 class="ac-dialog__title">Create workspace</h2><p class="ac-dialog__sub">…</p></div>
      <button class="ac-dialog__close" data-ac-close aria-label="Close"><svg class="ac-icon"><use href="#i-x"/></svg></button>
    </div>
    <div class="ac-dialog__body">…</div>
    <div class="ac-dialog__foot">
      <button class="ac-btn" data-ac-close>Cancel</button>
      <button class="ac-btn ac-btn--primary" data-ac-close="save">Create</button>
    </div>
  </div>
</div>
```
| Attribute | Applies to | Meaning |
|---|---|---|
| `data-size="sm\|md\|lg\|xl\|full"` | modal | width 26 / 32 / 48 / 64 rem / full |
| `data-size="sm\|lg"`, `data-side="start\|end"` | drawer | 22 / 36 rem; logical side (RTL-aware) |
| `data-snap="0.5,0.92"`, `data-snap-start="0"` | sheet | snap points as viewport fractions |
| `data-static` | all | Esc / backdrop do not close; the panel "bumps" instead |
| `data-initial="#sel"` | all | element focused on open (else `[autofocus]`, else the panel) |

**Phones (<640px):** a modal presents as a bottom sheet automatically (grab handle, drag-to-dismiss, safe-area padding).
Sheets: drag the handle/head (or anywhere when the inner scroller is at the top) — rubber-band above the top snap,
velocity flick (`|vy| > 0.5 px/ms`) goes to the next snap or dismisses, a resting release snaps to the nearest point,
the backdrop fades with the drag below the lowest snap. Drawers dismiss by swiping toward their edge.

API: `AC.modal.open('#id' | el | { title, sub, content, footer, size, static, initial })`, `AC.modal.close([target])`,
same for `AC.sheet` (`snap`) and `AC.drawer` (`side`). Object form builds an ephemeral layer removed after close.
`AC.instance(el, 'modal')` → `{ open, close, toggle, bump, snapTo, isOpen }`.
Events: `ac:<kind>:open {trigger}`, `ac:<kind>:beforeclose {reason}` (cancelable), `ac:<kind>:close {reason}`, `ac:<kind>:closed`, `ac:sheet:snap {index, value}`.

## Confirm & prompt
```js
if (await AC.confirm({ tone: 'danger', title: 'Delete project?', text: '…', confirmText: 'Delete' })) …
const name = await AC.prompt({ title: 'Rename', label: 'New name', value: 'a.pdf', required: true,
  validate: (v) => v.endsWith('.pdf') || 'Must end with .pdf' });   // string | null
```
Tone `danger|warning|success|info|accent` sets the icon and (danger) the red confirm button; danger dialogs focus *Cancel*.
`role="alertdialog"`; centred on desktop, sheet on phones.

## Menus
```html
<button class="ac-btn" data-ac-open="#m">Actions</button>
<div class="ac-menu" id="m" data-ac="dropdown" data-placement="bottom-end" aria-label="Actions">
  <div class="ac-menu__label">Edit</div>
  <button class="ac-menu__item" data-value="dup"><svg class="ac-icon">…</svg><span class="ac-menu__text">Duplicate</span><kbd class="ac-menu__kbd">Ctrl D</kbd></button>
  <div class="ac-menu__sub"><button class="ac-menu__item"><span class="ac-menu__text">Share</span></button><div class="ac-menu">…</div></div>
  <div class="ac-menu__sep"></div>
  <button class="ac-menu__item" role="menuitemcheckbox" aria-checked="true">Show grid</button>
  <div role="group"><button class="ac-menu__item" role="menuitemradio" aria-checked="true">Newest</button>…</div>
  <button class="ac-menu__item" data-tone="danger">Delete</button>
</div>
<div data-ac-contextmenu="#m" tabindex="0">right-click / long-press here</div>
```
Keyboard: ↑ ↓ Home End, type-ahead, Enter/Space, → / ← (mirrored in RTL) for submenus, Esc, Tab closes. Roving tabindex,
`aria-haspopup` / `aria-expanded` on triggers. Checkbox / radio items keep the menu open (`data-keep` does it for any item).
Context menus: right click, the ContextMenu key / Shift+F10, or a 480 ms long-press on touch (with haptic).
**Phones:** every top-level menu becomes an action sheet with a Cancel button; submenus expand inline.
Imperative: `AC.menu(anchor | {x,y} | event, items, { placement, keyboard })` with
`items = [{ label, icon, shortcut, tone, disabled, value, checked, radio:'group', keep, onSelect(item), items:[…] }, '-', { heading }]`;
`AC.menu.open('#m', anchorOrEvent)`, `AC.menu.close()`, `AC.menu.context(el, items)`.
Event: `ac:menu:select { item, value, checked }`.

## Popover, tooltip, positioning
```html
<button data-ac-open="#invite">Invite</button>
<div class="ac-popover" id="invite" data-ac="popover" data-placement="bottom-start" aria-label="Invite">…</div>
<button data-ac-tooltip="Copy link" data-ac-tooltip-kbd="Ctrl C" data-ac-tooltip-placement="top" aria-label="Copy">…</button>
```
Popovers are non-modal: light dismiss (outside click, Esc, focus leaving), focus returns to the trigger.
`AC.popover.open|close|toggle(target, anchor)`, `AC.popover.show(anchor, { content, placement })`.
Tooltips: mouse hover after 450 ms (instant while "warm"), keyboard focus (`:focus-visible`), never on touch; one shared
`role="tooltip"` linked with `aria-describedby`; Esc hides.

`AC.position(anchor, panel, { placement:'bottom-start', offset, padding, flip, shift })` — placement `<side>-<align>`,
side `top|bottom|start|end|left|right`, align `start|center|end`; logical values follow `dir`. Flips to the side with room,
shifts inside the viewport, writes `--ac-x/--ac-y/--ac-origin/--ac-avail-h` and `data-side`. `AC.autoPosition()` keeps it
in place on scroll / resize and returns `stop()`.

## Toasts
```js
AC.toast({ title: 'Saved', text: 'All changes synced', tone: 'success', duration: 4500, position: 'bottom-end',
           action: { label: 'View', onClick(t) {} } });
AC.toast.success|error|warning|info(title, text?, opts?)
AC.toast.undo('3 messages archived', () => restore());
AC.toast.promise(fetch(…), { loading: 'Saving…', success: 'Saved', error: (e) => e.message });
AC.toast.dismiss(id?)   // returns of AC.toast(): { id, el, close(), update(patch) }
```
Stacked (newest in front, the rest peek behind), expand on hover / focus / tap, timers pause while expanded or the tab is hidden,
progress bar, swipe sideways to dismiss (velocity aware), max 5. Container: `#ac-toasts` (else created);
`position` creates per-position containers. On phones toasts sit at the top. Events `ac:toast:open`, `ac:toast:close {reason}`.

## Alerts / banners
```html
<div class="ac-alert" data-tone="warning" data-ac="alert" data-persist="storage-80" role="status">
  <svg class="ac-icon ac-alert__icon"><use href="#i-triangle-alert"/></svg>
  <div class="ac-alert__body"><div class="ac-alert__title">…</div><div class="ac-alert__text">…</div><div class="ac-alert__actions">…</div></div>
  <button class="ac-alert__close" data-ac-close aria-label="Dismiss">…</button>
</div>
```
Variants `.ac-alert--solid`, `--outline`, `--banner`. `data-ac="alert"` makes it dismissible (animated collapse);
`data-persist` remembers the dismissal (`AC.alertReset(key)`). Event `ac:alert:close` (cancelable).

## Notification center
Shell wiring: put **`data-ac-notifications-open`** on the bell (button or link — a plain click opens the panel, Ctrl/⌘-click
follows the link) and **`data-ac-notifications-src="pages/notifications.json"`** on it (or call `AC.notifications.set(list)`).
A `.ac-appbar__count` inside the bell, or any `[data-ac-notifications-count]`, shows the unread count (hidden at 0).
Desktop: anchored panel (tabs All/Unread, grouped Today/Earlier, mark all read, "view all" link). Phones: full-height sheet.
Page view: `<div data-ac="notifications" data-mode="page" data-src="…json"></div>` (adds Mentions/System tabs and a per-row menu
with mark read/unread and remove + undo toast).
Item: `{ id, title, text, time | ago (minutes), icon, tone, avatar, color, kind, read, href }` — `title`/`text`/`avatar` may be `{ fa, en, ar }`.
API: `AC.notifications.set|add(item, {toast})|markRead(id, read)|markAllRead()|remove(id)|load(url)|open(anchor)|close()|toggle()`, `.list`, `.unread`.
Events: `ac:notifications:change { unread }`, `ac:notifications:select { item }`.

## Theme customizer
Any **`data-ac-customizer-open`** element opens the drawer (end side): theme light / dark / system with previews, accent swatches
(`AC.theme.accents`), density, radius, language & direction (fa / en / ar), digits (Latin / Persian), reset. It writes through
`AC.theme.set`, `AC.i18n.set`, `AC.i18n.setDigits`, stays in sync with changes made elsewhere, and registers the palette
command `customizer:open`. API: `AC.customizer.open|close|toggle()`.

## i18n keys
`overlay.*` (framework strings: close, cancel, confirm, delete, undo, …), `notif.*`, `custom.*`; the demo page uses `ov.*`.
