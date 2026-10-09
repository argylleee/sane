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
