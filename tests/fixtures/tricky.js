// Minifier / bundler fixture: every construct here must survive byte-exact in meaning. Evaluated as a function body; returns a summary.
/* block comment with 'quotes' and "double" and `ticks` and a fake regex /x/ and an apostrophe: don't */
const out = [];
const re1 = /[/\]]+/g; // slash inside a class, escaped bracket
const re2 = /\s+|\d{2,}|\w+\$/;
const re3 = /^(?:https?:)?\/\//i;
const re4 = / | |\\n/;
const re5 = /[`'"]/g;
out.push('a/b]c'.replace(re1, '|'), re2.source, re3.test('//x'), re4.test('\\n'), 'x`y\'z"'.replace(re5, '_'));
const s1 = 'it\'s a \\ backslash \n newline \t tab é \x41';
const s2 = "double \"quoted\" // not a comment /* nor this */";
const t1 = `template ${1 + 1} with \` backtick and \${not} and ${`nested ${'deep'} ${[1, 2].map((x) => `${x}`).join('')}`} end`;
out.push(s1, s2, t1);
const a = 10, b = 2, g = 5;
const div = a / b / g; // division, not regex
const div2 = (a + b) / 2 / 3;
let i = 1;
const plus = i++ + +b;
const minus = a - -b;
out.push(div, div2, plus, minus, i);
const obj = { a: 1, 'b-c': 2, [`k${a}`]: 3 };
out.push(JSON.stringify(obj));
function asi() {
  return (
    'kept'
  );
}
let x = 1
let y = x
++y
out.push(asi(), x, y);
const arrow = (v) => v?.length ?? -1;
out.push(arrow('abc'), arrow(null), 1.5.toFixed(1), 0x1f, 1e3, .5 + .25);
const cond = a > b ? /yes/.source : 'no';
const typeofRe = typeof /re/;
out.push(cond, typeofRe, [1, 2, 3].map((n) => n * 2).join(','));
const html = '<a href="#">x</a>'.replace(/<[^>]+>/g, '');
out.push(html, 'a b'.length, String.raw`\d+\s*`);
return out;
