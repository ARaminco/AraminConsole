/* Search Console-style performance report — src/modules/marketing. Swap gscData() for a Search Console API call to go live. */
import { install } from '../../src/modules/marketing/marketing.js';
import { gscData } from '../data.js';

export default function mount(root, AC) {
  let gsc; let dead = false;
  const off = AC.on(root, 'click', '[data-gsc-export]', () => gsc?.exportCSV());
  Promise.resolve(AC.use?.(['forms', 'chart', 'table', 'marketing'])).catch(() => {}).then(() => {
    if (dead) return;
    install(AC);
    gsc = AC.marketing.searchConsole(root.querySelector('[data-gsc]'), { range: '28d', load: (range, compare) => gscData(range, compare) });
  });
  return () => { dead = true; off(); gsc?.destroy(); };
}
