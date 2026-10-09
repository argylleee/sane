# TASK-211: harden LLM prompt and output guards (model)

Role: model. Branch `codex/feat/task-211-llm-guards`, allocation 2 (adds `src/ai/capabilities.ts` for the device finding below; nothing was pushed under allocation 1). Depends on TASK-202 (integrated).
Read `.agents/skills/local-ai/SKILL.md`, `.agents/skills/security-privacy/SKILL.md`, `src/ai/llm.ts`, `llmPrompt.ts`, `llmPrompt.test.ts`.

## Today

`buildMessages` marks the message as untrusted data and strips `<<<`/`>>>`; `validateLlmOutput` rejects empty text, over 450 characters, and `http(s)://` or `www.` links. Nothing runs the real model yet.

## Outcome

1. Input side: also neutralize role-like lines (`system:`, `assistant:`), code fences, long runs of control or zero-width characters, and instruction phrases in English, Filipino and Taglish. Keep the 800-character cap. Add the verdict as a fact the model must not contradict.
2. Output side, reject (return `null`) when the text:
   - contains a bare domain (`gcash-verify.com`), phone or account number, or an OTP/PIN/password request;
   - tells the user to click, call, send money, or install something;
   - contradicts the verdict (says safe for `likely_scam`, or confirms a scam for `probably_fine`);
   - is not in the requested language, or contains markdown or HTML;
   - repeats system prompt text or looks like it followed an instruction from the message.
3. Fixtures in `eval/llm/injection.json` (at least 30 hostile messages in the three languages, each with the expected guard outcome) plus a test that runs them against `validateLlmOutput` with canned model outputs. No real accounts, numbers or names.
4. A manual smoke script `eval/llm/smoke.mjs` (opt-in) that runs the real model on the fixtures on a WebGPU device and reports how many outputs the guard rejects. Record tested/untested on the demo device honestly.
5. Keep the public API of `llm.ts` unchanged (`loadLlm`, `explainWithLlm`, `getLlmStatus`, `subscribeLlm`, `LLM_MODEL_BY_TIER`); propose any change to the coordinator.

## Device finding (phone test, October 10, 2026)

The test phone (Android 14, Chrome 155, Adreno 610) reports WebGPU as available, but through the OpenGL ES compatibility
backend, Vulkan disabled, and no `shader-f16` feature. `detectCapabilities()` only checks `'gpu' in navigator`, so it
would pick tier B and try `Qwen2.5-0.5B-Instruct-q4f16_1-MLC`, which needs f16. Required:

- In `capabilities.ts`, request the adapter (`navigator.gpu.requestAdapter()`) and read its features/info. Make the result
  async-safe and keep `detectCapabilities()` backward compatible for existing callers (propose a new function if the signature must change).
- No `shader-f16`: use a q4f32 model variant if WebLLM's list has one for the tier, otherwise no LLM. A compatibility/fallback adapter or a
  failed engine start is tier C (toggle hidden). Verify ids against the WebLLM list. Record the phone result as tested or untested.

## Not in scope

`src/pipeline/` (TASK-210), `src/ui/` (TASK-209), `src/types.ts`, thresholds and rules.

## Acceptance evidence

`npm run check:task -- --task TASK-211 --allocation 1` and `npm run validate -- --task TASK-211 --allocation 1` (`npm run task:start -- --role model` prepares the worktree).
State clearly that regex guards reduce but do not eliminate prompt-injection risk, and that the verdict never depends on the model.
