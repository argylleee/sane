# Embedding measurement on the frozen set (TASK-213)

Measured October 10, 2026 with the real `multilingual-e5-small` int8 model on Node CPU (model loaded from the local cache, remote loading off), through the shipped
pipeline (`matchWithEvidence()` into scoring with `SIMILARITY_FLOOR` 0.9 and the benign margin). Dataset: the frozen 42-case set, unchanged (hash in `eval/heldout/README.md`).
Machine-readable aggregates: [results.json](results.json). This is a measurement, not tuning: no threshold, archetype or rule was changed after seeing it.
The rules code is the revision before TASK-216, so its one false alarm is a rules issue (fixed separately).

## Results (21 scams, 21 ordinary messages)

| Setup                                         | Scams caught | False alarms | Abstentions |
| --------------------------------------------- | ------------ | ------------ | ----------- |
| Rules only                                    | 13/21        | 1            | 24/42       |
| Rules plus embeddings, original archetype set | 14/21        | 1            | 23/42       |
| Rules plus embeddings, TASK-218 archetypes    | 15/21        | 1            | 22/42       |

Scams caught by language (English / Filipino / Taglish, 7 each): rules only 5 / 4 / 4; embeddings with the original archetypes 5 / 4 / 5; embeddings with the TASK-218 archetypes 5 / 5 / 5.

## Reading it

- Embeddings add one scam catch and the new archetype phrasings add one more. No new false alarm appeared.
- These are one to two cases out of 21, which is inside the noise of a set this small. Embeddings did not change the abstention story much: most unsure messages stay unsure,
  because the floor (0.9) and the benign margin are deliberately strict.
- The floor was chosen to avoid false alarms, so embeddings mostly confirm clear scams. They cannot be treated as evidence that a message is safe.

## What this does not support

One AI-authored group, 42 cases, no native-speaker review, no real-world corpus. Development-informed archetypes. Not a general accuracy percentage, not a phone result, and not proof that the model loads in a browser.
Embedding loading in the browser or on a phone is TASK-217 and is untested here.

## Proposals (not applied)

- Keep the floor at 0.9. The development set already shows ordinary messages touching 0.90 similarity that are kept out only by the margin rule.
- A second, independent set written by a Filipino speaker would show whether the one or two extra catches are real.
