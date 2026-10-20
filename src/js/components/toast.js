/* Toasts: stacked (Sonner-style), expand on hover / focus / tap, progress bar, swipe to dismiss, undo, promise.
   AC.toast('Saved') · AC.toast({ title, text, tone:'success|danger|warning|info|accent|neutral', icon,
     action:{ label, onClick(t) }, duration:5000 (0 = sticky), position:'top-start|top-center|top-end|bottom-start|bottom-center|bottom-end',
     id, dismissible:true, onClose(reason) }) → { id, el, close(), update(patch) }
   AC.toast.success|error|warning|info(title, text?, opts?) · AC.toast.undo(title, onUndo, opts?)
   AC.toast.promise(promise, { loading, success, error }) · AC.toast.dismiss(id?)
   Default container: #ac-toasts / .ac-toasts (created when missing). Events: ac:toast:open, ac:toast:close {reason} on the toast. */
import { AC, $, $$, on, emit, h, icon, escapeHtml, uid, gesture, reducedMotion, haptic, i18n } from '../core.js';

const ICONS = { success: 'circle-check', danger: 'circle-alert', error: 'circle-alert', warning: 'triangle-alert', info: 'info' };
const PEEK = 12; const GAP = 8; const MAX = 5; const VISIBLE = 3;
const all = new Map(); // id -> record
const containers = new Map();

function container(pos) {
  const key = pos || 'auto';
  let c = containers.get(key);
  if (c?.isConnected) return c;
  c = pos ? $(`.ac-toasts[data-position="${pos}"]`) : ($('#ac-toasts') || $('.ac-toasts:not([data-position])'));
  if (!c) {
    c = h('section', { class: 'ac-toasts', 'data-position': pos, 'aria-live': 'polite' });
    document.body.append(c);
  }
  if (!c.hasAttribute('aria-label')) c.setAttribute('aria-label', i18n.t('overlay.notifications', 'Notifications'));
  wire(c);
  containers.set(key, c);
  return c;
}

function wire(c) {
  if (c._acToasts) return;
  c._acToasts = true;
  const expand = (v) => { if (v) c.setAttribute('data-expanded', ''); else c.removeAttribute('data-expanded'); layout(c); pause(c, v); };
  on(c, 'pointerenter', (e) => { if (e.pointerType === 'mouse') expand(true); });
  on(c, 'pointerleave', (e) => { if (e.pointerType === 'mouse' && !c.contains(document.activeElement) && !c.querySelector('[data-dragging]')) expand(false); });
  on(c, 'focusin', () => expand(true));
  on(c, 'focusout', (e) => { if (!c.contains(e.relatedTarget) && !c.matches(':hover')) expand(false); });
  on(c, 'click', '.ac-toast', (e) => {
    if (e.target.closest('button, a') || matchMedia('(hover: hover)').matches) return;
    expand(!c.hasAttribute('data-expanded'));
  });
}

function edge(c) {
  const cs = getComputedStyle(c);
  return cs.bottom === 'auto' || (cs.top !== 'auto' && parseFloat(cs.top) < parseFloat(cs.bottom)) ? 'top' : 'bottom';
}

function layout(c) {
  const list = $$('.ac-toast:not([data-state="exit"])', c).reverse(); // newest first
  const expanded = c.hasAttribute('data-expanded');
  c.dataset.edge = edge(c);
  let off = 0; const frontH = list[0]?.offsetHeight || 0;
  list.forEach((t, i) => {
    const hgt = t._h || (t._h = t.scrollHeight);
    t.style.setProperty('--_i', String(i));
    t.style.setProperty('--_y', `${expanded ? off : i * PEEK}px`);
    t.style.setProperty('--_s', expanded ? '1' : String(Math.max(0.8, 1 - i * 0.05)));
    t.toggleAttribute('data-behind', i > 0);
    t.toggleAttribute('data-hidden', !expanded && i >= VISIBLE);
    t.setAttribute('aria-hidden', String(!expanded && i >= VISIBLE));
    off += hgt + GAP;
  });
  c.style.setProperty('--_fh', `${frontH}px`);
  c.style.setProperty('--_h', `${expanded ? Math.max(0, off - GAP) : frontH + Math.min(list.length - 1, VISIBLE - 1) * PEEK}px`);
}

function pause(c, paused) {
  for (const t of $$('.ac-toast', c)) { const r = all.get(t.dataset.id); if (r) (paused ? r.pause() : r.resume()); }
}

function render(r) {
  const o = r.o; const t = r.el;
  const tone = o.tone === 'error' ? 'danger' : o.tone;
  if (tone) t.dataset.tone = tone; else t.removeAttribute('data-tone');
  t.setAttribute('role', tone === 'danger' ? 'alert' : 'status');
  const ic = o.loading ? '<span class="ac-toast__spinner" aria-hidden="true"></span>' : (o.icon !== false && (o.icon || ICONS[tone])) ? icon(o.icon || ICONS[tone]) : '';
  t.innerHTML = `${ic ? `<span class="ac-toast__icon">${ic}</span>` : ''}
    <div class="ac-toast__body">${o.title ? `<div class="ac-toast__title">${escapeHtml(o.title)}</div>` : ''}${o.text ? `<div class="ac-toast__text">${escapeHtml(o.text)}</div>` : ''}</div>
    ${o.action ? `<button class="ac-btn ac-btn--sm ac-toast__action" type="button">${escapeHtml(o.action.label)}</button>` : ''}
    ${o.dismissible === false ? '' : `<button class="ac-toast__close" type="button" aria-label="${escapeHtml(i18n.t('overlay.close', 'Close'))}">${icon('x')}</button>`}
    ${r.duration ? `<span class="ac-toast__progress" aria-hidden="true"><span></span></span>` : ''}`;
  t.style.setProperty('--_dur', `${r.duration}ms`);
}

export function toast(input = {}) {
  const o = typeof input === 'string' ? { title: input } : { ...input };
  if (o.id && all.has(String(o.id))) return all.get(String(o.id)).update(o);
  const id = String(o.id ?? uid('toast'));
  const c = container(o.position);
  const t = h('div', { class: 'ac-toast', 'data-id': id, 'data-state': 'enter' });
  let timer = 0; let started = 0; let closed = false;
  const r = {
    id, el: t, o, duration: 0, remaining: 0,
    close(reason = 'api') {
      if (closed) return;
      closed = true; clearTimeout(timer); all.delete(id);
      t.dataset.state = t.dataset.state === 'swiped' ? 'swiped' : 'exit';
      layout(c);
      emit(t, 'toast:close', { reason });
      r.o.onClose?.(reason);
      setTimeout(() => { t.remove(); layout(c); if (!c.querySelector('.ac-toast')) c.removeAttribute('data-expanded'); }, reducedMotion() ? 0 : 260);
    },
    pause() { if (!r.duration || !started) return; clearTimeout(timer); r.remaining -= performance.now() - started; started = 0; },
    resume() {
      if (!r.duration || started || closed) return;
      if (c.hasAttribute('data-expanded') || document.hidden) return;
      started = performance.now(); timer = setTimeout(() => r.close('timeout'), Math.max(0, r.remaining));
    },
    restart() { clearTimeout(timer); started = 0; r.duration = r.o.loading ? 0 : Number(r.o.duration ?? (r.o.action ? 7000 : 4500)) || 0; r.remaining = r.duration; r.resume(); },
    update(patch = {}) {
      Object.assign(r.o, patch);
      r.restart(); render(r); t._h = 0; layout(c);
      if (c.hasAttribute('data-expanded')) r.pause();
      return r;
    },
  };
  r.duration = o.loading ? 0 : Number(o.duration ?? (o.action ? 7000 : 4500)) || 0;
  r.remaining = r.duration;
  render(r);
  all.set(id, r);
  c.append(t);
  // trim the oldest beyond MAX
  const live = $$('.ac-toast:not([data-state="exit"]):not([data-state="swiped"])', c);
  live.slice(0, Math.max(0, live.length - MAX)).forEach((x) => all.get(x.dataset.id)?.close('overflow'));
  layout(c);
  requestAnimationFrame(() => requestAnimationFrame(() => { if (t.dataset.state === 'enter') t.removeAttribute('data-state'); }));
  on(t, 'click', '.ac-toast__close', () => r.close('button'));
  on(t, 'click', '.ac-toast__action', () => { r.o.action?.onClick?.(r); if (r.o.action?.keep !== true) r.close('action'); });
  gesture(t, {
    axis: 'x',
    filter: (e) => !e.target.closest('button, a') && r.o.dismissible !== false,
    onStart: () => { t.setAttribute('data-dragging', ''); r.pause(); },
    onMove: (s) => { t.style.setProperty('--_sx', `${s.dx}px`); t.style.setProperty('--_so', String(Math.max(0, 1 - Math.abs(s.dx) / t.offsetWidth))); },
    onEnd: (s) => {
      t.removeAttribute('data-dragging');
      if (!s.cancelled && (Math.abs(s.dx) > t.offsetWidth * 0.4 || Math.abs(s.vx) > 0.5)) {
        haptic();
        t.style.setProperty('--_sx', `${Math.sign(s.dx || s.vx) * (t.offsetWidth + 40)}px`);
        t.dataset.state = 'swiped';
        r.close('swipe');
      } else { t.style.setProperty('--_sx', '0px'); t.style.setProperty('--_so', '1'); r.resume(); }
    },
  });
  r.resume();
  emit(t, 'toast:open', { id });
  return r;
}

toast.success = (title, text, o) => toast({ ...o, title, text, tone: 'success' });
toast.error = (title, text, o) => toast({ ...o, title, text, tone: 'danger' });
toast.warning = (title, text, o) => toast({ ...o, title, text, tone: 'warning' });
toast.info = (title, text, o) => toast({ ...o, title, text, tone: 'info' });
toast.undo = (title, onUndo, o = {}) => toast({ icon: 'undo-2', duration: 6000, ...o, title, action: { label: i18n.t('overlay.undo', 'Undo'), onClick: onUndo } });
toast.promise = (promise, m = {}) => {
  const tt = toast({ title: m.loading || i18n.t('overlay.loading', 'Working…'), loading: true, dismissible: false, ...m.options });
  Promise.resolve(promise).then(
    (v) => tt.update({ loading: false, dismissible: true, tone: 'success', title: typeof m.success === 'function' ? m.success(v) : (m.success || i18n.t('overlay.done', 'Done')) }),
    (err) => tt.update({ loading: false, dismissible: true, tone: 'danger', title: typeof m.error === 'function' ? m.error(err) : (m.error || i18n.t('overlay.failed', 'Something went wrong')) }),
  );
  return tt;
};
toast.dismiss = (id) => { if (id != null) all.get(String(id))?.close('api'); else [...all.values()].forEach((r) => r.close('api')); };
toast.get = (id) => all.get(String(id));

on(document, 'visibilitychange', () => { for (const r of all.values()) (document.hidden ? r.pause() : r.resume()); });
on(window, 'resize', () => { for (const c of containers.values()) if (c.isConnected) { $$('.ac-toast', c).forEach((t) => { t._h = 0; }); layout(c); } });

AC.toast = toast;
