# Class and markup reference (condensed from docs/CONVENTIONS.md)

Naming: `.ac-block`, `.ac-block__element`, `.ac-block--modifier`. State uses ARIA/data attributes: `[aria-selected]`, `[aria-expanded]`, `[aria-current="page"]`, `[data-state="open|closed"]`, `[aria-busy]`, `[disabled]`.

## Atoms
- Buttons `.ac-btn` + `--primary|secondary|outline|accent|soft|ghost|danger|danger-soft|link|gradient` and sizes `--sm|--lg`, `--icon|--square|--block`; groups `.ac-btn-group`; icon button `.ac-iconbtn`.
- Card `.ac-card(__head|__titles|__title|__sub|__actions|__body|__body--flush|__foot)` variants `--flat|inset|glass|interactive|aurora|accent`.
- Stats `.ac-stat(__head|__icon|__label|__value|__unit|__foot|__spark)`, `.ac-trend[data-trend=up|down|flat]`, `.ac-kpis > .ac-kpi`.
- Badges `.ac-badge --accent|success|warning|danger|info|neutral|solid|outline|dot`, `.ac-chip[aria-pressed]`, `.ac-status[data-status]`, `.ac-avatar --xs|sm|lg|xl|gradient [data-color=1..8]`, `.ac-avatar-group`.
- Feedback `.ac-alert`, `progress.ac-progress --success|warning|danger`, `.ac-skeleton(--text|title|circle|block)`, `.ac-empty(__art|__title|__text|__actions)`.
- Lists `.ac-list(__item|__thumb|__main|__title|__meta|__end)(--divided|--inset)`, `.ac-feed(__item|__icon|__body)`, `.ac-divider`.
- Navigation `.ac-tabs(--pills)`, `.ac-segmented(--block|--sm)`, `.ac-breadcrumbs`, `.ac-pagination`, `.ac-stepper(--vertical) > .ac-step[data-state]`.

## Forms
`.ac-form`, `.ac-label`, `.ac-input`, `.ac-select`, `.ac-textarea`, `.ac-input-group`, `.ac-switch`, `.ac-check`, `.ac-radio`, `.ac-field__hint`, `.ac-field__error`. Validation rules (pipe-separated in `data-ac-rules`): `required`, `email`, `min:n`, `max:n`, `iran-mobile`, `iran-national-id`, `sheba`, `url`, `match:#other`.

## Tables
`table.ac-table` (+ `--stack` for phone cards with `td data-label`), or `data-ac="table"` for sorting/filtering/paging/selection/bulk actions.

## Overlays
Modal: `.ac-modal[data-ac=modal] > .ac-dialog > __head(__titles(__title,__sub), __close[data-ac-close]) + __body + __foot`. Sheet/drawer share the pattern. Toasts live in `.ac-toasts`.

## Charts
`.ac-chart-slot(--sm|--lg|--square)[data-ac=chart]`, `.ac-legend`. Types: line, area, bar, donut, gauge, sparkline, heatmap. `labels` may be an array or a generator like `"days:7"`, `"months:12"`.

## Utilities
`ac-stack ac-cluster ac-row ac-spread ac-grow ac-grid(-2/-3/-4) ac-gap-0..8 ac-truncate ac-clamp-2 ac-visually-hidden ac-hide-mobile(<1024) ac-hide-desktop ac-hide-phone(<640) ac-num ac-mono ac-ltr ac-text-(xs|sm|lg|soft|muted|accent|success|warning|danger|start|center|end) ac-stagger ac-animate-in ac-pressable ac-only-light ac-only-dark`.

## Credit
`.ac-powered`: small attribution link, placed at the bottom of the rail (desktop) and the end of content (phones). Optional.
