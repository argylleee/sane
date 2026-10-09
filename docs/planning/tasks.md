# Proposed implementation sequence

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
