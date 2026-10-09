# TASK-217: restore the embedding model on the phone (model) PRIORITY 1

Role: model. Branch `codex/fix/task-217-restore-embeddings`, allocation 1. Depends on TASK-202 (integrated). Do this before TASK-211, 213 and 214.

## Problem

On the phone the result says "No AI model ran" with Wi-Fi on, and the model worked earlier in the session. Without it the app is rules only
(about 57% abstentions on the frozen set), so this is the biggest quality loss. The UI cannot say why (TASK-215 adds that display).

## Outcome

1. Reproduce in a real Chrome (desktop first, then the phone via USB debugging: `chrome://inspect`) against a production build, not `npm run dev`.
   Record the exact failure: console error, failing network request, or a load that never finishes.
2. Bisect against the commits that changed this path: `d20a9e7` (self-host option), `d58788d` (service worker), `157bd03` (self-hosted WASM runtime
   at `<base>/ort/`), `cb123b4` (overall progress and automatic preload). Candidates to check: worker module import of `ort/*.mjs`, the service worker
   cache-first rules for `.wasm`/model files, `crossOriginIsolated`/thread settings on Android, memory on a low-end Adreno phone, an
   exception swallowed in `preload.ts`, and a stuck progress tracker.
3. Fix it in `src/ai/` and prove it: the model reaches `ready` on a production build, and a scan reports `usedModels.embeddings: true`.
   If the fix needs `public/sw.js`, `vite.config.ts` or `index.html`, put the exact change in the handoff for the coordinator.
4. Make failure diagnosable: keep a short reason in `getEmbeddingsStatus().message` for each failure kind (download, WASM init, out of memory, embed timeout)
   so TASK-215's UI can show it. Never swallow a load error silently.
5. A small opt-in check in `eval/embeddings-load/` (or a documented manual procedure) that loads the model in a browser and prints ready/error and time to ready.
   State what ran on the real phone and what did not. The Vercel preview deployment may sit behind Vercel Authentication; test with a signed-in session or a local build.

## Not in scope

`src/pipeline/`, `src/ui/`, `src/types.ts`, thresholds and archetype text (TASK-218).

## Acceptance evidence

`npm run check:task -- --task TASK-217 --allocation 1` and `npm run validate -- --task TASK-217 --allocation 1` (`npm run task:start -- --role model` prepares the worktree).
The reproduced failure and the proof of the fix, plainly stated.
