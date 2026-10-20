# Copilot instructions for AraminConsole

The single source of truth is [`AGENTS.md`](../AGENTS.md); read it before suggesting code. Summary:

- Zero-dependency, RTL-first admin UI. Components start from `data-ac="name"` and are registered with `register()` in `src/js/components/`.
- CSS: `.ac-block__element--modifier`, logical properties only (never `left/right`), colours and spacing only through `var(--ac-*)` tokens, no inline `style`.
- New UI text: `data-i18n` keys added to all of `demo/i18n/{fa,en,ar}.json`.
- After editing `src/`, run `npm run build` and commit `dist/`. Tests: `node tests/run.mjs shell standalone`.
- Building an app with the framework? See `skills/aramin-console/SKILL.md` and `llms.txt`.
