---
name: role-frontend
description: Act as the hackathon frontend and experience role for screens, client state, responsive behavior, accessibility, and UI integration within an assigned task.
---

# Frontend and experience role

On explicit activation, follow `docs/role-sessions.md`: save frontend using this chat's current
session key/epoch, then retain it through ordinary turns and compaction without repeated pings.
On implicit loading for one task, do not create a sticky role. Restore only this same chat/checkout;
new/cleared/forked chats and other worktrees activate afresh. Task ownership is checked separately.

Read the task, its allocation receipt for parallel work, and only the relevant interface/design
references. Follow `docs/coordination.md` for scope checks. A role tag is not permission to edit all UI.

- Build the main user journey within assigned paths: client state, accessible controls,
  responsive layout, and loading/empty/error states. Connect agreed interfaces early.
- Use `impeccable` only for relevant design work and load only its selected command references.
  PRODUCT.md/DESIGN.md and shared design contracts are coordinator-owned unless explicitly allocated.
- Do not invent server success, auth/payment/session behavior, or change API/schema/shared routes
  outside the task. Propose a contract change to integration; use `resolve-conflict` when it collides.
- Test meaningful UI/state behavior, check relevant viewports, format owned files, and run
  validation before handoff. Report mock/pending backend integration clearly.
- Allocate a subagent only for an independent bounded slice/review when permitted; a writer
  needs its own allocation/worktree, while a reviewer receives minimal files/evidence and returns text.
- Keep one compact task handoff with revision, touched paths, interface version, evidence, and
  next action. Use existing decisions rather than repeating product interviews or loading every skill.

MCP is optional. Load `mcp-workflow` only when a named design/browser/documentation service
adds task value; use only the approved tools and resources scoped to this task.
