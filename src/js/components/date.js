/* AC.date — Jalali (Shamsi), Gregorian and Hijri lunar (Umm al-Qura) dates on top of the datepicker's calendar engine.
   AC.date.format(new Date(), { calendar: 'persian', style: 'numeric' })  → "1405/07/28" (digits: 'native' → "۱۴۰۵/۰۷/۲۸")
   style: numeric | short («۲۸ مهر») | medium («۲۸ مهر ۱۴۰۵») | long («سه‌شنبه ۲۸ مهر ۱۴۰۵») | month («مهر ۱۴۰۵») | relative («۳ روز پیش»)
   AC.date.parts(date, 'islamic') → {y,m,d} · AC.date.toDate(1405, 7, 28, 'persian') → Date (UTC midnight)
   AC.date.convert({y:1405,m:7,d:28}, 'persian', 'gregory') → {y:2026,m:10,d:20}
   AC.date.holidays(1405) → [{ iso, name, en, kind: 'solar'|'lunar' }] · AC.date.holiday(date) → {name,…}|null
   Lunar holidays are computed with Umm al-Qura; Iran's official lunar dates follow local moon sighting and can differ by ±1 day. */
import { AC, i18n } from '../core.js';
import { calKit } from './datepicker.js';

const { CAL, DAY, dtf, caId, monthLen, weekday, todayDn, isoToDn, dnToIso, pad } = calKit;

const LOC = { fa: 'fa-IR', en: 'en-US', ar: 'ar-AE' };
const lng = (o) => (o.lang || i18n.lang || 'fa').split('-')[0];
const native = (o) => (o.digits || i18n.digits) === 'native';
const DIG = { fa: '۰۱۲۳۴۵۶۷۸۹', ar: '٠١٢٣٤٥٦٧٨٩' };
const digits = (s, o) => (native(o) && DIG[lng(o)] ? String(s).replace(/\d/g, (d) => DIG[lng(o)][d]) : String(s));
const loc = (o, cal) => `${LOC[lng(o)] || lng(o)}-u-ca-${caId(cal || 'gregory')}-nu-latn`;
const calOf = (o) => o.calendar || (lng(o) === 'fa' ? 'persian' : 'gregory');

/** Any date input → day number (days since 1970-01-01). ISO "YYYY-MM-DD" strings are taken literally; Dates use local Y/M/D. */
function dnOf(v) {
  if (typeof v === 'number' && v < 1e6) return v;
  if (typeof v === 'string') { const dn = isoToDn(v.slice(0, 10)); if (dn != null) return dn; }
  const d = new Date(v); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
}
const parts = (v, cal = 'persian') => CAL[cal].parts(dnOf(v));
const toDate = (y, m, d, cal = 'persian') => new Date(CAL[cal].from(y, m, d) * DAY);
const convert = ({ y, m, d }, from, to) => CAL[to].parts(CAL[from].from(y, m, d));
const monthName = (m, o = {}, y = 1405) => { const cal = calOf(o); return dtf(loc(o, cal), { month: 'long' }).format(new Date(CAL[cal].from(y, m, 15) * DAY)); };
const weekdayName = (v, o = {}) => dtf(loc(o), { weekday: o.weekday || 'long' }).format(new Date(dnOf(v) * DAY));

function relative(v, o = {}) {
  const diff = dnOf(v) - todayDn();
  const rtf = new Intl.RelativeTimeFormat(`${LOC[lng(o)] || lng(o)}${native(o) ? '' : '-u-nu-latn'}`, { numeric: 'auto' });
  const a = Math.abs(diff);
  if (a < 7) return rtf.format(diff, 'day');
  if (a < 30) return rtf.format(Math.round(diff / 7), 'week');
  if (a < 365) return rtf.format(Math.round(diff / 30.44), 'month');
  return rtf.format(Math.round(diff / 365.25), 'year');
}

function format(v, o = {}) {
  if (v == null || v === '') return '';
  const cal = calOf(o); const style = o.style || 'medium';
  if (style === 'relative') return relative(v, o);
  const dn = dnOf(v); const p = CAL[cal].parts(dn); const en = lng(o) === 'en';
  if (style === 'numeric') return digits(`${p.y}/${pad(p.m)}/${pad(p.d)}`, o);
  const mn = monthName(p.m, { ...o, calendar: cal }, p.y);
  const d = digits(p.d, o); const y = digits(p.y, o);
  if (style === 'month') return `${mn} ${y}`;
  if (style === 'short') return en ? `${mn} ${d}` : `${d} ${mn}`;
  const med = en ? `${mn} ${d}, ${y}` : `${d} ${mn} ${y}`;
  if (style === 'medium') return med;
  return `${weekdayName(dn, o)}${en ? ',' : ''} ${med}`; // long / full
}

/* ------------------------------------------------------------------ Iranian official holidays */
/* Solar (Jalali) holidays fall on the same Jalali date every year; checked against the official 1404–1406 calendars. */
const SOLAR = [
  [1, 1, 'جشن نوروز', 'Nowruz'], [1, 2, 'عید نوروز', 'Nowruz'], [1, 3, 'عید نوروز', 'Nowruz'], [1, 4, 'عید نوروز', 'Nowruz'],
  [1, 12, 'روز جمهوری اسلامی', 'Islamic Republic Day'], [1, 13, 'روز طبیعت', 'Nature Day (Sizdah Bedar)'],
  [3, 14, 'رحلت امام خمینی', 'Demise of Imam Khomeini'], [3, 15, 'قیام ۱۵ خرداد', '15 Khordad uprising'],
  [11, 22, 'پیروزی انقلاب اسلامی', 'Revolution Day'], [12, 29, 'ملی شدن صنعت نفت', 'Oil Nationalization Day'],
];
/* Lunar (Hijri) holidays on fixed Hijri dates; day 0 = last day of the month. */
const LUNAR = [
  [1, 9, 'تاسوعای حسینی', 'Tasua'], [1, 10, 'عاشورای حسینی', 'Ashura'], [2, 20, 'اربعین حسینی', 'Arbaeen'],
  [2, 28, 'رحلت رسول اکرم و شهادت امام حسن مجتبی', 'Demise of the Prophet & martyrdom of Imam Hasan'], [2, 0, 'شهادت امام رضا', 'Martyrdom of Imam Reza'],
  [3, 8, 'شهادت امام حسن عسکری', 'Martyrdom of Imam Hasan Askari'], [3, 17, 'میلاد رسول اکرم و امام جعفر صادق', 'Birth of the Prophet & Imam Sadiq'],
  [6, 3, 'شهادت حضرت فاطمه زهرا', 'Martyrdom of Fatimah'], [7, 13, 'ولادت امام علی', 'Birth of Imam Ali'], [7, 27, 'مبعث رسول اکرم', 'Mab\'ath'],
  [8, 15, 'ولادت حضرت قائم', 'Birth of Imam Mahdi'], [9, 21, 'شهادت حضرت علی', 'Martyrdom of Imam Ali'],
  [10, 1, 'عید سعید فطر', 'Eid al-Fitr'], [10, 2, 'تعطیل به مناسبت عید فطر', 'Eid al-Fitr holiday'], [10, 25, 'شهادت امام جعفر صادق', 'Martyrdom of Imam Sadiq'],
  [12, 10, 'عید سعید قربان', 'Eid al-Adha'], [12, 18, 'عید سعید غدیر خم', 'Eid al-Ghadir'],
];
const yearCache = new Map();
const hijriAdjust = {}; // 'hijriYear-month' → days (Iran's moon-sighting correction vs Umm al-Qura)
/** Holidays of a Jalali year, sorted: [{ iso, dn, name, en, kind }]. */
function holidays(jy) {
  if (yearCache.has(jy)) return yearCache.get(jy);
  const start = CAL.persian.from(jy, 1, 1); const end = CAL.persian.from(jy + 1, 1, 1);
  const out = [];
  for (const [m, d, name, en] of SOLAR) if (d <= monthLen('persian', jy, m)) out.push({ dn: CAL.persian.from(jy, m, d), name, en, kind: 'solar' });
  const h0 = CAL.islamic.parts(start).y; const h1 = CAL.islamic.parts(end).y;
  for (let hy = h0; hy <= h1; hy++) for (const [m, d, name, en] of LUNAR) {
    const dn = CAL.islamic.from(hy, m, d || monthLen('islamic', hy, m)) + (hijriAdjust[`${hy}-${m}`] || 0);
    if (dn >= start && dn < end) out.push({ dn, name, en, kind: 'lunar' });
  }
  out.sort((a, b) => a.dn - b.dn);
  out.forEach((x) => { x.iso = dnToIso(x.dn); });
  yearCache.set(jy, out);
  return out;
}
function holiday(v) {
  const dn = dnOf(v); const jy = CAL.persian.parts(dn).y;
  return holidays(jy).find((x) => x.dn === dn) || null;
}

calKit.decorate = (dn) => {
  const hd = holiday(dn);
  return { weekend: weekday(dn) === 5, holiday: hd ? (lng({}) === 'en' ? hd.en : hd.name) : null };
};

export const date = {
  calendars: ['persian', 'gregory', 'islamic'],
  format, relative, parts, toDate, convert, holidays, holiday, monthName, weekdayName,
  /** Correct lunar holidays to Iran's announced dates: adjustHijri({ '1447-1': 1 }) shifts Muharram 1447 by +1 day. */
  adjustHijri(map) { Object.assign(hijriAdjust, map); yearCache.clear(); },
  isHoliday: (v) => !!holiday(v) || weekday(dnOf(v)) === 5,
  monthLength: (y, m, cal = 'persian') => monthLen(cal, y, m),
  today: () => dnToIso(todayDn()),
  toISO: (v) => dnToIso(dnOf(v)),
};
AC.date = date;
