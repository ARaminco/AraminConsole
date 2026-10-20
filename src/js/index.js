/* AraminConsole — entry. Imports every component, exposes window.AC and boots on DOMContentLoaded.
   Configure before boot with <html data-ac-icons="path/to/icons.svg"> (or "none"),
   or call AC.boot({ icons, i18n: { url: 'i18n/{lang}.json' } }) yourself with <html data-ac-manual>. */
import { AC, boot } from './core.js';
import './motion.js';
import './components/rail.js';
import './components/tabbar.js';
import './components/largetitle.js';
import './components/tabs.js';
import './components/palette.js';
import './components/press.js';
import './components/pull-refresh.js';
import './components/ring.js';
import './components/chart.js';
import './components/form-input.js';
import './components/form-select.js';
import './components/datepicker.js';
import './components/form-file.js';
import './components/form-validate.js';
import './components/position.js';
import './components/sheet.js';
import './components/modal.js';
import './components/drawer.js';
import './components/menu.js';
import './components/popover.js';
import './components/tooltip.js';
import './components/toast.js';
import './components/confirm.js';
import './components/alert.js';
import './components/notifications.js';
import './components/customizer.js';
import './components/langpicker.js';
import './components/list.js';
import './components/table.js';
import './components/accordion.js';
import './components/tree.js';
import './components/code.js';
import './components/logview.js';
import './components/kanban.js';
import './components/split.js';
import './components/money.js';
import './components/date.js';
import './components/bank.js';
import './components/bank-card.js';
import './loader.js';

export * from './core.js';
export { motion } from './motion.js';
export { rail } from './components/rail.js';
export { palette } from './components/palette.js';
export { press } from './components/press.js';
export { chart } from './components/chart.js';
export { combobox } from './components/form-select.js';
export { jalali } from './components/datepicker.js';
export { dropzone } from './components/form-file.js';
export { validate } from './components/form-validate.js';
export { position, autoPosition, portal, layers } from './components/position.js';
export { sheet } from './components/sheet.js';
export { modal } from './components/modal.js';
export { drawer } from './components/drawer.js';
export { menu } from './components/menu.js';
export { popover } from './components/popover.js';
export { tooltip } from './components/tooltip.js';
export { toast } from './components/toast.js';
export { confirm, prompt } from './components/confirm.js';
export { notifications } from './components/notifications.js';
export { customizer } from './components/customizer.js';
export { langpicker } from './components/langpicker.js';
export { swipeable } from './components/list.js';
export { table } from './components/table.js';
export { tree } from './components/tree.js';
export { json, copyText } from './components/code.js';
export { logview } from './components/logview.js';
export { kanban } from './components/kanban.js';
export { money } from './components/money.js';
export { date } from './components/date.js';
export { bank } from './components/bank.js';
export { bankCard } from './components/bank-card.js';
export { use } from './loader.js';

// default sprite location: next to the bundle (dist/icons.svg); from src/js → ../../dist/icons.svg
const here = import.meta.url;
AC.defaultIcons = new URL(/\/src\/js\/index\.js$/.test(here) ? '../../dist/icons.svg' : './icons.svg', here).href;

window.AC = AC;

if (!document.documentElement.hasAttribute('data-ac-manual')) {
  const start = () => boot({ icons: document.documentElement.dataset.acIcons || AC.defaultIcons });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}
