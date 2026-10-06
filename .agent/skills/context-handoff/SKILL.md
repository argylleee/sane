---
name: context-handoff
description: Preserve compact, evidence-linked task state before compaction, tool changes, or agent handoffs; resume without replaying full history.
---

# Keep useful context

At task start, read AGENTS.md, the task, and the latest relevant handoff. Verify checkout/revision,
status, and evidence freshness. Inspect only the code and decisions that change the next action.

- Keep a short working set: outcome, constraints, current hypothesis, touched files, next check.
- For role/parallel tasks, retain the role, task allocation number/authority, contract version,
  and file/external-resource scopes. Check freshness before resuming contested writes.
- Retain the exact chat session key/epoch and local checkpoint reference through compaction.
  Restore only this same chat/checkout's active role; a new/cleared/forked chat must activate again.
  Follow `docs/role-sessions.md`; role state does not carry permissions or a fresh task receipt.
- Load skill descriptions first and only the selected SKILL.md/references. Use targeted searches;
  truncate noisy output and save large test logs locally instead of returning them to every worker.
- Agree a useful time/token budget when tools expose it. Otherwise use a timebox and scope boundary;
  do not pretend to measure tokens. A short output is not a reason to skip necessary reasoning.
- Checkpoint when a milestone changes state, before compaction/tool switching, or when context
  crowds out the working set. Update the task-specific handoff using `docs/templates/handoff.md`.
- Aim for roughly 300-600 words per handoff, less for simple tasks. Preserve material constraints
  even when that exceeds the target. Reference files/revisions instead of copying code or chats.
- Separate verified facts, decisions, assumptions, and unresolved questions. Include exact commands,
  exit/results, dirty work, failed approaches worth avoiding, blockers, and the next executable action.
- Only the coordinator updates `docs/planning/context.md` and shared decisions. Workers own their
  own handoffs under `docs/tasks/<task-id>-handoff.md`; sensitive/local scratch belongs in `.local/`.

On resume, verify the revision, dirty paths, and relevant runtime state before trusting old results.
Do not rerun passing checks unless changes or stale evidence justify it. Summaries are navigation,
not replacements for current code or acceptance criteria. Never persist credentials or raw private logs.
