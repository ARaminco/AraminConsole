# Support chat widget

Optional module: `src/modules/support-chat/{support-chat.js,support-chat.css,module.json}` (dependency: `core`).
Demo wiring: `demo/support.js` (one `<script type="module">` in `demo/index.html`; delete both to drop the widget).
Tests: the «support chat» section of `node tests/tickets.mjs`.

```js
await AC.use('support-chat');
const chat = AC.supportChat.init({
  title: 'پشتیبانی آرامین', greeting: 'سلام مریم 👋', subtitle: 'چطور می‌توانیم کمک کنیم؟',
  agents: [{ name: 'سارا احمدی', initials: 'سا', color: 2, online: true }], responseTime: 5,
  color: 'accent' /* or any CSS colour */, position: 'end' /* or 'start' */, online: true,
  welcome: 'سلام! چطور می‌توانم کمک کنم؟', quickReplies: ['پیگیری سفارش', 'بازگشت وجه'], unread: 1,
  articles: [{ id, title, cat, icon, body }], conversations: [{ id, title, preview, time }],
  onSend: async (text, { files, chat }) => ({ text: 'پاسخ ربات', quick: ['صحبت با کارشناس'] }), // or a string, or null
  onOffline: async ({ name, email, message }) => {},
});
chat.open('home' | 'chat' | 'offline'); chat.close(); chat.toggle(); chat.receive({ text, quick }); chat.typing(true);
chat.unread; chat.isOpen; chat.messages; chat.destroy();      // AC.supportChat.open|close|toggle|receive|current
```

## Behaviour
- **Launcher**: floating circle at the bottom inline-end corner (left in RTL; `position: 'start'` mirrors it), above the tab bar
  on phones and tablets; icon cross-fades/rotates to a chevron when open; unread badge bumps (spring) and the launcher wiggles
  when a message arrives while closed. Hidden under pushed phone screens (`html[data-ac-stacked]`) and foreign modal layers.
- **Panel**: Intercom-style, scales in from the launcher corner with a spring (interruptible CSS transition; origin follows
  direction). Esc or outside click minimises; focus returns to the launcher.
  - Home: gradient hero (greeting, team avatars), «new conversation» card with online dot + response time, recent
    conversations, help search (ی/ي and ک/ك insensitive) → article view with «was this helpful?».
  - Conversation: day pill, bubbles (mine = widget colour), typing indicator, read receipts (✓ sent → ✓✓ seen), quick-reply
    chips, attachments, emoji picker, Enter sends (Shift+Enter = new line; on phones Enter is a new line).
  - Offline (`online: false`): name / email / message form → confirmation.
- **Phones (<640px)**: full-screen sheet sliding up (iOS drawer curve), grab handle; drag the header down (or flick) to dismiss;
  page scroll locked while open; navigation closes it.
- Reduced motion: opacity only. Events on `document`: `ac:support-chat:open | close | send {text, files} | receive {text}`.

## Theming / i18n
`--sc-accent` (from `color`, default `--ac-accent`) drives the hero, launcher, my bubbles and chips; everything else is tokens,
so dark mode is automatic. Built-in fa / en / ar strings; override with app keys `sc.<key>` (e.g. `sc.launcher`).
