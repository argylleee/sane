# TASK-216 handoff

- Updated: October 10, 2026, coordinator acting on the backend task, branch `codex/feat/task-216-negation-notices`, base `46d7b6b`.
- Scope: `src/rules/index.ts`, `src/rules/negation.test.ts`, `src/data/keywords.json`. No change to scoring, pipeline, AI, UI or `eval/`.

## Result

1. Payment disclaimers are recognised in more phrasings: "hindi/di (mo|ka|po|na) kailangang magbayad", "nothing to pay", "do not have to pay", "without any fee".
2. A general rule: a sentence with a negation cue ("hindi", "walang", "no", "libre", "free", "nothing", "without") and a payment word is a disclaimer, and its payment words
   are masked, unless the sentence also has a demand marker (conditional "kung hindi"/"if you", "muna"/"first"/"before", link, click, OTP/PIN/code, send, deposit, verify, confirm).
   So a conditional threat, an instruction to click or send, or a credential request is still flagged.
3. Added the Filipino future forms "magbabayad", "babayaran" and "i-pay" to the money-request keywords; a threat such as "Kung hindi ka magbabayad..." was missed before.

## Evidence

- New development cases (own words, not held-out text) in `src/rules/negation.test.ts`: 10 notices that must stay clean, 3 conditional threats that must still flag, 5 disclaimers followed by a real demand.
- Full suite: 159 passed, 2 skipped; the development set keeps 0 false alarms; typecheck, eslint and prettier pass.
- Regression run of the frozen set (labelled a regression check, not clean evidence; the author did not read the held-out messages): scams caught 13/21 (unchanged), false alarms 1 to 0, abstentions 24 to 25.
  The one false alarm was the Filipino delivery notice; it is now not flagged.

## Not verified / limits

- Filipino and Taglish wording is AI-authored and awaits native-speaker review.
- The sentence rule is generic but regex based; unusual phrasings or other languages are not covered. Recall did not improve; it is bounded by the rules, not by this task.
- Not tested on a phone.
