// OWNER: model. Optional WebLLM explanation layer, lazy-loaded and fully skippable.
// Verdicts never depend on it: any failure returns null and the template explanation is used.
import { refineCapabilities, type Tier } from './capabilities';
import { buildMessages, validateLlmOutput, type LlmFacts } from './llmPrompt';

// Ids verified against WebLLM's prebuilt model list (@mlc-ai/web-llm 0.2.85).
export const LLM_MODEL_BY_TIER: Record<Tier, string | null> = {
  A: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  B: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
  C: null, // no WebGPU: hide the toggle
};

const LLM_TIMEOUT_MS = 15000;

type Engine = {
  chat: {
    completions: {
      create: (request: {
        messages: { role: 'system' | 'user'; content: string }[];
        temperature: number;
        max_tokens: number;
      }) => Promise<{ choices: { message: { content: string | null } }[] }>;
    };
  };
};

export type LlmStatus = { state: 'idle' | 'loading' | 'ready' | 'error'; progress: number };

let status: LlmStatus = { state: 'idle', progress: 0 };
const listeners = new Set<(status: LlmStatus) => void>();
let enginePromise: Promise<Engine> | undefined;

function setStatus(next: LlmStatus) {
  status = next;
  listeners.forEach((listener) => listener(status));
}

export function getLlmStatus(): LlmStatus {
  return status;
}

export function subscribeLlm(listener: (status: LlmStatus) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Same models without 16-bit shader math, for GPUs that lack `shader-f16` (many phones). */
export const LLM_MODEL_F32_BY_TIER: Record<Tier, string | null> = {
  A: 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC',
  B: 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC',
  C: null,
};

/** Picks the model id for a tier, or null when this device cannot run one. */
export function pickLlmModel(tier: Tier, shaderF16: boolean | null): string | null {
  return (shaderF16 === true ? LLM_MODEL_BY_TIER : LLM_MODEL_F32_BY_TIER)[tier];
}

/** Explicit, user-initiated download and load. Throws if the device cannot run a model. */
export function loadLlm(requestedTier: Tier): Promise<void> {
  if (!LLM_MODEL_BY_TIER[requestedTier])
    return Promise.reject(new Error('This device cannot run the language model.'));
  enginePromise ??= (async () => {
    setStatus({ state: 'loading', progress: 0 });
    try {
      // Inspect the real GPU adapter: a phone can expose WebGPU yet have no usable adapter or no f16.
      const capabilities = await refineCapabilities();
      const modelId = pickLlmModel(
        capabilities.tier === 'C' ? 'C' : requestedTier,
        capabilities.shaderF16,
      );
      if (!modelId) throw new Error('This device cannot run the language model.');
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      const engine = (await CreateMLCEngine(modelId, {
        initProgressCallback: (report) =>
          setStatus({ state: 'loading', progress: Math.round(report.progress * 100) }),
      })) as unknown as Engine;
      setStatus({ state: 'ready', progress: 100 });
      return engine;
    } catch (error) {
      enginePromise = undefined;
      setStatus({ state: 'error', progress: 0 });
      throw error;
    }
  })();
  return enginePromise.then(() => undefined);
}

/** One to three sentences of context, or null (not loaded, too slow, empty, or unsafe output). */
export async function explainWithLlm(facts: LlmFacts): Promise<string | null> {
  if (status.state !== 'ready' || !enginePromise) return null;
  try {
    const engine = await enginePromise;
    const reply = await Promise.race([
      engine.chat.completions.create({
        messages: buildMessages(facts),
        temperature: 0.2,
        max_tokens: 160,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('LLM timed out.')), LLM_TIMEOUT_MS),
      ),
    ]);
    return validateLlmOutput(reply.choices[0]?.message.content, {
      level: facts.level,
      lang: facts.lang,
    });
  } catch {
    return null;
  }
}
