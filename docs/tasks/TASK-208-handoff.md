# TASK-208 handoff

- Backend role, backend-dev, allocation 1. Approved synthetic-set design in this chat.
- Checkout: `.worktrees/task-208`, branch `codex/feat/task-208-heldout-eval`.
- Base / scored detector revision: `29edcc754f5e5778bfae5d657a8c09f1493f70d5`.
- Authority: coordinator registry snapshot at `.git/worktrees/task-208/coordination.snapshot.json`.
  Only `eval/heldout/` and TASK-208 task/handoff files were changed.
- Session anchor: `01a121b0-9ae7-7c02-b602-4ac545801412`, epoch
  `b86a4d59-5dfa-4109-b611-7b0c6572fdab`; activation remains in the primary checkout's
  ignored role checkpoint. The task worktree was created by that session.
- Stable interface: `src/types.ts` / existing analyze pipeline. No external resources mutated.

## Completed evidence

42 frozen synthetic cases, balanced across English, Filipino, Taglish and scam/
legitimate intent. Hash, provenance, limits and run commands:
`eval/heldout/README.md`. First output: `eval/heldout/results.json`. Findings:
`eval/heldout/REPORT.md`. The opt-in runner uses shared pipeline code and supports
real CPU embeddings through a Node worker-transport adapter. No synthetic model
vectors. No rules, keywords, brands, archetypes, thresholds or source changes.

Rules-only flagged 9/21 scams, falsely flagged 1/21 legitimate cases, abstained
28/42, matched expected level 9/42. By language scam recall: English 4/7,
Filipino 1/7, Taglish 4/7. All 12 missed scams abstained. h23 was the sole false
alarm, a Filipino delivery notice explicitly saying no payment was needed.

Real embeddings were attempted with remote loading disabled; the local model
configuration was missing. Embeddings, browser workers, OCR, phone performance,
offline relaunch and network proof remain unmeasured. AI authorship and historical
detector knowledge mean this is not an independently blinded holdout. Native-speaker
and separate team review remain needed; no broad accuracy claim is supported.

## Checks and next action

- Scoped `check:task` passed before writes and during validation.
- Opt-in targeted command with `EVAL_HELDOUT=1`, `EVAL_EMBEDDINGS=1`, and
  `HELDOUT_OUTPUT=eval/heldout/results.json` passed all 3 tests outside the sandbox.
- One TypeScript row annotation was fixed after scoring. Frozen text and detector
  stayed unchanged. Format, lint, repository checks, 18 tooling tests and typecheck
  passed in scoped validation. Sandbox app tests could not read Vitest temporary
  module-cache files, affecting existing suites too.
- Final `npm run validate -- --task TASK-208 --allocation 1 --registry <snapshot>`
  passed outside the sandbox: scoped ownership, repository, formatting, lint,
  18 tooling tests, typecheck, 77 app tests (2 opt-in evaluations skipped), and
  production build. The existing large-bundle warning remains. Owned-file commit
  and authorized `npm run task:land` are next.
- Coordinator follow-up: record task completion in registry/PLAN; those shared files
  are outside backend ownership. Create a new development allocation for Filipino
  OTP wording, negated payment instructions, and softer scam language. Keep this
  set and its baseline frozen.
