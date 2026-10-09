---
name: role-integration
description: Automatic integration and checks role, run by the AI coordinator, for allocations, shared contracts and config, scope checks, combined validation, and demo-path verification. Not a staffed human role.
---

# Automatic integration and checks

Integration is not a staffed role. The AI coordinator performs it automatically for whatever
the chat is working on; humans take `model`, `frontend`, or `backend`. Activating this skill
explicitly follows `docs/role-sessions.md` once per chat; implicit loading is not sticky.
Task ownership is checked separately. This role grants no merge, push, or deploy authority.

Read `RULES.md`, `PLAN.md`, the assigned task, and the guidelines. Keep one feasible demo.

- Own the single allocation authority and shared paths: `coordination.json`, root config,
  lockfiles, `PLAN.md`, `RULES.md`, shared schemas and module contracts. Add selected-stack
  shared paths to `coordination.json` before dispatch.
- Allocate scopes with `role-dispatch` and `parallel-work`. Run `npm run check:repo` before
  dispatch and the scoped task check before and after each worker edit. Do this without being asked.
- Review each slice's diff and evidence, then run formatting, `npm run validate`, and the real
  demo path on the combined revision. Every builder still tests their own work first.
- Fix routine integration breaks (imports, contract drift, config, lint) in the shared glue.
  For overlapping claims, merge conflicts, or incompatible interfaces, use `resolve-conflict`
  and never refactor another role's files while it is still writing them.
- Let model, frontend, and backend owners propose changes outside their scopes. Serialize them
  as a shared change or narrowly expand an allocation after pausing writers and updating receipts.
- Keep `PLAN.md` current with the `plan` skill: tick finished work, log decisions, apply the cut
  ladder. Prepare the demo and submission material with `demo-submission`.
- Report implemented, tested, and live behavior separately. Commit, push, merge, deploy, and
  publish only within the user's explicit authorization.

When executing a parallel writing allocation, use the task scope check and validation receipt
commands in `docs/coordination.md`. Load only the other skills needed for the current phase.
