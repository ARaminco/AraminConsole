# Theming tokens and modules

## Token groups (`--ac-*`, defined in `src/css/tokens.css`)
- Surfaces: `bg bg-subtle surface-1 surface-2 surface-3 elevated hover active scrim`; lines `border border-strong`; text `text text-soft muted faint`.
- Ink (black primary, white in dark): `ink ink-hover ink-contrast`.
- Accent: `accent accent-2 accent-hover accent-soft accent-ink accent-contrast focus gradient`.
- Status: `success|warning|danger|info` + `-soft` + `-ink`; charts `chart-1..8`.
- Radius `r-xs sm md lg xl 2xl pill`; space `s-0..12` (0.25rem steps); type `fs-2xs … fs-4xl`; shadows `shadow-xs … shadow-xl`.
- Metrics (density-aware): `control-h control-px card-pad row-h gap touch`; motion `ease dur-1..4`.
- Layout: `appbar-h tabbar-h rail-w content-max safe-top/bottom/start/end`.

Override example (brand colour):
```css
:root { --ac-accent: #0a7cff; --ac-accent-2: #5ab0ff; }
```
Dark mode is a token swap: never write `[data-theme=dark] .x` rules; fix the token instead.

## Modules (`node scripts/build.mjs --modules=…`)
`core` (always) · `shell` · `overlays` · `customizer` · `langpicker` · `forms` · `datepicker` · `data-display` · `table` · `chart` · `apps` (kanban, split) · `money` · `chat` · `files` · `invoice-ir` · `mail` · `maps` · `marketing` · `notify` · `prose` · `pwa` · `support-chat` · `terminal` · `tickets` · `uptime` · `user-panel`.
Dependencies are resolved automatically. Lazy-load at runtime: `await AC.use('maps')`. Config file route: `aramin.config.json` with `modules`, `out`, `modulesBase`. See `docs/modules.md`.
