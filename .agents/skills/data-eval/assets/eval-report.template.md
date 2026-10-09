# Evaluation report: Sane

Date/time: (fill in) Build/commit: (fill in) Device and browser: (fill in) Models used: (fill in)
Test set: n messages (EN n, FIL n, Taglish n). Written separately from archetypes: yes / no.
Offline run identical to online run: yes / no.

## Summary

| Metric                                     | Result |
| ------------------------------------------ | ------ |
| Scam recall (flagged suspicious or likely) | n / n  |
| False alarms on legit messages             | n / n  |
| Abstained (not_sure)                       | n / n  |
| Screenshot path usable                     | n / n  |
| Avg time per check (text)                  | n s    |
| Network requests during scan               | 0      |

## By language

| Language | Scams caught | False alarms | Abstained |
| -------- | ------------ | ------------ | --------- |
| English  |              |              |           |
| Filipino |              |              |           |
| Taglish  |              |              |           |

## Failures and what was changed

| Test id | Expected | Got | Cause | Change made (rule/weight/threshold) |
| ------- | -------- | --- | ----- | ----------------------------------- |

## Known limits (say these out loud in the demo)

- Weaker on brand-new scam styles not close to any archetype
- Small LLM explanations can be imperfect in Filipino; headline and steps come from reviewed templates
- OCR depends on screenshot quality
