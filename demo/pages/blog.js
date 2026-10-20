/* Blog page — article cards grid with tag chips and live search (cards come from demo/content/posts.js). */
import { posts, tags, pick } from '../content/posts.js';
import { postCard } from './article.js';

export default function mount(root, AC) {
  const grid = root.querySelector('[data-blog-grid]');
  const empty = root.querySelector('[data-blog-empty]');
  const input = root.querySelector('[data-blog-search]');
  const norm = (s) => String(s).toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک');
  let tag = 'all';
  function render() {
    const lang = AC.i18n.lang || 'fa';
    const q = norm(input.value.trim());
    const list = posts.filter((p) => (tag === 'all' || p.tag === tag)
      && (!q || norm(`${pick(p.title, lang)} ${pick(p.excerpt, lang)} ${pick(tags[p.tag], lang)}`).includes(q)));
    grid.innerHTML = list.map((p, i) => postCard(AC, p, lang, { feature: i === 0 && tag === 'all' && !q && p.featured })).join('');
    empty.hidden = list.length > 0; grid.hidden = !list.length;
  }
  const offs = [
    AC.on(root.querySelector('[data-blog-tags]'), 'click', '[data-tag]', (e, b) => {
      tag = b.dataset.tag;
      root.querySelectorAll('[data-blog-tags] [data-tag]').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      render();
    }),
    AC.on(input, 'input', AC.debounce(render, 120)),
    AC.on(document, 'ac:i18n:change', render),
  ];
  render();
  return () => offs.forEach((f) => f());
}
