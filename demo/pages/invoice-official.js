/* Official Iranian invoice (صورتحساب فروش کالا و خدمات) rendered by src/modules/invoice-ir. */
import { install } from '../../src/modules/invoice-ir/invoice-ir.js';
import { invoiceOfficial } from '../data.js';

export default function mount(root, AC) {
  install(AC);
  const inv = AC.invoiceIR.render(root.querySelector('[data-invir]'), invoiceOfficial, { type: 'official' });
  return () => inv.destroy();
}
