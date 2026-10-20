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
import { AC, register, on, emit, gesture, haptic, reducedMotion, isRTL, instance, i18n } from '../core.js';

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

export const kanban = { flip };
AC.kanban = kanban;
