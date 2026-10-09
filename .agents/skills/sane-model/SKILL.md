---
name: sane-model
description: Train, export, evaluate, or review Sane Filipino/English scam classifiers, contextual rules, thresholds, model contribution, data provenance, and Python/Java feature parity. Use for detection quality; UI translation is not model evidence.
---

# Sane model workflow

This specialist supplements AGENTS.md and existing role, allocation, and validation workflows.
It does not activate a role, assign files, authorize external actions, or establish working behavior.

## Read relevant contracts

- [docs/sane/model.md](../../../docs/sane/model.md)
- [docs/sane/contracts.md](../../../docs/sane/contracts.md)
- [docs/sane/verification.md](../../../docs/sane/verification.md)
- [Applicable rule](../../rules/sane-model.md)

## Procedure

1. Confirm scam-versus-spam label policy, required languages, licensed/sanitized data, and resource limits. Adjudicate ambiguous labels and record provenance and template-family IDs.
2. Split training/development/final data by template/near-duplicate groups before fitting. Include each scam family and difficult legitimate financial/security messages; report per-language counts.
3. Fit the TF-IDF/logistic baseline on training only; tune regularization, thresholds, and contextual rules on development only. Preserve negation and document exact Unicode/token/normalization behavior.
4. Export nonexecutable complete data/manifest: vocabulary/IDF/weights/intercept/labels, feature settings, preprocessing/policy versions, thresholds, checksum, schema, and native compatibility.
5. Verify Python/Java feature vectors, scores, and decisions on both languages and edge cases with documented tolerance. Matching labels alone do not prove parity.
6. Compare rules-only, model-only, combined outputs on untouched final cases. Report high-only/high-or-caution mappings, false alerts, misses, unassessable rate, and denominators by language/source.
7. Apply contract uncertainty/failure/partial-content policy. Distinguish observed rules from model evidence; do not invent sender/URL verification, fraud percentages, or broad bilingual accuracy.
8. Set targets before final evaluation. Report real artifact/provenance/report/device measurements and weak-data blockers through self-validate/handoff; do not tune final examples until a fabricated pass.

## Review scenarios

`evals/evals.json` contains synthetic read-only behavior scenarios. Evaluate scope, uncertainty,
and compatibility; application tests and model benchmarks are separate. Report actual findings
and missing prerequisites rather than fabricating success or implementing unauthorized changes.
