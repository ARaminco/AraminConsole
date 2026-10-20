/*! AraminConsole v0.1.0 — module tickets — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');
if (!__R["table"]) await import('./table.js');
if (!__R["overlays"]) await import('./overlays.js');
if (!__R["forms"]) await import('./forms.js');
if (!__R["apps"]) await import('./apps.js');

/* ======== module: tickets ======== */
if (!__R["tickets"]) __R["tickets"] = (() => {
const F = {};

/* ---- modules/tickets/tickets.js ---- */
const __ac_m1o = F["modules/tickets/tickets.js"] = (() => {
/* Tickets module — help-desk inbox, ticket detail, create-ticket modal, SLA countdowns and customer tracking.
   Optional: include src/modules/tickets/{tickets.js,tickets.css} only in projects that need a help desk.
   AC.tickets.inbox(el, { tickets, agents, me, view, pageSize })          → { set, add, update, get, view, table, destroy }
   AC.tickets.detail(el, { ticket, agents, me, canned, macros, back, screen }) → { set, ticket, destroy }
   AC.tickets.create({ agents, categories, customer }) → Promise<ticket | null>   (modal; bottom sheet on phones)
   AC.tickets.track(el, ticket)            customer status timeline (new → in progress → answered → resolved)
   AC.tickets.sla(due, total?) → { text, tone, overdue, ratio } · chip helpers: statusChip priorityChip slaChip
   <span data-ac="sla" data-due="ISO" [data-total="minutes"]></span>   live SLA countdown chip
   Events (bubble from the element): ac:tickets:open {id, ticket} (cancelable) · ac:tickets:change {ticket, change}
   ac:tickets:reply {ticket, message} · ac:tickets:bulk {action, ids, value} · ac:tickets:create {ticket}
   Strings: built-in fa/en/ar; override any of them with app keys "tickets.<key>".
   Dependency-free: install(AC) wires it into window.AC (auto when window.AC exists); the stylesheet is injected once. */
let AC = null;
let on, emit, h, escapeHtml, icon, i18n, instance, reducedMotion, haptic, scan;
function cssOnce() {
  if (typeof document === 'undefined' || document.querySelector('[data-ac-module="tickets"]')) return;
  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = new URL('./tickets.css', (globalThis.__AC_MODS__?.__base || import.meta.url)).href; link.dataset.acModule = 'tickets';
    document.head.append(link);
  } catch { /* bundled builds ship the CSS themselves */ }
}

/* ------------------------------------------------------------------ strings */
const STR = {
  fa: {
    'status.new': 'جدید', 'status.open': 'باز', 'status.pending': 'در انتظار مشتری', 'status.resolved': 'حل‌شده', 'status.closed': 'بسته',
    'priority.urgent': 'فوری', 'priority.high': 'زیاد', 'priority.normal': 'معمولی', 'priority.low': 'کم',
    'channel.email': 'ایمیل', 'channel.chat': 'گفتگو', 'channel.phone': 'تلفن', 'channel.web': 'فرم سایت',
    'cat.billing': 'مالی و پرداخت', 'cat.technical': 'فنی', 'cat.account': 'حساب کاربری', 'cat.sales': 'فروش', 'cat.shipping': 'ارسال', 'cat.other': 'سایر',
    'view.all': 'همه', 'view.mine': 'مال من', 'view.unassigned': 'بدون مسئول', 'view.overdue': 'عقب‌افتاده',
    'col.subject': 'موضوع', 'col.customer': 'مشتری', 'col.priority': 'اولویت', 'col.status': 'وضعیت', 'col.assignee': 'مسئول', 'col.sla': 'مهلت SLA', 'col.updated': 'آخرین تغییر',
    'sla.left': '{t} مانده', 'sla.over': '{t} گذشته', 'sla.met': 'انجام شد', 'sla.metText': 'این تیکت در مهلت SLA بسته شد.', 'sla.title': 'مهلت پاسخ', 'sla.of': 'از {t}', 'sla.breached': 'مهلت تمام شده', 'sla.onTrack': 'در مسیر', 'sla.atRisk': 'در خطر',
    'u.d': ' روز', 'u.h': ' ساعت', 'u.m': ' دقیقه', 'u.and': ' و ',
    unassigned: 'بدون مسئول', reply: 'پاسخ به مشتری', note: 'یادداشت داخلی', send: 'ارسال', sendAnd: 'ارسال و تغییر وضعیت به «{s}»', addNote: 'ثبت یادداشت',
    canned: 'پاسخ‌های آماده', macros: 'ماکروها', attach: 'پیوست فایل', merge: 'ادغام', more: 'بیشتر', details: 'جزئیات', back: 'بازگشت', close: 'بستن',
    openFull: 'باز کردن در صفحهٔ کامل', properties: 'مشخصات', tags: 'برچسب‌ها', addTag: 'برچسب جدید…', customer: 'مشتری', prev: 'تیکت‌های قبلی: {n}',
    satisfaction: 'رضایت مشتری', noRating: 'هنوز امتیازی ثبت نشده.', askRating: 'درخواست امتیاز', ratingAsked: 'درخواست امتیاز برای مشتری ارسال شد.', ratingOf: '{n} از ۵',
    activity: 'گزارش فعالیت', typeReply: 'پاسخ خود را بنویسید… ( / برای پاسخ آماده)', typeCustomer: 'پیام خود را بنویسید…', typeNote: 'یادداشت فقط برای همکاران دیده می‌شود…',
    noteBadge: 'یادداشت داخلی', searchCanned: 'جستجوی پاسخ آماده…', noCanned: 'پاسخی پیدا نشد', you: 'شما', internal: 'فقط تیم می‌بیند',
    sent: 'پاسخ ارسال شد', noteAdded: 'یادداشت ثبت شد', merged: 'تیکت {a} در {b} ادغام شد', mergeTitle: 'ادغام تیکت', mergeText: 'پیام‌های این تیکت به تیکت انتخابی منتقل و این تیکت بسته می‌شود.', mergeInto: 'ادغام در…', noMerge: 'تیکت دیگری از این مشتری نیست.',
    assign: 'واگذاری', assignTo: 'واگذاری به…', assignMe: 'واگذاری به من', closeTicket: 'بستن تیکت', setPriority: 'تغییر اولویت',
    'sys.assigned': 'تیکت به {name} واگذار شد', 'sys.status': 'وضعیت به «{v}» تغییر کرد', 'sys.priority': 'اولویت به «{v}» تغییر کرد', 'sys.tag': 'برچسب «{v}» اضافه شد', 'sys.resolved': 'تیکت حل‌شده علامت خورد', 'sys.merged': 'تیکت {v} در این تیکت ادغام شد', 'sys.created': 'تیکت ثبت شد', 'sys.macro': 'ماکرو «{v}» اجرا شد', team: 'تیم پشتیبانی',
    created: 'ثبت', channel: 'کانال', category: 'دسته', id: 'شناسه',
    newTicket: 'تیکت جدید', newSub: 'از طرف مشتری یا برای پیگیری داخلی', subject: 'موضوع', message: 'شرح مشکل', customerName: 'نام مشتری', customerEmail: 'ایمیل مشتری', create: 'ثبت تیکت', cancel: 'انصراف',
    created1: 'تیکت {id} ثبت شد', 'track.new': 'ثبت شد', 'track.open': 'در حال بررسی', 'track.answered': 'پاسخ داده شد', 'track.resolved': 'حل شد', 'track.waiting': 'در انتظار', files: '{n} فایل', remove: 'حذف',
  },
  en: {
    'status.new': 'New', 'status.open': 'Open', 'status.pending': 'Awaiting customer', 'status.resolved': 'Resolved', 'status.closed': 'Closed',
    'priority.urgent': 'Urgent', 'priority.high': 'High', 'priority.normal': 'Normal', 'priority.low': 'Low',
    'channel.email': 'Email', 'channel.chat': 'Chat', 'channel.phone': 'Phone', 'channel.web': 'Web form',
    'cat.billing': 'Billing', 'cat.technical': 'Technical', 'cat.account': 'Account', 'cat.sales': 'Sales', 'cat.shipping': 'Shipping', 'cat.other': 'Other',
    'view.all': 'All', 'view.mine': 'Mine', 'view.unassigned': 'Unassigned', 'view.overdue': 'Overdue',
    'col.subject': 'Subject', 'col.customer': 'Customer', 'col.priority': 'Priority', 'col.status': 'Status', 'col.assignee': 'Assignee', 'col.sla': 'SLA', 'col.updated': 'Updated',
    'sla.left': '{t} left', 'sla.over': '{t} over', 'sla.met': 'Met', 'sla.metText': 'Closed within the SLA.', 'sla.title': 'Response due', 'sla.of': 'of {t}', 'sla.breached': 'Breached', 'sla.onTrack': 'On track', 'sla.atRisk': 'At risk',
    'u.d': 'd', 'u.h': 'h', 'u.m': 'm', 'u.and': ' ',
    unassigned: 'Unassigned', reply: 'Reply', note: 'Internal note', send: 'Send', sendAnd: 'Send and set “{s}”', addNote: 'Add note',
    canned: 'Canned replies', macros: 'Macros', attach: 'Attach file', merge: 'Merge', more: 'More', details: 'Details', back: 'Back', close: 'Close',
    openFull: 'Open full page', properties: 'Properties', tags: 'Tags', addTag: 'Add tag…', customer: 'Customer', prev: 'Previous tickets: {n}',
    satisfaction: 'Satisfaction', noRating: 'No rating yet.', askRating: 'Request rating', ratingAsked: 'Rating request sent to the customer.', ratingOf: '{n} of 5',
    activity: 'Activity', typeReply: 'Write a reply… ( / for canned replies)', typeCustomer: 'Write a message…', typeNote: 'Notes are visible to your team only…',
    noteBadge: 'Internal note', searchCanned: 'Search canned replies…', noCanned: 'No replies found', you: 'You', internal: 'Team only',
    sent: 'Reply sent', noteAdded: 'Note added', merged: '{a} merged into {b}', mergeTitle: 'Merge ticket', mergeText: 'Messages move to the selected ticket and this one is closed.', mergeInto: 'Merge into…', noMerge: 'No other tickets from this customer.',
    assign: 'Assign', assignTo: 'Assign to…', assignMe: 'Assign to me', closeTicket: 'Close ticket', setPriority: 'Set priority',
    'sys.assigned': 'Assigned to {name}', 'sys.status': 'Status changed to “{v}”', 'sys.priority': 'Priority changed to “{v}”', 'sys.tag': 'Tag “{v}” added', 'sys.resolved': 'Marked as resolved', 'sys.merged': '{v} was merged into this ticket', 'sys.created': 'Ticket created', 'sys.macro': 'Macro “{v}” applied', team: 'Support team',
    created: 'Created', channel: 'Channel', category: 'Category', id: 'ID',
    newTicket: 'New ticket', newSub: 'On behalf of a customer or for internal follow-up', subject: 'Subject', message: 'Describe the issue', customerName: 'Customer name', customerEmail: 'Customer email', create: 'Create ticket', cancel: 'Cancel',
    created1: 'Ticket {id} created', 'track.new': 'Submitted', 'track.open': 'In review', 'track.answered': 'Answered', 'track.resolved': 'Resolved', 'track.waiting': 'Waiting', files: '{n} files', remove: 'Remove',
  },
  ar: {
    'status.new': 'جديدة', 'status.open': 'مفتوحة', 'status.pending': 'بانتظار العميل', 'status.resolved': 'محلولة', 'status.closed': 'مغلقة',
    'priority.urgent': 'عاجلة', 'priority.high': 'عالية', 'priority.normal': 'عادية', 'priority.low': 'منخفضة',
    'channel.email': 'بريد', 'channel.chat': 'محادثة', 'channel.phone': 'هاتف', 'channel.web': 'نموذج الموقع',
    'cat.billing': 'الفوترة', 'cat.technical': 'تقني', 'cat.account': 'الحساب', 'cat.sales': 'المبيعات', 'cat.shipping': 'الشحن', 'cat.other': 'أخرى',
    'view.all': 'الكل', 'view.mine': 'تذاكري', 'view.unassigned': 'غير مسندة', 'view.overdue': 'متأخرة',
    'col.subject': 'الموضوع', 'col.customer': 'العميل', 'col.priority': 'الأولوية', 'col.status': 'الحالة', 'col.assignee': 'المسؤول', 'col.sla': 'مهلة SLA', 'col.updated': 'آخر تحديث',
    'sla.left': 'متبقٍ {t}', 'sla.over': 'متأخر {t}', 'sla.met': 'تم', 'sla.metText': 'أُغلقت ضمن مهلة SLA.', 'sla.title': 'مهلة الرد', 'sla.of': 'من {t}', 'sla.breached': 'انتهت المهلة', 'sla.onTrack': 'في الموعد', 'sla.atRisk': 'معرّضة للتأخير',
    'u.d': ' يوم', 'u.h': ' س', 'u.m': ' د', 'u.and': ' و',
    unassigned: 'غير مسندة', reply: 'رد على العميل', note: 'ملاحظة داخلية', send: 'إرسال', sendAnd: 'إرسال وتعيين «{s}»', addNote: 'إضافة ملاحظة',
    canned: 'ردود جاهزة', macros: 'إجراءات', attach: 'إرفاق ملف', merge: 'دمج', more: 'المزيد', details: 'التفاصيل', back: 'رجوع', close: 'إغلاق',
    openFull: 'فتح في صفحة كاملة', properties: 'الخصائص', tags: 'الوسوم', addTag: 'وسم جديد…', customer: 'العميل', prev: 'تذاكر سابقة: {n}',
    satisfaction: 'رضا العميل', noRating: 'لا يوجد تقييم بعد.', askRating: 'طلب تقييم', ratingAsked: 'أُرسل طلب التقييم إلى العميل.', ratingOf: '{n} من 5',
    activity: 'سجل النشاط', typeReply: 'اكتب ردك… ( / للردود الجاهزة)', typeCustomer: 'اكتب رسالتك…', typeNote: 'الملاحظات مرئية لفريقك فقط…',
    noteBadge: 'ملاحظة داخلية', searchCanned: 'ابحث في الردود…', noCanned: 'لا توجد ردود', you: 'أنت', internal: 'للفريق فقط',
    sent: 'تم إرسال الرد', noteAdded: 'تمت إضافة الملاحظة', merged: 'دُمجت {a} في {b}', mergeTitle: 'دمج التذكرة', mergeText: 'تنتقل الرسائل إلى التذكرة المختارة وتُغلق هذه.', mergeInto: 'دمج في…', noMerge: 'لا توجد تذاكر أخرى لهذا العميل.',
    assign: 'إسناد', assignTo: 'إسناد إلى…', assignMe: 'إسناد إليّ', closeTicket: 'إغلاق التذكرة', setPriority: 'تغيير الأولوية',
    'sys.assigned': 'أُسندت إلى {name}', 'sys.status': 'تغيّرت الحالة إلى «{v}»', 'sys.priority': 'تغيّرت الأولوية إلى «{v}»', 'sys.tag': 'أُضيف الوسم «{v}»', 'sys.resolved': 'وُضعت علامة محلولة', 'sys.merged': 'دُمجت {v} في هذه التذكرة', 'sys.created': 'أُنشئت التذكرة', 'sys.macro': 'نُفّذ الإجراء «{v}»', team: 'فريق الدعم',
    created: 'الإنشاء', channel: 'القناة', category: 'الفئة', id: 'المعرّف',
    newTicket: 'تذكرة جديدة', newSub: 'نيابة عن عميل أو للمتابعة الداخلية', subject: 'الموضوع', message: 'وصف المشكلة', customerName: 'اسم العميل', customerEmail: 'بريد العميل', create: 'إنشاء التذكرة', cancel: 'إلغاء',
    created1: 'أُنشئت التذكرة {id}', 'track.new': 'أُرسلت', 'track.open': 'قيد المراجعة', 'track.answered': 'تم الرد', 'track.resolved': 'تم الحل', 'track.waiting': 'بانتظار', files: '{n} ملفات', remove: 'حذف',
  },
};
const lang = () => (i18n.lang || 'fa').split('-')[0];
const t = (k, vars) => i18n.t(`tickets.${k}`, (STR[lang()] || STR.en)[k] ?? STR.en[k] ?? k, vars);
const esc = (v) => escapeHtml(v);

const STATUS = { new: 'info', open: 'accent', pending: 'warning', resolved: 'success', closed: 'neutral' };
const PRIORITY = { urgent: 'danger', high: 'warning', normal: 'info', low: 'neutral' };
const P_RANK = { urgent: 0, high: 1, normal: 2, low: 3 };
const CHANNEL_ICON = { email: 'mail', chat: 'message-circle', phone: 'phone', web: 'globe' };
const CATEGORIES = ['billing', 'technical', 'account', 'sales', 'shipping', 'other'];
const CAT_ICON = { billing: 'credit-card', technical: 'wrench', account: 'user-round', sales: 'shopping-bag', shipping: 'truck', other: 'circle-help' };
const isClosed = (tk) => tk.status === 'resolved' || tk.status === 'closed';
const num = (n) => AC.format.number(n);

/* ------------------------------------------------------------------ SLA */
function dur(ms) {
  const m = Math.max(0, Math.round(Math.abs(ms) / 60000));
  const d = Math.floor(m / 1440); const hh = Math.floor((m % 1440) / 60); const mm = m % 60;
  if (d) return `${num(d)}${t('u.d')}${hh ? `${t('u.and')}${num(hh)}${t('u.h')}` : ''}`;
  if (hh) return `${num(hh)}${t('u.h')}${mm ? `${t('u.and')}${num(mm)}${t('u.m')}` : ''}`;
  return `${num(mm)}${t('u.m')}`;
}
/** SLA state for a due date. total = SLA window in minutes (for the progress ratio). */
function sla(due, total) {
  if (!due) return { text: t('sla.met'), tone: 'neutral', overdue: false, ratio: 1, met: true };
  const left = new Date(due).getTime() - Date.now();
  const win = (Number(total) || 240) * 60000;
  const ratio = Math.max(0, Math.min(1, 1 - left / win));
  if (left < 0) return { text: t('sla.over', { t: dur(left) }), tone: 'danger', overdue: true, ratio: 1, left };
  return { text: t('sla.left', { t: dur(left) }), tone: left < Math.min(60 * 60000, win * 0.25) ? 'warning' : 'success', overdue: false, ratio, left };
}
const statusChip = (s) => `<span class="ac-tk-chip" data-tone="${STATUS[s] || 'neutral'}" data-kind="status">${esc(t(`status.${s}`))}</span>`;
const priorityChip = (p) => `<span class="ac-tk-prio" data-tone="${PRIORITY[p] || 'neutral'}" data-level="${esc(p)}"><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i>${esc(t(`priority.${p}`))}</span>`;
const slaChip = (tk) => (tk.due ? `<span class="ac-tk-sla" data-ac="sla" data-due="${esc(tk.due)}" data-total="${tk.slaTotal || ''}"></span>` : `<span class="ac-tk-sla" data-tone="neutral">${icon('check', 'ac-icon--sm')}${esc(t('sla.met'))}</span>`);

const slaEls = new Set();
let slaTimer = 0;
function paintSla(el) {
  const s = sla(el.dataset.due, el.dataset.total);
  el.dataset.tone = s.tone;
  el.toggleAttribute('data-overdue', s.overdue);
  const html = `${icon(s.overdue ? 'alarm-clock' : 'clock', 'ac-icon--sm')}<bdi>${esc(s.text)}</bdi>`;
  if (el.innerHTML !== html) el.innerHTML = html;
  el.setAttribute('title', AC.format.date(el.dataset.due, { dateStyle: 'medium', timeStyle: 'short' }));
}
const tickSla = () => slaEls.forEach(paintSla);
function slaInit(el) {
  el.classList.add('ac-tk-sla');
  paintSla(el); slaEls.add(el);
  if (!slaTimer) slaTimer = setInterval(tickSla, 20000);
  const off = on(document, 'ac:i18n:change', () => paintSla(el));
  return () => { off(); slaEls.delete(el); if (!slaEls.size) { clearInterval(slaTimer); slaTimer = 0; } };
}

/* ------------------------------------------------------------------ bits */
const agentOf = (agents, id) => agents.find((a) => a.id === id);
const avatar = (p, size = 'sm') => (p ? `<span class="ac-avatar ac-avatar--${size}" data-color="${p.color || 1}" aria-hidden="true">${esc(p.initials || (p.name || '?').slice(0, 2))}</span>` : `<span class="ac-avatar ac-avatar--${size} ac-tk-noone" aria-hidden="true">${icon('user-round')}</span>`);
const when = (d) => `<time datetime="${esc(d)}" title="${esc(AC.format.date(d, { dateStyle: 'medium', timeStyle: 'short' }))}">${esc(AC.format.relative(d))}</time>`;
const fileChip = (f, removable) => `<span class="ac-tk-file" data-type="${esc(f.type || 'file')}">${icon(f.type === 'image' ? 'image' : f.type === 'pdf' ? 'file-text' : 'paperclip')}<span class="ac-tk-file__name"><bdi>${esc(f.name)}</bdi></span><small class="ac-num">${esc(f.size || '')}</small>${removable ? `<button type="button" class="ac-tk-file__x" data-tk-unattach="${esc(f.name)}" aria-label="${esc(t('remove'))}">${icon('x')}</button>` : ''}</span>`;
const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const isPhone = () => matchMedia('(max-width: 639.98px)').matches;
const toast = (title, tone = 'success') => AC.toast?.({ title, tone });
const sys = (tk, key, vars) => { const m = { id: `${tk.id}-s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, from: 'system', text: key, vars, time: new Date().toISOString() }; tk.messages.push(m); tk.updated = m.time; return m; };

/* ------------------------------------------------------------------ inbox */
const VIEWS = ['all', 'mine', 'unassigned', 'overdue'];
function inbox(el, cfg = {}) {
  cfg = { tickets: [], agents: [], me: null, view: 'all', pageSize: 10, id: 'tickets', ...cfg };
  let list = cfg.tickets;
  let view = VIEWS.includes(cfg.view) ? cfg.view : 'all';
  const me = cfg.me || cfg.agents.find((a) => a.me)?.id;
  const inView = (tk, v = view) => (v === 'mine' ? tk.assignee === me && !isClosed(tk)
    : v === 'unassigned' ? !tk.assignee && !isClosed(tk)
      : v === 'overdue' ? !!tk.due && new Date(tk.due) < Date.now() && !isClosed(tk) : true);

  el.classList.add('ac-tk-inbox');
  el.innerHTML = `<div class="ac-tk-inbox__bar"><div class="ac-segmented ac-tk-views" data-ac="segmented" role="radiogroup" aria-label="${esc(t('col.status'))}">${VIEWS.map((v) => `<button class="ac-segmented__item" type="button" role="radio" data-value="${v}" aria-checked="${v === view}"><span data-tk-label="${v}"></span><span class="ac-tk-views__n ac-num" data-tk-count="${v}"></span></button>`).join('')}</div></div><div class="ac-tk-inbox__table"></div>`;
  const host = el.querySelector('.ac-tk-inbox__table');
  scan(el);

  const agentName = (id) => agentOf(cfg.agents, id)?.name || t('unassigned');
  const columns = () => [
    { key: 'subject', label: t('col.subject'), primary: true, hideable: false,
      text: (r) => `${r.id} ${r.subject} ${r.customer.name} ${r.customer.email} ${(r.tags || []).join(' ')}`, sortValue: (r) => r.subject, csv: (r) => `${r.id} ${r.subject}`,
      render: (r) => `<a class="ac-tk-subj" href="#/ticket?id=${encodeURIComponent(r.id)}" data-tk-open="${esc(r.id)}"><span class="ac-tk-subj__top"><bdi class="ac-tk-subj__id ac-mono">#${esc(r.id)}</bdi><span class="ac-tk-subj__ch" title="${esc(t(`channel.${r.channel}`))}">${icon(CHANNEL_ICON[r.channel] || 'inbox', 'ac-icon--sm')}</span>${r.messages?.length > 1 ? `<span class="ac-tk-subj__n ac-num">${icon('message-square', 'ac-icon--sm')}${num(r.messages.filter((m) => m.from !== 'system').length)}</span>` : ''}</span><span class="ac-tk-subj__title">${esc(r.subject)}</span></a>` },
    { key: 'customer', label: t('col.customer'), sortValue: (r) => r.customer.name, text: (r) => r.customer.name, csv: (r) => r.customer.email,
      render: (r) => `<span class="ac-tk-person">${avatar(r.customer, 'xs')}<span class="ac-truncate">${esc(r.customer.name)}</span></span>` },
    { key: 'priority', label: t('col.priority'), filter: 'select', sortValue: (r) => P_RANK[r.priority], text: (r) => t(`priority.${r.priority}`),
      options: Object.keys(PRIORITY).map((v) => ({ value: v, label: t(`priority.${v}`) })), render: (r) => priorityChip(r.priority) },
    { key: 'status', label: t('col.status'), filter: 'select', text: (r) => t(`status.${r.status}`),
      options: Object.keys(STATUS).map((v) => ({ value: v, label: t(`status.${v}`) })), render: (r) => statusChip(r.status) },
    { key: 'assignee', label: t('col.assignee'), filter: 'select', value: (r) => r.assignee || '', text: (r) => agentName(r.assignee),
      options: cfg.agents.map((a) => ({ value: a.id, label: a.name })),
      render: (r) => `<span class="ac-tk-person${r.assignee ? '' : ' ac-tk-person--none'}">${avatar(agentOf(cfg.agents, r.assignee), 'xs')}<span class="ac-truncate">${esc(agentName(r.assignee))}</span></span>` },
    { key: 'due', label: t('col.sla'), sortValue: (r) => (r.due ? new Date(r.due).getTime() : Infinity), csv: (r) => r.due || '', render: (r) => slaChip(r) },
    { key: 'updated', label: t('col.updated'), type: 'date', mobile: false, render: (r) => `<span class="ac-text-muted ac-text-sm">${when(r.updated)}</span>` },
  ];
  const tableCfg = () => ({
    id: cfg.id, rows: list.filter((r) => inView(r)), rowId: 'id', pageSize: cfg.pageSize, selectable: true, exportName: 'tickets',
    sort: { key: 'due', dir: 'asc' }, columns: columns(), caption: t('col.subject'),
    actions: [
      { id: 'assign-me', icon: 'user-check', label: t('assignMe'), tone: 'info', when: (r) => r.assignee !== me && !isClosed(r) },
      { id: 'close', icon: 'circle-check-big', label: t('closeTicket'), tone: 'success', when: (r) => !isClosed(r) },
    ],
    bulkActions: [
      { id: 'assign', icon: 'user-plus', label: t('assign') },
      { id: 'priority', icon: 'flag', label: t('setPriority') },
      { id: 'close', icon: 'circle-check-big', label: t('closeTicket') },
    ],
  });
  const table = AC.table(host, tableCfg());

  const counts = () => {
    for (const v of VIEWS) {
      const n = list.filter((r) => inView(r, v)).length;
      const c = el.querySelector(`[data-tk-count="${v}"]`);
      if (c && c.textContent !== num(n)) { c.textContent = num(n); if (c.dataset.seen) AC.motion?.bump?.(c); c.dataset.seen = '1'; }
      c?.toggleAttribute('data-alert', v === 'overdue' && n > 0);
      el.querySelector(`[data-tk-label="${v}"]`).textContent = t(`view.${v}`);
    }
  };
  const refresh = () => { table.setRows(list.filter((r) => inView(r))); counts(); };
  counts();

  const patch = (ids, fn, change) => {
    const set = new Set(ids.map(String));
    for (const tk of list) if (set.has(tk.id)) { fn(tk); emit(el, 'tickets:change', { ticket: tk, change }); }
    refresh();
  };
  const assignMenu = (anchor, ids) => AC.menu(anchor, [
    { heading: t('assignTo') },
    ...cfg.agents.map((a) => ({ label: a.name, icon: 'user-round', value: a.id, onSelect: () => { patch(ids, (tk) => { tk.assignee = a.id; if (tk.status === 'new') tk.status = 'open'; sys(tk, 'assigned', { name: a.name }); }, { assignee: a.id }); table.clearSelection(); toast(`${t('sys.assigned', { name: a.name })} · ${num(ids.length)}`); } })),
    '-', { label: t('unassigned'), icon: 'user-x', value: '', onSelect: () => { patch(ids, (tk) => { tk.assignee = null; }, { assignee: null }); table.clearSelection(); } },
  ], { placement: 'bottom-start' });

  const offs = [
    on(el, 'ac:segmented:change', (e) => { if (!e.target.classList.contains('ac-tk-views')) return; view = e.detail.value; table.setRows(list.filter((r) => inView(r))); table.page?.(1); }),
    on(el, 'click', '[data-tk-open]', (e, a) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      const tk = list.find((x) => x.id === a.dataset.tkOpen);
      if (!emit(el, 'tickets:open', { id: tk.id, ticket: tk }).defaultPrevented) return;
      e.preventDefault();
    }),
    on(host, 'ac:table:action', (e) => {
      const { action, id } = e.detail;
      if (action === 'assign-me') patch([id], (tk) => { tk.assignee = me; if (tk.status === 'new') tk.status = 'open'; sys(tk, 'assigned', { name: agentName(me) }); }, { assignee: me });
      if (action === 'close') patch([id], (tk) => { tk.status = 'closed'; tk.due = null; sys(tk, 'status', { v: t('status.closed') }); }, { status: 'closed' });
    }),
    on(host, 'ac:table:bulk', (e) => {
      const { action, ids } = e.detail;
      const anchor = host.querySelector(`[data-dt="bulk"][data-action="${action}"]`) || host;
      if (action === 'assign') assignMenu(anchor, ids);
      if (action === 'priority') AC.menu(anchor, Object.keys(PRIORITY).map((p) => ({ label: t(`priority.${p}`), value: p, onSelect: () => { patch(ids, (tk) => { tk.priority = p; sys(tk, 'priority', { v: t(`priority.${p}`) }); }, { priority: p }); table.clearSelection(); } })), { placement: 'bottom-start' });
      if (action === 'close') { patch(ids, (tk) => { tk.status = 'closed'; tk.due = null; }, { status: 'closed' }); table.clearSelection(); toast(`${t('closeTicket')} · ${num(ids.length)}`); }
      emit(el, 'tickets:bulk', { action, ids });
    }),
    on(document, 'ac:i18n:change', () => { table.setColumns?.(columns()); counts(); }),
  ];

  const api = {
    table, get tickets() { return list; }, get: (id) => list.find((x) => x.id === id),
    set(next) { list = next; refresh(); }, add(tk) { list.unshift(tk); refresh(); }, update(tk) { const i = list.findIndex((x) => x.id === tk.id); if (i > -1) list[i] = tk; refresh(); },
    view(v) { if (!VIEWS.includes(v)) return view; const i = VIEWS.indexOf(v); AC.instance(el.querySelector('.ac-tk-views'), 'segmented')?.select(i); return v; },
    refresh, destroy() { offs.forEach((f) => f()); table.destroy(); el.innerHTML = ''; el.classList.remove('ac-tk-inbox'); },
  };
  instance(el, 'tickets', api);
  return api;
}

/* ------------------------------------------------------------------ detail */
const SYS_ICON = { assigned: 'user-check', status: 'circle-dot', priority: 'flag', tag: 'tag', resolved: 'circle-check-big', merged: 'git-merge', created: 'ticket', macro: 'wand-sparkles' };
function msgHtml(m, tk, agents, isNew, view = 'agent') {
  const nw = isNew ? ' data-new' : '';
  if (view === 'customer' && m.from === 'note') return '';
  const mine = view === 'customer' ? m.from === 'customer' : m.from === 'agent';
  if (m.from === 'system') return `<div class="ac-tk-sys" data-id="${esc(m.id)}"${nw}>${icon(SYS_ICON[m.text] || 'info', 'ac-icon--sm')}<span>${esc(t(`sys.${m.text}`, m.vars || { name: agentOf(agents, tk.assignee)?.name || '', v: '' }))}</span>${when(m.time)}</div>`;
  const who = mine && view === 'customer' ? { ...tk.customer, name: t('you') } : m.from === 'customer' ? tk.customer : agentOf(agents, m.author) || { name: t('team'), initials: '•', color: 1 };
  const files = m.attachments?.length ? `<div class="ac-tk-files">${m.attachments.map((f) => fileChip(f)).join('')}</div>` : '';
  if (m.from === 'note') {
    return `<div class="ac-tk-note" data-id="${esc(m.id)}"${nw}><div class="ac-tk-note__head">${icon('lock', 'ac-icon--sm')}<b>${esc(t('noteBadge'))}</b><span>· ${esc(who.name)}</span>${when(m.time)}</div><p>${esc(m.text)}</p>${files}</div>`;
  }
  return `<div class="ac-tk-msg" data-from="${m.from}"${mine ? ' data-mine' : ''} data-id="${esc(m.id)}"${nw}>${avatar(who, 'sm')}<div class="ac-tk-msg__body"><div class="ac-tk-msg__meta"><b>${esc(who.name)}</b>${when(m.time)}</div><div class="ac-tk-bubble"><p>${esc(m.text)}</p></div>${files}</div></div>`;
}

function detail(el, cfg = {}) {
  cfg = { agents: [], canned: [], macros: [], tickets: [], back: false, screen: false, full: null, title: true, view: 'agent', ...cfg };
  const cust = cfg.view === 'customer';
  let tk = cfg.ticket;
  let mode = 'reply';
  let pending = [];
  const me = cfg.me || cfg.agents.find((a) => a.me)?.id;
  el.classList.add('ac-tk-detail');
  el.toggleAttribute('data-screen', !!cfg.screen);
  el.dataset.view = cfg.view;

  const sideHtml = () => {
    const s = sla(tk.due, tk.slaTotal);
    const others = cfg.tickets.filter((x) => x.customer.email === tk.customer.email && x.id !== tk.id);
    return `
    <section class="ac-tk-panel ac-tk-slacard" data-tone="${s.tone}"${s.met ? ' data-met' : ''}>
      <div class="ac-tk-panel__head"><h3>${icon('timer', 'ac-icon--sm')}${esc(t('sla.title'))}</h3><span class="ac-tk-chip" data-tone="${s.tone}">${esc(s.met ? t('sla.met') : s.overdue ? t('sla.breached') : s.tone === 'warning' ? t('sla.atRisk') : t('sla.onTrack'))}</span></div>
      <div class="ac-tk-slacard__clock ac-num" data-tk-clock aria-live="off">--:--</div>
      <div class="ac-tk-slacard__bar"><i data-tk-slabar></i></div>
      ${tk.due ? `<div class="ac-tk-slacard__foot"><span>${esc(AC.format.date(tk.due, { dateStyle: 'medium', timeStyle: 'short' }))}</span>${slaChip(tk)}</div>` : `<p class="ac-tk-slacard__met">${icon('circle-check-big')}<span>${esc(t('sla.metText'))}</span></p>`}
    </section>
    <section class="ac-tk-panel">
      <div class="ac-tk-panel__head"><h3>${esc(t('properties'))}</h3></div>
      <div class="ac-tk-props">
        <label class="ac-tk-prop"><span>${esc(t('col.status'))}</span><select class="ac-select" data-tk-prop="status">${Object.keys(STATUS).map((v) => `<option value="${v}"${v === tk.status ? ' selected' : ''}>${esc(t(`status.${v}`))}</option>`).join('')}</select></label>
        <label class="ac-tk-prop"><span>${esc(t('col.priority'))}</span><select class="ac-select" data-tk-prop="priority">${Object.keys(PRIORITY).map((v) => `<option value="${v}"${v === tk.priority ? ' selected' : ''}>${esc(t(`priority.${v}`))}</option>`).join('')}</select></label>
        <label class="ac-tk-prop"><span>${esc(t('col.assignee'))}</span><select class="ac-select" data-tk-prop="assignee"><option value="">${esc(t('unassigned'))}</option>${cfg.agents.map((a) => `<option value="${esc(a.id)}"${a.id === tk.assignee ? ' selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
        <div class="ac-tk-prop ac-tk-prop--ro"><span>${esc(t('category'))}</span><b>${icon(CAT_ICON[tk.category] || 'tag', 'ac-icon--sm')}${esc(t(`cat.${tk.category}`))}</b></div>
        <div class="ac-tk-prop ac-tk-prop--ro"><span>${esc(t('channel'))}</span><b>${icon(CHANNEL_ICON[tk.channel] || 'inbox', 'ac-icon--sm')}${esc(t(`channel.${tk.channel}`))}</b></div>
        <div class="ac-tk-prop ac-tk-prop--ro"><span>${esc(t('created'))}</span><b>${when(tk.created)}</b></div>
      </div>
      <div class="ac-tk-tags"><span class="ac-tk-tags__label">${esc(t('tags'))}</span>
        <div class="ac-tk-tags__list">${(tk.tags || []).map((g) => `<span class="ac-chip ac-tk-tag">${icon('tag', 'ac-icon--sm')}<bdi>${esc(g)}</bdi><button type="button" class="ac-chip__remove" data-tk-untag="${esc(g)}" aria-label="${esc(t('remove'))} ${esc(g)}">${icon('x')}</button></span>`).join('')}
        <input class="ac-tk-tags__input" data-tk-tag placeholder="${esc(t('addTag'))}" aria-label="${esc(t('addTag'))}" enterkeyhint="done"></div>
      </div>
    </section>
    <section class="ac-tk-panel">
      <div class="ac-tk-panel__head"><h3>${esc(t('customer'))}</h3></div>
      <div class="ac-tk-cust">${avatar(tk.customer, 'lg')}<div><b>${esc(tk.customer.name)}</b><a class="ac-ltr" href="mailto:${esc(tk.customer.email)}">${esc(tk.customer.email)}</a></div></div>
      ${others.length ? `<p class="ac-tk-muted">${esc(t('prev', { n: num(others.length) }))}</p>` : ''}
    </section>
    <section class="ac-tk-panel">
      <div class="ac-tk-panel__head"><h3>${esc(t('satisfaction'))}</h3></div>
      ${tk.csat ? `<div class="ac-tk-csat"><span class="ac-tk-csat__face" data-score="${tk.csat}">${icon(tk.csat >= 4 ? 'smile' : tk.csat === 3 ? 'meh' : 'frown')}</span><div class="ac-rating" data-ac="rating" data-value="${tk.csat}" data-readonly></div><b class="ac-num">${esc(t('ratingOf', { n: num(tk.csat) }))}</b></div>`
    : `<div class="ac-tk-csat ac-tk-csat--empty"><span class="ac-tk-muted">${esc(t('noRating'))}</span><button type="button" class="ac-btn ac-btn--sm" data-tk-ask-rating ${isClosed(tk) ? '' : 'disabled'}>${icon('star')}<span>${esc(t('askRating'))}</span></button></div>`}
    </section>
    <section class="ac-tk-panel">
      <div class="ac-tk-panel__head"><h3>${esc(t('activity'))}</h3></div>
      <ol class="ac-tk-log">${tk.messages.slice().reverse().slice(0, 6).map((m) => `<li data-from="${m.from}"><i aria-hidden="true"></i><span>${esc(m.from === 'system' ? t(`sys.${m.text}`, m.vars || { name: agentOf(cfg.agents, tk.assignee)?.name || '', v: '' }) : `${m.from === 'customer' ? tk.customer.name : (agentOf(cfg.agents, m.author)?.name || t('you'))} · ${m.from === 'note' ? t('noteBadge') : t('reply')}`)}</span>${when(m.time)}</li>`).join('')}</ol>
    </section>`;
  };

  const headHtml = () => `
    <header class="ac-tk-conv__head">
      ${cfg.back ? `<button type="button" class="ac-btn ac-btn--icon ac-btn--ghost ac-tk-back" ${cfg.back === 'close' ? 'data-ac-close' : 'data-split-back'} aria-label="${esc(cfg.back === 'close' ? t('close') : t('back'))}">${icon(cfg.back === 'close' ? 'x' : 'chevron-left', cfg.back === 'close' ? '' : 'ac-flip-rtl')}</button>` : ''}
      <div class="ac-tk-conv__titles">
        ${cfg.title ? `<div class="ac-tk-conv__eyebrow"><bdi class="ac-mono">#${esc(tk.id)}</bdi><span>·</span>${icon(CHANNEL_ICON[tk.channel] || 'inbox', 'ac-icon--sm')}<span>${esc(t(`channel.${tk.channel}`))}</span></div>
        <h2 class="ac-tk-conv__title">${esc(tk.subject)}</h2>` : ''}
        <div class="ac-tk-conv__chips">${statusChip(tk.status)}${cust ? '' : priorityChip(tk.priority) + slaChip(tk)}</div>
      </div>
      <div class="ac-tk-conv__tools">
        ${cfg.full ? `<a class="ac-btn ac-btn--icon ac-btn--ghost" href="${esc(cfg.full)}" aria-label="${esc(t('openFull'))}" data-ac-tooltip="${esc(t('openFull'))}">${icon('external-link')}</a>` : ''}
        ${cust ? '' : `<button type="button" class="ac-btn ac-btn--icon ac-btn--ghost" data-tk-merge aria-label="${esc(t('merge'))}" data-ac-tooltip="${esc(t('merge'))}">${icon('git-merge')}</button>
        <button type="button" class="ac-btn ac-btn--icon ac-btn--ghost ac-tk-details-btn" data-tk-details aria-label="${esc(t('details'))}" data-ac-tooltip="${esc(t('details'))}">${icon('panel-right', 'ac-flip-rtl')}</button>`}
      </div>
    </header>`;

  const composerHtml = () => `
    <form class="ac-tk-composer" data-mode="${mode}" novalidate>
      ${cust ? '' : `<div class="ac-tk-composer__modes" role="tablist">
        <button type="button" role="tab" data-tk-mode="reply" aria-selected="${mode === 'reply'}">${icon('reply', 'ac-icon--sm ac-flip-rtl')}<span>${esc(t('reply'))}</span></button>
        <button type="button" role="tab" data-tk-mode="note" aria-selected="${mode === 'note'}">${icon('lock', 'ac-icon--sm')}<span>${esc(t('note'))}</span></button>
        <span class="ac-tk-composer__hint">${mode === 'note' ? esc(t('internal')) : ''}</span>
      </div>`}
      <div class="ac-tk-composer__box">
        <textarea class="ac-tk-composer__input" rows="2" name="text" placeholder="${esc(cust ? t('typeCustomer') : mode === 'note' ? t('typeNote') : t('typeReply'))}" aria-label="${esc(mode === 'note' ? t('note') : t('reply'))}"></textarea>
        <div class="ac-tk-files ac-tk-composer__files" data-tk-files></div>
        <div class="ac-tk-composer__bar">
          <div class="ac-tk-composer__tools">
            <label class="ac-btn ac-btn--icon ac-btn--ghost ac-btn--sm" data-ac-tooltip="${esc(t('attach'))}"><input type="file" multiple class="ac-visually-hidden" data-tk-attach aria-label="${esc(t('attach'))}">${icon('paperclip')}</label>
            ${cust ? '' : `<button type="button" class="ac-btn ac-btn--icon ac-btn--ghost ac-btn--sm" data-tk-canned aria-label="${esc(t('canned'))}" data-ac-tooltip="${esc(t('canned'))}" aria-haspopup="dialog">${icon('message-square-text')}</button>
            <button type="button" class="ac-btn ac-btn--icon ac-btn--ghost ac-btn--sm" data-tk-macros aria-label="${esc(t('macros'))}" data-ac-tooltip="${esc(t('macros'))}" aria-haspopup="menu">${icon('wand-sparkles')}</button>`}
          </div>
          <div class="ac-tk-composer__send">
            <button type="submit" class="ac-btn ac-btn--primary ac-btn--sm" data-tk-send>${icon(mode === 'note' ? 'lock' : 'send', 'ac-icon--sm ac-flip-rtl')}<span>${esc(mode === 'note' ? t('addNote') : t('send'))}</span></button>
            ${mode === 'reply' && !cust ? `<button type="button" class="ac-btn ac-btn--primary ac-btn--sm ac-btn--icon ac-tk-send-more" data-tk-send-more aria-label="${esc(t('more'))}" aria-haspopup="menu">${icon('chevron-down')}</button>` : ''}
          </div>
        </div>
      </div>
    </form>`;

  el.innerHTML = `<div class="ac-tk-detail__grid"><section class="ac-tk-conv">${headHtml()}<div class="ac-tk-thread" role="log" aria-live="polite" tabindex="0"></div>${isClosed(tk) && cust ? '' : composerHtml()}</section>${cust ? '' : `<aside class="ac-tk-side" aria-label="${esc(t('details'))}"></aside>`}</div>`;
  const grid = el.querySelector('.ac-tk-detail__grid');
  const conv = el.querySelector('.ac-tk-conv');
  const thread = el.querySelector('.ac-tk-thread');
  let side = el.querySelector('.ac-tk-side') || h('div');

  const renderThread = () => { thread.innerHTML = tk.messages.map((m) => msgHtml(m, tk, cfg.agents, false, cfg.view)).join(''); if (cfg.intro) thread.prepend(cfg.intro); scrollEnd(true); };
  const scrollEnd = (instant) => requestAnimationFrame(() => {
    const target = thread.scrollHeight;
    if (thread.scrollHeight > thread.clientHeight + 2) thread.scrollTo({ top: target, behavior: instant || reducedMotion() ? 'instant' : 'smooth' });
    else if (!cfg.screen && !instant) el.querySelector('.ac-tk-composer')?.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'instant' : 'smooth' });
  });
  const renderSide = () => { if (cust) return; side.innerHTML = sideHtml(); scan(side); clock(); };
  const renderHead = () => { conv.querySelector('.ac-tk-conv__head').outerHTML = headHtml(); scan(conv.querySelector('.ac-tk-conv__head')); };
  const append = (m) => { thread.insertAdjacentHTML('beforeend', msgHtml(m, tk, cfg.agents, true, cfg.view)); scrollEnd(); };

  function clock() {
    const c = side.querySelector('[data-tk-clock]'); const bar = side.querySelector('[data-tk-slabar]');
    if (!c) return;
    const s = sla(tk.due, tk.slaTotal);
    if (s.met) return;
    const ms = Math.abs(s.left); const hh = Math.floor(ms / 3600000); const mm = Math.floor((ms % 3600000) / 60000); const ss = Math.floor((ms % 60000) / 1000);
    const two = (n) => String(n).padStart(2, '0');
    c.textContent = `${s.overdue ? '−' : ''}${two(hh)}:${two(mm)}:${two(ss)}`;
    c.closest('.ac-tk-slacard').dataset.tone = s.tone;
    bar.style.transform = `scaleX(${s.ratio.toFixed(3)})`;
  }
  const clockT = setInterval(clock, 1000);

  const change = (patchObj, sysKey, vars) => {
    Object.assign(tk, patchObj);
    if (patchObj.status && isClosed(tk)) tk.due = null;
    if (sysKey) append(sys(tk, sysKey, vars));
    renderHead(); renderSide();
    emit(el, 'tickets:change', { ticket: tk, change: patchObj });
  };
  const send = (statusAfter) => {
    const form = el.querySelector('.ac-tk-composer');
    const ta = form.querySelector('textarea');
    const text = ta.value.trim();
    if (!text && !pending.length) { ta.focus(); form.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: reducedMotion() ? 0 : 260 }); return; }
    const m = { id: `${tk.id}-m${Date.now().toString(36)}`, from: cust ? 'customer' : mode === 'note' ? 'note' : 'agent', author: cust ? null : me, text, time: new Date().toISOString(), attachments: pending };
    tk.messages.push(m); tk.updated = m.time;
    append(m);
    ta.value = ''; ta.style.height = ''; pending = []; renderFiles();
    haptic(6);
    emit(el, 'tickets:reply', { ticket: tk, message: m });
    toast(mode === 'note' ? t('noteAdded') : t('sent'), mode === 'note' ? 'info' : 'success');
    if (!cust && mode === 'reply' && tk.status === 'new') change({ status: 'open' });
    if (statusAfter) change({ status: statusAfter }, 'status', { v: t(`status.${statusAfter}`) });
    else renderSide();
  };
  const renderFiles = () => { const box = el.querySelector('[data-tk-files]'); if (box) box.innerHTML = pending.map((f) => fileChip(f, true)).join(''); };
  const setMode = (m) => {
    mode = m;
    const keep = el.querySelector('.ac-tk-composer textarea')?.value || '';
    el.querySelector('.ac-tk-composer').outerHTML = composerHtml();
    const ta = el.querySelector('.ac-tk-composer textarea'); ta.value = keep; renderFiles(); ta.focus();
  };
  const insert = (text) => {
    const ta = el.querySelector('.ac-tk-composer textarea');
    const v = text.replace('{name}', tk.customer.name.split(' ')[0]);
    ta.value = ta.value.replace(/\/\S*$/, '').trimEnd(); ta.value = ta.value ? `${ta.value}\n${v}` : v;
    ta.dispatchEvent(new Event('input', { bubbles: true })); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
  };
  function cannedPicker(anchor, q = '') {
    const box = h('div', { class: 'ac-tk-canned' });
    box.innerHTML = `<label class="ac-searchpill ac-tk-canned__search">${icon('search')}<input type="search" placeholder="${esc(t('searchCanned'))}" aria-label="${esc(t('searchCanned'))}" value="${esc(q)}" autofocus></label><div class="ac-tk-canned__list" role="listbox" aria-label="${esc(t('canned'))}"></div>`;
    const listEl = box.querySelector('.ac-tk-canned__list'); const input = box.querySelector('input');
    const norm = (s) => s.toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    const paint = () => {
      const qq = norm(input.value.trim());
      const items = cfg.canned.filter((c) => !qq || norm(`${c.title} ${c.text}`).includes(qq));
      listEl.innerHTML = items.length ? items.map((c, i) => `<button type="button" role="option" class="ac-tk-canned__item" data-canned="${esc(c.id)}" aria-selected="${i === 0}"><b>${esc(c.title)}</b><span class="ac-clamp-2">${esc(c.text)}</span></button>`).join('') : `<p class="ac-tk-muted ac-tk-canned__none">${esc(t('noCanned'))}</p>`;
    };
    paint();
    let layer;
    const pick = (id) => { const c = cfg.canned.find((x) => x.id === id); if (!c) return; layer?.close('select'); setTimeout(() => insert(c.text), 0); };
    box.addEventListener('input', paint);
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-canned]'); if (b) pick(b.dataset.canned); });
    box.addEventListener('keydown', (e) => {
      const opts = [...listEl.querySelectorAll('[data-canned]')]; let i = opts.findIndex((o) => o.getAttribute('aria-selected') === 'true');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); i = (i + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; opts.forEach((o, j) => o.setAttribute('aria-selected', String(j === i))); opts[i]?.scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter' && opts[i]) { e.preventDefault(); pick(opts[i].dataset.canned); }
    });
    layer = isPhone() ? AC.sheet.open({ title: t('canned'), content: box, className: 'ac-tk-canned-sheet' }) : AC.popover.show(anchor, { content: box, placement: 'top-start', className: 'ac-tk-canned-pop', label: t('canned') });
  }
  const runMacro = (mc) => {
    const p = { ...(mc.set || {}) };
    if (mc.tag && !(tk.tags || []).includes(mc.tag)) p.tags = [...(tk.tags || []), mc.tag];
    change(p, 'macro', { v: mc.title });
    if (mc.reply) { const c = cfg.canned.find((x) => x.id === mc.reply); if (c) { if (mode !== 'reply') setMode('reply'); insert(c.text); } }
    if (mc.note) { const m = { id: `${tk.id}-n${Date.now().toString(36)}`, from: 'note', author: me, text: mc.note, time: new Date().toISOString(), attachments: [] }; tk.messages.push(m); append(m); }
    toast(t('sys.macro', { v: mc.title }), 'info');
  };
  const openDetails = () => {
    const sheetEl = AC.sheet.open({ title: t('details'), content: side, className: 'ac-tk-side-sheet', snap: [0.6, 0.94] });
    const layerEl = side.closest('.ac-sheet');
    layerEl?.addEventListener('ac:sheet:closed', () => { grid.append(side); }, { once: true });
    return sheetEl;
  };
  const merge = (anchor) => {
    const others = cfg.tickets.filter((x) => x.customer.email === tk.customer.email && x.id !== tk.id && !x.merged);
    if (!others.length) { toast(t('noMerge'), 'info'); return; }
    AC.menu(anchor, [{ heading: t('mergeInto') }, ...others.map((o) => ({ label: `#${o.id} · ${o.subject}`, icon: 'ticket', onSelect: async () => {
      if (AC.confirm && !(await AC.confirm({ title: t('mergeTitle'), text: t('mergeText'), confirmText: t('merge'), tone: 'warning' }))) return;
      o.messages.push(...tk.messages.filter((m) => m.from !== 'system')); sys(o, 'merged', { v: `#${tk.id}` });
      tk.merged = o.id; change({ status: 'closed' }, 'status', { v: t('status.closed') });
      toast(t('merged', { a: `#${tk.id}`, b: `#${o.id}` }));
      emit(el, 'tickets:merge', { ticket: tk, into: o });
    } }))], { placement: 'bottom-end' });
  };

  const offs = [
    on(el, 'click', '[data-tk-mode]', (e, b) => { if (b.dataset.tkMode !== mode) setMode(b.dataset.tkMode); }),
    on(el, 'submit', '.ac-tk-composer', (e) => { e.preventDefault(); send(); }),
    on(el, 'keydown', '.ac-tk-composer textarea', (e, ta) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); }
      if (e.key === '/' && !ta.value.trim() && !cust) { e.preventDefault(); cannedPicker(el.querySelector('[data-tk-canned]')); }
    }),
    on(el, 'input', '.ac-tk-composer textarea', (e, ta) => { ta.style.height = 'auto'; ta.style.height = `${Math.min(ta.scrollHeight, 220)}px`; }),
    on(el, 'change', '[data-tk-attach]', (e, input) => { pending.push(...[...input.files].map((f) => ({ name: f.name, size: fmtSize(f.size), type: f.type.startsWith('image/') ? 'image' : /pdf/.test(f.type) ? 'pdf' : 'file' }))); input.value = ''; renderFiles(); }),
    on(el, 'click', '[data-tk-unattach]', (e, b) => { pending = pending.filter((f) => f.name !== b.dataset.tkUnattach); renderFiles(); }),
    on(el, 'click', '[data-tk-canned]', (e, b) => cannedPicker(b)),
    on(el, 'click', '[data-tk-macros]', (e, b) => AC.menu(b, [{ heading: t('macros') }, ...cfg.macros.map((mc) => ({ label: mc.title, icon: mc.icon || 'wand-sparkles', onSelect: () => runMacro(mc) }))], { placement: 'top-start' })),
    on(el, 'click', '[data-tk-send-more]', (e, b) => AC.menu(b, ['pending', 'resolved', 'closed'].map((s) => ({ label: t('sendAnd', { s: t(`status.${s}`) }), icon: s === 'pending' ? 'hourglass' : 'circle-check-big', onSelect: () => send(s) })), { placement: 'top-end' })),
    on(el, 'click', '[data-tk-merge]', (e, b) => merge(b)),
    on(el, 'click', '[data-tk-details]', () => openDetails()),
    on(el, 'change', '[data-tk-prop]', (e, s) => {
      const k = s.dataset.tkProp; const v = s.value || null;
      if (k === 'assignee') change({ assignee: v }, 'assigned', { name: agentOf(cfg.agents, v)?.name || t('unassigned') });
      else change({ [k]: v }, k, { v: t(`${k}.${v}`) });
    }),
    on(el, 'keydown', '[data-tk-tag]', (e, input) => {
      if (e.key !== 'Enter' && e.key !== ',') return;
      e.preventDefault(); const v = input.value.trim().replace(/,$/, '');
      if (!v || (tk.tags || []).includes(v)) { input.value = ''; return; }
      change({ tags: [...(tk.tags || []), v] }, 'tag', { v });
      side.querySelector('[data-tk-tag]')?.focus();
    }),
    on(el, 'click', '[data-tk-untag]', (e, b) => change({ tags: (tk.tags || []).filter((g) => g !== b.dataset.tkUntag) })),
    on(el, 'click', '[data-tk-ask-rating]', () => toast(t('ratingAsked'), 'info')),
    on(document, 'ac:i18n:change', () => { renderHead(); renderThread(); renderSide(); setMode(mode); }),
  ];
  renderThread(); renderSide();
  scan(el);

  const api = {
    get ticket() { return tk; },
    set(next) { tk = next; pending = []; renderHead(); renderThread(); renderSide(); setMode('reply'); el.querySelector('.ac-tk-composer textarea')?.blur(); },
    update(p) { const k = Object.keys(p)[0]; change(p, k === 'assignee' ? 'assigned' : k, k === 'assignee' ? { name: agentOf(cfg.agents, p[k])?.name || t('unassigned') } : { v: t(`${k}.${p[k]}`) }); },
    receive(m) { tk.messages.push(m); tk.updated = m.time; append(m); renderSide(); },
    destroy() { clearInterval(clockT); offs.forEach((f) => f()); if (!el.contains(side)) side.remove(); el.innerHTML = ''; el.classList.remove('ac-tk-detail'); },
  };
  instance(el, 'ticket', api);
  return api;
}

/* ------------------------------------------------------------------ create */
let seq = 2000;
function create(cfg = {}) {
  const agents = cfg.agents || [];
  const fid = `tkc${(seq++).toString(36)}`;
  const content = `<form class="ac-form ac-tk-create" data-ac="form" id="${fid}" novalidate>
    <div class="ac-tk-create__cats" role="radiogroup" aria-label="${esc(t('category'))}">${CATEGORIES.map((c, i) => `<label class="ac-tk-cat"><input type="radio" name="category" value="${c}"${i === 0 ? ' checked' : ''}><span>${icon(CAT_ICON[c])}<b>${esc(t(`cat.${c}`))}</b></span></label>`).join('')}</div>
    <div class="ac-form-grid">
      <div class="ac-field"><label class="ac-label" for="${fid}-n">${esc(t('customerName'))}</label><input class="ac-input" id="${fid}-n" name="name" data-ac-rules="required|min:2" value="${esc(cfg.customer?.name || '')}"></div>
      <div class="ac-field"><label class="ac-label" for="${fid}-e">${esc(t('customerEmail'))}</label><input class="ac-input ac-ltr" id="${fid}-e" name="email" type="email" data-ac-rules="required|email" value="${esc(cfg.customer?.email || '')}"></div>
      <div class="ac-field ac-span-full"><label class="ac-label" for="${fid}-s">${esc(t('subject'))}</label><input class="ac-input" id="${fid}-s" name="subject" data-ac-rules="required|min:4" autocomplete="off"></div>
      <div class="ac-field"><label class="ac-label" for="${fid}-p">${esc(t('col.priority'))}</label><select class="ac-select" id="${fid}-p" name="priority">${Object.keys(PRIORITY).map((p) => `<option value="${p}"${p === 'normal' ? ' selected' : ''}>${esc(t(`priority.${p}`))}</option>`).join('')}</select></div>
      <div class="ac-field"><label class="ac-label" for="${fid}-a">${esc(t('col.assignee'))}</label><select class="ac-select" id="${fid}-a" name="assignee"><option value="">${esc(t('unassigned'))}</option>${agents.map((a) => `<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('')}</select></div>
      <div class="ac-field ac-span-full"><label class="ac-label" for="${fid}-m">${esc(t('message'))}</label><textarea class="ac-input" id="${fid}-m" name="message" rows="4" data-ac-rules="required|min:10"></textarea></div>
    </div></form>`;
  const footer = `<button type="button" class="ac-btn" data-ac-close>${esc(t('cancel'))}</button><button type="submit" form="${fid}" class="ac-btn ac-btn--primary">${icon('plus')}<span>${esc(t('create'))}</span></button>`;
  return new Promise((resolve) => {
    let done = null;
    const layer = AC.modal.open({ title: t('newTicket'), sub: t('newSub'), content, footer, size: 'lg', initial: `#${fid}-n`, className: 'ac-tk-create-modal' });
    const form = document.getElementById(fid);
    const modalEl = form.closest('.ac-modal');
    form.addEventListener('ac:form:submit', (e) => {
      const v = e.detail.values;
      const now = new Date().toISOString();
      const id = cfg.nextId ? cfg.nextId() : `T-${1049 + Math.floor(Math.random() * 900)}`;
      const total = { urgent: 60, high: 240, normal: 480, low: 1440 }[v.priority] || 480;
      done = { id, subject: v.subject, customer: { name: v.name, email: v.email, initials: v.name.trim().slice(0, 2), color: 1 + (v.name.length % 8) },
        channel: 'web', category: v.category || 'other', priority: v.priority, status: v.assignee ? 'open' : 'new', assignee: v.assignee || null, tags: [],
        created: now, updated: now, due: new Date(Date.now() + total * 60000).toISOString(), slaTotal: total, csat: null,
        messages: [{ id: `${id}-m0`, from: 'customer', text: v.message, time: now, attachments: [] }] };
      sys(done, 'created');
      emit(document, 'tickets:create', { ticket: done });
      toast(t('created1', { id: `#${id}` }));
      layer?.close?.('submit') ?? AC.modal.close(modalEl);
    });
    modalEl.addEventListener('ac:modal:closed', () => resolve(done), { once: true });
  });
}

/* ------------------------------------------------------------------ customer tracking */
function track(el, tk) {
  const answered = tk.messages.some((m) => m.from === 'agent');
  const steps = [
    ['new', 'ticket', true, tk.created],
    ['open', 'search', tk.status !== 'new', tk.messages.find((m) => m.from === 'system' && m.text === 'assigned')?.time],
    ['answered', 'message-circle', answered, tk.messages.find((m) => m.from === 'agent')?.time],
    ['resolved', 'circle-check-big', isClosed(tk), isClosed(tk) ? tk.updated : null],
  ];
  const cur = steps.reduce((n, s, i) => (s[2] ? i : n), 0);
  el.classList.add('ac-tk-track');
  el.innerHTML = `<ol class="ac-tk-track__list">${steps.map(([k, ic, ok, at], i) => `<li class="ac-tk-track__step" data-state="${i < cur ? 'done' : i === cur ? (isClosed(tk) ? 'done' : 'current') : 'todo'}"><span class="ac-tk-track__dot">${icon(i < cur || (i === cur && isClosed(tk)) ? 'check' : ic, 'ac-icon--sm')}</span><span class="ac-tk-track__text"><b>${esc(t(`track.${k}`))}</b>${at ? `<small>${esc(AC.format.date(at, { dateStyle: 'medium', timeStyle: 'short' }))}</small>` : `<small>${esc(i === cur + 1 && tk.status === 'pending' ? t('track.waiting') : '—')}</small>`}</span></li>`).join('')}</ol>`;
  return el;
}

const tickets = { inbox, detail, create, track, sla, statusChip, priorityChip, slaChip, t, STATUS, PRIORITY, CATEGORIES };

/** Wire the module into an AC instance: AC.tickets.* + declarative data-ac="sla". Dependency-free (no core import). */
function install(ac) {
  if (!ac || ac.tickets) return ac?.tickets;
  AC = ac;
  ({ on, emit, h, escapeHtml, icon, i18n, instance, reducedMotion, haptic, scan } = ac);
  cssOnce();
  ac.register('sla', slaInit);
  ac.tickets = tickets;
  return tickets;
}

if (typeof window !== 'undefined' && window.AC) install(window.AC);
return Object.freeze({ t, STATUS, PRIORITY, sla, statusChip, priorityChip, slaChip, inbox, detail, create, track, tickets, install });
})();

return { f: F, ns: Object.freeze({ "t": __ac_m1o["t"], "STATUS": __ac_m1o["STATUS"], "PRIORITY": __ac_m1o["PRIORITY"], "sla": __ac_m1o["sla"], "statusChip": __ac_m1o["statusChip"], "priorityChip": __ac_m1o["priorityChip"], "slaChip": __ac_m1o["slaChip"], "inbox": __ac_m1o["inbox"], "detail": __ac_m1o["detail"], "create": __ac_m1o["create"], "track": __ac_m1o["track"], "tickets": __ac_m1o["tickets"], "install": __ac_m1o["install"] }) };
})();
export const { t, STATUS, PRIORITY, sla, statusChip, priorityChip, slaChip, inbox, detail, create, track, tickets, install } = __R["tickets"].ns;
export default __R["tickets"].ns;
