# TASK-213 handoff

- Updated: October 10, 2026, coordinator acting on the model task, branch `codex/feat/task-213-embedding-measurement`, base `46d7b6b`. Scope: `eval/embeddings/` only.
- Result: [REPORT.md](../../eval/embeddings/REPORT.md) and [results.json](../../eval/embeddings/results.json). The frozen set was measured with the real model, rules only versus embeddings, with the original and the TASK-218 archetypes.
- Headline: scams caught 13/21 rules only, 14/21 with embeddings, 15/21 with the new archetype phrasings; false alarms 1 in each (a rules issue); abstentions 24 to 22 of 42.
- How it was run: `EVAL_HELDOUT=1 EVAL_EMBEDDINGS=1 HF_HUB_OFFLINE=1 HELDOUT_OUTPUT=<file> node node_modules/vitest/vitest.mjs run eval/heldout/run.heldout.test.ts`, with the model files in the local transformers cache
  (`node eval/probe.mjs` downloads them once, about 135 MB; copy the cache folder if the download is slow).
- No code, threshold or archetype was changed by this task. Not run in a browser or on a phone.
