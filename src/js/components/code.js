/* Code block with copy button, language label, light highlighting and optional line numbers.
   <div class="ac-code" data-ac="code" data-lang="js" [data-lines] [data-title="app.js"]><pre><code>…</code></pre></div>
   Also: JSON viewer (collapsible) — <div data-ac="json" data-ac-config='{"data":{…},"open":2}'></div>
   or a JSON text body; AC.json(el, data, { open }). Events: ac:code:copy, ac:json:copy. */
import { AC, register, instance, on, emit, options, icon, escapeHtml as esc } from '../core.js';

const KW = /\b(const|let|var|function|return|if|else|for|while|import|export|from|async|await|new|class|extends|true|false|null|undefined|this|try|catch|throw|public|private|echo|use|namespace|fn|def|sudo|cd|npm|node|git)\b/g;
function highlight(src, lang) {
  const out = [];
  const re = lang === 'json'
    ? /("(?:\\.|[^"\\])*")(\s*:)?|(-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|\b(true|false|null)\b/gi
    : /^(bash|sh|shell|py|python|ya?ml|ini|conf|nginx)$/.test(lang)
      ? /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)/g
      : /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)/g;
  let last = 0; let m;
  const plain = (s) => esc(s).replace(KW, '<span class="ac-code__k">$1</span>');
  while ((m = re.exec(src))) {
    out.push(lang === 'json' ? esc(src.slice(last, m.index)) : plain(src.slice(last, m.index)));
    if (lang === 'json') out.push(m[1] ? `<span class="ac-code__${m[2] ? 'p' : 's'}">${esc(m[1])}</span>${m[2] || ''}` : `<span class="ac-code__${m[3] ? 'n' : 'k'}">${esc(m[0])}</span>`);
    else out.push(`<span class="ac-code__${m[1] ? 'c' : m[2] ? 's' : 'n'}">${esc(m[0])}</span>`);
    last = re.lastIndex;
  }
  out.push(lang === 'json' ? esc(src.slice(last)) : plain(src.slice(last)));
  return out.join('');
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.className = 'ac-visually-hidden';
    document.body.append(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { /* ignore */ } t.remove(); return ok;
  }
}
function copyButton(getText, el, evt) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'ac-code__copy';
  const label = () => AC.t('common.copy', 'Copy');
  const set = (done) => { b.innerHTML = `${icon(done ? 'check' : 'copy')}<span>${done ? AC.t('common.copied', 'Copied') : label()}</span>`; b.toggleAttribute('data-done', done); };
  set(false);
  let t;
  b.addEventListener('click', async () => { const text = getText(); if (await copyText(text)) { set(true); emit(el, evt, { text }); clearTimeout(t); t = setTimeout(() => set(false), 1600); } });
  return b;
}

register('code', (el) => {
  const o = options(el, { lang: '', lines: false, highlight: true });
  const code = el.querySelector('code') || el;
  const src = code.textContent.replace(/^\n/, '').replace(/\s+$/, '');
  if (o.highlight !== false) code.innerHTML = highlight(src, o.lang);
  if (o.lines) { code.innerHTML = code.innerHTML.split('\n').map((l) => `<span class="ac-code__line">${l || ' '}</span>`).join('\n'); el.setAttribute('data-lines', ''); }
  el.classList.add('ac-code');
  const head = document.createElement('div'); head.className = 'ac-code__head';
  head.innerHTML = `<span class="ac-code__lang">${esc(o.title || o.lang || '')}</span>`;
  head.append(copyButton(() => src, el, 'code:copy'));
  el.prepend(head);
  instance(el, 'code', { text: src });
  return () => head.remove();
});

function node(v, k, depth, open, last) {
  const key = k == null ? '' : `<span class="ac-json__k">${esc(typeof k === 'number' ? k : JSON.stringify(k))}</span>: `;
  const comma = last ? '' : '<span class="ac-json__p">,</span>';
  if (v && typeof v === 'object') {
    const arr = Array.isArray(v); const ent = arr ? v.map((x, i) => [i, x]) : Object.entries(v);
    const [a, b] = arr ? ['[', ']'] : ['{', '}'];
    if (!ent.length) return `<div class="ac-json__row">${key}<span class="ac-json__p">${a}${b}</span>${comma}</div>`;
    const n = AC.t(arr ? 'json.items' : 'json.keys', arr ? '{n} items' : '{n} keys', { n: ent.length });
    return `<details class="ac-json__node"${depth < open ? ' open' : ''}><summary>${key}<span class="ac-json__p">${a}</span><span class="ac-json__n">${esc(n)}</span><span class="ac-json__p ac-json__close">${b}</span></summary><div class="ac-json__kids">${ent.map(([kk, x], i) => node(x, arr ? null : kk, depth + 1, open, i === ent.length - 1)).join('')}</div><span class="ac-json__p">${b}</span>${comma}</details>`;
  }
  const t = v === null ? 'null' : typeof v;
  return `<div class="ac-json__row">${key}<span class="ac-json__v" data-t="${t}">${esc(t === 'string' ? JSON.stringify(v) : String(v))}</span>${comma}</div>`;
}
function createJson(el, data, cfg = {}) {
  el.classList.add('ac-json');
  const render = (d) => {
    el.innerHTML = `<div class="ac-json__tree">${node(d, null, 0, cfg.open ?? 1, true)}</div>`;
    const bar = document.createElement('div'); bar.className = 'ac-json__bar';
    const tog = document.createElement('button'); tog.type = 'button'; tog.className = 'ac-code__copy';
    tog.innerHTML = `${icon('chevrons-up-down')}<span>${esc(AC.t('json.toggle', 'Expand all'))}</span>`;
    tog.addEventListener('click', () => { const all = el.querySelectorAll('details'); const open = Array.from(all).some((x) => !x.open); all.forEach((x) => { x.open = open; }); });
    bar.append(tog, copyButton(() => JSON.stringify(d, null, 2), el, 'json:copy'));
    el.prepend(bar);
  };
  render(data);
  return { el, set: render };
}
register('json', (el) => {
  const o = options(el, {});
  let data = o.data;
  if (data === undefined) { try { data = JSON.parse(el.textContent); } catch { data = el.textContent; } }
  instance(el, 'json', createJson(el, data, o));
});
export function json(target, data, cfg) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  return instance(el, 'json', createJson(el, data, cfg));
}
AC.json = json;
AC.copyText = copyText;
