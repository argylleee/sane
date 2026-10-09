// OWNER: model. Runs Transformers.js off the main thread so the UI never freezes.
import {
  createEmbedder,
  type Embed,
  type EmbedKind,
  type LoadProgress,
  type ModelSource,
} from './embedder';

export type WorkerRequest =
  | { id: number; type: 'init'; source?: ModelSource }
  | { id: number; type: 'embed'; texts: string[]; kind: EmbedKind };

export type WorkerResponse =
  | { id: number; type: 'progress'; progress: LoadProgress }
  | { id: number; type: 'ready' }
  | { id: number; type: 'result'; vectors: Float32Array[] }
  | { id: number; type: 'error'; message: string };

const ctx = self as unknown as {
  postMessage: (message: WorkerResponse) => void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
};

let embedder: Promise<Embed> | undefined;

ctx.onmessage = async (event) => {
  const request = event.data;
  try {
    if (request.type === 'init') {
      embedder ??= createEmbedder(
        (progress) => ctx.postMessage({ id: request.id, type: 'progress', progress }),
        'wasm',
        request.source,
      ).catch((error) => {
        embedder = undefined; // do not keep a failed load, so a retry starts again
        throw error;
      });
      await embedder;
      ctx.postMessage({ id: request.id, type: 'ready' });
    } else {
      if (!embedder) throw new Error('Embedding model is not loaded.');
      const vectors = await (await embedder)(request.texts, request.kind);
      ctx.postMessage({ id: request.id, type: 'result', vectors });
    }
  } catch (error) {
    ctx.postMessage({
      id: request.id,
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
