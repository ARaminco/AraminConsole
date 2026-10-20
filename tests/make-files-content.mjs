#!/usr/bin/env node
/* Generates the REAL sample files the files demo previews (demo/content/files/): photos and scans (JPG), a logo (SVG),
   multi-page PDFs (Chromium page.pdf with Vazirmatn), first-page renditions for the PDFs / Office docs (what a server's
   adapter.thumbnail() would return), a WebM clip (canvas + MediaRecorder), a WAV voice note, CSV, Markdown, code and text.
   node tests/make-files-content.mjs   (uses playwright-core + the local Chromium; total output stays < 3 MB) */
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'demo', 'content', 'files');
mkdirSync(OUT, { recursive: true });
const base = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const exe = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse().flatMap((d) => ['chrome-win64', 'chrome-win'].map((s) => join(base, d, s, 'chrome.exe'))).find(existsSync);
const FONT = pathToFileURL(join(ROOT, 'src', 'fonts', 'vazirmatn-variable.woff2')).href;
const HEAD = `<meta charset="utf-8"><style>@font-face{font-family:V;src:url("${FONT}") format("woff2");font-weight:100 900}*{box-sizing:border-box}html,body{margin:0}body{font-family:V,system-ui,sans-serif}</style>`;
const TMP = join(OUT, '.tmp.html');

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage();
async function shot(name, html, w, h, { type = 'jpeg', quality = 80 } = {}) {
  writeFileSync(TMP, `<!doctype html><html><head>${HEAD}</head><body>${html}</body></html>`);
  await page.setViewportSize({ width: w, height: h });
  await page.goto(pathToFileURL(TMP).href); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT, name), type, ...(type === 'jpeg' ? { quality } : {}), clip: { x: 0, y: 0, width: w, height: h } });
}

/* ---------------- photos (illustrations rendered with CSS gradients + SVG) */
const sky = (a, b, c) => `background:linear-gradient(180deg,${a} 0%,${b} 55%,${c} 100%)`;
await shot('dubai-skyline.jpg', `<div style="position:relative;width:1280px;height:853px;${sky('#0f2a4a', '#f08a4b', '#ffd59a')};overflow:hidden">
  <div style="position:absolute;left:860px;top:250px;width:170px;height:170px;border-radius:50%;background:radial-gradient(#fff6d8,#ffc06b 60%,transparent 70%)"></div>
  <svg width="1280" height="853" style="position:absolute;inset:0"><g fill="#1b1d2b">
  ${Array.from({ length: 34 }, (_, i) => { const x = i * 38; const h = 40 + ((i * 97) % 190) + (i === 17 ? 330 : 0) + (i === 9 || i === 26 ? 120 : 0); return `<rect x="${x}" y="${853 - 150 - h}" width="${24 + (i % 3) * 6}" height="${h + 150}" rx="3"/>`; }).join('')}
  <path d="M658 ${853 - 150 - 410 - 70}l8 70h-16z"/></g>
  <g fill="#ffd59a" opacity=".55">${Array.from({ length: 240 }, (_, i) => `<rect x="${(i * 53) % 1280}" y="${520 + ((i * 29) % 300)}" width="3" height="5"/>`).join('')}</g>
  <rect y="790" width="1280" height="63" fill="#10131f" opacity=".9"/></svg></div>`, 1280, 853);
await shot('kish-sunset.jpg', `<div style="position:relative;width:1280px;height:853px;${sky('#2d1b4e', '#e8547a', '#ffb36b')};overflow:hidden">
  <div style="position:absolute;left:560px;top:380px;width:170px;height:170px;border-radius:50%;background:radial-gradient(#fff3c4,#ff9a4d 65%,transparent 72%)"></div>
  <div style="position:absolute;inset:470px 0 0;background:linear-gradient(180deg,#5a2d6b,#1d1838)"></div>
  ${Array.from({ length: 22 }, (_, i) => `<div style="position:absolute;left:${560 + Math.sin(i) * 40 - i * 4}px;top:${480 + i * 16}px;width:${160 + i * 8}px;height:3px;border-radius:3px;background:#ffb36b;opacity:${0.7 - i * 0.03}"></div>`).join('')}
  <svg width="1280" height="853" style="position:absolute;inset:0"><path d="M0 470 Q160 430 300 468 T560 470 L560 480 L0 480Z" fill="#26183b"/><path d="M980 470c40-90 70-150 80-210M1060 260c-40 0-80 20-100 40M1060 260c30-20 80-20 110 0M1060 260c0-30 30-60 60-60M1060 260c-20-30-60-40-90-30" stroke="#1a1028" stroke-width="9" fill="none" stroke-linecap="round"/></svg></div>`, 1280, 853);
await shot('team-offsite.jpg', `<div style="position:relative;width:1280px;height:853px;${sky('#7cc4ff', '#cfe9ff', '#f3f8ff')};overflow:hidden">
  <svg width="1280" height="853" style="position:absolute;inset:0"><path d="M0 560 L220 300 L380 470 L560 220 L780 520 L960 340 L1280 560 V853 H0Z" fill="#6f86a8"/><path d="M500 290 L560 220 L620 300 L590 285 L560 310 L530 288Z" fill="#fff"/>
  <path d="M0 640 Q300 540 640 620 T1280 600 V853 H0Z" fill="#4f9a5d"/><path d="M0 720 Q320 650 700 720 T1280 700 V853 H0Z" fill="#3d7d49"/>
  ${Array.from({ length: 6 }, (_, i) => `<g transform="translate(${430 + i * 70} ${690 - (i % 2) * 8})"><circle r="15" cy="-60" fill="#2b2b33"/><rect x="-16" y="-44" width="32" height="54" rx="12" fill="${['#f0532d', '#2f6fde', '#eab308', '#a855f7', '#14b8a6', '#ef4444'][i]}"/></g>`).join('')}</svg></div>`, 1280, 853);
await shot('new-office.jpg', `<div style="position:relative;width:1280px;height:853px;background:#ece7df;overflow:hidden">
  <div style="position:absolute;left:120px;top:90px;width:520px;height:420px;background:linear-gradient(160deg,#bfe3ff,#e8f5ff);border:18px solid #fff;box-shadow:0 20px 50px rgba(0,0,0,.12)"></div>
  <div style="position:absolute;left:380px;top:90px;width:18px;height:420px;background:#fff"></div>
  <div style="position:absolute;left:0;right:0;top:600px;bottom:0;background:linear-gradient(#c9b79c,#b39f82)"></div>
  <div style="position:absolute;left:700px;top:430px;width:480px;height:26px;border-radius:6px;background:#3b2f25"></div>
  <div style="position:absolute;left:760px;top:456px;width:16px;height:180px;background:#3b2f25"></div><div style="position:absolute;left:1110px;top:456px;width:16px;height:180px;background:#3b2f25"></div>
  <div style="position:absolute;left:830px;top:300px;width:220px;height:130px;border-radius:10px;background:#1d1d22;border:8px solid #2c2c33"></div>
  <div style="position:absolute;left:130px;top:520px;width:90px;height:110px;border-radius:12px 12px 20px 20px;background:#d9834a"></div>
  ${Array.from({ length: 7 }, (_, i) => `<div style="position:absolute;left:${120 + i * 16}px;top:${380 - i * 9}px;width:60px;height:150px;border-radius:50% 50% 0 50%;background:#3f8f4f;transform:rotate(${-40 + i * 14}deg);transform-origin:bottom"></div>`).join('')}</div>`, 1280, 853);
// scans
await shot('id-card-front.jpg', `<div style="width:900px;height:570px;padding:30px;background:#d6d3cc"><div dir="rtl" style="height:100%;border-radius:26px;background:linear-gradient(135deg,#e6f3ea,#cfe6f0);box-shadow:0 8px 24px rgba(0,0,0,.18);padding:34px 40px;position:relative;font-size:24px;color:#173b2c">
  <div style="font-weight:800;font-size:30px">کارت هوشمند ملی</div><div style="opacity:.7;font-size:18px">جمهوری اسلامی ایران — نمونهٔ آزمایشی</div>
  <div style="position:absolute;left:44px;top:120px;width:200px;height:250px;border-radius:14px;background:linear-gradient(#b8c4cc,#8d9aa5)"><div style="width:90px;height:90px;border-radius:50%;background:#e9eef1;margin:40px auto 0"></div><div style="width:150px;height:90px;border-radius:70px 70px 10px 10px;background:#e9eef1;margin:12px auto 0"></div></div>
  <div style="margin-top:40px;line-height:2.1">نام: <b>نمونه</b><br>نام خانوادگی: <b>آزمایشی</b><br>تاریخ تولد: <b>۱۳۶۵/۰۴/۱۲</b><br>شمارهٔ ملی: <b dir="ltr">000-000000-0</b></div>
  <div style="position:absolute;right:40px;bottom:30px;font-size:16px;opacity:.6">تاریخ انقضا: ۱۴۱۲/۰۴/۱۲</div></div></div>`, 900, 570);
const contractPage = (n, total) => `<div dir="rtl" style="width:794px;min-height:1123px;padding:70px 76px;background:#fff;color:#1f2328;font-size:15px;line-height:2.05;position:relative">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1f2328;padding-bottom:14px;margin-bottom:22px"><div><div style="font-weight:800;font-size:24px">قرارداد اجارهٔ واحد مسکونی</div><div style="color:#666;font-size:13px">شمارهٔ قرارداد: ق-۱۴۰۵/۲۳۸ · تاریخ: ۱۴۰۵/۰۲/۱۸</div></div>
  <div style="width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#ff6a3d,#ee4a22);color:#fff;display:grid;place-items:center;font-weight:800;font-size:30px">A</div></div>
  ${n === 1 ? `<p><b>مادهٔ ۱ — طرفین قرارداد.</b> این قرارداد میان «موجر» (شرکت نمونهٔ آرامین) و «مستأجر» (آقای نمونه) با مشخصات مندرج در پیوست الف منعقد می‌شود و طرفین متعهد به رعایت تمامی مفاد آن هستند.</p>
  <p><b>مادهٔ ۲ — موضوع قرارداد.</b> اجارهٔ یک واحد مسکونی به مساحت ۱۲۴ مترمربع، طبقهٔ دوازدهم، واحد ۱۲، همراه با یک پارکینگ و یک انباری، که به رؤیت مستأجر رسیده است.</p>
  <p><b>مادهٔ ۳ — مدت اجاره.</b> مدت اجاره یک سال شمسی از تاریخ ۱۴۰۵/۰۳/۰۱ تا پایان ۱۴۰۶/۰۲/۳۱ است و تمدید آن منوط به توافق کتبی طرفین خواهد بود.</p>` : n === 2 ? `<p><b>مادهٔ ۴ — اجاره‌بها و نحوهٔ پرداخت.</b> اجاره‌بهای ماهانه در ابتدای هر ماه به حساب معرفی‌شده از سوی موجر واریز می‌شود و رسید آن نزد مستأجر می‌ماند.</p>
  <table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:14px"><tr style="background:#f3f3f4"><th style="padding:8px;border:1px solid #ddd">قسط</th><th style="padding:8px;border:1px solid #ddd">سررسید</th><th style="padding:8px;border:1px solid #ddd">وضعیت</th></tr>${['اول', 'دوم', 'سوم', 'چهارم'].map((q, i) => `<tr><td style="padding:8px;border:1px solid #ddd">${q}</td><td style="padding:8px;border:1px solid #ddd">۱۴۰۵/۰${i + 3}/۰۱</td><td style="padding:8px;border:1px solid #ddd">${i < 2 ? 'پرداخت‌شده' : 'در انتظار'}</td></tr>`).join('')}</table>
  <p><b>مادهٔ ۵ — تعهدات مستأجر.</b> نگهداری از عین مستأجره، پرداخت هزینه‌های جاری و عدم واگذاری به غیر بدون اجازهٔ کتبی موجر.</p>` : `<p><b>مادهٔ ۶ — فسخ.</b> در صورت تخلف هر یک از طرفین از تعهدات خود، طرف دیگر پس از اخطار کتبی و مهلت ده‌روزه حق فسخ قرارداد را دارد.</p>
  <p><b>مادهٔ ۷ — نسخ قرارداد.</b> این قرارداد در هفت ماده و سه نسخهٔ یکسان تنظیم و امضا شد و هر نسخه حکم واحد دارد.</p>
  <div style="display:flex;justify-content:space-between;margin-top:90px;text-align:center"><div>امضای موجر<div style="font-family:cursive;font-size:30px;color:#2346a8;transform:rotate(-6deg);margin-top:10px">Aramin</div></div>
  <div style="width:130px;height:130px;border-radius:50%;border:4px double #c0392b;color:#c0392b;display:grid;place-items:center;transform:rotate(-14deg);font-weight:800;opacity:.85">مهر شرکت<br>نمونه</div><div>امضای مستأجر<div style="font-family:cursive;font-size:30px;color:#2346a8;transform:rotate(4deg);margin-top:10px">N. Sample</div></div></div>`}
  <div style="position:absolute;bottom:40px;left:76px;right:76px;display:flex;justify-content:space-between;color:#888;font-size:12px;border-top:1px solid #eee;padding-top:10px"><span>نمونهٔ آزمایشی — بدون اعتبار حقوقی</span><span>صفحهٔ ${n} از ${total}</span></div></div>`;
await shot('contract-scan-1.jpg', `<div style="width:900px;height:1200px;background:#cfccc4;padding:30px"><div style="transform:rotate(-1.2deg);box-shadow:0 6px 20px rgba(0,0,0,.25);filter:contrast(1.05) sepia(.12)">${contractPage(1, 3)}</div></div>`, 900, 1200, { quality: 62 });
await shot('contract-scan-2.jpg', `<div style="width:900px;height:1200px;background:#cfccc4;padding:30px"><div style="transform:rotate(.8deg);box-shadow:0 6px 20px rgba(0,0,0,.25);filter:contrast(1.05) sepia(.12)">${contractPage(3, 3)}</div></div>`, 900, 1200, { quality: 62 });
await shot('cheque.jpg', `<div style="width:1000px;height:440px;padding:24px;background:#d9d6cf"><div dir="rtl" style="height:100%;border-radius:10px;background:repeating-linear-gradient(45deg,#e9f1fb 0 12px,#e2ecf8 12px 24px);border:1px solid #9fb6d3;padding:26px 34px;position:relative;font-size:20px;color:#173057;line-height:2.4">
  <div style="font-weight:800;font-size:24px">بانک نمونه — چک صیادی (نمونهٔ آزمایشی)</div><div>به حواله‌کرد: <b>شرکت نمونهٔ آرامین</b></div><div>مبلغ: <b>دویست و پنجاه میلیون ریال</b></div><div>تاریخ سررسید: <b>۱۴۰۵/۰۸/۳۰</b></div>
  <div style="position:absolute;left:40px;bottom:40px;font-family:cursive;font-size:34px;color:#1f3f8a;transform:rotate(-8deg)">signature</div><div style="position:absolute;left:34px;top:30px;font-size:15px;opacity:.6" dir="ltr">No. 456789</div></div></div>`, 1000, 440, { quality: 70 });

/* ---------------- logo (SVG) */
writeFileSync(join(OUT, 'logo.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6a3d"/><stop offset="1" stop-color="#ee4a22"/></linearGradient></defs><rect width="512" height="512" rx="120" fill="url(#g)"/><path d="M256 104 392 408h-62l-29-68H211l-29 68h-62zm0 116-30 70h60z" fill="#fff"/></svg>\n`);

/* ---------------- PDFs + first-page renditions */
async function pdf(name, pagesHtml) {
  writeFileSync(TMP, `<!doctype html><html><head>${HEAD}<style>@page{size:A4;margin:0}.pg{page-break-after:always}</style></head><body>${pagesHtml.map((h) => `<div class="pg">${h}</div>`).join('')}</body></html>`);
  await page.goto(pathToFileURL(TMP).href); await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: join(OUT, name), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await shot(name.replace(/\.pdf$/, '.thumb.jpg'), `<div style="width:794px;height:1123px;overflow:hidden">${pagesHtml[0]}</div>`, 794, 1123, { quality: 60 });
}
await pdf('lease-contract.pdf', [contractPage(1, 3), contractPage(2, 3), contractPage(3, 3)]);
const invoice = (no, items) => `<div dir="rtl" style="width:794px;height:1123px;padding:64px 70px;background:#fff;color:#1f2328;font-size:15px;line-height:1.9;position:relative">
  <div style="display:flex;justify-content:space-between"><div><div style="font-weight:800;font-size:30px">فاکتور فروش</div><div style="color:#777">شمارهٔ ${no} · ۱۴۰۵/۰۷/۱۲</div></div><div style="text-align:left;color:#777;font-size:13px">شرکت نمونهٔ آرامین<br>تهران، خیابان نمونه، پلاک ۱۲</div></div>
  <table style="width:100%;border-collapse:collapse;margin-top:46px"><tr style="background:#111;color:#fff"><th style="padding:10px;text-align:right">شرح</th><th style="padding:10px">تعداد</th><th style="padding:10px">مبلغ (ریال)</th></tr>
  ${items.map(([d, q, a], i) => `<tr style="background:${i % 2 ? '#fafafa' : '#fff'}"><td style="padding:10px;border-bottom:1px solid #eee">${d}</td><td style="padding:10px;text-align:center;border-bottom:1px solid #eee">${q}</td><td style="padding:10px;text-align:center;border-bottom:1px solid #eee">${a}</td></tr>`).join('')}</table>
  <div style="margin-top:30px;margin-right:auto;width:300px;padding:16px 20px;border-radius:16px;background:linear-gradient(135deg,#ff6a3d,#ee4a22);color:#fff;font-size:20px;font-weight:700">جمع کل: ۴۸۶٬۰۰۰٬۰۰۰ ریال</div>
  <div style="position:absolute;bottom:40px;left:70px;right:70px;color:#999;font-size:12px">نمونهٔ آزمایشی — بدون اعتبار مالی</div></div>`;
await pdf('invoice-1024.pdf', [invoice('۱۰۲۴', [['طراحی رابط کاربری پنل مدیریت', '۱', '۲۲۰٬۰۰۰٬۰۰۰'], ['پیاده‌سازی ماژول فایل‌ها', '۱', '۱۸۰٬۰۰۰٬۰۰۰'], ['پشتیبانی سه‌ماهه', '۳', '۸۶٬۰۰۰٬۰۰۰']])]);
const en = (n) => `<div style="width:794px;height:1123px;padding:72px 78px;background:#fff;color:#1f2328;font-size:15px;line-height:1.75;position:relative">
  <div style="font-size:12px;letter-spacing:.2em;color:#ee4a22;font-weight:700">SALES AGREEMENT · SAMPLE</div><h1 style="font-size:30px;margin:6px 0 20px">Dubai Marina — Unit 2304</h1>
  ${n === 1 ? `<p>This Sales Agreement (the “Agreement”) is made between <b>Seller Sample LLC</b> and <b>Buyer Sample</b> for the residential unit 2304, Marina Tower, Dubai.</p><p><b>1. Price.</b> The purchase price is payable in four instalments according to the schedule in Annex A.</p><p><b>2. Handover.</b> Handover is planned for Q4 2026, subject to completion certificates issued by the authorities.</p><p><b>3. Service charges.</b> Service charges are borne by the Buyer from the handover date onwards.</p>`
    : '<p><b>4. Termination.</b> Either party may terminate this Agreement for material breach after a written notice and a cure period of thirty (30) days.</p><p><b>5. Governing law.</b> This Agreement is governed by the laws of the Emirate of Dubai.</p><p style="margin-top:120px">Signed for and on behalf of the parties.</p><p style="color:#888">Sample document — no legal value.</p>'}
  <div style="position:absolute;bottom:40px;left:78px;right:78px;display:flex;justify-content:space-between;color:#999;font-size:12px"><span>Aramin · demo content</span><span>Page ${n} of 2</span></div></div>`;
await pdf('sales-agreement-2304.pdf', [en(1), en(2)]);
// office renditions (what a server-side converter would hand to adapter.thumbnail)
await shot('budget-1405.thumb.jpg', `<div dir="rtl" style="width:800px;height:600px;background:#fff;font-size:14px"><div style="height:34px;background:#1e9e5a;color:#fff;display:flex;align-items:center;padding:0 14px;font-weight:700">بودجهٔ سالانه ۱۴۰۵</div>
  <table style="width:100%;border-collapse:collapse">${Array.from({ length: 18 }, (_, r) => `<tr>${Array.from({ length: 6 }, (_, c) => `<td style="border:1px solid #e3e6ea;padding:5px 8px;height:30px;${r === 0 ? 'background:#eef7f1;font-weight:700' : ''}${c === 0 ? ';background:#f7f7f8' : ''}">${r === 0 ? ['ردیف', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد'][c] : c === 0 ? ['حقوق', 'اجاره', 'سرور', 'تبلیغات', 'حمل', 'آموزش', 'بیمه', 'مالیات', 'نرم‌افزار', 'سفر', 'پذیرایی', 'تجهیزات', 'مشاوره', 'بانک', 'سایر', 'جمع', ''][r - 1] || '' : (((r * 37 + c * 91) % 900) + 100) + '٬۰۰۰'}</td>`).join('')}</tr>`).join('')}</table></div>`, 800, 600, { quality: 70 });
await shot('pitch-deck.thumb.jpg', `<div style="width:800px;height:450px;background:linear-gradient(135deg,#111,#2a2a30);color:#fff;padding:56px;position:relative"><div style="font-size:14px;letter-spacing:.24em;color:#ff6a3d;font-weight:700">ARAMIN · 2026</div>
  <div style="font-size:52px;font-weight:800;line-height:1.1;margin-top:18px">The admin panel<br>people enjoy.</div><div style="margin-top:20px;color:#aaa;font-size:18px">Investor update · Q3</div>
  <div style="position:absolute;right:56px;bottom:56px;width:120px;height:120px;border-radius:30px;background:linear-gradient(135deg,#ff6a3d,#ee4a22)"></div></div>`, 800, 450, { quality: 72 });

/* ---------------- video: WebCodecs VP8 in the page (headless MediaRecorder never flushes) + a tiny WebM muxer here */
const ebml = (id, data) => {
  const body = Buffer.isBuffer(data) ? data : Array.isArray(data) ? Buffer.concat(data) : typeof data === 'string' ? Buffer.from(data) : uint(data);
  const size = Buffer.alloc(8); size.writeBigUInt64BE(BigInt(body.length)); size[0] = 0x01; // 8-byte vint
  return Buffer.concat([Buffer.from(id.toString(16).padStart(id > 0xffffff ? 8 : id > 0xffff ? 6 : id > 0xff ? 4 : 2, '0'), 'hex'), size, body]);
};
const uint = (n) => { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(n)); let i = 0; while (i < 7 && b[i] === 0) i++; return b.subarray(i); };
const f64 = (n) => { const b = Buffer.alloc(8); b.writeDoubleBE(n); return b; };
function webm(frames, w, h, fps) {
  const ms = (i) => Math.round((i * 1000) / fps);
  const clusters = []; let cur = null;
  frames.forEach((f, i) => {
    if (f.key || !cur) { cur = { t: ms(i), blocks: [] }; clusters.push(cur); }
    const head = Buffer.alloc(4); head[0] = 0x81; head.writeInt16BE(ms(i) - cur.t, 1); head[3] = f.key ? 0x80 : 0;
    cur.blocks.push(ebml(0xa3, Buffer.concat([head, f.data])));
  });
  const header = ebml(0x1a45dfa3, [ebml(0x4286, 1), ebml(0x42f7, 1), ebml(0x42f2, 4), ebml(0x42f3, 8), ebml(0x4282, 'webm'), ebml(0x4287, 2), ebml(0x4285, 2)]);
  const info = ebml(0x1549a966, [ebml(0x2ad7b1, 1000000), ebml(0x4d80, 'aramin'), ebml(0x5741, 'aramin'), ebml(0x4489, f64(ms(frames.length)))]);
  const tracks = ebml(0x1654ae6b, [ebml(0xae, [ebml(0xd7, 1), ebml(0x73c5, 1), ebml(0x83, 1), ebml(0x86, 'V_VP8'), ebml(0xe0, [ebml(0xb0, w), ebml(0xba, h)])])]);
  const cl = clusters.map((c) => ebml(0x1f43b675, [ebml(0xe7, c.t), ...c.blocks]));
  return Buffer.concat([header, ebml(0x18538067, [info, tracks, ...cl])]);
}
async function video(name, seconds, theme) {
  const W = 640; const H = 360; const FPS = 30;
  await page.goto(pathToFileURL(join(ROOT, 'demo', 'offline.html')).href);
  const frames = await page.evaluate(async ([secs, th, W, H, FPS]) => {
    const out = []; const enc = new VideoEncoder({ output: (c) => { const b = new Uint8Array(c.byteLength); c.copyTo(b); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); out.push({ key: c.type === 'key', data: btoa(s) }); }, error: (e) => { throw e; } });
    enc.configure({ codec: 'vp8', width: W, height: H, bitrate: 480000, framerate: FPS });
    const c = new OffscreenCanvas(W, H); const g = c.getContext('2d'); const n = secs * FPS;
    for (let i = 0; i < n; i++) {
      const t = i / FPS;
      const grd = g.createLinearGradient(0, 0, W, H); grd.addColorStop(0, th[0]); grd.addColorStop(1, th[1]); g.fillStyle = grd; g.fillRect(0, 0, W, H);
      for (let k = 0; k < 7; k++) { g.fillStyle = `rgba(255,255,255,${0.08 + k * 0.03})`; g.beginPath(); g.arc(320 + Math.cos(t * 1.4 + k) * (60 + k * 26), 180 + Math.sin(t * 1.1 + k * 0.7) * (40 + k * 12), 30 + k * 6, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#fff'; g.font = '700 38px system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(th[2], 320, 190);
      g.font = '500 18px system-ui, sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(`${t.toFixed(1)} s`, 320, 228);
      g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(40, 320, (t / secs) * 560, 4);
      const f = new VideoFrame(c, { timestamp: Math.round(t * 1e6) }); enc.encode(f, { keyFrame: i % FPS === 0 }); f.close();
    }
    await enc.flush(); return out;
  }, [seconds, theme, W, H, FPS]);
  writeFileSync(join(OUT, name), webm(frames.map((f) => ({ key: f.key, data: Buffer.from(f.data, 'base64') })), W, H, FPS));
}
await video('product-intro.webm', 5, ['#ff6a3d', '#7c2d92', 'Aramin Console']);
await video('site-visit-marina.webm', 3, ['#0e7490', '#1e3a8a', 'Marina · site visit']);

/* ---------------- audio (WAV, synthesised) */
{
  const rate = 16000; const secs = 6; const n = rate * secs; const data = Buffer.alloc(44 + n * 2);
  const notes = [261.6, 329.6, 392, 523.3, 392, 329.6, 293.7, 349.2, 440, 587.3, 440, 349.2];
  for (let i = 0; i < n; i++) {
    const t = i / rate; const k = Math.floor(t / 0.5) % notes.length; const local = t % 0.5;
    const env = Math.min(1, local * 40) * Math.exp(-local * 5) * (0.55 + 0.45 * Math.sin(t * 0.9));
    const v = env * (Math.sin(2 * Math.PI * notes[k] * t) * 0.6 + Math.sin(4 * Math.PI * notes[k] * t) * 0.2);
    data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 22000))), 44 + i * 2);
  }
  data.write('RIFF', 0); data.writeUInt32LE(36 + n * 2, 4); data.write('WAVEfmt ', 8); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
  data.writeUInt32LE(rate, 24); data.writeUInt32LE(rate * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(n * 2, 40);
  writeFileSync(join(OUT, 'meeting-voice-note.wav'), data);
}

/* ---------------- text, Markdown, CSV, code */
writeFileSync(join(OUT, 'transactions-1405.csv'), `﻿تاریخ,شرح,دسته,مبلغ (ریال),وضعیت
1405/07/01,اجارهٔ دفتر,اجاره,-120000000,پرداخت‌شده
1405/07/03,فاکتور ۱۰۲۴,فروش,486000000,دریافت‌شده
1405/07/05,سرور ابری,زیرساخت,-18500000,پرداخت‌شده
1405/07/09,حقوق مهر,حقوق,-640000000,پرداخت‌شده
1405/07/12,فاکتور ۱۰۲۵,فروش,212000000,در انتظار
1405/07/15,بیمهٔ کارکنان,بیمه,-96000000,پرداخت‌شده
1405/07/18,خرید لپ‌تاپ,تجهیزات,-310000000,پرداخت‌شده
1405/07/21,Invoice INV-2026-0187,فروش,154000000,دریافت‌شده
1405/07/24,تبلیغات آنلاین,بازاریابی,-42000000,پرداخت‌شده
1405/07/27,مالیات فصلی,مالیات,-88000000,در انتظار
`);
writeFileSync(join(OUT, 'meeting-notes.md'), `# صورت‌جلسهٔ هفتگی تیم محصول

**تاریخ:** ۱۴۰۵/۰۷/۲۸ · **حاضران:** سارا، رضا، Emily، علی

## تصمیم‌ها
- ماژول فایل‌ها با پیش‌نمایش واقعی محتوا منتشر شود.
- نسخهٔ موبایل اول آزمایش شود؛ سپس تبلت.
- برای PDF از نمایشگر داخلی مرورگر استفاده می‌کنیم؛ pdf.js فقط افزونهٔ اختیاری است.

## کارهای باز
1. نوشتن مستندات رابط آداپتور ذخیره‌سازی
2. آزمون کشیدن و رها کردن روی تبلت
3. بازبینی ترجمهٔ عربی

> یادآوری: قرارداد اجارهٔ واحد ۱۲ تا ۳۰ روز دیگر منقضی می‌شود.

---
Next sync: \`Monday 10:00\` — [Aramin Console](https://github.com/ARaminco/AraminConsole)
`);
writeFileSync(join(OUT, 'README.md'), `# Aramin Console

An open-source, zero-dependency admin UI framework. RTL-first, dark mode, app-like on phones.

## Modules
- **files** — Finder-class file, document and records manager
- **terminal** — command box
- **uptime** — status bars

\`\`\`bash
npm run build && npm run serve
\`\`\`
`);
writeFileSync(join(OUT, 'files-adapter.js'), `/* Example: a REST storage adapter for AC.files (sketch). */
export function restAdapter(base, token) {
  const call = async (path, init = {}) => {
    const res = await fetch(\`\${base}\${path}\`, { ...init, headers: { Authorization: \`Bearer \${token}\`, ...init.headers } });
    if (!res.ok) throw Object.assign(new Error(res.statusText), { code: res.status === 409 ? 'EXIST' : 'EIO' });
    return res.json();
  };
  return {
    list: (id) => call(\`/folders/\${id}/children\`),
    stat: (id) => call(\`/items/\${id}\`),
    read: async (id) => ({ kind: 'auto', url: \`\${base}/items/\${id}/content\` }),
    thumbnail: (entry, size) => \`\${base}/items/\${entry.id}/thumbnail?size=\${size}\`,
    rename: (id, name) => call(\`/items/\${id}\`, { method: 'PATCH', body: JSON.stringify({ name }) }),
    trash: (ids) => call('/trash', { method: 'POST', body: JSON.stringify({ ids }) }),
  };
}
`);
writeFileSync(join(OUT, 'notes.txt'), `یادداشت‌های سریع — مهر ۱۴۰۵

• تمدید بیمهٔ دفتر تا پایان آبان
• ارسال فاکتور ۱۰۲۵ برای مشتری
• بررسی پیش‌نویس توافق‌نامهٔ تسویه با وکیل
• رزرو اتاق جلسه برای پنجشنبه

Reminder: back up the documents server every Friday.
`);

await browser.close();
try { (await import('node:fs')).unlinkSync(TMP); } catch { /* ignore */ }
let total = 0;
for (const f of readdirSync(OUT)) { const s = statSync(join(OUT, f)).size; total += s; console.log(`${f.padEnd(34)} ${(s / 1024).toFixed(1)} KB`); }
console.log(`total ${(total / 1048576).toFixed(2)} MB`);
