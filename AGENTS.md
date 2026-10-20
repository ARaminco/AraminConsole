# AGENTS.md — AraminConsole operating guide for AI coding assistants

AraminConsole is a zero-dependency, RTL-first admin UI framework: **one CSS file + one ES module** (`window.AC`). No npm runtime deps, no framework, no bundler required to use it. Read this file first, then `docs/CONVENTIONS.md` (the full rulebook) and `llms.txt` (index of every doc). Building an app *with* AraminConsole (not changing it)? Use the Agent Skill in `skills/aramin-console/SKILL.md`.

## Architecture map
```
src/css/            tokens.css base.css layout.css motion.css  +  components/*.css   (design system; tokens = --ac-*)
src/js/core.js      AC namespace, register() auto-init, i18n, theme, format, gesture, trapFocus
src/js/components/  one file per component (register('name', el => …))
src/modules/<name>/ optional feature modules (maps, tickets, files, invoice-ir, …) with module.json
src/modules.json    module manifest (core + shell + overlays + …; sizes written by the build)
src/icons/          icons.txt = Lucide names put into the sprite (dist/icons.svg)
dist/               COMMITTED build output (aramin-console[.min].{css,js}, boot, icons.svg, modules/)
demo/               the live demo app (index.html shell, pages/*.html fragments, auth/, errors/, i18n/{fa,en,ar}.json)
docs/               per-area documentation (also index in llms.txt)
starters/           copy-ready projects: html, laravel-blade, nextjs
skills/aramin-console/  Agent Skill (cheat-sheet + recipes) for building with the framework
tests/              Playwright suites, run through tests/run.mjs
scripts/            build.mjs, minify.mjs, serve.mjs, llms.mjs
```

## Commands
| Task | Command |
|---|---|
| Build everything into `dist/` | `npm run build` |
| Dev server (http://localhost:5178/demo/) | `npm run dev` |
| Regenerate `llms.txt` / `llms-full.txt` | `npm run llms` |
| Full tests (build + all suites) | `npm test` |
| Selected suites | `node tests/run.mjs shell standalone` (names = files in `tests/` without `.mjs`) |
| Custom build | `node scripts/build.mjs --modules=forms,table --out=dist/custom` |

Always run `npm run build` after touching `src/` and commit the resulting `dist/` (CI checks it; consumers copy `dist/` directly).

## Conventions (non-negotiable)
- **Components** start from `data-ac="name"` and are registered with `register('name', (el) => { …; return destroy; })`. Options come from `data-*` attributes or `data-ac-config='{json}'` through `options(el, defaults)`. Public API goes on `AC.<name>`. Events: `emit(el, 'name:event', detail)` → `ac:name:event` (bubbles).
- **Bundler limits**: only `import {a} from './x.js'`, `export function|const|class`, `export {…}`; no default exports, no circular imports, no npm imports.
- **CSS**: BEM-ish `.ac-block__element--modifier`; state through ARIA/data attributes (`[aria-selected]`, `[data-state]`); **logical properties only** (`margin-inline-start`, `inset-inline-end`, never `left/right`, except JS-measured indicators); directional icons get `.ac-flip-rtl`.
- **Tokens only**: colours, radii, spacing, motion via `var(--ac-*)`. No hex colours. Dark mode is a token swap, not per-component overrides.
- **No inline `style=""`** in markup; no `<script>` inside page fragments.
- **i18n**: Persian text in markup + `data-i18n="area.key"`; attributes via `data-i18n-attr="aria-label:area.key"`. New keys go into **all three** `demo/i18n/{fa,en,ar}.json`.
- **Mobile**: touch targets ≥ 44px (`--ac-touch`), no hover-only affordances, modals become bottom sheets on phones, tables stack (`.ac-table--stack` + `data-label`).
- **Accessibility**: focus trap in overlays, roving tabindex in widgets, visible focus, honour `AC.reducedMotion()`.
- Icons: add the Lucide name to `src/icons/icons.txt`, rebuild, use `<svg class="ac-icon"><use href="#i-name"/></svg>`.

## How to add…
**A component** — `src/js/components/<name>.js` with `register()`; CSS in `src/css/components/<name>.css`; list both in the owning module in `src/modules.json` (or in a module folder); document in the matching `docs/*.md`; add a test in `tests/`; `npm run build`.
**A module** — folder `src/modules/<name>/` with `<name>.js`, `<name>.css`, `module.json` (`description`, `dependencies`); picked up automatically; `node scripts/build.mjs --sync-manifest` records sizes; document in `docs/modules.md`.
**A demo page** — `demo/pages/<name>.html` (fragment shape in `docs/CONVENTIONS.md` §7), rail link `#/<name>`, optional `demo/pages/<name>.js` default export `mount(root, AC)`.

## Do
- Reuse existing atoms (`.ac-card`, `.ac-btn`, `.ac-bento`, `.ac-stat`, …) before inventing classes.
- Keep it dependency-free; keep modules independent (declare `dependencies`).
- Keep docs and `llms.txt` in sync (`npm run llms`).
- Keep the `.ac-powered` credit in the base template and starters (users may remove it; MIT).

## Don't
- Don't add runtime dependencies, CDNs, or build steps required by consumers.
- Don't hard-code colours, `left/right`, `px` font sizes, or `!important` (except documented utilities).
- Don't edit files in `dist/` by hand; don't commit `node_modules/`.
- Don't remove or rename public `AC.*` APIs, `data-ac` names, or `--ac-*` tokens without a CHANGELOG entry.

License: MIT © 2026 Ali Asghar Ramin. Powered by AIR — https://air.co.ir/
