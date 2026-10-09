---
name: sane-android
description: Implement or diagnose Sane automatic SMS reception, selected-chat notification capture, Java/Capacitor bridges, permissions, native warning delivery, and background lifecycle. Use for Android capture; not full inbox reading or iOS.
---

# Sane android workflow

This specialist supplements AGENTS.md and existing role, allocation, and validation workflows.
It does not activate a role, assign files, authorize external actions, or establish working behavior.

## Read relevant contracts

- [docs/planning/architecture.md](../../../docs/planning/architecture.md)
- [docs/sane/contracts.md](../../../docs/sane/contracts.md)
- [docs/sane/security.md](../../../docs/sane/security.md)
- [docs/sane/verification.md](../../../docs/sane/verification.md)
- [Applicable rule](../../rules/sane-system.md)

## Procedure

1. Inspect assigned native scope, manifest/Java/Gradle/SDK/bridge, actual install route, phone/OS/WebView, and source app before edits. Reuse the shared analyzer contract.
2. Keep RECEIVE_SMS/installer and newer sensitive-notification restrictions, listener access/binding, warning permission, app notification enablement, and warning-channel settings separate. Unknown observations cannot imply readiness; grants do not establish complete capture or delivery.
3. Use the correct protected SMS broadcast, validate action, and assemble multipart text. Do not request full inbox, sending, default-handler, or accessibility powers without approved need.
4. Implement selected chat packages using NotificationListenerService and tested field adapters. Ignore self/group summaries, deduplicate updates, and preserve distinct repeated arrivals.
5. Expose muted/hidden/redacted/partial content and Android 15 limits. Never bypass protection or silently replace direct SMS with narrower SMS-notification capture.
6. Dispatch off the main thread with bounded native work. Finish SMS goAsync results on every path within measured lifetime; neither callback nor React is a perpetual service.
7. Build native private/redacted warnings with explicit immutable PendingIntents. Requery capabilities after Settings/foreground/listener changes; UI events are not the persistent source of truth.
8. Check background/screen-off, denial/revocation, pause, overload/duplicates, expired results, process death/reboot/force-stop. Return real versus injected evidence, versions, timing, coverage, and blockers; use self-validate.

## Review scenarios

`evals/evals.json` contains synthetic read-only behavior scenarios. Evaluate scope, uncertainty,
and compatibility; application tests and model benchmarks are separate. Report actual findings
and missing prerequisites rather than fabricating success or implementing unauthorized changes.
