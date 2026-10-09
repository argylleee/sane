# Frozen evaluation set

TASK-208, allocation 1. Frozen before the first scored run on October 10, 2026.

SHA-256: `8d301bfb1825e812dbe374f0ab6497759873fda67cf90091c1af99f7101f572f`

The hash covers the exact UTF-8 bytes of `heldout.json`, including formatting.
The runner rejects a changed set. Do not tune rules, reference data, weights, or
thresholds against these results. Transfer discovered failure scenarios into a
separate development set under a new allocation. A future holdout must use a new
version and remain separate from this one.

## Composition and provenance

42 new synthetic messages: 14 English, 14 Filipino, 14 Taglish; each language has
7 scam scenarios and 7 legitimate scenarios. Expected levels describe authored
scenario intent, not confirmed real-world fraud. Scams span wallet lockout, bank
credentials, parcel fees, prizes, jobs, relatives, investments, SIM registration,
government aid, loans, romance, refunds, and marketplace deposits. Legitimate
cases include OTP safety, delivery, bank education, group invitations, bills,
ordinary urgency, account recovery, and official-domain information.

Author: Codex, one AI author group, at the user's approval. No private messages,
real identities, phone numbers, accounts, or live scam links were used. Dummy
OTP codes and invitation paths are placeholders. Brand names and public domains
provide scenario context; these are not quotations of provider advisories.
Each case has its own provenance. Filipino and Taglish need native-speaker review.

Messages were drafted before opening detector rules, keywords, brands, archetype
phrases, or development messages in this task session. Pipeline interfaces and
previous evaluation-runner code were inspected. This agent has historical context
about detector behavior, so this is not an independently blinded or human-authored
holdout. Exact normalized duplicates against development/probe/archetype text are
checked after freezing; that check cannot establish semantic independence.

## Run

From the task worktree, PowerShell:

```powershell
$env:EVAL_HELDOUT = '1'
$env:HELDOUT_OUTPUT = 'eval/heldout/results.json'
npx vitest run eval/heldout/run.heldout.test.ts
Remove-Item Env:EVAL_HELDOUT, Env:HELDOUT_OUTPUT
```

To additionally attempt real CPU embeddings from the existing local Transformers.js
cache, set `$env:EVAL_EMBEDDINGS = '1'`. Remote model loading is disabled. The runner
uses the shared embedder, matching, scoring, and pipeline code with a Node adapter
for the browser worker transport. Actual vectors are never mocked. If loading
fails, results say unmeasured and include the reason; rules-only numbers remain.
This is Node evidence, not browser, phone, offline-relaunch, or network-tab proof.

The evaluation is opt-in and never asserts an accuracy target. Normal tests check
set integrity and metric calculations only. Results include per-case levels,
scores, signal IDs, model-use flags, confusion matrices, and every missed scam,
false alarm, abstention, and exact-level mismatch.

## Metric definitions

Flagged = `suspicious` or `likely_scam`; positive truth = either expected scam label.
Recall = caught / all scams, counting abstained scams as misses. Precision = caught /
all flagged. False-positive rate = false alarms / all legitimate. Abstention rate =
`not_sure` / all cases. Exact-level agreement is separate from binary flagging.

Per-label metrics use one-vs-rest counts. Abstentions stay in recall denominators;
per-label abstention rate counts abstentions among cases expected to have that label.
Zero denominators are `null` (unmeasured), not zero. The complete confusion matrix
includes `not_sure`. Small synthetic samples do not measure real-world accuracy.
