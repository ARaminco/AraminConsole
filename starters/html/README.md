# Starter: plain HTML

Single-page admin: app shell (appbar, rail, tab bar), a 25-line hash router and three pages (`dashboard`, `users`, `settings`). No build step.

```bash
cp -r ../../dist ./aramin          # from a clone of AraminConsole (or copy dist/ from a release)
npx serve .                        # any static server; fetch() needs http://, not file://
```

- Add a page: create `pages/<name>.html` (a `<section class="ac-page">` fragment, no `<script>`), then link to `#/<name>`.
- Switch to Persian: set `<html lang="fa" dir="rtl">`.
- The `.ac-powered` credit links to https://air.co.ir/; keep or remove it (MIT).
