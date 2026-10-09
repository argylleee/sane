---
name: data-eval
description: Reference data, scoring logic and evaluation for Sane without any model training or labeling. Use whenever the user mentions archetypes, scam patterns, keywords, brands, lookalike domains, scoring, thresholds, risk levels, test set, test messages, accuracy, evaluation, false positives, or "how do we test it", and when writing or editing anything in src/data or eval.
---

# Data and evaluation (no training, no labeling)

Nothing here trains a model. The data is a hand-written knowledge base the code and embeddings look things up in, plus a small test set used only to check behavior. Disclose both as human-authored reference data.

## Files in `assets/`

- `archetypes.seed.json`: 12 Philippine scam patterns, each with 3 example phrasings (English, Filipino, Taglish) and a short name. AI-drafted starting point. **Have a native Filipino speaker review and add 2 to 3 more phrasings per archetype from real messages.**
- `keywords.seed.json`: keyword and phrase lists per language and per signal type.
- `brands.json`: brands and legit domains used by the lookalike check.
- `eval-report.template.md`: report format for test results.

## Archetype schema

```json
{
  "id": "gcash_lockout",
  "name": { "en": "...", "fil": "...", "taglish": "..." },
  "phrases": ["...", "..."],
  "defaultWeight": 40
}
```

Add more phrasings, not more archetypes, when coverage is weak. Diversity of wording matters more than count.

## Signals (code-detected)

| Signal                         | Example trigger                                     | Suggested weight |
| ------------------------------ | --------------------------------------------------- | ---------------- |
| lookalike_domain               | host contains brand name but is not the real domain | 35               |
| suspicious_tld_or_shortener    | `.xyz`, `.top`, bit.ly style shorteners             | 15               |
| otp_pin_request                | asks for OTP, PIN, password, MPIN                   | 35               |
| urgency                        | "within 24 hours", "last warning", "ngayon na"      | 12               |
| account_threat                 | blocked, suspended, locked, "mawawalan ng access"   | 15               |
| money_request                  | send/pay/fee, "mag-load", "bayad"                   | 15               |
| prize_or_job_bait              | won, claim, easy income, "per task"                 | 15               |
| unknown_number_claims_relative | "this is your anak/kapatid, new number"             | 20               |

Starting weights only. Tune them against your own test set.

## Scoring (simple, explainable)

```text
signalScore = min(100, sum(weights of detected signals))
simBonus    = topSimilarity >= HIGH ? 25 : topSimilarity >= MID ? 12 : 0
score       = min(100, signalScore + simBonus)
level:
  score >= 60            -> likely_scam
  score 30..59           -> suspicious
  score < 30 and topSimilarity < MID and no signals -> probably_fine
  otherwise / conflicting evidence -> not_sure
```

Pick `HIGH` and `MID` from your own measurements (look at similarity values for known scams vs legit messages, then set thresholds between them). Hard override: an `otp_pin_request` or a `lookalike_domain` alone should never score below `suspicious`.

Why this shape: every point of the score can be shown to the user as a reason, so the verdict is explainable and the LLM is not needed to decide.

## Legit-message guardrails (to avoid crying wolf)

Real bank and e-wallet texts exist and often mention OTPs, links and accounts. Include in tests:

- OTP messages that say "do not share this code"
- Real delivery updates with tracking numbers and official domains
- Real promos from known brand domains
  The `brands.json` allowlist of official domains lowers the score when a link matches exactly. Exact domain match only, never substring.

## Test set (the part that tells you the truth)

- **Size:** 30 minimum (10 English, 10 Filipino, 10 Taglish; about 60% scams, 40% legit). 45 to 60 if time allows.
- **Independence:** write test messages separately from archetype phrasings. Reusing the same sentences inflates accuracy and judges will notice.
- **Sources:** your own paraphrases of public advisories and news examples (note the source), teammates' forwarded spam with personal data replaced, plus a few deliberately tricky messages (polite scam, scary-sounding legit).
- **Use:** adjust rules, weights and thresholds from failures. Do not fine-tune any model with it.
- **Format** (`eval/testset.json`):

```json
{
  "id": "t01",
  "lang": "taglish",
  "text": "...",
  "expected": "likely_scam",
  "note": "gcash lockout"
}
```

`expected` is one of `likely_scam`, `suspicious`, `probably_fine`. Score a case as correct if the app returns the same level, or `not_sure` counts as "abstained" (report it separately).

## Metrics to report

- Scam recall: scams flagged as suspicious or likely_scam / all scams
- False alarm rate: legit flagged as suspicious or likely_scam / all legit
- Abstain rate: `not_sure` / all
- Per-language breakdown
- Screenshot path: of N screenshots, how many OCR'd well enough to give the same verdict as pasted text
  Report honest numbers with the template. "Caught 13 of 15 scams, 1 of 9 legit flagged" is more credible than "95% accurate."

## Accuracy design options (no training, so where does accuracy come from?)

A small LLM judging "scam or not" by itself is unreliable. It can be fooled by polished wording and can overreact to normal bank notices. A trained classifier would likely beat it, but that needs labeled data and time you do not have. So accuracy comes from the design, and you can choose how much weight the LLM carries:

1. **Rules + retrieval decide, LLM only explains.** Most predictable on stage, least "AI-heavy."
2. **Add few-shot examples (3 to 4 sample verdicts) in the LLM prompt** so it contributes more to the judgment. More flexible, less predictable.
3. **Add the confidence labels** (Likely scam / Suspicious / Probably fine / Not sure). Admitting uncertainty protects you from confidently wrong answers.
   Default in this kit is option 1 plus option 3, because Technical Execution rewards reliability in a live demo. Pick option 2 only if your tests show the LLM is dependable. Be upfront that it is strongest on common, pattern-based scams and weaker on brand-new or very subtle ones.

## Languages: English, Filipino, Taglish

Filipino is essentially Tagalog as the national standard. Taglish mixes Tagalog and English in one sentence. How each part copes:

- **Embeddings (multilingual-e5-small):** best fit. Trained on about 100 languages including Tagalog, so "i-verify mo na account mo" can still match an English "verify your account" archetype. Mixed sentences are a bit noisier.
- **OCR (Tesseract.js):** load `eng` plus `fil` (or `tgl`). Taglish is Latin script, so this is a screenshot-quality problem, not a language problem.
- **Rules engine:** language-independent. Keep keyword lists per language (see `keywords.seed.json`).
- **LLM:** the weak spot. Qwen2.5 and Llama 3.2 are mainly English-strong and may write awkward or wrong Tagalog. A Gemma-family small model may cover more languages if WebLLM lists one. Test on Taglish prompts before committing.

### Explanation-language options

1. **Templates only (safest):** reviewed text per archetype in all three languages. Reliable and instant, less "AI-generated."
2. **LLM writes it with a language toggle:** most flexible and most Local AI, but shaky Tagalog is possible.
3. **Hybrid:** templates for headline and "what to do" steps, LLM adds one or two sentences of context. Judges see the LLM doing real work and a bad generation cannot ruin the result.
   Default here is option 3 (templates are the fallback). Choose option 1 or 2 if your model tests point that way, and log the choice in PLAN.md.

## How much data to write by hand

| Item                            | Minimum (a few hours)                             | Fuller version        |
| ------------------------------- | ------------------------------------------------- | --------------------- |
| Scam archetypes                 | 12                                                | 25 to 30              |
| Example phrasings per archetype | 4 (mixed English, Filipino, Taglish)              | 5 to 6                |
| Keyword and phrase lists        | about 30 per language                             | about 50 per language |
| Lookalike domain brands         | 10 to 15                                          | 20 to 25              |
| Explanation templates           | 12 archetypes x 3 languages = 36 short blurbs     | 25 x 3 = 75           |
| Test messages                   | 30 total (10 per language, scams and legit mixed) | 45 to 60              |

The seed files already cover 12 archetypes with 3 phrasings each, so the minimum column needs roughly 1 more phrasing per archetype, the keyword expansion, 36 template blurbs and the test set. Split the typing between teammates. Letting an AI draft the first pass is allowed by the rules, but a native Filipino speaker should review so the texts sound like real messages.

## Testing without a phone

The app is a website, so everything is testable on a laptop. The SMS part only affects where messages come from.

- **Test message sources:** write your own (about 12 to 15 scams in common Philippine patterns plus 8 to 10 legit ones, mixed languages, including real-looking bank notices and "do not share this code" OTPs), paraphrase public advisories and news examples with the source noted, and ask teammates to forward real spam with personal details blurred or swapped.
- **Screenshot path without a phone:** build a simple chat-bubble HTML page or Figma frame with the message text and screenshot it on desktop. Also use real phone screenshots if anyone has them. Add ugly cases: cropped, dark mode, small text. OCR is usually the weakest link, so this tells you whether to lead the demo with paste.
- **Offline test:** load the app once so models cache, then switch to airplane mode or DevTools Network, Offline, and rerun the full set. Results should match the online run. Keep the Network tab open to show zero outgoing requests.
- **Self-scoring:** record right or wrong for each message and report it with `eval-report.template.md`, for example "caught 13 of 15 scams, flagged 1 of 9 legit." Using it to adjust rules and thresholds is evaluation, not training.

## Quick drafting workflow (about 3 hours total)

1. Review archetype seeds, add real phrasings (45 min, Filipino reviewer)
2. Expand keywords and brands (30 min)
3. Write test set (60 min, a different person from step 1 if possible)
4. Run, record failures, tune weights (45 min)
