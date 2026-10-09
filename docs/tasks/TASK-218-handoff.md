# TASK-218 handoff

- Updated: October 10, 2026, coordinator acting on the model task, branch `codex/feat/task-218-archetype-phrasings`, base `46d7b6b`.
- Scope: `src/data/archetypes.json` (version 1 to 2), `eval/archetypes/compare.test.ts`. No code change; the vector cache key already hashes the phrases, so devices rebuild their index automatically.

## Change

- 36 new phrasings (3 per existing archetype) biased to Filipino and Taglish: informal wording, "po", mixed English, different openings. 15 archetypes total.
- Three new archetypes: `reward_points_expiry` (points about to expire with a redeem link), `marketplace_deposit` (deposit before you can see the item), `advance_fee_release` (pay a fee first to receive a loan, aid or prize). 5 phrasings each.
- 8 new ordinary-message examples in the benign set, including a delivery notice that says no payment is needed, clinic and class reminders, a utility bill notice and a real OTP notice, so the evidence margin stays honest.
- All wording is original and hand-written: nothing is copied from the held-out set, any dataset or real messages. Filipino and Taglish text awaits native-speaker review (`docs/planning/filipino-review-*.md`).

## Evidence (real embedding model, run locally in Node CPU)

- The 20-message probe (`eval/probe.mjs`, 14 scams, 6 ordinary): scam best-similarity min 0.866 to 0.884, scams at or above the 0.9 floor 6 of 14 to 10 of 14, top-1 13/14 unchanged, highest ordinary message 0.893 to 0.892.
- Development set (`eval/archetypes/compare.test.ts`, `eval/testset.json` only): embedding evidence flags 3/15 scams before and 6/15 after (Filipino 1 to 2, Taglish 2 to 4, English 0 to 0), and 0/15 ordinary messages before and after.
- Frozen held-out set, run once for a before/after (labelled measurement, not tuning; nothing was changed after seeing it): rules plus embeddings caught 14/21 scams with the old archetypes and 15/21 with the new,
  false alarms 1 and 1 (the single false alarm is a rules issue fixed by TASK-216), abstentions 23 to 22. Rules only on the same code caught 13/21.

## Limits

- The gain on the frozen set is one scam out of 21, which is within noise. The development-set gain is larger but that set is small (15 scams, 15 ordinary).
- The similarity floor (0.9) and margin rule are unchanged. A few ordinary messages reach 0.90 similarity but are not flagged because of the margin rule; the margin on a much larger ordinary sample was not re-measured here
  (the earlier 1,200-message check in `docs/tasks/TASK-202.md` used a dataset not available locally).
- Not tested in a browser or on a phone, where the model must first load (TASK-217).
