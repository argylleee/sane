# TASK-215: show the AI model status and why it did not run (frontend)

Role: frontend. Branch `codex/feat/task-215-model-status-ui`, allocation 1. Depends on TASK-209 (integrated).
Read `.agents/skills/design-ux/SKILL.md`, `src/ai/embedClient.ts` (read-only) and `docs/sane/phone-test.md`.

## Problem (phone test, October 10, 2026)

On a phone with Wi-Fi the result said "Unable to assess" and "No AI model ran for this check." The UI never shows the embedding
model's state: `App.tsx` calls `startEmbeddingsPreload()` silently, swallows any error, and does not use `subscribeEmbeddings` or
`getEmbeddingsStatus`. "No AI model ran" therefore covers still loading, failed to load, and timed out, and nobody can tell which.

## Interface (existing, do not change)

`getEmbeddingsStatus()` and `subscribeEmbeddings(fn)` give `{ state: 'idle' | 'loading' | 'ready' | 'error', progress: 0..100, message? }`.
`loadEmbeddings()` is idempotent and can be called again to retry after an error. `verdict.usedModels.embeddings` says whether it ran for that scan.

## Outcome

1. A small, calm status line on the Scan screen in English, Filipino and Taglish: preparing the check with a percentage, ready, or could not prepare with a Try again button.
2. On `error`, show a short plain reason and keep the raw `message` available in an expandable "details" element (text only) so a tester can read and report it.
3. If the user checks a message before the model is ready, say so plainly on the result ("The AI check was not ready, so this used rules only") and offer to check again when ready. Do not delay or block the scan.
4. The result's model line distinguishes: ran, not ready yet, failed (with Try again), skipped on purpose (Data Saver or slow connection).
5. The "Install" prompt and everything else keep working with the model failing. 360 px layout, screen-reader labels, no layout shift as the status changes.

## Not in scope

`src/ai/`, `src/pipeline/`, `src/types.ts`, `public/`, `src/sw.ts`. If the real cause of the load failure is in `src/ai/`, report the exact error in the handoff for the model role.

## Acceptance evidence

`npm run check:task -- --task TASK-215 --allocation 1` and `npm run validate -- --task TASK-215 --allocation 1` (`npm run task:start -- --role frontend` prepares the worktree).
UI tests with the status mocked for idle, loading, ready, error, retry and "not ready at scan time". Say whether the real model state was checked on a phone.
