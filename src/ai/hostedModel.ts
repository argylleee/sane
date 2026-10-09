// OWNER: model. Same-origin hosting of the embedding model. Vercel's Hobby plan rejects static files over
// 100 MB and the int8 ONNX file is 118 MB, so scripts/split-model.mjs publishes it as 10 MiB parts under
// public/models/ with a manifest. This cache plugs into transformers.js (env.customCache): it answers the
// library's request for the whole file by streaming the parts in order, verifying each part's size and
// SHA-256. Each verified part is stored in the browser cache on its own, so an interrupted download
// resumes where it stopped, later loads (including offline) need no network, and the whole file is never
// held twice in memory. Any problem makes the caller fall back to the default Hugging Face download.

export type ManifestFile = {
  size: number;
  sha256?: string;
  parts?: { name: string; size: number; sha256: string }[];
};
export type Manifest = { version: number; model: string; files: Record<string, ManifestFile> };

type FetchLike = (input: string) => Promise<Response>;
type Part = { size: number; sha256: string };

export const MODEL_CACHE_NAME = 'transformers-cache';
const ensureSlash = (url: string) => (url.endsWith('/') ? url : `${url}/`);

function isManifest(value: unknown): value is Manifest {
  const manifest = value as Manifest | null;
  return (
    !!manifest &&
    manifest.version === 1 &&
    typeof manifest.model === 'string' &&
    !!manifest.files &&
    Object.values(manifest.files).every(
      (file) =>
        typeof file.size === 'number' &&
        (file.parts === undefined ||
          (Array.isArray(file.parts) &&
            file.parts.length > 0 &&
            file.parts.reduce((sum, part) => sum + part.size, 0) === file.size)),
    )
  );
}

async function openStore(cacheName: string): Promise<Cache | undefined> {
  try {
    return typeof caches === 'undefined' ? undefined : await caches.open(cacheName);
  } catch {
    return undefined; // e.g. a browser profile whose Cache Storage is unavailable
  }
}

/**
 * Reads `<base>manifest.json`, from the network first and from the browser cache when offline.
 * Undefined when it is missing or malformed, and the caller then uses Hugging Face.
 */
export async function loadManifest(
  base: string,
  fetchFn: FetchLike = (url) => fetch(url),
  cacheName = MODEL_CACHE_NAME,
): Promise<Manifest | undefined> {
  const url = `${ensureSlash(base)}manifest.json`;
  const store = await openStore(cacheName);
  try {
    const response = await fetchFn(url);
    if (response.ok) {
      const copy = response.clone();
      const manifest: unknown = await response.json();
      if (isManifest(manifest)) {
        void store?.put(url, copy).catch(() => undefined);
        return manifest;
      }
    }
  } catch {
    // Offline or blocked: try the stored copy below.
  }
  try {
    const stored = await store?.match(url);
    const manifest: unknown = stored ? await stored.json() : undefined;
    return isManifest(manifest) ? manifest : undefined;
  } catch {
    return undefined;
  }
}

async function sha256Hex(bytes: Uint8Array): Promise<string | undefined> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return undefined; // not a secure context: the size is still checked
  const digest = await subtle.digest('SHA-256', bytes as BufferSource);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function verified(bytes: Uint8Array, part: Part, url: string): Promise<Uint8Array> {
  if (bytes.length !== part.size)
    throw new Error(`Part ${url} is ${bytes.length} bytes, expected ${part.size}.`);
  const hash = await sha256Hex(bytes);
  if (hash !== undefined && hash !== part.sha256)
    throw new Error(`Part ${url} failed its checksum.`);
  return bytes;
}

async function getPart(
  url: string,
  part: Part,
  fetchFn: FetchLike,
  store: Cache | undefined,
): Promise<Uint8Array> {
  const stored = await store?.match(url).catch(() => undefined);
  if (stored) {
    try {
      return await verified(new Uint8Array(await stored.arrayBuffer()), part, url);
    } catch {
      await store?.delete(url).catch(() => undefined); // damaged copy: fetch it again
    }
  }
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchFn(url);
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      const bytes = await verified(new Uint8Array(await response.arrayBuffer()), part, url);
      void store?.put(url, new Response(bytes as unknown as BodyInit)).catch(() => undefined);
      return bytes;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** Streams the parts in order, keeping `concurrency` downloads in flight. */
export function partsStream(
  urls: string[],
  parts: Part[],
  fetchFn: FetchLike,
  store?: Cache,
  concurrency = 4,
): ReadableStream<Uint8Array> {
  const inflight: Promise<Uint8Array>[] = [];
  let next = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (inflight.length < concurrency && next < parts.length) {
        const pending = getPart(urls[next], parts[next], fetchFn, store);
        pending.catch(() => undefined); // surfaced when its turn comes; avoids an unhandled rejection
        inflight.push(pending);
        next += 1;
      }
      const head = inflight.shift();
      if (!head) {
        controller.close();
        return;
      }
      try {
        controller.enqueue(await head);
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

type Options = {
  base: string;
  manifest: Manifest;
  cacheName?: string;
  fetchFn?: FetchLike;
  concurrency?: number;
};

/** Deletes every hosted file and part from the model cache so the next load starts clean. */
export async function evictHosted(
  base: string,
  manifest: Manifest,
  cacheName = MODEL_CACHE_NAME,
): Promise<void> {
  const store = await openStore(cacheName);
  if (!store) return;
  const root = `${ensureSlash(base)}${manifest.model}/`;
  for (const [name, file] of Object.entries(manifest.files)) {
    await store.delete(`${root}${name}`).catch(() => undefined);
    for (const part of file.parts ?? [])
      await store.delete(`${root}${part.name}`).catch(() => undefined);
  }
}

/** True when a small file's bytes match the manifest (or the manifest has no hash for it). */
async function matchesManifest(
  response: Response,
  file: ManifestFile | undefined,
): Promise<boolean> {
  if (!file?.sha256) return true;
  const bytes = new Uint8Array(await response.clone().arrayBuffer());
  if (bytes.length !== file.size) return false;
  const hash = await sha256Hex(bytes);
  return hash === undefined || hash === file.sha256;
}

/** Implements the `match` and `put` functions of the Web Cache API for `env.customCache`. */
export function createHostedCache({
  base,
  manifest,
  cacheName = MODEL_CACHE_NAME,
  fetchFn = (url) => fetch(url),
  concurrency = 4,
}: Options) {
  const root = `${ensureSlash(base)}${manifest.model}/`;

  return {
    async match(request: string | Request): Promise<Response | undefined> {
      const key = typeof request === 'string' ? request : request.url;
      if (!/^https?:\/\//iu.test(key)) return undefined; // the library also tries a relative local path
      const store = await openStore(cacheName);
      const file = key.startsWith(root) ? manifest.files[key.slice(root.length)] : undefined;
      const hit = await store?.match(key).catch(() => undefined);
      if (hit) {
        // A small file stored earlier by put(): serve it only if it is still intact.
        if (await matchesManifest(hit, file)) return hit;
        await store?.delete(key).catch(() => undefined);
      }
      if (!key.startsWith(root)) return undefined;
      if (!file?.parts) return undefined; // small files are fetched normally and stored by put()
      return new Response(
        partsStream(
          file.parts.map((part) => `${root}${part.name}`),
          file.parts,
          fetchFn,
          store,
          concurrency,
        ),
        {
          status: 200,
          headers: {
            'Content-Length': String(file.size),
            'Content-Type': 'application/octet-stream',
          },
        },
      );
    },
    async put(request: string | Request, response: Response): Promise<void> {
      const store = await openStore(cacheName);
      if (!store) return;
      const key = typeof request === 'string' ? request : request.url;
      const file = key.startsWith(root) ? manifest.files[key.slice(root.length)] : undefined;
      if (!(await matchesManifest(response, file))) return; // never store a damaged download
      await store.put(request, response).catch(() => undefined);
    },
  };
}
