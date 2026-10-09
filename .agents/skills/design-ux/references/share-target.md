# Web Share Target: implementation notes

Goal: after installing the PWA on Android Chrome, the user long-presses an SMS or chat message, taps Share, picks Sane, and the text (or screenshot) arrives already loaded and the check runs. It is the closest a web app gets to "automatic". It does not read the inbox.

## Requirements

- HTTPS (or localhost), a manifest with `share_target`, a registered service worker, and the PWA installed.
- Android Chrome supports it. iOS Safari does not, so paste and "Check what I copied" must stay as the baseline.
- Verify current browser support before the demo.

## Manifest (POST so images can be shared)

```json
"share_target": {
  "action": "/share",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": {
    "title": "title",
    "text": "text",
    "url": "url",
    "files": [{ "name": "image", "accept": ["image/*"] }]
  }
}
```

Some apps put the message in `text`, others in `title` or `url`. Join the non-empty fields so nothing is lost.

## Service worker handler (sketch, adapt and test)

```js
let pending = null; // in memory only, never persisted

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname === '/share') {
    event.respondWith(
      (async () => {
        const form = await event.request.formData();
        const text = [form.get('title'), form.get('text'), form.get('url')]
          .filter(Boolean)
          .map(String)
          .join('\n')
          .slice(0, 5000);
        const file = form.get('image');
        const image =
          file instanceof File && file.type.startsWith('image/') && file.size < 8e6 ? file : null;
        pending = { text, image };
        return Response.redirect('/?shared=1', 303);
      })(),
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'get-shared') {
    event.source.postMessage({ type: 'shared', payload: pending });
    pending = null; // one-time handoff
  }
});
```

## Page side

```js
if (new URLSearchParams(location.search).has('shared')) {
  navigator.serviceWorker.ready.then((reg) => {
    navigator.serviceWorker.addEventListener(
      'message',
      (e) => {
        if (e.data.type === 'shared' && e.data.payload) runCheck(e.data.payload);
      },
      { once: true },
    );
    reg.active.postMessage({ type: 'get-shared' });
  });
  history.replaceState({}, '', '/'); // clean the URL
}
```

Note: a service worker can be stopped by the browser, which clears the in-memory `pending`. The handoff is short, so this is normally fine, but test it. If it proves flaky, an option is a very short-lived IndexedDB entry that the page reads and deletes immediately, which is a small retention trade-off you should disclose.

## Rules from `security-privacy`

- Cap text at about 5,000 characters, images at a few MB, images only.
- Never log or persist shared content. Delete after the handoff.
- Treat shared text as untrusted data like any other input.

## Test checklist (real Android phone)

- [ ] Installed PWA appears in the Android share sheet
- [ ] Sharing text from the messaging app opens Sane and runs the check with no paste
- [ ] Sharing a screenshot from the gallery runs OCR then the check
- [ ] Works in airplane mode after first load
- [ ] Missing or empty share data shows a friendly "nothing to check" message
- [ ] If it fails, the paste box still works
