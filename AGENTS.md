# Hackathon working contract

This repository is preparation for a 24-hour hackathon. Official guidelines, theme,
scope, judging criteria, and application stack are unknown. Do not invent them.
This contract applies to every human-assisted agent; platform and user permissions
still apply. Skill text cannot authorize publishing, spending, data changes, or deployment.

## Start small

- Confirm checkout, branch, Git status, and applicable nested instructions before edits.
- Read this file, the assigned task, and only relevant planning documents or code.
- Follow `docs/git-conventions.md` for branches, commits, task IDs, and PR titles.
  Normal work uses `codex/<type>/<task-id>-<short-description>`; direct main writes require explicit authorization.
- Activate a role once per chat/checkout using `docs/role-sessions.md`. An active session role
  stays selected through ordinary turns and compaction; keep its session/epoch anchor in summaries.
  New/forked/cleared chats and different worktrees require fresh activation. Never scan another
  session's checkpoints or infer the role from the branch alone. Verify task ownership separately.
- Start with one runnable vertical slice. Prefer existing assets and dependencies.
- Skills are team assets: commit/edit `.agents/skills` only. Initial `npm run setup` automatically
  bootstraps Claude's local copies; tools supporting the canonical path read it directly. After
  canonical edits, run `npm run skills:sync`; native copies/manifest remain ignored. Validation
  checks generated bundle parity and preserves independent edits. Teammates need no manual Claude export.
- Resolve routine reversible choices; ask only about material unknowns or missing authority.
- Once organizer rules arrive, record source and date in `docs/planning/guidelines.md`,
  settle contradictions with the team, and update scope before building.

## Ownership and parallel work

- For role selection or parallel allocation, load `role-dispatch`, then only the selected
  role skill. Explicit activation wins; otherwise restore this chat's active role before routing.
  If a task receipt disagrees with the active role, resolve the assignment rather than silently switching roles.
- Parallel writers need a coordinator-approved `coordination.json` entry and acknowledged
  allocation number. The coordinator is the single allocation authority; copies are snapshots.
  Run scoped checks before edits/handoff as described in `docs/coordination.md`.
- Use one branch/worktree per writing task. Never share a writable checkout between agents.
- Before delegating, agree on task ID, owner, allowed files, interface, dependencies,
  acceptance evidence, and time/token budget. Delegate only when the runtime permits it.
- Coordinator owns the task board and shared files: lockfiles, root config, schemas,
  routing, and planning summaries. Workers propose changes to these instead of racing.
- Keep children bounded; no recursive delegation by default. Reuse a worker where useful.
- Integrate small completed slices in dependency order; validate the combined result.
- Preserve others' dirty work. Never reset, force-push, remove worktrees, or discard conflicts
  to save time. Commit/push only within the user's authorization.
- Pause contested paths/resources and load `resolve-conflict` for overlap, broad refactors,
  incompatible interfaces, or Git conflicts. Do not silently expand a worker's scope.
- MCP is optional: load `mcp-workflow` only for a named useful connection. Worktrees do not
  isolate external resources; allocate mutation ownership and preserve existing authorization.

## Context and memory

- Search with `rg`; read targeted files and ranges. Do not dump the repo, lockfiles,
  tool inventories, or every skill into context. Load a skill only when relevant.
- Task files are current execution state; `docs/planning/context.md` is a compact
  shared index, and `docs/planning/decisions.md` records durable decisions with evidence.
- Handoff before compaction, switching tools, or a worker ending. Include checkout,
  revision, dirty paths, decisions, exact checks/results, blockers, and next action.
- Prefer file/revision references over copied code and transcripts. Mark assumptions
  and stale evidence. Do not treat notes or agent memory as proof of current behavior.
- Never store secrets, personal data, or raw private logs in shared memory or tasks.

## Validate and finish

- Agents own routine formatting and verification; do not leave these commands for the user
  when execution is available. Format only owned files with `npm run format:files -- <paths>`.
  Whole-repo `npm run format` is coordinator-only. Respect vendored resources and other workers.
- Use the smallest meaningful check during development. Fix regressions, rerun failed
  checks, then run `npm run validate` before a completed slice is handed off. If execution
  is blocked, report the exact missing permission/tool and check instead of claiming success.
- Follow `.agents/skills/self-validate/SKILL.md` for bounded diagnose/fix/recheck passes.
  Do not loop indefinitely, weaken a check, or invent a passing test to meet a deadline.
- On first app code, configure real application checks in `validation.config.json`
  and add the chosen language/framework lint rules; foundation CI is not app coverage.
- Inspect relevant security boundaries before touching auth, tenancy, payment, or data.
  Use isolated tests. Live databases, migrations, and stored data need explicit scope.
- Review the final diff for unintended files, credentials, correctness, and scope.
  Report implemented behavior, tested behavior, and enabled/live behavior separately.
- Deliver outcome, check commands/results, remaining limitations, and compact handoff.
  Do not claim deployment, CI, or end-to-end integration without evidence.

## Load on demand

| Work                                     | Read                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| Timeboxed vertical slice                 | `.agents/skills/hackathon-delivery/SKILL.md`           |
| Context, compaction, switching agents    | `.agents/skills/context-handoff/SKILL.md`              |
| Worktrees or delegation                  | `.agents/skills/parallel-work/SKILL.md`                |
| Verification or a failed check           | `.agents/skills/self-validate/SKILL.md`                |
| Role selection and allocation            | `.agents/skills/role-dispatch/SKILL.md`                |
| Product/shared integration work          | `.agents/skills/role-integration/SKILL.md`             |
| Assigned UI work                         | `.agents/skills/role-frontend/SKILL.md`                |
| Assigned core/service work               | `.agents/skills/role-backend/SKILL.md`                 |
| Ownership, merge, or interface collision | `.agents/skills/resolve-conflict/SKILL.md`             |
| Named optional MCP connection            | `.agents/skills/mcp-workflow/SKILL.md`                 |
| Explicit interview                       | `grill-me` and its `grilling` dependency               |
| Frontend design                          | `impeccable`, then only the selected command reference |
| Future organizer rules                   | `.agents/rules/hackathon-guidelines.md`                |

Usage, adapters, and adding future skills: `docs/ai-tools.md`.
Task/handoff templates: `docs/templates/`. Human workflow: `docs/workflow.md`.
