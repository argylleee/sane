# TASK-212: close the rule gaps found by the held-out run (backend)

Role: backend. Branch `codex/feat/task-212-rule-gaps`, allocation 2 (adds the dataset notes, reward-points expiry and a guard set; nothing was pushed under allocation 1). Depends on TASK-207 and TASK-208 (integrated).
Read `eval/heldout/REPORT.md` (the summary and the missed-scam table only) and `.agents/skills/data-eval/SKILL.md`.

## Hard rule: the held-out set stays clean

Do not open `eval/heldout/heldout.json` or `results.json`, and do not copy or paraphrase a held-out message. Work from the
categories in the report. Write NEW development cases in your own words, in English, Filipino and Taglish, in `src/rules/` tests.
Do not edit anything under `eval/heldout/`. After this task, any re-run of the frozen set is a regression check, not clean evidence for these categories.

## Outcome

1. Pay-first-get-something-later patterns in all three languages: prize/aid/loan processing or advance fees, job "working balance"
   top-ups, marketplace deposits before inspection, guaranteed investment returns, relatives asking for clinic or emergency money,
   romance emergency payments.
2. Fix the Filipino OTP-request gap (an authored SIM-registration message asking for an OTP was detected only as urgency).
3. Handle negation so a legitimate notice that says no payment is needed is not flagged for a payment request, in the three languages.
4. Keep the legitimate-message false-alarm count at 0 on the development set, including real OTP notices and bank safety warnings. Add a regression case for every new rule and every negation.
5. Explanations for each new signal in English, Filipino and Taglish with fixed advice; mark the copy as awaiting native-speaker review.
6. Say in the handoff which changes are generic and which are specific to a phrase; prefer generic.

## Real-world coverage (added October 10, 2026)

Read `docs/planning/ph-spam-dataset-notes.md` first. The phone test also showed a Smart reward-points-expiring message with a redeem link rated
"unable to assess". Add:

- Reward points or vouchers about to expire plus redeem or claim plus a link, including a telco or bank brand mismatch with the link domain, in the three languages.
- Telco, bank and e-wallet impersonation with a link whose domain is not the brand's own.
- Free, claim, register or login bait followed by a deposit or sign-up link. Whether casino promos are flagged is a product decision pending
  from the team: build the pattern behind a clearly named signal, keep it at `suspicious` at most, and say so in the handoff.
- Do not copy any dataset row. Hand-write the cases. The dataset file is not committed; the owner shares it privately for local reading only.
  Use the hash split from the notes and report recall on the untouched half as spam coverage only.
- Build a guard set of at least 20 invented legitimate messages (OTP notices, safety warnings, delivery updates, genuine promos) in the three languages.
  A rule that adds a false alarm on the guard set or on the development set is rejected.
- Look at the two spam messages that received `probably_fine` and explain why.

## Not in scope

`src/score/`, `src/pipeline/` (TASK-210 edits `analyze()`), `src/ai/`, `src/ui/`, `eval/`, `src/types.ts`, thresholds.

## Acceptance evidence

`npm run check:task -- --task TASK-212 --allocation 1` and `npm run validate -- --task TASK-212 --allocation 1`
(`npm run task:start -- --role backend` prepares the worktree). Development-set before/after numbers, labelled as development-set evidence.
