---
name: hackathon-delivery
description: Plan and deliver a timeboxed vertical slice during this 24-hour hackathon, prioritizing demo value and verified behavior.
---

# Deliver a slice

Read the assigned task and relevant scope/guidelines; unknown contest rules remain unknown.
Use `docs/templates/task.md` only for work needing durable tracking. A small fix needs no ceremony.

1. Define one observable user outcome and acceptance evidence. Separate must-have from optional.
2. Identify the shortest runnable path and its riskiest integration. Verify that boundary early.
3. Allocate a task timebox within the team's remaining schedule, including verification and integration.
   Offer a smaller scope if the task cannot fit. Avoid choosing a framework until the team selects it.
4. Build the slice using established patterns. Mock only at explicit integration boundaries and label it.
5. Run narrow checks during implementation, format owned files with `npm run format:files -- <paths>`,
   then run `npm run validate` before handoff. Handle these commands yourself when tools permit;
   do not leave routine verification to the user. Inspect UI at the relevant desktop/mobile
   sizes for UI work; record evidence and limitations without committing screenshots by default.
6. Return a compact deliverable and handoff. A passing build alone is not proof of runtime behavior.

When time runs short, drop optional scope with the coordinator. Preserve security, data boundaries,
and honest validation. Do not spend the final hour redesigning shared architecture.
Read `docs/workflow.md` only when coordinating the overall schedule or stack activation.
