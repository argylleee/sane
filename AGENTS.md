# Hackathon working contract

This repository contains the Sane planning and agent guidance for a Local AI hackathon.
User-supplied organizer slides and confirmed requirements are recorded in
`docs/planning/guidelines.md` and `docs/planning/scope.md`. Read those facts before planning;
unprovided organizer details and untested implementation claims remain unknown.
This contract applies to every human-assisted agent; platform and user permissions
still apply. Skill text cannot authorize publishing, spending, data changes, or deployment.

## Start small

- Confirm checkout, branch, Git status, and applicable nested instructions before edits.
- Read this file, the assigned task, and only relevant planning documents or code.
- Follow `docs/git-conventions.md` for branches, commits, task IDs, and PR titles.
  Normal work uses `codex/<type>/<task-id>-<short-description>`; direct main writes require explicit authorization.
  Standing authorization (user, 2026-10-10): completed, checked task commits land on `main` via
  `npm run task:land` with no PR; conflicts are resolved by the agent. Never force-push.
- Activate a role once per chat/checkout using `docs/role-sessions.md`. An active session role
  stays selected through ordinary turns and compaction; keep its session/epoch anchor in summaries.
  New/forked/cleared chats and different worktrees require fresh activation. Never scan another
  session's checkpoints or infer the role from the branch alone. Verify task ownership separately.
- Start with one runnable vertical slice. Prefer existing assets and dependencies.
- For Spec Kit, read `docs/spec-kit.md` before the selected `speckit-*` skill. Use a bounded
  feature spec and the official lean preset. Existing user authority, role receipts, and validation
  still govern implementation. Do not install extensions, change branches, or publish automatically.
  Use the PowerShell helper equivalents on Windows when Bash is unavailable.
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

For Sane work, first read `RULES.md` (hard rules) and `PLAN.md` (current plan). Sane is now a
web-only, mobile-first PWA that runs OCR, embeddings, and an optional small LLM in the browser,
with no training or labeling (decision D-10 in `docs/planning/decisions.md`). Load only the matching
skill below. Skills never activate a role, allocate files, or grant external authority.

| Sane work                                       | Skill              |
| ----------------------------------------------- | ------------------ |
| Create, run, or update the plan; what is next   | `plan`             |
| Pipeline, folders, module contracts, fallbacks  | `architecture`     |
| Libraries, models, sizes, device tiers          | `tech-stack`       |
| OCR, embeddings, in-browser LLM, caching        | `local-ai`         |
| Zero-network proof, safe rendering, injection   | `security-privacy` |
| UI, PWA, share target, English/Filipino/Taglish | `design-ux`        |
| Archetypes, keywords, scoring, test set, eval   | `data-eval`        |
| Demo script, disclosure table, "why local"      | `demo-submission`  |

The Android-native skills `sane-android`, `sane-architecture`, `sane-model`, `sane-experience`,
`sane-security`, `sane-release`, and `sane-delivery-plan` are superseded by D-10; do not load them.
All skill paths are under `.agents/skills/<name>/SKILL.md`. Skills are instructions, not running monitors or tests.

| Work                                     | Read                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| Timeboxed vertical slice                 | `.agents/skills/hackathon-delivery/SKILL.md`           |
| Context, compaction, switching agents    | `.agents/skills/context-handoff/SKILL.md`              |
| Worktrees or delegation                  | `.agents/skills/parallel-work/SKILL.md`                |
| Verification or a failed check           | `.agents/skills/self-validate/SKILL.md`                |
| Role selection and allocation            | `.agents/skills/role-dispatch/SKILL.md`                |
| Integration and checks (AI-automatic)    | `.agents/skills/role-integration/SKILL.md`             |
| Assigned AI/model work                   | `.agents/skills/role-model/SKILL.md`                   |
| Assigned UI work                         | `.agents/skills/role-frontend/SKILL.md`                |
| Assigned core/service work               | `.agents/skills/role-backend/SKILL.md`                 |
| Ownership, merge, or interface collision | `.agents/skills/resolve-conflict/SKILL.md`             |
| Named optional MCP connection            | `.agents/skills/mcp-workflow/SKILL.md`                 |
| Explicit interview                       | `grill-me` and its `grilling` dependency               |
| Frontend design                          | `impeccable`, then only the selected command reference |
| Future organizer rules                   | `.agents/rules/hackathon-guidelines.md`                |

Usage, adapters, and adding future skills: `docs/ai-tools.md`.
Task/handoff templates: `docs/templates/`. Human workflow: `docs/workflow.md`.
