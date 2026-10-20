/* Confirm & prompt dialogs (Promise based). Desktop: compact centred alert; phone: bottom sheet.
   AC.confirm({ title, text, tone:'danger|warning|success|info|accent', icon, confirmText, cancelText }) → Promise<boolean>
   AC.prompt({ title, text, label, value, placeholder, type, required, confirmText, cancelText, validate(v) → string|true }) → Promise<string|null> */
import { AC, on, icon, escapeHtml, uid, i18n } from '../core.js';
import { buildLayer } from './sheet.js';

const TONE_ICON = { danger: 'trash-2', warning: 'triangle-alert', success: 'circle-check', info: 'info', accent: 'circle-help' };

function dialog(o, field) {
  return new Promise((resolve) => {
    const tone = o.tone || 'accent';
    const fid = uid('prompt');
    const danger = tone === 'danger';
    const content = `<div class="ac-confirm__icon" data-tone="${escapeHtml(tone)}">${icon(o.icon || TONE_ICON[tone] || 'circle-help')}</div>
      <h2 class="ac-dialog__title">${escapeHtml(o.title || i18n.t('overlay.confirmTitle', 'Are you sure?'))}</h2>
      ${o.text ? `<p class="ac-dialog__text">${escapeHtml(o.text)}</p>` : ''}
      ${field ? `<form class="ac-confirm__form" novalidate><label class="ac-confirm__label" for="${fid}">${escapeHtml(o.label || '')}</label>
        <input class="ac-confirm__input" id="${fid}" name="value" type="${escapeHtml(o.type || 'text')}" value="${escapeHtml(o.value ?? '')}" placeholder="${escapeHtml(o.placeholder || '')}" autocomplete="off"${o.required ? ' required' : ''}>
        <p class="ac-confirm__error" id="${fid}-err" aria-live="polite"></p></form>` : ''}`;
    const footer = `<button class="ac-btn ac-btn--lg ac-btn--pill" type="button" data-ac-close="cancel" data-cancel>${escapeHtml(o.cancelText || i18n.t('overlay.cancel', 'Cancel'))}</button>
      <button class="ac-btn ac-btn--lg ac-btn--pill ${danger ? 'ac-btn--danger' : 'ac-btn--primary'}" type="button" data-confirm>${escapeHtml(o.confirmText || i18n.t(danger ? 'overlay.delete' : 'overlay.confirm', danger ? 'Delete' : 'Confirm'))}</button>`;
    const m = buildLayer('modal', { size: 'sm', role: 'alertdialog', className: 'ac-confirm', closeButton: false, content, footer, static: o.static,
      initial: field ? '.ac-confirm__input' : (danger ? '[data-cancel]' : '[data-confirm]') });
    let result = field ? null : false;
    const input = m.el.querySelector('.ac-confirm__input');
    const err = m.el.querySelector('.ac-confirm__error');
    const submit = () => {
      if (field) {
        const v = input.value;
        const check = o.required && !v.trim() ? i18n.t('overlay.required', 'This field is required') : (o.validate ? o.validate(v) : true);
        if (check !== true && check != null && check !== '') {
          err.textContent = String(check); input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', err.id);
          m.bump(); input.focus(); return;
        }
        result = v;
      } else result = true;
      m.close('confirm');
    };
    on(m.el, 'click', '[data-confirm]', submit);
    if (input) {
      on(m.el, 'submit', (e) => { e.preventDefault(); submit(); });
      on(input, 'input', () => { input.removeAttribute('aria-invalid'); err.textContent = ''; });
      requestAnimationFrame(() => input.select());
    }
    m.el.addEventListener('ac:modal:close', () => resolve(result), { once: true });
    m.open();
  });
}

export const confirm = (o = {}) => dialog(typeof o === 'string' ? { title: o } : o, false);
export const prompt = (o = {}) => dialog(typeof o === 'string' ? { title: o } : o, true);
AC.confirm = confirm;
AC.prompt = prompt;
