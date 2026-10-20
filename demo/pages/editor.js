/* Markdown editor — split live preview (debounced, XSS-safe AC.markdown), toolbar that wraps / prefixes the selection,
   RTL ↔ LTR toggle, word / character / line counts, reading time, draft autosave (localStorage ac:mde). Phones: write / preview tabs. */
const SAMPLE = `# عنوان نوشته

یک پاراگراف با **متن پررنگ**، *کج* و \`کد\`. پیوند به [AraminConsole](https://github.com/ARaminco/AraminConsole).

> [!TIP]
> از نوار ابزار بالا برای افزودن جدول، کد و کادر نکته استفاده کنید.

- مورد اول
- مورد دوم
  - زیرمورد

| ستون | مقدار |
|---|--:|
| الف | 12 |
| ب | 7 |

\`\`\`js
console.log('سلام');
\`\`\`
`;

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const box = $('[data-mde]'); const src = $('[data-mde-src]'); const out = $('[data-mde-preview]');
  const saved = $('[data-mde-saved]');
  const offs = []; let prose; let alive = true; let saveT;

  const counts = () => {
    const v = src.value;
    const words = (v.replace(/```[\s\S]*?```/g, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’‌-]*/gu) || []).length;
    $('[data-mde-words]').textContent = AC.format.number(words);
    $('[data-mde-chars]').textContent = AC.format.number(v.length);
    $('[data-mde-lines]').textContent = AC.format.number(v ? v.split('\n').length : 0);
    $('[data-mde-read]').textContent = AC.t('prose.minRead', '{n} دقیقه مطالعه', { n: AC.format.number(AC.readingTime ? AC.readingTime(words) : Math.max(1, Math.round(words / 200))) });
  };
  const render = () => { if (prose) prose.set(src.value); counts(); };
  const renderSoon = AC.debounce(render, 120);
  const save = () => {
    saved.dataset.state = 'dirty';
    clearTimeout(saveT);
    saveT = setTimeout(() => { AC.store.set('ac:mde', src.value); saved.dataset.state = 'saved'; }, 500);
  };

  /* ---------------- toolbar: wrap or prefix the selection, keep it selected, keep undo history */
  function replace(text, selStart, selEnd) {
    src.focus();
    // execCommand keeps the browser's undo stack; setRangeText is the fallback
    if (!document.execCommand?.('insertText', false, text)) src.setRangeText(text, src.selectionStart, src.selectionEnd, 'end');
    if (selStart != null) src.setSelectionRange(selStart, selEnd);
    render(); save();
  }
  const wrap = (before, after = before, placeholder = '') => {
    const { selectionStart: a, selectionEnd: b, value } = src;
    const sel = value.slice(a, b) || placeholder;
    replace(before + sel + after, a + before.length, a + before.length + sel.length);
  };
  const prefix = (fn) => {
    const { selectionStart: a, selectionEnd: b, value } = src;
    const ls = value.lastIndexOf('\n', a - 1) + 1;
    const le = value.indexOf('\n', b); const end = le < 0 ? value.length : le;
    src.setSelectionRange(ls, end);
    const lines = value.slice(ls, end).split('\n').map(fn);
    const text = lines.join('\n');
    replace(text, ls, ls + text.length);
  };
  const block = (text) => {
    const { selectionStart: a, value } = src;
    const pre = a > 0 && value[a - 1] !== '\n' ? '\n\n' : (a > 1 && value[a - 2] !== '\n' ? '\n' : '');
    replace(`${pre}${text}\n`, a + pre.length, a + pre.length + text.length);
  };
  const T = (k, f) => AC.t(k, f);
  const CMDS = {
    bold: () => wrap('**', '**', T('editor.boldText', 'متن پررنگ')),
    italic: () => wrap('*', '*', T('editor.italicText', 'متن کج')),
    strike: () => wrap('~~', '~~', T('editor.strikeText', 'متن')),
    heading: () => prefix((l) => (/^#{1,5} /.test(l) ? `#${l}` : /^#{6} /.test(l) ? l.replace(/^#+ /, '') : `## ${l}`)),
    ul: () => prefix((l) => (l.startsWith('- ') ? l.slice(2) : `- ${l}`)),
    ol: () => { let n = 0; prefix((l) => (/^\d+\. /.test(l) ? l.replace(/^\d+\. /, '') : `${++n}. ${l}`)); },
    task: () => prefix((l) => (l.startsWith('- [ ] ') ? l.slice(6) : `- [ ] ${l}`)),
    quote: () => prefix((l) => (l.startsWith('> ') ? l.slice(2) : `> ${l}`)),
    link: () => { const { selectionStart: a, selectionEnd: b, value } = src; const t = value.slice(a, b) || T('editor.linkText', 'متن پیوند'); replace(`[${t}](https://)`, a + t.length + 3, a + t.length + 11); },
    image: () => block(`![${T('editor.imageAlt', 'توضیح تصویر')}](https://)`),
    code: () => { const { selectionStart: a, selectionEnd: b, value } = src; const sel = value.slice(a, b); if (sel.includes('\n') || !sel) block(`\`\`\`js\n${sel || 'code'}\n\`\`\``); else wrap('`'); },
    table: () => block(`| ${T('editor.col', 'ستون')} ۱ | ${T('editor.col', 'ستون')} ۲ |\n|---|---|\n|  |  |`),
    callout: () => block(`> [!NOTE]\n> ${T('editor.calloutText', 'متن نکته')}`),
    dir: () => {
      const rtl = src.dir !== 'ltr';
      src.dir = rtl ? 'ltr' : 'rtl'; out.dir = src.dir;
      $('[data-mde-dir]').textContent = rtl ? 'LTR' : 'RTL';
      $('[data-cmd="dir"]').setAttribute('aria-pressed', String(rtl));
      out.animate?.([{ opacity: 0.4 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
    },
  };
  offs.push(AC.on(box, 'click', '[data-cmd]', (e, b) => { CMDS[b.dataset.cmd]?.(); }));
  offs.push(AC.on(src, 'keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) {
      if (e.key === 'Tab' && !e.shiftKey && src.selectionStart === src.selectionEnd) { e.preventDefault(); replace('  '); }
      return;
    }
    const k = e.key.toLowerCase();
    const map = { b: 'bold', i: 'italic', k: 'link' };
    if (map[k]) { e.preventDefault(); CMDS[map[k]](); }
  }));
  offs.push(AC.on(src, 'input', () => { renderSoon(); save(); }));
  offs.push(AC.on($('[data-mde-view]'), 'ac:segmented:change', (e) => { box.dataset.view = e.detail.value; if (e.detail.value === 'preview') render(); }));
  offs.push(AC.on($('[data-mde-reset]'), 'click', () => { src.value = SAMPLE; render(); save(); src.focus(); }));
  offs.push(AC.on($('[data-mde-copy]'), 'click', async (e, b) => {
    if (await AC.copyText(AC.markdown(src.value))) AC.toast?.({ title: AC.t('editor.copied', 'HTML امن کپی شد'), tone: 'success' });
  }));
  // keep the preview roughly in step with the source when scrolling (desktop split)
  offs.push(AC.on(src, 'scroll', AC.rafThrottle(() => {
    const a = src; const p = out.closest('.ac-mde__pane');
    const r = a.scrollTop / Math.max(1, a.scrollHeight - a.clientHeight);
    p.scrollTop = r * (p.scrollHeight - p.clientHeight);
  })));
  offs.push(AC.on(document, 'ac:i18n:change', counts));

  src.value = AC.store.get('ac:mde', null) ?? SAMPLE;
  AC.use('prose').then(() => { if (!alive) return; prose = AC.prose(out, {}); render(); saved.dataset.state = 'saved'; });
  return () => { alive = false; clearTimeout(saveT); offs.forEach((f) => f()); prose?.destroy(); };
}
