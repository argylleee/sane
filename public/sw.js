const CACHE_NAME = 'sane-shell-v1';
const MAX_SHARED_TEXT = 5000;
const MAX_SHARED_IMAGE_BYTES = 8 * 1024 * 1024;

let pendingShare = null;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('sane-shell-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'cache-shell') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const scopeUrl = new URL(self.registration.scope);
        const resources = [
          scopeUrl.href,
          ...(Array.isArray(event.data.resources) ? event.data.resources : []),
        ];
        const appAssets = resources.filter((resource) => /\.(?:js|css)(?:\?|$)/i.test(resource));
        await Promise.all(
          [...new Set(resources)].map(async (resource) => {
            try {
              const url = new URL(resource, scopeUrl);
              if (url.origin === scopeUrl.origin) await cache.add(url.href);
            } catch {
              // A single optional resource must not prevent the app shell from caching.
            }
          }),
        );
        event.source?.postMessage({
          type: 'offline-ready',
          ready:
            Boolean(await cache.match(scopeUrl.href)) &&
            (await Promise.all(appAssets.map((resource) => cache.match(resource)))).every(Boolean),
        });
      })(),
    );
  }

  if (event.data?.type === 'get-shared') {
    event.source?.postMessage({
      type: 'shared',
      payload: pendingShare,
    });
    pendingShare = null;
  }
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.method === 'POST' && /\/share\/?$/.test(requestUrl.pathname)) {
    event.respondWith(
      (async () => {
        const form = await event.request.formData();
        const fields = ['title', 'text', 'url']
          .map((name) => form.get(name))
          .filter((value) => typeof value === 'string' && value.trim())
          .map(String);
        const joinedText = fields.join('\n');
        const file = form.get('image');
        const image =
          typeof File !== 'undefined' &&
          file instanceof File &&
          file.type.startsWith('image/') &&
          file.size <= MAX_SHARED_IMAGE_BYTES
            ? file
            : null;

        pendingShare = {
          text: joinedText.slice(0, MAX_SHARED_TEXT + 1),
          textTooLong: joinedText.length > MAX_SHARED_TEXT,
          image,
          imageRejected: Boolean(file && !image),
        };

        const redirectUrl = new URL('../?shared=1', event.request.url);
        return Response.redirect(redirectUrl.href, 303);
      })(),
    );
    return;
  }

  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate';
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isStaticAsset =
    isSameOrigin &&
    /\.(?:js|css|html|json|wasm|onnx|bin|data|svg|png|webp|woff2?|traineddata(?:\.gz)?)$/i.test(
      requestUrl.pathname,
    );
  const isModelHost =
    requestUrl.hostname === 'huggingface.co' || requestUrl.hostname.endsWith('.huggingface.co');
  const isModelAsset =
    (isModelHost && /\.(?:js|mjs|wasm|onnx|bin|data|json)$/i.test(requestUrl.pathname)) ||
    (requestUrl.hostname === 'tessdata.projectnaptha.com' &&
      /\.traineddata(?:\.gz)?$/i.test(requestUrl.pathname)) ||
    (requestUrl.hostname === 'cdn.jsdelivr.net' &&
      /\/npm\/(?:onnxruntime-web|tesseract\.js-core)@[^/]+\/.*\.(?:js|mjs|wasm)$/i.test(
        requestUrl.pathname,
      ));
  if (!isNavigation && !isStaticAsset && !isModelAsset) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request, { ignoreSearch: isNavigation });
      if (cached && !isNavigation) return cached;

      try {
        const response = await fetch(event.request);
        if (response.ok && (isNavigation || isStaticAsset || isModelAsset)) {
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        if (cached) return cached;
        throw error;
      }
    })(),
  );
});
