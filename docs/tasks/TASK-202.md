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

## Not done yet

OCR worker (Tesseract eng + fil), WebLLM wrapper behind a toggle, the 30-message verdict test
set, model caching/offline with the service worker (frontend owns `sw.ts`).
