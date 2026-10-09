# TASK-212 handoff

- Backend, backend-dev, allocation 1; existing `src/types.ts` contract.
- Checkout `.worktrees/task-212`, branch `codex/feat/task-212-rule-gaps`.
- Base `cc62e4f6f55eb72db86f441fc3b01ad028766a1d`; registry snapshot in Git worktree metadata.
- Role session `01a121fa-e432-7fd1-8cf4-c53b9f3174f7`, epoch `895b21b6-c35c-443c-8664-03cbba4cd1c6`.
- Allocation task was read from the coordinator checkout because its file was
  created after the allocated base. No shared files were edited.

## Changes and boundaries

`src/rules/index.ts` detects advance fees for prizes, aid, loans and job working
balances; deposits before marketplace inspection; and family-emergency money
requests. These combine nearby context with an action rather than relying on a
complete message phrase. Existing investment detection gives stronger weight
to explicit guaranteed returns, and romance detection requires a financial action
rather than an emergency/hospital mention alone. Ordinary investment deposits
no longer constitute investment bait by themselves. Scoring thresholds and
`src/score/` remain unchanged.

Credential-request verbs now include `ipadala`, `ipasa`, `ibahagi`, `forward`,
`i-forward` and `paki-send`. These are phrase-specific vocabulary additions to
the existing generic verb-plus-credential matcher. Payment disclaimers in three
languages are masked with equal-length spaces so signal spans still map to the
original normalized message. Negation is clause-scoped, preserves later positive
requests, and excludes conditional payment threats. Context matching skips a
negated action and continues to later actions.

Three new labels are localized in `src/explain/templates.ts` and retain the
existing fixed no-payment / separate-verification advice. Filipino and Taglish
copy and development cases explicitly await native-speaker review.

## Development evidence

New AI-authored regressions in `src/rules/gaps.test.ts` were written from report
categories, without opening held-out messages/results or copying their text.
Initial coverage had 23 failures among 38 tests; additional language/benign
controls were added. Final targeted suite: 54 tests passed. The earlier combined
rule/pipeline pass had 103 tests before the last language/contradiction cases.

Actual before/after rules-only development-set results are identical: 15/15 scams
flagged, 0/15 legitimate flagged, 14/30 abstentions. Each language: 5/5 scams,
0/5 false alarms; abstentions English 4/10, Filipino 5/10, Taglish 5/10.
Baseline was rerun from TASK-210 at `75c2150`; its rule blob and TASK-212's base
both equal `56d07acfc20363de412cc2835428bf8b7d24c4bd`.
Command: set `EVAL=1`, then `npm run test:app -- eval/run.eval.test.ts --reporter=verbose`.
These are development-set numbers, not general accuracy or independent holdout
evidence. Original frozen evaluation files and baseline remain untouched.
Any future run for these categories is a regression check, not clean evaluation.

## Limits and follow-up

Matching is bounded phrase/context logic and does not prove an actual scam.
Independent native-speaker review, real-world coverage, embeddings and browser
zero-network/device verification remain outstanding. No message logging,
persistence or network behavior was introduced. Coordinator owns completion
updates to registry/PLAN; they are outside this allocation.

Scoped `npm run validate -- --task TASK-212 --allocation 1 --registry <snapshot>`
passed ownership, repository checks, formatting, lint, 18 tooling tests,
typecheck, 134 app tests (2 opt-in evaluations skipped), and production build.
The existing large-bundle warning remains. Frozen holdout and real model
evaluations were not run.
