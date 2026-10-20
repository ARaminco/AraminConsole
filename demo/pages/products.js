/* Products — grid/list toggle, category chips, search + sort, product editor modal (sheet on phones). */
import { products } from '../data.js';

const CATS = ['all', 'Electronics', 'Accessories', 'Fashion', 'Home', 'Grocery'];
const CAT_FA = { all: 'همه', Electronics: 'الکترونیک', Accessories: 'لوازم جانبی', Fashion: 'پوشاک و کیف', Home: 'خانه', Grocery: 'خواربار' };

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  const usd = (n) => AC.format.number(n, { currency: 'USD' });
  let items = products.map((p, i) => ({ ...p, featured: i % 4 === 0, published: i !== 6 }));
  let cat = 'all'; let q = ''; let sort = 'sales'; let editing = null;
  const host = $('[data-prod-list]');
  const catLabel = (c) => t(c === 'all' ? 'ops.all' : `prod.c.${c}`, CAT_FA[c]);

  function renderCats() {
    $('[data-prod-cats]').innerHTML = CATS.map((c) => `<button class="ac-chip" type="button" data-cat="${c}" aria-pressed="${c === cat}">${esc(catLabel(c))}<span class="ac-count">${c === 'all' ? items.length : items.filter((p) => p.category === c).length}</span></button>`).join('');
  }
  const stockTone = (s) => (s === 0 ? 'danger' : s < 50 ? 'warning' : 'success');
  const stockText = (s) => (s === 0 ? t('prod.out', 'ناموجود') : s < 50 ? t('prod.low', 'کم: {n}', { n: s }) : t('prod.inStock', '{n} عدد', { n: s }));

  function render() {
    const list = items
      .filter((p) => cat === 'all' || p.category === cat)
      .filter((p) => !q || `${p.name} ${p.sku}`.toLowerCase().includes(q))
      .sort((a, b) => ({ sales: b.sales - a.sales, 'price-asc': a.price - b.price, 'price-desc': b.price - a.price, rating: b.rating - a.rating, stock: a.stock - b.stock }[sort]));
    host.innerHTML = list.length ? list.map((p) => `<article class="ac-card prod" data-id="${p.id}">
        <button class="prod__media" type="button" data-edit="${p.id}" aria-label="${esc(t('prod.edit', 'ویرایش'))}: ${esc(p.name)}">
          <span class="prod__art" data-cat="${esc(p.category)}">${AC.icon(p.icon, 'ac-icon--xl')}</span>
          ${p.featured ? `<span class="ac-badge ac-badge--accent ac-badge--solid prod__flag">${esc(t('prod.featured', 'ویژه'))}</span>` : ''}
          ${!p.published ? `<span class="ac-badge prod__flag">${esc(t('prod.draft', 'پیش‌نویس'))}</span>` : ''}
        </button>
        <div class="prod__body">
          <div class="prod__titles"><strong class="ac-clamp-2" dir="auto">${esc(p.name)}</strong><small><span class="ac-mono">${esc(p.sku)}</span> · ${esc(catLabel(p.category))}</small></div>
          <div class="prod__meta"><span class="prod__rating">${AC.icon('star')}<bdi>${p.rating.toFixed(1)}</bdi></span><span class="dash-status" data-tone="${stockTone(p.stock)}">${esc(stockText(p.stock))}</span></div>
          <div class="prod__foot"><b class="prod__price ac-num"><bdi>${usd(p.price)}</bdi></b><span class="prod__sales"><bdi>${AC.format.number(p.sales)}</bdi> ${esc(t('prod.sold', 'فروش'))}</span>
            <button class="ac-btn ac-btn--sm ac-btn--icon ac-btn--soft" type="button" data-edit="${p.id}" aria-label="${esc(t('common.edit', 'ویرایش'))}">${AC.icon('pencil')}</button></div>
        </div></article>`).join('')
      : `<div class="ac-card ac-empty"><div class="ac-empty__art">${AC.icon('package')}</div><h2 class="ac-empty__title">${esc(t('prod.none', 'محصولی پیدا نشد'))}</h2><div class="ac-empty__actions"><button class="ac-btn" type="button" data-prod-reset>${esc(t('prod.reset', 'پاک کردن فیلترها'))}</button></div></div>`;
  }
  renderCats(); render();

  /* editor */
  const modal = $('#prod-editor');
  const form = $('#prod-form');
  const titleEl = $('[data-prod-title]');
  const skuEl = $('[data-prod-sku]');
  function open(p, trigger) {
    editing = p;
    titleEl.textContent = p ? t('prod.edit', 'ویرایش محصول') : t('prod.new', 'محصول جدید');
    skuEl.textContent = p ? p.sku : `SKU-${Date.now().toString(36).slice(-5).toUpperCase()}`;
    form.elements.name.value = p?.name || '';
    form.elements.price.value = p ? String(p.price) : '';
    form.elements.stock.value = String(p?.stock ?? 0);
    form.elements.desc.value = p ? `${p.name} — ${catLabel(p.category)}` : '';
    form.elements.published.checked = p ? p.published : true;
    form.elements.featured.checked = !!p?.featured;
    const combo = AC.instance(form.querySelector('[data-ac~="combobox"]'), 'combobox');
    if (combo?.set) combo.set(p?.category || 'Electronics'); else form.elements.category.value = p?.category || 'Electronics';
    AC.modal.open(modal, trigger);
  }

  const offs = [
    AC.on(root, 'ac:segmented:change', (e) => { if (e.target.closest('[data-prod-view]')) host.dataset.view = e.detail.value; }),
    AC.on(root, 'click', '[data-cat]', (e, b) => { cat = b.dataset.cat; renderCats(); render(); }),
    AC.on($('[data-prod-q]'), 'input', AC.debounce((e) => { q = e.target.value.trim().toLowerCase(); render(); }, 150)),
    AC.on($('[data-prod-sort]'), 'change', (e) => { sort = e.target.value; render(); }),
    AC.on(root, 'click', '[data-prod-reset]', () => { cat = 'all'; q = ''; $('[data-prod-q]').value = ''; renderCats(); render(); }),
    AC.on(root, 'click', '[data-edit]', (e, b) => open(items.find((p) => p.id === b.dataset.edit), b)),
    AC.on(root, 'click', '[data-prod-new]', (e, b) => open(null, b)),
    AC.on(form, 'ac:form:submit', (e) => {
      const v = e.detail.values;
      const patch = { name: v.name, price: Number(String(v.price).replace(/[^\d.]/g, '')) || 0, stock: Number(v.stock) || 0, category: v.category || 'Electronics', published: !!form.elements.published.checked, featured: !!form.elements.featured.checked };
      e.detail.waitUntil(new Promise((r) => setTimeout(r, AC.reducedMotion() ? 0 : 450)).then(() => {
        if (editing) items = items.map((p) => (p.id === editing.id ? { ...p, ...patch } : p));
        else items = [{ id: `P-${400 + items.length}`, sku: skuEl.textContent, icon: 'package', sales: 0, rating: 5, ...patch }, ...items];
        renderCats(); render(); AC.modal.close(modal);
        AC.toast?.({ title: editing ? t('prod.saved', 'محصول ذخیره شد') : t('prod.created', 'محصول ساخته شد'), tone: 'success' });
      }));
    }),
    AC.on(document, 'ac:i18n:change', () => { renderCats(); render(); }),
  ];
  return () => { offs.forEach((f) => f()); AC.modal.close(modal); };
}
