# TASK-205 handoff

- Updated: October 9, 2026, backend role
- Checkout: `.worktrees/task-205`, branch `codex/feat/task-205-embedding-scoring`
- Base: `17734982c8a67f525136463a16cd569b532132e6`; current merge includes `origin/main` at `cf3d7a3`
- Allocation: TASK-205 number 2 from the current parent checkout's `coordination.json`
- Role anchor: session `b29186a7-db13-40a4-bc63-b759ca4d8dbc`, epoch `98246fb8-aae0-43cd-83bc-7603f6a31a4a`
- Contract: unchanged `src/types.ts`; consumes TASK-202's `matchWithEvidence()`

## Result

The pipeline now combines deterministic rules with the existing embedding comparison against
scam archetypes and ordinary messages. It uses one inference call and keeps raw top-three
matches available. A qualifying match needs similarity at least 0.90 and strong/moderate
margin evidence. It contributes structured `archetypeId` evidence without manufacturing a rule
signal or message span. Successful inference, including weak/empty matches, sets the
embedding-use flag.
Unavailable/failed embeddings preserve rules-only scoring.

Supporting embeddings add 25/12 points with a suspicious floor of 30 and, when rules alone
score below 60, a cap of 59. Rules alone must reach 60 for `likely_scam`. Below-floor/ordinary
matches never imply safety or downgrade rules. A zero-score no-share notice retains its
existing guardrail. Labels and signal offsets still index the normalized input.

Owned changes: `src/pipeline/analyze.ts`, `src/pipeline/embedding-scoring.test.ts`,
`src/score/score.ts`, the model-mocked test, and the two TASK-205 documents.
The current allocation excludes `src/explain/` and reference data, now owned by TASK-207.
No model, UI, schema, shared planning/config, or external-system changes.

## Evidence

- The allocation-2 scope check was rerun after merging `origin/main`. It correctly rejected
  the old `baseRevision` because that revision predates current mainline files; the PR delta
  against `origin/main` contains only the five owned TASK-205 files listed above.
- `npm run test:app -- src/pipeline/analyze.test.ts src/pipeline/embedding-scoring.test.ts`
  passed: 48 tests, including 20 new tests. The new tests first failed against the old pipeline.
- `npm run typecheck` passed.
- `$env:EVAL='1'; npm run test:app -- eval/run.eval.test.ts --disableConsoleIntercept`
  passed: 14/15 scams flagged, 0/15 legitimate flagged, 15/30 abstentions.
  English 4/5, Filipino 5/5, Taglish 5/5 scams; each has 0/5 false alarms.
  This is the same development set TASK-201 used for tuning. It is not held-out accuracy.
- Automated model-mocked checks also preserve the 30-message baseline with an unavailable
  model, an inference error, and ordinary-message evidence despite high raw similarity.
- `npm run validate` after the merge passed: repository checks, formatting, lint, 18 tooling
  tests, typecheck, 65 app tests (one opt-in evaluation skipped), and production build.
- Final source diff review and `git diff --check` passed. No unrelated tracked edits.

Dependencies were installed from the existing lockfile with `npm ci --ignore-scripts`.
The sandbox could not download dependencies, and Vitest could not access a temporary file;
the permitted elevated retries succeeded. Validation initially stopped because the new checkout
had no native-skill manifest; `npm run skills:sync` bootstrapped the ignored local mirrors and
validation then passed. No package/lockfile edits or Git-default changes were needed.

## Remaining integration

No browser/phone inference, Network-tab zero-request proof, airplane-mode run, fresh held-out
evaluation, or deployment has been performed for this task. Actual model readiness/downloads
remain in TASK-202 and the UI. Localized pattern copy remains with TASK-207 because the current
allocation excludes `src/explain/` and reference data. Model matches remain supporting evidence,
and no real-world accuracy claim follows from mocked tests.

Next: run allocation-2 validation after this merge, then coordinator review/integration and a
loaded-model browser check. The coordinator owns `PLAN.md` and registry status; this worker does
not update them.
