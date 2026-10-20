# Starters

Copy-ready projects live in [`starters/`](../starters). Each has its own README. The repository is also a **GitHub template**: click *Use this template*, then keep the starter you need.

| Starter | Stack | What is included |
|---|---|---|
| [`starters/html`](../starters/html/README.md) | plain HTML + ES modules | App shell (appbar, rail, tab bar), 25-line hash router, 3 pages: dashboard, users, settings |
| [`starters/laravel-blade`](../starters/laravel-blade/README.md) | Laravel 10+ | `layouts/app.blade.php`, partials (appbar, rail, tabbar, powered), 2 example pages, routes, CSRF-aware forms |
| [`starters/nextjs`](../starters/nextjs/README.md) | Next.js App Router | root layout, client `Shell` that loads the framework and re-scans on route change, server-component page |

All starters expect AraminConsole's `dist/` to be copied next to them (`aramin/`, `public/vendor/aramin/`, or `public/aramin/`). They include the small `.ac-powered` credit; remove or replace it if you like (MIT).

## Making your own starter
1. Copy the shell markup from `demo/index.html` (or a starter) and cut it down to your sections.
2. Write pages as `<section class="ac-page">` fragments (no `<script>`).
3. Wire your router/framework to inject the fragment into `#ac-content`; components start automatically, and `AC.scan(root)` re-scans if you render outside the observer's reach.
4. For custom bundles: `node scripts/build.mjs --modules=shell,overlays,forms --out=public/aramin`.
