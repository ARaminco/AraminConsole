# Prose & Markdown

Module: `src/modules/prose/` (`prose.js`, `markdown.js`, `prose.css`). It ships in the full bundle and as `dist/modules/prose.{js,css}` for `AC.use('prose')`. It depends on `data-display` (code blocks reuse the code component). Demo: `#/article`, `#/docs` (this page), `#/blog`, `#/editor`. Tests: `node tests/prose.mjs` (no browser needed).

## Markdown → safe HTML

```js
const html = AC.markdown('# Hello **world**');              // string
const { html, headings, words } = AC.markdown.render(text, { lang: 'fa' });
```

```php
<?php
// Server side: render with your PHP library, then put the result inside the same class.
echo '<div class="ac-prose">' . $html . '</div>';
```

Supported: ATX and setext headings, paragraphs, hard breaks, `**strong**`, `*em*`, `~~strike~~`, `` `code` ``, fenced and indented code, block quotes, nested bullet / ordered / task lists, GFM tables with alignment, `---`, inline / reference / auto links, bare `https://` and `www.` links, images (an image alone in a paragraph becomes a `<figure>` with a caption), footnotes `[^1]`, callouts and containers:

```md
> [!NOTE]            note · tip · important · warning · caution · danger
> Body text

:::details Click to open
Hidden text
:::
```

Keyboard keys and a few inline tags work as bare tags only: `<kbd>Ctrl</kbd>`, `<sub>`, `<sup>`, `<mark>`, `<ins>`, `<del>`, `<s>`, `<small>`, `<abbr>`, `<br>`.

### Safety

- Every piece of text is escaped. Raw HTML is shown as text; there is no option to allow it. If you need HTML, clean it yourself on the server.
- Tags with attributes (`<kbd onclick=…>`) are text. Allowed bare tags are always closed and balanced.
- Links allow `http`, `https`, `mailto`, `tel` and relative URLs. Images allow `http(s)` and relative URLs; `data:image/png|jpeg|gif|webp` only with `allowDataImages: true`. The check runs after removing control characters and whitespace, so `java\tscript:` and `&#106;avascript:` are refused.
- External links get `target="_blank" rel="noopener noreferrer nofollow"`.
- Heading ids are generated from the text and never start with `ac-`, so they cannot clash with framework ids.

### Options

| Option | Default | Meaning |
|---|---|---|
| `lang` | UI language | Callout titles and footnote labels (`fa`, `en`, `ar`) |
| `labels` | — | Override any label: `{ note, tip, warning, footnotes, backref, anchor }` |
| `idPrefix` | `''` | Prefix for heading and footnote ids |
| `headingIds` / `anchors` | `true` | Ids on headings / the `#` link shown on hover |
| `link(href)` / `image(src)` | — | Rewrite URLs (for example docs links to router links). The result is still checked. |
| `codeComponent` | `true` | Emit `<div class="ac-code" data-ac="code">` (copy button + language label) |
| `linkTarget` | `'_blank'` | Target for external links (`''` to keep them in the tab) |

## Typography — `.ac-prose`

Put any long text inside `<div class="ac-prose">`. It sets the reading measure (about 70 characters), the heading scale, list markers, quotes, callouts, zebra tables that scroll sideways on phones, captions, footnotes and keyboard keys.

- Every paragraph, list item, heading and table cell finds its own direction (`unicode-bidi: plaintext`), so an English sentence in a Persian article lines up on the left. Code is always left-to-right.
- Persian numbers in ordered lists: `data-numerals="persian"` (or `"arabic"`) on the `.ac-prose` element or on one `<ol>`.
- A bigger first paragraph: `.ac-prose--lead`, or `.ac-lead` on one paragraph.

## Article chrome

```js
const prose = AC.prose(el, { markdown: text, anchorUrl: (id) => `#/article?h=${id}` });
const article = AC.article(rootEl, { content: el, toc: tocListEl });
prose.minutes;      // reading time (200 words a minute)
```

- `AC.prose(el, { markdown | html, lightbox: true, anchorUrl })` renders and enhances: heading anchors (a click scrolls and, with `anchorUrl`, copies the link), images open in a lightbox that grows from the picture, in-page links scroll smoothly without touching a hash router. API: `set(md)`, `setHtml(html)`, `scrollTo(id)`, `headings`, `words`, `minutes`, `destroy()`.
- `AC.article(el, { content, toc, progress: true, levels: [2, 3] })` adds the reading progress bar at the top of the window and builds the table of contents with scroll-spy (the active entry is marked `aria-current` and a small accent bar slides to it). Put the list inside `<details class="ac-toc">`: it stays open on desktop and collapses on phones. API: `refresh()`, `destroy()`.
- Declarative: `<div data-ac="prose" data-src="post.md"></div>` fetches and renders a file.
- Events: `ac:prose:render {headings, words, minutes}`, `ac:prose:anchor {id}`, `ac:toc:change {id}`.

Ready-made classes for the rest of an article page: `.ac-article` (main + sticky aside), `.ac-article__card`, `.ac-article__head/__title/__sub/__meta`, `.ac-tags > .ac-tag`, `.ac-share`, `.ac-author`, `.ac-pager > .ac-pager__link[data-dir=prev|next]`, `.ac-posts > .ac-post-card(--feature)`, `.ac-comments`, `.ac-compose`, `.ac-comment-list > .ac-comment`. Docs layout: `.ac-docs` with `.ac-docs__nav` (`details.ac-doctree`), `.ac-docs__main`, `.ac-docs__toc`. Editor: `.ac-mde` with `.ac-mde__bar`, `.ac-mde__tool`, `.ac-mde__panes`, `.ac-mde__src`, `.ac-mde__preview`, `.ac-mde__status` (`data-view="write|preview"` on phones).

## Motion

Reduced motion keeps fades and colour changes: the lightbox fades instead of growing, the table of contents switches without sliding, details panels fade open. Spatial movement uses `--ac-travel`, which is `0` under `data-motion="reduced"`.

## Auth animations (forms module)

The OTP and password inputs got framework-level feedback (see `docs/forms.md`):

- OTP: boxes stagger in, a typed digit pops, the focused box glows, a paste fills the boxes with a wave. `AC.instance(el,'otp').error({ clear })` shakes toward the start edge, tints red and vibrates; `.success()` turns the boxes green one by one and folds them into a check circle that draws itself (returns a promise); `.reset()`. Events `ac:otp:error`, `ac:otp:success`.
- Password: `data-checklist` shows rules that tick with a drawn check; the strength bars fill with a spring and change colour; the eye blinks when showing or hiding; a Caps Lock warning slides in (`data-caps="false"` turns it off).

Every one of these uses the Web Animations API with a reduced-motion version that keeps opacity and colour, because Windows with "Animation effects" off makes every browser report reduced motion.
