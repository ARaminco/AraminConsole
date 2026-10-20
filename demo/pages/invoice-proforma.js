/* Proforma invoice (پیش‌فاکتور) with brand header, bank accounts and QR placeholder — src/modules/invoice-ir. */
import { install } from '../../src/modules/invoice-ir/invoice-ir.js';
import { invoiceProforma } from '../data.js';

export default function mount(root, AC) {
  install(AC);
  const inv = AC.invoiceIR.render(root.querySelector('[data-invir]'), invoiceProforma, { type: 'proforma', unit: 'IRT' });
  return () => inv.destroy();
}
