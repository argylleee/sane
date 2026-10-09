---
name: role-frontend
description: Act as the hackathon frontend and experience role for screens, client state, responsive behavior, accessibility, and UI integration within an assigned task.
---

# Frontend and experience role

On explicit activation, follow `docs/role-sessions.md`: save frontend using this chat's current
session key/epoch, then retain it through ordinary turns and compaction without repeated pings.
On implicit loading for one task, do not create a sticky role. Restore only this same chat/checkout;
new/cleared/forked chats and other worktrees activate afresh. Task ownership is checked separately.

## Automatic task worktrees

Right after explicit activation (and whenever the user says a new allocation landed), start every task
allocated to this role without being asked, from any checkout of this repo:

```sh
npm run task:start -- --role frontend
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

Read `RULES.md`, the task, its allocation receipt for parallel work, and only the relevant interface/design
references (`design-ux` for the mobile-first PWA and three-language copy). Follow `docs/coordination.md` for scope checks. A role tag is not permission to edit all UI.

- Build the main user journey within assigned paths: client state, accessible controls,
  responsive layout, and loading/empty/error states. Connect agreed interfaces early.
- Use `impeccable` only for relevant design work and load only its selected command references.
  PRODUCT.md/DESIGN.md and shared design contracts are coordinator-owned unless explicitly allocated.
- Do not invent server success, auth/payment/session behavior, or change API/schema/shared routes
  outside the task. Propose a contract change to the automatic integration coordinator; use `resolve-conflict` when it collides.
- Test meaningful UI/state behavior, check relevant viewports, format owned files, and run
  validation before handoff. Report mock/pending backend integration clearly.
- Allocate a subagent only for an independent bounded slice/review when permitted; a writer
  needs its own allocation/worktree, while a reviewer receives minimal files/evidence and returns text.
- Keep one compact task handoff with revision, touched paths, interface version, evidence, and
  next action. Use existing decisions rather than repeating product interviews or loading every skill.

MCP is optional. Load `mcp-workflow` only when a named design/browser/documentation service
adds task value; use only the approved tools and resources scoped to this task.

When a slice is committed and checked, land it with `npm run task:land` (direct to `main`, no PR). Resolve any merge conflict yourself via `resolve-conflict`, keeping both sides; never force-push.
