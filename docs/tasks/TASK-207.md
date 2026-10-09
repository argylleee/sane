# TASK-207: broader rules and explanations (backend)

Role: backend. Branch `codex/feat/task-207-rules-explanations`, allocation 1. Depends on TASK-201 (integrated).
Read `.agents/skills/data-eval/SKILL.md`, `docs/tasks/TASK-201-handoff.md`, and the result frames in `docs/design/figma-surface-pro-8/` for the four verdict states.

## Outcome

1. Broaden deterministic detection beyond the 30-message set: more scam patterns (delivery, bank/e-wallet, job, romance/investment,
   government, prize), Filipino and Taglish phrasing, lookalike domains and shorteners, OTP/PIN/card requests, urgency and money requests.
2. Keep false positives at 0/15 on legitimate messages, including safety warnings that mention OTPs or links. Add regression cases for every new rule.
3. Explanations in English, Filipino and Taglish for each new signal, with fixed advice (no model-generated advice). Copy is flagged as awaiting native-speaker review.
4. Signal output stays compatible with the UI and score: spans index the normalized text. TASK-205 owns how the score combines signals; do not edit `src/score/`.

## Not in scope

`src/score/`, `src/pipeline/` (TASK-205), `src/ai/`, `src/ui/`, `src/types.ts`. Propose any contract change to the coordinator.

## Acceptance evidence

`npm run check:task -- --task TASK-207 --allocation 1` and `npm run validate -- --task TASK-207 --allocation 1`; the 30-message numbers before and after,
labelled development-set evidence because the cases informed the rules. A held-out set is a separate task.
