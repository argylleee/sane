# Spec Kit for the hackathon

Spec Kit v1.1.1 is installed in this repository with the official lean preset v1.0.0.
The ten generated `speckit-*` skills live in `.agents/skills`; shared templates, Bash and
PowerShell helpers, preset, and workflow live in `.specify`. Source revision, MIT license,
and payload digests are recorded in `.agents/vendor.json`. Nothing is installed globally.

## Teammate setup

After cloning or pulling, use the existing setup:

```sh
npm ci --ignore-scripts
npm run setup
```

Setup generates Claude's complete native skills and prepares POSIX helpers. Codex and OpenCode
read the canonical skills; OpenCode also has thin `/speckit-*` commands. Restart or refresh the
host so it discovers the new skills. Review project trust/hooks where the host requires it.
Actual host UI discovery has not been verified by repository checks.

The normal lean skills need file access and the existing development tools, not Python, uv,
or the Specify CLI. Optional core skills call the included shell helpers: use Bash on POSIX
or Git Bash, or PowerShell on Windows. Windows tooling validation uses PowerShell 7 (`pwsh`).
Windows PowerShell 5.1 blocked script execution in our local verification environment;
no machine policy was changed. If a skill names a Bash helper and Bash is unavailable,
run its PowerShell equivalent under `.specify/scripts/powershell` with the matching flags.
For example, `--json --require-spec --require-tasks --include-tasks` maps to
`-Json -RequireSpec -RequireTasks -IncludeTasks` for `check-prerequisites.ps1`.

Do not rerun `specify init --here --force` after cloning: it can replace reviewed project assets.
The CLI is only needed for deliberate upstream maintenance or CLI workflow automation.
Advanced CLI use needs Python 3.11+ and a pinned Specify CLI installation. CLI installs,
extra extensions, model connections, and machine trust are not transferred through Git.

## Use in chat

The constitution already captures existing repository agreements. Update it only when an
agreed rule changes; do not invent organizer rules, a product, or an application stack.
Start a bounded feature once official guidelines and product direction are known:

```text
$speckit-specify Use feature directory specs/demo-flow. Specify our approved main demo journey.
Keep only the must-have outcomes and testable acceptance criteria within the remaining time.

$speckit-plan Plan the smallest end-to-end slice using the selected stack and existing patterns.
Prove the riskiest integration early and define frontend/backend contracts before parallel writes.

$speckit-tasks Break the slice into dependency-ordered tasks with acceptance evidence.
Reference role allocations and owned file scopes; reserve time for integration and validation.

$speckit-implement Implement only the steps assigned by my current coordination receipt.
Load self-validate for checks and context-handoff before ending or compacting.

$speckit-converge Assess the assigned feature against its spec, plan, tasks, and verified behavior.
Report gaps for the coordinator; do not expand the MVP or start another unbounded implementation loop.
```

These are Codex chat prompts. Claude Code and OpenCode use `/speckit-specify`,
`/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, and `/speckit-converge`.
Other hosts should load the named canonical SKILL.md and this guide explicitly.
Provide the feature directory in the first request to satisfy the lean skill's directory question.

`speckit-clarify`, `speckit-analyze`, and `speckit-checklist` are optional; load them only to
resolve a material ambiguity or check a risky change. `speckit-taskstoissues` writes to GitHub
and requires explicit authorization. No git extension, MCP server, or extra agent hook is installed.
The included CLI workflow definition is optional; the normal flow invokes each skill in chat.

## Ownership and context

- `.specify/feature.json` is an ignored pointer for this checkout. Each worktree selects its own
  feature; do not share a writable checkout or assume a pointer carries into another worktree.
- `specs/<feature>/spec.md`, `plan.md`, and `tasks.md` are the feature's intent and implementation
  checklist. The coordinator owns shared contracts and checklist updates unless explicitly allocated.
  Workers return status/evidence in their own handoffs instead of concurrently rewriting that checklist.
- Existing `TASK-001` receipts can reference Spec Kit steps such as `T001` in
  `specs/demo-flow/tasks.md`. Use the actual step IDs present in the file. Keep one feature
  checklist; task receipts carry ownership, branches, scopes, and evidence rather than a duplicate checklist.
- Spec Kit never grants a role, file ownership, merge/push authority, or permission to mutate data.
  Follow `coordination.json` and the existing branch/commit conventions. Parallel markers alone
  do not authorize spawning workers or bypass allocation checks.
- Keep specs short and load only this feature's relevant artifacts. Later findings update the
  smallest affected artifact. Leave the existing blank planning documents empty until facts arrive.
- Implementation still requires scoped formatting, meaningful application checks, and repository
  validation. Spec convergence is an assessment, not a replacement for tests or runtime evidence.
  Timebox follow-up work and ask the coordinator to cut optional scope when necessary.

## Upstream maintenance

The reproducible initializer was Specify CLI v1.1.1 with `--integration codex`,
`--integration-options="--skills"`, `--script sh`, and `--preset lean`. Matching PowerShell
helpers were generated separately with `--script ps`. Generate future releases in an isolated
directory, review all changes, and preserve this repo's constitution, roles, and native hooks.
Update the recorded source release/revision, run `npm run vendor:record`, then
`npm run skills:sync`, scoped formatting, and validation. Commit canonical bundles and shared
assets; generated native copies, local feature pointers, and Python environments remain ignored.

Upstream: [Spec Kit v1.1.1](https://github.com/github/spec-kit/tree/v1.1.1) and
[lean preset](https://github.com/github/spec-kit/tree/v1.1.1/presets/lean).
