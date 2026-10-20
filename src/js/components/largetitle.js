/* App bar scroll state + iOS-style large title.
   <header class="ac-appbar" data-ac="appbar" data-collapsed="true"> … <div class="ac-appbar__title"></div> … </header>
     → sets data-scrolled="true" once the page scrolls (hairline border appears).
   <header class="ac-page-head" data-ac="largetitle"> <h1 class="ac-page-head__title">…</h1> </header>
     → copies the title into .ac-appbar__title and sets data-collapsed on the app bar while the
       large title is scrolled under it (phones show the small title only then).
   Events: ac:largetitle:change { collapsed } on the app bar. */
import { register, on, emit, rafThrottle } from '../core.js';

register('appbar', (el) => {
  const update = rafThrottle(() => { el.dataset.scrolled = String(scrollY > 2); });
  update();
  return on(window, 'scroll', update, { passive: true });
});

register('largetitle', (el) => {
  const bar = document.querySelector('.ac-appbar');
  const title = el.matches('.ac-page-head__title, h1, h2') ? el : el.querySelector('.ac-page-head__title, h1');
  if (!bar || !title) return;
  const small = bar.querySelector('.ac-appbar__title');
  const sync = () => { if (small) small.textContent = title.textContent.trim(); };
  sync();
  bar.dataset.collapsed = 'false';

  let io;
  const watch = () => {
    io?.disconnect();
    const h = bar.getBoundingClientRect().height || 56;
    io = new IntersectionObserver(([entry]) => {
      const collapsed = !entry.isIntersecting && entry.boundingClientRect.top < h;
      if (bar.dataset.collapsed !== String(collapsed)) {
        bar.dataset.collapsed = String(collapsed);
        emit(bar, 'largetitle:change', { collapsed });
      }
    }, { rootMargin: `-${Math.round(h)}px 0px 0px 0px`, threshold: 0 });
    io.observe(title);
  };
  watch();
  const offResize = on(window, 'resize', rafThrottle(watch));
  const offLang = on(document, 'ac:i18n:change', () => requestAnimationFrame(sync));
  const mo = new MutationObserver(sync);
  mo.observe(title, { childList: true, characterData: true, subtree: true });

  return () => {
    io?.disconnect(); offResize(); offLang(); mo.disconnect();
    // without a large title the small one must stay visible
    bar.dataset.collapsed = 'true';
  };
});
