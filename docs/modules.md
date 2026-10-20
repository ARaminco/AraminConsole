# Modules — include all, include some, remove one, lazy-load, write your own

AraminConsole is split into **modules**. `core` is always present; everything else is optional and can be bundled up front,
left out, or loaded on demand. The source of truth is [`src/modules.json`](../src/modules.json) plus every folder in
`src/modules/<name>/` (discovered automatically).

| Module | What it is | Depends on |
|---|---|---|
| `core` *(always)* | tokens, base, app-shell layout, motion, atoms (button, card, misc), **base form controls and tables** (static markup is always styled), runtime (`AC`, auto-init, i18n, theme, format, gestures, focus trap) and the `AC.use()` loader | — |
| `shell` | rail / dock, tab bar, large title, tabs & segmented, command palette, press ripple, pull-to-refresh, ring | core |
| `overlays` | layers & positioning, modal, sheet, drawer, menus, popover, tooltip, confirm/prompt, toast, alert, notification center | core |
| `customizer`, `langpicker` | theme customizer drawer, language picker | overlays (+ shell) |
| `forms`, `datepicker` | input behaviours, combobox, dropzone, validation, wizard; Jalali/Gregorian pickers | core / forms |
| `data-display`, `table`, `chart`, `apps`, `money` | lists, tree, code/JSON/log viewers · data table · SVG charts · kanban/split + app screens · money, banks, cards | … |
| `src/modules/*` | `pwa`, `notify`, `tickets`, `support-chat`, `chat`, `mail`, `maps`, `marketing`, `invoice-ir`, `prose`, `terminal`, `uptime`, `user-panel`, `files`, … | declared per module |

`npm run build` prints the size table (raw / min / gzip) for every module; `dist/modules/modules.json` has the resolved graph and sizes.

## Outputs
| File | Use |
|---|---|
| `dist/aramin-console.{css,js}` (+ `.min`) | **everything** — every module's CSS and JS. Static markup of any module is styled. |
| `dist/modules/<name>.{css,js}` (+ `.min`) | one module; its JS imports its dependencies (`./core.js`, …) only if they are not loaded yet |
| `<out>/aramin-console.{css,js}` | a **custom build** with only the modules you chose (+ their dependencies) |

All bundles share one registry (`globalThis.__AC_MODS__`): a module is evaluated once, whichever bundle brought it.

## Include all
```html
<link rel="stylesheet" href="dist/aramin-console.min.css">
<script type="module" src="dist/aramin-console.min.js"></script>
```

## Include some (custom build)
```bash
node scripts/build.mjs --modules=forms,table,chart --out=dist/custom        # core + forms + table (+ data-display) + chart
```
or put an `aramin.config.json` in your project and run the package's build from there:
```json
{ "modules": ["shell", "overlays", "forms", "table"], "out": "public/aramin", "name": "aramin-console", "modulesBase": "/aramin/modules/" }
```
```bash
node node_modules/aramin-console/scripts/build.mjs            # reads ./aramin.config.json
node node_modules/aramin-console/scripts/build.mjs --config=path/to/aramin.config.json
```
Builds outside the package copy `fonts/` and `icons.svg` next to the bundle. `modulesBase` tells `AC.use()` where the
per-module files are served from (copy `dist/modules/` there if you lazy-load). The demo itself is a custom build:
[`demo/aramin.config.json`](../demo/aramin.config.json).

## Remove one
* **Full bundle:** set `"bundle": false` in `src/modules/<name>/module.json` (or in `src/modules.json`) and rebuild.
* **Custom build:** just don't list it.
* A whole `src/modules/<name>` folder can be deleted — the manifest picks that up (run `--sync-manifest` to tidy `src/modules.json`).
Dependants are reported at build time (`module x imports from "y" — add it to its dependencies`).

## Lazy-load
```js
await AC.use('maps');                    // JS + CSS of maps and its dependencies, once; CSS is awaited (no flash)
const [chart, table] = await AC.use('chart', 'table');
AC.use.preload('marketing');             // <link rel="modulepreload"> (e.g. on hover of a link)
AC.use.loaded('maps') · AC.use.list() · AC.use.base = 'https://cdn.example/aramin/dist/modules/'
```
Module CSS is inserted right after the framework stylesheet (`link[data-ac-css]`), so app / page stylesheets after it still win.
A `.min` bundle lazy-loads `.min` modules. The page router of the demo does this per page:
the build writes a page → modules map (from `data-ac`, `data-ac-*`, owned block classes and `AC.<api>` used by the page script),
and a fragment can add `data-modules="maps marketing"`. Event: `ac:module:load {name}`.

**Measured on the demo dashboard** (cold load, gzip): before (full bundle) JS 333 KB + CSS 110 KB → after (shell build + lazy
`chart`) JS 117 KB + CSS 44 KB.

## Write a module
`src/modules/<name>/<name>.js` (+ `<name>.css`, optional `module.json`). Contract — see [`src/modules/README.md`](../src/modules/README.md):
```js
export function install(AC) {
  if (!AC || AC.hello) return AC?.hello;
  AC.hello = (el, cfg) => { /* … */ };
  AC.register?.('hello', (el) => { /* init */ return () => { /* destroy */ }; });
  return AC.hello;
}
if (typeof window !== 'undefined' && window.AC) install(window.AC);
```
```json
// src/modules/hello/module.json (optional)
{ "description": "What it does", "dependencies": ["overlays"], "bundle": true }
```
* No `import` of core files — use the `AC` you are given (works bundled, per-module and straight from `src/`).
* Inject your stylesheet once with `<link data-ac-module="hello">` from `new URL('./hello.css', import.meta.url)`; bundles mark
  their own CSS as present, and the bundler points `import.meta.url` at `dist/modules/` so the URL always exists.
* Bundler syntax: `import {a} from './x.js'`, `export function|const|class`, `export {…}`, `export … from`. No default exports.
* Run `npm run build` — the module appears in the size table, in `dist/modules/`, in the full bundle and in `AC.use()`.

## Build safety nets
* `node tests/build.mjs` — the minifier keeps strings / regexes / templates / ASI (tricky fixture is evaluated before and after),
  every emitted bundle parses, and a custom build evaluates with exactly the chosen modules.
* The build fails when any file referenced from `demo/` (HTML `src`/`href`, JS imports, CSS `url()`, SW precache list,
  manifest icons) is missing.
