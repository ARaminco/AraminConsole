/* Side drawer. data-side="start|end" (logical, RTL-aware), data-size="sm|md|lg".
   Same inner markup as the modal (.ac-dialog + __head/__body/__foot). Swipe toward its edge to dismiss.
   API: AC.drawer.open('#d' | el | { title, content, footer, side, size }) · AC.drawer.close([target])
   Events: ac:drawer:open, ac:drawer:close {reason}, ac:drawer:closed */
import { AC, register, gesture, isRTL, clamp, haptic } from '../core.js';
import { dialogLayer, opener } from './sheet.js';

function drawerDrag(el, panel, o, close) {
  const dirSign = () => ((el.dataset.side === 'start') !== isRTL(el) ? -1 : 1); // physical direction that closes it
  const g = gesture(panel, {
    axis: 'x',
    filter: (e) => e.pointerType !== 'mouse' && !e.target.closest('input, textarea, select, [data-no-drag]'),
    onStart: () => { el.setAttribute('data-dragging', ''); },
    onMove: (s) => {
      const d = s.dx * dirSign();
      const v = d < 0 ? -Math.sqrt(-d) * 2 : d;
      el.style.setProperty('--_x', `${Math.round(v * dirSign())}px`);
      el.style.setProperty('--_p', String(clamp(1 - v / panel.offsetWidth, 0, 1).toFixed(3)));
    },
    onEnd: (s) => {
      el.removeAttribute('data-dragging');
      const d = s.dx * dirSign(); const v = s.vx * dirSign();
      el.style.setProperty('--_x', '0px');
      if (!s.cancelled && (v > 0.5 || d > panel.offsetWidth * 0.4)) { haptic(); close('drag'); } else el.style.setProperty('--_p', '1');
    },
  });
  return { reset: () => el.style.setProperty('--_x', '0px'), destroy: g };
}

register('drawer', (el) => {
  if (!el.dataset.side) el.dataset.side = 'end';
  return dialogLayer(el, 'drawer', { side: 'end' }, { drag: drawerDrag });
});

export const drawer = opener('drawer');
AC.drawer = drawer;
