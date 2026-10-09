// OWNER: model. Runtime device-tier detection (see .agents/skills/tech-stack).
export type Tier = 'A' | 'B' | 'C';

export type Capabilities = {
  webgpu: boolean;
  deviceMemoryGb: number | null; // null = unknown, treat as the smaller option
  tier: Tier;
};

export function detectCapabilities(): Capabilities {
  const nav =
    typeof navigator === 'undefined'
      ? undefined
      : (navigator as Navigator & { deviceMemory?: number });
  const webgpu = !!nav && 'gpu' in nav;
  const deviceMemoryGb = nav?.deviceMemory ?? null;
  const tier: Tier = !webgpu ? 'C' : deviceMemoryGb !== null && deviceMemoryGb >= 8 ? 'A' : 'B';
  return { webgpu, deviceMemoryGb, tier };
}
