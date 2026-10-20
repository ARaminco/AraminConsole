/* Modal / dialog. Sizes data-size="sm|md|lg|full"; below 640px it presents as a bottom sheet
   (grab handle, drag-to-dismiss) with the same markup.
   <div class="ac-modal" id="m" data-ac="modal" data-size="md" [data-static] [data-initial="#field"]>
     <div class="ac-dialog">
       <div class="ac-dialog__head"><div class="ac-dialog__titles"><h2 class="ac-dialog__title">…</h2><p class="ac-dialog__sub">…</p></div>
         <button class="ac-dialog__close" data-ac-close aria-label="Close">…</button></div>
       <div class="ac-dialog__body">…</div>
       <div class="ac-dialog__foot">…</div>
     </div>
   </div>
   API: AC.modal.open('#m' | el | { title, sub, content, footer, size, static }) · AC.modal.close([target])
   Events: ac:modal:open, ac:modal:beforeclose (cancelable), ac:modal:close {reason}, ac:modal:closed */
import { AC, register } from '../core.js';
import { dialogLayer, sheetDrag, opener, phoneMQ } from './sheet.js';

register('modal', (el) => dialogLayer(el, 'modal', { size: 'md' }, {
  drag: (e, p, o, c) => sheetDrag(e, p, { ...o, snap: '' }, c, () => phoneMQ.matches),
}));

export const modal = opener('modal');
AC.modal = modal;
