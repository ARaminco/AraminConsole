/* Realistic, deterministic mock data for the demo (Persian + English names, ISO dates — the
   UI renders them as Jalali in fa via AC.format.date). Named exports only. */

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];
const DAY = 86400000;
const today = new Date(); today.setHours(12, 0, 0, 0);
export const daysAgo = (n) => new Date(today.getTime() - n * DAY);
const iso = (d) => d.toISOString();

const PEOPLE = [
  ['سارا احمدی', 'sara.ahmadi', 'nikan.ir'], ['James Miller', 'james', 'acme.co'], ['محمد رضایی', 'm.rezaei', 'gmail.com'],
  ['Fatima Al-Mansouri', 'fatima', 'dubai.ae'], ['نگار کریمی', 'negar.k', 'yahoo.com'], ['Oliver Brown', 'oliver', 'northwind.io'],
  ['علی موسوی', 'ali.mousavi', 'digikala.com'], ['Emma Wilson', 'emma.w', 'linear.app'], ['مریم حسینی', 'maryam.h', 'snapp.ir'],
  ['Liam Johnson', 'liam', 'stripe.com'], ['رضا جعفری', 'reza.j', 'cafebazaar.ir'], ['Sophia Garcia', 'sophia', 'vercel.com'],
  ['زهرا محمدی', 'zahra.m', 'tapsi.ir'], ['Noah Davis', 'noah.d', 'figma.com'], ['حسین نوری', 'h.nouri', 'aparat.com'],
  ['Ava Martinez', 'ava', 'notion.so'], ['فاطمه صادقی', 'f.sadeghi', 'divar.ir'], ['Ethan Clark', 'ethan', 'github.com'],
  ['امیر قاسمی', 'amir.gh', 'alibaba.ir'], ['Mia Rodriguez', 'mia.r', 'shopify.com'], ['الهام رحیمی', 'elham.r', 'gmail.com'],
  ['Lucas Lewis', 'lucas', 'atlassian.com'], ['کامران شریفی', 'k.sharifi', 'irancell.ir'], ['Isabella Walker', 'bella', 'adobe.com'],
  ['نیلوفر عباسی', 'niloofar', 'filimo.com'], ['Mason Hall', 'mason', 'slack.com'], ['پویا اکبری', 'pouya.a', 'sheypoor.com'],
  ['Amelia Young', 'amelia', 'canva.com'], ['شیرین یزدانی', 'shirin.y', 'gmail.com'], ['Omar Haddad', 'omar', 'careem.com'],
  ['بهاره کاظمی', 'bahareh.k', 'zarinpal.com'], ['Charlotte King', 'charlotte', 'airbnb.com'], ['مهدی فراهانی', 'mahdi.f', 'arvancloud.ir'],
  ['Henry Wright', 'henry', 'spotify.com'], ['سمیرا نجفی', 'samira.n', 'yahoo.com'], ['Layla Nasser', 'layla', 'noon.com'],
  ['آرش تهرانی', 'arash.t', 'hamravesh.com'], ['Benjamin Scott', 'ben', 'dropbox.com'], ['لیلا مرادی', 'leila.m', 'gmail.com'],
  ['Harper Green', 'harper', 'zapier.com'], ['کیان رستمی', 'kian.r', 'snappfood.ir'], ['Daniel Adams', 'daniel', 'intercom.io'],
  ['ترانه بهرامی', 'taraneh', 'basalam.com'], ['Yusuf Karim', 'yusuf', 'talabat.com'], ['سینا ملکی', 'sina.m', 'gmail.com'],
  ['Evelyn Baker', 'evelyn', 'hubspot.com'], ['پریسا انصاری', 'parisa.a', 'torob.com'], ['Jack Nelson', 'jack.n', 'twilio.com'],
  ['محسن کرمانی', 'mohsen.k', 'mapna.ir'], ['Grace Carter', 'grace', 'asana.com'], ['یاسمن فرهادی', 'yasaman', 'gmail.com'],
  ['Khalid Rahman', 'khalid', 'emirates.ae'], ['هومن پارسا', 'hooman.p', 'pasargad.ir'], ['Chloe Mitchell', 'chloe', 'loom.com'],
  ['نازنین شجاعی', 'nazanin', 'yahoo.com'], ['Samuel Perez', 'samuel', 'mozilla.org'], ['بابک وحیدی', 'babak.v', 'mellat.ir'],
  ['Zoe Roberts', 'zoe', 'miro.com'], ['آیدا سلطانی', 'aida.s', 'gmail.com'], ['Ali Asghar Ramin', 'ali', 'aramin.dev'],
];
const ROLES = ['admin', 'editor', 'viewer', 'support', 'developer'];
const ROLE_W = [0.1, 0.25, 0.35, 0.15, 0.15];
const TEAMS = ['Growth', 'Platform', 'Support', 'Design', 'Finance', 'Sales'];
const COUNTRIES = ['IR', 'AE', 'US', 'GB', 'DE', 'TR', 'CA'];
const initials = (name) => {
  const parts = name.replace(/^Al-/, '').split(/\s+/).filter(Boolean);
  return parts[0][0] + ((parts[1] || '')[0] || '');
};
function weighted(r, items, w) {
  let x = r(); for (let i = 0; i < items.length; i++) { x -= w[i]; if (x <= 0) return items[i]; }
  return items[items.length - 1];
}

const ur = rng(42);
export const users = PEOPLE.map(([name, handle, domain], i) => {
  const joinedDays = Math.floor(ur() * 900) + 2;
  const status = i === PEOPLE.length - 1 ? 'active' : weighted(ur, ['active', 'invited', 'suspended'], [0.72, 0.18, 0.1]);
  return {
    id: 1000 + i,
    name,
    email: `${handle}@${domain}`,
    initials: initials(name),
    color: (i % 8) + 1,
    role: i === PEOPLE.length - 1 ? 'owner' : weighted(ur, ROLES, ROLE_W),
    status,
    team: pick(ur, TEAMS),
    country: /\.ir$/.test(domain) || /[؀-ۿ]/.test(name) ? 'IR' : /\.ae$/.test(domain) ? 'AE' : pick(ur, COUNTRIES),
    joined: iso(daysAgo(joinedDays)),
    lastSeen: iso(new Date(Date.now() - Math.floor(ur() * 20 * DAY))),
    spend: Math.round(ur() * ur() * 24000 * 100) / 100,
    completion: Math.min(100, Math.round(35 + ur() * 70)),
    twoFactor: ur() > 0.35,
  };
});

const or = rng(7);
const ORDER_STATUS = ['paid', 'pending', 'shipped', 'refunded'];
export const products = [
  ['Studio Display 27"', 'Electronics', 1599, 'monitor'], ['Pixel Pro 9', 'Electronics', 899, 'smartphone'],
  ['کیف چرمی دست‌دوز', 'Fashion', 129, 'shopping-bag'], ['PowerBank 20K', 'Accessories', 49, 'zap'],
  ['هدفون بی‌سیم نویز‌کنسل', 'Electronics', 249, 'heart'], ['Mechanical Keyboard K8', 'Accessories', 119, 'command'],
  ['فرش دستباف کاشان', 'Home', 2400, 'layers'], ['Smart Watch S3', 'Electronics', 329, 'clock'],
  ['زعفران سرگل ۱۰ گرمی', 'Grocery', 35, 'sparkles'], ['Ergo Chair Pro', 'Home', 589, 'box'],
].map(([name, category, price, icon], i) => ({
  id: `P-${310 + i}`, sku: `SKU-${(48213 + i * 97).toString(36).toUpperCase()}`, name, category, price, icon,
  stock: Math.floor(or() * 420), sales: Math.floor(200 + or() * 1400), rating: Math.round((3.6 + or() * 1.4) * 10) / 10,
}));
export const orders = Array.from({ length: 48 }, (_, i) => {
  const u = users[Math.floor(or() * users.length)];
  const p = products[Math.floor(or() * products.length)];
  const qty = 1 + Math.floor(or() * 3);
  return {
    id: `INV-${2041 - i}`, customer: u.name, email: u.email, initials: u.initials, color: u.color,
    product: p.name, qty, amount: Math.round(p.price * qty * 100) / 100, currency: 'USD',
    status: i < 3 ? ['paid', 'pending', 'shipped'][i] : weighted(or, ORDER_STATUS, [0.55, 0.18, 0.2, 0.07]),
    date: iso(new Date(Date.now() - i * 0.6 * DAY - or() * DAY * 0.5)),
    channel: or() > 0.3 ? 'online' : 'store',
  };
});

export const servers = [
  { id: 'web-01', region: 'Tehran · AZ1', role: 'nginx', cpu: 38, ram: 61, disk: 44, status: 'online', uptime: 99.99 },
  { id: 'web-02', region: 'Tehran · AZ2', role: 'nginx', cpu: 42, ram: 58, disk: 47, status: 'online', uptime: 99.98 },
  { id: 'api-01', region: 'Frankfurt', role: 'node', cpu: 71, ram: 77, disk: 52, status: 'online', uptime: 99.95 },
  { id: 'db-01', region: 'Tehran · AZ1', role: 'mysql', cpu: 55, ram: 83, disk: 71, status: 'online', uptime: 99.99 },
  { id: 'db-02', region: 'Tehran · AZ2', role: 'mysql replica', cpu: 22, ram: 64, disk: 85, status: 'degraded', uptime: 99.7 },
  { id: 'queue-01', region: 'Dubai', role: 'redis', cpu: 12, ram: 35, disk: 18, status: 'online', uptime: 100 },
  { id: 'worker-03', region: 'Frankfurt', role: 'jobs', cpu: 0, ram: 0, disk: 61, status: 'offline', uptime: 97.2 },
];

const LOG_TEMPLATES = [
  ['info', 'nginx', () => `GET /api/v1/orders?page=${1 + Math.floor(lr() * 9)} 200 ${8 + Math.floor(lr() * 90)}ms`],
  ['info', 'api', () => `user ${pick(lr, users).email} signed in from ${pick(lr, ['Tehran', 'Dubai', 'Berlin', 'Shiraz', 'London'])}`],
  ['debug', 'worker', () => `job send-invoice#${4000 + Math.floor(lr() * 900)} picked up by worker-0${1 + Math.floor(lr() * 3)}`],
  ['debug', 'cache', () => `redis HIT ratio ${(90 + lr() * 9).toFixed(1)}% (keys=${12000 + Math.floor(lr() * 900)})`],
  ['info', 'deploy', () => `release v2.4.${Math.floor(lr() * 9)} healthy on ${pick(lr, servers).id}`],
  ['warn', 'db', () => `slow query 1.${Math.floor(lr() * 9)}s: SELECT * FROM orders WHERE status = 'pending'`],
  ['warn', 'api', () => `rate limit 80% for token sk_live_…${Math.floor(lr() * 9000 + 1000)}`],
  ['error', 'payment', () => `gateway timeout after 30000ms (order INV-${1900 + Math.floor(lr() * 140)})`],
  ['info', 'auth', () => `2FA verified for ${pick(lr, users).email}`],
  ['error', 'worker', () => `ECONNREFUSED 10.0.4.${Math.floor(lr() * 250)}:6379 — retrying in 5s`],
  ['debug', 'nginx', () => `upstream api-01 keepalive reused (${Math.floor(lr() * 64)} idle)`],
];
const LOG_W = [0.24, 0.12, 0.14, 0.1, 0.06, 0.08, 0.06, 0.04, 0.08, 0.03, 0.05];
const lr = rng(99);
let logSeq = 0;
/** One realistic log line { id, ts (ms), level, src, msg }. */
export function makeLog(ts = Date.now()) {
  const [level, src, msg] = weighted(lr, LOG_TEMPLATES, LOG_W);
  return { id: ++logSeq, ts, level, src, msg: msg() };
}
export const logs = Array.from({ length: 240 }, (_, i) => makeLog(Date.now() - (240 - i) * 1700 - Math.floor(lr() * 900)));

/* ---- analytics -------------------------------------------------------- */
const ar = rng(2024);
/** Daily visitors for the last `days` days (weekly rhythm + growth + noise). */
export const dailyVisits = Array.from({ length: 371 }, (_, i) => {
  const d = daysAgo(370 - i);
  const dow = d.getDay();
  const base = 900 + i * 2.1 + (dow === 5 ? -320 : dow === 4 ? -140 : 0);
  return { date: iso(d), value: Math.max(40, Math.round(base * (0.8 + ar() * 0.4))) };
});
/** Contribution-style activity (0..n) for the heatmap. */
export const activity = dailyVisits.map((d, i) => ({ date: d.date, value: ar() < 0.18 ? 0 : Math.floor(ar() * ar() * 14 + (i % 7 === 3 ? 3 : 0)) }));

export const ranges = {
  '7d': { points: 7, unit: 'day' },
  '30d': { points: 30, unit: 'day' },
  '90d': { points: 13, unit: 'week' },
  '12m': { points: 12, unit: 'month' },
};
/** Aggregated visitors/sessions for a range key. */
export function trafficFor(range = '30d') {
  const { points, unit } = ranges[range] || ranges['30d'];
  const size = unit === 'day' ? 1 : unit === 'week' ? 7 : 30;
  const visitors = []; const sessions = []; const dates = [];
  for (let p = points - 1; p >= 0; p--) {
    const end = dailyVisits.length - p * size;
    const slice = dailyVisits.slice(Math.max(0, end - size), end);
    const v = slice.reduce((s, x) => s + x.value, 0);
    visitors.push(v); sessions.push(Math.round(v * (1.38 + ((p * 37) % 11) / 100)));
    dates.push(slice[slice.length - 1].date);
  }
  return { unit, dates, visitors, sessions };
}

export const topPages = [
  { path: '/', title: 'Home', views: 48210, unique: 31870, bounce: 32.4, time: 94 },
  { path: '/pricing', title: 'Pricing', views: 21490, unique: 17320, bounce: 41.2, time: 128 },
  { path: '/blog/rtl-admin-panels', title: 'RTL admin panels', views: 15880, unique: 13990, bounce: 58.9, time: 241 },
  { path: '/docs/getting-started', title: 'Getting started', views: 12410, unique: 9020, bounce: 22.1, time: 312 },
  { path: '/fa/blog/jalali-date-picker', title: 'تقویم جلالی بدون وابستگی', views: 9930, unique: 8410, bounce: 47.5, time: 188 },
  { path: '/changelog', title: 'Changelog', views: 6120, unique: 4470, bounce: 36.8, time: 75 },
  { path: '/signup', title: 'Sign up', views: 5840, unique: 5320, bounce: 18.3, time: 66 },
];
export const referrers = [
  { source: 'google.com', visits: 38420, change: 12.4 }, { source: 'github.com', visits: 9310, change: 31.9 },
  { source: 'twitter.com', visits: 6120, change: -4.2 }, { source: 'virgool.io', visits: 4880, change: 18.6 },
  { source: 'news.ycombinator.com', visits: 3150, change: 210.5 }, { source: 'linkedin.com', visits: 2240, change: -1.3 },
];

/* ---- ops console, monitoring, roles, profile, settings (pages-a) ------------------------- */
const opr = rng(311);
/** Services the ops console watches: CoHub shared hosting, WhatsApp gateways, AI gateways. */
export const opsServices = [
  { id: 'edge', name: 'nginx edge', group: 'hosting', icon: 'globe', host: 'srv.cohub.co', status: 'online', uptime: 99.99, latency: 38 },
  { id: 'php', name: 'PHP-FPM pools', group: 'hosting', icon: 'code', host: 'srv.cohub.co', status: 'online', uptime: 99.97, latency: 112 },
  { id: 'mysql', name: 'MySQL 8', group: 'hosting', icon: 'database', host: 'db-01', status: 'online', uptime: 99.99, latency: 4 },
  { id: 'redis', name: 'Redis cache', group: 'hosting', icon: 'layers', host: 'queue-01', status: 'online', uptime: 100, latency: 1 },
  { id: 'wapi-1', name: 'wapi · WhatsApp 1', group: 'whatsapp', icon: 'message-circle', host: 'wapi.cohub.co', status: 'online', uptime: 99.92, latency: 210 },
  { id: 'wapi-2', name: 'wapi · WhatsApp 2', group: 'whatsapp', icon: 'message-circle', host: 'wapi2.cohub.co', status: 'degraded', uptime: 98.4, latency: 940 },
  { id: 'omniroute', name: 'OmniRoute AI', group: 'ai', icon: 'bot-message-square', host: 'ai.cohub.co', status: 'online', uptime: 99.95, latency: 320 },
  { id: 'codex', name: 'Codex proxy', group: 'ai', icon: 'square-terminal', host: 'codex.cohub.co', status: 'online', uptime: 99.81, latency: 450 },
  { id: 'mail', name: 'Postfix mail', group: 'hosting', icon: 'mail', host: 'mx.cohub.co', status: 'online', uptime: 99.9, latency: 65 },
  { id: 'backup', name: 'Nightly backups', group: 'hosting', icon: 'hard-drive', host: 'nas-02', status: 'down', uptime: 96.7, latency: 0 },
  { id: 'dns', name: 'DNS', group: 'hosting', icon: 'network', host: 'ns1.cohub.co', status: 'online', uptime: 100, latency: 9 },
  { id: 'webhooks', name: 'Webhook relay', group: 'ai', icon: 'webhook', host: 'hooks.cohub.co', status: 'online', uptime: 99.86, latency: 74 },
];
/** 90 daily uptime cells per service: 'up' | 'partial' | 'down'. */
export function uptimeDays(service, days = 90) {
  const r = rng(service.id.split('').reduce((a, c) => a + c.charCodeAt(0), 7));
  const bad = 100 - service.uptime;
  return Array.from({ length: days }, (_, i) => {
    const x = r() * 100;
    if (service.status === 'down' && i >= days - 2) return 'down';
    if (service.status === 'degraded' && i === days - 1) return 'partial';
    return x < bad * 0.35 ? 'down' : x < bad * 1.6 ? 'partial' : 'up';
  });
}
const JOB_NAMES = [
  ['backup:site', 'backups'], ['ssl:renew', 'certs'], ['wapi:send-batch', 'whatsapp'], ['ai:embed-docs', 'ai'], ['mail:digest', 'mail'],
  ['cache:warm', 'default'], ['invoice:pdf', 'default'], ['wapi:sync-history', 'whatsapp'], ['db:optimize', 'maintenance'], ['ai:transcribe', 'ai'],
  ['sitemap:build', 'default'], ['logs:rotate', 'maintenance'], ['wapi:media-upload', 'whatsapp'], ['backup:db', 'backups'],
];
const SITES = ['nikoojoo.ir', 'negahefanavari.com', 'drlawyer.ir', 'cohub.co', 'netarz.ir', 'nobatgir.com'];
export const opsJobs = JOB_NAMES.map(([name, queue], i) => {
  const status = i < 3 ? 'running' : i < 6 ? 'queued' : i === 6 || i === 11 ? 'failed' : 'done';
  return {
    id: `job-${8410 - i}`, name, queue, status,
    target: /^(backup|ssl|sitemap)/.test(name) ? pick(opr, SITES) : pick(opr, ['wapi-1', 'wapi-2', 'omniroute', 'srv', 'db-01']),
    progress: status === 'running' ? Math.round(15 + opr() * 75) : status === 'done' ? 100 : 0,
    attempts: status === 'failed' ? 3 : 1 + Math.floor(opr() * 1.4),
    started: iso(new Date(Date.now() - (i * 7 + opr() * 6) * 60000)),
  };
});
export const opsIncidents = [
  { id: 'INC-214', tone: 'danger', service: 'backup', title: 'پشتیبان شبانه روی nas-02 شکست خورد', text: 'دیسک مقصد پر است؛ ۳ تلاش ناموفق. پشتیبان‌ها موقتاً به nas-01 هدایت شد.', min: 42, open: true },
  { id: 'INC-213', tone: 'warning', service: 'wapi-2', title: 'تأخیر بالا در درگاه واتس‌اپ ۲', text: 'صف ارسال ۲۳۰ پیام دارد؛ نشست دوباره وصل شد و در حال تخلیه است.', min: 95, open: true },
  { id: 'INC-212', tone: 'success', service: 'php', title: 'نشت حافظهٔ PHP-FPM رفع شد', text: 'استخر سایت nobatgir.com بازراه‌اندازی شد و سقف حافظه ۲۵۶ مگابایت شد.', min: 380, open: false },
  { id: 'INC-211', tone: 'info', service: 'omniroute', title: 'کلید تازه برای مسیر Codex ثبت شد', text: 'مسیریاب هوش مصنوعی کلید را بدون قطعی چرخاند.', min: 1310, open: false },
  { id: 'INC-210', tone: 'success', service: 'edge', title: 'گواهی SSL برای ۱۴ سایت تمدید شد', text: 'همهٔ دامنه‌ها تمدید شدند؛ آزمون پیکربندی nginx موفق بود و بارگذاری مجدد انجام شد.', min: 2880, open: false },
];
export const opsAlerts = [
  { id: 'a1', tone: 'danger', icon: 'hard-drive', server: 'db-02', title: 'دیسک ۸۵٪ پر است', min: 6 },
  { id: 'a2', tone: 'warning', icon: 'cpu', server: 'api-01', title: 'میانگین CPU بالای ۷۰٪ در ۱۵ دقیقهٔ اخیر', min: 14 },
  { id: 'a3', tone: 'danger', icon: 'server-crash', server: 'worker-03', title: 'سرور به ping پاسخ نمی‌دهد', min: 31 },
  { id: 'a4', tone: 'info', icon: 'refresh-cw', server: 'web-02', title: 'به‌روزرسانی امنیتی کرنل منتظر راه‌اندازی مجدد', min: 120 },
  { id: 'a5', tone: 'warning', icon: 'memory-stick', server: 'db-01', title: 'حافظه ۸۳٪ — نزدیک آستانه', min: 190 },
];

export const permResources = [
  ['dashboard', 'layout-dashboard'], ['users', 'users'], ['orders', 'shopping-cart'], ['products', 'package'], ['invoices', 'receipt'],
  ['servers', 'server'], ['whatsapp', 'message-circle'], ['ai', 'bot'], ['billing', 'credit-card'], ['settings', 'settings'],
].map(([id, icon]) => ({ id, icon }));
export const permActions = ['view', 'create', 'edit', 'delete', 'export'];
const grant = (rows) => Object.fromEntries(permResources.map((r) => [r.id, rows[r.id] ?? []]));
const ALL_ACTIONS = permActions;
export const roles = [
  { id: 'owner', color: 1, users: 1, system: true, perms: grant(Object.fromEntries(permResources.map((r) => [r.id, ALL_ACTIONS]))) },
  { id: 'admin', color: 2, users: 4, system: true, perms: grant({ dashboard: ALL_ACTIONS, users: ALL_ACTIONS, orders: ALL_ACTIONS, products: ALL_ACTIONS, invoices: ALL_ACTIONS, servers: ['view', 'edit'], whatsapp: ['view', 'create', 'edit'], ai: ['view', 'edit'], billing: ['view'], settings: ['view', 'edit'] }) },
  { id: 'developer', color: 5, users: 6, perms: grant({ dashboard: ['view'], servers: ALL_ACTIONS, whatsapp: ['view', 'edit'], ai: ALL_ACTIONS, settings: ['view'] }) },
  { id: 'editor', color: 3, users: 9, perms: grant({ dashboard: ['view'], orders: ['view', 'edit'], products: ['view', 'create', 'edit'], invoices: ['view', 'export'] }) },
  { id: 'support', color: 4, users: 7, perms: grant({ dashboard: ['view'], users: ['view'], orders: ['view', 'edit'], whatsapp: ['view', 'create'], invoices: ['view'] }) },
  { id: 'viewer', color: 6, users: 21, perms: grant({ dashboard: ['view'], orders: ['view'], products: ['view'], invoices: ['view'] }) },
];

export const sessions = [
  { id: 's1', device: 'Windows 11 · Chrome', icon: 'monitor', place: 'Tehran, IR', ip: '5.112.40.18', min: 0, current: true },
  { id: 's2', device: 'iPhone 16 · Safari', icon: 'smartphone', place: 'Dubai, AE', ip: '94.200.3.77', min: 18 },
  { id: 's3', device: 'MacBook Air · Firefox', icon: 'laptop', place: 'Shiraz, IR', ip: '37.255.9.140', min: 2880 },
  { id: 's4', device: 'Remote terminal', icon: 'square-terminal', place: 'Tehran, IR', ip: '5.112.40.18', min: 7200 },
];
export const apiKeys = [
  { id: 'k1', name: 'Production', prefix: 'ak_live', scope: 'read · write', created: iso(daysAgo(120)), used: 3 },
  { id: 'k2', name: 'WhatsApp gateway', prefix: 'ak_wapi', scope: 'messages', created: iso(daysAgo(44)), used: 60 },
  { id: 'k3', name: 'CI / deploy', prefix: 'ak_test', scope: 'read', created: iso(daysAgo(9)), used: 4320 },
];
/** Random-looking but deterministic API key. */
export function makeKey(prefix, seed = 1) {
  const r = rng(seed); const abc = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `${prefix}_${Array.from({ length: 28 }, () => abc[Math.floor(r() * abc.length)]).join('')}`;
}

/* ---- app screens: kanban, calendar, chat, mail, files, activity (pages-b) ---- */
const inDays = (n, h = 12, m = 0) => { const d = new Date(today.getTime() + n * DAY); d.setHours(h, m, 0, 0); return d; };
export const team = [
  { id: 'sa', name: 'سارا احمدی', initials: 'سا', color: 2 }, { id: 'mr', name: 'محمد رضایی', initials: 'مر', color: 5 },
  { id: 'nk', name: 'نگار کریمی', initials: 'نک', color: 3 }, { id: 'am', name: 'علی موسوی', initials: 'عم', color: 4 },
  { id: 'em', name: 'Emma Wilson', initials: 'EW', color: 6 }, { id: 'ar', name: 'علی‌اصغر رامین', initials: 'ع‌ر', color: 1 },
];
const KB_LABELS = { design: ['طراحی', 'info'], dev: ['توسعه', 'accent'], bug: ['باگ', 'danger'], docs: ['مستندات', 'neutral'], research: ['پژوهش', 'success'], urgent: ['فوری', 'warning'] };
const kbCard = (id, title, labels, members, due, progress, extra = {}) => ({ id, title, labels: labels.map((k) => ({ key: k, text: KB_LABELS[k][0], tone: KB_LABELS[k][1] })), members, due: due == null ? null : iso(inDays(due)), progress, comments: extra.c ?? 0, files: extra.f ?? 0, desc: extra.d ?? '', checklist: extra.k ?? [] });
export const kanbanBoard = [
  { id: 'backlog', i18n: 'kanban.backlog', title: 'ایده‌ها', tone: 'neutral', cards: [
    kbCard('k1', 'حالت آفلاین برای اپ موبایل', ['research'], ['nk'], 21, 0, { c: 2, d: 'بررسی Service Worker و همگام‌سازی پس‌زمینه برای فرم‌ها.' }),
    kbCard('k2', 'خروجی PDF برای گزارش‌های ماهانه', ['dev'], ['mr', 'ar'], 30, 0, { f: 1 }),
    kbCard('k3', 'راهنمای شروع سریع برای مشتریان جدید', ['docs'], ['em'], null, 10, { c: 1 }),
  ] },
  { id: 'todo', i18n: 'kanban.todo', title: 'برای انجام', tone: 'info', cards: [
    kbCard('k4', 'بازطراحی صفحهٔ ورود با کد یک‌بارمصرف', ['design', 'urgent'], ['sa', 'nk'], 2, 20, { c: 6, f: 3, d: 'نسخهٔ جدید با ورود پیامکی، ورود با گوگل و حالت تیره.', k: [['وایرفریم', true], ['طرح نهایی', false], ['تحویل به توسعه', false]] }),
    kbCard('k5', 'اتصال درگاه پرداخت زرین‌پال', ['dev'], ['mr'], 5, 0, { c: 3 }),
    kbCard('k6', 'رفع تداخل تاریخ شمسی در فیلتر سفارش‌ها', ['bug'], ['am'], -1, 0, { c: 4, d: 'فیلتر بازهٔ تاریخ در تقویم شمسی یک روز جابه‌جا می‌شود.' }),
  ] },
  { id: 'doing', i18n: 'kanban.doing', title: 'در حال انجام', tone: 'warning', cards: [
    kbCard('k7', 'داشبورد تحلیل فروش با نمودارهای جدید', ['dev', 'design'], ['sa', 'mr', 'ar'], 3, 65, { c: 9, f: 4, k: [['نمودار درآمد', true], ['نمودار سفارش‌ها', true], ['نقشهٔ حرارتی', false], ['خروجی CSV', false]] }),
    kbCard('k8', 'مهاجرت پایگاه داده به PostgreSQL 17', ['dev'], ['am', 'em'], 7, 40, { c: 2, f: 1 }),
  ] },
  { id: 'review', i18n: 'kanban.review', title: 'بازبینی', tone: 'accent', cards: [
    kbCard('k9', 'کامپوننت تقویم با پشتیبانی جلالی و میلادی', ['dev'], ['nk', 'ar'], 1, 90, { c: 5, f: 2 }),
    kbCard('k10', 'مستندات API نسخهٔ ۲', ['docs'], ['em'], 4, 80, { c: 1 }),
  ] },
  { id: 'done', i18n: 'kanban.done', title: 'انجام‌شده', tone: 'success', cards: [
    kbCard('k11', 'راه‌اندازی اعلان‌های واتس‌اپ', ['dev'], ['mr', 'sa'], -3, 100, { c: 12, f: 2 }),
    kbCard('k12', 'آزمون دسترسی‌پذیری صفحه‌های اصلی', ['research'], ['nk'], -6, 100, { c: 3 }),
  ] },
];

export const calEvents = [
  [0, 9, 0, 60, 'جلسهٔ روزانهٔ تیم', 'accent', 'Google Meet'], [0, 11, 30, 90, 'بازبینی طراحی داشبورد', 'info', 'اتاق ۲'], [0, 16, 0, 45, 'تماس با مشتری — نیکان', 'success', ''],
  [1, 10, 0, 120, 'کارگاه معماری سرویس‌ها', 'warning', 'سالن اصلی'], [1, 14, 0, 30, 'مصاحبهٔ استخدامی', 'neutral', ''],
  [2, 9, 0, 60, 'جلسهٔ روزانهٔ تیم', 'accent', 'Google Meet'], [2, 13, 0, 60, 'ناهار کاری با سرمایه‌گذار', 'success', 'کافه لمیز'],
  [3, 15, 30, 90, 'دموی محصول برای فروش', 'info', ''], [4, 9, 0, 60, 'جلسهٔ روزانهٔ تیم', 'accent', 'Google Meet'], [4, 17, 0, 60, 'ورزش', 'danger', 'باشگاه'],
  [-1, 10, 0, 60, 'بررسی گزارش مالی', 'warning', ''], [-2, 12, 0, 90, 'جلسهٔ هیئت‌مدیره', 'danger', 'دفتر مرکزی'], [-3, 9, 30, 30, 'یک‌به‌یک با سارا', 'neutral', ''],
  [6, 11, 0, 120, 'انتشار نسخهٔ ۲.۴', 'accent', ''], [8, 10, 0, 60, 'برنامه‌ریزی اسپرینت', 'info', ''], [9, 14, 0, 60, 'آموزش تیم پشتیبانی', 'success', ''],
  [11, 16, 0, 60, 'جلسه با تیم حقوقی', 'warning', ''], [13, 9, 0, 240, 'نمایشگاه الکامپ', 'danger', 'تهران'], [-7, 13, 0, 60, 'تحویل فاز اول', 'success', ''],
  [-9, 10, 0, 60, 'جلسهٔ مشاوره', 'info', ''], [15, 12, 0, 60, 'تمدید دامنه‌ها', 'neutral', ''], [17, 18, 0, 90, 'شام تیمی', 'accent', 'رستوران'],
  [-12, 11, 0, 60, 'برنامه‌ریزی فصلی', 'warning', ''], [20, 10, 30, 60, 'بازبینی امنیتی', 'danger', ''],
].map(([d, h, m, len, title, tone, place], i) => ({ id: `e${i + 1}`, title, tone, place, start: iso(inDays(d, h, m)), end: iso(new Date(inDays(d, h, m).getTime() + len * 60000)) }));

export const chats = [
  { id: 'c1', name: 'سارا احمدی', initials: 'سا', color: 2, online: true, unread: 2, pinned: true, last: 'فایل طرح نهایی رو فرستادم 👌', min: 2, typing: true, messages: [
    ['t', 'سلام علی، وقت بخیر', 95], ['t', 'طرح صفحهٔ ورود آماده‌ست، می‌تونی یه نگاه بندازی؟', 94], ['m', 'سلام سارا، حتما. لینک فیگما رو بفرست', 90],
    ['t', { file: 'login-v3.fig', size: '4.2 MB' }, 60], ['t', { image: true, name: 'preview.png' }, 59], ['m', 'عالیه! فقط دکمهٔ اصلی رو مشکی کن مثل داشبورد', 30],
    ['m', { voice: '0:24' }, 28], ['t', 'باشه، الان اصلاح می‌کنم', 5], ['t', 'فایل طرح نهایی رو فرستادم 👌', 2] ] },
  { id: 'c2', name: 'تیم توسعه', initials: 'تت', color: 5, group: true, unread: 5, last: 'محمد: بیلد جدید روی استیج رفت', min: 14, messages: [
    ['t', 'محمد: بیلد جدید روی استیج رفت', 14], ['m', 'دمت گرم، تست می‌کنم', 12] ] },
  { id: 'c3', name: 'Emma Wilson', initials: 'EW', color: 6, online: true, last: 'Sounds good, see you tomorrow!', min: 55, messages: [
    ['m', 'Can we move the demo to 3pm?', 70], ['t', 'Sounds good, see you tomorrow!', 55] ] },
  { id: 'c4', name: 'محمد رضایی', initials: 'مر', color: 5, last: 'درگاه پرداخت وصل شد ✅', min: 180, messages: [['t', 'درگاه پرداخت وصل شد ✅', 180]] },
  { id: 'c5', name: 'نگار کریمی', initials: 'نک', color: 3, last: 'گزارش تست دسترسی‌پذیری', min: 600, messages: [['t', { file: 'a11y-report.pdf', size: '1.1 MB' }, 600]] },
  { id: 'c6', name: 'پشتیبانی مشتریان', initials: 'پش', color: 4, group: true, last: 'تیکت ۴۸۲ بسته شد', min: 1500, messages: [['t', 'تیکت ۴۸۲ بسته شد', 1500]] },
  { id: 'c7', name: 'Omar Haddad', initials: 'OH', color: 7, last: 'Thanks for the invoice', min: 2900, messages: [['t', 'Thanks for the invoice', 2900]] },
  { id: 'c8', name: 'علی موسوی', initials: 'عم', color: 4, last: 'فردا جلسه داریم؟', min: 4400, messages: [['t', 'فردا جلسه داریم؟', 4400]] },
];

export const mails = [
  ['m1', 'inbox', 'Stripe', 'ST', 6, 'پرداخت جدید دریافت شد — ۲۴۰ دلار', 'یک پرداخت جدید از مشتری Acme Co برای اشتراک سالانه دریافت شد. جزئیات تراکنش در داشبورد موجود است.', 8, false, true, false],
  ['m2', 'inbox', 'سارا احمدی', 'سا', 2, 'طرح نهایی صفحهٔ ورود', 'سلام علی، طرح نهایی صفحهٔ ورود را پیوست کرده‌ام. لطفا تا پایان روز نظرت را بگو تا تحویل توسعه بدهیم.', 35, true, false, true],
  ['m3', 'inbox', 'GitHub', 'GH', 1, '[AraminConsole] Pull request #128 merged', 'feat(kanban): pointer + touch drag with FLIP placeholder animation was merged into main by ARaminco.', 120, false, false, false],
  ['m4', 'inbox', 'محمد رضایی', 'مر', 5, 'گزارش عملکرد سرورها — هفتهٔ گذشته', 'میانگین زمان پاسخ ۱۸۰ میلی‌ثانیه بود و هیچ قطعی ثبت نشد. فایل گزارش کامل پیوست است.', 300, false, true, true],
  ['m5', 'inbox', 'Linear', 'LI', 7, 'You have 4 issues due this week', 'AC-212 Calendar week view · AC-219 Mail swipe actions · AC-220 Files context menu · AC-224 Pricing toggle', 600, false, false, false],
  ['m6', 'inbox', 'Emma Wilson', 'EW', 6, 'Demo moved to 3pm', 'Hi Ali, quick note that the product demo moved to 3pm tomorrow. Same link as before.', 1400, false, false, false],
  ['m7', 'inbox', 'آروان‌کلاد', 'AR', 3, 'فاکتور ماهانهٔ سرویس ابری', 'فاکتور این ماه صادر شد. مبلغ قابل پرداخت ۱۲٬۴۰۰٬۰۰۰ ریال است.', 2900, false, false, true],
  ['m8', 'inbox', 'نگار کریمی', 'نک', 3, 'نتیجهٔ آزمون دسترسی‌پذیری', 'همهٔ صفحه‌های اصلی امتیاز بالای ۹۵ گرفتند. دو مورد کنتراست در حالت تیره باقی مانده.', 4400, false, false, false],
  ['m9', 'sent', 'علی‌اصغر رامین', 'ع‌ر', 1, 'قرارداد همکاری', 'نسخهٔ نهایی قرارداد پیوست است.', 200, false, false, true],
  ['m10', 'drafts', 'علی‌اصغر رامین', 'ع‌ر', 1, 'پیش‌نویس: برنامهٔ فصل بعد', 'اهداف اصلی فصل بعد…', 900, false, false, false],
].map(([id, folder, from, initials, color, subject, body, min, unread, starred, attach]) => ({ id, folder, from, initials, color, subject, body, min, unread, starred, attach }));

export const fileTree = [
  { id: 'root', label: 'فایل‌های من', icon: 'hard-drive', open: true, children: [
    { id: 'design', label: 'طراحی', icon: 'folder', open: true, children: [{ id: 'brand', label: 'برند', icon: 'folder' }, { id: 'ui', label: 'رابط کاربری', icon: 'folder' }] },
    { id: 'docs', label: 'اسناد', icon: 'folder', children: [{ id: 'contracts', label: 'قراردادها', icon: 'folder' }] },
    { id: 'media', label: 'رسانه', icon: 'folder' }, { id: 'backups', label: 'پشتیبان‌ها', icon: 'folder' },
  ] },
  { id: 'shared', label: 'اشتراکی', icon: 'users' }, { id: 'trash', label: 'سطل زباله', icon: 'trash-2' },
];
export const files = [
  ['f1', 'طراحی', 'folder', null, 24, 1], ['f2', 'اسناد', 'folder', null, 58, 3], ['f3', 'رسانه', 'folder', null, 132, 6], ['f4', 'پشتیبان‌ها', 'folder', null, 7, 12],
  ['f5', 'login-v3.fig', 'design', 4.2, null, 0], ['f6', 'گزارش-مالی-۱۴۰۴.xlsx', 'sheet', 0.8, null, 1], ['f7', 'قرارداد-همکاری.pdf', 'pdf', 1.6, null, 2],
  ['f8', 'hero-banner.png', 'image', 2.4, null, 2], ['f9', 'معرفی-محصول.mp4', 'video', 86, null, 4], ['f10', 'podcast-ep12.mp3', 'audio', 32, null, 9],
  ['f11', 'source-v2.4.zip', 'archive', 18.5, null, 5], ['f12', 'api-client.ts', 'code', 0.02, null, 0], ['f13', 'logo-dark.svg', 'image', 0.01, null, 14], ['f14', 'یادداشت‌ها.md', 'doc', 0.01, null, 20],
].map(([id, name, kind, mb, items, d]) => ({ id, name, kind, mb, items, modified: iso(daysAgo(d)) }));

export const activityLog = [
  [0, '09:42', 'sa', 'git-merge', 'success', 'درخواست ادغام #128 را تأیید کرد', 'feat(kanban): drag & drop با پشتیبانی لمسی', ['AraminConsole']],
  [0, '09:10', 'mr', 'rocket', 'accent', 'نسخهٔ 2.4.0 را روی سرور اصلی منتشر کرد', 'زمان استقرار: ۳ دقیقه و ۱۲ ثانیه · بدون قطعی', ['production']],
  [0, '08:55', 'nk', 'message-square', 'info', 'روی «بازطراحی صفحهٔ ورود» نظر داد', '«رنگ دکمهٔ اصلی در حالت تیره کنتراست کافی ندارد.»', []],
  [1, '18:20', 'am', 'shield-check', 'success', 'ورود دومرحله‌ای را برای تیم پشتیبانی فعال کرد', '', ['security']],
  [1, '16:05', 'em', 'file-text', 'neutral', '۳ فایل به «اسناد» اضافه کرد', 'api-v2.pdf · changelog.md · roadmap.pdf', []],
  [1, '11:30', 'ar', 'user-plus', 'info', 'پریسا انصاری را به تیم طراحی دعوت کرد', '', []],
  [3, '14:00', 'mr', 'triangle-alert', 'danger', 'هشدار مصرف CPU روی api-2 را بست', 'علت: کوئری بدون ایندکس در گزارش سفارش‌ها', ['incident']],
  [3, '10:15', 'sa', 'credit-card', 'warning', 'پلن اشتراک را به «حرفه‌ای» ارتقا داد', '', ['billing']],
  [6, '12:40', 'nk', 'circle-check', 'success', 'اسپرینت ۱۴ را با ۲۳ کار بست', '', []],
].map(([d, time, who, icon, tone, title, text, tags], i) => ({ id: `a${i}`, day: iso(daysAgo(d)), time, who, icon, tone, title, text, tags }));

/* ---- support: tickets, support chat, customer panel (modules tickets / support-chat / user-panel) ---- */
const minsFromNow = (m) => new Date(Date.now() + m * 60000).toISOString();
export const ticketAgents = [
  { id: 'sa', name: 'سارا احمدی', initials: 'سا', color: 2, role: 'پشتیبان ارشد', online: true },
  { id: 'mr', name: 'محمد رضایی', initials: 'مر', color: 5, role: 'پشتیبان فنی', online: true },
  { id: 'nk', name: 'نگار کریمی', initials: 'نک', color: 3, role: 'امور مالی', online: false },
  { id: 'ar', name: 'علی‌اصغر رامین', initials: 'ع‌ر', color: 1, role: 'مدیر پشتیبانی', online: true, me: true },
  { id: 'em', name: 'Emma Wilson', initials: 'EW', color: 6, role: 'Support (EN)', online: false },
];
const TK = [
  // id, subject, customer [name, email, initials, color], channel, category, priority, status, assignee, tags, createdMin, dueMin, csat
  ['T-1048', 'پرداخت انجام شد ولی سفارش ثبت نشد', ['مریم حسینی', 'maryam.h@snapp.ir', 'مح', 3], 'email', 'billing', 'urgent', 'open', 'ar', ['پرداخت', 'زرین‌پال'], -95, 25, null],
  ['T-1047', 'کد تخفیف روی سبد خرید اعمال نمی‌شود', ['رضا جعفری', 'reza.j@cafebazaar.ir', 'رج', 5], 'chat', 'sales', 'high', 'open', 'sa', ['تخفیف'], -180, 70, null],
  ['T-1046', 'Cannot export invoices as PDF', ['James Miller', 'james@acme.co', 'JM', 6], 'email', 'technical', 'normal', 'pending', 'em', ['export', 'pdf'], -640, 300, null],
  ['T-1045', 'تغییر شمارهٔ موبایل حساب کاربری', ['نگار کریمی', 'negar.k@yahoo.com', 'نک', 2], 'web', 'account', 'low', 'new', null, [], -40, 1400, null],
  ['T-1044', 'خطای ۵۰۲ هنگام ورود به پنل', ['علی موسوی', 'ali.mousavi@digikala.com', 'عم', 4], 'phone', 'technical', 'urgent', 'open', 'mr', ['قطعی', 'ورود'], -260, -35, null],
  ['T-1043', 'درخواست فاکتور رسمی برای خرید سالانه', ['کامران شریفی', 'k.sharifi@irancell.ir', 'کش', 7], 'email', 'billing', 'normal', 'pending', 'nk', ['فاکتور'], -1500, 480, null],
  ['T-1042', 'ارسال سفارش بیش از یک هفته تأخیر دارد', ['زهرا محمدی', 'zahra.m@tapsi.ir', 'زم', 8], 'chat', 'shipping', 'high', 'open', null, ['ارسال'], -320, -110, null],
  ['T-1041', 'Refund for duplicate charge', ['Fatima Al-Mansouri', 'fatima@dubai.ae', 'FA', 1], 'email', 'billing', 'high', 'resolved', 'em', ['refund'], -2900, 0, 5],
  ['T-1040', 'راهنمایی برای اتصال API به فروشگاه', ['پویا اکبری', 'pouya.a@sheypoor.com', 'پا', 4], 'web', 'technical', 'normal', 'open', 'mr', ['API'], -900, 160, null],
  ['T-1039', 'حساب کاربری مسدود شده است', ['شیرین یزدانی', 'shirin.y@gmail.com', 'شی', 2], 'phone', 'account', 'high', 'new', null, ['امنیت'], -15, 45, null],
  ['T-1038', 'پیشنهاد: حالت تیره برای اپلیکیشن', ['کیان رستمی', 'kian.r@snappfood.ir', 'کر', 5], 'web', 'other', 'low', 'closed', 'sa', ['پیشنهاد'], -8000, 0, 4],
  ['T-1037', 'محصول آسیب‌دیده تحویل داده شد', ['الهام رحیمی', 'elham.r@gmail.com', 'ال', 3], 'chat', 'shipping', 'normal', 'resolved', 'sa', ['مرجوعی'], -4300, 0, 3],
  ['T-1036', 'SSO login loop with Google Workspace', ['Oliver Brown', 'oliver@northwind.io', 'OB', 6], 'email', 'technical', 'high', 'pending', 'mr', ['sso'], -2200, 220, null],
  ['T-1035', 'تمدید اشتراک سازمانی و افزودن ۱۰ کاربر', ['هومن پارسا', 'hooman.p@pasargad.ir', 'هپ', 7], 'email', 'sales', 'normal', 'open', 'ar', ['اشتراک'], -700, 900, null],
];
const TK_MSGS = {
  'T-1048': [
    ['customer', 'سلام، دیروز ساعت ۲۱ مبلغ ۴٬۸۰۰٬۰۰۰ تومان از کارتم کسر شد ولی سفارش در حسابم ثبت نشده. لطفا پیگیری کنید.', -95, [{ name: 'receipt-payment.jpg', size: '312 KB', type: 'image' }]],
    ['system', 'assigned', -90],
    ['note', 'کد پیگیری زرین‌پال را با تیم مالی چک کردم؛ تراکنش موفق است ولی callback به سرور نرسیده. احتمالا مربوط به قطعی دیشب.', -70],
    ['agent', 'سلام مریم خانم، وقت بخیر. پرداخت شما در درگاه موفق ثبت شده و در حال تطبیق آن با سفارش هستیم. حداکثر تا یک ساعت دیگر نتیجه را اطلاع می‌دهم.', -62],
    ['customer', 'ممنون، فقط چون هدیهٔ تولد است برای فردا لازمش دارم 🙏', -20, [{ name: 'order-ORD-20931.pdf', size: '84 KB', type: 'pdf' }]],
  ],
};
const TK_DEFAULT = (t) => [
  ['customer', `${t[1]}. لطفا راهنمایی کنید.`, t[9]],
  ...(t[7] ? [['agent', 'سلام، درخواست شما دریافت شد و در حال بررسی است.', t[9] + 12]] : []),
  ...(t[6] === 'resolved' || t[6] === 'closed' ? [['customer', 'مشکل حل شد، ممنون از پیگیری‌تان.', t[9] + 200], ['system', 'resolved', t[9] + 210]] : []),
];
export const tickets = TK.map((t) => {
  const [id, subject, [name, email, initials, color], channel, category, priority, status, assignee, tags, created, due, csat] = t;
  const msgs = (TK_MSGS[id] || TK_DEFAULT(t)).map(([from, text, min, attachments], i) => ({ id: `${id}-m${i}`, from, text, time: minsFromNow(min), attachments: attachments || [], author: from === 'agent' || from === 'note' ? (assignee || 'ar') : null }));
  return { id, subject, customer: { name, email, initials, color }, channel, category, priority, status, assignee, tags, created: minsFromNow(created), updated: msgs[msgs.length - 1].time, due: status === 'resolved' || status === 'closed' ? null : minsFromNow(due), slaTotal: Math.max(60, due - created), csat, messages: msgs };
});
export const cannedReplies = [
  { id: 'greet', title: 'خوش‌آمدگویی', text: 'سلام {name} عزیز، وقت بخیر. ممنون که با پشتیبانی تماس گرفتید.' },
  { id: 'checking', title: 'در حال بررسی', text: 'درخواست شما را دریافت کردیم و همکاران ما در حال بررسی هستند. نتیجه را به‌زودی اطلاع می‌دهیم.' },
  { id: 'refund', title: 'بازگشت وجه', text: 'مبلغ پرداختی ظرف ۷۲ ساعت کاری به حساب شما بازگردانده می‌شود.' },
  { id: 'logs', title: 'درخواست اطلاعات بیشتر', text: 'برای بررسی دقیق‌تر لطفا تصویر خطا، نام مرورگر و زمان دقیق رخداد را بفرستید.' },
  { id: 'closing', title: 'پایان گفتگو', text: 'خوشحالیم که مشکل حل شد. اگر سؤال دیگری داشتید همین‌جا پاسخ دهید.' },
];
export const ticketMacros = [
  { id: 'escalate', title: 'ارجاع به تیم فنی', icon: 'zap', set: { priority: 'high', assignee: 'mr' }, tag: 'ارجاع-فنی', note: 'به تیم فنی ارجاع شد.' },
  { id: 'billing', title: 'ارسال به امور مالی', icon: 'receipt', set: { assignee: 'nk' }, tag: 'مالی', note: 'به امور مالی ارجاع شد.' },
  { id: 'wait', title: 'منتظر پاسخ مشتری', icon: 'hourglass', set: { status: 'pending' }, reply: 'checking' },
  { id: 'solve', title: 'حل‌شده و درخواست امتیاز', icon: 'circle-check-big', set: { status: 'resolved' }, reply: 'closing' },
];
export const helpArticles = [
  { id: 'h1', title: 'پیگیری سفارش و زمان ارسال', cat: 'ارسال', icon: 'truck', read: 2 },
  { id: 'h2', title: 'بازگشت وجه چقدر طول می‌کشد؟', cat: 'پرداخت', icon: 'wallet', read: 3 },
  { id: 'h3', title: 'تغییر رمز عبور و ورود دومرحله‌ای', cat: 'حساب کاربری', icon: 'shield-check', read: 2 },
  { id: 'h4', title: 'دریافت فاکتور رسمی', cat: 'پرداخت', icon: 'receipt', read: 1 },
  { id: 'h5', title: 'مرجوع کردن کالا در ۷ روز', cat: 'ارسال', icon: 'package', read: 4 },
  { id: 'h6', title: 'اتصال به API فروشگاه', cat: 'فنی', icon: 'code', read: 6 },
];
export const supportBotReplies = [
  { match: /سفارش|ارسال|order|ship/i, text: 'برای پیگیری سفارش، شمارهٔ سفارش را بفرستید. معمولا ارسال ۲ تا ۴ روز کاری طول می‌کشد.', quick: ['شمارهٔ سفارش دارم', 'صحبت با کارشناس'] },
  { match: /پرداخت|پول|refund|pay|وجه/i, text: 'بازگشت وجه حداکثر ۷۲ ساعت کاری زمان می‌برد. اگر بیشتر شده، کارشناس مالی بررسی می‌کند.', quick: ['ثبت تیکت مالی', 'صحبت با کارشناس'] },
  { match: /کارشناس|انسان|agent|human/i, text: 'شما را به سارا از تیم پشتیبانی وصل می‌کنم؛ زمان پاسخ معمولا کمتر از ۵ دقیقه است.', quick: [] },
  { match: /.*/, text: 'ممنون از پیام‌تان! یکی از همکاران ما به‌زودی پاسخ می‌دهد. در این فاصله می‌توانید مقاله‌های راهنما را ببینید.', quick: ['پیگیری سفارش', 'بازگشت وجه', 'صحبت با کارشناس'] },
];
export const me = {
  name: 'مریم حسینی', first: 'مریم', email: 'maryam.h@snapp.ir', initials: 'مح', color: 3, tier: 'طلایی', points: 2840, nextTier: 4000,
  wallet: 18450000, cashback: 320000,
  profile: [['avatar', true], ['email', true], ['mobile', true], ['nationalId', false], ['address', true], ['twoFactor', false]],
  orders: [
    { id: 'ORD-20931', title: 'هدفون بی‌سیم سونی WH-1000XM5', items: 1, total: 4800000, status: 'shipped', step: 2, date: minsFromNow(-1500), icon: 'headphones' },
    { id: 'ORD-20877', title: 'کیف لپ‌تاپ چرمی + ماوس', items: 2, total: 2150000, status: 'processing', step: 1, date: minsFromNow(-300), icon: 'package' },
    { id: 'ORD-20512', title: 'کتاب «طراحی رابط کاربری»', items: 1, total: 385000, status: 'delivered', step: 3, date: minsFromNow(-14000), icon: 'book-open' },
  ],
  activity: [
    ['wallet', 'success', 'me.act1', 'شارژ کیف پول — ۵٬۰۰۰٬۰۰۰ تومان', -200],
    ['truck', 'info', 'me.act2', 'سفارش ORD-20931 ارسال شد', -1400],
    ['life-buoy', 'accent', 'me.act3', 'تیکت T-1048 پاسخ گرفت', -62],
    ['shield-check', 'neutral', 'me.act4', 'ورود از دستگاه جدید (Chrome · تهران)', -2900],
  ].map(([icon, tone, key, text, min]) => ({ icon, tone, key, text, time: minsFromNow(min) })),
};

/* ---- Iranian invoices (src/modules/invoice-ir) — amounts in Rial ---- */
const irSeller = { name: 'شرکت آرامین فناوران پارس (سهامی خاص)', brand: 'آرامین', tagline: 'راهکارهای نرم‌افزاری سازمانی', nationalId: '14009876543', economicCode: '411498765432', regNo: '548721', postalCode: '1969833114', phone: '021-88771234', address: 'استان تهران، شهر تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۲۲۱۰، طبقهٔ ۴' };
export const invoiceOfficial = {
  type: 'official', currency: 'IRR', serial: '1405-0287', date: daysAgo(0).toISOString().slice(0, 10), taxId: 'A1F2C9D41B0000A3E7C2F1', vatRate: 10, payment: 'credit',
  seller: irSeller,
  buyer: { name: 'شرکت بازرگانی نیک‌اندیشان آریا', nationalId: '10320654987', economicCode: '411376549812', regNo: '312654', postalCode: '7134814336', phone: '071-32345678', address: 'استان فارس، شهر شیراز، بلوار زند، کوچهٔ ۱۴، ساختمان آفتاب، واحد ۷' },
  items: [
    { code: '2720000123456', title: 'لپ‌تاپ Lenovo ThinkPad E14 — Core i7، رم ۱۶ گیگ', qty: 3, unit: 'دستگاه', price: 685000000, discount: 30000000 },
    { code: '2720000654321', title: 'مانیتور ۲۷ اینچ Samsung ViewFinity S6', qty: 5, unit: 'دستگاه', price: 148500000, discount: 0 },
    { code: '2330000004521', title: 'اشتراک سالانهٔ نرم‌افزار حسابداری ابری (۲۰ کاربر)', qty: 1, unit: 'خدمت', price: 420000000, discount: 42000000 },
    { code: '2330000008812', title: 'نصب، پیکربندی و راه‌اندازی شبکه', qty: 24, unit: 'نفر-ساعت', price: 3500000, discount: 0 },
    { code: '2720000777120', title: 'کابل شبکه Cat6 لگراند', qty: 305, unit: 'متر', price: 185000, discount: 0 },
    { code: '2720000301144', title: 'ماوس بی‌سیم Logitech M330', qty: 10, unit: 'عدد', price: 9800000, discount: 5000000 },
  ],
  notes: 'تحویل در محل خریدار، حداکثر ۷ روز کاری پس از پرداخت پیش‌پرداخت. گارانتی ۱۸ ماهه برای کالاهای سخت‌افزاری.',
};
export const invoiceProforma = {
  type: 'proforma', currency: 'IRR', serial: 'PF-1405-114', date: daysAgo(0).toISOString().slice(0, 10), validUntil: daysAgo(-7).toISOString().slice(0, 10), vatRate: 10, payment: 'cash',
  seller: irSeller,
  buyer: { name: 'کلینیک پوست و زیبایی نگین', economicCode: '411221334455', phone: '021-22041890', address: 'تهران، زعفرانیه، خیابان مقدس اردبیلی، پلاک ۴۸' },
  items: [
    { code: 'WEB-01', title: 'طراحی و پیاده‌سازی وب‌سایت کلینیک (۱۲ صفحه، دوزبانه)', qty: 1, unit: 'خدمت', price: 980000000, discount: 80000000 },
    { code: 'NBT-02', title: 'سامانهٔ نوبت‌دهی آنلاین + پیامک یادآوری', qty: 1, unit: 'خدمت', price: 640000000, discount: 0 },
    { code: 'SEO-03', title: 'سئو و تولید محتوا — بستهٔ ماهانه', qty: 3, unit: 'خدمت', price: 185000000, discount: 0, note: 'سه ماه' },
    { code: 'HST-04', title: 'میزبانی ابری و پشتیبانی فنی سالانه', qty: 1, unit: 'خدمت', price: 210000000, discount: 21000000 },
  ],
  bankAccounts: [
    { holder: 'آرامین فناوران پارس', card: '6037991812345674', sheba: 'IR060170000000123456789001', account: '0123456789001' },
    { holder: 'آرامین فناوران پارس', card: '6104337712345678', sheba: 'IR350120000000009876543210' },
  ],
  qr: 'https://pay.example/aramin/PF-1405-114',
  notes: '۵۰٪ مبلغ پیش از شروع پروژه و ۵۰٪ پس از تحویل نهایی پرداخت می‌شود.\nقیمت‌ها تا تاریخ اعتبار پیش‌فاکتور معتبر است.',
};

/* ---- Marketing: Search Console + GA4-like overview (src/modules/marketing). Deterministic. ---- */
const MK_DAYS = { '7d': 7, '28d': 28, '3m': 90, '16m': 486 };
const mkIso = (n) => daysAgo(n).toISOString().slice(0, 10);
function mkDaily(n, offset = 0) {
  const r = rng(7 + offset);
  const out = { dates: [], clicks: [], impressions: [], ctr: [], position: [] };
  for (let i = n - 1; i >= 0; i--) {
    const age = i + offset; const d = daysAgo(age); const wd = d.getDay();
    const trend = 1 + (486 - Math.min(age, 972)) / 900; const week = wd === 5 ? 0.72 : wd === 4 ? 0.88 : 1.04;
    const clicks = Math.round((1180 * trend * week) * (0.9 + r() * 0.2));
    const ctr = 0.036 + trend * 0.004 + (r() - 0.5) * 0.004;
    const position = Math.max(4, 13.2 - trend * 2.4 + (r() - 0.5) * 0.9);
    out.dates.push(mkIso(age)); out.clicks.push(clicks); out.impressions.push(Math.round(clicks / ctr)); out.ctr.push(+(ctr * 100).toFixed(2)); out.position.push(+position.toFixed(1));
  }
  return out;
}
const mkSum = (d) => {
  const clicks = d.clicks.reduce((a, b) => a + b, 0); const impressions = d.impressions.reduce((a, b) => a + b, 0);
  return { clicks, impressions, ctr: +((clicks / impressions) * 100).toFixed(2), position: +(d.position.reduce((a, b) => a + b, 0) / d.position.length).toFixed(1) };
};
function mkRows(list, total, seed, prevTotal) {
  const r = rng(seed); const sw = list.reduce((a, x) => a + x[1], 0);
  return list.map(([key, weight, ctr, pos]) => {
    const clicks = Math.max(1, Math.round(((total.clicks * weight) / sw) * (0.92 + r() * 0.16)));
    const row = { key, clicks, impressions: Math.round(clicks / (ctr / 100)), ctr, position: pos };
    if (prevTotal) { const f = prevTotal.clicks / total.clicks; row.prev = { clicks: Math.round(clicks * f * (0.8 + r() * 0.35)), impressions: Math.round(row.impressions * f * (0.85 + r() * 0.3)), ctr: +(ctr * (0.9 + r() * 0.15)).toFixed(2), position: +(pos * (0.95 + r() * 0.15)).toFixed(1) }; }
    return row;
  });
}
const MK_QUERIES = [['نوبت دکتر آنلاین', 18, 9.8, 2.1], ['نوبت دهی اینترنتی پزشک', 11, 7.4, 3.4], ['دکتر پوست تهران', 8, 5.1, 4.8], ['nobat online', 6, 12.6, 1.4], ['بهترین دندانپزشک شیراز', 5.5, 4.2, 6.2], ['نوبت سونوگرافی', 5, 6.8, 3.9], ['دکتر قلب اصفهان', 4.4, 4.9, 5.5], ['online doctor appointment iran', 3.6, 3.1, 7.8], ['آزمایشگاه نزدیک من', 3.3, 2.6, 9.4], ['نوبت دکتر اطفال', 3.1, 6.1, 4.1], ['مشاوره آنلاین پزشکی', 2.9, 3.8, 6.7], ['دکتر زنان مشهد', 2.6, 4.4, 5.9], ['رزرو نوبت فیزیوتراپی', 2.2, 5.6, 4.6], ['doctor appointment tehran', 2, 2.9, 8.8], ['نوبت ام آر آی', 1.9, 3.7, 7.1], ['دکتر ارتوپد کرج', 1.6, 4.1, 6.4], ['نوبت چشم پزشک', 1.5, 5.2, 4.9], ['ویزیت آنلاین', 1.3, 2.2, 10.3], ['کلینیک زیبایی', 1.1, 1.8, 12.6], ['تست کرونا در منزل', 0.6, 1.2, 14.2]];
const MK_PAGES = [['https://www.nobat.example/', 22, 8.2, 2.4], ['https://www.nobat.example/doctors/dermatology/tehran', 9, 5.6, 4.1], ['https://www.nobat.example/doctors/dentist/shiraz', 6.5, 4.4, 5.8], ['https://www.nobat.example/clinic/negin', 5.2, 6.9, 3.2], ['https://www.nobat.example/doctors/cardiology/isfahan', 4.6, 4.8, 5.1], ['https://www.nobat.example/en/', 4.1, 7.1, 2.9], ['https://www.nobat.example/lab/near-me', 3.4, 2.7, 8.8], ['https://www.nobat.example/blog/how-to-book', 3, 3.3, 7.4], ['https://www.nobat.example/doctors/pediatrics', 2.7, 5.5, 4.4], ['https://www.nobat.example/online-visit', 2.2, 2.4, 9.6]];
const MK_COUNTRIES = [['IR', 78, 5.6, 4.2], ['DE', 4.2, 3.9, 6.8], ['AE', 3.6, 4.1, 6.1], ['TR', 3, 3.4, 7.4], ['US', 2.8, 2.1, 9.8], ['CA', 2.2, 2.6, 8.9], ['GB', 1.9, 2.4, 9.1], ['SE', 1.4, 3.1, 7.7], ['AU', 1.1, 2.2, 9.4], ['NL', 0.9, 2.8, 8.2]];
const MK_DEVICES = [['mobile', 71, 5.9, 4.1], ['desktop', 26, 4.2, 5.3], ['tablet', 3, 3.6, 6.2]];
const MK_APPEAR = [['reviewSnippet', 24, 7.9, 3.1], ['faq', 18, 6.4, 3.8], ['breadcrumbs', 41, 5.2, 4.6], ['sitelinks', 9, 14.1, 1.3], ['videos', 4, 2.8, 7.4], ['merchant', 4, 2.1, 8.2]];

/** Search Console performance + index data for a range ('7d' | '28d' | '3m' | '16m'); compare adds previous-period series and row deltas. */
export function gscData(range = '28d', compare = false) {
  const n = MK_DAYS[range] || 28;
  const d = mkDaily(n); const prev = compare ? mkDaily(n, n) : null;
  const totals = mkSum(d); const prevTotals = prev ? mkSum(prev) : null;
  return {
    range, dates: d.dates, series: { clicks: d.clicks, impressions: d.impressions, ctr: d.ctr, position: d.position },
    previous: prev ? { dates: prev.dates, series: { clicks: prev.clicks, impressions: prev.impressions, ctr: prev.ctr, position: prev.position } } : null,
    totals, prevTotals,
    tabs: {
      queries: mkRows(MK_QUERIES, totals, n + 1, prevTotals), pages: mkRows(MK_PAGES, totals, n + 2, prevTotals),
      countries: mkRows(MK_COUNTRIES, totals, n + 3, prevTotals), devices: mkRows(MK_DEVICES, totals, n + 4, prevTotals),
      appearance: mkRows(MK_APPEAR, { clicks: totals.clicks * 0.38 }, n + 5, prevTotals && { clicks: prevTotals.clicks * 0.38 }),
    },
    coverage: {
      indexed: 12480, notIndexed: 3916,
      history: Array.from({ length: 13 }, (_, i) => ({ date: mkIso((12 - i) * 7), indexed: 10200 + i * 190 + Math.round(Math.sin(i) * 60), notIndexed: 4620 - i * 58 + Math.round(Math.cos(i) * 40) })),
      reasons: [
        { reason: 'crawledNotIndexed', source: 'google', pages: 1420, trend: 'down' }, { reason: 'discoveredNotIndexed', source: 'google', pages: 862, trend: 'flat' },
        { reason: 'duplicateNoCanonical', source: 'website', pages: 604, trend: 'down' }, { reason: 'alternateCanonical', source: 'website', pages: 512, trend: 'up' },
        { reason: 'redirect', source: 'website', pages: 288, trend: 'flat' }, { reason: 'notFound', source: 'website', pages: 142, trend: 'down' }, { reason: 'noindex', source: 'website', pages: 88, trend: 'flat' },
      ],
    },
    cwv: {
      mobile: { good: 812, ni: 214, poor: 46, metrics: { lcp: [2.6, 'ni'], inp: [180, 'good'], cls: [0.08, 'good'] } },
      desktop: { good: 1012, ni: 54, poor: 6, metrics: { lcp: [1.9, 'good'], inp: [90, 'good'], cls: [0.04, 'good'] } },
    },
    sitemaps: [
      { url: '/sitemap.xml', type: 'index', submitted: mkIso(220), lastRead: mkIso(1), status: 'success', discovered: 16384 },
      { url: '/sitemap-doctors.xml', type: 'sitemap', submitted: mkIso(220), lastRead: mkIso(1), status: 'success', discovered: 9812 },
      { url: '/sitemap-clinics.xml', type: 'sitemap', submitted: mkIso(180), lastRead: mkIso(2), status: 'success', discovered: 2104 },
      { url: '/sitemap-blog.xml', type: 'sitemap', submitted: mkIso(140), lastRead: mkIso(3), status: 'warning', discovered: 1486 },
      { url: '/sitemap-news.xml', type: 'news', submitted: mkIso(30), lastRead: mkIso(9), status: 'error', discovered: 0 },
    ],
    links: {
      external: 48213, internal: 312904,
      topLinked: [['/', 18240], ['/doctors/dermatology/tehran', 4120], ['/clinic/negin', 2980], ['/blog/how-to-book', 2214], ['/en/', 1806]],
      topSites: [['virgool.io', 6120], ['zoomit.ir', 4380], ['github.com', 2210], ['medium.com', 1904], ['wikipedia.org', 1120]],
      topAnchors: [['نوبت دکتر', 9120], ['nobat', 4210], ['سایت نوبت دهی', 3380], ['اینجا', 2940], ['online appointment', 1205]],
    },
  };
}

const MK_CH = [['organic', 41, 0.71, 0.042], ['direct', 19, 0.66, 0.051], ['paidSearch', 13, 0.62, 0.064], ['organicSocial', 10, 0.54, 0.021], ['paidSocial', 7, 0.49, 0.028], ['referral', 5, 0.68, 0.039], ['email', 3.4, 0.74, 0.081], ['display', 1.6, 0.31, 0.009]];
/** GA4-like marketing overview for a range ('7d' | '28d' | '3m'). Money in Rial. */
export function mkData(range = '28d') {
  const n = { '7d': 7, '28d': 28, '3m': 90 }[range] || 28; const r = rng(31 + n);
  const dates = []; const users = []; const newUsers = []; const sessions = []; const conv = [];
  for (let i = n - 1; i >= 0; i--) {
    const wd = daysAgo(i).getDay(); const w = wd === 5 ? 0.74 : 1; const base = 5200 + (n - i) * 9;
    const u = Math.round(base * w * (0.9 + r() * 0.2));
    dates.push(mkIso(i)); users.push(u); newUsers.push(Math.round(u * (0.58 + r() * 0.08))); sessions.push(Math.round(u * (1.38 + r() * 0.1))); conv.push(Math.round(u * (0.036 + r() * 0.01)));
  }
  const s = (a) => a.reduce((x, y) => x + y, 0);
  const U = s(users); const S = s(sessions); const C = s(conv);
  const sw = s(MK_CH.map((c) => c[1]));
  return {
    range, dates, series: { users, newUsers, sessions, conversions: conv },
    kpis: { users: [U, 8.4], sessions: [S, 6.1], engagementRate: [63.8, 2.3], avgEngagement: [154, -3.2], conversions: [C, 12.7], revenue: [C * 8400000, 15.9] },
    channels: MK_CH.map(([key, w, er, cr]) => { const ss = Math.round((S * w) / sw); return { id: key, key, users: Math.round(ss / 1.4), sessions: ss, engagementRate: +(er * 100).toFixed(1), conversions: Math.round(ss * cr), revenue: Math.round(ss * cr * 8400000) }; }),
    campaigns: [
      ['نوروز ۱۴۰۵ — جستجو', 'google', 'search', 1.0], ['Brand — Search', 'google', 'search', 0.6], ['Performance Max — کلینیک‌ها', 'google', 'pmax', 1.4],
      ['Retargeting — Instagram Stories', 'meta', 'social', 0.8], ['Lookalike 2% — پزشکان', 'meta', 'social', 0.7], ['YouTube — آموزش رزرو', 'google', 'video', 0.5],
    ].map(([name, platform, type, k], i) => {
      const rr = rng(90 + i + n); const spend = Math.round(k * n * 21000000 * (0.8 + rr() * 0.4)); const impressions = Math.round(spend / (400 + rr() * 600)); const clicks = Math.round(impressions * (0.012 + rr() * 0.04));
      const conversions = Math.round(clicks * (0.03 + rr() * 0.06)); return { id: i, name, platform, type, spend, impressions, clicks, conversions, revenue: Math.round(conversions * 1400000 * (0.6 + rr() * 0.9)) };
    }),
    funnel: { labels: ['visit', 'search', 'profile', 'slot', 'booked'], values: [S, Math.round(S * 0.52), Math.round(S * 0.27), Math.round(S * 0.11), C] },
    landing: [['/', 0.31, 0.68], ['/doctors/dermatology/tehran', 0.12, 0.74], ['/clinic/negin', 0.08, 0.71], ['/online-visit', 0.06, 0.59], ['/blog/how-to-book', 0.05, 0.48], ['/en/', 0.04, 0.66], ['/lab/near-me', 0.035, 0.52]]
      .map(([path, share, er], i) => ({ id: i, path, sessions: Math.round(S * share), engagementRate: +(er * 100).toFixed(1), conversions: Math.round(S * share * (0.02 + er * 0.04)) })),
    social: {
      months: Array.from({ length: 12 }, (_, i) => mkIso((11 - i) * 30)),
      networks: [
        { key: 'instagram', name: 'Instagram', color: 2, data: Array.from({ length: 12 }, (_, i) => Math.round(41200 + i * 2380 + i * i * 60)) },
        { key: 'telegram', name: 'Telegram', color: 6, data: Array.from({ length: 12 }, (_, i) => Math.round(18300 + i * 940)) },
        { key: 'linkedin', name: 'LinkedIn', color: 1, data: Array.from({ length: 12 }, (_, i) => Math.round(6400 + i * 520)) },
        { key: 'x', name: 'X', color: 3, data: Array.from({ length: 12 }, (_, i) => Math.round(3900 + i * 140)) },
      ],
    },
    email: [
      { id: 1, name: 'خبرنامهٔ مهر — پزشکان جدید', sent: 48210, open: 41.2, ctr: 6.8, unsub: 0.21, date: mkIso(3) },
      { id: 2, name: 'یادآوری چکاپ سالانه', sent: 22140, open: 52.6, ctr: 11.4, unsub: 0.12, date: mkIso(9) },
      { id: 3, name: 'Welcome series — step 2', sent: 6120, open: 61.3, ctr: 14.9, unsub: 0.08, date: mkIso(12) },
      { id: 4, name: 'تخفیف ویزیت آنلاین', sent: 39880, open: 33.9, ctr: 4.1, unsub: 0.44, date: mkIso(18) },
    ],
  };
}
const MK_RT = [['IR', 'ایران', 'Iran', 0.74], ['DE', 'آلمان', 'Germany', 0.06], ['AE', 'امارات', 'UAE', 0.05], ['TR', 'ترکیه', 'Türkiye', 0.04], ['US', 'آمریکا', 'United States', 0.03], ['CA', 'کانادا', 'Canada', 0.03], ['GB', 'بریتانیا', 'United Kingdom', 0.02]];
let mkRtUsers = 184; const mkRtR = rng(404); const mkRtMin = Array.from({ length: 30 }, (_, i) => Math.round(5 + Math.sin(i / 3) * 2 + mkRtR() * 4));
/** Realtime snapshot (random walk) — a simplified GA4 runRealtimeReport. */
export function mkRealtime() {
  mkRtUsers = Math.max(90, Math.min(320, mkRtUsers + Math.round((mkRtR() - 0.48) * 14)));
  mkRtMin.shift(); mkRtMin.push(Math.round(mkRtUsers / 30 + mkRtR() * 4));
  return {
    active: mkRtUsers, perMinute: mkRtMin.slice(),
    countries: MK_RT.map(([code, fa, en, s]) => ({ code, fa, en, users: Math.max(1, Math.round(mkRtUsers * s * (0.85 + mkRtR() * 0.3))) })).sort((a, b) => b.users - a.users),
    pages: [['/', 0.34], ['/doctors/dermatology/tehran', 0.14], ['/clinic/negin', 0.09], ['/online-visit', 0.07], ['/en/', 0.05]].map(([path, s]) => ({ path, users: Math.max(1, Math.round(mkRtUsers * s * (0.8 + mkRtR() * 0.4))) })),
  };
}

/* ---- chat module demo data (pages-b) ---- */
const chatAt = (min) => Date.now() - min * 60000;
let chatSeq = 0;
const cm = (min, from, body = {}, extra = {}) => ({ id: `dm${++chatSeq}`, from, at: chatAt(min), reactions: {}, status: from === 'ar' ? 'read' : undefined, ...(typeof body === 'string' ? { text: body } : body), ...extra });
export const chatUsers = [
  { id: 'sa', name: 'سارا احمدی', initials: 'سا', color: 2, online: true, about: 'طراح محصول · عاشق جزئیات', phone: '+98 912 345 6789', email: 'sara.ahmadi@nikan.ir' },
  { id: 'mr', name: 'محمد رضایی', initials: 'مر', color: 5, online: true, about: 'Backend · Go / PostgreSQL', phone: '+98 935 111 2233', email: 'm.rezaei@gmail.com' },
  { id: 'nk', name: 'نگار کریمی', initials: 'نک', color: 3, lastSeen: new Date(chatAt(42)).toISOString(), about: 'QA و دسترسی‌پذیری', email: 'negar.k@yahoo.com' },
  { id: 'am', name: 'علی موسوی', initials: 'عم', color: 4, lastSeen: new Date(chatAt(300)).toISOString(), about: 'DevOps', email: 'ali.mousavi@digikala.com' },
  { id: 'em', name: 'Emma Wilson', initials: 'EW', color: 6, online: true, about: 'Product manager at Linear', phone: '+44 20 7946 0958', email: 'emma.w@linear.app' },
  { id: 'om', name: 'Omar Haddad', initials: 'OH', color: 7, lastSeen: new Date(chatAt(2900)).toISOString(), about: 'Partnerships · Dubai', email: 'omar@careem.com' },
  { id: 'pa', name: 'پریسا انصاری', initials: 'پا', color: 8, online: true, about: 'طراح UI', email: 'parisa.a@torob.com' },
];
export const chatMe = { id: 'ar', name: 'علی‌اصغر رامین', initials: 'ع‌ر', color: 1 };
export const chatConversations = [
  { id: 'c-sara', type: 'direct', with: 'sa', pinned: true, unread: 2, messages: [
    cm(1500, 'sa', 'سلام علی، وقت بخیر ☀️'), cm(1498, 'sa', 'طرح صفحهٔ ورود آماده‌ست، می‌تونی یه نگاه بندازی؟'),
    cm(1490, 'ar', 'سلام سارا، حتما. لینک فیگما رو بفرست', { status: 'read' }),
    cm(1480, 'sa', { text: 'https://www.figma.com/file/aramin-login-v3', link: { url: 'https://www.figma.com/file/aramin-login-v3', title: 'Aramin — Login v3', desc: 'Figma · ۳ صفحه · آخرین ویرایش امروز' } }),
    cm(95, 'sa', { image: { name: 'login-light.png', hue: 18 }, text: 'نسخهٔ روشن' }), cm(94, 'sa', { image: { name: 'login-dark.png', hue: 230 } }),
    cm(93, 'sa', { file: { name: 'login-v3.fig', size: '4.2 MB' } }),
    cm(60, 'ar', 'عالیه! فقط دکمهٔ اصلی رو مشکی کن مثل داشبورد', { status: 'read', reactions: { '👍': ['sa'] } }),
    cm(58, 'ar', { voice: { dur: '0:24' } }, { status: 'read' }),
    cm(20, 'sa', 'باشه، الان اصلاح می‌کنم', { replyTo: 'dm8', reactions: { '❤️': ['ar'] } }),
    cm(3, 'sa', { image: { name: 'login-final.png', hue: 340 } }), cm(2, 'sa', 'فایل نهایی رو فرستادم 👌'),
  ] },
  { id: 'g-dev', type: 'group', name: 'تیم توسعه', initials: 'تت', color: 5, members: ['sa', 'mr', 'nk', 'am'], admins: ['ar', 'mr'], pinned: true, unread: 5, messages: [
    cm(2000, 'mr', 'بچه‌ها اسپرینت جدید از شنبه شروع می‌شه'), cm(1990, 'nk', 'تست‌های دسترسی‌پذیری رو هم بذاریم توش؟', { reactions: { '👍': ['mr', 'ar'] } }),
    cm(1985, 'ar', 'حتما، اولویت بالا', { status: 'read' }),
    cm(40, 'am', 'سرور استیج رو آپدیت کردم 🚀', { reactions: { '🔥': ['sa', 'mr', 'ar'], '👏': ['nk'] } }),
    cm(30, 'mr', { file: { name: 'release-notes-2.4.pdf', size: '820 KB' } }),
    cm(25, 'sa', { image: { name: 'dashboard.png', hue: 160 }, text: 'اسکرین‌شات داشبورد جدید' }),
    cm(18, 'nk', 'روی گوشی هم تست کردم، همه‌چی اوکیه ✅'), cm(14, 'mr', 'بیلد جدید روی استیج رفت', { replyTo: 'dm16' }),
    cm(13, 'mr', 'https://stage.aramin.dev'), cm(12, 'sa', 'دمت گرم 🙌'),
  ] },
  { id: 'ch-news', type: 'channel', name: 'اطلاعیه‌های آرامین', initials: 'آر', color: 2, admins: ['ar'], subscribers: 1840, verified: true, messages: [
    cm(4000, 'ar', { image: { name: 'release-2-3.png', hue: 28 }, text: 'نسخهٔ 2.3 منتشر شد: حالت تیرهٔ جدید و تقویم شمسی 🎉' }, { views: 1520, reactions: { '🎉': ['sa', 'mr', 'nk', 'em'], '❤️': ['pa'] } }),
    cm(800, 'ar', 'نسخهٔ 2.4 در راه است — کانبان با کشیدن و رها کردن لمسی، صفحهٔ گفتگو و ایمیل کامل.', { views: 1210, reactions: { '🔥': ['sa', 'am'] } }),
  ] },
  { id: 'ch-tech', type: 'channel', name: 'اخبار فناوری', initials: 'اف', color: 3, admins: ['om'], subscribers: 12400, muted: true, unread: 3, messages: [
    cm(300, 'om', { text: 'گزارش تازه دربارهٔ وضعیت هوش مصنوعی در ۲۰۲۶', link: { url: 'https://example.com/ai-2026', title: 'State of AI 2026', desc: 'Trends, models and what changed this year' } }, { views: 8900 }),
    cm(120, 'om', { image: { name: 'chip.png', hue: 200 }, text: 'تراشهٔ جدید با مصرف انرژی نصف' }, { views: 7600 }),
    cm(15, 'om', 'کنفرانس توسعه‌دهندگان وب هفتهٔ آینده در دبی برگزار می‌شود.', { views: 2100 }),
  ] },
  { id: 'c-emma', type: 'direct', with: 'em', messages: [
    cm(80, 'ar', 'Hi Emma! Can we move the demo to 3pm?', { status: 'read' }), cm(70, 'em', 'Sure, 3pm works for me 👍'), cm(55, 'em', 'Sounds good, see you tomorrow!'),
  ] },
  { id: 'c-mr', type: 'direct', with: 'mr', messages: [cm(200, 'ar', 'درگاه پرداخت چی شد؟', { status: 'read' }), cm(180, 'mr', 'درگاه پرداخت وصل شد ✅', { reactions: { '🎉': ['ar'] } })] },
  { id: 'c-nk', type: 'direct', with: 'nk', messages: [cm(620, 'nk', 'گزارش تست دسترسی‌پذیری'), cm(600, 'nk', { file: { name: 'a11y-report.pdf', size: '1.1 MB' } })] },
  { id: 'g-support', type: 'group', name: 'پشتیبانی مشتریان', initials: 'پش', color: 4, members: ['nk', 'pa', 'am'], admins: ['ar'], muted: true, unread: 12, messages: [cm(1500, 'pa', 'تیکت ۴۸۲ بسته شد'), cm(1400, 'am', 'مشتری نیکان تماس گرفت، پیگیری می‌کنم')] },
  { id: 'c-omar', type: 'direct', with: 'om', messages: [cm(2950, 'ar', 'Invoice attached.', { status: 'read' }), cm(2900, 'om', 'Thanks for the invoice')] },
  { id: 'c-am', type: 'direct', with: 'am', messages: [cm(4400, 'am', 'فردا جلسه داریم؟')] },
];

/* ---- mail module demo data (pages-b) ---- */
const mailAt = (min) => Date.now() - min * 60000;
export const mailMe = { name: 'علی‌اصغر رامین', email: 'ali@aramin.dev', initials: 'ع‌ر', color: 1 };
export const mailContacts = [
  { name: 'سارا احمدی', email: 'sara.ahmadi@nikan.ir', initials: 'سا', color: 2 }, { name: 'محمد رضایی', email: 'm.rezaei@gmail.com', initials: 'مر', color: 5 },
  { name: 'نگار کریمی', email: 'negar.k@yahoo.com', initials: 'نک', color: 3 }, { name: 'Emma Wilson', email: 'emma.w@linear.app', initials: 'EW', color: 6 },
  { name: 'Omar Haddad', email: 'omar@careem.com', initials: 'OH', color: 7 }, { name: 'Stripe', email: 'receipts@stripe.com', initials: 'ST', color: 6 },
  { name: 'GitHub', email: 'noreply@github.com', initials: 'GH', color: 1 }, { name: 'Linear', email: 'notifications@linear.app', initials: 'LI', color: 4 },
  { name: 'آروان‌کلاد', email: 'billing@arvancloud.ir', initials: 'AR', color: 3 }, { name: 'علی موسوی', email: 'ali.mousavi@digikala.com', initials: 'عم', color: 4 },
];
export const mailLabels = [
  { id: 'clients', name: 'مشتریان', tone: 'accent' }, { id: 'product', name: 'محصول', tone: 'info' },
  { id: 'finance', name: 'مالی', tone: 'success' }, { id: 'team', name: 'تیم', tone: 'warning' },
];
const mc = (email) => mailContacts.find((c) => c.email === email) || mailMe;
const mm = (min, from, to, html, extra = {}) => ({ id: `mm${min}${from.length}`, from: mc(from), to: to.map(mc), at: mailAt(min), html, ...extra });
const P = (...lines) => lines.map((l) => `<p>${l}</p>`).join('');
export const mailThreads = [
  { id: 't1', folder: 'inbox', subject: 'طرح نهایی صفحهٔ ورود', labels: ['product', 'team'], starred: true, important: true, unread: true, messages: [
    mm(1500, 'sara.ahmadi@nikan.ir', ['ali@aramin.dev'], P('سلام علی،', 'طرح اولیهٔ صفحهٔ ورود را پیوست کرده‌ام. لطفا نظرت را بگو.', 'با سپاس، سارا')),
    mm(1440, 'ali@aramin.dev', ['sara.ahmadi@nikan.ir'], P('سلام سارا،', 'خیلی خوب است. دکمهٔ اصلی را مشکی کن و حالت تیره را هم ببینیم.', 'علی')),
    mm(35, 'sara.ahmadi@nikan.ir', ['ali@aramin.dev'], P('سلام علی،', 'نسخهٔ نهایی با حالت روشن و تیره پیوست است. اگر تأیید کنی امروز تحویل توسعه می‌دهیم.', '<b>تغییرات:</b>', '<ul><li>دکمهٔ اصلی مشکی</li><li>ورود با کد یک‌بارمصرف</li><li>حالت تیرهٔ کامل</li></ul>', 'با سپاس، سارا'), { cc: [mc('m.rezaei@gmail.com')], attachments: [{ name: 'login-light.png', size: '1.2 MB', kind: 'image' }, { name: 'login-dark.png', size: '1.1 MB', kind: 'image' }, { name: 'login-v3.fig', size: '4.2 MB', kind: 'file' }] }),
  ] },
  { id: 't2', folder: 'inbox', subject: 'پرداخت جدید دریافت شد — ۲۴۰ دلار', labels: ['finance'], unread: true, messages: [mm(8, 'receipts@stripe.com', ['ali@aramin.dev'], P('یک پرداخت جدید از مشتری <b>Acme Co</b> برای اشتراک سالانه دریافت شد.', 'مبلغ: <b><bdi>$240.00</bdi></b> · روش: <bdi>Visa •••• 4242</bdi>', '<a href="https://dashboard.stripe.com">مشاهده در داشبورد</a>'))] },
  { id: 't3', folder: 'inbox', subject: '[AraminConsole] Pull request #128 merged', labels: ['product'], messages: [mm(120, 'noreply@github.com', ['ali@aramin.dev'], '<p>Merged <b>#128</b> feat(kanban): pointer + touch drag with FLIP placeholder animation into <code>main</code>.</p><p>— ARaminco</p>')] },
  { id: 't4', folder: 'inbox', subject: 'گزارش عملکرد سرورها — هفتهٔ گذشته', labels: ['team'], important: true, messages: [mm(300, 'm.rezaei@gmail.com', ['ali@aramin.dev'], P('سلام،', 'میانگین زمان پاسخ ۱۸۰ میلی‌ثانیه بود و هیچ قطعی ثبت نشد. گزارش کامل پیوست است.', 'محمد'), { attachments: [{ name: 'servers-week-42.pdf', size: '640 KB', kind: 'pdf' }] })] },
  { id: 't5', folder: 'inbox', subject: 'You have 4 issues due this week', labels: [], messages: [mm(600, 'notifications@linear.app', ['ali@aramin.dev'], '<p>AC-212 Calendar week view · AC-219 Mail swipe actions · AC-220 Files context menu · AC-224 Pricing toggle</p>')] },
  { id: 't6', folder: 'inbox', subject: 'Demo moved to 3pm', labels: ['clients'], messages: [
    mm(1500, 'ali@aramin.dev', ['emma.w@linear.app'], '<p>Hi Emma, can we move tomorrow’s demo?</p>'),
    mm(1400, 'emma.w@linear.app', ['ali@aramin.dev'], '<p>Hi Ali, quick note that the product demo moved to 3pm tomorrow. Same link as before: https://meet.example.com/aramin</p><p>Best, Emma</p>'),
  ] },
  { id: 't7', folder: 'inbox', subject: 'فاکتور ماهانهٔ سرویس ابری', labels: ['finance'], messages: [mm(2900, 'billing@arvancloud.ir', ['ali@aramin.dev'], P('فاکتور این ماه صادر شد. مبلغ قابل پرداخت ۱۲٬۴۰۰٬۰۰۰ ریال است.'), { attachments: [{ name: 'invoice-1404-07.pdf', size: '210 KB', kind: 'pdf' }] })] },
  { id: 't8', folder: 'inbox', subject: 'نتیجهٔ آزمون دسترسی‌پذیری', labels: ['product'], messages: [mm(4400, 'negar.k@yahoo.com', ['ali@aramin.dev'], P('همهٔ صفحه‌های اصلی امتیاز بالای ۹۵ گرفتند. دو مورد کنتراست در حالت تیره باقی مانده.'))] },
  { id: 't9', folder: 'inbox', subject: 'Partnership proposal — Careem x Aramin', labels: ['clients'], starred: true, messages: [mm(5800, 'omar@careem.com', ['ali@aramin.dev'], '<p>Hi Ali, attached is our proposal for the white-label dashboard. Looking forward to your thoughts.</p><p>Omar</p>', { attachments: [{ name: 'proposal.pdf', size: '2.3 MB', kind: 'pdf' }] })] },
  { id: 't10', folder: 'sent', subject: 'قرارداد همکاری', labels: ['clients'], messages: [mm(200, 'ali@aramin.dev', ['ali.mousavi@digikala.com'], P('سلام، نسخهٔ نهایی قرارداد پیوست است.'), { attachments: [{ name: 'contract.pdf', size: '540 KB', kind: 'pdf' }] })] },
  { id: 't11', folder: 'drafts', subject: 'برنامهٔ فصل بعد', labels: [], messages: [mm(900, 'ali@aramin.dev', ['sara.ahmadi@nikan.ir'], P('اهداف اصلی فصل بعد…'))] },
  { id: 't12', folder: 'spam', subject: 'You won a free iPhone!!!', labels: [], messages: [mm(700, 'receipts@stripe.com', ['ali@aramin.dev'], '<p>Click here to claim your prize.</p>')] },
  { id: 't13', folder: 'snoozed', subject: 'یادآوری: تمدید دامنه‌ها', labels: ['finance'], snoozeUntil: Date.now() + 26 * 3600000, messages: [mm(3000, 'billing@arvancloud.ir', ['ali@aramin.dev'], P('دامنهٔ aramin.dev تا ۱۵ روز دیگر منقضی می‌شود.'))] },
  { id: 't14', folder: 'scheduled', subject: 'گزارش هفتگی تیم', labels: ['team'], scheduledAt: Date.now() + 15 * 3600000, messages: [mm(10, 'ali@aramin.dev', ['m.rezaei@gmail.com', 'sara.ahmadi@nikan.ir'], P('سلام تیم، گزارش این هفته…'))] },
];
export const myTicketIds = ['T-1048', 'T-1037', 'T-1041'];
export const meNotifications = [
  ['truck', 'info', 'سفارش ORD-20931 تحویل پست شد', 'کد رهگیری: 2045 7781 0093', -35, false],
  ['life-buoy', 'accent', 'پاسخ جدید روی تیکت T-1048', 'علی‌اصغر رامین: پرداخت شما در حال تطبیق است…', -62, false],
  ['badge-percent', 'success', 'کد تخفیف ۱۵٪ برای شما فعال شد', 'تا پایان هفته روی همهٔ کالاهای دیجیتال', -600, true],
  ['shield-check', 'warning', 'ورود دومرحله‌ای هنوز فعال نیست', 'امنیت حساب‌تان را با یک کد پیامکی بالا ببرید', -2600, true],
].map(([icon, tone, title, text, min, read], i) => ({ id: 'n' + i, icon, tone, title, text, time: minsFromNow(min), read }));

/* ---- maps (demo/pages/maps): branches, fleet routes, geofences, order heat — Tehran & Dubai ---- */
const geoP = (id, type, status, fa, en, afa, aen, lat, lng, orders, staff) => ({ id, type, status, name: { fa, en, ar: en }, addr: { fa: afa, en: aen, ar: aen }, lat, lng, orders, staff });
export const geoCities = {
  tehran: {
    center: [35.7219, 51.3947], zoom: 12,
    places: [
      geoP('t1', 'branch', 'open', 'شعبهٔ تجریش', 'Tajrish branch', 'میدان تجریش، خیابان شهرداری', 'Tajrish Sq., Shahrdari St.', 35.8046, 51.4339, 184, 12),
      geoP('t2', 'branch', 'busy', 'شعبهٔ ونک', 'Vanak branch', 'میدان ونک، ملاصدرا', 'Vanak Sq., Mollasadra', 35.7576, 51.4100, 312, 18),
      geoP('t3', 'branch', 'open', 'شعبهٔ انقلاب', 'Enghelab branch', 'تقاطع ولیعصر و انقلاب', 'Valiasr & Enghelab', 35.7008, 51.4066, 221, 14),
      geoP('t4', 'pickup', 'open', 'تحویل آزادی', 'Azadi pickup', 'میدان آزادی، ضلع شمالی', 'Azadi Sq., north side', 35.6997, 51.3380, 96, 4),
      geoP('t5', 'branch', 'open', 'شعبهٔ تهرانپارس', 'Tehranpars branch', 'تهرانپارس، فلکهٔ اول', 'Tehranpars, 1st circle', 35.7409, 51.5395, 143, 9),
      geoP('t6', 'branch', 'busy', 'شعبهٔ سعادت‌آباد', 'Saadat Abad branch', 'سعادت‌آباد، میدان کاج', 'Saadat Abad, Kaj Sq.', 35.7804, 51.3768, 268, 15),
      geoP('t7', 'pickup', 'closed', 'تحویل نارمک', 'Narmak pickup', 'نارمک، میدان هفت‌حوض', 'Narmak, Haft-Hoz Sq.', 35.7449, 51.5025, 0, 3),
      geoP('t8', 'office', 'open', 'دفتر مرکزی', 'Head office', 'شهرک غرب، بلوار فرحزادی', 'Shahrak-e Gharb, Farahzadi Blvd.', 35.7590, 51.3740, 0, 46),
      geoP('t9', 'pickup', 'open', 'تحویل اکباتان', 'Ekbatan pickup', 'شهرک اکباتان، فاز ۲', 'Ekbatan, phase 2', 35.7066, 51.3036, 77, 3),
      geoP('t10', 'branch', 'open', 'شعبهٔ بازار', 'Bazaar branch', 'بازار بزرگ، سبزه‌میدان', 'Grand Bazaar, Sabzeh-Meydan', 35.6745, 51.4220, 198, 11),
      geoP('t11', 'pickup', 'busy', 'تحویل نواب', 'Navvab pickup', 'بزرگراه نواب، تقاطع قزوین', 'Navvab Hwy, Qazvin St.', 35.6800, 51.3880, 133, 4),
      geoP('t12', 'branch', 'open', 'شعبهٔ پاسداران', 'Pasdaran branch', 'پاسداران، گلستان دوم', 'Pasdaran, 2nd Golestan', 35.7716, 51.4723, 176, 10),
      geoP('t13', 'branch', 'closed', 'شعبهٔ جردن', 'Jordan branch', 'بلوار آفریقا، ناهید', 'Africa Blvd., Nahid', 35.7708, 51.4182, 0, 8),
      geoP('t14', 'warehouse', 'busy', 'انبار شهرری', 'Rey warehouse', 'شهرری، جادهٔ قدیم قم', 'Shahr-e Rey, old Qom Rd.', 35.5980, 51.4350, 640, 32),
      geoP('t15', 'warehouse', 'open', 'انبار چیتگر', 'Chitgar warehouse', 'چیتگر، بلوار دریاچه', 'Chitgar, Lake Blvd.', 35.7380, 51.2160, 410, 24),
      geoP('t16', 'pickup', 'open', 'تحویل یوسف‌آباد', 'Yousef Abad pickup', 'یوسف‌آباد، خیابان ۳۳', 'Yousef Abad, 33rd St.', 35.7286, 51.4038, 88, 3),
      geoP('t17', 'branch', 'open', 'شعبهٔ پیروزی', 'Piroozi branch', 'خیابان پیروزی، نبرد', 'Piroozi St., Nabard', 35.6890, 51.4920, 121, 8),
      geoP('t18', 'branch', 'open', 'شعبهٔ الهیه', 'Elahieh branch', 'الهیه، خیابان فرشته', 'Elahieh, Fereshteh St.', 35.7930, 51.4290, 154, 9),
    ],
    routes: [
      [[35.8046, 51.4339], [35.7930, 51.4280], [35.7790, 51.4190], [35.7576, 51.4100], [35.7400, 51.4080], [35.7286, 51.4060], [35.7130, 51.4060], [35.7008, 51.4066], [35.6880, 51.4060], [35.6680, 51.4050], [35.6593, 51.4044]],
      [[35.6997, 51.3380], [35.7000, 51.3600], [35.7008, 51.3900], [35.7008, 51.4066], [35.7015, 51.4250], [35.7020, 51.4450], [35.7060, 51.4700]],
      [[35.7460, 51.3100], [35.7470, 51.3500], [35.7520, 51.3900], [35.7560, 51.4200], [35.7560, 51.4500], [35.7470, 51.4800], [35.7420, 51.5100]],
      [[35.7900, 51.4560], [35.7700, 51.4500], [35.7500, 51.4400], [35.7300, 51.4350], [35.7130, 51.4300]],
      [[35.6700, 51.4100], [35.6400, 51.4200], [35.6150, 51.4300], [35.5980, 51.4350]],
      [[35.7380, 51.2160], [35.7350, 51.2600], [35.7260, 51.3000], [35.7100, 51.3200], [35.6997, 51.3380]],
    ],
    zones: [
      { id: 'zt1', shape: 'polygon', tone: 'accent', name: { fa: 'محدودهٔ مرکزی', en: 'Downtown zone', ar: 'منطقة وسط المدينة' }, latlngs: [[35.7150, 51.3850], [35.7160, 51.4350], [35.6850, 51.4400], [35.6720, 51.4100], [35.6850, 51.3820]] },
      { id: 'zt2', shape: 'circle', tone: 'ink', name: { fa: 'شمال شهر — ارسال سریع', en: 'North — express', ar: 'الشمال — توصيل سريع' }, center: [35.7950, 51.4350], radius: 2600 },
      { id: 'zt3', shape: 'circle', tone: 'danger', name: { fa: 'حریم انبار شهرری', en: 'Rey warehouse fence', ar: 'سياج مستودع الري' }, center: [35.5980, 51.4350], radius: 900 },
    ],
  },
  dubai: {
    center: [25.1650, 55.2500], zoom: 11,
    places: [
      geoP('d1', 'branch', 'busy', 'شعبهٔ داون‌تاون', 'Downtown branch', 'بلوار شیخ محمد بن راشد', 'Sheikh Mohammed bin Rashid Blvd.', 25.1972, 55.2744, 356, 16),
      geoP('d2', 'branch', 'open', 'شعبهٔ مارینا', 'Marina branch', 'مارینا واک', 'Marina Walk', 25.0805, 55.1403, 241, 12),
      geoP('d3', 'branch', 'open', 'شعبهٔ دیره', 'Deira branch', 'خیابان الرقه', 'Al Rigga St.', 25.2697, 55.3095, 198, 11),
      geoP('d4', 'office', 'open', 'دفتر بیزینس‌بی', 'Business Bay office', 'برج بی‌اسکوئر', 'Bay Square', 25.1850, 55.2650, 0, 38),
      geoP('d5', 'pickup', 'open', 'تحویل JLT', 'JLT pickup', 'خوشهٔ D', 'Cluster D', 25.0700, 55.1430, 84, 3),
      geoP('d6', 'branch', 'open', 'شعبهٔ البرشا', 'Al Barsha branch', 'البرشا ۱', 'Al Barsha 1', 25.1130, 55.2000, 167, 9),
      geoP('d7', 'pickup', 'busy', 'تحویل جمیرا', 'Jumeirah pickup', 'جادهٔ جمیرا', 'Jumeirah Beach Rd.', 25.2100, 55.2550, 129, 4),
      geoP('d8', 'branch', 'closed', 'شعبهٔ DIFC', 'DIFC branch', 'گیت ویلیج', 'Gate Village', 25.2120, 55.2810, 0, 7),
      geoP('d9', 'warehouse', 'busy', 'انبار القوز', 'Al Quoz warehouse', 'منطقهٔ صنعتی القوز ۳', 'Al Quoz Industrial 3', 25.1400, 55.2300, 520, 28),
      geoP('d10', 'warehouse', 'open', 'انبار جبل علی', 'Jebel Ali warehouse', 'منطقهٔ آزاد جافزا', 'JAFZA free zone', 25.0110, 55.0900, 610, 35),
      geoP('d11', 'branch', 'open', 'شعبهٔ مردف', 'Mirdif branch', 'مردف سیتی سنتر', 'Mirdif City Centre', 25.2200, 55.4200, 142, 8),
      geoP('d12', 'pickup', 'open', 'تحویل سیلیکون اوسیس', 'Silicon Oasis pickup', 'دبی سیلیکون اوسیس', 'Dubai Silicon Oasis', 25.1200, 55.3800, 71, 3),
      geoP('d13', 'branch', 'open', 'شعبهٔ کرامه', 'Karama branch', 'بازار کرامه', 'Karama Market', 25.2440, 55.3040, 188, 10),
      geoP('d14', 'pickup', 'closed', 'تحویل پالم', 'Palm pickup', 'پالم جمیرا، ترانک', 'Palm Jumeirah, trunk', 25.1124, 55.1390, 0, 2),
      geoP('d15', 'branch', 'open', 'شعبهٔ القصیص', 'Al Qusais branch', 'القصیص ۲', 'Al Qusais 2', 25.2800, 55.3800, 117, 7),
    ],
    routes: [
      [[25.0110, 55.0900], [25.0450, 55.1200], [25.0750, 55.1450], [25.1000, 55.1700], [25.1300, 55.2050], [25.1600, 55.2350], [25.1900, 55.2650], [25.2150, 55.2800], [25.2300, 55.2900]],
      [[25.0800, 55.1900], [25.1200, 55.2200], [25.1600, 55.2600], [25.1900, 55.3000], [25.2100, 55.3300]],
      [[25.2697, 55.3095], [25.2600, 55.3300], [25.2500, 55.3500], [25.2400, 55.3800], [25.2200, 55.4200]],
      [[25.2350, 55.2650], [25.2100, 55.2450], [25.1800, 55.2200], [25.1500, 55.1950], [25.1200, 55.1650], [25.0900, 55.1450]],
      [[25.1200, 55.3800], [25.1500, 55.3900], [25.1900, 55.4050], [25.2200, 55.4200]],
    ],
    zones: [
      { id: 'zd1', shape: 'polygon', tone: 'accent', name: { fa: 'محدودهٔ داون‌تاون', en: 'Downtown zone', ar: 'منطقة داون تاون' }, latlngs: [[25.2150, 55.2600], [25.2100, 55.2950], [25.1820, 55.2900], [25.1780, 55.2620]] },
      { id: 'zd2', shape: 'circle', tone: 'ink', name: { fa: 'مارینا — ارسال سریع', en: 'Marina — express', ar: 'المارينا — توصيل سريع' }, center: [25.0800, 55.1420], radius: 2200 },
      { id: 'zd3', shape: 'circle', tone: 'danger', name: { fa: 'حریم انبار جبل علی', en: 'Jebel Ali fence', ar: 'سياج جبل علي' }, center: [25.0110, 55.0900], radius: 1500 },
    ],
  },
};
export const geoVehicles = [
  ['TH-12', 'tehran', 0, 'رضا کریمی', 'Reza Karimi', 34, 'moving'], ['TH-07', 'tehran', 1, 'سارا احمدی', 'Sara Ahmadi', 28, 'moving'],
  ['TH-21', 'tehran', 2, 'امید رستمی', 'Omid Rostami', 46, 'moving'], ['TH-03', 'tehran', 3, 'نگار مرادی', 'Negar Moradi', 22, 'moving'],
  ['TH-15', 'tehran', 4, 'حمید صالحی', 'Hamid Salehi', 0, 'idle'], ['TH-30', 'tehran', 5, 'مهدی نوری', 'Mahdi Nouri', 38, 'moving'],
  ['TH-09', 'tehran', 0, 'لیلا فرهادی', 'Leila Farhadi', 0, 'offline'],
  ['DX-04', 'dubai', 0, 'احمد خلیل', 'Ahmed Khalil', 72, 'moving'], ['DX-11', 'dubai', 1, 'مریم سعید', 'Maryam Saeed', 58, 'moving'],
  ['DX-02', 'dubai', 2, 'یوسف عمر', 'Yousef Omar', 41, 'moving'], ['DX-17', 'dubai', 3, 'نورا حسن', 'Noura Hassan', 49, 'moving'],
  ['DX-08', 'dubai', 4, 'کریم ناصر', 'Karim Nasser', 0, 'idle'],
].map(([id, city, route, fa, en, speed, status], i) => ({ id, city, route, driver: { fa, en, ar: en }, speed, status, offset: (i * 0.137) % 1 }));
export function geoOrders(city, n = 420) {
  const r = rng(city === 'tehran' ? 77 : 91);
  const src = geoCities[city].places.filter((p) => p.type !== 'office');
  const g = () => (r() + r() + r() - 1.5) / 1.5;
  return Array.from({ length: n }, () => {
    const p = src[Math.floor(Math.pow(r(), 1.4) * src.length)];
    return [p.lat + g() * 0.022, p.lng + g() * 0.026, 0.4 + r() * (p.orders / 300)];
  });
}
