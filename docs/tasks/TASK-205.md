# TASK-205: embedding matches feed the score (backend)

Role: backend. Branch `codex/feat/task-205-embedding-scoring`, allocation 2 (narrowed: `src/rules/`, `src/explain/` and the data files moved to TASK-207). Depends on TASK-201 and TASK-202 (integrated).
Read `.agents/skills/data-eval/SKILL.md`, `docs/tasks/TASK-202.md` and `docs/tasks/TASK-201-handoff.md`.

## Outcome

1. `analyze()` combines rule signals with `matchArchetypes()` results using `SIMILARITY_FLOOR` and the ordinary-message
   comparison from TASK-202; below the floor stays `not_sure`. Keep `usedModels.embeddings` tied to "model ran".
   1a. Call `matchWithEvidence()` from `src/ai/index.ts` (not `matchArchetypes` alone) so the verdict uses its `level`.
2. Embeddings alone never produce `likely_scam`; they can raise `not_sure` to `suspicious` and add the archetype explanation.
3. Explanations stay in English, Filipino and Taglish; signal spans index the normalized text.
4. Regression tests: the 30-message set (`eval/testset.json`) does not get worse than the TASK-201 numbers
   (14/15 scams flagged, 0/15 legitimate flagged); add cases for the new paths with model mocked.

## Not in scope

`src/ai/`, `src/ui/`, `src/types.ts` (propose contract changes to the coordinator).

## Acceptance evidence

`npm run check:task -- --task TASK-205 --allocation 2` and `npm run validate -- --task TASK-205 --allocation 2` (`npm run task:start` prepares the worktree and snapshot).
Say which numbers are development-set evidence versus held-out.

## Implementation and verification

The current coordinator receipt is included by `origin/main` at allocation 2. The receipt's
base still predates the mainline changes, so use the task-start snapshot and compare the PR
delta against current `origin/main` when validating this merge update.

- `analyze()` calls `matchWithEvidence()` once. It supplies the same top-three matches plus
  the ordinary-message comparison, so no second inference call is needed.
- Supporting evidence needs a finite similarity from `SIMILARITY_FLOOR` (0.90) through 1
  and a `strong` or `moderate` margin level from TASK-202. Below-floor or ordinary-message
  evidence cannot lower a rule-based verdict or provide reassurance.
- Strong/moderate evidence adds 25/12 points, with a suspicious floor of 30. If rules alone
  score below 60, the combined score is capped at 59. Only rules scoring at least 60 produce
  `likely_scam`. A zero-score no-share credential notice preserves its established guardrail.
- `usedModels.embeddings` is true for a non-null inference result, including weak or empty
  matches. A null result or inference failure keeps the rules-only fallback.
- Only a qualifying archetype contributes `archetypeId`. Localized pattern copy is now owned by TASK-207.
  Raw top-three matches remain available without pretending weak matches are evidence.
- No shared contract, model layer, UI, reference data, or root configuration changes.

Focused pipeline tests: 47 passed, including 20 new model-mocked cases. Typecheck passed.
The evaluation runner confirms development-set recall 14/15, false alarms 0/15, and
15/30 abstentions. Per language: English 4/5 scams, Filipino 5/5, Taglish 5/5;
each language has 0/5 legitimate messages flagged. `t05` remains an abstention.
These numbers are rules-only development-set evidence, not fresh held-out or live-model accuracy.
Full scoped validation passed before the coordinator narrowed this allocation: task scope (six owned files), repository integrity, formatting,
lint, 17 tooling tests, typecheck, 65 app tests (one opt-in evaluation skipped), and production build.
The opt-in evaluation passed separately. Implementation is ready for coordinator review;
see `TASK-205-handoff.md` for evidence and remaining integration.

The current allocation excludes `src/explain/` and reference data, which are owned by TASK-207.
