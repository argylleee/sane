# Metrics and tunable parameters

Use this when judges ask "how did you measure accuracy?" and when you need to pick thresholds. All starting values are placeholders. The right numbers come from your own test messages.

## Definitions

Treat "scam" as the positive class. The app **flags** a message when it returns `suspicious` or `likely_scam`.

|                | Flagged | Not flagged (`probably_fine`) | Abstained (`not_sure`) |
| -------------- | ------- | ----------------------------- | ---------------------- |
| Actually scam  | TP      | FN                            | abstain (scam)         |
| Actually legit | FP      | TN                            | abstain (legit)        |

| Metric                     | Formula                                                          | Why we report it                                                                                                 |
| -------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Scam recall                | TP / all scams                                                   | Missing a scam can cost someone money. This is the headline safety number                                        |
| False alarm rate           | FP / all legit                                                   | If the app cries wolf, people stop trusting it                                                                   |
| Precision                  | TP / (TP + FP)                                                   | Of what we flagged, how much was truly a scam. Depends on how many legit messages are in the set, so say the mix |
| Abstain rate               | not_sure / all                                                   | Shows honesty. A high rate means the app is too timid, so report it                                              |
| Level agreement            | exact `expected` level match / all                               | Stricter than flagged-or-not                                                                                     |
| Archetype hit@3            | scam's true pattern in top 3 matches / scams                     | Measures the retrieval layer on its own                                                                          |
| Screenshot usability       | screenshots giving the same verdict as pasted text / screenshots | Measures OCR end to end                                                                                          |
| Offline parity             | cases with identical verdicts offline vs online / all            | Backs the "works when the cloud disappears" claim                                                                |
| Latency                    | median and slowest time per check, on the demo device            | Backs "instant"                                                                                                  |
| Network requests per check | count from `PerformanceObserver`                                 | Backs "private". Expect 0                                                                                        |

Always give counts, not just percentages (for example 13 of 15), and break results down by English, Filipino and Taglish.

## How to handle abstentions

Report them separately. Two honest views: "recall counting abstains as misses" (conservative) and "recall among decided cases". State which one you quote.

## Be honest about small samples

With about 15 scams, 13 caught is 87%, but the 95% confidence interval (Wilson) is roughly 62% to 96%. Say "on our 30-message set" and do not present it as real-world accuracy. A good line: "This is a small, hand-built set. It tells us the pipeline works on common patterns, not that it generalizes to every scam."

## Avoid fooling yourselves

- Write test messages separately from archetype phrasings (no shared sentences).
- Optional: split the set into a tuning part (about two thirds) and a holdout part (about one third). Tune weights and thresholds on the tuning part only, then report the holdout numbers. If the set is too small to split, say it was tuned and tested on the same messages.
- Do not retrain or fine-tune any model with the test set.
- Freeze parameters at the feature freeze, then run the final evaluation once and report it as is.

## Tunable parameters (starting points, then tune)

| Parameter                         | Starting value                                                   | How to choose it                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Signal weights                    | see `SKILL.md` table                                             | Raise weights for signals that separate scams from legit in your set, lower the ones that cause false alarms             |
| `likely_scam` threshold           | score >= 60                                                      | Move until recall is acceptable without too many false alarms                                                            |
| `suspicious` threshold            | score >= 30                                                      | Same method                                                                                                              |
| `HIGH` similarity                 | pick from data                                                   | Compute top similarity for every test message. Choose a value above most legit scores and below most scam scores         |
| `MID` similarity                  | pick from data                                                   | Lower cut for weak matches. Below it counts as "no strong match"                                                         |
| Similarity bonus                  | +25 for HIGH, +12 for MID                                        | Keep smaller than strong code signals so matching alone rarely dominates                                                 |
| Top-k archetypes                  | 3                                                                | Lower for simpler UI, higher if hit@3 is poor                                                                            |
| Hard overrides                    | `otp_pin_request` or `lookalike_domain` never below `suspicious` | Safety floor, keep unless it causes many false alarms on legit OTP notices (the "do not share" phrase list handles most) |
| Safe phrase discount              | about -15 when a "do not share this code" phrase appears         | Check on legit OTP messages                                                                                              |
| Exact-brand-domain discount       | about -20 when a link matches an official domain exactly         | Exact registrable domain only                                                                                            |
| Min text length for a verdict     | about 15 characters                                              | Shorter input returns `not_sure` with a "paste more" hint                                                                |
| Max input length                  | 5,000 characters                                                 | Protects performance and security                                                                                        |
| OCR timeout / min recognized text | about 20 s / about 15 characters                                 | If OCR returns little text, ask the user to paste instead                                                                |
| LLM timeout                       | about 15 s                                                       | Fall back to the template on timeout                                                                                     |
| LLM temperature / max tokens      | about 0.2 / about 120                                            | Low temperature keeps output stable and short                                                                            |
| Embedding input prefix            | `query:` for messages, `passage:` for archetypes                 | Per the model card (verify)                                                                                              |

## Threshold method (simple, defensible)

1. Run every test message with the LLM off and record score and top similarity.
2. List scam scores and legit scores side by side.
3. Pick the `suspicious` threshold that catches most scams while keeping false alarms at or below the level you can accept (for example no more than 1 in 10 legit messages).
4. Pick the `likely_scam` threshold higher, where almost nothing legit lands.
5. Rerun and record the table. Write the chosen values in the PLAN.md decisions log with the reason.
   Options if you must trade off: lean toward higher recall (more flagged, more false alarms, safer for users) or toward fewer false alarms (calmer, risks missing scams). Which one fits depends on how you want to pitch Sane, and you can say that choice out loud.

## Answers to likely judge questions on metrics

- **"What does accuracy mean here?"** We do not use one number. Recall on scams, false alarm rate on legit messages and how often it says Not sure, per language.
- **"Why not just report accuracy?"** One number hides the trade-off. Missing a scam and flagging a real bank text are very different mistakes.
- **"How big was your test set?"** Say the real number and that it is small and hand-built.
- **"Did you train on it?"** No. No model was trained or fine-tuned. We used it to adjust rules and thresholds, and we say whether a holdout was used.
- **"Does it generalize?"** Strongest on common patterns, and it says Not sure on novel ones. Real-world accuracy is unmeasured.
