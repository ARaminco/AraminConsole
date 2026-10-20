/* File dropzone with previews and progress.

   <div class="ac-dropzone" data-ac="dropzone" [data-max-files="5"] [data-max-size="5MB"] [data-uploader="name"]>
     <input type="file" name="docs" multiple accept="image/*,.pdf">
   </div>
   The native input stays the source of truth (its FileList is kept in sync), so FormData sends the files.
   Without an uploader the progress is simulated. Real upload:
     AC.dropzone.uploader('name', (file, { progress, signal }) => Promise)   progress(0..1)
   Events: ac:dropzone:add { files }, ac:dropzone:remove { file }, ac:dropzone:done { file }
   API: AC.instance(el,'dropzone').{files, clear()} */
import { AC, register, on, emit, uid, icon, instance, options, h, format, reducedMotion } from '../core.js';
import { ft, fire } from './form-core.js';

const uploaders = new Map();
export const dropzone = { uploader(name, fn) { uploaders.set(name, fn); } };
AC.dropzone = dropzone;

const UNITS = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
const parseSize = (s) => { const m = /^([\d.]+)\s*(b|kb|mb|gb)?$/i.exec(String(s || '').trim()); return m ? Number(m[1]) * UNITS[(m[2] || 'b').toLowerCase()] : 0; };
const human = (n) => { const u = ['B', 'KB', 'MB', 'GB']; let i = 0; while (n >= 1024 && i < 3) { n /= 1024; i++; } return `${format.number(n, { maximumFractionDigits: i ? 1 : 0 })} ${u[i]}`; };
const kindIcon = (f) => (/^image\//.test(f.type) ? 'file-image' : /pdf|text|document|sheet/.test(f.type) ? 'file-text' : 'file');

register('dropzone', (el) => {
  const o = options(el, { maxFiles: 0, maxSize: '', uploader: '' });
  const input = el.querySelector('input[type=file]'); if (!input) return;
  const maxSize = parseSize(o.maxSize); const maxFiles = Number(o.maxFiles) || (input.multiple ? 0 : 1);
  input.classList.add('ac-visually-hidden');
  if (!input.id) input.id = uid('file');
  const hintId = uid('dzh');
  const area = h('label', { class: 'ac-dropzone__area', for: input.id });
  const text = h('span', { class: 'ac-dropzone__text' });
  const hint = h('small', { class: 'ac-dropzone__hint', id: hintId });
  area.append(h('span', { class: 'ac-dropzone__icon', html: icon('cloud-upload') }), text, hint);
  input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), hintId].filter(Boolean).join(' '));
  el.insertBefore(area, input.nextSibling);
  const list = h('ul', { class: 'ac-files', role: 'list' });
  el.append(list);
  const items = []; // { file, li, ok, ctrl, url }
  let self = false;
  const labels = () => {
    text.innerHTML = `${ft('drop')} <u>${ft('browse')}</u>`;
    const accept = input.accept ? input.accept.replace(/,/g, ', ') : '';
    hint.textContent = [accept, maxSize ? ft('dropHint', { n: format.number(maxFiles || 10), size: human(maxSize) }) : ''].filter(Boolean).join(' · ');
  };
  function syncInput() {
    try { const dt = new DataTransfer(); items.filter((x) => x.ok).forEach((x) => dt.items.add(x.file)); input.files = dt.files; } catch { /* old browsers */ }
    el.toggleAttribute('data-has-files', items.length > 0);
    self = true; fire(input, ['change']); self = false;
  }
  function progress(item, p) {
    item.li.style.setProperty('--_p', `${Math.round(p * 100)}%`);
    item.bar.value = Math.round(p * 100);
    if (p >= 1) {
      item.li.setAttribute('data-state', 'done');
      item.status.textContent = `${human(item.file.size)} · ${ft('uploaded')}`;
      emit(el, 'dropzone:done', { file: item.file });
    }
  }
  function upload(item) {
    const fn = uploaders.get(o.uploader);
    item.ctrl = new AbortController();
    if (fn) {
      Promise.resolve(fn(item.file, { progress: (p) => progress(item, Math.min(0.99, p)), signal: item.ctrl.signal }))
        .then(() => progress(item, 1))
        .catch((err) => { if (err?.name !== 'AbortError') { item.li.setAttribute('data-state', 'error'); item.status.textContent = String(err?.message || err); } });
      return;
    }
    if (reducedMotion()) { progress(item, 1); return; }
    let p = 0;
    const tick = () => {
      if (item.ctrl.signal.aborted) return;
      p = Math.min(1, p + 0.06 + Math.random() * 0.16);
      progress(item, p);
      if (p < 1) setTimeout(tick, 120 + Math.random() * 180);
    };
    setTimeout(tick, 200);
  }
  function add(files) {
    const added = [];
    if (!input.multiple) clear(true);
    for (const file of files) {
      if (maxFiles && items.filter((x) => x.ok).length >= maxFiles) break;
      const ok = !maxSize || file.size <= maxSize;
      const url = ok && /^image\//.test(file.type) ? URL.createObjectURL(file) : '';
      const thumb = h('span', { class: 'ac-files__thumb', html: url ? '' : icon(kindIcon(file)) });
      if (url) thumb.append(h('img', { src: url, alt: '', loading: 'lazy' }));
      const status = h('small', { class: 'ac-files__meta', text: ok ? human(file.size) : `${human(file.size)} · ${ft('tooLarge')}` });
      const bar = h('progress', { class: 'ac-progress ac-progress--sm', max: '100', value: '0', 'aria-label': file.name });
      const li = h('li', { class: 'ac-files__item', 'data-state': ok ? 'uploading' : 'error' },
        thumb,
        h('span', { class: 'ac-files__main' }, h('span', { class: 'ac-files__name ac-truncate', text: file.name }), status, ok ? bar : null),
        h('button', { type: 'button', class: 'ac-btn ac-btn--ghost ac-btn--icon ac-btn--sm', 'aria-label': `${ft('remove')} ${file.name}`, html: icon('x') }));
      const item = { file, li, ok, url, status, bar };
      items.push(item); list.append(li);
      if (ok) { upload(item); added.push(file); }
    }
    syncInput();
    if (added.length) emit(el, 'dropzone:add', { files: added });
  }
  function remove(item) {
    item.ctrl?.abort(); if (item.url) URL.revokeObjectURL(item.url);
    items.splice(items.indexOf(item), 1);
    item.li.setAttribute('data-state', 'leaving');
    setTimeout(() => item.li.remove(), reducedMotion() ? 0 : 180);
    syncInput();
    emit(el, 'dropzone:remove', { file: item.file });
  }
  function clear(silent) { [...items].forEach((x) => { x.ctrl?.abort(); if (x.url) URL.revokeObjectURL(x.url); x.li.remove(); }); items.length = 0; if (!silent) syncInput(); }

  let depth = 0;
  const offs = [
    on(input, 'change', () => { if (!self && input.files.length) { const f = Array.from(input.files); add(f); } }),
    on(el, 'dragenter', (e) => { e.preventDefault(); depth++; el.setAttribute('data-drag', ''); }),
    on(el, 'dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }),
    on(el, 'dragleave', () => { if (--depth <= 0) { depth = 0; el.removeAttribute('data-drag'); } }),
    on(el, 'drop', (e) => { e.preventDefault(); depth = 0; el.removeAttribute('data-drag'); if (e.dataTransfer?.files?.length) add(Array.from(e.dataTransfer.files)); }),
    on(list, 'click', 'button', (e, b) => { const it = items.find((x) => x.li.contains(b)); if (it) remove(it); }),
    on(input.form || document, 'reset', () => setTimeout(() => clear())),
    on(document, 'ac:i18n:change', labels),
  ];
  labels();
  instance(el, 'dropzone', { get files() { return items.filter((x) => x.ok).map((x) => x.file); }, add, clear: () => clear() });
  return () => { offs.forEach((f) => f()); clear(true); };
});
