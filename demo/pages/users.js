/* Users page — full data table over demo/data.js */
import { users } from '../data.js';

const ROLE = { owner: 'users.role.owner', admin: 'users.role.admin', editor: 'users.role.editor', viewer: 'users.role.viewer', support: 'users.role.support', developer: 'users.role.developer' };
const ROLE_FA = { owner: 'مالک', admin: 'مدیر', editor: 'ویرایشگر', viewer: 'بیننده', support: 'پشتیبان', developer: 'توسعه‌دهنده' };

export default function mount(root, AC) {
  let rows = users.map((u) => ({ ...u }));
  const t = (k, f, v) => AC.t(k, f, v);
  const roleLabel = (r) => t(ROLE[r], ROLE_FA[r]);

  const counts = () => {
    const set = (k, v) => { const el = root.querySelector(`[data-users-count="${k}"]`); if (el) el.dataset.to = v; };
    const active = rows.filter((u) => u.status === 'active');
    set('all', rows.length); set('active', active.length); set('invited', rows.filter((u) => u.status === 'invited').length);
    set('2fa', Math.round((active.filter((u) => u.twoFactor).length / (active.length || 1)) * 100));
  };
  counts();

  const host = root.querySelector('[data-users-table]');
  const table = AC.table(host, {
    id: 'users', caption: t('nav.users', 'Users'), exportName: 'users',
    rows, pageSize: 10, selectable: true, sort: { key: 'joined', dir: 'desc' },
    columns: [
      { key: 'name', i18n: 'col.user', label: 'کاربر', type: 'avatar', sub: 'email', primary: true, hideable: false, text: (r) => `${r.name} ${r.email}`, csv: (r) => r.name },
      { key: 'email', i18n: 'col.email', label: 'ایمیل', hidden: true },
      { key: 'role', i18n: 'col.role', label: 'نقش', filter: 'select', text: (r) => roleLabel(r.role), options: Object.keys(ROLE).map((v) => ({ value: v, label: ROLE_FA[v], i18n: ROLE[v] })) },
      { key: 'team', i18n: 'col.team', label: 'تیم', filter: 'select' },
      { key: 'status', i18n: 'col.status', label: 'وضعیت', type: 'badge', filter: 'select', badges: {
        active: { tone: 'success', label: 'فعال', i18n: 'status.active' }, invited: { tone: 'warning', label: 'دعوت‌شده', i18n: 'status.invited' }, suspended: { tone: 'danger', label: 'معلق', i18n: 'status.suspended' } } },
      { key: 'completion', i18n: 'col.profile', label: 'پروفایل', type: 'progress', mobile: false },
      { key: 'spend', i18n: 'col.spend', label: 'خرید', type: 'money', currency: 'USD' },
      { key: 'joined', i18n: 'col.joined', label: 'عضویت', type: 'date', dateOptions: { year: 'numeric', month: '2-digit', day: '2-digit' } },
    ],
    actions: [
      { id: 'edit', icon: 'pencil', label: 'ویرایش', i18n: 'common.edit', tone: 'info' },
      { id: 'suspend', icon: 'ban', label: 'تعلیق', i18n: 'users.suspend', tone: 'warning', when: (r) => r.status !== 'suspended' && r.role !== 'owner' },
      { id: 'delete', icon: 'trash-2', label: 'حذف', i18n: 'common.delete', tone: 'danger', when: (r) => r.role !== 'owner' },
    ],
    bulkActions: [
      { id: 'activate', icon: 'user-check', label: 'فعال‌سازی', i18n: 'users.activate' },
      { id: 'mail', icon: 'mail', label: 'ایمیل', i18n: 'users.email' },
      { id: 'delete', icon: 'trash-2', label: 'حذف', i18n: 'common.delete', tone: 'danger' },
    ],
    expand: (r) => `<dl class="ac-dl ac-dl--cols-2">
      <div><dt>${AC.escapeHtml(t('col.email', 'Email'))}</dt><dd class="ac-ltr">${AC.escapeHtml(r.email)}</dd></div>
      <div><dt>${AC.escapeHtml(t('col.country', 'Country'))}</dt><dd>${AC.escapeHtml(r.country)}</dd></div>
      <div><dt>${AC.escapeHtml(t('col.lastSeen', 'Last seen'))}</dt><dd>${AC.escapeHtml(AC.format.relative(r.lastSeen))}</dd></div>
      <div><dt>${AC.escapeHtml(t('users.twoFactor', '2FA'))}</dt><dd>${r.twoFactor ? '✓' : '—'}</dd></div></dl>`,
  });

  const notify = (title, tone = 'success') => (AC.toast ? AC.toast({ title, tone }) : console.info(title));
  const apply = (ids, fn) => { const set = new Set(ids.map(String)); rows = rows.flatMap((u) => (set.has(String(u.id)) ? fn(u) : [u])); table.setRows(rows); counts(); };
  const ask = (o) => (AC.confirm ? AC.confirm(o) : Promise.resolve(true));

  const offs = [
    AC.on(host, 'ac:table:action', async (e) => {
      const { action, id, row } = e.detail;
      if (!row) return;
      if (action === 'edit') notify(t('users.editing', 'Editing {name}', { name: row.name }), 'info');
      else if (action === 'suspend') { apply([id], (u) => [{ ...u, status: 'suspended' }]); notify(t('users.suspended', '{name} suspended', { name: row.name }), 'warning'); }
      else if (action === 'delete' && await ask({ title: t('users.deleteOne', 'Delete {name}?', { name: row.name }), tone: 'danger' })) { apply([id], () => []); notify(t('users.deleted', 'Deleted')); }
    }),
    AC.on(host, 'ac:table:bulk', async (e) => {
      const { action, ids } = e.detail;
      if (action === 'activate') { apply(ids, (u) => [{ ...u, status: 'active' }]); table.clearSelection(); notify(t('users.activated', '{n} users activated', { n: ids.length })); }
      else if (action === 'mail') notify(t('users.mailed', 'Email queued for {n} users', { n: ids.length }), 'info');
      else if (action === 'delete' && await ask({ title: t('users.deleteMany', 'Delete {n} users?', { n: ids.length }), tone: 'danger' })) { apply(ids, () => []); table.clearSelection(); notify(t('users.deleted', 'Deleted')); }
    }),
    AC.on(root, 'click', '[data-users-export]', () => table.exportCSV('users')),
    AC.on(root, 'click', '[data-users-invite]', () => notify(t('users.inviteSent', 'Invitation link copied'), 'info')),
  ];
  return () => { offs.forEach((f) => f()); table.destroy(); };
}
