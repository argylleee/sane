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
- `SIMILARITY_FLOOR` (0.90, measured) marks a strong archetype match. At or above it, treat the
  match as supporting scam evidence. Below it means "no strong match", NOT "safe": similarity
  cannot separate scams from legit messages on its own (see Evidence). Rules decide the verdict.
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
  matches and similarity ranges.
- Probe result (multilingual-e5-small int8, SHA-256 verified, 14 scam + 6 legit messages written
  separately from the archetypes; a pilot, not an accuracy claim):
  - Archetype identification: top-1 13/14, top-3 14/14, across English, Filipino, and Taglish.
  - Scam best-similarity 0.866 to 0.935; legit 0.848 to 0.893. The ranges overlap, so no floor
    cleanly separates scam from legit. At 0.90 no legit message reached it (6 samples) but only
    5 of 14 scams did.
  - Conclusion: use embeddings to name the likely pattern and add supporting evidence; keep
    the rules engine as the deciding layer.

## Not done yet

OCR worker (Tesseract eng + fil), WebLLM wrapper behind a toggle, the 30-message verdict test
set, model caching/offline with the service worker (frontend owns `sw.ts`).
