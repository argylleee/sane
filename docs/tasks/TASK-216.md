# TASK-216: negated payment notices and remaining abstentions (backend)

Role: backend. Branch `codex/feat/task-216-negation-notices`, allocation 1. Depends on TASK-212 (integrated).
Read `.agents/skills/data-eval/SKILL.md` and `docs/tasks/TASK-212-handoff.md`.

## Hard rule: the held-out set stays clean

Do not open `eval/heldout/heldout.json` or `results.json`, and do not copy or paraphrase a held-out message. Write new cases in your own words.

## Finding

A regression run of the frozen set after TASK-212 (labelled as a regression check, not clean evidence) still shows the one false alarm: a Filipino delivery
notice that states no payment is needed receives `money_request` and `delivery_scam`. TASK-212 says negation is handled, but this shape is not.
Scam recall rose from 9/21 to 13/21, so the abstention policy, not false alarms, is the main limit now.

## Outcome

1. Find why Filipino and Taglish negation phrasings ("hindi kailangan magbayad", "walang bayad", "libre ang delivery", "no payment required" and similar variations) do not
   suppress `money_request` and `delivery_scam`, and fix it generically. Add development cases for each phrasing, in your own words.
2. Check that a negation never hides a real demand: add cases such as a notice that says "no payment needed" and then asks for an OTP or a link click to a lookalike domain.
3. Keep 0 false alarms on legitimate development cases, including real OTP notices and bank safety warnings, and no loss on scam development cases.
4. Say which changes are generic. Copy for any new signal in English, Filipino and Taglish, flagged as awaiting native-speaker review.

## Not in scope

`src/score/`, `src/pipeline/`, `src/ai/`, `src/ui/`, `eval/`, `src/types.ts`, thresholds.

## Acceptance evidence

`npm run check:task -- --task TASK-216 --allocation 1` and `npm run validate -- --task TASK-216 --allocation 1` (`npm run task:start -- --role backend` prepares the worktree).
Development-set before and after numbers, labelled as development-set evidence.
