# Contributing to AraminConsole

Thanks for helping! Bug reports, docs fixes, and components are all welcome.

## Setup
```bash
npm ci
npm run dev            # build + dev server → http://localhost:5178/demo/
node scripts/build.mjs --watch   # rebuild dist/ on every change in src/
```
Browser checks use `playwright-core` with a locally installed Chromium (`npx playwright install chromium`):
```bash
node tests/shots.mjs dashboard        # screenshots 390×844 + 1440×900, light/dark, fa/en → tests/screens/
node tests/standalone.mjs             # auth + error pages
node tests/standalone.mjs --subpath   # demo served under /AraminConsole/ (GitHub Pages layout)
```

## Rules
Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) first. In short:
- **Zero dependencies** at runtime. The bundler in `scripts/build.mjs` supports a small subset of `import`/`export` syntax.
- **Tokens only.** Never hard-code colours, radii, or shadows; dark mode must work purely by swapping tokens.
- **Logical CSS properties only** (`margin-inline-start`, `inset-inline-end` …). Directional icons get `.ac-flip-rtl`; numbers inside RTL text go in `<bdi>` or `dir="ltr"`.
- **Accessible:** labelled controls, visible focus, ARIA states, Esc closes, 44px touch targets, `prefers-reduced-motion` respected.
- **No inline `style=""`** in markup (CSP-friendly); JS may set CSS variables.
- Add icons by name to `src/icons/icons.txt`, and i18n keys to **all three** `demo/i18n/*.json` files.
- Commit the rebuilt `dist/` together with your `src/` change (people use `dist/` directly).

## Pull requests
1. One topic per PR, with a short description and before/after screenshots for visual changes.
2. `npm run build` must pass, and no console errors or phone overflow should show in `tests/shots.mjs`.
3. Use English commit messages in the imperative mood ("Add OTP resend timer").

By contributing you agree that your work is released under the [MIT License](LICENSE).
