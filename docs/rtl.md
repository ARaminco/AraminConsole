# RTL / LTR

AraminConsole is RTL-first (fa, ar) and must be pixel-correct in LTR (en). `i18n.set(lang)` sets `<html lang dir>`; every layout mirrors through CSS logical properties. Check with `node tests/rtl.mjs` (static scan + rendered geometry; `--static` for the scan only).

## Rules
1. **Logical properties only**: `margin/padding-inline-start|end`, `inset-inline-start|end`, `border-inline-*`, `border-start-start-radius…`, `text-align: start|end`, `inline-size/block-size`. The scanner rejects `margin-left`, `padding-right`, `border-left`, `left:`/`right:`, `text-align:left|right`, `float`, `*-left-radius` and literal `translateX(±n)`.
2. **Allow-list** a line with `/* rtl-ok: reason */` — only for JS-measured physical geometry (indicators, positioned popovers, ripples, kanban ghost) or glyphs that never mirror (a check mark, a rotated border chevron).
3. **Direction-aware transforms**: `translateX(calc(24px * var(--ac-dir)))`; `--ac-dir` is `1` in LTR and `-1` in RTL (set on `[dir]`). Keyframes that travel also multiply by `--ac-travel` (motion preference).
4. **Directional icons** get `.ac-flip-rtl` (arrows, chevrons pointing "next/back", log-out, panel icons). Trend arrows (`.ac-trend`), pagination and date-picker nav flip automatically. Up/down, plus, check, close never flip.
5. **Measured geometry** (indicators, popovers, tooltips, chart tooltips) is computed in physical px from `getBoundingClientRect()` and placed with `left: 0` + `transform`, so it is correct in both directions without branching. Scroll containers: add `scrollLeft/scrollTop` and subtract `clientLeft/clientTop` (in RTL `clientLeft` includes a left scrollbar). The element that hosts an absolutely positioned indicator must be its containing block.
6. **Placement is logical**: `position(anchor, panel, { placement: 'bottom-start' })` — `start`/`end` resolve per direction (dropdowns align to the trigger's start edge, submenus open toward the inline end, the language picker uses `bottom-end`).
7. **Gestures** read direction: swipe-to-dismiss, drawers, split panes and list swipe actions convert `dx` with the direction sign; arrow keys swap in RTL (`ArrowLeft` = next) for tabs, segmented, charts, date picker, kanban.
8. **Charts** mirror their x-axis in RTL (time runs right → left) through one SVG `matrix(-1 0 0 1 W 0)` on the plot group; text is placed with mirrored x but never mirrored glyphs. The grow-in stagger therefore starts at the start edge in both directions.
9. **Mixed-direction text**: wrap Latin/number runs that must keep their order inside RTL text in `<bdi>` or `.ac-ltr` (`direction: ltr; unicode-bidi: isolate`) — timestamps like `17/04/2026 · 15:45`, card numbers, IBANs, codes, e-mails, file paths. Inside a list whose rows contain names in other scripts, isolate the name (`<bdi dir="rtl">فارسی</bdi>`) so the row keeps the UI's alignment (see the language picker).
10. **Switching language** live: the document crossfades with a blur bridge (`AC.motion.transition(…, { kind: 'lang' })`) — nothing slides while the layout mirrors; indicators re-seat instantly on `ac:i18n:change`.

## Language picker
`<button data-ac="langpicker"></button>` — data from `AC.i18n.languages` (`{ code, name, english, dir, glyph, flag }`; push entries to add languages). Popover on desktop, bottom sheet on phones, search when there are more than 6, keyboard ↑ ↓ Home End + type-ahead, RTL/LTR tag per language, inline-SVG script badge + CSS flag dot (no emoji — they don't render on Windows). Event `ac:langpicker:change { lang, from }`.

## Test coverage (`tests/rtl.mjs`)
Static scan of `src/**/*.css`; in fa and en: document dir, dock side and inset, top-nav order, page-title edge, dropdown anchor, submenu side, flyout side, language picker anchor and row layout, toast corner, sliding highlight exactly on the hovered row (menu, rail), phone tab-bar order, no horizontal overflow at 390 px, tab bar fully on screen, and a live fa → en switch that moves the dock and re-seats the nav pill.
