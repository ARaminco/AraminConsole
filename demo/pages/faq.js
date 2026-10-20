/* FAQ page — topic chips + live search over the accordion (matches highlighted, empty state). */
export default function mount(root, AC) {
  const items = [...root.querySelectorAll('[data-faq-list] .ac-accordion__item')];
  const input = root.querySelector('[data-faq-search]');
  const empty = root.querySelector('[data-faq-empty]');
  const list = root.querySelector('[data-faq-list]');
  const norm = (s) => s.toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ');
  const plain = new Map(items.map((d) => [d, { q: d.querySelector('summary').textContent, a: d.querySelector('.ac-accordion__body').innerHTML }]));
  let cat = 'all';

  const mark = (text, q) => {
    const esc = AC.escapeHtml(text); if (!q) return esc;
    const i = norm(text).indexOf(q); if (i < 0) return esc;
    return `${AC.escapeHtml(text.slice(0, i))}<mark>${AC.escapeHtml(text.slice(i, i + q.length))}</mark>${AC.escapeHtml(text.slice(i + q.length))}`;
  };
  function apply() {
    const q = norm(input.value.trim());
    let shown = 0;
    for (const d of items) {
      const { q: question, a } = plain.get(d);
      const answer = d.querySelector('.ac-accordion__body').textContent;
      const ok = (cat === 'all' || d.dataset.cat === cat) && (!q || norm(question).includes(q) || norm(answer).includes(q));
      d.hidden = !ok;
      d.querySelector('summary').innerHTML = mark(question, q);
      if (!q) d.querySelector('.ac-accordion__body').innerHTML = a;
      if (ok) shown++;
    }
    empty.hidden = shown > 0; list.hidden = shown === 0;
    if (q && shown) { const first = items.find((d) => !d.hidden); if (first && !first.open) AC.instance(list, 'accordion')?.toggle(items.indexOf(first), true); }
  }
  const offs = [
    AC.on(input, 'input', AC.debounce(apply, 120)),
    AC.on(root, 'click', '[data-cat]', (e, b) => { if (!b.closest('[data-faq-cats]')) return; cat = b.dataset.cat; root.querySelectorAll('[data-faq-cats] [data-cat]').forEach((c) => c.setAttribute('aria-pressed', String(c === b))); apply(); }),
    AC.on(document, 'keydown', (e) => { if (e.key === '/' && !e.target.closest('input, textarea, [contenteditable="true"]')) { e.preventDefault(); input.focus(); } }),
  ];
  return () => offs.forEach((f) => f());
}
