/*! AraminConsole v0.1.0 — module apps — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');

/* ======== module: apps ======== */
if (!__R["apps"]) __R["apps"] = (() => {
const F = {};
const __ac_m1 = __R["core"].f["js/core.js"];
/* ---- js/components/kanban.js ---- */
const __ac_mt = F["js/components/kanban.js"] = (() => {
const { AC, register, on, emit, gesture, haptic, reducedMotion, isRTL, instance, i18n } = __ac_m1;
/* Kanban board — drag & drop cards between lists with pointer events (mouse, pen, touch).
   <div class="ac-kanban" data-ac="kanban">
     <section class="ac-kanban__col" data-col="todo">
       <header class="ac-kanban__head">… <span class="ac-kanban__count"></span></header>
       <div class="ac-kanban__list"><article class="ac-kanban__card" data-id="1" tabindex="0">…</article></div>
     </section> …
   </div>
   Mouse/pen drag at once; touch picks the card up after a short press (so the board still scrolls).
   A floating ghost follows the pointer, the card itself becomes the placeholder and siblings glide (FLIP).
   Edges auto-scroll the board, the list and the page. Keyboard: Ctrl/Alt + arrows move the focused card.
   Events: ac:kanban:move { id, card, from, to, index } (from/to = column ids)
   API: AC.instance(el,'kanban').refresh() · .scrollTo(i) */


const CARD = '.ac-kanban__card';
const LIST = '.ac-kanban__list';
const COL = '.ac-kanban__col';
const EDGE = 56;

function flip(nodes, mutate, skip) {
  const before = new Map(nodes.map((n) => [n, n.getBoundingClientRect()]));
  mutate();
  if (reducedMotion()) return;
  for (const [n, a] of before) {
    if (n === skip || !n.isConnected) continue;
    const b = n.getBoundingClientRect();
    const dx = a.left - b.left; const dy = a.top - b.top;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) n.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
}

register('kanban', (el) => {
  const lists = () => Array.from(el.querySelectorAll(LIST));
  const colId = (list) => list.closest(COL)?.dataset.col ?? '';
  const live = el.querySelector('.ac-kanban__live') || el.appendChild(Object.assign(document.createElement('div'), { className: 'ac-visually-hidden ac-kanban__live' }));
  live.setAttribute('aria-live', 'polite');
  let armed = false; let armTimer = 0; let drag = null; let raf = 0;

  const refresh = () => {
    for (const col of el.querySelectorAll(COL)) {
      const n = col.querySelectorAll(CARD).length;
      const c = col.querySelector('.ac-kanban__count'); if (c) c.textContent = AC.format.number(n);
      col.querySelector(LIST)?.toggleAttribute('data-empty', n === 0);
    }
  };
  refresh();

  const disarm = () => { clearTimeout(armTimer); armTimer = 0; if (!drag) { el.querySelector(`${CARD}[data-armed]`)?.removeAttribute('data-armed'); armed = false; } };

  function place(x, y) {
    const hit = document.elementFromPoint(x, y);
    const list = hit?.closest(LIST) || hit?.closest(COL)?.querySelector(LIST);
    if (!list || !el.contains(list)) return;
    const box = list.getBoundingClientRect();
    const py = y - box.top + list.scrollTop;
    const others = Array.from(list.children).filter((n) => n.matches(CARD) && n !== drag.card);
    const before = others.find((n) => n.offsetTop + n.offsetHeight / 2 > py) || null;
    if (drag.card.parentElement === list && (drag.card.nextElementSibling === before || (!before && !drag.card.nextElementSibling))) return;
    const changed = drag.card.parentElement !== list;
    const nodes = [...new Set([...drag.card.parentElement.children, ...list.children])].filter((n) => n.matches(CARD));
    flip(nodes, () => list.insertBefore(drag.card, before), changed ? drag.card : null);
    if (changed) { lists().forEach((l) => l.toggleAttribute('data-over', l === list)); haptic(4); }
    refresh();
  }

  function autoscroll() {
    if (!drag) return;
    const { x, y } = drag;
    let moved = false;
    const scrollers = [el, document.elementFromPoint(x, y)?.closest(LIST)].filter(Boolean);
    for (const s of scrollers) {
      const r = s.getBoundingClientRect();
      if (s.scrollWidth > s.clientWidth) {
        const v = x < r.left + EDGE ? -1 : x > r.right - EDGE ? 1 : 0;
        if (v) { const before = s.scrollLeft; s.scrollLeft += v * 12; moved ||= s.scrollLeft !== before; }
      }
      if (s.scrollHeight > s.clientHeight + 2) {
        const v = y < r.top + EDGE ? -1 : y > r.bottom - EDGE ? 1 : 0;
        if (v) { const before = s.scrollTop; s.scrollTop += v * 10; moved ||= s.scrollTop !== before; }
      }
    }
    const vh = innerHeight;
    const wv = y < 90 ? -1 : y > vh - EDGE - (AC.isMobile() ? 90 : 0) ? 1 : 0;
    if (wv) { const b = scrollY; scrollBy(0, wv * 12); moved ||= scrollY !== b; }
    if (moved) place(x, y);
    raf = requestAnimationFrame(autoscroll);
  }

  function begin(s) {
    const card = s.target.closest(CARD);
    const r = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.removeAttribute('data-armed'); ghost.removeAttribute('tabindex');
    ghost.classList.add('ac-kanban__ghost');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.setProperty('--_w', `${r.width}px`);
    document.body.append(ghost);
    drag = { card, ghost, ox: s.startX - r.left, oy: s.startY - r.top, x: s.x, y: s.y, from: card.parentElement, index: Array.from(card.parentElement.children).indexOf(card) };
    card.removeAttribute('data-armed');
    card.setAttribute('data-placeholder', '');
    el.setAttribute('data-dragging', '');
    document.documentElement.setAttribute('data-ac-dragging', '');
    move(s);
    requestAnimationFrame(() => ghost.setAttribute('data-lifted', ''));
    haptic(10);
    raf = requestAnimationFrame(autoscroll);
  }
  function move(s) {
    drag.x = s.x; drag.y = s.y;
    drag.ghost.style.setProperty('--_x', `${s.x - drag.ox}px`);
    drag.ghost.style.setProperty('--_y', `${s.y - drag.oy}px`);
    place(s.x, s.y);
  }
  function end() {
    cancelAnimationFrame(raf);
    const { card, ghost, from, index } = drag;
    const done = () => {
      ghost.remove(); card.removeAttribute('data-placeholder');
      el.removeAttribute('data-dragging'); document.documentElement.removeAttribute('data-ac-dragging');
      lists().forEach((l) => l.removeAttribute('data-over'));
    };
    const to = card.parentElement; const newIndex = Array.from(to.children).indexOf(card);
    drag = null; armed = false;
    if (reducedMotion()) done();
    else {
      const r = card.getBoundingClientRect();
      ghost.removeAttribute('data-lifted');
      ghost.style.setProperty('--_x', `${r.left}px`); ghost.style.setProperty('--_y', `${r.top}px`);
      ghost.setAttribute('data-dropping', '');
      setTimeout(done, 200);
    }
    if (to !== from || newIndex !== index) moved(card, from, to, newIndex);
  }
  function moved(card, from, to, index) {
    refresh();
    const title = card.querySelector('.ac-kanban__title, h3')?.textContent.trim() || '';
    const col = to.closest(COL)?.querySelector('.ac-kanban__name')?.textContent.trim() || colId(to);
    live.textContent = i18n.t('kanban.moved', '{card} → {col}', { card: title, col });
    emit(el, 'kanban:move', { id: card.dataset.id, card, from: colId(from), to: colId(to), index });
  }

  const g = gesture(el, {
    axis: 'both', threshold: 6,
    filter(e) {
      const card = e.target.closest(CARD);
      if (!card || drag || e.target.closest('button, a, input, textarea, select, [data-no-drag]')) return false;
      if (e.pointerType !== 'mouse') {
        armTimer = setTimeout(() => { armed = true; card.setAttribute('data-armed', ''); haptic(8); }, 260);
      }
      return true;
    },
    onStart(s) {
      if (s.pointerType !== 'mouse' && !armed) { disarm(); return false; }
      clearTimeout(armTimer);
      begin(s);
      return true;
    },
    onMove(s) { if (drag) move(s); },
    onEnd() { if (drag) end(); },
  });

  const offs = [
    g,
    on(window, 'pointerup', () => { if (!drag) disarm(); }),
    on(window, 'pointercancel', () => { if (!drag) disarm(); }),
    on(el, 'touchmove', (e) => { if (armed || drag) e.preventDefault(); }, { passive: false }),
    on(el, 'contextmenu', (e) => { if (armed || drag) e.preventDefault(); }),
    on(el, 'keydown', CARD, (e, card) => {
      if (!(e.ctrlKey || e.altKey) || !e.key.startsWith('Arrow')) return;
      e.preventDefault();
      const from = card.parentElement; const all = lists(); const li = all.indexOf(from);
      const fwd = isRTL(el) ? 'ArrowLeft' : 'ArrowRight';
      let to = from; let before;
      if (e.key === 'ArrowUp') before = card.previousElementSibling;
      else if (e.key === 'ArrowDown') before = card.nextElementSibling?.nextElementSibling ?? null;
      else { to = all[li + (e.key === fwd ? 1 : -1)]; if (!to) return; before = to.querySelector(CARD); }
      if (e.key === 'ArrowUp' && !before) return;
      if (e.key === 'ArrowDown' && !card.nextElementSibling) return;
      const nodes = [...new Set([...from.children, ...to.children])];
      flip(nodes, () => to.insertBefore(card, before));
      card.focus({ preventScroll: false });
      card.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      moved(card, from, to, Array.from(to.children).indexOf(card));
    }),
  ];
  const api = {
    refresh,
    scrollTo(i) { el.querySelectorAll(COL)[i]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' }); },
  };
  instance(el, 'kanban', api);
  return () => { offs.forEach((f) => f()); cancelAnimationFrame(raf); clearTimeout(armTimer); drag?.ghost.remove(); document.documentElement.removeAttribute('data-ac-dragging'); };
});

const kanban = { flip };
AC.kanban = kanban;
return Object.freeze({ kanban });
})();

/* ---- js/components/split.js ---- */
const __ac_m18 = F["js/components/split.js"] = (() => {
const { AC, register, on, emit, gesture, instance, isRTL, haptic } = __ac_m1;
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
return Object.freeze({  });
})();

return { f: F, ns: Object.freeze({ "kanban": __ac_mt["kanban"] }) };
})();
export const { kanban } = __R["apps"].ns;
export default __R["apps"].ns;
