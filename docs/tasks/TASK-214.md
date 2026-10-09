# TASK-214: better screenshot OCR (model)

Role: model. Branch `codex/feat/task-214-ocr-quality`, allocation 1. Depends on TASK-202 (integrated).
Read `.agents/skills/local-ai/SKILL.md` and `src/ai/ocr.ts`.

## Problem (phone test, October 10, 2026)

Text extracted from phone screenshots is messy. `extractText` passes the raw File to Tesseract (eng + fil) with default settings,
no preprocessing and no confidence filtering, so status bars, timestamps, dark-theme chats, small text and bubbles all go in.

## Outcome

1. A pure `src/ai/ocrPreprocess.ts` (canvas based, tested where it can be): scale to a good working width, grayscale and contrast,
   invert dark-theme screenshots, optionally crop the status bar and input bar. Keep every image in memory only; nothing is stored or sent.
2. Tune Tesseract per message screenshots: page segmentation mode, `eng+fil`, and drop low-confidence words and lines or non-message chrome
   (time, battery, "Delivered"). Keep the 20 s timeout and the "ask the user to paste" fallback; the app must never block on OCR.
3. Evaluation in `eval/ocr/`: at least 10 invented screenshots (light and dark, English, Filipino and Taglish, small and large) with
   known text; opt-in script reporting character and word error rates before and after. No real private messages, numbers or names.
   Record what ran on a real phone screenshot versus synthetic images.
4. Keep the public API `extractText(image: File): Promise<string>` unchanged. Propose any change to the coordinator.

## Not in scope

`src/pipeline/` (OCR cleanup of text before rules belongs to the backend, propose it in the handoff), `src/ui/`, `src/types.ts`, `package.json`.

## Acceptance evidence

`npm run check:task -- --task TASK-214 --allocation 1` and `npm run validate -- --task TASK-214 --allocation 1`
(`npm run task:start -- --role model` prepares the worktree). Before and after error rates, honestly labelled by image source.
