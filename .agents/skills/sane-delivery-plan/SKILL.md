---
name: sane-delivery-plan
description: Run assigned Sane development work from allocation through submission using the Spec Kit loop, role scopes, and gate evidence. Use when starting, resuming, or coordinating a Sane build task; not for one-off repository maintenance.
---

# Sane delivery plan

This skill is the reusable execution process. Changing project decisions live in
[scope](../../../docs/planning/scope.md), [architecture](../../../docs/planning/architecture.md),
[tasks](../../../docs/planning/tasks.md), [decisions](../../../docs/planning/decisions.md), and
`coordination.json`. Read those for current direction; read this for how to act on it.
It activates no role, allocates no scope, and authorizes no merge, push, or deployment.

## Orient before writing

1. Activate your role once per chat using [role sessions](../../../docs/role-sessions.md):
   `role-integration`, `role-backend`, or `role-frontend`. Compaction keeps it; a new chat does not.
2. Obtain your coordinator receipt: task ID, allocation number, owner, branch, worktree path,
   base revision, allowed paths, write resources, and acceptance evidence. A `planned` registry
   entry is a proposed scope, not a receipt. Do not begin writing against one.
3. Confirm the registry entry matches your receipt and its dependencies are `integrated`.
   Run `npm run check:repo`, then create your worktree from the committed base in the receipt.
4. Read only your task's contracts: [contracts](../../../docs/sane/contracts.md) for the bridge
   and assessment shape, [model](../../../docs/sane/model.md) for label and export policy,
   [security](../../../docs/sane/security.md), [verification](../../../docs/sane/verification.md).
   Load your domain skill (`sane-android`, `sane-model`, `sane-experience`, `sane-architecture`,
   `sane-security`, `sane-release`) only for the phase you are in.

## Gate order

The sequence in [tasks](../../../docs/planning/tasks.md) is dependency-ordered, not a suggestion.
Each gate below must hold real evidence before the next one starts. Report a failed gate to
integration immediately; do not route around it or redefine it as passed.

| Gate | Holds when                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------- |
| G1   | An APK installs on the chosen phone and a real SMS and a real chat notification reach native code       |
| G2   | A trained classifier exports a schema-valid artifact and Java reproduces its decisions within tolerance |
| G3   | Manual scan runs end to end through the shared native analyzer on the device                            |
| G4   | Automatic SMS and chat arrivals warn correctly while the UI is backgrounded                             |
| G5   | Offline relaunch, both languages, permission states, and privacy bounds are checked on the device       |

G1 is the project's kill gate. [Scope](../../../docs/planning/scope.md) forbids silently cutting
BS-02 or BS-03 to meet the timebox: if direct SMS capture is blocked, record the blocker and
obtain the user's scope decision before substituting notification capture and its different coverage.
Preserve manual flow and independent work while that decision is pending.

## Spec Kit loop per task

Follow [spec-kit](../../../docs/spec-kit.md). Name your feature directory in the first request.
Reuse the populated planning contracts instead of recreating a competing planning authority.

1. `speckit-specify` — testable acceptance criteria for your bounded feature only. Map each
   criterion to its BS-xx requirement. Leave genuinely unknown facts explicit.
2. `speckit-plan` — smallest end-to-end slice using the stack pinned in architecture. Prove the
   riskiest boundary first. Define the interface before any parallel write depends on it.
3. `speckit-tasks` — dependency-ordered steps with acceptance evidence, referencing your allowed
   paths and allocation. Reserve time inside the task for integration and verification.
4. `speckit-implement` — only the steps your receipt assigns. Load `self-validate` for checks.
5. `speckit-converge` — assess the feature against its spec, plan, tasks, and verified behavior.
   Report gaps for the coordinator; do not expand the MVP or start another implementation loop.

Load `speckit-clarify`, `speckit-analyze`, or `speckit-checklist` only for a material ambiguity
or a risky change. `speckit-taskstoissues` writes to GitHub and needs explicit authorization.

## Stay inside scope

Workers own their allocated paths and their own task and handoff files. Integration owns shared
configuration, lockfiles, root scripts, planning summaries, contract versions, and registry state.
Propose changes outside your scope to integration rather than making them; a serialized shared
change or a narrowed allocation with a refreshed receipt is the correct path.

Before edits and before handoff, run your scope check with the receipt values:

```sh
npm run check:task -- --task TASK-101 --allocation 1 --registry /path/to/coordinator/coordination.json
npm run validate -- --task TASK-101 --allocation 1 --registry /path/to/coordinator/coordination.json
```

Format only changed owned files with `npm run format:files -- <paths>`. Whole-repo formatting is
coordinator-only. A contract change increments its version in `docs/sane/contracts.md` under
integration ownership and refreshes affected allocations; workers acknowledge before continuing.
Load `resolve-conflict` only when a real collision appears.

## Evidence and honesty

Every claim returns real observations: actual device and OS version, model and policy revision,
dataset provenance, measured timings, and the checks you ran. A passing build is not runtime
behavior. A granted permission is not working capture. A matching final label is not parity when
underlying scores disagree. Mark injected or synthetic evidence as such.

Never substitute mocked warnings, relabeled spam scores, screenshots of expected behavior, a
Figma animation, or a hardcoded demo result for a real check. Missing capture permissions,
unreadable notification content, absent real inference, poor language evaluation, and missed
deadlines are honest blockers to report, not failures to conceal.

## Timebox and handoff

Anchor backward from the organizer deadline in [guidelines](../../../docs/planning/guidelines.md),
not forward from a start time. Reserve a freeze and submission buffer. When time runs short, cut
optional scope with the coordinator and preserve security, data boundaries, and honest validation.
Do not redesign shared architecture in the final hours.

Write a handoff with [the template](../../../docs/templates/handoff.md) before compaction, tool
changes, or ending a session: file and revision references, decisions, dirty work, exact checks
run, and the next action. Exclude copied chats and secrets. On resume, verify checkout and
revision before trusting earlier results. Use `context-handoff` for the full procedure.
