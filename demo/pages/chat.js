/* Chat page — lazy-loads the chat module (AC.use('chat') → src/modules/chat) on demo data with a fake transport:
   delivery/read receipts, typing indicator, auto replies and older history for infinite scroll. */
import { chatUsers, chatMe, chatConversations } from '../data.js';

const REPLIES = ['باشه، حتما 👍', 'عالیه، ممنون!', 'الان بررسی می‌کنم و خبر می‌دم.', 'فردا صبح در جلسه صحبت کنیم؟', 'Got it, thanks! 🙌', '😂😂', 'ارسالش کردم.'];
const OLDER = ['یادته پروژهٔ قبلی رو؟', 'جلسهٔ هفتهٔ پیش خیلی خوب بود', 'فایل‌ها رو توی درایو گذاشتم', 'Let me check and get back to you', 'این هم لینک مستندات: https://aramin.dev/docs', 'باشه 👌', 'ساعت ۵ تماس بگیرم؟', 'مرسی از کمکت 🙏'];
let pages = new Map();

export default function mount(root, AC) {
  let alive = true; let chat = null;
  const host = root.querySelector('[data-chat-host]');
  const timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));

  const start = () => { if (!alive) return; chat = AC.chat(host, {
    me: chatMe, users: chatUsers, conversations: chatConversations,
    async loadOlder(conv) {
      await new Promise((r) => setTimeout(r, 700));
      const n = pages.get(conv.id) || 0;
      if (n >= 3 || conv.messages.length < 2) return [];
      pages.set(conv.id, n + 1);
      const first = conv.messages[0].at;
      const people = conv.type === 'direct' ? [conv.with, chatMe.id] : conv.type === 'group' ? [...conv.members, chatMe.id] : conv.admins;
      return Array.from({ length: 12 }, (_, i) => ({
        id: `old-${conv.id}-${n}-${i}`, from: people[(i * 7 + n) % people.length], at: first - (12 - i) * 37 * 60000 - n * 86400000,
        text: OLDER[(i + n) % OLDER.length], reactions: {}, status: 'read',
      }));
    },
    onSend(conv, msg, api) {
      later(700, () => api.setStatus(conv.id, msg.id, 'delivered'));
      if (conv.type === 'channel') { later(1200, () => { msg.views = 1; api.setStatus(conv.id, msg.id, 'read'); }); return; }
      const who = conv.type === 'direct' ? conv.with : conv.members[Math.floor(Math.random() * conv.members.length)];
      const online = chatUsers.find((u) => u.id === who)?.online;
      if (!online && conv.type === 'direct') return;
      later(1200, () => { api.setStatus(conv.id, msg.id, 'read'); api.typing(conv.id, true, who); });
      later(2800, () => api.receive(conv.id, { from: who, text: REPLIES[Math.floor(Math.random() * REPLIES.length)] }));
    },
  }); };
  AC.use('chat').then(start, (err) => console.error('[demo] chat module failed', err));

  const offs = [
    AC.on(root, 'click', '[data-chat-new]', () => host.querySelector('[data-act="new"]')?.click()),
  ];
  return () => { alive = false; offs.forEach((f) => f()); timers.forEach(clearTimeout); chat?.destroy(); };
}
