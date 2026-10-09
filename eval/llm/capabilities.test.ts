import { afterEach, describe, expect, it, vi } from 'vitest';

// The phone test showed a device that exposes navigator.gpu but through a compatibility backend with
// no 16-bit shader support. These cases mock the adapter; no real GPU is involved.
type Adapter = { features: Set<string>; isFallbackAdapter?: boolean } | null;

async function withAdapter(adapter: Adapter | 'throws' | 'absent', deviceMemory = 4) {
  vi.resetModules();
  const gpu =
    adapter === 'absent'
      ? undefined
      : {
          requestAdapter: async () => {
            if (adapter === 'throws') throw new Error('no adapter');
            return adapter;
          },
        };
  vi.stubGlobal('navigator', { ...(gpu ? { gpu } : {}), deviceMemory });
  const capabilities = await import('../../src/ai/capabilities');
  const llm = await import('../../src/ai/llm');
  return { capabilities, llm };
}

afterEach(() => vi.unstubAllGlobals());

describe('device capabilities and LLM model choice', () => {
  it('uses the f16 model when the adapter supports shader-f16', async () => {
    const { capabilities, llm } = await withAdapter({ features: new Set(['shader-f16']) });
    const result = await capabilities.refineCapabilities();
    expect(result.tier).toBe('B');
    expect(result.shaderF16).toBe(true);
    expect(llm.pickLlmModel(result.tier, result.shaderF16)).toBe(
      'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    );
  });

  it('falls back to the f32 model when shader-f16 is missing', async () => {
    const { capabilities, llm } = await withAdapter({ features: new Set() }, 8);
    const result = await capabilities.refineCapabilities();
    expect(result.tier).toBe('A');
    expect(result.shaderF16).toBe(false);
    expect(llm.pickLlmModel(result.tier, result.shaderF16)).toBe(
      'Qwen2.5-0.5B-Instruct-q4f32_1-MLC',
    );
  });

  it.each([
    ['null adapter', null],
    ['fallback adapter', { features: new Set(), isFallbackAdapter: true }],
    ['request error', 'throws' as const],
  ])('treats a %s as tier C and hides the model toggle', async (_name, adapter) => {
    const { capabilities, llm } = await withAdapter(adapter as Adapter | 'throws');
    const result = await capabilities.refineCapabilities();
    expect(result.tier).toBe('C');
    expect(capabilities.detectCapabilities().tier).toBe('C');
    expect(llm.pickLlmModel(result.tier, result.shaderF16)).toBeNull();
    await expect(llm.loadLlm('B')).rejects.toThrow(/cannot run/);
  });

  it('is tier C without WebGPU', async () => {
    const { capabilities } = await withAdapter('absent');
    expect(capabilities.detectCapabilities().tier).toBe('C');
  });
});
