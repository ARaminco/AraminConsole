# Maps

A zero-dependency slippy-map module: raster XYZ tiles in Web Mercator, markers, clustering, popups, vectors,
heatmap, GeoJSON, draw/edit/measure, geocoder search, locate-me and a location-picker form control.
Files: `src/modules/maps/{maps.js,maps.css}` (also part of the full bundle and of `dist/modules/maps.*`).
Demo: `#/maps` (`demo/pages/maps.{html,js,css}`). Test: `node tests/maps.mjs --base=http://localhost:5192 [--shots]`.

```js
const m = AC.map('#map', { center: [35.6997, 51.338], zoom: 12, tiles: 'osm', controls: ['zoom', 'locate', 'fullscreen', 'scale'] });
m.marker([35.7576, 51.41], { icon: 'store', title: 'Vanak', drop: true }).bindPopup('<b>Vanak branch</b>');
m.flyTo([25.1972, 55.2744], 13);
```
```html
<div data-ac="map" data-center="35.7,51.4" data-zoom="12" data-controls="zoom,locate,search,layers"></div>
<div data-ac="location-picker" data-name="branch"></div>   <!-- posts branch[lat], branch[lng], branch[address] -->
```

## Engine
- Tiles are `<img>`s in one layer per integer zoom; pan / zoom / pinch / fly only rewrite `transform` on a handful of
  layer elements (compositor-only). Fractional zoom is a `scale()` of the nearest level; the next level fades in on top
  and the old one is dropped when it is covered. Level switches are throttled during animations (keeps tile requests low).
- Markers, popups and handles live in one float pane (one transform while panning; positions are recomputed only when the zoom changes).
  Vectors share one SVG and the heatmap one canvas; both are re-rendered when the map settles and transformed in between.
- Input: core `gesture` for pan (inertia from release velocity), two-pointer pinch around the midpoint, wheel/trackpad zoom
  (smoothed toward a target zoom, anchored at the cursor), double-click / double-tap zoom (+Shift = out), keyboard
  (arrows pan, `+`/`-` zoom, Esc closes popups / cancels drawing). A single map click waits ~260 ms so a double tap stays a zoom.
- `flyTo` uses the van Wijk–Nuij zoom-out/pan/zoom-in curve. Reduced motion → instant `setView`.
- Offline / blocked tiles: the map keeps working on a styled grid that pans and zooms with it, plus an "unavailable" notice.
- RTL: the canvas is always LTR internally; controls sit in logical corners (`top-start`, `top-end`, …) so they mirror.
  Coordinates are always Latin digits.

## Options
| option | default | |
|---|---|---|
| `center`, `zoom`, `minZoom`, `maxZoom` | Tehran, 11, 2, 19 | `center`: `[lat, lng]`, `{lat, lng}` or `"lat,lng"` |
| `tiles` | `'osm'` | provider id, provider object, or `{ light, dark }` (switches with the theme) |
| `muted` | `false` | desaturates the tiles so black/orange markers stand out |
| `controls` | `zoom fullscreen locate scale` | + `search` (needs `geocoder`), `layers`, `coords`, `draw` |
| `geocoder`, `reverse` | `null`, `false` | `reverse: true` → click shows address + decimal/DMS coordinates + copy |
| `baseLayers` | osm, opentopomap, none | for the layer switcher: ids or `{ id, label }` |
| `interactive`, `wheel`, `keyboard`, `inertia` | `true` | |

## API
View: `setView(c, z)`, `flyTo(c, z, {duration})`, `panTo`, `panBy(dx, dy)`, `zoomIn/zoomOut/setZoom`, `fitBounds(bounds|points, {padding, maxZoom})`,
`getCenter/getZoom`, `bounds`, `latLngToPoint`, `pointToLatLng`, `setPadding({top,right,bottom,left})` (e.g. a bottom sheet),
`setTiles(spec)`, `invalidateSize()`, `toggleFullscreen()`, `locate()`, `destroy()`. Controls offset via CSS `--ac-map-pad-top|bottom|start|end`.

Layers (all return the layer; `layer.remove()`, `setVisible(bool)`, `bindPopup(html | (layer) => html)`, `on('click', fn)`):
- `marker(latlng, { kind: 'pin'|'dot'|'vehicle'|'me'|'label', icon, tone: 'ink'|'accent'|'success'|…, title, label, html, draggable, drop, data, onClick })`
  → `setLatLng`, `setHeading(deg)` (vehicles), `setTone`. Pins are black (or orange) SVG teardrops with a drop/bounce entrance.
- `cluster(points, { radius: 64, maxZoom: 17, marker(p) → marker options, popup(p) })` — grid clustering; clusters split out of / merge into
  their parent with a 300 ms transform animation; click zooms to the members. `setPoints(points)`.
- `polyline(points, { tone, weight, casing, flow, dash })` (`flow` = animated dash), `polygon(rings, …)`, `circle(center, radiusMetres, …)`.
- `heatmap([[lat, lng, weight]…], { radius })` — canvas, self-normalising, black→orange→red palette. `setPoints`.
- `geojson(object | url, { style(feature), popup(feature, layer), point(feature, latlng), onEach })` → group (Promise for a URL).
  Point features with `properties.radius` become circles.
- `group(layers)`, `addOverlay(id, label, layer, { icon })` (listed in the layer switcher), `setOverlay(id, visible)`.
- Popups: `openPopup(latlng, html|node, { offset, wide })`, `closePopup()`; auto-pan into view.

Draw / edit / measure (`controls: ['draw']` or `m.enableDraw()` → `m.draw`): tools point, line, polygon, circle, measure distance,
measure area. Line/polygon: click to add, double-click / Enter / Finish to end, click the first vertex to close, Backspace undo,
Esc cancel. Circle: centre, then edge. Clicking a drawn shape selects it: vertex handles, mid-point handles (drag to insert),
circle centre + radius handles; Delete removes it. `draw.start(mode)`, `cancel()`, `add(feature)`, `select(id)`, `remove(id)`,
`clear()`, `list`, `get(id)`, `toGeoJSON()` (circles → Point + `radius`).

Events (bubble from the map element): `ac:map:ready`, `moveend {center, zoom}`, `zoomend`, `click {latlng}`, `contextmenu`,
`marker:click {marker, data}`, `marker:dragend`, `shape:click`, `popup:open|close`, `locate {latlng, accuracy}`, `locate:error`,
`search:select {result}`, `reverse {result}`, `base:change {id}`, `overlay {id, visible}`, `draw:start|create|edit|delete|select|deselect|cancel {feature}`,
`measure {type, value, text}`. Per-frame `move` is only on the JS bus: `m.on('move', fn)`.

Static: `AC.map.providers`, `AC.map.geocoders`, `AC.map.pick(opts)` → `Promise<{lat, lng, address} | null>`,
`AC.map.utils` (`project unproject distance pathLength area bounds formatLatLng formatDistance formatArea`), classes `Marker Path Heat Cluster Group MapView`.

## Location picker
`<div data-ac="location-picker" data-name="location" [data-center="lat,lng"] [data-zoom] [data-tiles]>` renders a summary row
(address, coordinates, "Choose on map") and keeps hidden inputs `location[lat]`, `location[lng]`, `location[address]` (so `FormData` works).
The button opens `AC.map.pick()` in a modal (bottom sheet on phones): a fixed centre pin that lifts while the map moves and drops with a small
bounce, live coordinates, reverse-geocoded address, search and locate. Geocoder: `el.geocoder` or `AC.map.defaultGeocoder`.
Event `ac:location-picker:change {lat, lng, address}`; API `AC.instance(el, 'location-picker').value / set(v) / open()`.

## Tile providers and their terms (read before shipping)
| id | Use |
|---|---|
| `osm` (default) | **Demo / light use only.** OpenStreetMap's tile servers are run by volunteers on donated resources. The [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) requires visible attribution («© OpenStreetMap contributors» linked to the copyright page — our attribution control does this and must not be hidden), a valid Referer/User-Agent, honouring cache headers, and **no heavy use, bulk downloading, prefetching or offline packs**. Access can be blocked without notice. For production traffic run your own tile server (OSM data is ODbL) or use a commercial provider. Dark theme = a CSS filter on the same tiles (no second provider). |
| `opentopomap` | Topographic style, CC-BY-SA; same light-use spirit as OSM (fair use, attribution required). |
| `carto-light`, `carto-dark`, `carto-voyager` | CARTO basemaps (Positron / Dark Matter / Voyager). Attribution «© OpenStreetMap contributors © CARTO». **When checked on 2026-10-20 the public URLs answered with an "API KEY REQUIRED" image**, so they need a CARTO account: register the URL your plan gives you with `AC.map.providers.register('carto-light', { url, subdomains, attribution, retina: true })` and follow CARTO's current terms (historically free only for non-commercial use under a monthly view limit; commercial use needs a CARTO licence). |
| `none` | No tiles: the styled grid only (fully offline). |

Custom / keyed providers: `AC.map.providers.register(id, { name, url, subdomains, maxZoom, retina, attribution, darkFilter, key })`.
`url` is a template (`{z} {x} {y} {s} {r} {key}`) or a function `(z, x, y, { retina }) → url | Promise<url>`; the function form lets you
fetch with an API-key **header** and return a blob URL (revoked when the tile is dropped). Never commit keys; load them from your backend/config.

### Iranian providers (hooks, no keys included)
Both are API-key services with their own terms and attribution; take the exact endpoints from their current documentation.
- **Map.ir** — raster tiles and search/reverse APIs authenticate with an `x-api-key` header, so use the function form:
  ```js
  AC.map.providers.register('mapir', { name: 'Map.ir', maxZoom: 19, attribution: '© Map.ir © OpenStreetMap contributors',
    url: async (z, x, y) => URL.createObjectURL(await (await fetch(MAPIR_TILE_URL(z, x, y), { headers: { 'x-api-key': KEY } })).blob()) });
  ```
- **Neshan** — keys are per product (map key for the web SDK/tiles, service key `Api-Key` header for search / reverse). Same pattern.
- Geocoders: wrap their search / reverse endpoints in the geocoder interface below (`live: true` only if their terms allow search-as-you-type).

## Geocoders
Interface: `{ live?: boolean, search(text, { signal, lang, near }) → Promise<[{ label, sub, lat, lng, bbox? }]>, reverse(lat, lng, { signal, lang }) → Promise<{ label, sub } | null> }`.
The search box debounces (300 ms) and aborts stale requests when `live` is true; with `live: false` it searches on Enter only.
- `AC.map.geocoders.local(items | () => items)` — offline search over your own list (`{ label, sub, lat, lng, keywords }`), nearest-item reverse. Used by the demo.
- `AC.map.geocoders.nominatim({ url, email, countrycodes, viewbox })` — OSM Nominatim. [Usage policy](https://operations.osmfoundation.org/policies/nominatim/):
  **max 1 request/second** (the adapter enforces it), identify your app (`email`), show attribution, cache results, and **no client-side autocomplete**
  — hence `live: false`. Heavy use → host Nominatim yourself (`url`) or use a commercial geocoder.

## Mobile
Touch targets ≥ 40 px (handles have a 40 px invisible hit area), `touch-action: none` only on the map canvas, pull-to-refresh is kept out of map drags,
16 px search input (no iOS zoom), hover styles gated by `(hover: hover)`. The demo page shows the native-maps pattern: full-screen map under the
floating app bar, a draggable bottom sheet (3 snap points, velocity aware) and `setPadding({ bottom })` so fly-to targets land above the sheet.

## Icons
`map map-pin map-pinned map-pin-plus locate-fixed maximize minimize layers plus minus search x spline pentagon circle-dot ruler square-dashed
undo-2 trash-2 check copy pencil truck wifi-off` (listed in `src/icons/icons.txt`).
