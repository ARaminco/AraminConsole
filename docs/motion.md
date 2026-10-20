# Motion system

Files: `src/css/tokens.css` (motion tokens), `src/css/motion.css` (system + micro-interactions, built **last** so it refines every component), `src/js/motion.js` (`AC.motion`). Bar: Emil Kowalski / Linear / Vercel — fast, purposeful, interruptible.

## Rules of the house
- Animate only `transform`, `opacity`, `filter`, `clip-path`. Colour changes use `--ac-ease-hover`.
- Entering / exiting → ease-out curves. Moving on screen → ease-in-out or a spring. **Never ease-in.**
- Exits are faster than entrances (`--ac-dur-exit`). UI stays under 300 ms; sheets ride the drawer curve (~420 ms).
- Press feedback on `:active` at once (100 ms in, spring back out). Hover *motion* only under `(hover: hover) and (pointer: fine)`.
- Keyboard-driven changes are instant (highlight moves, palette rows): things used 100×/day must not wait for animation.
- Popovers scale from their trigger (`--ac-origin`, set by position.js); modals scale from the centre.

## Tokens
| Token | Value | Use |
|---|---|---|
| `--ac-ease` | `cubic-bezier(.23,1,.32,1)` | default UI ease-out |
| `--ac-ease-out` | `cubic-bezier(.19,1,.22,1)` | expo-out: reveals, lifts, stagger |
| `--ac-ease-in-out` | `cubic-bezier(.77,0,.175,1)` | on-screen movement, chart line draw |
| `--ac-ease-move` | `cubic-bezier(.25,1,.5,1)` | slides / panels |
| `--ac-ease-drawer` | `cubic-bezier(.32,.72,0,1)` | sheets, drawers (iOS / Vaul) |
| `--ac-spring` + `--ac-spring-dur` | `linear(…)` 400 ms | real spring k=520 c=34 (2.9 % overshoot) sampled into `linear()` — pills, thumbs, cards |
| `--ac-spring-bounce` + `-dur` | `linear(…)` 700 ms | k=380 c=20 (15 %) — icons, checks, badges (rare, playful) |
| `--ac-dur-0…4`, `--ac-dur-sheet`, `--ac-dur-exit` | 100 / 140 / 180 / 240 / 300 / 420 / 140 ms | |
| `--ac-stagger` | 45 ms | sibling entrance step (capped at 7 steps) |
| `--ac-press`, `--ac-press-sm`, `--ac-lift` | `scale(.97)`, `scale(.92)`, `translateY(-4px)` | |
| `--ac-dir` | `1` / `-1` | inline direction multiplier for `translateX` (see rtl.md) |
| `--ac-travel` | `1` / `0` | distance factor; `0` under reduced motion |

## `AC.motion` (JS)
```js
AC.motion.spring(el, { x: 120, scale: [0.9, 1], opacity: 1 }, { stiffness, damping, mass }) // WAAPI, interruptible, keeps velocity
AC.motion.springValue(0, 100, { onUpdate: (v) => … })      // rAF spring for anything that is not a transform
AC.motion.slide(indicator, { x, w, y?, h? }, { instant, also: [layer] }) // indicator geometry; leading edge stiffer → stretch
AC.motion.inkLayer(container, '.item')                     // Emil's duplicate-and-clip: label colour flips exactly under the pill
AC.motion.track(container, { active: '[data-active]' })     // ink pill that springs to the active child (dock uses it)
AC.motion.highlight(list, { items: '.row' })               // sliding hover highlight for a custom list
AC.motion.followSelection(list)                            // one indicator follows the aria-selected row (palette)
AC.motion.flip(targets, () => mutate())                    // FLIP layout transition
AC.motion.stagger(els, keyframes, { step: 45 }) · enter(els)
AC.motion.countUp(el, 1234, { format }) · bump(badge) · reveal(contentThatReplacedASkeleton)
AC.motion.transition(update, { kind: 'page'|'lang'|'theme', direction })   // View Transitions
AC.motion.navigate(update, { from, to })                   // page transition; direction from nav order
AC.motion.springEasing(springs.gentle) → { easing: 'linear(…)', duration }
AC.motion.preference = 'system' | 'full' | 'reduced'       // persisted (ac:motion)
```
Declarative: `data-ac="bump"` (count bumps when its text changes; shell badges get it automatically), `data-ac="motion-pref"` (System / Full / Reduced segmented control for settings pages), `data-ac="counter"` (count-up).

## What moves where
- **Navigation**: top nav, segmented, pill tabs, tab bar and dock share one spring indicator with stretch + ink layer. Route changes mark the target link *before* fetching, so the pill answers the click at once. Only `.ac-content` is captured by the page View Transition (`:root` is excluded) — the chrome stays live and keeps animating. Pages slide toward the direction of travel in the nav (mirrored in RTL) with a 2 px blur bridge.
- **Lists**: menus, rail flyout, language picker get a sliding hover highlight (instant on keyboard); the command palette has one indicator for hover + arrow keys.
- **Overlays**: dropdown/popover scale .95 → 1 from the trigger in 180 ms, exit in 140 ms; tooltips delay 450 ms, then neighbours open instantly with no animation; modals scale from centre; sheets/drawers use the drawer curve; menus on phones become action sheets.
- **Controls**: buttons press .97 and spring back; loading morphs (label blurs out, spinner pops in); switch thumb springs with squash; checkbox check is drawn (clip reveal); radio dot bounces; focus ring grows; float labels glide.
- **Data**: KPI count-ups; bars grow from the baseline column by column (`--i`, `--_base`) with a spring; lines draw (`stroke-dashoffset`); donut sweeps; hover dims other columns; tooltip follows on a spring (transform only); legend hover spotlights a series; legend toggle and `update()` morph paths (CSS `d`) instead of jumping; bulk bar springs in.
- **Shell**: staggered card entrance; card hover lift; language switch = whole-document blur crossfade; theme switch = circular reveal from the pressed control; badges bump; tab icon pops.

## Reduced motion — a preference, not a kill switch
`<html data-motion="full|reduced">` is resolved pre-paint by `boot.js` from `ac:motion` (`system` follows `prefers-reduced-motion`). Windows with "Animation effects" off makes every browser report *reduce* — users who still want the full experience pick **Full** in the customizer («حرکت و انیمیشن») or a settings page (`data-ac="motion-pref"`).

Reduced keeps fades, colour, blur crossfades, count-ups, chart reveals and page/language crossfades; it drops travel (every keyframe multiplies its distance by `--ac-travel`), springs (JS jumps to the end state), transform transitions (`transition-property` is limited to non-spatial properties) and decorative loops (shimmer, pulse). `data-motion="off"` still turns everything off. In JS, `AC.reducedMotion()` means "skip spatial motion", not "skip all feedback".

## Verifying motion
Slow it down: CDP `Animation.setPlaybackRate` (0.1–0.25) for CSS/WAAPI, and `AC.motion.timeScale` for rAF springs; capture frames at fixed animation times. Test both `page.emulateMedia({ reducedMotion: 'reduce' })` with preference `system` and `full`. rAF springs are measured in-page (screenshots stall frames).
