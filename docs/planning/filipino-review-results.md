# Filipino and Taglish review: what was returned and how it was applied

Source: `codex/docs/filipino-review-sheet`, parts 1 to 3, marked by the team on October 10, 2026, plus the team's follow-up answers on the disputed lines. The judgements below are the team's; the coordinator only applied them.

## How the sheets were marked

The sheet asked for `[x]` when a line sounds natural and clear, and a better wording after `Fix:` when it does not. The team instead marked `[x]` on the lines they consider scams and left the others unmarked.
Because that marking answers a different question, the disputed lines were put to the team again as scam, legitimate or unsure. The answers are applied as listed below.

## Applied

| Line                                    | Team answer              | Applied                                             |
| --------------------------------------- | ------------------------ | --------------------------------------------------- |
| A18 (relative emergency, Taglish)       | Fix written in the sheet | "urgent talaga" became "urgent lang"                |
| A1 (GCash limited, English)             | legitimate               | removed from the `gcash_lockout` scam examples      |
| A2 (GCash limited, Filipino)            | legitimate               | removed from the `gcash_lockout` scam examples      |
| A28 (electricity disconnected, English) | legitimate               | removed from the `utility_disconnect` scam examples |
| A3, A29, A30                            | scam                     | kept as scam examples                               |
| C-t21, C-t23, C-p06, C-p08, C-p13       | scam                     | labels were already scam, so no change              |

The three removed lines were removed, not moved to the ordinary-message set: removal stops them counting as scam evidence without claiming that similar messages are safe.
The archetype file version went from 2 to 3 so devices rebuild their cached index.

## Effect

On the development set with the real embedding model: scams flagged 6/15 before and after, ordinary messages flagged 0/15 before and after, highest ordinary similarity 0.901 before and after.

## Still open

- Whether the Filipino and Taglish lines sound natural was not answered. Only scam-or-legitimate was.
- Section B (ordinary examples) and section D (app explanation text) have no judgement beyond "unmarked"; nothing was changed there.
- The team's reading that A1, A2 and A28 are legitimate while A3, A29 and A30 are scams is recorded as given. A formal notice that tells the reader to click a link or call a number matches common real scams as well, so those removals reduce, slightly, the formal-style scam examples the app can recognise.
