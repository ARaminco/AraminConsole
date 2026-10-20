/* Tooltip: any element with data-ac-tooltip="text" [data-ac-tooltip-placement="top|bottom|start|end"] [data-ac-tooltip-kbd="Ctrl K"].
   Shows on mouse hover (after a short delay; instant while "warm") and on keyboard focus. Never on touch.
   One shared role="tooltip" element; the trigger gets aria-describedby while it is visible.
   API: AC.tooltip.show(el) · AC.tooltip.hide() */
import { AC, on, h, escapeHtml, uid } from '../core.js';
import { position } from './position.js';

const DELAY = 450;
let tip = null; let current = null; let timer = 0; let warmUntil = 0; let lastPointer = 'mouse';

function ensure() {
  if (tip) return tip;
  tip = h('div', { class: 'ac-tooltip', role: 'tooltip', id: uid('tooltip'), 'data-state': 'closed' });
  document.body.append(tip);
  return tip;
}
function show(el, warm = false) {
  clearTimeout(timer);
  const text = el?.getAttribute('data-ac-tooltip');
  if (!text || !el.isConnected) return;
  ensure();
  if (current && current !== el) current.removeAttribute('aria-describedby');
  current = el;
  const kbd = el.getAttribute('data-ac-tooltip-kbd');
  tip.innerHTML = `${escapeHtml(text)}${kbd ? ` <kbd class="ac-tooltip__kbd">${escapeHtml(kbd)}</kbd>` : ''}`;
  if (!el.hasAttribute('aria-describedby') && el.getAttribute('aria-label') !== text) el.setAttribute('aria-describedby', tip.id);
  // once one tooltip is showing, neighbours appear instantly — no delay, no animation (Emil)
  tip.toggleAttribute('data-instant', warm);
  tip.dataset.state = 'open';
  position(el, tip, { placement: el.getAttribute('data-ac-tooltip-placement') || 'top', offset: 8 });
}
function hide() {
  clearTimeout(timer);
  if (!current) return;
  if (current.getAttribute('aria-describedby') === tip?.id) current.removeAttribute('aria-describedby');
  current = null;
  if (tip) tip.dataset.state = 'closed';
  warmUntil = Date.now() + 500;
}

on(document, 'pointerover', '[data-ac-tooltip]', (e, el) => {
  if (e.pointerType !== 'mouse' || el === current) return;
  clearTimeout(timer);
  const warm = Date.now() < warmUntil || (current && tip?.dataset.state === 'open');
  timer = setTimeout(() => show(el, warm), warm ? 0 : DELAY);
});
on(document, 'pointerout', '[data-ac-tooltip]', (e, el) => {
  if (e.relatedTarget && el.contains(e.relatedTarget)) return;
  if (el === current) hide(); else clearTimeout(timer);
});
on(document, 'focusin', '[data-ac-tooltip]', (e, el) => {
  if (lastPointer === 'touch') return;
  try { if (!el.matches(':focus-visible')) return; } catch { /* old engines */ }
  show(el);
});
on(document, 'focusout', '[data-ac-tooltip]', (e, el) => { if (el === current) hide(); });
on(document, 'pointerdown', (e) => { lastPointer = e.pointerType; hide(); }, { capture: true });
on(document, 'keydown', (e) => { if (e.key === 'Escape' && current) { e.preventDefault(); e.stopPropagation(); hide(); } }, { capture: true });
on(window, 'scroll', () => { if (current) hide(); }, { capture: true, passive: true });

export const tooltip = { show, hide };
AC.tooltip = tooltip;
