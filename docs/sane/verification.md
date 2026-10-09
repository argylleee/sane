# Verification and acceptance evidence

Status: planned checks; every application case is Not run. The current bundle has no Android
source, model, APK, phone session, or native inference evidence. Use existing `self-validate`
for bounded repair passes; do not weaken requirements to achieve green.

## Required implementation checks

Before first app code, integration configures real lint/typecheck/test/build commands in
`validation.config.json` and package scripts, with their actual prerequisites and safe side effects.
Preserve existing foundation checks. Proposed areas: frontend TypeScript/ESLint/component behavior,
native Gradle compile/lint/unit tests, Python preprocessing/export/evaluation checks, and device tests.
Do not register echo/no-op scripts or claim Gradle compilation proves monitoring.

Use the selected package manager/lockfiles and documented JDK/SDK/Python environment. Run owned-file
formatting, narrow relevant checks, then `npm run validate` with receipt arguments where applicable.
Record exact commands, revisions, actual outcomes, and environment gaps. App checks remain
unconfigured until they can execute meaningfully; a selected architecture is not an executable stack.

## Acceptance matrix

| ID   | Check                                                                              | Required observation                                                                                                |
| ---- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| V-01 | Unseen manual English and Filipino text                                            | Actual local classifier executes; correct evidence provenance and cautious outputs                                  |
| V-02 | Real SMS with UI backgrounded and screen off                                       | Capture, multipart reconstruction, local analysis, warning; measured arrival-to-alert latency                       |
| V-03 | Real selected-chat notification with UI backgrounded                               | Readable new message extracted and analyzed; duplicates/summaries/self alerts ignored                               |
| V-04 | Preview hidden, redacted, oversized, unsupported format                            | Coverage/error state; never silent low result or fake success                                                       |
| V-05 | Offline cold relaunch after installation                                           | Bundled app/model initializes and analyzes unseen input; no inference API calls                                     |
| V-06 | Cellular SMS with internet data/Wi-Fi off                                          | Real arrival and local analysis, keeping cellular service enabled                                                   |
| V-07 | Permission denial/revocation, unknown state, app/channel blocking, settings return | Manual mode remains usable; separate SMS/chat/model/delivery statuses refresh, including channel importance         |
| V-08 | Pause, resume, reboot, process death, force stop                                   | Actual behavior documented; no universal protection claim or stale active indicator                                 |
| V-09 | Alert tap with missing/expired summary                                             | Clear expired state; no crash or fabricated original message                                                        |
| V-10 | Burst/repeated/identical distinct arrivals                                         | Bounded work; no alert loop, wrong deduplication, or silent overload                                                |
| V-11 | Corrupt/missing/incompatible model and engine exception                            | Engine not ready; unassessable output; no successful AI label                                                       |
| V-12 | Python/Java export parity                                                          | Feature/score/decision agreement within documented tolerance for both languages and edge cases                      |
| V-13 | Held-out detection and ablation                                                    | Per-language confusion counts, false alerts, misses, unassessable rate; rules/model/combined contribution           |
| V-14 | Privacy/bridge/log/storage/network                                                 | No raw message leakage, script execution, automatic URL visits, privileged untrusted navigation, or backup exposure |
| V-15 | APK usability and accessibility                                                    | Manual/setup/automatic-detail flows, TalkBack, Back/insets, dark theme, large text, contrast, Filipino/English copy |

Simulated events/unit fixtures validate logic only. V-02/V-03 require real device/source evidence;
an emulator, injected notification, Figma animation, or hardcoded result is explicitly labeled.
Chat delivery needs connectivity; offline inference proof does not require chat arrival offline.
Airplane mode is not the real-SMS test because it disables cellular reception unless separately configured.

## Evidence record and release gate

For each result record build/revision, model/policy checksum/version, phone/OS/WebView, source app/version,
permissions/settings, language/coverage, steps, expected/actual, pass/fail, latency, and known limits.
Use synthetic messages and sanitized aggregate logs; keep screenshots/private device output out of Git
unless explicitly requested for an appropriate destination.

Before calling the MVP complete, exercise all required flows, the local model, offline relaunch,
privacy controls, both languages, and warning delivery on the chosen phone. Document open defects,
then ask for any material scope decision rather than quietly removing automatic monitoring.
No target numerical accuracy/latency has been accepted yet; integration sets targets on development
evidence before final tests. Measure cold/warm inference and real arrival-to-warning separately.
TASK-101 checks newer sensitive-notification/OTP-SMS restrictions against its actual Android
version and install route; Android 15 redaction is not assumed to be the latest coverage boundary.

Submission evidence includes a build-provenance summary, actual model/data/framework/API/tool disclosures
(including AI development tools actually used), explanation of local benefit, and organizer artifact
requirements once known. Never claim deployed, Play-approved, CI-green, or production-accurate from local checks.
