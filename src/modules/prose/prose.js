/* Prose module — long-form reading for Persian / Arabic / English: typography (.ac-prose), a zero-dependency,
   XSS-safe Markdown renderer, and article chrome (reading progress, table of contents with scroll-spy, reading
   time, image lightbox, heading anchors).
   AC.markdown(text, opts?) → safe HTML           (opts: see markdown.js; lang defaults to the UI language)
   AC.markdown.render(text, opts?) → { html, headings, words, text }
   AC.prose(el, { markdown?, html?, anchorUrl?(id), lightbox: true, offset }) → { headings, words, minutes, set(md), destroy }
   AC.article(el, { content, toc, progress: true, levels: [2, 3], offset }) → { refresh, destroy }
   AC.readingTime(words, wpm = 200) → minutes (≥ 1)
   Declarative: <div data-ac="prose" data-src="post.md"></div> (fetched, rendered, enhanced) or <div class="ac-prose" data-ac="prose">html…</div>
   Events: ac:prose:render { headings, words, minutes } · ac:toc:change { id } · ac:prose:anchor { id }
   install(AC) wires it into window.AC (no core import). */
import { render, markdown, slugify, safeUrl } from './markdown.js';

export { render, markdown, slugify, safeUrl };

function cssOnce() {
  if (typeof document === 'undefined' || document.querySelector('[data-ac-module="prose"]')) return;
  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = new URL('./prose.css', import.meta.url).href; link.dataset.acModule = 'prose';
    document.head.append(link);
  } catch { /* bundled builds ship the CSS themselves */ }
}

export const readingTime = (words, wpm = 200) => Math.max(1, Math.round((Number(words) || 0) / wpm));
const reduced = (AC) => (AC.reducedMotion ? AC.reducedMotion() : matchMedia('(prefers-reduced-motion: reduce)').matches);
const appbarOffset = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--ac-appbar-h').trim();
  const px = v.endsWith('rem') ? parseFloat(v) * parseFloat(getComputedStyle(document.documentElement).fontSize) : parseFloat(v) || 64;
  return px + 16;
};

/* ---------------------------------------------------------------- lightbox */
function lightbox(AC, img) {
  const rm = reduced(AC);
  const dlg = document.createElement('dialog');
  dlg.className = 'ac-lightbox';
  const cap = img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt || '';
  dlg.innerHTML = `<button class="ac-lightbox__close" type="button" aria-label="${AC.escapeHtml(AC.t('prose.close', 'Close'))}">${AC.icon('x')}</button>
    <figure class="ac-lightbox__fig"><img class="ac-lightbox__img" alt=""></figure>${cap ? `<p class="ac-lightbox__cap">${AC.escapeHtml(cap)}</p>` : ''}`;
  const big = dlg.querySelector('img');
  big.src = img.currentSrc || img.src; big.alt = img.alt;
  document.body.append(dlg);
  dlg.showModal();
  const from = img.getBoundingClientRect();
  const flip = () => {
    const to = big.getBoundingClientRect();
    if (!to.width || !from.width) return null;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${from.width / to.width})`;
  };
  const t = flip();
  if (rm || !t) big.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
  else big.animate([{ transform: t, borderRadius: '14px' }, { transform: 'none', borderRadius: '18px' }], { duration: 360, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' });
  dlg.animate([{ backgroundColor: 'rgb(0 0 0 / 0)' }, { backgroundColor: 'rgb(0 0 0 / 0.82)' }], { duration: 260, easing: 'ease-out', fill: 'both' });
  let closing = false;
  const close = async () => {
    if (closing) return; closing = true;
    const back = flip();
    const a = rm || !back
      ? big.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-in', fill: 'forwards' })
      : big.animate([{ transform: 'none' }, { transform: back }], { duration: 260, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'forwards' });
    dlg.animate([{ backgroundColor: 'rgb(0 0 0 / 0.82)' }, { backgroundColor: 'rgb(0 0 0 / 0)' }], { duration: 220, easing: 'ease-out', fill: 'forwards' });
    dlg.querySelector('.ac-lightbox__cap')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' });
    await a.finished.catch(() => {});
    dlg.close(); dlg.remove(); img.focus?.({ preventScroll: true });
  };
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('.ac-lightbox__close') || e.target === big) close(); });
}

/* ---------------------------------------------------------------- scroll to an in-page target (hash routers safe) */
function scrollToId(AC, root, id, { focus = true, flash = false, offset } = {}) {
  const target = id && (root.querySelector(`#${CSS.escape(id)}`) || document.getElementById(id));
  if (!target) return false;
  const top = target.getBoundingClientRect().top + scrollY - (offset ?? appbarOffset());
  scrollTo({ top, behavior: reduced(AC) ? 'auto' : 'smooth' });
  if (focus) { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  if (flash) target.animate([{ backgroundColor: 'var(--ac-accent-soft)' }, { backgroundColor: 'transparent' }], { duration: 1400, easing: 'ease-out' });
  return true;
}

/* ---------------------------------------------------------------- prose */
export function createProse(AC, el, cfg = {}) {
  cssOnce();
  const o = { lightbox: true, anchorUrl: null, offset: undefined, ...cfg };
  el.classList.add('ac-prose');
  let meta = { headings: [], words: 0, minutes: 1 };
  const mdOpts = () => ({ lang: AC.i18n?.lang || document.documentElement.lang || 'en', ...(o.markdownOptions || {}) });

  function enhance() {
    // raw HTML input: give tables a scroll region and pre blocks the code component
    el.querySelectorAll('table').forEach((t) => {
      if (t.parentElement.classList.contains('ac-prose__table')) return;
      const w = document.createElement('div'); w.className = 'ac-prose__table'; w.tabIndex = 0; w.setAttribute('role', 'region');
      t.before(w); w.append(t);
    });
    el.querySelectorAll('pre > code').forEach((c) => {
      const pre = c.parentElement;
      if (pre.closest('.ac-code')) return;
      const w = document.createElement('div'); w.className = 'ac-code ac-prose__code'; w.dataset.ac = 'code';
      const lang = /language-([\w+#.-]+)/.exec(c.className)?.[1]; if (lang) w.dataset.lang = lang;
      pre.before(w); w.append(pre);
    });
    el.querySelectorAll('img').forEach((img) => {
      if (img.closest('a') || !o.lightbox) return;
      img.classList.add('ac-prose__zoom'); img.tabIndex = 0; img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `${AC.t('prose.zoom', 'Zoom image')}: ${img.alt || ''}`.trim());
    });
    el.querySelectorAll('.ac-prose__table').forEach((w) => { if (!w.hasAttribute('aria-label')) w.setAttribute('aria-label', AC.t('prose.table', 'Table')); });
    if (!meta.words) {
      const words = (el.textContent.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’‌-]*/gu) || []).length;
      meta = { headings: [...el.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')].map((h) => ({ level: Number(h.tagName[1]), id: h.id, text: h.textContent.replace(/#$/, '').trim() })), words, minutes: readingTime(words) };
    }
    AC.scan?.(el);
    AC.emit?.(el, 'prose:render', meta);
  }

  function set(md) {
    const r = render(md, mdOpts());
    el.innerHTML = r.html;
    meta = { headings: r.headings, words: r.words, minutes: readingTime(r.words) };
    enhance();
    return meta;
  }
  function setHtml(html) { el.innerHTML = html; meta = { headings: [], words: 0, minutes: 1 }; enhance(); return meta; }

  const onClick = (e) => {
    const img = e.target.closest('img.ac-prose__zoom');
    if (img && el.contains(img)) { lightbox(AC, img); return; }
    const a = e.target.closest('a[href^="#"]');
    if (!a || !el.contains(a)) return;
    const href = a.getAttribute('href');
    if (href.startsWith('#/') || href === '#') return; // router links pass through
    e.preventDefault();
    const id = decodeURIComponent(href.slice(1));
    const isAnchor = a.classList.contains('ac-anchor');
    scrollToId(AC, el, id, { flash: a.closest('.ac-fnref, .ac-footnotes') != null, offset: o.offset });
    if (isAnchor) {
      AC.emit?.(el, 'prose:anchor', { id });
      const url = o.anchorUrl?.(id);
      if (url) { history.replaceState(history.state, '', url); AC.copyText?.(new URL(url, location.href).href).then((ok) => ok && AC.toast?.({ title: AC.t('prose.linkCopied', 'Link copied'), tone: 'success', duration: 1800 })); }
    }
  };
  const onKey = (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('img.ac-prose__zoom')) { e.preventDefault(); lightbox(AC, e.target); } };
  el.addEventListener('click', onClick);
  el.addEventListener('keydown', onKey);

  if (cfg.markdown != null) set(cfg.markdown);
  else if (cfg.html != null) setHtml(cfg.html);
  else enhance();

  return {
    el, set, setHtml,
    get headings() { return meta.headings; }, get words() { return meta.words; }, get minutes() { return meta.minutes; },
    scrollTo: (id) => scrollToId(AC, el, id, { offset: o.offset }),
    destroy() { el.removeEventListener('click', onClick); el.removeEventListener('keydown', onKey); },
  };
}

/* ---------------------------------------------------------------- article chrome: progress + TOC + scroll-spy */
export function createArticle(AC, el, cfg = {}) {
  cssOnce();
  const o = { progress: true, levels: [2, 3], offset: undefined, ...cfg };
  const content = typeof o.content === 'string' ? el.querySelector(o.content) : o.content || el.querySelector('.ac-prose');
  const tocEl = typeof o.toc === 'string' ? el.querySelector(o.toc) : o.toc;
  const offs = [];
  let bar; let links = []; let heads = []; let active = '';

  if (o.progress) {
    bar = document.createElement('div');
    bar.className = 'ac-readbar';
    bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-label', AC.t('prose.progress', 'Reading progress'));
    bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', '100');
    bar.innerHTML = '<span class="ac-readbar__fill"></span>';
    el.prepend(bar);
  }

  function buildToc() {
    if (!tocEl) return;
    heads = [...content.querySelectorAll(o.levels.map((l) => `h${l}[id]`).join(','))];
    const list = tocEl.querySelector('[data-toc-list]') || tocEl;
    if (!heads.length) { list.innerHTML = ''; tocEl.hidden = true; return; }
    tocEl.hidden = false;
    const min = Math.min(...heads.map((h) => Number(h.tagName[1])));
    list.innerHTML = `<span class="ac-toc__ind" aria-hidden="true"></span><ol class="ac-toc__list">${heads.map((h) => {
      const lvl = Number(h.tagName[1]) - min;
      const text = AC.escapeHtml(h.textContent.replace(/#\s*$/, '').trim());
      return `<li class="ac-toc__item" data-depth="${lvl}"><a class="ac-toc__link" href="#${AC.escapeHtml(h.id)}" data-id="${AC.escapeHtml(h.id)}" dir="auto">${text}</a></li>`;
    }).join('')}</ol>`;
    links = [...list.querySelectorAll('.ac-toc__link')];
    active = ''; spy();
  }

  function setActive(id) {
    if (id === active) return;
    active = id;
    let cur = null;
    for (const a of links) { const on = a.dataset.id === id; a.toggleAttribute('aria-current', on); if (on) { a.setAttribute('aria-current', 'location'); cur = a; } }
    const ind = tocEl?.querySelector('.ac-toc__ind');
    if (ind && cur) {
      const r = cur.getBoundingClientRect(); const pr = ind.parentElement.getBoundingClientRect();
      ind.style.setProperty('--_y', `${r.top - pr.top + ind.parentElement.scrollTop}px`);
      ind.style.setProperty('--_h', `${r.height}px`);
      ind.dataset.on = '';
      // keep the active entry visible inside a scrolling TOC
      const box = cur.closest('.ac-toc__scroll');
      if (box) { const br = box.getBoundingClientRect(); if (r.top < br.top || r.bottom > br.bottom) box.scrollTo({ top: box.scrollTop + r.top - br.top - br.height / 3, behavior: reduced(AC) ? 'auto' : 'smooth' }); }
    } else if (ind) delete ind.dataset.on;
    AC.emit?.(el, 'toc:change', { id });
  }

  function spy() {
    const off = (o.offset ?? appbarOffset()) + 8;
    if (bar) {
      const r = content.getBoundingClientRect();
      const total = r.height - innerHeight + off;
      const p = total <= 0 ? (r.top < innerHeight ? 1 : 0) : Math.min(1, Math.max(0, (off - r.top) / total));
      bar.style.setProperty('--p', p.toFixed(4));
      bar.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      bar.toggleAttribute('data-on', p > 0.002 && p < 0.999);
    }
    if (!heads.length) return;
    let id = heads[0].id;
    for (const h of heads) { if (h.getBoundingClientRect().top - off <= 1) id = h.id; else break; }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) id = heads[heads.length - 1].id;
    setActive(id);
  }
  const onScroll = AC.rafThrottle ? AC.rafThrottle(spy) : spy;
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  offs.push(() => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); });

  if (tocEl) {
    const onToc = (e) => {
      const a = e.target.closest('.ac-toc__link');
      if (!a) return;
      e.preventDefault();
      scrollToId(AC, content, a.dataset.id, { offset: o.offset });
      const d = tocEl.closest('details'); if (d && matchMedia('(max-width: 1023.98px)').matches) d.open = false;
    };
    tocEl.addEventListener('click', onToc);
    offs.push(() => tocEl.removeEventListener('click', onToc));
    // phones: collapsible; desktop: always open
    const d = tocEl.closest('details');
    if (d) {
      const mq = matchMedia('(min-width: 1024px)');
      const sync = () => { d.open = mq.matches; };
      sync(); mq.addEventListener('change', sync); offs.push(() => mq.removeEventListener('change', sync));
    }
  }
  buildToc();
  requestAnimationFrame(spy);

  return {
    refresh() { buildToc(); spy(); },
    get active() { return active; },
    destroy() { offs.forEach((f) => f()); bar?.remove(); },
  };
}

/* ---------------------------------------------------------------- install */
export function install(AC) {
  if (!AC || AC.prose) return;
  cssOnce();
  const md = (text, opts) => markdown(text, { lang: AC.i18n?.lang || 'en', ...opts });
  md.render = (text, opts) => render(text, { lang: AC.i18n?.lang || 'en', ...opts });
  md.safeUrl = safeUrl; md.slugify = slugify;
  AC.markdown = md;
  AC.readingTime = readingTime;
  AC.prose = (el, cfg) => { const api = createProse(AC, el, cfg); AC.instance?.(el, 'prose', api); return api; };
  AC.article = (el, cfg) => { const api = createArticle(AC, el, cfg); AC.instance?.(el, 'article', api); return api; };
  AC.register?.('prose', (el) => {
    const src = el.dataset.src;
    const api = AC.prose(el, {});
    if (src) {
      el.setAttribute('aria-busy', 'true');
      fetch(new URL(src, location.href), { cache: 'no-cache' }).then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status)))).then((t) => api.set(t))
        .catch(() => { el.innerHTML = `<p class="ac-text-muted">${AC.escapeHtml(AC.t('prose.loadError', 'Could not load the document.'))}</p>`; })
        .finally(() => el.removeAttribute('aria-busy'));
    }
    return () => api.destroy();
  });
}

if (typeof window !== 'undefined' && window.AC) install(window.AC);
