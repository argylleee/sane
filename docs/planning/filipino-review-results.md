# Filipino and Taglish review: what was returned and how it was read

Source: `codex/docs/filipino-review-sheet`, parts 1 to 3, marked by the team on October 10, 2026. Written by the coordinator; the markings are the team's, the interpretation below is not a native-speaker judgement.

## What the sheet asked and what was marked

The sheet asked for `[x]` when a line sounds natural and clear, and a better wording after `Fix:` when it does not. Section C also asked whether the label (scam or normal) is right.
The team marked `[x]` on the lines they consider scams and left the others unmarked. So the marks answer "is this a scam?", not "is this natural?", and an unmarked line can mean "legitimate" or "unnatural".
Nothing in the data was changed on that reading except the one explicit fix below.

## Applied

- A18 (`relative_emergency`): "urgent talaga" became "urgent lang", as written in the sheet's `Fix:` line. Taken from the team, not generated.

## Lines where the marking disagrees with our labels (needs a decision, nothing changed)

| Lines                                         | Our label            | Marked      | Open question                                                  |
| --------------------------------------------- | -------------------- | ----------- | -------------------------------------------------------------- |
| A1 to A3 (GCash account limited, verify)      | scam example         | not checked | Do they read as legitimate, or as unnatural?                   |
| A28 to A30 (final notice, power disconnected) | scam example         | not checked | Same question                                                  |
| C-t21 (relative asks for load)                | likely_scam          | not checked | Legitimate, or unnatural?                                      |
| C-t23 (debt collection threat to contacts)    | likely_scam          | not checked | Same                                                           |
| C-p06, C-p08, C-p13                           | scam                 | not checked | Same                                                           |
| All of B1 to B18, all of section D            | ordinary or app text | not checked | Expected for ordinary messages; section D needs an actual call |

Until each is answered, the archetype examples, the development set labels and the app text stay as they are. Removing a scam example because it was left unchecked would weaken detection of real GCash and utility scams.
