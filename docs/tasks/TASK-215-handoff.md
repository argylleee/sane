# TASK-215 handoff

- Updated: October 10, 2026, coordinator acting on the frontend task, branch `codex/feat/task-215-model-status-ui`, base `46d7b6b`.
- Scope: `src/ui/App.tsx`, `src/ui/copy.ts`, `src/ui/copy.test.ts`, `src/styles.css`. No change to `src/ai/`, `src/pipeline/` or `src/types.ts`.

## Result

- Scan screen shows the embedding model state in English, Filipino and Taglish: preparing with a percentage, ready, paused (Data Saver or a slow connection) with a "Prepare the AI check" button,
  or failed with a "Try again" button and an expandable "Details for troubleshooting" that shows the raw `message` as text.
- A scan never waits for the model. The result's model line now says which case applied at scan time: ran, not ready yet, failed, or paused to save data; otherwise the original "No AI model ran" text.
- The model state is read from `getEmbeddingsStatus()` and `subscribeEmbeddings()`; retry calls `loadEmbeddings()`, which is idempotent.

## Evidence

- `tsc --noEmit`, `eslint src/ui`, `prettier --check` pass; the copy test covers the new strings.
- NOT verified: the display in a real browser or on the phone, screen-reader behavior, or 360 px layout. The status line is small text and has not been visually checked.

## Next action

Open it on the phone: the line should show the percentage while the model downloads, then "AI check ready." If it shows the failure line, read the details text and send it to the model role (TASK-217).
