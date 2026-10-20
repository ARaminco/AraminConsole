---
name: aramin-design-system
description: Design or review user interfaces with the AraminConsole design system - --ac-* tokens (colour, type, space, radius, shadow, motion, z-index), Air theme, page/dashboard/table/form/empty-state/mobile patterns, RTL and Persian UX copy. Use when designing, styling, polishing or reviewing a Persian/RTL admin UI, dashboard or panel ("طراحی پنل", "سیستم طراحی", "بازبینی UI"), when choosing colours, spacing, motion or components, or when the user mentions AraminConsole tokens, Air theme or ac-* classes. For component markup and APIs use the aramin-console skill.
---

# AraminConsole design system

Full docs (Persian): `docs/design-system/README.md` · token tables: `docs/design-system/tokens.md` · machine tokens: `dist/tokens.json` · live page: `demo/#/design-system`. Component APIs and markup: the **aramin-console** skill (`skills/aramin-console/`). Reply to Persian users in plain Persian; keep code in English.

## Hard rules
1. Colour, spacing, radius, shadow, motion = `var(--ac-*)` only. No hex, px-radius, raw `z-index`, raw durations.
2. CSS logical properties only (`margin-inline-start`, `inset-inline-end`, `text-align:start`); never `left/right/float`. Direction transforms: `translateX(calc(24px * var(--ac-dir)))`.
3. Directional icons get `.ac-flip-rtl`. Latin runs inside Persian text (card no., IBAN, email, time) go in `<bdi>` or `.ac-ltr`.
4. One primary action per page: ink button (`.ac-btn--primary`). Accent is for emphasis (focus, switch, progress, one chart series); at most one filled accent KPI; one warm spot (`--ac-highlight`).
5. Cards: `.ac-card` (white, hairline border, almost no shadow). Separate with space and border before shadow.
6. Animate only `transform/opacity/filter/clip-path`; ease-out for enter/exit (`--ac-ease`), never ease-in; UI < 300 ms; exits faster (`--ac-dur-exit`); respect `data-motion="reduced"`.
7. Text contrast >= 4.5:1; use `*-ink` for coloured text, `--ac-accent-contrast` on solid accent, never rely on colour alone; touch target >= `--ac-touch` (44px); keep focus ring (`--ac-focus`).
8. Reuse a `data-ac` component/class before inventing markup. Missing icon = add name to `src/icons/icons.txt`, rebuild.
9. Persian copy: «شما»، فعل مشخص روی دکمه («ذخیره تغییرات»)، خطا = چه شد + چه کنیم، واحد پول همیشه کنار مبلغ (تومان = 10 ریال)، ارقام یکدست.

## Token cheat-sheet (default Air; attributes on `<html>`: `data-theme` light|dark, `data-accent` air|orange|violet|blue|emerald|rose|amber|slate, `data-density` comfortable|compact, `data-radius` sharp|default|round)
| Group | Tokens |
|---|---|
| Surface | `--ac-bg` canvas, `--ac-surface-1` card, `-2` inset/KPI, `-3` track, `--ac-elevated` menus, `--ac-chrome-bg` floating pills |
| Text | `--ac-text`, `--ac-text-soft`, `--ac-muted` (labels), `--ac-faint` (decorative only) |
| Border | `--ac-border` hairline, `--ac-border-strong` |
| Brand | `--ac-ink` (+`-hover`,`-contrast`), `--ac-accent` (+`-2`,`-contrast`,`-soft`,`-ink`), `--ac-highlight` |
| Status | `--ac-{success,warning,danger,info,neutral}` + `-soft` bg + `-ink` text |
| Type | `--ac-font`, `--ac-fs-2xs..4xl` (11,12,13,**14 body**,16,18,22,28,36 px), `--ac-lh-tight/snug/normal`, `--ac-fw-regular..black` |
| Space | `--ac-s-1..12` (4px steps), `--ac-gap` 16, `--ac-card-pad`, `--ac-control-h` 40, `--ac-touch` 44 |
| Radius | `--ac-r-xs 6, sm 10, md 12, lg 16, xl 22 (card), 2xl 28 (sheet), pill` |
| Shadow | `--ac-shadow-xs..xl`, `-chrome`, `-glow` |
| Motion | `--ac-ease` `-out` `-in-out` `-move` `-drawer` `-hover`, `--ac-spring`, `--ac-dur-0..4` (100/140/180/240/300), `--ac-dur-sheet` 420, `--ac-dur-exit` 140, `--ac-stagger` 45 |
| Z | `--ac-z-sticky 20, rail 40, appbar 50, tabbar 55, dropdown 60, drawer 70, sheet 80, modal 90, toast 100, palette 110, tooltip 120` |
| Layout | breakpoints 640 / 1024 / 1280 px; `.ac-bento` 12 cols (`ac-span-xs-6`, `ac-span-md-*`, `ac-span-*`, `ac-span-xl-*`); `--ac-safe-*` safe areas |

Brand override (after the framework CSS): `:root{--ac-accent:#0e9f6e;--ac-accent-2:#34d399}` + dark variant; derived tokens follow. The AIR logo is a trademark (not MIT): replace it in other products.

## Pattern recipes (details: `docs/design-system/patterns.md`)
- Page: `section.ac-page > header.ac-page-head[data-ac=largetitle] + .ac-bento.ac-stagger`; one `h1`.
- Dashboard: 3-4 `.ac-stat` KPIs (counter) -> main chart -> short table.
- CRUD: card with flush body + `data-ac="table"`; edit in modal/drawer; delete via `AC.confirm({tone:'danger'})` then toast.
- States: every list has loading (`.ac-skeleton` shaped like content), empty (`.ac-empty` with next step), error (`.ac-alert` + retry).
- Mobile (< 640px): floating tab bar, sheets for overlays, large collapsing title, swipe actions with an alternative, safe-area padding.

## Do / Don't
| Do | Don't |
|---|---|
| `color: var(--ac-muted)` | `color: #888` |
| `padding-inline: var(--ac-s-4)` | `padding: 0 16px 0 16px` / `margin-left` |
| status badge = soft bg + ink text + label | red text only |
| `.ac-btn--primary` once per page | three filled coloured buttons |
| `AC.money.format(n,{currency:'IRT'})` | `n + ' تومان'` by hand |
| skeleton shaped like content | full-page spinner |
| reuse `data-ac="modal"` | custom overlay with `z-index:9999` |

## Review checklist (run through, then report findings with file:line)
1. No raw colours/px radii/z-index/durations; tokens exist for everything.
2. No physical `left/right`; arrows flipped; mixed-direction runs isolated; checked `fa` + `en`, no horizontal scroll at 390px.
3. Light **and** dark checked; custom colours have contrast >= 4.5:1.
4. One primary action; hierarchy by size/weight/space, not extra colour.
5. Loading/empty/error states exist; destructive actions confirmed.
6. Keyboard path works; icons-only buttons have `aria-label`; focus ring visible; targets >= 44px on touch.
7. Motion: transform/opacity only, < 300 ms, no ease-in, reduced-motion handled.
8. Persian copy: plain, specific button verbs, units on money, consistent digits and dates (Jalali by default).
9. Existing `data-ac` component used where one exists.

Verification tip: `node tests/rtl.mjs --static` scans CSS for physical properties; `npm run tokens` regenerates the token docs after editing `src/css/tokens.css`.
