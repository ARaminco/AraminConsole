/*! AraminConsole v0.1.0 — module files — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');
if (!__R["overlays"]) await import('./overlays.js');

/* ======== module: files ======== */
if (!__R["files"]) __R["files"] = (() => {
const F = {};

/* ---- modules/files/files-icons.js ---- */
const __ac_m1b = F["modules/files/files-icons.js"] = (() => {
/* File-type artwork for the files module — custom SVG, 64×64, themed through CSS classes (files.css):
   .fmi-page / .fmi-fold / .fmi-line (paper), .fmi-fb / .fmi-ff (folder back / front), --_c (type colour).
   fileArt(entry, { size }) → svg string · typeOf(name|entry) → 'folder|pdf|doc|xls|ppt|image|video|audio|zip|code|txt|unknown'
   No ids, no gradients: safe to repeat hundreds of times in one document. */

const EXT = {
  pdf: 'pdf',
  doc: 'doc', docx: 'doc', odt: 'doc', rtf: 'doc', pages: 'doc',
  xls: 'xls', xlsx: 'xls', csv: 'xls', ods: 'xls', numbers: 'xls',
  ppt: 'ppt', pptx: 'ppt', key: 'ppt', odp: 'ppt',
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image', heic: 'image', bmp: 'image', tif: 'image', tiff: 'image',
  mp4: 'video', mov: 'video', webm: 'video', mkv: 'video', avi: 'video', m4v: 'video',
  mp3: 'audio', wav: 'audio', m4a: 'audio', ogg: 'audio', flac: 'audio', aac: 'audio',
  zip: 'zip', rar: 'zip', '7z': 'zip', tar: 'zip', gz: 'zip',
  js: 'code', mjs: 'code', ts: 'code', json: 'code', html: 'code', css: 'code', php: 'code', py: 'code', sql: 'code', xml: 'code', yml: 'code', yaml: 'code', sh: 'code',
  txt: 'txt', md: 'txt', log: 'txt',
};
const extOf = (name = '') => { const m = /\.([^.\s]{1,8})$/.exec(String(name)); return m ? m[1].toLowerCase() : ''; };
function typeOf(x) {
  if (x && typeof x === 'object') { if (x.kind === 'folder') return 'folder'; if (x.type) return x.type; x = x.name; }
  return EXT[extOf(x)] || 'unknown';
}

const COLORS = { pdf: '#e5484d', doc: '#2f6fde', xls: '#1e9e5a', ppt: '#e8682f', zip: '#a07a3c', code: '#5b5bd6', txt: '#7d8590', audio: '#d0417e', video: '#7c4ddb', image: '#0e9f9a', unknown: '#8b8f98' };
const LABEL = { pdf: 'PDF', doc: 'DOC', xls: 'XLS', ppt: 'PPT', zip: 'ZIP', code: '</>', txt: 'TXT', audio: '', video: '', image: '', unknown: '' };

const PAGE = '<path class="fmi-page" d="M15 3.5h24.5L53 17v40a3.5 3.5 0 0 1-3.5 3.5h-34.5A3.5 3.5 0 0 1 11.5 57V7A3.5 3.5 0 0 1 15 3.5z"/><path class="fmi-fold" d="M39.5 3.5V13a4 4 0 0 0 4 4H53z"/>';
const lines = (y, n, w = [26, 22, 26, 18]) => Array.from({ length: n }, (_, i) => `<rect class="fmi-line" x="18" y="${y + i * 5}" width="${w[i % w.length]}" height="2" rx="1"/>`).join('');
const band = (t, label) => (label ? `<rect x="7" y="38" width="${label.length > 3 ? 34 : 30}" height="14" rx="3.5" fill="var(--_c)"/><text x="${label.length > 3 ? 24 : 22}" y="48.4" text-anchor="middle" font-size="${label.length > 3 ? 8.6 : 9}" font-weight="700" fill="#fff" font-family="ui-sans-serif,system-ui,sans-serif" letter-spacing=".4" direction="ltr">${label}</text>` : '');

const GLYPH = {
  pdf: () => `${lines(14, 4)}<path d="M33 28.5c3-6 4.5-10 3.4-11.2-1.2-1.2-2.6.9-1.6 4.6 1 3.6 4.8 8.6 9.2 9.4 2.4.4 3-1.5.8-2-3.6-.8-10.6 1.3-13.8 4.3-1.4 1.3-.4 2.7 1 1.3z" fill="none" stroke="var(--_c)" stroke-width="1.5" stroke-linejoin="round"/>`,
  doc: () => lines(14, 5, [28, 24, 28, 20]),
  xls: () => `<rect x="18" y="13" width="27" height="20" rx="2" fill="none" stroke="var(--_c)" stroke-width="1.6" opacity=".9"/><path d="M18 19.6h27M18 26.3h27M27 13v20M36 13v20" stroke="var(--_c)" stroke-width="1.3" opacity=".7"/>`,
  ppt: () => `<rect x="17" y="13" width="29" height="19" rx="2.5" fill="var(--_c)" opacity=".16"/><path d="M27 22.5a5.5 5.5 0 1 0 5.5-5.5v5.5z" fill="var(--_c)"/><rect x="35" y="25" width="7" height="2" rx="1" fill="var(--_c)" opacity=".6"/><rect x="35" y="21" width="7" height="2" rx="1" fill="var(--_c)" opacity=".6"/>`,
  zip: () => `<g fill="var(--_c)">${Array.from({ length: 6 }, (_, i) => `<rect x="${i % 2 ? 31 : 27}" y="${5 + i * 4}" width="4" height="3" rx="1"/>`).join('')}<rect x="27" y="29" width="8" height="7" rx="2"/></g><rect x="29.5" y="31.6" width="3" height="2" rx="1" fill="#fff"/>`,
  code: () => `<path d="M24 18l-5 6 5 6M40 18l5 6-5 6M35 15l-6 18" fill="none" stroke="var(--_c)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  txt: () => lines(13, 5, [28, 24, 28, 16]),
  audio: () => `<circle cx="32" cy="31" r="15" fill="var(--_c)" opacity=".14"/><path d="M29 38.5V24l10-2.5v13.5" fill="none" stroke="var(--_c)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26.6" cy="38.6" r="3.3" fill="var(--_c)"/><circle cx="36.6" cy="35.6" r="3.3" fill="var(--_c)"/>`,
  video: () => `<rect x="17" y="20" width="30" height="21" rx="3.5" fill="var(--_c)" opacity=".16"/><path d="M29 25.5v10l8.5-5z" fill="var(--_c)"/><path d="M17 24h30M17 37h30" stroke="var(--_c)" stroke-width="1.2" opacity=".5" stroke-dasharray="2.5 2.5"/>`,
  image: () => `<rect x="17" y="17" width="30" height="24" rx="3.5" fill="var(--_c)" opacity=".14"/><circle cx="25" cy="24.5" r="3" fill="var(--_c)" opacity=".7"/><path d="M17.5 38l8.5-8 6 5.5 5-4 9.5 8.5v.5a3.5 3.5 0 0 1-3.5 3.5h-22a3.5 3.5 0 0 1-3.5-3.5z" fill="var(--_c)"/>`,
  unknown: () => `<path d="M28 23.5a4.5 4.5 0 1 1 6.2 4.2c-1.4.6-2.2 1.6-2.2 3.1v1.2" fill="none" stroke="var(--_c)" stroke-width="2.4" stroke-linecap="round"/><circle cx="32" cy="37" r="1.6" fill="var(--_c)"/>`,
};

/* folder glyphs, embossed on the front flap */
const FGLYPH = {
  shared: '<circle cx="28" cy="33" r="3.4"/><circle cx="37.5" cy="33.6" r="2.8"/><path d="M21.5 44c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6zM34.6 44c.3-2.2-.3-3.8-1.4-5 .9-.5 2-.8 3.1-.8 2.7 0 4.8 1.7 5.3 4.8l.1 1z"/>',
  docs: '<path d="M26 27.5h8l4.5 4.5v10.5a1.5 1.5 0 0 1-1.5 1.5H26a1.5 1.5 0 0 1-1.5-1.5v-13.5a1.5 1.5 0 0 1 1.5-1.5z"/>',
  images: '<rect x="23" y="29" width="18" height="14" rx="2"/><path d="M24 42l5-5 3.5 3 3-2.5 5.5 4.5z" fill="var(--fm-fold-f)"/>',
  money: '<rect x="22" y="30" width="20" height="13" rx="2"/><circle cx="32" cy="36.5" r="3" fill="var(--fm-fold-f)"/>',
  lock: '<rect x="25" y="34" width="14" height="10" rx="2"/><path d="M28 34v-3a4 4 0 0 1 8 0v3" fill="none" stroke="var(--fm-fold-g)" stroke-width="2.2"/>',
  id: '<rect x="21.5" y="30" width="21" height="14" rx="2.2"/><circle cx="27.5" cy="35.5" r="2.4" fill="var(--fm-fold-f)"/><rect x="31.5" y="34" width="8" height="1.8" rx=".9" fill="var(--fm-fold-f)"/><rect x="31.5" y="37.4" width="6" height="1.8" rx=".9" fill="var(--fm-fold-f)"/>',
  code: '<path d="M28 31.5l-4.5 5 4.5 5M36 31.5l4.5 5-4.5 5" fill="none" stroke="var(--fm-fold-g)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  media: '<path d="M27.5 30v13l11-6.5z"/>',
  archive: '<rect x="22" y="29" width="20" height="5" rx="1.5"/><path d="M23.5 35h17v7.5a1.5 1.5 0 0 1-1.5 1.5H25a1.5 1.5 0 0 1-1.5-1.5z"/><rect x="29" y="37" width="6" height="2" rx="1" fill="var(--fm-fold-f)"/>',
  scan: '<path d="M23 33v-3a2 2 0 0 1 2-2h3M36 28h3a2 2 0 0 1 2 2v3M41 40v3a2 2 0 0 1-2 2h-3M28 45h-3a2 2 0 0 1-2-2v-3" fill="none" stroke="var(--fm-fold-g)" stroke-width="2.2" stroke-linecap="round"/><rect x="26" y="35.6" width="12" height="2" rx="1"/>',
  download: '<path d="M32 28v12M27 35.5l5 5 5-5" fill="none" stroke="var(--fm-fold-g)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
};

function folderArt(glyph = '', color = '') {
  const g = FGLYPH[glyph] ? `<g class="fmi-fg">${FGLYPH[glyph]}</g>` : '';
  return `<svg class="fmi fmi--folder" viewBox="0 0 64 64" aria-hidden="true"${color ? ` data-color="${color}"` : ''}><path class="fmi-fb" d="M5 14.5A4.5 4.5 0 0 1 9.5 10h14.2a4 4 0 0 1 2.9 1.2l3.6 3.6a4 4 0 0 0 2.8 1.2h21.5a4.5 4.5 0 0 1 4.5 4.5V49a4.5 4.5 0 0 1-4.5 4.5h-45A4.5 4.5 0 0 1 5 49z"/><path class="fmi-ff" d="M5 23.5A4.5 4.5 0 0 1 9.5 19h45a4.5 4.5 0 0 1 4.5 4.5V50a4.5 4.5 0 0 1-4.5 4.5h-45A4.5 4.5 0 0 1 5 50z"/><path class="fmi-fh" d="M9.5 19h45a4.5 4.5 0 0 1 4.5 4.5v1A4.5 4.5 0 0 0 54.5 20h-45A4.5 4.5 0 0 0 5 24.5v-1A4.5 4.5 0 0 1 9.5 19z"/>${g}</svg>`;
}

function docArt(type) {
  const t = GLYPH[type] ? type : 'unknown';
  const label = type === 'txt' ? '' : LABEL[t];
  return `<svg class="fmi fmi--${t}" viewBox="0 0 64 64" aria-hidden="true">${PAGE}${GLYPH[t]()}${band(t, label)}</svg>`;
}

/** Artwork for an entry (no thumbnail): folders get a glyph from entry.glyph and a tint from entry.color. */
function fileArt(entry) {
  const t = typeOf(entry);
  if (t === 'folder') return folderArt(entry.glyph, entry.color);
  return docArt(t === 'txt' && /\.md$/i.test(entry.name || '') ? 'txt' : t);
}
const typeColor = (t) => COLORS[t] || COLORS.unknown;
return Object.freeze({ EXT, extOf, typeOf, folderArt, docArt, fileArt, typeColor });
})();

/* ---- modules/files/files-adapter.js ---- */
const __ac_m1c = F["modules/files/files-adapter.js"] = (() => {
const { typeOf } = __ac_m1b;
/* In-memory storage adapter for the files module — the reference implementation of the adapter contract
   (docs/files.md). Every method is async and returns plain copies, never live nodes.
   const fs = memoryAdapter({ root, tags, users, locations, trash }, { latency: 40, preview(node) → {kind,url,text,poster} });
   Node seed: { name, children?: [...], size, modified, created, tags, starred, shared, comment, glyph, color,
                thumb, duration, dims, doc: { type, number, date, parties, expiry }, status, ocr, text, versions } */


const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'; const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
/** Search key: lower case, Arabic ي/ك → Persian, digits → Latin, no ZWNJ / tatweel / diacritics. */
function normalize(s) {
  return String(s ?? '').toLowerCase()
    .replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک').replace(/[ة]/g, 'ه').replace(/[أإآ]/g, 'ا')
    .replace(/[۰-۹]/g, (d) => FA_DIGITS.indexOf(d)).replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d))
    .replace(/[‌‍ـً-ٟ]/g, '').replace(/\s+/g, ' ').trim();
}
const err = (code, message) => Object.assign(new Error(message || code), { code });
const DAY = 864e5;
const READ_KIND = { image: 'image', pdf: 'pdf', video: 'video', audio: 'audio', txt: 'text', code: 'text', doc: 'office', xls: 'office', ppt: 'office' };

function memoryAdapter(seed = {}, opts = {}) {
  const nodes = new Map();
  let seq = 0;
  const now = () => new Date().toISOString();
  const latency = opts.latency ?? 30;
  const wait = (ms = latency) => new Promise((r) => setTimeout(r, ms ? ms * (0.6 + Math.random() * 0.8) : 0));
  const tags = (seed.tags || []).map((t) => ({ ...t }));
  const users = (seed.users || []).map((u) => ({ ...u }));
  const locations = (seed.locations || []).map((l) => ({ ...l }));
  const shares = [];

  function add(n, parent) {
    const id = n.id || `n${++seq}`;
    const isFolder = Array.isArray(n.children) || n.kind === 'folder';
    const node = {
      id, name: n.name, kind: isFolder ? 'folder' : 'file', parent: parent ?? null,
      type: isFolder ? 'folder' : (n.type || typeOf(n.name)),
      size: isFolder ? 0 : (n.size ?? 0), created: n.created || n.modified || now(), modified: n.modified || n.created || now(),
      opened: n.opened || null, tags: [...(n.tags || [])], starred: !!n.starred, shared: (n.shared || []).map((s) => ({ ...s })),
      comment: n.comment || '', glyph: n.glyph || '', color: n.color || '', thumb: n.thumb || '', url: n.url || '', duration: n.duration || 0,
      dims: n.dims || null, doc: n.doc ? { ...n.doc } : null, status: n.status || '', ocr: n.ocr || '', owner: n.owner || seed.me || '',
      text: n.text ?? null, versions: (n.versions || []).map((v) => ({ ...v })), activity: (n.activity || []).map((a) => ({ ...a })),
      trashed: !!n.trashed, trashedAt: n.trashedAt || null, from: n.from ?? null, extra: n.extra ? { ...n.extra } : null,
    };
    nodes.set(id, node);
    if (isFolder) for (const c of n.children || []) add(c, id);
    return node;
  }
  const root = add({ id: 'root', name: seed.root?.name || 'Home', children: seed.root?.children || [], glyph: 'home' }, null);
  for (const t of seed.trash || []) { const n = add(t, root.id); n.trashed = true; n.trashedAt ||= new Date(Date.now() - 3 * DAY).toISOString(); n.from = root.id; }

  const childrenOf = (id) => [...nodes.values()].filter((n) => n.parent === id && !n.trashed);
  const live = (n) => { for (let x = n; x; x = nodes.get(x.parent)) if (x.trashed) return false; return true; };
  const sizeOf = (n) => (n.kind === 'folder' ? childrenOf(n.id).reduce((s, c) => s + sizeOf(c), 0) : n.size);
  const pathOf = (n) => { const p = []; for (let x = n; x; x = nodes.get(x.parent)) p.unshift({ id: x.id, name: x.name }); return p; };
  const isInside = (id, ancestor) => { for (let x = nodes.get(id); x; x = nodes.get(x.parent)) if (x.id === ancestor) return true; return false; };
  function out(n) {
    const kids = n.kind === 'folder' ? childrenOf(n.id) : null;
    return {
      ...n, tags: [...n.tags], shared: n.shared.map((s) => ({ ...s })), doc: n.doc ? { ...n.doc } : null, versions: undefined, activity: undefined, text: undefined,
      size: n.kind === 'folder' ? sizeOf(n) : n.size, count: kids ? kids.length : undefined,
      hasFolders: kids ? kids.some((k) => k.kind === 'folder') : false, path: pathOf(n), versionCount: n.versions.length,
    };
  }
  const get = (id) => { const n = nodes.get(id); if (!n) throw err('ENOENT', `Not found: ${id}`); return n; };
  const nameTaken = (parent, name, except) => childrenOf(parent).some((c) => c.id !== except && normalize(c.name) === normalize(name));
  function uniqueName(parent, name, suffix = '') {
    if (!nameTaken(parent, name) && !suffix) return name;
    const m = /^(.*?)(\.[^.\s]{1,8})?$/.exec(name); const base = m[1]; const ext = m[2] || '';
    let cand = suffix ? `${base} ${suffix}${ext}` : name;
    for (let i = 2; nameTaken(parent, cand); i++) cand = `${base}${suffix ? ` ${suffix}` : ''} (${i})${ext}`;
    return cand;
  }
  const log = (n, action, extra = {}) => n.activity.unshift({ action, at: now(), by: seed.me || '', ...extra });
  const touch = (id) => { const p = nodes.get(id); if (p) p.modified = now(); };

  function deepCopy(n, parent, name) {
    const c = add({ ...n, id: undefined, name: name || n.name, children: undefined, kind: n.kind, created: now(), modified: now(), shared: [], versions: [], activity: [] }, parent);
    c.kind = n.kind; c.type = n.type;
    if (n.kind === 'folder') for (const k of childrenOf(n.id)) deepCopy(k, c.id);
    return c;
  }

  const api = {
    name: 'memory',
    capabilities: { pause: true, versions: true, share: true, tags: true, trash: true, search: true, upload: true, comments: true },
    async info() { await wait(0); return { root: root.id, name: root.name }; },
    async locations() { await wait(0); return locations.map((l) => ({ ...l })); },
    async tags() { await wait(0); return tags.map((t) => ({ ...t, count: [...nodes.values()].filter((n) => live(n) && n.tags.includes(t.id)).length })); },
    async users() { await wait(0); return users.map((u) => ({ ...u })); },

    /** list(folderId | '@recent' | '@starred' | '@shared' | '@trash' | '@tag:<id>') → Entry[] */
    async list(id = root.id) {
      await wait();
      const all = [...nodes.values()];
      if (id === '@recent') return all.filter((n) => n.kind === 'file' && live(n)).sort((a, b) => new Date(b.opened || b.modified) - new Date(a.opened || a.modified)).slice(0, 24).map(out);
      if (id === '@starred') return all.filter((n) => n.starred && live(n)).map(out);
      if (id === '@shared') return all.filter((n) => n.shared.length && live(n) && !(nodes.get(n.parent)?.shared.length)).map(out);
      if (id === '@trash') return all.filter((n) => n.trashed).map(out);
      if (id.startsWith('@tag:')) { const t = id.slice(5); return all.filter((n) => n.tags.includes(t) && live(n)).map(out); }
      const f = get(id);
      if (f.kind !== 'folder') throw err('ENOTDIR');
      return childrenOf(id).map(out);
    },
    async stat(id) { await wait(0); return out(get(id)); },
    /** Preview source: { kind: 'image'|'pdf'|'video'|'audio'|'text'|'office'|'none', url?, text? } — { peek: true } does not touch "last opened". */
    async read(id, o = {}) {
      await wait(o.peek ? 0 : latency);
      const n = get(id); if (!o.peek) n.opened = now();
      if (n.text != null) return { kind: 'text', text: n.text, url: n.url || '' };
      const custom = await opts.preview?.(out(n)); if (custom) return custom;
      if (n.url) return { kind: READ_KIND[n.type] || 'none', url: n.url };
      return { kind: n.thumb && n.type === 'image' ? 'image' : 'none', url: n.thumb || '' };
    },
    /** Optional: a server-made preview image (first page, poster, rendition). null → the UI renders one from read(). */
    async thumbnail(entry) { const n = nodes.get(entry.id); return n?.thumb || null; },
    async exists(parent, name) { await wait(0); return childrenOf(parent).find((c) => normalize(c.name) === normalize(name))?.id || null; },

    /** upload(folderId, file, { onProgress(loaded, total), signal, isPaused(), conflict: 'replace'|'keep', name }) → Entry */
    upload(parent, file, o = {}) {
      return new Promise((resolve, reject) => {
        const total = file.size || 1; let loaded = 0; let last = performance.now();
        const speed = Math.max(total / 7, Math.min(total / 1.4, 2.6e6)) / 1000; // bytes per ms: 1.4–7 s per file
        const fail = opts.failUpload?.(file);
        const tick = () => {
          if (o.signal?.aborted) { reject(err('ABORT', 'Upload cancelled')); return; }
          const t = performance.now(); const dt = t - last; last = t;
          if (!o.isPaused?.()) loaded = Math.min(total, loaded + speed * dt);
          o.onProgress?.(loaded, total);
          if (fail && loaded / total > 0.55) { reject(err('EIO', typeof fail === 'string' ? fail : 'Upload failed')); return; }
          if (loaded < total) { setTimeout(tick, 60); return; }
          const existing = childrenOf(parent).find((c) => normalize(c.name) === normalize(o.name || file.name));
          let n;
          if (existing && o.conflict === 'replace') {
            existing.versions.unshift({ id: `v${++seq}`, date: existing.modified, size: existing.size, by: existing.owner, note: '' });
            Object.assign(existing, { size: file.size, modified: now(), url: o.url || existing.url, thumb: '' });
            log(existing, 'replace'); n = existing;
          } else {
            n = add({ name: uniqueName(parent, o.name || file.name), size: file.size, url: o.url || '', created: now(), modified: now(), extra: o.extra }, parent);
            log(n, 'upload');
          }
          touch(parent);
          resolve(out(n));
        };
        setTimeout(tick, 60);
      });
    },
    async mkdir(parent, name) { await wait(); const n = add({ name: uniqueName(parent, name), children: [] }, parent); log(n, 'create'); touch(parent); return out(n); },
    async rename(id, name) {
      await wait(); const n = get(id); name = String(name).trim();
      if (!name || /[\\/]/.test(name)) throw err('EINVAL', 'Invalid name');
      if (nameTaken(n.parent, name, id)) throw err('EXIST', 'Name already exists');
      log(n, 'rename', { from: n.name }); n.name = name; n.type = n.kind === 'folder' ? 'folder' : typeOf(name); n.modified = now(); return out(n);
    },
    async move(ids, parent) {
      await wait(); const dest = get(parent); const moved = [];
      for (const id of ids) {
        const n = get(id);
        if (n.parent === parent || id === parent || isInside(parent, id) || dest.kind !== 'folder') continue;
        n.name = uniqueName(parent, n.name); n.parent = parent; log(n, 'move', { to: dest.name }); moved.push(out(n));
      }
      touch(parent); return moved;
    },
    async copy(ids, parent, { suffix } = {}) {
      await wait(); const made = [];
      for (const id of ids) { const n = get(id); if (isInside(parent, id)) continue; const c = deepCopy(n, parent, uniqueName(parent, n.name, n.parent === parent ? (suffix || 'copy') : '')); log(c, 'copy', { from: n.name }); made.push(out(c)); }
      touch(parent); return made;
    },
    async compress(ids, parent, name = 'Archive.zip') {
      await wait(latency * 4);
      const size = ids.reduce((s, id) => s + sizeOf(get(id)), 0);
      const n = add({ name: uniqueName(parent, name), size: Math.round(size * 0.62) }, parent); log(n, 'compress'); touch(parent); return out(n);
    },
    async trash(ids) { await wait(); for (const id of ids) { const n = get(id); n.trashed = true; n.trashedAt = now(); n.from = n.parent; log(n, 'trash'); } return true; },
    async restore(ids) {
      await wait();
      for (const id of ids) { const n = get(id); const back = nodes.get(n.from) && live(nodes.get(n.from)) ? n.from : root.id; n.trashed = false; n.name = uniqueName(back, n.name, ''); n.parent = back; log(n, 'restore'); }
      return true;
    },
    async remove(ids) {
      await wait();
      const kill = (id) => { for (const c of [...nodes.values()].filter((x) => x.parent === id)) kill(c.id); nodes.delete(id); };
      ids.forEach(kill); return true;
    },
    async emptyTrash() { await wait(); return api.remove([...nodes.values()].filter((n) => n.trashed).map((n) => n.id)); },

    /** search(query, { scope: folderId|null, kind, date: 'today'|'week'|'month'|'year', size: 'small'|'medium'|'large', tag }) */
    async search(q, f = {}) {
      await wait();
      const words = normalize(q).split(' ').filter(Boolean);
      const since = { today: 1, week: 7, month: 30, year: 365 }[f.date];
      const sizeOk = (n) => !f.size || (f.size === 'small' ? n.size < 1e6 : f.size === 'medium' ? n.size >= 1e6 && n.size < 1e8 : n.size >= 1e8);
      return [...nodes.values()].filter((n) => n.id !== root.id && live(n)
        && (!f.scope || f.scope === root.id || isInside(n.id, f.scope) && n.id !== f.scope)
        && (!f.kind || (f.kind === 'folder' ? n.kind === 'folder' : f.kind === 'document' ? ['pdf', 'doc', 'xls', 'ppt', 'txt'].includes(n.type) : n.type === f.kind))
        && (!since || Date.now() - new Date(n.modified) < since * DAY) && sizeOk(n) && (!f.tag || n.tags.includes(f.tag))
        && words.every((w) => normalize(`${n.name} ${n.comment} ${n.doc ? Object.values(n.doc).join(' ') : ''}`).includes(w))).slice(0, 200).map(out);
    },
    async share(id, o = {}) {
      await wait(); const n = get(id);
      const token = Math.random().toString(36).slice(2, 10);
      const link = { id: token, url: `${opts.shareBase || 'https://files.example.com/s/'}${token}`, expires: o.expires ? new Date(Date.now() + o.expires * DAY).toISOString() : null, password: !!o.password, permission: o.permission || 'view' };
      shares.push({ ...link, node: id }); log(n, 'share'); return link;
    },
    async versions(id) {
      await wait(); const n = get(id);
      return [{ id: 'current', date: n.modified, size: n.size, by: n.owner, current: true }, ...n.versions.map((v) => ({ ...v }))];
    },
    async restoreVersion(id, vid) {
      await wait(); const n = get(id); const v = n.versions.find((x) => x.id === vid); if (!v) throw err('ENOENT');
      n.versions = n.versions.filter((x) => x !== v);
      n.versions.unshift({ id: `v${++seq}`, date: n.modified, size: n.size, by: n.owner });
      n.size = v.size; n.modified = now(); log(n, 'restoreVersion', { version: v.date }); return out(n);
    },
    async activity(id) { await wait(0); return get(id).activity.map((a) => ({ ...a })); },
    /** update(id, { starred, tags, comment, doc, status, ocr, shared, color }) */
    async update(id, patch = {}) {
      await wait(0); const n = get(id);
      for (const k of ['starred', 'tags', 'comment', 'doc', 'status', 'ocr', 'shared', 'color']) if (k in patch) n[k] = Array.isArray(patch[k]) ? patch[k].map((x) => (typeof x === 'object' ? { ...x } : x)) : (patch[k] && typeof patch[k] === 'object' ? { ...patch[k] } : patch[k]);
      if ('comment' in patch || 'doc' in patch || 'status' in patch) log(n, 'edit');
      return out(n);
    },
    async tag(ids, tag, on = true) { await wait(0); for (const id of ids) { const n = get(id); n.tags = on ? [...new Set([...n.tags, tag])] : n.tags.filter((t) => t !== tag); } return true; },
    async freeSpace() { await wait(0); const l = locations.find((x) => x.primary) || locations[0]; return l ? l.total - l.used : null; },
  };
  return api;
}
return Object.freeze({ normalize, memoryAdapter });
})();

/* ---- modules/files/files-preview.js ---- */
const __ac_m1d = F["modules/files/files-preview.js"] = (() => {
const { typeOf, extOf, fileArt } = __ac_m1b;
/* Content previews for the files module: real thumbnails (images downscaled on a canvas, a video frame at ~1 s,
   the first lines of text / code / Markdown / CSV as a mini page, an audio waveform, PDF first page through an
   OPTIONAL pdf.js plugin) and the large live preview used by the preview pane, the column view and Quick Look.
   Order: adapter.thumbnail(entry, size) (server renditions) → client rendering from adapter.read(id, { peek: true }).
   Results are cached per id + modified date; thumbnails load lazily through one IntersectionObserver.
   pdf.js is never bundled: AC.files.pdfjs = { src: '…/pdf.min.mjs', worker: '…/pdf.worker.min.mjs' } (Apache-2.0). */


const plugins = { pdfjs: null };
const TEXT_TYPES = new Set(['txt', 'code']);
const LIVE_TYPES = new Set(['image', 'video', 'pdf', 'txt', 'code', 'audio', 'doc', 'xls', 'ppt']);

/** Tiny Markdown → HTML (headings, lists, quotes, code, bold/italic/code/links). Escapes first; used when AC.markdown is absent. */
function miniMarkdown(src, esc) {
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
function parseCSV(text, limit = 1000) {
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

function createPreviewer(AC, fs, { esc, t, size }) {
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
return Object.freeze({ plugins, miniMarkdown, parseCSV, createPreviewer });
})();

/* ---- modules/files/files.js ---- */
const __ac_m1a = F["modules/files/files.js"] = (() => {
const { fileArt, folderArt, typeOf, extOf } = __ac_m1b;
const { memoryAdapter, normalize } = __ac_m1c;
const { createPreviewer, plugins, miniMarkdown, parseCSV } = __ac_m1d;
/* Files module — a Finder / Explorer-class file, document and records manager on a pluggable storage adapter.
   const fm = AC.files(el, { adapter, view: 'icons'|'list'|'columns'|'gallery', start, favorites: [ids], id: 'files' });
   <div data-ac="files"></div> (empty in-memory adapter) · adapter contract + events: docs/files.md
   API: go(loc) open(id) select(ids) refresh() setView(v) quickLook(id) info(open?) upload(fileList) destroy() · fm.state
   Events (bubble from el): ac:files:navigate {loc} · select {ids} · open {entry} (cancelable) · change {action, ids} · upload {entry}
   Dependency-free: install(AC) wires it into window.AC (no core import). */






/* ------------------------------------------------------------------ strings: key → [en, fa, ar] */
const S = {
  allFiles: ['All Files', 'همهٔ فایل‌ها', 'كل الملفات'], recent: ['Recents', 'اخیر', 'الأخيرة'], starred: ['Starred', 'ستاره‌دار', 'المميزة بنجمة'],
  shared: ['Shared', 'اشتراکی', 'المشتركة'], trash: ['Trash', 'سطل زباله', 'سلة المهملات'], favorites: ['Favorites', 'برگزیده‌ها', 'المفضلة'],
  locations: ['Locations', 'مکان‌ها', 'المواقع'], tags: ['Tags', 'برچسب‌ها', 'الوسوم'], browse: ['Browse', 'مرور', 'تصفح'],
  back: ['Back', 'بازگشت', 'رجوع'], forward: ['Forward', 'جلو', 'تقدم'], sidebar: ['Show sidebar', 'نوار کناری', 'الشريط الجانبي'],
  path: ['Path', 'مسیر', 'المسار'], editPath: ['Go to folder…', 'رفتن به پوشه…', 'الانتقال إلى مجلد…'], view: ['View', 'نما', 'العرض'],
  icons: ['Icons', 'آیکون', 'أيقونات'], list: ['List', 'فهرست', 'قائمة'], columns: ['Columns', 'ستونی', 'أعمدة'], gallery: ['Gallery', 'گالری', 'معرض'],
  sortBy: ['Sort by', 'مرتب‌سازی بر اساس', 'الترتيب حسب'], groupBy: ['Group by', 'گروه‌بندی', 'التجميع حسب'], none: ['None', 'هیچ', 'بدون'],
  name: ['Name', 'نام', 'الاسم'], modified: ['Date Modified', 'تاریخ تغییر', 'تاريخ التعديل'], created: ['Date Created', 'تاریخ ایجاد', 'تاريخ الإنشاء'],
  size: ['Size', 'حجم', 'الحجم'], kind: ['Kind', 'نوع', 'النوع'], status: ['Status', 'وضعیت', 'الحالة'], date: ['Date', 'تاریخ', 'التاريخ'],
  ascending: ['Ascending', 'صعودی', 'تصاعدي'], descending: ['Descending', 'نزولی', 'تنازلي'], foldersFirst: ['Folders on top', 'پوشه‌ها در ابتدا', 'المجلدات أولاً'],
  search: ['Search', 'جستجو', 'بحث'], searchIn: ['Search in “{name}”', 'جستجو در «{name}»', 'بحث في «{name}»'], thisFolder: ['This folder', 'همین پوشه', 'هذا المجلد'],
  everywhere: ['All files', 'همه جا', 'كل الملفات'], results: ['Search results', 'نتایج جستجو', 'نتائج البحث'], anyKind: ['Kind', 'نوع', 'النوع'], anyDate: ['Date', 'تاریخ', 'التاريخ'],
  anySize: ['Size', 'حجم', 'الحجم'], anyTag: ['Tag', 'برچسب', 'وسم'], clearFilters: ['Clear', 'پاک کردن', 'مسح'],
  today: ['Today', 'امروز', 'اليوم'], yesterday: ['Yesterday', 'دیروز', 'أمس'], week: ['Previous 7 Days', '۷ روز گذشته', 'آخر 7 أيام'], month: ['Previous 30 Days', '۳۰ روز گذشته', 'آخر 30 يومًا'],
  year: ['This year', 'امسال', 'هذا العام'], small: ['Small (< 1 MB)', 'کوچک (کمتر از ۱ مگابایت)', 'صغير (< 1 ميغابايت)'], medium: ['Medium (1–100 MB)', 'متوسط (۱ تا ۱۰۰ مگابایت)', 'متوسط (1–100 ميغابايت)'],
  large: ['Large (> 100 MB)', 'بزرگ (بیش از ۱۰۰ مگابایت)', 'كبير (> 100 ميغابايت)'], documents: ['Documents', 'اسناد', 'المستندات'],
  newFolder: ['New Folder', 'پوشهٔ جدید', 'مجلد جديد'], untitled: ['untitled folder', 'پوشهٔ بی‌نام', 'مجلد بلا عنوان'], upload: ['Upload', 'آپلود', 'رفع'],
  share: ['Share…', 'اشتراک‌گذاری…', 'مشاركة…'], more: ['More', 'بیشتر', 'المزيد'], info: ['Get Info', 'مشخصات', 'معلومات'],
  open: ['Open', 'باز کردن', 'فتح'], quickLook: ['Quick Look', 'نگاه سریع', 'نظرة سريعة'], rename: ['Rename', 'تغییر نام', 'إعادة تسمية'],
  duplicate: ['Duplicate', 'تکثیر', 'تكرار'], compress: ['Compress', 'فشرده‌سازی', 'ضغط'], moveTo: ['Move to', 'انتقال به', 'نقل إلى'],
  copy: ['Copy', 'کپی', 'نسخ'], cut: ['Cut', 'برش', 'قص'], paste: ['Paste', 'جای‌گذاری', 'لصق'], copyLink: ['Copy Link', 'کپی پیوند', 'نسخ الرابط'],
  star: ['Add to Starred', 'افزودن ستاره', 'إضافة نجمة'], unstar: ['Remove Star', 'حذف ستاره', 'إزالة النجمة'], toTrash: ['Move to Trash', 'انتقال به سطل زباله', 'نقل إلى المهملات'],
  restore: ['Put Back', 'بازگرداندن', 'إرجاع'], deleteNow: ['Delete Immediately…', 'حذف همیشگی…', 'حذف نهائي…'], emptyTrash: ['Empty Trash', 'خالی کردن سطل', 'إفراغ المهملات'],
  emptyTrashQ: ['Permanently erase {n} items in the Trash?', '{n} مورد در سطل زباله برای همیشه پاک شود؟', 'حذف {n} عناصر نهائيًا؟'], cantUndo: ['You can’t undo this action.', 'این کار برگشت‌پذیر نیست.', 'لا يمكن التراجع عن هذا الإجراء.'],
  deleteQ: ['Delete “{name}” immediately?', '«{name}» برای همیشه حذف شود؟', 'حذف «{name}» نهائيًا؟'], deleteNQ: ['Delete {n} items immediately?', '{n} مورد برای همیشه حذف شود؟', 'حذف {n} عناصر نهائيًا؟'],
  erase: ['Delete', 'حذف', 'حذف'], items: ['{n} items', '{n} مورد', '{n} عناصر'], item1: ['1 item', '۱ مورد', 'عنصر واحد'],
  selected: ['{n} selected', '{n} انتخاب‌شده', '{n} محدد'], free: ['{size} available', '{size} فضای آزاد', '{size} متاح'], iconSize: ['Icon size', 'اندازهٔ آیکون', 'حجم الأيقونات'],
  trashed: ['Moved {n} items to the Trash', '{n} مورد به سطل زباله رفت', 'نُقل {n} عناصر إلى المهملات'], trashed1: ['Moved “{name}” to the Trash', '«{name}» به سطل زباله رفت', 'نُقل «{name}» إلى المهملات'],
  moved: ['Moved {n} items to “{to}”', '{n} مورد به «{to}» منتقل شد', 'نُقل {n} عناصر إلى «{to}»'], copied: ['Copied {n} items to “{to}”', '{n} مورد در «{to}» کپی شد', 'نُسخ {n} عناصر إلى «{to}»'],
  restored: ['Put back {n} items', '{n} مورد بازگردانده شد', 'أُرجع {n} عناصر'], deleted: ['Deleted {n} items', '{n} مورد حذف شد', 'حُذف {n} عناصر'],
  clipCopy: ['{n} items ready to paste', '{n} مورد برای جای‌گذاری آماده است', '{n} عناصر جاهزة للصق'], linkCopied: ['Link copied', 'پیوند کپی شد', 'تم نسخ الرابط'],
  renamed: ['Renamed', 'نام تغییر کرد', 'تمت إعادة التسمية'], nameTaken: ['The name “{name}” is already taken.', 'نام «{name}» قبلاً استفاده شده است.', 'الاسم «{name}» مستخدم بالفعل.'],
  invalidName: ['That name can’t be used.', 'این نام قابل استفاده نیست.', 'لا يمكن استخدام هذا الاسم.'], noPath: ['The folder can’t be found.', 'پوشه پیدا نشد.', 'تعذر العثور على المجلد.'],
  emptyFolder: ['This folder is empty', 'این پوشه خالی است', 'هذا المجلد فارغ'], emptyFolderText: ['Drop files here or use Upload.', 'فایل‌ها را اینجا رها کنید یا آپلود بزنید.', 'أفلت الملفات هنا أو استخدم الرفع.'],
  noResults: ['No results', 'نتیجه‌ای پیدا نشد', 'لا توجد نتائج'], noResultsText: ['Try other words or clear the filters.', 'کلمهٔ دیگری امتحان کنید یا فیلترها را پاک کنید.', 'جرّب كلمات أخرى أو امسح عوامل التصفية.'],
  trashEmpty: ['Trash is empty', 'سطل زباله خالی است', 'سلة المهملات فارغة'], dropHere: ['Drop to upload to “{name}”', 'رها کنید تا در «{name}» آپلود شود', 'أفلت للرفع إلى «{name}»'],
  folder: ['Folder', 'پوشه', 'مجلد'], 'k.pdf': ['PDF document', 'سند PDF', 'مستند PDF'], 'k.doc': ['Word document', 'سند Word', 'مستند Word'], 'k.xls': ['Spreadsheet', 'صفحه‌گسترده', 'جدول بيانات'],
  'k.ppt': ['Presentation', 'ارائه', 'عرض تقديمي'], 'k.image': ['Image', 'تصویر', 'صورة'], 'k.video': ['Movie', 'ویدیو', 'فيديو'], 'k.audio': ['Audio', 'صوت', 'صوت'],
  'k.zip': ['ZIP archive', 'فایل فشرده', 'أرشيف مضغوط'], 'k.code': ['Source code', 'کد منبع', 'شيفرة مصدرية'], 'k.txt': ['Plain text', 'متن ساده', 'نص عادي'], 'k.unknown': ['Document', 'فایل', 'ملف'],
  general: ['General', 'عمومی', 'عام'], where: ['Where', 'محل', 'الموقع'], opened: ['Last opened', 'آخرین بازکردن', 'آخر فتح'], dims: ['Dimensions', 'ابعاد', 'الأبعاد'], duration: ['Duration', 'مدت', 'المدة'],
  record: ['Document record', 'مشخصات سند', 'بيانات المستند'], docType: ['Document type', 'نوع سند', 'نوع المستند'], docNumber: ['Number', 'شماره', 'الرقم'], docDate: ['Document date', 'تاریخ سند', 'تاريخ المستند'],
  parties: ['Parties', 'طرفین', 'الأطراف'], expiry: ['Expiry date', 'تاریخ انقضا', 'تاريخ الانتهاء'], remind: ['Remind me 30 days before', 'یادآوری ۳۰ روز قبل', 'ذكّرني قبل 30 يومًا'],
  approval: ['Approval', 'وضعیت تأیید', 'الاعتماد'], draft: ['Draft', 'پیش‌نویس', 'مسودة'], review: ['Under review', 'در حال بررسی', 'قيد المراجعة'], approved: ['Approved', 'تأییدشده', 'معتمد'], signed: ['Signed', 'امضاشده', 'موقّع'],
  ocr: ['OCR', 'OCR', 'OCR'], ocrDone: ['Text recognized', 'متن شناسایی شد', 'تم التعرف على النص'], ocrPending: ['Recognizing text…', 'در حال شناسایی متن…', 'جارٍ التعرف على النص…'], ocrNone: ['No text layer', 'بدون لایهٔ متن', 'بلا طبقة نص'], runOcr: ['Run OCR', 'شناسایی متن', 'تشغيل OCR'],
  expired: ['Expired', 'منقضی‌شده', 'منتهي'], daysLeft: ['{n} days left', '{n} روز مانده', 'متبقٍ {n} يوم'], expiresSoon: ['Expires soon', 'به‌زودی منقضی می‌شود', 'ينتهي قريبًا'],
  addTag: ['Add tag', 'افزودن برچسب', 'إضافة وسم'], comments: ['Comments', 'یادداشت', 'تعليقات'], commentPh: ['Add a comment…', 'یادداشتی بنویسید…', 'أضف تعليقًا…'],
  sharing: ['Sharing & Permissions', 'اشتراک و دسترسی', 'المشاركة والأذونات'], owner: ['Owner', 'مالک', 'المالك'], editor: ['Can edit', 'ویرایشگر', 'يمكنه التعديل'], viewer: ['Can view', 'بیننده', 'يمكنه العرض'],
  commenter: ['Can comment', 'نظردهنده', 'يمكنه التعليق'], onlyYou: ['Only you have access', 'فقط شما دسترسی دارید', 'أنت فقط لديك صلاحية'], versions: ['Version history', 'تاریخچهٔ نسخه‌ها', 'سجل الإصدارات'],
  current: ['Current', 'نسخهٔ فعلی', 'الحالي'], restoreVersion: ['Restore', 'بازیابی', 'استعادة'], versionRestored: ['Version restored', 'نسخه بازیابی شد', 'تمت استعادة الإصدار'], activity: ['Activity', 'فعالیت‌ها', 'النشاط'],
  'a.upload': ['uploaded', 'آپلود کرد', 'رفع'], 'a.create': ['created', 'ایجاد کرد', 'أنشأ'], 'a.rename': ['renamed', 'نام را تغییر داد', 'أعاد التسمية'], 'a.move': ['moved', 'جابه‌جا کرد', 'نقل'],
  'a.copy': ['copied', 'کپی کرد', 'نسخ'], 'a.trash': ['moved to Trash', 'به سطل زباله برد', 'نقل إلى المهملات'], 'a.restore': ['put back', 'بازگرداند', 'أرجع'], 'a.share': ['shared', 'به اشتراک گذاشت', 'شارك'],
  'a.edit': ['edited details', 'مشخصات را ویرایش کرد', 'عدّل التفاصيل'], 'a.replace': ['replaced', 'جایگزین کرد', 'استبدل'], 'a.compress': ['compressed', 'فشرده کرد', 'ضغط'], 'a.restoreVersion': ['restored a version', 'نسخه‌ای را بازیابی کرد', 'استعاد إصدارًا'],
  'a.sign': ['signed', 'امضا کرد', 'وقّع'], 'a.review': ['sent for review', 'برای بررسی فرستاد', 'أرسل للمراجعة'], 'a.view': ['viewed', 'مشاهده کرد', 'عرض'],
  previewPane: ['Preview', 'پیش‌نمایش', 'معاينة'],
  noSelection: ['No selection', 'موردی انتخاب نشده', 'لا يوجد تحديد'], multi: ['{n} items', '{n} مورد', '{n} عناصر'], close: ['Close', 'بستن', 'إغلاق'],
  shareTitle: ['Share “{name}”', 'اشتراک‌گذاری «{name}»', 'مشاركة «{name}»'], shareSub: ['Anyone with the link can open it with the permissions below.', 'هر کس پیوند را داشته باشد با دسترسی زیر می‌تواند آن را باز کند.', 'يمكن لأي شخص لديه الرابط فتحه بالأذونات أدناه.'],
  link: ['Link', 'پیوند', 'الرابط'], createLink: ['Create link', 'ساخت پیوند', 'إنشاء رابط'], expires: ['Link expires', 'انقضای پیوند', 'انتهاء الرابط'], never: ['Never', 'هرگز', 'أبدًا'],
  day1: ['1 day', '۱ روز', 'يوم واحد'], day7: ['7 days', '۷ روز', '7 أيام'], day30: ['30 days', '۳۰ روز', '30 يومًا'], password: ['Require password', 'رمز عبور لازم است', 'يتطلب كلمة مرور'], passwordPh: ['Password', 'رمز عبور', 'كلمة المرور'],
  permission: ['Permission', 'سطح دسترسی', 'الصلاحية'], people: ['People with access', 'افراد دارای دسترسی', 'الأشخاص الذين لديهم صلاحية'], addPeople: ['Add people', 'افزودن افراد', 'إضافة أشخاص'], done: ['Done', 'تمام', 'تم'],
  uploading: ['Uploading {n} items', 'در حال آپلود {n} مورد', 'جارٍ رفع {n} عناصر'], uploaded: ['{n} uploads complete', '{n} آپلود کامل شد', 'اكتمل رفع {n}'], uploadFailed: ['{n} failed', '{n} ناموفق', 'فشل {n}'],
  pause: ['Pause', 'توقف', 'إيقاف مؤقت'], resume: ['Resume', 'ادامه', 'استئناف'], cancel: ['Cancel', 'انصراف', 'إلغاء'], retry: ['Retry', 'تلاش دوباره', 'إعادة المحاولة'], waiting: ['Waiting…', 'در صف…', 'في الانتظار…'],
  paused: ['Paused', 'متوقف', 'متوقف'], cancelled: ['Cancelled', 'لغو شد', 'أُلغي'], skipped: ['Skipped', 'رد شد', 'تم التخطي'], left: ['{t} left', '{t} مانده', 'متبقٍ {t}'], collapse: ['Collapse', 'جمع کردن', 'طي'],
  conflictT: ['“{name}” already exists', '«{name}» از قبل وجود دارد', '«{name}» موجود بالفعل'], conflictX: ['An item with the same name is already in “{folder}”. Replace it, or keep both?', 'موردی با همین نام در «{folder}» هست. جایگزین شود یا هر دو بمانند؟', 'يوجد عنصر بالاسم نفسه في «{folder}». هل تستبدله أم تحتفظ بالاثنين؟'],
  replace: ['Replace', 'جایگزین کن', 'استبدال'], keepBoth: ['Keep Both', 'هر دو بماند', 'الاحتفاظ بالاثنين'], skip: ['Skip', 'رد کن', 'تخطي'], applyAll: ['Apply to all', 'برای همه اعمال شود', 'تطبيق على الكل'],
  select: ['Select', 'انتخاب', 'تحديد'], selectAll: ['Select All', 'انتخاب همه', 'تحديد الكل'], deselectAll: ['Deselect All', 'لغو انتخاب', 'إلغاء التحديد'],
  zoomIn: ['Zoom in', 'بزرگ‌نمایی', 'تكبير'], zoomOut: ['Zoom out', 'کوچک‌نمایی', 'تصغير'], fit: ['Actual size', 'اندازهٔ اصلی', 'الحجم الفعلي'], prev: ['Previous', 'قبلی', 'السابق'], next: ['Next', 'بعدی', 'التالي'],
  of: ['{i} of {n}', '{i} از {n}', '{i} من {n}'], openIn: ['Open in new tab', 'باز کردن در زبانهٔ جدید', 'فتح في علامة تبويب جديدة'], download: ['Download', 'دانلود', 'تنزيل'],
  noPreview: ['No preview for this kind of file', 'برای این نوع فایل پیش‌نمایشی نیست', 'لا توجد معاينة لهذا النوع'], pdfFallback: ['Your browser can’t show this PDF inline.', 'مرورگر شما نمی‌تواند PDF را اینجا نشان دهد.', 'لا يستطيع متصفحك عرض PDF هنا.'],
  loading: ['Loading…', 'در حال بارگذاری…', 'جارٍ التحميل…'], chooseFolder: ['Choose folder…', 'انتخاب پوشه…', 'اختيار مجلد…'], tagged: ['Tags updated', 'برچسب‌ها به‌روز شد', 'تم تحديث الوسوم'],
  compressed: ['Created “{name}”', '«{name}» ساخته شد', 'تم إنشاء «{name}»'], archiveName: ['Archive.zip', 'بایگانی.zip', 'أرشيف.zip'], copySuffix: ['copy', 'کپی', 'نسخة'],
  bytes: ['bytes', 'بایت', 'بايت'], KB: ['KB', 'کیلوبایت', 'ك.ب'], MB: ['MB', 'مگابایت', 'م.ب'], GB: ['GB', 'گیگابایت', 'غ.ب'], TB: ['TB', 'ترابایت', 'ت.ب'],
  ofTotal: ['{used} of {total}', '{used} از {total}', '{used} من {total}'], viewOptions: ['View options', 'گزینه‌های نما', 'خيارات العرض'], gregorian: ['Gregorian', 'میلادی', 'ميلادي'],
  move: ['Move', 'انتقال', 'نقل'], moveHere: ['Move Here', 'انتقال به اینجا', 'نقل إلى هنا'], selectMode: ['Select', 'انتخاب', 'تحديد'], filters: ['Filters', 'فیلترها', 'عوامل التصفية'],
  tag: ['Tag', 'برچسب', 'وسم'], nTags: ['Tags', 'برچسب‌ها', 'الوسوم'], at: ['{d}, {t}', '{d}، {t}', '{d}، {t}'], sizeBytes: ['{size} ({b} bytes)', '{size} ({b} بایت)', '{size} ({b} بايت)'],
};
const LANG_I = { en: 0, fa: 1, ar: 2 };
const DAY = 864e5;
const VIEWS = ['icons', 'list', 'columns', 'gallery'];
const VIEW_ICON = { icons: 'layout-grid', list: 'list', columns: 'columns-3', gallery: 'gallery-horizontal-end' };
const STATUS_TONE = { draft: 'neutral', review: 'warning', approved: 'success', signed: 'info' };
const TAG_COLORS = { red: '#ef4444', orange: '#f97316', yellow: '#eab308', green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', gray: '#8b8f98' };
const PREVIEWABLE = new Set(['image', 'pdf', 'video', 'audio', 'txt', 'code']);

function cssOnce() {
  if (typeof document === 'undefined' || document.querySelector('[data-ac-module="files"]')) return;
  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = new URL('./files.css', (globalThis.__AC_MODS__?.__base || import.meta.url)).href; link.dataset.acModule = 'files';
    document.head.append(link);
  } catch { /* bundled builds ship the CSS themselves */ }
}

/* ================================================================== the manager */
function createFiles(AC, el, cfg = {}) {
  const esc = AC.escapeHtml;
  const icon = (n, c) => AC.icon(n, c);
  const lang = () => AC.i18n?.lang || document.documentElement.lang || 'fa';
  const t = (k, vars) => {
    const row = S[k]; const fb = row ? (row[LANG_I[lang()] ?? 0] ?? row[0]) : k;
    return AC.t(`fm.${k}`, fb, vars);
  };
  const L = (v) => (v && typeof v === 'object' ? (v[lang()] ?? v.en ?? Object.values(v)[0]) : (v ?? ''));
  const rtl = () => getComputedStyle(el).direction === 'rtl';
  const reduced = () => AC.reducedMotion();
  const phoneMQ = matchMedia('(max-width: 639.98px)');
  const isPhone = () => phoneMQ.matches;
  const fine = matchMedia('(pointer: fine)');
  const key = `ac:files:${cfg.id || el.id || 'default'}`;
  const saved = AC.store.get(key, {}) || {};
  const fs = cfg.adapter || memoryAdapter({});
  const cols0 = { name: 300, date: 180, size: 96, kind: 140, tags: 120, status: 128 };

  const state = {
    loc: null, history: [], future: [], view: saved.view || cfg.view || 'icons', phoneView: saved.phoneView || 'list',
    sort: saved.sort || { key: 'name', dir: 1 }, foldersFirst: saved.foldersFirst ?? true, group: saved.group || 'none',
    iconSize: saved.iconSize || cfg.iconSize || 76, colW: { ...cols0, ...(saved.colW || {}) }, sidebar: saved.sidebar ?? true, info: saved.info ?? false, preview: saved.preview ?? false,
    items: [], here: null, crumbs: [], sel: new Set(), anchor: null, cursor: null, expanded: new Set(), kids: new Map(),
    cols: [], query: '', scope: 'here', filters: {}, results: null, clip: null, selecting: false, tags: [], users: [], locs: [], favorites: [],
    order: [], loading: false, free: null,
  };
  const persist = () => AC.store.set(key, { view: state.view, phoneView: state.phoneView, sort: state.sort, foldersFirst: state.foldersFirst, group: state.group, iconSize: state.iconSize, colW: state.colW, sidebar: state.sidebar, info: state.info, preview: state.preview });
  const curView = () => (isPhone() ? (state.phoneView === 'columns' ? 'list' : state.phoneView) : state.view);
  const cache = new Map(); // id -> entry (everything we have seen)
  const remember = (list) => { for (const e of list) cache.set(e.id, e); return list; };
  const entry = (id) => cache.get(id);
  const isVirtual = (loc) => typeof loc === 'string' && loc.startsWith('@');
  const inTrash = () => state.loc === '@trash';
  const searching = () => !!(state.query.trim() || Object.values(state.filters).some(Boolean));

  /* ---------------------------------------------------------------- formatting */
  const num = (n, o) => AC.format.number(n, o);
  function size(b) {
    if (b == null) return '—';
    if (b < 1024) return `${num(b)} ${t('bytes')}`;
    const u = ['KB', 'MB', 'GB', 'TB']; let i = -1; let v = b;
    do { v /= 1024; i++; } while (v >= 1024 && i < u.length - 1);
    return `${num(v, { maximumFractionDigits: v < 10 ? 1 : 0 })} ${t(u[i])}`;
  }
  const cal = () => (cfg.calendar && cfg.calendar !== 'auto' ? cfg.calendar : lang() === 'fa' ? 'persian' : 'gregory');
  const dateOnly = (d, o = { year: 'numeric', month: 'short', day: 'numeric' }, c = cal()) => AC.format.date(d, { ...o, calendar: c });
  const timeOnly = (d) => AC.format.date(d, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
  function when(iso) {
    if (!iso) return '—';
    const diff = (startOfDay(Date.now()) - startOfDay(iso)) / DAY;
    const d = diff === 0 ? t('today') : diff === 1 ? t('yesterday') : dateOnly(iso);
    return t('at', { d, t: timeOnly(iso) });
  }
  const both = (iso) => (iso ? `${dateOnly(iso, { year: 'numeric', month: 'long', day: 'numeric' })}، ${timeOnly(iso)}` : '—');
  const greg = (iso) => (iso ? dateOnly(iso, { year: 'numeric', month: 'long', day: 'numeric' }, cal() === 'persian' ? 'gregory' : 'persian') : '');
  const dur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const kindName = (e) => (e.kind === 'folder' ? t('folder') : t(`k.${typeOf(e)}`) + (extOf(e.name) && !['pdf'].includes(typeOf(e)) ? ` (${extOf(e.name).toUpperCase()})` : ''));
  const tagOf = (id) => state.tags.find((x) => x.id === id);
  const tagColor = (tg) => TAG_COLORS[tg?.color] || tg?.color || TAG_COLORS.gray;
  const itemsLabel = (n) => (n === 1 ? t('item1') : t('items', { n: num(n) }));
  const locName = (loc) => ({ '@recent': t('recent'), '@starred': t('starred'), '@shared': t('shared'), '@trash': t('trash'), '@browse': t('browse'), '@search': t('results') }[loc]
    || (loc?.startsWith?.('@tag:') ? L(tagOf(loc.slice(5))?.name) || t('tag') : loc === state.root ? t('allFiles') : entry(loc)?.name || ''));
  /** Persian-aware middle truncation that keeps the extension: «قرارداد اجارهٔ واحد…ـ۱۲.pdf» */
  function shortName(name, max = 38) {
    if (!name || name.length <= max) return name;
    const ext = extOf(name); const base = ext ? name.slice(0, -(ext.length + 1)) : name;
    const keep = max - (ext ? ext.length + 1 : 0) - 1; const head = Math.ceil(keep * 0.62); const tail = keep - head;
    return `${base.slice(0, head).replace(/[\s‌]+$/, '')}…${base.slice(-tail).replace(/^[\s‌]+/, '')}${ext ? `.${ext}` : ''}`;
  }
  function expiryInfo(e) {
    const x = e?.doc?.expiry; if (!x) return null;
    const days = Math.ceil((new Date(x).getTime() - Date.now()) / DAY);
    if (days < 0) return { tone: 'danger', label: t('expired'), days };
    if (days <= 45) return { tone: 'warning', label: t('daysLeft', { n: num(days) }), days };
    return { tone: 'neutral', label: dateOnly(x), days };
  }

  /* ---------------------------------------------------------------- artwork & content previews */
  const pv = createPreviewer(AC, fs, { esc, t, size });
  const LIVE_SMALL = new Set(['image', 'video']);
  function art(e, opts = {}) {
    const ty = typeOf(e);
    if (e.thumb && e.kind === 'file' && (opts.live === true || ty === 'image' || ty === 'video')) {
      return `<span class="ac-fm-thumb" data-type="${ty}"><img src="${esc(e.thumb)}" alt="" loading="lazy" decoding="async" draggable="false">${ty === 'video' ? `<span class="ac-fm-thumb__play">${icon('play')}</span>${e.duration ? `<span class="ac-fm-thumb__dur"><bdi>${dur(e.duration)}</bdi></span>` : ''}` : ''}</span>`;
    }
    if (e.kind === 'folder') return folderArt(e.glyph || '', e.color || (e.tags?.[0] && opts.tint !== false ? tagOf(e.tags[0])?.color : ''));
    if (opts.live === true || (opts.live === 'small' && LIVE_SMALL.has(ty))) return pv.slot(e) || fileArt(e);
    return fileArt(e);
  }
  /** Large live preview placeholder, filled asynchronously by fillFull(). */
  const fullSlot = (e, cls = '') => `<div class="ac-fm-fullslot ${cls}" data-full="${esc(e.id)}">${art(e, { live: true })}</div>`;
  async function fillFull(root) {
    for (const n of root.querySelectorAll('[data-full]:not([data-filled])')) {
      n.dataset.filled = ''; const e = entry(n.dataset.full); if (!e || e.kind === 'folder') continue;
      const html = await pv.full(e).catch(() => null);
      if (html && n.isConnected) { n.innerHTML = html; n.dataset.kind = typeOf(e); fx(n.firstElementChild, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 }); }
    }
    pv.observe(root, entry);
  }
  const dots = (e, max = 3) => (e.tags?.length ? `<span class="ac-fm-dots" aria-hidden="true">${e.tags.slice(0, max).map((x) => `<i style="--_t:${tagColor(tagOf(x))}"></i>`).join('')}</span>` : '');
  const statusChip = (e) => (e.status ? `<span class="ac-fm-chip" data-tone="${STATUS_TONE[e.status] || 'neutral'}">${esc(t(e.status))}</span>` : '');
  const ocrChip = (e) => (e.ocr ? `<span class="ac-fm-chip ac-fm-chip--ocr" data-ocr="${esc(e.ocr)}" title="${esc(t(e.ocr === 'done' ? 'ocrDone' : e.ocr === 'pending' ? 'ocrPending' : 'ocrNone'))}">${e.ocr === 'done' ? icon('scan-text') : e.ocr === 'pending' ? '<i class="ac-fm-spin"></i>' : ''}OCR</span>` : '');
  const expChip = (e) => { const x = expiryInfo(e); return x && x.tone !== 'neutral' ? `<span class="ac-fm-chip" data-tone="${x.tone}">${icon(x.tone === 'danger' ? 'circle-alert' : 'bell-ring')}<bdi>${esc(x.label)}</bdi></span>` : ''; };
  const badges = (e) => `${e.starred ? `<span class="ac-fm-star" title="${esc(t('starred'))}">${icon('star')}</span>` : ''}${e.shared?.length ? `<span class="ac-fm-mini" title="${esc(t('shared'))}">${icon('users')}</span>` : ''}`;

  /* ---------------------------------------------------------------- skeleton DOM */
  el.classList.add('ac-fm');
  el.tabIndex = -1;
  const btn = (act, ic, label, extra = '') => `<button class="ac-fm__tb" type="button" data-act="${act}" aria-label="${esc(label)}" data-ac-tooltip="${esc(label)}" ${extra}>${icon(ic)}</button>`;
  function chrome() {
    el.innerHTML = `
<header class="ac-fm__bar">
  <div class="ac-fm__navgrp">
    ${btn('sidebar', 'panel-left', t('sidebar'), 'aria-pressed="true" data-fm-sidebtn')}
    <div class="ac-fm__hist">${btn('back', 'chevron-left', t('back')).replace('ac-icon"', 'ac-icon ac-flip-rtl"')}${btn('forward', 'chevron-right', t('forward')).replace('ac-icon"', 'ac-icon ac-flip-rtl"')}</div>
  </div>
  <div class="ac-fm__where">
    <nav class="ac-fm__crumbs" aria-label="${esc(t('path'))}"><ol></ol></nav>
    <form class="ac-fm__pathform" hidden><input class="ac-fm__pathinput" type="text" dir="auto" spellcheck="false" autocomplete="off" aria-label="${esc(t('editPath'))}"></form>
  </div>
  <div class="ac-fm__tools">
    <div class="ac-segmented ac-segmented--sm ac-fm__views" data-ac="segmented" role="radiogroup" aria-label="${esc(t('view'))}">
      ${VIEWS.map((v) => `<button class="ac-segmented__item" type="button" role="radio" data-value="${v}" aria-checked="${state.view === v}" aria-label="${esc(t(v))}" data-ac-tooltip="${esc(t(v))}">${icon(VIEW_ICON[v])}</button>`).join('')}
    </div>
    ${btn('sortmenu', 'arrow-up-down', t('viewOptions'), 'aria-haspopup="menu"')}
    <span class="ac-fm__sep" aria-hidden="true"></span>
    ${btn('share', 'share-2', t('share').replace('…', ''))}
    ${btn('preview', 'panel-right', t('previewPane'), 'aria-pressed="false" data-fm-prevbtn')}
    ${btn('info', 'info', t('info'), 'aria-pressed="false" data-fm-infobtn')}
    ${btn('more', 'ellipsis', t('more'), 'aria-haspopup="menu"')}
    <label class="ac-fm__search"><span class="ac-fm__search-i">${icon('search')}</span><input class="ac-fm__q" type="search" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="${esc(t('search'))}" aria-label="${esc(t('search'))}"><kbd class="ac-fm__kbd" dir="ltr" aria-hidden="true">${/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘F' : 'Ctrl F'}</kbd></label>
    ${btn('newfolder', 'folder-plus', t('newFolder'))}
    <button class="ac-btn ac-btn--primary ac-btn--sm ac-fm__upbtn" type="button" data-act="upload">${icon('upload')}<span>${esc(t('upload'))}</span></button>
  </div>
</header>
<div class="ac-fm__phead">
  <div class="ac-fm__prow">
    <button class="ac-fm__pback" type="button" data-act="back">${icon('chevron-left', 'ac-flip-rtl')}<span class="ac-fm__pback-t"></span></button>
    <span class="ac-fm__grow"></span>
    <button class="ac-fm__ptxt" type="button" data-act="selectmode">${esc(t('select'))}</button>
    <button class="ac-fm__pbtn" type="button" data-act="pmore" aria-label="${esc(t('more'))}">${icon('ellipsis')}</button>
  </div>
  <h2 class="ac-fm__ptitle" dir="auto"></h2>
  <div class="ac-fm__psearchwrap"><label class="ac-fm__psearch"><span>${icon('search')}</span><input class="ac-fm__q ac-fm__pq" type="search" enterkeyhint="search" autocomplete="off" placeholder="${esc(t('search'))}" aria-label="${esc(t('search'))}"></label></div>
</div>
<div class="ac-fm__body">
  <aside class="ac-fm__side" aria-label="${esc(t('favorites'))}"></aside>
  <div class="ac-fm__main">
    <div class="ac-fm__filters" hidden></div>
    <div class="ac-fm__view" tabindex="0" aria-multiselectable="true"></div>
    <div class="ac-fm__drop" aria-hidden="true"><div class="ac-fm__drop-card">${icon('cloud-upload')}<strong></strong></div></div>
    <footer class="ac-fm__status"><span class="ac-fm__status-l" aria-live="polite"></span><span class="ac-fm__grow"></span><span class="ac-fm__status-free"></span>
      <label class="ac-fm__zoom" data-ac-tooltip="${esc(t('iconSize'))}">${icon('image', 'ac-icon--sm')}<input class="ac-range" type="range" min="48" max="128" step="4" value="${state.iconSize}" aria-label="${esc(t('iconSize'))}">${icon('image')}</label></footer>
  </div>
  <aside class="ac-fm__info" aria-label="${esc(t('info'))}"></aside>
</div>
<input class="ac-fm__file" type="file" multiple hidden>`;
  }
  chrome();
  const $ = (s) => el.querySelector(s);
  let view = $('.ac-fm__view');

  // floating layers live in <body> (fixed positioning must escape transformed page wrappers)
  const uploadsEl = document.createElement('section');
  uploadsEl.className = 'ac-fm-up'; uploadsEl.hidden = true; uploadsEl.setAttribute('aria-live', 'polite');
  const selbar = document.createElement('div');
  selbar.className = 'ac-fm-selbar'; selbar.dataset.state = 'closed';
  document.body.append(uploadsEl, selbar);

  /* ---------------------------------------------------------------- data */
  async function boot() {
    const [info, tags, users, locs] = await Promise.all([fs.info?.() ?? { root: 'root' }, fs.tags?.() ?? [], fs.users?.() ?? [], fs.locations?.() ?? []]);
    state.root = info.root; state.tags = tags; state.users = users; state.locs = locs;
    state.free = await fs.freeSpace?.().catch(() => null);
    const favIds = cfg.favorites || [];
    state.favorites = (await Promise.all(favIds.map((id) => fs.stat(id).catch(() => null)))).filter(Boolean);
    remember(state.favorites);
    const start = cfg.start || (isPhone() ? '@browse' : state.root);
    await go(start, { push: false, anim: 'none' });
    renderSide();
  }
  async function load(loc) {
    if (loc === '@browse') return [];
    const list = await fs.list(loc);
    return remember(list);
  }
  async function refresh(opts = {}) {
    state.kids.clear();
    try { state.tags = await fs.tags?.() ?? state.tags; } catch { /* keep */ }
    if (searching()) await runSearch(false);
    else state.items = await load(state.loc);
    if (!isVirtual(state.loc)) { state.here = await fs.stat(state.loc).catch(() => state.here); if (state.here) remember([state.here]); }
    for (const id of [...state.expanded]) { try { state.kids.set(id, remember(await fs.list(id))); } catch { state.expanded.delete(id); } }
    state.free = await fs.freeSpace?.().catch(() => state.free);
    render({ anim: opts.anim || 'none', flip: opts.flip });
    renderSide();
    if (state.info || infoLayer) renderInfo();
  }

  /* ---------------------------------------------------------------- navigation */
  async function go(loc, { push = true, anim = 'fade', origin = null, keepSearch = false } = {}) {
    if (loc == null) return;
    const from = state.loc;
    if (!keepSearch && (state.query || Object.values(state.filters).some(Boolean))) clearSearch(false);
    let items; let here = null;
    try {
      const slow = setTimeout(() => { view.setAttribute('aria-busy', 'true'); }, 160);
      [items, here] = await Promise.all([load(loc), isVirtual(loc) ? null : fs.stat(loc)]);
      clearTimeout(slow); view.removeAttribute('aria-busy');
    } catch (e) { view.removeAttribute('aria-busy'); AC.toast?.error?.(t('noPath')); return; }
    if (push && from != null && from !== loc) { state.history.push(from); state.future = []; }
    state.loc = loc; state.items = items; state.here = here; if (here) remember([here]);
    state.sel = new Set(); state.anchor = state.cursor = null; state.expanded.clear(); state.kids.clear();
    state.crumbs = here ? here.path : [{ id: loc, name: locName(loc) }];
    if (state.selecting && !isPhone()) state.selecting = false;
    render({ anim, origin });
    renderSide();
    if (state.info || infoLayer) renderInfo();
    // Re-rendering the breadcrumb/sidebar can detach the focused button; keep keyboard shortcuts alive.
    const ae = document.activeElement;
    if (!ae || ae === document.body || !ae.isConnected) view.focus({ preventScroll: true });
    AC.emit?.(el, 'files:navigate', { loc, entry: here });
  }
  const back = () => { const p = state.history.pop(); if (p != null) { state.future.push(state.loc); go(p, { push: false, anim: 'out' }); } else if (isPhone() && state.loc !== '@browse') go(parentOf(), { push: false, anim: 'out' }); };
  const forward = () => { const n = state.future.pop(); if (n != null) { state.history.push(state.loc); go(n, { push: false, anim: 'in' }); } };
  function parentOf() {
    if (isVirtual(state.loc) || state.loc === state.root) return '@browse';
    const p = state.crumbs.at(-2); return p ? p.id : state.root;
  }
  const up = () => { if (!isVirtual(state.loc) && state.crumbs.length > 1) go(state.crumbs.at(-2).id, { anim: 'out' }); };

  async function open(e, origin) {
    if (!e) return;
    if (e.kind === 'folder' && !inTrash()) { go(e.id, { anim: 'in', origin }); return; }
    const ev = AC.emit?.(el, 'files:open', { entry: e });
    if (ev?.defaultPrevented) return;
    quickLook(e.id);
  }

  /* ---------------------------------------------------------------- derived list */
  const collator = () => new Intl.Collator(lang(), { numeric: true, sensitivity: 'base' });
  function sorted(list) {
    const c = collator(); const { key: k, dir } = state.sort;
    const val = (e) => (k === 'name' ? e.name : k === 'modified' ? new Date(e.modified).getTime() : k === 'created' ? new Date(e.created).getTime() : k === 'size' ? (e.kind === 'folder' ? -1 : e.size) : k === 'kind' ? kindName(e) : k === 'status' ? (e.status || '~') : e.name);
    return [...list].sort((a, b) => {
      if (state.foldersFirst && a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      const x = val(a); const y = val(b);
      const r = typeof x === 'string' ? c.compare(x, y) : x - y;
      return (r || c.compare(a.name, b.name)) * dir;
    });
  }
  function groups(list) {
    const g = state.group;
    if (g === 'none') return [{ key: '', items: list }];
    const map = new Map();
    const bucket = (e) => {
      if (g === 'kind') return e.kind === 'folder' ? t('folder') : t(`k.${typeOf(e)}`);
      if (g === 'tags') return e.tags?.[0] ? L(tagOf(e.tags[0])?.name) : t('none');
      const d = (startOfDay(Date.now()) - startOfDay(e.modified)) / DAY;
      return d <= 0 ? t('today') : d <= 1 ? t('yesterday') : d <= 7 ? t('week') : d <= 30 ? t('month') : dateOnly(e.modified, { year: 'numeric', month: 'long' });
    };
    const ordered = g === 'date' ? [...list].sort((a, b) => new Date(b.modified) - new Date(a.modified)) : list;
    for (const e of ordered) { const k = bucket(e); if (!map.has(k)) map.set(k, []); map.get(k).push(e); }
    return [...map].map(([k, items]) => ({ key: k, items: g === 'date' ? sorted(items) : items }));
  }
  const visible = () => (searching() ? state.results || [] : state.items);

  /* ---------------------------------------------------------------- render: chrome bits */
  function renderBar() {
    const crumbs = $('.ac-fm__crumbs ol');
    const parts = state.loc === '@browse' ? [{ id: '@browse', name: t('browse') }] : searching() ? [...(state.scope === 'here' ? state.crumbs : []), { id: '@search', name: t('results') }] : state.crumbs;
    crumbs.innerHTML = parts.map((p, i) => {
      const last = i === parts.length - 1; const nm = p.id === state.root ? t('allFiles') : p.name || locName(p.id);
      const ic = i === 0 ? (p.id === state.root ? 'house' : p.id === '@trash' ? 'trash-2' : p.id === '@recent' ? 'clock' : p.id === '@starred' ? 'star' : p.id === '@shared' ? 'users' : p.id?.startsWith?.('@tag:') ? 'tag' : p.id === '@search' ? 'search' : 'folder') : '';
      return `<li>${i ? `<span class="ac-fm__crumb-sep" aria-hidden="true">${icon('chevron-right', 'ac-flip-rtl')}</span>` : ''}<button class="ac-fm__crumb" type="button" data-crumb="${esc(p.id)}"${isVirtual(p.id) ? '' : ` data-drop="${esc(p.id)}"`}${last ? ' aria-current="page"' : ''}>${ic ? icon(ic) : ''}<span dir="auto">${esc(nm)}</span></button></li>`;
    }).join('');
    crumbs.parentElement.scrollLeft = rtl() ? -crumbs.scrollWidth : crumbs.scrollWidth;
    el.querySelector('[data-act="back"]').disabled = !state.history.length;
    el.querySelector('[data-act="forward"]').disabled = !state.future.length;
    const sb = el.querySelector('[data-fm-sidebtn]'); sb.setAttribute('aria-pressed', String(state.sidebar));
    el.querySelector('[data-fm-infobtn]').setAttribute('aria-pressed', String(state.info));
    el.querySelector('[data-fm-prevbtn]').setAttribute('aria-pressed', String(state.preview && !state.info));
    el.querySelector('[data-act="newfolder"]').disabled = isVirtual(state.loc);
    el.querySelector('[data-act="upload"]').disabled = isVirtual(state.loc);
    el.dataset.sidebar = String(state.sidebar); el.dataset.info = String(state.info || state.preview); el.dataset.pane = state.info ? 'info' : state.preview ? 'preview' : 'none';
    const seg = el.querySelector('.ac-fm__views');
    const i = VIEWS.indexOf(state.view);
    const inst = AC.instance(seg, 'segmented');
    if (inst?.select && seg.querySelectorAll('.ac-segmented__item')[i]?.getAttribute('aria-checked') !== 'true') inst.select(i, { silent: true });
    // phone header
    const title = state.selecting ? (state.sel.size ? t('selected', { n: num(state.sel.size) }) : t('select')) : searching() ? t('results') : locName(state.loc);
    $('.ac-fm__ptitle').textContent = title;
    const pb = $('.ac-fm__pback'); const atBrowse = state.loc === '@browse';
    pb.hidden = atBrowse || state.selecting;
    $('.ac-fm__pback-t').textContent = state.history.length ? locName(state.history.at(-1)) || t('back') : locName(parentOf());
    const st = $('[data-act="selectmode"]'); st.textContent = state.selecting ? t('done') : t('select'); st.hidden = atBrowse;
    st.classList.toggle('is-strong', state.selecting);
    $('[data-act="pmore"]').hidden = state.selecting;
    el.dataset.selecting = String(state.selecting);
    el.dataset.loc = isVirtual(state.loc) ? state.loc.split(':')[0].slice(1) : 'folder';
  }

  function renderStatus() {
    const list = visible(); const sel = selected();
    const selSize = sel.reduce((s, e) => s + (e.size || 0), 0);
    $('.ac-fm__status-l').innerHTML = `<bdi>${esc(itemsLabel(list.length))}</bdi>${sel.length ? ` <span class="ac-fm__dot">·</span> <bdi>${esc(t('selected', { n: num(sel.length) }))}</bdi>${selSize ? ` <span class="ac-text-muted">(<bdi>${esc(size(selSize))}</bdi>)</span>` : ''}` : ''}`;
    $('.ac-fm__status-free').innerHTML = state.free != null ? `<bdi>${esc(t('free', { size: size(state.free) }))}</bdi>` : '';
    $('.ac-fm__zoom').hidden = curView() !== 'icons';
  }

  function renderSide() {
    const side = $('.ac-fm__side');
    side.innerHTML = sideHTML();
    if (state.loc === '@browse') renderView();
  }
  function sideHTML(browse = false) {
    const cur = (loc) => (state.loc === loc && !searching() ? ' aria-current="page"' : '');
    const item = (loc, ic, label, extra = '', drop = '') => `<button class="ac-fm__nav" type="button" data-loc="${esc(loc)}"${drop ? ` data-drop="${esc(drop)}"` : ''}${cur(loc)}>${ic}<span class="ac-fm__nav-t" dir="auto">${esc(label)}</span>${extra}${browse ? `<span class="ac-fm__nav-chev">${icon('chevron-right', 'ac-flip-rtl')}</span>` : ''}</button>`;
    const trashN = cache.get('@trashCount');
    const favs = [
      item(state.root, icon('house'), t('allFiles'), '', state.root),
      item('@recent', icon('clock'), t('recent')),
      item('@starred', icon('star'), t('starred')),
      item('@shared', icon('users'), t('shared')),
      ...state.favorites.map((f) => item(f.id, `<span class="ac-fm__nav-art">${folderArt(f.glyph, f.color)}</span>`, f.name, '', f.id)),
    ].join('');
    const locs = state.locs.map((l) => `<button class="ac-fm__nav ac-fm__nav--loc" type="button" data-loc="${esc(l.root || state.root)}"${l.root ? ` data-drop="${esc(l.root)}"` : ''}>${icon(l.icon || 'hard-drive')}<span class="ac-fm__nav-t"><span dir="auto">${esc(L(l.name))}</span><span class="ac-fm__usage" style="--_p:${Math.min(100, Math.round((l.used / l.total) * 100))}%" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round((l.used / l.total) * 100)}"><i></i></span><small><bdi>${esc(t('ofTotal', { used: size(l.used), total: size(l.total) }))}</bdi></small></span>${browse ? `<span class="ac-fm__nav-chev">${icon('chevron-right', 'ac-flip-rtl')}</span>` : ''}</button>`).join('');
    const tags = state.tags.map((tg) => item(`@tag:${tg.id}`, `<i class="ac-fm__tagdot" style="--_t:${tagColor(tg)}"></i>`, L(tg.name), tg.count ? `<span class="ac-fm__nav-n"><bdi>${num(tg.count)}</bdi></span>` : '', `@tag:${tg.id}`)).join('');
    return `<div class="ac-fm__sec"><h3 class="ac-fm__sec-h">${esc(t('favorites'))}</h3>${favs}</div>
      ${locs ? `<div class="ac-fm__sec"><h3 class="ac-fm__sec-h">${esc(t('locations'))}</h3>${locs}</div>` : ''}
      ${tags ? `<div class="ac-fm__sec"><h3 class="ac-fm__sec-h">${esc(t('tags'))}</h3>${tags}</div>` : ''}
      <div class="ac-fm__sec ac-fm__sec--end">${item('@trash', icon('trash-2'), t('trash'), trashN ? `<span class="ac-fm__nav-n"><bdi>${num(trashN)}</bdi></span>` : '', '@trash')}</div>`;
  }

  function renderFilters() {
    const box = $('.ac-fm__filters');
    const on = searching() || box.contains(document.activeElement) || el.querySelector('.ac-fm__q') === document.activeElement && !isPhone();
    box.hidden = !on;
    if (!on) return;
    const f = state.filters;
    const chip = (k, label, value) => `<button class="ac-fm-fchip" type="button" data-filter="${k}" aria-pressed="${!!value}" aria-haspopup="menu">${esc(value ? filterLabel(k, value) : label)}${icon('chevron-down', 'ac-icon--sm')}</button>`;
    const here = isVirtual(state.loc) ? null : state.crumbs.at(-1);
    box.innerHTML = `<div class="ac-segmented ac-segmented--sm ac-fm__scope" role="radiogroup" aria-label="${esc(t('search'))}">
        ${here ? `<button class="ac-segmented__item" type="button" role="radio" data-scope="here" aria-checked="${state.scope === 'here'}"><span dir="auto">${esc(shortName(here.id === state.root ? t('allFiles') : here.name, 22))}</span></button>` : ''}
        <button class="ac-segmented__item" type="button" role="radio" data-scope="all" aria-checked="${state.scope === 'all' || !here}">${esc(t('everywhere'))}</button></div>
      <span class="ac-fm__fchips">${chip('kind', t('anyKind'), f.kind)}${chip('date', t('anyDate'), f.date)}${chip('size', t('anySize'), f.size)}${chip('tag', t('anyTag'), f.tag)}</span>
      ${Object.values(f).some(Boolean) ? `<button class="ac-btn ac-btn--ghost ac-btn--sm" type="button" data-act="clearfilters">${esc(t('clearFilters'))}</button>` : ''}`;
  }
  const filterOpts = () => ({
    kind: [['folder', t('folder')], ['document', t('documents')], ['pdf', t('k.pdf')], ['image', t('k.image')], ['video', t('k.video')], ['audio', t('k.audio')], ['xls', t('k.xls')], ['zip', t('k.zip')]],
    date: [['today', t('today')], ['week', t('week')], ['month', t('month')], ['year', t('year')]],
    size: [['small', t('small')], ['medium', t('medium')], ['large', t('large')]],
    tag: state.tags.map((x) => [x.id, L(x.name)]),
  });
  const filterLabel = (k, v) => filterOpts()[k].find(([x]) => x === v)?.[1] || v;

  /* ---------------------------------------------------------------- render: views */
  function snapshot() {
    const m = new Map();
    for (const n of view.querySelectorAll('[data-id]')) { const a = n.querySelector('.ac-fm__art') || n; const r = a.getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < innerHeight) m.set(n.dataset.id, r); }
    return m;
  }
  function render({ anim = 'none', origin = null, flip = false } = {}) {
    const before = flip ? snapshot() : null;
    renderBar(); renderFilters();
    renderView();
    renderStatus(); syncSel();
    if (before && !reduced()) flipFrom(before);
    else if (before) fade(view, 160);
    else if (anim !== 'none') enter(anim, origin);
    renderSelbar();
  }
  function renderView() {
    const v = curView();
    view.dataset.view = v; el.dataset.view = v;
    el.style.setProperty('--fm-icon', `${state.iconSize}px`);
    if (state.loc === '@browse') { view.setAttribute('role', 'navigation'); view.innerHTML = `<div class="ac-fm-browse">${sideHTML(true)}</div>`; state.order = []; return; }
    const list = sorted(visible());
    if (!list.length) { view.removeAttribute('role'); view.innerHTML = emptyHTML(); state.order = []; return; }
    if (v === 'list' && isPhone()) { view.setAttribute('role', 'listbox'); view.innerHTML = phoneList(list); }
    else if (v === 'list') { view.setAttribute('role', 'treegrid'); view.innerHTML = listHTML(list); }
    else if (v === 'columns') { view.removeAttribute('role'); view.innerHTML = '<div class="ac-fm-cols"></div>'; renderColumns(); }
    else if (v === 'gallery') { view.removeAttribute('role'); view.innerHTML = galleryHTML(list); }
    else { view.setAttribute('role', 'listbox'); view.innerHTML = iconsHTML(list); }
    if (v !== 'columns') state.order = [...view.querySelectorAll('[data-id]')].filter((n) => !n.closest('.ac-fm-gal__stage')).map((n) => n.dataset.id);
    if (state.clip?.op === 'cut') for (const id of state.clip.ids) view.querySelector(`[data-id="${CSS.escape(id)}"]`)?.setAttribute('data-cut', '');
  }
  function emptyHTML() {
    const [ic, title, text] = searching() ? ['search', t('noResults'), t('noResultsText')] : inTrash() ? ['trash-2', t('trashEmpty'), ''] : ['folder-open', t('emptyFolder'), isVirtual(state.loc) ? '' : t('emptyFolderText')];
    return `<div class="ac-fm-empty"><div class="ac-fm-empty__art">${ic === 'folder-open' ? folderArt('') : icon(ic)}</div><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ''}${searching() ? `<button class="ac-btn ac-btn--sm" type="button" data-act="clearsearch">${esc(t('clearFilters'))}</button>` : ''}</div>`;
  }
  const groupHead = (g) => (g.key ? `<h3 class="ac-fm__gh"><span dir="auto">${esc(g.key)}</span><bdi>${num(g.items.length)}</bdi></h3>` : '');

  function iconsHTML(list) {
    return groups(list).map((g) => `<section class="ac-fm__group">${groupHead(g)}<div class="ac-fm-grid" role="presentation">${g.items.map((e) => {
      const ex = expiryInfo(e);
      return `<div class="ac-fm-tile" role="option" tabindex="-1" data-id="${esc(e.id)}" data-kind="${e.kind}" aria-selected="false"${e.kind === 'folder' ? ` data-drop="${esc(e.id)}"` : ''} title="${esc(e.name)}">
        <span class="ac-fm__art">${art(e, { live: true })}${ex && ex.tone !== 'neutral' ? `<span class="ac-fm-alert" data-tone="${ex.tone}" title="${esc(ex.label)}">${icon(ex.tone === 'danger' ? 'circle-alert' : 'bell-ring')}</span>` : ''}${e.status === 'signed' ? `<span class="ac-fm-seal" title="${esc(t('signed'))}">${icon('badge-check')}</span>` : ''}</span>
        <span class="ac-fm-tile__label"><span class="ac-fm__name" dir="auto">${esc(shortName(e.name, 40))}</span></span>
        <span class="ac-fm-tile__sub">${dots(e)}${badges(e)}<bdi>${esc(e.kind === 'folder' ? itemsLabel(e.count ?? 0) : size(e.size))}</bdi></span>
      </div>`;
    }).join('')}</div></section>`).join('');
  }

  function rowHTML(e, lvl = 1) {
    const open = state.expanded.has(e.id); const folder = e.kind === 'folder';
    const ex = expiryInfo(e);
    return `<div class="ac-fm-row" role="row" tabindex="-1" data-id="${esc(e.id)}" data-kind="${e.kind}" aria-level="${lvl}" aria-selected="false"${folder ? ` aria-expanded="${open}" data-drop="${esc(e.id)}"` : ''} style="--lvl:${lvl - 1}">
      <span class="ac-fm-cell ac-fm-cell--name" role="gridcell">${folder && !inTrash() ? `<button class="ac-fm-disc" type="button" tabindex="-1" aria-label="${esc(e.name)}">${icon('chevron-right', 'ac-flip-rtl')}</button>` : '<span class="ac-fm-disc"></span>'}<span class="ac-fm__art">${art(e, { live: 'small' })}</span><span class="ac-fm__name" dir="auto">${esc(e.name)}</span>${badges(e)}${ocrChip(e)}</span>
      <span class="ac-fm-cell" role="gridcell"><bdi>${esc(when(e.modified))}</bdi></span>
      <span class="ac-fm-cell ac-fm-cell--num" role="gridcell"><bdi>${esc(folder ? (e.count != null ? itemsLabel(e.count) : '—') : size(e.size))}</bdi></span>
      <span class="ac-fm-cell ac-fm-cell--muted" role="gridcell">${esc(kindName(e))}</span>
      <span class="ac-fm-cell" role="gridcell">${dots(e, 4)}${e.tags?.[0] ? `<span class="ac-fm-cell__t">${esc(L(tagOf(e.tags[0])?.name))}</span>` : ''}</span>
      <span class="ac-fm-cell" role="gridcell">${statusChip(e)}${ex && ex.tone !== 'neutral' ? `<span class="ac-fm-alert ac-fm-alert--inline" data-tone="${ex.tone}" title="${esc(ex.label)}">${icon(ex.tone === 'danger' ? 'circle-alert' : 'bell-ring')}</span>` : ''}</span>
    </div>${open ? (state.kids.get(e.id) ? sorted(state.kids.get(e.id)).map((c) => rowHTML(c, lvl + 1)).join('') : `<div class="ac-fm-row ac-fm-row--loading" style="--lvl:${lvl}"><span class="ac-fm-cell ac-fm-cell--name"><i class="ac-fm-spin"></i>${esc(t('loading'))}</span></div>`) : ''}`;
  }
  const COLS = ['name', 'date', 'size', 'kind', 'tags', 'status'];
  const SORTKEY = { name: 'name', date: 'modified', size: 'size', kind: 'kind', tags: null, status: 'status' };
  function listHTML(list) {
    const head = COLS.map((c) => {
      const k = SORTKEY[c]; const active = k && state.sort.key === k;
      return `<div class="ac-fm-th" role="columnheader" data-col="${c}"${k ? ` aria-sort="${active ? (state.sort.dir > 0 ? 'ascending' : 'descending') : 'none'}"` : ''}>${k ? `<button type="button" class="ac-fm-th__b" data-sort="${k}">` : '<span class="ac-fm-th__b">'}<span>${esc(t(c === 'date' ? 'modified' : c === 'tags' ? 'nTags' : c))}</span>${active ? icon(state.sort.dir > 0 ? 'chevron-up' : 'chevron-down', 'ac-icon--sm') : ''}${k ? '</button>' : '</span>'}<span class="ac-fm-th__grip" data-grip="${c}" aria-hidden="true"></span></div>`;
    }).join('');
    const body = groups(list).map((g) => `${g.key ? `<div class="ac-fm-row ac-fm-row--group" role="row"><span class="ac-fm-cell" role="gridcell">${esc(g.key)} <bdi>${num(g.items.length)}</bdi></span></div>` : ''}${g.items.map((e) => rowHTML(e)).join('')}`).join('');
    return `<div class="ac-fm-table" style="${colStyle()}"><div class="ac-fm-thead" role="row">${head}</div><div class="ac-fm-tbody" role="rowgroup">${body}</div></div>`;
  }
  const colStyle = () => `--fm-cols:${COLS.map((c) => (c === 'name' ? `minmax(${state.colW.name}px, 1fr)` : `${state.colW[c]}px`)).join(' ')};--fm-minw:${COLS.reduce((s, c) => s + state.colW[c], 0)}px`;

  function phoneList(list) {
    return groups(list).map((g) => `<section class="ac-fm__group">${groupHead(g)}<div class="ac-fm-plist">${g.items.map((e) => `<div class="ac-fm-prow" role="option" tabindex="-1" data-id="${esc(e.id)}" data-kind="${e.kind}" aria-selected="false">
      <div class="ac-fm-prow__acts" aria-hidden="true"><button type="button" data-swipe="star" data-tone="warning">${icon('star')}<span>${esc(e.starred ? t('unstar') : t('starred'))}</span></button><button type="button" data-swipe="trash" data-tone="danger">${icon(inTrash() ? 'rotate-ccw' : 'trash-2')}<span>${esc(inTrash() ? t('restore') : t('trash'))}</span></button></div>
      <div class="ac-fm-prow__c"><span class="ac-fm-check" aria-hidden="true">${icon('check')}</span><span class="ac-fm__art">${art(e, { live: true })}</span>
        <span class="ac-fm-prow__main"><span class="ac-fm__name" dir="auto" title="${esc(e.name)}">${esc(shortName(e.name, 34))}</span><span class="ac-fm-prow__meta"><bdi>${esc(dateOnly(e.modified))}</bdi><span>·</span><bdi>${esc(e.kind === 'folder' ? itemsLabel(e.count ?? 0) : size(e.size))}</bdi>${dots(e)}${e.starred ? icon('star', 'ac-fm-star') : ''}</span>${(e.status || expiryInfo(e)?.tone === 'warning' || expiryInfo(e)?.tone === 'danger') ? `<span class="ac-fm-prow__chips">${statusChip(e)}${expChip(e)}</span>` : ''}</span>
        ${e.kind === 'folder' ? `<span class="ac-fm-prow__chev">${icon('chevron-right', 'ac-flip-rtl')}</span>` : `<button class="ac-fm-prow__more" type="button" data-act="rowmore" aria-label="${esc(t('more'))}">${icon('ellipsis')}</button>`}</div>
    </div>`).join('')}</div></section>`).join('');
  }

  async function renderColumns() {
    const host = view.querySelector('.ac-fm-cols'); if (!host) return;
    const base = searching() ? null : state.loc;
    const ids = searching() ? ['@search'] : isVirtual(base) ? [base] : state.crumbs.map((c) => c.id);
    const lists = await Promise.all(ids.map(async (id, i) => {
      if (id === '@search' || (i === ids.length - 1)) return id === '@search' ? state.results || [] : state.items;
      if (!state.kids.has(id)) state.kids.set(id, remember(await fs.list(id)));
      return state.kids.get(id);
    }));
    if (!view.contains(host)) return;
    const selFile = state.sel.size === 1 ? entry([...state.sel][0]) : null;
    const extra = selFile?.kind === 'folder' && !lists.at(-1).every((e) => e.id !== selFile.id) ? selFile : null;
    let extraList = null;
    if (extra) { if (!state.kids.has(extra.id)) state.kids.set(extra.id, remember(await fs.list(extra.id))); extraList = state.kids.get(extra.id); }
    const col = (list, i, current, active) => `<div class="ac-fm-col" role="listbox" aria-multiselectable="true" data-col="${i}"${active ? ' data-active' : ''}>${sorted(list).map((e) => `<div class="ac-fm-crow" role="option" tabindex="-1" data-id="${esc(e.id)}" data-kind="${e.kind}" aria-selected="false"${e.id === current ? ' data-path' : ''}${e.kind === 'folder' ? ` data-drop="${esc(e.id)}"` : ''}><span class="ac-fm__art">${art(e, { live: 'small' })}</span><span class="ac-fm__name" dir="auto">${esc(e.name)}</span>${dots(e, 2)}${e.kind === 'folder' ? icon('chevron-right', 'ac-flip-rtl ac-fm-crow__chev') : ''}</div>`).join('') || `<div class="ac-fm-col__empty">${esc(t('emptyFolder'))}</div>`}</div>`;
    let html = lists.map((list, i) => col(list, i, ids[i + 1], i === lists.length - 1)).join('');
    if (extraList) html += col(extraList, lists.length, null, false);
    if (selFile && selFile.kind !== 'folder') html += `<div class="ac-fm-col ac-fm-col--prev">${previewCard(selFile)}</div>`;
    host.innerHTML = html;
    state.order = [...host.querySelectorAll('.ac-fm-col[data-active] [data-id]')].map((n) => n.dataset.id);
    syncSel();
    if (state.clip?.op === 'cut') for (const id of state.clip.ids) host.querySelector(`[data-id="${CSS.escape(id)}"]`)?.setAttribute('data-cut', '');
    for (const c of host.querySelectorAll('.ac-fm-col')) { const p = c.querySelector('[data-path]'); if (p) p.scrollIntoView({ block: 'nearest' }); }
    host.scrollTo({ left: rtl() ? -host.scrollWidth : host.scrollWidth, behavior: reduced() ? 'auto' : 'smooth' });
  }
  function previewCard(e) {
    return `<div class="ac-fm-pcard"><div class="ac-fm-pcard__art">${fullSlot(e)}</div><div class="ac-fm-pcard__name" dir="auto">${esc(e.name)}</div>
      <div class="ac-fm-pcard__sub">${esc(kindName(e))} · <bdi>${esc(size(e.size))}</bdi></div>
      <div class="ac-fm-pcard__chips">${statusChip(e)}${ocrChip(e)}${expChip(e)}</div>
      <dl class="ac-fm-dl"><div><dt>${esc(t('created'))}</dt><dd><bdi>${esc(when(e.created))}</bdi></dd></div><div><dt>${esc(t('modified'))}</dt><dd><bdi>${esc(when(e.modified))}</bdi></dd></div>${e.dims ? `<div><dt>${esc(t('dims'))}</dt><dd><bdi>${esc(`${e.dims[0]} × ${e.dims[1]}`)}</bdi></dd></div>` : ''}${e.duration ? `<div><dt>${esc(t('duration'))}</dt><dd><bdi>${dur(e.duration)}</bdi></dd></div>` : ''}${e.doc?.number ? `<div><dt>${esc(t('docNumber'))}</dt><dd><bdi>${esc(e.doc.number)}</bdi></dd></div>` : ''}${e.doc?.parties ? `<div><dt>${esc(t('parties'))}</dt><dd dir="auto">${esc(e.doc.parties)}</dd></div>` : ''}${e.tags?.length ? `<div><dt>${esc(t('nTags'))}</dt><dd>${dots(e, 5)} ${esc(e.tags.map((x) => L(tagOf(x)?.name)).join('، '))}</dd></div>` : ''}</dl>
      <div class="ac-fm-pcard__acts"><button class="ac-btn ac-btn--sm ac-btn--primary" type="button" data-act="ql">${icon('eye')}<span>${esc(t('quickLook'))}</span></button><button class="ac-btn ac-btn--sm" type="button" data-act="share">${icon('share-2')}</button><button class="ac-btn ac-btn--sm" type="button" data-act="info">${icon('info')}</button></div></div>`;
  }

  function galleryHTML(list) {
    const items = sorted(list);
    const cur = entry(state.cursor) && items.some((e) => e.id === state.cursor) ? entry(state.cursor) : items[0];
    if (cur && !state.sel.size) { state.sel = new Set([cur.id]); state.cursor = state.anchor = cur.id; }
    return `<div class="ac-fm-gal"><div class="ac-fm-gal__stage">${galStage(cur)}</div>
      <div class="ac-fm-gal__strip" role="listbox" aria-multiselectable="true">${items.map((e) => `<div class="ac-fm-film" role="option" tabindex="-1" data-id="${esc(e.id)}" data-kind="${e.kind}" aria-selected="false" title="${esc(e.name)}"${e.kind === 'folder' ? ` data-drop="${esc(e.id)}"` : ''}><span class="ac-fm__art">${art(e, { live: true })}</span></div>`).join('')}</div></div>`;
  }
  function galStage(e) {
    if (!e) return '';
    return `<div class="ac-fm-gal__hero" data-hero="${esc(e.id)}"><div class="ac-fm-gal__big">${e.kind === 'folder' ? art(e) : fullSlot(e)}</div></div>
      <aside class="ac-fm-gal__meta"><div class="ac-fm-gal__name" dir="auto">${esc(e.name)}</div><div class="ac-fm-gal__sub">${esc(kindName(e))} · <bdi>${esc(e.kind === 'folder' ? itemsLabel(e.count ?? 0) : size(e.size))}</bdi></div>
        <div class="ac-fm-pcard__chips">${statusChip(e)}${ocrChip(e)}${expChip(e)}${dots(e, 5)}</div>
        <dl class="ac-fm-dl"><div><dt>${esc(t('modified'))}</dt><dd><bdi>${esc(when(e.modified))}</bdi></dd></div><div><dt>${esc(t('created'))}</dt><dd><bdi>${esc(when(e.created))}</bdi></dd></div>${e.dims ? `<div><dt>${esc(t('dims'))}</dt><dd><bdi>${esc(`${e.dims[0]} × ${e.dims[1]}`)}</bdi></dd></div>` : ''}${e.duration ? `<div><dt>${esc(t('duration'))}</dt><dd><bdi>${dur(e.duration)}</bdi></dd></div>` : ''}${e.doc?.number ? `<div><dt>${esc(t('docNumber'))}</dt><dd><bdi>${esc(e.doc.number)}</bdi></dd></div>` : ''}</dl>
        <div class="ac-fm-pcard__acts"><button class="ac-btn ac-btn--sm ac-btn--primary" type="button" data-act="ql">${icon(e.kind === 'folder' ? 'folder-open' : 'eye')}<span>${esc(e.kind === 'folder' ? t('open') : t('quickLook'))}</span></button><button class="ac-btn ac-btn--sm" type="button" data-act="share" aria-label="${esc(t('share'))}">${icon('share-2')}</button><button class="ac-btn ac-btn--sm" type="button" data-act="info" aria-label="${esc(t('info'))}">${icon('info')}</button></div></aside>`;
  }
  function updateGallery() {
    const stage = view.querySelector('.ac-fm-gal__stage'); if (!stage) return;
    const e = entry(state.cursor); if (!e || stage.querySelector(`[data-hero="${CSS.escape(e.id)}"]`)) return;
    stage.innerHTML = galStage(e); fillFull(stage);
    const big = stage.querySelector('.ac-fm-gal__big');
    if (big) fx(big, [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 220 });
    view.querySelector(`.ac-fm-film[data-id="${CSS.escape(e.id)}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
  }

  /* ---------------------------------------------------------------- motion */
  /** WAAPI with the reduced-motion policy: keep the fade, drop the travel. */
  function fx(node, frames, o = {}) {
    if (!node?.animate) return null;
    if (reduced()) {
      if (!frames.some((f) => 'opacity' in f)) return null;
      frames = frames.map((f) => ({ opacity: f.opacity ?? 1 }));
      o = { ...o, duration: Math.min(o.duration ?? 200, 180) };
    }
    return node.animate(frames, { duration: 220, easing: 'cubic-bezier(.23,1,.32,1)', ...o });
  }
  const fade = (node, d = 180) => fx(node, [{ opacity: 0 }, { opacity: 1 }], { duration: d });
  function enter(kind, origin) {
    const items = [...view.querySelectorAll('.ac-fm-tile, .ac-fm-row:not(.ac-fm-row--group), .ac-fm-prow, .ac-fm-crow, .ac-fm-film, .ac-fm-browse .ac-fm__sec')].slice(0, 48);
    if (kind === 'in' || kind === 'out') {
      let ox = '50%'; let oy = '30%';
      if (origin?.getBoundingClientRect) { const r = origin.getBoundingClientRect(); const v = view.getBoundingClientRect(); ox = `${r.left + r.width / 2 - v.left}px`; oy = `${r.top + r.height / 2 - v.top + view.scrollTop}px`; }
      view.style.transformOrigin = `${ox} ${oy}`;
      fx(view, kind === 'in' ? [{ opacity: 0.2, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 0.2, transform: 'scale(1.05)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.19,1,.22,1)' });
    }
    items.forEach((n, i) => fx(n, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: Math.min(i * 14, 220), fill: 'backwards', easing: 'cubic-bezier(.19,1,.22,1)' }));
  }
  function flipFrom(before) {
    const ease = AC.motion?.springEasing ? AC.motion.springEasing({ stiffness: 420, damping: 36, mass: 1 }) : { easing: 'cubic-bezier(.23,1,.32,1)', duration: 360 };
    let n = 0;
    for (const node of view.querySelectorAll('[data-id]')) {
      const a = node.querySelector('.ac-fm__art') || node; const b = a.getBoundingClientRect(); const was = before.get(node.dataset.id);
      if (!b.width || b.bottom < 0 || b.top > innerHeight) continue;
      if (!was) { fx(node, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 60 }); continue; }
      const dx = was.left - b.left; const dy = was.top - b.top; const s = was.width / b.width;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(s - 1) < 0.01) continue;
      a.animate([{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transformOrigin: '0 0', transform: 'none' }], { duration: Math.min(560, ease.duration), easing: ease.easing });
      if (++n > 120) break;
    }
  }

  /* ---------------------------------------------------------------- selection */
  const selected = () => [...state.sel].map(entry).filter(Boolean);
  function syncSel() {
    for (const n of view.querySelectorAll('[data-id]')) {
      const on = state.sel.has(n.dataset.id);
      if ((n.getAttribute('aria-selected') === 'true') !== on) {
        n.setAttribute('aria-selected', String(on));
        if (on && !reduced() && n.isConnected) { const hl = n.querySelector('.ac-fm__name'); if (hl && curView() === 'icons') hl.animate([{ transform: 'scale(.94)' }, { transform: 'scale(1.03)', offset: 0.55 }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.34,1.56,.64,1)' }); }
      }
      n.toggleAttribute('data-cursor', n.dataset.id === state.cursor);
      n.tabIndex = n.dataset.id === state.cursor ? 0 : -1;
    }
    renderStatus(); renderBar(); renderSelbar();
    if (curView() === 'gallery') updateGallery();
    pv.observe(view, entry); fillFull(view);
    if (state.info || state.preview || infoLayer) renderInfoSoon();
    AC.emit?.(el, 'files:select', { ids: [...state.sel] });
  }
  function select(ids, { add = false, range = false, toggle = false, cursor } = {}) {
    ids = [].concat(ids).filter((x) => x != null);
    if (range && state.anchor != null && ids.length === 1) {
      const a = state.order.indexOf(state.anchor); const b = state.order.indexOf(ids[0]);
      if (a > -1 && b > -1) { const span = state.order.slice(Math.min(a, b), Math.max(a, b) + 1); state.sel = new Set(add ? [...state.sel, ...span] : span); state.cursor = ids[0]; syncSel(); return; }
    }
    if (toggle) { for (const id of ids) state.sel.has(id) ? state.sel.delete(id) : state.sel.add(id); }
    else state.sel = new Set(add ? [...state.sel, ...ids] : ids);
    state.cursor = cursor ?? ids.at(-1) ?? null;
    if (!range) state.anchor = state.cursor;
    syncSel();
    if (curView() === 'columns') renderColumns();
  }
  const nodeOf = (id) => view.querySelector(`[data-id="${CSS.escape(id)}"]:not(.ac-fm-gal__hero)`);
  function focusCursor() { const n = state.cursor && nodeOf(state.cursor); if (n) { n.focus({ preventScroll: true }); n.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } else view.focus({ preventScroll: true }); }

  /* spatial keyboard navigation for the icon grid */
  function spatial(id, dir) {
    const from = nodeOf(id); if (!from) return state.order[0];
    const a = from.getBoundingClientRect(); const ax = a.left + a.width / 2; const ay = a.top + a.height / 2;
    let best = null; let bestD = Infinity;
    for (const oid of state.order) {
      if (oid === id) continue; const n = nodeOf(oid); if (!n) continue;
      const b = n.getBoundingClientRect(); const bx = b.left + b.width / 2; const by = b.top + b.height / 2;
      const dx = bx - ax; const dy = by - ay;
      const ok = dir === 'down' ? dy > a.height / 2 : dir === 'up' ? dy < -a.height / 2 : dir === 'right' ? dx > 4 && Math.abs(dy) < a.height / 2 : dx < -4 && Math.abs(dy) < a.height / 2;
      if (!ok) continue;
      const d = dir === 'up' || dir === 'down' ? Math.abs(dy) * 1000 + Math.abs(dx) : Math.abs(dx);
      if (d < bestD) { bestD = d; best = oid; }
    }
    return best;
  }

  /* ---------------------------------------------------------------- search */
  let searchT = 0;
  async function runSearch(rerender = true) {
    if (!searching()) { state.results = null; if (rerender) render({ anim: 'none' }); return; }
    const scope = state.scope === 'here' && !isVirtual(state.loc) ? state.loc : null;
    const q = state.query;
    const res = fs.search ? await fs.search(q, { scope, ...state.filters }) : visible().filter((e) => normalize(e.name).includes(normalize(q)));
    if (q !== state.query) return;
    state.results = remember(res); state.sel = new Set(); state.cursor = state.anchor = null;
    if (rerender) render({ anim: 'none' });
  }
  function clearSearch(rerender = true) {
    state.query = ''; state.filters = {}; state.results = null;
    for (const q of el.querySelectorAll('.ac-fm__q')) q.value = '';
    if (rerender) render({ anim: 'none' });
  }

  /* ---------------------------------------------------------------- actions */
  const target = () => (state.sel.size ? selected() : []);
  const folderHere = () => (!isVirtual(state.loc) && !searching() ? state.loc : null);
  const changed = (action, ids) => AC.emit?.(el, 'files:change', { action, ids });
  async function run(act, list = target(), ev) {
    const ids = list.map((e) => e.id); const one = list[0];
    switch (act) {
      case 'open': list.slice(0, 1).forEach((e) => open(e, nodeOf(e.id)?.querySelector('.ac-fm__art'))); break;
      case 'ql': if (one) quickLook(one.id); break;
      case 'info': state.info = true; persist(); renderBar(); openInfo(); break;
      case 'rename': if (one) rename(one.id); break;
      case 'newfolder': newFolder(); break;
      case 'upload': pick(); break;
      case 'duplicate': { const made = await fs.copy(ids, folderHere() || one.parent, { suffix: t('copySuffix') }); await refresh({ flip: true }); select(made.map((m) => m.id)); changed('duplicate', ids); break; }
      case 'compress': { const z = await fs.compress(ids, one.parent, list.length === 1 ? `${one.name.replace(/\.[^.]+$/, '')}.zip` : t('archiveName')); await refresh({ flip: true }); select([z.id]); AC.toast?.({ title: t('compressed', { name: z.name }), tone: 'success', duration: 2400 }); changed('compress', ids); break; }
      case 'copy': case 'cut': state.clip = { op: act, ids }; if (act === 'cut') renderView(); syncSel(); AC.toast?.({ title: t('clipCopy', { n: num(ids.length) }), duration: 1600, icon: act === 'cut' ? 'scissors' : 'copy' }); break;
      case 'paste': await paste(); break;
      case 'copylink': { const link = fs.share ? await fs.share(one.id, { permission: 'view' }) : { url: location.href }; (AC.copyText || ((s) => navigator.clipboard?.writeText(s)))(link.url); AC.toast?.({ title: t('linkCopied'), text: link.url, tone: 'success', duration: 2400 }); break; }
      case 'share': shareDialog(one || state.here); break;
      case 'star': { const on = !list.every((e) => e.starred); for (const e of list) await fs.update(e.id, { starred: on }); await refresh(); changed('star', ids); break; }
      case 'trash': await trash(ids); break;
      case 'restore': await fs.restore(ids); await refresh({ flip: true }); AC.toast?.({ title: t('restored', { n: num(ids.length) }), tone: 'success', duration: 2400 }); changed('restore', ids); break;
      case 'delete': await deleteNow(list); break;
      case 'emptytrash': await emptyTrash(); break;
      case 'selectall': select(state.order); break;
      case 'moveto': moveToMenu(list, ev); break;
      case 'tags': tagsMenu(list, ev); break;
      default: break;
    }
  }
  async function trash(ids) {
    if (!ids.length) return;
    if (inTrash()) { deleteNow(ids.map(entry)); return; }
    const names = ids.map((id) => entry(id)?.name);
    const nodes = ids.map(nodeOf).filter(Boolean);
    if (nodes.length) await Promise.all(nodes.map((n) => fx(n, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.86)' }], { duration: 170, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' })?.finished.catch(() => {})));
    await fs.trash(ids);
    await refresh({ flip: true });
    AC.toast?.undo?.(ids.length === 1 ? t('trashed1', { name: names[0] }) : t('trashed', { n: num(ids.length) }), async () => { await fs.restore(ids); await refresh({ flip: true }); select(ids); });
    changed('trash', ids);
  }
  async function deleteNow(list) {
    const ok = await AC.confirm({ tone: 'danger', title: list.length === 1 ? t('deleteQ', { name: list[0].name }) : t('deleteNQ', { n: num(list.length) }), text: t('cantUndo'), confirmText: t('erase') });
    if (!ok) return;
    await fs.remove(list.map((e) => e.id)); await refresh({ flip: true });
    AC.toast?.({ title: t('deleted', { n: num(list.length) }), tone: 'success', duration: 2200 }); changed('delete', list.map((e) => e.id));
  }
  async function emptyTrash() {
    const n = (await fs.list('@trash')).length; if (!n) return;
    const ok = await AC.confirm({ tone: 'danger', title: t('emptyTrashQ', { n: num(n) }), text: t('cantUndo'), confirmText: t('emptyTrash') });
    if (!ok) return;
    await fs.emptyTrash(); await refresh({ anim: 'fade' }); changed('emptytrash', []);
  }
  async function paste() {
    const dest = folderHere(); if (!dest || !state.clip) return;
    const { op, ids } = state.clip;
    if (op === 'cut') { const from = ids.map((id) => [id, entry(id)?.parent]); const moved = await fs.move(ids, dest); state.clip = null; await refresh({ flip: true }); select(moved.map((m) => m.id)); undoMove(from, moved.length, dest); }
    else { const made = await fs.copy(ids, dest, { suffix: t('copySuffix') }); await refresh({ flip: true }); select(made.map((m) => m.id)); AC.toast?.({ title: t('copied', { n: num(made.length), to: locName(dest) }), tone: 'success', duration: 2200 }); }
    changed(op === 'cut' ? 'move' : 'copy', ids);
  }
  function undoMove(from, n, dest) {
    AC.toast?.undo?.(t('moved', { n: num(n), to: locName(dest) || entry(dest)?.name || '' }), async () => {
      const byParent = new Map(); for (const [id, p] of from) { if (!byParent.has(p)) byParent.set(p, []); byParent.get(p).push(id); }
      for (const [p, list] of byParent) await fs.move(list, p);
      await refresh({ flip: true });
    });
  }
  async function moveTo(ids, dest, copy = false) {
    ids = ids.filter((id) => id !== dest);
    if (!ids.length) return;
    if (dest === '@trash') { await trash(ids); return; }
    if (dest.startsWith('@tag:')) { await fs.tag(ids, dest.slice(5), true); await refresh(); AC.toast?.({ title: t('tagged'), tone: 'success', duration: 1800 }); changed('tag', ids); return; }
    const from = ids.map((id) => [id, entry(id)?.parent]);
    if (copy) { const made = await fs.copy(ids, dest, { suffix: t('copySuffix') }); await refresh({ flip: true }); AC.toast?.({ title: t('copied', { n: num(made.length), to: entry(dest)?.name || locName(dest) }), tone: 'success', duration: 2200 }); changed('copy', ids); return; }
    const moved = await fs.move(ids, dest);
    if (!moved.length) return;
    await refresh({ flip: true });
    undoMove(from, moved.length, dest);
    changed('move', ids);
  }
  async function newFolder() {
    const dest = folderHere(); if (!dest) return;
    const f = await fs.mkdir(dest, t('untitled'));
    remember([f]); await refresh({ flip: true });
    select([f.id]); rename(f.id, true);
    changed('mkdir', [f.id]);
  }

  /* inline rename (F2) */
  function rename(id, fresh = false) {
    const node = nodeOf(id); const e = entry(id);
    if (!node || !e) return;
    const label = node.querySelector('.ac-fm__name'); if (!label || node.querySelector('.ac-fm-rename')) return;
    node.scrollIntoView({ block: 'nearest' });
    const input = document.createElement(curView() === 'icons' ? 'textarea' : 'input');
    input.className = 'ac-fm-rename'; input.value = e.name; input.dir = 'auto'; input.spellcheck = false; input.setAttribute('aria-label', t('rename'));
    if (input.tagName === 'TEXTAREA') input.rows = 2;
    label.hidden = true; label.after(input);
    const ext = extOf(e.name); const end = e.kind === 'file' && ext ? e.name.length - ext.length - 1 : e.name.length;
    input.focus(); input.setSelectionRange(0, end);
    let done = false;
    const finish = async (commit) => {
      if (done) return; done = true;
      const v = input.value.trim().replace(/\s*\n\s*/g, ' ');
      input.remove(); label.hidden = false;
      if (commit && v && v !== e.name) {
        try { const r = await fs.rename(id, v); remember([r]); await refresh({ flip: true }); select([id]); if (!fresh) AC.toast?.({ title: t('renamed'), tone: 'success', duration: 1400 }); changed('rename', [id]); }
        catch (err) { AC.toast?.error?.(err.code === 'EXIST' ? t('nameTaken', { name: v }) : t('invalidName')); rename(id); }
      }
      focusCursor();
    };
    input.addEventListener('keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Enter') { ev.preventDefault(); finish(true); } else if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
    });
    input.addEventListener('blur', () => finish(true));
    input.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  }

  /* ---------------------------------------------------------------- menus */
  function itemMenu(list) {
    const one = list.length === 1 ? list[0] : null;
    if (inTrash()) return [{ label: t('restore'), icon: 'rotate-ccw', onSelect: () => run('restore', list) }, '-', { label: t('deleteNow'), icon: 'trash-2', tone: 'danger', onSelect: () => run('delete', list) }];
    const tagItems = state.tags.map((tg) => ({ label: L(tg.name), checked: list.every((e) => e.tags?.includes(tg.id)), keep: true, onSelect: async (it, d) => { await fs.tag(list.map((e) => e.id), tg.id, d.checked); for (const e of list) { const x = entry(e.id); if (x) x.tags = d.checked ? [...new Set([...(x.tags || []), tg.id])] : (x.tags || []).filter((y) => y !== tg.id); } refreshSoon(); } }));
    return [
      { label: t('open'), icon: one?.kind === 'folder' ? 'folder-open' : 'external-link', shortcut: '↵', onSelect: () => run('open', list) },
      ...(one && one.kind === 'file' ? [{ label: t('quickLook'), icon: 'eye', shortcut: 'Space', onSelect: () => run('ql', list) }] : []),
      { label: t('info'), icon: 'info', shortcut: 'Ctrl I', onSelect: () => { select(list.map((e) => e.id)); run('info', list); } },
      '-',
      ...(one ? [{ label: t('rename'), icon: 'pencil', shortcut: 'F2', onSelect: () => rename(one.id) }] : []),
      { label: t('duplicate'), icon: 'copy-plus', shortcut: 'Ctrl D', onSelect: () => run('duplicate', list) },
      { label: t('compress'), icon: 'file-archive', onSelect: () => run('compress', list) },
      { label: t('moveTo'), icon: 'folder-input', items: moveTargets(list) },
      { label: t('copy'), icon: 'copy', shortcut: 'Ctrl C', onSelect: () => run('copy', list) },
      { label: t('cut'), icon: 'scissors', shortcut: 'Ctrl X', onSelect: () => run('cut', list) },
      '-',
      ...(one ? [{ label: t('copyLink'), icon: 'link', onSelect: () => run('copylink', list) }, { label: t('share'), icon: 'share-2', onSelect: () => run('share', list) }] : []),
      { label: t('nTags'), icon: 'tag', items: tagItems },
      { label: list.every((e) => e.starred) ? t('unstar') : t('star'), icon: 'star', onSelect: () => run('star', list) },
      '-',
      { label: t('toTrash'), icon: 'trash-2', tone: 'danger', shortcut: 'Del', onSelect: () => run('trash', list) },
    ];
  }
  function moveTargets(list) {
    const ids = new Set(list.map((e) => e.id));
    const folders = [{ id: state.root, name: t('allFiles') }, ...state.favorites, ...state.items.filter((e) => e.kind === 'folder')].filter((f, i, a) => !ids.has(f.id) && a.findIndex((x) => x.id === f.id) === i);
    return folders.slice(0, 12).map((f) => ({ label: f.name, icon: f.id === state.root ? 'house' : 'folder', onSelect: () => moveTo([...ids], f.id) }));
  }
  function moveToMenu(list, ev) { AC.menu(ev?.currentTarget || ev || selbar, moveTargets(list), { placement: 'top' }); }
  function tagsMenu(list, ev) { AC.menu(ev?.currentTarget || ev || selbar, itemMenu(list).find((x) => x.icon === 'tag')?.items || [], { placement: 'top' }); }
  function bgMenu() {
    const dest = folderHere();
    return [
      ...(dest ? [{ label: t('newFolder'), icon: 'folder-plus', shortcut: 'Ctrl ⇧ N', onSelect: newFolder }, { label: t('upload'), icon: 'upload', onSelect: pick }] : []),
      ...(dest && state.clip ? [{ label: t('paste'), icon: 'clipboard-paste', shortcut: 'Ctrl V', onSelect: paste }] : []),
      ...(inTrash() ? [{ label: t('emptyTrash'), icon: 'trash-2', tone: 'danger', onSelect: emptyTrash }] : []),
      '-', ...viewMenu(), '-',
      ...(dest ? [{ label: t('info'), icon: 'info', onSelect: () => { state.sel.clear(); syncSel(); run('info'); } }] : []),
    ].filter((x, i, a) => !(x === '-' && (i === 0 || a[i - 1] === '-')));
  }
  function viewMenu() {
    return [
      { label: t('view'), icon: VIEW_ICON[curView()], items: VIEWS.filter((v) => !isPhone() || v !== 'columns').map((v) => ({ label: t(v), icon: VIEW_ICON[v], radio: 'view', checked: curView() === v, onSelect: () => setView(v) })) },
      { label: t('sortBy'), icon: 'arrow-up-down', items: sortItems() },
      { label: t('groupBy'), icon: 'layers', items: groupItems() },
    ];
  }
  const sortItems = () => [
    ...['name', 'kind', 'modified', 'created', 'size', 'status'].map((k) => ({ label: t(k), radio: 'sort', checked: state.sort.key === k, onSelect: () => setSort(k, state.sort.dir) })),
    '-',
    { label: t('ascending'), radio: 'dir', checked: state.sort.dir > 0, onSelect: () => setSort(state.sort.key, 1) },
    { label: t('descending'), radio: 'dir', checked: state.sort.dir < 0, onSelect: () => setSort(state.sort.key, -1) },
    '-',
    { label: t('foldersFirst'), checked: state.foldersFirst, onSelect: (it, d) => { state.foldersFirst = d.checked; persist(); render({ flip: true }); } },
  ];
  const groupItems = () => ['none', 'kind', 'date', 'tags'].map((g) => ({ label: g === 'date' ? t('modified') : t(g === 'tags' ? 'nTags' : g), radio: 'group', checked: state.group === g, onSelect: () => { state.group = g; persist(); render({ anim: 'fade' }); } }));
  function sortMenu(anchor) {
    AC.menu(anchor, [{ heading: t('sortBy') }, ...sortItems(), '-', { heading: t('groupBy') }, ...groupItems()], { placement: 'bottom-end' });
  }
  function moreMenu(anchor) {
    const list = target();
    AC.menu(anchor, [
      ...(folderHere() ? [{ label: t('newFolder'), icon: 'folder-plus', onSelect: newFolder }, { label: t('upload'), icon: 'upload', onSelect: pick }, '-'] : []),
      ...(isPhone() ? [...viewMenu(), '-'] : []),
      { label: t('selectAll'), icon: 'list-checks', shortcut: 'Ctrl A', onSelect: () => run('selectall') },
      ...(list.length ? [{ label: t('nTags'), icon: 'tag', items: itemMenu(list).find((x) => x.icon === 'tag')?.items || [] }, { label: t('moveTo'), icon: 'folder-input', items: moveTargets(list) }] : []),
      ...(state.clip && folderHere() ? [{ label: t('paste'), icon: 'clipboard-paste', onSelect: paste }] : []),
      '-',
      { label: t('trash'), icon: 'trash-2', onSelect: () => go('@trash') },
      ...(inTrash() ? [{ label: t('emptyTrash'), icon: 'trash-2', tone: 'danger', onSelect: emptyTrash }] : []),
    ].filter((x, i, a) => !(x === '-' && (i === 0 || a[i - 1] === '-' || i === a.length - 1))), { placement: 'bottom-end' });
  }
  function setView(v, { flip = true } = {}) {
    if (!VIEWS.includes(v)) return;
    if (isPhone()) state.phoneView = v; else state.view = v;
    persist(); render({ flip });
    focusCursor();
  }
  function setSort(k, dir) { state.sort = { key: k, dir }; persist(); render({ flip: true }); }
  let rsT = 0; const refreshSoon = () => { clearTimeout(rsT); rsT = setTimeout(() => refresh(), 60); };

  /* ---------------------------------------------------------------- inspector (Get Info) */
  let infoLayer = null; let infoT = 0;
  const renderInfoSoon = () => { clearTimeout(infoT); infoT = setTimeout(renderInfo, 40); };
  const wide = () => el.getBoundingClientRect().width >= 1100 && !isPhone();
  function openInfo() {
    if (wide()) { renderInfo(); return; }
    const box = document.createElement('div'); box.className = 'ac-fm-inspector ac-fm-inspector--sheet';
    const cfg2 = { title: t('info'), content: box, className: 'ac-fm-layer' };
    infoLayer = isPhone() ? AC.sheet.open({ ...cfg2, snap: [0.62, 0.94] }) : AC.drawer.open({ ...cfg2, side: 'end' });
    const layerEl = box.closest('.ac-sheet, .ac-drawer');
    layerEl?.addEventListener(isPhone() ? 'ac:sheet:close' : 'ac:drawer:close', () => { infoLayer = null; state.info = false; renderBar(); }, { once: true });
    renderInfo();
  }
  async function renderInfo() {
    const host = infoLayer ? document.querySelector('.ac-fm-inspector--sheet') : $('.ac-fm__info');
    if (!host) return;
    if (!infoLayer && !((state.info || state.preview) && wide())) { host.innerHTML = ''; return; }
    if (!infoLayer && !state.info && state.preview) { host.innerHTML = paneHTML(); fillFull(host); return; }
    const list = selected();
    const e = list.length === 1 ? list[0] : !list.length ? state.here : null;
    if (!e) {
      host.innerHTML = list.length ? `<div class="ac-fm-ins"><div class="ac-fm-ins__hero ac-fm-ins__hero--multi">${list.slice(0, 3).map((x) => `<span class="ac-fm__art">${art(x)}</span>`).join('')}</div><h3 class="ac-fm-ins__name">${esc(t('multi', { n: num(list.length) }))}</h3><p class="ac-fm-ins__sub"><bdi>${esc(size(list.reduce((s, x) => s + (x.size || 0), 0)))}</bdi></p>${tagsEditor(list)}</div>` : `<div class="ac-fm-empty ac-fm-empty--sm">${icon('info')}<p>${esc(t('noSelection'))}</p></div>`;
      return;
    }
    const isDoc = ['pdf', 'doc', 'image', 'xls'].includes(typeOf(e)) && e.kind === 'file';
    const [versions, activity] = await Promise.all([e.kind === 'file' && fs.versions ? fs.versions(e.id).catch(() => []) : [], fs.activity ? fs.activity(e.id).catch(() => []) : []]);
    const ex = expiryInfo(e);
    const user = (id) => state.users.find((u) => u.id === id) || { id, name: id };
    const avatar = (u) => `<span class="ac-avatar ac-avatar--sm" data-color="${u.color || 1}">${esc(L(u.name).trim().slice(0, 1))}</span>`;
    const where = (e.path || []).slice(0, -1).map((p) => (p.id === state.root ? t('allFiles') : p.name)).join(' › ') || '—';
    const sec = (id, title, body, open = true) => `<details class="ac-fm-ins__sec" data-sec="${id}"${open ? ' open' : ''}><summary>${esc(title)}${icon('chevron-down', 'ac-icon--sm')}</summary><div class="ac-fm-ins__body">${body}</div></details>`;
    const opt = (v, label, cur) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(label)}</option>`;
    const docTypes = cfg.docTypes || [];
    const record = isDoc ? sec('record', t('record'), `
      <div class="ac-fm-ins__chips">${statusChip(e)}${ocrChip(e)}${expChip(e)}</div>
      <label class="ac-fm-field"><span>${esc(t('approval'))}</span><select class="ac-select" data-doc="status">${opt('', '—', e.status)}${['draft', 'review', 'approved', 'signed'].map((s) => opt(s, t(s), e.status)).join('')}</select></label>
      <label class="ac-fm-field"><span>${esc(t('docType'))}</span><input class="ac-input" data-doc="type" list="${el.id || 'fm'}-dtypes" value="${esc(e.doc?.type || '')}" dir="auto"><datalist id="${el.id || 'fm'}-dtypes">${docTypes.map((x) => `<option value="${esc(L(x))}">`).join('')}</datalist></label>
      <div class="ac-fm-field2"><label class="ac-fm-field"><span>${esc(t('docNumber'))}</span><input class="ac-input" data-doc="number" value="${esc(e.doc?.number || '')}" dir="auto"></label>
      <label class="ac-fm-field"><span>${esc(t('docDate'))}</span><input class="ac-input" type="date" data-doc="date" value="${esc((e.doc?.date || '').slice(0, 10))}"></label></div>
      <label class="ac-fm-field"><span>${esc(t('parties'))}</span><input class="ac-input" data-doc="parties" value="${esc(e.doc?.parties || '')}" dir="auto"></label>
      <label class="ac-fm-field"><span>${esc(t('expiry'))}${ex ? ` <span class="ac-fm-chip" data-tone="${ex.tone}">${icon(ex.tone === 'danger' ? 'circle-alert' : ex.tone === 'warning' ? 'bell-ring' : 'calendar')}<bdi>${esc(ex.label)}</bdi></span>` : ''}</span><input class="ac-input" type="date" data-doc="expiry" value="${esc((e.doc?.expiry || '').slice(0, 10))}"></label>
      ${e.doc?.expiry ? `<span class="ac-fm-ins__greg">${esc(dateOnly(e.doc.expiry, { year: 'numeric', month: 'long', day: 'numeric' }))} · ${esc(greg(e.doc.expiry))}</span>` : ''}
      <label class="ac-fm-check2"><input class="ac-switch" type="checkbox" role="switch" data-doc="remind"${e.doc?.remind ? ' checked' : ''}><span>${esc(t('remind'))}</span></label>
      <div class="ac-fm-ocr" data-ocr="${esc(e.ocr || 'none')}">${icon('scan-text')}<span>${esc(t(e.ocr === 'done' ? 'ocrDone' : e.ocr === 'pending' ? 'ocrPending' : 'ocrNone'))}</span>${e.ocr !== 'done' && e.ocr !== 'pending' ? `<button class="ac-btn ac-btn--sm ac-btn--soft" type="button" data-act="ocr">${esc(t('runOcr'))}</button>` : ''}</div>`) : '';
    const shares = e.shared?.length ? e.shared.map((s) => { const u = user(s.user); return `<div class="ac-fm-person">${avatar(u)}<span class="ac-fm-person__n" dir="auto">${esc(L(u.name))}<small>${esc(u.email || '')}</small></span><select class="ac-select ac-fm-person__r" data-role="${esc(s.user)}"${s.role === 'owner' ? ' disabled' : ''}>${['owner', 'editor', 'commenter', 'viewer'].map((r) => opt(r, t(r), s.role)).join('')}</select></div>`; }).join('') : `<p class="ac-fm-ins__muted">${esc(t('onlyYou'))}</p>`;
    host.innerHTML = `<div class="ac-fm-ins" data-for="${esc(e.id)}">
      <div class="ac-fm-ins__hero"><span class="ac-fm__art">${art(e, { live: true })}</span></div>
      <h3 class="ac-fm-ins__name" dir="auto">${esc(e.id === state.root ? t('allFiles') : e.name)}</h3>
      <p class="ac-fm-ins__sub">${esc(kindName(e))} · <bdi>${esc(e.kind === 'folder' ? itemsLabel(e.count ?? 0) : size(e.size))}</bdi></p>
      <div class="ac-fm-ins__acts">${e.kind === 'file' ? `<button class="ac-btn ac-btn--sm ac-btn--primary" type="button" data-act="ql">${icon('eye')}<span>${esc(t('quickLook'))}</span></button>` : ''}<button class="ac-btn ac-btn--sm" type="button" data-act="share">${icon('share-2')}<span>${esc(t('share').replace('…', ''))}</span></button><button class="ac-btn ac-btn--sm ac-btn--icon" type="button" data-act="star" aria-pressed="${!!e.starred}" aria-label="${esc(e.starred ? t('unstar') : t('star'))}">${icon('star')}</button></div>
      ${sec('general', t('general'), `<dl class="ac-fm-dl">
        <div><dt>${esc(t('kind'))}</dt><dd>${esc(kindName(e))}</dd></div>
        <div><dt>${esc(t('size'))}</dt><dd><bdi>${esc(e.kind === 'file' ? t('sizeBytes', { size: size(e.size), b: num(e.size) }) : size(e.size))}</bdi></dd></div>
        <div><dt>${esc(t('where'))}</dt><dd dir="auto">${esc(where)}</dd></div>
        <div><dt>${esc(t('created'))}</dt><dd><bdi>${esc(both(e.created))}</bdi><small><bdi>${esc(greg(e.created))}</bdi></small></dd></div>
        <div><dt>${esc(t('modified'))}</dt><dd><bdi>${esc(both(e.modified))}</bdi><small><bdi>${esc(greg(e.modified))}</bdi></small></dd></div>
        ${e.opened ? `<div><dt>${esc(t('opened'))}</dt><dd><bdi>${esc(when(e.opened))}</bdi></dd></div>` : ''}
        ${e.dims ? `<div><dt>${esc(t('dims'))}</dt><dd><bdi>${esc(`${e.dims[0]} × ${e.dims[1]}`)}</bdi></dd></div>` : ''}
        ${e.duration ? `<div><dt>${esc(t('duration'))}</dt><dd><bdi>${dur(e.duration)}</bdi></dd></div>` : ''}</dl>`)}
      ${record}
      ${e.id !== state.root ? sec('tags', t('nTags'), tagsEditor([e])) : ''}
      ${sec('comments', t('comments'), `<textarea class="ac-input ac-fm-comment" rows="3" dir="auto" placeholder="${esc(t('commentPh'))}">${esc(e.comment || '')}</textarea>`)}
      ${sec('sharing', t('sharing'), `${shares}<button class="ac-btn ac-btn--sm ac-btn--soft ac-fm-ins__add" type="button" data-act="share">${icon('user-plus')}<span>${esc(t('addPeople'))}</span></button>`, !!e.shared?.length)}
      ${versions.length ? sec('versions', t('versions'), `<ol class="ac-fm-vers">${versions.map((v) => `<li data-v="${esc(v.id)}"><span class="ac-fm-vers__dot"></span><span class="ac-fm-vers__m"><bdi>${esc(when(v.date))}</bdi><small>${esc(L(user(v.by).name) || '')} · <bdi>${esc(size(v.size))}</bdi></small></span>${v.current ? `<span class="ac-fm-chip" data-tone="success">${esc(t('current'))}</span>` : `<button class="ac-btn ac-btn--sm ac-btn--ghost" type="button" data-restore-v="${esc(v.id)}">${icon('history')}<span>${esc(t('restoreVersion'))}</span></button>`}</li>`).join('')}</ol>`, versions.length > 1) : ''}
      ${activity.length ? sec('activity', t('activity'), `<ol class="ac-fm-act">${activity.slice(0, 8).map((a) => `<li>${avatar(user(a.by))}<span><b dir="auto">${esc(L(user(a.by).name))}</b> ${esc(t(`a.${a.action}`))}<small><bdi>${esc(when(a.at))}</bdi></small></span></li>`).join('')}</ol>`, false) : ''}
    </div>`;
  }
  /** Finder-style preview pane: a large live preview of the selection + key metadata. */
  function paneHTML() {
    const list = selected(); const e = list.length === 1 ? list[0] : null;
    if (!e) return `<div class="ac-fm-empty ac-fm-empty--sm">${icon('eye')}<p>${esc(list.length ? t('multi', { n: num(list.length) }) : t('noSelection'))}</p></div>`;
    return `<div class="ac-fm-pane" data-for="${esc(e.id)}">${previewCard(e)}</div>`;
  }
  function tagsEditor(list) {
    const has = (id) => list.every((e) => e.tags?.includes(id));
    return `<div class="ac-fm-tags" data-tags-for="${esc(list.map((e) => e.id).join(','))}">${state.tags.map((tg) => `<button class="ac-fm-tagbtn" type="button" data-tag="${esc(tg.id)}" aria-pressed="${has(tg.id)}" style="--_t:${tagColor(tg)}"><i></i><span dir="auto">${esc(L(tg.name))}</span></button>`).join('')}</div>`;
  }
  async function onInfoInput(ev) {
    const ins = ev.target.closest('.ac-fm-ins'); if (!ins) return;
    const id = ins.dataset.for; const e = entry(id); if (!e) return;
    const f = ev.target;
    if (f.matches('[data-doc]')) {
      const k = f.dataset.doc; const v = f.type === 'checkbox' ? f.checked : f.value;
      const patch = k === 'status' ? { status: v } : { doc: { ...(e.doc || {}), [k]: v } };
      const r = await fs.update(id, patch); remember([r]); refreshSoon();
    } else if (f.matches('.ac-fm-comment')) { const r = await fs.update(id, { comment: f.value }); remember([r]); }
    else if (f.matches('[data-role]')) { const shared = (e.shared || []).map((s) => (s.user === f.dataset.role ? { ...s, role: f.value } : s)); const r = await fs.update(id, { shared }); remember([r]); }
  }

  /* ---------------------------------------------------------------- share dialog */
  function shareDialog(e) {
    if (!e) return;
    const box = document.createElement('div'); box.className = 'ac-fm-share';
    const user = (id) => state.users.find((u) => u.id === id) || { id, name: id };
    box.innerHTML = `<div class="ac-fm-share__file"><span class="ac-fm__art">${art(e)}</span><span><b dir="auto">${esc(e.name)}</b><small>${esc(kindName(e))} · <bdi>${esc(size(e.size))}</bdi></small></span></div>
      <label class="ac-fm-field"><span>${esc(t('link'))}</span><span class="ac-fm-share__link"><input class="ac-input" readonly dir="ltr" placeholder="https://…" data-share-url><button class="ac-btn ac-btn--sm" type="button" data-share-copy disabled>${icon('copy')}<span>${esc(t('copy'))}</span></button></span></label>
      <div class="ac-fm-field2"><label class="ac-fm-field"><span>${esc(t('expires'))}</span><select class="ac-select" data-share-exp><option value="1">${esc(t('day1'))}</option><option value="7" selected>${esc(t('day7'))}</option><option value="30">${esc(t('day30'))}</option><option value="0">${esc(t('never'))}</option></select></label>
      <label class="ac-fm-field"><span>${esc(t('permission'))}</span><select class="ac-select" data-share-perm><option value="view">${esc(t('viewer'))}</option><option value="comment">${esc(t('commenter'))}</option><option value="edit">${esc(t('editor'))}</option></select></label></div>
      <label class="ac-fm-check2"><input class="ac-switch" type="checkbox" role="switch" data-share-pw-on><span>${esc(t('password'))}</span></label>
      <div class="ac-fm-share__pw" hidden><input class="ac-input" type="password" autocomplete="new-password" placeholder="${esc(t('passwordPh'))}" data-share-pw></div>
      <div class="ac-fm-share__people"><span class="ac-fm-share__h">${esc(t('people'))}</span>${(e.shared?.length ? e.shared : [{ user: state.users[0]?.id, role: 'owner' }]).filter((s) => s.user).map((s) => { const u = user(s.user); return `<div class="ac-fm-person"><span class="ac-avatar ac-avatar--sm" data-color="${u.color || 1}">${esc(L(u.name).slice(0, 1))}</span><span class="ac-fm-person__n" dir="auto">${esc(L(u.name))}<small>${esc(u.email || '')}</small></span><span class="ac-fm-chip" data-tone="neutral">${esc(t(s.role))}</span></div>`; }).join('')}</div>`;
    const m = AC.modal.open({ title: t('shareTitle', { name: shortName(e.name, 32) }), sub: t('shareSub'), content: box, size: 'md', className: 'ac-fm-layer',
      footer: `<button class="ac-btn" type="button" data-ac-close>${esc(t('done'))}</button><button class="ac-btn ac-btn--primary" type="button" data-share-create>${icon('link')}<span>${esc(t('createLink'))}</span></button>` });
    const root = box.closest('.ac-modal') || box;
    const pwOn = box.querySelector('[data-share-pw-on]');
    pwOn.addEventListener('change', () => { box.querySelector('.ac-fm-share__pw').hidden = !pwOn.checked; if (pwOn.checked) box.querySelector('[data-share-pw]').focus(); });
    root.addEventListener('click', async (ev) => {
      if (ev.target.closest('[data-share-create]')) {
        const link = await fs.share(e.id, { expires: Number(box.querySelector('[data-share-exp]').value), password: pwOn.checked ? box.querySelector('[data-share-pw]').value : '', permission: box.querySelector('[data-share-perm]').value });
        const inp = box.querySelector('[data-share-url]'); inp.value = link.url; inp.select();
        box.querySelector('[data-share-copy]').disabled = false;
        (AC.copyText || ((s) => navigator.clipboard?.writeText(s)))(link.url);
        AC.toast?.({ title: t('linkCopied'), tone: 'success', duration: 2000 });
        fx(inp, [{ opacity: 0.4 }, { opacity: 1 }], { duration: 260 });
      }
      if (ev.target.closest('[data-share-copy]')) { const u = box.querySelector('[data-share-url]').value; (AC.copyText || ((s) => navigator.clipboard?.writeText(s)))(u); AC.toast?.({ title: t('linkCopied'), tone: 'success', duration: 1600 }); }
    });
    return m;
  }

  /* ---------------------------------------------------------------- uploads */
  const jobs = []; let jobSeq = 0; let upCollapsed = false;
  function pick() { if (folderHere()) $('.ac-fm__file').click(); }
  async function upload(fileList, dest = folderHere()) {
    const files = [...fileList]; if (!files.length || !dest) return;
    const existing = new Set((dest === state.loc ? state.items : await fs.list(dest)).map((e) => normalize(e.name)));
    let all = null;
    for (const file of files) {
      let conflict = 'keep';
      if (existing.has(normalize(file.name))) {
        conflict = all || await askConflict(file.name, entry(dest)?.name || locName(dest), (choice) => { all = choice; });
        if (conflict === 'skip') { jobs.push({ id: ++jobSeq, file, name: file.name, dest, state: 'skipped', loaded: 0, total: file.size }); continue; }
      }
      jobs.push({ id: ++jobSeq, file, name: file.name, dest, conflict, state: 'queued', loaded: 0, total: file.size || 1, t0: 0 });
    }
    upCollapsed = false; pump(); renderUploads();
  }
  function askConflict(name, folder, setAll) {
    return new Promise((resolve) => {
      const box = document.createElement('div'); box.className = 'ac-fm-conflict';
      box.innerHTML = `<div class="ac-fm-conflict__art">${fileArt({ name, kind: 'file' })}</div><p class="ac-dialog__text">${esc(t('conflictX', { folder }))}</p><label class="ac-fm-check2"><input class="ac-check" type="checkbox" data-all><span>${esc(t('applyAll'))}</span></label>`;
      let choice = 'skip';
      const m = AC.modal.open({ title: t('conflictT', { name: shortName(name, 34) }), content: box, size: 'sm', className: 'ac-fm-layer ac-fm-conflict-layer',
        footer: `<button class="ac-btn" type="button" data-choice="skip">${esc(t('skip'))}</button><button class="ac-btn" type="button" data-choice="keep">${esc(t('keepBoth'))}</button><button class="ac-btn ac-btn--primary" type="button" data-choice="replace">${esc(t('replace'))}</button>` });
      const root = box.closest('.ac-modal');
      root.addEventListener('click', (ev) => { const b = ev.target.closest('[data-choice]'); if (!b) return; choice = b.dataset.choice; if (box.querySelector('[data-all]').checked) setAll(choice); m?.close?.('choice') ?? AC.modal.close(root); });
      root.addEventListener('ac:modal:close', () => resolve(choice), { once: true });
    });
  }
  function pump() {
    const active = jobs.filter((j) => j.state === 'uploading' || j.state === 'paused').length;
    for (const j of jobs.filter((x) => x.state === 'queued').slice(0, Math.max(0, 3 - active))) start(j);
  }
  function start(j) {
    j.state = 'uploading'; j.ctrl = new AbortController(); j.t0 = performance.now(); j.paused = false;
    const url = URL.createObjectURL(j.file); // the memory adapter keeps it, so uploads preview their real content
    fs.upload(j.dest, j.file, { name: j.name, conflict: j.conflict, signal: j.ctrl.signal, isPaused: () => j.paused, url,
      onProgress: (l, tot) => { j.loaded = l; j.total = tot; paintJob(j); } })
      .then(async (e) => {
        j.state = 'done'; j.entry = e; remember([e]); paintJob(j, true);
        AC.emit?.(el, 'files:upload', { entry: e });
        if (j.dest === state.loc) { await refreshDebounced(); }
        pump(); renderUploadsHead();
      })
      .catch((err) => { j.state = err.code === 'ABORT' ? 'cancelled' : 'error'; j.error = err.message; paintJob(j, true); pump(); renderUploadsHead(); });
  }
  let rdT = 0; const refreshDebounced = () => new Promise((r) => { clearTimeout(rdT); rdT = setTimeout(() => refresh({ flip: true }).then(r), 120); });
  const RING = 2 * Math.PI * 11;
  function jobHTML(j) {
    const p = j.total ? j.loaded / j.total : 0;
    return `<li class="ac-fm-job" data-job="${j.id}" data-state="${j.state}">
      <span class="ac-fm-job__art">${fileArt({ name: j.name, kind: 'file' })}</span>
      <span class="ac-fm-job__m"><span class="ac-fm-job__n" dir="auto">${esc(shortName(j.name, 34))}</span><small class="ac-fm-job__s">${jobSub(j)}</small></span>
      <span class="ac-fm-job__ring" style="--_p:${p}"><svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11"/><circle class="ac-fm-job__bar" cx="14" cy="14" r="11" stroke-dasharray="${RING}" stroke-dashoffset="${RING * (1 - p)}"/></svg><span class="ac-fm-job__ok">${icon('check')}</span><span class="ac-fm-job__err">${icon('circle-alert')}</span></span>
      <span class="ac-fm-job__b">${j.state === 'uploading' || j.state === 'paused' ? `<button type="button" data-job-act="${j.state === 'paused' ? 'resume' : 'pause'}" aria-label="${esc(t(j.state === 'paused' ? 'resume' : 'pause'))}">${icon(j.state === 'paused' ? 'play' : 'pause')}</button><button type="button" data-job-act="cancel" aria-label="${esc(t('cancel'))}">${icon('x')}</button>` : j.state === 'error' ? `<button type="button" data-job-act="retry" aria-label="${esc(t('retry'))}">${icon('rotate-ccw')}</button>` : j.state === 'queued' ? `<button type="button" data-job-act="cancel" aria-label="${esc(t('cancel'))}">${icon('x')}</button>` : ''}</span></li>`;
  }
  function jobSub(j) {
    if (j.state === 'done') return `<bdi>${esc(size(j.total))}</bdi>`;
    if (j.state === 'error') return esc(j.error || t('uploadFailed', { n: 1 }));
    if (j.state === 'queued') return esc(t('waiting'));
    if (j.state === 'cancelled') return esc(t('cancelled'));
    if (j.state === 'skipped') return esc(t('skipped'));
    if (j.state === 'paused') return `${esc(t('paused'))} · <bdi>${esc(size(j.loaded))} / ${esc(size(j.total))}</bdi>`;
    const el2 = (performance.now() - j.t0) / 1000; const rate = j.loaded / Math.max(0.2, el2); const left = rate ? (j.total - j.loaded) / rate : 0;
    return `<bdi>${esc(size(j.loaded))} / ${esc(size(j.total))}</bdi>${left > 0.5 ? ` · ${esc(t('left', { t: left > 60 ? `${num(Math.ceil(left / 60))}m` : `${num(Math.ceil(left))}s` }))}` : ''}`;
  }
  function paintJob(j, full = false) {
    const li = uploadsEl.querySelector(`[data-job="${j.id}"]`);
    if (!li) return;
    if (full) { const n = document.createElement('template'); n.innerHTML = jobHTML(j); const fresh = n.content.firstElementChild; li.replaceWith(fresh); if (j.state === 'done') fx(fresh.querySelector('.ac-fm-job__ok'), [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.18)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 380 }); return; }
    const p = j.total ? j.loaded / j.total : 0;
    li.querySelector('.ac-fm-job__bar').setAttribute('stroke-dashoffset', String(RING * (1 - p)));
    li.querySelector('.ac-fm-job__s').innerHTML = jobSub(j);
    renderUploadsHead();
  }
  function renderUploadsHead() {
    const head = uploadsEl.querySelector('.ac-fm-up__head'); if (!head) return;
    const live = jobs.filter((j) => ['queued', 'uploading', 'paused'].includes(j.state));
    const done = jobs.filter((j) => j.state === 'done').length; const failed = jobs.filter((j) => j.state === 'error').length;
    const tot = live.reduce((s, j) => s + j.total, 0); const got = live.reduce((s, j) => s + j.loaded, 0);
    head.querySelector('.ac-fm-up__t').textContent = live.length ? t('uploading', { n: num(live.length) }) : `${t('uploaded', { n: num(done) })}${failed ? ` · ${t('uploadFailed', { n: num(failed) })}` : ''}`;
    head.querySelector('.ac-fm-up__bar').style.setProperty('--_p', live.length ? String(got / Math.max(1, tot)) : '1');
    uploadsEl.dataset.busy = String(!!live.length);
    uploadsEl.querySelector('[data-up="close"]').hidden = !!live.length;
  }
  function renderUploads() {
    if (!jobs.length) { uploadsEl.hidden = true; return; }
    const wasHidden = uploadsEl.hidden;
    uploadsEl.hidden = false; uploadsEl.dataset.collapsed = String(upCollapsed);
    uploadsEl.dir = getComputedStyle(el).direction;
    uploadsEl.innerHTML = `<header class="ac-fm-up__head"><span class="ac-fm-up__t"></span><button type="button" class="ac-fm-up__ib" data-up="toggle" aria-label="${esc(t('collapse'))}" aria-expanded="${!upCollapsed}">${icon('chevron-down')}</button><button type="button" class="ac-fm-up__ib" data-up="close" aria-label="${esc(t('close'))}">${icon('x')}</button><span class="ac-fm-up__bar"></span></header>
      <ol class="ac-fm-up__list">${jobs.map(jobHTML).join('')}</ol>`;
    renderUploadsHead();
    if (wasHidden) fx(uploadsEl, [{ opacity: 0, transform: 'translateY(16px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
  }
  uploadsEl.addEventListener('click', (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.up === 'toggle') { upCollapsed = !upCollapsed; uploadsEl.dataset.collapsed = String(upCollapsed); b.setAttribute('aria-expanded', String(!upCollapsed)); return; }
    if (b.dataset.up === 'close') { const a = fx(uploadsEl, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(12px)' }], { duration: 180, fill: 'forwards' }); const fin = () => { jobs.length = 0; uploadsEl.hidden = true; a?.cancel(); }; a ? a.finished.then(fin, fin) : fin(); return; }
    const j = jobs.find((x) => String(x.id) === b.closest('[data-job]')?.dataset.job); if (!j) return;
    const a = b.dataset.jobAct;
    if (a === 'pause') { j.paused = true; j.state = 'paused'; paintJob(j, true); }
    else if (a === 'resume') { j.paused = false; j.state = 'uploading'; j.t0 = performance.now() - (j.loaded / Math.max(1, j.total)) * 1500; paintJob(j, true); }
    else if (a === 'cancel') { if (j.ctrl) j.ctrl.abort(); j.state = 'cancelled'; paintJob(j, true); pump(); }
    else if (a === 'retry') { j.state = 'queued'; j.loaded = 0; paintJob(j, true); pump(); }
    renderUploadsHead();
  });

  /* ---------------------------------------------------------------- Quick Look */
  let ql = null;
  async function quickLook(id) {
    const list = sorted(visible()).filter((e) => e.kind === 'file');
    let i = list.findIndex((e) => e.id === id); if (i < 0) { const e = entry(id); if (!e) return; list.unshift(e); i = 0; }
    if (ql) { ql.show(i); return; }
    const layer = document.createElement('div');
    layer.className = 'ac-fm-ql'; layer.dir = getComputedStyle(el).direction; layer.dataset.state = 'open';
    layer.innerHTML = `<div class="ac-fm-ql__scrim"></div><div class="ac-fm-ql__panel" role="dialog" aria-modal="true" aria-label="${esc(t('quickLook'))}">
      <header class="ac-fm-ql__bar"><button class="ac-fm-ql__b" type="button" data-ql="close" aria-label="${esc(t('close'))}">${icon('x')}</button>
        <div class="ac-fm-ql__title"><b dir="auto"></b><small></small></div>
        <span class="ac-fm-ql__zoom"><button class="ac-fm-ql__b" type="button" data-ql="out" aria-label="${esc(t('zoomOut'))}">${icon('zoom-out')}</button><button class="ac-fm-ql__b" type="button" data-ql="in" aria-label="${esc(t('zoomIn'))}">${icon('zoom-in')}</button></span>
        <button class="ac-fm-ql__b" type="button" data-ql="info" aria-label="${esc(t('info'))}">${icon('info')}</button><button class="ac-fm-ql__b" type="button" data-ql="share" aria-label="${esc(t('share'))}">${icon('share-2')}</button></header>
      <div class="ac-fm-ql__stage"></div>
      <button class="ac-fm-ql__nav ac-fm-ql__nav--prev" type="button" data-ql="prev" aria-label="${esc(t('prev'))}">${icon('chevron-left', 'ac-flip-rtl')}</button>
      <button class="ac-fm-ql__nav ac-fm-ql__nav--next" type="button" data-ql="next" aria-label="${esc(t('next'))}">${icon('chevron-right', 'ac-flip-rtl')}</button>
      <footer class="ac-fm-ql__count"></footer></div>`;
    document.body.append(layer);
    const panel = layer.querySelector('.ac-fm-ql__panel'); const stage = layer.querySelector('.ac-fm-ql__stage');
    const release = AC.trapFocus ? AC.trapFocus(panel, { initial: layer.querySelector('[data-ql="close"]') }) : () => {};
    AC.scrollLock?.lock();
    let zoom = { s: 1, x: 0, y: 0 }; let media = null; let cur = i; let token = 0;
    const applyZoom = () => { if (media) media.style.transform = `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})`; layer.dataset.zoomed = String(zoom.s > 1.01); };
    async function show(k, dir = 0) {
      cur = (k + list.length) % list.length; const e = list[cur]; const my = ++token;
      state.cursor = e.id; if (!state.sel.has(e.id)) state.sel = new Set([e.id]); syncSel();
      layer.querySelector('.ac-fm-ql__title b').textContent = e.name;
      layer.querySelector('.ac-fm-ql__title small').innerHTML = `${esc(kindName(e))} · <bdi>${esc(size(e.size))}</bdi>${e.dims ? ` · <bdi>${e.dims[0]}×${e.dims[1]}</bdi>` : ''}`;
      layer.querySelector('.ac-fm-ql__count').textContent = list.length > 1 ? t('of', { i: num(cur + 1), n: num(list.length) }) : '';
      layer.querySelector('.ac-fm-ql__nav--prev').hidden = layer.querySelector('.ac-fm-ql__nav--next').hidden = list.length < 2;
      zoom = { s: 1, x: 0, y: 0 }; media = null;
      const ty = typeOf(e);
      layer.dataset.kind = ty;
      const box = document.createElement('div'); box.className = 'ac-fm-ql__content';
      box.innerHTML = `<div class="ac-fm-ql__loading">${art(e)}</div>`;
      const old = stage.firstElementChild;
      stage.append(box);
      if (old) {
        const w = Math.min(60, stage.clientWidth * 0.08) * (rtl() ? -1 : 1);
        fx(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * w}px)` }], { duration: 180, fill: 'forwards' })?.finished.then(() => old.remove(), () => old.remove()) ?? old.remove();
        fx(box, [{ opacity: 0, transform: `translateX(${dir * w}px)` }, { opacity: 1, transform: 'none' }], { duration: 240 });
        if (reduced() || !box.animate) old.remove();
      }
      let src = null;
      try { src = await pv.full(e, { ql: true }); } catch { src = null; }
      if (my !== token) return;
      box.innerHTML = src || qlContent(e, null);
      pv.observe(box, entry);
      media = box.querySelector('.ac-fm-ql__img');
      const v = box.querySelector('video, audio'); if (v) v.addEventListener('error', () => v.closest('.ac-fm-ql__media')?.classList.add('is-error'), { once: true });
      layer.dataset.zoomable = String(!!media);
    }
    function qlContent(e, src) {
      const ty = typeOf(e);
      if (src?.kind === 'image' || (ty === 'image' && (src?.url || e.thumb))) return `<div class="ac-fm-ql__imgwrap"><img class="ac-fm-ql__img" src="${esc(src?.url || e.thumb)}" alt="${esc(e.name)}" draggable="false"></div>`;
      if (src?.kind === 'pdf' && src.url) return `<object class="ac-fm-ql__pdf" data="${esc(src.url)}" type="application/pdf" aria-label="${esc(e.name)}"><div class="ac-fm-ql__pdffb">${src.poster ? `<img src="${esc(src.poster)}" alt="" class="ac-fm-ql__page">` : art(e)}<p>${esc(t('pdfFallback'))}</p><a class="ac-btn ac-btn--sm" href="${esc(src.url)}" target="_blank" rel="noopener">${icon('external-link')}<span>${esc(t('openIn'))}</span></a></div></object>`;
      if (src?.kind === 'video') return `<div class="ac-fm-ql__media"><video src="${esc(src.url || '')}" ${src.poster ? `poster="${esc(src.poster)}"` : ''} controls playsinline preload="metadata"></video></div>`;
      if (src?.kind === 'audio') return `<div class="ac-fm-ql__audio"><div class="ac-fm-ql__cover">${src.poster ? `<img src="${esc(src.poster)}" alt="">` : art(e)}</div><b dir="auto">${esc(e.name)}</b><audio src="${esc(src.url || '')}" controls preload="metadata"></audio></div>`;
      if (src?.kind === 'text') return `<pre class="ac-fm-ql__text" dir="auto" tabindex="0">${esc(src.text)}</pre>`;
      return `<div class="ac-fm-ql__card"><div class="ac-fm-ql__cardart">${art(e)}</div><b dir="auto">${esc(e.name)}</b><span>${esc(kindName(e))} · <bdi>${esc(size(e.size))}</bdi></span><span><bdi>${esc(when(e.modified))}</bdi></span><div class="ac-fm-pcard__chips">${statusChip(e)}${ocrChip(e)}${expChip(e)}</div>${PREVIEWABLE.has(ty) ? '' : `<p>${esc(t('noPreview'))}</p>`}<div class="ac-fm-ins__acts"><button class="ac-btn ac-btn--sm" type="button" data-ql="info">${icon('info')}<span>${esc(t('info'))}</span></button><button class="ac-btn ac-btn--sm" type="button" data-ql="share">${icon('share-2')}<span>${esc(t('share').replace('…', ''))}</span></button></div></div>`;
    }
    const originRect = (id) => { const n = nodeOf(id)?.querySelector('.ac-fm__art img, .ac-fm__art svg, .ac-fm__art'); const r = n?.getBoundingClientRect(); return r && r.width && r.bottom > 0 && r.top < innerHeight ? r : null; };
    function zoomFrom(rect, inward) {
      const p = panel.getBoundingClientRect();
      if (!rect || reduced()) return fx(panel, inward ? [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 1 }, { opacity: 0, transform: 'scale(.97)' }], { duration: inward ? 220 : 160, fill: 'forwards' });
      const s = Math.max(0.06, Math.min(rect.width / p.width, rect.height / p.height));
      const dx = rect.left + rect.width / 2 - (p.left + p.width / 2); const dy = rect.top + rect.height / 2 - (p.top + p.height / 2);
      const from = { opacity: 0.25, transform: `translate(${dx}px, ${dy}px) scale(${s})`, borderRadius: '18px' };
      return panel.animate(inward ? [from, { opacity: 1, transform: 'none' }] : [{ opacity: 1, transform: 'none' }, { ...from, opacity: 0 }], { duration: inward ? 340 : 240, easing: inward ? 'cubic-bezier(.19,1,.22,1)' : 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    }
    let closing = false;
    async function close() {
      if (closing) return; closing = true;
      const id = list[cur]?.id;
      fx(layer.querySelector('.ac-fm-ql__scrim'), [{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' });
      const a = zoomFrom(isPhone() ? null : originRect(id), false);
      await (a?.finished.catch(() => {}) ?? Promise.resolve());
      offs2.forEach((f) => f()); release(); AC.scrollLock?.unlock(); layer.remove(); ql = null;
      if (id) { state.cursor = id; focusCursor(); }
    }
    const step = (d) => show(cur + d, d);
    const offs2 = [];
    const onKey = (ev) => {
      if (ev.target.closest?.('input, textarea, select') && ev.key !== 'Escape') return;
      const k = ev.key; const next = rtl() ? 'ArrowLeft' : 'ArrowRight'; const prev = rtl() ? 'ArrowRight' : 'ArrowLeft';
      if (k === 'Escape' || k === ' ' || k === 'Spacebar') { ev.preventDefault(); ev.stopPropagation(); close(); }
      else if (k === next || k === 'ArrowDown') { ev.preventDefault(); ev.stopPropagation(); step(1); }
      else if (k === prev || k === 'ArrowUp') { ev.preventDefault(); ev.stopPropagation(); step(-1); }
      else if ((k === '+' || k === '=') && media) { zoom.s = Math.min(6, zoom.s * 1.25); applyZoom(); }
      else if (k === '-' && media) { zoom.s = Math.max(1, zoom.s / 1.25); if (zoom.s === 1) zoom.x = zoom.y = 0; applyZoom(); }
    };
    document.addEventListener('keydown', onKey, true); offs2.push(() => document.removeEventListener('keydown', onKey, true));
    layer.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-ql]');
      if (!b) { if (ev.target.classList.contains('ac-fm-ql__scrim') || ev.target === stage || ev.target.classList.contains('ac-fm-ql__content')) close(); return; }
      const a = b.dataset.ql;
      if (a === 'close') close(); else if (a === 'next') step(1); else if (a === 'prev') step(-1);
      else if (a === 'in' && media) { zoom.s = Math.min(6, zoom.s * 1.4); applyZoom(); } else if (a === 'out' && media) { zoom.s = Math.max(1, zoom.s / 1.4); if (zoom.s === 1) zoom.x = zoom.y = 0; applyZoom(); }
      else if (a === 'info') { const id = list[cur].id; close().then(() => { select([id]); run('info', [entry(id)]); }); }
      else if (a === 'share') shareDialog(list[cur]);
    });
    // zoom & pan: wheel, double click, drag, pinch
    stage.addEventListener('wheel', (ev) => {
      if (!media) return; ev.preventDefault();
      const r = media.parentElement.getBoundingClientRect(); const cx = ev.clientX - (r.left + r.width / 2); const cy = ev.clientY - (r.top + r.height / 2);
      const ns = Math.min(6, Math.max(1, zoom.s * Math.exp(-ev.deltaY * 0.0022)));
      zoom.x = cx - ((cx - zoom.x) * ns) / zoom.s; zoom.y = cy - ((cy - zoom.y) * ns) / zoom.s; zoom.s = ns;
      if (ns === 1) zoom.x = zoom.y = 0; applyZoom();
    }, { passive: false });
    stage.addEventListener('dblclick', (ev) => {
      if (!media || !ev.target.closest('.ac-fm-ql__imgwrap, .ac-fm-full--image')) return;
      const r = media.parentElement.getBoundingClientRect();
      if (zoom.s > 1.01) zoom = { s: 1, x: 0, y: 0 }; else { const cx = ev.clientX - (r.left + r.width / 2); const cy = ev.clientY - (r.top + r.height / 2); zoom = { s: 2.2, x: -cx * 1.2, y: -cy * 1.2 }; }
      media.style.transition = reduced() ? 'none' : 'transform .32s cubic-bezier(.19,1,.22,1)'; applyZoom(); setTimeout(() => { if (media) media.style.transition = ''; }, 340);
    });
    const ptrs = new Map(); let pan = null; let pinch = null; let swipe = null;
    stage.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('video, audio, object, button, a, pre')) return;
      ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      try { stage.setPointerCapture(ev.pointerId); } catch { /* ignore */ }
      if (ptrs.size === 2 && media) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: zoom.s }; swipe = null; pan = null; return; }
      if (media && zoom.s > 1.01) pan = { x: ev.clientX - zoom.x, y: ev.clientY - zoom.y };
      else swipe = { x: ev.clientX, y: ev.clientY, t: performance.now(), axis: null };
    });
    stage.addEventListener('pointermove', (ev) => {
      if (!ptrs.has(ev.pointerId)) return; ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (pinch && ptrs.size === 2) { const [a, b] = [...ptrs.values()]; zoom.s = Math.min(6, Math.max(1, pinch.s * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.d))); applyZoom(); return; }
      if (pan) { zoom.x = ev.clientX - pan.x; zoom.y = ev.clientY - pan.y; applyZoom(); return; }
      if (swipe) {
        const dx = ev.clientX - swipe.x; const dy = ev.clientY - swipe.y;
        if (!swipe.axis && Math.hypot(dx, dy) > 10) swipe.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        const c = stage.firstElementChild;
        if (swipe.axis === 'x' && c) c.style.transform = `translateX(${dx}px)`;
        if (swipe.axis === 'y' && c && dy > 0) { c.style.transform = `translateY(${dy}px) scale(${1 - Math.min(0.2, dy / 2000)})`; layer.querySelector('.ac-fm-ql__scrim').style.opacity = String(1 - Math.min(0.7, dy / 400)); }
      }
    });
    const endPtr = (ev) => {
      ptrs.delete(ev.pointerId);
      if (pinch && ptrs.size < 2) { pinch = null; if (zoom.s <= 1.02) { zoom = { s: 1, x: 0, y: 0 }; applyZoom(); } return; }
      if (pan) { pan = null; return; }
      if (!swipe) return;
      const dx = ev.clientX - swipe.x; const dy = ev.clientY - swipe.y; const v = Math.abs(dx) / Math.max(1, performance.now() - swipe.t);
      const c = stage.firstElementChild; const axis = swipe.axis; swipe = null;
      if (axis === 'x' && (Math.abs(dx) > 70 || v > 0.5) && list.length > 1) { if (c) c.style.transform = ''; const forwardDir = rtl() ? dx > 0 : dx < 0; step(forwardDir ? 1 : -1); return; }
      if (axis === 'y' && dy > 110) { close(); return; }
      if (c) { c.style.transition = 'transform .25s cubic-bezier(.19,1,.22,1)'; c.style.transform = ''; setTimeout(() => { c.style.transition = ''; }, 260); }
      layer.querySelector('.ac-fm-ql__scrim').style.opacity = '';
    };
    stage.addEventListener('pointerup', endPtr); stage.addEventListener('pointercancel', endPtr);
    ql = { show, close, layer };
    await show(i);
    fx(layer.querySelector('.ac-fm-ql__scrim'), [{ opacity: 0 }, { opacity: 1 }], { duration: 240 });
    zoomFrom(isPhone() ? null : originRect(list[i].id), true);
  }

  /* ---------------------------------------------------------------- phone: selection bar */
  function renderSelbar() {
    const on = isPhone() && state.selecting;
    if (!on) { if (selbar.dataset.state === 'open') { selbar.dataset.state = 'closed'; document.documentElement.removeAttribute('data-fm-selecting'); } return; }
    const n = state.sel.size; selbar.dir = getComputedStyle(el).direction;
    const b = (act, ic, label, tone = '') => `<button type="button" data-sel="${act}"${tone ? ` data-tone="${tone}"` : ''}${n ? '' : ' disabled'}>${icon(ic)}<span>${esc(label)}</span></button>`;
    selbar.innerHTML = inTrash() ? `${b('restore', 'rotate-ccw', t('restore'))}${b('delete', 'trash-2', t('erase'), 'danger')}`
      : `${b('share', 'share-2', t('share').replace('…', ''))}${b('moveto', 'folder-input', t('move'))}${b('tags', 'tag', t('tag'))}${b('duplicate', 'copy-plus', t('duplicate'))}${b('trash', 'trash-2', t('trash'), 'danger')}`;
    if (selbar.dataset.state !== 'open') { selbar.dataset.state = 'open'; document.documentElement.setAttribute('data-fm-selecting', ''); fx(selbar, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 280 }); }
  }
  selbar.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-sel]'); if (!b) return;
    const list = selected(); const a = b.dataset.sel;
    if (a === 'share') shareDialog(list[0]);
    else if (a === 'moveto') AC.menu(b, moveTargets(list), { placement: 'top' });
    else if (a === 'tags') AC.menu(b, itemMenu(list).find((x) => x.icon === 'tag')?.items || [], { placement: 'top' });
    else run(a, list).then(() => { if (a === 'trash' || a === 'restore' || a === 'delete') setSelecting(false); });
  });
  function setSelecting(on) {
    state.selecting = on; if (!on) { state.sel.clear(); }
    haptic(); render({ anim: 'none' });
  }
  const haptic = () => AC.haptic?.(8);

  /* ---------------------------------------------------------------- pointer: click, drag & drop, marquee, long-press, swipe */
  let press = null; let drag = null; let band = null; let lp = 0; let suppressClick = false;
  const itemAt = (target) => { const n = target.closest?.('[data-id]'); return n && view.contains(n) && !n.closest('.ac-fm-gal__stage') ? n : null; };
  function onDown(ev) {
    if (ev.button !== 0 || ev.target.closest('.ac-fm-rename, input, textarea, select, .ac-fm-th, .ac-fm-disc, .ac-fm-prow__more, .ac-fm-prow__acts, .ac-fm-pcard, .ac-fm-gal__meta')) return;
    const node = itemAt(ev.target);
    const touch = ev.pointerType === 'touch';
    if (touch) {
      if (!node) return;
      clearTimeout(lp);
      const sx = ev.clientX; const sy = ev.clientY;
      lp = setTimeout(() => {
        lp = 0; suppressClick = true; setTimeout(() => { suppressClick = false; }, 600);
        haptic(); node.setAttribute('data-pressed', ''); setTimeout(() => node.removeAttribute('data-pressed'), 220);
        if (isPhone()) { if (!state.selecting) { state.selecting = true; state.sel = new Set([node.dataset.id]); state.cursor = state.anchor = node.dataset.id; render({ anim: 'none' }); } else select([node.dataset.id], { toggle: true }); }
        else { if (!state.sel.has(node.dataset.id)) select([node.dataset.id]); AC.menu({ x: sx, y: sy }, itemMenu(selected())); }
      }, 480);
      const cancel = (e2) => { if (e2.type !== 'pointermove' || Math.hypot(e2.clientX - sx, e2.clientY - sy) > 8) { clearTimeout(lp); window.removeEventListener('pointermove', cancel); } };
      window.addEventListener('pointermove', cancel, { passive: true });
      window.addEventListener('pointerup', () => { clearTimeout(lp); window.removeEventListener('pointermove', cancel); }, { once: true });
      return;
    }
    const mod = ev.ctrlKey || ev.metaKey;
    if (node) {
      const id = node.dataset.id;
      if (ev.shiftKey) select([id], { range: true, add: mod });
      else if (mod) select([id], { toggle: true });
      else if (!state.sel.has(id)) select([id]);
      else { state.cursor = id; syncSel(); }
      press = { id, x: ev.clientX, y: ev.clientY, node, mod, shift: ev.shiftKey, pid: ev.pointerId };
      if (curView() === 'columns' && !mod && !ev.shiftKey) { const e = entry(id); if (e?.kind === 'folder') colNavigate(e, node); }
    } else if (view.contains(ev.target) && curView() !== 'columns' && curView() !== 'gallery') {
      ev.preventDefault(); view.focus({ preventScroll: true });
      const base = mod || ev.shiftKey ? new Set(state.sel) : new Set();
      if (!mod && !ev.shiftKey && state.sel.size) { state.sel.clear(); syncSel(); }
      const r = view.getBoundingClientRect();
      band = { x0: ev.clientX - r.left + view.scrollLeft, y0: ev.clientY - r.top + view.scrollTop, base, el: null, cx: ev.clientX, cy: ev.clientY, mod };
    } else return;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    window.addEventListener('pointercancel', onUp, { once: true });
  }
  function onMove(ev) {
    if (press && !drag) {
      if (Math.hypot(ev.clientX - press.x, ev.clientY - press.y) > 6 && !inTrash() && !searching() || press && Math.hypot(ev.clientX - press.x, ev.clientY - press.y) > 6 && (inTrash() || searching())) startDrag(ev);
    }
    if (drag) moveDrag(ev);
    if (band) moveBand(ev);
  }
  function onUp(ev) {
    window.removeEventListener('pointermove', onMove);
    if (drag) endDrag(ev);
    else if (press) { if (!press.mod && !press.shift && state.sel.size > 1 && state.sel.has(press.id)) select([press.id]); }
    if (band) { band.el?.remove(); cancelAnimationFrame(band.raf); if (band.el) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); } band = null; }
    press = null;
  }

  /* marquee (rubber band) */
  function moveBand(ev) {
    band.cx = ev.clientX; band.cy = ev.clientY;
    const r = view.getBoundingClientRect();
    const x1 = ev.clientX - r.left + view.scrollLeft; const y1 = ev.clientY - r.top + view.scrollTop;
    if (!band.el) { if (Math.hypot(x1 - band.x0, y1 - band.y0) < 4) return; band.el = document.createElement('div'); band.el.className = 'ac-fm-band'; view.append(band.el); autoScroll(); }
    const x = Math.min(band.x0, x1); const y = Math.min(band.y0, y1); const w = Math.abs(x1 - band.x0); const h = Math.abs(y1 - band.y0);
    Object.assign(band.el.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    const L0 = r.left - view.scrollLeft + x; const T0 = r.top - view.scrollTop + y;
    const next = new Set(band.base);
    for (const n of view.querySelectorAll('[data-id]')) {
      const b = (n.querySelector('.ac-fm__art') || n).getBoundingClientRect(); const b2 = n.querySelector('.ac-fm__name')?.getBoundingClientRect();
      const hit = (q) => q && q.right > L0 && q.left < L0 + w && q.bottom > T0 && q.top < T0 + h;
      if (hit(b) || hit(b2)) { if (band.mod && band.base.has(n.dataset.id)) next.delete(n.dataset.id); else next.add(n.dataset.id); }
    }
    if (next.size !== state.sel.size || [...next].some((id) => !state.sel.has(id))) { state.sel = next; state.cursor = [...next].at(-1) ?? null; syncSel(); }
  }
  function autoScroll() {
    const tick = () => {
      const s = drag || band; if (!s) return;
      const r = view.getBoundingClientRect(); const y = s.cy ?? s.y; const edge = 36;
      const v = y < r.top + edge ? -(r.top + edge - y) / 3 : y > r.bottom - edge ? (y - (r.bottom - edge)) / 3 : 0;
      if (v) { view.scrollTop += Math.max(-18, Math.min(18, v)); if (band) moveBand({ clientX: band.cx, clientY: band.cy }); }
      s.raf = requestAnimationFrame(tick);
    };
    (drag || band).raf = requestAnimationFrame(tick);
  }

  /* drag & drop between folders, sidebar, breadcrumbs, trash and tags */
  function startDrag(ev) {
    const ids = state.sel.has(press.id) ? [...state.sel] : [press.id];
    const list = ids.map(entry).filter(Boolean);
    const ghost = document.createElement('div'); ghost.className = 'ac-fm-ghost'; ghost.dir = getComputedStyle(el).direction;
    ghost.innerHTML = `<div class="ac-fm-ghost__stack">${list.slice(0, 3).reverse().map((e, i, a) => `<span class="ac-fm-ghost__card" style="--i:${a.length - 1 - i}">${art(e)}</span>`).join('')}</div>${list.length === 1 ? `<span class="ac-fm-ghost__name" dir="auto">${esc(shortName(list[0].name, 28))}</span>` : ''}<span class="ac-fm-ghost__count"${list.length > 1 ? '' : ' hidden'}><bdi>${num(list.length)}</bdi></span><span class="ac-fm-ghost__op" hidden>${icon('plus')}</span>`;
    document.body.append(ghost);
    const src = press.node.querySelector('.ac-fm__art')?.getBoundingClientRect() || press.node.getBoundingClientRect();
    drag = { ids, ghost, x: src.left + src.width / 2, y: src.top + src.height / 2, tx: ev.clientX, ty: ev.clientY, over: null, spring: 0, copy: false, src, cy: ev.clientY };
    for (const id of ids) nodeOf(id)?.setAttribute('data-dragging', '');
    el.setAttribute('data-dragging', '');
    fx(ghost.querySelector('.ac-fm-ghost__stack'), [{ transform: 'scale(.9) rotate(0deg)' }, { transform: 'scale(1.06) rotate(-3deg)' }], { duration: 240, fill: 'forwards', easing: 'cubic-bezier(.34,1.56,.64,1)' });
    if (list.length > 1) fx(ghost.querySelector('.ac-fm-ghost__count'), [{ transform: 'scale(.4)' }, { transform: 'scale(1.2)', offset: 0.6 }, { transform: 'none' }], { duration: 360 });
    const follow = () => {
      if (!drag) return;
      const k = reduced() ? 1 : 0.32; drag.x += (drag.tx - drag.x) * k; drag.y += (drag.ty - drag.y) * k;
      ghost.style.transform = `translate(${drag.x}px, ${drag.y}px)`;
      drag.fr = requestAnimationFrame(follow);
    };
    follow(); autoScroll();
  }
  function moveDrag(ev) {
    drag.tx = ev.clientX; drag.ty = ev.clientY; drag.cy = ev.clientY;
    drag.copy = ev.altKey || ev.ctrlKey || ev.metaKey;
    drag.ghost.querySelector('.ac-fm-ghost__op').hidden = !drag.copy;
    const hit = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('[data-drop]');
    const id = hit?.dataset.drop;
    const ok = hit && (el.contains(hit)) && id && !drag.ids.includes(id) && !(id === state.loc && hit.closest('.ac-fm__view') === null && false);
    const over = ok ? hit : null;
    if (over !== drag.over) {
      drag.over?.removeAttribute('data-over'); clearTimeout(drag.spring);
      drag.over = over;
      if (over) {
        over.setAttribute('data-over', '');
        if (!id.startsWith('@')) drag.spring = setTimeout(() => springOpen(over, id), 800);
      }
    }
  }
  function springOpen(node, id) {
    if (!drag || drag.over !== node) return;
    node.setAttribute('data-spring', ''); setTimeout(() => node.removeAttribute('data-spring'), 400);
    haptic();
    go(id, { anim: 'in', origin: node.querySelector('.ac-fm__art') || node }).then(() => { if (drag) for (const x of drag.ids) nodeOf(x)?.setAttribute('data-dragging', ''); });
  }
  async function endDrag() {
    const d = drag; drag = null; cancelAnimationFrame(d.fr); cancelAnimationFrame(d.raf); clearTimeout(d.spring);
    d.over?.removeAttribute('data-over'); el.removeAttribute('data-dragging');
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    for (const n of view.querySelectorAll('[data-dragging]')) n.removeAttribute('data-dragging');
    const dest = d.over?.dataset.drop || (d.over === null && view.matches(':hover') && folderHere() && !d.ids.some((id) => entry(id)?.parent === folderHere()) ? folderHere() : null);
    if (dest) {
      const r = d.over?.getBoundingClientRect();
      const a = fx(d.ghost, [{ transform: d.ghost.style.transform, opacity: 1 }, { transform: r ? `translate(${r.left + r.width / 2}px, ${r.top + r.height / 2}px) scale(.3)` : d.ghost.style.transform, opacity: 0 }], { duration: 220, fill: 'forwards', easing: 'cubic-bezier(.4,0,.2,1)' });
      const fin = () => d.ghost.remove(); a ? a.finished.then(fin, fin) : fin();
      if (d.over) fx(d.over, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)', offset: 0.4 }, { transform: 'none' }], { duration: 320 });
      await moveTo(d.ids, dest, d.copy);
    } else {
      const back = d.src;
      const a = fx(d.ghost, [{ transform: d.ghost.style.transform, opacity: 1 }, { transform: `translate(${back.left + back.width / 2}px, ${back.top + back.height / 2}px)`, opacity: 0 }], { duration: 260, fill: 'forwards' });
      const fin = () => d.ghost.remove(); a ? a.finished.then(fin, fin) : fin();
    }
  }

  /* columns: clicking a folder opens the next column */
  async function colNavigate(e, node) {
    const col = Number(node.closest('.ac-fm-col')?.dataset.col || 0);
    const ids = isVirtual(state.loc) ? [state.loc] : state.crumbs.map((c) => c.id);
    if (col < ids.length - 1 || col === ids.length - 1) {
      // selecting a folder inside the current column → it becomes the current folder (Finder behaviour)
      state.history.push(state.loc); state.future = [];
      const here = await fs.stat(e.id); remember([here]);
      state.loc = e.id; state.here = here; state.crumbs = here.path; state.items = remember(await fs.list(e.id));
      state.sel = new Set([e.id]); state.cursor = e.id;
      renderBar(); renderStatus(); renderSide();
      await renderColumns();
      AC.emit?.(el, 'files:navigate', { loc: e.id, entry: here });
    }
  }

  /* OS drag-in upload */
  let dropDepth = 0;
  const hasFiles = (ev) => [...(ev.dataTransfer?.types || [])].includes('Files');
  function dropTargetFolder(ev) {
    const n = ev.target.closest?.('[data-drop]');
    const id = n?.dataset.drop;
    return id && !id.startsWith('@') ? { id, node: n } : folderHere() ? { id: folderHere(), node: null } : null;
  }
  function onDragEnter(ev) { if (!hasFiles(ev)) return; ev.preventDefault(); dropDepth++; el.setAttribute('data-filedrop', ''); updateDrop(ev); }
  function onDragOver(ev) { if (!hasFiles(ev)) return; ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; updateDrop(ev); }
  function onDragLeave() { if (--dropDepth <= 0) { dropDepth = 0; el.removeAttribute('data-filedrop'); for (const n of el.querySelectorAll('[data-over]')) n.removeAttribute('data-over'); } }
  function updateDrop(ev) {
    const tg = dropTargetFolder(ev);
    for (const n of el.querySelectorAll('[data-over]')) if (n !== tg?.node) n.removeAttribute('data-over');
    tg?.node?.setAttribute('data-over', '');
    el.querySelector('.ac-fm__drop strong').textContent = tg ? t('dropHere', { name: tg.id === state.root ? t('allFiles') : entry(tg.id)?.name || locName(tg.id) }) : '';
    el.toggleAttribute('data-filedrop-folder', !!tg?.node);
  }
  function onDrop(ev) {
    if (!hasFiles(ev)) return; ev.preventDefault();
    const tg = dropTargetFolder(ev);
    dropDepth = 0; el.removeAttribute('data-filedrop'); for (const n of el.querySelectorAll('[data-over]')) n.removeAttribute('data-over');
    if (tg) upload(ev.dataTransfer.files, tg.id);
  }

  /* phone swipe rows */
  let swiped = null;
  const swipeOpts = {
    axis: 'x', threshold: 10,
    filter: (e) => isPhone() && !state.selecting && !!e.target.closest('.ac-fm-prow') && !e.target.closest('.ac-fm-prow__acts'),
    onStart: (s) => { const row = s.target.closest('.ac-fm-prow'); if (swiped && swiped !== row) closeSwipe(swiped); s.row = row; s.base = row.dataset.open === 'true' ? -actsW(row) * (rtl() ? -1 : 1) : 0; row.setAttribute('data-swiping', ''); clearTimeout(lp); },
    onMove: (s) => { const row = s.row; const w = actsW(row); const sign = rtl() ? -1 : 1; let x = s.base + s.dx; const lim = -w * 1.25 * sign; x = sign > 0 ? Math.max(lim, Math.min(0, x)) : Math.min(lim, Math.max(0, x)); row.style.setProperty('--sx', `${x}px`); },
    onEnd: (s) => {
      const row = s.row; row.removeAttribute('data-swiping'); const w = actsW(row); const sign = rtl() ? -1 : 1;
      const x = parseFloat(row.style.getPropertyValue('--sx')) || 0; const open = Math.abs(x) > w * 0.45 || -s.vx * sign > 0.5;
      if (Math.abs(x) > w * 1.15) { row.style.setProperty('--sx', '0px'); swipeAct(row, 'trash'); return; }
      row.dataset.open = String(open); row.style.setProperty('--sx', open ? `${-w * sign}px` : '0px'); swiped = open ? row : null;
    },
  };
  const actsW = (row) => row.querySelector('.ac-fm-prow__acts')?.offsetWidth || 160;
  const closeSwipe = (row) => { row.dataset.open = 'false'; row.style.setProperty('--sx', '0px'); if (swiped === row) swiped = null; };
  async function swipeAct(row, a) {
    const e = entry(row.dataset.id); closeSwipe(row); if (!e) return;
    if (a === 'star') { await fs.update(e.id, { starred: !e.starred }); await refresh(); }
    else if (inTrash()) await run('restore', [e]); else await trash([e.id]);
  }

  /* ---------------------------------------------------------------- column resize (list view) */
  function startResize(ev, col) {
    ev.preventDefault(); ev.stopPropagation();
    const x0 = ev.clientX; const w0 = state.colW[col]; const sign = rtl() ? -1 : 1; const table = view.querySelector('.ac-fm-table');
    const mv = (e) => { state.colW[col] = Math.max(col === 'name' ? 180 : 64, Math.min(520, w0 + (e.clientX - x0) * sign)); table.setAttribute('style', colStyle()); };
    const upF = () => { window.removeEventListener('pointermove', mv); el.removeAttribute('data-resizing'); persist(); };
    el.setAttribute('data-resizing', '');
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', upF, { once: true });
  }

  /* ---------------------------------------------------------------- keyboard */
  let typed = ''; let typedT = 0;
  function onKey(ev) {
    if (ql) return;
    const tgt = ev.target;
    if (tgt.closest('input, textarea, select, [contenteditable="true"]')) {
      if (tgt.classList.contains('ac-fm__q') && ev.key === 'Escape') { clearSearch(); view.focus(); }
      if (tgt.classList.contains('ac-fm__q') && ev.key === 'ArrowDown') { ev.preventDefault(); if (!state.cursor && state.order[0]) select([state.order[0]]); focusCursor(); }
      return;
    }
    if (tgt.closest('.ac-fm__info, .ac-fm__side, .ac-fm__bar, .ac-fm__filters') && !/^F2$|^Delete$/.test(ev.key) && !(ev.ctrlKey || ev.metaKey)) return;
    const mod = ev.ctrlKey || ev.metaKey; const k = ev.key; const v = curView();
    const ids = [...state.sel]; const list = selected();
    const next = rtl() ? 'ArrowLeft' : 'ArrowRight'; const prev = rtl() ? 'ArrowRight' : 'ArrowLeft';
    const move = (id) => { if (!id) return; ev.preventDefault(); if (ev.shiftKey) select([id], { range: true }); else select([id]); focusCursor(); };
    const cur = state.cursor ?? state.order[0];
    const idx = state.order.indexOf(cur);
    if (mod && k.toLowerCase() === 'a') { ev.preventDefault(); select(state.order); return; }
    if (mod && k.toLowerCase() === 'c' && ids.length) { ev.preventDefault(); run('copy', list); return; }
    if (mod && k.toLowerCase() === 'x' && ids.length && !isVirtual(state.loc)) { ev.preventDefault(); run('cut', list); return; }
    if (mod && k.toLowerCase() === 'v') { ev.preventDefault(); paste(); return; }
    if (mod && k.toLowerCase() === 'd' && ids.length) { ev.preventDefault(); run('duplicate', list); return; }
    if (mod && k.toLowerCase() === 'i') { ev.preventDefault(); toggleInfo(); return; }
    if (mod && k.toLowerCase() === 'f') { ev.preventDefault(); el.querySelector(isPhone() ? '.ac-fm__pq' : '.ac-fm__bar .ac-fm__q').focus(); return; }
    if (mod && k.toLowerCase() === 'l') { ev.preventDefault(); editPath(); return; }
    if (mod && ev.shiftKey && k.toLowerCase() === 'n') { ev.preventDefault(); newFolder(); return; }
    if (mod && /^[1-4]$/.test(k)) { ev.preventDefault(); setView(VIEWS[Number(k) - 1]); return; }
    if (mod && k === 'ArrowUp') { ev.preventDefault(); up(); return; }
    if (mod && k === 'ArrowDown' && list[0]) { ev.preventDefault(); open(list[0], nodeOf(list[0].id)); return; }
    if ((ev.altKey && k === 'ArrowLeft') || (k === 'Backspace' && !mod) || (mod && k === '[')) { ev.preventDefault(); back(); return; }
    if ((ev.altKey && k === 'ArrowRight') || (mod && k === ']')) { ev.preventDefault(); forward(); return; }
    if (k === 'Enter' && list[0]) { ev.preventDefault(); open(list[0], nodeOf(list[0].id)?.querySelector('.ac-fm__art')); return; }
    if (k === ' ' && list[0]) { ev.preventDefault(); if (list[0].kind === 'file') quickLook(list[0].id); else if (v === 'list') toggleExpand(list[0].id); return; }
    if (k === 'F2' && list.length === 1) { ev.preventDefault(); rename(list[0].id); return; }
    if ((k === 'Delete' || (mod && k === 'Backspace')) && ids.length) { ev.preventDefault(); if (inTrash()) run('delete', list); else trash(ids); return; }
    if (k === 'Escape') { if (state.clip) { state.clip = null; renderView(); syncSel(); } else if (state.sel.size) { state.sel.clear(); syncSel(); } if (state.selecting) setSelecting(false); return; }
    if (k === 'Home') { move(state.order[0]); return; }
    if (k === 'End') { move(state.order.at(-1)); return; }
    if (v === 'icons') {
      if (k === 'ArrowDown') return move(state.cursor ? spatial(cur, 'down') : state.order[0]);
      if (k === 'ArrowUp') return move(state.cursor ? spatial(cur, 'up') : state.order[0]);
      if (k === 'ArrowRight' || k === 'ArrowLeft') return move(state.cursor ? spatial(cur, k === 'ArrowRight' ? 'right' : 'left') : state.order[0]);
    } else if (v === 'gallery') {
      if (k === next || k === 'ArrowDown') return move(state.order[Math.min(state.order.length - 1, idx + 1)]);
      if (k === prev || k === 'ArrowUp') return move(state.order[Math.max(0, idx - 1)]);
    } else if (v === 'columns') {
      if (k === 'ArrowDown') return move(state.order[Math.min(state.order.length - 1, idx + 1)] ?? state.order[0]);
      if (k === 'ArrowUp') return move(state.order[Math.max(0, idx - 1)] ?? state.order[0]);
      if (k === next && list[0]?.kind === 'folder') { ev.preventDefault(); colNavigate(list[0], nodeOf(list[0].id)).then(() => { if (state.order[0]) select([state.order[0]]); focusCursor(); }); return; }
      if (k === prev && state.crumbs.length > 1 && !isVirtual(state.loc)) { ev.preventDefault(); const here = state.loc; const p = state.crumbs.at(-2).id; colBack(p, here); return; }
    } else {
      if (k === 'ArrowDown') return move(state.order[Math.min(state.order.length - 1, idx + 1)] ?? state.order[0]);
      if (k === 'ArrowUp') return move(state.order[Math.max(0, idx - 1)] ?? state.order[0]);
      if ((k === next || k === prev) && list.length === 1 && list[0].kind === 'folder' && v === 'list' && !isPhone()) {
        ev.preventDefault(); const open2 = state.expanded.has(list[0].id);
        if (k === next && !open2) toggleExpand(list[0].id); else if (k === prev && open2) toggleExpand(list[0].id);
        return;
      }
    }
    if (k.length === 1 && !mod && !ev.altKey && /\S/.test(k)) {
      typed += k; clearTimeout(typedT); typedT = setTimeout(() => { typed = ''; }, 800);
      const q = normalize(typed); const hit = state.order.find((id) => normalize(entry(id)?.name).startsWith(q));
      if (hit) { select([hit]); focusCursor(); }
    }
  }
  async function colBack(parent, child) {
    await go(parent, { anim: 'none' });
    select([child]); focusCursor();
  }
  async function toggleExpand(id) {
    if (state.expanded.has(id)) state.expanded.delete(id);
    else { state.expanded.add(id); if (!state.kids.has(id)) { renderKeep(); state.kids.set(id, remember(await fs.list(id))); } }
    renderKeep(true);
  }
  function renderKeep(anim = false) {
    const st = view.scrollTop; const before = anim ? new Set(state.order) : null;
    renderView(); syncSel(); view.scrollTop = st;
    if (before) view.querySelectorAll('.ac-fm-row[data-id]').forEach((n, i) => { if (!before.has(n.dataset.id)) fx(n, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 200, delay: Math.min(140, i * 6) }); });
  }
  function togglePreview() {
    state.preview = !(state.preview && !state.info); state.info = false; persist(); renderBar(); renderInfo();
    if (state.preview) fx($('.ac-fm__info'), [{ opacity: 0, transform: `translateX(${rtl() ? -16 : 16}px)` }, { opacity: 1, transform: 'none' }], { duration: 240 });
  }
  function toggleInfo() {
    if (wide()) { state.info = !state.info; if (state.info) state.preview = false; persist(); renderBar(); renderInfo(); if (state.info) fx($('.ac-fm__info'), [{ opacity: 0, transform: `translateX(${rtl() ? -16 : 16}px)` }, { opacity: 1, transform: 'none' }], { duration: 240 }); }
    else if (infoLayer) { (isPhone() ? AC.sheet : AC.drawer).close(); } else { state.info = true; renderBar(); openInfo(); }
  }

  /* editable path field */
  function editPath() {
    if (isVirtual(state.loc)) return;
    const form = $('.ac-fm__pathform'); const nav = $('.ac-fm__crumbs'); const input = $('.ac-fm__pathinput');
    input.value = `/${state.crumbs.slice(1).map((c) => c.name).join('/')}`;
    nav.hidden = true; form.hidden = false; input.focus(); input.select();
    const done = () => { form.hidden = true; nav.hidden = false; };
    input.onblur = done;
    input.onkeydown = (ev) => { ev.stopPropagation(); if (ev.key === 'Escape') { ev.preventDefault(); done(); view.focus(); } };
    form.onsubmit = async (ev) => {
      ev.preventDefault();
      const parts = input.value.split('/').map((s) => s.trim()).filter(Boolean);
      let cur = state.root;
      for (const p of parts) {
        const kids = await fs.list(cur).catch(() => []);
        const hit = kids.find((k) => k.kind === 'folder' && normalize(k.name) === normalize(p));
        if (!hit) { form.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 260 }); AC.toast?.error?.(t('noPath'), p); return; }
        remember([hit]); cur = hit.id;
      }
      input.onblur = null; done(); go(cur, { anim: 'in' }); view.focus();
    };
  }

  /* ---------------------------------------------------------------- phone: collapsing search & large title */
  const onScroll = AC.rafThrottle ? AC.rafThrottle(scrollFx) : scrollFx;
  function scrollFx() {
    if (!isPhone()) return;
    const head = $('.ac-fm__phead'); const top = head.getBoundingClientRect().top + scrollY;
    const y = Math.max(0, scrollY - top + 56);
    el.style.setProperty('--fm-sq', String(Math.min(1, y / 52)));
  }

  /* ---------------------------------------------------------------- events */
  const on = (tg, type, fn, o) => { tg.addEventListener(type, fn, o); return () => tg.removeEventListener(type, fn, o); };
  /* listeners on nodes that a language switch re-renders live in chromeBindings() */
  const chromeBindings = () => [
    on(view, 'pointerdown', onDown),
    on(view, 'click', (ev) => {
      if (suppressClick) { ev.preventDefault(); ev.stopPropagation(); return; }
      const sw = ev.target.closest('[data-swipe]'); if (sw) { swipeAct(sw.closest('.ac-fm-prow'), sw.dataset.swipe); return; }
      if (ev.target.closest('[data-act="rowmore"]')) { const n = itemAt(ev.target); if (n) { if (!state.sel.has(n.dataset.id)) select([n.dataset.id]); AC.menu(ev.target.closest('button'), itemMenu(selected()), { placement: 'bottom-end' }); } return; }
      const disc = ev.target.closest('.ac-fm-disc'); if (disc && disc.tagName === 'BUTTON') { const n = itemAt(disc); if (n) toggleExpand(n.dataset.id); return; }
      const sortB = ev.target.closest('[data-sort]'); if (sortB) { const k = sortB.dataset.sort; setSort(k, state.sort.key === k ? -state.sort.dir : 1); return; }
      const a = ev.target.closest('.ac-fm-browse [data-loc]'); if (a) { go(a.dataset.loc, { anim: 'in', origin: a }); return; }
      const actB = ev.target.closest('[data-act]'); if (actB && view.contains(actB)) { actAt(actB); return; }
      const n = itemAt(ev.target);
      if (!n) { if (state.selecting && isPhone()) return; return; }
      const touchLike = !fine.matches || isPhone();
      if (touchLike && ev.pointerType !== 'mouse') {
        if (state.selecting) { select([n.dataset.id], { toggle: true }); haptic(); return; }
        const e = entry(n.dataset.id); select([e.id]); open(e, n.querySelector('.ac-fm__art'));
        return;
      }
      if (curView() === 'gallery' && n.classList.contains('ac-fm-film')) updateGallery();
    }),
    on(view, 'dblclick', (ev) => { const n = itemAt(ev.target); if (!n || ev.target.closest('.ac-fm-rename, .ac-fm-disc')) return; const e = entry(n.dataset.id); if (curView() === 'columns' && e.kind === 'folder') return; open(e, n.querySelector('.ac-fm__art')); }),
    on(view, 'contextmenu', (ev) => {
      if (ev.target.closest('input, textarea')) return;
      ev.preventDefault();
      const n = itemAt(ev.target);
      if (n) { if (!state.sel.has(n.dataset.id)) select([n.dataset.id]); AC.menu(ev, itemMenu(selected())); }
      else { if (state.sel.size) { state.sel.clear(); syncSel(); } AC.menu(ev, bgMenu()); }
    }),
    on(view, 'pointerdown', (ev) => { const g = ev.target.closest('[data-grip]'); if (g) startResize(ev, g.dataset.grip); }, true),
    on(el.querySelector('.ac-fm__bar'), 'click', (ev) => {
      const b = ev.target.closest('[data-act]'); const c = ev.target.closest('[data-crumb]');
      if (c) { const id = c.dataset.crumb; if (id === '@search') return; if (id !== state.loc || searching()) go(id, { anim: 'out' }); return; }
      if (b) { actAt(b); return; }
      if (ev.target.closest('.ac-fm__where') && !ev.target.closest('button, input')) editPath();
    }),
    on(el.querySelector('.ac-fm__phead'), 'click', (ev) => { const b = ev.target.closest('[data-act]'); if (b) actAt(b); }),
    on(el.querySelector('.ac-fm__crumbs'), 'dblclick', (ev) => { if (!ev.target.closest('button')) editPath(); }),
    on(el.querySelector('.ac-fm__side'), 'click', (ev) => { const b = ev.target.closest('[data-loc]'); if (b) go(b.dataset.loc, { anim: 'fade' }); }),
    on(el.querySelector('.ac-fm__info'), 'click', infoClick),
    on(el.querySelector('.ac-fm__info'), 'change', onInfoInput),
    AC.gesture ? AC.gesture(view, swipeOpts) : () => {},
  ];
  let bound = chromeBindings();
  const offs = [
    on(el, 'keydown', onKey),
    on(el, 'ac:segmented:change', (ev) => { if (ev.target.matches('.ac-fm__views')) setView(ev.detail.value); }),
    on(el, 'click', (ev) => { const b = ev.target.closest('.ac-fm__views .ac-segmented__item'); if (b && !AC.instance(b.parentElement, 'segmented')) { for (const x of b.parentElement.children) x.setAttribute('aria-checked', String(x === b)); setView(b.dataset.value); } }),
    on(document, 'change', (ev) => { if (ev.target.closest('.ac-fm-inspector--sheet')) onInfoInput(ev); }),
    on(document, 'click', (ev) => { if (ev.target.closest('.ac-fm-inspector--sheet')) infoClick(ev); }),
    on(el, 'input', (ev) => {
      if (ev.target.classList.contains('ac-fm__q')) {
        state.query = ev.target.value; for (const q of el.querySelectorAll('.ac-fm__q')) if (q !== ev.target) q.value = state.query;
        clearTimeout(searchT); searchT = setTimeout(runSearch, 140);
      }
      if (ev.target.matches('.ac-fm__zoom input')) { state.iconSize = Number(ev.target.value); el.style.setProperty('--fm-icon', `${state.iconSize}px`); persist(); }
    }),
    on(el, 'focusin', (ev) => { if (ev.target.classList.contains('ac-fm__q') && !isPhone()) renderFilters(); }),
    on(el, 'click', (ev) => {
      if (!ev.target.closest('.ac-fm__filters')) return;
      const s = ev.target.closest('[data-scope]'); if (s) { state.scope = s.dataset.scope; renderFilters(); if (searching()) runSearch(); return; }
      const f = ev.target.closest('[data-filter]');
      if (f) { const k = f.dataset.filter; AC.menu(f, [{ label: t('none'), radio: 'f', checked: !state.filters[k], onSelect: () => { delete state.filters[k]; runSearch(); } }, '-', ...filterOpts()[k].map(([v, label]) => ({ label, radio: 'f', checked: state.filters[k] === v, onSelect: () => { state.filters[k] = v; runSearch(); } }))], { placement: 'bottom-start' }); return; }
      if (ev.target.closest('[data-act="clearfilters"]')) { state.filters = {}; runSearch(); }
    }),
    on(el, 'click', (ev) => { if (ev.target.closest('.ac-fm__view [data-act="clearsearch"]')) clearSearch(); }),
    on(el, 'change', (ev) => { if (ev.target.matches('.ac-fm__file')) { upload(ev.target.files); ev.target.value = ''; } }),
    on(el, 'dragenter', onDragEnter), on(el, 'dragover', onDragOver), on(el, 'dragleave', onDragLeave), on(el, 'drop', onDrop),
    on(window, 'scroll', onScroll, { passive: true }),
    on(document, 'ac:i18n:change', () => { const sel = new Set(state.sel); bound.forEach((f) => f()); chrome(); view = $('.ac-fm__view'); bound = chromeBindings(); state.sel = sel; render({ anim: 'none' }); renderSide(); if (jobs.length) renderUploads(); }),
  ];
  let mqOff = () => {};
  { const f = () => { if (!isPhone() && state.selecting) state.selecting = false; render({ anim: 'none' }); renderSide(); }; phoneMQ.addEventListener('change', f); mqOff = () => phoneMQ.removeEventListener('change', f); }
  let ro = null;
  if (typeof ResizeObserver !== 'undefined') { let w0 = 0; ro = new ResizeObserver(([e]) => { const w = e.contentRect.width; const crossed = (w0 >= 1100) !== (w >= 1100); w0 = w; el.dataset.narrow = String(w < 900); if (crossed && state.info) renderInfo(); }); ro.observe(el); }

  function actAt(b) {
    const a = b.dataset.act;
    if (a === 'back') back();
    else if (a === 'forward') forward();
    else if (a === 'sidebar') { state.sidebar = !state.sidebar; persist(); renderBar(); }
    else if (a === 'sortmenu') sortMenu(b);
    else if (a === 'more') moreMenu(b);
    else if (a === 'pmore') moreMenu(b);
    else if (a === 'info') toggleInfo();
    else if (a === 'preview') togglePreview();
    else if (a === 'share') shareDialog(state.sel.size === 1 ? selected()[0] : state.here);
    else if (a === 'newfolder') newFolder();
    else if (a === 'upload') pick();
    else if (a === 'selectmode') setSelecting(!state.selecting);
    else if (a === 'ql') { const e = selected()[0] || entry(state.cursor); if (e) (e.kind === 'folder' ? open(e) : quickLook(e.id)); }
    else if (a === 'clearsearch') clearSearch();
  }
  function infoClick(ev) {
    const b = ev.target.closest('button'); if (!b) return;
    const ins = b.closest('.ac-fm-ins'); const e = ins ? entry(ins.dataset.for) : null;
    if (b.dataset.tag) {
      const ids = b.closest('[data-tags-for]').dataset.tagsFor.split(',');
      const on2 = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on2));
      fx(b, [{ transform: 'scale(.9)' }, { transform: 'scale(1.06)', offset: 0.6 }, { transform: 'none' }], { duration: 260 });
      fs.tag(ids, b.dataset.tag, on2).then(() => { for (const id of ids) { const x = entry(id); if (x) x.tags = on2 ? [...new Set([...(x.tags || []), b.dataset.tag])] : (x.tags || []).filter((y) => y !== b.dataset.tag); } refreshSoon(); });
      return;
    }
    if (b.dataset.restoreV && e) { fs.restoreVersion(e.id, b.dataset.restoreV).then(async (r) => { remember([r]); await refresh(); AC.toast?.({ title: t('versionRestored'), tone: 'success', duration: 1800 }); }); return; }
    if (b.dataset.act === 'ocr' && e) { fs.update(e.id, { ocr: 'pending' }).then((r) => { remember([r]); renderInfo(); renderKeep(); setTimeout(async () => { remember([await fs.update(e.id, { ocr: 'done' })]); renderInfo(); renderKeep(); }, 1800); }); return; }
    if (b.dataset.act === 'star' && e) { fs.update(e.id, { starred: !e.starred }).then(async (r) => { remember([r]); await refresh(); }); return; }
    if (b.dataset.act === 'ql' && e) { if (infoLayer) (isPhone() ? AC.sheet : AC.drawer).close(); quickLook(e.id); return; }
    if (b.dataset.act === 'share' && e) shareDialog(e);
  }

  /* ---------------------------------------------------------------- public API */
  const api = {
    el, state, adapter: fs,
    go: (loc) => go(loc), open: async (id) => open(entry(id) || await fs.stat(id)), select: (ids) => select(ids), refresh: () => refresh(),
    setView, quickLook, info: (v = true) => { if (v !== !!state.info) toggleInfo(); }, upload: (files, dest) => upload(files, dest), rename, trash: (ids) => trash(ids),
    get selection() { return selected(); },
    destroy() {
      offs.forEach((f) => f()); bound.forEach((f) => f()); mqOff(); ro?.disconnect();
      ql?.close(); pv.destroy(); uploadsEl.remove(); selbar.remove(); document.documentElement.removeAttribute('data-fm-selecting');
      if (infoLayer) (isPhone() ? AC.sheet : AC.drawer).close();
    },
  };
  api.ready = boot();
  api.previewer = pv;
  return api;
}

/** Wire the module into an AC instance: AC.files(el, cfg) + declarative data-ac="files". */
function install(AC) {
  if (!AC || AC.files) return AC?.files;
  cssOnce();
  AC.files = (target, cfg) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    AC.instance(el, 'files')?.destroy?.();
    return AC.instance(el, 'files', createFiles(AC, el, cfg));
  };
  AC.files.memoryAdapter = memoryAdapter;
  AC.files.normalize = normalize;
  AC.files.plugins = plugins; // AC.files.plugins.pdfjs = { src, worker } — optional, lazily imported (Apache-2.0)
  AC.register?.('files', (el) => { const api = createFiles(AC, el, AC.options ? AC.options(el, {}) : {}); AC.instance(el, 'files', api); return () => api.destroy(); });
  return AC.files;
}

if (typeof window !== 'undefined' && window.AC) install(window.AC);
return Object.freeze({ createFiles, install, memoryAdapter, normalize, fileArt, typeOf, miniMarkdown, parseCSV });
})();

return { f: F, ns: Object.freeze({ "createFiles": __ac_m1a["createFiles"], "install": __ac_m1a["install"], "memoryAdapter": __ac_m1a["memoryAdapter"], "normalize": __ac_m1a["normalize"], "fileArt": __ac_m1a["fileArt"], "typeOf": __ac_m1a["typeOf"], "miniMarkdown": __ac_m1a["miniMarkdown"], "parseCSV": __ac_m1a["parseCSV"] }) };
})();
export const { createFiles, install, memoryAdapter, normalize, fileArt, typeOf, miniMarkdown, parseCSV } = __R["files"].ns;
export default __R["files"].ns;
