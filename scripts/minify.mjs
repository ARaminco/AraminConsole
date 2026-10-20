/* Zero-dependency minifiers used by scripts/build.mjs.
   minifyJS: a small tokenizer (strings, template literals with nested ${}, regex literals, comments) that drops comments and
   collapses whitespace. It never renames anything, keeps a newline wherever automatic semicolon insertion could depend on it,
   and keeps a leading /*! banner. minifyCSS: comments + whitespace, strings and url() payloads protected. */

const ID = /[A-Za-z0-9_$\u0080-\uffff\\]/;
const NUM = /(?:0[xXbBoO][\da-fA-F_]+n?|\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?n?|\.\d[\d_]*(?:[eE][+-]?\d+)?)/y;
const KEYWORDS_BEFORE_EXPR = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);
// a newline may be dropped after these characters (no ASI can happen there) …
const NL_AFTER = new Set(['{', '(', '[', ',', ';']);
// … and before these
const NL_BEFORE = new Set(['}', ')', ']', ',', ';', '.']);

export function minifyJS(src) {
  let banner = '';
  const m = src.match(/^\s*\/\*![\s\S]*?\*\/\n?/);
  if (m) { banner = m[0].trim() + '\n'; src = src.slice(m[0].length); }
  const n = src.length;
  const parts = []; // never index a growing string (V8 flattens it on every read → quadratic)
  let last = ''; // last emitted character
  let i = 0;
  let sp = false; let nl = false;
  let lastType = 'start'; let lastTok = '';
  const tpl = []; // brace depth at each open ${
  let depth = 0;

  const emit = (tok, type) => {
    if (last && (sp || nl)) {
      const a = last; const b = tok[0];
      if (nl && !NL_AFTER.has(a) && !NL_BEFORE.has(b)) parts.push('\n');
      else if ((ID.test(a) && ID.test(b)) || (a === '+' && b === '+') || (a === '-' && b === '-') || (a === '/' && (b === '/' || b === '*')) || (lastType === 'num' && b === '.')) parts.push(' ');
    }
    parts.push(tok); last = tok[tok.length - 1]; sp = nl = false; lastType = type; lastTok = tok;
  };

  const readTemplate = (start) => { // start at ` or at the } that closes a ${
    let j = start + 1;
    while (j < n) {
      const c = src[j];
      if (c === '\\') { j += 2; continue; }
      if (c === '`') return { end: j + 1, open: false };
      if (c === '$' && src[j + 1] === '{') return { end: j + 2, open: true };
      j++;
    }
    throw new Error('minifyJS: unterminated template literal');
  };

  const regexAllowed = () => {
    if (lastType === 'start') return true;
    if (lastType === 'num' || lastType === 'str' || lastType === 'regex' || lastType === 'tpl') return false;
    if (lastType === 'id') return KEYWORDS_BEFORE_EXPR.has(lastTok);
    return !(lastTok === ')' || lastTok === ']' || lastTok === '}');
  };

  while (i < n) {
    const c = src[i];
    if (c === '\n' || c === '\r' || c === '\u2028' || c === '\u2029') { nl = true; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\f' || c === '\v' || c === '\u00a0' || c === '\ufeff') { sp = true; i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      const e = src.indexOf('*/', i + 2);
      if (e < 0) throw new Error('minifyJS: unterminated comment');
      if (src.slice(i, e).includes('\n')) nl = true; else sp = true;
      i = e + 2; continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
      emit(src.slice(i, j + 1), 'str'); i = j + 1; continue;
    }
    if (c === '`') {
      const t = readTemplate(i);
      emit(src.slice(i, t.end), t.open ? 'punct' : 'tpl');
      if (t.open) { tpl.push(depth); lastTok = '{'; }
      i = t.end; continue;
    }
    if (c === '}' && tpl.length && depth === tpl[tpl.length - 1]) {
      tpl.pop();
      const t = readTemplate(i);
      const chunk = src.slice(i, t.end); parts.push(chunk); last = chunk[chunk.length - 1]; sp = nl = false; lastType = t.open ? 'punct' : 'tpl'; lastTok = t.open ? '{' : '`';
      if (t.open) tpl.push(depth);
      i = t.end; continue;
    }
    if (c === '/') {
      if (regexAllowed()) {
        let j = i + 1; let cls = false;
        while (j < n) {
          const d = src[j];
          if (d === '\\') { j += 2; continue; }
          if (d === '[') cls = true; else if (d === ']') cls = false;
          else if (d === '/' && !cls) break;
          else if (d === '\n') throw new Error(`minifyJS: unterminated regex near ${JSON.stringify(src.slice(i, i + 40))}`);
          j++;
        }
        j++;
        while (j < n && /[a-z]/i.test(src[j])) j++;
        emit(src.slice(i, j), 'regex'); i = j; continue;
      }
      emit('/', 'punct'); i++; continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      NUM.lastIndex = i;
      const mm = NUM.exec(src);
      emit(mm[0], 'num'); i += mm[0].length; continue;
    }
    if (ID.test(c)) {
      let j = i + 1;
      while (j < n && ID.test(src[j])) j++;
      emit(src.slice(i, j), 'id'); i = j; continue;
    }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    emit(c, 'punct'); i++;
  }
  return banner + parts.join('') + '\n';
}

export function minifyCSS(css) {
  let banner = '';
  const m = css.match(/^\s*\/\*![\s\S]*?\*\/\n?/);
  if (m) { banner = m[0].trim() + '\n'; css = css.slice(m[0].length); }
  const keep = [];
  // comments first (an apostrophe inside a comment must not start a "string"), then protect strings
  css = css.replace(/(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, (s, comment) => (comment ? ' ' : `\u0000${keep.push(s) - 1}\u0000`));
  css = css
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .replace(/([\s:,(-])0\.(\d)/g, '$1.$2')
    .trim();
  return banner + css.replace(/\u0000(\d+)\u0000/g, (_, k) => keep[Number(k)]) + '\n';
}
