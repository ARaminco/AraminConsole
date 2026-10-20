// Tiny hash router: #/<name> loads pages/<name>.html into #ac-content.
// AraminConsole's MutationObserver starts every data-ac component in the injected HTML.
const view = document.getElementById('ac-content');
const cache = new Map();

async function load(name) {
  if (!cache.has(name)) {
    const res = await fetch(`pages/${name}.html`);
    cache.set(name, res.ok ? await res.text() : '<section class="ac-page"><div class="ac-empty"><h1 class="ac-empty__title">404</h1></div></section>');
  }
  return cache.get(name);
}

async function route() {
  const name = (location.hash.match(/^#\/([\w-]+)/) || [, 'dashboard'])[1];
  view.innerHTML = await load(name);
  document.querySelectorAll('a[href^="#/"]').forEach((a) =>
    a.getAttribute('href') === `#/${name}` ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  view.focus({ preventScroll: true });
  scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-action="theme"]')) AC.theme.toggle();
});
document.addEventListener('ac:form:submit', () => AC.toast({ title: 'Saved', tone: 'success' }));
addEventListener('hashchange', route);
route();
