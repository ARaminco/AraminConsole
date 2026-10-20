# Marketing dashboards — `marketing` module

Files: `src/modules/marketing/{marketing.js,marketing.css}`. Demo: `#/search-console`, `#/marketing` (mock data: `gscData`, `mkData`, `mkRealtime` in `demo/data.js`). Test: `node tests/invoice-marketing.mjs`.

Both dashboards take a `load()` function, so the demo's mock generators can be swapped for real API calls without touching the UI. Charts and tables use the core `AC.chart` / `AC.table` (sortable, searchable, CSV, phone cards); the Search Console chart is the module's own multi-axis SVG (each metric keeps its own scale, average position is drawn inverted like Google's).

## Search Console report

```js
const gsc = AC.marketing.searchConsole('#host', {
  range: '28d',                                   // '7d' | '28d' | '3m' | '16m' (compare is off for 16m, as in GSC)
  load: async (range, compare) => fetchGsc(range, compare),
});
gsc.reload(); gsc.exportCSV(); gsc.state; gsc.destroy();
```
UI: four toggle cards (Total clicks = accent, impressions = ink, CTR = green, position = blue; one line always stays on), chart with crosshair tooltip and ←/→ keys, tabs Queries · Pages · Countries · Devices · Search appearance · Dates (meter bar per row, deltas when comparing), index coverage (indexed vs not indexed, weekly stacked bars, reasons with source and trend), Core Web Vitals (good / needs improvement / poor stacked bars + LCP / INP / CLS chips for mobile and desktop), sitemaps, links.
Events: `ac:marketing:range {range, compare}`, `ac:marketing:metric {key, on}`.

`load()` returns:
```js
{
  dates: ['2026-09-23', …],                                // one per day
  series: { clicks: [], impressions: [], ctr: [/* % */], position: [] },
  previous: { dates, series } | null,                     // when compare
  totals: { clicks, impressions, ctr, position }, prevTotals: {…} | null,
  tabs: { queries|pages|countries|devices|appearance: [{ key, clicks, impressions, ctr, position, prev?: {…} }] },
  coverage: { indexed, notIndexed, history: [{ date, indexed, notIndexed }], reasons: [{ reason, source: 'google'|'website', pages, trend: 'up'|'down'|'flat' }] },
  cwv: { mobile|desktop: { good, ni, poor, metrics: { lcp: [2.6, 'ni'], inp: [180, 'good'], cls: [0.08, 'good'] } } },
  sitemaps: [{ url, type: 'index'|'sitemap'|'news', submitted, lastRead, status: 'success'|'warning'|'error', discovered }],
  links: { external, internal, topLinked: [[path, n]], topSites: [[host, n]], topAnchors: [[text, n]] },
}
```
Wiring to Google (server side, OAuth scope `webmasters.readonly`):
- `series`: `searchanalytics.query` with `dimensions: ['date']` for the range (and the previous range when comparing); `ctr` × 100.
- `tabs.*`: the same call with `dimensions: ['query']`, `['page']`, `['country']` (ISO alpha-3 in the API — map to alpha-2), `['device']` (`MOBILE` → `mobile`…), `['searchAppearance']`; `rowLimit` 25–1000.
- `sitemaps`: `sitemaps.list`. `coverage`, `cwv` and `links` are not in the Search Console API: use URL Inspection API samples / your own crawl, the CrUX API (`queryRecord`, p75 values) and your link data respectively, or hide those cards.

## Marketing overview (GA4-like)

```js
const ov = AC.marketing.overview('#host', {
  range: '28d',                                    // '7d' | '28d' | '3m'
  load: async (range) => fetchOverview(range),
  realtime: { load: async () => fetchRealtime(), interval: 5000 },   // paused while the tab is hidden
});
```
`load()` returns:
```js
{
  dates: [], series: { users: [], newUsers: [], sessions: [], conversions: [] },
  kpis: { users: [value, deltaPct], sessions, engagementRate, avgEngagement /* seconds */, conversions, revenue /* Rial */ },
  channels: [{ key: 'organic'|'direct'|'paidSearch'|'organicSocial'|'paidSocial'|'referral'|'email'|'display', users, sessions, engagementRate, conversions, revenue }],
  campaigns: [{ id, name, platform: 'google'|'meta', type, spend, impressions, clicks, conversions, revenue }],   // CTR, CPC, ROAS are derived
  funnel: { labels: ['visit','search','profile','slot','booked'], values: [] },
  landing: [{ id, path, sessions, engagementRate, conversions }],
  social: { months: [], networks: [{ key, name, color: 1..8, data: [] }] },
  email: [{ id, name, sent, open, ctr, unsub, date }],
}
// realtime.load() → { active, perMinute: [30 numbers], countries: [{ code, fa, en, users }], pages: [{ path, users }] }
```
Wiring: GA4 Data API `runReport` (`metrics: activeUsers, newUsers, sessions, engagementRate, userEngagementDuration, conversions|keyEvents, totalRevenue`; `dimensions: date`, `sessionDefaultChannelGroup`, `landingPage`), `runFunnelReport` for the funnel, `runRealtimeReport` (`activeUsers` by `minutesAgo`, `country`, `unifiedScreenName`) for the live card; Google Ads API (`campaign`, `metrics.cost_micros / 1e6`, clicks, impressions, conversions, conversions_value) and Meta Marketing API insights for campaigns; social and email from their platform APIs. Money is shown with `AC.money.format` in the page unit (Rial/Toman).

## Blocks

`AC.marketing.metricChart(el, { dates, series: [{ key, name, data, color, invert, format, short, prev, on }] })` → `update redraw destroy` · `AC.marketing.realtime(el, { load, interval })` → `tick destroy` · `AC.marketing.cwv(el, data)` · `AC.marketing.meter(value, max, tone)` → HTML.
Labels are built in for fa / en (ar uses fa); any `mk.<key>` in the app dictionary overrides them. Numbers follow `AC.format` (Latin digits unless `AC.i18n.setDigits('native')`).
