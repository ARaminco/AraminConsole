/* Marketing overview (GA4-like) with a ticking realtime card — src/modules/marketing. Swap mkData()/mkRealtime() for GA4 Data API calls. */
import { install } from '../../src/modules/marketing/marketing.js';
import { mkData, mkRealtime } from '../data.js';

export default function mount(root, AC) {
  install(AC);
  const ov = AC.marketing.overview(root.querySelector('[data-mkt]'), { range: '28d', load: (range) => mkData(range), realtime: { load: mkRealtime, interval: 4000 } });
  return () => ov.destroy();
}
