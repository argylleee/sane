# TASK-217 handoff

- Updated: October 10, 2026, coordinator (integration), branch `codex/fix/task-217-restore-embeddings`, base `46d7b6b`.
- Scope note: the fix is in `public/sw.js`, a coordinator-owned file at this point (TASK-204 is integrated and holds no claim). No `src/ai/` change was needed.

## Symptom

On a phone with Wi-Fi, scans report "No AI model ran" and the embedding model had worked earlier in the session.

## Hypothesis (not reproduced)

The browser extension was not connected, so the failure was not reproduced in a browser or on the phone. The cause below is inferred from the code and from the model
role's own note in `docs/tasks/TASK-202.md` (service-worker double caching):

1. `public/sw.js` (added in `d58788d`) intercepted `huggingface.co` model files and did `await cache.put(request, response.clone())` inside `respondWith`, with no error handling.
2. transformers.js also keeps its own copy in the Cache API, so the 118 MB model could be stored twice. A storage-quota error from `cache.put` rejected the whole
   response promise, which fails the model download as a network error.
3. `skipWaiting()` plus `clients.claim()` mean the worker can take over mid-session, so the first visit can work and later visits fail. That matches "it was working before".

## Change

- The model host (`huggingface.co`) is no longer handled by the service worker; transformers.js caches it once.
- Cache writes for everything else are done in the background (`event.waitUntil`) and their errors are ignored, so a failed write can never fail the request.
- `.mjs` is now matched as a static asset so `ort/*.mjs` is cached for offline start.

## Evidence

- `eslint` and `prettier --check` pass on `public/sw.js`. There is no automated test for the service worker.
- NOT verified: that the model reaches `ready` on a phone or on a production build, and that offline relaunch still works after the change. The first model download still needs the network.

## Next action

Deploy this branch, open it on the phone, clear site data once (Application, Storage), wait for the first scan, and check the result's model line (`usedModels.embeddings`). If the model still does not
run, read the console for the exact error; `getEmbeddingsStatus().message` carries the load error and TASK-215 will display it.
