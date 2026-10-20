/* Invoice editor: form (parties, items, VAT, bank) with live totals driving a print-ready preview. Draft kept in localStorage. */
import { install } from '../../src/modules/invoice-ir/invoice-ir.js';
import { invoiceOfficial } from '../data.js';

export default function mount(root, AC) {
  let preview; let editor; let dead = false;
  // lean demo build: make sure the form styles/components are present before rendering inputs
  Promise.resolve(AC.use?.(['forms', 'datepicker', 'money', 'invoice-ir'])).catch(() => {}).then(() => {
    if (dead) return;
    install(AC);
    preview = AC.invoiceIR.render(root.querySelector('[data-invir]'), invoiceOfficial, { type: 'official' });
    editor = AC.invoiceIR.editor(root.querySelector('[data-invir-editor]'), { data: invoiceOfficial, preview });
  });
  return () => { dead = true; editor?.destroy(); preview?.destroy(); };
}
