# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-10-20

First public release.

### Added
- Design system: tokens (light/dark, 7 accents, density, radius), base, and app-shell layout with floating top pills, dock, rail flyout/drawer, tab bar with FAB, and large titles.
- Runtime (`window.AC`, ES module): auto-init registry, events, focus trap, scroll lock, gestures, i18n (fa/en/ar, RTL), number/date formatting with the Persian calendar, theme switching, icon sprite loader, and pre-paint boot script.
- Forms: inputs, password strength, OTP, combobox, tags, switches, range, rating, swatches, Jalali/Gregorian date and time pickers, dropzone, validation (including `iran-mobile` and `iran-national-id`), and wizard.
- Overlays and feedback: modal, bottom sheet, drawer, menus, popover, tooltip, confirm/prompt, toast, alert, notification center, and theme customizer.
- Data display: data table, inline-SVG charts, lists with swipe actions, accordion, tree, code/JSON viewer, and log viewer.
- Demo app (`demo/`): dashboard and in-app pages, standalone auth pages (login, register, forgot, OTP, lock), error pages (404, 500, maintenance, offline), and a PWA (manifest, service worker, offline fallback).
- Packaging: MIT license, license banners in `dist/`, CI build, and a GitHub Pages live demo.
