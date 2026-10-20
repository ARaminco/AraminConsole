# Starter: Next.js (App Router)

```bash
cp -r /path/to/AraminConsole/dist/. public/aramin/
npm install && npm run dev
```

How it fits together
- `app/layout.jsx` loads the boot script and CSS in `<head>` (no flash of wrong theme).
- `components/Shell.jsx` is a client component: it imports the framework once in `useEffect` and re-scans the page on every route change (`usePathname`). The framework also has a MutationObserver, so the re-scan is a safety net.
- Pages are plain markup with `data-ac` attributes and can be server components (`components/Stats.jsx`).
- Keep `suppressHydrationWarning` on `<html>`: the boot script sets `data-theme`, `lang` and `dir` before React hydrates.
- Persian: set `lang="fa" dir="rtl"` on `<html>`.
- The `.ac-powered` credit (https://air.co.ir/) is in `Shell.jsx`; remove or replace it freely (MIT).
