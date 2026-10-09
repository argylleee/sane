# Specialist skill review scenarios

Each of the six Sane skills contains two synthetic prompts and expected behavior in
`evals/evals.json`: twelve cases in total. They evaluate agent guidance, not classifier accuracy
or working Android functionality. No private input or external mutation is required.

## Coverage

| Skill             | Failure pressure covered                                                              |
| ----------------- | ------------------------------------------------------------------------------------- |
| sane-architecture | Hidden-tab monitoring; cloud-only detector/fake confidence                            |
| sane-android      | Conflated permissions/all-app access; unlimited goAsync/WebView reliance              |
| sane-model        | Spam versus scam and unsupported Filipino claims; test leakage/export parity          |
| sane-experience   | Fabricated Safe/universal coverage/history; denial/redacted bilingual states          |
| sane-security     | Private log/assistant uploads/privileged links; plaintext queue/permanent inbox       |
| sane-release      | Foundation/Figma mistaken for runtime evidence; airplane-mode delivery/invented rules |

## Evaluation procedure

Use read-only scenario responses with skills/contracts and a separate baseline without the new
skills. Review whether the response preserves confirmed scope, explains constraints accurately,
uses the shared contract, and avoids unauthorized actions or fake success. Record material
differences without claiming statistically measured trigger reliability from one pass.

Independently inspect root/rule/skill composition for contradictory ownership, role activation,
model policy, data retention, design authority, and organizer assertions. Metadata/link/vendor/mirror
checks and scoped formatting are deterministic repository checks; scenario review is qualitative.

Review results and exact repository checks are recorded in [the bundle handoff](bundle-handoff.md).
At authoring time, classifier/device/Figma execution remains Not run; this document does not change it.

## Qualitative review result

Two independent read-only agents answered the twelve prompts: one with matching specialists/contracts,
one using only generic authority plus scope/guidelines. All twelve specialist responses addressed
the expected boundary; baseline responses also generally preserved those boundaries. No measured
improvement, trigger reliability, timing/token benchmark, or model accuracy is claimed from this pass.
Specialists supplied more exact contract/export/lifecycle references.

An independent composition review found three gaps: omitted app/channel warning blocking,
inconsistent unknown capability representation, and missing Impeccable platform metadata. These were
corrected and current Android sensitive-notification/OTP-SMS checks added. Release quality/latency
targets remain an explicit implementation prerequisite, to be recorded before final evaluation.
The reviews are qualitative advisory evidence; application/runtime cases remain Not run.
