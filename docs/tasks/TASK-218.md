# TASK-218: stronger Filipino and Taglish archetype phrasings (model)

Role: model. Branch `codex/feat/task-218-archetype-phrasings`, allocation 1. Depends on TASK-202 (integrated). Needs the embedding model working (TASK-217) to measure.

## Why

Archetype matching compares a message with hand-written scam phrasings. Filipino recall was the weakest in the frozen run, and each archetype has only three phrasings.
More natural Filipino and Taglish phrasings is the cheapest way to lift recall in those languages without any training.

## Outcome

1. Add 3 to 4 new phrasings per archetype in `src/data/archetypes.json`, biased to Filipino and Taglish: informal, "po"/"opo" forms, mixed English, common spellings and shortcuts,
   different openings (greeting, urgency, threat). Cover the pay-first scams (prize, aid and loan fees, job top-ups, marketplace deposits, guaranteed returns),
   reward-points expiry, relative emergency and romance, in the three languages. Hand-written, original, no copying from the held-out set, any dataset or real messages.
2. Add 2 to 3 ordinary-message examples per language to the benign comparison set (real-sounding OTP notices, delivery notices that say no payment is needed, clinic and school reminders)
   so the evidence margin stays honest.
3. `eval/archetypes/`: an opt-in script that reports, on the development set (`eval/testset.json`) only, scam versus legitimate similarity before and after, and
   the false-alarm count at `SIMILARITY_FLOOR`. Do not change the floor; propose any change.
4. Mark every Filipino and Taglish phrase as awaiting native-speaker review in the handoff, with the review sheet `docs/planning/filipino-review-*.md` as the place to check.

## Not in scope

The held-out files under `eval/heldout/` (read-only, do not open `heldout.json`), `src/ui/`, `src/pipeline/`, `src/score/`, `src/types.ts`.

## Acceptance evidence

`npm run check:task -- --task TASK-218 --allocation 1` and `npm run validate -- --task TASK-218 --allocation 1` (`npm run task:start -- --role model` prepares the worktree).
Development-set before and after numbers, labelled as development-set evidence.
