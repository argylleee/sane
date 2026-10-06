---
name: resolve-conflict
description: Resolve overlapping role ownership, incompatible interfaces, Git conflicts, or concurrent external-resource mutations while preserving each task's work and evidence.
---

# Resolve a conflict

Use `docs/coordination.md` for the allocation protocol. A skill reduces risk; it cannot guarantee
conflict-free work or override another worker's ownership. Keep the disputed writes paused, not
all unrelated work. Integration coordinates a single resolver within the user's authorized scope.

1. Capture a small conflict packet: affected task IDs/allocation numbers, base/current revisions,
   dirty paths, competing file/interface/resource changes, acceptance criteria, and relevant evidence.
   Verify receipts with the authority; do not read whole histories or repeat both investigations.
2. Classify the issue: allocation overlap, textual Git conflict, semantic contract regression, or
   remote side effect. Freeze only contested paths/resources. Preserve both dirty/committed variants
   in their worktrees or an authorized recoverable local patch before editing the combined result.
3. For scope overlap, serialize the shared change or repartition tasks and increment affected receipts.
   For code conflicts, inspect the merge base, both intended behaviors, and callers/tests; produce
   a combined implementation that satisfies acceptance. Do not blindly select ours/theirs or force-reset.
4. Route unresolved product choices to the user only when evidence cannot determine intent.
   Ask for missing side-effect authority where required. Never delete stored data, repeat a remote
   mutation, or change access simply to reconcile a conflict. Read the authoritative remote state first.
5. Run scope checks, meaningful conflict/regression tests, formatting of owned files, and full
   validation on the reconciled revision; inspect any affected end-to-end path. A clean textual merge
   is not proof that contracts or behavior agree.
6. Coordinator records one durable decision and new receipts. Workers acknowledge them before
   resuming disputed writes; retain their worktrees until recoverable integration is verified.

Use the bounded diagnosis checkpoints in `self-validate` if a repair stalls. End with resolved
behavior, evidence, remaining blockers, and next action; do not silently widen scope or suppress checks.
