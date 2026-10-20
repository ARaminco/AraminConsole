/* File-type artwork for the files module — custom SVG, 64×64, themed through CSS classes (files.css):
   .fmi-page / .fmi-fold / .fmi-line (paper), .fmi-fb / .fmi-ff (folder back / front), --_c (type colour).
   fileArt(entry, { size }) → svg string · typeOf(name|entry) → 'folder|pdf|doc|xls|ppt|image|video|audio|zip|code|txt|unknown'
   No ids, no gradients: safe to repeat hundreds of times in one document. */

export const EXT = {
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
export const extOf = (name = '') => { const m = /\.([^.\s]{1,8})$/.exec(String(name)); return m ? m[1].toLowerCase() : ''; };
export function typeOf(x) {
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

export function folderArt(glyph = '', color = '') {
  const g = FGLYPH[glyph] ? `<g class="fmi-fg">${FGLYPH[glyph]}</g>` : '';
  return `<svg class="fmi fmi--folder" viewBox="0 0 64 64" aria-hidden="true"${color ? ` data-color="${color}"` : ''}><path class="fmi-fb" d="M5 14.5A4.5 4.5 0 0 1 9.5 10h14.2a4 4 0 0 1 2.9 1.2l3.6 3.6a4 4 0 0 0 2.8 1.2h21.5a4.5 4.5 0 0 1 4.5 4.5V49a4.5 4.5 0 0 1-4.5 4.5h-45A4.5 4.5 0 0 1 5 49z"/><path class="fmi-ff" d="M5 23.5A4.5 4.5 0 0 1 9.5 19h45a4.5 4.5 0 0 1 4.5 4.5V50a4.5 4.5 0 0 1-4.5 4.5h-45A4.5 4.5 0 0 1 5 50z"/><path class="fmi-fh" d="M9.5 19h45a4.5 4.5 0 0 1 4.5 4.5v1A4.5 4.5 0 0 0 54.5 20h-45A4.5 4.5 0 0 0 5 24.5v-1A4.5 4.5 0 0 1 9.5 19z"/>${g}</svg>`;
}

export function docArt(type) {
  const t = GLYPH[type] ? type : 'unknown';
  const label = type === 'txt' ? '' : LABEL[t];
  return `<svg class="fmi fmi--${t}" viewBox="0 0 64 64" aria-hidden="true">${PAGE}${GLYPH[t]()}${band(t, label)}</svg>`;
}

/** Artwork for an entry (no thumbnail): folders get a glyph from entry.glyph and a tint from entry.color. */
export function fileArt(entry) {
  const t = typeOf(entry);
  if (t === 'folder') return folderArt(entry.glyph, entry.color);
  return docArt(t === 'txt' && /\.md$/i.test(entry.name || '') ? 'txt' : t);
}
export const typeColor = (t) => COLORS[t] || COLORS.unknown;
