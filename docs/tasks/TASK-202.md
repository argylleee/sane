# TASK-202: local AI layer (model stream)

Branch `codex/feat/task-202-local-ai-eval`, base `924fe03`, allocation 1. Role: model.

## Interface for the other streams

Import from `src/ai/index.ts`.

- `loadEmbeddings(): Promise<void>` downloads (first time) and loads multilingual-e5-small in a
  Web Worker. Idempotent. Call it from an explicit user action on phones (the download is large)
  and automatically on desktop if you like. Nothing downloads until it is called.
- `getEmbeddingsStatus()` and `subscribeEmbeddings(fn)` give `{ state: 'idle' | 'loading' | 'ready' | 'error', progress: 0..100, message? }` for the progress UI.
- `matchArchetypes(text): Promise<Match[]>` returns the top 3 archetypes with cosine similarity.
  It returns `[]` until the model is ready, so `analyze()` falls back to rules only.
- `matchWithEvidence(text): Promise<{ matches, benign, margin, level } | null>` is the call for
  scoring. `level` is `'strong' | 'moderate' | 'none'` supporting scam evidence, from the margin
  between the best scam archetype and the best ordinary-message example. `'none'` means no
  evidence either way and is NEVER a reason for `probably_fine`. Returns `null` while the model
  is not loaded (rules-only fallback). Suggested use in `score()`: add weight for `strong` and a
  smaller weight for `moderate`; rules still decide.
- `SIMILARITY_FLOOR` (0.90) alone does not separate scams from legit messages; prefer `level`.
- `detectCapabilities()` gives `{ webgpu, deviceMemoryGb, tier }`.
- `archetypes` is the hand-written reference data (names in en, fil, taglish) for explanations.

## Notes for the coordinator

- `analyze()` sets `usedModels.embeddings = matches.length > 0`. That is correct while the model
  is loading. If scoring filters by the floor, keep this flag tied to "model ran", not "matched".
- `src/data/archetypes.json` is the AI-drafted kit seed (12 archetypes, 3 phrasings each). It
  needs a Filipino-speaking reviewer and about 1 more phrasing each before the demo.
- Model files come from the Hugging Face CDN. For a clean zero-external-request story, self-host
  them under `public/` later (see `security-privacy`).

## Evidence

- `npm run typecheck`, `npm run test:app` (42 tests), and lint pass.
- `node eval/probe.mjs`: multilingual-e5-small int8 (SHA-256 verified) on 14 scam + 6 legit
  messages written separately from the archetypes. Archetype identification: top-1 13/14,
  top-3 14/14 across English, Filipino, and Taglish.
- Plain best-archetype similarity does not separate scam from legit: probe scams 0.866 to 0.935
  vs legit 0.848 to 0.893; on a fresh 30-message held-out set scams 0.852 to 0.906 vs legit
  0.850 to 0.897 (0.90 floor: 3/16 scams, 0/14 legit).
- Margin (best scam similarity minus best ordinary-message similarity), aggregate only:
  - Held-out set (kept out of the repo): margin > 0.02 flags 10/16 scams and 0/14 legit;
    margin > 0.01 flags 13/16 and 1/14.
  - Development set (`eval/testset.json`): margin > 0 flags 14/15 scams and 0/15 legit.
  - The 18 ordinary-message examples were written before these runs, but by the same author as
    the test sets and with similar message types. Pilot evidence on small hand-written sets only.
- The rules-only pipeline on the held-out set (backend rules at `e8a8e79`) flagged 3/16 scams,
  0/14 legit, and abstained on 27/30, versus 14/15 on the development set it was tuned on. The
  rules need broader coverage; embeddings are the planned complement.

## Browser evidence (headless Chrome via DevTools protocol, not a phone)

- The embedding worker loads and answers in a real Chrome: status `ready`, warm match about
  90 ms, first match about 6 to 7 s (it builds the 54-phrase archetype index, then caches it).
- With the model served from a local host and the app's own `/ort/` runtime files, the page made
  zero non-local requests. The library's default fetches its WASM runtime from a public CDN, so
  `vite.config.ts` now serves it in dev and bundles it into `dist/ort/` (about 39 MB, 10 MB
  gzipped) and `loadEmbeddings()` points at it by default.
- The model itself still downloads from Hugging Face on the first load unless
  `VITE_MODEL_BASE_URL` points at our own host. After that the browser caches it for offline use.
  Not yet tested: offline relaunch, installed-PWA mode, and any phone.
- A Taglish OTP request matched `otp_request` but its margin (0.006) fell under the 0.01
  "moderate" cutoff, so embedding evidence was `none`. Rules must still catch such cases.

## Requests for the frontend owner (TASK-206)

1. Auto-download on first visit, no button (team decision). Call `startEmbeddingsPreload()` from
   `src/ai` once when the app mounts. It skips Data Saver and 2G, asks the browser to keep the
   cache, never throws, and resolves when the model is ready. Keep the progress bar from
   `subscribeEmbeddings` (progress is now one overall percentage across all files, not per file)
   and show the status message if `state === 'error'`.
2. `public/sw.js` caches huggingface.co model files in its own cache AND transformers.js keeps
   its own cache, so a 118 MB model may be stored twice (about 236 MB), which can exceed storage
   quotas on phones and in private windows. Prefer dropping the model rules from the service
   worker and letting the library cache. Also `.mjs` is missing from the static-asset pattern, so
   `ort/*.mjs` (needed to start the runtime) is not cached for offline use. Add `mjs`.
3. The scan screen is where the matching panel lives today; it should disappear once the
   download is automatic.

## Review of TASK-205 (backend embedding scoring), corrected

Earlier note (superseded): it suggested dropping the `similarity >= SIMILARITY_FLOOR` condition in
`score()`. A larger test shows that would be unsafe. Do NOT drop it.

Evidence: 1,200 ordinary English messages from a public SMS dataset (run locally, not committed;
English only, no Filipino or Taglish):

| Embedding rule                                 | Ordinary messages flagged | Fresh held-out scams flagged |
| ---------------------------------------------- | ------------------------- | ---------------------------- |
| margin > 0.01 only                             | 252/1200 (21%)            | 13/16                        |
| margin > 0.02 only                             | 89/1200 (7.4%)            | 10/16                        |
| margin > 0.01 AND similarity >= 0.90 (current) | 0/1200                    | 3/16                         |

The current rule is the safe one: no false alarms on ordinary messages, at the cost of low embedding
recall. Recall must come from the rules (TASK-207). Rules-only on the same 1,200 messages flagged
1/1200. These are English-only numbers from one dataset of UK-style texts, not a Philippine
validation.

## Not done yet

OCR worker (Tesseract eng + fil), WebLLM wrapper behind a toggle, the 30-message verdict test
set, model caching/offline with the service worker (frontend owns `sw.ts`).
