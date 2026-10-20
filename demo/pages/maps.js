/* Maps — management panel: branches list (search/filter → fly-to), live fleet on routes, geofence editor,
   order heatmap, add-location modal with the location picker. Phones: full-screen map + draggable bottom sheet. */
import { install } from '../../src/modules/maps/maps.js';
import { geoCities, geoVehicles, geoOrders } from '../data.js';

const TYPE_ICON = { branch: 'store', warehouse: 'warehouse', pickup: 'package', office: 'building-2' };
const STATUS_TONE = { open: 'success', busy: 'warning', closed: 'neutral' };
const phoneMQ = matchMedia('(max-width: 639.98px)');

function pageCSS() {
  if (document.querySelector('link[data-mp-css]')) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./maps.css', import.meta.url).href; l.dataset.mpCss = '';
  document.head.append(l);
}

export default function mount(root, AC) {
  pageCSS();
  install(AC);
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const t = (k, f, v) => AC.t(k, f, v);
  const esc = AC.escapeHtml;
  const L = (o) => (o && typeof o === 'object' ? o[AC.i18n.lang] || o.en || o.fa : o);
  const offs = [];
  const on = (...a) => offs.push(AC.on(...a));

  let city = AC.store.get('mp:city', 'tehran'); if (!geoCities[city]) city = 'tehran';
  let tab = 'places'; let type = ''; let status = ''; let q = ''; let follow = null; let paused = false;
  const extra = { tehran: [], dubai: [] }; // places added in this session

  /* ---------------- map */
  const places = () => [...geoCities[city].places, ...extra[city]];
  const geocoder = AC.map.geocoders.local(() => [
    ...places().map((p) => ({ label: L(p.name), sub: L(p.addr), lat: p.lat, lng: p.lng, keywords: `${p.name.fa} ${p.name.en} ${p.addr.fa} ${p.addr.en}` })),
    ...LANDMARKS,
  ]);
  AC.map.defaultGeocoder = geocoder;
  const mapEl = $('[data-mp-map]');
  const c0 = geoCities[city];
  const map = AC.map(mapEl, {
    center: c0.center, zoom: c0.zoom, minZoom: 3, maxZoom: 19,
    tiles: 'osm', // demo / light use only — see docs/maps.md (OSM tile usage policy); dark theme = CSS filter on the same tiles
    baseLayers: [
      { id: 'osm', label: 'OpenStreetMap' },
      { id: 'opentopomap', label: 'OpenTopoMap' },
      { id: 'none', label: () => t('mp.baseNone', 'بدون کاشی (شبکهٔ ساده)') },
    ],
    controls: ['search', 'layers', 'zoom', 'locate', 'fullscreen', 'draw', 'scale', 'coords'],
    geocoder, reverse: true, muted: true, label: t('nav.maps', 'نقشه'),
  });

  const placeMarker = (p) => ({ icon: TYPE_ICON[p.type], tone: p.status === 'closed' ? 'neutral' : p.type === 'warehouse' ? 'accent' : 'ink', title: L(p.name), drop: true, dropDelay: 0 });
  const placeCard = (p) => `<div class="mp-pop">
      <div class="mp-pop__head"><span class="mp-pop__icon" data-type="${p.type}">${AC.icon(TYPE_ICON[p.type])}</span><span><b>${esc(L(p.name))}</b><small>${esc(t(`mp.t.${p.type}`))}</small></span></div>
      <p class="mp-pop__addr">${esc(L(p.addr))}</p>
      <div class="mp-pop__meta"><span class="ac-badge ac-badge--dot ac-badge--${STATUS_TONE[p.status]}">${esc(t(`mp.st.${p.status}`))}</span>
        <span>${AC.icon('shopping-bag', 'ac-icon--sm')} <b class="ac-num">${AC.format.number(p.orders)}</b></span>
        <span>${AC.icon('users', 'ac-icon--sm')} <b class="ac-num">${AC.format.number(p.staff)}</b></span></div>
      <div class="mp-pop__coords" dir="ltr">${AC.map.utils.formatLatLng(p)}</div>
    </div>`;
  const placesLayer = map.cluster([], { radius: 70, maxZoom: 14, marker: placeMarker, popup: (p) => placeCard(p) });
  const routesLayer = map.group([]);
  const fleetLayer = map.group([]);
  const heatLayer = map.heatmap([], { radius: 24 }); heatLayer.setVisible(false);
  const draw = map.draw;
  const zonesLayer = map.group([]);
  map.addOverlay('places', () => t('mp.locations', 'مکان‌ها'), placesLayer, { icon: 'map-pinned' });
  map.addOverlay('routes', () => t('mp.routes', 'مسیرها'), routesLayer, { icon: 'route' });
  map.addOverlay('fleet', () => t('mp.live', 'ناوگان زنده'), fleetLayer, { icon: 'truck' });
  map.addOverlay('zones', () => t('mp.zones', 'محدوده‌ها'), zonesLayer, { icon: 'shapes' });
  map.addOverlay('heat', () => t('mp.heat', 'تراکم سفارش'), heatLayer, { icon: 'flame' });

  /* ---------------- fleet */
  let vehicles = [];
  function buildFleet() {
    fleetLayer.clear(); routesLayer.clear(); vehicles = [];
    const routes = geoCities[city].routes;
    routes.forEach((r, i) => {
      const moving = geoVehicles.some((v) => v.city === city && v.route === i && v.status === 'moving');
      routesLayer.add(map.polyline(r, { tone: moving ? 'ink' : 'neutral', casing: true, flow: moving, weight: 3, interactive: false }));
    });
    for (const v of geoVehicles.filter((x) => x.city === city)) {
      const pts = routes[v.route].map((p) => ({ lat: p[0], lng: p[1] }));
      const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + AC.map.utils.distance(pts[i - 1], pts[i]));
      const veh = { ...v, pts, cum, len: cum[cum.length - 1], pos: v.offset * cum[cum.length - 1] * 2, eta: 6 + Math.round(v.offset * 30) };
      const at = locate(veh);
      veh.marker = fleetLayer.add(map.marker(at.latlng, { kind: 'vehicle', icon: 'truck', label: v.id, title: `${v.id} — ${L(v.driver)}`, tone: v.status === 'moving' ? 'ink' : 'neutral', data: veh, onClick: () => followVehicle(veh) }));
      veh.marker.setHeading(at.heading);
      vehicles.push(veh);
    }
  }
  function locate(v) {
    const d2 = ((v.pos % (v.len * 2)) + v.len * 2) % (v.len * 2);
    const back = d2 > v.len; const d = back ? v.len * 2 - d2 : d2;
    let i = 1; while (i < v.cum.length - 1 && v.cum[i] < d) i++;
    const a = v.pts[i - 1]; const b = v.pts[i]; const seg = v.cum[i] - v.cum[i - 1] || 1; const k = (d - v.cum[i - 1]) / seg;
    const latlng = { lat: a.lat + (b.lat - a.lat) * k, lng: a.lng + (b.lng - a.lng) * k };
    const [p, q] = back ? [b, a] : [a, b];
    const heading = Math.atan2((q.lng - p.lng) * Math.cos(p.lat * Math.PI / 180), q.lat - p.lat) * 180 / Math.PI;
    return { latlng, heading };
  }
  let raf = 0; let last = 0; let listT = 0;
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(64, now - (last || now)); last = now;
    if (paused || document.hidden || !fleetLayer.visible) return;
    for (const v of vehicles) {
      if (v.status !== 'moving') continue;
      v.pos += (v.speed / 3.6) * 22 * (dt / 1000); // demo time ×22
      const at = locate(v); v.marker.setLatLng(at.latlng).setHeading(at.heading);
    }
    if (follow && !map._dragging && !map._pinching) map.setView(follow.marker.latlng, map.getZoom());
    if (now - listT > 1000) { listT = now; if (tab === 'fleet') renderFleet(true); }
  }
  function followVehicle(v) {
    follow = null;
    map.flyTo(v.marker.latlng, Math.max(map.getZoom(), 14));
    const off = map.on('moveend', () => { off(); follow = v; renderFleet(); });
    map.openPopup(v.marker.latlng, `<div class="mp-pop"><div class="mp-pop__head"><span class="mp-pop__icon" data-type="vehicle">${AC.icon('truck')}</span><span><b>${esc(v.id)}</b><small>${esc(L(v.driver))}</small></span></div>
      <div class="mp-pop__meta"><span class="ac-badge ac-badge--dot ac-badge--${v.status === 'moving' ? 'success' : v.status === 'idle' ? 'warning' : 'neutral'}">${esc(t(`mp.v.${v.status}`))}</span><span><b class="ac-num">${AC.format.number(v.speed)}</b> ${esc(t('mp.kmh', 'km/h'))}</span></div></div>`, { offset: -22, source: v.marker });
    if (phoneMQ.matches) sheet.snap(0);
  }
  on(mapEl, 'ac:map:movestart', () => {});
  map.on('movestart', () => { if (follow && (map._dragging || map._pinching || map._wheeling)) { follow = null; renderFleet(); } });

  /* ---------------- zones (draw features = editable geofences) */
  function buildZones() {
    draw.clear(); zonesLayer.layers = [];
    for (const z of geoCities[city].zones) addZone(z);
    zonesLayer.setVisible($('[data-mp-layer="zones"]').getAttribute('aria-pressed') === 'true');
  }
  function addZone(z) {
    const f = z.shape === 'circle' ? draw.add({ id: z.id, type: 'circle', center: z.center, radius: z.radius, tone: z.tone, props: { name: z.name } })
      : draw.add({ id: z.id, type: 'polygon', latlngs: z.latlngs, tone: z.tone, props: { name: z.name } });
    zonesLayer.layers.push(f.layer);
    return f;
  }
  map.on('draw:create', ({ feature }) => {
    if (feature.type !== 'polygon' && feature.type !== 'circle') return;
    const n = draw.list.length;
    const f = draw.features.get(feature.id); f.props.name = { fa: `محدودهٔ جدید ${n}`, en: `New zone ${n}`, ar: `منطقة جديدة ${n}` };
    zonesLayer.layers.push(f.layer);
    renderZones(); stats();
    AC.toast?.success(t('mp.zoneSaved', 'محدوده ذخیره شد'), L(f.props.name));
  });
  map.on('draw:edit', () => { if (tab === 'zones') renderZones(); });
  map.on('draw:delete', () => { renderZones(); stats(); });
  map.on('draw:select', ({ feature }) => { $$('[data-zone]').forEach((li) => li.toggleAttribute('data-active', li.dataset.zone === feature.id)); });
  map.on('draw:deselect', () => $$('[data-zone]').forEach((li) => li.removeAttribute('data-active')));

  /* ---------------- lists */
  const listEl = $('[data-mp-list]');
  function filtered() {
    const norm = (s) => String(s).toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    const qq = norm(q.trim());
    return places().filter((p) => (!type || p.type === type) && (!status || p.status === status)
      && (!qq || norm(`${p.name.fa} ${p.name.en} ${p.addr.fa} ${p.addr.en}`).includes(qq)));
  }
  function renderPlaces() {
    const list = filtered();
    placesLayer.setPoints(list);
    listEl.innerHTML = list.length ? list.map((p) => `<li><button type="button" class="mp-item" data-place="${p.id}">
        <span class="mp-item__icon" data-type="${p.type}" data-status="${p.status}">${AC.icon(TYPE_ICON[p.type])}</span>
        <span class="mp-item__main"><b>${esc(L(p.name))}</b><small>${esc(L(p.addr))}</small></span>
        <span class="mp-item__end"><span class="ac-badge ac-badge--dot ac-badge--${STATUS_TONE[p.status]}">${esc(t(`mp.st.${p.status}`))}</span><small class="ac-num">${AC.format.number(p.orders)} ${esc(t('mp.ordersShort', 'سفارش'))}</small></span>
      </button></li>`).join('')
      : `<li class="mp-empty"><div class="ac-empty"><div class="ac-empty__art">${AC.icon('map-pin')}</div><p class="ac-empty__text">${esc(t('mp.noPlaces', 'مکانی با این فیلترها پیدا نشد.'))}</p></div></li>`;
    stats();
  }
  function renderFleet(soft) {
    const box = $('[data-mp-fleet]');
    if (soft) { // only refresh numbers so focus/hover survive
      for (const v of vehicles) { const s = box.querySelector(`[data-veh="${v.id}"] [data-eta]`); if (s && v.status === 'moving') { v.eta = Math.max(1, Math.round(((v.len - (v.pos % v.len)) / (v.speed / 3.6)) / 60 / 4)); s.textContent = `${AC.format.number(v.eta)} ${t('mp.min', 'دقیقه')}`; } }
      return;
    }
    box.innerHTML = vehicles.map((v) => `<li><button type="button" class="mp-item" data-veh="${v.id}" ${follow?.id === v.id ? 'data-active' : ''}>
        <span class="mp-item__icon" data-type="vehicle" data-status="${v.status}">${AC.icon('truck')}</span>
        <span class="mp-item__main"><b class="ac-num">${esc(v.id)}</b><small>${esc(L(v.driver))}</small></span>
        <span class="mp-item__end"><span class="ac-badge ac-badge--dot ac-badge--${v.status === 'moving' ? 'success' : v.status === 'idle' ? 'warning' : 'neutral'}">${esc(t(`mp.v.${v.status}`))}</span>
        <small class="ac-num">${v.status === 'moving' ? `${AC.format.number(v.speed)} ${esc(t('mp.kmh', 'km/h'))} · <span data-eta>${AC.format.number(v.eta)} ${esc(t('mp.min', 'دقیقه'))}</span>` : '—'}</small></span>
      </button></li>`).join('');
  }
  function renderZones() {
    const box = $('[data-mp-zones]');
    const list = draw.list.filter((f) => f.type === 'polygon' || f.type === 'circle');
    box.innerHTML = list.map((f) => `<li data-zone="${f.id}" ${draw.sel?.id === f.id ? 'data-active' : ''}><div class="mp-item mp-item--zone">
        <span class="mp-item__icon" data-type="zone" data-tone="${f.layer.o.tone || 'accent'}">${AC.icon(f.type === 'circle' ? 'circle-dot' : 'pentagon')}</span>
        <span class="mp-item__main"><b>${esc(L(f.props.name) || f.id)}</b><small class="ac-num">${f.type === 'circle' ? `${esc(t('map.radius', AC.i18n.lang === 'fa' ? 'شعاع' : 'Radius'))} ${AC.map.utils.formatDistance(f.radius)} · ` : ''}${AC.map.utils.formatArea(f.area)}</small></span>
        <span class="mp-item__acts">
          <button type="button" class="ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost" data-zone-act="fly" aria-label="${esc(t('mp.show', 'نمایش'))}">${AC.icon('crosshair')}</button>
          <button type="button" class="ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost" data-zone-act="edit" aria-label="${esc(t('mp.edit', 'ویرایش'))}">${AC.icon('pencil')}</button>
          <button type="button" class="ac-btn ac-btn--sm ac-btn--icon ac-btn--ghost" data-zone-act="delete" aria-label="${esc(t('mp.delete', 'حذف'))}">${AC.icon('trash-2')}</button>
        </span></div></li>`).join('') || `<li class="mp-empty"><p class="ac-text-sm ac-text-muted">${esc(t('mp.noZones', 'هنوز محدوده‌ای ندارید.'))}</p></li>`;
  }
  function stats() {
    const pl = places();
    const set = (k, v) => { const el = $(`[data-mp-stat="${k}"]`); if (!el) return; if (el.hasAttribute('data-ac')) el.dataset.to = String(v); else el.textContent = AC.format.number(v); };
    const moving = vehicles.filter((v) => v.status === 'moving').length;
    const zones = draw.list.filter((f) => f.type !== 'point' && f.type !== 'line').length;
    set('places', pl.length); set('open', pl.filter((p) => p.status !== 'closed').length);
    set('moving', moving); set('fleet', vehicles.length); set('zones', zones);
    set('orders', pl.reduce((s, p) => s + p.orders, 0));
    $('[data-mp-othercity]').textContent = t(`mp.${city === 'tehran' ? 'dubai' : 'tehran'}`);
    $('[data-mp-summary]').innerHTML = `<b>${esc(t(`mp.${city}`))}</b><span>${AC.format.number(pl.length)} ${esc(t('mp.locShort', 'مکان'))}</span><span>${AC.format.number(moving)} ${esc(t('mp.movingShort', 'در حرکت'))}</span><span>${AC.format.number(zones)} ${esc(t('mp.zonesShort', 'محدوده'))}</span>`;
  }

  /* ---------------- city switch */
  function loadCity(next, fly = true) {
    city = next; AC.store.set('mp:city', city); follow = null;
    map.closePopup(); draw.cancel?.(true);
    heatLayer.setPoints(geoOrders(city));
    buildFleet(); buildZones(); renderPlaces(); renderFleet(); renderZones();
    const c = geoCities[city];
    if (fly) map.flyTo(c.center, c.zoom); else map.setView(c.center, c.zoom);
    AC.instance($('[data-mp-city]'), 'segmented')?.select(city === 'dubai' ? 1 : 0, true);
  }

  /* ---------------- interactions */
  on($('[data-mp-city]'), 'ac:segmented:change', (e) => loadCity(e.detail.value));
  on($('[data-mp-tab]'), 'ac:segmented:change', (e) => setTab(e.detail.value));
  function setTab(v) {
    tab = v; $$('[data-mp-pane]').forEach((p) => { p.hidden = p.dataset.mpPane !== v; });
    if (v === 'fleet') renderFleet(); if (v === 'zones') renderZones();
    if (phoneMQ.matches && sheet.index === 0) sheet.snap(1);
  }
  on($('[data-mp-q]'), 'input', AC.debounce((e) => { q = e.target.value; renderPlaces(); }, 150));
  on($('[data-mp-status]'), 'change', (e) => { status = e.target.value; renderPlaces(); });
  on($('[data-mp-types]'), 'click', '[data-type]', (e, b) => { type = b.dataset.type; $$('[data-mp-types] [data-type]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); renderPlaces(); });
  on(listEl, 'click', '[data-place]', (e, b) => {
    const p = places().find((x) => x.id === b.dataset.place); if (!p) return;
    $$('[data-place]').forEach((x) => x.toggleAttribute('data-active', x === b));
    if (phoneMQ.matches) sheet.snap(0);
    map.flyTo(p, 16);
    const off = map.on('moveend', () => { off(); map.openPopup(p, placeCard(p), { offset: -46 }); });
  });
  on($('[data-mp-fleet]'), 'click', '[data-veh]', (e, b) => { const v = vehicles.find((x) => x.id === b.dataset.veh); if (v) followVehicle(v); });
  on($('[data-mp-pause]'), 'click', (e, b) => {
    const btn = e.currentTarget || $('[data-mp-pause]'); paused = !paused; btn.setAttribute('aria-pressed', String(paused));
    btn.querySelector('use').setAttribute('href', `#i-${paused ? 'play' : 'pause'}`);
    btn.querySelector('span').textContent = t(paused ? 'mp.resume' : 'mp.pause', paused ? 'ادامهٔ زنده' : 'توقف زنده');
  });
  on($('[data-mp-zones]'), 'click', '[data-zone-act]', (e, b) => {
    const id = b.closest('[data-zone]').dataset.zone; const f = draw.get(id); if (!f) return;
    const act = b.dataset.zoneAct;
    if (act === 'fly' || act === 'edit') { map.fitBounds(f.layer.getBounds(), { padding: 70 }); if (phoneMQ.matches) sheet.snap(0); }
    if (act === 'edit') draw.select(id);
    if (act === 'delete') {
      const name = L(f.props.name);
      const snapshot = f.type === 'circle' ? { id, type: 'circle', center: f.center, radius: f.radius, tone: f.layer.o.tone, props: f.props } : { id, type: 'polygon', latlngs: f.latlngs, tone: f.layer.o.tone, props: f.props };
      draw.remove(id);
      AC.toast?.undo ? AC.toast.undo(t('mp.zoneDeleted', '{name} حذف شد', { name }), () => { const nf = draw.add(snapshot); zonesLayer.layers.push(nf.layer); renderZones(); stats(); }) : null;
    }
  });
  on($('[data-mp-zones]'), 'click', '[data-zone] .mp-item__main', (e, m) => { const id = m.closest('[data-zone]').dataset.zone; draw.select(id); });
  $$('[data-mp-newzone]').forEach((b) => on(b, 'click', () => { if (phoneMQ.matches) sheet.snap(0); setQuick('zones', true); draw.start(b.dataset.mpNewzone); }));

  function setQuick(id, v) {
    const b = $(`[data-mp-layer="${id}"]`); if (b) b.setAttribute('aria-pressed', String(v));
    map.setOverlay(id, v);
  }
  on(root, 'click', '[data-mp-layer]', (e, b) => setQuick(b.dataset.mpLayer, b.getAttribute('aria-pressed') !== 'true'));
  on(mapEl, 'ac:map:overlay', (e) => { const b = $(`[data-mp-layer="${e.detail.id}"]`); if (b) b.setAttribute('aria-pressed', String(e.detail.visible)); });

  /* ---------------- add location (modal + location picker) */
  const modalEl = $('#mp-add');
  on(root, 'click', '[data-mp-cityswap]', () => loadCity(city === 'tehran' ? 'dubai' : 'tehran'));
  on(root, 'click', '[data-mp-add]', (e, b) => {
    const form = $('[data-mp-form]'); form.reset();
    const pkEl = $('[data-mp-picker]'); const pk = AC.instance(pkEl, 'location-picker'); pk?.set(null);
    const c = map.getCenter(); pkEl.dataset.center = `${c.lat.toFixed(5)},${c.lng.toFixed(5)}`; pkEl.dataset.zoom = String(Math.max(12, Math.round(map.getZoom())));
    $('[data-mp-pick-err]').hidden = true;
    AC.modal.open(modalEl, b);
  });
  on(modalEl, 'click', '[data-mp-save]', () => {
    const form = modalEl.querySelector('[data-mp-form]'); const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim(); const lat = Number(fd.get('location[lat]')); const lng = Number(fd.get('location[lng]'));
    const nameEl = form.querySelector('#mp-name'); nameEl.toggleAttribute('aria-invalid', !name);
    modalEl.querySelector('[data-mp-pick-err]').hidden = !!fd.get('location[lat]');
    if (!name) { nameEl.focus(); return; }
    if (!fd.get('location[lat]')) return;
    const addr = String(fd.get('location[address]') || '');
    const p = { id: `x${Date.now()}`, type: fd.get('type'), status: fd.get('status'), name: { fa: name, en: name, ar: name }, addr: { fa: addr || '—', en: addr || '—', ar: addr || '—' }, lat, lng, orders: 0, staff: 1 };
    extra[city].push(p);
    AC.modal.close(modalEl);
    type = ''; status = ''; q = ''; $('[data-mp-q]').value = ''; $('[data-mp-status]').value = '';
    $$('[data-mp-types] [data-type]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.type === '')));
    renderPlaces();
    map.flyTo(p, 16);
    AC.toast?.success(t('mp.saved', 'مکان اضافه شد'), name);
  });

  /* ---------------- phone bottom sheet */
  const side = $('.mp-side');
  const sheet = {
    index: 0, y: 0,
    heights() {
      const H = innerHeight; const cs = getComputedStyle(document.documentElement);
      const rem = parseFloat(cs.fontSize) || 16; const tab = (parseFloat(cs.getPropertyValue('--ac-tabbar-h')) || 4) * rem + (parseFloat(cs.getPropertyValue('--ac-safe-bottom')) || 0);
      return [Math.round(tab + 136), Math.round(Math.max(tab + 220, H * 0.52)), Math.round(H * 0.86)];
    },
    apply(px, animate) {
      const H = this.heights()[2];
      side.classList.toggle('is-settling', !!animate && !AC.reducedMotion());
      side.style.transform = `translate3d(0,${Math.round(H - px)}px,0)`;
      this.y = px;
      const vis = Math.min(px, this.heights()[1]);
      mapEl.style.setProperty('--ac-map-pad-bottom', `${Math.round(Math.min(px, this.heights()[0]) - 6)}px`);
      map.setPadding({ bottom: Math.round(vis) });
    },
    snap(i) { this.index = i; this.apply(this.heights()[i], true); side.dataset.snap = String(i); },
  };
  let offSheet = null;
  function layout() {
    if (phoneMQ.matches) {
      root.classList.add('mp--phone');
      side.style.blockSize = `${sheet.heights()[2]}px`;
      sheet.snap(sheet.index);
      if (!offSheet) {
        offSheet = AC.gesture($('.mp-side__head').parentElement, {
          axis: 'y', threshold: 6,
          filter: (e) => !!e.target.closest('.mp-side__grip, .mp-side__head') && !e.target.closest('input, select, textarea'),
          onStart: () => { side.classList.remove('is-settling'); this0 = sheet.y; },
          onMove: (s) => { const hs = sheet.heights(); let y = this0 - s.dy; if (y > hs[2]) y = hs[2] + (y - hs[2]) * 0.25; if (y < hs[0]) y = hs[0] - (hs[0] - y) * 0.4; sheet.apply(y); },
          onEnd: (s) => {
            const hs = sheet.heights(); let i;
            if (s.vy < -0.5) i = Math.min(2, hs.findIndex((h) => h > sheet.y + 4) === -1 ? 2 : hs.findIndex((h) => h > sheet.y + 4));
            else if (s.vy > 0.5) { i = 0; for (let k = 2; k >= 0; k--) if (hs[k] < sheet.y - 4) { i = k; break; } }
            else i = hs.reduce((b, h, k) => (Math.abs(h - sheet.y) < Math.abs(hs[b] - sheet.y) ? k : b), 0);
            sheet.snap(i);
          },
        });
      }
    } else {
      root.classList.remove('mp--phone');
      side.style.transform = ''; side.style.blockSize = ''; side.classList.remove('is-settling');
      mapEl.style.removeProperty('--ac-map-pad-bottom'); map.setPadding({ bottom: 0 });
      offSheet?.(); offSheet = null;
    }
    map.invalidateSize();
  }
  let this0 = 0;
  on(phoneMQ, 'change', layout);
  on(window, 'resize', AC.rafThrottle(() => { if (phoneMQ.matches) { side.style.blockSize = `${sheet.heights()[2]}px`; sheet.snap(sheet.index); } }));
  on($('.mp-side__grip'), 'click', () => sheet.snap(sheet.index === 0 ? 1 : 0));

  on(document, 'ac:i18n:change', () => { renderPlaces(); renderFleet(); renderZones(); stats(); });

  layout();
  loadCity(city, false);
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf); offs.forEach((f) => f()); offSheet?.();
    if (AC.map.defaultGeocoder === geocoder) AC.map.defaultGeocoder = null;
    AC.instance(mapEl, 'map')?.destroy();
  };
}

const LANDMARKS = [
  { label: 'برج میلاد', sub: 'Milad Tower, Tehran', lat: 35.7448, lng: 51.3753, keywords: 'milad tower' },
  { label: 'میدان آزادی', sub: 'Azadi Square, Tehran', lat: 35.6997, lng: 51.3380, keywords: 'azadi square' },
  { label: 'فرودگاه مهرآباد', sub: 'Mehrabad Airport, Tehran', lat: 35.6892, lng: 51.3134, keywords: 'mehrabad airport' },
  { label: 'پارک ملت', sub: 'Mellat Park, Tehran', lat: 35.7797, lng: 51.4114, keywords: 'mellat park' },
  { label: 'Burj Khalifa', sub: 'برج خلیفه، دبی', lat: 25.1972, lng: 55.2744, keywords: 'برج خلیفه burj' },
  { label: 'Dubai Mall', sub: 'دبی مال', lat: 25.1985, lng: 55.2796, keywords: 'دبی مال mall' },
  { label: 'Dubai International Airport', sub: 'فرودگاه بین‌المللی دبی', lat: 25.2532, lng: 55.3657, keywords: 'dxb airport فرودگاه' },
  { label: 'Burj Al Arab', sub: 'برج العرب', lat: 25.1412, lng: 55.1853, keywords: 'برج العرب' },
];
