# TASK-204: offline PWA, share target, zero-network proof (frontend)

Role: frontend. Branch `codex/feat/task-204-offline-pwa-share`, allocation 1. Depends on TASK-203 (integrated).
Read `.agents/skills/design-ux/SKILL.md`, `security-privacy`, and `.agents/skills/design-ux/references/share-target.md`.

## Outcome

1. `src/sw.ts` service worker: precache the app shell, runtime-cache model files, work in airplane mode.
2. Manifest in `public/`: installable on Android Chrome; iOS add-to-home-screen hint in the UI.
3. Web Share Target handler (cut-ladder item 1): shared text opens Scan prefilled, never auto-sent anywhere.
4. "Offline ready" badge and a live "network requests during scan: 0" counter.
5. Download-size prompt before large model downloads on mobile; show embedding progress via `subscribeEmbeddings`.
6. OCR entry for screenshots using `src/ai/ocr.ts` through `src/ai/index.ts`; template fallback on failure.

## Not in scope

`index.html`, `src/types.ts`, `package.json`, `vite.config.ts` are coordinator-owned: propose changes in the handoff
(for example the service-worker build wiring or viewport meta). Do not run `npm install`.

## Acceptance evidence

`npm run check:task -- --task TASK-204 --allocation 1` and `npm run validate -- --task TASK-204 --allocation 1`.
Browser evidence at 360 px; airplane-mode relaunch result stated as tested or untested; no real-phone claim without a phone.
