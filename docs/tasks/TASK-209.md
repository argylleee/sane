# TASK-209: optional AI explanation in the UI (frontend)

Role: frontend. Branch `codex/feat/task-209-ai-explanation-ui`, allocation 1. Depends on TASK-206 (integrated).
Read `.agents/skills/design-ux/SKILL.md`, `.agents/skills/local-ai/SKILL.md` and `src/ai/llm.ts` (read-only).

## Interface (version llm-explain-v1, frozen unless the coordinator changes it)

- `detectCapabilities().tier` is `'A' | 'B' | 'C'`; tier C has no WebGPU: hide the toggle entirely.
- `LLM_MODEL_BY_TIER`, `loadLlm(tier)` (explicit, user-initiated download), `getLlmStatus()`, `subscribeLlm(fn)` from `src/ai/index.ts`.
- Pass `useLLM: true` to `analyze()` only when the user switched it on and `getLlmStatus().state === 'ready'`.
- The model's text arrives in `verdict.explanation.extra`; `verdict.usedModels.llm` says it ran. The template headline and steps are always shown.

## Outcome

1. A clearly optional "AI explanation (experimental)" control, off by default, in English, Filipino and Taglish copy.
2. Before download: show approximate size and a mobile-data warning (same pattern as the embedding prompt); require an explicit tap. Show progress and an error state that leaves the app fully usable.
3. Render `extra` as plain text only (no HTML or markdown), labelled "AI-written, may be wrong", visually separate from the rule-based verdict, and never styled as the risk level.
4. Fall back silently to the template when the LLM returns nothing, and say whether the model ran in the result details.
5. Layout works at 360 px, keyboard and screen-reader accessible, no layout shift when the explanation arrives.

## Not in scope

`src/pipeline/` (TASK-210), `src/ai/` (TASK-211), `src/types.ts`. Propose contract changes to the coordinator.

## Acceptance evidence

`npm run check:task -- --task TASK-209 --allocation 1` and `npm run validate -- --task TASK-209 --allocation 1` (`npm run task:start -- --role frontend` prepares the worktree).
UI tests for the toggle states with the LLM mocked; screenshots at 360 px; say plainly that the real model was or was not run.
