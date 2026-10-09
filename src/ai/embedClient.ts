// OWNER: model. Main-thread client for the embedding worker, with load status for the UI.
// The model is never downloaded implicitly: call loadEmbeddings() from an explicit user action
// (or automatically on desktop). Until it is ready, matchArchetypes() returns no matches.
import type { EmbedKind, ModelSource } from './embedder';
import type { WorkerRequest, WorkerResponse } from './embed.worker';
import { createProgressTracker } from './progress';

type RequestBody =
  { type: 'init'; source?: ModelSource } | { type: 'embed'; texts: string[]; kind: EmbedKind };

export type EmbeddingsStatus = {
  state: 'idle' | 'loading' | 'ready' | 'error';
  progress: number; // 0..100, best effort while loading
  message?: string;
};

let status: EmbeddingsStatus = { state: 'idle', progress: 0 };
const listeners = new Set<(status: EmbeddingsStatus) => void>();
const pending = new Map<
  number,
  { resolve: (value: WorkerResponse) => void; reject: (reason: Error) => void }
>();
let worker: Worker | undefined;
let nextId = 1;
let loading: Promise<void> | undefined;
let tracker = createProgressTracker();

function setStatus(next: EmbeddingsStatus) {
  status = next;
  listeners.forEach((listener) => listener(status));
}

export function getEmbeddingsStatus(): EmbeddingsStatus {
  return status;
}

export function subscribeEmbeddings(listener: (status: EmbeddingsStatus) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./embed.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const message = event.data;
    if (message.type === 'progress') {
      if (status.state === 'loading') {
        setStatus({
          ...status,
          progress: tracker(message.progress),
          message: message.progress.file,
        });
      }
      return;
    }
    pending.get(message.id)?.resolve(message);
    pending.delete(message.id);
  };
  worker.onerror = (event) => {
    const error = new Error(event.message || 'Embedding worker crashed.');
    pending.forEach(({ reject }) => reject(error));
    pending.clear();
    worker = undefined;
    loading = undefined;
    setStatus({ state: 'error', progress: 0, message: error.message });
  };
  return worker;
}

function request(body: RequestBody, timeoutMs?: number): Promise<WorkerResponse> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer =
      timeoutMs === undefined
        ? undefined
        : setTimeout(() => {
            pending.delete(id);
            reject(new Error('Embedding request timed out.'));
          }, timeoutMs);
    pending.set(id, {
      resolve: (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      reject: (reason) => {
        clearTimeout(timer);
        reject(reason);
      },
    });
    getWorker().postMessage({ ...body, id } as WorkerRequest);
  });
}

// The WASM runtime is self-hosted under <app base>/ort/ so no check or load reaches a public CDN.
const envSource: ModelSource = {
  modelBaseUrl: import.meta.env.VITE_MODEL_BASE_URL || undefined,
  // The model is hosted next to the app (public/models/); if that is missing the worker uses Hugging Face.
  hostedBase:
    typeof document === 'undefined' ? undefined : new URL('models/', document.baseURI).href,
  wasmBaseUrl:
    import.meta.env.VITE_WASM_BASE_URL ||
    (typeof document === 'undefined' ? undefined : new URL('ort/', document.baseURI).href),
};

/**
 * Idempotent. Downloads (first time) and loads the model; resolves when ready. Pass a source to
 * self-host the model or the WASM runtime; defaults come from VITE_MODEL_BASE_URL / VITE_WASM_BASE_URL.
 */
export function loadEmbeddings(override: ModelSource = {}): Promise<void> {
  const source = { ...envSource, ...override };
  if (status.state === 'ready') return Promise.resolve();
  loading ??= (async () => {
    tracker = createProgressTracker();
    setStatus({ state: 'loading', progress: 0 });
    try {
      const response = await request({ type: 'init', source });
      if (response.type === 'error') throw new Error(response.message);
      setStatus({ state: 'ready', progress: 100 });
    } catch (error) {
      loading = undefined;
      setStatus({
        state: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  })();
  return loading;
}

/** Embed texts once ready. Rejects on timeout so callers can fall back to rules-only. */
export async function embedTexts(
  texts: string[],
  kind: EmbedKind,
  timeoutMs = 15000,
): Promise<Float32Array[]> {
  if (status.state !== 'ready') throw new Error('Embedding model is not ready.');
  const response = await request({ type: 'embed', texts, kind }, timeoutMs);
  if (response.type === 'error') throw new Error(response.message);
  if (response.type !== 'result') throw new Error('Unexpected embedding response.');
  return response.vectors;
}
