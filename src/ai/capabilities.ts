// OWNER: model. Runtime device-tier detection (see .agents/skills/tech-stack).
export type Tier = 'A' | 'B' | 'C';

export type Capabilities = {
  webgpu: boolean;
  deviceMemoryGb: number | null; // null = unknown, treat as the smaller option
  tier: Tier;
  /** null until the GPU adapter has been inspected (see refineCapabilities). */
  shaderF16: boolean | null;
};

type AdapterLike = { features?: { has(name: string): boolean }; isFallbackAdapter?: boolean };
type GpuLike = { requestAdapter(): Promise<AdapterLike | null> };

type Refined = { usable: boolean; shaderF16: boolean };
let refined: Refined | undefined;
let refining: Promise<Refined> | undefined;

function navigatorGpu(): GpuLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { gpu?: GpuLike }).gpu;
}

/**
 * Looks at the real GPU adapter once. `navigator.gpu` existing is not enough: some phones expose it
 * through a compatibility backend with no usable adapter or no 16-bit shader support, and then the
 * default q4f16 model cannot start. Never throws; any failure means "not usable".
 */
export function refineCapabilities(): Promise<Capabilities> {
  const gpu = navigatorGpu();
  if (!gpu) return Promise.resolve(detectCapabilities());
  refining ??= (async (): Promise<Refined> => {
    try {
      const adapter = await gpu.requestAdapter();
      if (!adapter || adapter.isFallbackAdapter) return { usable: false, shaderF16: false };
      return { usable: true, shaderF16: adapter.features?.has('shader-f16') === true };
    } catch {
      return { usable: false, shaderF16: false };
    }
  })().then((result) => (refined = result));
  return refining.then(() => detectCapabilities());
}

export function detectCapabilities(): Capabilities {
  const nav =
    typeof navigator === 'undefined'
      ? undefined
      : (navigator as Navigator & { deviceMemory?: number });
  const webgpu = !!nav && 'gpu' in nav;
  if (webgpu && !refining) void refineCapabilities(); // fire and forget; later calls see the result
  const deviceMemoryGb = nav?.deviceMemory ?? null;
  const baseTier: Tier = !webgpu ? 'C' : deviceMemoryGb !== null && deviceMemoryGb >= 8 ? 'A' : 'B';
  const tier: Tier = refined && !refined.usable ? 'C' : baseTier;
  return { webgpu, deviceMemoryGb, tier, shaderF16: refined ? refined.shaderF16 : null };
}
