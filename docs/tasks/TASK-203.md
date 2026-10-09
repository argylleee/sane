# TASK-203: Implement mobile-first scan and Learn experience

- Status: ready
- Owner / role / platform: frontend-dev / frontend / responsive web PWA
- Coordination authority / task allocation number (if parallel): integration coordinator / allocation 2, user approved refresh
- Branch / worktree / base revision: `codex/feat/task-203-mobile-ui-pwa` / `.worktrees/task-203` / `ba0ef625e6845fbdaaf9d10f22f6659cdc9c11d5`
- Change type / intended Conventional Commit subject / task reference: feat / `feat(frontend): implement mobile-first scan experience` / TASK-203
- Timebox / token budget if measurable: estimated 3-4 hours; no token budget specified
- Dependencies / interface contract: existing `src/types.ts` and `analyze(input, opts)`; pipeline and model tasks remain independent
- Allowed files / coordinator-owned files: `src/ui/`, `src/main.tsx`, `src/styles.css`, `src/sw.ts`, `public/`, `specs/task-203-mobile-ui-pwa/`, `docs/tasks/TASK-203.md`, `docs/tasks/TASK-203-handoff.md`; do not edit shared `index.html`, `src/types.ts`, configs, pipeline, rules, OCR, or model files
- Interface version / external write-resource keys: existing analyzer contract; no external write resources
- Necessary MCP tools only / fallback if unavailable: none; use supplied Figma screenshots and local browser

## Outcome and acceptance

- Observable user outcome: A user can choose a language, enter or paste text, run the local analyzer, understand an honest result, and read localized Learn guidance.
- Acceptance evidence: End-to-end browser journey; result and error states; tests/build; no horizontal overflow at 320, 360, and 1280 CSS-pixel widths; a visible localized System/Light/Dark theme picker; a prominent 60px welcome action; scoped validation and `npm run validate`.
- Out of scope: Implementing OCR/models/pipeline, changing shared contracts/config, monitoring, backend, network telemetry, accuracy claims, deployment, or physical-device verification.

## Implementation and checks

- Smallest runnable slice: Welcome -> Scan -> analyze -> Result -> another check; Learn remains reachable from navigation.
- Risks / assumptions: OCR and embeddings are currently stubs. The UI must show real fallback behavior and not fabricate extracted text or model use. Supplied design screenshots are retained as untracked user assets in the integration checkout and will not be moved or modified.
- Exact check commands and results:
  - `npm run test:app -- src/ui/copy.test.ts src/pipeline/analyze.test.ts` - passed, 2 files / 5 tests.
  - `npm run build` - passed.
  - `npm run validate -- --task TASK-203 --allocation 2 --registry "C:\Users\SnapMart Inc\Desktop\App Builders\appbuilder-hackathon\coordination.json"` - passed, including repo check, formatting, lint, tooling tests, typecheck, app tests, and build.
  - Browser: flow reached the real analyzer fallback; confirmed clipboard denial copy, escaped user markup, inert broken-scheme URL, disabled over-limit input, honest screenshot/OCR fallback, and no horizontal overflow at 320/360/1280 CSS-pixel widths.
  - Follow-up browser checks: Theme switches immediately between light and dark, System follows OS color-scheme changes, and theme options localize in Filipino. Start manual check measures 60px high and remains full width on mobile; no horizontal overflow at 320, 360, 768, or 1280px.
- Mock / pending live integration: No mock analyzer responses planned. OCR behavior is pending its model-owned implementation; physical-phone checks and Filipino-speaker review are not available here.

## Handoff

- Changed files / revision / dirty work: See the TASK-203 handoff; work is uncommitted on the allocated branch.
- Blocker / next executable action: Integration review and device checks. OCR and embeddings remain unimplemented in their owned layers.
- Handoff link if needed: `docs/tasks/TASK-203-handoff.md`.
