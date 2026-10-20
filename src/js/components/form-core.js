/* Shared helpers for the input & form family (not a component itself).
   - ft(key, vars): translated message — demo/i18n wins, then a built-in fa/en/ar table.
   - latin(str): Persian/Arabic digits → Latin digits.
   - popup(owner, panel, { sheet, match }): a positioned panel in the top layer (Popover API),
     anchored to `owner`; with `sheet: true` it becomes a bottom sheet on phones (<640px).
   - fire(el): dispatch bubbling native input + change events (so validation and forms react). */
import { i18n, on, gesture, reducedMotion } from '../core.js';

const MSG = {
  en: {
    clear: 'Clear', show: 'Show password', hide: 'Hide password', s0: 'Too weak', s1: 'Weak', s2: 'Fair', s3: 'Good', s4: 'Strong',
    noResults: 'No results', loading: 'Loading…', remove: 'Remove', today: 'Today', prev: 'Previous', next: 'Next',
    jalali: 'Jalali', gregorian: 'Gregorian', hijri: 'Hijri', chooseDate: 'Choose date', chooseTime: 'Choose time', hour: 'Hour', minute: 'Minute', done: 'Done',
    drop: 'Drag files here or', browse: 'browse', dropHint: 'Up to {n} files, {size} each', tooLarge: 'Too large', increase: 'Increase', decrease: 'Decrease',
    rating: '{n} of {max}', digit: 'Digit {n}', tagHint: 'Type and press Enter', months: 'Months', years: 'Years', uploaded: 'Uploaded',
    caps: 'Caps Lock is on', 'r.len': 'At least 8 characters', 'r.case': 'Upper and lower case letters', 'r.digit': 'A number', 'r.symbol': 'A symbol (!@#…)', otpOk: 'Code verified',
    'err.required': 'This field is required', 'err.email': 'Enter a valid email address', 'err.url': 'Enter a valid URL', 'err.numeric': 'Numbers only',
    'err.min': 'At least {n} characters', 'err.max': 'At most {n} characters', 'err.minValue': 'Must be at least {n}', 'err.maxValue': 'Must be at most {n}',
    'err.length': 'Must be exactly {n} characters', 'err.match': 'Values do not match', 'err.iranMobile': 'Enter a valid Iranian mobile (09xxxxxxxxx)',
    'err.iranNationalId': 'Invalid national ID', 'err.iranPostal': 'Postal code must be 10 digits', 'err.iranCard': 'Invalid card number',
    'err.checked': 'Please confirm to continue', 'err.date': 'Enter a valid date', 'err.minItems': 'Choose at least {n}',
  },
  fa: {
    clear: 'پاک کردن', show: 'نمایش رمز', hide: 'پنهان کردن رمز', s0: 'خیلی ضعیف', s1: 'ضعیف', s2: 'متوسط', s3: 'خوب', s4: 'قوی',
    noResults: 'نتیجه‌ای پیدا نشد', loading: 'در حال بارگذاری…', remove: 'حذف', today: 'امروز', prev: 'قبلی', next: 'بعدی',
    jalali: 'شمسی', gregorian: 'میلادی', hijri: 'قمری', chooseDate: 'انتخاب تاریخ', chooseTime: 'انتخاب ساعت', hour: 'ساعت', minute: 'دقیقه', done: 'تأیید',
    drop: 'فایل‌ها را اینجا رها کنید یا', browse: 'انتخاب کنید', dropHint: 'حداکثر {n} فایل، هر کدام {size}', tooLarge: 'حجم زیاد است', increase: 'افزایش', decrease: 'کاهش',
    rating: '{n} از {max}', digit: 'رقم {n}', tagHint: 'بنویسید و Enter بزنید', months: 'ماه‌ها', years: 'سال‌ها', uploaded: 'بارگذاری شد',
    caps: 'کلید Caps Lock روشن است', 'r.len': 'دست‌کم ۸ نویسه', 'r.case': 'حروف بزرگ و کوچک لاتین', 'r.digit': 'یک عدد', 'r.symbol': 'یک نماد (!@#…)', otpOk: 'کد تأیید شد',
    'err.required': 'این فیلد الزامی است', 'err.email': 'ایمیل معتبر وارد کنید', 'err.url': 'نشانی معتبر وارد کنید', 'err.numeric': 'فقط عدد وارد کنید',
    'err.min': 'حداقل {n} نویسه', 'err.max': 'حداکثر {n} نویسه', 'err.minValue': 'حداقل مقدار {n} است', 'err.maxValue': 'حداکثر مقدار {n} است',
    'err.length': 'باید دقیقاً {n} نویسه باشد', 'err.match': 'مقادیر یکسان نیستند', 'err.iranMobile': 'شمارهٔ موبایل معتبر نیست (۰۹xxxxxxxxx)',
    'err.iranNationalId': 'کد ملی معتبر نیست', 'err.iranPostal': 'کد پستی باید ۱۰ رقم باشد', 'err.iranCard': 'شمارهٔ کارت معتبر نیست',
    'err.checked': 'برای ادامه تأیید کنید', 'err.date': 'تاریخ معتبر وارد کنید', 'err.minItems': 'حداقل {n} مورد انتخاب کنید',
  },
  ar: {
    clear: 'مسح', show: 'إظهار كلمة المرور', hide: 'إخفاء كلمة المرور', s0: 'ضعيفة جداً', s1: 'ضعيفة', s2: 'متوسطة', s3: 'جيدة', s4: 'قوية',
    noResults: 'لا توجد نتائج', loading: 'جارٍ التحميل…', remove: 'إزالة', today: 'اليوم', prev: 'السابق', next: 'التالي',
    jalali: 'هجري شمسي', gregorian: 'ميلادي', hijri: 'هجري قمري', chooseDate: 'اختر التاريخ', chooseTime: 'اختر الوقت', hour: 'الساعة', minute: 'الدقيقة', done: 'تم',
    drop: 'اسحب الملفات هنا أو', browse: 'تصفّح', dropHint: 'حتى {n} ملفات، {size} لكل ملف', tooLarge: 'الحجم كبير', increase: 'زيادة', decrease: 'إنقاص',
    rating: '{n} من {max}', digit: 'الرقم {n}', tagHint: 'اكتب واضغط Enter', months: 'الأشهر', years: 'السنوات', uploaded: 'تم الرفع',
    caps: 'مفتاح Caps Lock مفعّل', 'r.len': '8 أحرف على الأقل', 'r.case': 'أحرف لاتينية كبيرة وصغيرة', 'r.digit': 'رقم واحد', 'r.symbol': 'رمز واحد (!@#…)', otpOk: 'تم التحقق من الرمز',
    'err.required': 'هذا الحقل مطلوب', 'err.email': 'أدخل بريداً إلكترونياً صالحاً', 'err.url': 'أدخل رابطاً صالحاً', 'err.numeric': 'أرقام فقط',
    'err.min': '{n} أحرف على الأقل', 'err.max': '{n} أحرف كحد أقصى', 'err.minValue': 'يجب ألا يقل عن {n}', 'err.maxValue': 'يجب ألا يزيد عن {n}',
    'err.length': 'يجب أن يكون {n} أحرف بالضبط', 'err.match': 'القيم غير متطابقة', 'err.iranMobile': 'رقم جوال إيراني غير صالح',
    'err.iranNationalId': 'رقم الهوية الوطنية غير صالح', 'err.iranPostal': 'الرمز البريدي 10 أرقام', 'err.iranCard': 'رقم البطاقة غير صالح',
    'err.checked': 'يرجى التأكيد للمتابعة', 'err.date': 'أدخل تاريخاً صالحاً', 'err.minItems': 'اختر {n} على الأقل',
  },
};

/** Translated form message: `form.<key>` from the app dictionary, else the built-in table. */
export function ft(key, vars) {
  const lang = (i18n.lang || 'en').split('-')[0];
  return i18n.t(`form.${key}`, (MSG[lang] || MSG.en)[key] ?? MSG.en[key] ?? key, vars);
}

const DIGITS = { '۰': 0, '۱': 1, '۲': 2, '۳': 3, '۴': 4, '۵': 5, '۶': 6, '۷': 7, '۸': 8, '۹': 9, '٠': 0, '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5, '٦': 6, '٧': 7, '٨': 8, '٩': 9 };
export const latin = (s) => String(s ?? '').replace(/[۰-۹٠-٩]/g, (c) => DIGITS[c]);

export function fire(el, types = ['input', 'change']) {
  for (const t of types) el.dispatchEvent(new Event(t, { bubbles: true }));
}

export const isPhone = () => matchMedia('(max-width: 639.98px)').matches;
const hasPopover = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;

/**
 * popup(owner, panel, opts) → { open(), close(), toggle(), place(), get isOpen, destroy() }
 * owner: the anchor (the panel is aligned to its inline-start edge, at least as wide when `match`).
 * opts: { sheet: false, match: true, onOpen(), onClose(), gap: 6 }
 */
export function popup(owner, panel, opts = {}) {
  const o = { sheet: false, match: true, gap: 6, ...opts };
  panel.classList.add('ac-pop');
  if (hasPopover) panel.setAttribute('popover', 'manual');
  panel.hidden = !hasPopover;
  let open = false; let offs = []; let drag = null;

  function place() {
    if (!open) return;
    const sheet = o.sheet && isPhone();
    panel.toggleAttribute('data-sheet', sheet);
    if (sheet) return;
    const r = owner.getBoundingClientRect();
    const vw = document.documentElement.clientWidth; const vh = window.innerHeight;
    if (o.match) panel.style.setProperty('--_w', `${r.width}px`);
    panel.style.setProperty('--_maxh', 'none');
    const pw = panel.offsetWidth; const ph = panel.offsetHeight;
    const rtl = getComputedStyle(owner).direction === 'rtl';
    let x = rtl ? r.right - pw : r.left;
    x = Math.max(8, Math.min(x, vw - pw - 8));
    const below = vh - r.bottom; const above = r.top;
    const up = below < ph + o.gap + 8 && above > below;
    const y = up ? Math.max(8, r.top - ph - o.gap) : r.bottom + o.gap;
    panel.toggleAttribute('data-up', up);
    panel.style.setProperty('--_x', `${Math.round(x)}px`);
    panel.style.setProperty('--_y', `${Math.round(y)}px`);
    panel.style.setProperty('--_maxh', `${Math.max(160, (up ? above : below) - o.gap - 16)}px`);
  }

  function show() {
    if (open) return;
    open = true;
    panel.hidden = false;
    if (hasPopover) { try { panel.showPopover(); } catch { /* detached */ } }
    panel.setAttribute('data-state', 'open');
    place();
    const onDoc = (e) => { if (!panel.contains(e.target) && !owner.contains(e.target)) close(); };
    offs = [
      on(document, 'pointerdown', onDoc, true),
      on(window, 'resize', place),
      on(window, 'scroll', place, { capture: true, passive: true }),
      on(panel, 'keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(true); } }),
    ];
    if (o.sheet && isPhone()) {
      drag = gesture(panel, {
        axis: 'y',
        filter: (e) => !e.target.closest('.ac-pop__scroll, input, button:not(.ac-pop__grab)') || e.target.closest('.ac-pop__grab'),
        onMove: (s) => panel.style.setProperty('--ac-drag', `${Math.max(0, s.dy)}px`),
        onEnd: (s) => {
          panel.style.removeProperty('--ac-drag');
          if (s.dy > 90 || s.vy > 0.5) close(true);
        },
      });
    }
    o.onOpen?.();
  }

  function close(refocus = false) {
    if (!open) return;
    open = false;
    offs.forEach((f) => f()); offs = [];
    drag?.(); drag = null;
    panel.setAttribute('data-state', 'closed');
    const done = () => { if (open) return; if (hasPopover) { try { panel.hidePopover(); } catch { /* ignore */ } } else panel.hidden = true; };
    if (reducedMotion() || !hasPopover) done(); else setTimeout(done, 140);
    o.onClose?.(refocus);
  }

  return {
    open: show, close, place,
    toggle() { open ? close() : show(); },
    get isOpen() { return open; },
    destroy() { offs.forEach((f) => f()); drag?.(); },
  };
}

/** Roving active-descendant helper for listboxes: returns the next index for ArrowUp/Down/Home/End or null. */
export function listKey(e, len, cur) {
  if (!len) return null;
  if (e.key === 'ArrowDown') return cur < 0 ? 0 : (cur + 1) % len;
  if (e.key === 'ArrowUp') return cur < 0 ? len - 1 : (cur - 1 + len) % len;
  if (e.key === 'Home' && e.ctrlKey) return 0;
  if (e.key === 'End' && e.ctrlKey) return len - 1;
  if (e.key === 'PageDown') return Math.min(len - 1, Math.max(0, cur) + 8);
  if (e.key === 'PageUp') return Math.max(0, cur - 8);
  return null;
}
