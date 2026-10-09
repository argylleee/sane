---
name: plan
description: Create, run and update PLAN.md for the Sane hackathon build. Use this whenever the user mentions planning, timeline, schedule, hour-by-hour, task breakdown, what to build next, scope cuts, progress, status, blockers, or "are we on track", even if they never say "PLAN.md". Also use at the start of any work session to find the next task, and after finishing a task to update status.
---

# Plan skill

PLAN.md is the single source of truth for what is being built, in what order, and what gets cut if time runs short. A hackathon fails less from bad ideas than from unfinished work, so the plan protects a working demo first and features second.

## When you start a session

1. Read `RULES.md`, then `PLAN.md`.
2. Find the first unchecked task in the earliest unfinished milestone.
3. Tell the user what it is, how long it should take, and what "done" looks like. Then do it.

## When you finish a task

1. Tick the box in PLAN.md and add the actual time if it differs a lot from the estimate.
2. Check the milestone gate. If every gate item passes, mark the milestone done.
3. If you are behind, apply the cut ladder below before the user asks.

## Principles (and why)

- **Vertical slice first.** Get paste text -> rules -> verdict working end to end before adding OCR, embeddings or the LLM. If time runs out, a thin working product still demos.
- **Gates, not hopes.** Each milestone ends with a checkable test (for example, "works in airplane mode"). Passing the gate is the only way to move on.
- **Cut early, cut cleanly.** Dropping a feature at hour 6 costs little. Dropping it at hour 13 costs the demo.
- **Freeze before the deadline.** The last 3 hours are for testing, the offline demo rehearsal and the submission form. No new features.

## Cut ladder (cut from the top first)

1. Share Target (PWA share sheet). Keep the "Check what I copied" button.
2. LLM-written explanation. Keep template explanations.
3. Filipino/Taglish LLM wording. Keep templates in all three languages.
4. Screenshot OCR. Keep paste input and say so honestly.
5. Embedding similarity. Keep rules plus keyword scoring.
   Never cut: rules engine, verdict UI, offline caching, zero-network proof, disclosure table.

## Format of PLAN.md

Use the template in `assets/PLAN.md`. Keep these sections: Goal, Time budget, Milestones with checkboxes and gates, Cut ladder, Risks, Decisions log. When a decision is made (model choice, scoring weights), add one line to the Decisions log with the reason. When options exist, list them with trade-offs and let the team choose.

## Estimating

Estimates assume 2 to 3 people. For a solo builder, multiply build tasks by about 1.5 and cut one rung off the ladder at the start. Re-plan at every gate using real elapsed time, not the original numbers.
