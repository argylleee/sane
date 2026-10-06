---
name: parallel-work
description: Split independent hackathon work into bounded subagent tasks and isolated Git worktrees with explicit ownership and integration evidence.
---

# Coordinate parallel work

Read `docs/workflow.md` for the worktree commands. Delegate only when the runtime and user scope
allow it. Use supported managed worktrees when available; otherwise ordinary Git worktrees work.
For role allocation, use `role-dispatch` and the receipt protocol in `docs/coordination.md`.

1. Define the dependency graph and stable interfaces before concurrent implementation. Delegate
   independent slices or a bounded review/research question; keep tightly coupled edits together.
2. Set owner, allowed paths, base revision, acceptance checks, deadline, and budget in each task.
   Send the minimum file references and constraints, not the full parent conversation or repository.
   Coordinator records file and interface/external write-resource claims in `coordination.json`
   and checks overlap before dispatch. Workers acknowledge the allocation number and verify scope.
3. Begin with two useful workers; add more only when independence and capacity justify the cost.
   Reserve integration/review capacity. No recursive fan-out by default; cancel redundant work.
4. Allocate a separate branch/worktree for each writer. Never change another worker's files.
   Lockfiles, shared config, routing, schemas, and shared planning documents belong to the coordinator.
5. Give each worktree its own dependencies, .env, port, and local fixtures. Do not share writable
   databases or live service credentials just because Git files are isolated.
6. Workers return a compact result: revision or dirty diff, changed paths, check commands/results,
   interface changes, risks, and next action. Use `context-handoff` when switching or stopping.
7. Coordinator reviews and integrates one slice at a time in dependency order. Resolve conflicts
   deliberately and run validation on the integrated revision plus the real demo path.
   Use `resolve-conflict` for collisions; release claims only after verified integration or an
   explicit acknowledged reallocation. Blocked/ready writers still hold their scopes.

Do not duplicate worker investigations or poll unchanged status. Wait for milestone updates while
doing independent work. A worker success message is evidence to verify, not automatic merge authority.
Retain worktrees with dirty/unpushed work. Cleanup needs authorized, verified targets and recoverable state.
