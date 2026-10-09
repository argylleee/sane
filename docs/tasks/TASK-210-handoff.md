# TASK-210 handoff

- Backend, backend-dev, allocation 1; contract `llm-explain-v1`.
- Checkout `.worktrees/task-210`, branch `codex/feat/task-210-llm-pipeline-hook`.
- Base `77f92550ed6d82eb8c948b788317197ee60ccc57`; registry snapshot in Git worktree metadata.
- Role session `01a121fa-e432-7fd1-8cf4-c53b9f3174f7`, epoch `895b21b6-c35c-443c-8664-03cbba4cd1c6`.

## Changes

`src/pipeline/analyze.ts` dynamically imports the AI public surface only when
`useLLM` is enabled. It passes normalized text, localized signal labels and the
localized matched archetype name to `explainWithLlm`. Only a non-null reply adds
`explanation.extra` and sets `usedModels.llm`. Each verdict owns its explanation
object so optional text cannot leak into later template-only scans.

The pipeline bounds the import and explanation by 15 seconds, clears its timer,
and preserves the computed verdict on null, throw or timeout. Late output cannot
mutate the returned verdict. There is no download, logging, persistence or link
request added here. Model facts use a fresh label array and primitive values.

## Evidence and limits

Targeted pipeline checks: 55 tests passed; TypeScript passed. Seven new tests
cover success, normalized OCR, null, throw, timeout/late completion, disabled
imports/calls, and hostile text plus attempted mutation of facts. The initial
sandbox test run could not access Vitest temporary module files; the tests passed
outside the sandbox. A missing constant in the test mock was corrected.

The tests mock AI inference; real WebGPU execution, model output quality and
browser zero-network proof remain unmeasured. Guarded model output remains the
model role's responsibility (TASK-211). The UI consumer is TASK-209. No AI, UI,
rules, thresholds, shared types or frozen evaluation files were changed.

Coordinator follow-up: record completion in shared registry/PLAN after landing;
those files are outside this allocation.

Scoped `npm run validate -- --task TASK-210 --allocation 1 --registry <snapshot>`
passed ownership, repository, formatting, lint, 18 tooling tests, typecheck,
87 app tests (2 opt-in evaluations skipped), and production build. Build warnings:
existing large chunks; the public AI surface is also statically imported by UI,
so this dynamic import does not create a separate bundle. LLM inference/download
remains gated by its existing explicit loader and readiness state.
