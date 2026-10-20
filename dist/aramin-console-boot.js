/*! AraminConsole v0.1.0 — boot — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
/* AraminConsole pre-paint boot (classic script, put it in <head> before the CSS):
   applies saved theme / accent / density / radius / rail / language before first paint,
   so there is no flash of the wrong theme or direction. Copied to dist/aramin-console-boot.js. */
(function () {
  var d = document.documentElement;
  function get(k, f) { try { var v = localStorage.getItem(k); if (v == null) return f; try { return JSON.parse(v); } catch (e) { return v; } } catch (e) { return f; } }
  var pref = get('ac:theme', 'light');
  var dark = pref === 'dark' || (pref === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  d.setAttribute('data-theme', dark ? 'dark' : 'light');
  d.setAttribute('data-accent', get('ac:accent', d.getAttribute('data-accent') || 'air'));
  d.setAttribute('data-density', get('ac:density', d.getAttribute('data-density') || 'comfortable'));
  d.setAttribute('data-radius', get('ac:radius', d.getAttribute('data-radius') || 'default'));
  var mp = get('ac:motion', d.getAttribute('data-motion-default') || 'system');
  d.setAttribute('data-motion', mp === 'full' || mp === 'reduced' ? mp : (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full'));
  if (get('ac:rail', '') === 'collapsed') d.setAttribute('data-rail', 'collapsed');
  var lang = get('ac:lang', null);
  if (lang) { d.lang = lang; d.dir = /^(fa|ar|he|ur|ps|ckb)/.test(lang) ? 'rtl' : 'ltr'; }
})();
