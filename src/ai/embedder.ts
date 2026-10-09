// OWNER: model. Environment-neutral embedding loader, shared by the browser worker and Node probes.
// Model: multilingual-e5-small (MIT upstream intfloat/multilingual-e5-small), int8 ONNX build.
import { pipeline } from '@huggingface/transformers';

export const EMBEDDING_MODEL_ID = 'Xenova/multilingual-e5-small';

export type EmbedKind = 'query' | 'passage';

export type LoadProgress = { status: string; file?: string; progress?: number };

export type Embed = (texts: string[], kind: EmbedKind) => Promise<Float32Array[]>;

type Extractor = (
  inputs: string[],
  options: { pooling: 'mean'; normalize: boolean },
) => Promise<{ data: Float32Array; dims: number[] }>;

export async function createEmbedder(
  onProgress?: (progress: LoadProgress) => void,
  device: 'wasm' | 'webgpu' | 'cpu' = 'wasm',
): Promise<Embed> {
  const extractor = (await pipeline('feature-extraction', EMBEDDING_MODEL_ID, {
    dtype: 'q8',
    device,
    progress_callback: onProgress,
  } as never)) as unknown as Extractor;

  return async (texts, kind) => {
    // The e5 model card requires a "query: " or "passage: " prefix on every input.
    const output = await extractor(
      texts.map((text) => `${kind}: ${text}`),
      { pooling: 'mean', normalize: true },
    );
    const dim = output.dims[1];
    return texts.map((_, i) => output.data.slice(i * dim, (i + 1) * dim));
  };
}
