import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Hashes published by Hugging Face for Xenova/multilingual-e5-small revision 761b726d (LFS sha256).
const PUBLISHED = {
  onnx: 'f80102d3f2a1229f387d3c81909990d8945513e347b0eab049f7de3c6f98c193',
  tokenizer: '0b44a9d7b51c3c62626640cda0e2c2f70fdacdc25bbbd68038369d14ebdf4c39',
};
const root = new URL('../../public/models/', import.meta.url);
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8')) as {
  model: string;
  files: Record<
    string,
    { size: number; sha256: string; parts?: { name: string; size: number; sha256: string }[] }
  >;
};
const read = (name: string) => readFileSync(new URL(`${manifest.model}/${name}`, root));

describe('hosted model files', () => {
  it('pins the manifest to the published hashes', () => {
    expect(manifest.files['onnx/model_quantized.onnx'].sha256).toBe(PUBLISHED.onnx);
    expect(manifest.files['tokenizer.json'].sha256).toBe(PUBLISHED.tokenizer);
  });

  it('every file on disk matches the manifest, so a corrupt copy cannot be committed', () => {
    for (const [name, file] of Object.entries(manifest.files)) {
      if (file.parts) {
        for (const part of file.parts) {
          const bytes = read(part.name);
          expect(bytes.length, part.name).toBe(part.size);
          expect(sha(bytes), part.name).toBe(part.sha256);
        }
      } else {
        const bytes = read(name);
        expect(bytes.length, name).toBe(file.size);
        expect(sha(bytes), name).toBe(file.sha256);
      }
    }
  });

  it('reassembling the parts gives the published ONNX file', () => {
    const parts = manifest.files['onnx/model_quantized.onnx'].parts!;
    const whole = Buffer.concat(parts.map((part) => read(part.name)));
    expect(sha(whole)).toBe(PUBLISHED.onnx);
  });

  it('keeps every hosted file under the 100 MB static-file limit', () => {
    for (const file of Object.values(manifest.files))
      for (const part of file.parts ?? [file]) expect(part.size).toBeLessThan(100 * 1024 * 1024);
  });
});
