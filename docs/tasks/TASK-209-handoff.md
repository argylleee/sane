# TASK-209 handoff

## Receipt

- Task/allocation: TASK-209 / 1, frontend
- Branch: `codex/feat/task-209-ai-explanation-ui`
- Base: `77f92550ed6d82eb8c948b788317197ee60ccc57`
- Worktree: `.worktrees/task-209`
- Registry: `.git/worktrees/task-209/coordination.snapshot.json`
- Interface: `llm-explain-v1`; no shared contract changes

## Implemented

- Added an opt-in AI explanation control, off by default. Tier C shows an explanation that WebGPU is required and has no toggle.
- A separate tap confirms the model download after showing an approximate size and Wi-Fi advice. Tier A uses the 1.5B model (about 880 MB); tier B uses the 0.5B model (about 290 MB), plus supporting files. Sizes follow the current [1.5B model repository](https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC/tree/main) and [0.5B model repository](https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC/tree/main).
- Shows model progress, ready state, and recoverable load errors. Failed loading leaves the normal check available.
- Passes `useLLM` only when the user enabled the option and `getLlmStatus()` is ready.
- Renders any `explanation.extra` as a React text node with an “AI-written, may be wrong” disclaimer; it is visually separate from the risk result. Result details report whether the LLM ran.

## Validation and limits

- `npm run check:task -- --task TASK-209 --allocation 1 --registry ../../.git/worktrees/task-209/coordination.snapshot.json` passed before merging newer `main`.
- After merging current `origin/main`, `npm run check:repo`, `npm run format:check`, `npm run lint`, `npm run build`, and `git diff --check` passed. App tests, viewport screenshots, and real WebGPU model loading were not run.
- On base `77f9255`, `src/pipeline/analyze.ts` does not yet call `explainWithLlm`; TASK-210 owns that integration. The UI passes the contract flag, but end-to-end generated explanations depend on TASK-210 landing. TASK-211 owns prompt/output guard improvements.
- No model was run during this implementation. The verdict and template explanation remain the fallback.
