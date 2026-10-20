/* Split view → navigation stack on phones (chat, mail, settings…).
   <div class="ac-split" data-ac="split" [data-breakpoint="639.98"]>
     <div class="ac-split__pane">list…</div>
     <div class="ac-split__pane">detail… <button data-split-back>…</button></div>
   </div>
   Wide screens show every pane side by side. Below the breakpoint the panes become stacked screens:
   push() slides the next one in from the inline end (mirrored in RTL) with a parallax on the one beneath,
   pop() / [data-split-back] / the browser Back button / an edge swipe from the start edge slide it out.
   Panes hidden on phones get .ac-split__pane--wide (not part of the stack).
   Events: ac:split:change { depth, stacked }   API: AC.instance(el,'split').push(depth?) · pop() · depth · stacked */
import { AC, register, on, emit, gesture, instance, isRTL, haptic } from '../core.js';

register('split', (el) => {
  el.classList.add('ac-split');
  const mq = matchMedia(`(max-width: ${el.dataset.breakpoint || '639.98'}px)`);
  const panes = () => Array.from(el.children).filter((n) => n.matches('.ac-split__pane:not(.ac-split__pane--wide)'));
  let depth = 0; let pushed = 0; let parkT = 0;

  // A pushed screen is position:fixed; transformed ancestors (entrance animations) would trap it,
  // so they are flattened while a screen is up. Screens beyond the top are parked (display:none).
  const flat = (on) => { for (let e = el; e && e !== document.body; e = e.parentElement) e.toggleAttribute('data-ac-flat', on); };
  const park = () => { panes().forEach((p, i) => p.toggleAttribute('data-parked', mq.matches && i > depth)); if (depth === 0) flat(false); };
  const render = () => {
    const stacked = mq.matches;
    el.toggleAttribute('data-stacked', stacked);
    el.dataset.depth = String(depth);
    panes().forEach((p, i) => {
      p.dataset.pos = i < depth ? 'under' : i === depth ? 'top' : 'next';
      if (stacked) p.inert = i !== depth; else p.inert = false;
    });
    document.documentElement.toggleAttribute('data-ac-stacked', stacked && depth > 0);
  };
  const set = (d, fromHistory) => {
    const max = panes().length - 1;
    d = Math.max(0, Math.min(max, d));
    if (d === depth) { render(); return; }
    const forward = d > depth;
    clearTimeout(parkT);
    if (mq.matches && forward) {
      flat(true);
      panes().forEach((p, i) => { if (i <= d) p.removeAttribute('data-parked'); });
      void el.offsetWidth;   // let the unparked screen start off-screen, then slide
    }
    depth = d;
    if (mq.matches && !fromHistory) {
      if (forward) { history.pushState({ acSplit: d }, ''); pushed++; }
    }
    render();
    if (mq.matches && !forward) parkT = setTimeout(park, 400);
    if (mq.matches) haptic(4);
    emit(el, 'split:change', { depth, stacked: mq.matches });
  };
  const push = (d = depth + 1) => set(d);
  const pop = () => {
    if (depth === 0) return;
    if (mq.matches && pushed > 0) { history.back(); return; }   // popstate finishes the job
    set(depth - 1);
  };

  // edge swipe from the start edge pops (iOS-style)
  const swipes = panes().slice(1).map((pane) => gesture(pane, {
    axis: 'x',
    filter(e) {
      if (!mq.matches || pane.dataset.pos !== 'top') return false;
      const r = pane.getBoundingClientRect();
      const fromEdge = isRTL(el) ? r.right - e.clientX : e.clientX - r.left;
      return fromEdge < 28;
    },
    onStart() { el.setAttribute('data-dragging', ''); },
    onMove(s) {
      const dir = isRTL(el) ? -1 : 1;
      const d = Math.max(0, s.dx * dir);
      pane.style.setProperty('--ac-drag', `${dir * d}px`);
      el.style.setProperty('--ac-split-progress', String(Math.min(1, d / pane.offsetWidth)));
    },
    onEnd(s) {
      el.removeAttribute('data-dragging');
      const dir = isRTL(el) ? -1 : 1;
      const d = s.dx * dir; const v = s.vx * dir;
      pane.style.removeProperty('--ac-drag'); el.style.removeProperty('--ac-split-progress');
      if (v > 0.4 || d > pane.offsetWidth / 3) pop();
    },
  }));

  const offs = [
    ...swipes,
    on(el, 'click', '[data-split-back]', (e) => { e.preventDefault(); pop(); }),
    on(window, 'popstate', () => { if (pushed > 0) { pushed--; set(depth - 1, true); } }),
    on(document, 'keydown', (e) => { if (e.key === 'Escape' && mq.matches && depth > 0 && !document.querySelector('.ac-modal[data-state="open"], .ac-sheet[data-state="open"], .ac-menu[data-state="open"]')) pop(); }),
  ];
  const onMQ = () => { if (!mq.matches) { pushed = 0; flat(false); } else if (depth > 0) flat(true); render(); park(); };
  mq.addEventListener('change', onMQ);
  render(); park();
  requestAnimationFrame(() => el.setAttribute('data-ready', ''));

  instance(el, 'split', { push, pop, get depth() { return depth; }, get stacked() { return mq.matches; }, reset: () => { depth = 0; render(); park(); } });
  return () => {
    offs.forEach((f) => f()); mq.removeEventListener('change', onMQ);
    clearTimeout(parkT); flat(false);
    document.documentElement.removeAttribute('data-ac-stacked');
  };
});

AC.split = { push: (el, d) => AC.instance(el, 'split')?.push(d), pop: (el) => AC.instance(el, 'split')?.pop() };
