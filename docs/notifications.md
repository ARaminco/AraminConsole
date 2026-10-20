# Notifications — `AC.notify`

Module `notify` (`src/modules/notify/`). Builds on the existing `AC.toast` and `AC.notifications` (docs/overlays.md — unchanged).
Live playground: `demo/#/notify-lab`. Tests: `node tests/notify.mjs --base=…`.

```js
AC.notify('Saved');                                          // toast
AC.notify({
  variant: 'toast' | 'card' | 'banner' | 'inline' | 'snackbar' | 'progress' | 'island' | 'system' | 'center',
  title, text, tone: 'neutral|accent|success|warning|danger|info', icon, avatar: 'ع‌ر' | { src }, image, meta,
  actions: [{ label, primary, keep, onClick(handle) }],
  position: 'top-start|top-center|top-end|bottom-start|bottom-center|bottom-end',   // logical: start = right in RTL
  duration: 6000 /* 0 = sticky */, priority: 'low|normal|high|urgent', group: 'chat:42',
  sound: true, haptic: true, swipe: 'x' | 'y', target /* inline */, onUndo /* snackbar */, onClose(reason), href, id,
  event: 'mention',                                           // route through the user's preferences instead of a fixed variant
});
// → { id, el, variant, close(reason), update(patch) }   progress: update({ progress: .4 }), done(text), fail(text)
AC.notify.toast|card|banner|inline|snackbar|progress|island|system|center(opts) · AC.notify.clear(variant?)
```
Text fields accept `{ fa, en, ar }`. Mixed-script lines take the direction of their first strong letter.

## Variants
| Variant | Behaviour |
|---|---|
| `toast` | `AC.toast` (Sonner-like stack). `group` collapses repeats into one toast with a count. |
| `card` | rich card — avatar or icon, title + meta, body, image, actions; stacked per position, newest at the edge, **max visible** (prefs, default 3) with a "+N more" control that expands the stack; hover/focus pauses the timer; swipe to dismiss (`x` or `y`). |
| `progress` | card with a progress bar; `update({ progress })`, `done()` turns it green and auto-closes, `fail()`. |
| `banner` | full-width top bar (tone colours), one at a time, queued; `urgent` jumps the queue; pushes top stacks down. |
| `snackbar` | inverse pill at the bottom with countdown ring and **Undo** (`onUndo`; `onCommit` when it expires). One at a time. |
| `island` | "dynamic island" — black pill at the top centre; tap / hover / `expand: true` springs it open (text, progress, actions); `update({ badge, progress })` while it lives. |
| `inline` | `.ac-alert` rendered inside `target` (dismissible). |
| `system` | Notification API (through the service worker when present, so it works with actions); falls back to a toast without permission. |
| `center` | adds to the notification center (`AC.notifications.add`). |

## Preferences — per user, per event type
```js
AC.notify.events.define({ id: 'deploy', label: { fa: 'استقرار', en: 'Deploys' }, icon: 'rocket',
  defaults: { inapp: 'island', center: true, system: false, sound: false } });
AC.notify({ event: 'deploy', title: 'v2.4 is live' });       // in-app variant + inbox + system (when the tab is hidden) + sound
AC.notify.prefs() · AC.notify.setPrefs({ position, sound, haptic, quiet, max, swipe, events: { deploy: { system: true } } })
<div data-ac="notify-prefs"></div>                          // settings card: global switches, position picker, push, matrix
```
Built-in event types: `mention`, `order`, `invoice`, `security`, `system`, `marketing`. **Do not disturb** (`quiet`) silences routed
notifications except `urgent`; direct calls (an undo snackbar after the user's own action) are never silenced. Preferences live in
`localStorage['ac:notify']`; event `ac:notify:prefs`.

**Sound** is synthesized (WebAudio, no asset) and off by default; **haptics** use `navigator.vibrate` with a pattern per priority.

## Web Push
```js
await AC.notify.permission();                                 // 'granted' | 'denied' | 'default' | 'unsupported'
await AC.notify.push.subscribe({ vapidKey: 'B…', endpoint: '/api/push/subscribe' });   // POSTs the PushSubscription JSON
await AC.notify.push.unsubscribe({ endpoint: '/api/push/subscribe' });                  // DELETE { endpoint }
await AC.notify.push.state();                                 // 'subscribed' | 'simulated' | 'off' | 'blocked' | 'unsupported'
AC.notify.push.simulate({ title, body, url, tone });          // demo: runs the SW push handler (or an in-page card)
```
The settings card takes `data-vapid-key` / `data-endpoint`; without a key it uses **demo mode** (simulated push).
The service worker (`demo/sw.js`) shows the notification on `push`, echoes it to open pages (`{type:'PUSH'}` → added to the inbox)
and on `notificationclick` focuses or opens the app at `data.url`.

**Server setup (VAPID)** — keys are never committed:
```bash
npx web-push generate-vapid-keys            # once; keep the private key in your secret store
```
```php
// PHP (minishlink/web-push): send to a stored subscription
$push = new Minishlink\WebPush\WebPush(['VAPID' => ['subject' => 'mailto:ops@example.com',
  'publicKey' => getenv('VAPID_PUBLIC'), 'privateKey' => getenv('VAPID_PRIVATE')]]);
$push->sendOneNotification(Minishlink\WebPush\Subscription::create($subscriptionArray),
  json_encode(['title' => 'Invoice paid', 'body' => '#1204 · 4,800,000 IRR', 'url' => '/#/finance', 'tag' => 'invoice']));
```
```js
// Node (web-push)
webpush.setVapidDetails('mailto:ops@example.com', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
await webpush.sendNotification(subscription, JSON.stringify({ title: 'Invoice paid', body: '#1204', url: '/#/finance' }));
```
Payload fields the worker understands: `title, body, icon, image, url, tag|group, priority ('urgent' → requireInteraction), actions[{action,title}]`.

## Events
`ac:notify:show {variant,id}` · `ac:notify:close {variant,id,reason}` · `ac:notify:action {id,label}` · `ac:notify:prefs` ·
`ac:notify:click` (system / push notification clicked) · `ac:notify:push-state {state}`.

## Accessibility & motion
Cards / banners / snackbars are `role="status"` (danger / urgent: `alert`) inside `aria-live` regions; every close button is labelled;
the island is keyboard-operable (Enter / Space toggles, Esc closes); timers pause on hover and focus; reduced motion removes
movement and timers' visual bars.
