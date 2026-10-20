/* Uptime module — status-page style daily bars per service (oldest first; phones show the newest half).
   const u = AC.uptime(el, { rows: [{ name, uptime: 99.95, days: ['up'|'partial'|'down'|'none', …] }], labels: { up, partial, down } });
   u.set(rows) · u.destroy()  ·  data-ac="uptime" data-ac-config='{"rows":[…]}'  ·  install(AC) wires it into window.AC. */

function cssOnce() {
  if (typeof document === 'undefined' || document.querySelector('[data-ac-module="uptime"]')) return;
  try { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./uptime.css', import.meta.url).href; l.dataset.acModule = 'uptime'; document.head.append(l); } catch { /* bundled */ }
}

export function createUptime(AC, el, cfg = {}) {
  const esc = AC.escapeHtml;
  let rows = cfg.rows || [];
  const label = (d) => AC.t(`uptime.${d}`, (cfg.labels || {})[d] || d);
  const pct = (v) => `${AC.format.number(v, { decimals: 2 })}%`;
  el.classList.add('ac-uptime');
  function render() {
    el.innerHTML = rows.map((r) => {
      const n = r.days.length;
      return `<div class="ac-uptime__row">
        <div class="ac-uptime__label"><span class="ac-uptime__name">${esc(r.name)}</span><b class="ac-uptime__pct"><bdi>${pct(r.uptime)}</bdi></b></div>
        <div class="ac-uptime__bars" role="img" aria-label="${esc(`${r.name} — ${pct(r.uptime)}`)}">${r.days.map((d, i) => `<i data-s="${esc(d)}" title="${esc(`-${n - i}d · ${label(d)}`)}"></i>`).join('')}</div>
      </div>`;
    }).join('');
  }
  render();
  const off = AC.on(document, 'ac:i18n:change', render);
  return { el, set(next) { rows = next; render(); }, get rows() { return rows; }, destroy() { off(); } };
}

export function install(AC) {
  if (!AC || AC.uptime) return AC?.uptime;
  cssOnce();
  AC.uptime = (target, cfg) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    AC.instance(el, 'uptime')?.destroy?.();
    return AC.instance(el, 'uptime', createUptime(AC, el, cfg));
  };
  AC.register?.('uptime', (el) => { const api = createUptime(AC, el, AC.options ? AC.options(el, {}) : {}); AC.instance(el, 'uptime', api); return () => api.destroy(); });
  return AC.uptime;
}

if (typeof window !== 'undefined' && window.AC) install(window.AC);
