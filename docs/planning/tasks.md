# Proposed implementation sequence

> **Superseded (D-10, October 9, 2026):** the Android-native, Filipino+English, trained-classifier approach below was replaced by the web-only kit in `RULES.md` and `PLAN.md`. Kept for history; do not build from it.

Status: planned, not allocated or active. No named owners or writing receipts exist in
`coordination.json`. Integration must allocate real scopes/worktrees before parallel writers start.
The current task creates documentation/skills only; it does not implement these tasks.

| Task     | Proposed owner role                           | Outcome                                                                                 | Dependencies                                   |
| -------- | --------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| TASK-101 | Integration/native developer                  | Reproducible APK/toolchain, chosen phone/OS/app, real SMS and chat capture feasibility  | None                                           |
| TASK-102 | Backend/model developer                       | Label policy, bilingual data splits, initial trained classifier/export, evaluation plan | Stable model contract                          |
| TASK-103 | Frontend developer                            | Approved Figma flow and React manual/monitoring/results states with explicit mocks      | Stable contracts/design; parallel with 101/102 |
| TASK-104 | Backend/native developer                      | Shared native analyzer, export parity, background warnings and capability lifecycle     | 101 and 102 integrated                         |
| TASK-105 | Integration                                   | Connect UI bridge, source controls, native state, summaries and safety errors           | 103 and 104 integrated                         |
| TASK-106 | Integration with assigned verification scopes | Real device, offline, bilingual, security, accessibility, demo and disclosures          | 105 integrated                                 |

## Timebox and shared ownership

Hours 0-2: capture/APK feasibility; 2-5: local classifier and shared analyzer; 5-9: integrated flows;
9-12: fixes and held-out/device checks; 12-14: rehearsal; 14-15: freeze/submission buffer.
This is an estimated 15 elapsed hours, not a start timestamp or 15 person-hours. Anchor work
backward from the organizer deadline and reduce optional screens/adapters before required flows.

One developer focuses native capture; one data/model; one UX/frontend. Roles are workflow assignments,
not automatic activation. Integration serializes shared Gradle/manifest/package/lockfile/schema changes;
assign exact feature paths and semantic resources before writing. A role may span people/timeboxes
only through refreshed receipts. No branch, worktree, or external Figma mutation is allocated here.

At Hour 2, native capture failure is a core blocker. Preserve manual flow and independent work,
but do not declare success or remove automatic detection. Resolve permission/device/source options
with concrete evidence. Sources and classifiers must be real before the final demo.

## Proposed writing scopes

Not yet allocated. `coordination.json` remains empty by design: the integration lead creates each
entry with a real owner ID, branch, worktree path, and full base revision, and obtains the worker's
acknowledgement before any status becomes `active`. The scopes below are a collision-free starting
layout, not a receipt. Paths under `android/` are provisional until TASK-101 scaffolds the project.

| Task     | Role        | Proposed paths                                             | Write resources                                            | Depends on |
| -------- | ----------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------- |
| TASK-101 | integration | `android/`, `capacitor.config.ts`, `specs/native-capture/` | `schema:android-manifest`, `interface:capacitor-bridge-v1` | none       |
| TASK-102 | backend     | `model/`, `specs/local-classifier/`                        | `interface:model-artifact-v1`                              | none       |
| TASK-103 | frontend    | `app/`, `specs/scan-experience/`                           | none                                                       | none       |
| TASK-104 | backend     | shared analyzer package, `specs/shared-analyzer/`          | `interface:analyzer-v1`                                    | 101, 102   |
| TASK-105 | integration | bridge glue, `specs/monitoring-integration/`               | `interface:bridge-surface-v1`                              | 103, 104   |
| TASK-106 | integration | `docs/sane/verification.md`, `specs/release-verification/` | `external:submission:appbuildersph-2026`                   | 105        |

Each worker also owns `docs/tasks/TASK-1xx.md` and its handoff. TASK-101, TASK-102, and TASK-103
are independent and can hold scopes simultaneously. TASK-104 writes inside the native project
TASK-101 created, so TASK-101 must reach `integrated` and release its claim first; integration
narrows TASK-101 and issues TASK-104 its own receipt rather than letting both hold `android/`.
Add the selected stack's shared configuration and lockfile paths to `sharedPaths` at that point.
