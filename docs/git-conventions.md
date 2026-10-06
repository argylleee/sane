# Git and task conventions

Use the same conventions across AI tools. Naming improves coordination; it never authorizes
a commit, push, merge, deployment, or destructive operation.

## Branches

Normal writing tasks use `codex/<type>/<task-id>-<short-kebab-description>`, lowercase, at most
100 characters. Keep the `codex/` namespace for all platforms so naming stays predictable.

```text
codex/feat/task-001-demo-screen
codex/fix/task-002-request-timeout
codex/refactor/task-003-extract-validation
codex/docs/task-004-demo-instructions
codex/chore/repo-foundation
```

Include the approved task ID when there is one. A small serial maintenance change can omit it.
One writing task gets one branch and worktree; use its task ID as the worktree slot label.
Keep `main` as the integration branch. An explicit request to work/push directly on main is
an exception for that request, not a standing permission for future tasks. Do not rename an
existing assigned branch silently; reconcile the coordinator receipt first.

## Commits and PR titles

Use `type(scope): imperative description`, with an optional lowercase kebab-case scope.
Keep the subject at most 72 characters and omit a final period. Describe the outcome rather
than listing files. Use the following types:

| Type       | Meaning                                      |
| ---------- | -------------------------------------------- |
| `feat`     | New user-visible capability                  |
| `fix`      | Correct incorrect behavior                   |
| `docs`     | Documentation only                           |
| `refactor` | Restructure without intended behavior change |
| `perf`     | Improve performance                          |
| `test`     | Add or repair meaningful tests               |
| `build`    | Dependencies or build tooling                |
| `ci`       | CI workflows and checks                      |
| `chore`    | Repository setup or other maintenance        |
| `revert`   | Revert a specific previous change            |

Examples:

```text
feat(frontend): add responsive demo screen
fix(api): handle request timeouts
chore(repo): prepare hackathon workflows and tooling
```

For nontrivial changes, separate a short body with a blank line and record why, material
validation/limits, and `Refs: TASK-001` when applicable. Mark a breaking contract change with
`!` and a `BREAKING CHANGE: ...` body explanation. Use the same subject convention for PR
titles so an authorized squash merge can preserve it. Git-generated merge commits are exempt.

Keep commits coherent, stage explicit owned paths, inspect the staged diff, and exclude secrets,
local role checkpoints, generated skill exports, and engine binaries. Do not invent test results,
task IDs, or co-author attribution. Do not amend somebody else's published history.

## Automation

Agents check their proposed branch/commit before an authorized commit. The optional local
hooks enabled by `npm run setup -- --hooks` validate commit messages and run pre-push checks.
CI checks PR branch naming and new non-merge commit messages on PRs/main pushes. The existing
initial license commit is not rewritten; history before the event's base revision is excluded.

```sh
npm run check:git -- branch codex/feat/task-001-demo-screen
npm run check:git -- commit-file /path/to/prepared-message.txt
npm run check:git -- range BASE_REVISION
```

The agent runs these commands. Main push events check commit conventions, not a feature branch
name. Generic foundation validation does not inspect uncommitted proposed messages; CI and the
commit hook are the separate deterministic triggers. Required branch protection remains an owner setting.
