# Classifier and evaluation contract

> **Superseded (D-10, October 9, 2026):** the Android-native, Filipino+English, trained-classifier approach below was replaced by the web-only kit in `RULES.md` and `PLAN.md`. Kept for history; do not build from it.

Status: selected baseline to evaluate, not a trained model or accuracy claim. Languages required:
Filipino and English. A model upgrade is possible only with integration approval and evidence
that native execution, background monitoring, language quality, and timebox remain viable.

## Labels and data

Define scam-related content as attempts to obtain secrets, unauthorized payment/value, or harmful
actions through deception/social engineering. Legitimate marketing/spam is not automatically a scam.
Unclear examples need adjudication or an ambiguous label; do not force them into ground truth.
Record source/license/consent, language, scam family, label rationale, and template-family ID.
Use licensed public data and fictional/sanitized local examples; no private inbox scraping.

Cover credential/OTP solicitation, account threats, delivery impersonation, advance-fee rewards,
and trusted-person/payment impersonation. Include scams without links and ordinary communications
sharing the same topics, urgency, banks, payments, and URLs. Include negation, safety advice, quotes,
spelling variation, punctuation, and unexpected text. Evaluate mixed-language material separately
if used; do not treat English/Filipino UI strings as validated Taglish detection.

The [UCI SMS Spam Collection](https://archive.ics.uci.edu/dataset/228/sms%2Bspam%2Bcollection)
is a spam/ham dataset. It may support an exploratory baseline but requires label review and
cannot substantiate Filipino or contemporary scam detection. Synthetic examples alone provide
bounded prototype evidence, not representative real-world accuracy. Record that limitation.

Split by template family/near-duplicates before fitting. Training fits vocabulary and IDF;
development selects regularization/thresholds/policy; final held-out set stays untouched.
Report exact per-language/family sample counts, label review, and known gaps; no magic minimum
sample count guarantees quality. Poor evidence is a blocker to broad detection claims.

## Baseline and export

Use TF-IDF features from word and character n-grams with regularized logistic regression.
Select feature ranges/vocabulary cap on development data within native resource limits.
Document exact Unicode normalization, case folding, whitespace/punctuation handling, tokenization,
URL placeholder treatment, code-point handling, TF formula, IDF smoothing, feature ordering, and
normalization. Preserve negation; do not strip stop words or financial context by default.

Export a versioned data artifact with:

- Training/build revision, label order, vocabulary, IDF values, weights, intercept, and feature settings.
- Preprocessing/policy versions and lower/upper decision thresholds selected on development data.
- Artifact schema version, SHA-256, compatible native engine version, license/provenance summary.
- Evaluation report references and measured file size/phone load time; no fabricated values.

Use nonexecutable data such as JSON for the small baseline. Java computes the same sparse feature
vector and classifier output; Python is training-only. A packaged artifact must pass schema,
dimension, finite-number, checksum, and compatible-version checks before the engine is ready.
Verify feature-vector and decision parity, including empty/unknown vocabulary, Unicode/emoji,
negation, long content, and both languages, with a documented numeric tolerance. Never trust a
matching final label alone when underlying scores/features disagree materially.

Method references: [scikit-learn text features](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction)
and [logistic regression](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression).

## Decision policy

All assessable messages invoke the model; hardcoded rules alone are not the final Local AI system.
Two tuned thresholds define low/caution/high model evidence. Context-aware strong rules can escalate
concern; weak indicators alone do not establish fraud. A benign model score cannot suppress an
observed request to disclose secrets. Test rule context and negation rather than matching OTP alone.

Missing model, empty/unreadable content, processing failure, and rejected oversized content return
unassessable. Partial content cannot return low; strong available evidence may warn high/caution
with a partial-content reason. Familiar vocabulary is not proof of in-domain coverage; no feature
coverage heuristic is claimed to solve unknown-message detection. Unknown content remains a limit.

Keep model evidence distinct from observed rules. No fabricated reason such as confirmed malicious
URL, actual sender impersonation, or 99% fraud. Internally computed classifier probabilities are
not validated real-world risk; calibration and distribution shift must be assessed before showing them.

## Evaluation and model contribution

Record high/caution/low/unassessable outputs, binary mapping, confusion counts, recall, precision,
false-alert rate, and unassessable rate with denominators. Report high-only and high-or-caution
results so universal caution cannot masquerade as useful performance. Separate Filipino/English,
manual/SMS/chat-preview coverage, and synthetic/public sources. Small pilots are explicitly pilots.

Compare rules-only, classifier-only, and combined policy on the same untouched cases. Show useful
learned behavior beyond hand-authored rules; disclose if the combined system does not improve.
Do not repeatedly tune on final cases or quietly change labels after a miss. New fixes require
new independent final evaluation or a clear statement that the original set became development data.

Accuracy targets must be chosen and recorded before final evaluation, with safety tradeoffs and
available data stated. No accepted accuracy target or passing model exists yet. Capture native
cold/warm latency and memory on the actual phone; 8 GB RAM is not model-quality evidence.
