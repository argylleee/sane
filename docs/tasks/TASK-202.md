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
- `SIMILARITY_FLOOR` (starting value 0.8) is the best-match threshold below which the score
  should treat the message as "no strong match" (feeds `not_sure`). Backend applies it in scoring.
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

- `npm run typecheck`, `npm run test:app` (vector math, 7 tests) pass.
- `node eval/probe.mjs` runs the real model on 20 separately written messages and prints top-3
  matches and similarity ranges. Results go in the Decisions log in `PLAN.md`.

## Not done yet

OCR worker (Tesseract eng + fil), WebLLM wrapper behind a toggle, the 30-message verdict test
set, model caching/offline with the service worker (frontend owns `sw.ts`).
