#!/usr/bin/env node
/* Unit tests for the zero-dependency Markdown renderer (src/modules/prose/markdown.js). No browser needed.
   node tests/prose.mjs */
import { render, markdown, safeUrl, slugify } from '../src/modules/prose/markdown.js';

let fails = 0; let passes = 0;
const ok = (cond, msg, extra = '') => { if (cond) passes++; else { fails++; console.log(`✗ ${msg}${extra ? `\n    ${extra}` : ''}`); } };
const has = (src, needle, msg, o) => { const h = markdown(src, o); ok(h.includes(needle), msg || `${JSON.stringify(src)} → contains ${needle}`, h); };
const lacks = (src, needle, msg, o) => { const h = markdown(src, o); ok(!h.toLowerCase().includes(needle.toLowerCase()), msg || `${JSON.stringify(src)} → lacks ${needle}`, h); };

/* ---------------- blocks */
has('# Title', '<h1 id="title">Title');
has('Title\n=====', '<h1 id="title">');
has('Sub\n---', '<h2 id="sub">');
has('###### six ######', '<h6 id="six">six');
has('#nospace', '<p>#nospace</p>', 'ATX needs a space');
has('## سلام دنیا', 'id="سلام-دنیا"', 'Persian slug keeps letters');
ok(render('## A\n## A\n## A').headings.map((h) => h.id).join() === 'a,a-1,a-2', 'duplicate heading ids are unique');
ok(render('## ac rail').headings[0].id === 'h-ac-rail', 'ids never start with ac-');
has('a\nb', '<p>a\nb</p>', 'soft break stays in one paragraph');
has('a  \nb', 'a<br>b', 'two trailing spaces = hard break');
has('a\\\nb', 'a<br>b', 'backslash = hard break');
has('***', '<hr>'); has('- - -', '<hr>'); has('___', '<hr>');
has('```js\nconst a = 1 < 2;\n```', '<div class="ac-code ac-prose__code" data-ac="code" data-lang="js"><pre><code>const a = 1 &lt; 2;</code></pre></div>');
has('~~~\nraw <b>\n~~~', '<code>raw &lt;b&gt;</code>');
has('````md\n```\ninner\n```\n````', '```\ninner\n```', 'longer fence wraps a shorter one');
has('    indented code', '<code>indented code</code>');
has('```"><script>\nx\n```', 'data-lang="script"><pre>', 'hostile info string is reduced to safe chars');
lacks('```"><script>\nx\n```', '<script');
has('> quote\n> more', '<blockquote><p>quote\nmore</p></blockquote>');
has('> lazy\ncontinuation', '<blockquote><p>lazy\ncontinuation</p></blockquote>');
has('> outer\n>> inner', '<blockquote><p>inner</p></blockquote>', 'nested quotes');
has('> [!NOTE]\n> Body', '<div class="ac-callout" data-kind="note" role="note">');
has('> [!WARNING] Careful now\n> x', '<span>Careful now</span>', 'callout custom title');
has('> [!NOTE]\n> x', 'نکته', 'callout labels follow lang', { lang: 'fa' });
has('> [!UNKNOWN]\n> x', '<blockquote>', 'unknown callout falls back to a quote');
has(':::details More info\nhidden\n:::', '<details class="ac-prose__details"><summary>More info</summary>');
has(':::danger\nboom\n:::', 'data-kind="danger"');

/* ---------------- lists */
has('- a\n- b', '<ul><li>a</li><li>b</li></ul>');
has('1. a\n2. b', '<ol><li>a</li><li>b</li></ol>');
has('3) a\n4) b', '<ol start="3">');
has('- a\n  - b\n    - c', '<ul><li>a\n<ul><li>b\n<ul><li>c</li></ul></li></ul></li></ul>', 'nested bullets');
has('1. one\n   - sub\n2. two', '<ol><li>one\n<ul><li>sub</li></ul></li><li>two</li></ol>', 'list inside ordered');
has('- a\n\n- b', '<ul><li><p>a</p></li><li><p>b</p></li></ul>', 'loose list wraps paragraphs');
has('- [ ] todo\n- [x] done', 'class="ac-tasklist"');
has('- [x] done', '<li class="ac-task" data-done><input type="checkbox" class="ac-task__box" disabled checked aria-hidden="true"><span class="ac-task__text">done</span></li>');
has('- a\ncontinued', '<li>a\ncontinued</li>', 'lazy list continuation');
has('* a\n+ b', '</ul>\n<ul>', 'changing the bullet starts a new list');

/* ---------------- tables */
has('| a | b |\n|:--|--:|\n| 1 | 2 |', '<th data-align="start">a</th><th data-align="end">b</th>');
has('| a | b |\n|---|:-:|\n| `x|y` | 2 |', '<td><code>x|y</code></td>', 'pipe inside code span');
has('a | b\n--|--\n1 | 2', '<table>', 'table without outer pipes');
has('| a |\n|---|\n| <img src=x onerror=alert(1)> |', '&lt;img src=x onerror=alert(1)&gt;');
has('| a | b |\n|---|---|\n| 1 |', '<td>1</td><td></td>', 'short rows are padded');
has('| a |\n|---|\n| 1 |', 'class="ac-prose__table" tabindex="0" role="region"', 'tables scroll in a focusable region');

/* ---------------- inline */
has('**b** *i* ~~s~~ `c`', '<strong>b</strong> <em>i</em> <del>s</del> <code>c</code>');
has('__b__ _i_', '<strong>b</strong> <em>i</em>');
has('***bi***', '<strong><em>bi</em></strong>');
has('snake_case_name', 'snake_case_name', 'intraword underscores are literal');
has('2 * 3 * 4', '2 * 3 * 4', 'spaced asterisks are literal');
has('\\*not em\\*', '*not em*');
has('`` a ` b ``', '<code>a ` b</code>');
has('`<b>`', '<code>&lt;b&gt;</code>');
has('Press <kbd>Ctrl</kbd> + <kbd>K</kbd>', '<kbd>Ctrl</kbd> + <kbd>K</kbd>');
has('H<sub>2</sub>O and x<sup>2</sup>', 'H<sub>2</sub>O and x<sup>2</sup>');
has('<kbd>open', '<kbd>open</kbd>', 'whitelisted tags are balanced');
has('</kbd>stray', '<p>stray</p>', 'stray closing tags are dropped');
has('<kbd class="x">k</kbd>', '&lt;kbd class=&quot;x&quot;&gt;', 'tags with attributes are text');
has('[site](https://example.com "T")', '<a href="https://example.com" title="T" target="_blank" rel="noopener noreferrer nofollow">site</a>');
has('[rel](./docs/a.md)', '<a href="./docs/a.md">rel</a>');
has('[p](https://x.y/a_(b))', 'href="https://x.y/a_(b)"', 'balanced parens in URL');
has('[ref][r]\n\n[r]: https://r.io "Title"', '<a href="https://r.io" title="Title"');
has('[r]\n\n[r]: https://r.io', '<a href="https://r.io"', 'shortcut reference');
has('<https://auto.link>', '<a href="https://auto.link" target="_blank" rel="noopener noreferrer nofollow" class="ac-autolink">');
has('<me@mail.io>', 'href="mailto:me@mail.io"');
has('see https://a.io/x.', 'href="https://a.io/x"', 'bare URL drops trailing dot');
has('(https://a.io/x)', 'href="https://a.io/x"', 'bare URL drops unbalanced paren');
has('www.a.io', 'href="https://www.a.io"');
has('![alt](https://i.io/a.png)', '<figure class="ac-prose__figure"><img src="https://i.io/a.png" alt="alt" loading="lazy" decoding="async"><figcaption>alt</figcaption></figure>');
has('![a](https://i.io/a.png "Cap")', '<figcaption>Cap</figcaption>');
has('text ![i](a.png) inline', 'text <img src="a.png" alt="i"');
has('[**bold** link](/x)', '<a href="/x"><strong>bold</strong> link</a>');
has('[a [b] c](/x)', '<a href="/x">a [b] c</a>', 'nested brackets in link text');
has('Note[^1].\n\n[^1]: The note.', '<sup class="ac-fnref"><a href="#fn-1" id="fnref-1" data-fn="1">1</a></sup>');
has('Note[^n].\n\n[^n]: The note.', '<section class="ac-footnotes"');
has('No ref.\n\n[^z]: unused', 'No ref.', 'unused footnotes do not render');
lacks('No ref.\n\n[^z]: unused', 'ac-footnotes');
has('[^missing]', '[^missing]', 'unknown footnote stays text');

/* ---------------- XSS payloads */
const xss = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<iframe src="javascript:alert(1)">',
  '[x](javascript:alert(1))',
  '[x](JaVaScRiPt:alert(1))',
  '[x](java\tscript:alert(1))',
  '[x](  javascript:alert(1))',
  '[x](&#106;avascript:alert(1))',
  '[x](javascript&colon;alert(1))',
  '[x](vbscript:msgbox(1))',
  '[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)',
  '[x](file:///etc/passwd)',
  '<javascript:alert(1)>',
  '![x](javascript:alert(1))',
  '![x](data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=)',
  '[x](https://a.io "onmouseover=alert(1)")',
  '[x](https://a.io "a\\" onmouseover=\\"alert(1)")',
  '[x](<javascript:alert(1)>)',
  '[x][evil]\n\n[evil]: javascript:alert(1)',
  '```js" onmouseover="alert(1)\ncode\n```',
  '## <img src=x onerror=alert(1)>',
  '> [!NOTE] <script>alert(1)</script>',
  ':::details <img src=x onerror=alert(1)>\nx\n:::',
  '| <script>x</script> |\n|---|\n| y |',
  '[<img src=x onerror=alert(1)>](https://a.io)',
  '`</code><script>alert(1)</script>`',
  '<kbd onclick=alert(1)>x</kbd>',
  '<a href="javascript:alert(1)">x</a>',
  'https://a.io/"onmouseover="alert(1)',
  '<style>*{display:none}</style>',
  '[x](https://a.io)<!-- --><script>alert(1)</script>',
  '\u0000<script>alert(1)</script>',
];
for (const p of xss) {
  const h = markdown(p).toLowerCase();
  ok(!/<(script|iframe|style|object|embed)\b|<svg(?! class="ac-icon")/.test(h), `no dangerous element: ${JSON.stringify(p)}`, h);
  ok(!/\son[a-z]+\s*=/.test(h.replace(/&quot;|&#39;/g, '')) || !/<[^>]+\son[a-z]+\s*=/.test(h), `no event handler attribute: ${JSON.stringify(p)}`, h);
  ok(!/href="\s*(javascript|vbscript|data|file):/.test(h) && !/src="\s*(javascript|vbscript|data):/.test(h), `no dangerous URL: ${JSON.stringify(p)}`, h);
  ok(!/<img[^>]*\sonerror/.test(h), `no onerror: ${JSON.stringify(p)}`, h);
}
// every attribute value in the output is quoted and closed: no raw quote can break out
for (const p of xss) {
  const h = markdown(p);
  const tags = h.match(/<[a-z][^>]*>/gi) || [];
  ok(tags.every((t) => (t.match(/"/g) || []).length % 2 === 0), `balanced quotes in tags: ${JSON.stringify(p)}`, tags.join(' '));
}
ok(safeUrl('https://a.io') === 'https://a.io', 'https allowed');
ok(safeUrl('mailto:a@b.c') === 'mailto:a@b.c', 'mailto allowed');
ok(safeUrl('#top') === '#top' && safeUrl('/x?y=1') === '/x?y=1' && safeUrl('../a.md') === '../a.md', 'relative URLs allowed');
ok(safeUrl(' javascript:alert(1)') === '', 'leading space javascript refused');
ok(safeUrl('java\nscript:alert(1)') === '', 'newline javascript refused');
ok(safeUrl('​javascript:alert(1)') === '', 'zero-width javascript refused');
ok(safeUrl('data:image/png;base64,iVBORw0KGgo=', { image: true }) === '', 'data images off by default');
ok(safeUrl('data:image/png;base64,iVBORw0KGgo=', { image: true, allowData: true }) !== '', 'data images opt-in');
ok(safeUrl('mailto:x@y.z', { image: true }) === '', 'images only over http(s)');
has('![x](data:image/png;base64,iVBORw0KGgo=)', 'src="data:image/png', 'allowDataImages opt-in', { allowDataImages: true });
has('[x](/a)', 'href="/docs/a"', 'link hook rewrites', { link: (h) => `/docs${h}` });
lacks('[x](/a)', 'javascript', 'link hook output is still sanitized', { link: () => 'javascript:alert(1)' });

/* ---------------- metadata */
const r = render('# T\n\n## Intro\n\nسلام دنیا، این یک متن است.\n\n### Deep\n\n```js\nnot counted words here\n```');
ok(r.headings.length === 3 && r.headings[1].level === 2 && r.headings[1].text === 'Intro', 'headings metadata');
ok(r.words >= 7 && r.words <= 9, `word count ignores code (${r.words})`);
ok(slugify('Hello, World!') === 'hello-world', 'slugify ascii');
ok(slugify('نیم‌فاصله و فاصله') === 'نیم-فاصله-و-فاصله', 'slugify ZWNJ');
ok(markdown('') === '' && markdown(null) === '', 'empty input');
const big = '- a\n'.repeat(3000) + '*'.repeat(5000) + '['.repeat(3000) + '`'.repeat(3000);
const t0 = Date.now(); markdown(big); const ms = Date.now() - t0;
ok(ms < 1500, `pathological input renders fast (${ms}ms)`);

console.log(`${fails ? '✗' : '✓'} prose: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
