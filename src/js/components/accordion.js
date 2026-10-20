/* Accordion — native <details>, animated height, optional single-open.
   <div class="ac-accordion" data-ac="accordion" [data-single]>
     <details class="ac-accordion__item"><summary class="ac-accordion__head">Question</summary>
       <div class="ac-accordion__body">Answer</div></details></div>
   Event: ac:accordion:toggle { item, open }. API: AC.instance(el,'accordion').toggle(i|details, open?) */
import { register, instance, on, emit, options, reducedMotion } from '../core.js';

register('accordion', (el) => {
  const o = options(el, { single: false });
  const anims = new Map();
  const items = () => Array.from(el.querySelectorAll(':scope > details, :scope > .ac-accordion__item'));
  function toggle(d, open = !d.open) {
    if (typeof d === 'number') d = items()[d];
    if (!d || open === (d.open && !d.hasAttribute('data-closing'))) return;
    if (open && o.single) items().forEach((x) => { if (x !== d && x.open) toggle(x, false); });
    anims.get(d)?.cancel();
    const body = d.querySelector('.ac-accordion__body');
    emit(d, 'accordion:toggle', { item: d, open });
    if (reducedMotion() || !body || !d.animate) { d.open = open; return; }
    const from = d.offsetHeight;
    d.open = true;
    const to = open ? d.offsetHeight : d.offsetHeight - body.offsetHeight;
    d.toggleAttribute('data-closing', !open);
    d.setAttribute('data-animating', '');
    const a = d.animate({ height: [`${from}px`, `${to}px`] }, { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
    anims.set(d, a);
    const done = () => { anims.delete(d); d.removeAttribute('data-animating'); d.removeAttribute('data-closing'); };
    a.onfinish = () => { if (!open) d.open = false; done(); };
    a.oncancel = done;
  }
  const off = on(el, 'click', 'summary', (e, s) => {
    const d = s.parentElement;
    if (d.parentElement !== el) return;
    e.preventDefault();
    toggle(d, !d.open || d.hasAttribute('data-closing'));
  });
  instance(el, 'accordion', { toggle, items });
  return () => { off(); anims.forEach((a) => a.cancel()); };
});
