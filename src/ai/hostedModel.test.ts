import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHostedCache, evictHosted, loadManifest, type Manifest } from './hostedModel';

const BASE = 'https://app.test/models/';
const ROOT = `${BASE}org/model/`;
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const bytesOf = (seed: number, length: number) =>
  Uint8Array.from({ length }, (_, i) => (seed + i) % 251);

const parts = [bytesOf(1, 40), bytesOf(50, 40), bytesOf(99, 17)];
const whole = Uint8Array.from(parts.flatMap((part) => [...part]));
const manifest: Manifest = {
  version: 1,
  model: 'org/model',
  files: {
    'config.json': { size: 2 },
    'onnx/model.onnx': {
      size: whole.length,
      parts: parts.map((part, i) => ({
        name: `onnx/model.onnx.part${i}`,
        size: part.length,
        sha256: sha(part),
      })),
    },
  },
};

/** Minimal in-memory Cache Storage. */
function memoryCaches() {
  const stores = new Map<string, Map<string, Uint8Array>>();
  return {
    stores,
    api: {
      async open(name: string) {
        const entries = stores.get(name) ?? new Map<string, Uint8Array>();
        stores.set(name, entries);
        return {
          async match(request: string | Request) {
            const key = typeof request === 'string' ? request : request.url;
            const found = entries.get(key);
            return found ? new Response(found.slice()) : undefined;
          },
          async put(request: string | Request, response: Response) {
            const key = typeof request === 'string' ? request : request.url;
            entries.set(key, new Uint8Array(await response.arrayBuffer()));
          },
          async delete(request: string | Request) {
            return entries.delete(typeof request === 'string' ? request : request.url);
          },
        };
      },
    },
  };
}

function server(overrides: Record<string, () => Response> = {}) {
  const calls: string[] = [];
  const fetchFn = async (url: string) => {
    calls.push(url);
    if (overrides[url]) return overrides[url]();
    const index = parts.findIndex((_, i) => url === `${ROOT}onnx/model.onnx.part${i}`);
    if (index >= 0) return new Response(parts[index].slice());
    if (url === `${BASE}manifest.json`) return new Response(JSON.stringify(manifest));
    return new Response('missing', { status: 404 });
  };
  return { calls, fetchFn };
}

async function readAll(response: Response): Promise<Uint8Array> {
  return new Uint8Array(await response.arrayBuffer());
}

afterEach(() => vi.unstubAllGlobals());

describe('loadManifest', () => {
  it('reads a valid manifest, and returns undefined for a missing or malformed one', async () => {
    vi.stubGlobal('caches', undefined);
    expect(await loadManifest(BASE, server().fetchFn)).toEqual(manifest);
    expect(
      await loadManifest(BASE, async () => new Response('x', { status: 404 })),
    ).toBeUndefined();
    expect(await loadManifest(BASE, async () => new Response('{"version":2}'))).toBeUndefined();
    const wrongTotal = {
      ...manifest,
      files: { f: { size: 99, parts: [{ name: 'a', size: 1, sha256: 'x' }] } },
    };
    expect(
      await loadManifest(BASE, async () => new Response(JSON.stringify(wrongTotal))),
    ).toBeUndefined();
  });

  it('falls back to the stored copy when offline', async () => {
    const memory = memoryCaches();
    vi.stubGlobal('caches', memory.api);
    expect(await loadManifest(BASE, server().fetchFn)).toEqual(manifest);
    await new Promise((resolve) => setTimeout(resolve, 0)); // the copy is stored in the background
    const offline = async () => {
      throw new TypeError('Failed to fetch');
    };
    expect(await loadManifest(BASE, offline)).toEqual(manifest);
  });
});

describe('hosted model cache', () => {
  it('assembles the parts in order with the right Content-Length', async () => {
    vi.stubGlobal('caches', undefined);
    const { fetchFn } = server();
    const cache = createHostedCache({ base: BASE, manifest, fetchFn });
    const response = await cache.match(`${ROOT}onnx/model.onnx`);
    expect(response?.headers.get('Content-Length')).toBe(String(whole.length));
    expect(await readAll(response!)).toEqual(whole);
  });

  it('ignores the relative local path, unknown files and small files', async () => {
    vi.stubGlobal('caches', undefined);
    const cache = createHostedCache({ base: BASE, manifest, fetchFn: server().fetchFn });
    expect(await cache.match('org/model/onnx/model.onnx')).toBeUndefined();
    expect(await cache.match(`${ROOT}config.json`)).toBeUndefined();
    expect(await cache.match('https://elsewhere.test/x.bin')).toBeUndefined();
  });

  it('errors the stream when a part fails its checksum', async () => {
    vi.stubGlobal('caches', undefined);
    const tampered = parts[1].slice();
    tampered[0] ^= 0xff;
    const { fetchFn } = server({ [`${ROOT}onnx/model.onnx.part1`]: () => new Response(tampered) });
    const response = await createHostedCache({ base: BASE, manifest, fetchFn }).match(
      `${ROOT}onnx/model.onnx`,
    );
    await expect(readAll(response!)).rejects.toThrow(/checksum/);
  });

  it('errors the stream when a part has the wrong size or is missing', async () => {
    vi.stubGlobal('caches', undefined);
    const short = server({
      [`${ROOT}onnx/model.onnx.part2`]: () => new Response(new Uint8Array(3)),
    });
    const a = await createHostedCache({ base: BASE, manifest, fetchFn: short.fetchFn }).match(
      `${ROOT}onnx/model.onnx`,
    );
    await expect(readAll(a!)).rejects.toThrow(/bytes/);
    const gone = server({
      [`${ROOT}onnx/model.onnx.part0`]: () => new Response('no', { status: 404 }),
    });
    const b = await createHostedCache({ base: BASE, manifest, fetchFn: gone.fetchFn }).match(
      `${ROOT}onnx/model.onnx`,
    );
    await expect(readAll(b!)).rejects.toThrow(/404/);
  });

  it('retries a part once after a transient failure', async () => {
    vi.stubGlobal('caches', undefined);
    let failed = false;
    const base = server();
    const fetchFn = async (url: string) => {
      if (url.endsWith('part1') && !failed) {
        failed = true;
        throw new TypeError('network blip');
      }
      return base.fetchFn(url);
    };
    const response = await createHostedCache({ base: BASE, manifest, fetchFn }).match(
      `${ROOT}onnx/model.onnx`,
    );
    expect(await readAll(response!)).toEqual(whole);
  });

  it('stores verified parts and reuses them with no network, including after an interruption', async () => {
    const memory = memoryCaches();
    vi.stubGlobal('caches', memory.api);
    const first = server();
    const cache = createHostedCache({ base: BASE, manifest, fetchFn: first.fetchFn });
    expect(await readAll((await cache.match(`${ROOT}onnx/model.onnx`))!)).toEqual(whole);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const offline = vi.fn(async () => {
      throw new TypeError('offline');
    });
    const again = createHostedCache({ base: BASE, manifest, fetchFn: offline });
    expect(await readAll((await again.match(`${ROOT}onnx/model.onnx`))!)).toEqual(whole);
    expect(offline).not.toHaveBeenCalled();

    // Only the first part survived an interrupted download: just the others are fetched.
    const store = memory.stores.get('transformers-cache')!;
    store.delete(`${ROOT}onnx/model.onnx.part1`);
    store.delete(`${ROOT}onnx/model.onnx.part2`);
    const resumed = server();
    const resume = createHostedCache({ base: BASE, manifest, fetchFn: resumed.fetchFn });
    expect(await readAll((await resume.match(`${ROOT}onnx/model.onnx`))!)).toEqual(whole);
    expect(resumed.calls).toEqual([`${ROOT}onnx/model.onnx.part1`, `${ROOT}onnx/model.onnx.part2`]);
  });

  it('replaces a damaged stored part', async () => {
    const memory = memoryCaches();
    vi.stubGlobal('caches', memory.api);
    const store = await memory.api.open('transformers-cache');
    await store.put(`${ROOT}onnx/model.onnx.part0`, new Response(new Uint8Array(parts[0].length)));
    const { fetchFn, calls } = server();
    const cache = createHostedCache({ base: BASE, manifest, fetchFn });
    expect(await readAll((await cache.match(`${ROOT}onnx/model.onnx`))!)).toEqual(whole);
    expect(calls).toContain(`${ROOT}onnx/model.onnx.part0`);
  });

  it('serves a small file stored earlier through put()', async () => {
    const memory = memoryCaches();
    vi.stubGlobal('caches', memory.api);
    const cache = createHostedCache({ base: BASE, manifest, fetchFn: server().fetchFn });
    await cache.put(`${ROOT}config.json`, new Response('{}'));
    expect(await (await cache.match(`${ROOT}config.json`))!.text()).toBe('{}');
  });
});

describe('small file integrity and healing', () => {
  const small = new TextEncoder().encode('{"ok":true}');
  const withSmall: Manifest = {
    ...manifest,
    files: { ...manifest.files, 'tokenizer.json': { size: small.length, sha256: sha(small) } },
  };

  it('does not store a damaged download and replaces a damaged stored copy', async () => {
    const memory = memoryCaches();
    vi.stubGlobal('caches', memory.api);
    const cache = createHostedCache({ base: BASE, manifest: withSmall, fetchFn: server().fetchFn });
    await cache.put(`${ROOT}tokenizer.json`, new Response('{"ok":false}'));
    expect(await cache.match(`${ROOT}tokenizer.json`)).toBeUndefined(); // refused, so it is fetched again

    await cache.put(`${ROOT}tokenizer.json`, new Response(small.slice()));
    expect(await (await cache.match(`${ROOT}tokenizer.json`))!.text()).toBe('{"ok":true}');

    const store = memory.stores.get('transformers-cache')!;
    store.set(`${ROOT}tokenizer.json`, new TextEncoder().encode('{"ok":fals}')); // silent corruption
    expect(await cache.match(`${ROOT}tokenizer.json`)).toBeUndefined();
    expect(store.has(`${ROOT}tokenizer.json`)).toBe(false);
  });

  it('evictHosted removes every hosted file and part', async () => {
    const memory = memoryCaches();
    vi.stubGlobal('caches', memory.api);
    const cache = createHostedCache({ base: BASE, manifest: withSmall, fetchFn: server().fetchFn });
    await readAll((await cache.match(`${ROOT}onnx/model.onnx`))!);
    await cache.put(`${ROOT}tokenizer.json`, new Response(small.slice()));
    await new Promise((resolve) => setTimeout(resolve, 0));
    const store = memory.stores.get('transformers-cache')!;
    expect(store.size).toBeGreaterThan(0);
    await evictHosted(BASE, withSmall);
    expect([...store.keys()].filter((key) => key.startsWith(ROOT))).toEqual([]);
  });
});
