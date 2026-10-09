# OCR evaluation (TASK-214)

Measures how closely OCR text matches known text for screenshots of **invented** messages.

- Node (opt-in): put pairs `name.png` and `name.txt` in a folder outside the repo, then run
  `EVAL_OCR=1 OCR_DIR=<folder> node node_modules/vitest/vitest.mjs run eval/ocr/run.ocr.test.ts`.
  It reports character and word error rates for the raw OCR text and for the cleaned text (`cleanOcrText`).
  It downloads the English and Filipino language data on first use.
- Browser: canvas preprocessing (scale, grayscale, contrast, dark-theme inversion) can only be checked in a
  browser. Open the app, choose each screenshot, and compare the text that appears with the known text.
- Never use real private messages, numbers or names.

Status: the Node script and the metrics are tested only for the metric maths (`metrics.test.ts`). No real phone
screenshot has been measured yet; preprocessing and the page-segmentation mode are unverified against real images.
