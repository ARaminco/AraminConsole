/* Docs page — renders the repository's own docs/*.md at runtime with the prose module (sidebar tree, TOC with
   scroll-spy, prev/next). Links between docs become #/docs?doc=<name>; &h=<id> scrolls to a heading. */
const TREE = [
  { group: { fa: 'شروع', en: 'Start', ar: 'البداية' }, items: [['getting-started', 'Getting started', 'rocket'], ['theming', 'Theming', 'palette'], ['DESIGN', 'Design direction', 'sparkles']] },
  { group: { fa: 'کامپوننت‌ها', en: 'Components', ar: 'المكونات' }, items: [['forms', 'Forms & inputs', 'text-cursor-input'], ['data', 'Data display', 'table'], ['overlays', 'Overlays', 'layers'], ['finance', 'Money & banks', 'landmark'], ['prose', 'Prose & Markdown', 'book-open']] },
  { group: { fa: 'مرجع', en: 'Reference', ar: 'المرجع' }, items: [['CONVENTIONS', 'Conventions', 'list'], ['SPEC', 'Specification', 'file-text']] },
];
const FLAT = TREE.flatMap((g) => g.items);
const REPO = 'https://github.com/ARaminco/AraminConsole/blob/main/';

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const esc = AC.escapeHtml;
  const body = $('[data-docs-body]'); const main = $('[data-docs-main]');
  const params = () => new URLSearchParams(location.hash.split('?')[1] || '');
  let current = ''; let prose; let article; let alive = true; let token = 0;
  const offs = [];

  const docHref = (name, h) => `#/docs?doc=${encodeURIComponent(name)}${h ? `&h=${encodeURIComponent(h)}` : ''}`;
  function tree() {
    const lang = AC.i18n.lang || 'fa';
    $('[data-docs-list]').innerHTML = TREE.map((g) => `<div class="ac-doctree__group"><div class="ac-doctree__label">${esc(g.group[lang] || g.group.en)}</div>${
      g.items.map(([n, t, i]) => `<a class="ac-doctree__link" href="${docHref(n)}" data-doc="${n}"${n === current ? ' aria-current="page"' : ''}>${AC.icon(i)}<span>${esc(t)}</span></a>`).join('')}</div>`).join('');
  }
  // links inside a doc: x.md / ./x.md / docs/x.md(#y) → in-app routes; other relative links → the repository
  const link = (href) => {
    const m = /^(?:\.\/|\.\.\/docs\/|docs\/)?([\w-]+)\.md(?:#(.+))?$/.exec(href);
    if (m && FLAT.some(([n]) => n === m[1])) return docHref(m[1], m[2]);
    if (/^(https?:|mailto:|#)/i.test(href)) return href;
    return REPO + href.replace(/^\.\.\//, '').replace(/^\.\//, 'docs/');
  };
  const image = (src) => (/^https?:/i.test(src) ? src : new URL(src, new URL('../docs/', location.href)).href);

  async function load(name, h) {
    if (!FLAT.some(([n]) => n === name)) name = 'getting-started';
    const my = ++token;
    current = name; tree();
    const entry = FLAT.find(([n]) => n === name);
    $('[data-docs-current]').textContent = entry[1];
    $('[data-docs-crumb]').textContent = entry[1];
    main.setAttribute('aria-busy', 'true');
    let md = null;
    try { const r = await fetch(new URL(`../docs/${name}.md`, location.href), { cache: 'no-cache' }); if (r.ok) md = await r.text(); } catch { /* offline */ }
    await AC.use('prose');
    if (!alive || my !== token) return;
    if (!prose) prose = AC.prose(body, { anchorUrl: (id) => docHref(current, id), markdownOptions: { lang: 'en', link, image } });
    if (md == null) prose.setHtml(`<p>${esc(AC.t('prose.loadError', 'Could not load the document.'))}</p>`); else prose.set(md);
    main.removeAttribute('aria-busy');
    $('[data-docs-read]').textContent = AC.t('prose.minRead', '{n} دقیقه مطالعه', { n: AC.format.number(prose.minutes) });
    $('[data-docs-source]').href = `${REPO}docs/${name}.md`;
    const i = FLAT.findIndex(([n]) => n === name);
    const prev = $('[data-docs-prev]'); const next = $('[data-docs-next]');
    prev.hidden = i <= 0; next.hidden = i >= FLAT.length - 1;
    if (i > 0) { prev.href = docHref(FLAT[i - 1][0]); prev.textContent = FLAT[i - 1][1]; }
    if (i < FLAT.length - 1) { next.href = docHref(FLAT[i + 1][0]); next.textContent = FLAT[i + 1][1]; }
    if (article) article.refresh(); else article = AC.article(root.querySelector('.ac-docs'), { content: body, toc: $('[data-toc-list]') });
    AC.motion?.reveal?.(body);
    if (h) requestAnimationFrame(() => prose.scrollTo(h)); else if (my > 1) scrollTo({ top: 0, behavior: 'auto' });
    if (matchMedia('(max-width: 1023.98px)').matches) $('[data-docs-tree]').open = false;
  }

  // switch docs without re-mounting the page (pushState); Back / Forward go through the router again
  offs.push(AC.on(root, 'click', 'a[href^="#/docs?"]', (e, a) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    e.preventDefault();
    history.pushState(null, '', a.getAttribute('href'));
    const p = new URLSearchParams(a.getAttribute('href').split('?')[1]);
    load(p.get('doc'), p.get('h'));
  }));
  offs.push(AC.on(document, 'ac:i18n:change', tree));
  load(params().get('doc') || 'getting-started', params().get('h'));
  return () => { alive = false; offs.forEach((f) => f()); article?.destroy(); prose?.destroy(); };
}
