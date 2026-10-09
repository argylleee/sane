# Appbuilder hackathon

Sane is a web-only, mobile-first PWA that checks a suspicious message for scam signs, fully
in the browser, for a **Local AI hackathon**. Input is paste, typed text, a screenshot, or the
Web Share Target (installed PWA on Android Chrome). It does not read SMS or chat apps and has no
automatic monitoring (D-12). English, Filipino, and Taglish are supported.

This checkout holds the web app scaffold, tooling, and agent guidance. Start with
[RULES.md](RULES.md), [PLAN.md](PLAN.md), [DESIGN.md](DESIGN.md),
[organizer evidence](docs/planning/guidelines.md), and [decisions](docs/planning/decisions.md).
The Android-native documents under `docs/sane` are superseded history.

## Quick start

Use Git and Node.js 24.x. Node runs repository tooling; it does not select the app stack.
Windows tooling validation also uses PowerShell 7 (`pwsh`) for the installed Spec Kit helper test;
Linux/macOS use Bash. Review local script execution permissions if the host blocks scripts.
From the cloned repository root:

```sh
npm ci --ignore-scripts
npm run setup
```

Setup creates an ignored local `.env` from `.env.example` **without overwriting an existing
file**, applies only this repository's Git defaults, and automatically generates Claude's
ignored native skill copies from `.agents/skills`. No credentials or app variables are
invented. In new worktrees, run these commands again.

For agent-led development, ask the agent to take the task through implementation and validation;
it runs the checks itself. You do not need to type `npm run validate` periodically. The commands
below are the shared entry points used by agents, CI, the optional hook, or manual troubleshooting.

```sh
npm run format                 # whole-repo formatting; coordinator only
npm run format:files -- README.md  # format named files only
npm run lint                   # JavaScript + Markdown lint
npm run validate               # read-only foundation + configured app checks
npm run setup -- --hooks       # optional commit-message + pre-push checks
```

CI runs the same validation command on Linux and Windows, cancels superseded runs,
and has read-only GitHub permissions. It becomes active after these files are pushed.
Branch protection/required checks must be configured separately by a repository owner.

## Which checks happen automatically?

You do not need to run formatting commands on a timer. For agent-led work, AGENTS.md and the
`self-validate` skill require the agent to format its owned files, run relevant checks, repair
failures, and run full validation before handoff. This depends on the agent reading the contract
and having permission to execute tools; a skill is an instruction workflow, not a background hook.

| Mechanism               | Trigger                                                      | What it does                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent contract + skills | During an assigned task and before handoff                   | Agent runs scoped formatting, relevant checks, and `npm run validate`; records results and blockers.                                              |
| GitHub CI               | Push to main or a pull request, after the workflow is pushed | Automatically checks formatting, lint, repository invariants, tooling tests, and configured app checks. Reports failures; does not rewrite files. |
| Optional pre-push hook  | Each local push after `npm run setup -- --hooks`             | Runs read-only full validation; rejects a failing push.                                                                                           |
| Human-only editing      | When you finish a change                                     | Format the named files and run validation yourself, or ask the agent to do it.                                                                    |

The pre-push hook is opt-in, and agent edit/Stop hooks are not enabled. The validation command
checks formatting; the agent fixes it with `npm run format:files -- <owned-file-paths>`.
Whole-repo `npm run format` is reserved for the coordinator to avoid touching another worker's
files. Editor format-on-save is optional. No command silently stages, commits, or deploys work.

Small SessionStart hooks are configured for Codex/Claude role restoration; these run no validation
or source edits. Host trust/reload is required. See [role session behavior](docs/role-sessions.md).

## Git conventions

Agents use `codex/<type>/<task-id>-<short-kebab-description>` branches and Conventional Commits:

```text
codex/feat/task-001-demo-screen
codex/fix/task-002-request-timeout

feat(frontend): add responsive demo screen
fix(api): handle request timeouts
chore(repo): prepare hackathon workflows and tooling
```

Types cover features, fixes, docs, refactors, performance, tests, build, CI, maintenance, and reverts.
Commit subjects are at most 72 characters; PR titles use the same form. Agents check conventions;
CI checks new commit messages and PR branch names, and the optional commit-msg hook checks locally.
Direct main changes require explicit authorization. See [exact conventions](docs/git-conventions.md).

## Role skills, delegation, and conflicts

No named teammates are assigned. Select a role manually in chat, or let `role-dispatch` route
the task from its approved allocation. Explicitly activate a role **once per chat and worktree**;
later messages and compaction keep it without another ping. A new/cleared/forked chat or different
worktree requires activation again. Only the relevant role instructions load:

| Skill              | Responsibility                                                                       |
| ------------------ | ------------------------------------------------------------------------------------ |
| `role-dispatch`    | Select one role, allocate bounded scopes, and dispatch through permitted host tools. |
| `role-integration` | Automatic AI coordinator: allocation, scope checks, combined validation, demo path.  |
| `role-model`       | On-device OCR, embeddings, small LLM, reference data, and model evaluation.          |
| `role-frontend`    | Assigned screens, client state, accessibility, responsive behavior, and UI checks.   |
| `role-backend`     | Assigned domain logic/services, integrations, fixtures, and failure-path checks.     |
| `resolve-conflict` | Reconcile ownership, refactor, merge, interface, or external-resource collisions.    |
| `mcp-workflow`     | Evaluate/use a named optional MCP connection with narrow tools and bounded evidence. |

In Codex chat:

```text
$role-dispatch Split these tasks across the roles; allocate scopes before parallel writes.
$role-frontend Implement TASK-001 using its approved allocation and contract.
$role-backend Implement TASK-002 using isolated fixtures and its approved allocation.
$resolve-conflict Reconcile the overlapping changes without discarding either task's work.
```

Parallel writers use distinct branches/worktrees and a coordinator-issued task receipt.
`coordination.json` starts empty and records file scopes, interface/external mutation keys,
dependencies, and allocation numbers. Repository validation detects overlap and dependency
conflicts; scoped worker validation also checks branch/base and actual changed paths.
The agent runs those checks before editing and before handoff. A role label is not a security
permission, and a registry snapshot is not a distributed lock across different machines.

For broad refactors, contested writes pause while integration preserves both versions and
serializes or repartitions the work. Workers resume only with acknowledged updated receipts.
No skill can guarantee zero conflicts; the protocol makes collisions visible and recoverable.
See [coordination and exact task-check commands](docs/coordination.md).

Claude Code and OpenCode use `/role-model`, `/role-frontend`, or `/role-backend` in chat;
Codex uses `$role-*` or the skill picker. Codex/Claude lifecycle hooks restore the exact session
checkpoint after compaction and reset on `/clear`. OpenCode's project slash commands use a compact
anchor in the summary; no lifecycle plugin is installed. `/clean` is not a universal command, and
hosts without reset events need the documented fallback. See [role sessions](docs/role-sessions.md).

MCP remains optional and unconfigured. The MCP skill/card covers role-specific tool subsets,
read-only/sandbox scopes, remote write ownership, capped results, and fallbacks. Load only a
useful selected server's tools; do not duplicate tool inventories or payloads across workers.
Task handoffs stay compact with revisions, scopes, contract versions, evidence, and next actions.

## Where things live

```text
AGENTS.md                 Shared working contract for every agent
.agents/skills/           Workflows, role/conflict/MCP skills + requested upstream skills
.agents/rules/            Future organizer-rule extension point
.agents/vendor.json       Upstream attribution, versions, payload digests
.specify/                 Spec Kit lean preset, constitution, templates, cross-platform helpers
.claude/skills/           Ignored Claude bundles generated automatically by setup
.local/                  Ignored skill-copy manifest and chat-local checkpoints
.github/                  CI, task issue form, PR template, Copilot adapter
.codex/hooks.json         Codex chat-local role restoration; requires hook trust
.claude/settings.json     Claude chat-local role restoration
.opencode/commands/       Role activation slash commands
docs/ai-tools.md           Exact skill usage and platform compatibility
docs/workflow.md           Validation, worktrees, and 24-hour workflow
docs/coordination.md       Role dispatch, ownership receipts, and conflict handling
docs/git-conventions.md    Branch, commit, task, and PR conventions
docs/role-sessions.md      Activate once; compaction restoration and reset boundaries
coordination.json          Empty allocation registry; single coordinator owns it
docs/templates/           Task and handoff templates
docs/planning/            Sane scope, organizer evidence, architecture, tasks, and demo
docs/sane/                Interface, model, security, verification, and bundle review
scripts/                  Small setup, validation, and skill synchronization helpers
.env.example              Versioned empty variable template
.env                      Local only, ignored by Git
PRODUCT.md / DESIGN.md     Sane product truth and proposed design baseline
```

The planning files now record confirmed Sane requirements and the user-supplied organizer slides.
Architecture/design choices are marked separately from organizer requirements; device/model
behavior remains unverified. The workflow guide contains team process, not contest requirements.

## Working with AI tools

Open the cloned folder as the project/workspace, then read [AGENTS.md](AGENTS.md).
The canonical skills use portable `SKILL.md` bundles in `.agents/skills`.
Native discovery varies by tool; the [AI tools guide](docs/ai-tools.md) provides adapters,
automatic native setup, exact prompts, and a manual fallback for ChatGPT, Devin, and other environments.

A fresh clone includes all canonical skill bundles and their supporting resources in `.agents/skills`.
The common `npm run setup` generates Claude's complete native bundles automatically; teammates
do not need a separate Claude export or upstream reinstall. Codex, OpenCode, current Antigravity,
and current Copilot read the canonical folder directly. Adapter folders contain host-specific
hooks/commands; generated copies, `.env`, sessions, dependencies, and downloaded engines stay local.

### Codex

Open a new session at the repository root. In chat:

```text
$grill-me Stress-test our proposed MVP against docs/planning/guidelines.md.
$impeccable init
$impeccable shape the main demo screen
$context-handoff Prepare a compact handoff for TASK-001.
$parallel-work Split these independent tasks into isolated worktrees.
```

These are **chat prompts, not shell commands**. Run Impeccable `init` after the product
direction is known. `grill-me` includes its required `grilling` dependency. There are
twenty-nine skill folders total; load only the selected role and relevant specialist workflows for the task.

### Spec Kit

Spec Kit **v1.1.1** and its official **lean preset** are included for bounded spec-driven work.
After the common setup, teammates can use the skills without installing Python, uv, or the
Specify CLI. Claude copies are generated automatically; OpenCode has `/speckit-*` project commands.
In Codex chat, once the guidelines and product direction are known:

```text
$speckit-specify Use feature directory specs/demo-flow. Specify our approved main demo journey.
$speckit-plan Plan the smallest end-to-end slice using the selected stack.
$speckit-tasks Break it into dependency-ordered steps and reference approved role allocations.
$speckit-implement Implement only my assigned steps; run the existing validation workflow.
$speckit-converge Assess gaps against this feature's spec and verified behavior.
```

Claude Code and OpenCode use the same names with `/` in place of `$`. The constitution captures
existing team agreements. Feature specs/checklists stay separate from allocation receipts;
parallel workers retain existing scope checks. See [Spec Kit setup and usage](docs/spec-kit.md)
for optional checks, Windows helper equivalents, and the remaining local prerequisites.

### Claude Code

From the repository root, start Claude Code after the common quick-start setup:

```sh
claude
```

Setup creates `.claude/skills` from the canonical bundles, including all supporting resources;
CLAUDE.md imports the shared AGENTS.md contract. Repository validation and CI check generated
bundle parity. After pulling skill updates, rerun `npm run setup` and reload the tool.
In Claude Code chat:

```text
/grill-me Stress-test our MVP within a 10-minute timebox.
/impeccable init
/impeccable shape the main demo screen
/hackathon-delivery Implement docs/tasks/TASK-001.md.
/self-validate Verify this slice and fix regressions before handoff.
/context-handoff Prepare docs/tasks/TASK-001-handoff.md.
/role-frontend Implement TASK-001 using its approved allocation.
/resolve-conflict Reconcile these conflicting task changes.
```

Use the `/` menu to confirm the skills appear. If discovery is unavailable, ask Claude to read
the selected canonical SKILL.md and its required resources directly. Native project skills and
slash invocation follow the [Claude Code skill documentation](https://code.claude.com/docs/en/skills).

### OpenCode

Start OpenCode from the repository root:

```sh
opencode
```

OpenCode reads AGENTS.md and discovers `.agents/skills` directly; no export is needed.
Use these ordinary chat prompts rather than assuming skill slash commands are available:

```text
Load the grill-me skill and its grilling dependency. Stress-test our MVP within 10 minutes.
Load impeccable and run its init workflow once the product direction is known.
Load impeccable and shape the main demo screen.
Load hackathon-delivery and implement docs/tasks/TASK-001.md.
Load self-validate; format owned files, run checks, fix regressions, and report evidence.
Load context-handoff and prepare docs/tasks/TASK-001-handoff.md.
Load role-dispatch and allocate these tasks before parallel writing.
Load resolve-conflict and reconcile these conflicting task changes.
```

This repository also provides native project commands `/role-model`, `/role-frontend`,
`/role-backend`, and `/role-integration` (the last is run automatically by the AI). Invoke one once at chat start; subsequent tasks keep the selected role.
Other skills can still be loaded using the prompts above. Confirm the commands appear after reload.

Ask OpenCode to use its native `skill` tool. If a skill is missing, verify the workspace root,
`SKILL.md` frontmatter, and skill permissions, then restart. The canonical path and native tool
are documented in [OpenCode skills](https://opencode.ai/docs/skills/).

For Devin, provide AGENTS.md, the bounded task, and the selected skill/resources through its
available repository access. The [AI tools guide](docs/ai-tools.md) includes the portable fallback;
native Devin skill discovery has not been verified here.

## Activate the application checks

Foundation validation checks repo structure, skill metadata/integrity, environment hygiene,
formatting, JavaScript/Markdown lint, and tooling behavior. It **does not test an application**.
Adding app source while checks remain unconfigured fails validation.

When the stack is chosen, add its actual lint/typecheck/test/build commands to `package.json`,
configure `validation.config.json`, and extend language-specific tooling. Follow the
[activation steps](docs/workflow.md#when-the-stack-is-selected); do not add placeholder passing checks.

## Extend later

- Record official guidelines and the approved MVP before implementation.
- Add task-specific rules to `.agents/rules` and route relevant agents to them from AGENTS.md.
- Add focused skills under `.agents/skills/<name>/SKILL.md`, with short descriptions.
- Edit and commit only the canonical bundles; the agent runs `npm run skills:sync` before validation.
  Generated native copies and their local manifest remain ignored. Teammates rerun setup after updates.
- Keep shared decisions compact and task handoffs separate to avoid parallel write conflicts.
- Preserve the existing BSD-2-Clause [license](LICENSE). Vendored skills retain their
  [upstream notices](.agents/third-party/NOTICE.md) and separate licenses.

See [workflow](docs/workflow.md) and [skill usage](docs/ai-tools.md) for the details needed on demand.
