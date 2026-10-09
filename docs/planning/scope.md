# Sane scope and requirements

> **Superseded (D-10, October 9, 2026):** the Android-native, Filipino+English, trained-classifier approach below was replaced by the web-only kit in `RULES.md` and `PLAN.md`. Kept for history; do not build from it.

Confirmed by the user on October 9, 2026: scam-related message detection through manual paste
and automatic arrival monitoring; Android SMS plus selected chat apps through notifications;
Filipino and English; three developers without Kotlin experience; approximately 15 build hours;
an 8 GB RAM Android device. Exact phone/OS, selected chat apps, and dataset availability are unresolved.

## Required product flows

| ID    | Requirement                      | Acceptance boundary                                                                                                                     |
| ----- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| BS-01 | Manual paste and analyze         | New input runs through the actual shared local model; clear result/error.                                                               |
| BS-02 | Automatic new SMS analysis       | Actual device SMS arrives while UI is backgrounded; permitted native capture analyzes it and issues an appropriate warning.             |
| BS-03 | Automatic selected-chat analysis | A real supported app notification supplies readable text while UI is backgrounded; local analysis and warning work.                     |
| BS-04 | Filipino and English detection   | Independently labeled held-out examples for each; disclose misses and unsupported/mixed content. UI localization alone is insufficient. |
| BS-05 | Monitoring controls and truth    | Consent, source selection, SMS/access/alert permissions, readiness, pause, degraded states, and settings-return refresh.                |
| BS-06 | Explainable uncertainty          | Concern tier, observed indicators, model assessment, safe next step, and coverage limits. No confirmed-fraud/safety guarantee.          |
| BS-07 | Offline operation after install  | Bundled app/model assets; offline relaunch and unseen manual input work without inference APIs.                                         |
| BS-08 | Privacy and safety               | No message uploads/logs, automatic link visits, raw-message history, or sensitive lock-screen previews.                                 |
| BS-09 | Evidence and disclosure          | Actual device/version, model/policy revision, dataset provenance, real checks, build provenance, and major development tools.           |

Automatic monitoring is essential. Do not silently cut BS-02 or BS-03 to meet the timebox.
If Android blocks direct SMS capture, record the blocker and obtain the user's scope decision
before substituting SMS-notification capture and its different coverage.

## Exclusions and bounds

No full SMS/chat inbox reader, default SMS replacement, screenshot OCR, URL reputation service,
chatbot, cloud backend, accounts, auto-blocking/deleting/replying to messages, or Play Store release.
Only bounded recent alert summaries are retained. Full history and raw-message persistence are absent.
Initial chat support is one chosen, tested app; additional adapters are optional. Unsupported apps
must not appear protected. The same app can behave differently when previews/settings change.

Both languages are required, but broad accuracy remains an evaluation goal. Mixed Filipino/English
messages must be tested and disclosed separately if present; no implicit Taglish capability claim.
8 GB RAM is a device constraint, not proof of support for every Android model or OS.

## Stop-and-report conditions

Missing capture permissions, unreadable notification content, absent real model inference,
poor language evaluation, and missed deadlines are honest blockers. Do not replace evidence
with mocked warnings, relabeled spam scores, or screenshots of expected behavior.
