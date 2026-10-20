/* AraminConsole Markdown — a zero-dependency, XSS-safe Markdown → HTML renderer (no DOM needed, runs in Node too).
   CommonMark subset + GFM: ATX/setext headings, paragraphs, hard breaks, emphasis, strong, ~~strike~~, `code`,
   fenced + indented code, block quotes, nested lists (bullet / ordered / task), tables (alignment), thematic breaks,
   links (inline, reference, autolinks <…> and bare https:// / www.), images (a lone image becomes a <figure>),
   footnotes [^1], callouts > [!NOTE] (note · tip · important · warning · caution · danger), containers
   :::details Title … ::: and :::note … :::, keyboard keys <kbd>Ctrl</kbd> (also sub, sup, mark, ins, del, br —
   bare tags only, no attributes).
   Safety: every piece of source text is escaped; raw HTML is shown as text; only whitelisted bare inline tags pass;
   link / image URLs are checked against a protocol allow-list after removing control characters and whitespace;
   class / id / data values are generated, never copied. Ids never start with "ac-" (no clash with framework ids).
   render(src, opts) → { html, headings: [{ level, id, text }], text, words }
   markdown(src, opts) → html
   opts: { idPrefix: '', headingIds: true, anchors: true (hover # link), lang: 'fa'|'en'|'ar', labels: { note, tip, … , footnotes, backref },
           link(href) → href, image(src) → src (rewrite hooks; the result is still sanitized), allowDataImages: false,
           codeComponent: true (emit <div class="ac-code" data-ac="code">), linkTarget: '_blank' for external links } */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const LABELS = {
  en: { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution', danger: 'Danger', details: 'Details', footnotes: 'Footnotes', backref: 'Back to text', anchor: 'Link to this section' },
  fa: { note: 'نکته', tip: 'پیشنهاد', important: 'مهم', warning: 'هشدار', caution: 'احتیاط', danger: 'خطر', details: 'جزئیات', footnotes: 'پانویس‌ها', backref: 'بازگشت به متن', anchor: 'پیوند به این بخش' },
  ar: { note: 'ملاحظة', tip: 'نصيحة', important: 'مهم', warning: 'تحذير', caution: 'تنبيه', danger: 'خطر', details: 'التفاصيل', footnotes: 'الحواشي', backref: 'العودة إلى النص', anchor: 'رابط هذا القسم' },
};
const CALLOUT_ICON = { note: 'info', tip: 'lightbulb', important: 'circle-alert', warning: 'triangle-alert', caution: 'octagon-alert', danger: 'octagon-alert' };
const KINDS = new Set(Object.keys(CALLOUT_ICON));
const INLINE_TAGS = new Set(['kbd', 'sub', 'sup', 'mark', 'ins', 'del', 's', 'small', 'abbr', 'br']);

/* ---------------------------------------------------------------- URLs */
const SAFE_PROTOCOLS = new Set(['http', 'https', 'mailto', 'tel']);
export function safeUrl(url, { image = false, allowData = false } = {}) {
  let u = String(url ?? '').trim();
  // browsers ignore ASCII tab / newline / control chars inside a scheme ("java\tscript:"): judge the squeezed form
  // eslint-disable-next-line no-control-regex
  const probe = u.replace(/[\u0000-\u0020\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]/g, '').toLowerCase();
  const m = /^([a-z][a-z0-9+.-]*):/.exec(probe);
  if (m) {
    const scheme = m[1];
    if (image && allowData && scheme === 'data' && /^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=]+$/i.test(probe)) return u;
    if (!SAFE_PROTOCOLS.has(scheme) || (image && !/^https?$/.test(scheme))) return '';
  } else if (/^[\\/]{2}/.test(probe) === false && /^[^/?#]*:/.test(probe)) {
    return ''; // something like "javascript&#58;" that still carries a colon before any path → refuse
  }
  // eslint-disable-next-line no-control-regex
  u = u.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s/g, (s) => encodeURIComponent(s));
  return u;
}

/* ---------------------------------------------------------------- slugs */
export function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[‌‍]/g, '-')
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'section';
}

/* ---------------------------------------------------------------- block parser */
const RE = {
  blank: /^[ \t]*$/,
  fence: /^( {0,3})(`{3,}|~{3,})[ \t]*([^\s`]*)[^`]*$/,
  atx: /^ {0,3}(#{1,6})(?:[ \t]+|$)(.*?)(?:[ \t]+#+)?[ \t]*$/,
  hr: /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/,
  quote: /^ {0,3}> ?/,
  bullet: /^( {0,3})([-*+])([ \t]+|$)(.*)$/,
  ordered: /^( {0,3})(\d{1,9})([.)])([ \t]+|$)(.*)$/,
  setext1: /^ {0,3}=+[ \t]*$/,
  setext2: /^ {0,3}-+[ \t]*$/,
  tableDelim: /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/,
  footDef: /^ {0,3}\[\^([^\]\s]+)\]:[ \t]*(.*)$/,
  refDef: /^ {0,3}\[([^\]^][^\]]*)\]:[ \t]*<?([^\s>]+)>?(?:[ \t]+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?[ \t]*$/,
  indented: /^(?: {4}|\t)/,
  container: /^ {0,3}:::[ \t]*([a-zA-Z]+)?[ \t]*(.*)$/,
  containerEnd: /^ {0,3}:::[ \t]*$/,
};

const expandTabs = (line) => line.replace(/^[ \t]+/, (ws) => ws.replace(/\t/g, '    '));
const startsBlock = (line) => RE.fence.test(line) || RE.atx.test(line) || RE.hr.test(line) || RE.quote.test(line)
  || (RE.bullet.test(line) && !RE.blank.test(line.replace(RE.bullet, '$4'))) || /^ {0,3}1[.)][ \t]+\S/.test(line) || RE.container.test(line);

function parseBlocks(lines, ctx) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (RE.blank.test(line)) { i++; continue; }
    let m;
    // fenced code
    if ((m = RE.fence.exec(line))) {
      const [, indent, fence, info] = m;
      const body = [];
      i++;
      while (i < lines.length) {
        const l = lines[i];
        const close = new RegExp(`^ {0,3}${fence[0] === '`' ? '`' : '~'}{${fence.length},}[ \\t]*$`);
        if (close.test(l)) { i++; break; }
        body.push(l.replace(new RegExp(`^ {0,${indent.length}}`), ''));
        i++;
      }
      out.push({ type: 'code', lang: info.toLowerCase(), text: body.join('\n') });
      continue;
    }
    // ::: containers (details / callouts)
    if ((m = RE.container.exec(line)) && m[1]) {
      const kind = m[1].toLowerCase();
      const body = []; let depth = 1; i++;
      while (i < lines.length) {
        const l = lines[i];
        if (RE.containerEnd.test(l)) { if (--depth === 0) { i++; break; } } else if (RE.container.exec(l)?.[1]) depth++;
        body.push(l); i++;
      }
      out.push({ type: kind === 'details' ? 'details' : KINDS.has(kind) ? 'callout' : 'div', kind, title: m[2].trim(), children: parseBlocks(body, ctx) });
      continue;
    }
    if ((m = RE.atx.exec(line))) { out.push({ type: 'heading', level: m[1].length, text: m[2].trim() }); i++; continue; }
    if (RE.hr.test(line)) { out.push({ type: 'hr' }); i++; continue; }
    // block quote (+ GitHub callouts)
    if (RE.quote.test(line)) {
      const body = [];
      while (i < lines.length) {
        const l = lines[i];
        if (RE.quote.test(l)) body.push(l.replace(RE.quote, ''));
        else if (!RE.blank.test(l) && body.length && !RE.blank.test(body[body.length - 1]) && !startsBlock(l)) body.push(l); // lazy line
        else break;
        i++;
      }
      const c = /^[ \t]*\[!([a-zA-Z]+)\][ \t]*(.*)$/.exec(body[0] || '');
      if (c && KINDS.has(c[1].toLowerCase())) out.push({ type: 'callout', kind: c[1].toLowerCase(), title: c[2].trim(), children: parseBlocks(body.slice(1), ctx) });
      else out.push({ type: 'quote', children: parseBlocks(body, ctx) });
      continue;
    }
    // lists
    if (RE.bullet.test(line) || RE.ordered.test(line)) { i = parseList(lines, i, out, ctx); continue; }
    // footnote definition
    if ((m = RE.footDef.exec(line))) {
      const body = [m[2]]; i++;
      while (i < lines.length && (RE.indented.test(lines[i]) || (RE.blank.test(lines[i]) && RE.indented.test(lines[i + 1] || '')))) { body.push(lines[i].replace(/^(?: {1,4}|\t)/, '')); i++; }
      const id = m[1];
      if (!ctx.footnotes.has(id)) ctx.footnotes.set(id, { blocks: parseBlocks(body, ctx), n: 0 });
      continue;
    }
    // link reference definition
    if ((m = RE.refDef.exec(line))) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, ' ');
      if (!ctx.refs.has(key)) ctx.refs.set(key, { href: m[2], title: m[3] ?? m[4] ?? m[5] ?? '' });
      i++; continue;
    }
    // indented code
    if (RE.indented.test(line)) {
      const body = [];
      while (i < lines.length && (RE.indented.test(lines[i]) || RE.blank.test(lines[i]))) { body.push(lines[i].replace(/^(?: {4}|\t)/, '')); i++; }
      while (body.length && RE.blank.test(body[body.length - 1])) body.pop();
      out.push({ type: 'code', lang: '', text: body.join('\n') });
      continue;
    }
    // table
    if (line.includes('|') && i + 1 < lines.length && RE.tableDelim.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /^-+:$/.test(c) ? 'end' : /^:-+$/.test(c) ? 'start' : ''));
      if (head.length === align.length) {
        i += 2;
        const rows = [];
        while (i < lines.length && !RE.blank.test(lines[i]) && !startsBlock(lines[i])) { rows.push(splitRow(lines[i])); i++; }
        out.push({ type: 'table', head, align, rows });
        continue;
      }
    }
    // paragraph (+ setext headings)
    const para = [line.replace(/^[ 	]+/, '')]; i++;
    let setext = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (RE.blank.test(l)) break;
      if (RE.setext1.test(l)) { setext = 1; i++; break; }
      if (RE.setext2.test(l)) { setext = 2; i++; break; }
      if (startsBlock(l) || (l.includes('|') && RE.tableDelim.test(lines[i + 1] || '') && (lines[i + 1] || '').includes('-'))) break;
      para.push(l.replace(/^[ \t]+/, '')); i++;
    }
    if (setext) out.push({ type: 'heading', level: setext, text: para.join(' ') });
    else out.push({ type: 'para', text: para.join('\n') });
  }
  return out;
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = []; let cur = ''; let code = 0;
  for (let k = 0; k < s.length; k++) {
    const ch = s[k];
    if (ch === '\\' && s[k + 1] === '|') { cur += '|'; k++; continue; }
    if (ch === '`') code ^= 1;
    if (ch === '|' && !code) { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function parseList(lines, i, out, ctx) {
  const first = RE.ordered.exec(lines[i]);
  const ordered = !!first;
  const bulletChar = ordered ? '' : RE.bullet.exec(lines[i])[2];
  const delim = ordered ? first[3] : '';
  const start = ordered ? parseInt(first[2], 10) : 1;
  const items = [];
  let loose = false;
  const same = (l) => {
    if (ordered) { const m = RE.ordered.exec(l); return m && m[3] === delim ? m : null; }
    const m = RE.bullet.exec(l); return m && m[2] === bulletChar && !RE.hr.test(l) ? m : null;
  };
  let sawBlankBetween = false;
  while (i < lines.length) {
    const m = same(lines[i]);
    if (!m) break;
    if (items.length && sawBlankBetween) loose = true;
    sawBlankBetween = false;
    const indent = m[1].length;
    const marker = ordered ? m[2] + m[3] : m[2];
    const space = (ordered ? m[4] : m[3]).length;
    const rest = ordered ? m[5] : m[4];
    const w = indent + marker.length + (space === 0 || space > 4 ? 1 : space);
    const body = [rest];
    i++;
    let blankRun = 0; let innerBlank = false;
    while (i < lines.length) {
      const l = lines[i];
      if (RE.blank.test(l)) { blankRun++; body.push(''); i++; continue; }
      const lead = l.length - l.replace(/^ +/, '').length;
      if (lead >= w) { if (blankRun) innerBlank = true; blankRun = 0; body.push(l.slice(w)); i++; continue; }
      if (blankRun === 0 && !startsBlock(l) && !RE.bullet.test(l) && !RE.ordered.test(l)) { body.push(l.trim()); i++; continue; } // lazy continuation
      break;
    }
    if (blankRun) { sawBlankBetween = true; while (body.length && body[body.length - 1] === '') body.pop(); }
    let task = null;
    const t = /^\[([ xX])\][ \t]+/.exec(body[0]);
    if (t) { task = t[1] !== ' '; body[0] = body[0].slice(t[0].length); }
    const blocks = parseBlocks(body, ctx);
    if (innerBlank && blocks.length > 1) loose = true;
    items.push({ task, blocks });
    if (blankRun && !same(lines[i] || '')) break;
  }
  out.push({ type: 'list', ordered, start, loose, items });
  return i;
}

/* ---------------------------------------------------------------- inline */
const PUNCT = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

function makeInline(ctx) {
  const tokens = [];
  const keep = (html) => `\u0000${tokens.push(html) - 1}\u0000`;
  const restore = (s) => { let prev; do { prev = s; s = s.replace(/\u0000(\d+)\u0000/g, (_, n) => tokens[Number(n)]); } while (s !== prev); return s; };

  function linkHtml(href, title, inner, { auto = false } = {}) {
    const url = safeUrl(ctx.opts.link ? ctx.opts.link(href) : href);
    if (!url) return inner;
    const ext = /^(https?:)?\/\//i.test(url);
    const attrs = [`href="${escapeHtml(url)}"`];
    if (title) attrs.push(`title="${escapeHtml(title)}"`);
    if (ext && ctx.opts.linkTarget) attrs.push(`target="${escapeHtml(ctx.opts.linkTarget)}"`, 'rel="noopener noreferrer nofollow"');
    if (auto) attrs.push('class="ac-autolink"');
    return `<a ${attrs.join(' ')}>${inner}</a>`;
  }
  function imageHtml(src, alt, title) {
    const url = safeUrl(ctx.opts.image ? ctx.opts.image(src) : src, { image: true, allowData: ctx.opts.allowDataImages });
    if (!url) return escapeHtml(alt);
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy" decoding="async">`;
  }
  const plain = (s) => s.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_~`]/g, '');

  // [text](dest "title") — dest may be <…> or a run with balanced parentheses
  function readDest(s, k) {
    while (s[k] === ' ' || s[k] === '\t' || s[k] === '\n') k++;
    let dest = '';
    if (s[k] === '<') { const e = s.indexOf('>', k); if (e < 0) return null; dest = s.slice(k + 1, e); k = e + 1; } else {
      let depth = 0;
      while (k < s.length) {
        const ch = s[k];
        if (ch === '\\' && PUNCT.includes(s[k + 1])) { dest += s[k + 1]; k += 2; continue; }
        if (/\s/.test(ch)) break;
        if (ch === '(') depth++;
        if (ch === ')') { if (depth === 0) break; depth--; }
        dest += ch; k++;
      }
    }
    while (s[k] === ' ' || s[k] === '\t' || s[k] === '\n') k++;
    let title = '';
    const q = s[k];
    if (q === '"' || q === "'" || q === '(') {
      const close = q === '(' ? ')' : q;
      const e = s.indexOf(close, k + 1);
      if (e < 0) return null;
      title = s.slice(k + 1, e); k = e + 1;
      while (s[k] === ' ' || s[k] === '\t' || s[k] === '\n') k++;
    }
    if (s[k] !== ')') return null;
    return { dest, title, end: k + 1 };
  }
  function matchBracket(s, k) {
    let depth = 0;
    for (let j = k; j < s.length; j++) {
      const ch = s[j];
      if (ch === '\\') { j++; continue; }
      if (ch === '[') depth++;
      else if (ch === ']' && --depth === 0) return j;
    }
    return -1;
  }

  function inline(src, { noLinks = false } = {}) {
    let s = String(src);
    let out = '';
    // pass 1: escapes, code spans, autolinks, bare tags, links, images, footnote refs
    for (let k = 0; k < s.length;) {
      const ch = s[k];
      if (ch === '\\' && k + 1 < s.length) {
        if (s[k + 1] === '\n') { out += keep('<br>'); k += 2; continue; }
        if (PUNCT.includes(s[k + 1])) { out += keep(escapeHtml(s[k + 1])); k += 2; continue; }
      }
      if (ch === '`') {
        const run = /^`+/.exec(s.slice(k))[0];
        const close = s.indexOf(run, k + run.length);
        let e = close;
        while (e >= 0 && s[e + run.length] === '`') e = s.indexOf(run, e + run.length + 1);
        if (e >= 0) {
          let code = s.slice(k + run.length, e).replace(/\n/g, ' ');
          if (/^ .* $/.test(code) && code.trim()) code = code.slice(1, -1);
          out += keep(`<code>${escapeHtml(code)}</code>`);
          k = e + run.length; continue;
        }
        out += keep(escapeHtml(run)); k += run.length; continue;
      }
      if (ch === '<') {
        const rest = s.slice(k);
        let m = /^<([a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^\s<>]*)>/.exec(rest);
        if (m && !noLinks) { out += keep(linkHtml(m[1], '', escapeHtml(m[1]), { auto: true })); k += m[0].length; continue; }
        m = /^<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/.exec(rest);
        if (m && !noLinks) { out += keep(linkHtml(`mailto:${m[1]}`, '', escapeHtml(m[1]), { auto: true })); k += m[0].length; continue; }
        m = /^<(\/?)([a-zA-Z]+)\s*(\/?)>/.exec(rest);
        if (m && INLINE_TAGS.has(m[2].toLowerCase())) {
          const tag = m[2].toLowerCase();
          out += keep(tag === 'br' ? '<br>' : `\u0001${m[1] ? '/' : ''}${tag}\u0001`);
          k += m[0].length; continue;
        }
      }
      if (ch === '[' && s[k + 1] === '^') {
        const m = /^\[\^([^\]\s]+)\]/.exec(s.slice(k));
        if (m && ctx.footnotes.has(m[1])) {
          const fn = ctx.footnotes.get(m[1]);
          if (!fn.n) fn.n = ++ctx.fnCount;
          const refN = (fn.refs = (fn.refs || 0) + 1);
          const id = `${ctx.opts.idPrefix || ''}fn-${fn.n}`;
          out += keep(`<sup class="ac-fnref"><a href="#${id}" id="${ctx.opts.idPrefix || ''}fnref-${fn.n}${refN > 1 ? `-${refN}` : ''}" data-fn="${fn.n}">${fn.n}</a></sup>`);
          k += m[0].length; continue;
        }
      }
      if ((ch === '[' || (ch === '!' && s[k + 1] === '[')) && !noLinks) {
        const isImg = ch === '!';
        const open = isImg ? k + 1 : k;
        const close = matchBracket(s, open);
        if (close > 0) {
          const text = s.slice(open + 1, close);
          let target = null; let end = close + 1;
          if (s[close + 1] === '(') {
            const d = readDest(s, close + 2);
            if (d) { target = { href: d.dest, title: d.title }; end = d.end; }
          }
          if (!target) {
            let key = text; let e2 = close + 1;
            const r = /^\[([^\]]*)\]/.exec(s.slice(close + 1));
            if (r) { if (r[1].trim()) key = r[1]; e2 = close + 1 + r[0].length; }
            const ref = ctx.refs.get(key.trim().toLowerCase().replace(/\s+/g, ' '));
            if (ref) { target = ref; end = e2; }
          }
          if (target) {
            out += keep(isImg ? imageHtml(target.href, plain(text), target.title) : linkHtml(target.href, target.title, restore(inline(text, { noLinks: true }))));
            k = end; continue;
          }
        }
      }
      if (!noLinks && (ch === 'h' || ch === 'w') && (k === 0 || /[\s(*_~"'«]/.test(s[k - 1]))) {
        const m = /^(?:https?:\/\/|www\.)[^\s<>"]+/i.exec(s.slice(k));
        if (m) {
          let url = m[0];
          // trailing punctuation is not part of the URL; a closing ")" only when unbalanced
          while (/[.,:;!?'"*_~]$/.test(url) || (url.endsWith(')') && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length)) url = url.slice(0, -1);
          if (url.length > 4) { out += keep(linkHtml(/^www\./i.test(url) ? `https://${url}` : url, '', escapeHtml(url), { auto: true })); k += url.length; continue; }
        }
      }
      if (ch === ' ' && /^ {2,}\n/.test(s.slice(k))) { const m = /^ {2,}\n/.exec(s.slice(k)); out += keep('<br>'); k += m[0].length; continue; }
      out += ch; k++;
    }
    // pass 2: escape the remaining text, then emphasis on the escaped text
    let html = escapeHtml(out.replace(/[ \t]+\n/g, '\n'));
    const W = '\\p{L}\\p{N}';
    html = html
      .replace(/\*\*\*(?!\s)([^*]+?)(?<!\s)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(?!\s)([\s\S]+?)(?<!\s)\*\*/g, '<strong>$1</strong>')
      .replace(new RegExp(`(^|[^${W}_])__(?!\\s)([\\s\\S]+?)(?<!\\s)__(?![${W}_])`, 'gu'), '$1<strong>$2</strong>')
      .replace(/(^|[^*])\*(?![\s*])([\s\S]*?[^\s*])\*(?!\*)/g, '$1<em>$2</em>')
      .replace(new RegExp(`(^|[^${W}_])_(?![\\s_])([\\s\\S]*?[^\\s_])_(?![${W}_])`, 'gu'), '$1<em>$2</em>')
      .replace(/~~(?!\s)([\s\S]+?)(?<!\s)~~/g, '<del>$1</del>');
    return balance(restore(html));
  }
  return { inline, plain };
}

/** Bare whitelisted inline tags were marked \u0001tag\u0001 — emit them balanced (never across the run). */
function balance(html) {
  const stack = [];
  let out = html.replace(/\u0001(\/?)([a-z]+)\u0001/g, (_, close, tag) => {
    if (!close) { stack.push(tag); return `<${tag}>`; }
    const at = stack.lastIndexOf(tag);
    if (at < 0) return '';
    const closing = stack.splice(at).reverse().map((t) => `</${t}>`).join('');
    return closing;
  });
  while (stack.length) out += `</${stack.pop()}>`;
  return out;
}

/* ---------------------------------------------------------------- render */
function icon(name) { return `<svg class="ac-icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`; }

export function render(src, opts = {}) {
  const o = { idPrefix: '', headingIds: true, anchors: true, lang: 'en', codeComponent: true, linkTarget: '_blank', allowDataImages: false, ...opts };
  const labels = { ...(LABELS[o.lang] || LABELS.en), ...(o.labels || {}) };
  const ctx = { opts: o, refs: new Map(), footnotes: new Map(), fnCount: 0 };
  // eslint-disable-next-line no-control-regex
  const text = String(src ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000\u0001]/g, '\ufffd');
  const lines = text.split('\n').map(expandTabs);
  const blocks = parseBlocks(lines, ctx);
  const { inline, plain } = makeInline(ctx);
  const headings = []; const used = new Map(); const words = [];
  const uniq = (base) => {
    let id = base.startsWith('ac-') ? `h-${base}` : base;
    const n = used.get(id) || 0; used.set(id, n + 1);
    if (n) id = `${id}-${n}`;
    return `${o.idPrefix}${id}`;
  };
  const cell = (tag, s, a) => `<${tag}${a ? ` data-align="${a}"` : ''}>${inline(s)}</${tag}>`;

  function block(b, tight = false) {
    switch (b.type) {
      case 'heading': {
        const html = inline(b.text);
        const txt = plain(b.text).replace(/<[^>]*>/g, '').trim();
        words.push(txt);
        if (!o.headingIds) return `<h${b.level}>${html}</h${b.level}>`;
        const id = uniq(slugify(txt));
        headings.push({ level: b.level, id, text: txt });
        const anchor = o.anchors ? `<a class="ac-anchor" href="#${escapeHtml(id)}" aria-label="${escapeHtml(labels.anchor)}">#</a>` : '';
        return `<h${b.level} id="${escapeHtml(id)}">${html}${anchor}</h${b.level}>`;
      }
      case 'para': {
        words.push(b.text);
        const img = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(b.text.trim());
        const html = inline(b.text);
        if (img && /^<img [^>]*>$/.test(html)) {
          const cap = img[3] || img[1];
          return `<figure class="ac-prose__figure">${html}${cap ? `<figcaption>${inline(cap)}</figcaption>` : ''}</figure>`;
        }
        return tight ? html : `<p>${html}</p>`;
      }
      case 'code': {
        const lang = b.lang.replace(/[^\w+#.-]/g, '').slice(0, 20);
        if (!o.codeComponent) return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${escapeHtml(b.text)}</code></pre>`;
        return `<div class="ac-code ac-prose__code" data-ac="code"${lang ? ` data-lang="${lang}"` : ''}><pre><code>${escapeHtml(b.text)}</code></pre></div>`;
      }
      case 'hr': return '<hr>';
      case 'quote': return `<blockquote>${blocks2(b.children)}</blockquote>`;
      case 'callout': {
        const title = b.title ? inline(b.title) : escapeHtml(labels[b.kind] || b.kind);
        return `<div class="ac-callout" data-kind="${b.kind}" role="note"><p class="ac-callout__title">${icon(CALLOUT_ICON[b.kind])}<span>${title}</span></p>${blocks2(b.children)}</div>`;
      }
      case 'details': return `<details class="ac-prose__details"><summary>${b.title ? inline(b.title) : escapeHtml(labels.details)}</summary><div class="ac-prose__details-body">${blocks2(b.children)}</div></details>`;
      case 'div': return `<div class="ac-prose__box">${blocks2(b.children)}</div>`;
      case 'table': {
        words.push(b.head.join(' '));
        const head = `<thead><tr>${b.head.map((c, k) => cell('th', c, b.align[k])).join('')}</tr></thead>`;
        const body = b.rows.length ? `<tbody>${b.rows.map((r) => `<tr>${b.head.map((_, k) => cell('td', r[k] ?? '', b.align[k])).join('')}</tr>`).join('')}</tbody>` : '';
        return `<div class="ac-prose__table" tabindex="0" role="region"><table>${head}${body}</table></div>`;
      }
      case 'list': {
        const tag = b.ordered ? 'ol' : 'ul';
        const task = b.items.some((it) => it.task !== null);
        const start = b.ordered && b.start !== 1 ? ` start="${b.start}"` : '';
        const items = b.items.map((it) => {
          const inner = it.blocks.map((x) => block(x, !b.loose)).join(b.loose ? '' : '\n');
          if (it.task === null) return `<li>${inner}</li>`;
          return `<li class="ac-task"${it.task ? ' data-done' : ''}><input type="checkbox" class="ac-task__box" disabled${it.task ? ' checked' : ''} aria-hidden="true"><span class="ac-task__text">${inner}</span></li>`;
        }).join('');
        return `<${tag}${start}${task ? ' class="ac-tasklist"' : ''}>${items}</${tag}>`;
      }
      default: return '';
    }
  }
  function blocks2(list) { return list.map((b) => block(b)).join('\n'); }

  let html = blocks2(blocks);
  // footnotes that were referenced, in order of first use
  const used2 = [...ctx.footnotes.entries()].filter(([, f]) => f.n).sort((a, b) => a[1].n - b[1].n);
  if (used2.length) {
    const items = used2.map(([, f]) => {
      const id = `${o.idPrefix}fn-${f.n}`;
      const back = `<a href="#${o.idPrefix}fnref-${f.n}" class="ac-footnotes__back" aria-label="${escapeHtml(labels.backref)}">↩</a>`;
      const body = f.blocks.map((x) => block(x)).join('');
      return `<li id="${id}">${body.replace(/<\/p>$/, ` ${back}</p>`)}${body.endsWith('</p>') ? '' : back}</li>`;
    }).join('');
    html += `\n<section class="ac-footnotes" aria-label="${escapeHtml(labels.footnotes)}"><ol>${items}</ol></section>`;
  }
  const plainText = words.join(' ').replace(/[`*_~#>[\]()!|]/g, ' ');
  return { html, headings, text: plainText, words: (plainText.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’‌-]*/gu) || []).length };
}

export function markdown(src, opts) { return render(src, opts).html; }
