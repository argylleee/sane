// OWNER: model. Environment-neutral embedding loader, shared by the browser worker and Node probes.
// Model: multilingual-e5-small (MIT upstream intfloat/multilingual-e5-small), int8 ONNX build.
import { env, pipeline } from '@huggingface/transformers';

export const EMBEDDING_MODEL_ID = 'Xenova/multilingual-e5-small';

export type EmbedKind = 'query' | 'passage';

export type LoadProgress = { status: string; file?: string; progress?: number };

/** Optional self-hosting. Without it the model loads from Hugging Face and the browser caches it. */
export type ModelSource = {
  /** Base URL that serves `<modelId>/...` files, e.g. `https://example.com/models/`. */
  modelBaseUrl?: string;
  /** Base URL that serves onnxruntime-web `.wasm`/`.mjs` files (default is a public CDN). */
  wasmBaseUrl?: string;
};

export type Embed = (texts: string[], kind: EmbedKind) => Promise<Float32Array[]>;

type Extractor = (
  inputs: string[],
  options: { pooling: 'mean'; normalize: boolean },
) => Promise<{ data: Float32Array; dims: number[] }>;

export async function createEmbedder(
  onProgress?: (progress: LoadProgress) => void,
  device: 'wasm' | 'webgpu' | 'cpu' = 'wasm',
  source: ModelSource = {},
): Promise<Embed> {
  if (source.modelBaseUrl) {
    // Route "remote" fetches to our own host: <base>/<modelId>/<file>. Works for absolute URLs
    // and same-origin paths like /models/. (env.localModelPath only suits same-origin paths.)
    env.allowLocalModels = false;
    env.allowRemoteModels = true;
    env.remoteHost = source.modelBaseUrl.endsWith('/')
      ? source.modelBaseUrl
      : `${source.modelBaseUrl}/`;
    env.remotePathTemplate = '{model}/';
  }
  if (source.wasmBaseUrl) {
    // Same variant choice as the library's CDN default: "asyncify", or the plain build on older
    // Safari. Both files must be served from wasmBaseUrl (see vite.config.ts).
    const base = source.wasmBaseUrl.endsWith('/') ? source.wasmBaseUrl : `${source.wasmBaseUrl}/`;
    const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    const olderSafari =
      /Safari\//.test(ua) && !/(Chrome|Chromium|CriOS|Edg)\//.test(ua) && !('gpu' in navigator);
    const suffix = olderSafari ? '' : '.asyncify';
    (
      env.backends as { onnx: { wasm: { wasmPaths: { mjs: string; wasm: string } } } }
    ).onnx.wasm.wasmPaths = {
      mjs: `${base}ort-wasm-simd-threaded${suffix}.mjs`,
      wasm: `${base}ort-wasm-simd-threaded${suffix}.wasm`,
    };
  }
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
