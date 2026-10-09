---
trigger: model_decision
description: Apply evidence-based Filipino and English scam classification, model export parity, and honest uncertainty.
---

# Model and data integrity

Read `docs/sane/model.md` before training, scoring, labeling, or accuracy claims.

- Learn classifier parameters from labeled data; do not rename hand-authored keyword weights AI.
  Every assessable message passes through local model inference in both modes.
- Scam-related intent and generic spam are different labels. Document label policy and provenance.
  Public spam datasets do not establish Filipino scam-detection accuracy.
- Separate training, development/threshold tuning, and untouched final evaluation. Group near
  duplicates and template families before splitting. Fit vocabulary/IDF on training data only.
- Evaluate Filipino and English separately, including difficult legitimate counterparts,
  negation, impersonation, and scams without links. Do not infer broad language support from UI translation.
- Export preprocessing, vocabulary, IDF, normalization, weights, intercept, label order, and
  policy versions together. Verify Python/Java parity before relying on device predictions.
- Report model contribution, false alerts, misses, and sample counts. Neither similarity nor
  classifier output is a validated fraud percentage without calibration evidence.
- Unreadable or materially partial input is unable to assess; strong observed warning signs
  may still justify caution/high concern with the coverage limitation disclosed.
