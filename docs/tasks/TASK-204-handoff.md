# TASK-204 handoff

## Receipt

- Task/allocation: TASK-204 / 1, frontend
- Branch: `codex/feat/task-204-offline-pwa-share`
- Base: `17734982c8a67f525136463a16cd569b532132e6`
- Registry snapshot: coordinator checkout `coordination.json`, TASK-204 active
- Interface: existing `analyze({ image } | { text }, { lang, useLLM: false })`; no shared contract changed

## Implemented

- Added a root-scoped static worker at `public/sw.js`. It caches the app root and loaded same-origin JS/CSS resources, falls back to the cached app for offline navigation, and runtime-caches static assets plus allowlisted Hugging Face, ONNX Runtime, and Tesseract model files. The worker caches no POST body or user message. A first OCR/model use may still need to download its files; those files are cached for later offline use.
- Added a POST Web Share Target manifest. The worker caps shared text and image size, keeps the payload in memory for a one-time page handoff, then clears it. The app opens Scan prefilled and waits for the user to choose Analyze.
- Added an offline-ready state, online/offline indicator, and a PerformanceObserver-based network request count during analysis.
- Added an opt-in embedding load action, a mobile download confirmation, and progress from `subscribeEmbeddings`. Rules-only checks remain available when loading fails.
- The screenshot action continues through the existing `analyze({ image })` path, which calls OCR and returns its template fallback on failure.
- Added localized iOS Add to Home Screen guidance and a deferred Android install prompt shown after a successful check. Added an SVG manifest icon.

## Evidence and limits

- `npm run check:repo`: passed.
- `npm run check:task -- --task TASK-204 --allocation 1 --registry ../../coordination.json`: passed; all changed paths are within allocation 1.
- `npm run format:files -- ...`: passed for owned files; `format:check` passed.
- `npm run lint`: passed after removing a synchronous state update from an effect.
- `test:tooling` within scoped validation: 17 passed.
- `npm run validate -- --task TASK-204 --allocation 1 --registry ../../coordination.json`: stopped at typecheck. This checkout lacks `@types/node`, `@huggingface/transformers`, `@mlc-ai/web-llm`, and `tesseract.js` in its installed dependencies. The task prohibits `npm install`.
- Browser widths, installed Android share flow, airplane-mode cold relaunch, and real-phone behavior remain untested in this environment.

## Integration note

The worker is served from `public/sw.js` so it can control the app root without changing coordinator-owned Vite build configuration. The task description names `src/sw.ts`; if integration requires that source location, coordinator-owned Vite wiring and deployment output location need to be agreed before moving the worker. The task branch remains uncommitted and unpushed.
