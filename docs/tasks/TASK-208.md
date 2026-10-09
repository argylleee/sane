# TASK-208: held-out evaluation (backend)

Role: backend. Branch `codex/feat/task-208-heldout-eval`, allocation 1. Depends on TASK-201, 202, 205 and 207 (all integrated).
Read `.agents/skills/data-eval/SKILL.md` and `.agents/skills/data-eval/references/metrics-and-parameters.md`.

## Why

Every number so far (15/15 scams, 0/15 legitimate flagged) comes from `eval/testset.json`, which informed the rules.
That is development-set evidence. We need a frozen held-out set before anyone claims accuracy.

## Outcome

1. Build `eval/heldout/heldout.json`: at least 40 new messages in English, Filipino and Taglish, with a roughly even
   scam/legitimate split, covering the archetypes plus tricky legitimate messages (bank safety notices, delivery updates,
   real OTP messages, group-chat links). Provenance for each case: real-world style, written without looking at the rules.
   The rules author should not write the whole set; use team-supplied or public-sounding examples and record who/where.
2. Freeze it: record its hash in `eval/heldout/README.md`. After the first scored run, do not tune rules, keywords, brands,
   archetypes or thresholds against it. Fixes found by it go to a new development case instead.
3. A runner `eval/heldout/run.heldout.test.ts` (opt-in, like the existing eval) that scores the set with rules only and,
   where the model is available, with embeddings, and reports per-language and per-label precision, recall, false-positive
   rate and abstention rate, plus every miss and false positive.
4. A short report `eval/heldout/REPORT.md`: numbers, misses, limits (set size, one author group, model not run if absent).
   Say plainly what the numbers do and do not support.

## Not in scope

`src/` (rules, score, ai, ui), `eval/testset.json`, `eval/probe*`, thresholds. Propose changes in the handoff.
No private data, real names, phone numbers or accounts in any case.

## Acceptance evidence

`npm run check:task -- --task TASK-208 --allocation 1` and `npm run validate -- --task TASK-208 --allocation 1`
(`npm run task:start -- --role backend` prepares the worktree); the report with the actual run output.
