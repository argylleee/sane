# TASK-205: embedding matches feed the score (backend)

Role: backend. Branch `codex/feat/task-205-embedding-scoring`, allocation 1. Depends on TASK-201 and TASK-202 (integrated).
Read `.agents/skills/data-eval/SKILL.md`, `docs/tasks/TASK-202.md` and `docs/tasks/TASK-201-handoff.md`.

## Outcome

1. `analyze()` combines rule signals with `matchArchetypes()` results using `SIMILARITY_FLOOR` and the ordinary-message
   comparison from TASK-202; below the floor stays `not_sure`. Keep `usedModels.embeddings` tied to "model ran".
2. Embeddings alone never produce `likely_scam`; they can raise `not_sure` to `suspicious` and add the archetype explanation.
3. Explanations stay in English, Filipino and Taglish; signal spans index the normalized text.
4. Regression tests: the 30-message set (`eval/testset.json`) does not get worse than the TASK-201 numbers
   (14/15 scams flagged, 0/15 legitimate flagged); add cases for the new paths with model mocked.

## Not in scope

`src/ai/`, `src/ui/`, `src/types.ts` (propose contract changes to the coordinator).

## Acceptance evidence

`npm run check:task -- --task TASK-205 --allocation 1` and `npm run validate -- --task TASK-205 --allocation 1`.
Say which numbers are development-set evidence versus held-out.
