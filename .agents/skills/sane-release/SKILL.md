---
name: sane-release
description: Verify Sane APK/device readiness, automatic SMS/chat sources, local AI contribution, bilingual evaluation, offline relaunch, privacy/accessibility, demo provenance, and hackathon submission evidence. Use with self-validate; tooling/Figma are not device proof.
---

# Sane release workflow

This specialist supplements AGENTS.md and existing role, allocation, and validation workflows.
It does not activate a role, assign files, authorize external actions, or establish working behavior.

## Read relevant contracts

- [docs/sane/verification.md](../../../docs/sane/verification.md)
- [docs/planning/guidelines.md](../../../docs/planning/guidelines.md)
- [docs/planning/demo.md](../../../docs/planning/demo.md)
- [docs/planning/tasks.md](../../../docs/planning/tasks.md)
- [Applicable rule](../../rules/hackathon-guidelines.md)

## Procedure

1. Read actual build/model/policy evidence and supplied organizer rules. Confirm phone/OS/apps/settings, deadline timezone/format, and toolchain; unknown facts remain unknown.
2. Use self-validate bounded repair passes. Configure meaningful app lint/typecheck/tests/build before app code; foundation-only validation does not cover native monitoring or model quality.
3. Verify unseen manual Filipino/English, real background SMS and selected-chat arrivals, local classifier execution, warning delivery, and permission/coverage errors on hardware.
4. Test offline relaunch/new inference; retain cellular service with Wi-Fi/data off for SMS. Chat delivery connectivity differs from inference connectivity.
5. Check export parity, untouched bilingual evaluation and rules/model contribution, privacy/log/bridge/storage boundaries, APK TalkBack/Back/insets/large text/themes, and cold/warm/arrival latency.
6. Record build provenance and actual model/data/API/framework/AI-tool disclosures. Explain local benefit; do not invent an APK mandate, model family requirement, or pitch length.
7. Prepare concise live sequence and labeled synthetic backup, freeze before confirmed deadline, and preserve submission buffer. Report required cases pass/fail/not-run with exact evidence.
8. Automatic failure remains a core blocker; no silent scope cut, mocked success, universal protection, production accuracy, store approval, or unsupported CI claim. Publishing/submission uses only current explicit destination/action authority.

## Review scenarios

`evals/evals.json` contains synthetic read-only behavior scenarios. Evaluate scope, uncertainty,
and compatibility; application tests and model benchmarks are separate. Report actual findings
and missing prerequisites rather than fabricating success or implementing unauthorized changes.
