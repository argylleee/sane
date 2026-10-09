# TASK-213: measure embeddings on the frozen set (model)

Role: model. Branch `codex/feat/task-213-embedding-measurement`, allocation 1. Depends on TASK-202, 205 and 208 (integrated).
Read `eval/heldout/README.md` and `REPORT.md`, `docs/tasks/TASK-202.md`, and the embedding-floor review note in `docs/`.

## Why

The frozen run could not load the embedding model, so embeddings are unmeasured. This task measures them. It does not tune.

## Outcome

1. Make the real embedding model runnable for an opt-in Node evaluation without committing model files (cache them in an ignored local directory; document the download and the size).
2. Run the frozen set unchanged with rules only versus rules plus embeddings (the pipeline as shipped: `matchWithEvidence()` into scoring). Report, per language and per label, scam recall, flag precision, false alarms, abstentions and exact-level agreement, plus every case whose level changed because of embeddings.
3. Report the similarity and evidence values for scams versus legitimate messages so the floor can be judged. Do not change `SIMILARITY_FLOOR`, thresholds, archetypes or any code. Propose changes in the handoff.
4. Put the report in `eval/embeddings/REPORT.md` and machine-readable output in `eval/embeddings/results.json`. State what the numbers do not support (one AI-authored group, 42 cases, development-informed archetypes, no phone run).

## Not in scope

Anything under `src/`, `eval/heldout/` (read-only), `public/`, `package.json`, `vite.config.ts` (propose in the handoff).

## Acceptance evidence

`npm run check:task -- --task TASK-213 --allocation 1` and `npm run validate -- --task TASK-213 --allocation 1`
(`npm run task:start -- --role model` prepares the worktree). The real run output, or the exact error if the model cannot load.
