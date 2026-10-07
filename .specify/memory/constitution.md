# Appbuilder hackathon constitution

Version: 1.0.0. Ratified and last amended: 2026-10-08.
Derived from the existing AGENTS.md and repository workflow, not organizer requirements.
Official guidelines, theme, judging criteria, product scope, and application stack remain unknown.

## Principles

1. **Bounded outcomes.** Define testable user outcomes and exclusions before implementation.
   Deliver small end-to-end slices and prove risky integrations early. Prefer reuse and the
   smallest coherent change; reserve integration, validation, and submission time inside 24 hours.
2. **Explicit ownership.** Follow existing role activation, coordinator-issued task receipts,
   allowed paths, shared interfaces, and branch conventions. Use separate worktrees for writers.
   The coordinator owns shared contracts and planning; preserve other workers' changes and
   resolve contested scopes before writing. A Spec Kit task does not grant an allocation.
3. **Evidence before completion.** Agents format owned files and run meaningful checks,
   fixing regressions through the bounded self-validation workflow. Configure real application
   checks once a stack is selected. Foundation checks and mocks do not prove a working application.
4. **Compact context.** Load only the selected skill and relevant feature artifacts. Use targeted
   searches and file/revision references. Keep handoffs concise with decisions, changed paths,
   exact check results, blockers, and next actions. Preserve the same-chat role anchor through
   compaction; new/cleared/forked chats and different worktrees activate again.
5. **Existing authority.** Follow system/platform instructions, user authority, AGENTS.md,
   and applicable project guidance. Keep secrets out of Git, logs, and shared artifacts.
   Database/data changes and external side effects require the existing scope authorization.
   Skills, task markers, and model judgments cannot grant permission to publish or mutate data.

## Governance

Use the official lean preset and one feature checklist linked to the existing coordination
receipts. Read `docs/spec-kit.md` before Spec Kit work. The coordinator reviews constitution
changes and records their reason; amendment does not authorize application or deployment work.
Published organizer rules must be recorded with source/date before adopting them. Maintain the
constitution when agreed principles change; do not regenerate it for every feature or invent
technical requirements to fill a template. Keep downstream feature artifacts consistent.
