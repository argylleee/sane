# TASK-214 handoff

- Updated: October 10, 2026, coordinator acting on the model task, branch `codex/feat/task-214-ocr-quality`, base `46d7b6b`.
- Scope: `src/ai/ocr.ts`, `src/ai/ocrPreprocess.ts`, `src/ai/ocrPreprocess.test.ts`, `eval/ocr/`. `extractText(image: File): Promise<string>` is unchanged.

## Problem

Phone test: text read from screenshots was messy. The raw file went to Tesseract with default settings, so status bars, timestamps, dark-theme chats and small text all degraded the result.

## Result

1. `preprocessImage`: scales the screenshot (upscale under 1200 px long side, downscale over 2600 px), converts to grayscale, stretches contrast (2nd to 98th percentile) and inverts dark-theme screenshots. All in memory; on any failure the original file is used.
2. Tesseract is set to page-segmentation mode 4 (single column, variable sizes) and keeps interword spaces.
3. `cleanOcrText` removes clock, battery, signal and chat-chrome lines (Delivered, Seen, Type a message and similar), stray symbol fragments and zero-width characters, and keeps message text, including Filipino.
4. If the preprocessed read has confidence under 60 the plain image is read too and the better read is kept. The timeout is now 30 s because this can mean two reads on a slow phone; failure still tells the user to paste the text.
5. `eval/ocr/` has error-rate metrics (tested) and an opt-in Node script that compares raw and cleaned OCR text on the user's own invented screenshots.

## Evidence

- Pure helpers (sizing, luminance, inversion, contrast, cleanup) and the metrics are unit-tested; full suite 154 passed, 3 skipped; typecheck, eslint and prettier pass.
- NOT verified: the canvas pipeline, the page-segmentation mode and the confidence fallback have not run on any real screenshot or phone. The improvement is therefore unmeasured; the choices are standard practice, not proven here.
- The Node script does not exercise canvas preprocessing.

## Next action

On the phone, scan the same screenshot that was messy before and compare. If it is still poor, send me the screenshot of an invented message and the OCR text it produced; the page-segmentation mode (4 versus 6) and the contrast step are the first things to try.
