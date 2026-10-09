# TASK-210: call the LLM from `analyze()` (backend)

Role: backend. Branch `codex/feat/task-210-llm-pipeline-hook`, allocation 1. Depends on TASK-205 (integrated).
Read `.agents/skills/architecture/SKILL.md`, `.agents/skills/security-privacy/SKILL.md`, `src/ai/llm.ts` and `llmPrompt.ts` (read-only).

## Interface (version llm-explain-v1)

`explainWithLlm(facts: LlmFacts): Promise<string | null>` from `src/ai/index.ts` returns guarded text or `null`.
`LlmFacts = { level, lang, archetypeName?, signals: string[], text }`. `AnalyzeOptions.useLLM` already exists.

## Outcome

1. When `opts.useLLM` is true, call `explainWithLlm` after the verdict is computed, using the localized signal labels and the archetype's name for `opts.lang` (see `archetypes` in `src/ai/index.ts`).
2. Put a non-null result in `verdict.explanation.extra` and set `usedModels.llm = true`; otherwise leave `extra` unset and `llm: false`.
3. The LLM can never change `level`, `score`, `signals`, `matches` or the template headline/steps. Add a test that proves this for hostile model output.
4. Any failure, timeout, not-loaded model, or null falls back to the template with no error shown. `useLLM: false` must not touch the LLM module or trigger a download.
5. Send the normalized text only, never the raw OCR or the original input, and never log message content.
6. Tests with `../ai` mocked: success, null, throw, slow model, injection-looking output, `useLLM: false` makes zero calls.

## Not in scope

`src/ai/` (TASK-211), `src/ui/` (TASK-209), `src/rules/`, `src/score/`, `src/types.ts`.

## Acceptance evidence

`npm run check:task -- --task TASK-210 --allocation 1` and `npm run validate -- --task TASK-210 --allocation 1` (`npm run task:start -- --role backend` prepares the worktree).
