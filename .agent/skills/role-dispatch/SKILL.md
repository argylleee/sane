---
name: role-dispatch
description: Route a hackathon task to one role and coordinate bounded parallel allocations when roles, worktrees, or subagents need assignment.
---

# Route and allocate work

Use `docs/coordination.md` for the registry schema and agent command examples. Do not assign
named teammates or spawn all three roles merely because three roles exist.

1. Honor explicit activation, then this chat's active role using `docs/role-sessions.md`.
   A conflicting task receipt needs assignment reconciliation, not automatic role replacement.
   When there is no active role, use the assigned task's registry role; if absent,
   choose integration for scope/shared contracts/refactors, frontend for the user interface,
   or backend for domain logic/services. If a task crosses ownership, split it at a stable seam
   under integration coordination. Do not silently change an existing allocation.
   A role chosen for one task is not sticky activation unless the user or explicit delegation packet activates it.
2. Read only that role's SKILL.md and the task. For parallel writes, the coordinator prepares
   a single authoritative `coordination.json` allocation with ID, owner, role, allowed paths,
   write-resource keys, dependencies, branch, worktree slot, base revision, and allocation number.
   Increment that task's allocation when its scope/owner/base changes; obtain the worker's acknowledgement.
3. Run the repository registry check before dispatch. An active task's prerequisites must
   already be integrated. Disjoint files do not imply disjoint API/schema/MCP write resources.
4. Delegate only through available, permitted host tools. Use a separate writing worktree per task,
   its committed base, and a small packet: task/role references, receipt, interface version,
   allowed paths/resources, acceptance evidence, and time/token budget if measurable.
5. Require the worker to check its receipt and current scope before edits and before handoff.
   Read-only review/research may use a shared checkout but cannot write task reports there;
   return a compact result for the coordinator to persist. No recursive fan-out by default.
6. Reuse workers and wait for milestones. Integrate one completed slice at a time, validate
   combined behavior, then release its claim. Blocked/ready work retains ownership until explicitly released.

For a small serial maintenance task, the user's narrow scope can suffice without parallel allocation
paperwork. For cross-machine agents, one designated coordinator serializes allocations; independent
registry copies are snapshots, not distributed locks. If freshness cannot be confirmed, continue
read-only/independent work and defer contested writes. Load `resolve-conflict` only when needed.
