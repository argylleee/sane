---
name: self-validate
description: Verify a completed slice or diagnose a failed check using bounded fix-and-recheck passes with precise evidence and honest blockers.
---

# Verify, repair, finish

Use the task's acceptance criteria and inspect repository scripts before running checks with
unknown side effects. Do not assume tests are isolated from live data.
Run routine formatting/checks yourself when execution is available; the user should not have
to remember periodic commands. Skill invocation is agent orchestration, not a deterministic
background trigger. Report unavailable execution and never imply that checks ran automatically.

1. Run the narrowest meaningful check while developing. For regressions, establish a failing
   reproducer or behavior test before fixing when practical.
2. Diagnose the first failure from bounded output. Distinguish code failures, pre-existing failures,
   and environment limits. Make one coherent correction and rerun the relevant check.
3. After two attempts with the same cause and no progress, change the hypothesis or ask for a
   bounded independent review if permitted. Keep implementing independent authorized work.
4. After three unsuccessful repair passes, checkpoint the blocker, evidence, and next useful action.
   Seek the missing input/environment change; do not silently retry forever or stop unrelated work.
   These are investigation checkpoints, not permission to abandon a fix with a known solution.
5. Format changed, owned files with `npm run format:files -- <paths>` before final validation;
   avoid whole-repo formatting during parallel work. Fix a format-check failure the same way.
6. When the slice is ready, run `npm run validate`, adding the task/allocation/registry arguments
   in `docs/coordination.md` for a parallel writing task. Check receipt/scope before edits too.
   Review the final diff and exercise acceptance
   behavior. For UI work, batch relevant viewport checks and confirm fixes in one further pass.

Never auto-format, auto-stage, commit, change data, or deploy from validation hooks. Do not disable
checks to achieve green. Re-run passing checks only after relevant changes or unresolved concerns.
Report exact commands/results, skipped checks/reasons, and mock versus live boundaries. Foundation
validation has no app coverage until `validation.config.json` is configured for the selected stack.
