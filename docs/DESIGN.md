# AraminConsole — Visual Direction (binding, supersedes SPEC §2 visuals)

The owner rejected the first look (dark rail, violet accent). The target is the reference reel
"Dashboard V14 — Modern & Minimal UI" (code.xr, product name "Vertix"). Frames: `docs/reference/ref-overview.png`, `ref-manage.png`.
Match its feel closely, then make it RTL-first and app-like on phones.

## What the reference looks like
- **Canvas:** very light warm-gray page (`~#f3f3f4`), content sits in one big rounded white "app frame" feel; cards are **pure white, radius ~20–24px, hairline border (`~#ececee`) and almost no shadow**. Lots of air; 16–20px gaps.
- **Top bar = three floating white pills** on the canvas:
  1. brand pill (logo mark in a filled orange-red circle + product name),
  2. **centered segmented nav** inside a white pill: Overview · Activity · Manage · Program · Account · Reports — the active item is a **solid black pill with white text** that slides (animated) between items,
  3. utilities pill: search, bell, clock/history icon buttons + user chip (avatar, name, email, chevron).
- **Side rail = slim floating vertical white pill** (≈48px wide) at the start edge, icon-only: theme toggle (sun/moon) on top in its own small pill, then section icons (active = black filled circle with white icon), and at the bottom a separate small pill with help/logout. Not a wide dark sidebar.
- **Page head:** big greeting / title in dark ink ("Good morning, Code XR" — ours: «صبح بخیر، علی») with a one-line muted subtitle; primary action at the end as a **black pill button** ("+ New card").
- **Accent:** orange-red `#f0532d`-ish (gradient `#ff6a3d → #ee4a22`) used sparingly: the one highlighted KPI tile (filled orange gradient card with white text), toggles/switches ON state, sliders/progress fill, chart highlight bars, brand mark. Everything else is black/gray/white. Positive deltas in small green pill (`+5%`), negatives in small red pill.
- **Buttons:** primary = black pill (`#111`), white text, icon + label; secondary = light gray pill (`#f2f2f3`) dark text; small chip-style filters (Search field pill, "Filter ▾" pill).
- **KPI cards:** small label with an icon circle at the end, big number (counting-up animation), small delta pill + "This month" muted. One card filled orange.
- **Charts:** rounded bars, black + orange series, light gray grid, tiny labels; legend as dots.
- **Tables:** inside white card, header row on very light gray rounded strip, small text, status as dot + label, search pill + filter pill in the card header.
- **Credit card / object visuals:** dark glossy card with subtle pattern; controls list with labeled toggles (title + muted description) separated by hairlines.
- **Typography:** clean geometric sans (Latin: Inter-like system stack; Persian/Arabic: Vazirmatn), headings semi-bold not heavy, numbers tabular, small muted labels (11–12px).
- **Motion (framer-motion style):** cards lift `translateY(-4px)` with softer shadow on hover, staggered fade-up entrance of cards on page load, nav pill slides, numbers count up, bars grow from baseline, toggles spring.
- **Dark mode:** same structure, canvas `#0b0b0c`, cards `#161618`, hairline `#232326`, active pill becomes **white with black text**, accent stays orange.

## Translating to our framework
- Desktop (≥1024px): floating slim rail + top pills layout above. Top segmented nav shows the main sections of the current workspace (Dashboard, Analytics, Users, Orders, Console, Reports…) with an overflow "More ▾" pill; the slim rail holds app-level destinations/groups (icons with tooltips) and opens a **flyout panel** for groups with many pages.
- Tablet (640–1023): top pills collapse: brand + utilities; nav pill scrolls horizontally; rail hidden → bottom tab bar.
- Phone (<640): app-like: large greeting title that collapses into a compact top bar on scroll; **bottom tab bar is a floating white pill** (not full-width bar) with the active tab as black circle/pill and a center orange FAB; sheets, swipe, pull-to-refresh as before.
- RTL: rail on the right, everything mirrored via logical properties.
- Accent presets remain (orange default + others), but the **default theme is light with orange accent and black primary**.
