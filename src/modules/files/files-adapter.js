/* In-memory storage adapter for the files module — the reference implementation of the adapter contract
   (docs/files.md). Every method is async and returns plain copies, never live nodes.
   const fs = memoryAdapter({ root, tags, users, locations, trash }, { latency: 40, preview(node) → {kind,url,text,poster} });
   Node seed: { name, children?: [...], size, modified, created, tags, starred, shared, comment, glyph, color,
                thumb, duration, dims, doc: { type, number, date, parties, expiry }, status, ocr, text, versions } */
import { typeOf } from './files-icons.js';

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'; const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
/** Search key: lower case, Arabic ي/ك → Persian, digits → Latin, no ZWNJ / tatweel / diacritics. */
export function normalize(s) {
  return String(s ?? '').toLowerCase()
    .replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک').replace(/[ة]/g, 'ه').replace(/[أإآ]/g, 'ا')
    .replace(/[۰-۹]/g, (d) => FA_DIGITS.indexOf(d)).replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d))
    .replace(/[‌‍ـً-ٟ]/g, '').replace(/\s+/g, ' ').trim();
}
const err = (code, message) => Object.assign(new Error(message || code), { code });
const DAY = 864e5;
const READ_KIND = { image: 'image', pdf: 'pdf', video: 'video', audio: 'audio', txt: 'text', code: 'text', doc: 'office', xls: 'office', ppt: 'office' };

export function memoryAdapter(seed = {}, opts = {}) {
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
