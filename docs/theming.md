# Theming

Every colour, radius, shadow, spacing, and motion value is a CSS custom property named `--ac-*` (defined in `src/css/tokens.css`). Components read only tokens, so a theme is just a set of token overrides. Dark mode works the same way: it swaps tokens.

## Switches on `<html>`

| Attribute | Values | Default | Saved in `localStorage` |
|---|---|---|---|
| `data-theme` | `light` · `dark` (unset = follow the OS) | `light` | `ac:theme` (`light` / `dark` / `auto`) |
| `data-accent` | `orange` · `violet` · `blue` · `emerald` · `rose` · `amber` · `slate` | `orange` | `ac:accent` |
| `data-density` | `comfortable` · `compact` | `comfortable` | `ac:density` |
| `data-radius` | `sharp` · `default` · `round` | `default` | `ac:radius` |
| `lang` / `dir` | `fa`/`ar` → `rtl`, others → `ltr` | `fa` / `rtl` | `ac:lang` |

`aramin-console-boot.js` applies the saved values before first paint. At runtime:

```js
AC.theme.set({ theme: 'dark', accent: 'blue', density: 'compact', radius: 'round' });
AC.theme.toggle();                       // light ⇄ dark
AC.theme.get();                          // { theme, resolved, accent, density, radius }
document.addEventListener('ac:theme:change', (e) => console.log(e.detail));
```

## Brand your panel

Override tokens after the framework CSS:

```css
/* brand.css — loaded after aramin-console.css */
:root {
  --ac-accent: #0e9f6e;            /* your brand colour */
  --ac-accent-2: #34d399;          /* gradient partner (brand mark, filled KPI, FAB) */
  --ac-font: "Inter", "Vazirmatn", system-ui, sans-serif;
  --ac-r-xl: 18px;                 /* card radius */
}
:root[data-theme="dark"] { --ac-accent: #31c48d; }
```

Derived tokens (`--ac-accent-soft`, `--ac-accent-ink`, `--ac-accent-hover`, `--ac-ring`) are computed from `--ac-accent` with `color-mix()`, so you rarely need to set them.
Add your own preset with `:root[data-accent="brand"] { --ac-accent: …; --ac-accent-2: …; }` and push `'brand'` to `AC.theme.accents`.

## Token reference

### Colour
| Token | Light | Dark | Use |
|---|---|---|---|
| `--ac-bg` | `#f2f2f3` | `#0b0b0c` | page canvas |
| `--ac-bg-subtle` | `#ebebed` | `#111113` | subtle areas |
| `--ac-surface-1` | `#ffffff` | `#161618` | cards, pills |
| `--ac-surface-2` | `#f6f6f7` | `#1c1c1f` | inset panels, KPI tiles |
| `--ac-surface-3` | `#eeeef0` | `#242428` | tracks |
| `--ac-border` / `--ac-border-strong` | `#ececee` / `#dcdce0` | `#232326` / `#313136` | hairlines |
| `--ac-text` / `--ac-text-soft` | `#111113` / `#4b4b52` | light | text |
| `--ac-muted` / `--ac-faint` | `#8b8b93` / `#b6b6bd` | | secondary text |
| `--ac-ink` / `--ac-ink-contrast` | `#111113` / `#fff` | `#fff` / `#0b0b0c` | primary buttons, active pill |
| `--ac-accent` / `--ac-accent-2` | `#f0532d` / `#ff7a4d` | `#f2603b` | accent, gradient |
| `--ac-accent-soft` · `-ink` · `-hover` · `-contrast` | derived | derived | tints, readable accent text, text on accent |
| `--ac-success` · `warning` · `danger` · `info` | `#16a34a` · `#e08a00` · `#e5484d` · `#2f7cf6` | | status (each has `-soft` and `-ink`) |
| `--ac-chart-1..8`, `--ac-chart-grid` | ink, accent, … | | chart series |
| `--ac-glass-bg` · `-strong` · `-border` · `-blur` | | | frosted chrome |
| `--ac-scrim`, `--ac-hover`, `--ac-active` | | | overlays and states |

### Shape, space, and type
| Token | Values |
|---|---|
| `--ac-r-xs … --ac-r-2xl`, `--ac-r-pill` | 6 · 10 · 12 · 16 · 22 · 28px, 999px |
| `--ac-s-0 … --ac-s-12` | 0 to 3rem in 0.25rem steps |
| `--ac-fs-2xs … --ac-fs-4xl` | 0.6875rem to 2.25rem |
| `--ac-lh-tight / snug / normal` | 1.2 / 1.4 / 1.65 |
| `--ac-fw-regular … --ac-fw-black` | 400 to 800 |
| `--ac-shadow-xs … xl`, `--ac-shadow-chrome`, `--ac-shadow-inset` | layered shadows |

### Density-aware metrics
`--ac-control-h` (2.5rem; compact 2.125rem), `--ac-control-h-sm`, `--ac-control-h-lg`, `--ac-control-px`, `--ac-card-pad`, `--ac-row-h`, `--ac-gap`, `--ac-touch` (44px), `--ac-pill-h`.

### Motion
`--ac-ease`, `--ac-ease-out`, `--ac-ease-in`, `--ac-ease-spring`, `--ac-spring` (a `linear()` spring), `--ac-dur-0 … --ac-dur-4` (100 to 300ms). `prefers-reduced-motion: reduce` turns motion off everywhere.

### Layout
`--ac-appbar-h`, `--ac-tabbar-h`, `--ac-rail-w`, `--ac-flyout-w`, `--ac-content-max`, `--ac-content-pad`, `--ac-safe-top / bottom / start / end` (safe-area insets).

## Dark mode rules for your own CSS
- Use tokens, never raw colours. If you find yourself writing `:root[data-theme="dark"] .my-thing`, a token is probably missing.
- Text on the accent colour uses `--ac-accent-contrast`; accent-coloured text uses `--ac-accent-ink`.
- `.ac-only-light` / `.ac-only-dark` show content in one theme only (for example, the sun and moon icons).
