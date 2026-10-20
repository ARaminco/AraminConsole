/* Roles & permissions — role list, resources × actions matrix with row/column toggles, create role. */
import { roles as seedRoles, permResources, permActions, users } from '../data.js';

const ROLE_FA = { owner: 'مالک', admin: 'مدیر', editor: 'ویرایشگر', viewer: 'بیننده', support: 'پشتیبان', developer: 'توسعه‌دهنده' };
const RES_FA = { dashboard: 'داشبورد', users: 'کاربران', orders: 'سفارش‌ها', products: 'محصولات', invoices: 'فاکتورها', servers: 'سرورها', whatsapp: 'درگاه واتس‌اپ', ai: 'هوش مصنوعی', billing: 'صورتحساب', settings: 'تنظیمات' };
const ACT_FA = { view: 'مشاهده', create: 'ایجاد', edit: 'ویرایش', delete: 'حذف', export: 'خروجی' };
const clone = (perms) => Object.fromEntries(Object.entries(perms).map(([k, v]) => [k, new Set(v)]));

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  const roles = seedRoles.map((r) => ({ ...r, name: null, perms: clone(r.perms), saved: clone(r.perms) }));
  let cur = roles.find((r) => r.id === 'editor');
  const roleName = (r) => r.name || t(`users.role.${r.id}`, ROLE_FA[r.id] || r.id);
  const resName = (id) => t(`roles.res.${id}`, RES_FA[id]);
  const actName = (id) => t(`roles.act.${id}`, ACT_FA[id]);
  const count = (r) => Object.values(r.perms).reduce((a, s) => a + s.size, 0);
  const total = permResources.length * permActions.length;
  const dirty = (r) => permResources.some((x) => { const a = r.perms[x.id]; const b = r.saved[x.id]; return a.size !== b.size || [...a].some((v) => !b.has(v)); });

  function renderList() {
    $('[data-roles-list]').innerHTML = roles.map((r) => {
      const faces = users.filter((u) => u.role === r.id).slice(0, 3);
      return `<button class="roles-item" type="button" role="option" data-role="${r.id}" aria-selected="${r === cur}">
        <span class="ac-avatar ac-avatar--square" data-color="${r.color}">${AC.icon(r.id === 'owner' ? 'shield-check' : r.system ? 'shield' : 'user-cog')}</span>
        <span class="roles-item__main"><strong>${esc(roleName(r))}${dirty(r) ? '<i class="roles-item__dot" aria-hidden="true"></i>' : ''}</strong>
          <small>${esc(t('roles.members', '{n} عضو', { n: r.users }))} · <bdi>${count(r)}/${total}</bdi></small></span>
        <span class="ac-avatar-group">${faces.map((u) => `<span class="ac-avatar ac-avatar--xs" data-color="${u.color}">${esc(u.initials)}</span>`).join('')}</span>
        <progress class="ac-progress ac-progress--sm roles-item__bar" value="${count(r)}" max="${total}"></progress>
      </button>`;
    }).join('');
  }

  function renderMatrix() {
    const locked = cur.id === 'owner';
    $('[data-roles-title]').textContent = roleName(cur);
    $('[data-roles-sub]').textContent = t('roles.matrixSub', '{n} از {m} مجوز فعال', { n: count(cur), m: total });
    $('[data-roles-note]').hidden = !locked;
    $('[data-roles-head]').innerHTML = `<tr><th>${esc(t('roles.resource', 'بخش'))}</th>${permActions.map((a) => {
      const n = permResources.filter((x) => cur.perms[x.id].has(a)).length;
      return `<th class="ac-text-center"><label class="roles-colhead"><input class="ac-check" type="checkbox" data-col="${a}" ${n === permResources.length ? 'checked' : ''} ${n && n < permResources.length ? 'data-mixed' : ''} ${locked ? 'disabled' : ''} aria-label="${esc(actName(a))}: ${esc(t('ops.all', 'همه'))}"><span>${esc(actName(a))}</span></label></th>`;
    }).join('')}<th class="ac-text-center">${esc(t('roles.full', 'دسترسی کامل'))}</th></tr>`;
    $('[data-roles-body]').innerHTML = permResources.map((x) => {
      const s = cur.perms[x.id];
      return `<tr data-res="${x.id}"><th scope="row"><span class="roles-res"><span class="roles-res__icon">${AC.icon(x.icon)}</span>${esc(resName(x.id))}</span></th>
        ${permActions.map((a) => `<td class="ac-text-center" data-label="${esc(actName(a))}"><input class="ac-check" type="checkbox" data-res="${x.id}" data-act="${a}" ${s.has(a) ? 'checked' : ''} ${locked ? 'disabled' : ''} aria-label="${esc(resName(x.id))} — ${esc(actName(a))}"></td>`).join('')}
        <td class="ac-text-center roles-full"><input class="ac-switch" type="checkbox" role="switch" data-row="${x.id}" ${s.size === permActions.length ? 'checked' : ''} ${locked ? 'disabled' : ''} aria-label="${esc(resName(x.id))} — ${esc(t('roles.full', 'دسترسی کامل'))}"></td></tr>`;
    }).join('');
    for (const c of root.querySelectorAll('[data-mixed]')) c.indeterminate = true;
    $('[data-roles-save]').disabled = !dirty(cur);
  }
  const renderAll = () => { renderList(); renderMatrix(); };
  renderAll();

  const copySel = $('[data-roles-copy]');
  const roleForm = $('#role-form');
  function fillCopy() {
    copySel.innerHTML = `<option value="">${esc(t('roles.empty', 'بدون مجوز'))}</option>${roles.map((r) => `<option value="${r.id}">${esc(roleName(r))}</option>`).join('')}`;
  }
  fillCopy();

  const offs = [
    AC.on(root, 'click', '[data-role]', (e, b) => { cur = roles.find((r) => r.id === b.dataset.role); renderAll(); }),
    AC.on(root, 'keydown', '[data-role]', (e, b) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const i = roles.indexOf(cur) + (e.key === 'ArrowDown' ? 1 : -1);
      cur = roles[(i + roles.length) % roles.length]; renderAll();
      root.querySelector(`[data-role="${cur.id}"]`).focus();
    }),
    AC.on(root, 'change', '[data-act]', (e, c) => { const s = cur.perms[c.dataset.res]; c.checked ? s.add(c.dataset.act) : s.delete(c.dataset.act); if (!c.checked && c.dataset.act === 'view') s.clear(); if (c.checked && c.dataset.act !== 'view') s.add('view'); renderAll(); }),
    AC.on(root, 'change', '[data-row]', (e, c) => { cur.perms[c.dataset.row] = new Set(c.checked ? permActions : []); renderAll(); }),
    AC.on(root, 'change', '[data-col]', (e, c) => { for (const x of permResources) { const s = cur.perms[x.id]; if (c.checked) { s.add(c.dataset.col); s.add('view'); } else { s.delete(c.dataset.col); if (c.dataset.col === 'view') s.clear(); } } renderAll(); }),
    AC.on(root, 'click', '[data-roles-reset]', () => { cur.perms = clone(Object.fromEntries(Object.entries(cur.saved).map(([k, v]) => [k, [...v]]))); renderAll(); }),
    AC.on(root, 'click', '[data-roles-save]', () => {
      cur.saved = clone(Object.fromEntries(Object.entries(cur.perms).map(([k, v]) => [k, [...v]])));
      renderAll(); AC.toast?.({ title: t('roles.saved', 'مجوزهای «{name}» ذخیره شد', { name: roleName(cur) }), tone: 'success' });
    }),
    AC.on(roleForm, 'ac:form:submit', (e) => {
      const { name, copy } = e.detail.values;
      const src = roles.find((r) => r.id === copy);
      const perms = Object.fromEntries(permResources.map((x) => [x.id, src ? [...src.perms[x.id]] : []]));
      const r = { id: `custom-${Date.now().toString(36)}`, name, color: 7, users: 0, perms: clone(perms), saved: clone(perms) };
      roles.push(r); cur = r; renderAll(); fillCopy();
      AC.modal.close('#role-new'); e.target.reset?.();
      AC.toast?.({ title: t('roles.created', 'نقش «{name}» ساخته شد', { name }), tone: 'success' });
    }),
    AC.on(document, 'ac:i18n:change', () => { renderAll(); fillCopy(); }),
  ];
  return () => { offs.forEach((f) => f()); AC.modal.close('#role-new'); };
}
