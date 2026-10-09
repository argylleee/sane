# Development workflow

These are team defaults, not organizer requirements. Record official constraints in
`docs/planning/guidelines.md` when published. Avoid pre-event development if the rules prohibit it.

## A suggested 24-hour rhythm

| Elapsed time | Focus                                                                       |
| ------------ | --------------------------------------------------------------------------- |
| 0-2 hours    | Read rules, choose one demo outcome, select stack, prove the risky boundary |
| 2-14 hours   | Deliver small end-to-end slices; integrate frequently                       |
| 14-18 hours  | Complete must-have integration and realistic acceptance paths               |
| 18-22 hours  | Freeze optional scope, verify failures/mobile, rehearse the demo            |
| 22-24 hours  | Submission preparation, final validation, buffer for surprises              |

Adjust this after actual judging criteria and submission timing are known. Reserve verification
and integration time inside each task rather than leaving all checks until the final hour.

For Sane, the user confirmed approximately 15 actual build hours. Use
[the Sane task sequence](planning/tasks.md) and [supplied organizer evidence](planning/guidelines.md)
instead of treating the generic 24-hour rhythm as the project's available time or deadline.

Use [the installed Spec Kit lean workflow](spec-kit.md) for bounded feature specs and plans.
The existing role allocations and validation rules still govern execution; no additional CLI
installation is required for the normal chat skills.

## Tasks and memory

Use the [task template](templates/task.md) for nontrivial work. Copy it into
`docs/tasks/TASK-001.md`; each worker updates its own task and optional handoff.
The coordinator owns `docs/planning/tasks.md`, `context.md`, and `decisions.md`.
Choose either GitHub issues or local task files as the task authority; do not maintain two
full boards. The planning board can link to the chosen source.

Set one acceptance outcome, owner, allowed files, dependencies, interface, timebox, and
verification command. Token budgets are optional and measured only when the host exposes usage.
Start with two workers and expand only when independent tasks justify it. No fixed fan-out.

Use the [handoff template](templates/handoff.md) before compaction/tool changes. Keep file/revision
references, decisions, dirty work, exact checks, and next action; exclude copied chats and secrets.
On resume, verify checkout and revision before trusting old results.

## Worktrees

For role-based parallel execution, follow [coordination](coordination.md) first: one coordinator
allocates tasks, scopes, interface/external-resource keys, and acknowledgement receipts. Worktrees
isolate checkouts; they do not automatically allocate roles or isolate external data/services.

After the foundation is committed through an authorized workflow, choose a **real committed
integration ref**. `main` below is an example only; check that it contains the setup first:

```sh
git status --short --branch
git worktree list
git log -1 --oneline main
git worktree add .worktrees/TASK-001 -b codex/feat/task-001-demo-screen main
```

Open `.worktrees/TASK-001` as that worker's workspace. In it, run:

```sh
npm ci --ignore-scripts
npm run setup
```

Worktrees contain committed files only; uncommitted scaffold files do not automatically appear.
Use one writer per branch/worktree, separate dependency installs, local `.env`, ports, and isolated
fixtures. Nested `.worktrees/` is ignored. Avoid linking node_modules or sharing mutable databases.
Managed worktrees supplied by a host are also suitable; follow that host's lifecycle tools.

Workers own their assigned paths. The coordinator edits shared dependencies/lockfiles/config,
schemas, route registration, and planning summaries. Integrate small changes in dependency order
using the authorized PR/merge or commit workflow. Revalidate on the combined revision.
This scaffold does not authorize merging, pushing, deployment, or deleting other workers' state.

Retain dirty/unpushed worktrees. Remove a worktree only after verifying its exact path, ownership,
clean status, and recoverable commits, and obtaining any needed deletion authority. Never use
`--force` as routine cleanup.

## Validation and hooks

During edits, run a narrow relevant check. At completion, run:

```sh
npm run validate
```

The command stops at the first failing stage: repository checks, formatting, lint, tooling tests,
then configured app scripts. Each stage has a five-minute timeout; CI has a ten-minute job timeout.
Extend only when a real stack needs more time. The validator does not rewrite files or retry.
The `self-validate` skill governs human/agent diagnosis and bounded correction passes. Agents
are responsible for running the commands during authorized work; the user does not need to
request them after every edit. Skills guide execution but do not independently run in the background.
Parallel workers add their task/allocation/registry arguments as documented in coordination.md;
this runs the scope gate before the ordinary checks. Generic CI also validates registry consistency.

Choose explicit validation plus CI by default. The optional pre-push hook is a convenience:

```sh
npm run setup -- --hooks
```

No pre-commit or agent edit/Stop hooks are enabled. Agents format only changed, owned files using
`npm run format:files -- <paths>` before final validation and after format-check failures.
Whole-repo `npm run format` is coordinator-only; it is not needed on a periodic schedule.
For human-only edits, run scoped formatting and validation at completion, or ask the agent to do it.
Setup refuses to replace an existing `core.hooksPath`. The hook uses Git's POSIX shell, including
Git for Windows. Local Git config and hook selection are shared across worktrees in this repo;
they are not per-worker global settings. The hook validates the current working tree, not a
snapshot of pushed commits; CI validates the pushed/PR revision. Before pushing, check for dirty
work and validate the intended commit. Hook bypass is not evidence of successful validation.

If you enabled this hook and want to return to Git's default hooks, confirm the current value is
`.githooks`, then run `git config --local --unset core.hooksPath`. Restore any previous custom value
instead if you had one. Do not remove another tool's hooks.

Git defaults in `.gitconfig` are applied locally by setup: fast-forward-only pulls, pruned fetches,
simple pushes, and LF controlled by `.gitattributes`. No global identity/credentials are changed.
Git does not auto-load a versioned `.gitconfig`.

## When the stack is selected

1. Coordinator records stack and rationale in `docs/planning/architecture.md`.
2. Add the framework's real scripts and dependencies without replacing the foundation scripts.
   Python/Go/etc. can use npm scripts as a cross-platform command entry point; Node remains tooling.
3. Extend ESLint for JSX/TypeScript/framework rules or add the chosen language linter. Foundation
   ESLint covers ordinary JS/MJS/CJS; it does not parse JSX or TypeScript. Configure isolated tests.
4. Add npm script names to `validation.config.json`, for example:

```json
{
  "application": {
    "status": "configured",
    "scripts": ["app:lint", "app:typecheck", "app:test", "app:build"]
  }
}
```

Use commands appropriate to the selected stack; omit typecheck if no typechecker applies.
The gate requires existing nonempty scripts, but cannot prove their quality or side effects.
Review their implementation. Do not use `echo`, no-op scripts, or point a check back to `validate`.
Application source detection covers common languages/static pages; it is a bootstrap guard,
not an exhaustive language classifier. Extend `scripts/lib/repo-policy.mjs` for unusual stacks.

### Finish stack activation

1. Add empty `KEY=` entries to `.env.example`; set private values only in each ignored local `.env`.
   Validate required env at the application boundary when that boundary exists.
2. Review whether lifecycle scripts are needed. Initial `npm ci --ignore-scripts` deliberately
   skips them; explicitly enable/rebuild only reviewed application dependencies that require them.
3. Run the same validation command locally and in CI, then exercise the real acceptance/demo path.
   Builds, mocks, redirects, and worker reports do not establish live payment/auth/provisioning.

## CI and repository settings

The workflow runs on PRs, main pushes, and manual dispatch. Windows/Linux jobs check portable
tooling and the integrated config. No environment secrets or deployment are used. Third-party
Actions are pinned to reviewed commit IDs. The workflow uses `pull_request`, not a privileged
`pull_request_target` event. Never expose production credentials to untrusted branch code.

The Markdown linter is called directly over Git-visible files, avoiding a separate glob/CLI
dependency tree. The exact KaTeX override in package.json patches its transitive math renderer;
the tooling test exercises Markdown math and a rejected malformed heading. Review this override
alongside any future Markdown linter update. `npm audit` is an explicit network check, separate
from the fast offline validation loop; it was checked during scaffold setup.

After pushing, a repository owner can require the `validate (ubuntu-latest)` and
`validate (windows-latest)` checks in branch protection. This is an external setting;
the checked-in workflow alone does not enforce merge protection.
