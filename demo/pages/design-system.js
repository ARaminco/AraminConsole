/* Design-system page — live token swatches (computed values follow theme / accent), type scale, spacing ruler,
   radius & shadow samples, motion curves (click to play) and a searchable icon grid. Click = copy. */
const GROUPS = [
  ['برند و جوهر', ['accent', 'accent-2', 'accent-soft', 'accent-ink', 'ink', 'ink-hover', 'highlight']],
  ['بوم و سطوح', ['bg', 'bg-subtle', 'surface-1', 'surface-2', 'surface-3', 'elevated', 'chrome-bg', 'pill-bg']],
  ['متن و مرز', ['text', 'text-soft', 'muted', 'faint', 'border', 'border-strong', 'hover', 'active']],
  ['وضعیت', ['success', 'success-soft', 'success-ink', 'warning', 'warning-soft', 'warning-ink', 'danger', 'danger-soft', 'danger-ink', 'info', 'info-soft', 'info-ink', 'neutral-soft', 'neutral-ink']],
  ['نمودار', ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6', 'chart-7', 'chart-8']],
];
const FS = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
const SPACE = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const RADIUS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'pill'];
const SHADOW = ['xs', 'sm', 'md', 'lg', 'xl', 'chrome', 'glow'];
const CURVES = [
  ['ease', 'ease', 'پیش‌فرض UI (ورود و خروج)', 'dur-4'],
  ['ease-out', 'ease-out', 'آشکارشدن و بلندشدن', 'dur-4'],
  ['ease-in-out', 'ease-in-out', 'حرکت روی صفحه', 'dur-4'],
  ['ease-move', 'ease-move', 'اسلاید پنل', 'dur-3'],
  ['ease-drawer', 'ease-drawer', 'شیت و کشو', 'dur-sheet'],
  ['spring', 'spring', 'فنر جمع‌وجور: پیل و شاخص', 'spring-dur'],
  ['spring-bounce', 'spring-bounce', 'فنر بازیگوش: آیکون و نشان', 'spring-bounce-dur'],
];

function pageCSS() {
  if (document.querySelector('link[data-ds-css]')) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./design-system.css', import.meta.url).href; l.dataset.dsCss = '';
  document.head.append(l);
}

export default function mount(root, AC) {
  pageCSS();
  const $ = (s) => root.querySelector(s);
  const esc = AC.escapeHtml;
  const cs = () => getComputedStyle(document.documentElement);
  const v = (name) => cs().getPropertyValue(`--ac-${name}`).trim();
  const offs = [];
  let timer;

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); } catch { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); try { document.execCommand('copy'); } catch { /* ignore */ } t.remove(); }
    AC.toast?.success?.('کپی شد', text);
  }
  root.addEventListener('click', (e) => { const b = e.target.closest('[data-copy]'); if (b) copy(b.dataset.copy); });

  /* ---- colours ---- */
  const colorsEl = $('[data-ds-colors]');
  colorsEl.innerHTML = GROUPS.map(([title, names], gi) => `<section><h3 class="ds-group__title">${esc(title)}</h3><div class="ds-swatches">` +
    names.map((n) => `<button class="ds-swatch" type="button" data-copy="var(--ac-${n})" data-token="${n}"><span class="ds-swatch__chip"></span><span class="ds-swatch__name">--ac-${n}</span><span class="ds-swatch__val"></span></button>`).join('') + `</div></section>`).join('');
  const paintColors = () => colorsEl.querySelectorAll('.ds-swatch').forEach((b) => {
    const val = v(b.dataset.token); b.querySelector('.ds-swatch__chip').style.setProperty('--c', `var(--ac-${b.dataset.token})`);
    b.querySelector('.ds-swatch__val').textContent = val.replace(/color-mix\(in oklab, /, 'mix(').slice(0, 44);
  });

  /* ---- type ---- */
  $('[data-ds-type]').innerHTML = FS.map((s) => `<button class="ds-type__row" type="button" data-copy="var(--ac-fs-${s})"><span class="ds-type__meta">--ac-fs-${s}</span><span class="ds-type__sample" data-fs="${s}">آرامین‌کنسول ۱۲۳ Aa</span></button>`).join('');
  const paintType = () => root.querySelectorAll('[data-fs]').forEach((el) => { el.style.fontSize = `var(--ac-fs-${el.dataset.fs})`; const meta = el.previousElementSibling; meta.textContent = `--ac-fs-${el.dataset.fs} · ${Math.round(parseFloat(getComputedStyle(el).fontSize))}px`; });

  /* ---- space ---- */
  $('[data-ds-space]').innerHTML = SPACE.map((n) => `<button class="ds-ruler__row" type="button" data-copy="var(--ac-s-${n})"><span class="ds-ruler__name">--ac-s-${n}</span><span class="ds-ruler__bar" data-s="${n}"></span><span class="ds-ruler__px"></span></button>`).join('');
  const paintSpace = () => root.querySelectorAll('[data-s]').forEach((el) => { el.style.inlineSize = `var(--ac-s-${el.dataset.s})`; el.nextElementSibling.textContent = `${Math.round(parseFloat(getComputedStyle(el).inlineSize))}px`; });

  /* ---- radius & shadow ---- */
  $('[data-ds-radius]').innerHTML = RADIUS.map((r) => `<button class="ds-tile" type="button" data-copy="var(--ac-r-${r})"><span class="ds-tile__box" data-r="${r}"></span><span class="ds-tile__name">--ac-r-${r}</span></button>`).join('');
  root.querySelectorAll('[data-r]').forEach((el) => { el.style.borderRadius = `var(--ac-r-${el.dataset.r})`; });
  $('[data-ds-shadow]').innerHTML = SHADOW.map((s) => `<button class="ds-tile" type="button" data-copy="var(--ac-shadow-${s})"><span class="ds-tile__box" data-sh="${s}"></span><span class="ds-tile__name">--ac-shadow-${s}</span></button>`).join('');
  root.querySelectorAll('[data-sh]').forEach((el) => { el.style.boxShadow = `var(--ac-shadow-${el.dataset.sh})`; });

  /* ---- motion ---- */
  const motionEl = $('[data-ds-motion]');
  motionEl.innerHTML = CURVES.map(([name, , use, dur]) => `<button class="ds-curve" type="button" data-curve="${name}" data-dur="${dur}" data-copy="var(--ac-${name})"><span class="ds-curve__meta"><span class="ds-curve__name">--ac-${name}</span><span class="ds-curve__use">${esc(use)} · <span data-ms></span></span></span><span class="ds-curve__track"><span class="ds-curve__dot"></span></span></button>`).join('');
  let slow = false, forward = new WeakMap();
  const ms = (dur) => parseFloat(v(dur)) || 300;
  const paintMs = () => motionEl.querySelectorAll('.ds-curve').forEach((b) => { b.querySelector('[data-ms]').textContent = `${ms(b.dataset.dur)}ms`; });
  motionEl.addEventListener('click', (e) => {
    const b = e.target.closest('.ds-curve'); if (!b) return;
    const dot = b.querySelector('.ds-curve__dot'), track = b.querySelector('.ds-curve__track');
    const dir = Number(v('dir')) || 1, dist = (track.clientWidth - dot.offsetWidth - 8) * dir;
    const goEnd = !forward.get(b); forward.set(b, goEnd);
    const from = getComputedStyle(dot).transform; // continue from where an interrupted run stopped
    dot.getAnimations().forEach((a) => a.cancel());
    dot.style.transform = `translateX(${goEnd ? dist : 0}px)`;
    dot.animate([{ transform: from === 'none' ? 'none' : from }, { transform: `translateX(${goEnd ? dist : 0}px)` }], { duration: ms(b.dataset.dur) * (slow ? 3 : 1), easing: v(b.dataset.curve) || 'ease' });
  });
  $('[data-ds-slow]').addEventListener('click', (e) => { slow = !slow; e.currentTarget.setAttribute('aria-pressed', String(slow)); });

  /* ---- icons ---- */
  const grid = $('[data-ds-icons]'), empty = $('[data-ds-icons-empty]'), search = $('[data-ds-icon-search]');
  let names = [];
  const render = () => {
    const q = search.value.trim().toLowerCase();
    const list = q ? names.filter((n) => n.includes(q)) : names;
    grid.innerHTML = list.map((n) => `<button class="ds-icon" type="button" data-copy="&lt;svg class=&quot;ac-icon&quot; aria-hidden=&quot;true&quot;&gt;&lt;use href=&quot;#i-${n}&quot;/&gt;&lt;/svg&gt;" title="${n}"><svg class="ac-icon" aria-hidden="true"><use href="#i-${n}"/></svg><span class="ds-icon__name">${n}</span></button>`).join('');
    empty.hidden = list.length > 0; grid.hidden = list.length === 0;
  };
  (async () => {
    try {
      const href = new URL(document.documentElement.dataset.acIcons || '../dist/icons.svg', document.baseURI).href;
      const svg = await (await fetch(href)).text();
      names = [...svg.matchAll(/id="i-([\w-]+)"/g)].map((m) => m[1]).sort();
    } catch { names = []; }
    root.querySelector('[data-ds-icon-count]').textContent = names.length;
    render();
  })();
  search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 80); });

  /* ---- keep values live with theme / accent / density / radius ---- */
  const repaint = () => requestAnimationFrame(() => { paintColors(); paintType(); paintSpace(); paintMs(); });
  repaint();
  const h = () => repaint();
  document.addEventListener('ac:theme:change', h);
  offs.push(() => document.removeEventListener('ac:theme:change', h));

  return () => { clearTimeout(timer); offs.forEach((f) => f()); };
}
