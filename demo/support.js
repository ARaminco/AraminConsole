/* Demo shell: lazy-loads and mounts the support-chat module (AC.use('support-chat') → src/modules/support-chat) with a mock bot reply. Remove this file and its
   <script> tag in index.html to drop the widget. */
import { ticketAgents, helpArticles, supportBotReplies } from './data.js';

const AC = window.AC;

const ARTICLE_BODY = 'برای دیدن جزئیات، به بخش «حساب من» بروید و گزینهٔ مربوط را باز کنید. اگر مشکل حل نشد، از همین پنجره با ما گفتگو کنید؛ معمولا کمتر از ۵ دقیقه پاسخ می‌دهیم.';
const start = () => {
  const lang = AC.i18n.lang || 'fa';
  const fa = lang !== 'en';
  AC.supportChat.init({
    title: AC.t('sc.title', fa ? 'پشتیبانی آرامین' : 'Aramin Support'),
    greeting: AC.t('sc.hello', fa ? 'سلام مریم 👋' : 'Hi Maryam 👋'),
    agents: ticketAgents.filter((a) => a.online).map(({ name, initials, color, online }) => ({ name, initials, color, online })),
    responseTime: 5,
    online: true,
    unread: 1,
    welcome: AC.t('sc.welcome', fa ? 'سلام! من سارا هستم از تیم پشتیبانی. چطور می‌توانم کمک کنم؟' : 'Hi! I am Sara from the support team. How can I help?'),
    quickReplies: fa ? ['پیگیری سفارش', 'بازگشت وجه', 'صحبت با کارشناس'] : ['Track my order', 'Refund', 'Talk to a person'],
    articles: helpArticles.map((a) => ({ ...a, body: ARTICLE_BODY })),
    conversations: [{ id: 'old', title: fa ? 'سفارش ORD-20512' : 'Order ORD-20512', preview: fa ? 'ممنون، کتاب سالم رسید 🌹' : 'Thanks, the book arrived 🌹', time: new Date(Date.now() - 3 * 86400000).toISOString() }],
    onSend: async (text) => {
      const r = supportBotReplies.find((x) => x.match.test(text));
      return fa ? { text: r.text, quick: r.quick } : { text: 'Thanks! A teammate will reply shortly. Meanwhile, our help articles may have the answer.', quick: ['Track my order', 'Talk to a person'] };
    },
    onOffline: async () => new Promise((res) => setTimeout(res, 600)),
  });
};
AC.ready(() => AC.use('support-chat').then(() => {
  start();
  let lang = AC.i18n.lang;
  AC.on(document, 'ac:i18n:change', () => { if (AC.i18n.lang !== lang) { lang = AC.i18n.lang; const was = AC.supportChat.current?.isOpen; start(); if (was) AC.supportChat.open(); } });
}, (err) => console.error('[demo] support-chat module failed', err)));
