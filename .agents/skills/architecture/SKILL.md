---
name: architecture
description: Architecture for the Sane on-device scam checker. Use whenever the user asks about project structure, folders, pipeline, modules, data flow, Web Workers, state, interfaces, file layout, tech stack, or how components connect, and whenever you are about to create or restructure code in this project.
---

# Architecture

One static website. No backend. Every check runs in the browser.

## Stack

Full list with model options, sizes and device tiers: `skills/tech-stack`.

- **Build:** Vite + plain TypeScript or JS (React optional; skip it if the team is faster without it)
- **OCR:** Tesseract.js (WASM)
- **Embeddings:** Transformers.js with multilingual-e5-small (verify the exact model id)
- **LLM:** WebLLM (WebGPU), small model (0.5B to 3B). Verify ids on the WebLLM model list
- **Storage:** IndexedDB for cached archetype embeddings and settings. Never store user messages unless the user opts in
- **Hosting:** any static host. It serves files only

## Pipeline

```text
input (paste | clipboard | share | image)
  -> [image only] OCR -> text
  -> normalize(text)
  -> rules(text)            -> signals[]
  -> embed(text) + match()  -> topArchetypes[]
  -> score(signals, topArchetypes) -> verdict
  -> explain(verdict)       -> template first, LLM optional
  -> render
```

Explanation language strategy (templates, LLM, or hybrid) is in `skills/data-eval`. Steps rules, score and template explain are synchronous and tiny. They must work even if every model fails to load.

## Folder layout

```text
src/
  main.ts                 UI wiring only
  pipeline/analyze.ts     orchestrates the steps, owns fallbacks
  pipeline/normalize.ts   lowercase copy, unicode fix, strip zero-width chars
  rules/index.ts          runs all rule checks
  rules/urls.ts           extract + lookalike domain check
  rules/keywords.ts       loads keyword lists per language
  ai/embed.worker.ts      Transformers.js in a worker
  ai/ocr.worker.ts        Tesseract in a worker
  ai/llm.ts               WebLLM wrapper, lazy-loaded
  ai/match.ts             cosine similarity vs cached archetype vectors
  score/score.ts          signals + similarity -> verdict
  explain/templates.ts    explanations in en / fil / taglish
  data/archetypes.json
  data/keywords.json
  data/brands.json
  ui/                     components, verdict card, highlight renderer
  sw.ts                   service worker
public/manifest.webmanifest, icons/
eval/testset.json, eval/run.ts
```

## Contracts (keep these stable so two people can work in parallel)

```ts
type Signal = { id: string; label: string; weight: number; span?: [number, number] };
type Match = { archetypeId: string; similarity: number };
type Verdict = {
  level: 'likely_scam' | 'suspicious' | 'probably_fine' | 'not_sure';
  score: number; // 0..100
  signals: Signal[];
  matches: Match[]; // top 3
  archetypeId?: string;
  lang: 'en' | 'fil' | 'taglish';
  explanation: { headline: string; steps: string[]; extra?: string };
  usedModels: { ocr: boolean; embeddings: boolean; llm: boolean };
};
function analyze(
  input: { text: string } | { image: File },
  opts: { lang: Verdict['lang']; useLLM: boolean },
): Promise<Verdict>;
```

## Fallback ladder (inside analyze.ts)

1. Embeddings fail or not loaded -> score from rules and keywords only. Set `usedModels.embeddings=false` and show it.
2. LLM unavailable, slow (over ~15 s) or errors -> use template explanation.
3. OCR fails or returns very little text -> ask the user to paste the text.
4. Anything throws -> return `not_sure` with a safe generic tip. Never show a blank screen.

## Workers and performance

- Run OCR and embeddings in Web Workers so the UI never freezes.
- Lazy-load the LLM only when the user turns on "Smart explanation" or on first need. Embedding model first, since it drives the verdict.
- Load models once, keep them in memory, warm up with one dummy call before the demo.
- Report model download progress to the UI.

## Options to weigh

- **React vs plain TS:** React helps if the team knows it. Plain TS has less setup and a smaller bundle. Pick what the team is fastest in.
- **LLM in worker vs main thread:** WebLLM offers a worker mode that keeps the UI responsive. Use it if the setup is quick, otherwise main thread is acceptable for a demo.
- **Bundled vs CDN model files:** self-hosting model files makes the zero-external-request story cleaner but increases deploy size and time. See `security-privacy`.
