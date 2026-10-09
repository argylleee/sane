# Sane decisions

Recorded October 9, 2026. These decisions distinguish confirmed user scope from architecture
recommendations carried into the requested guidance bundle. No application verification has run.

| ID   | Decision                                                                        | Basis and status                                                                                                                 |
| ---- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Manual plus automatic SMS/selected-chat detection are core                      | User correction and explicit selected-source answer; supersedes deferred monitoring in attached proposal                         |
| D-02 | Filipino and English; 3 developers; about 15 hours; 8 GB phone                  | Explicit user answers; phone/OS, named chat apps, dataset, and exact start time unresolved                                       |
| D-03 | React/Vite + Capacitor APK, Java native capture/shared inference                | Architecture explanation followed by request to create aligned skills/rules; direction to implement and verify, no runtime proof |
| D-04 | Supervised TF-IDF/logistic baseline plus contextual rules                       | Feasibility recommendation for a small native classifier; data quality, language performance, and superiority unproven           |
| D-05 | Assets bundled; offline relaunch included                                       | Product quality target stronger than warm offline inference; not an explicit cold-launch organizer mandate                       |
| D-06 | Direct SMS + notification listener; no unapproved SMS-notification substitution | Preserves requested automatic flows while disclosing restricted permissions and notification coverage                            |
| D-07 | No raw-message history or cloud backend; bounded minimal summaries              | Privacy/scope architecture; no existing database or stored data modified by this bundle                                          |
| D-08 | Figma prompt in chat only                                                       | Explicit user instruction; no prompt text file committed                                                                         |

For a future change, record trigger, alternatives, evidence, ownership, revised contract version,
and consequences for scope/security/device/demo. No model upgrade, frontend mock, or schedule
pressure silently changes D-01/D-02. Organizer additions go in guidelines with source/date first.

| D-10 | Pivot to a web-only, mobile-first PWA: in-browser OCR, embeddings, optional small LLM; no training, fine-tuning, or labeling; English, Filipino, Taglish; Philippine focus; paste/screenshot/share input, no automatic SMS or chat monitoring | User supplied the sane-kit (`RULES.md`, `PLAN.md`, eight skills) and asked to update the repo. Supersedes D-01 to D-07 and D-09 and the Android-native requirements BS-02, BS-03, BS-04 as written. TASK-101 (`.worktrees/task-101`) and TASK-101 to TASK-106 in `docs/planning/tasks.md` are obsolete; not removed. No runtime proof yet |
| D-11 | Roles: `model`, `frontend`, `backend` are staffed; `integration` is run automatically by the AI coordinator (allocation, scope checks, validation, demo path) | User request. `integration` stays the registry role for shared files; merge, push, and deploy still need explicit user authorization |
| D-09 | Real Android phone only for TASK-101 testing (SMS and WhatsApp both); no emulator, no Android Studio IDE, SDK command-line tools only | User chose lowest-setup path over an emulator; WhatsApp needs real account verification an emulator cannot complete; SMS tested by sending from a second phone/teammate; avoids the unverified Android 15 notification-redaction risk if a lower-OS phone is available; no runtime proof yet |
