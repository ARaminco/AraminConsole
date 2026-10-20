/*! AraminConsole v0.1.0 — module maps — MIT © 2026 Ali Asghar Ramin — https://github.com/ARaminco/AraminConsole — icons: Lucide (ISC), font: Vazirmatn (OFL-1.1); see dist/LICENSE*.txt */
const __R = globalThis.__AC_MODS__ || (globalThis.__AC_MODS__ = {});
if (!__R["core"]) await import('./core.js');

/* ======== module: maps ======== */
if (!__R["maps"]) __R["maps"] = (() => {
const F = {};

/* ---- modules/maps/maps.js ---- */
const __ac_m1g = F["modules/maps/maps.js"] = (() => {
/* Maps module — a lightweight slippy-map engine (raster XYZ tiles, Web Mercator) with markers, clustering,
   popups, vectors, heatmap, GeoJSON, draw/edit, measure, geocoder search, locate, and a location-picker form control.
   const m = AC.map(el, { center: [35.6997, 51.338], zoom: 11, tiles: { light: 'carto-light', dark: 'carto-dark' } });
   <div data-ac="map" data-center="35.7,51.4" data-zoom="12" data-controls="zoom,locate,search"></div>
   <div data-ac="location-picker" data-name="branch"></div>
   Zero dependencies. No core imports: install(AC) wires AC.map / AC.map.pick and registers the components.
   See docs/maps.md (incl. tile & geocoder usage policies). */

const TILE = 256;
const MAX_LAT = 85.0511287798;
const D2R = Math.PI / 180;
const EARTH = 6378137;
const NODRAG = '.ac-map__ctl, .ac-map__corner > *, .ac-map-popup, .ac-map__hint, [data-map-nodrag]';
let AC = null;

/* ------------------------------------------------------------------ strings (fa / en / ar fallbacks; app dict key: map.<k>) */
const S = {
  fa: {
    label: 'نقشه', zoomIn: 'بزرگ‌نمایی', zoomOut: 'کوچک‌نمایی', fullscreen: 'تمام‌صفحه', exitFullscreen: 'خروج از تمام‌صفحه',
    locate: 'موقعیت من', locating: 'در حال یافتن موقعیت…', denied: 'دسترسی به موقعیت مسدود است', deniedText: 'اجازهٔ موقعیت مکانی را از تنظیمات مرورگر بدهید.',
    locateFail: 'موقعیت پیدا نشد', unsupported: 'مرورگر از موقعیت‌یابی پشتیبانی نمی‌کند', layers: 'لایه‌ها', base: 'نقشهٔ پایه', overlays: 'لایه‌های روی نقشه',
    search: 'جستجوی نشانی یا مکان…', noResults: 'نتیجه‌ای پیدا نشد', searching: 'در حال جستجو…', pressEnter: 'برای جستجو Enter بزنید',
    m: 'متر', km: 'کیلومتر', m2: 'متر مربع', ha: 'هکتار', km2: 'کیلومتر مربع', offline: 'کاشی‌های نقشه در دسترس نیست — نمای ساده',
    point: 'نقطه', line: 'خط / مسیر', polygon: 'چندضلعی', circle: 'دایره', measure: 'اندازه‌گیری فاصله', area: 'اندازه‌گیری مساحت', draw: 'ابزار ترسیم',
    del: 'حذف', finish: 'پایان', undo: 'برگرداندن', cancel: 'انصراف', copy: 'کپی مختصات', copied: 'کپی شد', loading: 'در حال بارگذاری…',
    unknown: 'نشانی نامشخص', pickTitle: 'انتخاب موقعیت', pickSub: 'نقشه را جابه‌جا کنید تا سنجاق روی محل دقیق قرار بگیرد.', pick: 'انتخاب روی نقشه',
    change: 'تغییر', confirm: 'تأیید این موقعیت', none: 'هنوز موقعیتی انتخاب نشده', total: 'مجموع', radius: 'شعاع',
    hintPoint: 'روی نقشه بزنید تا نقطه اضافه شود', hintLine: 'برای افزودن نقطه بزنید؛ دوبار کلیک یا «پایان» برای اتمام', hintPolygon: 'رأس‌ها را بزنید؛ با زدن نقطهٔ اول بسته می‌شود',
    hintCircle: 'مرکز را بزنید، سپس لبه را', hintEdit: 'دستگیره‌ها را بکشید', cluster: '{n} مکان', coords: 'مختصات', dms: 'نمایش درجه/دقیقه/ثانیه', near: 'نزدیک {place}',
  },
  en: {
    label: 'Map', zoomIn: 'Zoom in', zoomOut: 'Zoom out', fullscreen: 'Full screen', exitFullscreen: 'Exit full screen',
    locate: 'My location', locating: 'Finding your location…', denied: 'Location access is blocked', deniedText: 'Allow location in your browser settings.',
    locateFail: 'Location not found', unsupported: 'Geolocation is not supported', layers: 'Layers', base: 'Base map', overlays: 'Overlays',
    search: 'Search an address or place…', noResults: 'No results', searching: 'Searching…', pressEnter: 'Press Enter to search',
    m: 'm', km: 'km', m2: 'm²', ha: 'ha', km2: 'km²', offline: 'Map tiles unavailable — plain view',
    point: 'Point', line: 'Line / route', polygon: 'Polygon', circle: 'Circle', measure: 'Measure distance', area: 'Measure area', draw: 'Drawing tools',
    del: 'Delete', finish: 'Finish', undo: 'Undo', cancel: 'Cancel', copy: 'Copy coordinates', copied: 'Copied', loading: 'Loading…',
    unknown: 'Unknown address', pickTitle: 'Choose location', pickSub: 'Move the map so the pin sits on the exact spot.', pick: 'Choose on map',
    change: 'Change', confirm: 'Use this location', none: 'No location chosen yet', total: 'Total', radius: 'Radius',
    hintPoint: 'Tap the map to add a point', hintLine: 'Tap to add points; double-click or Finish to end', hintPolygon: 'Tap the corners; tap the first one to close',
    hintCircle: 'Tap the centre, then the edge', hintEdit: 'Drag the handles', cluster: '{n} places', coords: 'Coordinates', dms: 'Show degrees/minutes/seconds', near: 'Near {place}',
  },
  ar: {
    label: 'خريطة', zoomIn: 'تكبير', zoomOut: 'تصغير', fullscreen: 'ملء الشاشة', exitFullscreen: 'إنهاء ملء الشاشة',
    locate: 'موقعي', locating: 'جارٍ تحديد موقعك…', denied: 'الوصول إلى الموقع محظور', deniedText: 'اسمح بالموقع من إعدادات المتصفح.',
    locateFail: 'تعذر تحديد الموقع', unsupported: 'المتصفح لا يدعم تحديد الموقع', layers: 'الطبقات', base: 'الخريطة الأساسية', overlays: 'الطبقات الإضافية',
    search: 'ابحث عن عنوان أو مكان…', noResults: 'لا توجد نتائج', searching: 'جارٍ البحث…', pressEnter: 'اضغط Enter للبحث',
    m: 'م', km: 'كم', m2: 'م²', ha: 'هكتار', km2: 'كم²', offline: 'مربعات الخريطة غير متاحة — عرض مبسط',
    point: 'نقطة', line: 'خط / مسار', polygon: 'مضلع', circle: 'دائرة', measure: 'قياس المسافة', area: 'قياس المساحة', draw: 'أدوات الرسم',
    del: 'حذف', finish: 'إنهاء', undo: 'تراجع', cancel: 'إلغاء', copy: 'نسخ الإحداثيات', copied: 'تم النسخ', loading: 'جارٍ التحميل…',
    unknown: 'عنوان غير معروف', pickTitle: 'اختيار الموقع', pickSub: 'حرّك الخريطة ليستقر الدبوس على المكان الدقيق.', pick: 'اختر على الخريطة',
    change: 'تغيير', confirm: 'استخدم هذا الموقع', none: 'لم يتم اختيار موقع بعد', total: 'المجموع', radius: 'نصف القطر',
    hintPoint: 'انقر على الخريطة لإضافة نقطة', hintLine: 'انقر لإضافة نقاط؛ نقرتان أو «إنهاء» للانتهاء', hintPolygon: 'انقر على الزوايا؛ انقر الأولى للإغلاق',
    hintCircle: 'انقر المركز ثم الحافة', hintEdit: 'اسحب المقابض', cluster: '{n} أماكن', coords: 'الإحداثيات', dms: 'عرض درجات/دقائق/ثوانٍ', near: 'بالقرب من {place}',
  },
};
function tr(k, vars) {
  const lang = String(AC?.i18n?.lang || 'fa').split('-')[0];
  const fb = (S[lang] || S.en)[k] ?? S.en[k] ?? k;
  return AC?.t ? AC.t(`map.${k}`, fb, vars) : fb.replace(/\{(\w+)\}/g, (m, x) => vars?.[x] ?? m);
}

/* ------------------------------------------------------------------ geo utilities */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduced = () => (AC?.reducedMotion ? AC.reducedMotion() : matchMedia('(prefers-reduced-motion: reduce)').matches);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (n, c = '') => (AC?.icon ? AC.icon(n, c) : '');

/** Normalise [lat, lng] | {lat, lng} | {lat, lon} | "lat,lng" → {lat, lng} */
function ll(v) {
  if (v == null) return null;
  if (typeof v === 'string') { const [a, b] = v.split(',').map(Number); return { lat: a, lng: b }; }
  if (Array.isArray(v)) return { lat: +v[0], lng: +v[1] };
  return { lat: +v.lat, lng: +(v.lng ?? v.lon) };
}
function project(lat, lng, z) {
  if (typeof lat === 'object') { z = lng; ({ lat, lng } = lat); }
  const s = TILE * 2 ** z;
  const sin = Math.sin(clamp(lat, -MAX_LAT, MAX_LAT) * D2R);
  return { x: ((lng + 180) / 360) * s, y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * s };
}
function unproject(x, y, z) {
  const s = TILE * 2 ** z;
  const n = Math.PI - (2 * Math.PI * y) / s;
  return { lat: Math.atan(Math.sinh(n)) / D2R, lng: (x / s) * 360 - 180 };
}
/** Great-circle distance in metres. */
function distance(a, b) {
  a = ll(a); b = ll(b);
  const dLat = (b.lat - a.lat) * D2R; const dLng = (b.lng - a.lng) * D2R;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
}
const pathLength = (pts) => pts.reduce((s, p, i) => (i ? s + distance(pts[i - 1], p) : 0), 0);
/** Geodesic polygon area in m² (spherical excess approximation). */
function area(pts) {
  pts = pts.map(ll);
  if (pts.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]; const b = pts[(i + 1) % pts.length];
    s += (b.lng - a.lng) * D2R * (2 + Math.sin(a.lat * D2R) + Math.sin(b.lat * D2R));
  }
  return Math.abs((s * EARTH * EARTH) / 2);
}
function bounds(points) {
  const b = { s: 90, w: 180, n: -90, e: -180 };
  for (const p of points) { const q = ll(p); b.s = Math.min(b.s, q.lat); b.n = Math.max(b.n, q.lat); b.w = Math.min(b.w, q.lng); b.e = Math.max(b.e, q.lng); }
  return b;
}
const mpp = (lat, z) => (40075016.686 * Math.cos(lat * D2R)) / (TILE * 2 ** z);
/** Coordinates — always Latin digits. mode 'dec' | 'dms' */
function formatLatLng(p, mode = 'dec') {
  p = ll(p);
  if (mode !== 'dms') return `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
  const part = (v, pos, neg) => {
    const a = Math.abs(v); let d = Math.floor(a); let m = Math.floor((a - d) * 60); let s = ((a - d) * 60 - m) * 60;
    if (s >= 59.95) { s = 0; m += 1; } if (m >= 60) { m = 0; d += 1; }
    return `${d}°${String(m).padStart(2, '0')}′${s.toFixed(1).padStart(4, '0')}″${v >= 0 ? pos : neg}`;
  };
  return `${part(p.lat, 'N', 'S')} ${part(p.lng, 'E', 'W')}`;
}
const num = (n, d = 0) => (AC?.format ? AC.format.number(n, { maximumFractionDigits: d }) : n.toFixed(d));
function formatDistance(m) { return m < 1000 ? `${num(Math.round(m))} ${tr('m')}` : `${num(m / 1000, m < 10000 ? 2 : 1)} ${tr('km')}`; }
function formatArea(a) {
  if (a < 1e4) return `${num(Math.round(a))} ${tr('m2')}`;
  if (a < 1e6) return `${num(a / 1e4, 2)} ${tr('ha')}`;
  return `${num(a / 1e6, 2)} ${tr('km2')}`;
}

/* ------------------------------------------------------------------ tile providers */
const OSM_ATTR = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
const providers = {
  osm: { name: 'OpenStreetMap', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19, attribution: OSM_ATTR, darkFilter: true },
  opentopomap: { name: 'OpenTopoMap', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', subdomains: 'abc', maxZoom: 17, attribution: `${OSM_ATTR}, SRTM | © <a href="https://opentopomap.org" target="_blank" rel="noopener">OpenTopoMap</a> (CC-BY-SA)`, darkFilter: true },
  /* CARTO basemaps: answered with an "API KEY REQUIRED" image when checked on 2026-10-20 — use them only with a CARTO account
     (set the URL your account gives you via providers.register); see docs/maps.md. */
  'carto-light': { name: 'CARTO Positron', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', subdomains: 'abcd', retina: true, maxZoom: 20, attribution: `${OSM_ATTR} © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>` },
  'carto-dark': { name: 'CARTO Dark Matter', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', subdomains: 'abcd', retina: true, maxZoom: 20, attribution: `${OSM_ATTR} © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>` },
  'carto-voyager': { name: 'CARTO Voyager', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', subdomains: 'abcd', retina: true, maxZoom: 20, attribution: `${OSM_ATTR} © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>`, darkFilter: true },
  none: { name: 'Grid', url: null, attribution: '' },
};
/** Register a provider. url: template with {z}{x}{y}{s}{r}{key}, or a function (z, x, y, { retina }) → url | Promise<url> (e.g. a fetch with an
    API-key header turned into a blob URL). Iranian providers (Neshan, Map.ir) plug in here — see docs/maps.md. */
providers.register = (id, p) => { Object.defineProperty(providers, id, { value: p, enumerable: true, configurable: true, writable: true }); return p; };
Object.defineProperty(providers, 'register', { enumerable: false });

/* ------------------------------------------------------------------ geocoders */
const geocoders = {
  /** Nominatim (OSM). Policy: max 1 request/second, identify your app (email), NO autocomplete — so live:false (search on Enter only).
      Heavy use → run your own Nominatim or use a commercial geocoder. https://operations.osmfoundation.org/policies/nominatim/ */
  nominatim({ url = 'https://nominatim.openstreetmap.org', email, countrycodes, viewbox } = {}) {
    let last = 0;
    const wait = async () => { const d = 1100 - (Date.now() - last); if (d > 0) await new Promise((r) => setTimeout(r, d)); last = Date.now(); };
    const q = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v != null && v !== '')).toString();
    return {
      live: false,
      async search(text, { signal, lang } = {}) {
        await wait();
        const r = await fetch(`${url}/search?${q({ q: text, format: 'jsonv2', limit: 6, 'accept-language': lang, countrycodes, viewbox, email })}`, { signal });
        const j = await r.json();
        return j.map((x) => ({ label: x.name || x.display_name.split(',')[0], sub: x.display_name, lat: +x.lat, lng: +x.lon, bbox: x.boundingbox && { s: +x.boundingbox[0], n: +x.boundingbox[1], w: +x.boundingbox[2], e: +x.boundingbox[3] } }));
      },
      async reverse(lat, lng, { signal, lang } = {}) {
        await wait();
        const r = await fetch(`${url}/reverse?${q({ lat, lon: lng, format: 'jsonv2', 'accept-language': lang, email })}`, { signal });
        const j = await r.json();
        return j && j.display_name ? { label: j.name || j.display_name.split(',')[0], sub: j.display_name } : null;
      },
    };
  },
  /** Offline geocoder over your own list: [{ label, sub, lat, lng, keywords }]. live:true (search as you type). */
  local(items, { max = 6 } = {}) {
    const norm = (s) => String(s || '').toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ');
    const list = () => (typeof items === 'function' ? items() : items);
    return {
      live: true,
      async search(text) {
        const q = norm(text).trim(); if (!q) return [];
        return list().filter((x) => norm(`${x.label} ${x.sub || ''} ${x.keywords || ''}`).includes(q)).slice(0, max);
      },
      async reverse(lat, lng) {
        let best = null; let bd = Infinity;
        for (const x of list()) { const d = distance([lat, lng], x); if (d < bd) { bd = d; best = x; } }
        if (!best) return null;
        return { label: bd < 150 ? best.label : tr('near', { place: best.label }), sub: best.sub || '' };
      },
    };
  },
};

/* ------------------------------------------------------------------ layers */
let lid = 0;
class Layer {
  constructor(o = {}) { this.o = o; this.id = `l${++lid}`; this.map = null; this.visible = o.visible !== false; this.data = o.data; this._handlers = {}; }
  addTo(map) { map.addLayer(this); return this; }
  remove() { this.map?.removeLayer(this); return this; }
  on(t, fn) { (this._handlers[t] ||= []).push(fn); return this; }
  _fire(t, d) { (this._handlers[t] || []).forEach((f) => f(d, this)); }
  setVisible(v) { this.visible = !!v; this._vis?.(); this.map?._fire('layer', { layer: this, visible: this.visible }); return this; }
  bindPopup(content, o) { this._popup = { content, o }; return this; }
  _click(e, latlng) {
    this._fire('click', { latlng, event: e });
    if (this.o.onClick) this.o.onClick(this, e);
    if (this._popup) this.openPopup();
  }
  openPopup() {
    if (!this._popup || !this.map) return;
    const c = typeof this._popup.content === 'function' ? this._popup.content(this) : this._popup.content;
    this.map.openPopup(this.popupAnchor?.() || this.center?.() , c, { offset: this.popupOffset ?? 0, ...this._popup.o, source: this });
  }
}

/* ---- markers ---------------------------------------------------- */
function pinHTML(o) {
  const kind = o.kind || 'pin';
  if (o.html) return o.html;
  if (kind === 'dot') return '<span class="ac-map-dot"></span>';
  if (kind === 'me') return '<span class="ac-map-me"><i></i></span>';
  if (kind === 'vehicle') return `<span class="ac-map-veh"><span class="ac-map-veh__dir"></span><span class="ac-map-veh__body">${icon(o.icon || 'truck')}</span>${o.label ? `<span class="ac-map-veh__label">${esc(o.label)}</span>` : ''}</span>`;
  if (kind === 'cluster') return `<span class="ac-map-cluster" data-size="${o.count >= 50 ? 'lg' : o.count >= 10 ? 'md' : 'sm'}"><b>${num(o.count)}</b></span>`;
  if (kind === 'label') return `<span class="ac-map-label">${o.text ?? ''}</span>`;
  if (kind === 'vertex') return '<span class="ac-map-handle"></span>';
  return `<span class="ac-map-pin"><svg class="ac-map-pin__shape" viewBox="0 0 32 42" aria-hidden="true"><path d="M16 41.2S3 27.6 3 16.4a13 13 0 0 1 26 0C29 27.6 16 41.2 16 41.2z"/></svg><span class="ac-map-pin__icon">${o.icon ? icon(o.icon) : '<i></i>'}</span></span><span class="ac-map-pin__shadow"></span>`;
}
class Marker extends Layer {
  constructor(latlng, o = {}) { super(o); this.latlng = ll(latlng); this.popupOffset = o.popupOffset ?? ((o.kind || 'pin') === 'pin' ? -46 : -18); }
  center() { return this.latlng; }
  _add(map) {
    const o = this.o; const kind = o.kind || 'pin';
    const el = document.createElement('div');
    el.className = `ac-map-marker${o.className ? ` ${o.className}` : ''}`;
    el.dataset.kind = kind; el.dataset.mapLayer = this.id;
    if (o.tone) el.dataset.tone = o.tone;
    if (o.zIndex) el.style.zIndex = o.zIndex;
    const interactive = o.interactive !== false && !['label', 'vertex'].includes(kind);
    if (interactive) { el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', o.title || o.label || tr('point')); }
    else el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="ac-map-marker__in">${pinHTML(o)}</div>`;
    this.el = el; this.inner = el.firstElementChild;
    map._floatPane(kind).append(el);
    this._pos();
    this._vis();
    if (o.drop && !reduced()) {
      this.inner.animate([{ transform: 'translateY(-38px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: 0.55 }, { transform: 'translateY(-7px)', offset: 0.75 }, { transform: 'translateY(0)' }],
        { duration: 520, delay: o.dropDelay || 0, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    }
    if (o.draggable) this._drag();
  }
  _remove() { this._offDrag?.(); this.el?.remove(); this.el = null; }
  _vis() { if (this.el) this.el.hidden = !this.visible; }
  _pos() { if (!this.el || !this.map) return; const p = this.map._fp(this.latlng); this.el.style.transform = `translate3d(${p.x}px,${p.y}px,0)`; }
  setLatLng(v) { this.latlng = ll(v); this._pos(); if (this.map?._popup?.source === this) this.map._popup.setLatLng(this.latlng); return this; }
  setHeading(deg) { const d = this.el?.querySelector('.ac-map-veh__dir'); if (d) d.style.transform = `rotate(${deg}deg)`; return this; }
  setTone(t) { this.o.tone = t; if (this.el) this.el.dataset.tone = t; return this; }
  _drag() {
    const m = this.map; let off = null;
    this.el.dataset.mapNodrag = '';
    this._offDrag = AC.gesture(this.el, {
      threshold: 3,
      onStart: () => { this.el.dataset.dragging = ''; const p = m._fp(this.latlng); off = null; return p; },
      onMove: (s) => {
        const pt = m._evPt(s.event);
        if (!off) { const cur = m.latLngToPoint(this.latlng); off = { x: cur.x - (pt.x - s.dx), y: cur.y - (pt.y - s.dy) }; }
        this.setLatLng(m.pointToLatLng({ x: pt.x + off.x, y: pt.y + off.y }));
        this._fire('drag', { latlng: this.latlng });
      },
      onEnd: () => { delete this.el.dataset.dragging; this._fire('dragend', { latlng: this.latlng }); m._emit('marker:dragend', { marker: this, latlng: this.latlng, data: this.data }); },
    });
  }
  _click(e, latlng) { super._click(e, latlng); this.map?._emit('marker:click', { marker: this, data: this.data, latlng: this.latlng }); }
}

/* ---- vector paths (one shared SVG) --------------------------------------- */
class Path extends Layer {
  /** type 'line' | 'polygon' | 'circle'. latlngs: [p…] or rings [[p…]…]; circle: center + o.radius (m). */
  constructor(type, latlngs, o = {}) {
    super(o); this.type = type;
    if (type === 'circle') { this._c = ll(latlngs); this.radius = o.radius || 100; }
    else this.setLatLngs(latlngs, true);
  }
  setLatLngs(v, silent) {
    const nested = Array.isArray(v?.[0]) && (Array.isArray(v[0][0]) || typeof v[0][0] === 'object');
    this.rings = (nested ? v : [v]).map((r) => r.map(ll));
    if (!silent) this._redraw();
    return this;
  }
  get latlngs() { return this.rings[0]; }
  center() {
    if (this.type === 'circle') return this._c;
    const pts = this.rings.flat(); const b = bounds(pts); return { lat: (b.s + b.n) / 2, lng: (b.w + b.e) / 2 };
  }
  setCenter(c) { this._c = ll(c); this._redraw(); return this; }
  setRadius(r) { this.radius = r; this._redraw(); return this; }
  getBounds() {
    if (this.type !== 'circle') return bounds(this.rings.flat());
    const dLat = this.radius / 111320; const dLng = dLat / Math.cos(this._c.lat * D2R);
    return { s: this._c.lat - dLat, n: this._c.lat + dLat, w: this._c.lng - dLng, e: this._c.lng + dLng };
  }
  _add(map) {
    const o = this.o; const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `ac-map-shape ac-map-shape--${this.type}${o.flow ? ' ac-map-shape--flow' : ''}${o.dash ? ' ac-map-shape--dash' : ''}${o.className ? ` ${o.className}` : ''}`);
    g.dataset.tone = o.tone || 'ink';
    if (o.casing) { this.case = document.createElementNS(NS, 'path'); this.case.setAttribute('class', 'ac-map-shape__case'); g.append(this.case); }
    this.path = document.createElementNS(NS, 'path');
    this.path.setAttribute('class', 'ac-map-shape__path');
    if (o.interactive !== false) { this.path.dataset.mapLayer = this.id; g.dataset.interactive = ''; }
    if (o.weight) g.style.setProperty('--_w', `${o.weight}px`);
    if (o.color) g.style.setProperty('--_c', o.color);
    if (o.fillOpacity != null) g.style.setProperty('--_fo', o.fillOpacity);
    g.append(this.path);
    this.el = g;
    map._svgG.append(g);
    this._redraw(); this._vis();
  }
  _remove() { this.el?.remove(); this.el = null; }
  _vis() { if (this.el) this.el.style.display = this.visible ? '' : 'none'; }
  _redraw() {
    if (!this.el || !this.map) return;
    const m = this.map; let d = '';
    if (this.type === 'circle') {
      const c = m._vpx(this._c); const r = Math.max(1, this.radius / mpp(this._c.lat, m._vz));
      d = `M${(c.x - r).toFixed(1)},${c.y.toFixed(1)}a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(2 * r).toFixed(1)},0a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-2 * r).toFixed(1)},0Z`;
    } else {
      for (const ring of this.rings) {
        if (!ring.length) continue;
        d += `M${ring.map((p) => { const q = m._vpx(p); return `${q.x.toFixed(1)},${q.y.toFixed(1)}`; }).join('L')}${this.type === 'polygon' ? 'Z' : ''}`;
      }
    }
    this.path.setAttribute('d', d || 'M0,0');
    this.case?.setAttribute('d', d || 'M0,0');
  }
  _click(e, latlng) { super._click(e, latlng); this.map?._emit('shape:click', { shape: this, data: this.data, latlng }); }
  popupAnchor() { return this._lastClick || this.center(); }
}

/* ---- heatmap (canvas) ---------------------------------------------------- */
const HEAT_STOPS = [[0, 'rgba(255,196,120,0)'], [0.25, 'rgba(255,190,110,.75)'], [0.5, '#ff8a3d'], [0.75, '#f0532d'], [1, '#a8201a']];
class Heat extends Layer {
  constructor(points, o = {}) { super({ radius: 26, blur: 0.85, opacity: 0.8, ...o }); this.points = points.map((p) => (Array.isArray(p) ? { lat: p[0], lng: p[1], w: p[2] ?? 1 } : { lat: p.lat, lng: p.lng ?? p.lon, w: p.w ?? p.weight ?? 1 })); }
  setPoints(p) { this.points = p.map((x) => (Array.isArray(x) ? { lat: x[0], lng: x[1], w: x[2] ?? 1 } : x)); this._redraw(); return this; }
  _add(map) {
    this.el = document.createElement('canvas'); this.el.className = 'ac-map__heat'; this.el.setAttribute('aria-hidden', 'true');
    map._overlay.append(this.el);
    const r = this.o.radius; const tpl = document.createElement('canvas'); tpl.width = tpl.height = r * 2;
    const tc = tpl.getContext('2d'); const g = tc.createRadialGradient(r, r, r * (1 - this.o.blur), r, r, r);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); tc.fillStyle = g; tc.fillRect(0, 0, r * 2, r * 2);
    this._tpl = tpl;
    const pc = document.createElement('canvas'); pc.width = 256; pc.height = 1; const px = pc.getContext('2d'); const lg = px.createLinearGradient(0, 0, 256, 0);
    HEAT_STOPS.forEach(([s, c]) => lg.addColorStop(s, c)); px.fillStyle = lg; px.fillRect(0, 0, 256, 1);
    this._pal = px.getImageData(0, 0, 256, 1).data;
    map._frames.add(this); this._redraw(); this._vis();
  }
  _remove() { this.map?._frames.delete(this); this.el?.remove(); this.el = null; }
  _vis() { if (this.el) this.el.hidden = !this.visible; }
  _redraw() {
    const m = this.map; if (!m || !this.el || !this.visible || !m.w) return;
    const dpr = Math.min(2, devicePixelRatio || 1); const W = Math.round(m.w * dpr); const H = Math.round(m.h * dpr);
    if (this.el.width !== W || this.el.height !== H) { this.el.width = W; this.el.height = H; this.el.style.width = `${m.w}px`; this.el.style.height = `${m.h}px`; }
    const ctx = this.el.getContext('2d', { willReadFrequently: true }); ctx.clearRect(0, 0, W, H);
    const r = this.o.radius; const cell = r / 2; const grid = new Map(); let max = 0;
    for (const p of this.points) {
      const q = m.latLngToPoint(p); if (q.x < -r || q.y < -r || q.x > m.w + r || q.y > m.h + r) continue;
      const k = `${Math.floor(q.x / cell)}:${Math.floor(q.y / cell)}`; const c = grid.get(k) || { x: 0, y: 0, w: 0, n: 0 };
      c.x += q.x * p.w; c.y += q.y * p.w; c.w += p.w; c.n++; grid.set(k, c); max = Math.max(max, c.w);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const c of grid.values()) { ctx.globalAlpha = clamp(c.w / (max * 0.7), 0.06, 1); ctx.drawImage(this._tpl, c.x / c.w - r, c.y / c.w - r); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (grid.size) {
      const img = ctx.getImageData(0, 0, W, H); const d = img.data; const pal = this._pal;
      for (let i = 3; i < d.length; i += 4) { const a = d[i]; if (!a) continue; const j = a * 4; d[i - 3] = pal[j]; d[i - 2] = pal[j + 1]; d[i - 1] = pal[j + 2]; d[i] = Math.min(255, pal[j + 3] * this.o.opacity * 1.2); }
      ctx.putImageData(img, 0, 0);
    }
    const C = m._cpx(); this._ref = { z: m.zoom, ox: C.x - m.w / 2, oy: C.y - m.h / 2 };
    m._frame(this);
  }
}

/* ---- group, GeoJSON ------------------------------------------------------ */
class Group extends Layer {
  constructor(layers = [], o) { super(o); this.layers = layers; }
  add(l) { this.layers.push(l); if (this.map) { this.map.addLayer(l); l.setVisible(this.visible); } return l; }
  clear() { this.layers.forEach((l) => l.remove()); this.layers = []; return this; }
  _add(map) { this.layers.forEach((l) => { map.addLayer(l); if (!this.visible) l.setVisible(false); }); }
  _remove() { this.layers.forEach((l) => l.remove()); }
  _vis() { this.layers.forEach((l) => l.setVisible(this.visible)); }
  getBounds() { return bounds(this.layers.flatMap((l) => { const b = l.getBounds ? l.getBounds() : bounds([l.latlng]); return [[b.s, b.w], [b.n, b.e]]; })); }
}
function geojsonLayers(gj, o = {}) {
  const out = [];
  const style = (f) => (typeof o.style === 'function' ? o.style(f) : o.style) || {};
  const pt = (c) => [c[1], c[0]];
  const add = (geom, f) => {
    if (!geom) return;
    const st = { ...style(f), data: f?.properties };
    const c = geom.coordinates;
    const pop = (l) => { if (o.popup) l.bindPopup(() => o.popup(f, l)); o.onEach?.(f, l); out.push(l); };
    switch (geom.type) {
      case 'Point': pop(o.point ? o.point(f, pt(c)) : (f?.properties?.radius ? new Path('circle', pt(c), { ...st, radius: f.properties.radius }) : new Marker(pt(c), st))); break;
      case 'MultiPoint': c.forEach((p) => add({ type: 'Point', coordinates: p }, f)); break;
      case 'LineString': pop(new Path('line', c.map(pt), st)); break;
      case 'MultiLineString': pop(new Path('line', c.map((r) => r.map(pt)), st)); break;
      case 'Polygon': pop(new Path('polygon', c.map((r) => r.map(pt)), st)); break;
      case 'MultiPolygon': c.forEach((poly) => pop(new Path('polygon', poly.map((r) => r.map(pt)), st))); break;
      case 'GeometryCollection': geom.geometries.forEach((g) => add(g, f)); break;
      default: break;
    }
  };
  if (gj.type === 'FeatureCollection') gj.features.forEach((f) => add(f.geometry, f));
  else if (gj.type === 'Feature') add(gj.geometry, gj);
  else add(gj, null);
  return out;
}

/* ---- grid clustering ----------------------------------------------------- */
class Cluster extends Layer {
  /** points: [{ id, lat, lng, ...data }]; o.marker(p) → Marker options; o.radius (px), o.maxZoom (no clustering above). */
  constructor(points, o = {}) { super({ radius: 64, maxZoom: 17, ...o }); this.points = points; this.items = new Map(); this.z = null; }
  setPoints(p) { this.points = p; this._rebuild(true); return this; }
  _add(map) { this._rebuild(true); }
  _remove() { this.items.forEach((it) => it.marker.remove()); this.items.clear(); this.z = null; }
  _vis() { this.items.forEach((it) => it.marker.setVisible(this.visible)); }
  _redraw() { this._rebuild(false); }
  _compute(z) {
    const groups = new Map(); const cs = this.o.radius;
    const cluster = z <= this.o.maxZoom;
    for (const p of this.points) {
      const q = project(p.lat, p.lng, z);
      const k = cluster ? `${Math.floor(q.x / cs)}:${Math.floor(q.y / cs)}` : p.id;
      const g = groups.get(k); if (g) g.members.push(p); else groups.set(k, { members: [p] });
    }
    const out = new Map();
    for (const g of groups.values()) {
      if (g.members.length === 1) { const p = g.members[0]; out.set(`p:${p.id}`, { key: `p:${p.id}`, members: g.members, lat: p.lat, lng: p.lng }); continue; }
      const lat = g.members.reduce((s, p) => s + p.lat, 0) / g.members.length; const lng = g.members.reduce((s, p) => s + p.lng, 0) / g.members.length;
      const key = `c:${z}:${g.members.map((p) => p.id).sort().join(',')}`;
      out.set(key, { key, members: g.members, lat, lng });
    }
    return out;
  }
  _rebuild(force) {
    const m = this.map; if (!m) return;
    const z = Math.floor(m.zoom + 1e-6);
    if (!force && z === this.z) return;
    const prevZ = this.z; const prev = this.items; const next = this._compute(z);
    const anim = prevZ != null && prevZ !== z && !reduced() && !force;
    const memberOf = (map) => { const r = new Map(); map.forEach((it) => it.members.forEach((p) => r.set(p.id, it))); return r; };
    const prevBy = memberOf(prev);
    const nextItems = new Map();
    for (const [key, it] of next) {
      const old = prev.get(key);
      if (old) { nextItems.set(key, { ...it, marker: old.marker }); prev.delete(key); continue; }
      const single = it.members.length === 1;
      const mk = new Marker([it.lat, it.lng], single
        ? { ...(this.o.marker ? this.o.marker(it.members[0]) : {}), data: it.members[0] }
        : { kind: 'cluster', count: it.members.length, title: tr('cluster', { n: num(it.members.length) }), onClick: () => this._zoomTo(it) });
      if (single && this.o.popup) mk.bindPopup(() => this.o.popup(it.members[0], mk));
      if (!this.visible) mk.visible = false;
      m.addLayer(mk);
      nextItems.set(key, { ...it, marker: mk });
      if (anim && z > prevZ) { // split: fly out from the parent cluster
        const from = prevBy.get(it.members[0].id);
        if (from) {
          const a = m.latLngToPoint(from); const b = m.latLngToPoint(it);
          mk.inner.animate([{ transform: `translate(${a.x - b.x}px,${a.y - b.y}px) scale(.5)`, opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' });
        }
      } else if (anim) mk.inner.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, delay: 120, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    }
    const nextBy = memberOf(nextItems);
    for (const it of prev.values()) {
      if (anim && z < prevZ) { // merge: slide into the new parent, then go
        const to = nextBy.get(it.members[0].id);
        if (to && it.marker.inner) {
          const a = m.latLngToPoint(it); const b = m.latLngToPoint(to);
          const ani = it.marker.inner.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${b.x - a.x}px,${b.y - a.y}px) scale(.5)`, opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
          ani.onfinish = () => it.marker.remove();
          continue;
        }
      }
      it.marker.remove();
    }
    this.items = nextItems; this.z = z;
  }
  _zoomTo(it) {
    const m = this.map; const b = bounds(it.members);
    if (b.n - b.s < 1e-6 && b.e - b.w < 1e-6) { m.flyTo([b.s, b.w], Math.min(m.maxZoom, m.zoom + 2)); return; }
    m.fitBounds(b, { padding: 64, maxZoom: Math.max(m.zoom + 1, Math.min(m.maxZoom, this.o.maxZoom + 1)) });
  }
}

/* ------------------------------------------------------------------ popup */
class Popup {
  constructor(map) {
    this.map = map;
    const el = document.createElement('div'); el.className = 'ac-map-popup'; el.dataset.state = 'closed'; el.dataset.mapNodrag = '';
    el.innerHTML = `<div class="ac-map-popup__box" role="dialog"><button class="ac-map-popup__close" type="button" aria-label="${esc(tr('cancel'))}">${icon('x')}</button><div class="ac-map-popup__body"></div></div>`;
    this.el = el; this.body = el.querySelector('.ac-map-popup__body');
    el.querySelector('.ac-map-popup__close').addEventListener('click', () => map.closePopup());
    map._floatPane('popup').append(el);
  }
  setLatLng(v) { this.latlng = ll(v); this._pos(); }
  _pos() { if (!this.latlng) return; const p = this.map._fp(this.latlng); this.el.style.transform = `translate3d(${p.x}px,${p.y + (this.offset || 0)}px,0)`; }
  open(latlng, content, o = {}) {
    this.source = o.source || null; this.offset = o.offset || 0;
    this.body.replaceChildren();
    if (content instanceof Node) this.body.append(content); else this.body.innerHTML = content ?? '';
    this.el.classList.toggle('ac-map-popup--wide', !!o.wide);
    this.el.firstElementChild.dir = document.documentElement.dir || 'ltr';
    AC.i18n?.translate?.(this.body);
    this.setLatLng(latlng);
    this.el.dataset.state = 'closing'; void this.el.offsetWidth; this.el.dataset.state = 'open';
    if (o.autoPan !== false) requestAnimationFrame(() => this._autoPan());
    this.map._emit('popup:open', { latlng: this.latlng, source: this.source });
  }
  close() {
    if (this.el.dataset.state !== 'open') return;
    this.el.dataset.state = 'closing';
    clearTimeout(this._t); this._t = setTimeout(() => { if (this.el.dataset.state === 'closing') this.el.dataset.state = 'closed'; }, 160);
    this.map._emit('popup:close', { source: this.source }); this.source = null;
  }
  _autoPan() {
    const box = this.el.firstElementChild.getBoundingClientRect(); const r = this.map.vp.getBoundingClientRect(); const pad = 16;
    let dx = 0; let dy = 0;
    if (box.top < r.top + pad + 56) dy = box.top - r.top - pad - 56;
    if (box.left < r.left + pad) dx = box.left - r.left - pad; else if (box.right > r.right - pad) dx = box.right - r.right + pad;
    if (dx || dy) this.map.panBy(dx, dy);
  }
}

/* ------------------------------------------------------------------ the map */
const DEFAULTS = {
  center: [35.6997, 51.338], zoom: 11, minZoom: 2, maxZoom: 19, tiles: 'osm',
  controls: ['zoom', 'fullscreen', 'locate', 'scale'], interactive: true, wheel: true, keyboard: true, inertia: true,
  geocoder: null, reverse: false, label: null, baseLayers: null, muted: false,
};
const listOpt = (v) => (Array.isArray(v) ? v : String(v || '').split(/[\s,]+/).filter(Boolean));

class MapView {
  constructor(el, opts = {}) {
    const o = { ...DEFAULTS, ...opts };
    if (typeof o.center === 'string') o.center = ll(o.center);
    this.o = o; this.el = el;
    this.center = ll(o.center); this.minZoom = +o.minZoom; this.maxZoom = +o.maxZoom; this.zoom = clamp(+o.zoom, this.minZoom, this.maxZoom);
    this.layers = new Set(); this._byId = new Map(); this._frames = new Set(); this._levels = new Map(); this._ev = {}; this._offs = [];
    this.w = 0; this.h = 0; this._movers = 0; this._ptrs = new Map(); this.pad = { top: 0, right: 0, bottom: 0, left: 0 };
    this.overlays = []; this._failed = 0; this._loaded = 0; this._coordMode = 'dec';
    this._build();
    this._setTilesSpec(o.tiles, true);
    this._wire();
    this._controls(listOpt(o.controls));
    this._ro = new ResizeObserver(() => this.invalidateSize());
    this._ro.observe(this.vp);
    this.invalidateSize();
    requestAnimationFrame(() => this._emit('ready', { map: this }));
  }

  /* ---------- DOM */
  _build() {
    const el = this.el;
    el.classList.add('ac-map');
    if (!this.o.interactive) el.dataset.static = '';
    if (this.o.muted) el.dataset.muted = '';
    el.innerHTML = `<div class="ac-map__viewport" tabindex="0" role="region" aria-roledescription="map">
      <div class="ac-map__grid" aria-hidden="true"></div><div class="ac-map__tiles" aria-hidden="true"></div>
      <div class="ac-map__overlay"><svg class="ac-map__svg" width="1" height="1" aria-hidden="true"><g></g></svg></div>
      <div class="ac-map__float"><div class="ac-map__pane" data-pane="shape"></div><div class="ac-map__pane" data-pane="marker"></div><div class="ac-map__pane" data-pane="vehicle"></div><div class="ac-map__pane" data-pane="handle"></div><div class="ac-map__pane" data-pane="popup"></div></div>
    </div>
    <div class="ac-map__corner" data-pos="top-start"></div><div class="ac-map__corner" data-pos="top-end"></div>
    <div class="ac-map__corner" data-pos="bottom-start"></div><div class="ac-map__corner" data-pos="bottom-end"></div>
    <div class="ac-map__notice" role="status" hidden>${icon('wifi-off')}<span></span></div>`;
    const q = (s) => el.querySelector(s);
    this.vp = q('.ac-map__viewport'); this._grid = q('.ac-map__grid'); this._tilesEl = q('.ac-map__tiles');
    this._overlay = q('.ac-map__overlay'); this._svg = q('.ac-map__svg'); this._svgG = this._svg.firstElementChild; this._float = q('.ac-map__float');
    this.corner = (p) => q(`.ac-map__corner[data-pos="${p}"]`);
    this._notice = q('.ac-map__notice');
    this._label();
    this._vz = this.zoom; this._vo = { x: 0, y: 0 }; this._fz = null; this._fo = { x: 0, y: 0 };
  }
  _label() { this.vp.setAttribute('aria-label', this.o.label || tr('label')); this._notice.querySelector('span').textContent = tr('offline'); }
  _floatPane(kind) {
    const pane = { vehicle: 'vehicle', me: 'vehicle', vertex: 'handle', label: 'handle', popup: 'popup', cluster: 'marker' }[kind] || 'marker';
    return this._float.querySelector(`[data-pane="${pane}"]`);
  }

  /* ---------- events */
  on(t, fn) { (this._ev[t] ||= []).push(fn); return () => this.off(t, fn); }
  off(t, fn) { this._ev[t] = (this._ev[t] || []).filter((f) => f !== fn); }
  _fire(t, d) { (this._ev[t] || []).forEach((f) => { try { f(d, this); } catch (e) { console.error(e); } }); }
  _emit(t, d = {}) { this._fire(t, d); return AC.emit(this.el, `map:${t}`, { map: this, ...d }); }

  /* ---------- geometry helpers */
  _cpx() { return project(this.center, this.zoom); }
  _evPt(e) { const r = this._rect || (this._rect = this.vp.getBoundingClientRect()); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  latLngToPoint(p) { p = ll(p); const C = this._cpx(); const q = project(p.lat, p.lng, this.zoom); return { x: q.x - C.x + this.w / 2, y: q.y - C.y + this.h / 2 }; }
  pointToLatLng(pt) { const C = this._cpx(); return unproject(C.x + pt.x - this.w / 2, C.y + pt.y - this.h / 2, this.zoom); }
  _fp(p) { const q = project(p.lat, p.lng, this._fz ?? this.zoom); return { x: q.x - this._fo.x, y: q.y - this._fo.y }; }
  _vpx(p) { const q = project(p.lat, p.lng, this._vz); return { x: q.x - this._vo.x, y: q.y - this._vo.y }; }
  _setCenterPx(x, y, z = this.zoom) {
    const world = TILE * 2 ** z; const hh = this.h / 2;
    y = world > this.h ? clamp(y, hh, world - hh) : world / 2;
    this.center = unproject(x, y, z);
    if (this.center.lng > 180 || this.center.lng < -180) this.center.lng = ((((this.center.lng + 180) % 360) + 360) % 360) - 180;
  }
  _panPx(dx, dy) { const C = this._cpx(); this._setCenterPx(C.x + dx, C.y + dy); }
  _anchor(latlng, pt, z) { this.zoom = clamp(z, this.minZoom, this.maxZoom); const P = project(latlng.lat, latlng.lng, this.zoom); this._setCenterPx(P.x - (pt.x - this.w / 2), P.y - (pt.y - this.h / 2)); }
  _padCenter(latlng, z) { const P = project(latlng.lat, latlng.lng, z); return unproject(P.x + (this.pad.right - this.pad.left) / 2, P.y + (this.pad.bottom - this.pad.top) / 2, z); }
  get bounds() { const a = this.pointToLatLng({ x: 0, y: this.h }); const b = this.pointToLatLng({ x: this.w, y: 0 }); return { s: a.lat, w: a.lng, n: b.lat, e: b.lng }; }

  /* ---------- render loop: transforms only */
  _requestRender() { if (!this._raf) this._raf = requestAnimationFrame(() => { this._raf = 0; this._render(); }); }
  _render() {
    if (!this.w) return;
    const z = this.zoom; const C = this._cpx(); const hw = this.w / 2; const hh = this.h / 2;
    for (const l of this._levels.values()) { const s = 2 ** (z - l.z); l.el.style.transform = `translate3d(${(l.ox * s - C.x + hw).toFixed(2)}px,${(l.oy * s - C.y + hh).toFixed(2)}px,0) scale(${s})`; }
    const gs = 2 ** (z - Math.floor(z)); const cell = 64 * gs;
    this._grid.style.transform = `translate3d(${(-(((C.x - hw) % cell) + cell) % cell).toFixed(2)}px,${(-(((C.y - hh) % cell) + cell) % cell).toFixed(2)}px,0) scale(${gs})`;
    if (z !== this._fz) { this._fz = z; this._fo = { x: Math.round(C.x - hw), y: Math.round(C.y - hh) }; this._floaters(); }
    this._float.style.transform = `translate3d(${(this._fo.x - C.x + hw).toFixed(2)}px,${(this._fo.y - C.y + hh).toFixed(2)}px,0)`;
    const vs = 2 ** (z - this._vz);
    this._svg.style.transform = `translate3d(${(this._vo.x * vs - C.x + hw).toFixed(2)}px,${(this._vo.y * vs - C.y + hh).toFixed(2)}px,0) scale(${vs})`;
    this._frames.forEach((f) => this._frame(f, C));
    this._updateTiles(false);
    this._fire('move', { center: this.center, zoom: z });
  }
  _frame(f, C = this._cpx()) {
    if (!f.el || !f._ref) return;
    const s = 2 ** (this.zoom - f._ref.z);
    f.el.style.transform = `translate3d(${(f._ref.ox * s - C.x + this.w / 2).toFixed(2)}px,${(f._ref.oy * s - C.y + this.h / 2).toFixed(2)}px,0) scale(${s})`;
  }
  _floaters() {
    for (const l of this.layers) l._pos?.();
    this._popup?._pos();
    this.draw?._pos();
  }
  _mover(d) {
    const was = this._movers; this._movers = Math.max(0, this._movers + d);
    if (!was && this._movers) { clearTimeout(this._idleT); if (!this._moving) { this._moving = true; this.el.dataset.moving = ''; this._fire('movestart'); } }
    if (was && !this._movers) { clearTimeout(this._idleT); this._idleT = setTimeout(() => { if (!this._movers) this._idle(); }, 70); }
  }
  _idle() {
    this._moving = false; delete this.el.dataset.moving;
    this._render();
    this._updateTiles(true);
    const C = this._cpx(); this._vz = this.zoom; this._vo = { x: Math.round(C.x - this.w / 2), y: Math.round(C.y - this.h / 2) };
    for (const l of this.layers) l._redraw?.();
    this.draw?._redraw();
    this._render();
    this._updScale();
    const zc = this._lastIdleZ !== this.zoom; this._lastIdleZ = this.zoom;
    this._emit('moveend', { center: { ...this.center }, zoom: this.zoom });
    if (zc) this._emit('zoomend', { zoom: this.zoom });
    this._zoomBtns();
  }

  /* ---------- tiles */
  _setTilesSpec(spec, silent) { this._tilesSpec = spec; this._applyTheme(silent); }
  _resolveProvider() {
    const dark = document.documentElement.dataset.theme === 'dark';
    let spec = this._tilesSpec;
    if (spec && typeof spec === 'object' && !spec.url && (spec.light || spec.dark)) spec = dark ? (spec.dark || spec.light) : (spec.light || spec.dark);
    const p = typeof spec === 'string' ? providers[spec] : spec;
    return { id: typeof spec === 'string' ? spec : 'custom', p: p || providers.osm, dark };
  }
  _applyTheme(silent) {
    const { id, p, dark } = this._resolveProvider();
    this.el.toggleAttribute('data-dark-filter', !!(dark && p.darkFilter));
    if (p === this._prov) return;
    this._prov = p; this.baseId = id;
    for (const l of this._levels.values()) this._dropLevel(l);
    this._levels.clear(); this._tz = null; this._failed = 0; this._loaded = 0; this._notice.hidden = true;
    this.el.toggleAttribute('data-no-tiles', !p.url);
    this._attrib();
    if (!silent) { this._updateTiles(true); this._render(); this._emit('base:change', { id }); }
  }
  setTiles(spec) { this._setTilesSpec(spec, false); this._layersPanel?.(); return this; }
  _tileUrl(z, x, y) {
    const p = this._prov; const n = 2 ** z; const xw = ((x % n) + n) % n;
    if (typeof p.url === 'function') return p.url(z, xw, y, { retina: devicePixelRatio > 1 });
    const sd = p.subdomains || ''; const s = sd ? sd[(xw + y) % sd.length] : '';
    return p.url.replace('{z}', z).replace('{x}', xw).replace('{y}', y).replace('{s}', s).replace('{r}', p.retina && devicePixelRatio > 1 ? '@2x' : '').replace('{key}', p.key || '');
  }
  _updateTiles(idle) {
    const p = this._prov; if (!p?.url || !this.w) return;
    const now = performance.now();
    let z = clamp(Math.round(this.zoom), p.minZoom ?? 0, p.maxZoom ?? 19);
    if (!idle && this._tz != null && z !== this._tz && now - (this._tzT || 0) < 300) z = this._tz; // throttle level switches while moving
    if (z !== this._tz) { this._tz = z; this._tzT = now; }
    const s = 2 ** (this.zoom - z); const C = project(this.center, z);
    const hw = this.w / 2 / s; const hh = this.h / 2 / s;
    let lvl = this._levels.get(z);
    if (!lvl) {
      lvl = { z, ox: Math.floor(C.x - hw), oy: Math.floor(C.y - hh), el: document.createElement('div'), tiles: new Map() };
      lvl.el.className = 'ac-map__level'; this._levels.set(z, lvl); this._tilesEl.append(lvl.el);
      const Cz = this._cpx(); lvl.el.style.transform = `translate3d(${lvl.ox * s - Cz.x + this.w / 2}px,${lvl.oy * s - Cz.y + this.h / 2}px,0) scale(${s})`;
    } else if (idle && this._tilesEl.lastElementChild !== lvl.el) this._tilesEl.append(lvl.el);
    const n = 2 ** z; const pad = idle ? 1 : 0;
    const x0 = Math.floor((C.x - hw) / TILE) - pad; const x1 = Math.floor((C.x + hw) / TILE) + pad;
    const y0 = Math.max(0, Math.floor((C.y - hh) / TILE) - pad); const y1 = Math.min(n - 1, Math.floor((C.y + hh) / TILE) + pad);
    const want = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!lvl.tiles.has(`${x}:${y}`)) want.push([x, y]);
    const cx = C.x / TILE; const cy = C.y / TILE;
    want.sort((a, b) => Math.hypot(a[0] + 0.5 - cx, a[1] + 0.5 - cy) - Math.hypot(b[0] + 0.5 - cx, b[1] + 0.5 - cy)).forEach(([x, y]) => this._addTile(lvl, x, y));
    if (idle) for (const [k, t] of lvl.tiles) if (t.x < x0 - 1 || t.x > x1 + 1 || t.y < y0 - 1 || t.y > y1 + 1) { this._dropTile(t); lvl.tiles.delete(k); }
    this._checkLevels();
  }
  _addTile(lvl, x, y) {
    const img = document.createElement('img');
    const t = { x, y, img, state: 0 };
    img.className = 'ac-map__tile'; img.alt = ''; img.decoding = 'async'; img.draggable = false;
    img.style.transform = `translate(${x * TILE - lvl.ox}px,${y * TILE - lvl.oy}px)`;
    img.onload = () => { t.state = 1; img.classList.add('is-loaded'); this._loaded++; if (!this._notice.hidden) { this._notice.hidden = true; delete this.el.dataset.offline; } this._checkLevels(); };
    img.onerror = () => { t.state = 2; img.dataset.failed = ''; this._failed++; if (this._failed >= 4 && this._loaded === 0) { this._notice.hidden = false; this.el.dataset.offline = ''; } this._checkLevels(); };
    lvl.tiles.set(`${x}:${y}`, t);
    lvl.el.append(img);
    const u = this._tileUrl(lvl.z, x, y);
    if (u && typeof u.then === 'function') u.then((v) => { t.blob = v.startsWith('blob:') ? v : null; img.src = v; }, () => img.onerror());
    else img.src = u;
  }
  _dropTile(t) { t.img.onload = t.img.onerror = null; t.img.removeAttribute('src'); t.img.remove(); if (t.blob) URL.revokeObjectURL(t.blob); }
  _dropLevel(l) { l.tiles.forEach((t) => this._dropTile(t)); l.el.remove(); }
  _checkLevels() {
    const act = this._levels.get(this._tz); if (!act) return;
    let done = true; for (const t of act.tiles.values()) if (!t.state) { done = false; break; }
    for (const [z, l] of this._levels) if (z !== this._tz && (done || Math.abs(z - this._tz) > 2)) { this._dropLevel(l); this._levels.delete(z); }
  }

  /* ---------- input */
  _wire() {
    const vp = this.vp; const off = (...a) => this._offs.push(AC.on(...a));
    off(vp, 'pointerdown', (e) => {
      this._rect = vp.getBoundingClientRect();
      if (e.target.closest(NODRAG)) return;
      if (this._ptrs.size === 0) this._pinchHappened = false;
      this._ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now(), type: e.pointerType });
      if (this._ptrs.size === 2 && this.o.interactive) this._pinchStart();
    }, { capture: true });
    const moveP = (e) => {
      const p = this._ptrs.get(e.pointerId); if (!p) return;
      p.x = e.clientX; p.y = e.clientY;
      if (this._pinching) this._pinchMove();
    };
    const upP = (e) => {
      const p = this._ptrs.get(e.pointerId); if (!p) return;
      this._ptrs.delete(e.pointerId);
      if (this._pinching && this._ptrs.size < 2) this._pinchEnd();
      if (e.type === 'pointerup' && p.type !== 'mouse' && !this._pinchHappened && Math.hypot(p.x - p.x0, p.y - p.y0) < 10 && performance.now() - p.t0 < 300) {
        const now = performance.now(); const pt = this._evPt(e);
        if (this._lastTap && now - this._lastTap.t < 320 && Math.hypot(pt.x - this._lastTap.x, pt.y - this._lastTap.y) < 30) { this._lastTap = null; this._dbl = now; this._onDbl(pt, e); }
        else this._lastTap = { t: now, x: pt.x, y: pt.y };
      }
    };
    off(window, 'pointermove', moveP); off(window, 'pointerup', upP); off(window, 'pointercancel', upP);
    this._offs.push(AC.gesture(vp, {
      axis: 'both', threshold: 4,
      filter: (e) => this.o.interactive && !e.target.closest(NODRAG) && this._ptrs.size <= 1 && !this.draw?._blocksPan(),
      onStart: () => { if (this._pinching) return false; this._stopAnim(); this._dragging = true; this._ldx = 0; this._ldy = 0; this.el.dataset.dragging = ''; this._mover(1); return undefined; },
      onMove: (s) => {
        if (!this._dragging || this._pinching) return;
        const dx = s.dx - this._ldx; const dy = s.dy - this._ldy; this._ldx = s.dx; this._ldy = s.dy; this._lmt = performance.now();
        this._panPx(-dx, -dy); this._requestRender();
      },
      onEnd: (s) => {
        if (!this._dragging) return;
        this._dragging = false; delete this.el.dataset.dragging;
        if (!this._pinchHappened && this.o.inertia && !reduced() && performance.now() - this._lmt < 60) this._inertia(s.vx, s.vy);
        this._mover(-1);
      },
    }));
    off(vp, 'wheel', (e) => this._onWheel(e), { passive: false });
    off(vp, 'dblclick', (e) => { if (performance.now() - (this._dbl || 0) < 600 || e.target.closest(NODRAG)) return; e.preventDefault(); this._dbl = performance.now(); this._onDbl(this._evPt(e), e); });
    off(vp, 'click', (e) => this._onClick(e));
    off(vp, 'keydown', (e) => this._onKey(e));
    off(vp, 'pointermove', AC.rafThrottle((e) => { if (e.pointerType === 'mouse' && !this._dragging) { const pt = this._evPt(e); this._hover = this.pointToLatLng(pt); this._updCoords(); this.draw?._hover(this._hover, pt); } }));
    off(vp, 'touchstart', (e) => e.stopPropagation(), { passive: true }); // keep the page's pull-to-refresh out of map drags
    off(this.el, 'contextmenu', (e) => { if (e.target.closest('.ac-map__viewport')) { e.preventDefault(); this._emit('contextmenu', { latlng: this.pointToLatLng(this._evPt(e)) }); } });
    off(document, 'ac:theme:change', () => requestAnimationFrame(() => this._applyTheme(false)));
    off(document, 'ac:i18n:change', () => { this._label(); this._relabel(); this._updScale(); this._updCoords(); });
    off(document, 'fullscreenchange', () => this._fsSync());
    off(window, 'scroll', () => { this._rect = null; }, { passive: true });
  }
  _pinchStart() {
    const [a, b] = [...this._ptrs.values()];
    this._stopAnim();
    if (this._dragging) { this._dragging = false; delete this.el.dataset.dragging; this._mover(-1); }
    this._pinching = true; this._pinchHappened = true; this._mover(1);
    const r = this._rect; const mid = { x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top };
    this._pz = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: this.zoom, anchor: this.pointToLatLng(mid) };
  }
  _pinchMove() {
    const [a, b] = [...this._ptrs.values()]; if (!a || !b) return;
    const r = this._rect; const mid = { x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top };
    const z = this._pz.z0 + Math.log2(Math.hypot(a.x - b.x, a.y - b.y) / this._pz.d0);
    this._anchor(this._pz.anchor, mid, z); this._requestRender();
  }
  _pinchEnd() { this._pinching = false; this._mover(-1); }
  _onWheel(e) {
    if (!this.o.wheel || !this.o.interactive) return;
    e.preventDefault();
    const dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1);
    const dz = clamp(-dy / (e.ctrlKey ? 100 : 150), -1, 1);
    this._wz = clamp((this._wheeling ? this._wz : this.zoom) + dz, this.minZoom, this.maxZoom);
    const pt = this._evPt(e); this._wa = { pt, latlng: this.pointToLatLng(pt) };
    if (this._wheeling) { this._wa.latlng = this.pointToLatLng(pt); return; }
    this._stopAnim(); this._wheeling = true; this._mover(1);
    const k = e.ctrlKey ? 0.55 : 0.3;
    const step = () => {
      const diff = this._wz - this.zoom; const z = Math.abs(diff) < 0.003 ? this._wz : this.zoom + diff * k;
      this._anchor(this._wa.latlng, this._wa.pt, z); this._render();
      if (z === this._wz) { this._wheeling = false; this._wraf = 0; this._mover(-1); } else this._wraf = requestAnimationFrame(step);
    };
    if (reduced()) { this._anchor(this._wa.latlng, pt, this._wz); this._render(); this._wheeling = false; this._mover(-1); return; }
    this._wraf = requestAnimationFrame(step);
  }
  _onDbl(pt, e) {
    if (this.draw?._onDbl(e)) return;
    if (!this.o.interactive) return;
    const z = Math.round(this.zoom) + (e.shiftKey ? -1 : 1);
    this._zoomAnim(z, pt);
  }
  _onClick(e) {
    if (e.target.closest(NODRAG) && !e.target.closest('.ac-map-marker')) return;
    const pt = this._evPt(e); const latlng = this.pointToLatLng(pt);
    if (this.draw?._onClick(latlng, pt, e)) return;
    const hit = e.target.closest('[data-map-layer]');
    const layer = hit && this._byId.get(hit.dataset.mapLayer);
    if (layer) { layer._lastClick = latlng; layer._click(e, latlng); return; }
    if (this._popup?.el.dataset.state === 'open') { this.closePopup(); return; }
    // wait out a possible double-click / double-tap (zoom) before treating it as a map click
    clearTimeout(this._clickT);
    const t0 = this._dbl || 0;
    this._clickT = setTimeout(() => {
      if ((this._dbl || 0) !== t0) return;
      this._emit('click', { latlng, point: pt });
      if (this.o.reverse && this.o.geocoder?.reverse) this.reverseAt(latlng);
    }, this.o.interactive ? 260 : 0);
  }
  _onKey(e) {
    if (e.target !== this.vp && !e.target.closest('.ac-map-marker')) return;
    if (e.target.closest('.ac-map-marker') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault(); const l = this._byId.get(e.target.closest('.ac-map-marker').dataset.mapLayer); l?._click(e, l.latlng); return;
    }
    if (e.target !== this.vp) return;
    const step = 90; const keys = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (keys[e.key]) { e.preventDefault(); this.panBy(...keys[e.key]); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); this.zoomIn(); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); this.zoomOut(); }
    else if (e.key === 'Escape') { this.closePopup(); this.draw?.cancel(); }
  }

  /* ---------- animation */
  _stopAnim() {
    if (this._animRaf) { cancelAnimationFrame(this._animRaf); this._animRaf = 0; this._mover(-1); }
    if (this._wraf) { cancelAnimationFrame(this._wraf); this._wraf = 0; this._wheeling = false; this._mover(-1); }
  }
  _anim(step, duration, done) {
    this._stopAnim();
    if (reduced() || duration <= 0) { step(1); this._render(); this._idleNow(); done?.(); return; }
    this._mover(1);
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      step(t); this._render();
      if (t < 1) this._animRaf = requestAnimationFrame(tick);
      else { this._animRaf = 0; this._mover(-1); done?.(); }
    };
    this._animRaf = requestAnimationFrame(tick);
  }
  _idleNow() { clearTimeout(this._idleT); if (!this._movers) this._idle(); }
  _inertia(vx, vy) {
    const sp = Math.hypot(vx, vy); if (sp < 0.15) return;
    const k = Math.min(1, 2.6 / sp); vx *= k; vy *= k;
    const tau = 325; let prev = 0;
    this._mover(1);
    const t0 = performance.now();
    const tick = (now) => {
      const t = now - t0; const f = 1 - Math.exp(-t / tau); const d = (f - prev) * tau; prev = f;
      this._panPx(-vx * d, -vy * d); this._render();
      if ((1 - f) * sp * k * tau < 0.5 || t > 2200) { this._animRaf = 0; this._mover(-1); } else this._animRaf = requestAnimationFrame(tick);
    };
    this._animRaf = requestAnimationFrame(tick);
  }
  _zoomAnim(z1, pt = { x: this.w / 2, y: this.h / 2 }, dur = 260) {
    z1 = clamp(z1, this.minZoom, this.maxZoom);
    const z0 = this.zoom; const a = this.pointToLatLng(pt);
    this._anim((t) => { const e = 1 - (1 - t) ** 3; this._anchor(a, pt, z0 + (z1 - z0) * e); }, dur);
  }

  /* ---------- view API */
  setView(c, z = this.zoom) { this._stopAnim(); this.center = ll(c); this.zoom = clamp(+z, this.minZoom, this.maxZoom); const C = this._cpx(); this._setCenterPx(C.x, C.y); this._render(); this._idleNow(); return this; }
  getCenter() { return { ...this.center }; }
  getZoom() { return this.zoom; }
  setZoom(z) { this._zoomAnim(z); return this; }
  zoomIn() { this._zoomAnim(Math.round(this.zoom) + 1); return this; }
  zoomOut() { this._zoomAnim(Math.round(this.zoom) - 1); return this; }
  setPadding(p = {}) { Object.assign(this.pad, p); return this; }
  panBy(dx, dy, dur = 280) {
    let prev = 0;
    this._anim((t) => { const e = 1 - (1 - t) ** 3; this._panPx(dx * (e - prev), dy * (e - prev)); prev = e; }, dur);
    return this;
  }
  panTo(c) { return this.flyTo(c, this.zoom); }
  /** Smooth zoom-out/pan/zoom-in (van Wijk & Nuij), the same curve Leaflet's flyTo uses. */
  flyTo(c, zoom = this.zoom, o = {}) {
    const z1 = clamp(+zoom, this.minZoom, this.maxZoom);
    const target = this._padCenter(ll(c), z1);
    if (o.animate === false || reduced() || !this.w) return this.setView(target, z1);
    const z0 = this.zoom; const p0 = project(this.center, z0); const p1 = project(target, z0);
    const w0 = Math.max(this.w, this.h); const w1 = w0 * 2 ** (z0 - z1); const u1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const rho = 1.42; const rho2 = rho * rho;
    if (u1 < 1) { this._anim((t) => { const e = 1 - (1 - t) ** 3; this.zoom = z0 + (z1 - z0) * e; const P = project(target, this.zoom); const Q = project(unproject(p0.x, p0.y, z0), this.zoom); this._setCenterPx(Q.x + (P.x - Q.x) * e, Q.y + (P.y - Q.y) * e); }, o.duration ?? 320); return this; }
    const r = (i) => { const b = (w1 * w1 - w0 * w0 + (i ? -1 : 1) * rho2 * rho2 * u1 * u1) / (2 * (i ? w1 : w0) * rho2 * u1); const sq = Math.sqrt(b * b + 1) - b; return sq < 1e-9 ? -18 : Math.log(sq); };
    const r0 = r(0);
    const wS = (s) => w0 * (Math.cosh(r0) / Math.cosh(r0 + rho * s));
    const uS = (s) => (w0 * (Math.cosh(r0) * Math.tanh(r0 + rho * s) - Math.sinh(r0))) / rho2;
    const S = (r(1) - r0) / rho;
    const dur = o.duration ?? clamp(1000 * S * 0.8, 450, 1800);
    this._anim((t) => {
      if (t >= 1) { this.zoom = z1; this.center = { ...target }; return; }
      const s = (1 - (1 - t) ** 1.5) * S; const k = uS(s) / u1;
      this.zoom = clamp(z0 + Math.log2(w0 / wS(s)), this.minZoom, this.maxZoom);
      const c2 = unproject(p0.x + (p1.x - p0.x) * k, p0.y + (p1.y - p0.y) * k, z0);
      const P = project(c2, this.zoom); this._setCenterPx(P.x, P.y);
    }, dur);
    return this;
  }
  fitBounds(b, o = {}) {
    if (Array.isArray(b)) b = bounds(b);
    const pad = o.padding ?? 48;
    const sw = project(b.s, b.w, 0); const ne = project(b.n, b.e, 0);
    const W = Math.max(40, this.w - pad * 2 - this.pad.left - this.pad.right); const H = Math.max(40, this.h - pad * 2 - this.pad.top - this.pad.bottom);
    const dx = Math.abs(ne.x - sw.x); const dy = Math.abs(sw.y - ne.y);
    let z = dx || dy ? Math.log2(Math.min(dx ? W / dx : Infinity, dy ? H / dy : Infinity)) : this.maxZoom;
    z = clamp(Math.floor(z * 4) / 4, this.minZoom, Math.min(this.maxZoom, o.maxZoom ?? this.maxZoom));
    const c = unproject((sw.x + ne.x) / 2, (sw.y + ne.y) / 2, 0);
    return o.animate === false ? this.setView(this._padCenter(c, z), z) : this.flyTo(c, z);
  }
  invalidateSize() {
    const w = this.vp.clientWidth; const h = this.vp.clientHeight;
    this._rect = null;
    if (w === this.w && h === this.h) return this;
    const first = !this.w; this.w = w; this.h = h;
    if (!w || !h) return this;
    if (first) { const C = this._cpx(); this._setCenterPx(C.x, C.y); }
    this._fz = null; this._render(); this._idleNow();
    return this;
  }

  /* ---------- layers */
  addLayer(l) {
    if (l.map === this) return l;
    l.map = this; this.layers.add(l); this._byId.set(l.id, l);
    l._add?.(this);
    return l;
  }
  removeLayer(l) {
    if (l.map !== this) return;
    if (this._popup?.source === l) this.closePopup();
    l._remove?.(); this.layers.delete(l); this._byId.delete(l.id); l.map = null;
  }
  marker(p, o) { return this.addLayer(new Marker(p, o)); }
  polyline(pts, o) { return this.addLayer(new Path('line', pts, o)); }
  polygon(pts, o) { return this.addLayer(new Path('polygon', pts, o)); }
  circle(c, radius, o = {}) { return this.addLayer(new Path('circle', c, { ...o, radius })); }
  heatmap(pts, o) { return this.addLayer(new Heat(pts, o)); }
  cluster(pts, o) { return this.addLayer(new Cluster(pts, o)); }
  group(layers, o) { return this.addLayer(new Group(layers, o)); }
  /** geojson(object | url, { style, popup(feature, layer), point(feature, latlng), onEach }) → Group (Promise<Group> for a URL) */
  geojson(src, o = {}) {
    if (typeof src === 'string') return fetch(src).then((r) => r.json()).then((j) => this.geojson(j, o));
    return this.group(geojsonLayers(src, o), o);
  }
  /** Register a toggleable overlay for the layer switcher. */
  addOverlay(id, label, layer, o = {}) {
    this.overlays = this.overlays.filter((x) => x.id !== id);
    this.overlays.push({ id, label, layer, icon: o.icon });
    if (layer && !layer.map) this.addLayer(layer);
    this._layersPanel?.();
    return layer;
  }
  setOverlay(id, visible) { const x = this.overlays.find((y) => y.id === id); if (x) { x.layer.setVisible(visible); this._layersPanel?.(); this._emit('overlay', { id, visible: !!visible }); } return this; }

  /* ---------- popups */
  openPopup(latlng, content, o = {}) { (this._popup ||= new Popup(this)).open(ll(latlng), content, o); return this._popup; }
  closePopup() { this._popup?.close(); return this; }
  async reverseAt(latlng, o = {}) {
    const g = this.o.geocoder; const box = document.createElement('div'); box.className = 'ac-map-addr';
    const coords = `<div class="ac-map-addr__coords" dir="ltr"><span>${formatLatLng(latlng)}</span><span>${formatLatLng(latlng, 'dms')}</span></div>`;
    box.innerHTML = `<div class="ac-map-addr__title">${esc(tr('loading'))}</div>${coords}<button class="ac-btn ac-btn--sm" type="button" data-copy>${icon('copy')}<span>${esc(tr('copy'))}</span></button>`;
    box.querySelector('[data-copy]').addEventListener('click', async (e) => {
      const b = e.currentTarget; try { await navigator.clipboard.writeText(formatLatLng(latlng)); } catch { /* denied */ }
      b.querySelector('span').textContent = tr('copied'); b.dataset.done = '';
    });
    const pin = o.marker !== false ? this._revPin?.setLatLng(latlng) || (this._revPin = this.marker(latlng, { tone: 'accent', drop: true, interactive: false })) : null;
    if (pin && !pin.map) this.addLayer(pin);
    this.openPopup(latlng, box, { offset: pin ? -46 : 0, source: pin });
    this._revAbort?.abort(); const ac = (this._revAbort = new AbortController());
    let res = null;
    try { res = g?.reverse ? await g.reverse(latlng.lat, latlng.lng, { signal: ac.signal, lang: AC.i18n?.lang }) : null; } catch (err) { if (err.name === 'AbortError') return null; }
    const title = box.querySelector('.ac-map-addr__title');
    title.textContent = res?.label || tr('unknown');
    if (res?.sub) title.insertAdjacentHTML('afterend', `<div class="ac-map-addr__sub">${esc(res.sub)}</div>`);
    this._emit('reverse', { latlng, result: res });
    return res;
  }

  /* ---------- locate */
  async locate(o = {}) {
    const btn = this.el.querySelector('[data-map-ctl="locate"]');
    const fail = (title, text) => { btn && (btn.dataset.state = 'error'); AC.toast ? AC.toast({ tone: 'warning', title, text }) : null; this._emit('locate:error', { message: title }); };
    if (!navigator.geolocation) return fail(tr('unsupported'));
    try { const p = await navigator.permissions?.query({ name: 'geolocation' }); if (p?.state === 'denied') return fail(tr('denied'), tr('deniedText')); } catch { /* Safari: no permissions API for geolocation */ }
    if (btn) btn.dataset.state = 'busy';
    navigator.geolocation.getCurrentPosition((pos) => {
      const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }; const acc = pos.coords.accuracy;
      if (btn) btn.dataset.state = 'on';
      if (!this._me) { this._meAcc = this.circle(latlng, acc, { tone: 'accent', className: 'ac-map-shape--accuracy', interactive: false }); this._me = this.marker(latlng, { kind: 'me', title: tr('locate'), interactive: false }); }
      else { this._me.setLatLng(latlng); this._meAcc.setCenter(latlng).setRadius(acc); }
      this.flyTo(latlng, Math.max(this.zoom, o.zoom ?? 15));
      this._emit('locate', { latlng, accuracy: acc });
    }, (err) => fail(err.code === 1 ? tr('denied') : tr('locateFail'), err.code === 1 ? tr('deniedText') : err.message), { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
    return undefined;
  }

  /* ---------- fullscreen */
  toggleFullscreen() {
    const el = this.el; const native = document.fullscreenEnabled && el.requestFullscreen;
    if (document.fullscreenElement === el) document.exitFullscreen();
    else if (el.hasAttribute('data-fullscreen')) { el.removeAttribute('data-fullscreen'); AC.scrollLock?.unlock(); this._fsSync(); }
    else if (native) el.requestFullscreen().catch(() => { el.setAttribute('data-fullscreen', ''); AC.scrollLock?.lock(); this._fsSync(); });
    else { el.setAttribute('data-fullscreen', ''); AC.scrollLock?.lock(); this._fsSync(); }
  }
  _fsSync() {
    const on = document.fullscreenElement === this.el || this.el.hasAttribute('data-fullscreen');
    const b = this.el.querySelector('[data-map-ctl="fullscreen"]');
    if (b) { b.setAttribute('aria-pressed', String(on)); b.innerHTML = icon(on ? 'minimize' : 'maximize'); b.setAttribute('aria-label', tr(on ? 'exitFullscreen' : 'fullscreen')); }
    requestAnimationFrame(() => this.invalidateSize());
  }

  /* ---------- controls */
  _btn(ctl, ic, label, fn) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ac-map__btn'; b.dataset.mapCtl = ctl; b.dataset.label = label; b.setAttribute('aria-label', tr(label)); b.innerHTML = icon(ic);
    b.addEventListener('click', fn);
    return b;
  }
  _bar(...btns) { const d = document.createElement('div'); d.className = 'ac-map__ctl ac-map__bar'; d.append(...btns); return d; }
  _relabel() { this.el.querySelectorAll('[data-label]').forEach((b) => b.setAttribute('aria-label', tr(b.dataset.label))); this._searchUI?.relabel(); this._layersPanel?.(); this.draw?._relabel(); }
  _controls(list) {
    const te = this.corner('top-end'); const bs = this.corner('bottom-start'); const be = this.corner('bottom-end');
    if (list.includes('search') && this.o.geocoder) this._search();
    if (list.includes('layers')) this._layers(te);
    if (list.includes('zoom')) { te.append(this._bar(this._btn('in', 'plus', 'zoomIn', () => this.zoomIn()), this._btn('out', 'minus', 'zoomOut', () => this.zoomOut()))); }
    const tools = [];
    if (list.includes('locate')) tools.push(this._btn('locate', 'locate-fixed', 'locate', () => this.locate()));
    if (list.includes('fullscreen')) tools.push(this._btn('fullscreen', 'maximize', 'fullscreen', () => this.toggleFullscreen()));
    if (tools.length) te.append(this._bar(...tools));
    if (list.includes('draw')) this.enableDraw(this.corner('top-start'));
    if (list.includes('scale')) {
      this._scale = document.createElement('div'); this._scale.className = 'ac-map__ctl ac-map__scale'; this._scale.setAttribute('aria-hidden', 'true');
      this._scale.innerHTML = '<span class="ac-map__scale-bar"><i></i></span><span class="ac-map__scale-text"></span>'; bs.append(this._scale);
    }
    if (list.includes('coords')) {
      this._coords = document.createElement('button'); this._coords.type = 'button'; this._coords.className = 'ac-map__ctl ac-map__coords'; this._coords.dir = 'ltr';
      this._coords.dataset.label = 'dms'; this._coords.setAttribute('aria-label', tr('dms'));
      this._coords.addEventListener('click', () => { this._coordMode = this._coordMode === 'dec' ? 'dms' : 'dec'; this._updCoords(); });
      bs.prepend(this._coords);
      this.on('move', () => { if (!this._hover || this._dragging) this._updCoords(true); });
    }
    this._attr = document.createElement('div'); this._attr.className = 'ac-map__ctl ac-map__attrib'; be.append(this._attr); this._attrib();
  }
  _attrib() { if (this._attr) { this._attr.innerHTML = this._prov?.attribution || ''; this._attr.hidden = !this._prov?.attribution; } }
  _zoomBtns() {
    const i = this.el.querySelector('[data-map-ctl="in"]'); const o = this.el.querySelector('[data-map-ctl="out"]');
    if (i) i.disabled = this.zoom >= this.maxZoom - 1e-6; if (o) o.disabled = this.zoom <= this.minZoom + 1e-6;
  }
  _updScale() {
    if (!this._scale || !this.w) return;
    const m = mpp(this.center.lat, this.zoom) * 96; const p10 = 10 ** Math.floor(Math.log10(m)); const d = m / p10;
    const nice = (d >= 5 ? 5 : d >= 2 ? 2 : 1) * p10;
    this._scale.querySelector('i').style.transform = `scaleX(${(nice / m).toFixed(3)})`;
    this._scale.querySelector('.ac-map__scale-text').textContent = formatDistance(nice);
  }
  _updCoords(center) {
    if (!this._coords) return;
    const p = center || !this._hover ? this.center : this._hover;
    this._coords.textContent = formatLatLng(p, this._coordMode);
  }

  _search() {
    const g = this.o.geocoder; const host = this.corner('top-start');
    const box = document.createElement('div'); box.className = 'ac-map__ctl ac-map__search';
    const lid2 = AC.uid ? AC.uid('acm') : `acm${Date.now()}`;
    box.innerHTML = `<label class="ac-map__search-field">${icon('search')}<input type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${lid2}" autocomplete="off" enterkeyhint="search"><button type="button" class="ac-map__search-clear" hidden>${icon('x')}</button></label>
      <ul class="ac-map__results" id="${lid2}" role="listbox" hidden></ul>`;
    host.append(box);
    const input = box.querySelector('input'); const list = box.querySelector('ul'); const clr = box.querySelector('.ac-map__search-clear');
    let results = []; let active = -1; let ctrl = null; let pin = null;
    const relabel = () => { input.placeholder = tr('search'); input.setAttribute('aria-label', tr('search')); clr.setAttribute('aria-label', tr('cancel')); };
    relabel();
    const show = (html) => { list.innerHTML = html; list.hidden = !html; input.setAttribute('aria-expanded', String(!!html)); };
    const render = () => show(results.length
      ? results.map((r, i) => `<li role="option" id="${lid2}-${i}" aria-selected="${i === active}" data-i="${i}">${icon('map-pin')}<span><b>${esc(r.label)}</b>${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</span></li>`).join('')
      : `<li class="ac-map__results-empty">${esc(tr('noResults'))}</li>`);
    const run = async () => {
      const q = input.value.trim(); ctrl?.abort();
      if (!q) { results = []; show(''); return; }
      ctrl = new AbortController(); const my = ctrl;
      show(`<li class="ac-map__results-empty">${esc(tr('searching'))}</li>`);
      try { results = await g.search(q, { signal: my.signal, lang: AC.i18n?.lang, near: this.center }) || []; } catch (e) { if (e.name === 'AbortError') return; results = []; }
      if (my !== ctrl) return; active = results.length ? 0 : -1; render();
    };
    const pick = (i) => {
      const r = results[i]; if (!r) return;
      show(''); input.value = r.label; clr.hidden = false;
      if (pin) pin.setLatLng(r); else pin = this.marker(r, { tone: 'accent', drop: true, title: r.label });
      pin.bindPopup(`<div class="ac-map-addr"><div class="ac-map-addr__title">${esc(r.label)}</div>${r.sub ? `<div class="ac-map-addr__sub">${esc(r.sub)}</div>` : ''}<div class="ac-map-addr__coords" dir="ltr"><span>${formatLatLng(r)}</span></div></div>`);
      if (r.bbox) this.fitBounds(r.bbox, { maxZoom: 16 }); else this.flyTo(r, Math.max(this.zoom, r.zoom || 15));
      this._emit('search:select', { result: r });
    };
    const deb = AC.debounce(run, 300);
    input.addEventListener('input', () => { clr.hidden = !input.value; if (g.live !== false) deb(); else show(input.value ? `<li class="ac-map__results-empty">${esc(tr('pressEnter'))}</li>` : ''); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!results.length) return; e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length; render(); input.setAttribute('aria-activedescendant', `${lid2}-${active}`); }
      else if (e.key === 'Enter') { e.preventDefault(); if (!list.hidden && active >= 0 && results.length && g.live !== false) pick(active); else run(); }
      else if (e.key === 'Escape') { if (!list.hidden) { e.stopPropagation(); show(''); } }
    });
    list.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) pick(+li.dataset.i); });
    clr.addEventListener('click', () => { input.value = ''; clr.hidden = true; results = []; show(''); pin?.remove(); pin = null; input.focus(); });
    this._offs.push(AC.on(document, 'pointerdown', (e) => { if (!box.contains(e.target)) show(''); }));
    this._searchUI = { relabel, input };
  }

  _layers(host) {
    const wrap = document.createElement('div'); wrap.className = 'ac-map__ctl ac-map__layers';
    const btn = this._btn('layers', 'layers', 'layers', () => { const open = panel.dataset.state !== 'open'; panel.dataset.state = open ? 'open' : 'closed'; btn.setAttribute('aria-expanded', String(open)); if (open) render(); });
    btn.setAttribute('aria-expanded', 'false'); btn.classList.add('ac-map__btn--solo');
    const panel = document.createElement('div'); panel.className = 'ac-map__panel'; panel.dataset.state = 'closed';
    wrap.append(btn, panel); host.append(wrap);
    const base = () => (this.o.baseLayers || ['osm', 'opentopomap', 'none']).map((x) => (typeof x === 'string' ? { id: x, label: providers[x]?.name || x } : x));
    const render = () => {
      if (panel.dataset.state !== 'open') return;
      const cur = typeof this._tilesSpec === 'string' ? this._tilesSpec : JSON.stringify(this._tilesSpec);
      panel.innerHTML = `<div class="ac-map__panel-label">${esc(tr('base'))}</div>${base().map((b) => `<label class="ac-map__opt"><input type="radio" name="${this.vp.id || 'acm'}-base" value="${esc(typeof b.id === 'string' ? b.id : JSON.stringify(b.id))}" ${(typeof b.id === 'string' ? b.id : JSON.stringify(b.id)) === cur ? 'checked' : ''}><span>${esc(typeof b.label === 'function' ? b.label() : b.label)}</span></label>`).join('')}
        ${this.overlays.length ? `<div class="ac-map__panel-label">${esc(tr('overlays'))}</div>${this.overlays.map((x) => `<label class="ac-map__opt"><input type="checkbox" class="ac-switch" role="switch" value="${esc(x.id)}" ${x.layer.visible ? 'checked' : ''}><span>${x.icon ? icon(x.icon) : ''}${esc(typeof x.label === 'function' ? x.label() : x.label)}</span></label>`).join('')}` : ''}`;
    };
    panel.addEventListener('change', (e) => {
      const i = e.target;
      if (i.type === 'radio') { let v = i.value; try { if (v.startsWith('{')) v = JSON.parse(v); } catch { /* id */ } this.setTiles(v); }
      else this.setOverlay(i.value, i.checked);
    });
    this._offs.push(AC.on(document, 'pointerdown', (e) => { if (!wrap.contains(e.target) && panel.dataset.state === 'open') { panel.dataset.state = 'closed'; btn.setAttribute('aria-expanded', 'false'); } }));
    this._offs.push(AC.on(panel, 'keydown', (e) => { if (e.key === 'Escape') { panel.dataset.state = 'closed'; btn.focus(); } }));
    this._layersPanel = render;
  }

  enableDraw(host = this.corner('top-end'), o = {}) { if (!this.draw) this.draw = new Draw(this, host, o); return this.draw; }

  destroy() {
    this._stopAnim(); cancelAnimationFrame(this._raf); clearTimeout(this._idleT); clearTimeout(this._clickT);
    this._offs.forEach((f) => f()); this._ro.disconnect();
    if (this.el.hasAttribute('data-fullscreen')) AC.scrollLock?.unlock();
    for (const l of [...this.layers]) this.removeLayer(l);
    for (const l of this._levels.values()) this._dropLevel(l);
    this.draw?.destroy();
    this.el.replaceChildren(); this.el.classList.remove('ac-map');
  }
}

/* ------------------------------------------------------------------ draw / edit / measure */
let fid = 0;
class Draw {
  constructor(map, host, o) {
    this.map = map; this.o = { tone: 'accent', ...o }; this.features = new Map(); this.mode = null; this.cur = null; this.sel = null; this.handles = []; this.measures = [];
    const tools = [['point', 'map-pin-plus'], ['line', 'spline'], ['polygon', 'pentagon'], ['circle', 'circle-dot'], ['measure', 'ruler'], ['area', 'square-dashed']];
    this.bar = map._bar(...tools.map(([m, ic]) => { const b = map._btn(`draw-${m}`, ic, m, () => (this.mode === m ? this.cancel() : this.start(m))); b.setAttribute('aria-pressed', 'false'); return b; }));
    this.bar.classList.add('ac-map__bar--tools', 'ac-map__bar--row'); this.bar.setAttribute('role', 'toolbar'); this.bar.dataset.label = 'draw'; this.bar.setAttribute('aria-label', tr('draw'));
    host.append(this.bar);
    const hint = document.createElement('div'); hint.className = 'ac-map__hint'; hint.hidden = true;
    hint.innerHTML = `<span class="ac-map__hint-text"></span><span class="ac-map__hint-acts">
      <button type="button" class="ac-btn ac-btn--sm ac-btn--ghost" data-act="undo">${icon('undo-2')}<span data-t="undo"></span></button>
      <button type="button" class="ac-btn ac-btn--sm ac-btn--danger-soft" data-act="delete">${icon('trash-2')}<span data-t="del"></span></button>
      <button type="button" class="ac-btn ac-btn--sm" data-act="cancel"><span data-t="cancel"></span></button>
      <button type="button" class="ac-btn ac-btn--sm ac-btn--primary" data-act="finish">${icon('check')}<span data-t="finish"></span></button></span>`;
    map.el.append(hint); this.hint = hint;
    hint.addEventListener('click', (e) => { const a = e.target.closest('[data-act]')?.dataset.act; if (a === 'undo') this.undo(); if (a === 'finish') this.finish(); if (a === 'cancel') this.cancel(); if (a === 'delete' && this.sel) this.remove(this.sel.id); });
    this._key = (e) => {
      if (!this.mode && !this.sel) return;
      if (e.target.closest('input, textarea, [contenteditable="true"]')) return;
      if (e.key === 'Escape') { this.cancel(); }
      else if (e.key === 'Enter' && this.cur) { e.preventDefault(); this.finish(); }
      else if (e.key === 'Backspace' && this.cur) { e.preventDefault(); this.undo(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && this.sel && !this.mode) { e.preventDefault(); this.remove(this.sel.id); }
    };
    document.addEventListener('keydown', this._key);
    this._relabel();
  }
  _relabel() { this.hint.querySelectorAll('[data-t]').forEach((s) => { s.textContent = tr(s.dataset.t); }); this._hintText(); this.bar.setAttribute('aria-label', tr('draw')); }
  _hintText(extra) {
    const k = this.mode ? { point: 'hintPoint', line: 'hintLine', polygon: 'hintPolygon', circle: 'hintCircle', measure: 'hintLine', area: 'hintPolygon' }[this.mode] : this.sel ? 'hintEdit' : null;
    this.hint.hidden = !k;
    this.hint.querySelector('.ac-map__hint-text').textContent = extra ? `${tr(k)} · ${extra}` : k ? tr(k) : '';
    const multi = ['line', 'polygon', 'measure', 'area'].includes(this.mode);
    this.hint.querySelector('[data-act="undo"]').hidden = !multi;
    this.hint.querySelector('[data-act="finish"]').hidden = !(multi || (this.sel && !this.mode));
    this.hint.querySelector('[data-act="delete"]').hidden = !(this.sel && !this.mode);
    this.hint.querySelector('[data-act="cancel"]').hidden = !!(this.sel && !this.mode);
  }
  _blocksPan() { return false; }
  start(mode) {
    this.cancel(true); this.deselect();
    if (mode === 'measure' || mode === 'area') this.clearMeasures();
    this.mode = mode; this.map.el.dataset.drawing = mode;
    this.bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mapCtl === `draw-${mode}`)));
    this._hintText();
    this.map._emit('draw:start', { mode });
  }
  _stopMode() {
    this.mode = null; delete this.map.el.dataset.drawing;
    this.bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    this._hintText();
  }
  _vtx(latlng, cls) { const v = new Marker(latlng, { kind: 'vertex', interactive: false, className: cls }); this.map.addLayer(v); return v; }
  _onClick(latlng, pt, e) {
    if (!this.mode) {
      // select / deselect drawn features
      const hit = e.target.closest('[data-map-layer]'); const l = hit && this.map._byId.get(hit.dataset.mapLayer);
      const f = l && [...this.features.values()].find((x) => x.layer === l);
      if (f) { this.select(f.id); return true; }
      if (this.sel && !e.target.closest('.ac-map-marker')) { this.deselect(); return true; }
      return false;
    }
    const m = this.mode;
    if (m === 'point') { this._create({ type: 'point', latlng }); return true; }
    if (m === 'circle') {
      if (!this.cur) { this.cur = { type: 'circle', center: latlng, layer: this.map.circle(latlng, 1, { tone: this.o.tone, interactive: false, className: 'ac-map-shape--drawing' }), vtx: [this._vtx(latlng)] }; return true; }
      this.cur.layer.setRadius(distance(this.cur.center, latlng)); this.finish(); return true;
    }
    // line / polygon / measure / area
    if (!this.cur) {
      const poly = m === 'polygon' || m === 'area';
      this.cur = { type: poly ? 'polygon' : 'line', pts: [], vtx: [], layer: this.map.addLayer(new Path(poly ? 'polygon' : 'line', [], { tone: m === 'measure' || m === 'area' ? 'ink' : this.o.tone, interactive: false, className: 'ac-map-shape--drawing' })),
        guide: this.map.addLayer(new Path('line', [], { tone: 'ink', dash: true, interactive: false, className: 'ac-map-shape--guide' })) };
    }
    const c = this.cur; const last = c.pts[c.pts.length - 1];
    if (last) { const lp = this.map.latLngToPoint(last); if (Math.hypot(lp.x - pt.x, lp.y - pt.y) < 6) return true; }
    if (c.type === 'polygon' && c.pts.length >= 3) { const fp = this.map.latLngToPoint(c.pts[0]); if (Math.hypot(fp.x - pt.x, fp.y - pt.y) < 14) { this.finish(); return true; } }
    c.pts.push(latlng); c.vtx.push(this._vtx(latlng, c.pts.length === 1 ? 'is-first' : ''));
    c.layer.setLatLngs(c.pts); this._live();
    return true;
  }
  _onDbl(e) { if (this.cur && this.cur.pts) { e.preventDefault?.(); this.finish(); return true; } return !!this.mode; }
  _hover(latlng) {
    const c = this.cur; if (!c) return;
    if (c.type === 'circle') { c.layer.setRadius(distance(c.center, latlng)); this._hintText(`${tr('radius')}: ${formatDistance(c.layer.radius)}`); return; }
    if (!c.pts.length) return;
    c.guide.setLatLngs(c.type === 'polygon' && c.pts.length > 1 ? [c.pts[c.pts.length - 1], latlng, c.pts[0]] : [c.pts[c.pts.length - 1], latlng]);
    this._live(latlng);
  }
  _live(extra) {
    const c = this.cur; if (!c?.pts) return;
    const pts = extra ? [...c.pts, extra] : c.pts;
    if (this.mode === 'measure' || this.mode === 'line') this._hintText(pts.length > 1 ? `${tr('total')}: ${formatDistance(pathLength(pts))}` : '');
    else if (this.mode === 'area' || this.mode === 'polygon') this._hintText(pts.length > 2 ? formatArea(area(pts)) : '');
  }
  undo() { const c = this.cur; if (!c?.pts?.length) return; c.pts.pop(); c.vtx.pop()?.remove(); c.layer.setLatLngs(c.pts); c.guide.setLatLngs([]); this._live(); }
  finish() {
    if (this.sel && !this.mode) { this.deselect(); return; }
    const c = this.cur; const m = this.mode;
    if (!c) { this.cancel(); return; }
    if (c.type === 'circle') { this._clearCur(); this._create({ type: 'circle', center: c.center, radius: c.layer.radius }); c.layer.remove(); return; }
    const need = c.type === 'polygon' ? 3 : 2;
    if (c.pts.length < need) { this.cancel(); return; }
    if (m === 'measure' || m === 'area') {
      const pts = c.pts; c.guide.remove(); c.vtx.forEach((v) => v.remove());
      const value = m === 'measure' ? pathLength(pts) : area(pts);
      const text = m === 'measure' ? formatDistance(value) : formatArea(value);
      const at = m === 'measure' ? pts[pts.length - 1] : c.layer.center();
      const lab = this.map.marker(at, { kind: 'label', text: esc(text) });
      c.layer.el?.classList.add('ac-map-shape--measure');
      this.measures.push(c.layer, lab); this.cur = null; this._stopMode();
      this.map._emit('measure', { type: m === 'measure' ? 'distance' : 'area', value, text, latlngs: pts });
      return;
    }
    const pts = c.pts; this._clearCur(); this._create({ type: c.type, latlngs: pts });
  }
  _clearCur() { const c = this.cur; if (!c) return; c.vtx?.forEach((v) => v.remove()); c.guide?.remove(); if (c.type !== 'circle') c.layer?.remove(); this.cur = null; }
  cancel(silent) {
    if (this.cur) { if (this.cur.type === 'circle') this.cur.layer.remove(); this._clearCur(); }
    if (this.mode) { this._stopMode(); if (!silent) this.map._emit('draw:cancel', {}); }
    else if (this.sel && !silent) this.deselect();
  }
  clearMeasures() { this.measures.forEach((l) => l.remove()); this.measures = []; }
  /** Add a feature: { type: 'point'|'line'|'polygon'|'circle', latlng | latlngs | center+radius, props, tone } */
  add(f, silent = true) { return this._create(f, silent); }
  _create(f, silent = false) {
    const id = f.id || `f${++fid}`; const tone = f.tone || this.o.tone; const m = this.map;
    let layer;
    if (f.type === 'point') layer = m.marker(f.latlng, { tone, drop: !silent, title: f.props?.name });
    else if (f.type === 'circle') layer = m.circle(f.center, f.radius, { tone, className: 'ac-map-shape--feature' });
    else layer = m.addLayer(new Path(f.type, f.latlngs, { tone, className: 'ac-map-shape--feature' }));
    const feat = { id, type: f.type, props: { ...(f.props || {}) }, layer };
    this.features.set(id, feat);
    if (!silent) { this._stopMode(); this.map._emit('draw:create', { feature: this._out(feat) }); }
    return this._out(feat);
  }
  _out(f) {
    const l = f.layer;
    const base = { id: f.id, type: f.type, props: f.props, layer: l };
    if (f.type === 'point') return { ...base, latlng: { ...l.latlng } };
    if (f.type === 'circle') return { ...base, center: { ...l._c }, radius: l.radius, area: Math.PI * l.radius ** 2 };
    const pts = l.latlngs.map((p) => ({ ...p }));
    return { ...base, latlngs: pts, length: pathLength(f.type === 'polygon' ? [...pts, pts[0]] : pts), area: f.type === 'polygon' ? area(pts) : 0 };
  }
  get list() { return [...this.features.values()].map((f) => this._out(f)); }
  get(id) { const f = this.features.get(id); return f && this._out(f); }
  remove(id) {
    const f = this.features.get(id); if (!f) return;
    if (this.sel?.id === id) this.deselect(true);
    f.layer.remove(); this.features.delete(id);
    this.map._emit('draw:delete', { feature: { id, type: f.type, props: f.props } });
  }
  clear() { [...this.features.keys()].forEach((id) => { const f = this.features.get(id); f.layer.remove(); this.features.delete(id); }); this.deselect(true); this.clearMeasures(); }
  select(id) {
    if (this.sel?.id === id) return;
    this.deselect(true);
    const f = this.features.get(id); if (!f) return;
    this.sel = f; f.layer.el?.classList?.add('is-selected'); if (f.layer.el?.dataset) f.layer.el.dataset.selected = '';
    this._handles(); this._hintText();
    this.map._emit('draw:select', { feature: this._out(f) });
  }
  deselect(silent) {
    if (!this.sel) return;
    const f = this.sel; f.layer.el?.classList?.remove('is-selected'); if (f.layer.el?.dataset) delete f.layer.el.dataset.selected;
    this.handles.forEach((h) => h.destroy()); this.handles = []; this.sel = null; this._hintText();
    if (!silent) this.map._emit('draw:deselect', { feature: this._out(f) });
  }
  _handle(latlng, cls, onMove, onEnd) {
    const m = this.map; const mk = new Marker(latlng, { kind: 'vertex', className: `ac-map-handle-m ${cls || ''}` }); m.addLayer(mk);
    mk.el.dataset.mapNodrag = ''; mk.el.setAttribute('aria-hidden', 'true');
    const off = AC.gesture(mk.el, { threshold: 1, onStart: () => { mk.el.dataset.dragging = ''; }, onMove: (s) => { const p = m.pointToLatLng(m._evPt(s.event)); mk.setLatLng(p); onMove(p); }, onEnd: () => { delete mk.el.dataset.dragging; onEnd?.(); } });
    const h = { mk, destroy() { off(); mk.remove(); } }; this.handles.push(h); return h;
  }
  _handles() {
    this.handles.forEach((h) => h.destroy()); this.handles = [];
    const f = this.sel; if (!f) return; const l = f.layer;
    const edited = () => this.map._emit('draw:edit', { feature: this._out(f) });
    if (f.type === 'point') {
      this._handle(l.latlng, 'is-center', (p) => l.setLatLng(p), edited);
    } else if (f.type === 'circle') {
      const east = () => { const dLng = l.radius / (111320 * Math.cos(l._c.lat * D2R)); return { lat: l._c.lat, lng: l._c.lng + dLng }; };
      let rh = null;
      this._handle(l._c, 'is-center', (p) => { l.setCenter(p); rh.mk.setLatLng(east()); }, edited);
      rh = this._handle(east(), 'is-radius', (p) => { l.setRadius(Math.max(5, distance(l._c, p))); this._hintText(`${tr('radius')}: ${formatDistance(l.radius)}`); }, () => { rh.mk.setLatLng(east()); edited(); });
    } else {
      const pts = l.latlngs; const closed = f.type === 'polygon';
      pts.forEach((p, i) => this._handle(p, '', (q) => { pts[i] = q; l.setLatLngs(pts); }, () => { this._handles(); edited(); }));
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) {
        const a = pts[i]; const b = pts[(i + 1) % pts.length]; let inserted = false;
        this._handle({ lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 }, 'is-mid', (q) => { if (!inserted) { pts.splice(i + 1, 0, q); inserted = true; } else pts[i + 1] = q; l.setLatLngs(pts); }, () => { this._handles(); edited(); });
      }
    }
  }
  _pos() {}
  _redraw() {}
  toGeoJSON() {
    const g = (f) => {
      const c = (p) => [+p.lng.toFixed(6), +p.lat.toFixed(6)];
      if (f.type === 'point') return { type: 'Point', coordinates: c(f.latlng) };
      if (f.type === 'circle') return { type: 'Point', coordinates: c(f.center) };
      if (f.type === 'line') return { type: 'LineString', coordinates: f.latlngs.map(c) };
      return { type: 'Polygon', coordinates: [[...f.latlngs, f.latlngs[0]].map(c)] };
    };
    return { type: 'FeatureCollection', features: this.list.map((f) => ({ type: 'Feature', id: f.id, properties: { ...f.props, ...(f.type === 'circle' ? { radius: Math.round(f.radius), shape: 'circle' } : {}) }, geometry: g(f) })) };
  }
  destroy() { document.removeEventListener('keydown', this._key); this.hint.remove(); }
}

/* ------------------------------------------------------------------ location picker */
/** AC.map.pick({ value: {lat, lng}, zoom, geocoder, tiles, title }) → Promise<{ lat, lng, address } | null> */
function pick(o = {}) {
  return new Promise((resolve) => {
    const content = document.createElement('div'); content.className = 'ac-map-picker'; content.dataset.noDrag = '';
    content.innerHTML = `<div class="ac-map-picker__map"></div><div class="ac-map-picker__pin" aria-hidden="true"><span class="ac-map-pin"><svg class="ac-map-pin__shape" viewBox="0 0 32 42"><path d="M16 41.2S3 27.6 3 16.4a13 13 0 0 1 26 0C29 27.6 16 41.2 16 41.2z"/></svg><span class="ac-map-pin__icon"><i></i></span></span><span class="ac-map-pin__shadow"></span></div>
      <div class="ac-map-picker__bar"><span class="ac-map-picker__icon">${icon('map-pin')}</span><span class="ac-map-picker__text"><b></b><small dir="ltr"></small></span></div>`;
    const footer = `<button class="ac-btn" type="button" data-ac-close="cancel">${esc(tr('cancel'))}</button><button class="ac-btn ac-btn--primary" type="button" data-ac-close="ok">${icon('check')}<span>${esc(tr('confirm'))}</span></button>`;
    const api = AC.modal.open({ title: o.title || tr('pickTitle'), sub: tr('pickSub'), content, footer, size: 'lg', className: 'ac-map-picker-modal' });
    const layer = content.closest('.ac-modal');
    const start = ll(o.value) || ll(o.center) || ll(DEFAULTS.center);
    const geocoder = o.geocoder || null;
    const map = new MapView(content.querySelector('.ac-map-picker__map'), { center: start, zoom: o.zoom || (o.value ? 16 : 12), tiles: o.tiles || 'osm', geocoder, controls: ['zoom', 'locate', 'search', 'scale'], label: tr('pickTitle') });
    const pin = content.querySelector('.ac-map-picker__pin'); const title = content.querySelector('.ac-map-picker__text b'); const coord = content.querySelector('.ac-map-picker__text small');
    let address = o.address || ''; let ctrl = null;
    const lookup = async () => {
      const c = map.getCenter(); coord.textContent = formatLatLng(c);
      if (!geocoder?.reverse) { title.textContent = address || formatLatLng(c, 'dms'); return; }
      ctrl?.abort(); ctrl = new AbortController(); const my = ctrl; title.textContent = tr('loading');
      try { const r = await geocoder.reverse(c.lat, c.lng, { signal: my.signal, lang: AC.i18n?.lang }); if (my !== ctrl) return; address = r ? [r.label, r.sub].filter(Boolean).join('، ') : ''; title.textContent = r?.label || tr('unknown'); }
      catch (e) { if (e.name !== 'AbortError') title.textContent = tr('unknown'); }
    };
    map.on('movestart', () => { pin.dataset.lift = ''; title.textContent = '…'; });
    map.on('moveend', () => { delete pin.dataset.lift; if (!reduced()) pin.firstElementChild.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-5px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' }); lookup(); });
    map.on('move', () => { coord.textContent = formatLatLng(map.getCenter()); });
    lookup();
    layer?.addEventListener('ac:modal:close', (e) => {
      const ok = e.detail.reason === 'ok'; const c = map.getCenter();
      resolve(ok ? { lat: +c.lat.toFixed(6), lng: +c.lng.toFixed(6), address } : null);
    }, { once: true });
    layer?.addEventListener('ac:modal:closed', () => map.destroy(), { once: true });
    if (!api) resolve(null);
  });
}

function createPicker(el) {
  const o = AC.options(el, { name: 'location', zoom: 15 });
  const name = o.name;
  const input = (k) => el.querySelector(`input[name="${name}[${k}]"]`) || el.appendChild(Object.assign(document.createElement('input'), { type: 'hidden', name: `${name}[${k}]` }));
  const iLat = input('lat'); const iLng = input('lng'); const iAddr = input('address');
  if (o.lat != null && !iLat.value) { iLat.value = o.lat; iLng.value = o.lng; iAddr.value = o.address || ''; }
  el.classList.add('ac-locpick');
  const ui = document.createElement('div'); ui.className = 'ac-locpick__ui';
  ui.innerHTML = `<span class="ac-locpick__thumb" aria-hidden="true">${icon('map-pinned')}</span><span class="ac-locpick__text"><b></b><small dir="ltr"></small></span><button type="button" class="ac-btn ac-btn--sm"></button>`;
  el.prepend(ui);
  const b = ui.querySelector('button'); const t = ui.querySelector('b'); const s = ui.querySelector('small');
  const value = () => (iLat.value ? { lat: +iLat.value, lng: +iLng.value, address: iAddr.value } : null);
  const render = () => {
    const v = value(); el.toggleAttribute('data-empty', !v);
    t.textContent = v ? v.address || tr('unknown') : tr('none'); s.textContent = v ? formatLatLng(v) : '';
    b.innerHTML = `${icon(v ? 'pencil' : 'map-pin-plus')}<span>${esc(tr(v ? 'change' : 'pick'))}</span>`;
  };
  render();
  const geocoder = () => el.geocoder || AC.map.defaultGeocoder || null;
  const onClick = async () => {
    const cur = AC.options(el, { zoom: 15 });
    const r = await pick({ value: value(), address: iAddr.value, center: cur.center, zoom: cur.zoom, geocoder: geocoder(), tiles: cur.tiles || el.tiles });
    if (!r) return;
    iLat.value = r.lat; iLng.value = r.lng; iAddr.value = r.address || '';
    render();
    [iLat, iLng, iAddr].forEach((i) => i.dispatchEvent(new Event('change', { bubbles: true })));
    AC.emit(el, 'location-picker:change', r);
  };
  b.addEventListener('click', onClick);
  const offI = AC.on(document, 'ac:i18n:change', render);
  const api = { get value() { return value(); }, set(v) { iLat.value = v?.lat ?? ''; iLng.value = v?.lng ?? ''; iAddr.value = v?.address ?? ''; render(); }, open: onClick, destroy() { offI(); b.removeEventListener('click', onClick); ui.remove(); } };
  AC.instance(el, 'location-picker', api);
  return api;
}

/* ------------------------------------------------------------------ install */
function cssOnce() {
  if (typeof document === 'undefined' || document.querySelector('[data-ac-module="maps"]')) return;
  if (getComputedStyle(document.documentElement).getPropertyValue('--ac-map-css').trim()) return; // already bundled
  try { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./maps.css', (globalThis.__AC_MODS__?.__base || import.meta.url)).href; l.dataset.acModule = 'maps'; document.head.append(l); } catch { /* bundled */ }
}
function parseOpts(el) {
  const o = AC.options(el, {});
  if (typeof o.center === 'string') o.center = ll(o.center);
  if (typeof o.controls === 'string') o.controls = listOpt(o.controls);
  if (typeof o.tiles === 'string' && o.tiles.includes(',')) { const [light, dark] = o.tiles.split(','); o.tiles = { light, dark }; }
  return o;
}

function install(ac) {
  if (!ac || ac.map) return ac?.map;
  AC = ac;
  cssOnce();
  const map = (target, opts = {}) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    AC.instance(el, 'map')?.destroy?.();
    return AC.instance(el, 'map', new MapView(el, opts));
  };
  Object.assign(map, { providers, geocoders, pick, Marker, Path, Heat, Cluster, Group, MapView, utils: { ll, project, unproject, distance, pathLength, area, bounds, formatLatLng, formatDistance, formatArea } });
  AC.map = map;
  AC.register('map', (el) => { const m = new MapView(el, parseOpts(el)); AC.instance(el, 'map', m); return () => m.destroy(); });
  AC.register('location-picker', (el) => { const p = createPicker(el); return () => p.destroy(); });
  return map;
}

if (typeof window !== 'undefined' && window.AC) install(window.AC);
return Object.freeze({ ll, project, unproject, distance, pathLength, area, bounds, formatLatLng, formatDistance, formatArea, providers, geocoders, Marker, Path, Heat, Group, Cluster, MapView, pick, install });
})();

return { f: F, ns: Object.freeze({ "ll": __ac_m1g["ll"], "project": __ac_m1g["project"], "unproject": __ac_m1g["unproject"], "distance": __ac_m1g["distance"], "pathLength": __ac_m1g["pathLength"], "area": __ac_m1g["area"], "bounds": __ac_m1g["bounds"], "formatLatLng": __ac_m1g["formatLatLng"], "formatDistance": __ac_m1g["formatDistance"], "formatArea": __ac_m1g["formatArea"], "providers": __ac_m1g["providers"], "geocoders": __ac_m1g["geocoders"], "Marker": __ac_m1g["Marker"], "Path": __ac_m1g["Path"], "Heat": __ac_m1g["Heat"], "Group": __ac_m1g["Group"], "Cluster": __ac_m1g["Cluster"], "MapView": __ac_m1g["MapView"], "pick": __ac_m1g["pick"], "install": __ac_m1g["install"] }) };
})();
export const { ll, project, unproject, distance, pathLength, area, bounds, formatLatLng, formatDistance, formatArea, providers, geocoders, Marker, Path, Heat, Group, Cluster, MapView, pick, install } = __R["maps"].ns;
export default __R["maps"].ns;
