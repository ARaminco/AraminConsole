/* Content previews for the files module: real thumbnails (images downscaled on a canvas, a video frame at ~1 s,
   the first lines of text / code / Markdown / CSV as a mini page, an audio waveform, PDF first page through an
   OPTIONAL pdf.js plugin) and the large live preview used by the preview pane, the column view and Quick Look.
   Order: adapter.thumbnail(entry, size) (server renditions) → client rendering from adapter.read(id, { peek: true }).
   Results are cached per id + modified date; thumbnails load lazily through one IntersectionObserver.
   pdf.js is never bundled: AC.files.pdfjs = { src: '…/pdf.min.mjs', worker: '…/pdf.worker.min.mjs' } (Apache-2.0). */
import { typeOf, extOf, fileArt } from './files-icons.js';

export const plugins = { pdfjs: null };
const TEXT_TYPES = new Set(['txt', 'code']);
const LIVE_TYPES = new Set(['image', 'video', 'pdf', 'txt', 'code', 'audio', 'doc', 'xls', 'ppt']);

/** Tiny Markdown → HTML (headings, lists, quotes, code, bold/italic/code/links). Escapes first; used when AC.markdown is absent. */
export function miniMarkdown(src, esc) {
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|\W)\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const out = []; let list = null; let code = null;
  const flush = () => { if (list) { out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; } };
  for (const line of String(src).split(/\r?\n/)) {
    if (code) { if (/^```/.test(line)) { out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`); code = null; } else code.push(line); continue; }
    if (/^```/.test(line)) { flush(); code = []; continue; }
    const h = /^(#{1,4})\s+(.*)$/.exec(line); const li = /^\s*([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (h) { flush(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); }
    else if (li) { const tag = /\d/.test(li[1]) ? 'ol' : 'ul'; if (list?.tag !== tag) { flush(); list = { tag, items: [] }; } list.items.push(li[2]); }
    else if (/^>\s?/.test(line)) { flush(); out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`); }
    else if (/^\s*(---|\*\*\*)\s*$/.test(line)) { flush(); out.push('<hr>'); }
    else if (line.trim()) { flush(); out.push(`<p>${inline(line)}</p>`); }
    else flush();
  }
  flush(); if (code) out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
  return out.join('');
}

/** RFC-4180-ish CSV parser (quotes, escaped quotes, CRLF); `limit` rows. */
export function parseCSV(text, limit = 1000) {
  const rows = []; let row = []; let cell = ''; let q = false;
  const delim = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  for (let i = 0; i < text.length && rows.length < limit; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; continue; }
    if (c === '"') q = true; else if (c === delim) { row.push(cell); cell = ''; } else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; } else cell += c;
  }
  if ((cell || row.length) && rows.length < limit) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  return rows;
}

export function createPreviewer(AC, fs, { esc, t, size }) {
  const thumbs = new Map(); const reads = new Map(); const urls = new Set();
  const key = (e) => `${e.id}@${e.modified}`;
  const peek = (e) => { const k = key(e); if (!reads.has(k)) reads.set(k, Promise.resolve(fs.read ? fs.read(e.id, { peek: true }) : null).catch(() => null)); return reads.get(k); };
  const textOf = async (src, max = 4e5) => { if (src?.text != null) return String(src.text).slice(0, max); if (!src?.url) return ''; const r = await fetch(src.url); return (await r.text()).slice(0, max); };
  const blobURL = (b) => { const u = URL.createObjectURL(b); urls.add(u); return u; };
  const canvasURL = (c) => new Promise((res) => c.toBlob((b) => res(b ? blobURL(b) : c.toDataURL('image/jpeg', 0.8)), 'image/webp', 0.84));
  const fit = (w, h, max) => { const s = Math.min(1, max / Math.max(w, h)); return [Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))]; };
  const isText = (e) => TEXT_TYPES.has(typeOf(e)) || /^(csv|tsv)$/.test(extOf(e.name));
  const textKind = (e) => { const x = extOf(e.name); return x === 'csv' || x === 'tsv' ? 'csv' : x === 'md' || x === 'markdown' ? 'md' : typeOf(e) === 'code' ? 'code' : 'txt'; };

  async function image(url, max) {
    const img = new Image(); img.decoding = 'async'; img.src = url;
    await img.decode();
    const w0 = img.naturalWidth || 300; const h0 = img.naturalHeight || 200;
    if (/\.svg(\?|#|$)/i.test(url) || url.startsWith('data:image/svg') || Math.max(w0, h0) <= max * 1.2) return { img: url, w: w0, h: h0 };
    const [w, h] = fit(w0, h0, max);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, 0, 0, w, h);
    return { img: await canvasURL(c), w: w0, h: h0 };
  }
  function videoFrame(url, max) {
    return new Promise((resolve, reject) => {
      const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto';
      const done = (fn) => { clearTimeout(to); v.removeAttribute('src'); v.load(); fn(); };
      const to = setTimeout(() => done(() => reject(new Error('timeout'))), 9000);
      v.addEventListener('loadeddata', () => { const d = Number.isFinite(v.duration) ? v.duration : 2; v.currentTime = Math.min(1, d / 3); }, { once: true });
      v.addEventListener('seeked', async () => {
        const [w, h] = fit(v.videoWidth || 320, v.videoHeight || 180, max);
        const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(v, 0, 0, w, h);
        const out = { img: await canvasURL(c), w: v.videoWidth, h: v.videoHeight, duration: Number.isFinite(v.duration) ? v.duration : 0 };
        done(() => resolve(out));
      }, { once: true });
      v.addEventListener('error', () => done(() => reject(new Error('video'))), { once: true });
      v.src = url;
    });
  }
  async function waveform(url, bars = 36) {
    const buf = await (await fetch(url)).arrayBuffer();
    const ctx = new OfflineAudioContext(1, 8000, 8000);
    const audio = await ctx.decodeAudioData(buf);
    const d = audio.getChannelData(0); const step = Math.floor(d.length / bars); const peaks = [];
    for (let i = 0; i < bars; i++) { let m = 0; for (let j = i * step; j < (i + 1) * step; j += 16) m = Math.max(m, Math.abs(d[j])); peaks.push(m); }
    const top = Math.max(...peaks) || 1;
    return peaks.map((p) => Math.max(0.08, p / top));
  }
  const waveSVG = (peaks) => `<svg class="ac-fm-wave" viewBox="0 0 ${peaks.length * 4} 40" preserveAspectRatio="none" aria-hidden="true">${peaks.map((p, i) => `<rect x="${i * 4 + 0.6}" y="${20 - p * 18}" width="2.6" height="${Math.max(1.5, p * 36)}" rx="1.3"/>`).join('')}</svg>`;
  async function pdfPage(url, max) {
    const cfg = plugins.pdfjs || AC.files?.pdfjs;
    if (!cfg?.src) return null;
    const lib = await import(/* @vite-ignore */ cfg.src);
    if (cfg.worker && lib.GlobalWorkerOptions) lib.GlobalWorkerOptions.workerSrc = cfg.worker;
    const doc = await lib.getDocument(url).promise; const page = await doc.getPage(1);
    const vp0 = page.getViewport({ scale: 1 }); const vp = page.getViewport({ scale: max / Math.max(vp0.width, vp0.height) * 1.5 });
    const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    return { img: await canvasURL(c), w: vp0.width, h: vp0.height, pages: doc.numPages, page: true };
  }
  function miniPage(e, text) {
    const k = textKind(e); const ext = (extOf(e.name) || 'txt').toUpperCase();
    let body;
    if (k === 'csv') { const rows = parseCSV(text, 9); body = `<table>${rows.map((r, i) => `<tr>${r.slice(0, 4).map((c) => (i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`)).join('')}</tr>`).join('')}</table>`; }
    else if (k === 'md') body = String(text).split(/\r?\n/).filter((l) => l.trim()).slice(0, 14).map((l) => (/^#{1,3}\s/.test(l) ? `<b>${esc(l.replace(/^#+\s*/, ''))}</b>` : `<span>${esc(l.replace(/^[-*>]\s+/, '• ').replace(/[*`_]/g, ''))}</span>`)).join('');
    else body = `<code>${esc(String(text).split(/\r?\n/).slice(0, 18).map((l) => l.slice(0, 64)).join('\n'))}</code>`;
    return `<span class="ac-fm-page ac-fm-page--${k}" dir="auto"><span class="ac-fm-page__in">${body}</span><span class="ac-fm-page__ext" data-type="${typeOf(e)}">${esc(ext)}</span></span>`;
  }
  function officePage(e) {
    const ty = typeOf(e); const title = esc(e.name.replace(/\.[^.]+$/, ''));
    const inner = ty === 'xls' ? `<span class="ac-fm-page__grid">${'<i></i>'.repeat(24)}</span>`
      : ty === 'ppt' ? `<span class="ac-fm-page__slide"><b>${title}</b><i></i><i></i></span>`
        : `<b>${title}</b>${'<i></i>'.repeat(7)}`;
    return `<span class="ac-fm-page ac-fm-page--office" data-type="${ty}" dir="auto"><span class="ac-fm-page__in">${inner}</span><span class="ac-fm-page__ext" data-type="${ty}">${esc((extOf(e.name) || ty).toUpperCase())}</span></span>`;
  }

  async function build(e, max) {
    if (fs.thumbnail) { const u = await fs.thumbnail(e, max).catch(() => null); if (u) return image(u, max).then((r) => ({ ...r, server: true }), () => ({ img: u })); }
    const ty = typeOf(e); const src = await peek(e);
    if (ty === 'image' && src?.url) return image(src.url, max);
    if (ty === 'video' && src?.url) return { ...(await videoFrame(src.url, max)), video: true };
    if (ty === 'pdf' && src?.url) return (await pdfPage(src.url, max).catch(() => null)) || null;
    if (isText(e) && (src?.text != null || src?.url)) return { html: miniPage(e, await textOf(src, 4000)) };
    if (ty === 'audio' && src?.url) return { html: `<span class="ac-fm-page ac-fm-page--audio">${src.poster ? `<img src="${esc(src.poster)}" alt="">` : ''}${waveSVG(await waveform(src.url))}<span class="ac-fm-page__ext" data-type="audio">${esc((extOf(e.name) || 'audio').toUpperCase())}</span></span>` };
    if (['doc', 'xls', 'ppt'].includes(ty)) return { html: officePage(e) };
    return null;
  }
  /** Thumbnail for an entry → Promise<{ img, w, h, duration? } | { html } | null> (cached). */
  function thumb(e, max = 360) {
    const k = key(e);
    if (!thumbs.has(k)) thumbs.set(k, build(e, max).catch(() => null));
    return thumbs.get(k);
  }
  const imgHTML = (e, r) => `<span class="ac-fm-thumb" data-type="${typeOf(e)}"${r.page ? ' data-page' : ''}><img src="${esc(r.img)}" alt="" decoding="async" draggable="false">${r.video || typeOf(e) === 'video' ? `<span class="ac-fm-thumb__play">${AC.icon('play')}</span>${(e.duration || r.duration) ? `<span class="ac-fm-thumb__dur"><bdi>${dur(e.duration || r.duration)}</bdi></span>` : ''}` : ''}</span>`;
  const dur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  /** Placeholder markup for a lazily filled thumbnail (falls back to the type artwork). */
  const slot = (e) => (e.kind === 'file' && LIVE_TYPES.has(typeOf(e)) ? `<span class="ac-fm-live" data-live="${esc(e.id)}" data-type="${typeOf(e)}">${fileArt(e)}</span>` : null);

  const pending = new Map(); // slot el -> entry getter
  let getEntry = () => null;
  const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((list) => {
    for (const it of list) { if (!it.isIntersecting) continue; io.unobserve(it.target); fill(it.target); }
  }, { rootMargin: '240px' }) : null;
  async function fill(node) {
    const e = getEntry(node.dataset.live); if (!e) return;
    const r = await thumb(e);
    if (!r || !node.isConnected) { node.dataset.ready = 'none'; return; }
    node.innerHTML = r.img ? imgHTML(e, r) : r.html;
    node.dataset.ready = '';
    const img = node.querySelector('img');
    const show = () => { const c = node.firstElementChild; if (c && !AC.reducedMotion?.()) c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' }); else if (c) c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140 }); };
    if (img && !img.complete) img.addEventListener('load', show, { once: true }); else show();
  }
  function observe(root, entryOf) {
    if (entryOf) getEntry = entryOf;
    for (const n of root.querySelectorAll('[data-live]:not([data-obs])')) { n.dataset.obs = ''; if (io) io.observe(n); else fill(n); }
  }

  /** Large live preview (preview pane, column preview, gallery stage, Quick Look). */
  async function full(e, { ql = false } = {}) {
    const ty = typeOf(e);
    if (e.kind === 'folder') return null;
    const src = await (ql ? (fs.read ? fs.read(e.id).catch(() => null) : null) : peek(e));
    const r = await thumb(e);
    const poster = r?.img ? ` poster="${esc(r.img)}"` : '';
    if (ty === 'image' && (src?.url || e.thumb)) return `<div class="ac-fm-full ac-fm-full--image"><img class="${ql ? 'ac-fm-ql__img' : 'ac-fm-full__img'}" src="${esc(src?.url || e.thumb)}" alt="${esc(e.name)}" draggable="false"></div>`;
    if (ty === 'video' && src?.url) return `<div class="ac-fm-full ac-fm-full--video"><video src="${esc(src.url)}"${poster} controls playsinline preload="metadata"${ql ? '' : ' muted'}></video></div>`;
    if (ty === 'audio' && src?.url) return `<div class="ac-fm-full ac-fm-full--audio">${r?.html || fileArt(e)}<audio src="${esc(src.url)}" controls preload="metadata"></audio></div>`;
    if (ty === 'pdf' && src?.url) {
      const fb = `<div class="ac-fm-full__fb">${r?.img ? `<img class="ac-fm-full__page" src="${esc(r.img)}" alt="">` : fileArt(e)}${ql ? `<p>${esc(t('pdfFallback'))}</p>` : ''}<a class="ac-btn ac-btn--sm" href="${esc(src.url)}" target="_blank" rel="noopener">${AC.icon('external-link')}<span>${esc(t('openIn'))}</span></a></div>`;
      // the browser's own PDF viewer (pages scroll); without one (some mobile / headless browsers) the fallback shows the first page
      if (!ql && r?.img) return `<div class="ac-fm-full ac-fm-full--thumb ac-fm-full--page">${imgHTML(e, r)}</div>`; // pane / column: the first page, like Finder
      return ql || hasPdfViewer() ? `<div class="ac-fm-full ac-fm-full--pdf"><object data="${esc(src.url)}#view=FitH${ql ? '' : '&toolbar=0&navpanes=0'}" type="application/pdf" aria-label="${esc(e.name)}">${fb}</object></div>` : `<div class="ac-fm-full ac-fm-full--pdf">${fb}</div>`;
    }
    if (isText(e) && (src?.text != null || src?.url)) {
      const text = await textOf(src); const k = textKind(e);
      if (k === 'csv') { const rows = parseCSV(text, ql ? 2000 : 200); return `<div class="ac-fm-full ac-fm-full--csv" tabindex="0"><table class="ac-fm-csv"><thead><tr>${(rows[0] || []).map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map((r2) => `<tr>${r2.map((c) => `<td${/^-?[\d.,]+%?$/.test(c.trim()) ? ' class="is-num"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
      if (k === 'md') return `<div class="ac-fm-full ac-fm-full--md ac-fm-md" dir="auto" tabindex="0">${typeof AC.markdown === 'function' ? AC.markdown(text) : miniMarkdown(text, esc)}</div>`;
      return `<pre class="ac-fm-full ac-fm-full--text${k === 'code' ? ' is-code' : ''}" dir="${k === 'code' ? 'ltr' : 'auto'}" tabindex="0">${esc(text)}</pre>`;
    }
    if (r) return `<div class="ac-fm-full ac-fm-full--thumb">${r.img ? imgHTML(e, r) : r.html}</div>`;
    return null;
  }
  let pdfViewer = null;
  const hasPdfViewer = () => (pdfViewer ??= !!(navigator.pdfViewerEnabled ?? [...(navigator.mimeTypes || [])].some((m) => m.type === 'application/pdf')));

  return {
    thumb, slot, observe, full, peek, imgHTML, miniPage,
    destroy() { io?.disconnect(); for (const u of urls) URL.revokeObjectURL(u); urls.clear(); thumbs.clear(); reads.clear(); pending.clear(); },
    forget(id) { for (const k of [...thumbs.keys()]) if (k.startsWith(`${id}@`)) thumbs.delete(k); for (const k of [...reads.keys()]) if (k.startsWith(`${id}@`)) reads.delete(k); },
  };
}
