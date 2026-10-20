/* Mail page — lazy-loads the mail module (AC.use('mail') → src/modules/mail) on demo data. */
import { mailMe, mailContacts, mailLabels, mailThreads } from '../data.js';

export default function mount(root, AC) {
  let alive = true; let mail = null;
  const host = root.querySelector('[data-mail-host]');
  AC.use('mail').then(() => {
    if (!alive) return;
    mail = AC.mail(host, { me: mailMe, contacts: mailContacts, labels: mailLabels, threads: mailThreads });
  }, (err) => console.error('[demo] mail module failed', err));
  const offs = [AC.on(root, 'click', '[data-mail-compose]', () => mail?.compose())];
  return () => { alive = false; offs.forEach((f) => f()); mail?.destroy(); };
}
