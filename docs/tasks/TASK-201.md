# TASK-201: Local rules and verdict pipeline

- Status: active
- Owner / role: backend-dev / backend
- Allocation: 1 in the coordinator's `coordination.json`
- Branch / worktree: `codex/feat/task-201-rules-scoring-pipeline` / `.worktrees/task-201`
- Base revision: `924fe03b7b4cc2dab50cb54731e1ca80cc07cc26`
- Contract: `src/types.ts`; no shared contract change

## Specification

Given pasted English, Filipino, or Taglish text, `analyze()` returns one of four risk levels, code-detected reasons with spans in the normalized text, and advice in the selected language. It must work when OCR and embeddings are unavailable. Scanning text must not make a network request or store the message. An empty or unreadable input returns `not_sure`. An ordinary notice without enough evidence also returns `not_sure`, while an explicit no-share credential notice with no competing warning can be `probably_fine`.

Acceptance examples: a GCash impersonation link plus an OTP request is `likely_scam`; a bare request for an OTP is at least `suspicious`; `gcash.com.evil.xyz` is a lookalike while `gcash.com` is not; `Do not share this code` is not treated as an OTP request; a model/OCR failure still returns a verdict. These are behavior checks, not claims of real-world accuracy.

## Design and ordered tasks

- [x] T201-1 Add bounded phrase and verified-domain reference data in `src/data/`.
- [x] T201-2 Normalize common Unicode obfuscation and detect links, lookalikes, credential requests, urgency, account threats, money requests, and bait in `src/pipeline/` and `src/rules/`.
- [x] T201-3 Score only code signals for the first runnable slice and provide distinct English, Filipino, and Taglish templates in `src/score/` and `src/explain/`. Embedding thresholds wait for evaluation by TASK-202.
- [x] T201-4 Verify success and failure boundaries with isolated tests in `src/pipeline/`, run scoped formatting, task scope check, and repository validation.

Out of scope: UI, model loading, OCR implementation, shared types, deployment, and accuracy claims. The domain list is intentionally short so every exception can be checked at its own official site.

The four domain entries were checked against the [GCash](https://gcash.com/), [Maya](https://www.maya.ph/), [BDO](https://www.bdo.com.ph/), and [BPI](https://www.bpi.com.ph/) sites on October 9, 2026. This list is a narrow matching reference, not a guarantee that a message containing one of these domains is safe.

## Handoff

See `TASK-201-handoff.md` for exact checks and integration limits.
