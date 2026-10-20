# PWA — install, offline, updates

Module `pwa` (`src/modules/pwa/`), service worker template `demo/sw.js`, manifest `demo/manifest.webmanifest`.
Live: `demo/#/notify-lab`. Tests: `node tests/pwa.mjs` (runs its own server; sub-path `/AraminConsole/`).

## Register
```js
AC.pwa.register('sw.js', { updateUI: 'toast' /* | 'banner' | false */, network: true, badge: true, onUpdate(worker) {} });
```
* **Update flow:** a new build installs a new worker that **waits**. The page shows an "Update available" toast (or banner);
  *Reload* posts `SKIP_WAITING` → the worker activates, deletes old caches, claims the page → exactly one reload. The very
  first install never reloads. `AC.pwa.update()` checks now (also done when the tab becomes visible, at most every 30 min);
  `AC.pwa.simulateUpdate()` shows the UI for demos.
* **No stale caches:** the build stamps `const BUILD = '<hash>'` into `demo/sw.js`, so every build is a new worker and a new cache name.
* `network: true` → offline / back-online toasts, `html[data-offline]`. `badge: true` → app badge = notification-center unread.

## Service worker (demo/sw.js — copy it for your app)
| Request | Strategy |
|---|---|
| app shell (precache list) | installed with the worker, versioned cache |
| `dist/**`, `*.js`, `*.css`, page fragments, i18n | stale-while-revalidate |
| fonts, icons, images | cache-first |
| data (`*.json`, `api/*` GET) | network-first, cache fallback |
| navigations | network-first → cached shell → offline: redirect to `errors/offline.html?from=<url>` |
| `POST api/*` while offline | stored in IndexedDB, answered `202` + `X-AC-Queued: 1`, replayed on `sync` ("ac-outbox") or `FLUSH` |

Every URL is relative to the worker, so it works under a sub-path (GitHub Pages). Page side:
`const { ok, queued } = await AC.pwa.send('api/notes', { body })` · `AC.pwa.flush()` (called automatically on `online`).
Events: `ac:pwa:queued {count}`, `ac:pwa:synced {count}`, `ac:pwa:update`, `ac:pwa:offline|online`.

## Install invitation — `AC.install`
```js
AC.install.show('sheet' | 'banner' | 'card' | 'inline' | 'ios', { target, app: { name, icon }, stats, benefits });
AC.install.prompt();     // browser prompt (Chrome/Edge/Android) · iOS steps sheet · or "use the browser menu" hint
AC.install.auto({ minVisits: 2, minSeconds: 25, snoozeDays: 7, variant });   // smart timing
AC.install.state         // { available, installed, standalone, platform: 'ios'|'android'|'desktop', canPromptIOS, visits, snoozedUntil }
AC.install.snooze(days) · AC.install.hide() · AC.install.reset()
<div data-ac="install-card"></div>                     <!-- inline settings card; shows "Installed ✓" once installed -->
```
* `beforeinstallprompt` is captured (and its mini-infobar suppressed) as soon as the module loads; `appinstalled` → thanks toast.
* **Sheet:** app icon + name (localized from `name_localized`), App-Store-like stats row, screenshots carousel from the manifest
  (narrow on phones, wide on desktop), four benefits, black *Install* pill + *Not now* (snoozes). Phones: bottom sheet.
* **Banner:** glass pill at the top. **Card:** floating card at the end corner (above the tab bar on phones). **Inline:** settings card.
* **iOS Safari:** three animated SVG steps (Share → Add to Home Screen → Add); reduced motion stops the loops.
* Timing: visits are counted once per session; nothing shows before `minVisits`, during a snooze, when installed or standalone.

## Manifest checklist (demo/manifest.webmanifest)
`id`, `scope`, `start_url`, `lang`/`dir`, `name` + `name_localized` (fa/en/ar), `display_override`
(`window-controls-overlay`, `standalone`), icons incl. **maskable** 192/512, `shortcuts` (Dashboard, Tickets, Chat, New invoice
with 96 px icons), `screenshots` (wide 1280×800 + narrow 780×1688), `share_target` (GET → the app shows a card with what was
shared), `theme_color`/`background_color` + `user_preferences.color_scheme_dark`, `launch_handler`.
Regenerate icons and screenshots: `node tests/make-pwa-assets.mjs --base=http://localhost:5178`.

## App-like extras
`AC.pwa.badge(n)` (App Badging API) · `AC.pwa.share({ title, text, url, files })` (Web Share, falls back to copying the link) ·
`AC.pwa.isStandalone()` · `html[data-standalone]` (no overscroll glow, no text selection in chrome) and `html[data-platform]` ·
window-controls-overlay keeps the top bar clear of the title-bar buttons · `AC.pwa.splash({ minMs })` (standalone launches only).
