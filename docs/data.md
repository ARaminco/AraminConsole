# Data display — tables, charts, lists, logs

Files: `src/js/components/{table,chart,list,accordion,tree,code,logview}.js`, `src/css/components/{table,chart,data}.css`.
Demo: `#/users`, `#/analytics`, `#/dashboard`. Mock data: `demo/data.js` (named exports `users orders products servers logs makeLog dailyVisits activity trafficFor topPages referrers rng daysAgo`).
Tests: `node tests/data.mjs --base=http://localhost:5178`.

Strings shown to the user go through `AC.t()` (keys `table.* chart.* log.* json.* common.copy|copied`) and re-render on `ac:i18n:change`. Numbers use `AC.format` (Latin digits unless `AC.i18n.setDigits('native')`).

## Charts — `AC.chart(el, cfg)` (stable API)

```html
<div class="ac-chart-slot" data-ac="chart" data-ac-config='{"type":"bar","labels":"days:7","series":[{"name":"dash.online","data":[120,152,138]}]}'></div>
```
```js
const c = AC.chart('#rev', { type: 'area', labels: 'months:12', series: [{ name: 'Income', data: [...] }] });
c.update({ series })   // or c.update(seriesArray) — redraw with new data/options (keeps hidden-legend state)
c.push([v1, v2], 'label')   // realtime: append one point per series, keep the last `window` points
c.set(cfg)             // replace config (resets legend state) · c.redraw() · c.destroy() · c.config
AC.instance(el, 'chart')   // the same API for declarative charts
```
The element should have a height (`.ac-chart-slot`, `--sm|--lg|--square`, `.ac-stat__spark`); otherwise `height` (px, default 240) is applied. `heatmap` and `funnel` size themselves.

| option | meaning |
|---|---|
| `type` | `line` `area` `bar` `sparkline` `donut` `pie` `gauge` `heatmap` `funnel` |
| `series` | `[{ name, data:[…], color?, dashed? }]` or `[[…]]`; donut/pie/funnel: `[n, n, …]` |
| `labels` | array (ISO dates are formatted with `labelFormat`, Jalali in fa) or generator `"months:12"`, `"days:7"`, `"dates:30"` |
| `name`, `labels`, `title`, `centerLabel`, `label`, `unit` | plain text **or an i18n key** (`"dash.income"`) — translated and re-rendered on language change |
| `color` / series `color` | `1..8` (`--ac-chart-N`), `accent success warning danger info neutral contrast` |
| `stacked`, `horizontal` | bar variants; `values:false` hides horizontal value labels |
| `format`, `prefix`, `suffix` | passed to `AC.format.number` (e.g. `{"currency":"USD"}`), text around values |
| `smooth` (true), `zero`, `yMin`, `yMax`, `axis` (true), `legend` (auto), `gap`, `radius`, `window` | |
| gauge | `value`, `min`, `max`, `thresholds:[warn, danger]` |
| heatmap | `data:[{date, value}]`, `end`, `weeks` (53), `weekStart` (Sat in fa/ar), `levels:[a,b,c]` |
| `animate:false` | no draw-in (also off with reduced motion) |

Look (DESIGN.md): series 1 = `--ac-chart-1` (ink), series 2 = `--ac-chart-2` (orange accent); rounded bar tops; bars grow from the baseline when scrolled into view; dot legends (click toggles a series, `ac:chart:toggle`); light grid; tooltip with crosshair on hover/touch; arrow keys/Home/End inspect points when the plot is focused. RTL mirrors the x axis (time flows right→left). Theme and language changes redraw. Every chart gets `role="figure"`, an `aria-label` and a visually-hidden data table.

## Data table — `data-ac="table"` / `AC.table(el, cfg)`

Progressive enhancement: `<div data-ac="table" data-ac-config='{"pageSize":5}'><table>…</table></div>` reads the header/body cells (`<th data-type="number|date" data-filter="select" data-primary data-sortable="false">`, `<td data-value="…">` for sort values) and keeps the cell HTML.

```js
const t = AC.table(el, {
  id: 'users',                 // persists hidden columns / page size / density in localStorage
  rows, rowId: 'id', pageSize: 10, pageSizes: [10, 25, 50, 100], sort: { key: 'joined', dir: 'desc' },
  selectable: true, bulkActions: [{ id: 'delete', label, i18n, icon, tone: 'danger' }],
  actions: [{ id: 'edit', label, i18n, icon: 'pencil', tone, when: (row) => bool }],
  expand: (row) => '<dl class="ac-dl">…</dl>',
  columns: [{ key, label, i18n, type, primary, sortable, filter: 'text'|'select', options, hidden, hideable,
              align: 'end', mobile: false, value(r), text(r), render(r), sortValue(r), csv: false|fn,
              /* type extras */ currency, decimals, compact, dateOptions, badges: { v: { tone, label, i18n } }, sub, image, initials, color }],
  search: true, toolbar: true, columnsMenu: true, density: true, exportable: true, pagination: true, info: true,
  cards: true /* phone card list */, maxHeight: 480 /* sticky header inside a scroll box */, loading: false, caption, exportName, tools: '<button…>',
});
```
Cell types: `badge` (dot + label), `avatar` (avatar + name + `sub`), `money`, `number`, `date` (Jalali in fa), `progress`, `html` (from markup).
API: `setRows setColumns setLoading search filter sort page select clearSelection selected toCSV exportCSV refresh destroy`, getters `rows view state`.
Events (bubble from the element): `ac:table:sort {sort}` `search {query}` `filter {filters}` `page {page}` `select {ids, rows}` `expand {id, open}` `action {action, id, row}` `bulk {action, ids, rows}` `export {csv, name}` (preventDefault to handle the file yourself).
Behaviour: click header = sort, Shift+click = multi-sort (numbered); `aria-sort` on headers; the bulk bar is sticky under the app bar on desktop and a floating glass pill above the tab bar on phones; CSV is UTF-8 with BOM (Persian opens correctly in Excel) and exports the selection if any; below 640px rows render as cards (primary column + status + 2-column key/value grid) with swipe-to-reveal actions; loading skeleton and empty state with "clear filters". Row action menus use inline icon buttons; pages may put an overlay `menu` in `tools`/`render` instead.

## Lists and swipe — `data-ac="list"`, `AC.swipeable(item)`
```html
<ul class="ac-list" data-ac="list" role="list"><li class="ac-list__item ac-swipe">
  <div class="ac-swipe__actions"><button class="ac-swipe__btn" data-action="archive" data-tone="info"><svg…/>Archive</button></div>
  <div class="ac-swipe__content">…avatar · .ac-list__main · .ac-list__end…</div></li></ul>
```
Swipe toward the inline start reveals actions (mirrored in RTL), flick velocity > 0.5 snaps, one row open at a time, Esc closes. Events `ac:swipe:open`, `ac:swipe:action {action, item}`, `ac:list:action`.

## Description list, timeline
`<dl class="ac-dl [ac-dl--cols-2]"><div><dt/><dd/></div></dl>` · `<ol class="ac-timeline"><li class="ac-timeline__item" data-tone="success"><time/><div class="ac-timeline__body"><strong/><p/></div></li></ol>` (the existing `.ac-feed` is the activity feed).

## Accordion — `data-ac="accordion" [data-single]`
`<details class="ac-accordion__item"><summary class="ac-accordion__head">Q</summary><div class="ac-accordion__body">A</div></details>`; animated height (Web Animations, off with reduced motion); `ac:accordion:toggle`; `AC.instance(el,'accordion').toggle(i, open?)`.

## Tree — `data-ac="tree"` / `AC.tree(el, { items:[{ id, label, icon, meta, open, children }] })`
ARIA tree, roving tabindex; ↑ ↓ Home End, → expand/first child, ← collapse/parent (mirrored in RTL), Enter/Space select, type-ahead. Events `ac:tree:select {id, item}`, `ac:tree:toggle`. API `setItems expandAll selected`.

## Code block and JSON viewer
`<div data-ac="code" data-lang="js|json|bash|php…" [data-lines] [data-title]><pre><code>…</code></pre></div>` — copy button (`ac:code:copy`), light highlighting, always LTR.
`<div data-ac="json" data-ac-config='{"data":{…},"open":2}'></div>` or `AC.json(el, data, { open })` — collapsible nodes with counts, expand-all and copy. `AC.copyText(text)` → Promise<boolean>.

## Log viewer — `data-ac="logview"` / `AC.logview(el, cfg)`
```js
const log = AC.logview(el, { lines, max: 5000, render: 500, levels: ['debug','info','warn','error'], timestamps: true });
log.push({ ts, level, src, msg }); log.push('plain text line'); log.pause(true); log.follow(); log.filter({ levels: ['error'], q: 'timeout' }); log.clear();
```
Level chips with live counts (Alt+click = only this level), search with highlight, timestamps toggle, pause/resume (new lines are counted while paused), follow-tail with a "N new / Latest" jump pill when scrolled up, DOM capped to `render` lines (buffer keeps `max`). Event `ac:logview:pause {paused}`.

## Testing
- `node tests/data.mjs` — demo pages (users, analytics, dashboard): table, charts, log viewer, overflow and console errors.
- `node tests/data-fixture.mjs` — standalone fixture `tests/fixtures/data.html` (no shell): multi-sort, CSV of a selection (UTF-8 BOM), phone swipe → `ac:table:action`, chart keyboard and `push()`, log pause/search, tree keys (RTL-aware), accordion, JSON, code.
- Both take `--base=http://localhost:<port>`; open the fixture in a browser to see every data-display component at once.
