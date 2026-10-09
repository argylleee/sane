# AI tools and skills

The root `AGENTS.md` is the shared contract; `.agents/skills` is the canonical skill source.
The workflow needs no particular model, provider, MCP server, or hidden platform setting.
Native discovery and execution permissions vary; verify in the tool you actually use.

## Installed skills

| Skill                | Use it for                                                               |
| -------------------- | ------------------------------------------------------------------------ |
| `hackathon-delivery` | A timeboxed vertical slice and acceptance evidence                       |
| `context-handoff`    | Context budgets, compaction, switching tools, compact task state         |
| `parallel-work`      | Bounded delegation, ownership, worktrees, ordered integration            |
| `self-validate`      | Diagnose/fix/recheck without endless loops or false green claims         |
| `grill-me`           | An explicit interview to stress-test an idea                             |
| `grilling`           | Required interview implementation called by upstream grill-me            |
| `impeccable`         | Frontend design; its command router loads only relevant references       |
| `role-dispatch`      | Task routing, allocation receipts, and bounded dispatch                  |
| `role-integration`   | Product/shared integration coordination                                  |
| `role-frontend`      | Assigned UI implementation and verification                              |
| `role-backend`       | Assigned core/service implementation and verification                    |
| `resolve-conflict`   | Ownership, refactor, Git, semantic, or external-write collision          |
| `mcp-workflow`       | A named optional MCP connection, scoped tools, and compact evidence      |
| `sane-architecture`  | Sane stack, execution boundaries, and shared interface decisions         |
| `sane-android`       | SMS/chat capture, Java native lifecycle, permissions, and warnings       |
| `sane-model`         | Filipino/English data, classifier/export parity, and detection evidence  |
| `sane-experience`    | Sane Figma/frontend states, bilingual UX, and accessibility              |
| `sane-security`      | Message privacy, bridge/storage/permission boundaries, and threat review |
| `sane-release`       | Real device, offline/local AI, demo, and submission acceptance evidence  |

Four general workflows, six role/conflict/MCP workflows, the requested upstream bundles, and
ten Spec Kit skills are installed. Spec Kit's five core prompts use the official lean preset;
convergence and optional clarification/analysis/checklist/issue conversion use the core commands.
See [Spec Kit](spec-kit.md) for exact chat prompts and how they preserve role ownership.
Vendored support files are preserved, and upstream text is excluded from our style rewriting.
Review any newly downloaded instructions/scripts before use; they remain within the user's authority.

The six Sane specialists supplement those workflows. Start at [the Sane development guide](sane/README.md),
load the already assigned role, then only the matching specialist and rule. They do not activate
roles, allocate files, run background monitors, or authorize external actions. The confirmed
manual/SMS/selected-chat scope and language requirements must not be silently narrowed.
Canonical skill names are distinct from existing role, Impeccable, and Spec Kit names.

## Exact usage

From the repository root, start a **new AI session** or refresh skills discovery. In Codex chat,
use the skill picker or `$` mentions:

```text
$grill-me Stress-test our MVP. Use docs/planning/guidelines.md and scope.md.
Focus on the main user outcome, feasibility in 24 hours, and our riskiest integration.

$impeccable init
$impeccable shape the main demo screen
$impeccable audit the main demo screen
$impeccable polish the main demo screen

$hackathon-delivery Implement docs/tasks/TASK-001.md within its timebox.
$context-handoff Write docs/tasks/TASK-001-handoff.md for another agent.
$parallel-work Allocate TASK-001 and TASK-002 with non-overlapping ownership.
$self-validate Verify TASK-001 and fix regressions with recorded evidence.
```

`grill-me` is explicitly invoked. Upstream now delegates to `grilling`, which asks rounds of
dependency-aware questions. Use it when product direction is available; do not automatically
interview on every small edit. A 10-minute interview is a useful team timebox: state the limit in
your prompt and ask for unresolved risks at its end. User instructions take precedence over the
upstream exhaustive interview. If the host lacks a Skill tool, read both SKILL.md files explicitly.
If subagents are unavailable, the agent can inspect local facts itself within its allowed tools.

For role/parallel work, use [the allocation protocol](coordination.md). Codex uses `$role-dispatch`
or `$role-frontend`; Claude uses `/role-dispatch` or `/role-frontend` from the setup-generated bundles; OpenCode loads
the named skill with its native tool. Automatic routing follows an explicit role or task receipt
first and otherwise proposes the smallest appropriate role. It does not grant tool permissions
or automatically fan out to all roles. Only one coordinator changes allocation metadata.

For sticky roles, activate once per chat/checkout using [role sessions](role-sessions.md).
Codex/Claude have SessionStart adapters for compaction/reset; OpenCode has `/role-*` project
commands and the portable summary anchor. Never restore another chat's state by scanning local files.

Impeccable `init` writes PRODUCT.md and may shared design config; run it after direction is known
and assign one coordinator as owner. PRODUCT.md and DESIGN.md now contain Sane product truth and
a proposed visual baseline. No approved comp or generated design sidecar is claimed; preserve
these facts and reconcile the visual baseline through the selected Impeccable workflow.
Keep UI work timeboxed and let the requested scope and AGENTS.md govern optional polish.
For slash-command hosts, use `/grill-me` or `/impeccable shape <target>` **in chat**. In Codex use
`$impeccable shape <target>`; `/prompts:` is not needed.

The Impeccable CLI is separate from these chat prompts. On Windows the checked-in launcher is:

```powershell
& ./.agents/skills/impeccable/scripts/impeccable.cmd --help
```

On POSIX shells:

```sh
sh .agents/skills/impeccable/scripts/impeccable --help
```

The launcher pins an engine release and downloads a platform binary on first use if missing.
It verifies downloaded checksums; network/permission approval may be needed in your host.
Machine binaries are ignored rather than vendored. The skill offers a direct-document fallback
when the engine cannot run. No automatic Impeccable agent hooks were installed.
On POSIX systems, `npm run setup` makes the canonical launcher executable before native skill use.

## Platform compatibility

| Platform                               | Project setup                                                                                   | Invocation / fallback                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Codex                                  | Open this repo root; AGENTS.md + `.agents/skills` are native                                    | `$skill-name` or `/skills`; reload if missing                                     |
| ChatGPT desktop with local repo skills | Open the project; verify the skill is visible                                                   | Select with `@` where available; otherwise explicit file-reading prompt           |
| ChatGPT web/other chat-only sessions   | Attach AGENTS.md, the selected skill, task, and required resources                              | Request the skill by name; local checkout alone does not grant file/shell access  |
| OpenCode                               | AGENTS.md + `.agents/skills` are native                                                         | Ask to load `skill` by name; slash UX depends on version                          |
| Current Antigravity                    | AGENTS.md + `.agents/skills` are native                                                         | `/<skill-name>`; inspect Customizations                                           |
| Legacy Antigravity                     | Optional local export to `.agent/skills`                                                        | Use a scoped workspace rule pointing to AGENTS.md if needed                       |
| Claude Code                            | CLAUDE.md imports AGENTS.md; setup generates ignored `.claude/skills` bundles                   | `/<skill-name>` or explicitly read the canonical skill                            |
| GitHub Copilot                         | `.github/copilot-instructions.md` and canonical `.agents/skills`                                | Choose the skill if supported; otherwise explicit file-reading prompt             |
| Devin / another agent                  | Supply the shared contract and bounded task using its repository knowledge/instructions feature | Explicit file-reading fallback; native skill discovery has not been verified here |

No platform has been launched to prove UI discovery. The canonical locations are supported by
[OpenAI](https://learn.chatgpt.com/docs/build-skills),
[OpenCode](https://opencode.ai/docs/skills/), and
[Antigravity](https://antigravity.google/docs/skills) documentation. Older versions may differ.

All canonical bundles and their resources are checked in once under `.agents/skills`. The common
`npm run setup` automatically generates Claude's complete local bundles. No separate Claude export,
upstream reinstall, symlink creation, or copying from this machine is needed. Codex, OpenCode,
current Antigravity, and current Copilot read the canonical folder directly. Committed native
adapters contain only host-specific commands/config. Generated copies remain ignored.

For a coordinator changing or adding skills, edit only the canonical bundle, then run:

```sh
npm run skills:sync
```

Commit only the canonical change. Setup/sync record activated platforms and payload digests in
ignored `.local/skill-mirrors.json`. CI runs setup in each fresh checkout before validation.
Validation compares complete inventories and payload digests, normalizing text line endings and
excluding downloaded engine binaries. A missing/stale generated bundle fails validation. Matching
copies are skipped; canonical updates replace only copies matching the recorded prior payload.
Independent native edits are preserved and must be reconciled into the canonical source first.
Removed/extra skill directories require explicit review rather than automatic deletion.

For a legacy host that needs another discovery path, explicitly activate its local export:

```sh
npm run skills:export -- legacy-antigravity
npm run skills:export -- copilot
```

Each command generates complete bundles for the selected compatibility path (`.agent/skills`
or `.github/skills`). Use the Copilot fallback only if your version needs it. Future setup/sync
runs maintain every activated local export. Fresh checkouts generate only Claude by default.
After pulling skill updates, rerun setup and reload the host. Load only the selected skill and
required resources into model context; separate discovery folders do not justify duplicate reading.

For any platform with file access, paste this portable fallback:

```text
Read AGENTS.md and .agents/skills/context-handoff/SKILL.md, then the assigned task.
Read only the resources needed for this request. Follow that workflow using the tools
and permissions actually available. Verify checkout/revision before trusting handoff state.
If a native Skill tool is unavailable, read referenced skills/files directly.
Report exact validation evidence and any unavailable tools; do not claim execution from advice.
```

Replace `context-handoff` with the desired skill. Chat-only sessions need the referenced resources
provided explicitly and cannot run scripts or write the checkout without connected execution tools.

## Installation and updates

Already installed in this repository. No teammate needs to reinstall to use the canonical bundles.
The following commands reproduce the **project scope**, not a global install:

```sh
npx --yes skills@1.7.0 add mattpocock/skills --skill grill-me grilling --agent codex --yes --copy
npx --yes impeccable@4.1.0 install --providers=codex --scope=project --no-hooks --yes
```

The user's `--skill=grill-me` form was not filtered by skills 1.7.0 in this run; use the separate
`--skill grill-me grilling` arguments. `grilling` is essential for the current upstream wrapper.
Avoid `--all` and global flags. Installation tools can evolve; inspect `--help` before updates.

For a deliberate future refresh, use `skills@latest` or `impeccable@latest` with the same scoped
options in a clean isolated checkout. Review the updated instructions, supporting resources,
dependency wiring, licenses, and launcher VERSION. Update `.agents/vendor.json` version metadata,
then run `npm run vendor:record`, `npm run skills:sync`, scoped formatting, and `npm run validate`.
Commit the reviewed canonical bundles and version metadata; generated copies stay local.
Do not update third-party skills mid-task merely because a newer version exists.

`skills-lock.json` retains installer hashes for grill-me/grilling. `.agents/vendor.json` records
SHA-256 payload digests for vendored skill folders and Spec Kit shared assets (normalizing text line endings and excluding machine binaries); the copied
bundles in Git are the reproducible source. Installer version pins alone do not pin a remote
GitHub default branch or a remotely supplied skill archive. Validation detects local payload
changes but is not a cryptographic proof that upstream instructions are safe.

## Add future rules or skills

For a rule, add a short Markdown file under `.agents/rules`, and route applicable agents from
AGENTS.md. Antigravity rules require frontmatter such as:

```yaml
---
trigger: model_decision
description: Apply the official submission requirements before preparing deliverables.
---
```

Other tools should explicitly read the file via AGENTS.md when relevant. Avoid always-loading
every future rule. Keep official guidelines in `docs/planning/guidelines.md` as the fact source.

For a skill, create `.agents/skills/<name>/SKILL.md`:

```markdown
---
name: submission-check
description: Verify the planned submission against published organizer requirements.
---

Read the official guidelines and the selected deliverable's evidence. Report missing items.
```

Use lower-case names matching the folder, concise scope, and links to resources loaded on demand.
Optional `agents/openai.yaml` can customize Codex's picker; the portable frontmatter remains the
shared interface. Synchronize the native mirrors when skills change, then run validation. Do not duplicate
generic agent instructions or accumulate full histories in skills.
