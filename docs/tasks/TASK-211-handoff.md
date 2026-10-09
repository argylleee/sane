# TASK-211 handoff

- Updated: October 10, 2026, coordinator acting on the model task, branch `codex/feat/task-211-llm-guards`, base `46d7b6b`. Allocation 2 (adds `src/ai/capabilities.ts`).
- Scope: `src/ai/llm.ts`, `src/ai/llmPrompt.ts`, `src/ai/llmPrompt.test.ts`, `src/ai/capabilities.ts`, `eval/llm/`. Public API of `llm.ts` is unchanged except additions (`pickLlmModel`, `LLM_MODEL_F32_BY_TIER`); `Capabilities` gained `shaderF16` and there is a new `refineCapabilities()`.

## Result

1. Device finding (phone: Android 14, Chrome 155, Adreno 610, WebGPU through the OpenGL ES compatibility backend, no `shader-f16`): `detectCapabilities()` now inspects the real adapter in the background.
   No adapter, a fallback adapter or an error is tier C (toggle hidden). Without `shader-f16` the q4f32 model variants are chosen (ids verified in `@mlc-ai/web-llm` 0.2.85). `loadLlm()` re-checks before downloading.
2. Input guards: strips control and zero-width characters, code fences, role lines (`system:`, `assistant:`), chat-template tokens, delimiter look-alikes, and instruction phrases in English, Filipino and Taglish. The prompt states the risk level is fixed and bans links, numbers and codes.
3. Output guards (all return `null` so the template is used): links and bare domains, phone and account numbers, markdown or HTML, prompt leakage, asking for a credential, telling the person to click, call, pay, send money or install,
   contradicting the verdict (safe for a scam level, scam for a fine level), and a clearly wrong language. Negated advice ("do not share your code") and reports of what the message asks are accepted.
4. 36 hostile fixtures in `eval/llm/injection.json` (12 per language) run through `eval/llm/injection.test.ts`, plus mocked-adapter tests in `eval/llm/capabilities.test.ts`.

## Evidence

- Full suite, typecheck and eslint pass on this branch (see the commit message for counts).
- NOT verified: the real model has not run on any device, so output quality and Filipino fluency are unmeasured; the adapter check is mocked and was not run on the Adreno phone; the `eval/llm/smoke.mjs` real-model script was not written
  because the model could not be run here.
- Regex guards reduce prompt-injection and unsafe-output risk but do not eliminate it. The verdict never depends on the model.
- Filipino and Taglish fixtures and guard phrases are AI-authored and not native-speaker reviewed.

## Next action

On a WebGPU phone or laptop, turn on the AI explanation and note which adapter and model id loaded. If the phone never shows the toggle, that is the intended tier C result.
