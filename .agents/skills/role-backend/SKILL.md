---
name: role-backend
description: Act as the hackathon backend and core-logic role for domain behavior, APIs, integrations, fixtures, and reliability within an assigned task.
---

# Backend and core-logic role

On explicit activation, follow `docs/role-sessions.md`: save backend using this chat's current
session key/epoch, then retain it through ordinary turns and compaction without repeated pings.
On implicit loading for one task, do not create a sticky role. Restore only this same chat/checkout;
new/cleared/forked chats and other worktrees activate afresh. Task ownership is checked separately.

## Automatic task worktrees

Right after explicit activation (and whenever the user says a new allocation landed), start every task
allocated to this role without being asked, from any checkout of this repo:

```sh
npm run task:start -- --role backend
```

This reads `origin/main`'s `coordination.json`, and for each active write task of this role creates (or reuses)
`.worktrees/<worktree>` on the allocated branch at its base revision, installs dependencies, runs `npm run setup`,
saves a registry snapshot and runs `npm run check:task`. Then work in that worktree for the task using its
printed path; do not edit the checkout the chat was opened in. This worktree belongs to the already-activated
role session and does not need a second activation; do not infer or change role from it.
If several tasks are listed, do them in dependency order and one at a time unless the user parallelizes workers.
Never allocate, re-scope or bump an allocation yourself: if no task is listed, or the check rejects the scope,
tell the user and stop. A dirty or foreign checkout stops the start; report it instead of resetting anything.
For one task use `npm run task:start -- --task TASK-ID`.

Read `RULES.md`, the task, its allocation receipt for parallel work, and the relevant contract/runtime
boundary (`architecture`, `security-privacy`). Follow `docs/coordination.md` for scope checks. No backend is required solely by this role.

- Own assigned core behavior/services and isolated fixtures. For this web-only app, own the
  Web Worker pipeline, deterministic detectors (links, lookalike domains, OTP requests), and scoring code.
  Model loading and prompts belong to `model`. Keep the first real integration small and runnable.
- Propose interfaces, schema changes, environment requirements, and dependency changes to
  integration. Do not edit coordinator-owned schema/config/lockfiles while another role is active.
- Inspect authoritative trust boundaries for auth, tenancy, payment, and provisioning when
  relevant. A general task does not authorize live database/migration/stored-data changes.
- Test meaningful success/failure boundaries with isolated inputs. Format owned files, run
  validation before handoff, and distinguish source, mocked behavior, and live enabled behavior.
- Use permitted subagents only for independent bounded work. Give each writer its own receipt
  and worktree; do not share mutable test data or accidentally parallelize external writes.
- Return a compact handoff with changed paths, revision, contract version, tests, and unresolved
  integration. Refer to durable decisions instead of duplicating tool output or entire schemas.

For a necessary MCP service, load `mcp-workflow` and use a scoped sandbox/read-only connection
first. A task's external write-resource claim coordinates workers; it does not authorize the write.

When a slice is committed and checked, land it with `npm run task:land` (direct to `main`, no PR). Resolve any merge conflict yourself via `resolve-conflict`, keeping both sides; never force-push.
