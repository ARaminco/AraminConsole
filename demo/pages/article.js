/* Article page — renders demo/content/sample-article.md with the prose module: reading progress, sticky TOC with
   scroll-spy, reading time, lightbox, share buttons, related posts and a local comments thread. */
import { posts, comments as seed, authors, tags, pick } from '../content/posts.js';

export default function mount(root, AC) {
  const $ = (s) => root.querySelector(s);
  const esc = AC.escapeHtml;
  const lang = () => AC.i18n.lang || 'fa';
  const offs = [];
  let prose; let article; let alive = true;

  const body = $('[data-article-body]');
  const minutesText = (m) => AC.t('prose.minRead', '{n} دقیقه مطالعه', { n: AC.format.number(m) });

  function paintMeta() {
    if (!prose) return;
    $('[data-article-read]').textContent = minutesText(prose.minutes);
    $('[data-article-minutes]').textContent = minutesText(prose.minutes);
    $('[data-article-date]').textContent = AC.format.date(new Date('2026-10-12T10:00:00'), { dateStyle: 'long' });
  }

  Promise.all([AC.use('prose'), fetch(new URL('content/sample-article.md', location.href), { cache: 'no-cache' }).then((r) => r.text())]).then(([, md]) => {
    if (!alive) return;
    prose = AC.prose(body, { markdown: md, anchorUrl: (id) => `#/article?h=${encodeURIComponent(id)}` });
    body.removeAttribute('aria-busy');
    // the first H1 becomes the article title (the page header owns it)
    const h1 = body.querySelector('h1');
    if (h1) { $('[data-article-title]').textContent = h1.textContent.replace(/#\s*$/, '').trim(); h1.remove(); }
    paintMeta();
    article = AC.article(root.querySelector('.ac-article'), { content: body, toc: $('[data-toc-list]') });
    AC.motion?.reveal?.(body);
    const h = new URLSearchParams(location.hash.split('?')[1] || '').get('h');
    if (h) requestAnimationFrame(() => prose.scrollTo(h));
  }).catch((err) => { body.innerHTML = `<p class="ac-text-danger">${esc(String(err))}</p>`; });

  // aside progress mirrors the reading bar
  const pct = $('[data-article-pct]'); const prog = $('[data-article-progress]');
  const syncPct = () => {
    const bar = root.querySelector('.ac-readbar');
    const v = bar ? Number(bar.getAttribute('aria-valuenow') || 0) : 0;
    pct.textContent = `${v}%`; prog.value = v;
  };
  const onScroll = AC.rafThrottle(syncPct);
  addEventListener('scroll', onScroll, { passive: true });
  offs.push(() => removeEventListener('scroll', onScroll));

  /* ---------------- share */
  const shareUrl = () => location.href;
  const title = () => $('[data-article-title]').textContent;
  const share = $('[data-article-share]');
  const links = {
    telegram: () => `https://t.me/share/url?url=${encodeURIComponent(shareUrl())}&text=${encodeURIComponent(title())}`,
    whatsapp: () => `https://wa.me/?text=${encodeURIComponent(`${title()} ${shareUrl()}`)}`,
    x: () => `https://x.com/intent/post?url=${encodeURIComponent(shareUrl())}&text=${encodeURIComponent(title())}`,
    linkedin: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl())}`,
  };
  share.querySelectorAll('a[data-share]').forEach((a) => { a.href = links[a.dataset.share](); });
  const native = share.querySelector('[data-share="native"]');
  native.hidden = !navigator.share;
  offs.push(AC.on(share, 'click', '[data-share]', async (e, b) => {
    const kind = b.dataset.share;
    if (kind in links) { b.href = links[kind](); return; }
    if (kind === 'native') { try { await navigator.share({ title: title(), url: shareUrl() }); } catch { /* cancelled */ } return; }
    if (kind === 'copy' && await AC.copyText(shareUrl())) {
      const label = b.querySelector('span');
      b.setAttribute('data-done', ''); label.textContent = AC.t('common.copied', 'کپی شد');
      b.querySelector('use').setAttribute('href', '#i-check');
      setTimeout(() => { b.removeAttribute('data-done'); label.textContent = AC.t('prose.copyLink', 'کپی پیوند'); b.querySelector('use').setAttribute('href', '#i-link'); }, 1600);
    }
  }));
  offs.push(AC.on($('[data-follow]'), 'click', (e, b) => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('ac-btn--primary', !on); b.classList.toggle('ac-btn--soft', on);
    b.querySelector('span').textContent = on ? AC.t('prose.following', 'دنبال می‌کنید') : AC.t('prose.follow', 'دنبال کردن');
    b.querySelector('use').setAttribute('href', on ? '#i-check' : '#i-user-plus');
  }));

  /* ---------------- related */
  function renderRelated() {
    $('[data-article-related]').innerHTML = posts.filter((p) => p.id !== 'rtl-admin').slice(0, 3).map((p) => postCard(AC, p, lang())).join('');
  }

  /* ---------------- comments (local only) */
  let thread = seed.map((c) => ({ ...c, replies: c.replies.map((r) => ({ ...r })) }));
  const likes = new Set();
  const count = (list) => list.reduce((n, c) => n + 1 + count(c.replies || []), 0);
  const commentHtml = (c, isNew) => {
    const a = authors[c.author] || authors.ali;
    const text = c.raw != null ? AC.markdown(c.raw, { headingIds: false, anchors: false }) : `<p>${esc(pick(c.text, lang()))}</p>`;
    const liked = likes.has(c.id);
    return `<li class="ac-comment"${isNew ? ' data-new' : ''} data-id="${c.id}">
      <span class="ac-avatar ac-avatar--sm" data-color="${a.color}" aria-hidden="true">${esc(a.initials)}</span>
      <div class="ac-comment__body">
        <div class="ac-comment__bubble">
          <div class="ac-comment__who"><b>${esc(pick(a.name, lang()))}</b><time datetime="${c.at}">${esc(AC.format.relative(new Date(c.at)))}</time></div>
          <div class="ac-comment__text ac-prose">${text}</div>
        </div>
        <div class="ac-comment__actions">
          <button type="button" data-like aria-pressed="${liked}"><svg class="ac-icon" aria-hidden="true"><use href="#i-heart"/></svg><bdi class="ac-num" dir="ltr">${c.likes + (liked ? 1 : 0)}</bdi></button>
          <button type="button" data-reply><svg class="ac-icon ac-flip-rtl" aria-hidden="true"><use href="#i-reply"/></svg><span>${esc(AC.t('prose.reply', 'پاسخ'))}</span></button>
        </div>
        ${c.replies?.length ? `<ol class="ac-comment-list">${c.replies.map((r) => commentHtml(r, r.isNew)).join('')}</ol>` : ''}
      </div></li>`;
  };
  function renderComments() {
    $('[data-comment-list]').innerHTML = thread.map((c) => commentHtml(c, c.isNew)).join('');
    $('[data-comment-count]').textContent = `(${count(thread)})`;
    thread.forEach((c) => { delete c.isNew; c.replies.forEach((r) => delete r.isNew); });
  }
  const find = (id, list = thread) => { for (const c of list) { if (c.id === id) return c; const r = find(id, c.replies || []); if (r) return r; } return null; };
  let replyTo = null;
  const form = $('[data-comment-form]'); const ta = form.querySelector('textarea');
  offs.push(AC.on($('[data-comment-list]'), 'click', '[data-like], [data-reply]', (e, b) => {
    const id = Number(b.closest('.ac-comment').dataset.id);
    if (b.hasAttribute('data-like')) {
      const c = find(id); if (!c) return;
      likes.has(id) ? likes.delete(id) : likes.add(id);
      b.setAttribute('aria-pressed', String(likes.has(id)));
      b.querySelector('bdi').textContent = c.likes + (likes.has(id) ? 1 : 0);
      AC.haptic?.(8);
    } else {
      const top = thread.find((c) => c.id === id || c.replies.some((r) => r.id === id));
      replyTo = top?.id ?? null;
      const who = pick((authors[find(id)?.author] || authors.ali).name, lang());
      ta.value = `@${who} `; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
      form.scrollIntoView({ block: 'center', behavior: AC.reducedMotion() ? 'auto' : 'smooth' });
    }
  }));
  offs.push(AC.on(form, 'submit', (e) => {
    e.preventDefault();
    const raw = ta.value.trim();
    if (!raw) { ta.focus(); return; }
    const c = { id: Date.now(), author: 'ali', at: new Date().toISOString(), likes: 0, raw, replies: [], isNew: true };
    const parent = replyTo != null && thread.find((x) => x.id === replyTo);
    if (parent && raw.startsWith('@')) parent.replies.push(c); else thread.push(c);
    replyTo = null; ta.value = '';
    renderComments();
    AC.toast?.({ title: AC.t('prose.commentSent', 'نظر شما ثبت شد'), tone: 'success' });
  }));

  renderRelated(); renderComments();
  offs.push(AC.on(document, 'ac:i18n:change', () => { paintMeta(); renderRelated(); renderComments(); }));

  return () => { alive = false; offs.forEach((f) => f()); article?.destroy(); prose?.destroy(); };
}

/** Blog card markup (shared with the blog page). */
export function postCard(AC, p, lang, { feature = false } = {}) {
  const esc = AC.escapeHtml;
  const a = authors[p.author];
  const href = p.slug ? `#/${p.slug}` : '#/article';
  return `<a class="ac-post-card${feature ? ' ac-post-card--feature' : ''}" href="${href}" data-tag="${p.tag}">
    <span class="ac-post-card__cover" data-cover="${p.cover}"><span class="ac-badge ac-badge--solid">${esc(pick(tags[p.tag], lang))}</span>${AC.icon(p.icon)}</span>
    <span class="ac-post-card__body">
      <h3 class="ac-post-card__title">${esc(pick(p.title, lang))}</h3>
      <p class="ac-post-card__excerpt">${esc(pick(p.excerpt, lang))}</p>
      <span class="ac-post-card__meta"><span class="ac-avatar" data-color="${a.color}" aria-hidden="true">${esc(a.initials)}</span>
        <span>${esc(pick(a.name, lang))}</span><span aria-hidden="true">·</span>
        <span>${esc(AC.t('prose.minRead', '{n} دقیقه مطالعه', { n: AC.format.number(p.minutes) }))}</span></span>
    </span></a>`;
}
